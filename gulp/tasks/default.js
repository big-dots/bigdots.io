var gulp = require('gulp');
var connect = require('connect');
var serveStatic = require('serve-static');
var gutil = require('gulp-util');

gulp.task('default', function() {
  gulp.start('watch');
  gulp.start('browserify');
});
