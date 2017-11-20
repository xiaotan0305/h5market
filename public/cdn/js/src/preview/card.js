/**
 * Created by liyy on 2015/8/31.
 * @Last Modified by:   tankunpeng
 * @Last Modified time: 2015/10/19
 */
define('card', ['jquery', 'page', 'pageeffect', 'hammer', 'tools'], function (require) {
    'use strict';
    var vars = seajs.data.vars;
    var $ = require('jquery'),
        Page = require('page'),
        tools = require('tools'),
        Pageeffect = require('pageeffect'),
        Hammer = require('hammer');
    var arrow = $('#arrow');
    // 存到vars变量中,以便其他js调用
    vars.arrow = arrow;

    function Card(data, containner, musicData, versionData, viewerIsvip, designer) {
        this.data = data;
        this.containner = containner;
        this.versionData = versionData;
        this.viewerIsvip = viewerIsvip;
        if (musicData) {
            this.music = musicData;
            if (musicData.id) {
                // //js.h5.test.fang.com/music/76699.mp3
                this.musicsrc = vars.imgUrlReg.test(musicData.id) ? musicData.id : vars.imgSite + 'music/' + musicData.id + '.mp3';
            } else {
                // //js.h5.test.fang.com/webMusic/The_Bandit.mp3
                this.musicsrc = vars.imgUrlReg.test(musicData.name) ? musicData.name : vars.imgSite + 'webMusic/' + musicData.name;
            }
        }
        this.designer = designer;
        this.init(data);
    }

    Card.prototype = {

        ensureCanvas: function () {
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

        /**
         * 初始化页面数据
         * @param data 所有数据
         * @returns {boolean}
         */
        init: function (data) {
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
        loadPage: function (data, n) {
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
         * 初始化上拉动画效果
         * @param e 当前页效果
         */
        initpanUpAnimations: function (e) {
            var t = this.pages[vars.current + 1].page[0];
            var n = this.pages[vars.current].page[0];
            this.panUpAnimations = [];
            // 当前页的离开动画
            this.panUpAnimations.push(Pageeffect.getLeaveEffect(e.pageeffect, n));
            // 下一页的入场动画
            this.panUpAnimations.push(Pageeffect.getEntryEffect(e.pageeffect, t));
        },

        /**
         * 初始化下拉动画效果
         * @param e 当前页效果
         */
        initpanDownAnimations: function (e) {
            e = this.pages[vars.current - 1];
            var t = this.pages[vars.current].page[0];
            this.panDownAnimations = [];
            this.panDownAnimations.push(Pageeffect.getBackEffect(e.pageeffect, e.page[0]));
            this.panDownAnimations.push(Pageeffect.getOutEffect(e.pageeffect, t));
        },

        /**
         * 是否有下一页
         * @returns {boolean}
         */
        hasNextPage: function () {
            if (vars.current >= vars.pageNum - 1) {
                return false;
            }
            return true;
        },
        debouncedCallback: function (e, t) {
            var n = t;
            return function () {
                n--;
                e();
            };
        },

        /**
         * 过渡到下一页
         * @param e 回调函数
         */
        animateToNextPage: function (e) {
            var t = this.panUpAnimations ? this.panUpAnimations.length : 1;
            var n = this.debouncedCallback(e, t);
            for (var name in this.panUpAnimations) {
                if (this.panUpAnimations.hasOwnProperty(name)) {
                    this.panUpAnimations[name] && this.panUpAnimations[name].finish(n);
                }
            }
            this.panUpAnimations = null;
            this.panDownAnimations = null;
        },

        /**
         * 过渡到上一页
         * @param e 回调函数
         */
        animateToPrevPage: function (e) {
            var t = this.panDownAnimations ? this.panDownAnimations.length : 1;
            var n = this.debouncedCallback(e, t);
            for (var name in this.panDownAnimations) {
                if (this.panDownAnimations.hasOwnProperty(name)) {
                    this.panDownAnimations[name] && this.panDownAnimations[name].finish(n);
                }
            }
            this.panUpAnimations = null;
            this.panDownAnimations = null;
        },

        /**
         * 拖动处理
         * @param ev 事件对象
         */
        onPan: function (ev) {
            ev.preventDefault();
            var t = vars.screen.height;
            // var t = window.innerHeight;
            var n = ev.deltaY / t;
            // 下一页
            var nP = this.pages[vars.current + 1];
            var i;
            if (nP) {
                i = nP.page;
            }
            // 上一页
            var pP = this.pages[vars.current - 1];
            var o;
            if (pP) {
                o = pP.page;
            }

            // 当前页
            var a = this.pages[vars.current];
            if (a.pan === 'yes') {
                // 往上拖拽，有上拉动画，有下一页，处在拖拽过程中
                if (ev.deltaY < 0 && !this.panUpAnimations && this.hasNextPage() && !ev.isFinal) {
                    // 初始化上移动画
                    // console.log('在上拽过程中，并且上拽动画不存在');
                    this.initpanUpAnimations(a);
                } else if (ev.deltaY > 0 && !this.panDownAnimations && vars.current > 0 && !ev.isFinal) {
                    this.initpanDownAnimations(a);
                    // console.log('在下拉过程中，并且下拉动画不存在');
                }
                // 如果移动的距离的大于或者小于一屏都按照一屏来算
                n > 1 ? n = 1 : -1 > n && (n = -1);
                var r = ev.changedPointers[0].clientX < 4 || ev.changedPointers[0].clientX > vars.screen.width - 4;
                var u = ev.changedPointers[0].clientY < 4 || ev.changedPointers[0].clientY > vars.screen.height - 4;
                // 当touch的点在屏幕边缘时，强制停止
                if (!vars.isPc && (r || u)) {
                    // console.log(ev.changedPointers[0].clientX + "x" + vars.screen.width + "y" + ev.changedPointers[0].clientY);
                    this.hammerPages.stop();
                    ev.isFinal = true;
                }
                // 拖拽完成时
                if (ev.isFinal) {
                    // 此时上拽到大于1/5屏幕时或者上拽速度大于0.5px/ms时，显示下一页
                    if (-0.2 > n || ev.velocityY > 0.5) {
                        // console.log('ev.velocityY: ' + ev.velocityY);
                        // console.log('完全显示下一页');
                        this.nextpage();
                        // 上拽没有超过屏幕的1/5的时候
                    } else if (0 > n) {
                        // console.log('上拽完成，但是上拽没超过屏幕1/5');
                        for (var name0 in this.panUpAnimations) {
                            if (this.panUpAnimations.hasOwnProperty(name0)) {
                                this.panUpAnimations[name0] && this.panUpAnimations[name0].rollback();
                            }
                        }
                        this.panUpAnimations = null;
                        // 下拉到大于1/5屏幕时或者速度下拉速度大于0.5px/ms时，显示下一页
                    } else if (n > 0.2 || ev.velocityY < -0.5) {
                        // console.log('完全显示上一页');
                        this.prevpage();
                    } else {
                        // console.log('下拉完成，但是下拉没超过屏幕1/5');
                        for (var name1 in this.panDownAnimations) {
                            if (this.panDownAnimations.hasOwnProperty(name1)) {
                                this.panDownAnimations[name1] && this.panDownAnimations[name1].rollback();
                            }
                        }
                        this.panDownAnimations = null;
                    }
                    // 如果正在往上拽并且上拽超过屏幕1/10时
                } else if (0 > n && -0.1 > n) {
                    // console.log('显示下一页');
                    // 显示下一页
                    if (i) {
                        if (!nP.hide) {
                            nP.hidePageElement();
                        }
                        i.show();
                        for (var name3 in this.panUpAnimations) {
                            if (this.panUpAnimations.hasOwnProperty(name3)) {
                                this.panUpAnimations[name3] && this.panUpAnimations[name3].setValue(-n);
                            }
                        }
                        // console.log(this.panUpAnimations);
                        for (var name4 in this.panDownAnimations) {
                            if (this.panDownAnimations.hasOwnProperty(name4)) {
                                this.panDownAnimations[name4] && this.panDownAnimations[name4].setValue(0);
                            }
                        }
                    }
                    // 如果正在往下拉并且下拉大于屏幕的1/10
                } else if (n > 0 && n > 0.1) {
                    // console.log('显示上一页');
                    // 显示前一页
                    if (o) {
                        if (!pP.hide) {
                            pP.hidePageElement();
                        }
                        o.show();
                        for (var name5 in this.panDownAnimations) {
                            if (this.panDownAnimations.hasOwnProperty(name5)) {
                                this.panDownAnimations[name5] && this.panDownAnimations[name5].setValue(n);
                            }
                        }
                        for (var name6 in this.panUpAnimations) {
                            if (this.panUpAnimations.hasOwnProperty(name6)) {
                                this.panUpAnimations[name6] && this.panUpAnimations[name6].setValue(0);
                            }
                        }
                    }
                }
            }
        },

        /**
         * 初始化绑定事件
         */
        initswipeaction: function () {
            if (typeof this.containner === 'undefined') return;
            var that = this;
            that.hammerPages = new Hammer.Manager(vars.isPc ? document.body : that.containner[0]);
            var n = new Hammer.Pan();
            n.set({
                direction: Hammer.DIRECTION_VERTICAL,
                preventDefault: true
            });
            that.hammerPages.add(n);
            that.hammerPages.get('pan').set({
                direction: Hammer.DIRECTION_VERTICAL
            });
            that.hammerPages.on('pan', function (ev) {
                that.onPan(ev);
            });
        },
        start: function (e, t, n) {
            var that = this;
            if (typeof this.pages === 'undefined' || !this.pages[e]) return;
            if (typeof t === 'undefined') {
                this.pages[e].page.show();
                if (this.pages[e].pan === 'no' || !this.pages[e + 1]) {
                    arrow.hide();
                } else {
                    arrow.show();
                }
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
                    vars.arrow.hide();
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
        nextpage: function (fn) {
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
            if (vars.current === vars.pageNum - 2 || nextP.pan === 'no' || nextP.iframe) {
                arrow.hide();
            } else {
                arrow.show();
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
                setTimeout(function () {
                    if (that.pages[vars.current].chartEle) {
                        tools.render(that.pages[vars.current].charts, that.pages[vars.current].chartEle.element);
                    }
                }, 500);
            }
            // 判断是否含视频，切换页面视频暂停播放
            if (video.length) {
                video.each(function (index, element) {
                    element.pause();
                    $(element).next().fadeIn(300);
                });
            }
            //  不使用插件
            if (nextVideo.length) {
                var videoData = this.pages[vars.current + 1].videoarr,
                    len = videoData.length;
                for (var i = 0; i < len; i++) {
                    if (videoData[i].autoplay && videoData[i].autoplay === 'auto') {
                        nextVideo[i].currenTime = 0;
                        nextVideo[i].play();
                        document.webkitCancelFullScreen && document.webkitCancelFullScreen();
                        nextVideo[i].webkitPlaysinline = true;
                        $(nextVideo[i]).next().hide();
                        videoData[i].autoplay = 'false';
                    }
                }
            }
            if (!this.panUpAnimations) {
                this.initpanUpAnimations(nowP);
            }

            nextPage.show();
            this.animateToNextPage(function () {
                nowPage.hide();
                // 等待插件运行元素效果结束执行css设为空
                setTimeout(function () {
                    nowPage.css('transform', '');
                }, 0);
                if (!nowP.hide) {
                    nowP.hidePageElement();
                }
                nextP.showPageInAnimation();
                that.panUpAnimations = null;
                // 判断下一页是否有图集
                if (nextP.swiperJson) {
                    if (!nextP.swiperPhotos) {
                        nextP.swiperPhotos = new Swiper(nextP.swiperBox, nextP.swiperJson);
                    } else {
                        nextP.swiperPhotos.init();
                    }
                }
            });
            if (vars.current < this.pages.length) {
                vars.current++;
            }
            fn && fn();
        },

        /**
         * 上一页
         * @param fn
         */
        prevpage: function (fn) {
            var that = this;
            if (vars.current === 0) {
                return false;
            }
            var currentP = this.pages[vars.current],
                current = currentP.page,
                preP = this.pages[vars.current - 1],
                pre = preP.page;
            if (preP.pan === 'no' || preP.iframe) {
                arrow.hide();
            } else {
                arrow.show();
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
                setTimeout(function () {
                    if (that.pages[vars.current].chartEle) {
                        tools.render(that.pages[vars.current].charts, that.pages[vars.current].chartEle.element);
                    }
                }, 500);
            }
            var video = current.find('video'),
                preVideo = pre.find('video');
            // 判断是否含视频，切换页面视频暂停播放
            if (video.length) {
                video.each(function (index, element) {
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
            if (!this.panDownAnimations) {
                this.initpanDownAnimations(currentP);
            }
            pre.show();
            this.animateToPrevPage(function () {
                current.hide();
                setTimeout(function () {
                    current.css('transform', '');
                }, 0);
                if (!currentP.hide) {
                    currentP.hidePageElement();
                }
                // console.log(currentP.zIndex + 'hide');
                preP.showPageInAnimation();
                that.panDownAnimations = null;
                // 判断上一页是否有图集
                if (preP.swiperJson) {
                    if (!preP.swiperPhotos) {
                        preP.swiperPhotos = new Swiper(preP.swiperBox, preP.swiperJson);
                    } else {
                        preP.swiperPhotos.init();
                    }
                }
            });
            if (vars.current > 0) {
                vars.current--;
            }
            fn && fn();
        },
        fitscreen: function (scale, t) {
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