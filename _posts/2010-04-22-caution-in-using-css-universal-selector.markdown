---
layout: post
title: 慎用通配符选择器
category: css
tags:
    - selector
    - compatibility
---

### 一、通配符选择器优先级低

{% highlight css %}
div{background:#f00}
*{background:#000}
{% endhighlight %}
前者优先级更高。

{% highlight css %}
*.hello{color:#f00}
.hello{color:#000}
{% endhighlight %}
两者优先级一样，后来至上。

### 二、通配符选择器样式污染

{% highlight css %}
#showEveryThing * {display:block}
{% endhighlight %}
将使 showEveryThing 内部所有元素显示为块元素，包括 &lt;style&gt; &lt;script&gt; &lt;noscript&gt;标签。这会破坏这些标签的本来面目，造成不必要的麻烦。

&lt;style&gt; &lt;script&gt; &lt;head&gt; 等元素本不可见，如果被强制加上样式，多多少少都会有问题。

#### 区别
1. IE
不会输出内容，但可以控制边框。
2. 非IE
基本可以当作普通元素对待，但不影响原有标签功能。如出现样式被修改情况，可以反方向重置。

因此，在使用通配符选择器时特别需要注意上下文环境，确认不会造成标签样式污染之后再使用

