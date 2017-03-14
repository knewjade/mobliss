const gulp = require('gulp'),
      shell = require('gulp-shell'),
      params = require('./params');

const OUTPUT_DIRNAME = params.OUTPUT_DIRNAME;

gulp.task('s3:deploy', shell.task([
  'aws s3 sync ' + OUTPUT_DIRNAME + ' s3://mobliss',
]));
