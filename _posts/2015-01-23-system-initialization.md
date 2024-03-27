---
layout: post
title: 前端系统初始化-我的常用工具
category: developer
tags:
    - jekyll
    - vim
    - git
    - zsh
---

每次换电脑总是要走一遍繁琐的软件安装和开发环境初始化流程，在mac上安装软件、命令行工具时不时会碰到问题，在又一次经历了这个过程之后，我决定把常用软件及开发环境记录下来，以绝后患。

### brew

mac 上强力资源管理工具，用的是HomeBrew

{% highlight bash %}
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
{% endhighlight %}

### nodejs

无需多说，官网下载安装：[nodejs.org](http://nodejs.org/download/)

接着可以装一些 node 常用工具

### java-jdk

无需多说，官网下载安装：[jdk download](http://www.oracle.com/technetwork/cn/java/javase/downloads/index.html)

### git

**安装git**
{% highlight shell %}
brew install git
{% endhighlight %}

**常规配置**
{% highlight bash %}
git config --global alias.st 'status'
git config --global alias.ci 'commit'
git config --global alias.br 'branch'
git config --global alias.co 'checkout'
git config --global alias.lg 'log'
git config --global user.name 'name'
git config --global user.email 'email'
{% endhighlight %}

**ssh配置**

从个人仓库同步 .ssh 到本机相同目录下即可

### svn

{% highlight bash %}
brew install --universal --java subversion
{% endhighlight %}

### zsh

比较好用的shell，可以简化不少操作，自动补全，颜色高亮，还能识别git仓库

**安装zsh**
{% highlight bash %}
brew install zsh
{% endhighlight %}

**安装oh-my-zsh**
{% highlight bash %}
curl -L https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh | sh
{% endhighlight %}

**设置zsh为默认shell**
{% highlight bash %}
chsh -s /bin/zsh
{% endhighlight %}

### TotalTerminal

从官网下载安装:[totalterminal](http://totalterminal.binaryage.com/)

### vim

初始化.vim，主要包含 vim 的 vimrc 配置
{% highlight bash %}
git clone git@github.com:nunumick/vundle.git ~/.vim
{% endhighlight %}

初始化 bundle
{% highlight bash %}
git clone http://github.com/gmarik/vundle.git ~/.vim/bundle/vundle
{% endhighlight %}

为.vimrc建立链接
{% highlight bash %}
ln -s ~/.vim/vimrc .vimrc
{% endhighlight %}

最后打开 vi，使用:BundleInstall 命令安装插件

### jekyll

静态博客系统，必备良品，每次安装都要费不少力气

jekyll 因为是 ruby 的项目，需要用 gem 安装，首先需要看下 gem 的版本，最好是 1.9 以上的

{% highlight bash %}
gem -v
{% endhighlight %}

还好，现在预装都是 2.0 以上的

另外一个问题是 gem 默认源不稳定，经常连不上
{% highlight bash %}
➜  ~  gem sources -l
*** CURRENT SOURCES ***

https://rubygems.org/
{% endhighlight %}

换一个靠谱的源：
{% highlight bash %}
sudo gem sources --remove https://rubygems.org/
sudo gem sources -a http://ruby.taobao.org/
{% endhighlight %}

终于可以安装 jekyll 了，-V参数可以显示详细信息
{% highlight bash %}
sudo gem install jekyll -V
{% endhighlight %}

安装一些依赖，比如 rdiscount pygments
{% highlight bash %}
sudo gem install rdiscount
sudo easy_install pip
pip install pygments
{% endhighlight %}


### 其他常用软件

* Alfred 信息检索必备
* MAMP 省去apache,mysql等常规设置
* ihosts host切换
* moom 窗口切换
* charles 调试利器
* mou 文档编写记录
* xcode 软件开发工具

