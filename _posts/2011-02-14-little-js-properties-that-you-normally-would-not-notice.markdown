---
layout: post
title: 容易被忽略的JS脚本特性
category: JavaScript
tags:
    - JavaScript
    - ECMA
---

###一、容易被忽略的局部变量
{% highlight javascript %}
    var a = 5;
    (function(){
       alert(a);
       var a = a ++;
       alert(a);
    })()
    alert(a);
{% endhighlight %}

思考这段代码的执行结果。<br />执行后，看看是否和你想象的一致？

ok，这段代码里核心的知识点是 var a = a++，其中两个变量 a 都是匿名函数内部的局部变量，是同一个，和全局变量 a 是不一样的。

为什么？我们来看看ECMA规范对变量声明语句的定义：

    Description
    If the variable statement occurs inside a FunctionDeclaration, the
    variables are defined with function-local scope in that function, as
    described in s10.1.3. Otherwise, they are defined with global scope
    (that is, they are created as members of the global object, as described
    in 10.1.3) using property attributes { DontDelete }. Variables are
    created when the execution scope is entered. A Block does not define a new
    execution scope. Only Program and FunctionDeclaration produce a new
    scope. Variables are initialised to undefined when created. A variable with
    an Initialiser is assigned the value of its AssignmentExpression when the
    VariableStatement is executed, not when the variable is created.

声明中提到：进入作用域环境后，变量就会被创建，并赋予初始值undefined。在变量声明语句执行时才会把赋值表达式的值指派给该变量，而并不是在该变量被创建时。

因此上面的代码可以等价于:

{% highlight javascript %}
    var a;
    a = 5;
    (function(){
       var a;
       alert(a);
       a = a ++;
       alert(a);
    })()
    alert(a);
{% endhighlight %}
这样应该会更容易理解了。

###二、容易被忽略的全局变量

{% highlight javascript %}
    (function(){
       var a = b = 5;
    })()
    alert(b);
{% endhighlight %}
这是玉伯几天前分享到的知识点，蛮有意义的，在此也做个分析。

首先，考虑执行结果为什么是：5。

ok,原因出在 var a = b = 5 这句。

为深入分析这个语句，我们继续要参照ECMA规范对声明语句的定义：
var a = b = 5;等同为 var a; a = b = 5;两条语句，后者是赋值表达式，其在ECMA中的定义是这样的：

    Simple Assignment ( = )
    The production AssignmentExpression : LeftHandSideExpression =
    AssignmentExpression is evaluated as follows:
    1. Evaluate LeftHandSideExpression.
    2. Evaluate AssignmentExpression.
    3. Call GetValue(Result(2)).
    4. Call PutValue(Result(1), Result(3)).
    5. Return Result(3).

对于a = b = 5;先执行左边表达式 a，这是一个标识符表达式，根据规范第 10.1.4，其执行方式如下：

    During execution, the syntactic production PrimaryExpression : Identifier
    is evaluated using the following algorithm:
    1. Get the next object in the scope chain. If there isn't one, go to step 5.
    2. Call the [[HasProperty]] method of Result(1), passing the Identifier as
    the property.
    3. If Result(2) is true, return a value of type Reference whose base
    object is Result(1) and whose property name is the Identifier.
    4. Go to step 1.
    5. Return a value of type Reference whose base object is null and whose
    property name is the Identifier.

搜寻作用域链，找到最近的一个 a 的引用，很明显，在匿名函数内部作用域就可以找到，于是变量 a 确定下来。
接着再执行右边的表达式 b = 5 ，还是一个赋值表达式，重复赋值规则第一步，因为变量 b 在匿名函数环境内未声明过，所以接着去 window 全局环境下去找 window.b ，被隐式声明为全局变量，最后赋值为 5，根据规则第五步，表达式的结果也会再赋值给 a。最终达到 a 和 b 都为 5 ，区别是 a 是局部变量，而 b 是全局变量。

我们再来理一下 (function(){var a = b = 5})() 表达式内部整体的执行顺序：

    1. 匿名函数内创建变量a;
    2. 赋予初始值undefined;
    3. 取得变量a的引用;   //a
    4. 取得变量b的引用;   //window.b
    5. 对数字5求值;
    6. 赋值5给b的引用：window.b;
    7. 返回b = 5的结果5给a的引用：a;
    8. 返回a = 5的结果5；

很明显，中间的一个步骤使得变量 b 被声明为全局变量，明白之后，我们不难找到代码的优化点：只需将变量 b 显式声明为局部变量：

{% highlight javascript %}
    (function(){
       var a,b;
       a = b = 5;
    })()
{% endhighlight %}
