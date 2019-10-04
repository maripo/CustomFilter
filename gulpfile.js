'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');

const pug = require('gulp-pug');

sass.compiler = require('node-sass');

gulp.task('sass', function () {
  return gulp.src('./scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./extension/css'));
});

gulp.task('pug', () => {
  return gulp.src(['./pug/**/*.pug'])
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('./extension/'));
});
gulp.task('default', gulp.series(
  gulp.parallel('pug', 'sass'),
  (onFinish)=>{
    console.log("Done.");
    onFinish();
  })
);
