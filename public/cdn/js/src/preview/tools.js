/**
 * Created by liyy on 2015/12/30.
 * @Last Modified by:   tankunpeng
 * @Last Modified time: 2016/1/5
 */

define('tools', ['jquery', 'hammer', 'smsLogin', 'swiperAni'], function (require) {
    'use strict';
    var vars = seajs.data.vars;
    var $ = require('jquery');
    var smsLogin = require('smsLogin');
    var Hammer = require('hammer'),
        swiperAni = require('swiperAni');
    // 形状文件缓存
    vars.shapesJon = {};
    return {

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

        /**
         * 旋转角度处理
         * @param e 原始数据
         * @returns {string} 处理后数据
         */
        rotate: function (e) {
            return 'rotate(' + e + 'deg)';
        },

        /**
         * 图片地址过滤
         * @param str 字符串
         */
        imgfilter: function (str) {
            return vars.imgUrlReg.test(str) ? str : vars.imgSite + 'imgs/' + str;
        },
        /**
         * 像素处理
         * @param e 原始数据
         * @returns {string} 处理后数据
         */
        addpx: function (e) {
            return parseInt(e) + 'px';
        },

        /**
         * 阴影处理
         * @param e 原始数据
         * @returns {string} 处理后数据
         */
        shadow: function (e) {
            return '0 0 ' + this.addpx(e) + ' black';
        },

        /**
         * 地址处理
         * @param str 原始数据
         * @returns {string} 处理后数据
         */
        url: function (str) {
            var tmpurl;
            if (!str) {
                tmpurl = 'javascript:void(0);';
            } else if (!/^http(s)?/.test(str)) {
                tmpurl = location.protocol + '//' + str;
            } else {
                tmpurl = str;
            }
            return tmpurl;
        },

        /**
         * 是否是gif图
         * @param e
         * @returns {Array|{index: number, input: string}}
         */
        isGif: function (e) {
            var t = /\.gif/i;
            return t.exec(e);
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
         * 倒计时
         * @param obj 元素对象
         * @param data
         */
        getCountDown: function (obj, data) {
            var timeStr = (data.deadline_date + ' ' + data.deadline_time).replace(/-/g, '/');
            obj.oDate = obj.oDate || new Date(timeStr);
            obj.getTime = parseInt((obj.oDate.getTime() - new Date().getTime()) / 1000);
            obj.getDay = this.toDou(parseInt(obj.getTime / 86400));
            obj.getTime1 = obj.getTime % 86400;
            obj.getHours = this.toDou(parseInt(obj.getTime1 / 3600));
            obj.getTime1 = obj.getTime1 % 3600;
            obj.getMinutes = this.toDou(parseInt(obj.getTime1 / 60));
            obj.getSeconds = this.toDou(obj.getTime1 % 60);
            return {
                countDown: obj.getDay + ':' + obj.getHours + ':' + obj.getMinutes + ':' + obj.getSeconds,
                theTime: obj.getTime
            };
        },

        /**
         * 图表初始化
         * @param data
         * @param obj
         */
        render: function (data, obj) {
            var chartIndexLen = data.content.data.length;
            if (data.content.type === 'bar' || data.content.type === 'column' || data.content.type === 'line') {
                switch (data.content.multiple) {
                    case 1:
                        obj.highcharts(this.prepareChartOption(data, 0));

                        obj.find('img').remove();
                        if (chartIndexLen <= 1 || chartIndexLen > 1 && !data.content.data[1].data) {
                            return false;
                        }
                        var oImg = $('<img/>');
                        oImg.css({
                            position: 'absolute',
                            width: '120px',
                            left: '50%',
                            top: '50%',
                            'margin-left': '-60px',
                            'margin-top': '-60px',
                            'z-index': '99',
                            display: 'none'
                        });
                        oImg.attr('src', vars.imgSite + 'imgs/swipewarn.png');
                        obj.append(oImg);
                        obj.find('img').fadeIn(500);
                        setTimeout(function () {
                            obj.find('img').fadeOut(500);
                        }, 2000);
                        break;
                    default :
                        obj.highcharts(this.prepareChartOption(data));
                        break;
                }
            } else if (data.content.type === 'pie') {
                obj.highcharts(this.piePrepareChartOption(data));
            }
        },

        /**
         * 数据格式化
         * @param e
         */
        normalizeData: function (e) {
            var t = e[0].data,
                n = [];
            for (var i in t) {
                if (t.hasOwnProperty(i)) {
                    n.push({
                        name: t[i][0],
                        y: t[i][1]
                    });
                }
            }
            return {
                data: n
            };
        },

        /**
         * 加载图片
         * @param data 图片数据
         */
        renderPic: function (data) {
            var that = this;
            var elementout = $('<div></div>');
            var element = $('<div></div>');
            var elementImg;
            if (data.borderradius && data.borderradius > 0) {
                elementImg = null;
            } else {
                elementImg = $('<img/>');
            }
            elementout.css({
                width: that.scale(data.w),
                height: that.scale(data.h),
                left: that.scale(data.left),
                top: that.scale(data.top,'top'),
                position: 'absolute',
                opacity: data.opacity,
                transform: that.rotate(data.rotate)
            });
            var imgLeft, imgTop, imgWidth;
            if (data.cropData && that.isGif(data.picid)) {
                imgWidth = '100%';
                imgTop = 0;
                imgLeft = 0;
            } else {
                imgWidth = that.scale(data.inw);
                imgTop = that.scale(data.intop);
                imgLeft = that.scale(data.inleft);
            }
            var con;
            if (data.picid) {
                con = that.imgfilter(data.picid);
            } else {
                con = data.con ? data.con : vars.imgSite + 'imgs/ele/loadingpic.jpg';
            }
            element.css({
                position: 'absolute',
                overflow: 'hidden',
                'background-clip': 'padding-box',
                width: '100%',
                height: '100%',
                'border-radius': Math.min(data.borderradius, 50) + '%',
                //'-webkit-border-radius': that.scale(data.borderradius * data.h / 200),
                boxShadow: that.shadow(data.boxshadow)
            });
            // 解决border-radius在安卓机上不兼容的问题,不兼容则设置为背景
            if (data.borderradius && data.borderradius > 0) {
                element.css({
                    'background-image': 'url(' + con + ')',
                    'background-repeat': 'no-repeat',
                    'background-size': imgWidth,
                    'background-position': imgLeft + ' ' + imgTop
                });
            } else {
                elementImg.css({
                    position: 'absolute',
                    width: imgWidth,
                    left: imgLeft,
                    top: imgTop
                });
                elementImg.attr('src', con);
                element.append(elementImg);
            }
            elementout.append(element);
            return {
                eletype: data.type,
                elementout: elementout,
                element: element,
                data: data,
                imgSrc: con
            };
        },

        /**
         * 加载文本
         * @param data
         */
        renderText: function (data) {
            var that = this;
            var elementout = $('<div></div>');
            var element = $('<div></div>');
            data.version >= 21 && element.addClass('no_margin');
            elementout.css({
                position: 'absolute',
                width: that.scale(data.w),
                // width: 'auto',
                top: that.scale(data.top,'top'),
                left: that.scale(data.left),
                height: that.scale(data.height),
                transform: that.rotate(data.rotate),
                opacity: data.opacity
            });
            element.css({
                // position: 'absolute',
                width: '106%',
                height: that.scale(data.height),
                color: data.ftcolor,
                fontSize: that.scale(data.ftsize),
                background: data.bgcolor,
                textAlign: data.textalign,
                fontWeight: data.fontbold ? 'bold' : 'normal',
                textDecoration: data.udl ? 'underline' : 'none',
                lineHeight: data.lineheight,
                borderStyle: data['border-style'],
                borderColor: data['border-color'],
                borderWidth: that.scale(data['border-width']),
                fontStyle: data.fontitalic ? 'italic' : 'normal',
                borderRadius: that.scale(data.borderradius),
                boxShadow: that.shadow(data.boxshadow),
                wordWrap: 'break-word'
            });
            data.fontFamily && element.css({
                'font-family': data.fontFamily
            });
            if ('text' === data.type) {
                var i;
                switch (data.textvalign) {
                    case 'top':
                        i = 0;
                        break;
                    case 'middle':
                        i = data.h / 2 - data.tl / 2;
                        break;
                    case 'bottom':
                        i = data.h - data.tl;
                }
                element.css({
                    marginTop: that.scale(i),
                    height: 'auto'
                });
            }
            element.append(data.con);
            elementout.append(element);
            if ('text' === data.type) {
                var o = element.get(0).firstChild;
                if (o && o.hasChildNodes()) {
                    parseInt(o.style.fontSize) && (o.style.fontSize = that.scale(parseInt(o.style.fontSize)));
                }
            }
            return {
                eletype: data.type,
                elementout: elementout,
                data: data,
                element: element
            };
        },

        /**
         * 加载形状
         * @param data
         */
        renderPshape: function (data) {
            var that = this;
            var elementout = $('<div></div>');
            var element = $('<div></div>');
            elementout.css({
                position: 'absolute',
                width: that.scale(data.w),
                height: that.scale(data.h),
                top: that.scale(data.top),
                left: that.scale(data.left),
                transform: that.rotate(data.rotate)
            });
            element.css({
                position: 'absolute',
                width: that.scale(data.w),
                height: that.scale(data.h)
            });
            var shape,
                xmlSvg = false;
            if (data.shape && data.shape !== 'null' && data.shape !== '0') {
                // 判断shape数据返回是否直接为xml svg 内容
                if(data.shape === 'svgDom') {
                    xmlSvg = true;
                    shape = data.svgDom;
                }else {
                    shape = data.shape.trim().replace(/\//g, '_');
                }
            } else {
                shape = '1.svg';
            }
            // 如果有直接插入
            if (!xmlSvg && vars.shapesJon[shape + 'State'] === 'resolved') {
                that.insertSvg([{
                    name: shape,
                    data: data,
                    ele: element
                }], vars.shapesJon[shape + 'File']);
            }

            if (xmlSvg) {
                that.insertSvg([{
                    data: data,
                    ele: element
                }], shape);
            }else if (!vars.shapesJon[shape + 'State']) {
                $.ajax({
                    url: vars.imgSite + 'imgs/shape/' + shape,
                    type: 'GET',
                    dataType: 'text',
                    async: true,
                    success: function (svg) {
                        // 请求返回文件
                        vars.shapesJon[shape + 'File'] = svg;
                        // 更改状态
                        vars.shapesJon[shape + 'State'] = 'resolved';

                        that.insertSvg(vars.shapesJon[shape], svg);

                    },
                    error: function (e) {
                        vars.shapesJon[shape + 'State'] = 'failed'
                        console.warn('需要新增的shape文件:', shape);
                    }
                });

                // 请求状态 pending: 请求中  resolved: 文件返回  failed: 请求失败
                vars.shapesJon[shape + 'State'] = 'pending';

                // 存svg盒子对象
                vars.shapesJon[shape] = [];
                vars.shapesJon[shape].push({
                    name: shape,
                    data: data,
                    ele: element
                });
            } else if (vars.shapesJon[shape + 'State'] === 'pending') {
                vars.shapesJon[shape].push({
                    name: shape,
                    data: data,
                    ele: element
                });
            }
            elementout.append(element);
            return {
                eletype: data.type,
                elementout: elementout,
                data: data,
                element: element
            };
        },

        /**
         * 插入svg文件
         * @param arr 数组
         * @param svg svg文件
         */
        insertSvg: function (arr, svg) {
            var that = this;
            for (var i = arr.length - 1; i > -1; i--) {
                var data = arr[i].data,
                    element = arr[i].ele;
                var oSvg = element.html(svg).find('svg');
                oSvg.css({
                    position: 'absolute',
                    width: that.scale(data.w),
                    height: that.scale(data.h),
                    opacity: data.opacity
                });
                oSvg.get(0).setAttribute('preserveAspectRatio', 'none meet');
                oSvg.find('[fill]').attr({
                    fill: data.shapecolor
                });
                arr.pop();
            }
        },

        /**
         * 加载按钮
         * @param data
         */
        renderBtn: function (data) {
            var that = this;
            var elementout = $('<div></div>');
            var element = $('<a href="javascript:;"></a>');
            elementout.css({
                position: 'absolute',
                width: that.scale(data.w),
                height: that.scale(data.height),
                top: that.scale(data.top),
                left: that.scale(data.left),
                transform: that.rotate(data.rotate)
            });
            element.css({
                position: 'absolute',
                width: '100%',
                color: data.ftcolor || '#585858',
                fontSize: that.scale(data.ftsize),
                lineHeight: data.lineheight,
                opacity: data.opacity,
                borderStyle: data['border-style'],
                borderColor: data['border-color'],
                borderWidth: that.scale(data['border-width']),
                background: data.bgcolor,
                textAlign: data.textalign,
                borderRadius: that.scale(data.borderradius),
                boxShadow: that.shadow(data.boxshadow),
                textDecoration: 'none',
                wordWrap: 'break-word'
            });
            element.append(data.con);
            var o = element.get(0).firstChild;
            if (o && o.hasChildNodes()) {
                parseInt(o.style.fontSize) && (o.style.fontSize = that.scale(parseInt(o.style.fontSize)));
            }
            elementout.append(element);
            return {
                eletype: data.type,
                elementout: elementout,
                data: data,
                element: element
            };
        },

        /**
         * 加载随机数按钮 yangfan
         * @param data
         */
        renderRandButton: function (data) {
            var that = this;
            var elementout = $('<div></div>');
            var element = $('<a href="javascript:;"></a>');
            elementout.css({
                position: 'absolute',
                width: that.scale(data.w),
                height: that.scale(data.height),
                top: that.scale(data.top),
                left: that.scale(data.left),
                transform: that.rotate(data.rotate)
            });

            element.css({
                position: 'absolute',
                width: '100%',
                color: data.ftcolor || '#585858',
                fontSize: that.scale(data.ftsize),
                lineHeight: data.lineheight,
                opacity: data.opacity,
                borderStyle: data['border-style'],
                borderColor: data['border-color'],
                borderWidth: that.scale(data['border-width']),
                background: data.bgcolor,
                textAlign: data.textalign,
                borderRadius: that.scale(data.borderradius),
                boxShadow: that.shadow(data.boxshadow),
                textDecoration: 'none',
                wordWrap: 'break-word'
            });

            data.fontFamily && element.css({
                'font-family': data.fontFamily
            });

            // 随机整数
            var max = parseInt(data.maxNum) || 0,
                min = parseInt(data.minNum) || 0;
            if (min > max) {
                max = parseInt(data.minNum) || 0,
                min = parseInt(data.maxNum) || 0;
            }
            var num = Math.ceil(Math.random() * (max - min) + min);

            element.append(num);

            var o = element.get(0).firstChild;
            if (o && o.hasChildNodes()) {
                parseInt(o.style.fontSize) && (o.style.fontSize = that.scale(parseInt(o.style.fontSize)));
            }
            elementout.append(element);
            return {
                eletype: data.type,
                elementout: elementout,
                data: data,
                element: element
            };
        },

        /**
         * 加载特殊按钮
         */
        renderPbutton: function (data) {
            var that = this;
            var elementout = $('<div></div>');
            var element = $('<a></a>');
            elementout.css({
                position: 'absolute',
                height: that.scale(data.tl),
                top: that.scale(data.top),
                left: that.scale(data.left),
                transform: that.rotate(data.rotate),
                opacity: data.opacity
            });

            // 如果是跳转链接或者拨打电话类型按钮或互动按钮
            if (data.model_type === 'link' || data.model_type === 'phone' || data.model_type === 'interaction') {
                element.css({
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    animationDuration: data.speed + 'ms'
                });
                // 电话号码格式处理
                if (data.model_type === 'phone' && data.phoneNumber) {
                    data.phoneNumber = data.phoneNumber.replace(/-| /g, '').replace('转', ',').replace('，', ',');
                }
                // 按钮标志
                var contentico = $('<div></div>');
                contentico.css({
                    position: 'absolute',
                    width: that.scale(data.picwidth),
                    height: that.scale(data.picheight)
                });
                // 按钮文字
                var contentText = $('<div></div>');
                contentText.css({
                    position: 'absolute',
                    left: that.scale(data.picwidth),
                    width: that.scale(data.width),
                    fontSize: that.scale(data.ftsize),
                    color: data.ftcolor,
                    lineHeight: that.scale(data.lineheight),
                    paddingLeft: '5px'
                });
                var svgId = data.pic_id ? data.pic_id.match(/./)[0] : '';
                // 用于存已经请求过来的svg,防止重复ajax请求
                vars.svgJson = vars.svgJson || {};
                // 按钮id
                var buttonID = data.button_id;
                // 获取点赞cookie值
                if (data.model_type === 'interaction') {
                    var clicked = that.getCookie(vars.projectID + '_' + buttonID);
                    // 调整svnID
                    if (clicked) {
                        // svg命名规则为 点击过后的svg文件名多一个 'a'
                        svgId = svgId + 'a';
                    }
                }
                if (svgId && !vars.svgJson['svg_' + svgId]) {
                    $.ajax({
                        url: vars.imgSite + 'imgs/buttonSvg/' + svgId + '.svg',
                        type: 'GET',
                        async: false,
                        dataType: 'text',
                        success: function (svg) {
                            var $svg = $(svg);
                            $svg.css({
                                width: that.scale(data.picwidth),
                                height: that.scale(data.picheight)
                            }).find('[fill]').attr({
                                fill: data.ftcolor
                            });
                            vars.svgJson['svg_' + svgId] = svg;
                            contentico.append($svg);
                        }
                    });
                } else {
                    var $svg = $(vars.svgJson['svg_' + svgId]);
                    $svg.css({
                        width: that.scale(data.picwidth),
                        height: that.scale(data.picheight)
                    }).find('[fill]').attr({
                        fill: data.ftcolor
                    });
                    contentico.append($svg);
                }
                if (data.model_type === 'link') {
                    element.attr({
                        href: that.url(data.url)
                    });
                } else if (data.model_type === 'phone') {
                    data.phoneNumber && element.attr('href', 'tel:' + data.phoneNumber);
                }
                contentText.text((clicked ? clicked : data.con));
                element.append(contentico);
                element.append(contentText);
            } else if (data.model_type === 'count_down') {
                element.css({
                    position: 'absolute',
                    width: '100%',
                    animationDuration: data.speed + 'ms',
                    textAlign: 'center',
                    color: data.ftcolor,
                    lineHeight: that.scale(data.lineheight),
                    fontSize: that.scale(data.ftsize)
                });
                var timeEle = element.get(0);
                element.append(that.getCountDown(timeEle, data).countDown);
                clearInterval(timeEle.timer);
                timeEle.timer = setInterval(function () {
                    element.html(that.getCountDown(timeEle, data).countDown);
                    if (that.getCountDown(timeEle, data).theTime < 0) {
                        clearInterval(timeEle.timer);
                        element.html('00:00:00:00');
                    }
                }, 1000);
            }
            elementout.append(element);
            element.on('click', {contentico: contentico, contentText: contentText}, function (ev) {
                var contentico = ev.data.contentico,
                    contentText = ev.data.contentText;
                if (data.model_type === 'phone') {
                    window.location.href = 'tel://' + data.phoneNumber;
                } else if (data.model_type === 'link' && data.url) {
                    window.location.href = that.url(data.url);
                } else if (data.model_type === 'interaction') {
                    // 点赞后台请求数量 clicked 是否点击的cookie
                    var clicked = that.getCookie(vars.projectID + '_' + buttonID);
                    if (!clicked) {
                        $.ajax({
                            type: 'get',
                            url: vars.phoneSite,
                            cache: false,
                            dataType: 'json',
                            data: {
                                c: 'web',
                                a: 'ajaxVote',
                                id: vars.projectID,
                                voteId: data.button_id,
                                name: data.projectName
                            },
                            success: function (e) {
                                var $svg;
                                if (e.errcode === 1) {
                                    if (svgId && !vars.svgJson['svg_' + svgId + 'a']) {
                                        // 请求svg文件
                                        $.ajax({
                                            url: vars.imgSite + 'imgs/buttonSvg/' + svgId + 'a.svg',
                                            type: 'GET',
                                            dataType: 'text',
                                            success: function (svg) {
                                                $svg = $(svg);
                                                $svg.css({
                                                    width: that.scale(data.picwidth),
                                                    height: that.scale(data.picheight)
                                                }).find('[fill]').attr({
                                                    fill: data.ftcolor
                                                });
                                                vars.svgJson['svg_' + svgId + 'a'] = svg;
                                                // 更新cookie 因为是同步,所以必须把更新图标的操作写在这里
                                                if (e.counts) {
                                                    that.setCookie(vars.projectID + '_' + buttonID, e.counts);
                                                    contentico.html($svg);
                                                    contentText.html(e.counts);
                                                }
                                            }
                                        });
                                    } else {
                                        $svg = $(vars.svgJson['svg_' + svgId + 'a']);
                                        $svg.css({
                                            width: that.scale(data.picwidth),
                                            height: that.scale(data.picheight)
                                        }).find('[fill]').attr({
                                            fill: data.ftcolor
                                        });
                                        // 更新cookie
                                        if (e.counts) {
                                            that.setCookie(vars.projectID + '_' + buttonID, e.counts);
                                            contentico.html($svg);
                                            contentText.html(e.counts);
                                        }
                                    }
                                } else {
                                    console.log(e.errmsg);
                                }
                            },
                            error: function (err) {
                                console.log('网络错误:', err);
                            }
                        });
                    }
                }
            });
            return {
                eletype: data.type,
                elementout: elementout,
                data: data,
                element: element
            };
        },

        /**
         * 加载轮播图片
         * @param data
         * @param Swiper
         */
        renderPswiper: function (data, Swiper) {
            var that = this;
            var imgData = [];
            var slider, n, i, container = $('<div class="swiper-container" style="z-index: 0"></div>'),
                wrapper = $('<div class="swiper-wrapper"></div>'),
                pagination = $('<div class="swiper-pagination"></div>');
            container.css({
                position: 'absolute',
                width: that.scale(data.width),
                height: that.scale(data.height),
                left: that.scale(data.left),
                top: that.scale(data.top),
                overflow: 'hidden'
            });
            container.append(wrapper);
            container.append(pagination);
            data.data.map(function (container) {
                var imgDom = $('<img/>');
                imgDom.attr('src', that.imgfilter(container.picid));
                slider = $('<div class="swiper-slide"></div>');
                pagination.append('<span class="swiper-pagination-bullet"></span>');
                var describe = $('<div></div>');
                imgDom.css({
                    position: 'absolute',
                    width: container.inw ? that.scale(container.inw) : '',
                    height: container.inh ? that.scale(container.inh) : '',
                    left: container.inleft ? that.scale(container.inleft) : '',
                    top: container.intop ? that.scale(container.intop) : ''
                });

                // 收集放大图片数据
                imgData.push({
                    src: imgDom.attr('src'),
                    w: container.inw ? parseInt(that.scale(container.inw)) : parseInt(that.scale(data.picWidth)),
                    h: container.inh ? parseInt(that.scale(container.inh)) : parseInt(that.scale(data.picHeight)),
                    msrc: vars.imgSite + 'imgs/preloader.gif'
                });
                slider.css({
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    background: '#ffffff',
                    lineHeight: '1.5'
                });
                describe.css({
                    position: 'absolute',
                    overflow: 'hidden',
                    width: that.scale(data.picWidth),
                    height: that.scale(data.picHeight)
                });
                describe.append(imgDom);
                slider.append(describe);
                if (container.titleText) {
                    n = $('<div></div>');
                    n.css({
                        position: 'absolute',
                        width: that.scale(container.titleText.width),
                        left: that.scale(container.titleText.left),
                        top: that.scale(container.titleText.top),
                        fontSize: that.scale(container.titleText.fontsize),
                        lineHeight: container.titleText.lineheight,
                        color: container.titleText.fontcolor
                    });
                    n.append(container.titleText.con);
                    slider.append(n);
                }
                if (container.contentText) {
                    i = $('<div></div>');
                    if (container.contentText.opacity) {
                        i.css({
                            position: 'absolute',
                            width: '100%',
                            height: '150px',
                            top: that.scale(container.contentText.top),
                            fontSize: that.scale(container.contentText.fontsize),
                            lineHeight: container.contentText.lineheight,
                            color: container.contentText.fontcolor,
                            textAlign: 'center',
                            background: 'black',
                            opacity: container.contentText.opacity
                        });
                    } else {
                        i.css({
                            position: 'absolute',
                            width: that.scale(container.contentText.width),
                            left: that.scale(container.contentText.left),
                            top: that.scale(container.contentText.top),
                            fontSize: that.scale(container.contentText.fontsize),
                            lineHeight: container.contentText.lineheight,
                            color: container.contentText.fontcolor
                        });
                    }
                    i.append(container.contentText.con);
                    slider.append(i);
                }
                wrapper.append(slider);
            });

            // 图片放大
            require.async(['photoswipe', 'photoswipeUI'], function (PhotoSwipe, PhotoSwipeUI) {
                var pswpElement = $('.pswp')[0];
                // 图片放大后下标
                var imgindex = 0;
                wrapper.off('click', '.swiper-slide');
                wrapper.on('click', '.swiper-slide', function () {
                    imgindex = $(this).index();
                    var options = {
                        history: false,
                        focus: false,
                        index: imgindex,
                        showAnimationDuration: 0,
                        hideAnimationDuration: 0
                    };
                    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI, imgData, options);
                    gallery.init();
                });
            });
            var mySwiper = new Swiper(container, {
                pagination: pagination,
                paginationClickable: true,
                spaceBetween: 60,
                speed: 600,
                longSwipesRatio: 0.3,
                loop: true,
                observer: true,
                observeParents: true,
                onTouchStart: function (swiper) {
                    swiper.update();
                }
            });
            return {
                elementout: container,
                swiper: mySwiper,
                wrapper: wrapper,
                pagination: pagination,
                eletype: data.type
            };
        },

        /**
         * 加载图集图片
         * @param data
         * @param Swiper
         */
        renderPswipers: function (data, Swiper) {
            var that = this;
            var slider, n, i, container = $('<div class="swiper-container" style="z-index: 0"></div>'),
                wrapper = $('<div class="swiper-wrapper"></div>');

            var autoplay = data.animation.auto === 'true' ? data.animation.changeTime : 0;
            var speed = data.animation.speed ? data.animation.speed : 0.3;
            var effect = data.animation.show || 'slide';
            var swiperEffect = '';
            // swiper 默认效果
            var reg = /^(slide|fade|cube|coverflow|flip)$/;
            // 如果不是swiper默认效果 设置效果为fade
            if (reg.test(effect)) {
                swiperEffect = effect;
            } else {
                swiperEffect = 'slide';
            }
            container.css({
                position: 'absolute',
                width: that.scale(data.width),
                height: that.scale(data.height),
                left: that.scale(data.left),
                top: that.scale(data.top),
                overflow: 'hidden',
                'z-index': 10
            });
            container.append(wrapper);
            data.data.map(function (container) {
                var imgDom = $('<img/>');
                imgDom.attr('src', that.imgfilter(container.picid));
                slider = $('<div class="swiper-slide" ></div>');
                var describe = $('<div></div>');
                // 如果不是swiper默认效果 就添加class
                if (!reg.test(effect)) {
                    describe.addClass('ani').attr({
                        'swiper-animate-effect': effect,
                        'swiper-animate-duration': speed + 's',
                        'swiper-animate-delay': 0
                    });
                }

                imgDom.css({
                    position: 'absolute',
                    width: container.inw ? that.scale(container.inw) : '',
                    height: container.inh ? that.scale(container.inh) : '',
                    left: container.inleft ? that.scale(container.inleft) : '',
                    top: container.intop ? that.scale(container.intop) : ''
                });

                slider.css({
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    lineHeight: '1.5'
                });
                describe.css({
                    position: 'absolute',
                    overflow: 'hidden',
                    width: that.scale(data.picWidth),
                    height: that.scale(data.picHeight)
                });
                describe.append(imgDom);
                slider.append(describe);
                wrapper.append(slider);
            });
            var swiperJson = {
                speed: reg.test(effect) ? speed * 1000 : 10,
                longSwipesRatio: 0.3,
                loop: reg.test(effect) ? true : false,
                autoplay: autoplay * 1000,
                autoplayDisableOnInteraction: false,
                effect: swiperEffect,
                observer: true,
                observeParents: true,
                onInit: function (swiper) {
                    if (!reg.test(effect)) {
                        swiperAni.swiperAnimateCache(swiper);
                        swiperAni.swiperAnimate(swiper);
                    }
                },
                onSlideChangeEnd: function (swiper) {
                    if (!reg.test(effect)) {
                        swiperAni.swiperAnimate(swiper);
                    }
                }
            };
            return {
                elementout: container,
                swiper: null,
                swiperJson: swiperJson,
                wrapper: wrapper,
                eletype: data.type,
                eledata: data.animation
            };
        },

        /**
         * 加载图表
         * @param data
         * @returns {object} data、element、elementout、type
         */
        renderCharts: function (data) {
            var that = this;
            var elementout = $('<div class="chart-wrapper"></div>');
            var element = $('<div class="chart"></div>');
            var chartHeard = $('<div class="chart-swipe-legend"></div>');
            // var chartData = [data.content.data[0]];
            var chartIndex = 0;
            var chartIndexLen = data.content.data.length;
            var multiple = data.content.multiple ? data.content.multiple : 2;
            data.w = data.w || 640;
            data.h = data.h || (data.content.type === 'pie' ? 640 : 450);
            elementout.css({
                position: 'absolute',
                width: that.scale(data.w),
                height: that.scale(data.h),
                left: that.scale(data.left),
                top: that.scale(data.top),
                background: 'rgba(0,0,0,0)'
            });
            element.css({
                position: 'absolute',
                width: that.scale(data.w),
                height: that.scale(data.h),
                left: '0',
                top: multiple === 1 && data.content.type !== 'pie' ? 50 : 0
            });
            chartHeard.css({
                position: 'absolute',
                width: that.scale(data.w),
                height: that.scale(data.h),
                left: that.scale(data.left),
                top: '9px',
                'text-align': 'center',
                background: 'rgba(0,0,0,0)'
            });
            // 统计表
            setTimeout(function () {
                that.render(data, element);
            }, 1500);
            // 图标样式属性 1：逐条显示，2:全部显示,3:只有column类型有，重叠全部显示
            switch (multiple) {
                case 1:
                    // 图标头部，逐条显示时需要
                    if (data.content.type === 'bar' || data.content.type === 'column' || data.content.type === 'line') {
                        var heardDate = data.content.data;
                        for (var i = 0, len = heardDate.length; i < len; i++) {
                            var oSpan = $('<span class="swipe-legend-title"></span>');
                            oSpan.css({
                                margin: '7px',
                                'font-size': '12px',
                                opacity: '0.3',
                                color: 'rgb(152, 152, 152)'
                            });
                            if (i === 0) {
                                oSpan.css({
                                    'font-size': '16px',
                                    opacity: '1'
                                });
                            } else {
                                oSpan.css({
                                    'font-size': '12px',
                                    opacity: '0.3'
                                });
                            }
                            oSpan.html(heardDate[i].name);
                            chartHeard.append(oSpan);
                        }
                        elementout.append(chartHeard);
                        // 图表点击切换
                        chartHeard.on('click', 'span', function () {
                            chartIndex = $(this).index();
                            $(this).css({
                                'font-size': '16px',
                                opacity: '1'
                            }).siblings().css({
                                'font-size': '12px',
                                opacity: '0.3'
                            });
                            element.highcharts(that.prepareChartOption(data, chartIndex));
                        });
                        // 图表切换
                        var hammertime = new Hammer(element[0]);
                        hammertime.on('swipeleft', function () {
                            if (chartIndexLen === 1 || chartIndexLen > 1 && !data.content.data[1].data) {
                                return false;
                            }
                            chartIndex++;
                            chartHeard.find('span').css({
                                'font-size': '12px',
                                opacity: '.3'
                            }).eq(chartIndex % chartIndexLen).css({
                                'font-size': '16px',
                                opacity: '1'
                            });
                            element.highcharts(that.prepareChartOption(data, chartIndex % chartIndexLen));
                        });
                        hammertime.on('swiperight', function () {
                            if (chartIndexLen === 1 || chartIndexLen > 1 && !data.content.data[1].data) {
                                return false;
                            }
                            chartIndex %= chartIndexLen;
                            chartIndex--;
                            if (chartIndex < 0) {
                                chartIndex = chartIndexLen - 1;
                            }
                            chartHeard.find('span').css({
                                'font-size': '12px',
                                opacity: '.3'
                            }).eq(chartIndex).css({
                                'font-size': '16px',
                                opacity: '1'
                            });
                            element.highcharts(that.prepareChartOption(data, chartIndex));
                        });
                    }
                    break;
                default :
                    // chartData = data.content.data;
                    break;
            }
            elementout.append(element);
            return {
                elementout: elementout,
                eletype: data.type,
                data: data,
                element: element,
                chartHeard: chartHeard
            };
        },

        /**
         * 图表非饼图参数处理
         * @param data
         * @param e
         */
        prepareChartOption: function (data, e) {
            var that = this;
            var dataContent = data.content,
                dataOptions = data.content.options,
                fontSize = '12px',
                lineColor = dataOptions.lineColor || 'gray',
                multiple = dataContent.multiple === 3 ? 'normal' : null,
                dataSeries = e === undefined ? dataContent.data : [dataContent.data[e]],
                colorsArr = e === undefined ? dataOptions.colors : [dataOptions.colors[e]],
                chartOptions = {
                    chart: {
                        type: dataContent.type,
                        backgroundColor: dataOptions.backgroundColor,
                        plotBorderWidth: 0,
                        spacingLeft: -5,
                        animation: {
                            duration: 300
                        }
                    },
                    title: {
                        text: null
                    },
                    colors: colorsArr,
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        style: {
                            fontSize: fontSize
                        }
                    },
                    plotOptions: {
                        series: {
                            animation: true,
                            stacking: multiple,
                            lineWidth: 2
                        },
                        column: {
                            borderColor: '',
                            shadow: false,
                            stacking: multiple
                        },
                        line: {
                            dataLabels: {
                                enabled: true
                            }
                        },
                        bar: {
                            borderWidth: 0,
                            stacking: multiple
                        },
                        area: {
                            stacking: 'normal'
                        }
                    },
                    xAxis: {
                        lineColor: lineColor,
                        gridLineColor: lineColor,
                        categories: dataOptions.xAxis.categories,
                        tickColor: lineColor,
                        labels: {
                            staggerLines: 0,
                            distance: 10,
                            style: {
                                paddingTop: '10px',
                                fontSize: fontSize,
                                color: lineColor
                            }
                        }
                    },
                    yAxis: {
                        lineColor: lineColor,
                        gridLineColor: lineColor,
                        max: dataOptions.yAxis.max,
                        min: dataOptions.yAxis.min,
                        tickPixelInterval: parseInt(that.scale(100)),
                        title: {
                            text: dataOptions.yAxis.title.text,
                            style: {
                                color: lineColor
                            },
                            x: 5
                        },
                        labels: {
                            style: {
                                fontSize: fontSize,
                                color: lineColor
                            },
                            x: -5
                        }
                    },
                    size: {
                        width: that.scale(data.w - 8),
                        height: that.scale(data.h)
                    },
                    series: dataSeries,
                    legend: {
                        symbolWidth: 12,
                        symbolHeight: 12,
                        itemStyle: {
                            fontSize: fontSize
                        }
                    }
                };
            return chartOptions;
        },

        /**
         * 图表饼图参数处理
         * @param data
         * @param e
         */
        piePrepareChartOption: function (data, e) {
            var dataContent = data.content,
                dataOptions = data.content.options,
                fontSize = '12px',
                lineColor = dataOptions.lineColor || 'gray',
                dataSeries = e === undefined ? this.normalizeData(dataContent.data) : this.normalizeData([dataContent.data[e]]),
                colorsArr = dataOptions.colors,
                chartOptions = {
                    chart: {
                        type: dataContent.type,
                        backgroundColor: dataOptions.backgroundColor,
                        animation: {
                            duration: 300
                        }
                    },
                    title: {
                        text: null
                    },
                    colors: colorsArr,
                    legend: {
                        enabled: true,
                        useHTML: true,
                        labelFormatter: function () {
                            return '<div style="font-size: ' + fontSize + '; color: ' + lineColor + '">' + this.name + '</div>';
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        pointFormat: '<b>{point.y}</b>',
                        style: {
                            fontSize: fontSize
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            dataLabels: {
                                format: '{percentage:.1f}%',
                                distance: -parseInt(data.width) / 12,
                                color: 'white',
                                style: {
                                    fontSize: '12px'
                                }
                            },
                            showInLegend: true
                        }
                    },
                    series: [dataSeries]
                };
            return chartOptions;
        },

        /**
         * 加载视频
         * @param data
         */
        renderVideo: function (data) {
            var that = this;
            var elementout = $('<div></div>');
            var element = $('<video></video>');
            var contentareaplay = $('<img/>');
            var picurl = data.picurl ? data.picurl : '';
            var con = '';
            if (picurl) {
                con = that.imgfilter(picurl);
            } else {
                con = data.con ? data.con : vars.imgSite + 'imgs/ele/loadingpic.jpg';
            }
            elementout.css({
                width: that.scale(data.w),
                height: 'auto',
                left: that.scale(data.left),
                top: that.scale(data.top,'top'),
                position: 'absolute',
                opacity: data.opacity,
                transform: that.rotate(data.rotate)
            });
            element.attr({
                preload: 'auto',
                'webkit-playsinline': null,
                width: that.scale(data.inw),
                height: that.scale(data.inh),
                type: 'video/mp4',
                poster: con,
                src: data.videourl ? data.videourl : ''
            });
            contentareaplay.css({
                position: 'absolute',
                left: '50%',
                top: '50%',
                margin: '-50px 0 0 -50px',
                opacity: '0.7'
            });
            contentareaplay.attr('src', vars.imgSite + 'imgs/play.png');
            // 视频播放控制
            var oVideo = element[0];
            elementout.on('click', function () {
                // 停止背景音乐播放
                if (vars.audio) {
                    vars.audio.pause();
                    vars.musicOff.show();
                    vars.musicOn.hide();
                }
                if (oVideo.paused) {
                    contentareaplay.fadeOut(300);
                    oVideo.play();
                } else {
                    contentareaplay.fadeIn(300);
                    oVideo.pause();
                }
            });
            element.on('timeupdate', function () {
                if (oVideo.currentTime === oVideo.duration) {
                    oVideo.currentTime = 0;
                    contentareaplay.fadeIn(300);
                }
            });
            elementout.append(element);
            elementout.append(contentareaplay);
            return {
                eletype: data.type,
                elementout: elementout,
                playBtn: contentareaplay,
                element: element,
                data: data
            };
        },

        /**
         * 加载表单
         * @param data
         */
        renderForm: function (data) {
            var that = this;
            var elementout = $('<div></div>');
            var warn = $('<div></div>');
            var imgEle = $('<img/>');
            var pEle = $('<p>提交中...</p>');
            var btn = $('<div>' + data.btn_name + '</div>');
            var inputarray = [];
            var qlist = data.qlist ? data.qlist : [];
            elementout.css({
                position: 'absolute',
                width: that.scale(data.w),
                top: that.scale(data.top),
                left: that.scale(data.left),
                transform: that.rotate(data.rotate)
            });

            warn.css({
                'z-index': '999',
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.9)',
                'text-align': 'center',
                display: 'none'
            });
            imgEle.css({
                'margin-top': '100px'
            });
            imgEle.attr('src', vars.imgSite + 'imgs/sending.gif');
            pEle.css({
                margin: '20px auto',
                width: '80%',
                'text-align': 'center',
                color: 'white',
                'font-size': '20px'
            });
            btn.css({
                height: that.scale(80),
                fontSize: that.scale(30),
                marginTop: that.scale(20),
                lineHeight: that.scale(80),
                background: data.formcolor
            });
            btn.addClass('form-submit');
            warn.append(imgEle);
            warn.append(pEle);
            for (var key in qlist) {
                if (qlist.hasOwnProperty(key)) {
                    var inputEle = $('<input/>');
                    inputEle.attr({
                        pos: key,
                        name: qlist[key].id,
                        'data-name': qlist[key].name,
                        placeholder: qlist[key].name
                    });
                    inputEle.css({
                        border: '2px solid ' + data.formcolor,
                        height: that.scale(80),
                        marginBottom: that.scale(20),
                        fontSize: that.scale(30)
                    });
                    inputEle.attr({
                        type: 'text',
                        class: 'form-input'
                    });
                    elementout.append(inputEle);
                    inputarray.push(inputEle);
                }
            }
            var nameInput = null,
                telInput = null,
                codeInput = null,
                reg = /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/i;
            var inputCode;
            // 增加表单验证判断 limit值 nameTel和none代表 需要验证 和不需要验证
            if (data.limit === 'nameTel') {

                inputCode = $('<input name="100" placeholder="请输入验证码" data-name="验证码" >');
                inputCode.css({
                    width: '48%',
                    height: that.scale(80),
                    border: 'solid 2px ' + data.formcolor,
                    marginBottom: that.scale(20),
                    fontSize: that.scale(30),
                    textIndent: that.scale(10),
                    boxSizing: 'border-box',
                    display: 'none'
                });
                var getCode = $('<div>获取验证码</div>');
                getCode.css({
                    width: '46%',
                    border: 'solid 2px ' + data.formcolor,
                    height: that.scale(80),
                    lineHeight: that.scale(80),
                    marginBottom: that.scale(20),
                    marginTop: that.scale(30),
                    marginLeft: '5%',
                    fontSize: that.scale(30),
                    boxSizing: 'border-box',
                    color: 'white',
                    textAlign: 'center',
                    background: data.formcolor,
                    display: 'none'
                });
                telInput = elementout.find('input').eq(1);
                telInput.on('input', function () {
                    telInput.val(telInput.val().replace(/[^-\d]/g, ''));
                    if (!telInput.val()) {
                        inputCode.hide();
                        getCode.hide();
                    } else {
                        inputCode.css('display', 'inline-block');
                        getCode.css('display', 'inline-block');
                    }
                });
                getCode.on('click', function () {
                    if (!telInput.val() || !reg.test(telInput.val())) {
                        imgEle.attr('src', '');
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        pEle.html('手机号为空或格式不正确');
                        warn.show();
                        setTimeout(function () {
                            warn.fadeOut(300, function () {
                                telInput.focus();
                            });
                        }, 1000);
                    } else {
                        imgEle.attr('src', vars.imgSite + 'imgs/sending.gif');
                        pEle.html('验证码发送中...');
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        warn.show();
                        setTimeout(function () {
                            warn.fadeOut(300);
                        }, 2000);
                        // 调用发送验证码插件
                        smsLogin.send(telInput.val(), function () {
                            // 记录日志
                            $.post(vars.phoneSite + '?c=web&a=ajaxSendCodeLog', {
                                referer: document.referer,
                                eventid: vars.projectID + '_' + data.formid,
                                mobile: telInput.val(),
                                city: vars.city
                            });

                            imgEle.attr('src', vars.imgSite + 'imgs/sendsucess.png');
                            if (!imgEle.attr('src')) {
                                pEle.css('margin', '200px auto');
                            } else {
                                pEle.css('margin', '20px auto');
                            }
                            pEle.html('发送成功!');
                            warn.fadeIn(300);
                            setTimeout(function () {
                                warn.fadeOut(300);
                            }, 2000);
                        }, function (err) {
                            imgEle.attr('src', '');
                            if (!imgEle.attr('src')) {
                                pEle.css('margin', '200px auto');
                            } else {
                                pEle.css('margin', '20px auto');
                            }
                            pEle.html(err);
                            warn.fadeIn(300);
                            setTimeout(function () {
                                warn.fadeOut(300);
                            }, 2000);
                        });
                    }
                });
                elementout.append(inputCode);
                elementout.append(getCode);
            }
            elementout.append(btn);
            btn.on('click', {inputCode: inputCode}, function (e) {
                if (data.limit && data.limit === 'nameTel') {
                    nameInput = inputarray[0];
                    telInput = inputarray[1];
                    codeInput = e.data.inputCode;
                    if (!nameInput.val()) {
                        imgEle.attr('src', '');
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        pEle.html('姓名不能为空');
                        warn.fadeIn(300);
                        setTimeout(function () {
                            warn.fadeOut(300, function () {
                                nameInput.focus();
                            });
                        }, 1000);
                        return;
                    } else if (!telInput.val() || !reg.test(telInput.val())) {
                        imgEle.attr('src', '');
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        pEle.html('手机号为空或格式不正确');
                        warn.fadeIn(300);
                        setTimeout(function () {
                            warn.fadeOut(300, function () {
                                telInput.focus();
                            });
                        }, 1000);
                        return;
                    } else if (!codeInput.val()) {
                        imgEle.attr('src', '');
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        pEle.html('验证码不能为空');
                        warn.fadeIn(300);
                        setTimeout(function () {
                            warn.fadeOut(300, function () {
                                codeInput.focus();
                            });
                        }, 1000);
                        return;
                    }
                } else if (data.limit && data.limit === 'none') {
                    var len = inputarray.length;
                    // 初始默认为空(没有限制时候,全为空时候不允许提交)
                    var isEmpty = true;
                    for (var i = 0; i < len; i++) {
                        if (inputarray[i].val().trim()) {
                            isEmpty = false;
                            break;
                        }
                    }
                    // 发送内容全部为空 不允许发送
                    if (isEmpty) {
                        imgEle.attr('src', '');
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        pEle.html('您输入的内容不能全部为空');
                        warn.fadeIn(300);
                        setTimeout(function () {
                            warn.fadeOut(300);
                        }, 1000);
                        return;
                    }
                }
                var tmpData = {};
                tmpData.eventid = vars.projectID + '_' + data.formid;
                if (codeInput) {
                    tmpData.mobilecode = codeInput.val();
                }
                tmpData.limit = data.limit;
                tmpData.city = vars.city;
                // tmpData.c = 'web';
                // tmpData.a = 'ajaxSubSignInfo';
                // 优惠劵id
                tmpData.couponId = data.couponId ? data.couponId.trim() : '';
                for (var key in inputarray) {
                    if (inputarray.hasOwnProperty(key)) {
                        tmpData[inputarray[key].attr('name')] = inputarray[key].val();
                    }
                }
                imgEle.attr('src', vars.imgSite + 'imgs/sending.gif');
                pEle.html('提交中...');
                if (!imgEle.attr('src')) {
                    pEle.css('margin', '200px auto');
                } else {
                    pEle.css('margin', '20px auto');
                }
                warn.fadeIn(300);


                // 验证验证码
                if (telInput && codeInput) {
                    smsLogin.check(telInput.val(), codeInput.val(), function () {
                        that.formAjax(tmpData, pEle, imgEle, warn, data.sucmsg);
                    }, function (err) {
                        pEle.html(err + '<br>');
                        imgEle.attr('src', '');
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        warn.fadeIn(300);
                        setTimeout(function () {
                            warn.fadeOut(300);
                        }, 1000);
                    });
                } else {
                    that.formAjax(tmpData, pEle, imgEle, warn, data.sucmsg);
                }
            });
            warn.on('click', function () {
                warn.hide();
            });
            return {
                eletype: data.type,
                elementout: elementout,
                data: data,
                warn: warn
            };
        },

        /**
         * 表单提交ajax请求
         * @param tmpData 数据
         * @param pEle p标签
         * @param imgEle image 标签
         * @param warn 提示外面盒子
         */
        formAjax: function (tmpData, pEle, imgEle, warn, sucmsg) {
            $.ajax({
                type: 'POST',
                url: vars.phoneSite + '?c=web&a=ajaxSubSignInfo',
                cache: false,
                dataType: 'json',
                data: tmpData,
                success: function (e) {
                    if (parseInt(e.errcode) === 1) {
                        if (e.errmsg) {
                            pEle.html(sucmsg + '<br>恭喜您获得了' + e.errmsg);
                        } else {
                            pEle.html(sucmsg);
                        }
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        imgEle.attr('src', vars.imgSite + 'imgs/sendsucess.png');
                        warn.fadeIn(300);
                        setTimeout(function () {
                            warn.fadeOut(300);
                        }, 2000);
                    } else {
                        pEle.html('提交失败!<br>' + e.errmsg);
                        imgEle.attr('src', '');
                        if (!imgEle.attr('src')) {
                            pEle.css('margin', '200px auto');
                        } else {
                            pEle.css('margin', '20px auto');
                        }
                        warn.fadeIn(300);
                        setTimeout(function () {
                            warn.fadeOut(300);
                        }, 2000);
                    }
                },
                error: function () {
                    pEle.html('提交失败!<br>');
                    imgEle.attr('src', '');
                    if (!imgEle.attr('src')) {
                        pEle.css('margin', '200px auto');
                    } else {
                        pEle.css('margin', '20px auto');
                    }
                    warn.fadeIn(300);
                    setTimeout(function () {
                        warn.fadeOut(300);
                    }, 1000);
                }
            });
        },
        /**
         * 加载iframe(网页)
         * @param data 当前元素数据
         * @param pageData 页面数据
         */
        renderSite: function (data,pageData) {
            var that = this;
            var elementout = $('<div></div>');
            var element = $('<iframe frameborder="0"></iframe>');
            elementout.css({
                width: that.scale(data.w),
                height: that.scale(data.h),
                margin: 0,
                padding: 0,
                left: that.scale(data.left),
                top: that.scale(data.top),
                '-webkit-overflow-scrolling': 'touch',
                'overflow-x': 'hidden',
                'overflow-y': 'auto',
                position: 'absolute',
                opacity: data.opacity,
                backgroundColor: '#fff',
                transform: that.rotate(data.rotate)
            });
            element.css({
                position: 'absolute',
                width: that.scale(data.w),
                left: 0,
                top: 0,
                border: 'none'
            });

            // 引入页面的地址
            var iframeUrl = data.url;
            // 引用页面超过一屏高度
            var moreThanOneScreen = data.moreThanOneScreen;
            if (iframeUrl && iframeUrl.indexOf(location.protocol + '//') === -1) {
                iframeUrl = location.protocol + '//' + iframeUrl;
            }
            if (iframeUrl) {
                // 设置一个监听事件,等待页面渲染完成后执行iframe的src的赋值
                var callback = function (ele) {
                    // 加if判断 发布事件的时候只给当前显示的iframe赋src地址(eleAnimation.js 975行)
                    if (elementout.css('display') === 'block') {
                        element.attr('src', iframeUrl);
                        // 解绑当前页面的绑定
                        seajs.off('showSite', callback);
                    }
                };
                seajs.on('showSite', callback);
            }
            // 提示标签
            if (pageData && pageData.pan === 'yes') {
                var pageTurn = $('<div class="fromRightSlow delay2s">上下滑动翻页</div>'),
                    pageTurnShowHide = $('<div ></div>');
                pageTurn.css({
                    position: 'absolute',
                    width: '30px',
                    height: '160px',
                    right: '0',
                    top: parseInt(that.scale(data.h)) - 200,
                    backgroundColor: 'rgba(0,0,0,.6)',
                    color: '#fff',
                    textAlign: 'center',
                    writingMode: 'lr-tb',
                    lineHeight: '26px',
                    borderRadius: '15px',
                    paddingTop: '26px'
                });
                pageTurnShowHide.css({
                    position: 'absolute',
                    width: '100%',
                    height: '26px',
                    top: '0',
                    left: '0',
                    background: 'url("' + vars.imgSite + '/imgs/banner.png") 0 0 no-repeat',
                    backgroundPosition: '10px 4px'
                });
                pageTurn.append(pageTurnShowHide);
            }
            // iframe兼容性处理
            if (vars.UA.indexOf('iphone') !== -1) {
                // iphone 设置scrolling 防止页面宽度失效 表现为iframe宽度变宽
                element.attr('scrolling', 'no');
                if (pageData && pageData.pan === 'yes') {
                    var timer = null;
                    var turnH = parseInt(pageTurn.css('top'));
                    // 解决iPhone 设置按钮top bug
                    elementout.on('scroll', function () {
                        // 降频处理
                        clearTimeout(timer);
                        /*timer = setTimeout(function () {
                         pageTurn.css('top', turnH + elementout.scrollTop());
                         clearTimeout(timer);
                         }, 100);*/
                        pageTurn.css('top', turnH + elementout.scrollTop());
                    });
                }


                /**
                 * 针对 全景看房和航拍做单独处理
                 * 超过一屏的iframe 标签统计
                 * @update tankunpeng 2016/11/18
                 * tour.html 代表全景看房 地址匹配
                 * img360.soufunimg.com 航拍地址匹配
                 * aerialPhotoInfo.htm m站内嵌航拍地址匹配
                 */
                if (moreThanOneScreen === 'off' || vars.img360Reg.test(iframeUrl)) {
                    var winH = $(window).height();
                    element.css('height', winH);
                    elementout.css('height', winH);
                }

            } else {
                // android 下iframe不设置高度 会出现高度塌陷
                element.css('height', that.scale(data.h));
            }


            if (pageData && pageData.pan === 'yes') {
                pageTurnShowHide.on('click', function () {
                    if (pageTurn.hasClass('fromRightSlow')) {
                        pageTurn.removeClass('fromRightSlow').removeClass('delay2s').addClass('toRightHide');
                        setTimeout(function () {
                            pageTurnShowHide.css({
                                left: '-26px',
                                backgroundPosition: '-16px 4px',
                                backgroundColor: 'rgba(0,0,0,.6)',
                                borderRadius: '15px 0 0 15px'
                            });
                        }, 800);
                    } else {
                        pageTurn.removeClass('toRightHide').addClass('fromRightSlow');
                        pageTurnShowHide.css({
                            left: '0',
                            backgroundPosition: '10px 4px',
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderRadius: 'none'
                        });
                    }
                });
            }


            elementout.append(element);
            elementout.append(pageTurn);
            return {
                eletype: data.type,
                elementout: elementout,
                element: element,
                pageTurn: pageTurn,
                pageTurnTop: pageTurn ?  parseInt(pageTurn.css('top')) : 0,
                seajsEmitRuned: false,
                data: data
            };
        },

        /**
         * 获取cookie
         * @param name cookie名字
         */
        getCookie: function (name) {
            var arr = document.cookie.split('; ');
            for (var i = 0; i < arr.length; i++) {
                var arr2 = arr[i].split('=');
                if (arr2[0] === name) {
                    return arr2[1];
                }
            }
            return '';
        },

        /**
         * 设置cookie
         * @param name cookie名字
         * @param value cookie值
         * @param iDay 过期时间
         */
        setCookie: function (name, value, iDay) {
            if (iDay) {
                var oDate = new Date();
                oDate.setDate(oDate.getDate() + iDay);
                document.cookie = name + '=' + value + ';path=/;expires=' + oDate.toGMTString();
            } else {
                document.cookie = name + '=' + value + ';path=/';
            }
        },

        /**
         * 删除cookie
         * @param name cookie名字
         */
        removeCookie: function (name) {
            this.setCookie(name, 1, -1);
        },

        /**
         * 创建透明弹层 用于显示元素的背景
         * @returns {*|jQuery|HTMLElement}
         */
        createFloat: function () {
            var that = this;
            var elementout = $('<div></div>');
            elementout.css({
                width: '100%',
                height: '100%',
                margin: 0,
                padding: 0,
                left: 0,
                top: 0,
                position: 'absolute',
                opacity: .69,
                backgroundColor: '#000',
                zIndex: 1000
            });
            return elementout;
        }
    };
});
