module.exports = function(grunt){
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      clean: ['_config.yml','categories','tag','tags'],
      copy:{
        categories: {
          expand: true,
          cwd: '_site/',
          src:'categories/**',
          dest:'./'
        },
        tags: {
          files:[
            {expand: true,cwd: '_site/',src:'tags/**',dest:'./'},
            {expand: true,cwd: '_site/',src:'tag/**',dest:'./'}
          ]
        },
        localConfig:{
          expand: true,
          cwd: 'config',
          src: '_config_local.yml',
          dest:'./',
          rename : function(dest,src){
            return dest + '_config.yml';
          }
        },
        gitConfig:{
          expand: true,
          cwd: 'config',
          src: '_config.yml',
          dest:'./'
        }
      },
      shell: {
        jekyll:{
          command: 'jekyll build',
          options: {
            async: false
          }
        },
        jekyllDraft:{
          command: 'jekyll build --drafts',
          options: {
            async: false
          }
        },
        gitAdd:{
          command: 'git add -A',
          options:{
            async:false
          }
        },
        gitCi:{
          command: 'git ci -m "update posts by grunt"',
          options:{
            async:false
          }
        },
        gitPush:{
          command: 'git push origin master',
          options:{
            async:false
          }
        }
      },
      tps:{
        options: {
          argv: "--inplace"
        },
        all: ['img/*.png']
      },
      watch: {
        jekyll: {
          files: ['_posts/*.md','_posts/**/*.md','css/*.css','_layout/*.html', '_includes/*.html', 'config/*.yml'],
          tasks: ['default']
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-tps');

  grunt.registerTask('default', ['clean','copy:localConfig','shell:jekyll','copy:categories','copy:tags']);
  grunt.registerTask('draft', ['clean','copy:localConfig','shell:jekyllDraft','copy:categories','copy:tags']);
  grunt.registerTask('git', ['clean','copy:gitConfig','shell:jekyll','copy:categories','copy:tags','shell:gitAdd','shell:gitCi','shell:gitPush']);
  grunt.registerTask('tps',['tps']);
}
