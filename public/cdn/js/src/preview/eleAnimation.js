/**
 * Created by liyingying on 15/12/7.
 * @Last Modified by:   tankunpeng
 * @Last Modified time: 2016/1/12
 */
define('eleAnimation', ['snabbt'], function (require) {
    'use strict';
    var snabbt = require('snabbt');
    var vars = seajs.data.vars;
    var eleAnimation = {

        /**
         * 获取动画配置
         * @param ele 当前元素
         * @param action 动画效果对象
         * @returns {*} 配置数组
         */
        getAnimations: function (ele, action) {
            var n = parseInt(ele.element.height() ? ele.element.height() : 200);
            var i = parseInt(ele.element.width() ? ele.element.width() : 200);
            var animations;
            switch (action.show) {
                case 'zoomIn':
                    animations = [{
                        fromScale: [0.8, 0.8],
                        scale: [1, 1],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'zoomInDown':
                    animations = [{
                        fromScale: [0.5, 0.5],
                        scale: [1, 1],
                        fromPosition: [0, -500, 0],
                        position: [0, 0, 0],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: 0.7 * action.speed
                    }];
                    break;
                case 'expandOpen':
                    animations = [{
                        fromScale: [1.8, 1.8],
                        scale: [0.95, 0.95],
                        easing: 'ease',
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.4 * action.speed)
                    }];
                    break;
                case 'fadeIn':
                    animations = [{
                        fromScale: [0.5, 0.5],
                        scale: [1, 1],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        scale: [0.9, 0.9],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'fadeInNormal':
                    animations = [{
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'fadeInUp':
                    animations = [{
                        fromPosition: [0, n, 0],
                        position: [0, 0, 0],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'fadeInDown':
                    animations = [{
                        fromPosition: [0, -n, 0],
                        position: [0, 0, 0],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'fadeInRight':
                    animations = [{
                        fromPosition: [i, 0, 0],
                        position: [0, 0, 0],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'fadeInLeft':
                    animations = [{
                        fromPosition: [-i, 0, 0],
                        position: [0, 0, 0],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'moveUp':
                    animations = [{
                        fromPosition: [0, n, 0],
                        position: [0, 0, 0],
                        fromOpacity: 1,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'moveDown':
                    animations = [{
                        fromPosition: [0, -n, 0],
                        position: [0, 0, 0],
                        fromOpacity: 1,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'moveRight':
                    animations = [{
                        fromPosition: [-i, 0, 0],
                        position: [0, 0, 0],
                        fromOpacity: 1,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'moveLeft':
                    animations = [{
                        fromPosition: [i, 0, 0],
                        position: [0, 0, 0],
                        fromOpacity: 1,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'rotateIn':
                    animations = [{
                        fromRotation: [0, 0, Math.PI],
                        rotation: [0, 0, 0],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: action.speed
                    }];
                    break;
                case 'rotateInDownLeft':
                    animations = [{
                        fromRotation: [0, 0, Math.PI / 4],
                        rotation: [0, 0, 0],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'linear',
                        transformOrigin: [-i / 2, n / 2, 0],
                        duration: action.speed
                    }];
                    break;
                case 'rotateInDownRight':
                    animations = [{
                        fromRotation: [0, 0, -Math.PI / 4],
                        rotation: [0, 0, 0],
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'linear',
                        transformOrigin: [i / 2, n / 2, 0],
                        duration: action.speed
                    }];
                    break;
                case 'flipInY':
                    animations = [{
                        fromRotation: [0, Math.PI / 2, 0],
                        rotation: [0, 20 * -Math.PI / 180, 0],
                        fromOpacity: 0.4,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: parseInt(0.7 * action.speed)
                    }, {
                        fromRotation: [0, 20 * -Math.PI / 180, 0],
                        rotation: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.3 * action.speed)
                    }];
                    break;
                case 'flipInX':
                    animations = [{
                        fromRotation: [Math.PI / 2, 0, 0],
                        rotation: [20 * -Math.PI / 180, 0, 0],
                        fromOpacity: 0.4,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: parseInt(0.7 * action.speed)
                    }, {
                        fromRotation: [20 * -Math.PI / 180, 0, 0],
                        rotation: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.3 * action.speed)
                    }];
                    break;
                case 'lightSpeedIn':
                    animations = [{
                        fromSkew: [0, -Math.PI / 6],
                        skew: [0, 20 * Math.PI / 180],
                        fromOpacity: 0.4,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        fromPosition: [i, 0, 0],
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        skew: [0, 5 * -Math.PI / 180],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        skew: [0, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'slideRight':
                    animations = [{
                        fromPosition: [parseInt(-1.5 * i), 0, 0],
                        position: [parseInt(0.08 * i), 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        position: [parseInt(-0.04 * i), 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'slideLeft':
                    animations = [{
                        fromPosition: [parseInt(1.5 * i), 0, 0],
                        position: [parseInt(-0.08 * i), 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        position: [parseInt(0.04 * i), 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'slideDown':
                    animations = [{
                        fromPosition: [0, parseInt(-1 * n), 0],
                        position: [0, parseInt(0.08 * n), 0],
                        easing: 'ease',
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        position: [0, parseInt(-0.04 * n), 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'slideUp':
                    animations = [{
                        fromPosition: [0, parseInt(n), 0],
                        position: [0, parseInt(-0.08 * n), 0],
                        easing: 'ease',
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        position: [0, parseInt(0.04 * n), 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'stretchRight':
                    animations = [{
                        fromScale: [0.3, 1],
                        scale: [1.02, 1],
                        easing: 'ease',
                        transformOrigin: [-1.2 * i, 0, 0],
                        duration: parseInt(0.4 * action.speed)
                    }, {
                        scale: [0.98, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        scale: [1.01, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'stretchLeft':
                    animations = [{
                        fromScale: [0.3, 1],
                        scale: [1.02, 1],
                        easing: 'ease',
                        transformOrigin: [1.2 * i, 0, 0],
                        duration: parseInt(0.4 * action.speed)
                    }, {
                        scale: [0.98, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        scale: [1.01, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'pullUp':
                    animations = [{
                        fromScale: [1, 0.3],
                        scale: [1, 1.02],
                        easing: 'ease',
                        transformOrigin: [0, n / 2, 0],
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        scale: [1, 0.99],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                case 'pullDown':
                    animations = [{
                        fromScale: [1, 0.3],
                        scale: [1, 1.02],
                        easing: 'ease',
                        transformOrigin: [0, -n / 2, 0],
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        scale: [1, 0.99],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;

            /**
             * 场间动画选项配置
             * @param case  动画名称
             * @param animations 动画效果配置选项数组
             * @returns {*} 配置数组
             */

                // 向左旋转
                case 'rotateLeft':
                    animations = [{
                        fromRotation: [0, 0, 0],
                        rotation: [0, 0, Math.PI],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.8 * action.speed)
                    }];
                    break;
                // 向右旋转
                case 'rotateRight':
                    animations = [{
                        fromRotation: [0, 0, 0],
                        rotation: [0, 0, -Math.PI],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.8 * action.speed)
                    }];
                    break;
                // 弹出
                case 'bounceIn':
                    animations = [{
                        fromScale: [0.5, 0.5],
                        scale: [1, 1],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 0,
                        opacity: 1,
                        easing: 'ease',
                        duration: parseInt(0.6 * action.speed)
                    }, {
                        scale: [0.9, 0.9],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                // 摇晃
                case 'wobble':
                    animations = [{
                        position: [parseInt(-0.25 * i), 0, 0],
                        rotation: [0, -Math.PI * 5 / 180, 0],
                        easing: 'linear',
                        duration: parseInt(0.15 * action.speed)
                    }, {
                        position: [parseInt(0.2 * i), 0, 0],
                        rotation: [0, Math.PI * 3 / 180, 0],
                        easing: 'linear',
                        duration: parseInt(0.15 * action.speed)
                    }, {
                        position: [parseInt(-0.15 * i), 0, 0],
                        rotation: [0, -Math.PI * 3 / 180, 0],
                        easing: 'linear',
                        duration: parseInt(0.15 * action.speed)
                    }, {
                        position: [parseInt(0.1 * i), 0, 0],
                        rotation: [0, Math.PI * 2 / 180, 0],
                        easing: 'linear',
                        duration: parseInt(0.15 * action.speed)
                    }, {
                        position: [parseInt(-0.05 * i), 0, 0],
                        rotation: [0, -Math.PI / 180, 0],
                        easing: 'linear',
                        duration: parseInt(0.15 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        rotation: [0, 0, 0],
                        easing: 'linear',
                        duration: parseInt(0.25 * action.speed)
                    }];
                    break;
                // 摆动
                case 'swing':
                    animations = [{
                        rotation: [0, 0, Math.PI * -15 / 180],
                        transformOrigin: [0, -n, 0],
                        easing: 'linear',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        rotation: [0, 0, Math.PI * -10 / 180],
                        transformOrigin: [0, -n, 0],
                        easing: 'linear',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        rotation: [0, 0, Math.PI * 5 / 180],
                        transformOrigin: [0, -n, 0],
                        easing: 'linear',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        rotation: [0, 0, Math.PI * -5 / 180],
                        transformOrigin: [0, -n, 0],
                        easing: 'linear',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        rotation: [0, 0, 0],
                        transformOrigin: [0, -n, 0],
                        easing: 'linear',
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                // 抖动
                case 'shake':
                    animations = [{
                        position: [-10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [-10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [-10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [-10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [-10, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }];
                    break;
                // 果冻
                case 'jello':
                    animations = [{
                        skew: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.11 * action.speed)
                    }, {
                        skew: [-Math.PI * 12.5 / 180, -Math.PI * 12.5 / 180, 0],
                        easing: 'ease',
                        duration: parseInt(0.11 * action.speed)
                    }, {
                        skew: [Math.PI * 6.25 / 180, Math.PI * 6.25 / 180, 0],
                        easing: 'ease',
                        duration: parseInt(0.11 * action.speed)
                    }, {
                        skew: [-Math.PI * 3.125 / 180, -Math.PI * 3.125 / 180, 0],
                        easing: 'ease',
                        duration: parseInt(0.11 * action.speed)
                    }, {
                        skew: [Math.PI * 1.5625 / 180, Math.PI * 1.5625 / 180, 0],
                        easing: 'ease',
                        duration: parseInt(0.11 * action.speed)
                    }, {
                        skew: [-Math.PI * 0.78125 / 180, -Math.PI * 0.78125 / 180, 0],
                        easing: 'ease',
                        duration: parseInt(0.11 * action.speed)
                    }, {
                        skew: [Math.PI * 0.390625 / 180, Math.PI * 0.390625 / 180, 0],
                        easing: 'ease',
                        duration: parseInt(0.11 * action.speed)
                    }, {
                        skew: [-Math.PI * 0.1953125 / 180, -Math.PI * 0.1953125 / 180, 0],
                        easing: 'ease',
                        duration: parseInt(0.11 * action.speed)
                    }, {
                        skew: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.12 * action.speed)
                    }];
                    break;
                // 弹跳(缺少贝塞尔曲线控制)
                case 'bounce':
                    animations = [{
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        position: [0, -120, 0],
                        easing: 'ease',
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        position: [0, -120, 0],
                        easing: 'ease',
                        duration: parseInt(0.03 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.27 * action.speed)
                    }, {
                        position: [0, -16, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }];
                    break;
                // 闪烁
                case 'flash':
                    animations = [{
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }, {
                        fromOpacity: 0,
                        opacity: 1,
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }, {
                        fromOpacity: 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }, {
                        fromOpacity: 0,
                        opacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }];
                    break;
                // 脉冲
                case 'pulse':
                    animations = [{
                        fromScale: [1, 1],
                        scale: [1.05, 1.05],
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }, {
                        fromScale: [1.05, 1.05],
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }, {
                        fromScale: [1, 1],
                        scale: [1.05, 1.05],
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }, {
                        fromScale: [1.05, 1.05],
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }];
                    break;
                // 橡皮筋
                case 'rubberBand':
                    animations = [{
                        fromScale: [1, 1],
                        scale: [1.25, 0.75],
                        easing: 'ease',
                        duration: parseInt(0.3 * action.speed)
                    }, {
                        fromScale: [1.25, 0.75],
                        scale: [0.75, 1.25],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        fromScale: [0.75, 1.25],
                        scale: [1.15, 0.85],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        fromScale: [1.15, 0.85],
                        scale: [0.95, 1.05],
                        easing: 'ease',
                        duration: parseInt(0.15 * action.speed)
                    }, {
                        fromScale: [0.95, 1.05],
                        scale: [1.05, 0.95],
                        easing: 'ease',
                        duration: parseInt(0.1 * action.speed)
                    }, {
                        fromScale: [1.05, 0.95],
                        scale: [1, 1],
                        easing: 'ease',
                        duration: parseInt(0.25 * action.speed)
                    }];
                    break;
                // 浮动
                case 'floating':
                    animations = [{
                        position: [0, 0.4 * n, 0],
                        easing: 'ease',
                        duration: parseInt(0.5 * action.speed)
                    }, {
                        position: [0, 0, 0],
                        easing: 'ease',
                        duration: parseInt(0.5 * action.speed)
                    }];
                    break;

            /**
             * 出场动画选项配置
             * @param case  动画名称
             * @param animations 动画效果配置选项数组
             * @returns {*} 配置数组
             */
                // 淡出
                case 'fadeOut':
                    animations = [{
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.8 * action.speed)
                    }];
                    break;
                // 放大淡出
                case 'zoomFadeOut':
                    animations = [{
                        fromScale: [1, 1],
                        scale: [1.3, 1.3],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.5 * action.speed)
                    }, {
                        fromOpacity: 0,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.5 * action.speed)
                    }];
                    break;
                // 缩小淡出
                case 'zoomOut':
                    animations = [{
                        fromScale: [1, 1],
                        scale: [0.3, 0.3],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.5 * action.speed)
                    }, {
                        fromOpacity: 0,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.5 * action.speed)
                    }];
                    break;
                // 向右飞出
                case 'fadeOutRight':
                    animations = [{
                        fromPosition: [0, 0, 0],
                        position: [i, 0, 0],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.8 * action.speed)
                    }];
                    console.log(animations);
                    break;
                // 向左飞出
                case 'fadeOutLeft':
                    animations = [{
                        fromPosition: [0, 0, 0],
                        position: [-i, 0, 0],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.5 * action.speed)
                    }];
                    break;
                // 向上飞出
                case 'fadeOutUp':
                    animations = [{
                        fromPosition: [0, 0, 0],
                        position: [0, -n, 0],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.8 * action.speed)
                    }];
                    break;
                // 向下飞出
                case 'fadeOutDown':
                    animations = [{
                        fromPosition: [0, 0, 0],
                        position: [0, n, 0],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.5 * action.speed)
                    }];
                    break;
                // 向右滚出
                case 'rotateOutUpRight':
                    animations = [{
                        fromRotation: [0, 0, 0],
                        rotation: [0, 0, -Math.PI / 4],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'linear',
                        transformOrigin: [-i / 2, n / 2, 0],
                        duration: parseInt(0.8 * action.speed)
                    }];
                    break;
                // 向左滚出
                case 'rotateOutUpLeft':
                    animations = [{
                        fromRotation: [0, 0, 0],
                        rotation: [0, 0, Math.PI / 4],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'linear',
                        transformOrigin: [-i / 2, n / 2, 0],
                        duration: parseInt(0.8 * action.speed)
                    }];
                    break;
                // 掉落
                case 'hinge':
                    animations = [{
                        fromRotation: [0, 0, 0],
                        rotation: [0, 0, -Math.PI * 80 / 180],
                        easing: 'easeIn',
                        transformOrigin: [-i / 2, -n / 2, 0],
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        fromRotation: [0, 0, -Math.PI * 80 / 180],
                        rotation: [0, 0, -Math.PI * 60 / 180],
                        easing: 'easeIn',
                        transformOrigin: [-i / 2, -n / 2, 0],
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        fromRotation: [0, 0, -Math.PI * 60 / 180],
                        rotation: [0, 0, -Math.PI * 80 / 180],
                        easing: 'easeIn',
                        transformOrigin: [-i / 2, -n / 2, 0],
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        fromRotation: [0, 0, -Math.PI * 60 / 180],
                        rotation: [0, 0, -Math.PI * 80 / 180],
                        easing: 'easeIn',
                        transformOrigin: [-i / 2, -n / 2, 0],
                        duration: parseInt(0.2 * action.speed)
                    }, {
                        fromPosition: [0, 0, 0],
                        position: [0, 700, 0],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'easeIn',
                        transformOrigin: [-i / 2, -n / 2, 0],
                        duration: parseInt(0.2 * action.speed)
                    }];
                    break;
                // 旋转消失
                case 'rotateOut':
                    animations = [{
                        fromRotation: [0, 0, 0],
                        rotation: [0, 0, -Math.PI * 200 / 180],
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 1,
                        opacity: 0,
                        easing: 'ease',
                        duration: parseInt(0.8 * action.speed)
                    }];
                    break;
                default:
                    animations = [{
                        fromOpacity: typeof ele.data.opacity === 'number' ? ele.data.opacity : 0,
                        opacity: 1
                    }];
            }
            return animations;
        },

        /**
         * 获取图集动画
         * @param ele 当前元素
         * @returns {{}} 返回调整后的动画对象
         */
        getEffect: function (ele) {
            var t = {};
            // 区分项目还是模板
            if (ele.data.animations) {
                t.show = ele.data.animation.show;
                t.delay = ele.data.animation.delay * 1000;
                t.speed = ele.data.animation.speed * 1000;
            } else {
                t.show = ele.data.show;
                t.delay = ele.data.delay * 1000;
                t.speed = ele.data.speed * 1000;
            }
            if (!t.show) {
                t = false;
            }
            return t;
        },

        /**
         * 获取入场动画
         * @param ele 当前元素
         * @returns {{}} 返回调整后的动画对象
         */
        getInEffect: function (ele) {
            var t = {};
            // 区分项目还是模板
            if (ele.data.animations) {
                t.show = ele.data.animations.animationIn.show;
                t.delay = ele.data.animations.animationIn.delay;
                t.speed = ele.data.animations.animationIn.speed;
            } else {
                t.show = ele.data.show;
                t.delay = ele.data.delay;
                t.speed = ele.data.speed;
            }
            if (!t.show) {
                t = false;
            }
            return t;
        },

        /**
         * 获取场间动画
         * @param ele 当前元素
         * @returns {{}} 返回调整后的动画对象
         */
        getOnEffect: function (ele) {
            var t = {};
            // 区分项目还是模板
            if (ele.data.animations) {
                t.show = ele.data.animations.animationOn.show;
                t.delay = ele.data.animations.animationOn.delay;
                t.speed = ele.data.animations.animationOn.speed;
                t.loop = ele.data.animations.animationOn.frequency;
            } else {
                // 模板默认无场间动画
                t.show = '';
                t.delay = '';
                t.speed = '';
                t.loop = '';
            }
            if (!t.show || t.show === 'noeffect') {
                t = false;
            }
            return t;
        },

        /**
         * 获取出场动画
         * @param ele 当前元素
         * @returns {{}} 返回调整后的动画对象
         */
        getOutEffect: function (ele) {
            var t = {};
            // 区分项目还是模板
            if (ele.data.animations) {
                t.show = ele.data.animations.animationOut.show;
                t.delay = ele.data.animations.animationOut.delay;
                t.speed = ele.data.animations.animationOut.speed;
            } else {
                // 模板默认无出场动画
                t.show = '';
                t.delay = '';
                t.speed = '';
            }
            if (!t.show || t.show === 'noeffect') {
                t = false;
            }
            return t;
        },

        /**
         * 执行单个元素动画
         * @param ele 目标元素
         */
        actAnimation: function (ele) {
            var effect = {};
            effect.in = this.getInEffect(ele);
            effect.on = this.getOnEffect(ele);
            effect.out = this.getOutEffect(ele);
            if (effect.in) {
                var n = ele.element[0];
                ele.elementout.hide();
                var animations = {};
                // 执行入场动画
                animations.in = this.getAnimations(ele, effect.in);
                animations.in[0].startCallback = function () {
                    ele.elementout.show();
                    // 判断当前显示的元素是否为iframe
                    if (ele.eletype === 'site') {
                        // 发布事件
                        seajs.emit('showSite');
                    }
                };
                animations.in[0].delay = effect.in.delay > 300 ? parseInt(effect.in.delay - 300) : 0;
                var o = snabbt(n, animations.in[0]);
                for (var a = 1; a < animations.in.length; a++) {
                    o.snabbt(animations.in[a]);
                }
                // 执行场间动画
                if (effect.on) {
                    animations.on = this.getAnimations(ele, effect.on);
                    animations.on[0].delay = effect.on.delay > 300 ? parseInt(effect.on.delay - 300) : 0;
                    var loop = effect.on.loop ? effect.on.loop : 0;
                    while (loop > 0) {
                        for (var b = 0; b < animations.on.length; b++) {
                            o.snabbt(animations.on[b]);
                        }
                        loop--;
                        // 执行完第一次后取消delay
                        animations.on[0].delay = 0;
                    }
                }
                // 执行出场动画
                if (effect.out) {
                    animations.out = this.getAnimations(ele, effect.out);
                    animations.out[0].startCallback = function () {
                        ele.elementout.show();
                    };
                    animations.out[0].callback = function () {
                        ele.elementout.hide();
                    };
                    animations.out[0].delay = effect.out.delay > 300 ? parseInt(effect.out.delay - 300) : 0;
                    for (var c = 0; c < animations.out.length; c++) {
                        o.snabbt(animations.out[c]);
                    }
                }
            } else {
                ele.elementout.show();
            }
        },
        /**
         * 停止动画效果
         * @param ele 目标元素
         */
        stopAnimation: function (ele) {
            snabbt(ele.element[0], 'stop');
            ele.elementout.hide();
        }
    };
    return eleAnimation;
});
