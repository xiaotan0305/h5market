/**
 * 微信/qq/qq空间分享插件
 * by 谭坤鹏 2016-11-07
 * 2016-10-8 by tankunpeng  去除分享调用config appId等四个参数传入
 * 2016-11-7 by tankunpeng  增加qq\qq空间的分享自定义
 * @param {Object} w window
 * @param {Object} f function
 */

(function (w, f) {
    'use strict';
    if (typeof define === 'function') {
        define('plugin/weixinshare', ['jquery'], function (require) {
            var $ = require('jquery');
            var vars = seajs.data.vars;
            return f($, require,vars);
        });
    } else if (typeof exports === 'object') {
        module.exports = f(w);
    } else {
        w.Weixin = f();
    }
})(window, function ($, require,vars) {
    'use strict';
    $ = $ || window.$;
    if (require) {
        require = seajs.use;
    }
    function Weixin(ops, succfn, errfn) {
        var that = this;
        this.options = {
            // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            debug: false,
            // ajax 方式
            type: 'GET',
            // 必填，公众号的唯一标识
            appId: '',
            // 必填，生成签名的时间戳
            timestamp: '',
            // 必填，生成签名的随机串
            nonceStr: '',
            // 必填，签名，见附录1
            signature: '',
            // 需要使用的网页服务接口
            jsApiList: [
                // 判断当前客户端版本是否支持指定JS接口
                'checkJsApi',
                // 分享给好友
                'onMenuShareTimeline',
                // 分享到朋友圈
                'onMenuShareAppMessage',
                // 分享到QQ
                'onMenuShareQQ',
                // 分享到微博
                'onMenuShareWeibo',
                // 分享到QQ空间
                'onMenuShareQZone'
            ],
            // 对调标题 和 描述
            swapTitle: false,
            shareTitle: '搜房网活动~',
            descContent: '搜房网活动,邀您一起来玩啊~',
            lineLink: location.protocol + '//m.fang.com/',
            imgUrl: location.protocol + '//js.soufunimg.com/common_m/m_public/201511/images/logo.png'

        };

        for (var i in ops) {
            if (ops.hasOwnProperty(i)) {
                this.options[i] = ops[i];
            }
        }
        // 判断访问站点类型
        var mainSite = /test\./.test(location.href) ? '//static.test.soufunimg.com/' : '//static.soufunimg.com/';
        var ua = navigator.userAgent.toLowerCase();
        this.isWX = /micromessenger/.test(ua);
        this.isQQ = /qq\//.test(ua);
        this.isQZ = /qzone\//.test(ua);

        // 安卓 5.1.1及以下微信分享到qq 不支持https 图片兼容处理
        // 安卓 所有版本qq分享到微信 不支持https
        // parseFloat(str.match(/android\s*\d(\.\d)?/)[0].split(/\s+/)[1])
        var reg = /android\s*\d(\.\d)*/, tmpver;
        if (reg.test(ua)) {
            this.os = 'android';
            tmpver = ua.match(/android\s*\d(\.\d)?/)[0].split(/\s+/);
            this.androidVer = parseFloat(tmpver ? tmpver[1] : 0);
        }
        var wxUrl = mainSite + 'common_m/m_public/jslib/weixin/jweixin-1.0.0.js',
            qqUrl = mainSite + 'common_m/m_public/jslib/weixin/qqapi.js',
            qzUrl = mainSite + 'common_m/m_public/jslib/weixin/qzapi.js';
        var urlArr = [];
        if (this.isWX) {
            urlArr.push(wxUrl);
            if (require) {
                require(['plugin/jweixin-1.0.0'], function (wx) {
                    that.wx = wx;
                    that.init();
                });
            }
        } else if (this.isQQ) {
            urlArr.push(qqUrl);
            if (require) {
                require(['plugin/qqapi'], function (qq) {
                    that.qq = qq;
                    that.init();
                });
            }
        } else if (this.isQZ) {
            urlArr.push(qzUrl);
            if (require) {
                require(['plugin/qzapi'], function (qz) {
                    that.qz = qz;
                    that.init();
                });
            }
        }
        if (!$) {
            urlArr.push(mainSite + 'common_m/m_public/jslib/jquery/2.1.4/jquery.js');
        }
        if (!require && !window.wx && !window.qq && !window.qz) {
            this.createScript(urlArr, function () {
                $ = window.$;
                that.wx = window.wx;
                that.qq = window.mqq;
                that.qz = window.QZAppExternal;
                that.init();
            });
        }
        this.succfn = succfn;
        this.errfn = errfn;
    }

    Weixin.prototype = {
        constructor: Weixin,
        init: function () {
            var that = this,
                wx = that.wx;
            // 微信
            if (that.isWX) {
                that.getConfig(function (config) {
                    // 微信配置
                    wx.config({
                        debug: that.options.debug,
                        appId: that.options.appId || config.appId,
                        timestamp: that.options.timestamp || config.timestamp,
                        nonceStr: that.options.nonceStr || config.nonceStr,
                        signature: that.options.signature || config.signature,
                        jsApiList: [
                            'checkJsApi',
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ',
                            'onMenuShareWeibo',
                            'onMenuShareQZone'
                        ]
                    });

                    wx.ready(function () {
                        // 运行微信的API
                        that.runWxAPI();
                        // setTimeout(function () {
                            vars.audio && vars.audio.play();
                        // },1000);
                    });
                }, function (data) {
                    console.error('微信接口请求失败', data);
                });
            } else if (that.isQQ) {
                // qq
                that.setQQShareInfo();
            } else if (that.isQZ) {
                // qq空间
                that.setQQZoneShareInfo();
            }
        },

        /**
         * 导入依赖js 文件
         * @param urlArr [url1,url2...] url地址组
         * @param loadedFn 加载完成回调
         */
        createScript: function (urlArr, loadedFn) {
            var doc = document;
            var head = doc.head || (doc.getElementsByTagName('head')[0] || doc.documentElement);
            var i = 0,
                len = urlArr.length,
                n = 0;
            (function (i) {
                for (; i < len; i++) {
                    var spt = doc.createElement('script');
                    spt.onload = function () {
                        n++;
                        if (n === len) {
                            loadedFn && loadedFn();
                        }
                    };
                    spt.onerror = function () {
                        n++;
                        console.error(urlArr[i] + '加载失败');
                    };
                    spt.async = false;
                    spt.chartset = 'utf-8';
                    spt.src = urlArr[i];
                    head.appendChild(spt);
                }
            })(i);
        },
        getConfig: function (succfn, errfn) {
            var reg = /test\.|local/;
            var urlOrigin = reg.test(location.origin) ? location.protocol + '//m.test.fang.com' : location.protocol + '//m.fang.com';
            $.ajax({
                url: urlOrigin + '/huodongAC.d?m=wxShareInfo&class=ActivityIExpiresinTimeMc',
                type: 'GET',
                data: {
                    shareurl: location.href
                },
                dataType: 'jsonp',
                success: function (data) {
                    data.timestamp = parseInt(data.timestamp);
                    succfn && succfn(data);
                },
                error: function (data) {
                    errfn && errfn(data);
                }
            });
        },

        /**
         * https 转化成http 解决部分5.1安卓系统下分享图片不显示问题
         * @param url
         * @returns {*}
         */
        https2http: function (url) {
            var that = this;
            return that.os === 'android' ? url.replace('https','http') : url;
            // return that.androidVer <= 5.1 ? url.replace('https','http') : url;
        },
        runWxAPI: function () {
            var that = this,
                wx = that.wx;

            /**
             * success：接口调用成功时执行的回调函数。
             * fail：接口调用失败时执行的回调函数。
             * complete：接口调用完成时执行的回调函数，无论成功或失败都会执行。
             * cancel：用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到。
             * trigger: 监听Menu中的按钮点击时触发的方法，该方法仅支持Menu中的相关接口。
             */

            // 1 判断当前版本是否支持指定 JS 接口，支持批量判断
            wx.checkJsApi({
                jsApiList: [
                    'getNetworkType',
                    'previewImage'
                ],
                success: function () {

                }
            });
            // 2. 分享接口
            // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
            wx.onMenuShareAppMessage({
                title: that.options.shareTitle,
                desc: that.options.descContent,
                link: that.options.lineLink,
                imgUrl: that.https2http(that.options.imgUrl),
                trigger: function () {
                    // alert('用户点击发送给朋友');
                },
                success: function (res) {
                    // alert('已分享');
                    // 执行回调函数
                    that.succfn && that.succfn(res);
                },
                cancel: function (res) {
                    // alert('已取消');
                    that.errfn && that.errfn(res);
                },
                fail: function (res) {
                    that.errfn && that.errfn(res);
                }
            });
            // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
            wx.onMenuShareTimeline({
                title: that.options.swapTitle ? that.options.descContent : that.options.shareTitle,
                desc: that.options.swapTitle ? that.options.shareTitle : that.options.descContent,
                link: that.options.lineLink,
                imgUrl: that.https2http(that.options.imgUrl),
                trigger: function (res) {
                    // alert('用户点击分享到朋友圈');
                },
                success: function (res) {
                    // alert('已分享');
                    // 执行回调函数
                    that.succfn && that.succfn(res);
                },
                cancel: function (res) {
                    // alert('已取消');
                    that.errfn && that.errfn(res);
                },
                fail: function (res) {
                    that.errfn && that.errfn(res);
                }
            });
            // 2.3 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
            wx.onMenuShareQQ({
                title: that.options.shareTitle,
                desc: that.options.descContent,
                link: that.options.lineLink,
                imgUrl: that.https2http(that.options.imgUrl),
                trigger: function () {
                    // alert('用户点击分享到QQ');
                },
                complete: function () {
                    // alert(JSON.stringify(res));
                },
                success: function (res) {
                    // alert('已分享');
                    that.succfn && that.succfn(res);
                },
                cancel: function (res) {
                    // alert('已取消');
                    that.errfn && that.errfn(res);
                },
                fail: function (res) {
                    that.errfn && that.errfn(res);
                }
            });

            // 2.4 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
            wx.onMenuShareWeibo({
                title: that.options.shareTitle,
                desc: that.options.descContent,
                link: that.options.lineLink,
                imgUrl: that.https2http(that.options.imgUrl),
                trigger: function () {
                    // alert('用户点击分享到微博');
                },
                complete: function () {
                    // alert(JSON.stringify(res));
                },
                success: function (res) {
                    // alert('已分享');
                    that.succfn && that.succfn(res);
                },
                cancel: function (res) {
                    // alert('已取消');
                    that.errfn && that.errfn(res);
                },
                fail: function (res) {
                    that.errfn && that.errfn(res);
                }
            });
            // 2.5 监听“分享到qq空间”按钮点击、自定义分享内容及分享结果接口
            wx.onMenuShareQZone({
                title: that.options.shareTitle,
                desc: that.options.descContent,
                link: that.options.lineLink,
                imgUrl: that.https2http(that.options.imgUrl),
                success: function (res) {
                    // 用户确认分享后执行的回调函数
                    that.succfn && that.succfn(res);
                },
                cancel: function (res) {
                    // 用户取消分享后执行的回调函数
                    that.errfn && that.errfn(res);
                },
                fail: function (res) {
                    that.errfn && that.errfn(res);
                }
            });
        },

        /**
         * 设置qq分享
         */
        setQQShareInfo: function () {
            var that = this;
            var info = {
                title: that.options.shareTitle,
                desc: that.options.descContent,
                share_url: that.options.lineLink,
                image_url: that.https2http(that.options.imgUrl)
            };
            try {
                that.qq.data.setShareInfo(info);
            } catch (e) {
                console.log(e);
            }
        },

        /**
         * 设置qq空间分享
         */
        setQQZoneShareInfo: function () {
            var that = this;
            var ops = that.options;
            if (that.qz && that.qz.setShare) {
                var imageArr = [],
                    titleArr = [],
                    summaryArr = [],
                    shareURLArr = [];
                for (var i = 0; i < 5; i++) {
                    imageArr.push(ops.imgUrl);
                    shareURLArr.push(ops.lineLink);
                    if (i === 4 && ops.swapTitle) {
                        titleArr.push(ops.descContent);
                        summaryArr.push(ops.shareTitle);
                    } else {
                        titleArr.push(ops.shareTitle);
                        summaryArr.push(ops.descContent);
                    }
                }
                that.qz.setShare(function (data) {
                    that.succfn && that.succfn();
                }, {
                    type: 'share',
                    image: imageArr,
                    title: titleArr,
                    summary: summaryArr,
                    shareURL: shareURLArr
                });
            }
        },

        /**
         * 更改微信分享参数
         * @param ops 参数 {}
         */
        updateOps: function (ops) {
            var that = this;
            for (var i in ops) {
                if (ops.hasOwnProperty(i)) {
                    that.options[i] = ops[i];
                }
            }
            // 微信
            if (that.isWX) {
                that.runWxAPI();
            }
            // qq
            if (that.isQQ) {
                that.setQQShareInfo();
            }
            // qq空间
            if (that.isQZ) {
                that.setQQZoneShareInfo();
            }
        }
    };
    return Weixin;
});
