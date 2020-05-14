const gulp = require('gulp');

const postcss = require('gulp-postcss');

const pxtorem = require('postcss-pxtransform');

// vant px---> rpx   node_modules/postcss-pxtransform/index.js  

gulp.task('css', function () {



  const processors = [

    pxtorem({

      platform: 'weapp',

      designWidth: 750,

    })

  ];



  return gulp.src(['miniprogram_npm/@vant/weapp/**/*.wxss'])

    .pipe(postcss(processors))

    .pipe(gulp.dest('miniprogram_npm/@vant/weapp/'));

});