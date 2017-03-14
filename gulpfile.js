var gulp = require('gulp'),
    fs = require("fs");

const GULP_DIRECTORY = __dirname + "/gulp";

// gulp taskの読み込み
fs.readdirSync(GULP_DIRECTORY)
  .forEach(function(it){
    require(GULP_DIRECTORY + "/" + it);
  });
