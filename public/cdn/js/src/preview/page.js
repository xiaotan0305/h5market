/**
 * Created by liyy on 2015/8/31.
 * @Last Modified by:   tankunpeng
 * @Last Modified time: 2016/1/5
 */
define('page', ['jquery', 'jqueryTransit', 'eleAnimation', 'tools'], function (require) {
    'use strict';
    var vars = seajs.data.vars;

    var $ = require('jquery'),
        tools = require('tools'),
        eleAnimation = require('eleAnimation');
    var arrow = $('#arrow');
    require('jqueryTransit');

    function Page(data, i) {
        this.zIndex = 999 - i;
        this.elearray = [];
        this.videoarr = [];
        this.toPage = [];
        this.checkBox = [];
        this.data = data;
        this.bgpic = data.bgpic ? data.bgpic : null;
        this.pageeffect = data.effect ? data.effect : 'cubedown';
        this.pan = data.pan ? data.pan : 'yes';
        this.init(data);
    }

    Page.prototype = {

        /**
         * 页面初始化
         * @param data 页面原始数据
         */
        init: function (data) {
            var that = this;
            this.page = $('<div class="page"> </div>');
            this.pagebg = $('<div class="pagebg"></div>');
            this.pagecontent = $('<div class="pagecontent"></div>');

            this.page.css({
                'z-index': this.zIndex
            });
            this.pagebg.css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: '0',
                left: '0',
                overflow: 'hidden',
                backgroundColor: data.bgcolor
            });

            // 背景图片
            if (this.bgpic) {
                this.bgimg = this.imgfilter(this.bgpic);
                this.pagebgimg = $('<img  src="' + this.bgimg + '"/>');
                this.pagebgimg.css({
                    position: 'absolute',
                    opacity: data.opacity,
                    left: that.scale(data.bgpicleft,'left'),
                    top: that.scale(data.bgpictop,'top'),
                    width: data.bgpicwidth ? that.scale(data.bgpicwidth,'width') : '100%',
                    height: data.bgpicheight && data.bgpicheight !== 'auto' ? that.scale(data.bgpicheight,'height') : '100%',
                    '-webkit-filter': 'blur(' + data.blur + 'px)',
                    transform: 'rotate(' + data.rotate + 'deg)',
                    '-webkit-transform': 'rotate(' + data.rotate + 'deg)',
                    'max-width': '640px'
                });
            }
            this.pagebg.append(this.pagebgimg);
            this.pagecontent.css(vars.radio.contentsize);
            for (var key in data.content) {
                if (data.content.hasOwnProperty(key)) {
                    var eleCon = data.content[key];
                    eleCon.index = key;
                    // 如果不在屏幕范围内，忽略
                    if (eleCon.left > 1200 || eleCon.left < -1200) continue;
                    if (eleCon.top > 1200 || eleCon.top < -1200) continue;
                    var eleType = eleCon.type,
                        ele;
                    switch (eleType) {
                        case 'pshape':
                            ele = tools.renderPshape(eleCon);
                            break;
                        case 'ptext':
                        case 'text':
                            ele = tools.renderText(eleCon);
                            break;
                        case 'pic':
                            ele = tools.renderPic(eleCon);
                            break;
                        case 'btn':
                            ele = tools.renderBtn(eleCon);
                            break;
                        case 'pButton':
                            ele = tools.renderPbutton(eleCon);
                            break;
                        case 'slide':
                            this.slideCon = eleCon;
                            this.loadSwiper();
                            break;
                        case 'eleform':
                            ele = tools.renderForm(eleCon);
                            this.page.append(ele.warn);
                            break;
                        case 'charts':
                            this.charts = eleCon;
                            this.loadChart();
                            break;
                        case 'video':
                            ele = tools.renderVideo(eleCon);
                            this.videoarr.push(ele.data);
                            break;
                        // ifreme
                        case 'site':
                            /**
                             * 针对 全景看房和航拍做单独处理
                             * @update tankunpeng 2016/11/18
                             * tour.html 代表全景看房 地址匹配
                             * img360.soufunimg.com 航拍地址匹配
                             * aerialPhotoInfo.htm m站内嵌航拍地址匹配
                             * h5market h5内嵌页
                             */
                            vars.img360Reg = /(tour\.html)|(img360\.soufunimg\.com)|(aerialPhotoInfo\.htm)|(h5market)/;
                            vars.h5market = /(h5market)/;
                            if (vars.img360Reg.test(eleCon.url) && !vars.h5market.test(eleCon.url)) {
                                // 标志是否为全景航拍
                                this.img360 = true;
                            }
                            ele = tools.renderSite(eleCon, data);
                            // 标志当前页面有iframe
                            this.iframe = true;
                            this.ele = ele;
                            break;
                        // 图集
                        case 'slides':
                            this.slideCons = eleCon;
                            this.loadSwipers();
                            break;
                        // 随机数 yangfan
                        case 'rand_button':
                            ele = tools.renderRandButton(eleCon);
                            break;
                    }
                    // 只有文字、图片和形状才可能有点击事件
                    // 增加btn类型点击事件
                    var typeReg = /^(ptext|text|pic|pshape|btn)$/;
                    if (typeReg.test(eleCon.type)) {
                        // 点击事件存在时添加事件
                        if (eleCon.eventType === 'click' && eleCon.eventAction !== 'none') {
                            // 为加载页面做准备,获取要加载页面的页码
                            if (eleCon.eventAction === 'changePage') {
                                that.toPage.push(eleCon.toPage | 0);
                            } else if (eleCon.eventAction === 'show') {
                                that.checkBox.push(eleCon.checkBox);
                            }
                            // 初始化定时器
                            if (typeof eleCon.timer === 'object') {
                                var startVal = eleCon.timer.startVal;
                                // 正计时 初始化为0
                                if (eleCon.timer.name === 'timeKeeper') {
                                    startVal = 0;
                                }
                                if (startVal) {
                                    that.timeReset(startVal);
                                }
                                vars.clock.attr('src', vars.imgSite + 'imgs/icon-watch.png');
                                // background-size: 80px 32px;
                                vars.h5Timer.css({
                                    'background': 'url(' + vars.imgSite + 'imgs/zfz-ying.png) 22px 4px no-repeat',
                                    'background-size': '80px 32px'
                                }).show();
                            }
                            that.eleClick(ele, eleCon);
                        }
                    }
                    if (ele) {
                        this.elearray.push(ele);
                        this.pagecontent.append(ele.elementout);
                        ele = null;
                    }
                }
            }
            // 设置初始隐藏元素属性 initHide
            if (that.checkBox.length) {
                for (var i = 0; i < that.checkBox.length; i++) {
                    for (var j = 0; j < that.checkBox[i].length; j++) {
                        var ele = that.elearray[that.checkBox[i][j]];
                        if (ele) {
                            ele.initHide = true;
                        }

                    }
                }
            }
            // 没有背景数据不显示
            if (data.bgpic || data.bgcolor && data.bgcolor !== '#ffffff') {
                this.page.append(this.pagebg);
            }
            // 没有元素数据不显示
            if (data.content.length) {
                // 解决ios iframe 上端白边问题
                if (this.iframe) {
                    this.pagecontent.css('top', '0');
                }
                this.page.append(this.pagecontent);
            }
        },

        /**
         * 图片地址过滤
         * @param str 字符串
         */
        imgfilter: function (str) {
            return vars.imgUrlReg.test(str) ? str : vars.imgSite + 'imgs/' + str;
        },

        /**
         * 处理silde元素
         */
        loadSwiper: function () {
            var that = this;
            require.async('swiper', function (Swiper) {
                var ele = tools.renderPswiper(that.slideCon, Swiper);
                that.elearray.push(ele);
                that.swiper = ele.swiper;
                that.pagecontent.append(ele.elementout);
                that.swiper.init();
            });
        },

        /**
         * 补全两位数字
         * @param n
         */
        toDou: function (n) {
            n = parseInt(n);
            return n < 10 ? '0' + n : '' + n;
        },

        /**
         * 处理图集sildes元素
         */
        loadSwipers: function () {
            var that = this;
            require.async('swiper', function (Swiper) {
                var ele = tools.renderPswipers(that.slideCons, Swiper);
                // that.elearray.push(ele);
                that.swiperPhotos = ele.swiper;
                that.swiperJson = ele.swiperJson;
                that.swiperBox = ele.elementout;
                that.pagecontent.append(ele.elementout);
            });
        },

        /**
         * 处理chart元素
         */
        loadChart: function () {
            var that = this;
            require.async(['highcharts', 'hammer'], function () {
                var ele = tools.renderCharts(that.charts);
                that.chartEle = ele;
                that.elearray.push(ele);
                that.pagecontent.append(ele.elementout);
            });
        },

        /**
         * text、ptext、pic和shape类型元素点击事件
         * @param ele 元素
         * @param eleCon 元素原始数据
         */
        eleClick: function (ele, eleCon) {
            var that = this;
            ele.element.on('click', {ele: ele, toPage: eleCon.toPage, toUrl: eleCon.toUrl}, function (e) {
                var ele = e.data.ele,
                    toPage = e.data.toPage,
                    toUrl = e.data.toUrl || e.data.url,
                    data = ele.data,
                    imgSrc = ele.imgSrc;
                var len = data.checkBox.length;
                var i = 0;
                switch (data.eventAction) {
                    case 'magnify':
                        // 图片放大
                        require.async(['photoswipe', 'photoswipeUI'], function (PhotoSwipe, PhotoSwipeUI) {
                            var pswpElement = $('.pswp')[0];
                            var slides = [{
                                src: imgSrc,
                                w: data.w,
                                h: data.h
                            }];
                            var options = {
                                history: false,
                                focus: false,
                                maxSpreadZoom: 3,
                                index: 0,
                                showAnimationDuration: 0,
                                hideAnimationDuration: 0
                            };
                            var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI, slides, options);
                            gallery.init();
                        });
                        break;
                    case 'hide':
                        for (i = 0; i < len; i++) {
                            that.elearray[data.checkBox[i]].elementout.fadeOut(500);
                        }
                        break;
                    case 'show':
                        // 判断是否有浮层
                        if (that.data.showFloat && !that.data.created) {
                            that.data.created = true;
                            var flotEle = tools.createFloat();
                            that.pagecontent.append(flotEle);
                        }
                        for (i = 0; i < len; i++) {
                            var element = that.elearray[data.checkBox[i]];
                            if (element) {
                                element.elementout.css('z-index', '1001').fadeIn(500);
                            }
                        }
                        break;
                    case 'changePage':
                        var current = vars.current;

                        // 判断是否有计时器
                        if (typeof data.timer === 'object') {
                            if (typeof vars.timerStartPage !== 'number') {
                                vars.timerStartPage = current;
                            }
                            var json;
                            switch (data.timer.name) {
                                // 倒计时
                                case 'countDown':

                                    vars.timerStartVal = data.timer.startVal;
                                    vars.timerToPage = data.timerToPage;
                                    vars.timerEndPage = data.timerEndPage;
                                    json = {
                                        type: 'countDown',
                                        startVal: vars.timerStartVal,
                                        timerToPage: vars.timerToPage,
                                        timerEndPage: vars.timerEndPage
                                    };
                                    // 最大不能超过60min
                                    if (vars.timerStartVal > 3600) {
                                        console.warn('设置倒计时超过60min');
                                        break;
                                    }
                                    break;
                                // 正计时
                                case 'timeKeeper':
                                    vars.timerEndPage = data.timerEndPage;
                                    json = {
                                        type: 'timeKeeper',
                                        timerEndPage: vars.timerEndPage
                                    };
                                    break;
                            }
                            that.timeUpDown(json);
                        }
                        that.changePage(toPage);
                        break;
                    case 'toUrl':
                        if (toUrl) {
                            if (!/http(s?):\/\//.test(toUrl)) {
                                toUrl = location.protocol + '//' + toUrl;
                            }
                            window.location.href = toUrl;
                        }
                        break;
                }
            });
        },

        /**
         * 跳转页面
         * @param toPage 要跳转的页码
         */
        changePage: function (toPage) {
            var that = this;
            // 跳转页面和当前页面一致时 不做响应
            if (parseInt(toPage) === vars.current) {
                return false;
            }
            var fadeOutString = 'matrix3d(1,0,0,0,0,0,1, 0, 0, -1, 0, 0, 0, 368, 368, 1)';
            var fadeInString = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
            vars.pages[vars.current].page.fadeOut(500).css('transform', fadeOutString);
            vars.pages[toPage].page.show().css('transform', fadeInString);
            vars.pages[vars.current].hidePageElement();
            if (parseInt(toPage) === vars.pageNum - 1 || vars.pages[toPage].pan === 'no') {
                arrow.hide();
            } else {
                arrow.show();
            }

            // 判断是否需要倒计时结束
            if (vars.timerEndPage && vars.timerEndPage.length && vars.upDownTimer) {
                // 正计时 倒计时
                for (var i = 0; i < vars.timerEndPage.length; i++) {
                    if (parseInt(vars.timerEndPage[i]) === parseInt(toPage)) {
                        clearTimeout(vars.upDownTimer);
                        break;
                    }
                }
            }

            // 兼容全景航拍音乐
            if (vars.pages[toPage].img360) {
                vars.setMusic('off');
            }

            vars.pages[toPage].showPageInAnimation();
            // 跳转页面后 加载后续页面
            vars.editorCard.loadPage(vars.editorCard.data, toPage);
            // 判断是否含统计图，有就重新渲染动画
            if (vars.pages[toPage].charts) {
                $(vars.pages[toPage].chartEle.element[0]).html('');
                tools.render(vars.pages[toPage].charts, $(vars.pages[toPage].chartEle.element[0]));
            }
            // 判断跳转页面是否有图集
            if (vars.pages[toPage].swiperJson) {
                if (!vars.pages[toPage].swiperTj) {
                    vars.pages[toPage].swiperTj = new Swiper(vars.pages[toPage].swiperBox, vars.pages[toPage].swiperJson);
                } else {
                    vars.pages[toPage].swiperTj.init();
                }
            }
            vars.current = parseInt(toPage);

            // 定时器重置
            if (vars.current === vars.timerStartPage) {
                that.timeReset(vars.timerStartVal);
            }
        },

        /**
         * 设置定时器
         */
        timeReset: function (val, type) {
            var that = this,
                minute, second;
            val = val || 0;
            minute = that.toDou(parseInt(val / 60));
            second = that.toDou(parseInt(val % 60));
            vars.timeM.html(minute);
            vars.timeS.html(second);
            // 倒计时时间颜色调整
            if (!type) {
                if (val < 10) {
                    vars.gameTime.css('color', 'red');
                } else if (val < 20) {
                    vars.gameTime.css('color', 'yellow');
                } else {
                    vars.gameTime.css('color', 'white');
                }
            }
        },

        /**
         * 计时处理
         * @param  {JSON} json 包含计时信息的对象
         * json = {
                type: 'countDown',
                startVal: vars.timerStartVal,
                timerToPage: vars.timerToPage,
                timerEndPage: vars.timerEndPage
            };
         */
        timeUpDown: function (json) {
            var that = this,
                upNum;

            var type = json.type,
                val = json.startVal,
                toPage = json.timerToPage;
            vars.upDownTimer = null;
            // 定义内部函数 方便重用
            var timeDown = function () {
                that.timeReset(val);
                val--;
                clearTimeout(vars.upDownTimer);
                vars.upDownTimer = setTimeout(function () {
                    if (val >= 0) {
                        timeDown();
                    } else {
                        that.changePage(toPage);
                    }
                }, 1000);
            };
            var timeUp = function () {
                upNum = upNum || 0;
                that.timeReset(upNum, 'timeKeeper');
                upNum++;
                clearTimeout(vars.upDownTimer);
                vars.upDownTimer = setTimeout(function () {
                    timeUp();
                }, 1000);
            };

            if (type === 'countDown') {
                // 倒计时
                timeDown();
            } else if (type === 'timeKeeper') {
                // 正计时
                timeUp();
            }
        },

        /**
         * 加载元素图片(预加载的时候使用)
         * @param e 页面下标
         * @param t Preloader对象
         */
        loadelespic: function (e, t) {
            this.bgpic && t.addpic(this.bgimg);
            for (var ele in this.elearray) {
                if (this.elearray.hasOwnProperty(ele)) {
                    if (this.elearray[ele].eletype === 'pic') {
                        t.addpic(this.elearray[ele].imgSrc);
                    }
                }
            }
        },

        /**
         * 隐藏页面元素
         */
        hidePageElement: function () {
            // 遍历页面中的元素
            $.each(this.elearray, function (index, ele) {
                if (ele.eletype === 'charts' || ele.eletype === 'slide' || ele.eletype === 'slides' || ele.eletype === 'eleform') {
                    ele.elementout.hide();
                } else {
                    eleAnimation.stopAnimation(ele);
                }
            });
            this.hide = true;
        },

        /**
         * 显示页面元素动画效果
         */
        showPageInAnimation: function (callback) {
            // 遍历页面中的元素
            $.each(this.elearray, function (index, ele) {
                // 默认隐藏的元素
                if (ele.initHide) {
                    ele.elementout.hide();
                } else if (ele.eletype === 'charts' || ele.eletype === 'slide' || ele.eletype === 'eleform') {
                    ele.elementout.fadeIn();
                } else if (ele.eletype === 'site') {
                    ele.elementout.fadeIn().scrollTop(0);
                    ele.pageTurn && ele.pageTurn.css('top', ele.pageTurnTop);
                    if (!ele.seajsEmitRuned) {
                        // 发布事件
                        seajs.emit('showSite');
                    }
                } else if (ele.eletype === 'slides') {
                    // ele.elementout.show();
                    if (ele.eledata.auto) {
                        setTimeout(function () {
                            ele.swiper.startAutoplay();
                        }, 4000)

                    }
                } else {
                    eleAnimation.actAnimation(ele);
                }
            });
            this.hide = false;
            callback && callback();
        },

        /**
         * 尺度处理
         * @param e 原始数据
         * @param type 类型 width height left top
         * @returns {string} 处理后数据
         */
        scale: function (e,type) {
            e = parseInt(Math.round(parseInt(e) * (type ? vars.radio.ratio[type] : vars.radio.scaleRatio)));
            return e + 'px';
        },
    };
    return Page;
});
