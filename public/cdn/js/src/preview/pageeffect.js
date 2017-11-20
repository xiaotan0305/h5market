/**
 * Created by liyy on 2015/8/31.
 * @Last Modified by:   tankunpeng
 * @Last Modified time: 2015/10/19
 */
define('pageeffect', ['jquery', 'snabbt'], function (require) {
    'use strict';
    var snabbt = require('snabbt');
    var pageeffect = {
        getLeaveEffect: function (effect, ele) {
            var n = null;
            var inH = window.innerHeight;
            var inW = window.innerWidth;
            if (effect) {
                switch (effect) {
                    case 'cubedown':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, inH / 2],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            fromScale: [1, 1],
                            fromOpacity: 1,
                            rotation: [Math.PI / 2, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'toup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            fromScale: [1, 1],
                            fromOpacity: 1,
                            position: [0, -inH, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'moveup':case 'pushup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            fromScale: [1, 1],
                            fromOpacity: 1,
                            position: [0, -inH, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'flipup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            fromScale: [1, 1],
                            fromOpacity: 1,
                            rotation: [Math.PI / 2, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'news':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            fromOpacity: 1,
                            rotation: [0, 0, 5 * Math.PI],
                            scale: [0.6,0.6],
                            opacity: 0,
                            manual: true,
                            easing: 'ease',
                            duration: 700
                        });
                        break;
                    case 'scaleup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 1,
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [0.6,0.6],
                            opacity: 0,
                            manual: true,
                            easing: 'ease',
                            duration: 500
                        });
                        break;
                    case 'carouup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 1,
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            position: [0, -inH, 0],
                            scale: [0.6,0.6],
                            manual: true,
                            easing: 'ease',
                            duration: 500
                        });
                        break;
                    case 'fall':
                        n = snabbt(ele,{
                            transformOrigin: [-inW / 2, -inH / 2, 0],
                            fromOpacity: 1,
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            position: [0, inH, 0],
                            rotation: [0, 0, -0.3],
                            manual: true,
                            easing: 'ease',
                            duration: 800
                        });
                        break;
                    default:
                        n = snabbt(ele,{
                            position: [0, -inH, 0],
                            fromPosition: [0, 0, 0],
                            scale: [1, 1],
                            rotation: [0, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;

                }
            }
            return n;
        },
        getEntryEffect: function (effect, ele) {
            var n = null;
            var inH = window.innerHeight;
            if (effect) {
                switch (effect) {
                    case 'cubedown':
                        n = snabbt(ele,{
                            fromRotation: [-Math.PI / 2, 0, 0],
                            fromPosition: [0, 0, 0],
                            fromScale: [1, 1],
                            fromOpacity: 1,
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            transformOrigin: [0, 0, inH / 2],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'toup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            fromScale: [1, 1],
                            fromOpacity: 1,
                            position: [0, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'moveup':case 'pushup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, inH, 0],
                            position: [0, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'flipup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            fromRotation: [-Math.PI / 2, 0, 0],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            manual: true,
                            easing: 'easeIn',
                            duration: 500,
                            delay: 400
                        });
                        break;
                    case 'news':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 0,
                            fromScale: [0.6,0.6],
                            fromRotation: [0, 0, 5 * Math.PI],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [1, 1],
                            opacity: 1,
                            manual: true,
                            easing: 'ease',
                            duration: 700,
                            delay: 1e3
                        });
                        break;
                    case 'scaleup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 0,
                            fromScale: [1.2, 1.2],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [1, 1],
                            opacity: 1,
                            manual: true,
                            easing: 'ease',
                            duration: 500
                        });
                        break;
                    case 'carouup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 1,
                            fromScale: [0.9,0.9],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            position: [0, 0, 0],
                            scale: [1, 1],
                            manual: true,
                            easing: 'ease',
                            duration: 500
                        });
                        break;
                    default:
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            fromOpacity: 1,
                            scale: [1, 1],
                            manual: true,
                            easing: 'easeIn',
                            duration: 500
                        });
                        break;
                }
            }
            return n;
        },
        getOutEffect: function (effect, ele) {
            var n = null;
            var inH = window.innerHeight;
            if (effect) {
                switch (effect) {
                    case 'cubedown':
                        n = snabbt(ele,{
                            fromPosition: [0, 0, 0],
                            scale: [1, 1],
                            fromRotation: [0, 0, 0],
                            rotation: [-Math.PI / 2, 0, 0],
                            transformOrigin: [0, 0, inH / 2],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'toup':
                        n = snabbt(ele,{
                            position: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            rotation: [0, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'moveup':case 'pushup':
                        n = snabbt(ele,{
                            position: [0, inH, 0],
                            fromPosition: [0, 0, 0],
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            rotation: [0, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'flipup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            rotation: [Math.PI / 2, 0, 0],
                            manual: true,
                            easing: 'easeIn',
                            duration: 500
                        });
                        break;
                    case 'news':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 1,
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 5 * Math.PI],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [0.6,0.6],
                            opacity: 0,
                            manual: true,
                            easing: 'ease',
                            duration: 700
                        });
                        break;
                    case 'scaleup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 1,
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [1.2, 1.2],
                            opacity: 0,
                            manual: true,
                            easing: 'ease',
                            duration: 500
                        });
                        break;
                    default:
                        n = snabbt(ele,{
                            fromPosition: [0, 0, 0],
                            fromRotation: [0, 0, 0],
                            position: [0, 0, 0],
                            scale: [1, 1],
                            rotation: [0, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                }
            }
            return n;
        },
        getBackEffect: function (effect, ele) {
            var n = null;
            var inH = window.innerHeight;
            if (effect) {
                switch (effect) {
                    case 'cubedown':
                        n = snabbt(ele,{
                            fromRotation: [Math.PI / 2, 0, 0],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            transformOrigin: [0, 0, inH / 2],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'toup':
                        n = snabbt(ele,{
                            position: [0, 0, 0],
                            fromPosition: [0, -inH, 0],
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            rotation: [0, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'moveup':case 'pushup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromPosition: [0, -inH, 0],
                            fromScale: [1, 1],
                            fromRotation: [0, 0, 0],
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    case 'flipup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromScale: [1, 1],
                            fromRotation: [-Math.PI / 2, 0, 0],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            manual: true,
                            easing: 'easeIn',
                            duration: 500,
                            delay: 400
                        });
                        break;
                    case 'news':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 0,
                            fromScale: [0.6,0.6],
                            fromRotation: [0, 0, 5 * Math.PI],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [1, 1],
                            opacity: 1,
                            manual: true,
                            easing: 'ease',
                            duration: 700,
                            delay: 1e3
                        });
                        break;
                    case 'scaleup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 0,
                            fromScale: [0.6,0.6],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [1, 1],
                            opacity: 1,
                            manual: true,
                            easing: 'ease',
                            duration: 500
                        });
                        break;
                    case 'carouup':
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromOpacity: 1,
                            fromScale: [0.6,0.6],
                            fromRotation: [0, 0, 0],
                            fromPosition: [0, -inH, 0],
                            position: [0, 0, 0],
                            scale: [1, 1],
                            manual: true,
                            easing: 'linear',
                            duration: 500
                        });
                        break;
                    default:
                        n = snabbt(ele,{
                            transformOrigin: [0, 0, 0],
                            fromPosition: [0, -inH, 0],
                            fromRotation: [0, 0, 0],
                            fromOpacity: 1,
                            fromScale: [1, 1],
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: [1, 1],
                            manual: true,
                            easing: 'linear',
                            duration: 800
                        });
                        break;
                }
            }
            return n;
        }
    };
    return pageeffect;
});