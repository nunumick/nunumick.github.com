---
layout: post
title: 如何以get方式传递表单action中的额外参数
category: html
tags:
    - form
---

###问题及背景

今天项目组的开发同学急冲冲地叫上我看一个他写的JS脚本，好端端的一个form提交时参数无法正常传递。代码是这样的
{% highlight html %}
<form method="get" name="xxx" id="xxx" action="uri?xxx=xxx&yyy=yyy" >
   <input name="zzz"  type="text" value="zzz" />
   <input id="submit" type="button" value="提交" />
</form>
<script>
   document.getElementById('submit').onclick = function(){
       var form = document.xxx;
       form.action = form.action +
           (form.action.indexOf('?') > -1 ? '&' : '?') + form.zzz.value;
       form.submit();
   }
</script>
{% endhighlight %}
其本意是在提交是要同时提交xxx、yyy、zzz三个参数，但最终提交的参数只有zzz，即uri只是 uri?zzz=zzz。

###分析

这是为什么呢？脚本没有问题呀，感觉方法也没什么问题，在调试了多次无果之后，我把注意点移到了form本身：在禁用了脚本之后，form同样只提交了zzz参数。

**最终查到原因是因为form使用了get方法。**

 <a href="http://www.w3.org/TR/REC-html40/" target="_blank">HTML 4.01 specification</a>的解释

    If the method is "get" - -, the user agent takes the value of action,
    appends a ? to it, then appends the form data set,
    encoded using the application/x-www-form-urlencoded content type.
    The user agent then traverses the link to this URI. In this scenario,
    form data are restricted to ASCII codes.

get方式是method的默认值，其方式是将form表单中的数据集值对组织到action中的uri之后，不过其组织方式是有讲究的：

1. uri在submit最后才进行组织
1. 在添加’?'时，uri中额外参数会被舍弃，接着只拼接表单内的域值
1. uri hash值会被保留:uri?xxx=xxx#here，#here会被保留

###改进

get方法需要传递额外参数时，可以选择在form表单内动态创建额外参数域，再提交
{% highlight html %}
<script>
   var oInput = document.createElement('input');
   var oForm = document.xxx;
   oInput.name = 'yyy';
   oInput.value = 'yyy';
   oForm.appendChild(oInput);
   oForm.submit();
</script>
{% endhighlight %}
当然，用post方式会更方便，看你如何选择
{% highlight html %}
<form method="post" name="xxx" id="xxx" action="uri?xxx=xxx&yyy=yyy" >
   <input name="zzz"  type="text" value="zzz" />
   <input id="submit" type="button" value="提交" />
</form>
{% endhighlight %}

###更多关于post和get的区别

####编码
HTML 4.01 specification指出，get只能向服务器发送ASCII字符，而post则可以发送整个<a href="http://www.w3.org/TR/REC-html40/references.html#ref-ISO10646" target="_blank">ISO10646</a>中的字符（如果同时指定<a href="http://www.w3.org/TR/REC-html40/interact/forms.html#adef-enctype" target="_blank">enctype</a>=”multipart/form-data”的话）。

注意get和post对应的enctype属性有区别。enctype有两个值，默认值为application/x-www-form-urlencoded，而另一个值multipart/form-data只能用于post。

####提交的数据的长度
HTTP specification并没有对URL长度进行限制，但是IE将<a href="http://support.microsoft.com/kb/208427/en-us" target="_blank">请求的URL长度限制为2083</a>个字符，从而限制了get提交的数据长度。测试表明如果URL超出这个限制，提交form时IE不会有任何响应。其它浏览器则没有URL的长度限制，因此其它浏览器能通过get提交的数据长度仅受限于服务器的设置。

而对于post，因为提交的数据不在url中，所以通常可以简单地认为数据长度限制仅受限于服务器的设置。

####缓存
由于一个get得到的结果直接对应到一个URI，所以get的结果页面有可能被浏览器缓存。而post一般则不能。

####引用和SEO
出于和上面相同的原因，我们可以用一个URI引用一个get的结果页面，而post的结果则不能，所以必然不能被搜索引擎搜到。

####使用场景
的<a href="http://www.w3.org/" target="_blank">W3C</a>官方建议是：当且仅当form是幂等（idempotent）的时候，才使用get，比如搜索结果。其他情况则使用post方式。

###参考文献
<a href="http://www.cs.tut.fi/~jkorpela/forms/methods.html" target="_blank">Methods GET and POST in HTML forms – what’s the difference?</a><br />
<a href="http://www.htmlhelp.com/faq/cgifaq.2.html#8" target="_blank">What is the difference between GET and POST?</a>
