---
layout: post
title: 家庭基础设施篇三：构筑智能家居生活服务
category: life
tags:
    - homekit
    - raspberry
    - homebridge
    - homeassistant
---

现如今面向家庭的智能设备和智控生活体验已经得到非常普遍的应用，一些厂商如小米、涂鸦更是有非常成熟的面向全屋的整套智慧生活方案，可以从房屋装修开始布局，一体化满足各式各样的智控生活诉求。

自家的情况和现在流行新装房屋不同，智控设备和能力属于后期添加。差不多是在 2017 年就采买了许多小米智能插座、开关、传感器，基于小米生态用米家 App 集成管理就可以有良好的使用体验。不过后面又有朋友送来一些涂鸦平台设备，加上家里还有一些仅支持 HomeKit 的监控设备，家里的智能设备由单平台变成了需要在多平台之间切换，再之后购入的设备也基本都支持苹果 HomeKit 和米家双平台，于是在 2020 年基于 HomeBridge 折腾一番，全屋智能设备接入 HomeKit 通过苹果 Home App 进行管理和控制。

### 苹果新的“家庭”架构

苹果在 2023 年推出的 iOS 16.4 中引入了新的 HomeKit 架构，新的架构进行了多项性能和可靠性优化。全新的架构也明确了 iPad 不能作为家庭中枢使用，转而推荐使用 HomePod: [https://support.apple.com/zh-cn/102287](https://support.apple.com/zh-cn/102287)。猜测还是商业意图明显。

>
要在新的“家庭”架构上共享你家的控制权以及接收“家庭”通知，你需要配备一个家居中枢（如 Apple TV 或 HomePod）。在这个新的“家庭”架构中，不支持使用 iPad 作为家居中枢。

所以在新的架构下不得不添置了一个 HomePod 代替原来的 iPad 作为中枢使用，在选择上 HomePod mini 足以应付，不管怎样，应该说苹果公司的生态圈目的是实现了的。

### HomeBridge vs HomeAssistant

开源社区中比较热门的两个智能家居解决方案，[HomeAssistant](https://www.home-assistant.io/) 侧重于做独立的智能家居集成平台，定位上类似于 Apple Home、米家、涂鸦、天猫精灵等，它允许我们整合各种智能家居设备和服务，无论这些设备是否支持原生集成，它也有很强的自动化控制能力。而 [HomeBridge](https://homebridge.io/) 如其名称，主要充当桥梁作用，将非 HomeKit 兼容的智能设备桥接到 Apple HomeKit 生态系统中，从而使我们能够通过苹果的 Home 应用或 Siri 语音控制这些设备。

经过多年的迭代发展，HomeAssistant 的上手门槛已大幅降低，插件和集成生态也增强不少，通过添加 HomeKit 集成可以轻松实现与 HomeBridge 同样的能力，将 HomeAssistant 控制的设备桥接到苹果的 HomeKit 中。

HomeBridge 贵在轻量、纯粹、体验好，且 Node.js 项目对前端特别友好，二次开发也不在话下，自由度更高。

于是为了深度体验，在我本次“家庭”架构升级中同时引入了这两个项目，应该说 HomeAssistant 的功能很强大，我只用了它很少的一部分能力来搭建理想中的 Apple HomeKit 生态。

![smart home]({{site.cdnroot}}/assets/img/home-set.jpg)

### 安装 HomeAssistant

[官方](https://www.home-assistant.io/installation/)提供多种安装方式，由于家里已有的树莓派 3 硬件版本和性能较低，这里选择安装 HomeAssistant Core:

1. Home Assistant Container: Standalone container-based installation of Home Assistant Core (e.g. Docker).
2. Home Assistant Supervised: Manual installation of the Supervisor.
3. Home Assistant Core: Manual installation using Python virtual environment.

HA-Core 2024.3.3 至少需要 Python 3.11，HomeAssistant 更新非常迅速，版本升级的同时环境依赖也需要经常性的同步升级，官方操作文档已经比较详细且更新及时，不过我的安装过程也并不是一帆风顺，归根结底的原因就一个： Raspberry Pi **Raspbian 系统版本过低**，还在用几年前的 buster（Debian 10）

起初尝试过只更新 firmware

```bash
pi@raspberrypi:~ $ sudo apt-get install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncursesw5-dev xz-utils tk-dev liblzma-dev libffi-dev

Err:11 http://raspbian.raspberrypi.org/raspbian buster/main armhf libllvm7 armhf 1:7.0.1-8+rpi3
  404  Not Found [IP: 93.93.128.193 80]
  Err:42 http://raspbian.raspberrypi.org/raspbian buster/main armhf tk-dev armhf 8.6.9+1
  404  Not Found [IP: 93.93.128.193 80]

pi@raspberrypi:~ $ sudo rpi-update
 *** Raspberry Pi firmware updater by Hexxeh, enhanced by AndrewS and Dom
 *** We're running for the first time
 *** Backing up files (this will take a few minutes)
 *** Backing up firmware
 *** Backing up modules 4.19.97-v7+
 *** Downloading specific firmware revision (this will take a few minutes)
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
100  142M  100  142M    0     0  1534k      0  0:01:34  0:01:34 --:--:-- 2257k
 *** Updating firmware
 *** Updating kernel modules
 *** depmod 6.6.22-v7l+
 *** depmod 6.6.22-v8+
 *** depmod 6.6.22-v8-16k+
 *** depmod 6.6.22+
 *** depmod 6.6.22-v7+
 *** Updating VideoCore libraries
 *** Using HardFP libraries

pi@raspberrypi:~ $ sudo apt update
459 packages can be upgraded. Run 'apt list --upgradable' to see them.

pi@raspberrypi:/ $ uname -a
Linux raspberrypi 5.10.103-v7+ #1529 SMP Tue Mar 8 12:21:37 GMT 2022 armv7l GNU/Linux
```

Python3 升级正常，但因为缺失很多系统依赖，HASS 安装失败

```bash
All Done!
Your new Python version should be 3.11.0
You can check this yourself by 'python --version'

(homeassistant) homeassistant@raspberrypi:/srv/homeassistant $ pip3 install homeassistant==2024.3.3
error: can't find Rust compiler
```

尝试过降低 HASS 版本，以及安装 RustC 和缺失的系统库，会遇到各式各样的问题导致失败，比如

```bash
libopenblas.so.0: cannot open shared object file: No such file or directory
```

最终的解决办法是**全新烧录了树莓派系统**，将版本升级到了 Bookworm（Debian 12），一切迎刃而解，且 Bookworm 自带 Python 3.11.

### 树莓派 3B+ 和 Bookworm

现在才知道，Debian 发布的版本都是以《玩具总动员》系列电影中的角色命名的，Bookworm 是《玩具总动员3》中的一个小角色，上一发行版是 Bullseye。

Bookworm 系统伴随树莓派 5 而来，虽然仍然可以支持在树莓派 3 上运行，但其全新的显示系统特性 Wayland 在老旧的树莓派 3 中并不能使用，所以在升级到 Bookworm 之后，我的树莓派 3B+ 桌面显示始终存在一些问题，好在日常使用中基本不需要用到 GUI。

> The most important of these is the move to using Wayland rather than X11 as the display system.

> For the last 35 years or so, most Unix desktop environments, including the Raspberry Pi Desktop, have been based on the X11 window system. But, as is hardly surprising for a piece of software several decades old, X11 has various limitations when used on modern computers. To address these, most Linux distributions are moving to use Wayland; those which have not already done so are planning to do so in the future.

> With one caveat —  for now, Wayland is only the default on Raspberry Pi 4 and 5. The performance of Wayfire on earlier platforms is still being optimised, so for now they will continue to run the old X11 display server and the Openbox window manager, but at some point these platforms will also be switched to Wayfire.

```bash
pi@raspberrypi:~ $ cat /etc/os-release
PRETTY_NAME="Raspbian GNU/Linux 12 (bookworm)"
NAME="Raspbian GNU/Linux"
VERSION_ID="12"
VERSION="12 (bookworm)"
VERSION_CODENAME=bookworm
ID=raspbian
ID_LIKE=debian
HOME_URL="http://www.raspbian.org/"
SUPPORT_URL="http://www.raspbian.org/RaspbianForums"
BUG_REPORT_URL="http://www.raspbian.org/RaspbianBugs"
```

raspi-config

![raspi-config]({{site.cdnroot}}/assets/img/raspi-config.jpg)

### 设置 HomeAssistant 系统服务

HomeBridge 提供了一个 [hb-service](https://github.com/homebridge/homebridge-config-ui-x/wiki/Homebridge-Service-Command#features) 命令，功能强大，不仅可以作为 Linux 系统服务便利地做到进程守护，还包括 HB 本体的安装、卸载、Node.js 版本升级等等，基本上一个命令管所有，体验极致优秀。

反观 HomeAssistant，类似的系统服务则需要自己编写和配置，参考[这里文档](https://community.home-assistant.io/t/autostart-using-systemd/199497
)

编写 /etc/systemd/system/home-assistant@homeassistant.service

```bash
[Unit]
Description=Home Assistant
After=network-online.target

[Service]
Restart=on-failure
RestartSec=5s
Type=simple
User=%i
WorkingDirectory=/home/%i/.homeassistant
ExecStart=/srv/homeassistant/bin/hass -c "/home/%i/.homeassistant"
RestartForceExitStatus=100

[Install]
WantedBy=multi-user.target
```

启动服务

```bash
sudo systemctl --system daemon-reload

sudo systemctl enable home-assistant@homeassistant
Created symlink /etc/systemd/system/multi-user.target.wants/home-assistant@homeassistant.service → /etc/systemd/system/home-assistant@homeassistant.service.

sudo systemctl start home-assistant@homeassistant

sudo systemctl status home-assistant@homeassistant
```

### 智能设备集成与接入

家里的设备分为几类：

1. 小米 iot 设备（不支持 HomeKit）
2. 小米蓝牙设备（不支持 HomeKit）
3. 小米网关和配件（支持 HomeKit）
4. 涂鸦 iot 设备（不支持 HomeKit)
5. Arlo 摄像头与基站（支持 HomeKit)
6. 其他，服务器、路由器、树莓派等（不支持 HomeKit）

正如前面的“家庭”架构设计，对于不支持 HomeKit 的设备，结合 HomeAssistant 的丰富度和成熟度，HomeBridge 的代码友好特性，思路上主张使用 HomeAssistant 作为主力桥接平台，HomeBridge 作为辅助桥接平台，最后均接入 Apple Home 平台，实现在一个界面管理和控制，同时基于全新的 HomePod 中枢，可以达到远程控制和多人协同的目标。

**① Home Assistant Community Store**

> HACS is a integration that gives the user a powerful UI to handle downloads of custom needs.

启动 HomeAssistant 服务后，浏览器打开 8123 端口进入 web 管理界面，通过添加第三方集成 [HACS](https://hacs.xyz/docs/basic/getting_started#what-can-hacs-do) 以便接入小米 Miot Auto 这类三方设备集成，基本上使用 UI 界面就可以完成配置，非常方便。

![hacs]({{site.cdnroot}}/assets/img/hacs.png)

除了 HACS 集成之外，还可以接入群晖服务器和各类路由器设备集成，建立全屋可联网设备的统一发现与状态监控。

![integrations]({{site.cdnroot}}/assets/img/integrations.jpg)

**② HomeKit 集成**

通过添加 HomeKit 集成，可以把已经接入到 HomeAssistant 的设备通过协议适配桥接到 Apple Home 平台。并不是所有[设备类型](https://www.apple.com/home-app/accessories/)都适合加入 Apple Home，存在无法识别的设备，因此在添加列表中需要进行过滤和筛选。

**③ 模拟（灯、开关等）设备用于显示系统状态**

HomeKit 的协议适配，本质上是把设备模型转换成 HomeKit 可识别的设备类型与数据格式，因此可以通过编写代码模拟出一些**虚拟**的设备，比如接触器开关、指示灯，用于将一些无实体的事物接入到 Apple Home，以便于观测状态与管控。

我的 Case：**观测家里的科学上网服务是否正常**。在 HomeBridge 中用到两个插件：
1. homebridge-http-status，模拟出 ContactSensor，定时访问 Google，成功则状态为“关闭”，反之则为“打开”。
2. homebridge-fake-light-bulb，模拟出灯泡，添加自动化将 ContactSensor 的开闭状态转换为灯泡的亮灭状态，开对应灭，关对应亮。

![homebridge]({{site.cdnroot}}/assets/img/homebridge.jpg)

HomeBridge 插件配置：
```json
{
    "accessories": [
        {
            "name": "科学上网Status",
            "brightness": false,
            "color": "none"
            "accessory": "homebridge-fake-light-bulb"
        }
    ],
    "platforms":[
        {
            "platform": "HttpStatus",
            "sensors": [
                {
                    "id": "check-google",
                    "name": "google health",
                    "okStatus": 200,
                    "method": "get",
                    "url": "https://www.google.com/",
                    "headers": {},
                    "pingInterval": 300,
                    "ignoreRequestError": false
                }
            ]
        }
    ]
}
```

**④ 不支持 HomeKit 的小米摄像头**

摄像头最核心需要被接入的是实时监控和画面传输，而无论是 HomeAssistant 的小米集成还是 HomeBridge 的摄像头插件 对老版本的小米摄像头支持都不够完善，只能够支持接入运行指示灯和基础操控等，不够完美。

经过一些摸索，最后采用了 ffmpeg & rtsp 推流和摄像头模拟的方案，这部分很值得单独记录一篇，留到下期再说。

### 通过 Apple Home 控制和自动化

最终在 Apple Home 中接入了 1 个 HomePod 中枢和 4 个桥接，无论身处何地，只需要手机和家庭网络保持连接，就能实现在 Home 应用中看到设备的实时状态、获得摄像头的实时画面，并对设备进行实时控制。

![apple home]({{site.cdnroot}}/assets/img/apple-home.jpg)

HomePod 也可以作为全屋广播，实现比如“下雨啦，快收衣服啊！”之类的自动通知服务。

相比米家和 HomeAssistant 的自动化水平，Apple Home 的自动化能力显得弱些，建议复杂的设备自动化规则可以通过 HomeAssistant 和米家平台配置，因为规则一旦配置不需要经常修改，大多数情况下可以不用关注。另外，还可以使用 Apple 的快捷指令来编写组合式的自动化规则和脚本，以实现更复杂的场景，可玩性很高。


