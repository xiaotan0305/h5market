/**
 * @Author: 坤鹏
 * @Date: 2016/03/01
 * @description: form.js
 * @Last Modified by:  tankunpeng
 * @Last Modified time:
 */
define('src/form/form', ['jquery'], function (require) {
    'use strict';
    var $ = require('jquery');
    var vars = seajs.data.vars;
    // 获取隐藏域参数
    $('input[type=hidden]').each(function (index, element) {
        vars[element.id] = element.value;
    });

    // 回到顶部
    var $goTop = $('#showgohead'),
        $win = $(window);
    $('body,html').animate({scrollTop: 0}, 500);
    $win.on('scroll', function () {
        if ($(document).scrollTop() > $win.height() * 2 - 60) {
            $goTop.show();
        } else {
            $goTop.hide();
        }
    });
    $goTop.on('click', function () {
        $('body,html').animate({scrollTop: 0}, 500);
    });
});