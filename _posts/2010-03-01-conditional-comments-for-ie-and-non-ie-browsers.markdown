---
layout: post
title: 条件注释区分非IE浏览器
category: html
tags:
    - comment
    - compatibility
---

IE浏览器的条件注释虽不太常用，却异常强大，不仅可以用来区分IE浏览器版本

####仅IE6:
{% highlight html %}
<!--[if IE6]>
怎么该，怎么该……
<![endif]-->
{% endhighlight %}

####仅IE7:
{% highlight html %}
<!--[if IE7]>
怎么该，怎么该……
<![endif]-->
{% endhighlight %}

####还可以牛13滴用来区分非IE浏览器：
{% highlight html %}
<!--[if !IE]><-->
怎么该，怎么该……
<![endif]-->
{% endhighlight %}

猜想原理是条件注释后头的 &lt;–&gt; 在IE中被当作内部注释，而在非IE浏览器中会闭合之前的注释，从而起到区分非IE浏览器的作用，一般常用&lt;!–&gt;。

