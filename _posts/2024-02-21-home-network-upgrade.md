---
layout: post
title: 家庭基础设施篇二：家用网络配置与服务升级
category: life
tags:
    - network
    - infrastructure
    - router
---

在过年放假返回杭州的期间，趁着时间相对充裕，便对家里的网络设备和组网方式做了一次整体的配置更新与升级，与之前的方式相比，最主要的变化有两个：
1. 从运营商获取公网 IP，支持通过公网 IP 直连管理路由器和 NAS 主机
2. 架设二级路由器，和主路由网络进行隔离，类似分离出生活区和管控区，在二级网络下提供代理、网站、远程桌面等增强服务

其实对家里的网络进行优化的想法很早就是有的，最初是源于想在外面时也能够远程管理联网设备的网络联通状态，比如家里有小朋友的一种很常见情况是经常需要临时开关某个设备（如电视机）的的网络连接。现在路由器大多都提供远程连接也有家长控制模式等，但因为联网方式是经厂商服务器中转，速度非常感人，连接不上的时候大人小孩都要急哭。还有就是之前主路由常驻了科学上网程序，多少会对其他没需求的设备产生一些影响，这次一起调整了。

几番折腾后，整体的网络结构如下，应该说是根据家庭情况和实际需求而设计，有更好的合理性和可玩性。

![network]({{site.cdnroot}}/assets/img/network.png)

### 获取公网 IP

家里办的是电信宽带，可以给公网动态 IP，虽然是动态的，但结合 DDNS 的话也够用了。直接打电话给 10000 号说要把家里的光猫改桥接模式，客服小姐姐心领神会，确认户主身份后就二话不说麻利照办，同时可以更改宽带账号密码并短信下发到手机，用于给主路由器进行 PPPoE 拨号上网。所以也并不一定需要天翼网关的超级管理员账密，当然如果有的话会更自主可控些。

路由器拨号获得公网 IP，比如我拿到的是 115.205.12.220（写这篇文章的时候已经不是了），通过 ip location 可以查询到运营商是电信，属地杭州。

实际上还会同时获得运营商下发的 IPv6 地址，比如我的 240e:390:8f3:46a1:bde6:ffde:cba8:65f9，如果路由器有 IPv6 的功能，理论上可以让网络内所有设备都获得唯一的专属地址，可以获得与公网直连的通讯体验。

端口方面，默认的 80 和 443 是被封禁的，所以需要走其他端口。

### 路由器远程访问

开通路由器的远程访问功能，华硕路由器互联网访问只允许使用 https 协议，由于默认的 443 端口不能用，需用其他端口代替，比如 5443。在外网使用 https://115.205.12.220:5443 来远程管理路由器。

![router]({{site.cdnroot}}/assets/img/router-entry.png)

### 动态 DNS（DDNS）

公网 IP 隔一段时间就会变化，总要记住这些 IP 地址比较麻烦，解决办法也很简单。可以启用路由器内置提供的动态 DNS 服务，把动态的 IP 自动与固定的域名进行绑定，也可以使用其他三方 DDNS，我在 NAS 系统和 NO-IP 网站也设置了 DDNS，这样我就有了 3 个免费域名可供选择，常用一个就行，其他用于备用。动态 DNS 原理很简单，本质上就是定期上报登记 IP 的更新，域名解析记录也会更新。

![ddns]({{site.cdnroot}}/assets/img/ddns.png)

### 内网穿透

为了加速 NAS 系统的访问，这里也需要将 NAS 服务从内网到外网进行映射，主要用到端口转发。因为有两级路由存在，端口转发需要逐级进行。如果要把 NAS 系统 Docker 容器内的服务映射到公网，需要在 NAS 内部多做一层转发，可以打开 NAS 管理后台进行设置。

比如：主路由公网 8080 端口 -> 二级路由 5080 端口 -> NAS 8080 端口 -> Docker 80 端口，通过三层转发实现 Docker 内的 web 服务也可以被外网的 8080 端口访问到，每一层端口可以不同。

> 115.205.12.220:8080 -> 192.168.50.50:5080 -> 192.168.51.58:8080 -> docker:80

![port]({{site.cdnroot}}/assets/img/port.png)

### 静态路由设置

从网络拓扑图中可以看到，二级路由器也启用了 DHCP 服务，子设备网段与主路由不同，分属不同网段的设备要实现相互通信需要在路由器指定静态路由规则。当然也可以不必那么麻烦来设置不同的网段，主要原因是希望实现二级路由能独立运行科学上网程序，实际操作下来发现作为 AP 使用的路由器并不能启用 NAT 功能，于是不得不又设置成路由模式。

![static]({{site.cdnroot}}/assets/img/static.png)

### 网络代理与规则

二级路由是个使用多年的网件 R7000，值得庆幸的是它也可以刷成 [asuswrt-merlin](https://fw.koolcenter.com/well-known-authors/KoolCenter_Merlin_Legacy_380/Netgear/R7000/X7.9.1/)，固件刷新之后手动上传安装 clash，运行、节点订阅一路操作，设置代理规则以便支持 Arlo 监控基站强制走国外流量，其他的一般就按需走配置了。

```bash
# 类型,参数,策略(,no-resolve)
# Arlo BaseStation 强制走国外
SrcIPCIDR,192.168.51.57/32,国外流量
# NAS 不走代理
SrcIPCIDR,192.168.51.61/32,DIRECT
```

### 远程登录

开通了 NAS 主机的 ssh 服务，但禁用了账密登录只允许使用秘钥进行登录以保障一定安全性，设置端口转发，支持外网远程登录 NAS 主机，除了常规上机操作外，也可以把它作为内网一些主机的登录跳板，比如树莓派主机只允许内网登录，可以通过远程登录 NAS 机再登上树莓派主机进行运维。

```bash
~ ssh -p port user@115.205.12.220
user@nas:~$ ssh pi@192.168.51.111
```

### 使用反向代理提升体验

虽然使用动态 DNS 服务可以免去公网 IP 地址的记忆工作，但使用内部服务还是需要频繁输入各种端口，不便于记忆也不够优雅，可以搭建一个小型代理服务来解决这一问题，比如用阿里云服务器搭配 nginx 将请求自动转发到端口上，也可以用一些免费的三方代理，可以免去很多输入的麻烦，增强使用体验。

### 结尾

一次小小的网络改善，好像家人并没有感受到有什么区别，可说基本是无感升级了，事实上通过路由器拨号上网，速度上基本能跑满千兆带宽，网络性能也得到了很大提升，主路由网络稳定没再出现过闪断情况，设备远程管理秒级响应，二级路由内也任我折腾互不影响。网络技术也是家庭基础设施的一部分，深入生活，只有不好用了家人才会感受到它，家人感到舒适，而我在这个过程也温故知新，收获了普通技术人非常纯粹的快乐，这正是自己所追求的！
