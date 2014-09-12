---
layout: post
title: DOM 操作的性能优化
category: javascript
tags:
    - dom
---

我们都知道，DOM操作的效率是很低的，尤其是用JS操作DOM的时候，性能的优劣更是引发问题和争论的焦点。

这里我们先分析一个很简单的例子：

{% highlight html %}
<ul>
<li>1111</li>
<li>1111</li>
<li>1111</li>
<li>1111</li>
<li>1111</li>
<li>1111</li>
...
</ul>
{% endhighlight %}

假设我们要对上面的1000个或者更多的 li 元素进行抽样显示（隐藏）的控制，照常理来讲，我们会习惯性地去遍历这些元素，加上相应class，或者直接写上内联样式。至少在我看来这是最简单最高效的操作。然而 试验 结果却出乎我的意料，IE和firefox的显示结果都出奇的慢，去网上找了答案：这其实和文档的回流(reflow)很有关系，Nicholas总结了引起reflow的一些因素，其结论就是：

当对DOM节点执行新增或者删除操作时。 动态设置一个样式时（比如element.style.width="10px"）。 当获取一个必须经过计算的尺寸值时，比如访问offsetWidth、clientHeight或者其他需要经过计算的CSS值（在兼容DOM的浏览器中，可以通过getComputedStyle函数获取；在IE中，可以通过currentStyle属性获取）。文章地址是：

怿飞师父在他的 blog 里也有提到更详细的因素，有兴趣的可以再去深入研究。

当然我写这篇文章的目的不是去翻译 Nicholas 的文章或是照搬他们的理论，而是想分享下我 测试 的心得：

1. 现有主流浏览器对DOM的操作是各自为政的，IE&Chrome reflow过程很短或者说没有reflow，Firefox的reflow现象非常显著（脚本执行之后有很长时间去刷新DOM结构，而且是硬直时间），Opera次之。
2. reflow过程中浏览器无法响应用户的操作。
3. IE耗费的大部分时间是去获取DOM元素，比如在这个例子中我使用的是常规的getElementById方法，遍历获取元素的时候很耗费时间。而其他浏览器多半时间花在后续的DOM操作中。
4. 只添加class不做样式处理不会触发reflow,只更改背景样式也不会触发reflow。
5. Nicholas文中提到循环中的语句是会实时触发reflow的，但实际测试的结果是 reflow在执行环境结束之后才被触发, Dean Edwards 在其回复中也证实了这一点。
6. 同数量的DOM操作，appendChild方法比更改样式的方法高效很多，也就是说display:none引起的reflow消耗比DOM节点的新增或删除要严重（firefox中尤其明显）

综上几点，再回顾刚才的例子，更高效的方法是用appendChild方法去增加需显示的DOM节点，于是便有了最后的 优化措施：

1. 预存储UL下的所有LI元素
2. 获取需显示的LI列表
3. 删除整个UL元素，这里用的是UL父元素.removeChild(UL)，千万不要用innerHTML='',火狐里会挂的很惨。
4. 重建UL元素
5. 逐个添加步骤2获得的LI元素到UL
6. 添加UL到UL父元素。

这其中又有Fragment的问题，究竟什么时候该用Fragment？因为fragment仅仅是一个过渡容器，在本质上不能提升代码的效率。所以很简单，当你需要临时容器的时候就用fragment，当你不需要临时容器的时候就可以不用。上面的过程中UL的重建等于是一个fragment，直到所有的LI都添加进去，才append到文档中。上面的例子中，如果用ul.innerHTML = '',则可以创建一个fragment作为替身……

另：例子 中用到的是原生的DOM操作方法，如果用集成库的话性能上还可再优化一些。

#### 相关问题

一、appendChild和innerHTML的效率谁更高

appendChild和innerHTML的效率也是要分浏览器来考虑到，IE浏览器操作innerHTML的效率非常高，而FF和Opera会慢些，尤其是FF，当innerHTML内部元素很多的时候效率极低，毕竟innerHTML是IE首创并发扬光大的。所以可以这么讲：IE的innerHTML效率优于appendChild,而Firefox则是相反。使用的时候请权衡利弊。

二、display：none和fragment孰优孰劣

当display:none的元素较多时，用append方法的效率会更高。

