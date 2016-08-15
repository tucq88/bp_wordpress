'use strict';

var $ = require('gulp-load-plugins')();
var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

var path = {
  app: {
    pages: 'app/',
    scripts: "app/assets/scripts/",
    styles: "app/assets/styles/",
    images: "app/assets/images/",
    fonts: "app/assets/fonts/",
    partials: "app/partials/"
  },
  build: {
    pages: 'build/',
    scripts: "build/assets/scripts/",
    styles: "build/assets/styles/",
    images: "build/assets/images/",
    fonts: "build/assets/fonts/",
    partials: "build/partials/"
  },
  wp: {
    pages: './',
    scripts: "./assets/scripts/",
    styles: "./assets/styles/",
    images: "./assets/images/",
    fonts: "./assets/fonts/",
    partials: "./partials/"
  },
  domain: ""
};

/**
 * Individual Tasks
 */
gulp.task('styles', function () {
  return gulp.src(path.app.styles + '*.scss')
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sass({outputStyle: 'expanded', precision: 10}).on('error', $.sass.logError))
    .pipe($.autoprefixer('last 2 version'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(path.app.styles))
    .pipe(browserSync.stream({match: "**/*.css"}))
});

gulp.task('styles.wp', function () {
  return gulp.src(path.wp.styles + '*.scss')
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sass({outputStyle: 'expanded', precision: 10}).on('error', $.sass.logError))
    .pipe($.autoprefixer('last 2 version'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(path.wp.styles))
    .pipe(browserSync.stream({match: "**/*.css"}))
});

//Serve for HTML
gulp.task('html', function () {
  browserSync({
    server: {
      baseDir: "app"
      // routes: {
      //   "../assets/vendor": "./assets/vendor"
      // }
    }
  });

});

//Serve for PHP
gulp.task('php', function () {
  $.connectPhp.server({
    base: 'app',
    port: 8000,
    keepalive: false
  }, function () {
    browserSync({
      proxy: 'localhost:8000',
      host: '21welding.local'
    });
  });

});

//Serve WP
gulp.task('wp', function () {
  browserSync({
    proxy: '21welding.wp',
    host: '21welding.wp'
  });

});

gulp.task('copy:pages', function () {
  return gulp.src(path.app.pages + '*.php')
    .pipe(gulp.dest(path.build.pages));
});

gulp.task('copy:scripts', function () {
  return gulp.src(path.app.scripts + '/**/*')
    .pipe(gulp.dest(path.build.scripts));
});

gulp.task('copy:styles', function () {
  return gulp.src(path.app.styles + 'main.css')
    .pipe(gulp.dest(path.build.styles));
});

gulp.task('copy:images', function () {
  return gulp.src(path.app.images + '**/*')
    .pipe(gulp.dest(path.build.images));
});

gulp.task('copy:fonts', function () {
  return gulp.src(path.app.fonts + '**/*')
    .pipe(gulp.dest(path.build.fonts));
});

gulp.task('copy:partials', function () {
  return gulp.src(path.app.partials + '**/*')
    .pipe(gulp.dest(path.build.partials));
});

gulp.task('min:images', function () {
  return gulp.src(path.build.images + '**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest(path.build.images))
});

gulp.task('min:images.wp', function () {
  return gulp.src(path.wp.images + '**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest(path.wp.images))
});

gulp.task('useref', function () {
  return gulp.src(path.app.partials + '*.php')
    .pipe($.useref())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe(gulp.dest(path.build.partials));
});

gulp.task('useref.wp', function () {
  return gulp.src(path.wp.pages + '*.php')
    .pipe($.useref())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe(gulp.dest(path.wp.pages));
});

gulp.task('cleanup', function () {
  return gulp.src(path.build.partials + 'assets/**/*')
    .pipe(gulp.dest(path.build.pages + 'assets/'));
});

gulp.task('remove', function () {
  del(path.build.partials + 'assets');
});

/**
 * Serve Dev
 */
gulp.task('serve', function (cb) {
  runSequence(
    'styles',
    'php',//or just html
    cb
  );

  //Watch
  gulp.watch(path.app.styles + "**/*.scss", ['styles']);
  gulp.watch(path.app.scripts + "**/*.js").on('change', browserSync.reload);
  gulp.watch("app/**/*.html").on('change', browserSync.reload);
  gulp.watch("app/**/*.php").on('change', browserSync.reload);

});

/**
 * Serve WP
 */
gulp.task('serve.wp', function (cb) {
  runSequence(
    'styles.wp', // styles | styles.wp
    'wp',// html | php | wp
    cb
  );

  //Watch
  gulp.watch(path.wp.styles + "**/*.scss", ['styles.wp']);
  gulp.watch(path.wp.scripts + "**/*.js").on('change', browserSync.reload);
  gulp.watch("./**/*.html").on('change', browserSync.reload);
  gulp.watch("./**/*.php").on('change', browserSync.reload);

});

/**
 * Build Production
 */
gulp.task('build', ['styles', 'copy:pages', 'copy:scripts', 'copy:styles', 'copy:fonts', 'copy:images', 'min:images'], function (cb) {
  runSequence(
    'useref',
    'cleanup',
    'remove',
    cb
  );
});

gulp.task('build.wp', ['styles.wp', 'min:images.wp'], function(cb) {
  runSequence(
    'useref.wp',
    cb
  );
});

//TODO
// - Add lint JS/SCSS
// - Add support for Wordpress