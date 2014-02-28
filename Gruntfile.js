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
        src: ['src/dvds.js','src/visualize.js'],
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    jscs: {
      src: "src/*.js",
      options: {
        "requireSpaceAfterKeywords": [
          "if","else","for","while","do","switch","return","try","catch"
        ],
        "requireParenthesesAroundIIFE": true,
        "disallowSpacesInsideObjectBrackets": true,
        "disallowSpacesInsideArrayBrackets": true,
        "disallowSpaceAfterObjectKeys": true,
        "requireCamelCaseOrUpperCaseIdentifiers": true,
        "validateLineBreaks": "LF",
        "validateIndentation": "\t",
        "disallowTrailingWhitespace": true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks("grunt-jscs-checker");

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};