---
layout: post
title: 度量页面速度的几项指标
category: web
tags:
    - wpo
    - JavaScript
---

###1.TTFB(Time to First Byte)

TTFB-首字节时间，顾名思义，是指从客户端开始和服务端交互到服务端开始向客户端浏览器传输数据的时间（包括DNS、socket连接和请求响应时间），是能够反映服务端响应速度的重要指标。
<img src="http://www.nunumick.me/uploads/201102/ttfb.png" />


网页重定向越多，TTFB越高，所以要减少重定向
<img src="http://www.nunumick.me/uploads/201102/ttfb_redirect.png" />


####TTFB优化：

1. <a href="https://developer.yahoo.com/performance/rules.html#dns_lookups" target="_blank">减少DNS查询</a>
1. <a href="https://developer.yahoo.com/performance/rules.html#cdn" target="_blank">使用CDN</a>
1. <a href="https://developer.yahoo.com/performance/rules.html#flush" target="_blank">提早Flush</a>
1. <a href="https://developer.yahoo.com/performance/rules.html#expires" target="_blank">添加周期头</a>

###2.TTSR(Time to Start Render)

TTSR-开始渲染时间，指某些非空元素开始在浏览器显示时的时间，这也是一项重要指标，即TTSR越短，用户越早浏览器中的内容，心理上的等待时间会越短。过多的CPU消耗会拖慢TTSR，所以网站中有大量图片和脚本往往会造成不良用户体验。
<img src="http://www.nunumick.me/uploads/201102/ttsr.png" />


####TTSR优化：

1. 优化TTFB
1. 降低客户端CPU消耗，即页面加载初期不要有大脚本运行，<a href="https://developer.yahoo.com/performance/rules.html#js_bottom" target="_blank">把JS脚本放到页面下方</a>
1. 使用效率较高的CSS选择器，<a href="https://developer.yahoo.com/performance/rules.html#css_expressions" target="_blank">避免使用CSS表达式</a>
1. <a href="https://developer.yahoo.com/performance/rules.html#no_filters" target="_blank">避免使用CSS滤镜</a>

####前端TTSR测试脚本：
{% highlight html %}
    <head>
        <script>
            (function(){
                var timeStart = + new Date,
                    limit = 1,
                    timer = setInterval(function(){
                    if((document.body&&document.body.scrollHeight > 0) || (limit++ == 500)){
                        clearInterval(timer);
                        console.info('TTSR:',+ new Date - timeStart,';duration:',limit);
                    }
                },10);
            })()
        </script>
    </head>
{% endhighlight %}

在页面端无法简单测试出具体的TTSR，不过可以通过模拟脚本得到大概的时间，Firefox提供了一个<a href="https://developer.mozilla.org/en/Gecko-Specific_DOM_Events" target="_blank">MozAfterPaint</a>事件，经测试，用于TTSR并不准确，如果有MozBeforePaint事件该有多好。

###3.TTDC(Time to Document Complete)

TTDC-文档完成时间，指页面结束加载，可供用户进行操作的时间，等价于浏览器的onload事件触发点。TTDC是比较重要的性能优化对象，TTDC越低，页面加载速度越快，用户等待时间越短。
<img src="http://www.nunumick.me/uploads/201102/ttdc.png" />

####TTDC优化：

1. 优化TTFB
1. 优化TTSR
1. 参考<a href="https://developer.yahoo.com/performance/rules.html" target="_blank">YSLOW优化最佳实践</a>
1. 优化首屏时间，将不必要的页面加载放到onload事件之后

####TTDC前端测试：
常见性能测试平台大多使用IE浏览器的<a href="http://msdn.microsoft.com/en-us/library/aa768329(v=vs.85).aspx" target="_blank">DocumentComplete</a>事件来度量TTDC，DocumentComplete事件触发时，页面的状态应是READYSTATE_COMPLETE，所以在页面中我们可以用JS脚本判断：
{% highlight javascript %}
    var win = window,doc = document;
    if(win.attachEvent || doc.hasOwnProperty('onreadystatechange')){
        doc.onreadystatechange = function(){
            if(doc.readyState == 'complete'){
                /**
                 * test
                    do something...
                 */
            }
        }
    }else{
        win.addEventListener('load',function(){
            /**
             * test
                do something...
             */
        },false);
    }
{% endhighlight %}

###4.TTFL(Time to Fully Loaded)

TTFL-完全加载时间，指页面在onload之前和onload事件之后额外加载的内容所花费的时间的总和，即页面完完全全加载完毕消耗的总时间。
<img src="http://www.nunumick.me/uploads/201102/ttfl.png" />

####TTFL优化：

1. 优化TTFB
1. 优化TTSR
1. 优化TTDC
1. 延迟加载
1. 异步加载
1. 按需加载

