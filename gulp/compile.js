const gulp = require('gulp'),
      typescript = require('gulp-typescript'),
      params = require('./params');

const OUTPUT_DIRNAME = params.OUTPUT_DIRNAME;

// src/tsをコンパイルしてdist/jsに展開
gulp.task('compile:ts', function(callback){
  let project = typescript.createProject('tsconfig.json', { noImplicitAny: true });
  let result = project.src().pipe(project());
  result.js
    .pipe(gulp.dest(OUTPUT_DIRNAME))
    .on('end', function() {
      callback();
    });
});
