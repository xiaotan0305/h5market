/**
 * Created by liyy on 2015/8/26.
 * @Last Modified by: tankunpeng@fang.com
 * @Last Modified time: 2018-02-27 11:06:03
 */
define('src/ebook/main', ['jquery', 'ebook_card', 'ebook_preloader', 'weixinshare'], function(require) {
    var vars = seajs.data.vars = {};
    var $ = require('jquery'),
        Card = require('ebook_card'),
        Preloader = require('ebook_preloader');
    // 获取隐藏域数据
    $('input[type=hidden]').each(function(index, element) {
        vars[element.id] = element.value;
    });
    // 自定义字体域名
    vars.fontMain = location.protocol + '//static.soufunimg.com/font';

    // 图片\音频 地址过渡正则
    vars.imgUrlReg = /(^(https?:)?\/\/cdn[n|s]\.soufunimg\.com)|((https?:)?\/\/img\w{0,3}\.soufunimg\.com)|(^(https?:)?\/\/\w+\.soufunimg\.com\/h5)/;
    // 判断协议重新赋值
    if (/https/.test(location.protocol)) {
        vars.phoneSite = vars.phoneSite.replace('http:', 'https:');
    }
    var win = window;
    var mainBox = $('#main'),
        musicOn = $('#musiccontrolon'),
        musicOff = $('#musiccontroloff'),
        preview = $('#marketdym'),
        qbody = $('body'),
        defaultBox = $('#defaultLoading'),
        customBox = $('#customLoading');
    var nav = $('#nav'),
        previousPage = $('#previousPage'),
        nextPage = $('#nextPage'),
        indexPage = $('#return');
    vars.eles = {
        preview: preview,
        nav: nav,
        previousPage: previousPage,
        nextPage: nextPage,
        indexPage: indexPage
    };
    var $window = $(window);
    vars.screen = {
        width: mainBox.outerWidth() || $window.width(),
        height: mainBox.outerHeight() || $window.height()
    };

    // 音乐图标传入vars,以便其他js模块调用
    vars.musicOn = musicOn;
    vars.musicOff = musicOff;
    // 判断浏览器类型,iframe兼容性处理
    vars.UA = window.navigator.userAgent.toLowerCase();
    // 预加载前动画
    if (!vars.loadingSrc) {
        defaultBox.show();
    } else {
        customBox.show();
    }
    // 计时器
    vars.h5Timer = $('#h5Timer');
    vars.gameTime = $('#gameTime');
    vars.timeM = $('#gameMinute');
    vars.timeS = $('#gameSecond');
    vars.clock = $('#clock');

    function Viewer() {
        // 项目封面图
        this.thum = null;
        this.viewerPreloader = new Preloader();
        this.init();
        // 方便其他模块调用
        vars.setMusic = this.setMusic;
    }

    Viewer.prototype = {

        /**
         * 初始化页面数据
         * @param data 所有数据
         * @returns {boolean}
         */
        constructor: Viewer,
        init: function() {
            this.getJson(vars.projectID, vars.type);
            if (!vars.isPc && vars.UA.indexOf('test.') > -1) {
                require.async(['//static.soufunimg.com/count/loadforwapandm.min.js']);
                require.async('//static.soufunimg.com/count/loadonlyga.min.js');
            }
        },

        /**
         * 图片地址过滤
         * @param str 字符串
         */
        imgfilter: function(str) {
            return vars.imgUrlReg.test(str) ? str : vars.imgSite + 'imgs/' + str;
        },

        /**
         * 设置项目标题、封面图
         * @param data
         */
        setWXmsg: function(data) {
            this.title = data.data.title;
            this.thum = data.data.cover ? data.data.cover : win.defaultImg;
            this.status = data.data.status;
            // 描述
            this.desc = data.data.introduction;
            // 公众号的唯一标识
            // this.appid = vars.appid;
            // 生成签名的时间戳
            // this.timestamp = vars.timestamp;
            // 生成签名的随机串
            // this.nonceStr = vars.nonceStr;
            // 签名
            // this.signature = vars.signature;
            // 地址
            this.link = vars.phoneSite + vars.projectID + '?channel=' + vars.channel + '&city=' + vars.city + '&source=' + vars.source;
            // 图片地址
            var imgurl = this.imgfilter(this.thum),
                protocol = location.protocol;
            this.imgUrl = imgurl.indexOf(protocol) !== -1 ? imgurl : protocol + imgurl;
            // 微信分享
            var Weixin = require('weixinshare');
            new Weixin({
                debug: false,
                shareTitle: this.title,
                descContent: this.desc,
                lineLink: this.link,
                imgUrl: this.imgUrl,
                // 对调标题 和 描述(微信下分享到朋友圈默认只显示标题,有时需要显示描述则开启此开关,默认关闭)
                swapTitle: false
            }, function(res) {
                // errMsg:"shareTimeline:ok" 朋友圈 type: '1'
                // errMsg:"sendAppMessage:ok" 朋友 type: '0'
                var errMsg = res.errMsg;
                var param = {
                    c: 'web',
                    a: 'ajaxWeiXinShareCount',
                    id: vars.projectID,
                    type: errMsg.indexOf('sendAppMessage') > -1 ? '0' : '1'
                };
                $.ajax({
                    url: vars.phoneSite,
                    type: 'GET',
                    data: param,
                    dataType: 'json',
                    success: function(data) {
                        if (data.errcode === 1) {
                            // 分享成功;
                            // alert('分享成功~');
                        }
                    }
                });
            });
        },

        /**
         * 获取项目json数据
         */
        getJson: function(pid, type) {
            var that = this;
            $.ajax({
                type: 'get',
                url: vars.phoneSite,
                cache: false,
                data: {
                    c: 'api',
                    a: type === 'm' ? 'ajaxMultiTemplateById' : 'ajaxProject',
                    t: type,
                    id: pid
                },
                success: function(data) {
                    that.getJsonSuccess(data);
                },
                error: function() {
                    alert('获取数据失败');
                }
            });
        },

        /**
         * 成功获取项目json数据
         * @param data 项目json数据
         */
        getJsonSuccess: function(data) {
            var that = this;
            if (parseInt(data.errcode) !== 1) {
                alert('获取数据失败!');
                return;
            }
            // 如果项目已下线
            if (data.data.status === 'offline') {
                var offlineImg = $('<img style="max-width:100%;max-height:100%;position:relative;z-index:10000;" ' + 'src="' + vars.imgSite
                    + 'imgs/offline.jpg' + '">');
                qbody.css('text-align', 'center').append(offlineImg);
                mainBox.hide();
                return;
                // 如果项目已删除
            } else if (data.data.status === 'delete') {
                var deleteImg = $('<img style="max-width:100%;max-height:100%;position:relative;z-index:10000;" ' + 'src="' + vars.imgSite
                    + 'imgs/delete.jpg' + '">');
                qbody.css('text-align', 'center').append(deleteImg);
                mainBox.hide();
                return;
            }
            // 算出第一页最长的元素动画时间
            var initPageDate = data.data.pdata.json ? data.data.pdata.json[0].content : null;
            if (initPageDate) {
                var maxTime = 0;
                $.each(initPageDate, function(index, ele) {
                    var animation;
                    if (ele.animations) {
                        animation = ele.animations.animationIn;
                    } else if (ele.elementAnimations) {
                        animation = ele.elementAnimations.animation_in;
                    }
                    var time = animation.speed + animation.delay;
                    if (maxTime < time) {
                        maxTime = time;
                    }
                });
                // 首页所有元素加载时间(html2canvas使用);
                win.showTime = maxTime;
            }

            // 获取微信信息
            that.setWXmsg(data);

            // 如果只有一页
            if (data.data.pdata.json && data.data.pdata.json.length === 1) {
                nav.hide();
            }

            // 初始化页面数据跟配置
            var json = data.data.pdata.json,
                music = data.data.pdata.music ? data.data.pdata.music : null;
            var card = new Card(json, preview, music, this.versionData, this.viewerIsvip, this.designer);
            // card对象
            window.editorCard = vars.editorCard = card;
            card.start(0, 0, that.viewerPreloader);
            // 加载自定义字体
            that.viewerPreloader.loadFonts(data.data);

            // 页面加载前动画
            that.viewerPreloader.loadstart(card);

            // 音乐播放暂停控制
            if (card.musicsrc) {
                // 音乐图标按需加载
                musicOn.attr('src', vars.imgSite + '/imgs/musicon.png').show();
                musicOff.attr('src', vars.imgSite + '/imgs/musicoff.png').hide();
                var audio = document.getElementById('music');
                vars.audio = audio;
                audio.src = card.musicsrc;
                // 解决部分微信音频不能自动播放问题
                $(document).one('touchstart', function() {
                    audio.play();
                });
                document.addEventListener('WeixinJSBridgeReady', function() {
                    audio.play();
                }, false);
                // 设置音乐循环
                if (music && music.loop && music.loop === 'off') {
                    audio.removeAttribute('loop');
                }
                audio.addEventListener('canplaythrough', function() {
                    audio.play();
                }, false);
                musicOff.on('click', function() {
                    musicOff.hide();
                    musicOn.show();
                    audio.play();
                });
                musicOn.on('click', function() {
                    musicOff.show();
                    musicOn.hide();
                    audio.pause();
                });
            } else {
                musicOff.hide();
                musicOn.hide();
            }
            // 页面控制
            // 上一页
            previousPage.bind('click', function() {
                // 当前页
                var currentPage = preview.turn('page');
                if (currentPage >= 2) {
                    preview.turn('page', currentPage - 1);
                    if (!nextPage.hasClass('active')) nextPage.addClass('active');
                    if (currentPage === 2) {
                        previousPage.removeClass('active');
                        indexPage.removeClass('active');
                    }
                }
            });
            // 下一页
            nextPage.bind('click', function() {
                // 当前页
                var currentPage = preview.turn('page');
                if (currentPage < vars.pageNum) {
                    preview.turn('page', currentPage + 1);
                    previousPage.addClass('active');
                    indexPage.addClass('active');
                    if (currentPage >= vars.pageNum - 1) {
                        nextPage.removeClass('active');
                    }
                }
            });
            // 返回到目录页
            indexPage.bind('click', function() {
                var currentPage = preview.turn('page');
                if (currentPage !== 1) {
                    preview.turn('page', 1);
                    indexPage.removeClass('active');
                    nextPage.addClass('active');
                    previousPage.removeClass('active');
                }
            });
        },

        /**
         * 控制音乐开关
         * @param type 类型
         */
        setMusic: function(type) {
            if (!vars.audio) {
                return;
            }
            switch (type) {
                case 'on':
                    if (vars.audio.paused) {
                        vars.audio.play();
                        musicOff.hide();
                        musicOn.show();
                    }
                    break;
                case 'off':
                    if (!vars.audio.paused) {
                        vars.audio.pause();
                        musicOff.hide();
                        musicOn.hide();
                    }
                    break;
            }
        }
    };
    return new Viewer();
});