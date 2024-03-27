---
layout: post
title: 有趣的兼容性测试-iframe文档对象获取
categories: front-end
tags:
    - iframe
    - browser
    - compatibility
    - html
    - javascript
---

前日对iframe的几种文档对象获取方式做了测试，发现一些有趣现象！

假设在页面嵌入如下iframe:
{% highlight html %}
<iframe id="testFrame" name="testFrame" src="#" frameborder="0" border="0" scrolling="no" style="display:none"></iframe>
{% endhighlight %}

众所周知，iframe是内嵌窗口，我们可以通过多种方式获取iframe对象及其window\document对象（同域前提），不过哪些是哪些有时会搞不清，测试目的也是为了加深记忆。

比较常见的方法有以下几种，分别测试：

* A:document.getElementById(‘testFrame’)
* B:window.frames['testFrame'];
* C:document.getElementById(‘testFrame’).contentWindow

测试结果(非IE浏览器及IE8)
<img src="http://nunumick.me/lab/201003/2010-03-05_235442.png" />

从测试结果及其比对结果可以看出，A得到的是iframe这个html标签对象，B和C得到的是iframe浏览器对象(window)，有意思的是IE7及以下版本浏览器认为这两者是不恒等的


测试结果(IE7&IE6-)
<img src="http://nunumick.me/lab/201003/2010-03-05_235720.png" />

有趣吧，从B==C可以看出，证明两者是同一类型及同一引用，参考设计规范，理应恒等（===）。只能说，M$遵循的不是规范，是寂寞！好在IE8现在已经玩不起寂寞了。


接着测试浏览器对contentDocument的支持情况：

* D:window.frames['testFrame'].document
* E:document.getElementById(‘testFrame’).contentWindow.document
* F:document.getElementById(‘testFrame’).contentDocument

测试结果(非IE浏览器及IE8):
<img src="http://nunumick.me/lab/201003/2010-03-05_235507.png" />

测试结果表明:D和E得到的是同一对象，IE7及以下版本浏览器不支持contentDocument属性

测试结果(IE7&IE6-)
<img src="http://nunumick.me/lab/201003/2010-03-05_235805.png" />

在使用contentDocument属性时需要考虑兼容性：
{% highlight javascript %}
function getFrameDocument(frame){
    return frame && typeof(frame)=='object' && frame.contentDocument || frame.contentWindow && frame.contentWindow.document || frame.document;
}
{% endhighlight %}

调整后的测试结果(IE7&IE6-)：
<img src="http://nunumick.me/lab/201003/2010-03-05_235821.png" />

附：<a href="http://nunumick.me/lab/201003/iframe_content.html" target="_blank">测试页面</a>


