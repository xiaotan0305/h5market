/**
 * Created by liyy on 2015/11/11
 */
(function () {
    'use strict';
    var $ = window.$;
    var bgpicData = [];
    var picData = [];
    var slideData = [];
    var musicData = {};
    var dataObj = {};
    var saveData = {};
    var picServer = 'http://img1.maka.im/';
    var picServer1 = 'http://img2.maka.im/';
    var musicServer = 'http://m.maka.mobi/maka/app/gfile/public/music/getcdn?get=id/';
    var musicServer1 = 'http://m1.maka.im/';
    var dataUrl = '';
    var floatDiv = $('#float'),
        single = $('#single'),
        many = $('#many'),
        templateType = $('#templateType'),
        templateId = $('#templateId'),
        templateCover = $('#templateCover'),
        templateName = $('#templateName'),
        templateCate = $('#templateCate'),
        templateSource = $('#templateSource'),
        coverConText = $('.coverConText'),
        singleType = $('#singleType');
    floatDiv.height($(window).height());
    // 切换模版类型
    templateType.on('change', function () {
        var ele = $(this);
        // 单页模版
        if (ele.val() === '1') {
            single.show();
            many.hide();
        } else {
            single.hide();
            many.show();
        }
    });
    // 切换项目类型
    templateSource.on('change', function () {
        var ele = $(this);
        // 单页模版
        if (ele.val() === '1') {
            coverConText.show();
        } else {
            coverConText.hide();
        }
    });

    /**
     * 保存模版
     * @param data
     * @param sign true ：单页模版 false：组模版
     * @param sign true ：单页模版 false：组模版
     */
    var saveMultiTemplate = function (data, sign) {
        // 保存模板到数据库
        $.ajax({
            url: sign ? '?c=admin&a=ajaxOperationTemplate' : '?c=admin&a=ajaxOperationMultiTemplate',
            method: 'post',
            data: data,
            success: function (result) {
                floatDiv.hide();
                if (result.errcode === 1) {
                    alert('成功');
                } else {
                    alert('插入数据库失败');
                }
                console.log(result);
                floatDiv.hide();
            },
            error: function () {
                floatDiv.hide();
                alert('插入数据库失败');
            }
        });
    };

    $('#add').click(function () {
        bgpicData = [];
        picData = [];
        slideData = [];
        musicData = {};
        dataObj = {};
        saveData = {};
        var trueVal = $.trim(templateId.val());
        if (templateSource.val() === '2') {
            dataUrl = '?c=admin&a=ajaxPickSysTpl&project';
            saveData.projectId = trueVal;
            saveData.tplType = templateCate.val();
            // 保存图片数据
            $.ajax({
                url: dataUrl,
                method: 'post',
                data: saveData,
                success: function (result) {
                    if (result.errcode !== 1) {
                        floatDiv.hide();
                        alert('导入数据失败');
                        return;
                    } else {
                        alert('成功');
                    }
                    console.log(result);
                }
                });
        }else {
            // 获取数据的url
            if (trueVal.indexOf('http://') > -1) {
                dataUrl = trueVal;
            } else if (trueVal.indexOf('T_') > -1) {
                dataUrl = 'http://json.maka.im/api/storeTemplate/' + trueVal + '?dataType=pdata';
            } else {
                dataUrl = 'http://www.maka.im/api/event/' + trueVal + '?dataType=all';
            }
            floatDiv.show();
            $.ajax({
                url: dataUrl,
                method: 'get',
                success: function (result) {
                    var template = JSON.parse(result);
                    if (template.code !== 200) {
                        floatDiv.hide();
                        alert('获取数据失败');
                        return;
                    }
                    if (template.data && template.data.pdata && template.data.pdata.json && template.data.pdata.json.length) {
                        var card = template.data.pdata.json;
                        for (var i = 0, l = card.length; i < l; i++) {
                            var page = card[i];
                            if (page.bgpic) {
                                bgpicData.push({
                                    index: i,
                                    url: page.bgpic.indexOf('http:') > -1 ? page.bgpic : 'http:' + page.bgpic
                                });
                            }
                            if (page.elementData) {
                                if (page.elementData.imgData) {
                                    for (var s = 0, sl = page.elementData.imgData.length; s < sl; s++) {
                                        page.elementData.imgData[s].con = '';
                                    }
                                }
                                if (page.elementData.slideData) {
                                    for (var o = 0, ol = page.elementData.slideData.length; o < ol; o++) {
                                        page.elementData.slideData[o].con = '';
                                    }
                                }
                                if (page.elementData.buttonData) {
                                    for (var p = 0, pl = page.elementData.buttonData.length; p < pl; p++) {
                                        page.elementData.buttonData[p].url = 'm.fang.com';
                                    }
                                }
                                if (page.elementData.pButtonData) {
                                    for (var r = 0, rl = page.elementData.pButtonData.length; r < rl; r++) {
                                        page.elementData.pButtonData[r].url = 'm.fang.com';
                                    }
                                }

                            }

                            for (var j = 0, cl = page.content.length; j < cl; j++) {
                                var ele = page.content[j];
                                if (ele.elementAnimations) {
                                    ele.show = ele.elementAnimations.animation_in.show;
                                    ele.speed = ele.elementAnimations.animation_in.speed;
                                    ele.delay = ele.elementAnimations.animation_in.delay;
                                }
                                switch (ele.type) {
                                    case 'pic':
                                        ele.con = '';
                                        if (ele.picid) {
                                           if (ele.picid.indexOf(picServer1) > -1) {
                                              console.log(ele.picid);
                                            }
                                            picData.push({
                                                pi: i,
                                                ci: j,
                                                url: ((ele.picid.indexOf(picServer) === -1 && ele.picid.indexOf('http://') === -1)? picServer : '') + ele.picid
                                            });
                                        }
                                        break;
                                    case 'slide':
                                        if (ele.data) {
                                            for (var v = 0, vl = ele.data.length; v < vl; v++) {
                                                var slide = ele.data[v].picid;
                                                if (slide) {
                                                    slideData.push({
                                                        pi: i,
                                                        ci: j,
                                                        di: v,
                                                        url: (slide.indexOf(picServer) === -1 ? picServer : '') + slide
                                                    });
                                                }
                                            }
                                        }
                                        break;
                                    case 'btn':
                                    case 'pButton':
                                        ele.url = 'm.fang.com';
                                }
                            }
                        }
                        // 带音乐模版
                        if (template.data.pdata.music && template.data.pdata.music.length) {
                            $.extend(true, musicData, template.data.pdata.music);
                            if (musicData.id.trim().toLowerCase().indexOf('http://') === 0 || musicData.id.trim().toLowerCase().indexOf('https://') === 0) {
                                musicServer = '';
                            } else if (musicData.id.indexOf('/') > -1) {
                                musicServer = musicServer1;
                            }
                            musicData.url = musicServer + musicData.id;
                            musicData.id = new Date().getTime();
                            dataObj.musicData = musicData;
                        }
                        saveData.content = card;
                        dataObj.picData = picData;
                        dataObj.bgpicData = bgpicData;
                        dataObj.slideData = slideData;
                        console.log(JSON.stringify(dataObj));
                        // 保存图片数据
                        $.ajax({
                            url: '?c=admin&a=ajaxAddTemplateMedia',
                            method: 'post',
                            data: dataObj,
                            success: function (result) {
                                if (result.errcode !== 1) {
                                    floatDiv.hide();
                                    alert('保存图片失败');
                                    return;
                                }
                                console.log('保存图片' + result);
                                var pages = saveData.content;
                                if (result.musicData.id && result.musicData.id !== '000') {
                                    var musicObj = result.musicData[0];
                                    saveData.music = JSON.stringify({id: musicObj.id, name: musicObj.name});
                                }
                                if (result.picData) {
                                    // 切换元素图片地址
                                    for (var m = 0, ml = result.picData.length; m < ml; m++) {
                                        var picEle = result.picData[m];
                                        console.log('pi:' + picEle.pi + ',ci:' + picEle.ci);
                                        pages[picEle.pi].content[picEle.ci].picid = picEle.url;
                                    }
                                }
                                if (result.slideData) {
                                    // 切换元素图片地址
                                    for (var e = 0, el = result.slideData.length; e < el; e++) {
                                        var slideEle = result.slideData[e];
                                        pages[slideEle.pi].content[slideEle.ci].data[slideEle.di].picid = slideEle.url;
                                    }
                                }
                                if (result.bgPicData) {
                                    // 切换元素背景图片地址
                                    for (var n = 0, nl = result.bgPicData.length; n < nl; n++) {
                                        var bgpicEle = result.bgPicData[n];
                                        pages[bgpicEle.index].bgpic = bgpicEle.url;
                                    }
                                }
                                console.log(saveData);
                                // 单页模版
                                if (templateType.val() === '1') {
                                    for (var s = 0, sl = saveData.content.length; s < sl; s++) {
                                        saveMultiTemplate({
                                            content: JSON.stringify(saveData.content[s]),
                                            cover: templateCover.val(),
                                            type: singleType.val()
                                        }, true);
                                    }
                                } else {
                                    // 组模版
                                    saveData.content = JSON.stringify(saveData.content);
                                    saveData.cover = templateCover.val();
                                    saveData.name = templateName.val();
                                    // 保存模板类型
                                    saveData.tplType = templateCate.val();
                                    saveMultiTemplate(saveData);
                                }
                            },
                            error: function () {
                                alert('插入图片失败');
                                floatDiv.hide();
                            }
                        });
                    }
                },
                error: function () {
                    alert('获取数据失败');
                    floatDiv.hide();
                }
            });
        }
        });

})();

