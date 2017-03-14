const gulp = require('gulp'),
      mocha = require('gulp-spawn-mocha'),
      params = require('./params');

const OUTPUT_DIRNAME = params.OUTPUT_DIRNAME;

// テストを実行
gulp.task('test:spec.js', function(){
  let targets = OUTPUT_DIRNAME + '/**/controller.spec.js';
  // let targets = OUTPUT_DIRNAME + '/**/*.spec.js';
  let node_path = './' + OUTPUT_DIRNAME + '/src/';
  return gulp
    .src(targets, {read: false})
    .pipe(mocha({env: {'NODE_PATH': node_path}}))
    .on('error', () => { process.exit(0); });
});
