const gulp = require('gulp'),
      browsersync = require('browser-sync'),
      params = require('./params');

const OUTPUT_DIRNAME = params.OUTPUT_DIRNAME;

// 指定したファイルが更新された時にリロードしてくれる
gulp.task('server', function(){
  browsersync.create()
    .init({
      server: {
        baseDir: OUTPUT_DIRNAME
      },
      files: [OUTPUT_DIRNAME + '/*']
    });
});
