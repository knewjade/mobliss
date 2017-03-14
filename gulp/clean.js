const gulp = require('gulp'),
      del = require('del'),
      params = require('./params');

const OUTPUT_DIRNAME = params.OUTPUT_DIRNAME;

// フォルダを空にする
gulp.task('clean:output', function(){
  return del.sync([OUTPUT_DIRNAME]);
});

// build終了後、必要のないファイルを削除
gulp.task('clean:build.post', function(){
  return del.sync([
    OUTPUT_DIRNAME + '/src',
    OUTPUT_DIRNAME + '/test'
  ]);
});
