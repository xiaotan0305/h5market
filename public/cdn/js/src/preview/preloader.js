/**
 * Created by liyy on 2015/8/26.
 * @Last Modified by:   tankunpeng
 * @Last Modified time: 2015/10/19
 */
define('preloader', ['jquery', 'card'], function (require) {
    'use strict';
    var vars = seajs.data.vars;
    var $ = require('jquery');
    require('card');
    // 百分比div
    var persent = $('#persent'),
        // 封面图div
        covert = $('#covert'),
        // 封面图img
        cover = $('#cover'),
        // 加载动画半圆 div clip
        pie1 = $('.pie1'),
        // 加载动画半圆 div clip
        pie2 = $('.pie2'),
        // 圆div 两个
        wthum = $('.wthum'),
        // 预加载大盒子
        preloadarea = $('#preloadarea'),
        defaultBox = $('#defaultLoading'),
        customBox = $('#customLoading');
    window.isLoad = false;
    vars.imgsBox = {};
    vars.imgsrcBox = {};
    function Preloader() {
        // 图片数据对象[{},{}...]
        this.queue = [];
        // 首页总图片数量
        this.endnum = 0;
        // 当前加载图片数量
        this.curnum = 0;
        // 旋转角度
        this.addingI = 0;
        persent.html('0%');
    }

    Preloader.prototype = {
        // 加载自定义字体
        loadFonts: function (data) {
            var fontinfo = data.fontinfo || null;
            var fonts = [];
            if (fontinfo) {
                fontinfo = JSON.parse(fontinfo);
                var str = '';
                for (var i = 0, len = fontinfo.length; i < len; i++) {
                    str += '@font-face {font-family: "' + fontinfo[i].font + '"; src: url("' + (vars.fontMain + fontinfo[i].fontmin) + '");}\n';
                    fonts.push(fontinfo[i].font);
                }

            }
            var head = $(document.head),
                style = $('<style></style>'),
                fontPreloader = $('#fontPreloader');
            style.append(str);
            head.append(style);
            // 字体预加载
            for (var i = 0, fontlen = fonts.length; i < fontlen; i++) {
                (function (i,fontlen) {
                    var p = $('<p>字体预加载</p>')
                    p.css('font-family', fonts[i]);
                    fontPreloader.append(p);
                    if(i === fontlen - 1) {
                        fontPreloader.hide();
                    }
                })(i,fontlen)
            }
        },
        addpic: function (imgSrc) {
            if (imgSrc === 'undefined') {
                return;
            }
            this.queue.push(imgSrc);
            // 加载前三页图片
            this.endnum++;
        },
        loadingType: function (card, loadingSrc, endnum) {
            var that = this;
            card = card || '';
            loadingSrc = loadingSrc || '';
            endnum = endnum || '';
            if (!loadingSrc) {
                defaultBox.show();
                wthum.removeClass('waitthum infinite').hide();
                covert.show();
                cover.fadeIn();
                if (endnum === 0 || !that.queue.length || that.addingI >= 360) {
                    clearInterval(that.loading);
                    persent.html('100%');
                    pie1.css({
                        rotate: '0deg'
                    }).show();
                    pie2.css({
                        rotate: '180deg'
                    }).show();
                    that.loadend(card);
                } else {
                    // 预加载动画
                    var num = parseInt(that.curnum / that.endnum * 360) - that.addingI;
                    // num > 5 ? that.addingI += num : that.addingI += 5;
                    that.addingI += num;
                    if (that.addingI >= 360) {
                        that.addingI = 360;
                    }
                    if (that.addingI <= 180) {
                        pie1.css({
                            rotate: that.addingI + 'deg'
                        }).show();
                        pie2.css({
                            background: 'white'
                        }).show();
                    } else if (that.addingI > 180 && that.addingI <= 360) {
                        pie1.css({
                            rotate: '180deg'
                        }).show();
                        pie2.css({
                            background: 'rgba(175,228,221,1)',
                            rotate: that.addingI + 'deg'
                        }).show();
                    }
                    persent.html(parseInt(that.addingI / 360 * 100) + '%');
                }
            } else {
                customBox.show();
            }
        },
        loadstart: function (card) {
            var that = this;
            that.editorMakacard = card;
            clearInterval(that.loading);
            that.loading = setInterval(function () {
                that.loadingType(card, vars.loadingSrc, that.endnum);
                if (that.curnum < that.endnum) {
                    vars.imgsBox['img' + that.curnum] = new Image();
                    vars.imgsBox['img' + that.curnum].src = that.queue[that.curnum];
                    vars.imgsBox['img' + that.curnum].onload = function () {
                        vars.imgsrcBox['img' + that.curnum] = vars.imgsBox['img' + that.curnum] && vars.imgsBox['img' + that.curnum].src;
                        that.curnum++;
                    };
                    vars.imgsBox['img' + that.curnum].onerror = function () {
                        alert('图片加载失败。');
                        clearInterval(that.loading);
                    };
                } else if (that.curnum >= that.endnum && (!vars.loadingSrc ? that.addingI >= 360 : true)) {
                    // 判断加载状况，执行loadend方法
                    clearInterval(that.loading);
                    that.loadend(card);
                }
            }, 30);
        },

        /**
         * 预加载完毕
         */
        loadend: function (card) {
            setTimeout(function () {
                // 隐藏预加载模块
                preloadarea.fadeOut();
                // 加载正式页面
                card.start(0);
                // 初始化页面效果
                card.initswipeaction();
                // 加载完毕标识
                window.isLoad = true;
                // window.parent.isLoad = true;
            }, 500);
        }
    };
    return Preloader;
});