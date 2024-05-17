---
layout: post
title: 使用 Google 代码和 GTM 衡量网站效果
category: blog
tags:
    - gtag
    - gtm
    - ga4
---

博客网站用一套代码分别在国内站点和 Github站点进行部署，为了观测不同渠道的用户效果，需要在效果跟踪上进行区分。

关于网站效果分析，一直以来用的都是 Google Analytics，经历过早期的从 UA（Universal Analytics）到 [GA4](https://analytics.google.com/analytics/web/#) 的产品升级与迁移。埋点方法使用最新的 gtag.js，现已更名为 Google 代码（Google Tag）。

### Google 代码工作原理

> Google 代码 (gtag.js) 是可添加到网站中的一段代码，添加这一段代码后您即可使用各种 Google 产品和服务（例如，Google Ads、Google Analytics [分析]、Campaign Manager、Display & Video 360、Search Ads 360）。您可以在整个网站中使用该 Google 代码并将该代码关联到多个目标账号，而无需针对不同的 Google 产品账号管理多个代码。

GA4 的衡量 ID 本质上就是一个 gtag（格式：G-XXXX），每有一个需衡量的对象，就需要一个 gtag 与之匹配。

GA4 gtag 埋点部署代码片段：

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=TAG_ID"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'TAG_ID');
</script>
```

gtag() 方法负责注册衡量 ID，并将网站信息和行为事件传递给 GA4 服务进行分析。

### GTM

仅使用 gtag.js，如果 GA4 的衡量 ID（gtag）有变更，则需要我们手动修改埋点脚本的 TAG_ID。而有了 GTM，这一问题会得到有效改善。GTM 是个更加产品化的全局配置系统，负责动态管理和使用 gtag，将网站、tag、衡量目标之间的耦合解开，只需要在管理界面修改配置而无需修改埋点代码。

在概念上 GTM 是一种容器，用于包含 Google 代码，通过 GTM 的配置也可以实现数据采集和目标分析多对一或一对多，系统也会默认给 GTM 容器分配一个 Google 代码（格式：GT-XXXX），可用于直接和目标进行绑定。

![gtm]({{site.cdnroot}}/assets/img/gtm.jpg)

GTM 埋点代码，通过生成 GTM 容器，动态加载 gtag_id 和行为配置：
```html
<!-- Google Tag Manager -->
<script>
(function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-ID');
</script>
<!-- End Google Tag Manager -->
```

### 代码配置与效果跟踪

回到区分博客效果的衡量这一目标上，结合 GTM 的能力，最后配置如下：
1. GA4 使用同一个项目便于在一个视图看到全局效果
2. 为国内站和 github 镜像站分别建立数据源并分配衡量 ID（gtag）
    * 国内站：G-QEL89F4XE0
    * 镜像站：G-NHDRH3WFHQ
3. 分别申请两个 GTM 容器，加入衡量 ID Tag，并做好独立的埋点配置
    * 国内站：GTM-P5ZC8BVN -> G-QEL89F4XE0
    * 镜像站：GTM-T6GJZH7T -> G-NHDRH3WFHQ

总的来说国内站和镜像站作为独立个体设置，每个站点分配一个独立的 GTM 容器和 gtag（一对一），便于以后完全拆开来分析减少工作量。两个网站的数据流汇总到同一个 GA 项目，作为一个整体来分析效果。

![gtag]({{site.cdnroot}}/assets/img/gtag.jpg)

