---
layout: post
title: 通过 Git Server Hooks 实现网站的多仓库同步与镜像部署
category: web
tags:
    - nas
    - jekyll
    - blog
    - githooks
---

本网站通过 github-pages & jekyll 构建与托管，系列文章可以参看：[blog](/blog/tags/blog/)。<br />因为国内访问 github.io 速度较慢，所以萌生了为网站提速和建设国内外双镜像部署的念头，以下简单记录双镜像建设的思路和操作过程。
### 工作流程
 可以实现一处编写多地部署的方式有很多，比如：

1. 最原始的：代码提交 github 后再手动到国内服务器更新构建
2. 国内服务器定时任务更新和构建
3. webhooks 监听
4. 服务器架设 git server，本地提交同步提交多个 remote，基于 server hooks 触发构建

由于我还有个 NAS 服务器并已经开通了公网服务，加上公共云服务器，可以做到三地同步部署，这里的想法是以 NAS 做主要的远程代码仓库，以 github 和云服务器做自动部署并提供镜像版网站服务。<br />![](/assets/img/githooks_flow.jpeg)<br />如流程示意图所示，源码只 push 到 NAS Git Server，经由 git hook 自动同步至 Github 和云服务器，此举可避免本地仓库管理多个 remote 地址，也可以通过 NAS 的“代理”服务和 Github 保持比较高质量的连接。
### NAS 部署 Git Server
群晖系统中可以安装 Git Server 应用。大体上按照[官方指引](https://kb.synology.cn/zh-cn/DSM/help/Git/git)操作即可，有几个小点需要特别注意。
#### 设置独立的 git 账号
由于 git 服务需要 nas 开通 ssh，因此可以为 git 的管理操作创建单独的账号，与系统管理员账号分开进而保证权限独立、保障系统安全性，git 账户名在网络上公开也不用担心。<br />![git account settings](/assets/img/gitter.png)
#### SSH 账号安全设置
默认情况下不给加入 administrators 群组，可限制 gitter 账号仅能用于操作 git 仓库。
```bash
#允许 git 行为
git clone ssh://gitter@host:port/repopath/reponame.git

#禁止系统管理行为
#Permission denied
#fatal: git package does not support interactive shell
ssh -p port gitter@host
```
可以为 ssh 设置其他端口，禁用默认的 22 端口，另外禁用 admin 账户，只保留个人设置的管理员账号具有超级权限。<br />为系统管理员和 gitter 账号设置秘钥登录，并禁用密码登录。<br />具体的做法为进入账号的 home 目录，将 ssh 公钥复制进 .ssh/authorized_keys 文件，并在个人电脑管理好私钥。由于 gitter 账号没有 shell 权限，配置的时候需要用 root 一下。
```bash
sudo -i
cd /volume1/homes/gitter/
mkdir .ssh
vi .ssh/authorized_keys
```

给 gitter 用户授权。
```bash
chown -R gitter:users .ssh
chmod 600 .ssh/authorized_keys
chmod 700 .ssh
```

修改 sshd_config 配置文件，禁用密码登录。
```bash
sudo vi /etc/ssh/sshd_config
```

修改上述文件中以下几个配置：
```bash
# 开启密钥认证支持
PubkeyAuthentication yes

# 配置 root 用户仅允许使用密钥认证
PermitRootLogin prohibit-password

# 禁止使用密码认证登录，对所有用户生效
PasswordAuthentication no
```

重启 ssh 服务。
```bash
systemctl restart sshd
```
#### 权限的一些额外注意点
群晖管理员账号用户目录权限默认为 777，太过宽泛，需要修改为 755 才能支持秘钥登录。
```bash
chmod 755 ~
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

如果 git pull 时提示 Permission denied, please try again. 大概率是给 gitter 账号配置的仓库权限不合理。
```bash
#fix problems below
#Permission denied, please try again.
#fatal: unable to access 'config': Permission denied
#fatal: Could not read from remote repository.
cd repo.git/
#先建仓库
git init --bare
chown -R gitter:users .
chmod -R 755 .
```
#### repo 仓库配置使用
本地仓库添加 nas git server 作为 remote，接下来就是常规的 commit & push 等等。
```bash
mkdir reponame && cd reponame
git init
git remote add origin ssh://gitter@host:port/repopath/reponame.git
git config user.name "name"
git config user.email "name@mail"
```
### 使用 post-receive hook 自动部署
云服务器安装 git core，并设置好 git 账号和 server & remote repo，方式和上面一致，重点是做好用户权限控制。<br />由于需要通过 nas git repo 实现自动同步代码到 github 和 云服务器，因此还必须给 nas gitter 账号添加好 ssh 私钥，同时在云服务器账号放上配套公钥，可以偷懒直接复用 github 的秘钥。
```bash
sudo vi /volume1/homes/gitter/.ssh/id_rsa
```
#### 代码同步
为 nas git repo 设置 remote mirror。
```bash
git remote add github --mirror=push git@github.com:nunumick/nunumick.github.com.git
git remote add cloud --mirror=push ssh://gitter@cloudhost:port/repopath/reponame.git
cat config
#config contents
[core]
    repositoryformatversion = 0
    filemode = false
    bare = true
[remote "github"]
    url = git@github.com:nunumick/nunumick.github.com.git
    mirror = true
[remote "cloud"]
    url = ssh://gitter@cloudhost:port/repopath/reponame.git
    mirror = true
```

新建 hooks/post-receive，编辑指令。
```bash
#!/bin/bash
#可以输出一些信息
echo "git user: $USER. start pushing to github and cloud."
#完成接收后执行命令，推送代码到远程仓库
exec git push -u github & git push -u cloud
```
#### 自动部署
在需要部署网站的服务器上建好 web 目录，用于存放网页文件，提供站点服务。
```bash
mkdir /var/www/website
```

编辑 post-receive hook，使网站服务器的 git 仓库可以自动更新文件到站点目录。
```bash
#!/bin/bash
TARGET="/var/www/website" # 服务器网站根目录
GIT_DIR="/home/gitter/repos/website.git" # 服务器git仓库路径
BRANCH="master"
while read oldrev newrev ref
do
 # only checking out the master (or whatever branch you would like to deploy)
 if [ "$ref" = "refs/heads/$BRANCH" ];
 then
  echo "Ref $ref received. Deploying ${BRANCH} branch to production..."
  git --work-tree=$TARGET --git-dir=$GIT_DIR checkout -f $BRANCH
 else
  # perform more tasks like migrate and run test, the output of these commands will be shown on the push screen
  echo "Ref $ref received. Doing nothing: only the ${BRANCH} branch may be deployed on this server."
 fi
done
```

到这里已完成工作流程图中所有的 git 仓库和系统设置，整体可以运转良好：
> 本地文件生产 -> nas服务器托管 -> 推送到 github 与云服务器 -> 文件部署

```bash
#local repo
git push origin master
#pushing logs
...
remote: git user: gitter. start pushing to github and cloud.
remote: remote: Ref refs/heads/master received. Deploying master branch to production...
...
```

接下来要关心的是如何提供稳定的 web 服务，留到下期再续……

1. github-pages 网站部署
2. nginx + jekyll 自建静态博客

