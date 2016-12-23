var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    es = require('event-stream'),
    watchify = require('watchify');

gulp.task('browser-sync', function() {
  browserSync.init({
    proxy: "localhost:5000"
  });
});

var reload = browserSync.reload;
gulp.task('browserify', function() {
  var b = watchify(browserify({
    entries: ['./public/scripts/index.js'],
    extensions: ['.js'],
    paths: ['./node_modules', 'public/scripts'],
    debug: true
  }));
  b.transform(["babelify", { presets: ["es2015"] }]);
  b.on('update', bundle);

  function bundle() {
    return b.bundle()
      .on('error', function(err){
        gutil.log(err.message);
        this.emit('end');
      })
      .pipe(source('index.js'))
      .pipe(buffer())
      .pipe(rename({ basename: 'bundle' }))
      .pipe(gulp.dest('./public/dist'))
      .pipe(reload({stream:true}));
  }

  return bundle();
});
