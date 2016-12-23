var gulp = require('gulp');

gulp.task('default', function() {
  gulp.start('browser-sync');
  gulp.start('browserify');
});
