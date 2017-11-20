/*
 * @Author: liyy
 * @Date:   2015/9/14
 * @description: h5market编辑页过滤器
 * @Last Modified by:   liyy
 * @Last Modified time: 2015-11-19
 */
(function () {
    'use strict';
    AppConfig.registerModule('fang.filter');
    var fangfil = angular.module('fang.filter');
    // 过滤像素，避免数据不规范引起bug
    fangfil.filter('addpx', function () {
        return function (e) {
            return 'auto' === e ? 'auto' : parseInt(e) + 'px';
        };
    });
    // 过滤角度值，避免数据不规范引起bug
    fangfil.filter('addrotate', function () {
        return function (e) {
            return parseInt(e) + 'deg';
        };
    });
    // 网址标识图大小重置,现在网页标识图最大宽度为99px
    fangfil.filter('sitelogopx', function () {
        return function (e) {
            console.log(e);
            var sw = parseInt(e);
            if (sw > 94) {
                sw = 94;
            }
            return sw + 'px';
        };
    });
    // 编辑块位置重置
    fangfil.filter('editlayer', function () {
        return function (e) {
            return parseInt(e - 25) + 'px';
        };
    });
    // 文本编辑块位置重置
    fangfil.filter('texteditlayertop', function () {
        return function (e) {
            return parseInt(e / 2) + 'px';
        };
    });
    // 图片地址过滤
    fangfil.filter('imgurl', ['Config', function (Config) {
        return function (imgurl) {
            if (imgurl) {
                // 将判断imgurl的地址规则改为以http开头的的地址
                if (/(\/\/cdn[n|s]\.soufunimg\.com)|(\/\/img\w{0,3}\.soufunimg\.com)|(\/\/(js|static)\.soufunimg\.com)|(\/\/\w+\.soufunimg\.com\/h5)/.test(imgurl)) {
                    return imgurl;
                }
                return Config.pictureServer + imgurl;
            }
        };
    }]);
    // 我的模板封面图片
    fangfil.filter('coverUrl', ['Config', function (Config) {
        return function (coverUrl) {
            if (coverUrl) {
                return coverUrl;
            }
            return Config.pictureServer + 'loadingpic.jpg';

        };
    }]);
    // 按钮地址过滤
    fangfil.filter('button_url', ['Config', function (Config) {
        return function (t) {
            return 'url(' + Config.pictureServer + 'button/' + t + ')';
        };
    }]);
    fangfil.filter('opacity', function () {
        return function (e) {
            return (100 - e) / 100;
        };
    });
    fangfil.filter('center', ['$rootScope', function ($rootScope) {
        return function (t) {
            return t * $rootScope.bgScale;
        };
    }]);
    // 字数限制
    fangfil.filter('limitstring', function () {
        return function (e) {
            if (e) {
                return e.length > 5 ? e.substr(0, 3) + '...' : e;
            }
        };
    });
    // 字体粗细限制
    fangfil.filter('fontbold', function () {
        return function (e) {
            return e ? 'bold' : 'normal';
        };
    });
    // 字体样式限制
    fangfil.filter('fontitalic', function () {
        return function (e) {
            return e ? 'italic' : 'normal';
        };
    });
    // 是否有下划线过滤
    fangfil.filter('underline', function () {
        return function (e) {
            return e ? 'underline' : 'none';
        };
    });
    // 速度限制
    fangfil.filter('speed', function () {
        return function (e) {
            if (e) {
                return parseInt(parseInt(e) > 20 ? e : 1e3 * e);
            }
            return 300;
        };
    });
    // 形状地址限制
    fangfil.filter('shapeurl', ['Config', function (config) {
        return function (e) {
            var shapeUrl = '';
            if (e && e !== 'null' && e !== '0') {
                shapeUrl = 'url(' + config.pictureServer + 'shape/' + e + ')';
            } else {
                shapeUrl = 'url(' + config.pictureServer + 'shape/1.svg)';
            }
            return shapeUrl;
        };
    }]);
    // 兼容富文本
    fangfil.filter('codeToHtml', ['$sce', function ($sce) {
        return function (t) {
            return $sce.trustAsHtml(t);
        };
    }]);
    // 过滤按钮链接文本避免链接文本为空的情况
    fangfil.filter('pBtnText', function () {
        return function (e) {
            return (e && e.length > 0) ? e : '请输入文本内容';
        };
    });
    // 触发时间选项
    fangfil.filter('eventType', function () {
        return function (e) {
            var res;
            if (e === 'none') {
                res = '无';
            } else {
                res = '点击触发'
            }
            return res;
            // return (e && e.length > 0) ? e : '请输入文本内容';
        };
    });
})();

