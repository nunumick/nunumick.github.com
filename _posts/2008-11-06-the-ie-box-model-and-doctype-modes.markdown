---
layout: post
title: 文档类型对盒子模型的影响
category: front-end
tags:
    - html
    - doctype
---

在设计网页时，文档类型(DOCTYPE)的重要性经常被人忽略，以至于页面在不同浏览器中的表现不一致。文档类型的出现就是为了规范现有的浏览器表现，在不使用文档类型的情况下，IE会用原始的模式去渲染整个HTML文档，盒子模型在这种模式下会有很大的变化。

我们可以从下面的例子看到DOCTYPE对盒子模型的影响，可以说文档类型是一个HTML文档的基石，如果没有基石或者基石不稳，建立再宏伟的HTML大厦也是徒然。

设定 div 容器的样式如下：

{% highlight css %}
.win{
  padding:0 10px;/*左右padding各为10像素*/
  border:5px solid #ddd;/*边框为5*/
  width:200px;/*不使用文档类型，这个宽度就是总宽，而非内容宽度*/
}
{% endhighlight %}

我们期望的结果是：容器总宽度在 5x2 + 10x2 + 200 = 230px;

如果未设置文档类型，在IE浏览器下的效果为:

![](/assets/img/quirk-box.png)

DEMO: [怪癖模式下的IE盒模型](/demo/ie-box-model-quirk.html)

容器的总宽度为200px，显然并不是我们所期望的。

再看下设置了文档类型的情况：

![](/assets/img/normal-box.png)

DEMO: [设置文档类型后的IE盒模型](/demo/ie-box-model-doctype.html)

容器的总宽度为230px，这才是我们所期望的。

再使用IE内核之外的浏览器，比如FF查看这两个例子，可以发现总宽都是230像素。

为了盒子模型在各浏览器的表现一致，文档类型的声明在现代页面开发中是必需的。

------ 2014-09-12 更新 ------

IE9以上浏览器已经修复这个问题。
