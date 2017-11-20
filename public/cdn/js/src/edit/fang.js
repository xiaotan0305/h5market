/*
 * @Author: liyy
 * @Date:   2015/9/14
 * @description: h5market编辑页主模块
 * @Last Modified by:   liyy
 * @Last Modified time: 2015-11-19
 */
(function () {
    'use strict';
    // 应用配置
    window.AppConfig = (function () {
        var module = 'fang';
        // 依赖模块
        var rely = ['ui.bootstrap', 'hmTouchEvents', 'textAngular', 'ngResource', 'highcharts-ng', 'ngPicky', 'ui.sortable'];

        /**
         * 注册模块 并添加为主模块fang的依赖模块
         * @param mod 模块名
         */
        var register = function (mod) {
            angular.module(mod, []);
            angular.module(module).requires.push(mod);
        };
        return {
            // 应用模块名
            appModuleName: module,
            // 应用依赖模块
            appModuleVendorDependencies: rely,
            // 注册模块方法
            registerModule: register
        };
    })();
    angular.module('fang', ['ui.bootstrap', 'hmTouchEvents', 'textAngular', 'ngResource', 'highcharts-ng', 'ngPicky', 'ui.sortable']).
        config(['$httpProvider', '$locationProvider', '$sceDelegateProvider', function ($httpProvider, $locationProvider, $sceDelegateProvider) {
            $httpProvider.defaults.useXDomain = false;
            $httpProvider.defaults.withCredentials = false;
            $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $httpProvider.defaults.transformRequest = [function (e) {
                var t = function (e) {
                    var n, a, o, i, l, r, c, s = '';
                    for (n in e) {
                        if (e.hasOwnProperty(n)) {
                            a = e[n];
                            if (a instanceof Array) {
                                for (c = 0; c < a.length; ++c) {
                                    l = a[c];
                                    o = n + '[' + c + ']';
                                    r = {};
                                    r[o] = l;
                                    s += t(r) + '&';
                                }
                            } else if (a instanceof Object) {
                                for (i in a) {
                                    if (a.hasOwnProperty(i)) {
                                        l = a[i];
                                        o = n + '[' + i + ']';
                                        r = {};
                                        r[o] = l;
                                        s += t(r) + '&';
                                    }
                                }
                            } else {
                                'undefined' !== a && null !== a && (s += encodeURIComponent(n) + '=' + encodeURIComponent(a) + '&');
                            }
                        }
                    }
                    return s.length ? s.substr(0, s.length - 1) : s;
                };
                return angular.isObject(e) && '[object File]' !== String(e) ? t(e) : e;
            }];
            //  设置安全域名白名单
            $sceDelegateProvider.resourceUrlWhitelist([
                // Allow same origin resource loads.
                'self',
                // Allow loading from our assets domain.  Notice the difference between * and **.
                'http://*.soufun.com/**',
                'http://*.soufunimg.com/**',
                'http://*.fang.com/**'
            ]);
        }]).
        constant('Config', {
            // 图片资源路径
            pictureServer: imgSite + 'imgs/',
            // 图片以及音乐文件上传地址
            mediaUpload: mainSite + '?c=admin&a=ajaxUploadMedia',
            // 主域名
            baseUrl: mainSite,
            musicUrl: imgSite + 'music/',
            webMusicUrl: imgSite + 'webMusic/',
            // 字体资源路径
            fontServer: imgSite + 'css/',
            // 字体服务器路径
            fontUrl:location.protocol + '//nodejs3.soufunimg.com/font/?c=font&a=ajaxGetMinFont',
            // psd图片上传路径
            psdUploadUrl:location.protocol + '//nodejs3.soufunimg.com/img/?c=img&a=ajaxUploadImg',
            // 压缩字体资源路径
            minFontUrl: location.protocol + '//static.soufunimg.com/font',
            //psd图片路径
            psdPicUrl: location.protocol + '//static.soufunimg.com/h5'
        });
})();

