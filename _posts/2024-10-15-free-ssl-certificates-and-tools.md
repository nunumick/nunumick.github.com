---
layout: post
title: 免费 SSL 证书申请与续签
category: developer
tags:
    - ssl
    - acme
    - nginx
---

目前市面上绝大多数的免费 SSL 证书有效期都在 3 个月左右，网站原来一年一续的免费 SSL 证书不再可用，个人因此经历了一段时间的证书手动申领、更新与部署，其最大的问题是容易遗忘并导致网站证书失效。

经同事提醒可以使用脚本自动申请免费的证书并定期续签，实践经过确实比较简单和自动化，脚本配置后再也不用担心证书失效，应该是个人网站证书方案首选。

### ACME 协议
证书的自动申领和续签有多种方案可选，个人所采用的是 [ACME.sh](https://github.com/acmesh-official/acme.sh) 脚本，其作为在网站服务器安装运行的 SSL 证书客户端，与证书机构服务器以 ACME 协议交互实现端到端的证书自动更新、验证、签发、分发和部署。

在使用 ACME.sh 脚本之前可以先了解什么是 ACME 协议。

<!--more-->

#### 什么是 ACME 协议？
ACME，即自动自动证书管理环境（Automatic Certificate Management Environment），是一种协议，用于自动颁发和更新证书，无需人工干预。

互联网安全研究小组 (ISRG) 最初为自己的证书服务设计了 ACME 协议。证书颁发机构 Let’s Encrypt 通过 ACME 协议免费提供 DV 证书。如今，各种其他的 CA、PKI 供应商和浏览器都支持 ACME 协议，支持不同类型的证书。

#### ACME 协议如何工作
通过 ACME 协议，公司或个人站长可以简化或自动化证书管理的流程，如证书签名请求 (CSR) 的生成、域名所有权的验证以及证书的颁发和安装。

ACME 协议主要用于获取 DV 证书，因为 DV 证书不需要更高级验证。仅验证域名是否存在，无需人工干预。

该协议还可用于获取更高级的证书，如 OV 和 EV 证书。但是需要额外的支持机制以及 ACME 客户端。

ACME 协议的目标是自动设置 HTTPS 服务器并提供受信任的证书以消除任何容易出错的手动事务。要使用该协议，您需要一个 ACME 客户端和 ACME 服务端，它们通过 HTTPS 连接与 JSON 消息进行通信的。

+ 客户端可在任何需要 SSL/TLS 证书的服务器或设备上运行。它用于请求证书管理操作，例如颁发或撤销。
+ 服务端由证书颁发机构 (CA) 运行，如 Let’s Encrypt，响应客户端的请求。

#### ACME 客户端
市面上有多种不同的 ACME 客户端，选择一款 ACME 客户端后，下一步是要将其安装在需要部署证书的服务器上。ACME 客户端几乎可以在任何编程语言和环境中运行，设置过程通常有 5 个基本步骤：

1. 客户端提示输入要管理的域名。
2. 客户端提供支持 ACME 协议的 CA 列表。
3. 客户端联系选定的 CA 并生成授权密钥对。
4. CA 向客户端发出 DNS 或 HTTPS 质询，以证明其对域名的所有权。
5. CA 发送一个随机数，供客户端使用其私钥签名以证明密钥对的所有权

一旦 CA 验证客户端是真实的，ACME 客户端就准备好代表域名进行证书管理请求。

### 使用 ACME.sh 客户端
#### 安装
```bash
git clone https://github.com/acmesh-official/acme.sh.git
cd ./acme.sh
./acme.sh --install -m administrator@nunumick.cn
```

官方文档解释了安装的过程和具体的动作主要有三个：

1. 环境初始化
2. 命令行工具
3. Cron 任务计划

```bash
28 11 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

#### 证书签发
CA 证书服务机构默认为 ZeroSSL ，个人偏好切换到 Let's Encrypt

```bash
acme.sh --set-default-ca --server letsencrypt
```

使用 webroot 模式发送签发指令，指定网站根目录的作用在于真实响应 CA 服务器的质询，以证明我们有域名的所有权，交互过程说明如下：

> **HTTP-01 challenge**
>
> This is the most common challenge type today. Let’s Encrypt gives a token to your ACME client, and your ACME client puts a file on your web server at `http://<YOUR_DOMAIN>/.well-known/acme-challenge/<TOKEN>`. That file contains the token, plus a thumbprint of your account key. Once your ACME client tells Let’s Encrypt that the file is ready, Let’s Encrypt tries retrieving it (potentially multiple times from multiple vantage points). If our validation checks get the right responses from your web server, the validation is considered successful and you can go on to issue your certificate. If the validation checks fail, you’ll have to try again with a new certificate.
>

```bash
acme.sh --issue -d nunumick.cn -d life.nunumick.cn -w /home/wwwroot
```

#### 证书部署
默认情况下，ACME.sh 会把申请到的证书放在 ~/.acme.sh/example.com/ 目录，我们要把证书部署到 Web 服务器，需要进行以下操作：

1. 拷贝证书到 Web 服务器证书存放目录
2. 设置 Web 服务器证书配置（一次性）
3. 重启 Web 服务

ACME.sh 命令可以把这个过程自动化，如果已经存在 nginx 配置，需要手动完成第 2 步以更新 nginx.conf，之后在每次证书 renew 时程序会自动完成拷贝和重启动作

```bash
acme.sh --install-cert -d example.com \
--key-file       /path/to/keyfile/in/nginx/key.pem  \
--fullchain-file /path/to/fullchain/nginx/cert.pem \
--reloadcmd     "service nginx force-reload"
```

#### 自动续签与部署
ACME.sh 默认每 2 个月更新证书，Cron 任务会每天运行证书状态检查，符合时间要求时执行证书的自动续签与部署

```bash
[root@xxx]~# acme.sh --cron --home ~/.acme.sh/
[Tue Oct 15 06:18:25 PM CST 2024] ===Starting cron===
[Tue Oct 15 06:18:25 PM CST 2024] Renewing: 'nunumick.cn'
[Tue Oct 15 06:18:25 PM CST 2024] Renewing using Le_API=https://acme-v02.api.letsencrypt.org/directory
[Tue Oct 15 06:18:25 PM CST 2024] Skipping. Next renewal time is: 2024-12-12T13:48:02Z
[Tue Oct 15 06:18:25 PM CST 2024] Add '--force' to force renewal.
[Tue Oct 15 06:18:25 PM CST 2024] Skipped nunumick.cn_ecc
[Tue Oct 15 06:18:25 PM CST 2024] ===End cron===
```

当然我们也可以手动进行 renew，会自动完成新的证书签署、拷贝和服务重启动作

```bash
acme.sh --renew -d nunumick.cn --force
```

总体而言使用起来非常方便，ACME.sh 还有很多高级功能暂时用不上，比如 api 模式等等，后续有用到再更新……


