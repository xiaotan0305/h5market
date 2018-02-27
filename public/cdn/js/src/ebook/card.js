/**
 * Created by liyy on 2015/8/31.
 * @Last Modified by: tankunpeng@fang.com
 * @Last Modified time: 2018-02-27 14:28:51
 */
define('ebook_card', ['jquery', 'ebook_page', 'ebook_tools', 'turn'], function(require) {
    var vars = seajs.data.vars;
    var $ = require('jquery'),
        Page = require('ebook_page'),
        tools = require('ebook_tools');
    require('turn');


    function Card(data, containner, musicData, versionData, viewerIsvip, designer) {
        this.data = data;
        this.containner = containner;
        this.versionData = versionData;
        this.viewerIsvip = viewerIsvip;
        if (musicData) {
            this.music = musicData;
            if (musicData.id) {
                // js.h5.test.fang.com/music/76699.mp3
                this.musicsrc = vars.imgUrlReg.test(musicData.id) ? musicData.id : vars.imgSite + 'music/' + musicData.id + '.mp3';
            } else {
                // js.h5.test.fang.com/webMusic/The_Bandit.mp3
                this.musicsrc = vars.imgUrlReg.test(musicData.name) ? musicData.name : vars.imgSite + 'webMusic/' + musicData.name;
            }
        }
        this.designer = designer;
        this.init(data);
        this.initTurn();
    }

    Card.prototype = {

        ensureCanvas: function() {
            var radio = {},
                e, t, n, i, o = 640,
                a = 1008,
                r = vars.screen.width / o,
                u = vars.screen.height / a;
            radio.scaleRatio = r;
            radio.bgScaleRatio = r < u ? r : u;
            if (u > r) {
                e = o > vars.screen.width ? vars.screen.width : o;
                t = e * (a / o);
                n = o < vars.screen.width ? (vars.screen.width - o) / 2 : 0;
                i = t < vars.screen.height ? (vars.screen.height - t) / 2 : 0;
            } else {
                t = a > vars.screen.height ? vars.screen.height : a;
                e = t * (o / a);
                i = a < vars.screen.height ? (vars.screen.height - a) / 2 : 0;
                n = e < vars.screen.width ? (vars.screen.width - e) / 2 : 0;
            }
            radio.ratio = {
                height: u,
                top: u,
                width: r,
                left: r
            };
            radio.contentsize = {
                width: vars.screen.width + 'px',
                height: vars.screen.height + 'px',
                left: 0,
                top: 0,
                position: 'absolute'
            };
            var ops = {
                width: '100%',
                height: '100%',
                left: '0px',
                top: '0px',
                position: 'relative'
            };
            // pc 端适配
            if (!/iphone|ipad|ipod|ios|android|adr|linux;|symbianos|windows phone/i.test(navigator.userAgent) && window.top === window) {
                vars.isPc = true;
                ops = {
                    width: '414px',
                    height: '736px',
                    position: 'relative',
                    'box-shadow': '0 10px 50px rgba(0,0,0,.3)'
                };
                // 适配为iPhone 6s plus
                radio.scaleRatio = 0.646875;
                radio.bgScaleRatio = 0.646875;
                radio.ratio = {
                    height: 0.646875,
                    top: 0.646875,
                    width: 0.646875,
                    left: 0.646875
                };
                radio.contentsize = {
                    width: '414px',
                    height: '736px',
                    left: 0,
                    top: 0,
                    position: 'absolute'
                };
            }
            $('#main').css(ops);
            vars.radio = radio;
        },

        initTurn: function() {
            var that = this;
            var eles = vars.eles;
            // 电子书程序
            vars.eles.preview.turn({
                // Elevation
                elevation: 50,
                display: 'single',
                inclination: 50,
                // Enable gradients
                gradients: true,
                duration: 800,
                // Auto center this flipbook
                autoCenter: true,
                when: {
                    start: function() {
                        var nextP = that.pages[vars.current + 1];
                        if (nextP) {
                            var nextPage = nextP.page;
                            nextPage.show();
                        }
                    },
                    turning: function(ev, page, view, corner) {
                        if (/^(tr|br|r)$/.test(corner)) {
                            that.nextpage();
                        }else if (/^(tl|bl|l)$/.test(corner)) {
                            that.prevpage();
                        }
                        if (page === 1 || page === vars.pageNum) return;
                        if (!eles.previousPage.hasClass('active')) eles.previousPage.addClass('active');
                        if (!eles.indexPage.hasClass('active')) eles.indexPage.addClass('active');
                        if (!eles.nextPage.hasClass('active')) eles.nextPage.addClass('active');
                    },
                    first: function() {
                        eles.previousPage.removeClass('active');
                        eles.indexPage.removeClass('active');
                    },
                    last: function() {
                        eles.nextPage.removeClass('active');
                    }
                }
            });
        },

        /**
         * 初始化页面数据
         * @param data 所有数据
         * @returns {boolean}
         */
        init: function(data) {
            if (typeof data === 'undefined' || !data) {
                return false;
            }
            this.ensureCanvas();
            this.pages = [];
            // 用来存要跳转的页面下标，用作分页加载页面时候对比分析
            this.toPageArr = [];
            // 已经加载的最大页码
            this.maxLoadPage = 0;
            // 需要加载的最大页码
            this.toLoadPage = 2;
            // 总页码数
            this.totalPage = data.length - 1;
            // 总页数
            vars.pageNum = data.length;
            // 每次加载的页数
            this.pageLoadStep = 3;
            // 如果页面大于3页，就先取前三页
            this.loadPage(data, 0);
            vars.current = 0;
        },

        /**
         * 加载页面数据
         * @param data 页面原始数据
         * @param n  页面开始加载的页码
         */
        loadPage: function(data, n) {
            // 转化成数字
            n = Math.ceil(n / this.pageLoadStep) * this.pageLoadStep;
            if (n >= vars.pageNum) {
                return;
            }
            var t = n + this.pageLoadStep < vars.pageNum ? n + this.pageLoadStep : vars.pageNum;
            if (t > this.maxLoadPage) {
                for (var i = n; i < t; i++) {
                    if (this.pages[i] && this.pages[i].loaded) {
                        continue;
                    }
                    var per = new Page(data[i], i);
                    per.loaded = true;
                    // 如果有要跳转页面 toPage 有值 否则undefined
                    if (per.toPage.length) {
                        // console.log(per.toPage);
                        this.toPageArr = this.toPageArr.concat(per.toPage);
                    }
                    this.pages.push(per);
                    this.containner.append(per.page[0]);
                    vars.eles.preview.turn('addPage', per.page);
                    per.hidePageElement();
                }
            }
            // 更新最大的加载页面
            this.maxLoadPage = t - 1;
            var maxNum = Math.max.apply(Math, this.toPageArr);
            if (maxNum > 0) {
                this.toLoadPage = maxNum;
            }
            // 页面中有需要加载的页面
            if (this.toLoadPage > this.maxLoadPage) {
                this.loadPage(data, this.maxLoadPage + 1);
            }
            vars.pages = this.pages;
        },
        /**
         * 是否有下一页
         * @returns {boolean}
         */
        hasNextPage: function() {
            if (vars.current >= vars.pageNum - 1) {
                return false;
            }
            return true;
        },
        debouncedCallback: function(e, t) {
            var n = t;
            return function() {
                n--;
                e();
            };
        },
        start: function(e, t, n) {
            if (typeof this.pages === 'undefined' || !this.pages[e]) return;
            if (typeof t === 'undefined') {
                this.pages[e].page.show();
                if (this.pages[e].pan === 'no' || !this.pages[e + 1]) {
                    vars.eles.nav.hide();
                } else {
                    vars.eles.nav.show();
                }
                this.pages[e].hidePageElement();
                this.pages[e].showPageInAnimation();
                // 判断是否有图集
                if (this.pages[e].swiperJson) {
                    if (!this.pages[e].swiperPhotos) {
                        this.pages[e].swiperPhotos = new Swiper(this.pages[e].swiperBox, this.pages[e].swiperJson);
                    } else {
                        this.pages[e].swiperPhotos.init();
                    }
                }
                vars.current = e;
                // 初始化iframe中的下一页按钮
                if (!this.pages[e - 1] && this.pages[e].iframe) {
                    // 如果存在iframe 隐藏上拉箭头
                    vars.eles.nav.hide();
                }
            }
            if (typeof t !== 'undefined' && t === 0) {
                for (var r in this.pages) {
                    if (this.pages.hasOwnProperty(r)) {
                        this.pages[r].loadelespic(r, n);
                    }
                }
            }
        },

        /**
         * 下一页
         * @param fn
         */
        nextpage: function(fn) {
            var that = this;
            if (!this.hasNextPage()) {
                return;
            }

            // 判断是否需要倒计时结束
            if (vars.timerEndPage && vars.timerEndPage.length && vars.upDownTimer) {
                // 正计时 倒计时
                for (var i = 0; i < vars.timerEndPage.length; i++) {
                    if (parseInt(vars.timerEndPage[i]) === parseInt(vars.current + 1)) {
                        clearTimeout(vars.upDownTimer);
                        break;
                    }
                }
            }

            // 兼容全景航拍音乐
            if (vars.pages[vars.current + 1].img360) {
                vars.setMusic('off');
            }

            // 每逢加载页数的倍数开始加载后步进值的页数
            if (!(vars.current % this.pageLoadStep) && vars.current + this.pageLoadStep > this.maxLoadPage) {
                that.loadPage(this.data, vars.current + this.pageLoadStep);
            }
            var nowP = this.pages[vars.current],
                nowPage = nowP.page,
                nextP = this.pages[vars.current + 1],
                nextPage = nextP.page;
            // 如果iframe存在着 nextP中含nextBtn
            if (nextP.pan === 'no' || nextP.iframe) {
                vars.eles.nav.hide();
            } else {
                vars.eles.nav.show();
            }

            var video = nowPage.find('video'),
                nextVideo = nextPage.find('video');

            // 判断是否含统计图，有就重新渲染动画
            if (this.pages[vars.current + 1].charts) {
                var chartEle = this.pages[vars.current + 1].chartEle;
                chartEle.element.html('');
                chartEle.chartHeard.children().eq(0).css({
                    'font-size': '16px',
                    opacity: '1'
                }).siblings().css({
                    'font-size': '12px',
                    opacity: '0.3'
                });
                setTimeout(function() {
                    if (that.pages[vars.current].chartEle) {
                        tools.render(that.pages[vars.current].charts, that.pages[vars.current].chartEle.element);
                    }
                }, 500);
            }
            // 判断是否含视频，切换页面视频暂停播放
            if (video.length) {
                video.each(function(index, element) {
                    element.pause();
                    $(element).next().fadeIn(300);
                });
            }
            //  不使用插件
            if (nextVideo.length) {
                var videoData = this.pages[vars.current + 1].videoarr,
                    len = videoData.length;
                for (var j = 0; j < len; j++) {
                    if (videoData[j].autoplay && videoData[j].autoplay === 'auto') {
                        nextVideo[j].currenTime = 0;
                        nextVideo[j].play();
                        document.webkitCancelFullScreen && document.webkitCancelFullScreen();
                        nextVideo[j].webkitPlaysinline = true;
                        $(nextVideo[j]).next().hide();
                        videoData[j].autoplay = 'false';
                    }
                }
            }
            nextPage.show();
            nextP.showPageInAnimation();
            // 判断下一页是否有图集
            if (nextP.swiperJson) {
                if (!nextP.swiperPhotos) {
                    nextP.swiperPhotos = new Swiper(nextP.swiperBox, nextP.swiperJson);
                } else {
                    nextP.swiperPhotos.init();
                }
            }
            if (vars.current < this.pages.length) {
                vars.current++;
            }
            fn && fn();
        },

        /**
         * 上一页
         * @param fn
         */
        prevpage: function(fn) {
            var that = this;
            if (vars.current === 0) {
                return false;
            }
            var currentP = this.pages[vars.current],
                current = currentP.page,
                preP = this.pages[vars.current - 1],
                pre = preP.page;
            if (preP.pan === 'no' || preP.iframe) {
                vars.eles.nav.hide();
            } else {
                vars.eles.nav.show();
            }
            // 判断是否含统计图，有就重新渲染动画
            if (this.pages[vars.current - 1].charts) {
                var chartEle = this.pages[vars.current - 1].chartEle;
                chartEle.element.html('');
                chartEle.chartHeard.children().eq(0).css({
                    'font-size': '16px',
                    opacity: '1'
                }).siblings().css({
                    'font-size': '12px',
                    opacity: '0.3'
                });
                setTimeout(function() {
                    if (that.pages[vars.current].chartEle) {
                        tools.render(that.pages[vars.current].charts, that.pages[vars.current].chartEle.element);
                    }
                }, 500);
            }
            var video = current.find('video'),
                preVideo = pre.find('video');
            // 判断是否含视频，切换页面视频暂停播放
            if (video.length) {
                video.each(function(index, element) {
                    element.pause();
                    $(element).next().fadeIn(300);
                });
            }
            // 自动播放
            if (preVideo.length) {
                var videoDate = this.pages[vars.current - 1].videoarr,
                    len = videoDate.length;
                for (var j = 0; j < len; j++) {
                    if (videoDate[j].autoplay && videoDate[j].autoplay === 'auto') {
                        preVideo[j].play();
                        preVideo[j].webkitPlaysinline = true;
                        videoDate[j].autoplay = 'false';
                        $(preVideo[j]).next().hide();
                    }
                }
            }
            pre.show();
            preP.showPageInAnimation();
            // 判断上一页是否有图集
            if (preP.swiperJson) {
                if (!preP.swiperPhotos) {
                    preP.swiperPhotos = new Swiper(preP.swiperBox, preP.swiperJson);
                } else {
                    preP.swiperPhotos.init();
                }
            }
            if (vars.current > 0) {
                vars.current--;
            }
            fn && fn();
        },
        fitscreen: function(scale, t) {
            var n = scale * $(window).width() / 640,
                r = scale * $(window).height() / 1010;
            this.sc = n > r ? n : r;
            this.scale = scale;
            for (var key in this.pages) {
                if (this.pages.hasOwnProperty(key)) {
                    this.pages[key].fitscreen(scale, t);
                }
            }
            this.initEraser = true;
        },
        initEraser: false
    };
    return Card;
});