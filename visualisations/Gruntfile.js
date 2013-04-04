/*global require:true, module:false*/
module.exports = function (grunt) {
  'use strict';

  // For livereload
  var path = require('path');
  var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

  var folderMount = function folderMount(connect, point) {
    return connect['static'](path.resolve(point));
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    connect: {
      livereload: {
        options: {
          port: 7770,
          base: 'app',
          middleware: function (connect, options) {
            return [lrSnippet, folderMount(connect, options.base)];
          }
        }
      }
    },

    sass: {
      dist: {
        files: {
          'app/css/main.css': 'app/sass/main.scss'
        }
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['lib/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      jshintrc: '.jshintrc',
      gruntfile: {
        src: ['Gruntfile.js']
      },
      js: {
        src: ['app/js/*.js', 'test/**/*.js']
      }
    },
    regarde: {
      // gruntfile: {
      //   files: ['<%= jshint.gruntfile.src %>'],
      //   tasks: ['jshint']
      // },
      html: {
        files: 'app/index.html',
        tasks: ['livereload']
      },
      css: {
        files: 'app/sass/*.scss',
        tasks: ['sass', 'livereload']
      },
      js: {
        files: '<%= jshint.js.src %>',
        tasks: ['jshint', 'livereload']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.loadNpmTasks('grunt-regarde');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-livereload');

  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('default', ['livereload-start', 'connect', 'regarde']);

};
