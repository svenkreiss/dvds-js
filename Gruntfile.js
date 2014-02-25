module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/**\n' +
  ' * <%= pkg.name %>.js - v<%= pkg.version %> - build <%= grunt.template.today("yyyy-mm-dd HH:mm:ss") %>\n' +
  ' * Contributors: <%= pkg.contributors.join(", ") %>\n' +
  ' * Copyright (c) 2014 <%= pkg.author %>; <%= pkg.license %> license\n' +
  ' */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};