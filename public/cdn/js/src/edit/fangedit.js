/*
 * @Author: liyy
 * @Date:   2015/9/9
 * @description: h5market控制器，主要代码编写
 * @Last Modified by: liuxinlu@fang.com
 * @Last Modified time: 2018-03-05 18:28:52
 */
(function () {
    'use strict';
    AppConfig.registerModule('fang.editor');
    angular.module('fang.editor', []).
        factory('editorRequest', ['$resource', 'Config', function ($resource, Config) {
            return $resource('', {}, {
                // 获取我上传的图片
                getMyUploadImg: {
                    method: 'get',
                    url: Config.baseUrl + '?c=api&a=ajaxGetMedia'
                },
                // 获取系统图片大种类
                getPicCatalog: {
                    method: 'get',
                    url: Config.baseUrl + '?c=api&a=ajaxGetPicType'
                },
                // 获取图片大种类的自种类
                getPicByCatalog: {
                    method: 'get',
                    url: Config.baseUrl + '?c=api&a=ajaxGetPicByType'
                },
                // 删除图片
                deleteMyPic: {
                    method: 'post',
                    url: Config.baseUrl + '?c=admin&a=ajaxDelMedia'
                },
                // 获取模版数据
                getModelData: {
                    method: 'get',
                    url: Config.baseUrl
                },
                // 获取网络音乐
                getWebMusicData: {
                    method: 'get',
                    url: Config.baseUrl + '?c=api&a=ajaxGetSomeMusic'
                },
                // 获取网络音乐
                getMyUploadMusic: {
                    method: 'get',
                        url: Config.baseUrl + '?c=api&a=ajaxGetMedia'
                }
            });
        }]).
        factory('fangService', ['$q', '$http', 'Config', function ($q, $http) {
            // 获取项目数据
            var getProjectData = function (e) {
                var defer = $q.defer();
                $http.get(e.url).success(function (e) {
                    defer.resolve(e);
                }).error(function (e) {
                    defer.reject(e);
                });
                return defer.promise;
            };
            return {getProjectData: getProjectData};
        }]).
        controller('editor', ['$rootScope','$scope','fangService', '$timeout', '$filter', '$modal', 'editorRequest', 'Config', '$interval','$sce',
            function ($rootScope,$scope, $fangService,  $timeout, $filter, $modal, editorRequest, Config, $interval, $sce) {
                var win = window;
                var projPreviewUrl = '';
                // 是否在拖动
                var isPan = false;
                // 选中元素left值
                var thisLeft = 0;
                // 选中元素top值
                var thisTop = 0, thisH, thisW, thisInleft, thisIntop, selPicW, selPicPercent;
                var trueLeft, trueTop, trueH, trueW, trueInleft, trueIntop;
                // 背景缩放尺度
                $rootScope.bgScale = win.innerHeight / 1008 * 0.7;
                // 最右侧模块高度
                $rootScope.rightHeight = win.innerHeight - 50;
                // 是否添加图集
                $scope.addSlidersPic = false;
                // 是否显示图片库
                $scope.showPicView = false;
                // 是否显示模板弹出框编辑我的模板标题/添加模板封面
                $scope.showTplView = false;
                // 是否显示图形库
                $scope.showShapeView = false;

                // 打开psd文件上传界面
                $scope.showPsdView = false;
                // 是否出发input点击事件
                $scope.inputClick = false;

                // 最大页面数量限制
                $scope.maxPage = 60;
                // 默认选中全部模板
                $scope.templateClass = 0;
                // 默认视频地址为''
                $scope.video = {
                    videourl: ''
                };
                // 页面是否有互动按钮(默认为无)
                $scope.vote = {
                    sign: 0,
                    data: []
                };
                // 页面滑块组件
                $scope.sliders = [];
                // 默认添加网页地址为 ''
                $scope.site = {
                    url: ''
                };
                // 上传模板图片压缩配置
                $scope.conf = {maxW: 390, maxH: 614, quality: 0.8, orien: 1};
                // 选中图片类型，默认是我的
                $scope.selectedCatalog = {
                    zh: 'mine'
                };
                //图集自动播放属性
                $scope.autoplay = [{
                    name: '自动',
                    class: 'true'
                }, {
                    name: '手动',
                    class: 'false'
                }];

                // 图片是否放大属性
                $scope.picMagnify = [{
                    name: '否',
                    class: 'no'
                }, {
                    name: '是',
                    class: 'yes'
                }];
                // 事件类型
                $scope.eventTypes = [{
                    name: '无',
                    class: 'none'
                }, {
                    name: '点击',
                    class: 'click'
                }];
                // 事件处理
                $scope.eventActions = [{
                    name: '无效果',
                    class: 'none'
                }, {
                    name: '放大元素',
                    class: 'magnify'
                }, {
                    name: '隐藏元素',
                    class: 'hide'
                }, {
                    name: '翻页',
                    class: 'changePage'
                }, {
                    name: '显示元素',
                    class: 'show'
                }, {
                    name: '跳转',
                    class: 'toUrl'
                }];
                // 事件处理
                $scope.eventActions2 = [{
                    name: '无效果',
                    class: 'none'
                }, {
                    name: '隐藏元素',
                    class: 'hide'
                }, {
                    name: '翻页',
                    class: 'changePage'
                }, {
                    name: '显示元素',
                    class: 'show'
                }, {
                    name: '跳转',
                    class: 'toUrl'
                }];
                // 视频播放方式
                $scope.videoPlay = [{
                    name: '自动',
                    class: 'auto'
                }, {
                    name: '手动',
                    class: 'control'
                }];
                // 是否超过一屏
                $scope.overScreen = [{
                    name: '是',
                    class: 'on'
                }, {
                    name: '否',
                    class: 'off'
                }];

                // 计时类型
                $scope.timerType = [{
                    name:'无',
                    class: 'none'
                },{
                    name:'正计时',
                    class:'timeKeeper'
                },{
                    name:'倒计时',
                    class:'countDown'
                }];

                // 计时器数组 未添加则为空字符串
                $scope.timer = '';
                // 初始计时器值
                $scope.defaultTimer = {
                    name:'无',
                    class: 'none'
                };
                // 是否是固定模式
                $scope.locked = true;
                // 撤销元素集合
                $scope.movementList = [];
                // 是否显示模版视图
                $scope.showModelView = false;
                // 是否显示网格设置
                $scope.showWangge = false;
                // 是否显示网格
                $scope.showCankao = false;
                // 是否正在加载
                $scope.loading = true;
                // 上传图片数组
                $scope.myUploadingImg = [];
                // 上传音乐文件数组
                $scope.myUploadingMusic = [];

                // 上传psd图片数组
                $scope.psdUploadingImg = [];
                // psd 图片是否正在上传
                $scope.psdUploading = false;
                // 字号
                $scope.fontSizes = [18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48, 56, 60, 72, 96, 112, 128, 144, 288, 576];
                // 图表编辑表格列数量
                $scope.chartTableCount = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                // 图表编辑表格行数量
                $scope.pieTableCount = [0, 1, 2, 3, 4, 5];
                // 行距
                $scope.lineHeights = [1, 1.2, 1.35, 1.5, 1.75, 2, 2.5];
                // 音乐
                $scope.audio = new Audio();
                // 是否是预览模板
                $scope.preAddingTemplate = false;
                // 图表背景颜色
                $scope.chartBgColor = ['#ffffff', '#cccccc', '#989898', '#474747', '#44536a', '#000000'];
                // 是否正在更换形状
                $scope.changingShape = false;
                // 是否正在更换图片
                $scope.changingImg = false;
                // 是否正在更换视频
                $scope.changingVideo = false;
                // 是否在更换网址
                $scope.changingSite = false;
                // 是否正在更换背景
                $scope.changingBg = false;

                $scope.pageConfig = {
                    // 每页音乐条数
                    pageSize: 10,
                    // 第几页
                    pageIndex: 1
                };
                // 网络音乐
                $scope.webMusic = [];
                $scope.wMTotalPage = [];
                $scope.webMusicObj = {};

                // 默认字体,默认为空
                $scope.defaultFont = {
                    name:"默认字体",
                    fontFamily:"inherit"
                };
                // 字体是否已经加载
                $scope.fontLoaded = false;
                // 模板数组
                $scope.templateData = [];
                // 我的模板 默认模板标题为空,封面链接地址为空
                $scope.signleTemplateData = {
                    title: '',
                    cover: ''
                };
                // 系统音乐
                $scope.systemMusic = [{
                    name: '广州',
                    id: 76699
                }, {
                    name: '拥抱光明',
                    id: 1
                }, {
                    name: '缠绵悦耳',
                    id: 2
                }, {
                    name: '憧憬星空',
                    id: 3
                }, {
                    name: '激进奋起',
                    id: 4
                }, {
                    name: '温柔浪漫',
                    id: 6
                }, {
                    name: '安静励志',
                    id: 76644
                }, {
                    name: '宏伟奋进',
                    id: 76649
                }, {
                    name: '欢快诙谐',
                    id: 76650
                }, {
                    name: '假日游玩',
                    id: 76653
                }, {
                    name: '温暖呵护',
                    id: 76657
                }, {
                    name: '午后写意',
                    id: 76660
                }, {
                    name: '治愈安柔',
                    id: 76662
                }, {
                    name: '大气磅礴',
                    id: 76665
                }, {
                    name: '闪电部队在行动',
                    id: 789544
                }, {
                    name: 'see you again',
                    id: 789546
                }];
                // 是否滑动翻页
                $scope.panList = [{
                    name: '是',
                    class: 'yes'
                }, {
                    name: '否',
                    class: 'no'
                }];
                // 字幕数字组合，提供表单8位id
                var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
                // 图表颜色
                $scope.chartsColor = [['#E06B6A', '#674E68', '#86D2C1', '#F5CE85', '#50B1BF', '#EE9360'], ['#F5E2C3', '#C3B2C8', '#e3bacd',
                    '#a0dfd6', '#9fdadf', '#eec3c2'], ['#c0d7ef', '#add6ee', '#bbf2d4', '#98e2cb', '#72c4d2', '#84b5df'],
                    ['#9fc2a2', '#6aba9e', '#2E8F7E', '#C5E2CC', '#54a16d', '#bac787'], ['#D89BC1', '#9C6B91', '#3E3364',
                        '#535E7D', '#D1C5CE', '#FFB8C1'], ['#DF7473', '#26CAB3', '#375A71', '#0EB1E7', '#CEE5B3', '#C0DAF6'],
                    ['#3DA5E1', '#517D97', '#174B69', '#A6C8EA', '#818A97', '#BCC9D5'], ['#223D53', '#818A97', '#606060', '#465E70',
                        '#8E8E8E', '#C3C3C3']];
                // 形状元素
                $scope.shapeNum = ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg', '9.svg',
                    '10.svg', '11.svg', '12.svg'];
                // 互动按钮的样式
                $scope.btnThumb = [{
                    name: '送花',
                    picid: '2.png'
                }, {
                    name: '喜欢',
                    picid: '3.png'
                }, {
                    name: '点赞',
                    picid: '4.png'
                }, {
                    name: '悼念',
                    picid: '5.png'
                }];
                $scope.overImg = {id: 'none'};
                // 我的模板删除按钮样式
                $scope.overMyTpl = {id: 'none'};
                // 对齐方式
                $scope.textAligns = [{
                    name: '左对齐',
                    value: 'left'
                }, {
                    name: '居中',
                    value: 'center'
                }, {
                    name: '右对齐',
                    value: 'right'
                }];
                // 图集动画
                $scope.slidesEffect = [{
                    name: '无效果',
                    class: 'none'
                }, {
                    name: '位移切换',
                    class: 'slide'
                }, {
                    name: '淡入',
                    class: 'fade'
                }, {
                    name: '方块',
                    class: 'cube'
                }, {
                    name: '3d流',
                    class: 'coverflow'
                }, {
                    name: '3d翻转',
                    class: 'flip'
                }, {
                    name: '弹跳',
                    class: 'bounce'
                }, {
                    name: '闪现',
                    class: 'flash'
                }, {
                    name: '心跳',
                    class: 'pulse'
                }, {
                    name: '橡皮圈',
                    class: 'rubberBand'
                }, {
                    name: '震动',
                    class: 'shake'
                }, {
                    name: '摇摆',
                    class: 'swing'
                }, {
                    name: '晃动',
                    class: 'slide'
                }, {
                    name: '放大',
                    class: 'zoomIn'
                }, {
                    name: '旋转',
                    class: 'rotateIn'
                }
                ];
                // 入场动画
                $scope.effectsIn = [{
                    name: '无效果',
                    class: 'noeffect'
                }, {
                    name: '淡入',
                    class: 'fadeInNormal'
                }, {
                    name: '从左滚入',
                    class: 'rotateInDownLeft'
                }, {
                    name: '从右滚入',
                    class: 'rotateInDownRight'
                }, {
                    name: '放大',
                    class: 'zoomIn'
                }, {
                    name: '下落放大',
                    class: 'zoomInDown'
                }, {
                    name: '弹性放大',
                    class: 'fadeIn'
                }, {
                    name: '弹性缩小',
                    class: 'expandOpen'
                }, {
                    name: '向右飞入',
                    class: 'fadeInLeft'
                }, {
                    name: '向左飞入',
                    class: 'fadeInRight'
                }, {
                    name: '向上飞入',
                    class: 'fadeInUp'
                }, {
                    name: '向下飞入',
                    class: 'fadeInDown'
                }, {
                    name: '旋转出现',
                    class: 'rotateIn'
                }, {
                    name: '左右翻转',
                    class: 'flipInY'
                }, {
                    name: '上下翻转',
                    class: 'flipInX'
                }, {
                    name: '刹车',
                    class: 'lightSpeedIn'
                }, {
                    name: '向右滑入',
                    class: 'slideRight'
                }, {
                    name: '向左滑入',
                    class: 'slideLeft'
                }, {
                    name: '向上滑入',
                    class: 'slideUp'
                }, {
                    name: '向下滑入',
                    class: 'slideDown'
                }, {
                    name: '向右展开',
                    class: 'stretchRight'
                }, {
                    name: '向左展开',
                    class: 'stretchLeft'
                }, {
                    name: '向上展开',
                    class: 'pullUp'
                }, {
                    name: '向下展开',
                    class: 'pullDown'
                }];
                // 场间动画
                $scope.effectsOn = [{
                    name: '无效果',
                    class: 'noeffect'
                }, {
                    name: '向左旋转',
                    class: 'rotateLeft'
                }, {
                    name: '向右旋转',
                    class: 'rotateRight'
                }, {
                    name: '弹出',
                    class: 'bounceIn'
                }, {
                    name: '摇晃',
                    class: 'wobble'
                }, {
                    name: '摆动',
                    class: 'swing'
                }, {
                    name: '抖动',
                    class: 'shake'
                }, {
                    name: '果冻',
                    class: 'jello'
                }, {
                    name: '弹跳',
                    class: 'bounce'
                }, {
                    name: '闪烁',
                    class: 'flash'
                }, {
                    name: '脉冲',
                    class: 'pulse'
                }, {
                    name: '橡皮筋',
                    class: 'rubberBand'
                }, {
                    name: '浮动',
                    class: 'floating'
                }];
                // 出场动画
                $scope.effectsOut = [{
                    name: '无效果',
                    class: 'noeffect'
                }, {
                    name: '淡出',
                    class: 'fadeOut'
                }, {
                    name: '放大淡出',
                    class: 'zoomFadeOut'
                }, {
                    name: '缩小淡出',
                    class: 'zoomOut'
                }, {
                    name: '向右飞出',
                    class: 'fadeOutRight'
                }, {
                    name: '向左飞出',
                    class: 'fadeOutLeft'
                }, {
                    name: '向上飞出',
                    class: 'fadeOutUp'
                }, {
                    name: '向下飞出',
                    class: 'fadeOutDown'
                }, {
                    name: '向右滚出',
                    class: 'rotateOutUpRight'
                }, {
                    name: '向左滚出',
                    class: 'rotateOutUpLeft'
                }, {
                    name: '掉落',
                    class: 'hinge'
                }, {
                    name: '旋转消失',
                    class: 'rotateOut'
                }];
                // 翻页效果集合
                $scope.effectList = [{
                    name: '翻页',
                    class: 'toup'
                }, {
                    name: '魔方',
                    class: 'cubedown'
                }, {
                    name: '折叠',
                    class: 'flipup'
                }, {
                    name: '上滑',
                    class: 'moveup'
                }, {
                    name: '推上',
                    class: 'pushup'
                }, {
                    name: '旋转',
                    class: 'news'
                }, {
                    name: '淡出淡出',
                    class: 'scaleup'
                }, {
                    name: '立体',
                    class: 'roomup'
                }, {
                    name: '缩放',
                    class: 'carouup'
                }, {
                    name: '掉落',
                    class: 'fall'
                }];
                // 主题颜色
                $scope.themeColors = ['#3C495F', '#FF6C6C', '#FBC600', '#90D356', '#2B90ED', '#6E5993'];
                // 颜色模板
                $scope.colorModel = ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', 'rgba(0,255,209,100)', '#00ffff',
                    '#0000ff', '#9900ff', '#ff00ff', '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#BFF9F2',
                    '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc', '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8',
                    '#7DDFD4', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd', '#cc4125', '#e06666', '#f6b26b', '#ffd966',
                    '#93c47d', '#42C2B3', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0', '#a61c00', '#cc0000', '#e69138',
                    '#f1c232', '#6aa84f', '#0BA492', '#45818e', '#3d85c6', '#674ea7', '#a64d79', '#5b0f00', '#660000',
                    '#783f04', '#7f6000', '#274e13', '#007466', '#0c343d', '#073763', '#20124d', '#4c1130'];
                // 调色板颜色模版
                $scope.colorBoardModel = ['#FFFFFF', '#E3E4E5', '#21d4d8', '#1292b3', '#00BEF2', '#69CEF5', '#4993C8',
                    '#0062B8', '#6666FF', '#7749F5', '#9621C1', '#CC29B1', '#F41484', '#F074AC', '#F16C74', '#A8A8A8',
                    '#545454', '#000000', '#48E0C3', '#42C2B3', '#0C9467', '#17A53C', '#7ED321', '#B7D989', '#F4F47A',
                    '#F7DF00', '#DDB208', '#CC6D1F', '#F97F2D', '#FC532B', '#E01E36'];
                // 元素效果集合
                var cubedown = ['pt-page-rotateCubeTopOut', 'pt-page-rotateCubeTopIn', 'pt-page-rotateCubeBottomOut',
                        'pt-page-rotateCubeBottomIn', 'swipedown', 'swipeup'],
                    cubeup = ['pt-page-rotateCubeBottomOut', 'pt-page-rotateCubeBottomIn', 'pt-page-rotateCubeTopOut',
                        'pt-page-rotateCubeTopIn', 'swipeup', 'swipedown'],
                    cubeleft = ['pt-page-rotateCubeLeftOut', 'pt-page-rotateCubeLeftIn', 'pt-page-rotateCubeRightOut',
                        'pt-page-rotateCubeRightIn', 'swiperight', 'swipeleft'],
                    cuberight = ['pt-page-rotateCubeRightOut', 'pt-page-rotateCubeRightIn', 'pt-page-rotateCubeLeftOut',
                        'pt-page-rotateCubeLeftIn', 'swipeleft', 'swiperight'],
                    flipup = ['pt-page-flipOutTop', 'pt-page-flipInBottom pt-page-delay500', 'pt-page-flipOutBottom ',
                        'pt-page-flipInTop pt-page-delay500', 'swipedown', 'swipeup'],
                    moveup = ['pt-page-moveToTop', 'pt-page-moveFromBottom', 'pt-page-moveToBottom', 'pt-page-moveFromTop',
                        'swipedown', 'swipeup'],
                    pushup = ['pt-page-rotatePushTop', 'pt-page-moveFromBottom pt-page-delay100', 'pt-page-rotatePushBottom',
                        'pt-page-moveFromTop pt-page-delay100', 'swipedown', 'swipeup'],
                    news = ['pt-page-rotateOutNewspaper', 'pt-page-rotateInNewspaper pt-page-delay500',
                        'pt-page-rotateOutNewspaper', 'pt-page-rotateInNewspaper pt-page-delay500', 'swipedown', 'swipeup'],
                    scaleup = ['pt-page-scaleDown', 'pt-page-scaleUpDown pt-page-delay300', 'pt-page-scaleDownUp',
                        'pt-page-scaleUp pt-page-delay300', 'swipedown', 'swipeup'],
                    roomup = ['pt-page-rotateRoomTopOut pt-page-ontop', 'pt-page-rotateRoomTopIn',
                        'pt-page-rotateRoomBottomOut pt-page-ontop', 'pt-page-rotateRoomBottomIn', 'swipedown', 'swipeup'],
                    carouup = ['pt-page-rotateCarouselTopOut pt-page-ontop', 'pt-page-rotateCarouselTopIn',
                        'pt-page-rotateCarouselBottomOut pt-page-ontop', 'pt-page-rotateCarouselBottomIn', 'swipedown', 'swipeup'],
                    fall = ['pt-page-rotateFall pt-page-ontop', 'pt-page-scaleUp', 'pt-page-scaleDown',
                        'pt-page-moveFromBottom', 'swipeup', 'swipedown'],
                    toup = ['pt-page-moveToTopSlow', 'noeffect', 'noeffect', 'pt-page-moveFromTopSlow', 'swipeup', 'swipedown'],
                    Effect = {
                        cubedown: cubedown,
                        cubeup: cubeup,
                        cubeleft: cubeleft,
                        cuberight: cuberight,
                        flipup: flipup,
                        moveup: moveup,
                        pushup: pushup,
                        scaleup: scaleup,
                        roomup: roomup,
                        carouup: carouup,
                        fall: fall,
                        news: news,
                        toup: toup,
                        noeffect: toup
                    };

                $scope.fontConfig =[
                    {name:"默认字体", id:"", fontFamily:"inherit"},
                    {name:"黑体", id:"fonts/fz_dahei.woff", fontFamily:"fz_dahei"},
                    {name:"细黑",id:"fonts/fz_xihei.woff",fontFamily:"fz_xihei"},
                    {name:"宋体", id:"fonts/fz_baosong.woff",fontFamily:"fz_baosong"},
                    {name:"楷体",id:"fonts/fz_kaiti.woff",fontFamily:"fz_kaiti"},
                    {name:"彩云简体",id:"fonts/fz_caiyun.woff",fontFamily:"fz_caiyun"},
                    {name:"粗倩",id:"fonts/fz_cuqian.woff",fontFamily:"fz_cuqian"},
                    {name:"细倩",id:"fonts/fz_xiqian.woff",fontFamily:"fz_xiqian"},
                    {name:"粗圆",id:"fonts/fz_cuyuan.woff",fontFamily:"fz_cuyuan"},
                    {name:"细圆",id:"fonts/fz_xiyuan.woff",fontFamily:"fz_xiyuan"},
                    {name:"隶书",id:"fonts/fz_guli.woff",fontFamily:"fz_guli"},
                    {name:"汉真广标",id:"fonts/fz_hanzhenguangbiao.woff",fontFamily:"fz_hanzhenguangbiao"},
                    {name:"康体",id:"fonts/fz_kangti.woff",fontFamily:"fz_kangti"},
                    {name:"美黑",id:"fonts/fz_meihei.woff",fontFamily:"fz_meihei"},
                    {name:"胖头鱼体",id:"fonts/fz_pangtouyu.woff",fontFamily:"fz_pangtouyu"},
                    {name:"胖娃简体",id:"fonts/fz_pangwa.woff",fontFamily:"fz_pangwa"},
                    {name:"启体",id:"fonts/fz_qiti.woff",fontFamily:"fz_qiti"},
                    {name:"少儿",id:"fonts/fz_shaoer.woff",fontFamily:"fz_shaoer"},
                    {name:"瘦金书",id:"fonts/fz_shoujinshu.woff",fontFamily:"fz_shoujinshu"},
                    {name:"水黑",id:"fonts/fz_shuihei.woff",fontFamily:"fz_shuihei"},
                    {name:"水柱",id:"fonts/fz_shuizhu.woff",fontFamily:"fz_shuizhu"},
                    {name:"宋黑",id:"fonts/fz_songhei.woff",fontFamily:"fz_songhei"},
                    {name:"苏新诗柳楷",id:"fonts/fz_suxinshiliukai.woff",fontFamily:"fz_suxinshiliukai"},
                    {name:"魏碑",id:"fonts/fz_weibei.woff",fontFamily:"fz_weibei"},
                    {name:"行楷",id:"fonts/fz_xingkai.woff",fontFamily:"fz_xingkai"},
                    {name:"姚体",id:"fonts/fz_yaoti.woff",fontFamily:"fz_yaoti"}
                ];

                $scope.showReferLine = true;
                // yf: 吸附线对象
                $scope.line = {
                    vRight: {
                        display: 'none',
                        left: 0
                    },
                    vCenter: {
                        display: 'none',
                        left: 0
                    },
                    vLeft: {
                        display: 'none',
                        left: 0
                    },
                    hBottom: {
                        display: 'none',
                        top: 0
                    },
                    hCenter: {
                        display: 'none',
                        top: 0
                    },
                    hTop: {
                        display: 'none',
                        top: 0
                    }
                }

                // yf: 切换吸附线开关
                $scope.toggleReferLine = function() {
                    $scope.showReferLine = !$scope.showReferLine;
                }

                /**
                 * 加载字体文件
                 * @param fontFamily 字体名称
                 * @param url 地址
                 */
                $scope.loadFonts = function() {
                    if ($scope.fontLoaded) {
                        return;
                    }
                    _.each($scope.fontConfig, function(ele) {
                        if (ele.id.length > 0) {
                            $scope.fontLoad(ele.fontFamily, Config.fontServer + ele.id);
                        }
                    });
                    $scope.fontLoaded = true;
                };

                /**
                 * 下载字体文件,fontface style标签
                 * @param fontFamily
                 * @param url
                 */
                $scope.fontLoad = function(fontFamily, url) {
                    $.ajax({
                        type: 'GET',
                        dataType: 'text',
                        url: url,
                        cache: true,
                        success: function() {
                            $scope.appendCSS('@font-face {font-family: "' + fontFamily + '"; src: url("' + url + '");}');
                        }
                    });
                };

                /**
                 * 以添加style标签的形式将生成的fontface添加的html中
                 * @param rule fontface样式
                 */
                $scope.appendCSS = function (rule) {
                    var newStyle = document.createElement('style');
                        document.head.appendChild(newStyle);
                      newStyle.appendChild(document.createTextNode(rule));
                };

                /**
                 * 改变文本框字体
                 * @param fontId 传入的fontfamily名称
                 * @param fontName fontfamily中文
                 */
                $scope.changeFontFamily = function(fontId, fontName) {
                    // 右侧列表字体信息
                    $scope.defaultFont.name = fontName;
                    $scope.defaultFont.fontFamily = fontId;
                    $scope.selectedElement.fontFamily = fontId;
                    $scope.templateDataProcessing('template', $scope.selectedTemplate);
                };
                /**
                 * 改变文本框字体大小
                 * @param ftSize
                 */
                $scope.changeFontSize = function(ftSize) {

                    $scope.selectedElement.ftsize = ftSize;
                }

                /**
                 * 获取地址栏参数
                 * @param e 参数名称
                 * @returns {*} 参数值
                 */
                $scope.getUrlParameter = function (e) {
                    for (var t = win.location.search.substring(1), n = t.split('&'), a = 0; a < n.length; a++) {
                        var o = n[a].split('=');
                        if (o[0] === e) {
                            return o[1];
                        }
                    }
                };

                /**
                 * 是否超过最大页数限制
                 */
                $scope.isMoreThan = function () {
                    if ($scope.templateData.length >= $scope.maxPage) {
                        $modal.open({
                            template: '<div class="modal-body" >作品不可超过' + $scope.maxPage + '页</div>'
                            + '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">确定</button></div>',
                            controller: 'ModalInstanceCtrl'
                        });
                        $scope.showModelView = false;
                        return true;
                    }
                    return false;
                };

                /**
                 * 将json数据转换为数组
                 * @param result 原始数据
                 * @returns {Object|Array|string|number} json数据
                 */
                $scope.getTemplateJson = function (result) {
                    return angular.fromJson(result.data.pdata.json);
                };

                /**
                 * 每个模版页面处理
                 * @param pageData 每个页面数据
                 * @param sign 'all':全部模版; 'one':单页模版
                 * @returns {*}
                 */
                $scope.templatePageProcessing = function (pageData, sign) {
                    // 添加显示浮层默认值
                    if (!pageData.showFloat) {
                        pageData.showFloat = false;
                    }
                    var elementData = {
                        imgData: [],
                        textData: [],
                        buttonData: [],
                        pButtonData: [],
                        shapeData: [],
                        formData: '',
                        chartData: '',
                        slidesData: [],
                        slideData: [],
                        videoData: [],
                        siteData: ''
                    };
                    // 默认是滑动翻页
                    pageData.pan = pageData.pan || 'yes';
                    _.each(pageData.content, function (con, index) {
                        // 如果数据不存在，忽略
                        if (!con) {
                            return;
                        }

                        // yf: 为每个物体添加 uuid 标识区分
                        con.uuid = $scope.uuid(8);
                        // 动画效果不存在
                        if (con.elementAnimations) {
                            delete con.elementAnimations;
                        }
                        if (con.delay && !(0.1 > parseInt(con.delay) / 1e3 > 0)) {
                            con.delay = parseInt(con.delay) / 1e3;
                        }
                        if (con.speed && !(0.1 > parseInt(con.speed) / 1e3 > 0)) {
                            con.speed = parseInt(con.speed) / 1e3;
                        }
                        // 动画效果不存在
                        if (!con.animations) {
                            con.animations = {
                                // 入场
                                animationIn: {
                                    show: con.show,
                                    speed: con.speed,
                                    delay: con.delay
                                },
                                // 场间
                                animationOn: {
                                    // 次数
                                    frequency: 3,
                                    show: 'noeffect',
                                    speed: 1,
                                    delay: 0.6
                                },
                                // 出场
                                animationOut: {
                                    show: 'noeffect',
                                    speed: 1,
                                    delay: 0.6
                                }
                            };
                        } else {
                            // 处理数据为秒以便使用
                            if (con.animations.animationIn.delay && !(0.1 > parseInt(con.animations.animationIn.delay) / 1e3 > 0)) {
                                con.animations.animationIn.delay = parseInt(con.animations.animationIn.delay) / 1e3;
                            }
                            if (con.animations.animationOn.delay && !(0.1 > parseInt(con.animations.animationOn.delay) / 1e3 > 0)) {
                                con.animations.animationOn.delay = parseInt(con.animations.animationOn.delay) / 1e3;
                            }
                            if (con.animations.animationOut.delay && !(0.1 > parseInt(con.animations.animationOut.delay) / 1e3 > 0)) {
                                con.animations.animationOut.delay = parseInt(con.animations.animationOut.delay) / 1e3;
                            }
                            if (con.animations.animationIn.speed && !(0.1 > parseInt(con.animations.animationIn.speed) / 1e3 > 0)) {
                                con.animations.animationIn.speed = parseInt(con.animations.animationIn.speed) / 1e3;
                            }
                            if (con.animations.animationOn.speed && !(0.1 > parseInt(con.animations.animationOn.speed) / 1e3 > 0)) {
                                con.animations.animationOn.speed = parseInt(con.animations.animationOn.speed) / 1e3;
                            }
                            if (con.animations.animationOut.speed && !(0.1 > parseInt(con.animations.animationOut.speed) / 1e3 > 0)) {
                                con.animations.animationOut.speed = parseInt(con.animations.animationOut.speed) / 1e3;
                            }
                        }
                        // 透明度只在初始化所有页面时初始化一次
                        if (sign === 'all') {
                            con.opacity = parseInt(100 * (1 - con.opacity));
                        }
                        // 默认执行事件是无
                        if (!con.eventType) {
                            con.eventType = 'none';
                        }
                        // 默认执行操作是隐藏
                        if (!con.eventAction) {
                            con.eventAction = 'none';
                        }
                        // 默认执行操作是隐藏
                        if (!con.toPage) {
                            con.toPage = '0';
                        }
                        if (!con.checkBox) {
                            con.checkBox = [];
                        }
                        // 判断是否添加了计时器
                        if (con.timer) {
                            $scope.defaultTimer.class = con.timer.name;
                            $scope.defaultTimer.name = con.timer.con;
                            pageData.pan = 'no';
                        }

                        // 判断是否有超过一屏标识
                        if (!con.moreThanOneScreen) {
                            con.moreThanOneScreen = 'on';
                        }
                        // 元素类型
                        switch (con.type) {
                            // 图片
                            case 'pic':
                                con.key = index;
                                elementData.imgData.push(con);
                                // 如果不存在放大属性
                                if (typeof con.magnify === 'undefined') {
                                    // 默认是不放大
                                    con.magnify = 'no';
                                }
                                break;
                            // 视频
                            case 'video':
                                con.key = index;
                                elementData.videoData.push(con);
                                break;
                            // 网址
                            case 'site':
                                con.key = index;
                                elementData.siteData = con;
                                break;
                            // 普通文本
                            case 'text':
                                con.key = index;
                                con.ftsize = parseInt(con.ftsize);
                                var marginTop;
                                switch (con.textvalign) {
                                    case 'top':
                                        marginTop = 0;
                                        break;
                                    case 'middle':
                                        marginTop = con.h / 2 - con.tl / 2;
                                        break;
                                    case 'bottom':
                                        marginTop = con.h - con.tl;
                                }
                                con.marginTop = marginTop;
                                elementData.textData.push(con);
                                break;
                            // 富文本
                            case 'ptext':
                                con.key = index;
                                con.ftsize = parseInt(con.ftsize);
                                if(!con.fontFamily)  {
                                    con.fontFamily ='inherit';
                                }
                                con.marginTop = 0;
                                if (con.fontUrl) {
                                    delete con.fontUrl;
                                }
                                // 去除外部信息Id
                                if (con.fontId) {
                                    delete con.fontId;
                                }
                                // 去除模板信无用字段
                                if (con.fontTag) {
                                    delete con.fontTag;
                                }
                                elementData.textData.push(con);
                                break;
                            // 普通按钮
                            case 'btn':
                            case 'rand_button':
                                if(!con.fontFamily)  {
                                    con.fontFamily ='inherit';
                                }
                                con.key = index;
                                con.ftcolor = con.ftcolor || '#585858';
                                elementData.buttonData.push(con);
                                break;
                            // 特殊按钮
                            case 'pButton':
                                con.key = index;
                                elementData.pButtonData.push(con);
                                break;
                            // 形状
                            case 'pshape':
                                con.key = index;
                                if (/\//.test(con.shape)) {
                                    con.shape = con.shape.replace(/\//g, '_');
                                }
                                if (con.colorScheme && con.colorScheme.color1) {
                                    con.shapecolor = con.colorScheme.color1;
                                    delete con.colorScheme
                                } else if (con.color) {
                                    con.shapecolor = con.color;
                                    delete con.color
                                }
                                // 如果传入的svg标签内容而非url地址则进行过滤
                                if (/<!—\?xml|<svg/.test(con.shape) || /<!—\?xml|<svg/.test(con.svgDom)) {
                                    con.shape = 'svgDom';
                                }
                                elementData.shapeData.push(con);
                                break;
                            // 表单
                            case 'eleform':
                                con.key = index;
                                elementData.formData = con;
                                // 优惠券id
                                con.couponId = con.couponId || '';
                                break;
                            // 图表
                            case 'charts':
                                con.key = index;
                                elementData.chartData = con;
                                break;
                            // 轮播元素
                            case 'slide':
                                con.key = index;
                                con.slideNum = 0;
                                elementData.slideData.push(con);
                            // 图集
                            case 'slides':
                                con.key = index;
                                con.slideNum = 0;
                                elementData.slidesData.push(con);
                        }
                    });
                    pageData.elementData = elementData;
                };

                /**
                 * 模版数据处理
                 * @param type
                 * @param data
                 */
                $scope.templateDataProcessing = function (type, data) {
                    // 所有模版
                    if ('allTemplate' === type) {
                        _.each(data, function (ele) {
                            // 转化成百分比值
                            ele.opacity = parseInt(100 * (1 - ele.opacity));
                            // 透明度不存在或者不是数字的时候均置0
                            if (!ele.opacity || isNaN(ele.opacity)) {
                                ele.opacity = 0;
                            }
                            // 编辑模板状态时处理不符合要求的模板数据
                            if ($scope.designer === '1' && !Effect[ele.effect]) {
                                ele.effect = 'toup';
                            }

                            // 模版数据处理
                            $scope.templatePageProcessing(ele, 'all');
                        });
                    } else if ('template' === type) {
                        // 单个模版
                        $scope.templatePageProcessing(data, 'one');
                    }
                };

                /**
                 * 深度拷贝对象
                 * @param data 被拷贝对象
                 * @returns {*}
                 */
                $scope.clone = function (data) {
                    var t;
                    if (data instanceof Array) {
                        t = [];
                        return $.extend(true, t, data);
                    }
                    if ('function' === typeof data) {
                        return data;
                    }
                    if (data instanceof Object) {
                        t = {};
                        return $.extend(true, t, data);
                    }
                    return data;
                };

                /**
                 * 粘贴元素
                 */
                $scope.pasteElement = function () {
                    if ($scope.copyData) {
                        var t = $scope.clone($scope.copyData);
                        t.left += 20;
                        t.top += 20;
                        t.key = $scope.selectedTemplate.length;
                        $scope.selectedTemplate.content.push(t);
                        switch ($scope.copyData.type) {
                            case 'ptext':
                                $scope.textData.push(t);
                                break;
                            case 'pic':
                                $scope.imgData.push(t);
                                break;
                            case 'video':
                                $scope.videoData.push(t);
                                break;
                            case 'pshape':
                                $scope.shapeData.push(t);
                                break;
                            case 'btn':
                                $scope.buttonData.push(t);
                                break;
                            case 'pButton':
                                $scope.pButtonData.push(t);
                        }
                        $scope.templateDataProcessing('template', $scope.selectedTemplate);
                        // 选中元素索引
                        $scope.selectedElementNum = t.key;
                        $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                        // 如果是剪切
                        if ($scope.isShear) {
                            $scope.copyData = null;
                        }
                    }
                };

                /**
                 * 处理成可保存数据
                 * @param data 页面数据
                 * @param sign 单页模板标识
                 * @returns {*}
                 */
                $scope.dataProcessing = function (data, sign) {
                    delete data.elementData;
                    $scope.formdata = [];
                    $scope.vote.data = [];
                    // 字体数组
                    $scope.fontdata = [];
                    if (sign === 'one') {
                        data.opacity = (100 - data.opacity) / 100;
                        _.each(data.content, function (content) {
                            content.opacity = (100 - content.opacity) / 100;
                            content.animations.animationIn.speed *= 1e3;
                            content.animations.animationIn.delay *= 1e3;
                            content.animations.animationOn.speed *= 1e3;
                            content.animations.animationOn.delay *= 1e3;
                            content.animations.animationOut.speed *= 1e3;
                            content.animations.animationOut.delay *= 1e3;
                            if ('eleform' === content.type) {

                                // formid不符合规范的,重新生成formid
                                if ($scope.saving === true && (typeof content.formid === 'number' || (typeof content.formid === 'string' && content.formid.length > 8))) {
                                    content.formid = $scope.uuid(8);
                                }
                                var eleform = {};
                                eleform.formid = content.formid;
                                eleform.title = data.content[0].con;
                                eleform.fields = [];
                                _.each(content.qlist, function (e) {
                                    var form = {};
                                    form.id = e.id;
                                    form.name = e.name;
                                    eleform.fields.push(form);
                                });
                                $scope.formdata.push(eleform);
                            } else if (content.type === 'pButton' && content.model_type === 'interaction') {
                                // 互动按钮 统一在保存时添加唯一id；
                                if ($scope.saving === true) {
                                    if ($.inArray(content.button_id, $scope.vote.data) !== -1) {
                                        content.button_id = $scope.uuid(9);
                                    }
                                $scope.vote.data.push(content.button_id);                            }
                            }
                        });
                    } else {
                        _.each(data, function (page) {
                            // 保存时删除多余数据
                            if ($scope.saving === true) {
                                delete page.elementData;
                            }
                            page.opacity = (100 - page.opacity) / 100;
                            _.each(page.content, function (content) {
                                content.opacity = (100 - content.opacity) / 100;
                                content.animations.animationIn.speed *= 1e3;
                                content.animations.animationIn.delay *= 1e3;
                                content.animations.animationOn.speed *= 1e3;
                                content.animations.animationOn.delay *= 1e3;
                                content.animations.animationOut.speed *= 1e3;
                                content.animations.animationOut.delay *= 1e3;
                                if ('eleform' === content.type) {
                                    // 保存表单时 formid排重
                                    if ($scope.saving === true) {
                                        _.each($scope.formdata, function (e) {
                                            if (e.formid === content.formid) {
                                                content.formid = $scope.uuid(8);
                                            }
                                        });
                                        // formid不符合规范的,重新生成formid
                                        if (typeof content.formid === 'number' || (typeof content.formid === 'string' && content.formid.length > 8)) {
                                            content.formid = $scope.uuid(8);
                                        }
                                    }
                                    var eleform = {};
                                    eleform.formid = content.formid;
                                    eleform.title = page.content[0].con;
                                    eleform.fields = [];
                                    _.each(content.qlist, function (e) {
                                        var form = {};
                                        form.id = e.id;
                                        form.name = e.name;
                                        eleform.fields.push(form);
                                    });
                                    $scope.formdata.push(eleform);
                                    // 如果页面中含有互动按钮
                                } else if (content.type === 'pButton' && content.model_type === 'interaction') {
                                    // 互动按钮 统一在保存时添加唯一id；
                                    if ($scope.saving === true) {
                                        if ($.inArray(content.button_id, $scope.vote.data) !== -1) {
                                            content.button_id = $scope.uuid(9);
                                        }
                                        $scope.vote.data.push(content.button_id);
                                    }
                                } else if ((content.type === 'ptext' || content.type ==='rand_button') && content.fontFamily !== 'inherit' && $scope.saving) {
                                    if ($scope.fontdata[content.fontFamily]) {
                                        $scope.fontdata[content.fontFamily].str += content.con.replace(/<\/?[^>]*>/gim,"").replace(/\&nbsp;/g,'');
                                    } else {
                                        // 字体信息
                                        var fontInfo = {};
                                        fontInfo.str = content.con.replace(/<\/?[^>]*>/gim,"").replace(/\&nbsp;/g,'');
                                        fontInfo.font = content.fontFamily;
                                        fontInfo.cteateTime = parseInt($scope.createTime) * 1000;
                                        fontInfo.projectId = $scope.projectId;
                                        $scope.fontdata[content.fontFamily] = fontInfo;
                                    }
                                }
                            });
                        });
                    }
                    return data;
                };

                /**
                 * 选择元素多选框是否选中
                 * @param index
                 * @returns {boolean}
                 */
                $scope.isChecked = function (index) {
                    if ($.inArray(index, $scope.selectedElement.checkBox) > -1) {
                        return true;
                    }
                    return false;
                };

                /**
                 * 点击事件中显示元素或者隐藏元素选择元素
                 * @param index
                 */
                $scope.selectTargetElement = function (index) {
                    var pos = $.inArray(index, $scope.selectedElement.checkBox);
                    // 取消选择,去掉此选项
                    if (pos > -1) {
                        $scope.selectedElement.checkBox.splice(pos, 1);
                        return;
                    }
                    $scope.selectedElement.checkBox.push(index);
                    $scope.selectedElement.checkBox.sort(function(a,b) {
                        return a - b
                    });
                };

                /**
                 * 切换事件时清空之前的效果值
                 * @param index 传入索引
                 * @param  val 传入的动作值
                 */
                $scope.changeEvent = function (index, val) {
                    if (val === 'none') {
                        $scope.selectedElement.timer = '';
                        $scope.defaultTimer = {
                            name: '无',
                            class: 'none'
                        };
                    }

                    if (index === 1) {
                        $scope.selectedElement.eventType = index;
                        $scope.selectedElement.eventAction = 'none';
                        $scope.selectedElement.eventType = val;
                        // 恢复页面翻页
                        $scope.selectedTemplate.pan = 'yes';
                    }
                    // 默认计时器类型为(无)
                    if (index === 2) {
                        // 结束计时页面是空
                        $scope.selectedElement.timerEndPage = [];
                    }
                    $scope.selectedElement.checkBox = [];
                };

                /**
                 * 选中元素处理方法
                 * @param data 元素数据
                 * @param index 元素索引
                 */
                $scope.chooseEleHaddle = function (data, index) {
                    switch (data.type) {
                        case 'charts':
                            // 选中模版类型
                            $scope.selectedTemplate.type = 'chart';
                            data.key = index;
                            $scope.chartElement = data;
                            // 不是饼状图，处理掉错误数据
                            if ('pie' !== $scope.chartElement.content.type) {
                                var o = 0;
                                // 处理掉不存在的x轴数据
                                for (o = $scope.chartElement.content.options.xAxis.categories.length - 1; o >= 0; o--) {
                                    if (!$scope.chartElement.content.options.xAxis.categories[o]) {
                                        $scope.chartElement.content.options.xAxis.categories.splice(o, 1);
                                    }
                                }
                                for (o = 0; o < $scope.chartElement.content.data.length; o++) {
                                    var i = $scope.chartElement.content.data[o];
                                    if (!i) break;
                                    // 处理掉不存在的单个数据
                                    for (var l = i.data.length - 1; l >= 0; l--) {
                                        if (!i.data[l]) {
                                            i.data.splice(l, 1);
                                        }
                                    }
                                }
                            }
                            $scope.myChartData = $scope.chartElement.content.data;
                            // 如果样式不存在，就默认是第一种
                            if (!$scope.chartElement.content.multiple) {
                                $scope.chartElement.content.multiple = 1;
                            }
                            // 如果图表的颜色不在给定的颜色中
                            if ($scope.chartsColor.toString().indexOf($scope.chartElement.content.options.colors.toString()) < 0) {
                                // 把图表颜色存在自定义颜色中
                                $scope.myChartColor = $scope.chartElement.content.options.colors;
                            } else {
                                // 无自定义颜色
                                $scope.myChartColor = [];
                            }
                            if ($scope.chartElement.content.type !== 'pie') {
                                if (!$scope.chartElement.w) {
                                    $scope.chartElement.w = 640;
                                    $scope.chartElement.h = 450;
                                }
                                $scope.chartX = $scope.chartElement.content.options.xAxis.categories;
                                $scope.chartConfig = {
                                    options: {
                                        chart: {
                                            type: $scope.chartElement.content.type,
                                            backgroundColor: ''
                                        },
                                        tooltip: {
                                            enabled: false
                                        },
                                        colors: $scope.chartElement.content.options.colors,
                                        plotOptions: {
                                            line: {
                                                dataLabels: {
                                                    enabled: true
                                                }
                                            },
                                            column: {
                                                borderWidth: 0,
                                                stacking: 3 === $scope.chartElement.content.multiple ? 'normal' : ''
                                            },
                                            bar: {
                                                borderWidth: 0,
                                                stacking: 3 === $scope.chartElement.content.multiple ? 'normal' : ''
                                            },
                                            area: {
                                                stacking: 'normal'
                                            }
                                        },
                                        legend: {
                                            symbolWidth: 20,
                                            symbolHeight: 20,
                                            itemStyle: {
                                                color: $scope.chartElement.content.options.lineColor || '#b3b3b3',
                                                fontSize: '18px'
                                            }
                                        }
                                    },
                                    // 标题
                                    title: {
                                        text: null
                                    },
                                    // x轴显示
                                    xAxis: {
                                        categories: $scope.chartElement.content.options.xAxis.categories,
                                        lineColor: $scope.chartElement.content.options.lineColor || '#b3b3b3',
                                        labels: {
                                            style: {
                                                lineHeight: '30px',
                                                fontSize: '18px',
                                                color: $scope.chartElement.content.options.lineColor || '#b3b3b3'
                                            }
                                        }
                                    },
                                    // y轴显示
                                    yAxis: {
                                        max: $scope.chartElement.content.options.yAxis.max,
                                        min: $scope.chartElement.content.options.yAxis.min,
                                        title: {
                                            text: $scope.chartElement.content.options.yAxis.title.text,
                                            fontSize: '18px',
                                            style: {
                                                color: $scope.chartElement.content.options.lineColor || '#b3b3b3'
                                            }
                                        },
                                        labels: {
                                            style: {
                                                lineHeight: '30px',
                                                fontSize: '18px',
                                                color: $scope.chartElement.content.options.lineColor || '#b3b3b3'
                                            }
                                        },
                                        gridLineColor: $scope.chartElement.content.options.lineColor || '#b3b3b3'
                                    },
                                    size: {
                                        width: $scope.chartElement.w - 8,
                                        height: $scope.chartElement.h
                                    },
                                    // 列
                                    series: 1 === $scope.chartElement.content.multiple ? [$scope.chartElement.content.data[0]] : $scope.chartElement.content.data,
                                    // 图表版权信息
                                    credits: {
                                        // 不显示
                                        enabled: false
                                    }
                                };
                            } else {
                                if (!$scope.chartElement.w) {
                                    $scope.chartElement.w = 640;
                                    $scope.chartElement.h = 640;
                                }
                                $scope.chartX = '';
                                $scope.chartConfig = {
                                    options: {
                                        chart: {
                                            type: 'pie',
                                            backgroundColor: ''
                                        },
                                        tooltip: {
                                            enabled: false
                                        },
                                        colors: $scope.chartElement.content.options.colors,
                                        plotOptions: {
                                            pie: {
                                                allowPointSelect: true,
                                                dataLabels: {
                                                    enabled: true,
                                                    color: '#ffffff',
                                                    format: '{point.percentage:.1f} %',
                                                    distance: -$scope.chartElement.width / 6,
                                                    style: {
                                                        fontSize: '20px'
                                                    }
                                                },
                                                showInLegend: true
                                            }
                                        },
                                        legend: {
                                            symbolWidth: 20,
                                            symbolHeight: 20,
                                            itemStyle: {
                                                color: $scope.chartElement.content.options.lineColor || '#b3b3b3',
                                                fontSize: '18px'
                                            }
                                        }
                                    },
                                    title: {
                                        text: null
                                    },
                                    size: {
                                        width: $scope.chartElement.w - 8,
                                        height: $scope.chartElement.h - 50
                                    },
                                    series: [{
                                        type: 'pie',
                                        data: $scope.chartElement.content.data[0].data
                                    }],
                                    credits: {
                                        enabled: false
                                    }
                                };
                            }
                            break;
                        case 'eleform':
                            if (index && index === 'copyForm') {
                                data.formid = $scope.uuid(8);
                                data.key = index;
                            }
                            $scope.formList = data;
                            $scope.formList.btn_name = $scope.formList.btn_name || '提交';
                            break;
                        case 'site':
                            $scope.siteData = data;
                            break;
                        case 'pic':
                            data.key = index;
                            $scope.imgData.push(data);
                            break;
                        case 'video':
                            data.key = index;
                            $scope.videoData.push(data);
                            break;
                        case 'ptext':
                        case 'text':
                            data.editable = false;
                            data.key = index;
                            if (!data.fontFamily) {
                                data.fontFamily = 'inherit';
                            }
                            $scope.textData.push(data);
                            break;
                        case 'btn':
                        case 'rand_button':
                            data.key = index;
                            $scope.buttonData.push(data);
                            break;
                        case 'pButton':
                            data.key = index;
                            $scope.pButtonData.push(data);
                            break;
                        case 'pshape':
                            data.key = index;
                            $scope.shapeData.push(data);
                            break;
                        case 'slide':
                            data.key = index;
                            _.each(data.data, function (e) {
                                if (!e.titleText.con) {
                                    e.titleText = '';
                                }
                                if (!e.contentText.con) {
                                    e.contentText = '';
                                }
                            });
                            data.slideNum = 0;
                            $scope.slideData.push(data);
                            break;
                        case 'slides':
                            data.key = index;
                            data.slideNum = 0;
                            $scope.slidesData.push(data);
                            break;
                    }
                };

                /**
                 * 选中模版的处理方法
                 * @param num 选中模版的索引
                 */
                $scope.chooseTemplate = function (num) {
                    $scope.selectedTemplateNum = num;
                    $scope.changeTemplate = num !== $scope.templateNum;
                    $scope.imgData = [];
                    $scope.videoData = [];
                    $scope.textData = [];
                    $scope.buttonData = [];
                    $scope.shapeData = [];
                    //多个轮播图
                    $scope.slidesData = [];
                    $scope.slideData = [];
                    $scope.pButtonData = [];
                    $scope.siteData = '';
                    $scope.chartConfig = null;
                    $scope.selectedTemplate = $scope.templateData[num];
                    // 如果没指定，默认翻页效果是推上
                    if (!$scope.selectedTemplate.effect) {
                        $scope.selectedTemplate.effect = 'toup';
                    }
                    $scope.selectedTemplate.showeffect = Effect[$scope.selectedTemplate.effect][1];
                    // 默认选中背景
                    $scope.selectedElement = {
                        type: 'bg'
                    };
                    $scope.selectedElementNum = null;
                    $scope.selectedTemplate.justShoweffect = 'null';
                    $scope.templateNum = num;
                    if (!$scope.selectedTemplate.bgpicheight) {
                        $scope.selectedTemplate.bgpicheight = 'auto';
                    }
                    if (!$scope.selectedTemplate.bgpicwidth || $scope.selectedTemplate.bgpicwidth === 'auto') {
                        $scope.selectedTemplate.bgpicwidth = 640;
                    }
                    if (!$scope.selectedTemplate.bgpicleft) {
                        $scope.selectedTemplate.bgpicleft = 0;
                    }
                    if (!$scope.selectedTemplate.bgpictop) {
                        $scope.selectedTemplate.bgpictop = 0;
                    }
                    $scope.locked = $scope.selectedTemplate.lock;
                    // 不刷新
                    if ($scope.noRefresh || $scope.preAddingTemplate) {
                        $scope.selectedTemplate.justShoweffect = $scope.selectedTemplate.showeffect;
                        _.each($scope.selectedTemplate.content, function (data, index) {
                            $scope.chooseEleHaddle(data, index);
                        });
                    } else {
                        $timeout(function () {
                            $scope.selectedTemplate.justShoweffect = $scope.selectedTemplate.showeffect;
                            _.each($scope.selectedTemplate.content, function (data, index) {
                                var l = $timeout(function () {
                                    if ($scope.selectedTemplateNum === num) {
                                        $scope.chooseEleHaddle(data, index);
                                        $timeout.cancel(l);
                                    }
                                }, 1e3 * data.delay);
                            });
                        }, 10);
                    }
                    if ('chart' !== $scope.selectedTemplate.type) {
                        $scope.showChartEditView = false;
                    }
                    $scope.noRefresh = false;
                };

                /**
                 * 选中图表事件
                 *
                 */
                $scope.onChartTap = function () {
                    $scope.showChartEditView && $scope.closeCharEditView();
                    $scope.selectedElement = $scope.chartElement;
                    $scope.showChartColorView = false;
                };

                /**
                 * 返回首页
                 */
                $scope.toIndex = function () {
                    window.location.href = Config.baseUrl + '?c=admin&a=index';
                };

                /**
                 * 获取我上传的图片
                 */
                $scope.getMyUploadPic = function () {
                    editorRequest.getMyUploadImg({
                        user: user
                    }, function (t) {
                        if (t.errcode !== 1) {
                            return;
                        }
                        var arr = t.data ? t.data : [];
                        _.each(arr, function (img) {
                            img.id = img.url;
                        });
                        $scope.myUploadingImg = arr;
                    });
                };
                /**
                 * 获取我上传的音乐
                 */
                $scope.getMyUploadMusic = function () {
                    editorRequest.getMyUploadMusic({
                        user: user,
                        type:'music'
                    }, function (t) {
                        if (t.errcode !== 1) {
                            return;
                        }
                        var arr = t.data ? t.data : [];
                        _.each(arr, function (music) {
                            music.id = music.url;
                        });
                        $scope.myUploadingMusic = arr;
                    });
                };

                /**
                 * 初始化数据
                 */
                $scope.init = function () {
                    // 获取项目id
                    $scope.projectId = $scope.getUrlParameter('id');
                    projPreviewUrl = Config.baseUrl + '?c=admin&a=PCpreview&f=edit&id=' + $scope.projectId;
                    var getDataUrl = '';
                    $scope.designer = $scope.getUrlParameter('designer');
                    // 编辑系统模版
                    if ($scope.designer === '1') {
                        getDataUrl = Config.baseUrl + '?c=api&a=ajaxMultiTemplateById&id=' + $scope.projectId;
                    } else {
                        getDataUrl = Config.baseUrl + '?c=api&a=ajaxProject&id=' + $scope.projectId + '&type=edit';
                    }
                    (function (audio){
                        audio.addEventListener('canplaythrough', function() {
                            audio.music && audio.music.removeClass('fa-play').addClass('fa-pause');
                            audio.play();
                        });
                    })($scope.audio);
                    // 获取项目数据
                    $fangService.getProjectData({
                        // 参数 url
                        url: getDataUrl
                    }).then(function (result) {
                        // 存在即是错误项目
                        if (result.errcode === 0) {
                            return;
                        }
                        // 如果没有数据
                        if (result.data.length === 0 || !result.data.pdata.json) {
                            // 项目创建时间处理
                            $scope.createTime = result.data.createtime ? result.data.createtime : null;
                            // 添加空模版
                            $scope.addEmptyTemplate();
                            $scope.loading = false;
                            return;
                        }
                        // 初始化时留1.5s加载时间,渲染数据
                        var n = $timeout(function () {
                            $scope.loading = false;
                            $timeout.cancel(n);
                        }, 1500);
                        // 存储所有数据
                        $scope.allData = result;
                        // 存储模版数据
                        $scope.templateData = $scope.getTemplateJson(result);
                        // 背景音乐处理
                        $scope.projectMusic = $scope.allData.data.pdata.music ? $scope.allData.data.pdata.music : null;

                        // 项目创建时间处理
                        $scope.createTime = $scope.allData.data.createtime ? $scope.allData.data.createtime : null;
                        // 项目开场动画
                        if ($scope.allData.data.loading) {
                            $scope.loadingGif = $scope.allData.data.loading;
                        }
                        // 项目预加载动画
                        $scope.loadingGifData = $scope.loadingGif ? $scope.loadingGif : '';
                        // 处理模版数据
                        $scope.templateDataProcessing('allTemplate', $scope.templateData);
                        // 获取压缩字体信息
                        if($scope.allData.data.fontinfo) {
                            var fontInfo = angular.fromJson($scope.allData.data.fontinfo);
                            _.each(fontInfo, function(ele) {
                                $scope.fontLoad(ele.font, Config.minFontUrl + ele.fontmin);
                            });
                        }
                        // 默认选中模版的第一页
                        $scope.chooseTemplate(0);

                        $scope.$broadcast('templateChange');


                        // 保存此时模版数据成字符串形式
                        $scope.savingTemplateData = JSON.stringify($scope.dataProcessing($scope.clone($scope.templateData)));
                        // 保存音乐数据
                        $scope.savingMusicData = $scope.projectMusic ? {
                            name: $scope.projectMusic.name,
                            id: $scope.projectMusic.id
                        } : null;
                        $scope.music = {
                            id: ''
                        };
                    }, function (e) {
                        console.log(e);
                    });
                    // 获取图片种类
                    editorRequest.getPicCatalog(function (t) {
                        if (t.errcode !== 1) {
                            return;
                        }
                        $scope.picCatalogs = t.data;
                    });

                    // 获取模板种类
                    var a = ['0', '1', '2', '3', '4', '5', '6'];
                    _.each(a, function (t) {
                        // 获取每个模板的数据
                        editorRequest.getModelData({
                            type: t,
                            c: (parseInt(t) === 6) ? 'admin' : 'api',
                            a: (parseInt(t) === 6) ? 'ajaxGetMyTemplate' : 'ajaxTemplate'
                        }, function (n) {
                            if (n && n.data) {
                                switch (t) {
                                    // 全部
                                    case '0':
                                        $scope.allModelData = n.data.datalist;
                                        break;
                                    // 封面
                                    case '1':
                                        $scope.modelOneData = n.data.datalist;
                                        break;
                                    // 图文
                                    case '2':
                                        $scope.modelTwoData = n.data.datalist;
                                        break;
                                    // 滑块
                                    case '3':
                                        $scope.modelThreeData = n.data.datalist;
                                        break;
                                    // 表单
                                    case '4':
                                        $scope.modelFourData = n.data.datalist;
                                        break;
                                    // 统计模板
                                    case '5':
                                        $scope.allChartModel = n.data.datalist;
                                        break;
                                    // 我的模板
                                    case '6':
                                        $scope.userModelData = n.data.datalist;
                                        break;
                                }
                            }
                        });
                    });

                    // 获取我上传的图片
                    $scope.getMyUploadPic();
                    $scope.changeMusicPage();
                    // 获取我上传的音乐文件
                    $scope.getMyUploadMusic();
                    // 阻止默认事件 避免拖拽元素时变现混乱现象
                    document.onmousemove = function (e) {
                        var n = e || event;
                        // 解决右侧输入框无法选择问题
                        var target = $(e.target);
                        if (target.closest('#editModel').length > 0 && !target.attr('contenteditable')) {
                            n.returnValue = false;
                        }
                    };
                    document.ontouchmove = function (t) {
                        var n = t || event;
                        if (!$(e.target).attr('contenteditable')) {
                            n.returnValue = false;
                        }
                    };
                    // 图片和音乐文件上传
                    var uploaderObj = new upload({
                        url: Config.mediaUpload,
                        urlnode: Config.psdUploadUrl,
                        projectId: $scope.projectId,
                        onSuccess: function (file, result) {

                            var data = result;
                            if ("audio/mp3" == file.type) {
                                data = JSON.parse(result);
                                $scope.musicUploading = false;
                                if (data.errcode === 2) {
                                    $scope.relogin(data.url, data.errmsg);
                                    return;
                                }
                                if (data.errcode !== 1) {
                                    var msgCon = '文件上传失败(；′⌒`)';
                                    if (data.errmsg) {
                                        msgCon = data.errmsg;
                                    }
                                    $scope.msgConfirm(msgCon);
                                    return;
                                }
                            } else {
                                $scope.imgUploading = false;
                                if (data.code != '100') {
                                    var msgCon = '图片上传失败(；′⌒`)';
                                    if (data.errmsg) {
                                        msgCon = data.errmsg;
                                    }
                                    $scope.msgConfirm(msgCon);
                                    return;
                                }
                                // 将图片存入数据库
                                $.ajax({
                                    url: Config.mediaUpload,
                                    method: 'GET',
                                    async: false,
                                    data: {
                                        flag: 1,
                                        fileName: file.name,
                                        type: file.type,
                                        url: Config.psdPicUrl + data.imgUrl
                                    }
                                });
                            }
                            var i = {
                                id: data.url || Config.psdPicUrl + data.imgUrl,
                                name: file.name
                            };
                            // 音乐文件添加入音乐文件，图片文件添加到图片上传数组
                            if (data.musicid) {
                                i.musicid = data.musicid;
                            } else {
                                i.picid = $scope.uuid(32);
                            }
                            $scope.$apply(function () {
                                if (data.musicid) {
                                    $scope.myUploadingMusic.unshift(i);
                                } else {
                                    $scope.myUploadingImg.unshift(i);
                                }
                            });
                        },
                        onProgress: function (n) {
                            $scope.imgUploading = true;
                            $scope.imgUploadProgress = n;
                        },
                        // uploadFileType 文件类型，默认为图片
                        filter: function (files, uplodeFileType) {
                            var arrFiles = [];
                            for (var i = 0, file; file = files[i]; i++) {
                                // 文件格式为图片
                                if (file.type.indexOf('image') === 0 && uplodeFileType === 'pic') {
                                    if (file.size >= 1024000) {
                                        $scope.msgConfirm('文件太大啦亲，图片文件不能大于1M哦');
                                    } else {
                                        arrFiles.push(file);
                                    }
                                    // 文件格式为mp3
                                }else if (file.type.indexOf('audio/mp3') === 0 && uplodeFileType === 'audio/mp3') {
                                    if (file.size >= 5120000) {
                                        $scope.msgConfirm('文件太大啦亲，音乐文件不能大于5M哦');
                                        return false;
                                    } else {
                                        arrFiles.push(file);
                                    }
                                } else {
                                    $scope.msgConfirm(file.name + '文件类型为' + file.type + '文件格式错误');
                                }
                            }

                            return arrFiles;
                        },
                        onFailure: function () {
                            $scope.imgUploading = false;
                            $scope.msgConfirm('文件上传失败(；′⌒`)');
                        }
                    });
                    // 网格行数和列数
                    $scope.colsNum = $scope.colsNum();
                    $scope.rowsNum = $scope.rowsNum();

                };

                /**
                 * 监听图表数据变化
                 */
                $scope.$watch('myChartData.length', function (newVal, oldVal) {
                    if (newVal) {
                        if ($scope.changeTemplate) {
                            $scope.changeTemplate = false;
                            return;
                        }
                        if ($scope.isChooseModel) {
                            $scope.isChooseModel = false;
                            return;
                        }
                        if ('pie' !== $scope.chartElement.content.type) {
                            if (oldVal && newVal > oldVal) {
                                var a = newVal - 1;
                                var o = 0;
                                $scope.myChartData[a].id = 'series-' + Math.floor(1e6 * Math.random());
                                if ($scope.myChartData[a].name) {
                                    $scope.myChartData[a].data = [];
                                    for (o = 0; o < $scope.myChartData[0].data.newVal; o++) {
                                        $scope.myChartData[a].data.push(null);
                                    }
                                } else {
                                    for (var i, l, o = 0; 6 > o; o++) {
                                        if ($scope.myChartData[a].data[o]) {
                                            i = $scope.myChartData[a].data[o];
                                            l = o;
                                            break;
                                        }
                                    }
                                    $scope.myChartData[a].data = [];
                                    for (o = 0; l > o; o++) {
                                        $scope.myChartData[a].data.push(null);
                                    }
                                    $scope.myChartData[a].data.push(i);
                                }
                            }
                        } else if ('pie' === $scope.chartElement.content.type) {
                            if (newVal == 1) {
                                $scope.chartElement.content.multiple = 1;
                            } else if (newVal > 1) {
                                $scope.chartElement.content.multiple = 2;
                                if (oldVal && newVal > oldVal) {
                                    var a = newVal - 1;
                                    $scope.myChartData[a].data = [[], [], [], [], [], []];
                                    $scope.myChartData[a].data[0][0] = $scope.myChartData[0].data[0] ? $scope.myChartData[0].data[0][0] : '';
                                    $scope.myChartData[a].data[1][0] = $scope.myChartData[0].data[1] ? $scope.myChartData[0].data[1][0] : '';
                                    $scope.myChartData[a].data[2][0] = $scope.myChartData[0].data[2] ? $scope.myChartData[0].data[2][0] : '';
                                    $scope.myChartData[a].data[3][0] = $scope.myChartData[0].data[3] ? $scope.myChartData[0].data[3][0] : '';
                                    $scope.myChartData[a].data[4][0] = $scope.myChartData[0].data[4] ? $scope.myChartData[0].data[4][0] : '';
                                    $scope.myChartData[a].data[5][0] = $scope.myChartData[0].data[5] ? $scope.myChartData[0].data[5][0] : '';
                                }
                            }
                        }
                    }
                });

                /**
                 * 监听模板改变事件
                 */
                $scope.$on('templateChange', function () {
                    var n = {
                        templateData: $scope.clone($scope.templateData),
                        templateNum: $scope.clone($scope.templateNum),
                        music: $scope.clone($scope.projectMusic),
                        movementType: 'template'
                    };
                    // 撤销
                    $scope.movementList.push(n);
                    if ($scope.movementList.length > 100) {
                        $scope.movementList.shift();
                    }
                });

                /**
                 * 监听我的单页模板改变时间
                 */
                $scope.$on('userModelChange',function () {
                        $scope.userModelData =  $scope.clone($scope.userModelData);
                });

                $scope.$on('textEditCode', function (t, n) {
                    $scope.editingText = n;
                });
                /**
                 * 与上页切换
                 * @param t 当前页面索引
                 */
                $scope.templateUp = function (t) {
                    if (0 !== t) {
                        $scope.$broadcast('templateChange');
                        var n = $scope.templateData.splice(t - 1, 2).reverse();
                        $scope.templateData.splice(t - 1, 0, n[0], n[1]);
                    }
                };

                /**
                 * 与下页切换
                 * @param t 当前页面索引
                 */
                $scope.templateDown = function (t) {
                    if (t !== $scope.templateData.length - 1) {
                        $scope.$broadcast('templateChange');
                        var n = $scope.templateData.splice(t, 2).reverse();
                        $scope.templateData.splice(t, 0, n[0], n[1]);
                    }
                };

                /**
                 * 增加模版处理方法
                 * @param template
                 */
                $scope.addTemplateProcessing = function (template) {
                    // 透明度转换成对应百分比
                    template.opacity = parseInt(100 * (1 - template.opacity));
                    _.each(template.content, function (ele) {
                        ele.opacity = parseInt(100 * (1 - ele.opacity));
                    });
                    return template;
                };

                /**
                 * 更换背景
                 */
                $scope.changeBg = function () {
                    $scope.changingBg = true;
                    $scope.openPicView();
                };

                /**
                 * 增加空白模版
                 */
                $scope.addEmptyTemplate = function () {
                    if ($scope.isMoreThan()) {
                        return;
                    }
                    var newBlank = {
                        bgpictop: '0',
                        bgpicleft: '0',
                        bgpicheight: 'auto',
                        bgpicwidth: '640',
                        content: [],
                        lock: false,
                        bgpic: '',
                        bgcolor: '#ffffff',
                        opacity: 1,
                        effect: 'pushup',
                        pan: 'yes'
                    };
                    // 如果没有页面数据，直接添加空白模版
                    if (0 === $scope.templateData.length) {
                        $scope.templateData.push(newBlank);
                        $scope.chooseTemplate(0);
                        return;
                    }
                    // 如果正在预览模块
                    if ($scope.preAddingTemplate) {
                        // 直接替换预览模块
                        $scope.templateData[$scope.selectedTemplateNum] = $scope.addTemplateProcessing(newBlank);
                        $scope.chooseTemplate($scope.selectedTemplateNum);
                    } else {
                        $scope.$broadcast('templateChange');
                        var a = $scope.selectedTemplateNum;
                        // 否则就在当前选中页面后面增加模版
                        $scope.templateData.splice(a + 1, 0, $scope.addTemplateProcessing(newBlank));
                        $scope.chooseTemplate(a + 1);
                    }
                    $scope.showModelView = false;
                    $scope.preAddingTemplate = false;
                    $scope.templateDataProcessing('template', $scope.templateData[$scope.selectedTemplateNum]);
                };

                /**
                 *  删除页面
                 * @param t 当前页面索引
                 */
                $scope.deleteTemplate = function (t) {
                    var n = $modal.open({
                        template: '<div class="modal-body" >是否删除当前页面？</div><div class="modal-footer">'
                        + '<button class="btn btn-danger" ng-click="delete()">确定</button><button class="btn btn-success" '
                        + 'ng-click="cancel()">取消</button></div>',
                        controller: 'ModalInstanceCtrl'
                    });
                    n.result.then(function (n) {
                        if (n) {
                            $scope.$broadcast('templateChange');
                            $scope.templateData.splice(t, 1);
                            if (0 === $scope.templateData.length) {
                                $scope.addEmptyTemplate();
                                return;
                            }
                            if (t === 0) {
                                $scope.chooseTemplate(t);
                            } else {
                                $scope.chooseTemplate(t - 1);
                            }
                        }
                    });
                };

                $scope.upload = function (uploadBase64) {
                    var xhr = new XMLHttpRequest();
                    if (xhr.upload) {
                        // 文件上传成功或是失败
                        xhr.onreadystatechange = function () {
                            if (Number(xhr.readyState) === 4) {
                                if (Number(xhr.status) === 200) {
                                    var result = JSON.parse(xhr.responseText);
                                    $scope.addMyTemplate(result.url);
                                } else {
                                    $scope.msgConfirm(xhr.responseText);
                                }
                            }
                        };
                        // 开始上传
                        xhr.open(
                            // method
                            'POST',
                            // target url
                            Config.mediaUpload
                        );
                        var formData = new FormData();
                        formData.append('pic', uploadBase64);
                        xhr.send(formData);
                    }
                };
                /**
                 * 显示模板标题封面
                 */
                $scope.openMyTplView = function () {
                    $scope.msgTip('正在保存模板,请稍后');
                    html2canvas(document.getElementById('temp'), {
                        proxy: 'html2c.php',
                        useOverflow: false,
                        onrendered: function (canvas) {
                            var uploadBase64;
                            var img = new Image();
                            img.src = canvas.toDataURL('image/png',0.25);
                            img.onload=function(){
                                if (ImageCompresser.support()) {
                                    try {
                                        uploadBase64 = ImageCompresser.getImageBase64(img, $scope.conf);
                                    } catch (err) {
                                        return false;
                                    }
                                    if (uploadBase64.indexOf('data:image') < 0) {
                                        alert('上传照片格式不支持');
                                        return false;
                                    }
                                    $scope.upload(uploadBase64);
                                }
                            }
                        }
                    });
                };

                /**
                 * 添加到我们的模板
                 */
                $scope.addMyTemplate = function (url) {
                    var tplData = $scope.clone($scope.selectedTemplate);
                    var templateData = $scope.dataProcessing(tplData, 'one');
                    if ('object' === typeof templateData) {
                        tplData = JSON.stringify(templateData);
                        var dataObj = {};
                        // 单页模板封面地址
                        dataObj.cover = url;
                        dataObj.content = tplData;
                        $scope.ajaxSaveTemplate(dataObj);
                    }
                };

                /**
                 * 删除我的模板
                 * @param t 模板索引
                 */
                $scope.deleteMyTemplate = function (t) {
                    var selecteUserModel = $scope.clone($scope.userModelData[t]);
                    var ajaxUrl = Config.baseUrl + '?c=admin&a=ajaxDelMyTemplate';
                    if (selecteUserModel.createtime) {
                        $.ajax({
                            url: ajaxUrl,
                            type: 'post',
                            data: {createtime: selecteUserModel.createtime},
                            beforeSend: function () {
                                $scope.msgTip('正在删除模板,请稍后');
                            },
                            success: function (n) {
                                // 如果未登陆
                                if (n.errcode === 2) {
                                    $scope.relogin(n.url, n.errmsg);
                                    return;
                                }
                                if (n.errcode !== 1) {
                                    angular.element(document.querySelector('.modal-body')).html(n.errmsg);
                                    $timeout(function () {
                                        $scope.modal.close();
                                    },1500);
                                    return;
                                }
                                $scope.userModelData.splice(t, 1);
                                angular.element(document.querySelector('.modal-body')).html('模板删除成功');
                                $timeout(function () {
                                    $scope.modal.close();
                                },1500);
                            },
                            error: function () {
                                angular.element(document.querySelector('.modal-body')).html('模板删除失败');
                                $timeout(function () {
                                    $scope.modal.close();
                                },1500);
                            }
                        });
                    }
                };

                /**
                 * 防止浏览器拦截弹出窗口
                 * @param url
                 */
                $scope.openUrl = function (url) {
                    var a = document.getElementById('openUrl');
                    if (a) {
                        a.click();
                        return;
                    }
                    a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.setAttribute('target', '_blank');
                    a.setAttribute('id', 'openUrl');
                    document.body.appendChild(a);
                    a.click();
                };

                /**
                 * 重新登陆
                 */
                $scope.relogin = function (url, msg) {
                    // 避免重复弹框
                    if ($rootScope.openReloginMsg) {
                        return;
                    }
                    // 是否打开重新登陆提示弹框
                    $rootScope.openReloginMsg = true;
                    $modal.open({
                        template: '<div class="modal-body" >' + msg + '</div>'
                        + '<div class="modal-footer"><button class="btn btn-primary" ng-click="sure()">确定</button>',
                        controller: 'ModalInstanceCtrl',
                        backdrop: 'static',
                        keyboard: false
                    });
                    // 2秒后打开页面新链接
                    var a = $timeout(function () {
                        $scope.openUrl(url);
                        $timeout.cancel(a);
                    }, 2000);
                };

                /**
                 * 自由／固定模式切换
                 */
                $scope.changeLocked = function () {
                    $scope.locked = !$scope.locked;
                    $scope.selectedTemplate.lock = $scope.locked;
                };

                /**
                 * 网络音乐翻页
                 */
                $scope.changeMusicPage = function () {
                    $scope.audio.pause();
                    // 已查询过就不再查询
                    if (!$scope.webMusicObj['index' + $scope.pageConfig.pageIndex]) {
                        // 分页获取音乐列表
                        editorRequest.getWebMusicData({
                            pageIndex: $scope.pageConfig.pageIndex,
                            pageSize: $scope.pageConfig.pageSize
                        }, function (result) {
                            if (result && result.errcode === 1 && result.data) {
                                $scope.webMusic = result.data;
                                $scope.webMusicObj['index' + result.pageIndex] = $scope.webMusic;
                                if (!$scope.wMTotalPage.length) {
                                    for (var i = 0; i < parseInt(result.pageCount); i++) {
                                        $scope.wMTotalPage.push({
                                            id: i + 1,
                                            name: '第' + (i + 1) + '页'
                                        });
                                    }
                                }
                            }
                        });
                    } else {
                        $scope.webMusic = $scope.webMusicObj['index' + $scope.pageConfig.pageIndex];
                    }
                };

                /**
                 * 元素选中事件
                 * @param t 索引
                 */
                $scope.onTap = function (t) {
                    // 选中元素的索引
                    $scope.selectedElementNum = t;
                    // 选中元素
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                    // 右侧字体选项展示
                    var curFont = $scope.selectedElement.fontFamily;
                    // 未加载字体则加载字体
                    if (!$scope.fontLoaded) {
                        $scope.loadFonts();
                    }
                    if (curFont !=='inherit') {
                        _.each($scope.fontConfig, function(el) {
                            if (el.fontFamily === curFont) {
                                $scope.defaultFont.name = el.name;
                                $scope.defaultFont.fontFamily = curFont;
                            }
                        });
                    } else {
                        $scope.defaultFont.name = "默认字体";
                        $scope.defaultFont.fontFamily = "inherit";
                    }
                };

                /**
                 * 选中模版效果
                 */
                $scope.chooseTemplateEffect = function () {
                    $scope.selectedTemplate.justShoweffect = Effect[$scope.selectedTemplate.effect][1];
                };

                /**
                 * 选中背景主题颜色
                 * @param color 颜色值
                 */
                $scope.chooseBgColor = function (color) {
                    if ('bg' === $scope.selectedElement.type) {
                        $scope.selectedTemplate.bgcolor = color;
                        if (!color) {
                            $scope.selectedTemplate.opacity = 0;
                        }
                    } else if ('pshape' === $scope.selectedElement.type) {
                        $scope.selectedElement.shapecolor = color;
                    } else {
                        $scope.selectedElement.bgcolor = color;
                    }
                    $scope.showBgColorView = false;
                };

                /**
                 * 选择表单颜色
                 * @param color
                 */
                $scope.chooseFormColor = function (color) {
                    $scope.$broadcast('templateChange');
                    $scope.formList.formcolor = color;
                    $scope.formColorView = false;
                };

                /**
                 * 打开调色板
                 * @param type 编辑类型
                 * @param n
                 */
                $scope.openColorBoard = function (type, n) {
                    switch (type) {
                        case 'background':
                            $scope.colorPanelDefault = $scope.selectedTemplate.bgcolor;
                            break;
                        case 'bg':
                            if ('pshape' === $scope.selectedElement.type) {
                                $scope.colorPanelDefault = $scope.selectedElement.shapecolor;
                            } else {
                                $scope.colorPanelDefault = $scope.selectedElement.bgcolor;
                            }
                            break;
                        case 'fontcolor':
                            $scope.colorPanelDefault = $scope.selectedElement.ftcolor;
                            break;
                        case 'border':
                            $scope.colorPanelDefault = $scope.selectedElement['border-color'];
                            break;
                        case 'eleform':
                            $scope.colorPanelDefault = $scope.formList.formcolor;
                            break;
                        case 'slide':
                            if ('slideTitle' === n) {
                                $scope.colorPanelDefault = $scope.selectedElement.data[$scope.selectedElement.slideNum].titleText.fontcolor;
                            } else {
                                $scope.colorPanelDefault = $scope.selectedElement.data[$scope.selectedElement.slideNum].contentText.fontcolor;
                            }
                            break;
                        default:
                            $scope.colorPanelDefault = '#ffffff';
                    }
                    $scope.showColorBoard = true;
                    $scope.editingText = true;
                    $scope.editingType = type;
                    $scope.editingAttributes = n;
                };

                /**
                 * 删除图表颜色
                 * @param index
                 */
                $scope.deleteMyChartColor = function (index) {
                    $scope.myChartColor.splice(index, 1);
                    if ($scope.myChartColor.length === 0) {
                        $scope.chartElement.content.options.colors = $scope.chartsColor[0];
                        $scope.chartConfig.options.colors = $scope.chartsColor[0];
                    } else {
                        $scope.chartElement.content.options.colors = $scope.myChartColor;
                        $scope.chartConfig.options.colors = $scope.myChartColor;
                    }
                };

                /**
                 * 选择调色板颜色
                 * @param color 颜色值
                 */
                $scope.chooseBoardColor = function (color) {
                    $scope.$broadcast('changeColor', color);
                    $scope.$broadcast('changeColor2', color);
                };

                /**
                 * 关闭调色板
                 */
                $scope.closeColorBoard = function () {
                    $scope.showColorBoard = false;
                    $scope.editingText = false;
                };

                /**
                 * 增加我的图表颜色
                 * @param color
                 */
                $scope.addMyChartColor = function (color) {
                    if ($scope.myChartColor.length < 6) {
                        $scope.myChartColor.push(color);
                        $scope.chartElement.content.options.colors = $scope.myChartColor;
                        $scope.chartConfig.options.colors = $scope.myChartColor;
                        $scope.showChartColorView = false;
                    }
                };

                /**
                 *  调色板颜色选中事件处理
                 */
                $scope.$on('changeColor', function (t, n) {
                    var a = $scope.editingType;
                    switch (a) {
                        case 'background':
                            $scope.chooseBgColor(n);
                            break;
                        case 'eleform':
                            $scope.chooseFormColor(n);
                            break;
                        case 'slide':
                            $scope.chooseTextColor(n, $scope.editingAttributes);
                            break;
                        case 'chart':
                            $scope.addMyChartColor(n);
                            break;
                        case 'bg':
                            $scope.chooseBgColor(n);
                            break;
                        case 'fontcolor':
                            $scope.chooseTextColor(n);
                            break;
                        case 'border':
                            $scope.chooseBorderColor(n);
                    }
                });

                /**
                 * 移除背景图片
                 */
                $scope.removeBgBackground = function () {
                    $scope.$broadcast('templateChange');
                    $scope.selectedTemplate.bgpic = '';
                };

                /**
                 * 打开图表编辑界面
                 */
                $scope.openChartEditView = function () {
                    $scope.showChartEditView = true;
                };

                /**
                 * 选中文本颜色
                 * @param color 颜色值
                 * @param n
                 */
                $scope.chooseTextColor = function (color, n) {
                    if (n) {
                        switch (n) {
                            case 'slideTitle':
                                $scope.selectedElement.data[$scope.selectedElement.slideNum].titleText.fontcolor = color;
                                $scope.showSlideTitleColorView = false;
                                break;
                            case 'slideContent':
                                $scope.selectedElement.data[$scope.selectedElement.slideNum].contentText.fontcolor = color;
                                $scope.showSlideTextColorView = false;
                        }
                    } else {
                        $scope.selectedElement.ftcolor = color;
                        $scope.showTextColorView = false;
                    }
                };

                /**
                 * 选中边框颜色
                 * @param color 颜色值
                 */
                $scope.chooseBorderColor = function (color) {
                    $scope.$broadcast('templateChange');
                    $scope.selectedElement['border-color'] = color;
                    $scope.borderColorView = false;
                };
                /**
                 * 关闭所有窗口
                 */
                $scope.closeAll = function () {
                    $scope.showModelView = false; //新建模板
                    $scope.showPicView = false; //图片上传界面
                    $scope.showShapeView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.borderColorView = false;
                    $scope.changingShape = false;
                    $scope.changingImg = false;
                    $scope.changingVideoPic = false;
                    $scope.changingVideo = false;
                    $scope.showMusicView = false;
                    $scope.formColorView = false;
                    $scope.showChartEditView = false;
                    $scope.help = false;
                    $scope.showButtonView = false;
                    $scope.showSiteView = false;
                    $scope.showPsdView = false;
                    $scope.showTplView = false;
                };

                /**
                 * 新建文本
                 */
                $scope.addText = function () {
                    // 默认字体,默认为空
                    $scope.defaultFont.name = '默认字体';
                    $scope.defaultFont.fontFamily = "inherit";
                    // 如果字体未加载则加载字体
                    if (!$scope.fontLoaded) {
                        $scope.loadFonts();
                    }
                    $scope.closeAll();
                    $scope.$broadcast('templateChange');
                    var template = {
                        top: 397,
                        left: 124,
                        w: '400',
                        h: '100',
                        rotate: '0',
                        bgcolor: 'rgba(25,25,25,0)',
                        opacity: 0,
                        type: 'ptext',
                        version: 21,
                        con: '请输入文本',
                        show: 'fadeIn',
                        speed: 1e3,
                        delay: 600,
                        borderradius: 0,
                        boxshadow: 0,
                        'border-style': 'none',
                        'border-color': '#000000',
                        'border-width': '0px',
                        lineheight: 1.5,
                        textalign: 'center',
                        textvalign: 'middle',
                        prepara: '0',
                        afterpara: '0',
                        ftcolor: '#F2F2F2',
                        ftsize: 40,
                        tl: 60,
                        fontbold: false,
                        fontitalic: false,
                        udl: false,
                        height: 64,
                        fontFamily:'inherit' // 所有文本框字体初始设置为继承父元素字体样式
                    };
                    template.key = $scope.selectedTemplate.content.length || 0;
                    $scope.selectedTemplate.bgpic || (template.ftcolor = '#909090');
                    $scope.selectedTemplate.content.push(template);
                    $scope.textData.push(template);
                    $scope.selectedElementNum = template.key;
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                    $scope.templateDataProcessing('template', $scope.selectedTemplate);
                };

                /**
                 * 添加形状元素
                 * @param shape 形状元素
                 */
                $scope.addShape = function (shape) {
                    $scope.$broadcast('templateChange');
                    if ($scope.changingShape && 'pshape' === $scope.selectedElement.type) {
                        $scope.changingShape = false;
                        $scope.selectedElement.shape = shape;
                        $scope.showShapeView = false;
                        $scope.closeAll();
                        return;
                    }
                    var template = {
                        top: 248,
                        left: 167,
                        w: '300',
                        h: '300',
                        rotate: 0,
                        opacity: 0,
                        type: 'pshape',
                        show: 'fadeIn',
                        speed: 1e3,
                        delay: 600,
                        borderradius: 0,
                        shapecolor: '#42C2B3',
                        shape: '4.svg',
                        height: 200
                    };
                    template.shape = shape;
                    template.key = $scope.selectedTemplate.content.length || 0;
                    $scope.selectedTemplate.content.push(template);
                    $scope.shapeData.push(template);
                    $scope.selectedElementNum = template.key;
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                    $scope.showShapeView = false;
                    $scope.templateDataProcessing('template', $scope.selectedTemplate);
                    $scope.closeAll();
                };

                /**
                 * 切换图表样式
                 */
                $scope.changeChartMultiple = function () {
                    switch ($scope.chartElement.content.type) {
                        case 'column':
                            $scope.chartElement.content.multiple = 3 === $scope.chartElement.content.multiple ? 1 : $scope.chartElement.content.multiple + 1;
                            $scope.chartConfig.options.plotOptions.column.stacking = 3 === $scope.chartElement.content.multiple ? 'normal' : '';
                            $scope.chartConfig.series = 1 === $scope.chartElement.content.multiple ? [$scope.chartElement.content.data[0]] : $scope.chartElement.content.data;
                            break;
                        case 'bar':
                            $scope.chartElement.content.multiple = 3 === $scope.chartElement.content.multiple ? 1 : $scope.chartElement.content.multiple + 1;
                            $scope.chartConfig.options.plotOptions.bar.stacking = 3 === $scope.chartElement.content.multiple ? 'normal' : '';
                            $scope.chartConfig.series = 1 === $scope.chartElement.content.multiple ? [$scope.chartElement.content.data[0]] : $scope.chartElement.content.data;
                            break;
                        case 'line':
                            $scope.chartElement.content.multiple = 1 === $scope.chartElement.content.multiple ? 2 : 1;
                            $scope.chartConfig.series = 1 === $scope.chartElement.content.multiple ? [$scope.chartElement.content.data[0]] : $scope.chartElement.content.data;
                            break;
                        case 'area':
                            $scope.chartElement.content.multiple = 1 === $scope.chartElement.content.multiple ? 3 : 1;
                            $scope.chartConfig.series = 1 === $scope.chartElement.content.multiple ? [$scope.chartElement.content.data[0]] : $scope.chartElement.content.data;
                    }
                    if (1 === $scope.chartElement.content.multiple) {
                        $scope.chartElement.top -= 50;
                    }
                    if (2 === $scope.chartElement.content.multiple || 3 === $scope.chartElement.content.multiple && 'area' === $scope.chartElement.content.type) {
                        $scope.chartElement.top += 50;
                    }
                };

                /**
                 * 拖拽配置
                 *
                 */
                $scope.sortableOptions = {
                    update: function () {
                        $scope.$broadcast('templateChange');
                    },
                    containment: 'parent',
                    scroll: true,
                    scrollSensitivity: -20
                };

                /**
                 * 选中背景
                 */
                $scope.onBgTap = function () {
                    $scope.selectedElement = {
                        type: 'bg'
                    };
                    $scope.selectedElementNum = null;
                    $scope.showChartEditView = false;
                };

                /**
                 * 文本元素选中事件
                 * @param index 索引
                 * @param event 事件
                 */
                $scope.onTextTap = function (index, event) {
                    var ele = event.target;
                    if (!ele.getAttribute('dataNum')) {
                        ele = ele.parentNode;
                    }
                    $scope.selectedElementNum = index;
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                    // 右侧字体选项展示
                    var curFont = $scope.selectedElement.fontFamily;
                    // 未加载字体则加载字体
                    if (!$scope.fontLoaded) {
                        $scope.loadFonts();
                    }
                    if (curFont !=='inherit') {
                        _.each($scope.fontConfig, function(el) {
                            if (el.fontFamily === curFont) {
                                $scope.defaultFont.name = el.name;
                                $scope.defaultFont.fontFamily = curFont;
                            }
                        });
                    } else {
                        $scope.defaultFont.name = "默认字体";
                        $scope.defaultFont.fontFamily = "inherit";
                    }
                    if (ele.getAttribute('dataType') && 'text' === ele.getAttribute('dataType')) {
                        $scope.selectedElement.height = ele.offsetHeight;
                    }
                };

                /**
                 * 改变文本框输入状态
                 */
                $scope.editText = function () {
                    $scope.selectedElement.editable = 'plaintext-only';
                    $scope.$broadcast('templateChange');
                };

                /**
                 * 选择对齐方式
                 * @param t 对齐方式
                 */
                $scope.chooseTextAlign = function (t) {
                    $scope.selectedElement.textalign = t;
                };

                /**
                 * 选中元素入场动画
                 * @param effct 效果
                 */
                $scope.chooseElementInEffect = function (effct) {
                    $scope.selectedElement.animations.animationIn.show = effct;
                };

                /**
                 * 选中元素场内动画
                 * @param effct 效果
                 */
                $scope.chooseElementOnEffect = function (effct) {
                    $scope.selectedElement.animations.animationOn.show = effct;
                };

                /**
                 * 选中元素出场动画
                 * @param effct 效果
                 */
                $scope.chooseElementOutEffect = function (effct) {
                    $scope.selectedElement.animations.animationOut.show = effct;
                };

                /**
                 * 打开形状元素
                 */
                $scope.openShapeView = function () {
                    if ($scope.changingShape) {
                        $scope.showShapeView = true;
                    } else {
                        $scope.showShapeView = !$scope.showShapeView;
                    }
                    $scope.showPicView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.borderColorView = false;
                    $scope.changingImg = false;
                    $scope.changingVideoPic = false;
                    $scope.changingVideo = false;
                    $scope.showMusicView = false;
                    $scope.showButtonView = false;
                    $scope.showSiteView = false;
                    $scope.showVideoView = false;
                    // $scope.audio.pause();
                };

                /**
                 * 拷贝元素
                 * @param t 元素数据
                 */
                $scope.copyElement = function (t) {
                    var n = 'picvideoptexttextbtnpButtonpshape';
                    if (n.indexOf(t.type) !== -1) {
                        $scope.copyData = $scope.clone(t);
                        $scope.isShear = false;
                    }
                };

                /**
                 * 剪切元素
                 * @param t 元素数据
                 */
                $scope.shearElement = function (t) {
                    var n = 'picptexttextbtnpButtonpshape';
                    if (-1 !== n.indexOf(t.type)) {
                        $scope.copyData = $scope.clone(t);
                        $scope.isShear = true;
                        $scope.$broadcast('templateChange');
                        var a = t.key;
                        $scope.selectedTemplate.content.splice(a, 1);
                        $scope.$emit('noRefresh');
                        $scope.templateDataProcessing('template', $scope.selectedTemplate);
                        $scope.chooseTemplate($scope.selectedTemplateNum);
                    }
                };

                /**
                 * 拖动开始事件
                 * @param t
                 */
                $scope.onPanStart = function (t) {
                    $scope.snapto();
                    var el = $scope.selectedElement;
                    // 如果是自由模式，才可以拖动
                    if (!(el.type === 'ptext' && el.editable === 'plaintext-only') && !$scope.locked) {
                        $scope.selectedElementNum = t;
                        $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                        if (!isPan) {
                            thisLeft = parseInt($scope.selectedElement.left);
                            thisTop = parseInt($scope.selectedElement.top);
                            isPan = true;
                        }
                        var o = {
                            elementData: $scope.clone($scope.selectedElement),
                            templateNum: $scope.clone($scope.templateNum),
                            movementType: 'element'
                        };
                        $scope.movementList.push(o);
                    }
                };

                /**
                 * 更新元素位置
                 */
                var timer = null;
                $scope.updateElement = function () {
                    if ($scope.selectedElement) {
                        $scope.selectedElement.left = trueLeft;
                        $scope.selectedElement.top = trueTop;
                        if ($scope.showReferLine) {
                            $timeout.cancel(timer);
                            timer = $timeout(function () {
                                $scope.$broadcast('updateElement');
                                // console.log('$broadcast');
                            },16);
                        }
                    }
                };

                /**
                 * 拖动中
                 * @param t
                 */
                $scope.onPan = function (t) {
                    var el = $scope.selectedElement;
                    if(!(el.type === 'ptext' && el.editable === 'plaintext-only')) {
                        trueLeft = thisLeft + t.deltaX / $rootScope.bgScale;
                        trueTop = thisTop + t.deltaY / $rootScope.bgScale;
                        $scope.updateElement();
                    }
                };


                /**
                 * 拖动结束
                 */
                $scope.endPan = function (sign) {
                    var el = $scope.selectedElement;
                    if(!(el.type === 'ptext' && el.editable === 'plaintext-only')) {
                        isPan = false;
                        thisLeft = 0;
                        thisTop = 0;
                        if ($scope.movementList && $scope.movementList.length > 0) {
                            var n = {
                                elementData: $scope.clone($scope.selectedElement),
                                templateNum: $scope.clone($scope.templateNum),
                                movementType: 'element'
                            };
                            if (n === $scope.movementList[$scope.movementList.length - 1]) {
                                $scope.movementList.pop();
                            }
                            if ($scope.movementList.length > 100) {
                                $scope.movementList.shift();
                            }
                        }
                        if (sign === 'chart') {
                            if ($scope.chartElement.content.type !== 'pie') {
                                $scope.chartConfig.size = {
                                    width: $scope.chartElement.w - 8,
                                    height: $scope.chartElement.h
                                };
                            } else {
                                $scope.chartConfig.size = {
                                    width: $scope.chartElement.w - 8,
                                    height: $scope.chartElement.h - 50
                                };
                            }
                        }
                    }
                    // yf: 调用吸附方法
                    if ($scope.showReferLine) {
                        $timeout.cancel(timer);
                        $scope.snapto();
                    }
                };

                // yf: 吸附功能
                $scope.snapto = function() {
                    var oSelected = $scope.selectedElement,
                        oLine = $scope.line;
                    var minLeft = {
                            abs: 0,
                            val: 0
                        },
                        minTop = {
                            abs: 0,
                            val: 0
                        };
                    for (var type in oLine) {
                        var line = oLine[type];
                        if (line.left && line.left !== 0) {
                            if (!minLeft.abs || minLeft.abs > line.abs) {
                                minLeft.abs = line.abs;
                                minLeft.val = line.end;
                            }
                            line.left = 0;
                        }

                        if (line.top && line.top !== 0) {
                            if (!minTop.abs || minTop.abs > line.abs) {
                                minTop.abs = line.abs;
                                minTop.val = line.end;
                            }
                            line.top = 0;
                        }
                        line.end = 0;
                        line.info = '';
                        line.display = 'none';
                    }
                    if (minLeft.abs) {
                        oSelected.left = minLeft.val;
                    }

                    if (minTop.abs) {
                        oSelected.top = minTop.val;
                    }
                }


                /**
                 * 更换形状
                 */
                $scope.changeShape = function () {
                    $scope.changingShape = true;
                    $scope.openShapeView();
                };

                /**
                 * 打开按钮视图
                 */
                $scope.openButtonView = function () {
                    $scope.showButtonView = !$scope.showButtonView;
                    $scope.showShapeView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.borderColorView = false;
                    $scope.changingShape = false;
                    $scope.showMusicView = false;
                    $scope.showPicView = false;
                    $scope.showVideoView = false;
                    $scope.showSiteView = false;
                    //  $scope.audio.pause();
                };

                /**
                 * 打开音乐库
                 */
                $scope.openMusicView = function () {
                    $scope.showMusicView = !$scope.showMusicView;
                    $('a.musicplay').find('i').removeClass('fa-pause').addClass('fa-play');
                    $scope.audio.pause();
                    $scope.showModelView = false;
                    $scope.showPicView = false;
                    $scope.showShapeView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.changingShape = false;
                    $scope.changingImg = false;
                    $scope.changingVideoPic = false;
                    $scope.changingVideo = false;
                    $scope.showSiteView = false;
                    $scope.showVideoView = false;
                };

                /**
                 * 增加按钮
                 * @param t 索引
                 */
                $scope.addButton = function (t) {
                    $scope.$broadcast('templateChange');
                    // 通用按钮
                    var button = {
                        top: 840,
                        left: 222,
                        w: '220',
                        h: '80',
                        rotate: '0',
                        ftcolor: '#585858',
                        bgcolor: 'rgba(255,255,255,1)',
                        opacity: '20',
                        type: 'btn',
                        con: '<div>按钮</div>',
                        ftsize: 40,
                        show: 'fadeIn',
                        speed: 1e3,
                        delay: 600,
                        borderradius: '30',
                        boxshadow: 16,
                        'border-style': 'none',
                        'border-color': '#000000',
                        'border-width': '0px',
                        udl: false,
                        lineheight: 2,
                        textalign: 'center',
                        textvalign: 'middle',
                        prepara: '0',
                        afterpara: '0',
                        tl: 80,
                        height: 60
                    };
                    // 其他按钮
                    var pbutton = {
                        top: 840,
                        left: 222,
                        rotate: '0',
                        ftcolor: '#585858',
                        opacity: '20',
                        type: 'btn',
                        con: '',
                        ftsize: 40,
                        show: 'fadeIn',
                        speed: 1e3,
                        delay: 600,
                        udl: false,
                        prepara: '0',
                        afterpara: '0',
                        url: 'm.fang.com',
                        tl: 80,
                        lineheight: 80,
                        picwidth: 80,
                        picheight: 80,
                        width: 500
                    };
                    // 增加特殊按钮
                    if (t && parseInt(t) !== 5) {
                        pbutton.type = 'pButton';
                        switch (t) {
                            case 1:
                                pbutton.model_type = 'link';
                                pbutton.pic_id = '6.png';
                                pbutton.ftcolor = 'red';
                                pbutton.con = '请输入文本';
                                break;
                            case 2:
                                pbutton.model_type = 'phone';
                                pbutton.pic_id = '1.png';
                                pbutton.ftcolor = '#42c2b3';
                                pbutton.con = '｜拨打电话';
                                pbutton.phoneNumber = '400-630-8888,8838';
                                break;
                            case 3:
                                // 互动按钮
                                pbutton.model_type = 'interaction';
                                pbutton.pic_id = '4.png';
                                pbutton.button_id = $scope.uuid(9);
                                pbutton.after_pic_id = '04.png';
                                pbutton.ftcolor = '#F5A623';
                                pbutton.con = '点赞';
                                pbutton.projectName = '请输入项目名称';
                                break;
                            // 倒计时
                            case 4:
                                pbutton.model_type = 'count_down';
                                var o = new Date,
                                    i = ['yyyy-MM-dd', 'HH:mm'];
                                pbutton.deadline_date = $filter('date')(o, i[0]);
                                pbutton.deadline_time = $filter('date')(o, i[1]);
                                pbutton.left = 0;
                                pbutton.width = 640;
                                pbutton.ftsize = 70;
                                break;
                        }
                        // 增加普通按钮
                    } else {
                        pbutton = button;
                        if (t || parseInt(t) === 5) {
                            // 默认字体,默认为空
                            $scope.defaultFont.name = '默认字体';
                            $scope.defaultFont.fontFamily = "inherit";
                            // 如果字体未加载则加载字体
                            if (!$scope.fontLoaded) {
                                $scope.loadFonts();
                            }
                            pbutton.minNum = '1';
                            pbutton.maxNum = '100';
                            pbutton.con = '随机数';
                            pbutton.type = 'rand_button';
                            pbutton.borderradius = '0';
                            pbutton.bgcolor = '';
                            pbutton.boxshadow = 0;
                            pbutton.opacity = '0';
                            pbutton.fontFamily = 'inherit'; // 所有文本框字体初始设置为继承父元素字体样式
                        }
                    }
                    pbutton.key = $scope.selectedTemplate.content.length || 0;
                    $scope.selectedTemplate.content.push(pbutton);
                    if (t && parseInt(t) !== 5) {
                        $scope.pButtonData.push(pbutton);
                    } else {
                        $scope.buttonData.push(pbutton);
                    }
                    $scope.selectedElementNum = pbutton.key;
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                    $scope.templateDataProcessing('template', $scope.selectedTemplate);
                    $scope.closeAll();
                };

                /**
                 * 双击选择模板
                 * @param type
                 * @param index
                 */
                $scope.dbClickAddTemplate = function (type, index) {
                    // 如果是正在预览的模板，直接添加
                    if (index === $scope.preIdx) {
                        $scope.addTemplate();
                        return;
                    }
                    var a, thisIndex = index;
                    if (n % 2 === 0) {
                        thisIndex = index + 1;
                    }
                    switch (type) {
                        case 'allModel':
                            a = $scope.clone($scope.allModel[thisIndex]);
                            break;
                        case 'modelOne':
                            a = $scope.clone($scope.modelOne[thisIndex]);
                            break;
                        case 'modelTwo':
                            a = $scope.clone($scope.modelTwo[thisIndex]);
                            break;
                        case 'modelThree':
                            a = $scope.clone($scope.modelThree[thisIndex]);
                            break;
                        case 'modelFour':
                            a = $scope.clone($scope.modelFour[thisIndex]);
                            break;
                        case 'chartModel':
                            a = $scope.clone($scope.allChartModel[thisIndex]);
                            break;
                        case 'userModel':
                            a = $scope.clone($scope.userModelData[thisIndex]);
                            break;
                    }
                    var last = a.content.length - 1;
                    if (a.content[last].qlist) {
                        a.type = 'form';
                        a.content[last].formid = $scope.uuid(8);
                        a.content[last].btn_name = '提交';
                    }
                    $scope.$broadcast('templateChange');
                    a.lock = !$scope.isDesigner;
                    var o = $scope.selectedTemplateNum;
                    $scope.templateData.splice(o + 1, 0, $scope.addTemplateProcessing(a));
                    $scope.chooseTemplate(o + 1);
                    $scope.templateDataProcessing('template', $scope.templateData[$scope.selectedTemplateNum]);
                    $scope.showModelView = false;
                };

                /**
                 * 切换互动按钮样式
                 * @param t 样式id
                 * @param name 样式名称
                 */
                $scope.changeButtonStyle = function (t, name) {
                    $scope.selectedElement.pic_id = t;
                   // $scope.selectedElement.con = name;
                    if ('interaction' === $scope.selectedElement.model_type) {
                        $scope.selectedElement.after_pic_id = '0' + t;
                        $scope.selectedElement.con = name;
                    }
                };
                /**
                 * 文本拖拽开始事件
                 * @param index
                 * @param event
                 */
                $scope.textOnPanStart = function (index, event) {
                    var el = $scope.selectedElement;
                    if (!$scope.locked && !(el.type === 'ptext' && el.editable === 'plaintext-only')) {
                        var o = event.target;
                        if (!o.getAttribute('dataNum')) {
                            o = o.parentNode;
                        }
                        $scope.selectedElementNum = index;
                        $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                        $scope.selectedElement.height = o.offsetHeight;
                        if (!isPan) {
                            thisLeft = parseInt($scope.selectedElement.left);
                            thisTop = parseInt($scope.selectedElement.top);
                            isPan = true;
                        }
                        var l = {
                            elementData: $scope.clone($scope.selectedElement),
                            templateNum: $scope.clone($scope.templateNum),
                            movementType: 'element'
                        };
                        $scope.movementList.push(l);
                    }
                };

                /**
                 * 背景音乐选择
                 * @param data 音乐数据
                 */
                $scope.chooseMusic = function (data) {
                    $scope.$broadcast('templateChange');
                    $scope.projectMusic = data;
                    $('a.musicplay').find('i').removeClass('fa-pause').addClass('fa-play');
                    $scope.audio.pause();
                    $scope.showMusicView = false;
                };

                /**
                 * 添加背景音乐
                 */
                $scope.addMusic = function () {
                    $scope.projectMusic = {
                        name: $scope.music.id.substring($scope.music.id.lastIndexOf('/'), $scope.music.id.lastIndexOf('.')),
                        id: $scope.music.id,
                        // 是否循环播放默认为循环播放
                        loop:'on'
                    };
                };

                /**
                 * 上传失败提示信息
                 */
                $scope.msgConfirm = function (msg) {
                    $modal.open({
                        template: '<div class="modal-body" >' + msg + '</div><div class="modal-footer">'
                        + '<button class="btn btn-primary" ng-click="ok()">确定</button>',
                        controller: 'ModalInstanceCtrl'
                    });
                };

                /**
                 * 消息提示框
                 */
                $scope.msgTip = function (msg) {
                    $scope.modal = $modal.open({
                        animation: false,
                        template: '<div class="modal-body" >' + msg + '</div>'
                    });
                };

                /**
                 * 打开图片上传界面
                 */
                $scope.openPicView = function () {
                    $scope.showPicView = $scope.changingImg ? true : !$scope.showPicView;
                    $scope.showShapeView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.borderColorView = false;
                    $scope.changingShape = false;
                    $scope.showMusicView = false;
                    $scope.showButtonView = false;
                    $scope.showTplView = false;
                    $scope.showSiteView = false;
                    // $scope.audio.pause();
                };


                /**
                 * 打开添加网址界面
                 */

                $scope.openSiteView = function () {
                    if ($scope.selectedElement.type === 'site') {
                        $scope.site.url = $scope.selectedElement.url;
                    }
                    $scope.showSiteView = $scope.changingSite ? true : !$scope.showSiteView;
                    $scope.showPicView = false;
                    $scope.showShapeView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.borderColorView = false;
                    $scope.changingShape = false;
                    $scope.showMusicView = false;
                    $scope.showButtonView = false;
                    $scope.showVideoView = false;
                };

                /**
                 * 添加网址
                 */

                $scope.addSite = function () {
                    var siteUrl = $.trim($scope.site.url);
                    if (/([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}/.test(siteUrl) === false) {
                        $scope.msgConfirm('请填写正确网址');
                        return;
                    }
                    if (siteUrl.indexOf('http://') <= -1) {
                        siteUrl = 'http://' + siteUrl;
                    }

                    var urlEle = {
                        stypeposition: 'absolute',
                        top: 0,
                        left: 0,
                        w: 640,
                        h: 1008,
                        rotate: '0',
                        opacity: '0',
                        type: 'site',
                        show: 'fadeInNormal',
                        speed: 1e3,
                        delay: 600,
                        borderradius:0,
                        url: siteUrl,
                        stylecolor: 'rgb(218, 218, 218)',
                        styleopacity: 0
                    };
                    if ($scope.siteData === '') {
                        urlEle.key = $scope.selectedTemplate.content.length || 0;
                        $scope.siteData = urlEle;
                        $scope.selectedTemplate.content.push(urlEle);

                    } else {
                        if ($scope.selectedElement.url) {
                            $scope.selectedElement.url = $scope.site.url;
                        } else {
                            $scope.siteData.url = $scope.site.url;
                        }
                        $scope.showSiteView = false;
                        return;
                    }
                    $scope.selectedElementNum = $scope.siteData.key;
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                    $scope.templateDataProcessing('template', $scope.selectedTemplate);
                    $scope.showSiteView = false;
                };

                /**
                 *打开添加图集界面
                 */
                $scope.openSlideView = function () {

                    if ($scope.addSlidersPic || !$scope.showPicView) {
                        $scope.showPicView = !$scope.showPicView
                    }
                    $scope.addSlidersPic = true;
                    $scope.selectedLoading = false;
                    $scope.showModelView = false;
                    $scope.showShapeView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.changingShape = false;
                    $scope.changingImg = false;
                    $scope.changingVideoPic = false;
                    $scope.changingVideo = false;
                    $scope.showSiteView = false;
                    $scope.showVideoView = false;
                    $scope.showMusicView = false;
                };

                /**
                 * 添加图集图片
                 */
                $scope.chooseSlidePic = function (img) {
                    var sArr = $scope.clone($scope.sliders);
                    if (!sArr[img.picid]) {
                        sArr[img.picid] = img;
                        $scope.sliders = sArr;
                    }
                };
                /**
                 * 添加添加轮播图集
                 */
                $scope.addSlider = function () {
                    var sliderPicArr = $scope.clone($scope.sliders);
                    $scope.sliders = [];
                    var picEle, picDataArr = [];
                    for (var s in sliderPicArr) {
                        picEle = {
                            height: 256,
                            inh: 0,
                            inleft: 0,
                            intop: 0,
                            inw: 600,
                            picid: sliderPicArr[s].id,
                            type: 'pic'
                        };
                        picDataArr.push(picEle);
                    }
                   var sEl = {
                        animation: {
                            auto: 'true',
                            changeTime: 1,
                            show: 'fade'
                        },
                        data: picDataArr,
                        eventAction: 'none',
                        eventType: 'none',
                        height: 400,
                        left: 0,
                        opacity: 100,
                        picHeight: '400',
                        picLeft: '0',
                        picTop: '0',
                        picWidth: '600',
                        slideNum: 0,
                        toPage: '0',
                        top: 0,
                        type: 'slides',
                        width: 600
                    };
                    sEl.key = $scope.selectedTemplate.content.length || 0;
                    $scope.selectedTemplate.content.push(sEl);
                    $scope.slidesData.push(sEl);
                    $scope.selectedElementNum = sEl.key;
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                    $scope.templateDataProcessing('template', $scope.selectedTemplate);
                    $scope.closeAll();
                };

                /**
                 * 点击图集中的图片
                 * @param index 图集索引
                 * @param key
                 */
                $scope.onSlidesTap = function (index, key) {
                    $scope.showSlideTextColorView = false;
                    $scope.showSlideTitleColorView = false;
                    $scope.selectedElementNum = key;
                    $scope.selectedElement = $scope.slidesData[index];
                };

                /**
                 * 图集更新形状位置大小
                 */
                $scope.slidesUpdateEle = function () {
                    $scope.selectedElement.left = trueLeft;
                    $scope.selectedElement.top = trueTop;
                    $scope.selectedElement.width = trueW;
                    $scope.selectedElement.height = trueH;
                    $scope.selectedElement.picWidth = trueW;
                    $scope.selectedElement.picHeight = trueH;
                };

                /**
                 * 图集进行四角拖拽
                 * @param t
                 */
                $scope.onSlidesCornerPan = function (t) {
                        if (!$scope.locked) {
                            if (!isPan) {
                                thisLeft = $scope.selectedElement.left;
                                thisTop = $scope.selectedElement.top;
                                thisW = $scope.selectedElement.width;
                                thisH = $scope.selectedElement.height;
                                thisInleft = $scope.selectedElement.picLeft;
                                thisIntop = $scope.selectedElement.picTop;
                                selPicW = parseInt($scope.selectedElement.data[$scope.selectedElement.slideNum].inw),
                                selPicPercent = selPicW / thisW,
                                isPan = true;
                            }
                            var n,
                                selPicTop = $scope.selectedElement.data[$scope.selectedElement.slideNum].intop,
                                selPicLeft = $scope.selectedElement.data[$scope.selectedElement.slideNum].inleft;
                            // 四个角拖动
                            switch (t.target.getAttribute('num')) {
                                case '1':
                                    n = (-t.deltaX >= -t.deltaY * (thisH / thisW) ? -t.deltaX : -t.deltaY) / $rootScope.bgScale;
                                    trueLeft = thisLeft - n;
                                    selPicLeft -= n;
                                    trueTop = thisTop - n * (thisH / thisW);
                                    selPicTop -=  n * (thisH / thisW);
                                    break;
                                case '2':
                                    n = (t.deltaX >= -t.deltaY * (thisH / thisW) ? t.deltaX : -t.deltaY) / $rootScope.bgScale;
                                    trueLeft = thisLeft;
                                    trueTop = thisTop - n * (thisH / thisW);
                                    selPicTop -= n * (thisH / thisW);
                                    break;
                                case '3':
                                    n = (-t.deltaX >= t.deltaY * (thisH / thisW) ? -t.deltaX : t.deltaY) / $rootScope.bgScale;
                                    trueLeft = thisLeft - n;
                                    selPicLeft -= n;
                                    trueTop = thisTop;
                                    break;
                                default :
                                    n = (t.deltaX >= t.deltaY * (thisH / thisW) ? t.deltaX : t.deltaY) / $rootScope.bgScale;
                                    trueLeft = thisLeft;
                                    trueTop = thisTop;

                            }
                            trueW = parseInt(thisW) + n;
                            trueH = parseInt(thisH) + n * (thisH / thisW);
                            trueInleft = thisInleft * (trueW / thisW);
                            trueIntop = thisIntop * (trueW / thisW);
                            _.each($scope.selectedElement.data, function (data, index) {
                                if ($scope.selectedElement.slideNum !== index) {
                                    data.height = trueH;
                                    data.inw = trueW;
                                }
                            });
                            var selPicBox = $scope.selectedElement.data[$scope.selectedElement.slideNum];
                            selPicBox.inleft = selPicBox.inleft * (trueW * selPicPercent/selPicBox.inw);
                            selPicBox.intop = selPicBox.intop * (trueW * selPicPercent/selPicBox.inw);
                            selPicBox.inw = trueW * selPicPercent;
                        $scope.slidesUpdateEle(n);
                    }
                };

                /**
                 * 更新形状位置大小
                 */
                $scope.siteUpdateEle = function () {
                    $scope.selectedElement.left = trueLeft;
                    $scope.selectedElement.top = trueTop;
                    $scope.selectedElement.w = trueW;
                    $scope.selectedElement.h = trueH;
                };

                /**
                 * 网址形状四角拖拽
                 * @param t
                 */
                $scope.onSiteCornerPan = function (t) {
                    if (!$scope.locked) {
                        if (!isPan) {
                            thisLeft = $scope.selectedElement.left;
                            thisTop = $scope.selectedElement.top;
                            thisW = $scope.selectedElement.w;
                            thisH = $scope.selectedElement.h;
                            isPan = true;
                        }
                        // 四个角拖动
                        switch (t.target.getAttribute('num')) {
                            case '1':
                                if (parseInt(thisW) + -t.deltaX / $rootScope.bgScale <= 0 || parseInt(thisH) + -t.deltaY / $rootScope.bgScale <= 0)
                                    return;
                                trueLeft = thisLeft - -t.deltaX / $rootScope.bgScale;
                                trueTop = thisTop - -t.deltaY / $rootScope.bgScale;
                                trueW = parseInt(thisW) + -t.deltaX / $rootScope.bgScale;
                                trueH = parseInt(thisH) + -t.deltaY / $rootScope.bgScale;
                                break;
                            case '2':
                                if (parseInt(thisW) + t.deltaX / $rootScope.bgScale <= 0 || parseInt(thisH) + -t.deltaY / $rootScope.bgScale <= 0)
                                    return;
                                trueLeft = thisLeft;
                                trueTop = thisTop - -t.deltaY / $rootScope.bgScale;
                                trueW = parseInt(thisW) + t.deltaX / $rootScope.bgScale;
                                trueH = parseInt(thisH) + -t.deltaY / $rootScope.bgScale;
                                break;
                            case '3':
                                if (parseInt(thisW) + -t.deltaX / $rootScope.bgScale <= 0 || parseInt(thisH) + t.deltaY / $rootScope.bgScale <= 0)
                                    return;
                                trueLeft = thisLeft - -t.deltaX / $rootScope.bgScale;
                                trueTop = thisTop;
                                trueW = parseInt(thisW) + -t.deltaX / $rootScope.bgScale;
                                trueH = parseInt(thisH) + t.deltaY / $rootScope.bgScale;
                                break;
                            default :
                                if (parseInt(thisW) + t.deltaX / $rootScope.bgScale <= 0 || parseInt(thisH) + t.deltaY / $rootScope.bgScale <= 0)
                                    return;
                                trueLeft = thisLeft;
                                trueTop = thisTop;
                                trueW = parseInt(thisW) + t.deltaX / $rootScope.bgScale;
                                trueH = parseInt(thisH) + t.deltaY / $rootScope.bgScale;

                        }
                        $scope.siteUpdateEle();
                    }
                };

                /**
                 * 取消添加视频
                 */

                $scope.cancelSite = function () {
                    $scope.showSiteView = false;
                    $scope.changingSite = false;
                };

                /**
                 * 打开视频上传界面
                 */
                $scope.openVideoView = function () {
                    if ($scope.selectedElement.type === 'video') {
                        $scope.video.videourl = $scope.selectedElement.videourl;
                    }
                    $scope.showVideoView = $scope.changingVideo ? true : !$scope.showVideoView;
                    $scope.showPicView = false;
                    $scope.showShapeView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.borderColorView = false;
                    $scope.changingShape = false;
                    $scope.showMusicView = false;
                    $scope.showButtonView = false;
                    $scope.showSiteView = false;
                };

                /**
                 * 取消添加视频
                 */
                $scope.cancelVideo = function () {
                    $scope.showVideoView = false;
                    $scope.changingVideo = false;
                };


                /**
                 * 添加视频
                 */
                $scope.addVideo = function () {
                    var vurl = $.trim($scope.video.videourl), vlength = vurl.length;
                    // if (vurl.indexOf('.soufun.com') === -1 && vurl.indexOf('.fang.com') === -1 && vurl.indexOf('.soufunimg.com') === -1) {
                    //     $scope.msgConfirm('亲，只能添加soufun.com、fang.com或者soufunimg.com域名下的视频哦~');
                    //     return;
                    // }
                    if (vurl.toLowerCase().substring(vlength - 4, vlength) !== '.mp4') {
                        $scope.msgConfirm('亲，视频只能是mp4格式哦~');
                        return;
                    }
                    $scope.$broadcast('templateChange');
                    // 如果是更换视频
                    if ($scope.changingVideo) {
                        $scope.changingVideo = false;
                        $scope.selectedElement.videourl = $scope.video.videourl;
                        $scope.showVideoView = false;
                        return;
                    }
                    var videoEle = {
                        top: 20,
                        left: 0,
                        w: 640,
                        h: 300,
                        rotate: '0',
                        opacity: '0',
                        type: 'video',
                        con: '',
                        show: 'fadeInNormal',
                        speed: 1e3,
                        delay: 600,
                        borderradius: 0,
                        shape: 0,
                        inw: 640,
                        inh: 'auto',
                        intop: 0,
                        inleft: 0,
                        picurl: 'videopic.jpg',
                        videourl: vurl,
                        stylecolor: 'rgba(0,0,0,0)',
                        styleopacity: 0,
                        height: 300,
                        autoplay: 'control'
                    };
                    videoEle.key = $scope.selectedTemplate.content.length || 0;
                    $scope.selectedTemplate.content.push(videoEle);
                    $scope.videoData.push(videoEle);
                    $scope.selectedElementNum = videoEle.key;
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                    $scope.templateDataProcessing('template', $scope.selectedTemplate);
                    $scope.showVideoView = false;
                };

                /**
                 * 根据种类获取图片
                 * @param type 种类id
                 * @param subobj 标签
                 */
                $scope.getPicByCatalog = function (type, subobj) {
                    $scope.selectedTag = subobj;
                    $scope.picData = [];
                    editorRequest.getPicByCatalog({
                        type: type,
                        subtype: subobj.en
                    }, function (t) {
                        if (t.errcode !== 1) {
                            return;
                        }
                        $scope.picData = t.data;
                    });
                };

                /**
                 * 选择图片种类
                 * @param t
                 */
                $scope.choosePicCatalog = function (t) {
                    if (t === 'mine') {
                        $scope.selectedCatalog = {
                            zh: t
                        };
                        $scope.selectedLoading = false;
                    } else {
                        $scope.selectedCatalog = $scope.picCatalogs[t];
                        $scope.getPicByCatalog($scope.selectedCatalog.en, $scope.selectedCatalog.subPicType[0]);
                        // 是否选中loading图
                        if ($scope.selectedCatalog.en === 'loading') {
                            $scope.selectedLoading = true;
                        } else {
                            $scope.selectedLoading = false;
                        }
                    }
                };

                /**
                 * 选中图片
                 * @param img
                 */
                $scope.choosePic = function (img) {
                        $scope.pic = img;
                };

                /**
                 * 设置开场动画
                 */
                $scope.setLoadingGif = function () {
                    if ($scope.pic) {
                        $scope.loadingGif = $scope.pic.id;
                        $scope.showPicView = false;
                        $scope.save('preview');
                    } else {
                        $scope.msgConfirm('请先选择图片哦亲～');
                    }
                };

                /**
                 * 鼠标经过上传图片
                 */
                $scope.overUploadImg = function (id) {
                    $scope.overImg.id = id;
                };

                /**
                 * 鼠标经过上传图片
                 */
                $scope.leaveUploadImg = function () {
                    $scope.overImg.id = 'none';
                };
                /**
                 * 鼠标经过我的模板
                 */
                $scope.overMyTemplate = function (id) {
                    $scope.overMyTpl.id = id;
                };

                /**
                 * 鼠标经过我的模板
                 */
                $scope.leaveMyTemplate = function () {
                    $scope.overMyTpl.id = 'none';
                };

                /**
                 * 清空开场动画
                 */
                $scope.clearLoadingGif = function () {
                    $scope.loadingGif = '';
                    $scope.showPicView = false;
                    $scope.save('preview');
                };

                /**
                 * 把图片设置为背景
                 */
                $scope.setBgImg = function () {
                    // 如果有选中的图片
                    if ($scope.pic) {
                        $scope.$broadcast('templateChange');
                        var imgSrc = $scope.pic.id;
                        if (/(\/\/cdn[n|s]\.soufunimg\.com)|(\/\/img\w{0,3}\.soufunimg\.com)|(\/\/(js|static)\.soufunimg\.com)|(\/\/\w+\.soufunimg\.com\/h5)/.test($scope.pic.id) === false) {
                            imgSrc = Config.pictureServer + $scope.pic.id;
                        }
                        var img = new Image();
                        img.onload = function () {
                            if (img.width / img.height <= 640 / 1008) {
                                $scope.selectedTemplate.bgpicwidth = 640;
                            } else {
                                $scope.selectedTemplate.bgpicwidth = img.width * (1008 / img.height);
                            }
                            $scope.selectedTemplate.bgpicleft = 0;
                            $scope.selectedTemplate.bgpictop = 0;
                            $scope.selectedTemplate.bgpic = $scope.pic.id;
                            $scope.showPicView = false;
                            $scope.$apply();
                        };
                        img.src = imgSrc;
                    }
                };

                /**
                 * 增加图片
                 */
                $scope.addImg = function () {
                    if ($scope.pic) {
                        $scope.$broadcast('templateChange');
                        var picClone = $scope.clone($scope.pic);
                        var img = new Image();
                        // 如果此时模板选中的元素是图片并且上传图片界面选中的图片有变化
                        if ($scope.changingImg && $scope.selectedElement.type === 'pic') {
                            $scope.changingImg = false;
                            $scope.selectedElement.picid = $scope.pic.id;
                            $scope.showPicView = false;
                            return;
                        }
                        if ($scope.changingImg && $scope.selectedElement.type === 'slide') {
                            $scope.changingImg = false;
                            $scope.selectedElement.data[$scope.selectedElement.slideNum].picid = $scope.pic.id;
                            $scope.showPicView = false;
                            return;
                        }
                        if ($scope.changingImg && $scope.selectedElement.type === 'slides') {
                            $scope.changingImg = false;
                            $scope.selectedElement.data[$scope.selectedElement.slideNum].picid = $scope.pic.id;
                            $scope.showPicView = false;
                            return;
                        }
                        // 如果选中的是模板图片
                        if ('designer' === $scope.selectedElement.pic_type) {
                            img.onload = function () {
                                $scope.selectedElement.w = img.width > 640 ? 640 : img.width;
                                $scope.selectedElement.h = img.height * ($scope.selectedElement.w / img.width);
                                $scope.selectedElement.top = 100;
                                $scope.selectedElement.left = (640 - $scope.selectedElement.w) / 2;
                                $scope.selectedElement.inw = $scope.selectedElement.w;
                                $scope.selectedElement.intop = 0;
                                $scope.selectedElement.inleft = 0;
                                $scope.$apply();
                            };
                            $scope.showPicView = false;
                        } else {
                            img.onload = function () {
                                var imgW = img.width;
                                var imgH = img.height;
                                var imgEle = {
                                    top: 459,
                                    left: 316,
                                    w: 256,
                                    h: 256,
                                    rotate: '0',
                                    opacity: '0',
                                    type: 'pic',
                                    con: '',
                                    show: 'fadeInNormal',
                                    speed: 1e3,
                                    delay: 600,
                                    borderradius: 0,
                                    shape: 0,
                                    inw: 256,
                                    inh: 'auto',
                                    intop: 0,
                                    inleft: 0,
                                    picid: 'PDNOWKRP9F1YO79U4QCF.png',
                                    stylecolor: 'rgba(0,0,0,0)',
                                    styleopacity: 0,
                                    height: 256
                                };
                                imgEle.picid = picClone.id;
                                imgEle.inw = imgW;
                                imgEle.inh = imgH;
                                if (!$scope.locked) {
                                    imgEle.w = imgW;
                                    imgEle.h = imgH;
                                }
                                imgEle.top = (1008 - imgH) / 2;
                                imgEle.left = (640 - imgW) / 2;
                                imgEle.key = $scope.selectedTemplate.content.length || 0;
                                $scope.selectedTemplate.content.push(imgEle);
                                $scope.$apply(function () {
                                    $scope.imgData.push(imgEle);
                                    $scope.selectedElementNum = imgEle.key;
                                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                                    $scope.showPicView = false;
                                    $scope.templateDataProcessing('template', $scope.selectedTemplate);
                                });
                            };
                        }
                        if (/(\/\/cdn[n|s]\.soufunimg\.com)|(\/\/img\w{0,3}\.soufunimg\.com)|(\/\/(js|static)\.soufunimg\.com)|(\/\/\w+\.soufunimg\.com\/h5)/.test($scope.pic.id)) {
                            img.src = $scope.pic.id;
                        } else {
                            img.src = Config.pictureServer + $scope.pic.id;
                        }
                        $scope.showPicView = false;
                    }
                };


                /**
                 * 设置视频封面图
                 */
                $scope.setVideo = function () {
                    if ($scope.selectedElement.type === 'video') {
                        $scope.selectedElement.picurl = $scope.pic.id;
                    }
                    $scope.changingVideoPic = false;
                    $scope.showPicView = false;
                };

                /**
                 * 删除上传的图片
                 * @param pic 图片
                 * @param index 索引
                 */
                $scope.deleteMyUploadingImg = function(pic, index,event) {
                    // 如果操作的是轮播组件
                    if ($scope.addSlidersPic) {
                        var slidersArr = $scope.clone($scope.sliders);
                        delete(slidersArr[pic.picid]);
                        $scope.sliders = slidersArr;
                        event.stopPropagation();
                    }
                    editorRequest.deleteMyPic({
                            id: pic.picid
                        }, function (t) {
                            if (t.errcode === 2) {
                                $scope.relogin(t.url, t.errmsg);
                                return;
                            }
                            if (1 === t.errcode) {
                                $scope.myUploadingImg.splice(index, 1);
                            } else if (0 === t.errcode) {
                                $scope.msgConfirm(t.errmsg);
                            }
                        }
                    );
                };

                /**
                 * 选择图表背景颜色
                 * @param index
                 */
                $scope.chooseCharColor = function (index) {
                    $scope.chartElement.content.options.colors = $scope.chartsColor[index];
                    $scope.chartConfig.options.colors = $scope.chartsColor[index];
                    $scope.myChartColor = [];
                };

                /**
                 * 更换图表背景颜色
                 * @param color
                 */
                $scope.changeChartFLColor = function (color) {
                    $scope.chartConfig.yAxis.gridLineColor = color;
                    $scope.chartConfig.xAxis.lineColor = color;
                    $scope.chartConfig.xAxis.labels.style.color = color;
                    $scope.chartConfig.yAxis.labels.style.color = color;
                    $scope.chartConfig.yAxis.title.style.color = color;
                    $scope.chartConfig.options.legend.labelFormatter = function () {
                        return '<div style="font-size:18px;color:' + color + '">' + this.name + '</div>';
                    };
                };

                /**
                 * 选择图表主题颜色
                 * @param color
                 */
                $scope.chooseChartFLColor = function (color) {
                    $scope.chartElement.content.options.lineColor = color;
                    if ($scope.chartElement.content.type === 'pie') {
                        $scope.chartConfig.options.legend.itemStyle.color = color;
                    } else {
                        $scope.changeChartFLColor(color);
                    }
                    return;
                };

                /**
                 * 撤销操作
                 *
                 */
                $scope.cancel = function () {
                    if ($scope.movementList.length === 0) {
                        return;
                    }
                    $scope.$broadcast('noRefresh');
                    var moveEle = $scope.movementList.pop();
                    if (moveEle.movementType === 'element') {
                        $scope.templateData[moveEle.templateNum].content[moveEle.elementData.key] = moveEle.elementData;
                        $scope.chooseTemplate(moveEle.templateNum);
                        $scope.selectedElement = $scope.selectedTemplate.content[moveEle.elementData.key];
                    } else if (moveEle.movementType === 'template') {
                        $scope.templateData = moveEle.templateData;
                        $scope.projectMusic = moveEle.music;
                        $scope.chooseTemplate(moveEle.templateNum);
                    }
                };

                /**
                 * 取消添加模板
                 */
                $scope.cancelAddTemplate = function () {
                    if ($scope.preAddingTemplate) {
                        $scope.cancel();
                    }
                    $scope.showModelView = false;
                    $scope.preAddingTemplate = false;
                    $scope.inAddingTemplate = false;
                    $scope.preIdx = null;
                };

                /**
                 * 点击页面空白处
                 * @param t
                 */
                $scope.onWhiteBgTap = function (t) {
                    if (t.target.getAttribute('dataType') === 'whitebg') {
                            $scope.selectedElement = {
                                type: 'bg'
                            };
                            $scope.selectedElementNum = null;
                            if ($scope.showModelView) {
                                $scope.cancelAddTemplate();
                            }
                            if ($scope.showChartEditView) {
                                $scope.closeCharEditView();
                            }
                            $scope.showVideoView = false;
                            $scope.showModelView = false;
                            $scope.showPicView = false;
                            $scope.showShapeView = false;
                            $scope.showBgColorView = false;
                            $scope.showTextColorView = false;
                            $scope.borderColorView = false;
                            $scope.changingShape = false;
                            $scope.changingImg = false;
                            $scope.changingVideoPic = false;
                            $scope.changingVideo = false;
                            $scope.showMusicView = false;
                            $scope.formColorView = false;
                            $scope.help = false;
                            $scope.changingBg = false;
                            $scope.showButtonView = false;
                            $scope.showSiteView = false;
                    }
                };

                /**
                 * 打开模板界面
                 */
                $scope.openModelView = function () {
                    $scope.showModelView = true;
                };

                /**
                 * 选择模板种类
                 * @param t
                 */
                $scope.chooseTemplateclass = function (t) {
                    $scope.templateClass = t;
                };

                /**
                 * 增加模板
                 */
                $scope.addTemplate = function () {
                    $scope.showModelView = false;
                    $scope.preAddingTemplate = false;
                    $scope.inAddingTemplate = false;
                    $scope.preIdx = null;
                    $scope.modelName = null;
                };


                /**
                 * 生成唯一form id
                 * @param len
                 * @param radix
                 * @returns {string}
                 */
                $scope.uuid = function (len, radix) {
                    var chars = CHARS, uuid = [], i;
                    radix = radix || chars.length;
                    for (i = 0; i < len; i++) {
                        uuid[i] = chars[0 | Math.random() * radix];
                    }
                    return uuid.join('');
                };

                /**
                 * 模板预览
                 * @param type 类型
                 * @param index 索引
                 */
                $scope.preAddTemplate = function (type, index) {
                    if (index !== $scope.preIdx || type !== $scope.modelName) {
                        $scope.changeTemplate = true;
                        if($scope.isMoreThan()){
                            return;
                        }
                        $scope.inAddingTemplate = true;
                        var o;
                        $scope.preIdx = index;
                        $scope.modelName = type;
                        switch (type) {
                            case 'allModel':
                                o = $scope.clone($scope.allModelData[index].content);
                                break;
                            case 'modelOne':
                                o = $scope.clone($scope.modelOneData[index].content);
                                break;
                            case 'modelTwo':
                                o = $scope.clone($scope.modelTwoData[index].content);
                                break;
                            case 'modelThree':
                                o = $scope.clone($scope.modelThreeData[index].content);
                                break;
                            case 'modelFour':
                                o = $scope.clone($scope.modelFourData[index].content);
                                o.type = 'form';
                                break;
                            case 'chartModel':
                                o = $scope.clone($scope.allChartModel[index].content);
                                break;
                            case 'userModel':
                                o = $scope.clone($scope.userModelData[index].content);
                                break;
                        }
                        if (o.type === 'form') {
                            if (o.content[o.content.length - 1].type === 'eleform') {
                                o.content[o.content.length - 1].formid = $scope.uuid(8);
                                o.content[o.content.length - 1].btn_name = '提交';
                            } else {
                                _.each(o.content, function (e) {
                                    if (e.type === 'eleform') {
                                        e.formid = $scope.uuid(8);
                                        e.btn_name = '提交';
                                    }
                                });
                            }
                        }
                        // 如果正在预览模版
                        if ($scope.preAddingTemplate) {
                            // 替换之前预览模版数据
                            $scope.templateData[$scope.selectedTemplateNum] = $scope.addTemplateProcessing(o);
                            $scope.chooseTemplate($scope.selectedTemplateNum);
                        } else {
                            $scope.$broadcast('templateChange');
                            var s = $scope.selectedTemplateNum;
                            // 加在选中模版的后面
                            $scope.templateData.splice(s + 1, 0, $scope.addTemplateProcessing(o));
                            $scope.chooseTemplate(s + 1);
                            $scope.preAddingTemplate = true;
                        }
                        $scope.templateDataProcessing('template', $scope.templateData[$scope.selectedTemplateNum]);
                    }
                };

                /**
                 * 关闭图表编辑界面
                 */
                $scope.closeCharEditView = function () {
                    if ('pie' !== $scope.chartElement.content.type) {
                        for (var t = $scope.chartElement.content.options.xAxis.categories.length - 1; t >= 0; t--) {
                            if (!$scope.chartElement.content.options.xAxis.categories[t]) {
                                $scope.chartElement.content.options.xAxis.categories.splice(t, 1);
                            }
                        }
                        for (var t = 0; t < $scope.chartElement.content.data.length; t++) {
                            var chartData = $scope.chartElement.content.data[t];
                            if (!chartData) break;
                            if (!chartData.name) {
                                $scope.chartElement.content.data.splice(t, 1);
                            }
                            for (var a = chartData.data.length - 1; a >= 0; a--) {
                                if (!chartData.data[a]) {
                                    chartData.data.splice(a, 1);
                                }
                            }
                        }
                        $scope.chartConfig.xAxis.categories = $scope.chartElement.content.options.xAxis.categories;
                        $scope.chartConfig.series = 1 == $scope.chartElement.content.multiple ? [$scope.chartElement.content.data[0]] : $scope.chartElement.content.data;
                    } else {
                        for (var t = $scope.chartElement.content.data[0].data.length - 1; t >= 0; t--) {
                            var n = $scope.chartElement.content.data[0].data;
                            if (n[t][0]) {
                                if (n[t] && !angular.isArray(n[t]))
                                    for (var a = 0; a < $scope.chartElement.content.data.length; a++) {
                                        var o = $scope.chartElement.content.data[a].data;
                                        o[t] = o[t] ? [n[t][0], o[t][1]] : [n[t][0], ''];
                                    }
                            } else
                                for (var a = 0; a < $scope.chartElement.content.data.length; a++) {
                                    var o = $scope.chartElement.content.data[a].data;
                                    o.splice(t, 1)
                                }
                        }
                        for (var i = $scope.chartElement.content.data.length - 1; i > 0; i--) {
                            for (var n = $scope.chartElement.content.data[i].data, l = n.length - 1; l >= 0; l--) {
                                $scope.chartElement.content.data[0].data[l] ? n[l][0] = $scope.chartElement.content.data[0].data[l][0] : n.splice(l, 1);
                            }
                            if (!$scope.chartElement.content.data[i].name) {
                                $scope.chartElement.content.data.splice(i, 1);
                            }
                        }
                    }
                    $scope.showChartEditView = false;
                };

                /**
                 * 切换饼状图显示
                 * @param t
                 */
                $scope.changePieDataNum = function (t) {
                    $scope.chartConfig.series[0].data = $scope.chartElement.content.data[t].data;
                };

                /**
                 * 监听不刷新事件
                 */
                $scope.$on('noRefresh', function () {
                    $scope.noRefresh = true;
                });

                /**
                 * 表单点击
                 * @param t
                 */
                $scope.onFormListTap = function (t) {
                    $scope.selectedElementNum = t;
                    $scope.selectedElement = $scope.selectedTemplate.content[$scope.selectedElementNum];
                };

                /**
                 * 表单颜色点击
                 */
                $scope.openFormColorView = function () {
                    $scope.formColorView = !$scope.formColorView;
                };

                /**
                 * 增加轮播图片（包括图集轮播图片)
                 */
                $scope.addSlide = function () {
                    var sliderEle = $scope.clone($scope.selectedElement.data[$scope.selectedElement.data.length - 1]);
                    sliderEle.picid = 'ele/PDNOWKRP9F1YO79U4QCF.png';
                    sliderEle.intop = 0;
                    sliderEle.inleft = 0;
                    sliderEle.inw = $scope.clone($scope.selectedElement.picWidth);
                    $scope.selectedElement.slideNum++;
                    $scope.selectedElement.data.splice($scope.selectedElement.slideNum, 0, sliderEle);
                };

                /**
                 * 删除轮播图片
                 */
                $scope.deleteSlide = function () {
                    if ($scope.selectedElement.data.length !== 1) {
                        $scope.selectedElement.data.splice($scope.selectedElement.slideNum, 1);
                        $scope.selectedElement.slideNum = $scope.selectedElement.slideNum - 1 < 0 ? 0 : $scope.selectedElement.slideNum - 1;
                    }
                };


                /**
                 * 切换轮播图片
                 * @param num 索引
                 */
                $scope.changeSlideDataNum = function (num) {
                    $scope.selectedElement.slideNum = num;
                };

                /**
                 * 点击轮播图片
                 * @param index 图盘索引
                 * @param key
                 */
                $scope.onSlideTap = function (index, key) {
                    $scope.showSlideTextColorView = false;
                    $scope.showSlideTitleColorView = false;
                    $scope.selectedElementNum = key;
                    $scope.selectedElement = $scope.slideData[index];
                };

                /**
                 * 打开图片库界面
                 */
                $scope.openPicView = function () {
                    $scope.addSlidersPic = false;
                    $scope.showPicView = $scope.changingImg ? true : !$scope.showPicView;
                    $scope.showShapeView = false;
                    $scope.showBgColorView = false;
                    $scope.showTextColorView = false;
                    $scope.borderColorView = false;
                    $scope.changingShape = false;
                    $scope.showMusicView = false;
                    $scope.showButtonView = false;
                    $scope.showSiteView = false;
                    //   $scope.audio.pause();
                };

                /**
                 * 更换图片
                 */
                $scope.changeImg = function () {
                    $scope.changingImg = true;
                    $scope.openPicView();
                };

                /**
                 * 更换视频
                 */
                $scope.changeVideo = function () {
                    $scope.changingVideo = true;
                    $scope.openVideoView();
                };

                /**
                 * 更换视频封面图
                 */
                $scope.changeVideoPic = function () {
                    $scope.changingVideoPic = true;
                    $scope.openPicView();
                };

                /**
                 * 更新图片元素信息
                 */
                $scope.imgUpdateEle = function (t) {
                    $scope.selectedElement.left = trueLeft;
                    $scope.selectedElement.top = trueTop;
                    $scope.selectedElement.inw = trueW / $scope.selectedElement.w * $scope.selectedElement.inw;
                    if (t) {
                        $scope.selectedElement.inh = trueH / $scope.selectedElement.h * $scope.selectedElement.inh;
                    }
                    $scope.selectedElement.inleft = trueInleft;
                    $scope.selectedElement.intop = trueIntop;
                    $scope.selectedElement.w = trueW;
                    $scope.selectedElement.h = trueH;
                };

                /**
                 * 图片四角拖拽
                 * @param t
                 */
                $scope.onImgCornerPan = function (t, sign) {
                    if (!$scope.locked) {
                        if (!isPan) {
                            thisLeft = $scope.selectedElement.left;
                            thisTop = $scope.selectedElement.top;
                            thisW = $scope.selectedElement.w;
                            thisH = $scope.selectedElement.h;
                            thisInleft = $scope.selectedElement.inleft;
                            thisIntop = $scope.selectedElement.intop;
                            isPan = true;
                        }
                        var n;
                        // 四个角拖动
                        switch (t.target.getAttribute('num')) {
                            case '1':
                                n = (-t.deltaX >= -t.deltaY * (thisH / thisW) ? -t.deltaX : -t.deltaY) / $rootScope.bgScale;
                                trueLeft = thisLeft - n;
                                trueTop = thisTop - n * (thisH / thisW);
                                break;
                            case '2':
                                n = (t.deltaX >= -t.deltaY * (thisH / thisW) ? t.deltaX : -t.deltaY) / $rootScope.bgScale;
                                trueLeft = thisLeft;
                                trueTop = thisTop - n * (thisH / thisW);
                                break;
                            case '3':
                                n = (-t.deltaX >= t.deltaY * (thisH / thisW) ? -t.deltaX : t.deltaY) / $rootScope.bgScale;
                                trueLeft = thisLeft - n;
                                trueTop = thisTop;
                                break;
                            default :
                                n = (t.deltaX >= t.deltaY * (thisH / thisW) ? t.deltaX : t.deltaY) / $rootScope.bgScale;
                                trueLeft = thisLeft;
                                trueTop = thisTop;

                        }
                        trueW = parseInt(thisW) + n;
                        trueH = parseInt(thisH) + n * (thisH / thisW);
                        trueInleft = thisInleft * (trueW / thisW);
                        trueIntop = thisIntop * (trueW / thisW);
                        $scope.imgUpdateEle(sign);
                    }
                };

                /**
                 * 拖动开始
                 */
                $scope.onBlockPanStart = function () {
                    var n = {
                        elementData: $scope.clone($scope.selectedElement),
                        templateNum: $scope.clone($scope.templateNum),
                        movementType: 'element'
                    };
                    $scope.movementList.push(n);
                };

                /**
                 * 更新形状位置大小
                 */
                $scope.shapeUpdateEle = function () {
                    $scope.selectedElement.left = trueLeft;
                    $scope.selectedElement.top = trueTop;
                    $scope.selectedElement.w = trueW;
                    $scope.selectedElement.h = trueH;
                };


                /**
                 * 形状四角拖拽
                 * @param t
                 */
                $scope.onShapeCornerPan = function (t) {
                    if (!$scope.locked) {
                        if (!isPan) {
                            thisLeft = $scope.selectedElement.left;
                            thisTop = $scope.selectedElement.top;
                            thisW = $scope.selectedElement.w;
                            thisH = $scope.selectedElement.h;
                            isPan = true;
                        }
                        // 四个角拖动
                        switch (t.target.getAttribute('num')) {
                            case '1':
                                if (parseInt(thisW) + -t.deltaX / $rootScope.bgScale <= 0 || parseInt(thisH) + -t.deltaY / $rootScope.bgScale <= 0)
                                    return;
                                trueLeft = thisLeft - -t.deltaX / $rootScope.bgScale;
                                trueTop = thisTop - -t.deltaY / $rootScope.bgScale;
                                trueW = parseInt(thisW) + -t.deltaX / $rootScope.bgScale;
                                trueH = parseInt(thisH) + -t.deltaY / $rootScope.bgScale;
                                break;
                            case '2':
                                if (parseInt(thisW) + t.deltaX / $rootScope.bgScale <= 0 || parseInt(thisH) + -t.deltaY / $rootScope.bgScale <= 0)
                                    return;
                                trueLeft = thisLeft;
                                trueTop = thisTop - -t.deltaY / $rootScope.bgScale;
                                trueW = parseInt(thisW) + t.deltaX / $rootScope.bgScale;
                                trueH = parseInt(thisH) + -t.deltaY / $rootScope.bgScale;
                                break;
                            case '3':
                                if (parseInt(thisW) + -t.deltaX / $rootScope.bgScale <= 0 || parseInt(thisH) + t.deltaY / $rootScope.bgScale <= 0)
                                    return;
                                trueLeft = thisLeft - -t.deltaX / $rootScope.bgScale;
                                trueTop = thisTop;
                                trueW = parseInt(thisW) + -t.deltaX / $rootScope.bgScale;
                                trueH = parseInt(thisH) + t.deltaY / $rootScope.bgScale;
                                break;
                            default :
                                if (parseInt(thisW) + t.deltaX / $rootScope.bgScale <= 0 || parseInt(thisH) + t.deltaY / $rootScope.bgScale <= 0)
                                    return;
                                trueLeft = thisLeft;
                                trueTop = thisTop;
                                trueW = parseInt(thisW) + t.deltaX / $rootScope.bgScale;
                                trueH = parseInt(thisH) + t.deltaY / $rootScope.bgScale;

                        }
                        $scope.shapeUpdateEle();
                    }
                };

                /**
                 * 更新元素信息
                 */
                $scope.updateEle = function () {
                    $scope.selectedElement.left = trueLeft;
                    $scope.selectedElement.top = trueTop;
                    $scope.selectedElement.w = trueW;
                    $scope.selectedElement.h = trueH;
                };

                /**
                 * 拖动文本两侧缩放
                 * @param t
                 */
                $scope.onTextPan = function (t) {
                    if (!$scope.locked) {
                        if (!isPan) {
                            thisLeft = $scope.selectedElement.left;
                            thisTop = $scope.selectedElement.top;
                            thisW = $scope.selectedElement.w;
                            thisH = $scope.selectedElement.h;
                            isPan = true;
                        }
                        // 如果是左侧拉动
                        if (t.target.getAttribute('dataType') === 'left') {
                            trueW = parseInt(thisW) + 2 * -t.deltaX / $rootScope.bgScale;
                            trueLeft = thisLeft + t.deltaX / $rootScope.bgScale;
                        } else {
                            trueW = parseInt(thisW) + 2 * t.deltaX / $rootScope.bgScale;
                            trueLeft = thisLeft - t.deltaX / $rootScope.bgScale;
                        }
                        trueH = thisH;
                        trueTop = thisTop;
                        $scope.updateEle();
                    }
                };

                /**
                 * 预览
                 */
                $scope.preview = function () {
                    $scope.previewUrl = projPreviewUrl;
                    $scope.saving = false;
                    $scope.showPreview = true;
                };

                /**
                 * 鼠标悬浮元素之上
                 * @param index
                 */
                $scope.hoverEle = function (index) {
                    $scope.selectedTemplate.thisHover = index;
                };

                /**
                 * 鼠标移开元素之上
                 */
                $scope.mouseoutEle = function () {
                    $scope.selectedTemplate.thisHover = '';
                };

                /**
                 * ajax保存
                 * @param data 数据对象
                 * @param sign 区分保存预览
                 * @param auto 区分自动保存
                 */
                $scope.ajaxSave = function (data, sign, auto) {
                    if (data.pdata.json && data.pdata.json.length !== 0) {
                        var saveUrl = Config.baseUrl + '?c=admin&a=ajaxUpdateProject';
                        if ($scope.designer === '1') {
                            saveUrl += '&designer=1';
                        }
                        $.ajax({
                            type: 'post',
                            url: saveUrl,
                            data: data,
                            success: function (n) {
                                // var json = angular.fromJson(n);
                                if (n.errcode === 2) {
                                    $scope.relogin(n.url, n.errmsg);
                                    return;
                                }
                                if (n.errcode !== 1) {
                                    $scope.saving = false;
                                    if (!auto) {
                                        $scope.saveFail();
                                    }
                                    return;
                                }
                                $scope.savingTemplateData = JSON.stringify($scope.dataProcessing($scope.clone($scope.templateData)));
                                if (sign === 'save') {
                                    $scope.$apply(function () {
                                        $scope.saving = false;
                                    });
                                } else {
                                    $scope.previewUrl = projPreviewUrl;
                                    $scope.$apply(function () {
                                        $scope.saving = false;
                                        $scope.showPreview = true;
                                    });
                                }
                            },
                            error: function () {
                                $scope.saving = false;
                                if (!auto) {
                                    $scope.saveFail();
                                }
                            }
                        });
                    }
                };

                /**
                 * ajax保存
                 * @param data 数据对象
                 *
                 */
                $scope.ajaxSaveTemplate = function (data) {
                    if (data.content.length !== 0){
                        var saveUrl = Config.baseUrl + '?c=admin&a=ajaxAddMyTemplate';
                        $.ajax({
                            type: 'post',
                            url: saveUrl,
                            data: data,
                            success: function (n) {
                                // var json = angular.fromJson(n);
                                if (n.errcode === 2) {
                                    $scope.relogin(n.url, n.errmsg);
                                    return;
                                }
                                if (n.errcode !== 1) {
                                    angular.element(document.querySelector('.modal-body')).html(n.errmsg);
                                    $timeout(function () {
                                        $scope.modal.close();
                                    },1500);
                                    return;
                                }
                                // 添加创建数据时间，为删除数据依据
                                if (n.createtime) {
                                    data.createtime = n.createtime;
                                }
                                data.content = JSON.parse(data.content);
                                $scope.userModelData.unshift(data);
                                angular.element(document.querySelector('.modal-body')).html('模板保存成功');
                                $timeout(function () {
                                    $scope.modal.close();
                                },1500);
                            },
                            error: function () {
                                angular.element(document.querySelector('.modal-body')).html('模板保存失败');
                                $timeout(function () {
                                    $scope.modal.close();
                                },1500);
                            }
                        });
                    }
                };

                // 保存失败
                $scope.saveFail = function () {
                    $modal.open({
                        template: '<div class="modal-body" >亲~保存失败了 (；′⌒`) 请稍后再试哦~</div><div class="modal-footer">' +
                        '<button class="btn btn-primary" ng-click="ok()">确定</button>',
                        controller: 'ModalInstanceCtrl'
                    });
                };

                /**
                 * 关闭预览
                 */
                $scope.closePreview = function () {
                    $scope.previewUrl = '';
                    $scope.showPreview = false;
                };

                /**
                 * 复制页面
                 */
                $scope.copyTemplate = function () {
                    if ($scope.isMoreThan()) {
                        return;
                    }
                    $scope.$broadcast('templateChange');
                    var n = $scope.clone($scope.templateData[$scope.templateNum]);
                    $scope.templateData.splice($scope.templateNum, 0, n);
                    $scope.selectedTemplateNum += 1;
                    $scope.chooseTemplate($scope.selectedTemplateNum);
                };

                /**
                 * 保存项目
                 * @param sign
                 * @param auto是否为自动保存
                 */
                $scope.save = function (sign, auto) {
                    $scope.saving = true;
                    var nowData = $scope.clone($scope.templateData);
                    var proMusic = $scope.projectMusic ? {
                        name: $scope.projectMusic.name,
                        id: $scope.projectMusic.id ? $scope.projectMusic.id : null
                    } : null;
                    // 是否有变动
                    var change = true;
                    var templateData = $scope.dataProcessing(nowData);
                    if ('object' === typeof templateData) {
                        nowData = JSON.stringify(templateData);
                        // 没有变动不保存
                        if ($scope.savingTemplateData === nowData && $scope.loadingGifData === $scope.loadingGif) {
                            // 如果存在比较id
                            if ($scope.savingMusicData && $scope.projectMusic && $scope.savingMusicData.id === $scope.projectMusic.id) {
                                change = false;
                            } else if ($scope.savingMusicData === null && $scope.projectMusic === null) {
                                change = false;
                            }
                        }
                        if (!change) {
                            // 没有变动仍要预览
                            if (sign === 'preview') {
                                $scope.saving = false;
                                $scope.preview();
                            } else {
                                // 不保存也要有点击效果
                                var sav = $timeout(function () {
                                    $scope.saving = false;
                                    $timeout.cancel(sav);
                                }, 200);
                            }
                            return;
                        }
                        // 判断是否含有互动按钮
                        if ($scope.vote.data.length > 0) {
                            $scope.vote.sign = 1;
                        }
                        // 保存音乐数据
                        $scope.savingMusicData = proMusic;
                        $scope.loadingGifData = $scope.loadingGif;
                        // 数据错误
                        if (!nowData || ']' !== nowData.substr(nowData.length - 1, 1)) {
                            $scope.save();
                            return;
                        }
                        var dataObj = {};
                        // 项目id
                        dataObj.id = $scope.projectId;
                        dataObj.pdata = {
                            // 页面数据
                            json: nowData,
                            // 项目音乐
                            music: proMusic,
                            // 项目开场动画
                            loading: $scope.loadingGif ? $scope.loadingGif : '',
                            // 表单数据，没有是[]
                            form: $scope.formdata,
                            // 投票数据如不存在则值为 0;
                            vote: $scope.vote.sign,
                            // 默认字体信息为空数组
                            font:[]
                        };

                        // 表示正在保存,且非自动保存
                        if (!auto) {
                            var f, fontData = [], woffArr = [];
                            for (f in $scope.fontdata) {
                                fontData.push($scope.fontdata[f]);
                            }
                            if (fontData.length > 0) {
                                $.ajax({
                                    type: 'post',
                                    url: Config.fontUrl,
                                    data: {fonts: JSON.stringify(fontData)},
                                    async: false,
                                    success: function (n) {
                                        if (n) {
                                            _.each(n, function (e) {
                                                if (e.code === '100') {
                                                    var woffInfo = {};
                                                    woffInfo.font = e.font;
                                                    woffInfo.fontmin = e.fontmin;
                                                    woffArr.push(woffInfo);
                                                }
                                            });
                                            // 字体信息如果字体信息不存为[]
                                            dataObj.pdata.font = woffArr;
                                            $scope.ajaxSave(dataObj, sign, auto);
                                        }
                                    },
                                    error: function () {
                                        console.log('字体文件请求失败');
                                    }
                                });
                            } else {
                                $scope.ajaxSave(dataObj, sign, auto);
                            }
                        }
                    }
                };
                // 定时保存项目（3分钟）
                $interval(function () {
                    $scope.save('save', 'auto');
                }, 18e4);

                /**
                 * 图片导入到资源库
                 */
                $scope.importPic = function (url) {
                    var fileName = url.substring(url.lastIndexOf('\/') + 1, url.length);
                    $.ajax({
                        type: 'get',
                        url: Config.mediaUpload,
                        data: {
                            url: url,
                            flag: 1,
                            fileName: fileName
                        },
                        success: function (data) {
                            if (data && data.errcode === 1) {
                                $scope.msgConfirm('导入图片库成功');
                                // 更新我上传的图片的显示数据
                                $scope.myUploadingImg.unshift({id: data.url, name: fileName, picid: data.picid});
                            }
                        },
                        error: function () {
                            $scope.msgConfirm('图片导入失败，请重试～');
                        }
                    });
                };
                /**
                 * 点击上传按钮操作
                 */
                $scope.inputOpen = function () {

                    //var input =  angular.element('.drop-psd-input');
                  //  input.click();
                };

                /**
                 * 显示psd上传界面
                 */

                $scope.showPsdUploadView = function() {
                    $scope.psdUploadingImg = [];
                    $('.icon-add,.advice,.drop-psd-input').show();
                    $('.updaed-logo,.loaded-button,.updating-logo, .updating-lading, .loading-tip').hide();
                    angular.element('.psd-title').text('点击上传或将PSD文件拖动到这里');
                    $('#psdModel').modal('show');
                };

                /**
                 * 关闭上传界面
                 */

                $scope.closePsdView = function() {
                    if (!$scope.psdUploading) {
                        $('#psdModel').modal('hide');
                    }

                };
                /**
                 * 添加psd图片元素
                 */
                $scope.addPsdImg = function () {
                        $scope.$broadcast('templateChange');
                         var psdCount = $scope.psdUploadingImg.length;
                            _.each($scope.psdUploadingImg, function(imgEle) {
                                if (imgEle.picid) {
                                    $scope.selectedTemplate.content.push(imgEle);
                                    $scope.imgData.push(imgEle);
                                    if (!--psdCount) {
                                        $scope.$apply(function () {
                                            $scope.templateDataProcessing('template', $scope.selectedTemplate);
                                        });
                                    }
                                } else {
                                    --psdCount;
                                }
                            });
                };
                /**
                 * 网格行数
                 * @returns {Array}
                 */
                $scope.rowsNum = function () {
                    var rowsNum = [];
                    var rows = Math.ceil(1008 *0.574 / 10);
                    for (var i = 0; i < rows; i++) {
                        rowsNum[i] = i;
                    }
                    return rowsNum;
                };
                /**
                 * 网格列数
                 * @returns {Array}
                 */
                $scope.colsNum = function () {
                    var colsNum = [];
                    var cols = Math.ceil(640 /20);
                    for (var i = 0; i < cols; i++) {
                        colsNum[i] = 20 * i;
                    }
                    return colsNum;
                };

                /**
                 * 显示/隐藏网格
                 */
                $scope.operWanggeView = function(e) {
                    var n = e || event;
                    var target = $(n.target);
                    if (target.hasClass('icon-wangge')) {
                        $scope.showWangge = $scope.showWangge ? false : true;
                    }
                };

                /**
                 *
                 */
                $scope.closeWangge = function(e) {
                    var n = e || event;
                    var target = $(e.target);
                    if (!target.closest($('.icon-wangge')).length) {
                        $scope.showWangge = false;
                    }
                };

                /**
                 * 网格显示与控制
                 */
                $scope.operCankao = function () {
                    $scope.showCankao = !$scope.showCankao;
                };

                /**
                 * 吸附线显示域控制
                 */
                $scope.operReferLine = function () {
                    $scope.showReferLine = !$scope.showReferLine;
                };

                /**
                 * 添加计时器对象(正计时或者倒计时)
                 */
                $scope.addTimer = function(timer) {
                    if (timer.class !== 'none') {
                        $scope.selectedElement.timer = {
                            name:timer.class,
                            startVal: timer.class === 'countDown' ? 10 : 0,
                            con:timer.name
                        };
                        if (timer.class === 'countDown' && !$scope.selectedElement.timerToPage) {
                            $scope.selectedElement.timerToPage = '0';

                        } else if ($scope.selectedElement.timerToPage && timer.class === 'timeKeeper') {

                            delete $scope.selectedElement.timerToPage;
                        }
                        $scope.selectedTemplate.pan = 'no';
                    } else {
                        $scope.selectedTemplate.pan = 'yes';
                        $scope.selectedElement.timer = '';
                    }
                    $scope.selectedElement.timerEndPage = [];
                    $scope.defaultTimer = timer;
                };

                /**
                 * 设置计时结束页面
                 * @param index
                 */
                $scope.selectTimerPage = function (index) {
                    if ($.isArray($scope.selectedElement.timerEndPage)) {
                        var pos = $.inArray(index, $scope.selectedElement.timerEndPage);
                        if (pos > -1) {
                            $scope.selectedElement.timerEndPage.splice(pos, 1);
                            return;
                        }
                    } else {
                        $scope.selectedElement.timerEndPage = [];
                    }
                    $scope.selectedElement.timerEndPage.push(index);
                };
                /**
                 * 正计时选择框选择元素多选框是否选中
                 * @param index
                 * @returns {boolean}
                 */
                $scope.isTimerChecked = function (index) {
                    if($.inArray(index, $scope.selectedElement.timerEndPage) > -1) {
                        return true;
                    }
                    return false;
                };
                /**
                 *是否显示半透明浮层
                 */
                $scope.showFloat = function () {
                   $scope.selectedTemplate.showFloat = !$scope.selectedTemplate.showFloat;
                };
                /**
                 * 切换嵌入网址页面是否超过一屏属性
                 */
                $scope.changeOverScreen = function() {
                    if ($scope.selectedElement.moreThanOneScreen === 'on') {
                        $scope.selectedTemplate.moreThanOneScreen = 'off';
                    } else {
                        $scope.selectedElement.moreThanOneScreen = 'on';
                    }
                }
             }]).
        controller('ModalInstanceCtrl', ['$rootScope', '$scope', '$modalInstance', function ($rootScope, $scope, $modalInstance) {
            $scope.ok = function () {
                $modalInstance.close();
            };
            $scope.sure = function () {
                $rootScope.openReloginMsg = false;
                $modalInstance.close();
            };
            $scope.delete = function () {
                $modalInstance.close(true);
            };
            $scope.cancel = function () {
                $modalInstance.close(false);
            };
            $scope.update = function () {
            };
            $scope.closeWindow = function () {
                $modalInstance.close('close');
            };
            $scope.toProjectPage = function () {
                $modalInstance.close('toProjectPage');
            };
        }]);
})();
