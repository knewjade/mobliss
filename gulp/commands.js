const gulp = require('gulp'),
      runsequence = require('run-sequence');

const shell = require('gulp-shell')

gulp.task('test', function(callback) {
  runsequence(
    'clean:output',
    'compile:ts',
    'test:spec.js',
    callback
  );
});

gulp.task('build', function(callback) {
  runsequence(
    'clean:output',
    'compile:ts',
    'copy:html',
    'copy:css',
    'copy:img',
    'copy:favicons',
    'browserify:js',
    'clean:build.post',
    callback
  );
});

gulp.task('watch', function(callback) {
  runsequence(
    'build',
    'server',     // 一度実行すれば、自動的に更新を監視してくれる
    'watch:build' // watchより前に実行するのは1度のみ
  );
});

gulp.task("watch:build", function() {
  var targets = [
    './**/*.ts',
  ];
  gulp.watch([
    'src/**/*.ts',
    'test/**/*.ts',
    'html/**/*.html',
    'css/**/*.css',
    'img/**/*.png',
  ], ['build']);
});

gulp.task('deploy', function(callback) {
  runsequence(
    'build',
    's3:deploy',
    callback
  );
});
