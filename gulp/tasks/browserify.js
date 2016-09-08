
var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    uglify = require('gulp-uglify'),
    es = require('event-stream');

gulp.task('browserify', function() {
  var files = [
    'logged-in.js',
    'logged-out.js'
  ];

  var tasks = files.map(function(entry) {
    return browserify({
      entries: ['./public/scripts/' + entry],
      extensions: ['.js'],
      paths: ['./node_modules', 'public/scripts'],
      debug: true
    })
    .transform(["babelify", { presets: ["es2015"] }])
    .bundle()
    .on('error', function(err){
      gutil.log(err.message);
      this.emit('end');
    })
    .pipe(source(entry))
    .pipe(buffer())
    .pipe(rename({ extname: '.bundle.js' }))
    // .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/scripts/dist'));
  });

  return es.merge.apply(null, tasks);
});
