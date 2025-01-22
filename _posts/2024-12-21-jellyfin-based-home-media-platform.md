---
layout: post
title: 基于 Jellyfin 搭建家庭影视平台
category: life
tags:
    - jellyfin
    - kodi
    - vidhub
    - sonarr
    - radarr
---

### Why Jellyfin？
至于为什么使用 Jellyfin，于我而言最主要的因素就是**开源和免费**吧。在此之前我也进行了多方面的比较，用过 Plex 和 Emby 这两款付费软件，产品力确实在很多方面要吊打 Jellyfin，不过综合考虑如下：

+ 要获得完整体验就最好成为付费用户，那我想有这个钱我为啥不去购买爱奇艺会员？
+ 我还是想尽量基于自己的 NAS 服务器搭建一套所有权 100% 属于自己的本地化的多媒体系统
+ 实测我的 NAS 性能比较拉（[J4025](https://www.intel.com/content/www/us/en/products/sku/197307/intel-celeron-processor-j4025-4m-cache-up-to-2-90-ghz/specifications.html)），无法完全享用 Plex 付费的硬件加速功能，所以选择什么方案还是应该因人而异
+ 我觉得多折腾可以让人学到一些奇奇怪怪的知识并得到实践，结果不重要，重要的是过程

Jellyfin **可以满足个人使用的绝大多数需求**，有比较完善的账号管理、媒体库管理、插件体系、移动客户端、TV客户端，可以搭配的媒体软件也比较多，有 Kodi add-on，可以把 Jellyfin 仅作为媒体资源管理和推流软件，再选择其他更好用的客户端实现媒体播放。

### 媒体库&元数据刮削
使用 Jellyfin 可以打造出专业度很高的媒体库，然而过程并不简单，在接触媒体服务器之前，我并不清楚媒体文件也有**元数据**这个概念：

> 媒体元数据是关于媒体文件的关键信息，包括音频、视频和图像等。它不仅包含描述性内容，如标题、艺术家、专辑和流派，还涵盖技术参数，如编码方式、分辨率、比特率等。元数据对媒体文件的管理和分享至关重要，因为它允许软件和服务识别、分类和优化内容。例如，元数据可以用于自动填充播放列表、实现内容搜索，甚至帮助转码媒体文件以适应不同的设备或网络条件。
>

简言之，对于每一部电影、电视剧或每一首音乐，都可以有一种用来描述其信息组成的结构化数据，比如电影的名称、导演信息、演职人员、剧情摘要、海报等等，媒体元数据就是媒体文件的档案，很多条元数据就组成了媒体档案数据库。幸运的是我们生活在这个万能的互联网世界，这类公共的媒体档案库已经有人帮我们建立和维护好了。

媒体档案库仅仅登记媒体信息便于检索，并不实际拥有媒体文件，提供这类数据源服务的网站有 [IMDB](https://www.imdb.com/)、[TMDB](https://www.themoviedb.org/)、[TVDB](https://thetvdb.com)，国内的还有[豆瓣网](https://movie.douban.com/)等，这些网站为了保证媒体信息的准确性和实时性应该需要不少成本。

Jellyfin 默认使用 TMDB 作为元数据来源，从实际使用体验上 TMDB 确实更受欢迎些，尤其是对国内电影、电视剧的数据支持更好，很难想象这些数据全部是依靠社区更新和维护的，也是互联网精神的一种体现吧。

> The Movie Database (TMDB) is a community built movie and TV database. Every piece of data has been added by our amazing community dating back to 2008. TMDB's strong international focus and breadth of data is largely unmatched and something we're incredibly proud of. Put simply, we live and breathe community and that's precisely what makes us different.
>

Jellyfin 的很多功能都通过插件驱动，可以看到 TMDB 和 OMDB 均属于其内置插件，我们也可以根据需要加入其他插件，比如字幕获取插件，比如我增加了 [MetaShark](https://github.com/cxfksword/jellyfin-plugin-metashark) 插件，用于从豆瓣获取元数据

![jellyfin plugin]({{site.cdnroot}}/assets/img/jellyfin-plugins.png)

![jellyfin metashark]({{site.cdnroot}}/assets/img/jellyfin-metashark.png)

### 影视资源自动化下载
本地媒体库的创建可以分为几步走：

1. 分类，我主要是电影和电视剧
2. 资源搜寻与下载
3. 元数据补全

步骤 2 和 3 循环往复，可以打造出庞大的个人影视库，视频资源文件占用空间较大，所以我单独又加了几个 T 的存储空间，影片文件不担心损坏和丢失，一般的数据盘足够，目前为止使用良好。

另外，使用 **Jellyseerr + Sonarr + Radarr + Jeckett + Transmission** 这样一套软件组合，可以实现影片资源追踪、下载和自动归档分类。

1. **Sonarr**: 监控并自动下载指定的电视节目。它会根据质量设置（如高清、蓝光等）查找新发布的剧集，然后将它们下载到硬盘上，并按照预定义的文件和目录结构进行整理。
2. **Radarr**: 与 Sonarr 类似，但专为电影而设计。负责自动下载和管理电影，同样保持电影库的更新，并按照预设进行文件组织。
3. **Jackett**: 提供一个统一的接口，使 Sonarr、Radarr 等工具能够高效、便捷地搜索和访问各种 torrent 源。
4. **Transmission**: 经典下载器，完成实际的 torrent 文件下载，由 Sonarr、Radarr 或 Jackett 触发。
5. **Jellyseerr**: Overseerr 的分支，为 Jellyfin 媒体服务器提供媒体资源请求管理功能，可以通过它下发媒体请求任务给 Sonarr 与 Radarr，实现全自动的媒体下载与管理。

![这张图解释比较清楚]({{site.cdnroot}}/assets/img/media-flow.png)

以上是一组经典且**理想化**的搭配方案，实际使用后的感受是这套软件对中文影视剧的支持还是偏弱一些，所以我个人现在比较常用的方式简化为三部分：

1. **资源搜寻**：手动使用 Jackett 寻找资源，更加精准，手动触发 Transmission 下载
2. **文件归档**：利用 Radarr 和 Sonarr 的目录规则、文件跟踪、移动、重命名和硬链接（hardlink) 管理媒体文件
3. **媒体服务**：Jellyfin 补全元数据和字幕文件，并提供多媒体流服务

以上还是有一定操作量的，仅适用于我，因为我的影视剧需求并不多，可以管理细致一些，有关软件安装和目录结构的注意事项后面会专门讲。

### 播放器的选择
Jellyfin 官方提供的播放器（包括 PC 和客户端）是一个浏览器驱动的 web player，本质上是直接使用了 HTML 的 &lt;video&gt; 标签

![video-player]({{site.cdnroot}}/assets/img/video-player.png)

标签对媒体文件的支持度直接限制了 Jellyfin 播放器对媒体文件类型的支持范围，比如对 .mkv 这类不在支持列表的媒体编码或格式文件会提示播放错误

![Interstellar]({{site.cdnroot}}/assets/img/interstellar.png)

![player-error]({{site.cdnroot}}/assets/img/player-error.png)

这就需要对媒体文件进行编码或文件类型转换，转码成支持的文件，以下是 &lt;video&gt; 标签支持的媒体信息列表，从中可以看出对 MP4 容器支持较好：

| 编解码器简称 | 编解码器全称 | 容器支持（文件类型） |
| :--- | --- | --- |
| [AV1](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#av1) | AOMedia Video 1 | [MP4](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#mpeg-4_mp4)、[WebM](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#webm) |
| [AVC (H.264)](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#avc_h.264) | Advanced Video Coding（高级视频编码器） | [3GP](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#3gp)、[MP4](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#mpeg-4_mp4) |
| [H.263](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#h.263) | H.263 Video | [3GP](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#3gp) |
| [HEVC (H.265)](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#hevc_h.265) | High Efficiency Video Coding（高效视频编码） | [MP4](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#mpeg-4_mp4) |
| [MP4V-ES](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#mp4v-es) | MPEG-4 Video Elemental Stream（MPEG-4 视频元素流） | [3GP](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#3gp)、[MP4](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#mpeg-4_mp4) |
| [MPEG-1](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#mpeg-1_part_2_video) | MPEG-1 Part 2 Visual | [MPEG](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#mpegmpeg-2)、[QuickTime](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#quicktime) |
| [MPEG-2](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#mpeg-2_part_2_video) | MPEG-2 Part 2 Visual | [MP4](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#mpeg-4_mp4)、[MPEG](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#mpegmpeg-2)、[QuickTime](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#quicktime) |
| [Theora](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#theora) | Theora | [Ogg](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#ogg) |
| [VP8](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#vp8) | Video Processor 8 | [3GP](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#3gp)、[Ogg](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#ogg)、[WebM](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#webm) |
| [VP9](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs#vp9) | Video Processor 9 | [MP4](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#mpeg-4_mp4)、[Ogg](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#ogg)、[WebM](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Containers#webm) |


Html Video Player 无论从播放功能还是媒体格式支持度上都无法与专业的播放器相比较，因此在媒体播放器的选择上，我最终的方案是 Vidhub + Kodi。

+ **Vidhub**：专业版便宜、支持 iOS、iPad、Mac 平台、支持投屏、**支持多种视频格式**，可以直连 Jellyfin 媒体库进而完全代替 Jellyfin 播放器
+ **Kodi**：开源的媒体中心软件，对桌面平台支持较好，iOS 需要越狱，我把它安装在树莓派中，搭配 Jellyfin Kodi add-on 可以作为电视盒子使用，关于 Kodi 的配置以后可以单独写一篇介绍

### 编解码与硬件加速
先说结论，对于**个人或家庭成员使用，**我觉得**完全用不上服务器编解码和硬件加速。**

前面提到了，媒体的播放与媒体编码、文件格式和播放器选择息息相关，在我的媒体播放方案中，是把 Jellyfin 作为媒体存储和推流服务器使用（串流），服务器不负责转码工作，而是将媒体的解码和播放交给 Vidhub 等播放器，依靠播放器强大的能力完成工作，是一种服务端做轻而客户端做重的选择：

+ **好处1：**是可以极大降低媒体服务器的负担和资源消耗
+ **好处2**：媒体未经转码压缩直接输出（高比特率），质量绝对最好
+ **不好的地方**也是显而易见，未经转码的视频源文件普遍较大，传输将占用更多的网络带宽，客户端下载也更费流量，依赖较好的网络条件

我们来看下高清视频文件需要的网络带宽，视频文件有如下公式：

> 视频文件大小（字节）≈ 码率（比特/秒）× 视频时长（秒）/ 8
>

一部视频容量为 35G 的两个小时 BD50 蓝光电影，其码率也只有 41Mbps（40777kbps），再经过 HEVC 等编码，可以在同等质量下得到更低的码率和文件大小，参考前面的 Interstellar 影片，其码率为 12.5Mbps（12796kbps，爱奇艺 720p 高清码率为 4Mbps）。以现阶段的家庭宽带普及率，按平均百兆带宽来估算，去掉网络损耗，客户端下行速度最高可以达到 90Mbps，影片服务器上行速度至少有 20Mbps，支持这样一部4K 影片的上传和下载完全没有问题。

更何况我的媒体资源选择绝大多数 1080p 就已经足够，而且宽带配置至少是千兆网。

那么，什么情况需要实时转码？如果**搭建的影视平台面向更大更多样的用户群体**，则需要通过媒体服务器对视频文件进行源数据处理，以适应更广泛的用户需求，因为：

+ 第一，无法控制用户使用什么媒体播放器，所以服务器最好提供适配性更好的文件格式，如 MP4
+ 第二，用户网络条件各异，更小的媒体文件大小可以提高传输速度，进而实现更流畅的播放效果

所有大型影视媒体平台均支持媒体的服务端转码，或者说必须要支持，其中还有一条非常重要的原因是：**能够控制媒体的质量就可以控制用户**，比如针对普通用户限流，高级用户可以享受更高清的观看体验。

试想，资本家怎么可能那么无私，花费巨大的管理成本和技术成本为普通用户提供高质量的影视剧，商业媒体平台至少都希望达到以下两点：

1. **多收钱，用户尽可能花钱买质量，以达到更好的观影体验**
2. **少用钱，媒体服务器上行带宽成本不要太高**

第 2 条制约着第 1 条，就是说用户花钱买会员，也不一定能够得到与之匹配的更高质量的视频流，花钱买到的是假高清，这是经网友实验证实过的。

不过言归正传，Jellyfin 也支持服务端对视频文件编解码，包括开启服务器硬件加速，开启转码后就可以在客户端选择不同的视频质量进行传输与播放。

我尝试过实时转码和硬件加速配置，这和服务器所使用的处理器相关，由于群晖 220+ 服务器的 CPU 性能一般，虽然[官网](https://www.intel.com/content/www/us/en/products/sku/197307/intel-celeron-processor-j4025-4m-cache-up-to-2-90-ghz/specifications.html)显示支持 Quick Sync Video，但实测开启硬件加速会让 NAS 服务器卡到无法运行，最终放弃。可见服务端实时转码非常消耗硬件资源，商用媒体平台必须做相应的硬件配置规划，而个人服务器受硬件限制较多，这部分会在我尝试成功后再分享出来。

还是那句话，就家庭使用场景，直出才是最低成本高质量的选择。

### 安装与配置注意事项
Jellyfin 和配套软件安装在 NAS 服务器，分为两个 Docker 项目进行管理，直接贴上 Docker Compose：

```yaml
---
version: '3'

services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin-core
    restart: unless-stopped
    network_mode: "host"
    environment:
      - PGID=1000
      - PUID=1000
      - LOG_LEVEL=debug
      - TZ=Asia/Shanghai
    ports:
      - 8096:8096
    volumes:
      - /xxx/MediaCenter/apps/jellyfin/config:/config
      - /xxx/MediaCenter/apps/jellyfin/cache:/cache
      - /xxx/MediaCenter/data/media:/media
```

```yaml
---
version: '3'

services:
  jellyseerr:
    image: fallenbagel/jellyseerr:latest
    container_name: media-jellyseerr
    environment:
        - LOG_LEVEL=debug
        - TZ=Asia/Shanghai
    ports:
        - 5055:5055
    volumes:
        - /xxx/MediaCenter/apps/jellyseerr/config:/app/config
    restart: unless-stopped

  transmission:
    image: linuxserver/transmission:latest
    container_name: media-transmission
    networks:
      macvlan_66:
        ipv4_address: 192.168.51.2
    restart: unless-stopped
    ports:
      - 9091:9091
      - 51413:51413
      - 51413:51413/udp
    environment:
      - PGID=1000
      - PUID=1000
      - TZ=Asia/Shanghai
      - USER=admin
      - PASS=xxxxxx
    volumes:
      - /xxx/MediaCenter/apps/transmission/config:/config
      - /xxx/MediaCenter/apps/transmission/watch:/watch
      - /xxx/MediaCenter/data/downloads:/data/downloads

  jackett:
    image: linuxserver/jackett:latest
    container_name: media-jackett
    restart: unless-stopped
    ports:
      - 9117:9117
    environment:
      - PGID=1000
      - PUID=1000
      - TZ=Asia/Shanghai
    volumes:
      - /xxx/MediaCenter/apps/jackett:/config

  radarr:
    image: linuxserver/radarr:latest
    container_name: media-radarr
    restart: unless-stopped
    ports:
      - 7878:7878
    environment:
      - PGID=1000
      - PUID=1000
      - TZ=Asia/Shanghai
    volumes:
      - /xxx/MediaCenter/apps/radarr:/config
      - /xxx/MediaCenter/data:/data

  sonarr:
    image: linuxserver/sonarr:latest
    container_name: media-sonarr
    restart: unless-stopped
    ports:
      - 8989:8989
    environment:
      - PGID=1000
      - PUID=1000
      - TZ=Asia/Shanghai
    volumes:
      - /xxx/MediaCenter/apps/sonarr:/config
      - /xxx/MediaCenter/data:/data

networks:
  macvlan_66:
    external: true
```

在安装配置方面**最需要注意的是媒体目录的设计与挂载**，sonarr 和 radarr 需要在 transmission 和 jellyfin 媒体目录中进行文件监控与操作，因此目录全量挂载便于软件配置并开展文件处理工作，**推荐结构**如下：

```
└── MediaCenter
    ├── apps
    │   ├──jellyfin
    │   ├──jellyseerr
    │   ├──sonarr
    │   ├──radarr
    │   ├──jackett
    │   └──transmission
    └── data
        ├──media
        │   ├──movies
        │   └──tv
        └──downloads
            ├──complete
            └──incomplete
```

Radarr 容器挂载了 MediaCenter/data 目录，源文件（downloads/complete/）和目标文件（media/movies/）在容器内属于同一磁盘卷，这样就能够开启硬链接代替文件复制，可以减少磁盘空间占用

![radarr-hardlink]({{site.cdnroot}}/assets/img/radarr-hardlink.png)

Radarr 媒体根目录与 Jellyfin 影片目录是同一个，这样就保证了 Radarr 在创建影片目录、下载完影片资源、按规则重命名、建立硬链接后自动完成媒体库的新增，Jellyfin 只需要定时完成元数据刮削即可，Sonarr 同理

![radarr-root]({{site.cdnroot}}/assets/img/radarr-root.png)

另外，我使用 Macvlan 为 Transmission 设置独立 IP，主要的作用是方便为其配置代理直连规则，由于 NAS 在机场后面，我可不想流量全部用在影片的下载上面。

其他参考：[https://zerodya.net/self-host-jellyfin-media-streaming-stack/](https://zerodya.net/self-host-jellyfin-media-streaming-stack/)

