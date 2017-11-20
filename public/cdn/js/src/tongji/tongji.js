/**
 * @Author: 坤鹏
 * @Date: 2016/02/14
 * @description: tongji.js
 * @Last Modified by:  tankunpeng
 * @Last Modified time:
 */
define('src/tongji/tongji', ['jquery'], function (require) {
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
    // 集团、类型、开始日期、结束日期
    var channel = $('#channel'),
        tongjiType = $('#tongjiType'),
        beginTime = $('#beginTime'),
        overTime = $('#overTime');

    // 指定默认日期
    document.getElementById('beginTime').valueAsDate = new Date();
    document.getElementById('overTime').valueAsDate = new Date();

    // 确认跳转
    var btnSure = $('#btnSure');

    $('.getMsg').on('change', function () {
        if (channel.val() && tongjiType.val() && beginTime.val() && overTime.val()) {
            btnSure.css('backgroundColor','#DF3031').attr('data-open','1');
        }else {
            btnSure.css('backgroundColor','#ccc').attr('data-open','0');
        }
    });

    var noMsg = $('#noMsg');
    var liebiao = $('#liebiao');
    var loading = $('#loading');

    /**
     * 显示提示信息
     * @param content 要显示的内容文本 string
     */
    function showMsg(content) {
        liebiao.html('');
        noMsg.addClass('shake').html(content).show();
        setTimeout(function () {
            noMsg.removeClass('shake');
        },1000);
    }

    // 初始化
    if (vars.jituan) {
        channel.find('option[value=' + vars.jituan + ']').attr('selected','selected').siblings().removeAttr('selected');
    }
    if (vars.leixing) {
        tongjiType.find('option[value=' + vars.leixing + ']').attr('selected','selected').siblings().removeAttr('selected');
    }
    if (vars.kaishi) {
        beginTime.val(vars.kaishi);
    }
    if (vars.jieshu) {
        overTime.val(vars.jieshu);
    }
    btnSure.on('click', function () {
        var isOpen = btnSure.attr('data-open') | 0;
        if (!isOpen) {
            liebiao.html('').hide();
            showMsg('请完善统计选项...');
            return false;
        }
        var beginTimeStamp = new Date(beginTime.val()).getTime(),
            overTimeStamp = new Date(overTime.val()).getTime(),
            timeDay = (overTimeStamp - beginTimeStamp) / 1000 / 3600 / 24;

        if (!channel.val()) {
            showMsg('集团不能为空~');
            return false;
        }else if (!tongjiType.val()) {
            showMsg('统计类型不能为空~');
            return false;
        }else if (!beginTimeStamp) {
            showMsg('开始日期不能为空或不完整~');
            return false;
        }else if (!overTimeStamp) {
            showMsg('结束日期不能为空或不完整~');
            return false;
        }else if (beginTimeStamp > overTimeStamp) {
            showMsg('开始日期不能大于结束日期~');
            return false;
        // 时间间隔不超过一个月
        } else if (timeDay > 31) {
            showMsg('时间间隔不能超过一个月~');
            return false;
        }
        liebiao.html('');
        noMsg.hide();
        loading.show();
        $.ajax({
            url: vars.pcSite + '?c=admin&a=ajaxTongjiData',
            type: 'GET',
            data: {
                group: channel.val(),
                flag: tongjiType.val(),
                begin: beginTime.val(),
                end: overTime.val()
            },
            success: function (data) {
                setTimeout(function () {
                    loading.hide();
                    if (data) {
                        liebiao.html(data).show();
                    }else {
                        showMsg('您选择的时间段无统计信息~');
                    }
                },1500);
            },
            error: function (data) {
                console.log(data);
                loading.hide();
                showMsg('获取数据失败~');
            }
        });
    });
});