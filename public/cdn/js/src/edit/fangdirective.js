/*
 * @Author: liyy
 * @Date:   2015/9/22
 * @description: h5market编辑页自定义指令
 * @Last Modified by:   liyy
 * @Last Modified time: 2015-11-20
 */
(function () {
    'use strict';
    AppConfig.registerModule('fang.directive');
    var dir = angular.module('fang.directive', []);
    // 滑动条
    dir.directive('slider', function () {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                var maxVal = 100;
                var minVal = 0;
                var val;
                var slideFun;
                var $ele = $(ele);
                switch (attrs.type) {
                    // 旋转滑动条
                    case 'rotate_slider':
                        maxVal = 360;
                        slideFun = function (t, n) {
                            scope.$apply(function () {
                                scope.selectedElement.rotate = n.value;
                            });
                        };
                        val = scope.selectedElement.rotate;
                        break;
                    // 透明度滑动条
                    case 'opacity_slider':
                        slideFun = function (t, n) {
                            scope.$apply(function () {
                                if ('bg' !== scope.selectedElement.type) {
                                    scope.selectedElement.opacity = n.value;
                                } else {
                                    scope.$parent.selectedTemplate.opacity = n.value;
                                }
                            });
                        };
                        val = 'bg' === scope.selectedElement.type ? scope.$parent.selectedTemplate.opacity : scope.selectedElement.opacity;
                        break;
                    // 阴影滑动条
                    case 'shadow_slider':
                        slideFun = function (t, n) {
                            scope.$apply(function () {
                                scope.selectedElement.boxshadow = n.value;
                            });
                        };
                        val = scope.selectedElement.boxshadow;
                        break;
                    // 圆角滑动条
                    case 'borderradius_slider':
                        slideFun = function (t, n) {
                            scope.$apply(function () {
                                scope.selectedElement.borderradius = n.value;
                            });
                        };
                        val = scope.selectedElement.borderradius;
                        break;
                    // 速度滑动条
                    case 'speed_slider':
                        maxVal = 1e4;
                        if (attrs.animation === 'in') {
                            slideFun = function (t, n) {
                                scope.$apply(function () {
                                    scope.selectedElement.animations.animationIn.speed = n.value / 1e3;
                                });
                            };
                            val = scope.selectedElement.animations.animationIn.speed * 1e3;
                        } else if (attrs.animation === 'on') {
                            slideFun = function (t, n) {
                                scope.$apply(function () {
                                    scope.selectedElement.animations.animationOn.speed = n.value / 1e3;
                                });
                            };
                            val = scope.selectedElement.animations.animationOn.speed * 1e3;
                        } else {
                            slideFun = function (t, n) {
                                scope.$apply(function () {
                                    scope.selectedElement.animations.animationOut.speed = n.value / 1e3;
                                });
                            };
                            val = scope.selectedElement.animations.animationOut.speed * 1e3;
                        }
                        break;
                    // 延时滑动条
                    case 'delay_slider':
                        maxVal = 1e4;
                        if (attrs.animation === 'in') {
                            slideFun = function (t, n) {
                                scope.$apply(function () {
                                    scope.selectedElement.animations.animationIn.delay = n.value / 1e3;
                                });
                            };
                            val = scope.selectedElement.animations.animationIn.delay * 1e3;
                        } else if (attrs.animation === 'on') {
                            slideFun = function (t, n) {
                                scope.$apply(function () {
                                    scope.selectedElement.animations.animationOn.delay = n.value / 1e3;
                                });
                            };
                            val = scope.selectedElement.animations.animationOn.delay * 1e3;
                        } else {
                            slideFun = function (t, n) {
                                scope.$apply(function () {
                                    scope.selectedElement.animations.animationOut.delay = n.value / 1e3;
                                });
                            };
                            val = scope.selectedElement.animations.animationOut.delay * 1e3;
                        }
                        break;
                    // 图集中切换时间滑动条
                    case 'change_slider':
                        maxVal = 1e4;
                        minVal = 1e3;
                        slideFun = function (t, n) {
                            scope.$apply(function () {
                                scope.selectedElement.animation.changeTime = n.value / 1e3;
                            });
                        };
                        val = scope.selectedElement.animation.changeTime * 1e3;
                        break;
                }
                $ele.slider({
                    min: minVal || 0,
                    max: maxVal,
                    slide: slideFun,
                    value: val
                });
                // 监听值改变对应改变滑动条位置
                attrs.$observe('value', function (e) {
                    if (attrs.type === 'speed_slider' || attrs.type === 'delay_slider') {
                        e = parseFloat(e) * 1e3;
                    }
                    $ele.slider('value', e);
                });
            }
        };
    });
    // 百分比处理
    dir.directive('fangPercent', ['$rootScope', function () {
        return {
            require: '?ngModel',
            link: function (scope, ele, attrs, $ngModel) {
                // 指定ui的更新方式
                $ngModel.$render = function () {
                    if ($ngModel.$modelValue || $ngModel.$modelValue === 0) {
                        ele.val(parseInt($ngModel.$modelValue) + '%');
                    } else {
                        ele.val('0%');
                        scope.selectedElement.opacity = 0;
                    }
                };
                ele.bind('blur', function (t) {
                    var n = t.target;
                    n.value = $ngModel.$modelValue ? n.value + '%' : '0%';
                }).bind('focusin', function (t) {
                    var n = t.target;
                    n.value = parseInt(n.value);
                });
            }
        };
    }
    ]);
    // 背景裁剪
    dir.directive('bgJcrop', function () {
        return {
            restrict: 'A',
            template: '<div><div  style="border:dashed 2px rgba(57,187,170,1)"><img ng-src="{{src}}" id="bgImg"></div></div>',
            replace: true,
            link: function (scope, ele, attrs) {
                var o, i, l, radio = 640 / 1008;

                function haddle(t) {
                    var n = 640 / (t.w / i), a = 1008 / (t.h / l);
                    scope.$apply(function () {
                        scope.$parent.selectedTemplate.bgpicwidth = n;
                        scope.$parent.selectedTemplate.bgpicheight = a;
                        scope.$parent.selectedTemplate.bgpicleft = -(n * (t.x / i));
                        scope.$parent.selectedTemplate.bgpictop = -(a * (t.y / l));
                    });
                }

                var cropObj = {
                    aspectRatio: radio,
                    boxWidth: 240,
                    boxHeight: 240,
                    onChange: haddle,
                    onSelect: haddle,
                    bgColor: 'rgba(0,0,0,0.1)'
                };

                scope.src = attrs.value;
                attrs.$observe('value', function (e) {
                    if (o) {
                        o.setImage(e, function () {
                            i = o.getBounds()[0];
                            l = o.getBounds()[1];
                        });
                    }
                });
                $('#bgImg').Jcrop(cropObj, function () {
                    o = this;
                    i = o.getBounds()[0];
                    l = o.getBounds()[1];
                });
            }
        };
    });

    // input 像素值处理
    dir.directive('fangPx', ['$rootScope', function () {
        return {
            require: '?ngModel',
            link: function (scope, ele, attrs, $ngModel) {
                $ngModel.$render = function () {
                    if ($ngModel.$modelValue) {
                        ele.val(parseInt($ngModel.$modelValue) + 'px');
                    } else {
                        ele.val('0px');
                    }
                };
                ele.on('blur', function (t) {
                    var n = t.target;
                    n.value = $ngModel.$modelValue ? parseInt(n.value) + 'px' : '0px';
                });
                ele.on('focusin', function (t) {
                    var n = t.target;
                    n.value = parseInt(n.value);
                });
            }
        };
    }
    ]);

    // 旋转角度处理
    dir.directive('fangRotate', ['$rootScope', function () {
        return {
            require: '?ngModel',
            link: function (scope, ele, attrs, ngModel) {
                ngModel.$render = function () {
                    if (ngModel.$modelValue) {
                        ele.val(parseInt(ngModel.$modelValue) + '度');
                    } else {
                        ele.val('0度');
                        scope.selectedElement.rotate = 0;
                    }
                };
                ele.on('blur', function (t) {
                    var n = t.target;
                    n.value = ngModel.$modelValue ? n.value + '度' : '0度';
                }).on('focusin', function (t) {
                    var n = t.target;
                    n.value = parseInt(n.value);
                });
            }
        };
    }]);
    // 秒数处理
    dir.directive('fangSecond', function () {
        return {
            require: '?ngModel',
            link: function (scope, ele, n, ngModel) {
                ngModel.$render = function () {
                    if (ngModel.$modelValue) {
                        ele.val(parseFloat(ngModel.$modelValue).toFixed(1) + 's');
                    } else {
                        ele.val('0s');
                    }
                };
                ele.on('blur', function (e) {
                    var t = e.target;
                    t.value = ngModel.$modelValue ? t.value + 's' : '0s';
                }).on('focusin', function (e) {
                    var t = e.target;
                    if (t.value !== '0s') {
                        t.value = parseFloat(t.value).toFixed(1);
                    }
                });
            }
        };
    });
    // 重写鼠标右键事件
    dir.directive('fangRightClick', function () {
        return function (scope, ele) {
            ele.contextMenu('myMenu1', {
                bindings: {
                    // 复制
                    copy: function (t) {
                        var n = t.getAttribute('dataNum');
                        scope.$apply(function () {
                            scope.$parent.copyElement(scope.$parent.selectedTemplate.content[n]);
                        });
                    },
                    // 剪切
                    shear: function (t) {
                        var n = t.getAttribute('dataNum');
                        scope.$apply(function () {
                            scope.$parent.shearElement(scope.$parent.selectedTemplate.content[n]);
                        });
                    },
                    // 上移一层
                    up: function (t) {
                        var n = t.getAttribute('dataNum');
                        if (n !== scope.$parent.selectedTemplate.content.length - 1) {
                            scope.$apply(function () {
                                scope.$emit('templateChange');
                                var t = scope.$parent.selectedTemplate.content.splice(n, 2).reverse();
                                scope.$parent.selectedTemplate.content.splice(n, 0, t[0], t[1]);
                                scope.$emit('noRefresh');
                                scope.$parent.templateDataProcessing('template', scope.$parent.selectedTemplate);
                                scope.$parent.chooseTemplate(scope.$parent.selectedTemplateNum, 'element', n + 1);
                            });
                        }
                    },
                    // 下移一层
                    down: function (t) {
                        var n = t.getAttribute('dataNum');
                        if (n !== 0) {
                            scope.$apply(function () {
                                scope.$emit('templateChange');
                                var t = scope.$parent.selectedTemplate.content.splice(n - 1, 2).reverse();
                                scope.$parent.selectedTemplate.content.splice(n - 1, 0, t[0], t[1]);
                                scope.$emit('noRefresh');
                                scope.$parent.templateDataProcessing('template', scope.$parent.selectedTemplate);
                                scope.$parent.chooseTemplate(scope.$parent.selectedTemplateNum);
                            });
                        }
                    },
                    // 置顶
                    top: function (t) {
                        var n = t.getAttribute('dataNum');
                        if (n !== scope.$parent.selectedTemplate.content.length - 1) {
                            scope.$apply(function () {
                                scope.$emit('templateChange');
                                var t = scope.$parent.selectedTemplate.content.splice(n, 1);
                                scope.$parent.selectedTemplate.content.push(t[0]);
                                scope.$emit('noRefresh');
                                scope.$parent.templateDataProcessing('template', scope.$parent.selectedTemplate);
                                scope.$parent.chooseTemplate(scope.$parent.selectedTemplateNum);
                            });
                        }
                    },
                    // 置底
                    bottom: function (t) {
                        var n = t.getAttribute('dataNum');
                        if (n !== 0) {
                            scope.$apply(function () {
                                scope.$emit('templateChange');
                                var t = scope.$parent.selectedTemplate.content.splice(n, 1);
                                scope.$parent.selectedTemplate.content.unshift(t[0]);
                                scope.$emit('noRefresh');
                                scope.$parent.templateDataProcessing('template', scope.$parent.selectedTemplate);
                                scope.$parent.chooseTemplate(scope.$parent.selectedTemplateNum);
                            });
                        }
                    },
                    // 删除
                    delete: function (t) {
                        var n = t.getAttribute('dataNum');
                        scope.$apply(function () {
                            scope.$emit('templateChange');
                            scope.defaultTimer.class= 'none';
                            scope.defaultTimer.name = '无';
                            _.each(scope.$parent.selectedTemplate.content,function(el){
                                var eventAction = el.eventAction;
                                if ((eventAction === 'show' || eventAction === 'hide') && el.checkBox.length) {
                                    var index =  $.inArray(n,el.checkBox);
                                    if (index > -1) {
                                        el.checkBox.splice(index,1);
                                        var i = index,len = el.checkBox.length;
                                        for (i; i< len; i ++) {
                                            el.checkBox[i]--;
                                        }
                                    }
                                }
                            });
                            scope.$parent.selectedTemplate.content.splice(n, 1);
                            scope.$emit('noRefresh');
                            scope.$parent.templateDataProcessing('template', scope.$parent.selectedTemplate);
                            scope.$parent.chooseTemplate(scope.$parent.selectedTemplateNum);
                        });
                    },
                    // 导入资源库
                    import: function () {
                        scope.$parent.importPic(scope.selectedElement.picid);
                    }
                }
            });
        };
    });
    // 点击播放或者暂停按钮
    dir.directive('fangMusic', ['Config', function (Config) {
        return {
            restrict: 'A',
            link: function (scope, ele) {
                var b;
                ele.on('click','i', function (event) {
                    b = scope.audio.music;
                    var el = $(event.target);
                    // 如果未播放音乐
                    if (el.hasClass('fa-play')) {
                        // 点击到i标签上,才进行处理
                        if (!el.attr('num') && !el.attr('name')) {
                            return;
                        }
                        // 导航栏上点击播放按钮收起音乐上传界面
                        if (el.parent().hasClass('musicplay')) {
                            scope.$apply(function () {
                                scope.$parent.showMusicView = false;
                            });
                        }
                        // 如果点击的不是当前播放的音乐
                        //if (a && a.getAttribute('num') !== event.target.getAttribute('num') ) {
                        //    // 把之前的音乐设置成暂停状态
                        b && b.removeClass('fa-pause').addClass('fa-play');
                        //}
                        // 如果num不存在，则证明是网络音乐，取name值
                        var n = el.attr('num') || el.attr('name'), src = '';
                        n.indexOf('.mp3') > -1 && n.indexOf('.soufunimg.com') > -1 ? src = n : n.indexOf('.mp3') > -1 ? src = Config.webMusicUrl + n : src = Config.musicUrl + n + '.mp3';

                        //音乐文件加载完成再进行播放
                        scope.audio.src = src;
                        scope.audio.music = el;
                    } else {
                        //音乐正在播放 检查音乐播放状态是 paused 为已经暂停
                        if (!scope.audio.paused && scope.audio.readyState === 4) {
                            el && el.removeClass('fa-pause').addClass('fa-play');
                            scope.audio.pause();
                        }
                    }
                });
            }
        };
    }]);
    // scroll插件
    dir.directive('nicescroll', function () {
        return {
            link: function (scope, ele) {
                ele.niceScroll({
                    cursorcolor: '#a3a3a3',
                    cursorwidth: '10px',
                    horizrailenabled: false
                }).resize();
            }
        };
    });
    // 背景上点击右键
    dir.directive('fangBgrightclick', function () {
        return function (scope, ele) {
            ele.contextMenu('myMenu2', {
                bindings: {
                    // 粘贴
                    paste: function () {
                        scope.$apply(function () {
                            scope.$parent.pasteElement();
                        });
                    }
                }
            });
        };
    });
    // 系统懒加载
    dir.directive('sysLazyLoad', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, ele) {
                var o = $timeout(function () {
                    var dataSrc = ele.attr('data-original');
                    if (dataSrc !== ele.attr('src')) {
                        ele.attr('src', dataSrc);
                    }
                    $timeout.cancel(o);
                }, 50);
            }
        };
    }]);

    // 图表
    dir.directive('fangChart', function () {
        return {
            link: function (scope, ele, attrs) {
                ele.on('focusin', function () {
                    // 不是病状图并且不是第一种样式
                    if (scope.$parent.chartElement.content.type !== 'pie' && scope.$parent.chartElement.content.multiple === 1) {
                        // 重新渲染
                        scope.$apply(function () {
                            scope.$parent.chartConfig.series = [scope.$parent.chartElement.content.data[attrs.value]];
                        });
                    }
                });
            }
        };
    });

    // 获取视频高度
    dir.directive('videoHeight', function () {
        return {
            link: function (scope, ele) {
                // 视频加载完成之后再获取视频的宽高
                ele.on('loadeddata', {m: scope}, function (e) {
                    var thisScope = e.data.m;
                    thisScope.video.inw = ele.width();
                    thisScope.video.inh = thisScope.video.h = ele.height();
                });
            }
        };
    });

    // 轮播可裁剪图片
    dir.directive('slideImgJcrop', function () {
        return {
            restrict: 'A',
            template: '<div><div style="border:dashed 2px rgba(57,187,170,1);"><img ng-src="{{src}}" id="slideImg"></div>',
            replace: true,
            link: function (scope, ele, attrs) {
                var imgJcrop, l, c, picWidth = scope.selectedElement.picWidth,
                    picHeight = scope.selectedElement.picHeight, aspectRatio = picWidth / picHeight;

                function onChange(t) {
                    var inw = picWidth / (t.w / l), inh = picHeight / (t.h / c);
                    scope.$apply(function () {
                        scope.selectedElement.data[scope.selectedElement.slideNum].inw = inw;
                        scope.selectedElement.data[scope.selectedElement.slideNum].inh = inh;
                        scope.selectedElement.data[scope.selectedElement.slideNum].inleft = -(inw * (t.x / l));
                        scope.selectedElement.data[scope.selectedElement.slideNum].intop = -(inh * (t.y / c));
                    });
                }

                scope.src = attrs.value;
                var config = {
                    aspectRatio: aspectRatio,
                    boxWidth: 240,
                    boxHeight: 240,
                    onChange: onChange,
                    keySupport: false,
                    bgColor: 'rgba(0,0,0,0.1)'
                };
                attrs.$observe('value', function (e) {
                    if (imgJcrop) {
                        imgJcrop.setImage(e, function () {
                            l = imgJcrop.getBounds()[0];
                            c = imgJcrop.getBounds()[1];
                        });
                    }
                });
                $('#slideImg').Jcrop(config, function () {
                    imgJcrop = this;
                    l = imgJcrop.getBounds()[0];
                    c = imgJcrop.getBounds()[1];
                });
            }
        };
    });

    // 图集可裁剪图片
    dir.directive('slidesImgJcrop', function () {
        return {
            restrict: 'EA',
            template: '<div><div style="border:dashed 2px rgba(57,187,170,1);"><img ng-src="{{src}}" id="slidesImg"></div>',
            replace: true,
            link: function (scope, ele, attrs) {
                var imgJcrop, l, c, picWidth = scope.selectedElement.picWidth,
                    picHeight = scope.selectedElement.picHeight, aspectRatio = picWidth / picHeight;

                function onChange(t) {
                    scope.$apply(function () {
                       var picWidth = scope.selectedElement.picWidth,
                            picHeight = scope.selectedElement.picHeight;
                        var inw = picWidth / (t.w / l), inh = picHeight / (t.h / c);
                        scope.selectedElement.data[scope.selectedElement.slideNum].inleft = -(inw * (t.x / l));
                        scope.selectedElement.data[scope.selectedElement.slideNum].intop = -(inh * (t.y / c));
                        scope.selectedElement.data[scope.selectedElement.slideNum].inw = inw;
                        scope.selectedElement.data[scope.selectedElement.slideNum].inh = inh;

                    });
                }

                scope.src = attrs.value;
                scope.showWidth = attrs.h;
                var config = {
                    aspectRatio: aspectRatio,
                    boxWidth: 240,
                    boxHeight: 240,
                    onChange: onChange,
                    keySupport: false,
                    bgColor: 'rgba(0,0,0,0.1)'
                };
                attrs.$observe('value', function (e) {
                    if (imgJcrop) {
                        imgJcrop.setImage(e, function () {
                            l = imgJcrop.getBounds()[0];
                            c = imgJcrop.getBounds()[1];
                        });
                    }
                });
                $('#slidesImg').Jcrop(config, function () {
                    imgJcrop = this;
                    l = imgJcrop.getBounds()[0];
                    c = imgJcrop.getBounds()[1];
                });
            }
        };
    });

    dir.directive('textWatcher', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, ele, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$render = function () {
                    ele.html(ngModel.$viewValue || '');
                };
                ngModel.$parsers.unshift(function (e) {
                    return e.replace(/(\r)*\n/g, '<br\/>').replace(/\s/g, '&nbsp;');
                });
                function saveCon() {
                    var html = $(ele).html().replace(/(\r)*\n/g, "<br\/>").replace(/\s/g, '&nbsp;');
                    html = html === '' ? '请输入文本' : html;
                    ngModel.$setViewValue(html);
                    ele.html(html);
                }

                ele.on('blur', function () {
                    scope.$apply(function() {
                        scope.selectedElement.editable = false;
                        saveCon();
                    });
                });
                ngModel.$render();

                attrs.$observe('edit', function (e) {
                    if (e !== 'false') {
                        $(ele).attr('contenteditable', e).css('cursor', 'text');
                        var sel = window.getSelection();
                        var range = document.createRange();
                        range.selectNodeContents($(ele)[0]);
                        //range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        $(ele).focus();
                    } else {
                        $(ele).removeAttr('contenteditable').css('cursor', 'move');
                    }
                });
            }
        }
    });
    // 选中元素，添加元素样式，脱离选中区域，去掉选中内容。

    // 动画效果
    dir.directive('fangAnimation', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                var totalDelay, inTimer, onTimer, outTimer;
                if (!attrs.in || !attrs.out || !attrs.on) {
                    return;
                }
                var animationIn = angular.fromJson(attrs.in);
                var animationOn = angular.fromJson(attrs.on);
                var animationOut = angular.fromJson(attrs.out);
                // 第一次入场动画改变
                var firstIn = true;
                // 第一次场内动画改变
                var firstOn = true;
                // 第一次出场动画改变
                var firstOut = true;
                // 场内动画计时器是否执行
                //var onTimerRun = false;
                if (!animationIn || !animationOn || !animationOut) {
                    return;
                }
                // 存储计时器数组
                var timersArr = [];
                // 入场动画显示
                function inFunc(newVal) {
                    animationIn = newVal ? angular.fromJson(newVal) : animationIn;
                    inTimer = $timeout(function () {
                        timersArr.push(inTimer);
                        ele.removeClass().addClass(animationIn.show).
                            css({
                                animationDuration: animationIn.speed + 's'
                            });
                    }, 1e3 * animationIn.delay);
                }

                // 场内动画显示
                function onFunc(newVal, delay) {
                    animationOn = newVal ? angular.fromJson(newVal) : animationOn;
                    onTimer = $timeout(function () {
                        timersArr.push(onTimer);
                        ele.removeClass().addClass(animationOn.show).
                            addClass('iterationCount_' + animationOn.frequency).
                            css({
                                animationDuration: animationOn.speed + 's'
                            });
                    }, delay ? delay : 1e3 * animationOn.delay);
                }

                // 出场动画显示
                function outFunc(newVal, delay) {
                    animationOut = newVal ? angular.fromJson(newVal) : animationOut;
                    outTimer = $timeout(function () {
                        timersArr.push(outTimer);
                        ele.removeClass().addClass(animationOut.show).
                            css({
                                animationDuration: animationOut.speed + 's'
                            });
                    }, delay ? delay : 1e3 * animationOut.delay);
                }

                // 取消计时器
                function timerDestroy() {
                    timersArr.length > 0 && _.each(timersArr, function (t) {
                        $timeout.cancel(t);
                    });
                }

                // 如果存在入场动画
                //if ('noeffect' !== animationIn.show) {
                //    inFunc();
                //}
                // 如果存在场内动画
                if ('noeffect' !== animationOn.show) {
                    if ('noeffect' !== animationIn.show) {
                        totalDelay = animationOn.delay + animationIn.speed;
                        onFunc('', 1e3 * totalDelay);
                    } else {
                        onFunc('');
                    }
                }
                // 如果存在出场动画
                if ('noeffect' !== animationOut.show) {
                    // 如果存在场内动画
                    if (onTimer) {
                        // 此时的延迟时间是出场的延迟加上场内的动画时间
                        totalDelay = animationOut.delay + animationOn.speed * animationOn.frequency;
                        // 在场内动画执行后执行
                        onTimer.then(function () {
                            outFunc('', 1e3 * totalDelay);
                        });
                    } else if ('noeffect' !== animationIn.show) {
                        // 此时的延迟时间是出场的延迟加上入场的动画时间
                        totalDelay = animationOut.delay + animationIn.speed;
                        outFunc('', 1e3 * totalDelay);
                    } else {
                        // 直接执行
                        outFunc('');
                    }
                }
                // 监听入场动画改变
                attrs.$observe('in', function (newVal) {
                    // 第一次改变是在新生成dom的时候，应该是完整动画，所以忽略
                    if (firstIn) {
                        firstIn = false;
                        return;
                    }
                    // 取消所有定时器的执行
                    timerDestroy();
                    // 执行入场动画
                    inFunc(newVal);
                });

                // 监听场内动画改变
                attrs.$observe('on', function (newVal) {
                    if (firstOn) {
                        firstOn = false;
                        return;
                    }
                    timerDestroy();
                    onFunc(newVal);
                });

                // 监听出场动画改变
                attrs.$observe('out', function (newVal) {
                    if (firstOut) {
                        firstOut = false;
                        return;
                    }
                    timerDestroy();
                    outFunc(newVal);
                });
                // dom remove时会触发$destroy事件，接收到$destroy事件时取消所有定时器
                scope.$on('$destroy', function () {
                    timerDestroy();
                });
            }
        };
    }]);
    // 监听各种键盘事件
    dir.directive('keydown', ['$document', function ($document) {
        return {
            restrict: 'A',
            link: function (scope) {
                $document.on('keydown', function (e) {
                    if (scope.selectedElement.editable === "plaintext-only" || $(':focus').length > 0) {
                        return;
                    }
                    // metaKey---windows键或者cmd键
                    if (e.metaKey || e.ctrlKey) {
                        switch (e.keyCode) {
                            // 撤销
                            case 90:
                                scope.$apply(function () {
                                    scope.cancel();
                                });
                                return;
                            // 复制
                            case 67:
                                scope.$apply(function () {
                                    scope.copyElement(scope.selectedElement);
                                });
                                return;
                            // 粘贴
                            case 86:
                                scope.$apply(function () {
                                    if (scope.selectedElement.selCon && $(':focus').length > 0) {
                                        return;
                                    }
                                    scope.pasteElement();
                                });
                                return;
                            // 剪切
                            case 88:
                                scope.$apply(function () {
                                    if (scope.selectedElement.selCon && $(':focus').length > 0) {
                                        return;
                                    }
                                    scope.shearElement(scope.selectedElement);
                                });
                                return;
                            // 保存
                            case 83:
                                e.preventDefault();
                                scope.$apply(function () {
                                    scope.save('save');
                                });
                                return;
                        }
                    }
                    scope.locked || 'charts' === scope.selectedElement.type || 'eleform' === scope.selectedElement.type
                    || 'slide' === scope.selectedElement.type || scope.$apply(function () {
                        // 46---Delete  8---BackSpace metaKey---windows键或者cmd键   表示删除功能
                        if ((46 === e.keyCode || 8 === e.keyCode && e.metaKey) && 'bg' !== scope.selectedElement.type) {
                            // 如果当前正在输入，忽略键盘上下左右事件
                            if ($(':focus').length > 0) {
                                return;
                            }
                            scope.$broadcast('templateChange');
                            var n = scope.selectedElement.key;
                            scope.selectedTemplate.content.splice(n, 1);
                            scope.$emit('noRefresh');
                            scope.isDelete = true;
                            scope.templateDataProcessing('template', scope.selectedTemplate);
                            scope.chooseTemplate(scope.selectedTemplateNum);
                        } else if ('bg' !== scope.selectedElement.type) {
                            // 如果当前正在输入，忽略键盘上下左右事件
                            if ($(':focus').length > 0) {
                                return;
                            }
                            switch (e.keyCode) {
                                // 左
                                case 37:
                                    e.preventDefault();
                                    scope.selectedElement.left = parseInt(scope.selectedElement.left) - 2;
                                    break;
                                // 上
                                case 38:
                                    e.preventDefault();
                                    scope.selectedElement.top = parseInt(scope.selectedElement.top) - 2;
                                    break;
                                // 右
                                case 39:
                                    e.preventDefault();
                                    scope.selectedElement.left = parseInt(scope.selectedElement.left) + 2;
                                    break;
                                // 下
                                case 40:
                                    e.preventDefault();
                                    scope.selectedElement.top = parseInt(scope.selectedElement.top) + 2;
                            }
                        }
                    });
                });
            }
        };
    }]);
    // 监听各种键盘事件
    dir.directive('refercnceLine', function() {

        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {
                var gap = 10;
                scope.$on('updateElement', function(event) {
                    var eSelected = scope.selectedElement;
                    var attr = attrs.info.split(',');
                    if (eSelected.uuid === attr[0]) {
                        return false;
                    }

                    var jqCurrent = $(ele);

                    var current = {
                        width: parseInt(jqCurrent.css('width')),
                        vLeft: parseInt(jqCurrent.css('left')),
                        height: parseInt(jqCurrent.css('height')),
                        hTop: parseInt(jqCurrent.css('top'))
                    }, selected = {
                        width: parseInt(eSelected.w),
                        vLeft: parseInt(eSelected.left),
                        height: parseInt(eSelected.h),
                        hTop: parseInt(eSelected.top)
                    };

                    switch (eSelected.type) {
                        // 视频
                        case 'video':
                            selected.width = parseInt(eSelected.inw);
                            selected.height = parseInt(eSelected.inh);
                            break;
                        // 普通文本
                        case 'text':
                        // 富文本
                        case 'ptext':
                        // 普通按钮
                        case 'btn':
                            selected.height = parseInt(eSelected.height);
                            break;
                        // 特殊按钮
                        case 'pButton':
                            selected.width = parseInt(eSelected.picwidth);
                            selected.height = parseInt(eSelected.picheight);
                            break;
                        // 图集
                        case 'slides':
                        // 轮播元素
                        case 'slide':
                            selected.width = parseInt(eSelected.width);
                            selected.height = parseInt(eSelected.height);
                            break;
                        // 图片
                        case 'pic':
                        // 形状
                        case 'pshape':
                        // 网址 未添加 directive 'refercnceLine'
                        case 'site':
                        // 表单 未添加 directive 'refercnceLine'
                        case 'eleform':
                        // 图表 未添加 directive 'refercnceLine'
                        case 'charts':
                            break;
                    }



                    current = $.extend(current, {
                        vCenter: current.vLeft + current.width / 2,
                        vRight: current.vLeft + current.width,
                        hCenter: current.hTop + current.height / 2,
                        hBottom: current.hTop + current.height,
                    })

                    selected = $.extend(selected, {
                        vCenter: selected.vLeft + selected.width / 2,
                        vRight: selected.vLeft + selected.width,
                        hCenter: selected.hTop + selected.height / 2,
                        hBottom: selected.hTop + selected.height,
                    })

                    var abs = {
                        vll: Math.abs(current.vLeft - selected.vLeft),
                        vlc: Math.abs(current.vLeft - selected.vCenter),
                        vlr: Math.abs(current.vLeft - selected.vRight),
                        vcl: Math.abs(current.vCenter - selected.vLeft),
                        vcc: Math.abs(current.vCenter - selected.vCenter),
                        vcr: Math.abs(current.vCenter - selected.vRight),
                        vrl: Math.abs(current.vRight - selected.vLeft),
                        vrc: Math.abs(current.vRight - selected.vCenter),
                        vrr: Math.abs(current.vRight - selected.vRight),

                        htt: Math.abs(current.hTop - selected.hTop),
                        htc: Math.abs(current.hTop - selected.hCenter),
                        htb: Math.abs(current.hTop - selected.hBottom),
                        hct: Math.abs(current.hCenter - selected.hTop),
                        hcc: Math.abs(current.hCenter - selected.hCenter),
                        hcb: Math.abs(current.hCenter - selected.hBottom),
                        hbt: Math.abs(current.hBottom - selected.hTop),
                        hbc: Math.abs(current.hBottom - selected.hCenter),
                        hbb: Math.abs(current.hBottom - selected.hBottom),
                    }
                    // if (attrs.info.split(',')[1] === 'ptext') {

                    // console.log(attrs.info, current, selected, abs);
                    // }
                    var line = scope.line;
                    if (attrs.info !== line.vLeft.info) {
                        if (abs.vll < gap) {
                            line.vLeft.abs = abs.vll;
                            line.vLeft.end = current.vLeft;
                        }
                        if (abs.vlc < gap) {
                            line.vLeft.abs = abs.vlc;
                            line.vLeft.end = current.vLeft - selected.width / 2;
                        }
                        if (abs.vlr < gap) {
                            line.vLeft.abs = abs.vlr;
                            line.vLeft.end = current.vLeft - selected.width;
                        }
                        if(abs.vll < gap || abs.vlc < gap || abs.vlr < gap) {
                            line.vLeft.info = attrs.info;
                            line.vLeft.left = current.vLeft;
                            line.vLeft.display = 'block';
                        }
                    } else {
                        if (abs.vll > gap && abs.vlc > gap && abs.vlr > gap) {
                            line.vLeft.info = '';
                            line.vLeft.left = 0;
                            line.vLeft.end = 0;
                            line.vLeft.abs = 0;
                            line.vLeft.display = 'none';
                        }
                    }

                    if (attrs.info !== line.vCenter.info) {
                        if (abs.vcl < gap) {
                            line.vCenter.abs = abs.vcl;
                            line.vCenter.end = current.vCenter;
                        }
                        if (abs.vcc < gap) {
                            line.vCenter.abs = abs.vcc;
                            line.vCenter.end = current.vCenter - selected.width / 2;
                        }
                        if (abs.vcr < gap) {
                            line.vCenter.abs = abs.vcr;
                            line.vCenter.end = current.vCenter - selected.width;
                        }
                        if(abs.vcl < gap || abs.vcc < gap || abs.vcr < gap) {
                            line.vCenter.info = attrs.info;
                            line.vCenter.left = current.vCenter;
                            line.vCenter.display = 'block';
                        }
                    } else {
                        if(abs.vcl > gap && abs.vcc > gap && abs.vcr > gap) {
                            line.vCenter.info = '';
                            line.vCenter.left = 0;
                            line.vCenter.end = 0;
                            line.vCenter.abs = 0;
                            line.vCenter.display = 'none';
                        }
                    }

                    if (attrs.info !== line.vRight.info) {
                        if (abs.vrl < gap) {
                            line.vRight.abs = abs.vrl;
                            line.vRight.end = current.vRight;
                        }
                        if (abs.vrc < gap) {
                            line.vRight.abs = abs.vrc;
                            line.vRight.end = current.vRight - selected.width / 2;
                        }
                        if (abs.vrr < gap) {
                            line.vRight.abs = abs.vrr;
                            line.vRight.end = current.vRight - selected.width;
                        }
                        if(abs.vrl < gap || abs.vrc < gap || abs.vrr < gap) {
                            line.vRight.info = attrs.info;
                            line.vRight.left = current.vRight;
                            line.vRight.display = 'block';
                        }
                    } else {
                        if(abs.vrl > gap && abs.vrc > gap && abs.vrr > gap) {
                            line.vRight.info = '';
                            line.vRight.left = 0;
                            line.vRight.end = 0;
                            line.vRight.abs = 0;
                            line.vRight.display = 'none';
                        }
                    }

                    if (attrs.info !== line.hTop.info) {
                        if (abs.htt < gap) {
                            line.hTop.abs = abs.htt;
                            line.hTop.end = current.hTop;
                        }
                        if (abs.htc < gap) {
                            line.hTop.abs = abs.htc;
                            line.hTop.end = current.hTop - selected.height / 2;
                        }
                        if (abs.htb < gap) {
                            line.hTop.abs = abs.htb;
                            line.hTop.end = current.hTop - selected.height;
                        }
                        if(abs.htt < gap || abs.htc < gap || abs.htb < gap) {
                            line.hTop.info = attrs.info;
                            line.hTop.top = current.hTop;
                            line.hTop.display = 'block';
                        }
                    } else {
                            // scope.lineContainer.display = 'none';
                        if (abs.htt > gap && abs.htc > gap && abs.htb > gap) {
                            line.hTop.info = '';
                            line.hTop.top = 0;
                            line.hTop.end = 0;
                            line.hTop.abs = 0;
                            line.hTop.display = 'none';
                        }
                    }


                    if (attrs.info !== line.hCenter.info) {
                        if (abs.hct < gap) {
                            line.hCenter.abs = abs.hct;
                            line.hCenter.end = current.hCenter;
                        }
                        if (abs.hcc < gap) {
                            line.hCenter.abs = abs.hcc;
                            line.hCenter.end = current.hCenter - selected.height / 2;
                        }
                        if (abs.hcb < gap) {
                            line.hCenter.abs = abs.hcb;
                            line.hCenter.end = current.hCenter - selected.height;
                        }
                        if(abs.hct < gap || abs.hcc < gap || abs.hcb < gap) {
                            line.hCenter.info = attrs.info;
                            line.hCenter.top = current.hCenter;
                            line.hCenter.display = 'block';
                        }
                    } else {
                        if(abs.hct > gap && abs.hcc > gap && abs.hcb > gap) {
                            line.hCenter.info = '';
                            line.hCenter.top = 0;
                            line.hCenter.end = 0;
                            line.hCenter.abs = 0;
                            line.hCenter.display = 'none';
                        }

                    }

                    if (attrs.info !== line.hBottom.info) {
                        if (abs.hbt < gap) {
                            line.hBottom.abs = abs.hbt;
                            line.hBottom.end = current.hBottom;
                        }
                        if (abs.hbc < gap) {
                            line.hBottom.abs = abs.hbc;
                            line.hBottom.end = current.hBottom - selected.height / 2;
                        }
                        if (abs.hbb < gap) {
                            line.hBottom.abs = abs.hbb;
                            line.hBottom.end = current.hBottom - selected.height;
                        }
                        if(abs.hbt < gap || abs.hbc < gap || abs.hbb < gap) {
                            line.hBottom.info = attrs.info;
                            line.hBottom.top = current.hBottom;
                            line.hBottom.display = 'block';
                        }
                    } else {
                        if(abs.hbt > gap && abs.hbc > gap && abs.hbb > gap) {
                            line.hBottom.info = '';
                            line.hBottom.top = 0;
                            line.hBottom.end = 0;
                            line.hBottom.abs = 0;
                            line.hBottom.display = 'none';
                        }
                    }


                });
            }
        };
    });
    // input 字号处理
    dir.directive('fontSize', ['$rootScope', function () {
        return {
            require: '?ngModel',
            link: function (scope, ele, attrs, $ngModel) {
                $ngModel.$render = function () {
                    if ($ngModel.$modelValue) {
                        ele.val(parseInt($ngModel.$modelValue));
                    } else {
                        ele.val('14');
                    }
                };

                ele.on('keyup', function (t) {
                    var n = t.target,res;
                    var val = parseInt(n.value);
                    if (!val) {
                        res = '';
                    } else {
                        res = (val > 600) ? 600 : val;
                    }
                    $ngModel.$setViewValue(res);
                    n.value = res;
                });

                ele.on('blur', function (t) {
                    var n = t.target;
                    n.value = ($ngModel.$modelValue && parseInt(n.value)) ? parseInt(n.value) : '';
                });
            }
        };
    }
    ]);

    // psd上传处理
    dir.directive('psdWatcher', ['Config','$timeout', function(Config, $timeout) {
        return {
            restrict:'A',
            link:function(scope) {

                /**
                 * 拖拽文件获取图层函数
                 */
                function dragGetFile() {
                    var dropbox = angular.element('#psd-body')[0];
                    dropbox.addEventListener("dragenter", function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                    }, false);
                    dropbox.addEventListener("dragleave", function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                    }, false);
                    dropbox.addEventListener("dragover", function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                    }, false);
                    dropbox.addEventListener("drop",getFile, false);
                }


                // 上传获取图层
                angular.element('.psd-body').off('change').on('change', '.drop-psd-input', function(e) {
                    var files = e.target.files[0];
                    $('<input type="file" accept="image/vnd.adobe.photoshop" class="drop-psd-input">').replaceAll('.drop-psd-input');
                    getFile(e);
                });
                // 拖拽文件获取图层
                dragGetFile();

                /**
                 * 获取上传文件
                 * @param e 事件对象
                 */
                function getFile(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var files = e.target.files[0] || e.dataTransfer.files[0];
                    if (files) {
                        if (!validateFile(files, 30)) {
                            return;
                        }
                        readFile(files);
                    }
                }

                /**
                 *判断psd图片大小以及格式是否正确
                 * @param file 文件
                 * @param m 文件大小
                 * @returns {boolean}
                 */
                function validateFile (file, m) {
                    if (!file || file.type != 'image/vnd.adobe.photoshop' && file.name.slice(-4) != '.psd') {
                        alert('格式错误');
                        return false;
                    }
                    if (file.size >= m * 1024 * 1024) {
                        alert('文件大小不能超过' + m + 'MB');
                        return false;
                    }
                    return true;
                }
                // 引入psd插件
                var PSD = require('psd');

                /**
                 * 处理psd上传的图片数组
                 * @param fileData psd
                 */
                // 计算psd生成图片张数
                var cnt = 0;
                function readFile(fileData) {
                    angular.element('.psd-title').text('正在上传请勿关闭窗口');
                    angular.element('.icon-add,.advice,.drop-psd-input,.close').hide();
                    angular.element('#updating-line').width('0%');
                    angular.element('.loading-tip').text('已经上传0%');
                    angular.element('.updating-logo, .updating-lading, .loading-tip').show();
                    PSD.fromDroppedFile(fileData).then(function (psd) {
                        var arr = psd.tree().descendants();
                        function calcCnt(tree) {
                            var temp;
                            tree.forEach(function (node) {
                                // 过滤不符合条件的图层
                                if (node.isGroup() || !node.visible() || !node.layer.visible || node.layer.height == 0 || node.layer.width == 0) {
                                    return;
                                }
                                temp = {
                                    picid: node.layer.image.toBase64(),
                                    top: node.top,
                                    left: node.left,
                                    w: node.width,
                                    h: node.height,
                                    rotate: '0',
                                    opacity: parseInt(100 * (1 - node.layer.image.opacity)),
                                    type: 'pic',
                                    con: '',
                                    show: 'fadeInNormal',
                                    speed: 1e3,
                                    delay: 600,
                                    borderradius: 0,
                                    shape: 0,
                                    inw: node.width,
                                    inh: node.height,
                                    intop: 0,
                                    inleft: 0,
                                    stylecolor: 'rgba(0,0,0,0)',
                                    styleopacity: 0,
                                    height: 256
                                };
                                scope.psdUploadingImg.unshift(temp);
                                cnt += 1;
                            });
                        }
                        // 分析图层
                        calcCnt(arr);
                        // 图层错误,或者无涂层
                        if (arr.length == 0 || cnt == 0) {
                            alert('该PSD文件没有有效或可见的图层');
                            angular.element('.psd-title').text('请重新上传');
                            angular.element('.icon-add,.advice,.drop-psd-input,.close').show();
                            angular.element('.updaed-logo,.loaded-button,.updating-logo, .updating-lading, .loading-tip').hide();
                            return false;
                        }
                    }).then(function () {
                        if (scope.psdUploadingImg.length && $('.modal').css('display') === 'block') {
                            scope.$parent.psdUploading = true;
                            angular.element('.updateing-line').width('10%');
                            angular.element('.loading-tip').text('已经上传10%');
                            _.each(scope.psdUploadingImg, function (el) {
                                uploads(el);
                            });
                        }
                    });
                }

                /**
                 * psd上传
                 * @param file 上传图片对象
                 * @returns {boolean} void
                 */
                var curCnt = 0;
                function uploads(file) {
                    // psd不再上传
                    if (!scope.$parent.psdUploading) {
                        return false;
                    }
                    $.ajax({
                        url: Config.psdUploadUrl,
                        method:'POST',
                        data: {
                            cteateTime: parseInt(scope.createTime) * 1000,
                            name:'psd' + Math.random().toString(36).substring(2),
                            projectId: scope.projectId,
                            base64:file.picid
                        },
                        success: function (data) {
                            if (data.code !== '100') {
                                var msgCon = '文件上传失败(；′⌒`)';
                                if (data.msg) {
                                    msgCon = data.msg;
                                }
                                scope.msgConfirm(msgCon);
                                return;
                            }
                            if (!data.imgUrl) {
                                file.picid = '';
                            } else {
                                file.picid = Config.psdPicUrl + data.imgUrl;
                            }
                            curCnt += 1;
                            var upProgress = 100;
                            if (curCnt === cnt) {
                                allFinish();
                            } else {
                                upProgress = 10 + parseInt((90 / cnt) * curCnt);
                            }
                            angular.element('#updating-line').width(upProgress + '%');
                            angular.element('.loading-tip').eq(0).text('已经上传' + upProgress + '%');
                        },
                        fail:function () {
                            file.picid = '';
                            curCnt += 1;
                            scope.msgConfirm('文件上传失败(；′⌒`)');
                        }
                    });
                }

                /**
                 * 图片全部上传完毕后操作
                 */
                function allFinish() {
                    if (cnt === curCnt) {
                        scope.$parent.psdUploading = false;
                        scope.addPsdImg();
                        angular.element('.psd-title').text('导入成功');
                        angular.element('.icon-add,.advice,.updating-logo, .updating-lading, .loading-tip,.drop-psd-input').hide();
                        angular.element('.updaed-logo,.loaded-button,.psd-title,.close').show();
                    }
                }
            }
        };
    }]);
    // 初始值处理 字号处理
    dir.directive('timerFormat', ['$rootScope', function () {
        return {
            require: '?ngModel',
            link: function (scope, ele, attrs, $ngModel) {
                $ngModel.$render = function () {
                    if ($ngModel.$modelValue) {
                        ele.val(parseInt($ngModel.$modelValue));
                    } else {
                        ele.val('10');
                    }
                };

                ele.on('keyup', function (t) {
                    var n = t.target,res;
                    var val = parseInt(n.value);
                    if (!val) {
                        res = '';
                    }
                    $ngModel.$setViewValue(res);
                    n.value = res;
                });
                ele.on('blur', function (t) {
                    var n = t.target;
                    n.value = ($ngModel.$modelValue && parseInt(n.value)) ? parseInt(n.value) : '';
                });
            }
        };
    }
    ]);
})();
