'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');

const pug = require('gulp-pug');
const pugI18n = require('gulp-i18n-pug');

sass.compiler = require('node-sass');

gulp.task('sass', function () {
  return gulp.src('./scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./extension/css'));
});

gulp.task('pug', () => {
  return gulp.src(['./pug/**/*.pug', '!**/layout*'])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('./extension/'));
});

gulp.task('pugI18n', () => {
  var options = {
    i18n: {
      verbose: true,
      dest: './extension/',
      locales: './pug-locale/*.*'
    },
    pretty: true
  };
  return gulp.src(['./pug-i18n/**/*.pug', '!**/layout*', '!**/includes/*'])
  .pipe(pugI18n(options))
  .pipe(gulp.dest(options.i18n.dest));
});
gulp.task('default', gulp.series(
  gulp.parallel('pug', 'pugI18n','sass'),
  (onFinish)=>{
    console.log("Done.");
    onFinish();
  })
);
