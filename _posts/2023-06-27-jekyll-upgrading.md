---
layout: post
title: Jekyll版本升级到4.x
category: web
tags:
    - jekyll
    - blog
    - github
---

博客多年时间后的又一次更新，源于发现页面代码过于陈旧，assets 资源引入还是 http 协议的，而 github 早就全站切到 https。其实原因是配置文件 _config.yml 里固定了博客 url，修改重新构建就行。不过安装了新版 jekyll，发现变化太大跑不起来……

### 升级印象

总体比较顺畅，基本上看看文档就行了，不过时间跨度&版本代差太大，现有文档也会缺少参考意义。

比较庆幸的是升级对 post 内容格式是兼容的，主要的改动在 plugins 的升级替换，引入方式有变化但不多。

尝试过想用新版的分类和tags，好像会影响原有的文章路径格式，会造成旧链接 404。所以最好还是采用 _plugins 插件，很可惜 github 因为安全策略仍然不支持自定义插件，最终采用的是 [github action](https://github.com/nunumick/jekyll-blog-archive-workflow){:target="_blank"} 构建来代替原来的[本地 grunt 构建](/blog/2014/01/16/use-grunt-with-jekyll.html){:target="_blank"}再同步。

jekyll serve 比之前更简便了。

### Archives 的支持

本地使用 jekyll-archives 插件，github 采用 [workflow](https://github.com/features/actions){:target="_blank"} 生成 archives [collections](https://jekyllrb.com/docs/collections/){:target="_blank"}。调整 permalink 保证两个环境可以得到一致的访问体验。

```yaml
# Local Archives
jekyll-archives:
  enabled:
    - categories
    - tags
  layouts:
    category: archive-categories-local
    tag: archive-tags-local
  permalinks:
    tag: /blog/tags/:name/
    category: /blog/categories/:name/

# Custom Archives for github
collections:
  archives:
    output: true
    permalink: /blog/:path/
```

### 其他必要步骤

bundle Gemfile 管理项目，安装依赖

```bash
gem install bundler jekyll
bundle init
bundle add jekyll
bundle add jekyll-paginate
bundle add jekyll-seo-tag
...
```

config.yml 配置变更，主要是

1. rdiscount -> kramdown
2. pygments -> rouge
3. http -> https

```yaml
markdown: kramdown
highlighter: rouge
plugins:
  - jekyll-seo-tag
  - jekyll-paginate

# Markdown Processors
kramdown:
  input             : GFM
  syntax_highlighter: rouge

url: 'https://nunumick.github.io'
```

最后删除陈旧的目录&文件，更新高亮样式

```bash
rougify style monokai.sublime > css/monokai.sublime.css
```

```html
<!-- assets.html -->
<link rel="stylesheet" href="{{ site.url }}/css/monokai.sublime.css" />
```

### troubleshoot

```bash
Conflict: The following destination is shared by multiple files.
          The written file may end up with unexpected contents.
```

构建时出现上述冲突告警信息，排查下来是因为文章分类构建目录时不区分大小写，文章分类设置中有字母大小写会造成文件写冲突。

```yaml
# post a
---
layout: post
category: javascript
---

# post b
---
layout: post
category: JavaScript
---
```

解决办法：全站统一使用小写命名规范，包括分类与标签。

另外，如果目录中存在同名的 .html 和 . markdown 文件，也会在构建时产生冲突。

如：

```bash
xxx目录
    - index.html
    - index.markdown
```


**参考链接**

1. [https://jekyllrb.com/docs/](https://jekyllrb.com/docs/){:target="_blank"}
2. [https://jekyllrb.com/docs/upgrading/3-to-4/](https://jekyllrb.com/docs/upgrading/3-to-4/){:target="_blank"}
3. [https://jekyllrb.com/docs/configuration/default/](https://jekyllrb.com/docs/configuration/default/){:target="_blank"}
4. [https://rubygems.org/pages/download](https://rubygems.org/pages/download){:target="_blank"}
5. [https://mademistakes.com/mastering-jekyll/site-url-baseurl/](https://mademistakes.com/mastering-jekyll/site-url-baseurl/){:target="_blank"}
6. [https://github.com/jekyll/jekyll-seo-tag/blob/master/docs/advanced-usage.md](https://github.com/jekyll/jekyll-seo-tag/blob/master/docs/advanced-usage.md){:target="_blank"}
7. [https://rouge-ruby.github.io/docs/file.Languages.html](https://rouge-ruby.github.io/docs/file.Languages.html){:target="_blank"}
