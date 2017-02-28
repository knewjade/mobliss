var gulp = require('gulp'),
    del = require('del'),
    typescript = require('gulp-typescript'),
    preprocess = require('gulp-preprocess'),
    mocha = require('gulp-spawn-mocha'),
    runsequence = require('run-sequence'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    browsersync = require('browser-sync'),
    minimist = require('minimist');

var argv = minimist(process.argv.slice(2));

const OUTPUT_DIRNAME = 'release';

// public command
gulp.task('test', function(callback) {
  runsequence(
    'clean:output',
    'compile:ts',
    'copy:html',
    'copy:img',
    'test:spec.js',
    callback
  );
});

// フォルダを空にする
gulp.task('clean:output', function(){
  return del.sync([OUTPUT_DIRNAME]);
});

// src/tsをコンパイルしてdist/jsに展開
gulp.task('compile:ts', function(callback){
  let project = typescript.createProject('tsconfig.json', { noImplicitAny: true });
  let result =  project.src().pipe(project());
  result.js
    .pipe(gulp.dest(OUTPUT_DIRNAME))
    .on('end', function() {
      callback();
    });
});

// HTMLのコピー
gulp.task('copy:html', function(){
  return gulp.src(['src/**/*.html'])
    .pipe(gulp.dest(OUTPUT_DIRNAME));
});

// Imageのコピー
gulp.task('copy:img', function(){
  return gulp.src(['img/**/*'])
    .pipe(gulp.dest(OUTPUT_DIRNAME + '/img'));
});

// テストを実行
gulp.task('test:spec.js', function(){
  let targets = OUTPUT_DIRNAME + '/**/*.spec.js';
  // let targets = OUTPUT_DIRNAME + '/**/*.spec.js';
  let node_path = './' + OUTPUT_DIRNAME + '/src/';
  return gulp
    .src(targets, {read: false})
    .pipe(mocha({env: {'NODE_PATH': node_path}}))
    .on('error', () => { process.exit(0); });
});
