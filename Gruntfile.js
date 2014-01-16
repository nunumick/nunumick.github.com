module.exports = function(grunt){
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      clean: ['categories'],
      copy:{
        categories: {
          expand: true,
          cwd: '_site/',
          src:'categories/**',
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
        gitadd:{
          command: 'git add -A',
          options:{
            async:false
          }
        },
        gitci:{
          command: 'git ci -m "update pages"',
          options:{
            async:false
          }
        },
        gitpush:{
          command: 'git push origin master',
          options:{
            async:false
          }
        }
      },
      watch: {
        jekyll: {
          files: ['_posts/*.md','_posts/**/*.md','_layout/*.html', '_includes/*.html'],
          tasks: ['default']
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('copycat', ['copy:categories']);
  grunt.registerTask('default', ['clean','shell:jekyll','copy:categories']);
  grunt.registerTask('git', ['default','shell:gitadd','shell:gitci','shell:gitpush']);
}
