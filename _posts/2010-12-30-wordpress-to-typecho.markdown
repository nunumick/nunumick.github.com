---
layout: post
title: 博客转移到Typecho平台
categories:
    - blog
tags:
    - wordpress
    - typecho
    - php
    - htaccess
---

作为码农，崇尚简约是美，wordpress对于我来说显的过于笨重，很多功能用不上，不需要，界面繁杂不友好。加之godaddy的空间速度慢如乌龟，博客页面更是不堪重负。看到朋友转移到简洁小巧的typecho，感觉很好，心里痒痒。

    Type，有打字的意思，博客这个东西，正是一个让我们通过打字，在网络上表达自己的平台。
    Echo，意思是回声、反馈、共鸣，也是PHP里最常见、最重要的函数，相信大部分PHP爱好者都是
    从echo ‘Hello,world!’;开始自己的PHP编程之路的。
    将这两个词合并在一起，就有了Typecho，我们期待着越来越多的人使用我们开发的程序，
    也期待着越来越多的人加入到开源的行列里。
    大家一起来，Typecho )))))))))))))))))))))

熟悉的hello,world，熟悉的echo，typecho的名字就充满了php的味道，甚是诱人。

前不久，我的新博客地址<a href="http://nunumick.me">nunumick.me</a>开张，正是转移平台的好时机，于是我利用中午休息时间做了转移，整个过程用时很短，typecho不愧是轻量级的。

由于godaddy空间apache配置的不给力，typecho安装成功后一直无法访问除首页之外的其他页面，费了我不少力气。

幸好有互联网和搜索引擎，仅仅靠copy和paste一些现成的代码就解决了难题：
在blog根目录 index.php 的 Typecho_Plugin::factory('index.php')->begin(); 这行前面加上
{% highlight php %}
$baseInfo = @explode('?', $_SERVER['REQUEST_URI'], 2);
if (is_array($baseInfo))
{
        $_SERVER['REQUEST_URI'] = $_SERVER['REQUEST_URI'];
        $_SERVER['PATH_INFO'] = $baseInfo[0];
        unset($_GET);
        if ($baseInfo[1])
        {
                $getInfo = @explode('&', $baseInfo[1]);
                foreach ($getInfo as $v)
                {
                        $getInfo2 = @explode('=', $v);
                        $_GET[$getInfo2[0]] = $getInfo2[1];
                }
        }
}
{% endhighlight %}

如果启用了伪静态，则还需要修改 .htaccess 文件：
{% highlight php %}
RewriteEngine On
RewriteBase /
RewriteRule index(\.)php/(.*) /index.php?/$2 [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.php?/$1 [L]
{% endhighlight %}

如果不是很明白htaccess的语法规则，可以参考<a href="http://nunumick.me/blog/2010/12/03/htaccess-syntax.html">htaccess语法教程</a>

OK，成功进入后台，恢复数据，自定义设置，感受typecho的简洁和亲切，国人就应该支持国人的产品！

Enjoy!
