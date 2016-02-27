---
layout: post
title: Javascript学习笔记-delete运算符
category: JavaScript
tags:
    - JavaScript
    - operator
---

关于javascript的delete运算符，<a href="https://developer.mozilla.org/en/JavaScript/Reference/Operators/Special_Operators/delete_Operator%20target=" target="_blank">MDN</a>里有相关文档。以下是我的学习笔记，更多是要关注特殊情况的使用和注意点。

###一、语法

delete后面的表达式必须给出一个属性的引用，比如
{% highlight javascript %}
var o = {a:1};
delete o.a; //此处o.a是对象o的属性a的引用
{% endhighlight %}

只有在with语句里才能使用单独的属性名
{% highlight javascript %}
with(o){
   delete a;
}
{% endhighlight %}

###二、delete的返回值

delete是普通运算符，会返回true或false。规则为：当被delete的对象的属性存在并且不能被删除时 返回false，否则返回true。 这里的一个特点就是，对象属性不存在时也返回true，所以返回值并非完全等同于删除成功与否。
{% highlight javascript %}
var o = {a:1};
delete o.a; //返回true
var b = 2;
delete b;//返回false，ECMA规则约定:使用var和function声明的变量不可以被delete 
{% endhighlight %}

###三、哪些情况下不允许delete


上例提到的var和function声明的变量不可以被delete，但隐式声明可以被删除
{% highlight javascript %}
function c(){return 12;}
delete c;//返回false
d = function(){return 12;}
delete d;//返回true
{% endhighlight %}

不能delete从原型链上继承的属性，但可以删除原型链上的属性
{% highlight javascript %}
function Foo(){}  
Foo.prototype.bar = 42;  
var foo = new Foo();  
delete foo.bar;           // 返回true,但并没有起作用 
alert(foo.bar);           // alerts 42, 属性是继承的
delete Foo.prototype.bar; // 在原型上删除属性bar 
alert(foo.bar);           // alerts "undefined", 属性已经不存在，无法被继承 
{% endhighlight %}

###四、特例

eval执行的代码中如有通过var和function声明的变量，可以被delete
{% highlight javascript %}
eval("var a=1");
delete a;
alert(a); //报未定义错误
{% endhighlight %}

如果声明是在eval执行代码中的闭包内进行的，则变量不能被delete
{% highlight javascript %}
eval("(function(){var a=1;delete a; return a;})()");//1
{% endhighlight %}

###五、delete 数组元素

从数组中delete其元素并不会影响数组的长度
{% highlight javascript %}
var arr = ['yuyin','suhuan','baby'];
delete arr[0];
alert(arr.length);//alert 3
{% endhighlight %}

被delete的键值已经不属于数组，但却还是可以被访问，其值为undefined。
{% highlight javascript %}
var arr = ['yuyin','suhuan','baby'];
delete arr[0];
0 in arr; // false
alert(arr[0]);//undefined
arr[0] === undefined;//true
{% endhighlight %}

对比直接将键值赋值undefined
{% highlight javascript %}
var arr = ['yuyin','suhuan','baby'];
arr[0] = undefined;
0 in arr; // true
alert(arr[0]);//undefined
arr[0] === undefined;//true
{% endhighlight %}

可以看出delete 操作只是将键值这个属性从数组中删除了，数组本身也是对象，这个情况好理解的。如果需要保留键值，可以用undefined赋值。
