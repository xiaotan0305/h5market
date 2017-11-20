/**
 * @Author: 坤鹏
 * @Date: 2016/01/21 14:50
 * @description: open.js 公开模板页面
 * @Last Modified by:   **
 * @Last Modified time:
 */
define('src/open/open', ['jquery'], function (require) {
    'use strict';
    var $ = require('jquery');
    var vars = seajs.data.vars;
    // 获取隐藏域参数
    $('input[type=hidden]').each(function (index, element) {
        vars[element.id] = element.value;
    });
    // 加载开关(默认加载完毕)
    vars.loaded = true;
    vars.page = 1;

    var templateList = $('#templateList'),
        iframefloat = $('#iframefloat'),
        floating = $('#floating'),
        iframe = $('#previewarea');

    // 下拉加载更多
    var $win = $(window),
        $winH = $win.height(),
        $doc = $(document);
    $('body,html').animate({scrollTop: 0}, 500, function () {
        $win.on('scroll', function () {
            // console.log($(document).scrollTop(), $win.height(), $(document).height(), $doc.scrollTop() + $winH > $doc.height() - 100);
            if ($doc.scrollTop() + $winH > $doc.height() - 150) {
                if (vars.loaded) {
                    vars.loaded = false;
                    // console.log('ajax starting');
                    vars.page++;
                    $.ajax({
                        url: vars.pcSite,
                        type: 'GET',
                        data: {
                            c: 'admin',
                            a: 'ajaxGetMoreOpen',
                            page: vars.page,
                            group: vars.channel
                        },
                        success: function (data) {
                            if (data) {
                                templateList.append(data);
                                vars.loaded = true;
                            }else {
                                alert('没有更多了');
                            }
                        },
                        error: function (data) {
                            console.log(data);
                            vars.page--;
                        }
                    });
                }
            }
        });
    });

    // 预览页面
    templateList.on('click', '.StoreTemplateItem', function () {
        floating.show();
        iframe.attr('src', vars.pcSite + $(this).attr('data-url'));
        setTimeout(function () {
            iframefloat.show();
        },300);
    });

    $('#HotDesigner').on('click','.HotDesigner-item',function () {
        floating.show();
        //http://h5admin.test.fang.com/?c=admin&a=pcpreview&id=nocopy6dfa42da37870b267d7a59549b&t=p&f=open
        iframe.attr('src', vars.pcSite + '?c=admin&a=pcpreview&id=' + $(this).attr('data-id') + '&t=p&f=open');
        setTimeout(function () {
            iframefloat.show();
        },300);
    });
});