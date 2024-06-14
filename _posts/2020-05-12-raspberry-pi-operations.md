---
layout: post
title: 树莓派基础运维小记
category: developer
tags:
    - raspberry
    - homebridge
    - linux
---

朋友送了一个树莓派设备，正好最近在捣鼓 [homebridge](https://homebridge.io) ，可以用这块微型计算机做智家互联的本地中心服务。

### 安装

树莓派系统的安装参照[文档](https://www.raspberrypi.com/software/)进行就可以了，需额外配置一张 MicroSD 卡作为系统盘。由于我的机型 3B+ 系统内存只有 1GB，建议安装的是 32 位操作系统。系统准备好之后在 /boot 目录下创建 ssh 文件开启 ssh 服务。

```bash
# 默认用户: pi
# 默认密码: raspberry
ssh pi@ip_address
```

密码一定要改，本机 ip 也可以用以下命令查看

```bash
hostname -I
```

可以选择开启 WIFI，配置文件如下

```bash
# 配置文件
pi@raspberrypi:~ sudo vi /etc/wpa_supplicant/wpa_supplicant.conf

# /etc/wpa_supplicant/wpa_supplicant.conf
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=CN

network={
        ssid="wifi-ssid"
        scan_ssid=1
        psk="wifi-pwd"
        key_mgmt=WPA-PSK
}

# test
pi@raspberrypi:~ $ ifconfig wlan0
```
<!--more-->

### 基础运维

虽然树莓派提供的 HDMI 接口可以连接屏幕操作，不过开启 ssh 服务可以更方便进行系统运维动作，除了必要时需打开浏览器界面，其他情况都可以不用连接屏幕，homebridge 界面也可以用其他 PC 机来访问。

查看系统版本

```bash
# 方法一
pi@raspberrypi:~ $ uname -a
Linux raspberrypi 4.19.97-v7+ #1294 SMP Thu Jan 30 13:15:58 GMT 2020 armv7l GNU/Linux

# 或者方法二
pi@raspberrypi:~ $ cat /proc/version
Linux version 4.19.97-v7+ (dom@buildbot) (gcc version 4.9.3 (crosstool-NG crosstool-ng-1.22.0-88-g8460611)) #1294 SMP Thu Jan 30 13:15:58 GMT 2020
```

查看硬件信息
```bash
# device-info
pi@raspberrypi:~ $ cat /proc/device-tree/model
Raspberry Pi 3 Model B Rev 1.2

# cpuinfo
pi@raspberrypi:~ $ cat /proc/cpuinfo

# pinout
pi@raspberrypi:~ $ pinout
,--------------------------------.
| oooooooooooooooooooo J8     +====
| 1ooooooooooooooooooo        | USB
|                             +====
|      Pi Model 3B  V1.2         |
|      +----+                 +====
| |D|  |SoC |                 | USB
| |S|  |    |                 +====
| |I|  +----+                    |
|                   |C|     +======
|                   |S|     |   Net
| pwr        |HDMI| |I||A|  +======
`-| |--------|    |----|V|-------'

Revision           : a22082
SoC                : BCM2837
RAM                : 1024Mb
Storage            : MicroSD
USB ports          : 4 (excluding power)
Ethernet ports     : 1
Wi-fi              : True
Bluetooth          : True
Camera ports (CSI) : 1
Display ports (DSI): 1
```

内存、磁盘用量等

```bash
# cpu & 内存使用率等
pi@raspberrypi:~ $ htop

# 磁盘使用情况
pi@raspberrypi:~ $ df -h
文件系统        容量  已用  可用 已用% 挂载点
/dev/root        29G  3.8G   24G   15% /
```

### homebridge

可参考官方文档操作：[https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian)

安装

```bash
sudo apt-get install homebridge
```

工程配置，默认工程目录在 /var/lib/homebridge/

```bash
vi /var/lib/homebridge/config.json
```

服务启动，使用 homebridge 官方命令 hb-service，支持自启动

```bash
# Restart Command
sudo hb-service restart

# Stop Command
sudo hb-service stop

# Start Command, Automatic start on boot
sudo hb-service start
```

