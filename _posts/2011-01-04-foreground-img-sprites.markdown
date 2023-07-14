---
layout: post
title: '前端优化技巧之img sprites'
category: css
tags:
    - sprites
---

### 背景知识：

<a href="http://www.alistapart.com/articles/sprites" target="_blank">css sprites</a>是前端开发必须掌握的一项优化技巧，此技巧的意义常被作为基础题放入面试环节。可以这么说：不知道css sprites的前端不是好前端。

html:
{% highlight html %}
<div class="sample">某某示例</div>
{% endhighlight %}

css:
{% highlight css %}
.sample{
    height:50px;
    width:50px;
    overflow:hidden;
    background:url(../sprites/img-sprites.png) no-repeat -50px -10px;
    line-height:99em;
}
{% endhighlight %}
而img sprites可以说是css sprites的变种，此技巧的使用最早可以追溯到<a href="http://learningtheworld.eu/2007/foreground-sprites/" target="_blank">2007</a>年，主要用于提升网页的可用性。img sprites与css sprites两者原理上基本是一致的，区别在于img sprites把css样式表中的背景图挪到了<img>标签中

html:

{% highlight html %}
<div class="sample">
    <img src="../sprites/img-sprites.png" alt="某某示例" />
</div>
{% endhighlight %}

css:
{% highlight css %}
.sample{
    height:50px;
    width:50px;
    overflow:hidden;
}
.sample img{
    margin:-10px 0 0 -50px;
}
{% endhighlight %}

还可以<a href="http://www.kavoir.com/2009/01/extended-css-sprites-for-foreground-images-img.html" target="_blank">使用clip属性来控制图片显示区域</a>

那么，使用img sprites有哪些好处呢？

### 一、img sprites 的优势：

**1.支持windows高对比度显示模式**

windows用户如果把显示设置成高对比度模式，则在一些特定浏览器下(Opera)，<a href="http://www.artzstudio.com/2010/04/img-sprites-high-contrast/" target="_blank">css sprites就会显的面目全非</a>，而img sprites可以避免此类问题。

**2.打印终端友好**

css sprites背景图无法被打印，而img sprites则可以，这一点我力挺img sprites。

**3.SEO友好**

使用img sprites，搜索爬虫可以抓到网页中的图片，只需要给图片加上相应的alt注释，用户也可以理解搜索到的图片。

**4.顺序加载**

浏览器的渲染和操作顺序大致如下：

1. HTML解析完毕。
2. 外部脚本和样式表加载完毕。
3. 脚本在文档内解析并执行。
4. HTML DOM 完全构造起来。
5. 图片和外部内容加载。
6. 网页完成加载。

需要注意一点是：背景图和普通图片还不一样，背景图要比普通图片加载的顺序来的靠后，这有一篇<a href="http://ons.javaeye.com/blog/687850" target="_blank">实验性文章</a>可以说明这一点，而换成img sprites则可以按照实际的顺序进行加载。

**5.语义化**

该是图片的时候就是图片，比如LOGO，比如网站介绍性图片

**6.提升可用性**

当用户禁用图片时，至少可以通过alt注释知道网页要讲些什么

### 二、img sprites 的劣势：

1. 图片过大时会阻塞网页加载进度
2. 右键另存为图片，会将整张sprites图下载到电脑里
3. 开发成本比css sprites要高，需要权衡性价比

其实css sprites在1、2两方面多少也存在着同样的问题。

### 三、如何权衡

1. 图片较大或是纯修饰图片的，用css sprites会更好一些
2. 有具体意义的图片或者需要较快出现图片或者需要照顾特殊用户群体和打印终端的，采用img sprites则会更好
3. 在一些较重要的图片，如网站LOGO，我认为更适合做单独的一张图片，css sprites和img sprites两者都不用。虽然多了一个HTTP请求，换之带来的是对用户体验和SEO的友好。

