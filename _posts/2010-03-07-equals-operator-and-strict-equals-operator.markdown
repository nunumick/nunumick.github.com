---
layout: post
title: JavaScript等同(==)与恒等(===)运算符
category: javascript
tags:
    - javascript
    - operator
---

Javascript开发中，需要与0,undefined,null,false进行等同比较时，我们知道，用’===’(恒等)比较靠谱，我是在第一次使用jslint时知道这点的，例如在Jslint中验证
{% highlight javascript %}
var test = '';
alert(test==0);
{% endhighlight %}

会得到提示：
{% highlight javascript %}
Use '===' to compare with '0'
{% endhighlight %}

看看ECMA规范中是如何对==和===操作符进行定义的，了解其深层的规则和jslint提示的缘由

#### 首先介绍==
11.9.1 等同运算符( == )

    运算符规则如下所示：
    1. 计算运算符左侧表达式;
    2. 对第1步的结果调用GetValue;
    3. 计算运算符右侧表达式;
    4. 对第1步的结果调用GetValue;
    5. 对第4步的结果与第2步结果执行比对（参考 11.9.3）;
    6. 返回第5步结果;

#### 再来详细了解比对过程(11.9.3)
11.9.3 抽象的等同比对算法

    假设有 x,y 进行比较 ，则有 x == y;
    1. 如果xy类型不同，转至第14步;
    2. 如果xy类型均为Undefined，返回 true;
    3. 如果xy类型均为Null，返回 true;
    4. 如果xy类型均不是Number(数值类型)，转至第11步;
    5. 如果x的值为NaN，返回 false;
    6. 如果y的值为NaN，返回 false;
    7. 如果x与y的数值相同，返回 true;
    8. 如果x是+0并且y是−0，返回 true;
    9. 如果x是−0并且y是+0，返回 true;
    10. 返回 false.
    11. 如果xy类型均为String(字符串类型)，判断x与y是否有相同的字符（对应位置字符相同），是则返回 true，否则返回 false;
    12. 如果xy类型均为Boolean(布尔类型)，xy均为true或均为false则返回 true，否则返回 false;
    13. 如果x与y引用同一个对象(object)或者xy引用的对象是Joined关系（参考13.1.2）则返回 true，否则返回 false;
    14. 如果x为null且y为undefined，返回 true;
    15. 如果x为undefined且y为null，返回 true;
    16. 如果x类型为Number，y类型为String，先将y转换为Number类型，再进行比对，返回结果;
    17. 如果x类型为String，y类型为Number，先将x转换为Number类型，在进行比对，返回结果;
    18. 如果x类型为Boolean，先将x转换为Number类型，再进行比对，返回结果;
    19. 如果y类型为Boolean，先将y转换为Number类型，再进行比对，返回结果;
    20. 如果x类型是String或者Number且y类型为Object，先将y转换为基本类型(ToPrimitive)，再进行比对，返回结果。
    21. 如果x类型为Object且y类型为String或者Number，先将x转换为基本类型(ToPrimitive)，再进行比对，返回结果。
    22. 返回 false.

#### 接着看恒等运算符（===）
11.9.4 严格等同运算符( === )

    运算符规则如下所示：
    1. 计算运算符左侧表达式;
    2. 对第1步的结果调用GetValue;
    3. 计算运算符右侧表达式;
    4. 对第1步的结果调用GetValue;
    5. 对第4步的结果与第2步结果执行比对（参考 11.9.6）;
    6. 返回第5步结果;

#### 这几步和==运算符是一样的，我们着重来看第5步的比对过程：
11.9.6 严格性等同运算比对算法

    假设有 x,y 进行比较 ，则有 x === y;
    1.如果xy类型不相同，返回 false;
    2. 如果xy类型均为Undefined，返回 true;
    3. 如果xy类型均为Null，返回 true;
    4. 如果xy类型均不是Number(数值类型)，转至第11步;
    5. 如果x的值为NaN，返回 false;
    6. 如果y的值为NaN，返回 false;
    7. 如果x与y的数值相同，返回 true;
    8. 如果x是+0并且y是−0，返回 true;
    9. 如果x是−0并且y是+0，返回 true;
    10. 返回 false.
    11. 如果xy类型均为String(字符串类型)，判断x与y是否有相同的字符（对应位置字符相同），是则返回 true，否则返回 false;
    12. 如果xy类型均为Boolean(布尔类型)，xy均为true或均为false则返回 true，否则返回 false;
    13. 如果x与y引用同一个对象(object)或者xy引用的对象是Joined关系（参考13.1.2）则返回 true，否则返回 false;

#### 可以做如下概括：
==运算符在做比对时存在类型转换的可能，而===运算符只在同类型之间比对，是==的严格模式。

1. 类型相同：进行===比对。
2. 类型不同：基本类型Boolean、Number、String这三者之间做比较时，总是向Number进行类型转换，然后再比较；如果类型有Object，那么将Object转化成基本类型，再进行比较；null仅和undefined匹配；其他都为false。

根据规范和概括，我们不难明白：

1. undefined只等于(==)undefined或null，null亦然
1. 空字串(”) == 0 == false ，因为Number(”),Number(false) : 0
1. true == 1 ，因为Number(true) : 1
1. false===0 一定返回flase ，因为类型不同

**恒等必定等同，等同未必恒等，需择之而用！**

### 延伸阅读
<a href="http://www.jibbering.com/faq/faq_notes/type_convert.html#tcNumber" target="_blank">Javascript Type-Conversion</a>

