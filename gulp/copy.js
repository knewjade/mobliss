const gulp = require('gulp'),
      params = require('./params');

const OUTPUT_DIRNAME = params.OUTPUT_DIRNAME;

// HTMLのコピー
gulp.task('copy:html', function(){
  return gulp.src(['html/**/*.html'])
    .pipe(gulp.dest(OUTPUT_DIRNAME));
});

// CSSのコピー
gulp.task('copy:css', function(){
  return gulp.src(['css/**/*'])
    .pipe(gulp.dest(OUTPUT_DIRNAME + '/css'));
});

// Imageのコピー
gulp.task('copy:img', function(){
  return gulp.src(['img/**/*'])
    .pipe(gulp.dest(OUTPUT_DIRNAME + '/img'));
});

// Faviconsのコピー
gulp.task('copy:favicons', function(){
  return gulp.src(['favicons/*'])
    .pipe(gulp.dest(OUTPUT_DIRNAME));
});
