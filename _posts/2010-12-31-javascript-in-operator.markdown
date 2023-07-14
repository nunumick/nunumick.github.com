---
layout: post
title: JavaScript学习笔记-详解in运算符
category: javascript
tags:
    - javascript
    - operator
---

in运算符是javascript语言中比较特殊的一个，可以单独使用作为判断运算符，也常被用于for...in循环中遍历对象属性

### 一、判断

#### 语法

{% highlight javascript %}
prop in objectName
{% endhighlight %}
如果objectName指向的对象中含有prop这个属性或者键值，in运算符会返回true。

{% highlight javascript %}
var arr = ['one','two','three','four'];
arr.five = '5';
0 in arr;//true
'one' in arr; //false,只可判断数组的键值
'five' in arr;//true,'five'是arr对象的属性
'length' in arr;//true
{% endhighlight %}

#### 原型链

in运算符会在整个原型链上查询给定的prop属性

{% highlight javascript %}
Object.prototype.sayHello = 'hello,world';
var foo = new Object();
'sayHello' in foo;//true;
'toString' in foo;//true;
'hasOwnProperty' in foo;//true;
{% endhighlight %}

#### 对象与字面量

in运算符在对待某些特定类型（String,Number）的对象和字面量时显得不尽相同

{% highlight javascript %}
var sayHelloObj = new String('hello,world');
var sayHello = 'hello,world';
var numObj = new Number(1);
var num = 1;

'toString' in sayHelloObj; //true
'toString' in sayHello; //类型错误

'toString' in numObj;//true
'toString' in num;//类型错误
{% endhighlight %}
究其原因，在<a href="https://developer.mozilla.org/" target="_blank">MDN</a>找到这样一段关于<a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String" target="_blank">String</a>对象和字面量转换的介绍，似乎可以解释这个原因：

{% highlight html %}
Because JavaScript automatically converts between string primitives and String objects, you can call any of the methods of the String object on a string primitive. JavaScript automatically converts the string primitive to a temporary String object, calls the method, then discards the temporary String object. For example, you can use the String.length property on a string primitive created from a string literal
{% endhighlight %}
试着这样理解：因为in是运算符而非一个方法(method)，所以无法让string字面量自动转换成String对象，又因为in运算符待查询方不是对象而是一个字符串（按<a href="http://www.crockford.com/" target="_blank">老道Douglas</a>的说法，只是object-like的类型），所以报类型错误。

### 二、遍历

很常用到的for...in循环语句，此语句中的in需要遵循另外一套语法规范：
{% highlight javascript %}
for (variable in object)
statement
{% endhighlight %}
与单独使用in作为运算符不同，for...in循环语句只遍历用户自定义的属性，包括原型链上的自定义属性，而不会遍历内置(build-in)的属性，如toString。

#### 对象

{% highlight javascript %}
function Bird(){
    this.wings = 2;
    this.feet = 4;
    this.flyable = true;
}
var chicken = new Bird();
chicken.flyable = false;
for(var p in chicken){
    alert('chicken.' + p + '=' + chicken[p]);
}
{% endhighlight %}
String对象，经过测试Firefox,Chrome,Opera,Safari浏览器都是给出了注释中的结果，只有IE浏览器只给出'more'和'world'

{% highlight javascript %}
function Bird(){
var str = new String('hello');
str.more = 'world';
for(var p in str){
    alert(p);//'more',0,1,2,3,4
    alert(str[p]);//'world','h','e','l','l','o'
}
{% endhighlight %}

#### 字面量

遍历数组字面量的键值和属性
{% highlight javascript %}
var arr = ['one','two','three','four'];
arr.five = 'five';
for(var p in arr){
    alert(arr[p]);//'one','two','three','four','five'
}
{% endhighlight %}
遍历string字面量,虽说单独在string字面量前面使用in运算符会报类型错误，不过下面的代码却能够正常运行，此时IE浏览器是毫无声息

{% highlight javascript %}
var str = 'hello';
str.more = 'world';
for(var p in str){
    alert(p);//0,1,2,3,4
    alert(str[p]);//'h','e','l','l','o'
}
{% endhighlight %}

### 综上

ECMA虽然有这方面的规范，但浏览器之间还是存在着差异，鉴于此，并不推荐用for...in去遍历字符串，也不推荐拿去遍历数组（如例子所示，为数组加上自定义属性，遍历就会被搞乱）

在遍历对象方面，我们还可以使用对象的内置方法hasOwnProperty()排除原型链上的属性，进一步加快遍历速度，提升性能

{% highlight javascript %}
function each( object, callback, args ){
    var prop;
    for( prop in object ){
        if( object.hasOwnProperty( i ) ){
            callback.apply( prop, args );
        }
    }
}
{% endhighlight %}
