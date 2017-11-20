/**
 * @Author: 坤鹏
 * @Date: 2015/12/28 14:50
 * @description: city.js.js
 * @Last Modified by:   **
 * @Last Modified time:
 */
define('src/cityList/city', ['jquery'], function (require) {
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
    // 渠道输入
    var $sourceTxt = $('#sourceTxt'),
        $source = $('#source'),
        txtRegx = /^[a-zA-Z0-9]+$/;
    $sourceTxt.on('input', function () {
        var sTxt = $sourceTxt.val();
        if (sTxt.length <= 15) {
            $source.html(sTxt);
        } else {
            $sourceTxt.val(sTxt.substring(0, 15));
        }
    }).on('blur', function () {
        var sTxt = $sourceTxt.val();
        if (sTxt && !txtRegx.test(sTxt)) {
            alert('渠道名不能为空且不能包含英文、数字以外字符~');
            $sourceTxt.val(sTxt.replace(/[^a-zA-Z]/g, ''));
            $source.html($sourceTxt.val());
            return false;
        }
    });

    // 集团选择
    var $channelclickdom = $('.channelclickdom'),
        $channel = $('#channel');
    $channelclickdom.on('click', function () {
        var me = $(this);
        $channelclickdom.removeClass('active');
        me.addClass('active');
        $channel.html(me.html()).attr('data-channel', me.attr('data-channel').split(',')[1]);
    });

    // 城市选择
    var $cnCity = $('.cityclickdom'),
        $city = $('#city');
    $cnCity.on('click', function () {
        var me = $(this),
            arr = me.attr('data-cncity').split(',');
        $cnCity.removeClass('active');
        me.addClass('active');
        $city.html(arr[0]).attr('data-city', arr[1]);
    });
    // 确认跳转
    var $btnSure = $('#btnSure');
    // http://h5admin.test.fang.com/?c=admin&a=pcpreview&id=nocopy42de5ea580539313e3ad7aac6b&t=p&f=index

    // ajax请求函数封装
    // 来自pc预览页 设置项目信息
    function setProjectMessage(channelText, cityText, sourceText) {
        $.ajax({
            url: vars.pcSite,
            type: 'get',
            dataType: 'json',
            data: {
                c: 'admin',
                a: 'ajaxUpdateProject',
                share: 'set',
                groups: channelText,
                city: cityText,
                source: sourceText,
                id: vars.projectID
            },
            success: function (data) {
                if (parseInt(data.errcode) === 1) {
                    alert('设置成功~');
                    window.location.href = vars.burl;
                } else {
                    // 提交失败
                }
            },
            error: function () {
                alert('请求失败，请检查网络状态~');
            }
        });
    }

    // 来自首页 设置用户信息
    function setUserMessage(channelText, cityText, sourceText) {
        $.ajax({
            url: vars.pcSite,
            type: 'get',
            dataType: 'json',
            data: {
                c: 'admin',
                a: 'ajaxUpdateUserSetting',
                groups: channelText,
                city: cityText,
                source: sourceText
            },
            success: function (data) {
                if (parseInt(data.errcode) === 1) {
                    alert('设置成功~');
                    window.location.href = vars.pcSite + '?c=admin&a=index';
                } else {
                    // 提交失败
                }
            },
            error: function () {
                alert('请求失败，请检查网络状态~');
            }
        });
    }

    $btnSure.on('click', function () {
        var sourceText = $source.html(),
            channelText = $channel.attr('data-channel'),
            cityText = $city.attr('data-city');
        if (!cityText) {
            alert('城市不能为空~');
            return false;
        } else if (!channelText) {
            alert('集团不能为空~');
            return false;
        } else if (!sourceText) {
            if (confirm('渠道信息未填写，确认提交？')) {
                if (vars.from === 'preview') {
                    setProjectMessage(channelText, cityText, sourceText);
                } else {
                    setUserMessage(channelText, cityText, sourceText);
                }
            }
        }else if (vars.from === 'preview') {
            setProjectMessage(channelText, cityText, sourceText);
        }else {
            setUserMessage(channelText, cityText, sourceText);
        }
    });
    // 初始化信息已选择信息
    // 城市初始化
    if (vars.cityState) {
        $cnCity.each(function (index,element) {
            var cityArr = $(element).attr('data-cncity').split(',');
            if (vars.cityState === cityArr[1]) {
                $(element).addClass('active');
                $city.html(cityArr[0]).attr('data-city',cityArr[1]);
                return false;
            }
        });
    }
    // 集团初始化
    if (vars.channelState) {
        $channelclickdom.each(function (index,element) {
            var channelArr = $(element).attr('data-channel').split(',');
            if (vars.channelState === channelArr[1]) {
                $(element).addClass('active');
                $channel.html(channelArr[0]).attr('data-channel',channelArr[1]);
                return false;
            }
        });
    }
    // 渠道初始化
    if (vars.sourceState) {
        $sourceTxt.val(vars.sourceState);
        $source.html(vars.sourceState);
    }
});