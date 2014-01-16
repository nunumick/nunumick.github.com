---
layout: post
title: 使用grunt管理jekyll博客
category: frontend
tags:
    - grunt
    - jekyll
---

自从使用了 jekyll ，我就一直用它来构建自己的博客，然后把页面托管在 github.com 上，很是方便。

不过 github 为了安全考虑，没有支持 jekyll 的插件 _plugin，但有些插件我们是很需要的，比如分类、标签插件，你很难想象没有这类索引插件的博客是什么样子，我觉得 github 应该开放这类插件，遗憾的是至少目前没有开放。

我的做法是先在本地使用插件构建好静态文件提交到 github，我猜很多人也是这样的。比如分类插件，jekyll 会调用插件在 _site 目录下构建出一个 categories 目录，里面是所有分类的索引文件，然后我再手动把 categories 目录拷贝到根目录，之后 git 提交，所有工作都是手动完成，有够蛋疼。

### 使用grunt自动构建

众所周知，grunt 是很赞的自动化任务构建工具，可以很方便的管理自己的项目。我尝试用 grunt 让搭建 jekyll 博客更智能化，主要用到

* grunt-contrib-copy
* grunt-contrib-clean
* grunt-contrib-watch
* grunt-shell-spawn

这几个任务模块。

设置Gruntfile：

{% highlight javascript %}
module.exports = function(grunt){
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      clean: ['categories'],
      copy:{
        jekyll: {
          src:'_site/categories',
          dest:'./'
        }
      }
      shell: {
        jekyll:{
          command: 'jekyll build',
          options: {
            async: false
          }
        }
      },
      watch: {
        jekyll: {
          files: ['_posts/*.md','_posts/**/*.md','_layout/*.html', '_includes/*.html'],
          tasks: ['clean','shell:jekyll','copy:jekyll']
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['clean','shell:jekyll','copy:jekyll']);
  grunt.registerTask('git', ['default','shell:git-ci','shell:git-push']);
}
{% endhighlight %}

每次更新博客只需在命令行敲入：

{% highlight html %}
  grunt watch
{% endhighlight %}

之后只管自己写文章、更新、保存，每有动作，grunt 就会自动调用 jekyll 构建文章和分类，并且还能自动完成原本需要我手动操作的繁琐工作，是不是更方便了。

