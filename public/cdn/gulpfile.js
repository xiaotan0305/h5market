var gulp = require('gulp'),
    // css压缩
    minifycss = require('gulp-minify-css'),
    // js压缩
    uglify = require('gulp-uglify'),
    // 文件、目录清理
    clean = require('gulp-clean'),
    // 文件合并
    concat = require('gulp-concat'),
    // 目录区分
    yargs = require('yargs').argv;
// 到js一级
var j = 'js/';
// src 一级
var s = 'js/src/';
// css 一级
var c = 'css/';

// 最终地址
var url = '';
// 判断传入的参数
if (yargs.j) {
    if (typeof yargs.j !== 'boolean') {
        url = j + yargs.j;
    }else {
        url = j;
    }
}else if (yargs.s) {
    if (typeof yargs.s !== 'boolean') {
        url = s + yargs.s;
    }else {
        url = s;
    }
}else if (yargs.c) {
    url = c;
}else {
    url = '';
}
console.log('最终gulp路径：' + url);
// 设置路径
var path = {
    pluginJs: [
        'js/sea/sea.js',
        'js/sea/config.js',
        'js/jquery/2.1.1/jquery.js',
        'js/jquery/jquery.transit.min.js',
        'js/plugin/weixinshare.js',
        'js/plugin/hammer.min.js',
        'js/plugin/snabbt.js'
    ],
    previewJs: [
        'js/src/preview/eleAnimation.js',
        // 'js/src/preview/shape.js',
        'js/src/preview/tools.js',
        'js/src/preview/page.js',
        'js/src/preview/card.js',
        'js/src/preview/preloader.js',
        'js/src/preview/pageeffect.js',
        'js/src/preview/main.js'
    ],
    adminJs: 'js/src/**/*.js',
    build: 'build/'
};

// 样式处理
gulp.task('styles', function () {
    'use strict';
    return gulp.src(url.indexOf('.css') !== -1 ? url : url + '/**/*.css').
        // 压缩 css文件
        pipe(minifycss()).
        // 输出至文件夹
        pipe(gulp.dest(path.build + 'css/'));
});

// adminjs处理
gulp.task('adminJs', function () {
    'use strict';
    return gulp.src(url.indexOf('.js') !== -1 ? url : url + '/**/*.js').
    pipe(uglify()).
    pipe(gulp.dest(path.build + 'js/'));
});
// 插件脚本处理
gulp.task('pluginJs', function () {
    'use strict';
    return gulp.src(path.pluginJs).
        pipe(uglify()).
        // 合并文件
        pipe(concat('p.js')).
        pipe(gulp.dest('js'));
});
// 项目脚本合并处理
gulp.task('previewJs', function () {
    'use strict';
    return gulp.src(path.previewJs).
        pipe(uglify()).
        // 合并文件
        pipe(concat('m.js')).
        pipe(gulp.dest('js'));
});
// 清理
gulp.task('clean', function () {
    'use strict';
    return gulp.src([path.build, 'js/p.js', 'js/m.js', '!' + path.image], {read: false}).
        pipe(clean());
});
// 预设任务
gulp.task('default', ['clean'], function () {
    'use strict';
    if (url) {
        gulp.start('styles','previewJs', 'pluginJs','adminJs');
    }else {
        gulp.start('previewJs', 'pluginJs');
    }

});