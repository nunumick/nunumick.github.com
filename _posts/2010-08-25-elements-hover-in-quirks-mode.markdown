---
layout: post
title: doctype与hover伪类
category: html
tags:
    - doctype
    - hover
    - browser
---

开发过程中将demo中的内容拆分进各子模块，发现之前好好的 hover 效果失效了，我排查的结果是因为在模块中没有定义doctype，页面默认使用 quirks mode，会导致非链接&lt;a&gt;标签的 hover 伪类在 IE7/8 和 firefox 均失去效果。

我们通常认为的非 IE6 以下浏览器都支持链接以外元素的 hover 伪类，其实还需要依赖 doctype，比如这样的代码就在 IE7/8 和 firefox 失去效果：
{% highlight html %}
<html>
    <head>
        <style>
        .hover-test:hover{color:#f00;}
    </style>
    </head>
    <body>
        <a class="hover-test" href="#">hover字体变红</a>
        <p class="hover-test">hover字体变红,Quirks mode下失效</p>
    </body>
</html>
{% endhighlight %}
从<a href="http://msdn.microsoft.com/en-us/library/ee371281(v=Expression.30).aspx" target="_blank">MSDN</a>找到相关说法：

    Internet Explorer 7 and later, in standards-compliant mode (strict
    !DOCTYPE), can apply the :hover pseudo-class to any element, not merely
     links.

而 Firefox 与 IE 也有区别，Firefox 下用标签名作为选择器可以使 hover 伪类恢复效用：
{% highlight html %}
<html>
    <head>
        <style>
        p.hover-test:hover{color:#f00;}
        </style>
    </head>
    <body>
        <a class="hover-test" href="#">hover字体变红</a>
        <p class="hover-test">hover字体变红</p>
    </body>
</html>
{% endhighlight %}

#### 延伸阅读
<a href="http://nunumick.me/blog/2010/01/html5-doctype-and-img-space.html" target="_blank">html5 doctype与图片多余空白</a>
