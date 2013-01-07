module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.initConfig({
    watch: {
      self: {
        files: '<%= jshint.all %>',
        tasks: ['jshint', 'simplemocha']
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'package.json', 'lib/**/*.js', 'test/**/*.js', 'test/**/*.json']
    },
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'list'
      },
      all: {
        src: "test/**/*.js"
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'simplemocha']);
};
