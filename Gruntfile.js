module.exports = function(grunt){
  var nwjsIncludes = ['./dist/package.json', './dist/**'];

  // parse packages file and include all listed components
  var packages = grunt.file.readJSON('./package.json');

  // include additional needed packages for production
  for (var k in packages.dependencies) {
    nwjsIncludes.push('./node_modules/' + k + '/**');
  }

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    bwr: grunt.file.readJSON('bower.json'),

    bump: {
      options: {
        files: ['package.json', 'bower.json', 'src/config.json'],
        updateConfigs: ['pkg', 'bwr'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['.'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin master',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
        regExp: false
      }
    },

    watch: {
      jshint: {
        files: [
          'Gruntfile.js',
          'src/app/**/*.js',
          '!node_modules/**/*.js',
          '!bower_components/**/*.js'
        ],
        tasks: ['jshint', 'jscs']
      },
      jsonlint: {
        files: ['package.json'],
        tasks: ['jsonlint']
      }
    },

    jshint: {
      options: {
        jshintrc: true,
      },
      src: ['src/app/**/*.js', '!node_modules/**/*.js', '!bower_components/**/*.js'],
    },

    jscs: {
      options: {
        config: '.jscsrc',
      },
      src: ['src/app/**/*.js', '!node_modules/**/*.js', '!bower_components/**/*.js'],
    },

    jsonlint: {
      config: {
        src: ['package.json']
      }
    },

    clean: {
      dist: {
        src: ['dist']
      },
      bin: {
        src: ['bin']
      },
      tmp: {
        src: ['bin/tmp']
      }
    },

    copy: {
      app: {
        files: [
          {expand: false, src: ['src/dist.html'], dest: 'dist/index.html', filter: 'isFile'}
        ]
      },
      assets: {
        expand: true,
        src: ['**/*', '!**/*.scss', '!**/sass/**', '!**/stylesheets/**', '!**/config.rb'],
        dest: 'dist/public',
        cwd: 'src/public'
      }
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/public/stylesheets/screen.css': [
            'src/public/stylesheets/reset.css',
            'src/public/stylesheets/base.css',
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'bower_components/bootstrap/dist/css/bootstrap-theme.css',
            'src/public/stylesheets/screen.css',
          ]
        }
      }
    },

    bowerRequirejs: {
      target: {
        rjsConfig: 'src/require.config.js',
        options: {
          baseUrl: './src/app'
        }
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'src/app',
          out: 'dist/app.js',
          name: 'app',
          include: ['app'],
          optimize: 'none',
          wrap: true,
          findNestedDependencies: true,
          fileExclusionRegExp: /^\./,
          inlineText: true,
          logLevel: 0,
          mainConfigFile: [
            './src/require.config.js',
            './src/app.js'
          ]
        }
      }
    },

    uglify: {
      requirejs: {
        src: 'bower_components/requirejs/require.js',
        dest: 'dist/require.js',
        compress: true
      },
      main: {
        src: 'dist/main.js',
        dest: 'dist/main.js'
      }
    },

    nwjs: {
      options: {
        cacheDir: (process.env.HOME || process.env.USERPROFILE) + '/cache/nwjs',
        platforms: ['osx', 'linux', 'win'],
        buildDir: './bin',
        version: 'v0.12.3',
        macIcns: 'src/public/assets/icon.icns',
        macZip: false,
        macPlist: {
          CFBundleIdentifier: '<%= pkg.id %>'
        }
      },
      build: nwjsIncludes
    },

    compress: {
      win64: {
        options: {
          archive: 'bin/tmp/<%= pkg.name %>.win.x64.zip'
        },
        files: [
          {src: ['**'], cwd: 'bin/<%= pkg.name %>/win64', dest: '.', expand: true}
        ]
      },
      linux64: {
        options: {
          archive: 'bin/tmp/<%= pkg.name %>.linux.x64.zip'
        },
        files: [
          {src: ['**'], cwd: 'bin/<%= pkg.name %>/linux64', dest: '.', expand: true}
        ]
      },
      osx64: {
        options: {
          archive: 'bin/tmp/<%= pkg.name %>.osx.x64.zip'
        },
        files: [
          {src: ['**'], cwd: 'bin/<%= pkg.name %>/osx64', dest: '.', expand: true}
        ]
      },
    },

    'ftp-deploy': {
      bin: {
        auth: {
          host: 'fabianirsara.com',
          port: 21,
          authKey: 'bin'
        },
        src: 'bin/tmp/',
        dest: '/bin/'
      }
    }

  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-nw-builder');
  grunt.loadNpmTasks('grunt-bower-requirejs');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask('copy-package', 'Exports package for nwjs into dist', function(){
    var pkg = grunt.file.readJSON('./package.json');
    pkg.devDependencies = {};
    pkg.debug = false;
    pkg.main = 'index.html';

    grunt.file.write('./dist/package.json', JSON.stringify(pkg));
  });

  grunt.registerTask('all', ['build', 'release']);
  grunt.registerTask('lint', ['jshint', 'jscs', 'jsonlint']);
  grunt.registerTask('build', ['lint', 'clean:dist', 'copy:app', 'copy:assets', 'cssmin', 'copy-package', 'requirejs', 'uglify']);
  grunt.registerTask('release', ['clean:bin', 'nwjs']);
  grunt.registerTask('deploy', ['clean:tmp', 'compress', 'ftp-deploy']);

  grunt.registerTask('default', ['all']);
};