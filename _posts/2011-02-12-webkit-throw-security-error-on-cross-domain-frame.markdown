---
layout: post
title: Webkit的跨域安全问题
category: javascript
tags:
    - webkit
    - crossdomain
    - javascript
    - browser
---

在使用try catch处理iframe跨域产生的异常时，chrome和safari浏览器似乎不能正常运作：他们直接抛出了错误而没有抛出可供JS截获的异常。这里有个简单的<a href="http://nunumick.me/lab/x-domain/webkit-test.html" target="_blank">测试页面</a>：IE、火狐弹出"hello world"，而chrome,safari,opera毫无反应。

以下是小段测试代码（刻意修改domain，让父页面和子页面为不同域页面）：

1.父页面代码：
{% highlight html %}
<script>
    document.domain = "nunumick.me";
    function doTest(){
        alert('hello world');
    }
</script>
<iframe src="http://www.nunumick.me/lab/x-domain/webkit-test.html">
</iframe>
{% endhighlight %}
2.子页面代码：
{% highlight html %}
<script>
    try{
        top.name;
    }catch(e){
        document.domain = 'nunumick.me';
        top.doTest();
    }
</script>
{% endhighlight %}
以上代码目的是尝试在访问异常时动态修改domain达到顺利访问，但webkit内核浏览器粗暴地报错而非抛出可截获的异常，其他浏览器均如期运行。

chrome错误信息：

![chrome error](/assets/img/chrome-error.png)

据了解，采用此类try catch方式做安全可行性判断的并不只是个别现象，如<a href="http://svn.dojotoolkit.org/src/dojo/trunk/hash.js" target="_blank">DOJO</a>
{% highlight javascript %}
try{
    //see if we can access the iframe's location
    //without a permission denied error
    var iframeSearch = _getSegment(iframeLoc.href, "?");
    //good, the iframe is same origin (no thrown exception)
    if(document.title != docTitle){
        //sync title of main window with title of iframe.
        docTitle = this.iframe.document.title = document.title;
    }
}catch(e){
    //permission denied - server cannot be reached.
    ifrOffline = true;
    console.error("dojo.hash: Error adding history
    entry. Server unreachable.");
}
{% endhighlight %}

再如<a href="http://dev.ckeditor.com/browser/FCKeditor/trunk/fckeditor.js#L167:" target="_blank">FCKeditor</a>
{% highlight javascript %}
try{
if ( (/fcksource=true/i).test( window.top.location.search ) )
   sFile = 'fckeditor.original.html' ;
}
catch (e) { /* Ignore it. Much probably we are insi
de a FRAME where the "top" is in another domain (security error). */
}
{% endhighlight %}

还有很多网友的反馈：<a href="http://crbug.com/17325" target="_blank">chrome bug report</a>

以上代码在chrome,safari,opera均不适用。

从webkit开发人员的讨论消息中看到，他们承认这个问题但并不情愿去改正，holly shit！

#### 延伸阅读
1. <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/history.html#security-location" target="_blank">html5 security location</a>
2. <a href="https://lists.webkit.org/pipermail/webkit-dev/2010-August/013880.html" target="_blank">webkit dev lists</a>
