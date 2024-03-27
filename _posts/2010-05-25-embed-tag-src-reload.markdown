---
layout: post
title: Embed标签src重载
category: front-end
tags:
    - embed
    - flash
    - browser
    - compatibility
    - html
---
&lt;embed&gt;标签可用于在页面内嵌入 flash 文件，比较常见的就是在页面内嵌入视频，如：
{% highlight html %}
<embed src="http://player.youku.com/player.php/sid/XMTU3NzUyMDUy/v.swf" quality="high" width="480" height="400" allowscriptaccess="sameDomain" type="application/x-shockwave-flash"></embed>
{% endhighlight %}
接到一个小需求：需要动态更新 embed 标签的 src 属性，拿上面的代码为例，很容易找到思路：

1. 获取embed标签
2. setAttribute('src')

类似于对待 img 标签。

遗憾的是，此法对于 ie 浏览器并不奏效，给 src 加上时间戳也无济于事。

最后无奈用更新dom节点的方式才得以实现。

各浏览器在处理 embed 重载时并不尽相同，在此简单做了测试：<a href="http://nunumick.me/lab/201005/embed.html" target="_blank">Demo</a>

#### 测试结果：
Y：响应重载
N：不响应重载
<table width="100%" border="1" cellspacing="0" cellpadding="0">
<tbody><tr>
<td width="40%">&nbsp;</td>
<td align="center">IE(6/7/8)</td>
<td align="center">Firefox</td>
<td align="center">Chrome</td>
<td align="center">Safari</td>
<td align="center">Opera</td>
</tr>
<tr>
<td>重载(refresh movie)</td>
<td align="center">N</td>
<td align="center">Y</td>
<td align="center">N</td>
<td align="center">N</td>
<td align="center">Y</td>
</tr>
<tr>
<td>更换(change movie)</td>
<td align="center">N</td>
<td align="center">Y</td>
<td align="center">N</td>
<td align="center">N</td>
<td align="center">Y</td>
</tr>
<tr>
<td>Display显示/隐藏</td>
<td align="center">N</td>
<td align="center">Y</td>
<td align="center">Y</td>
<td align="center">Y</td>
<td align="center">Y</td>
</tr>
<tr>
<td>Visibility显示/隐藏</td>
<td align="center">N</td>
<td align="center">N</td>
<td align="center">N</td>
<td align="center">N</td>
<td align="center">N</td>
</tr>
<tr>
<td>设置innerHTML</td>
<td align="center">Y</td>
<td align="center">Y</td>
<td align="center">Y</td>
<td align="center">Y</td>
<td align="center">Y</td>
</tr>
<tr>
<td>Display hide &gt; Change movie &gt; Display show</td>
<td align="center">N</td>
<td align="center">Y</td>
<td align="center">Y</td>
<td align="center">Y</td>
<td align="center">Y</td>
</tr>
</tbody></table>
