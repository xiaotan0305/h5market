/**
 * Created by shanliang on 2015/10/15
 */
define('src/index/main', ['jquery', ''], function (require) {
    'use strict';
    var $ = require('jquery');
    var listLiQr = $('.list_li_qr');
    var thispid = '';
    var pcSite = $('#pcSite').val() || '';
    var phoneSite = $('#phoneSite').val() || '';
    var previewIframe = $('#previewIframe');
    var city = $('#city').val() || '';
    var groups = $('#groups').val() || '';
    // 浮层
    var floating = $('#floating');
    var tishi = $('#tishi');
    var pvuv = $('#pvuv');
    // 大浮层
    var bigBg = $('#bg');
    // 模板li
    var modelLeft = $('#modelLeft');
    // 模板大盒子
    var modelContent = $('#modelContent'),
        modelLoading = $('#modelLoading');

    // 城市集团渠道设置提示
    setTimeout(function () {
        if (!city || !groups) {
            floating.css({
                top: '55px',
                opacity: '0'
            }).show();
            tishi.show();
        }
    }, 1500);
    var closeMsg = $('#closeMsg');
    closeMsg.on('click',function () {
        floating.css({
            top: '0',
            opacity: '0.8'
        }).hide();
        tishi.hide();
        city = true;
        groups = true;
    });

    /* 增加上下按钮控制start */
    var nextPage = $('#nextPage');
    var prePage = $('#prePage');
    require.async('plugin/jquery.lazyload.min', function () {
        $('img[data-original]').lazyload();
    });
    function backtologin(data) {
        var a = document.createElement('a');
        a.setAttribute('href', data.url);
        a.setAttribute('target', '_blank');
        a.setAttribute('id', 'camnpr');
        a.click();
    }

    nextPage.on('click', function () {
        var iframeWin = previewIframe[0].contentWindow;
        if (iframeWin.isLoad) {
            iframeWin.editorCard.nextpage();
        } else {
            alert('请等待加载完成');
        }
    });
    prePage.on('click', function () {
        var iframeWin = window.frames['previewFrame'];
        if (iframeWin.isLoad) {
            iframeWin.editorCard.prevpage();
        } else {
            alert('请等待加载完成');
        }
    });

    /* 增加上下按钮控制end */

    listLiQr.on('mouseover', function () {
        var qrcodedom = $(this).parent().find('.list_li_qrcode');
        var qrcodeimg = qrcodedom.find('.list_li_qrimg');
        if (qrcodeimg.attr('src') == '') {
            var qrcodesrc = qrcodeimg.attr('data-src');
            qrcodeimg.attr('src', qrcodesrc);
        }
        qrcodedom.show();
    });
    listLiQr.on('mouseout', function () {
        $(this).parent().find('.list_li_qrcode').hide();
    });
    // 新建项目
    $('#newpro').on('click', function () {
        if (city && groups) {
            modelContent.show();
            var firstli = modelLeft.find('li').first();
            firstli.find('img').addClass('active');
            firstli.find('p').addClass('pactive');
            var pid = firstli.attr('pid');
            thispid = pid;
            previewIframe.attr('src', phoneSite + '?c=web&a=index&id=' + pid + '&t=m');
            bigBg.show();
        }
    });
    // 项目点击预览
    modelLeft.on('click', 'li', function () {
        var me = $(this);
        modelLeft.find('img').removeClass('active');
        modelLeft.find('p').removeClass('pactive');
        me.find('img').addClass('active');
        me.find('p').addClass('pactive');
        var pid = me.attr('pid');
        thispid = pid;
        previewIframe.attr('src', phoneSite + '?c=web&a=index&id=' + pid + '&t=m');
    });
    // 鼠标滑过显示项目名称
    modelLeft.on('mouseover','li', function() {
        var me = $(this);
        setTimeout(function () {
            me.find('.text-box').css('display','table');
        },100);
    }).on('mouseout', 'li', function(){
        var me = $(this);
        setTimeout(function () {
            me.find('.text-box').hide();
        },100);
    });
    // 关闭模板选择弹层
    $('#close').on('click', function () {
        modelLeft.find('img').removeClass('active');
        previewIframe.attr('src', '');
        bigBg.fadeOut(300);
    });
    // 项目删除
    $('.list_cover_delbtn').on('click', function () {
        if (city && groups) {
            if (confirm('如果删除后，将会无法复原，是否继续？')) {
                var pid = $(this).parent().parent().attr('pid');
                $.get(pcSite + '?c=admin&a=ajaxDelProjectById&id=' + pid, function (data) {
                    if (data.errcode === 0) {
                        alert(data.errmsg);
                    } else if (data.errcode === 2) {
                        alert(data.errmsg);
                        backtologin(data);
                    } else {
                        location.reload();
                    }
                });
            }
        }
    });
    // 项目下线
    $('.list_li_offlinebtn').on('click', function () {
        if (city && groups) {
            var pid = $(this).parent().parent().attr('pid');
            var that = this;
            $.get(pcSite + '?c=admin&a=ajaxChangeProjectStatusById', {id: pid, status: 'offline'}, function (data) {
                if (data.errcode === 0) {
                    alert(data.errmsg);
                } else if (data.errcode === 2) {
                    alert(data.errmsg);
                    backtologin(data);
                } else {
                    $(that).attr('class', 'list_li_onlinebtn').html('上线');
                    location.reload();
                }
            });
        }
    });
    // 项目上线
    $('.list_li_onlinebtn').on('click', function () {
        if (city && groups) {
            var pid = $(this).parent().parent().attr('pid');
            var that = this;
            $.get(pcSite + '?c=admin&a=ajaxChangeProjectStatusById', {id: pid, status: 'online'}, function (data) {
                if (data.errcode === 0) {
                    alert(data.errmsg);
                } else if (data.errcode === 2) {
                    alert(data.errmsg);
                    backtologin(data);
                } else {
                    $(that).attr('class', 'list_li_offlinebtn').html('下线');
                    location.reload();
                }
            });
        }
    });
    // 项目复制
    $('.list_li_copybtn').on('click', function () {
        if (city && groups) {
            var pid = $(this).parent().parent().attr('pid');
            $.get(pcSite + '?c=admin&a=ajaxCopyProjectById&id=' + pid, function (data) {
                if (data.errcode === 0) {
                    alert(data.errmsg);
                } else if (data.errcode === 2) {
                    alert(data.errmsg);
                    backtologin(data);
                } else {
                    location.reload();
                }
            });
        }
    });

    // pc端预览
    var list = $('#list'),
        iframefloat = $('#iframefloat'),
        iframe = $('#previewarea');
    list.on('click', '.list_cover_icon', function () {
        if (city && groups) {
            var $this = $(this),
                status = $this.attr('data-status'),
                tohref = $this.attr('data-href');
            if (status === 'online') {
                iframe.attr('src', '').attr('src', pcSite + tohref);
                floating.show();
                iframefloat.show();
            }
        }
    });

    // 展示过渡动画
    function showAdmin(option) {
        option = option || {};
        option.obj = option.obj || null;
        option.showClass = option.showClass || '';
        if (option.obj) {
            option.obj.addClass(option.showClass).show();
        }
        floating.show();
        modelLoading.addClass('spinner').show();
        option.fn && option.fn();
    }

    // 关闭过渡动画
    function closeAdmin(option) {
        option = option || {};
        option.obj = option.obj || null;
        option.showClass = option.showClass || '';
        option.closeFloat = option.closeFloat === false ? false : true;
        if (option.obj) {
            option.obj.addClass(option.showClass).show();
        }
        if (option.closeFloat) {
            floating.hide();
        }
        modelLoading.remove('spinner').hide();
        option.fn && option.fn();
    }

    // 项目流量查询
    var pvuvLis = pvuv.find('.pvuv-list li');

    /**
     * 设置PVUV值
     * @param json 流量请求数据
     */
    function setPvUvDom(json) {
        pvuvLis.each(function (index,ele) {
            var $ele = $(ele),
                id = $ele.attr('id'),
                value = json[id] || 0;
            $ele.html(value);
        })
        pvuv.show();
        closeAdmin({
            closeFloat: false
        });
    }

    $('.list_li_pvbtn').on('click', function () {
        if (city && groups) {
            var me = $(this);
            // 项目id
            var pid = me.parent().parent().attr('pid');
            // 创建时间
            var createTime = me.attr('data-time');
            // 显示过渡动画
            showAdmin();
            $.get(pcSite + '?c=admin&a=ajaxGetUvPv&startDate=' + createTime + '&projectId=' + pid, function (data) {
                // {"errcode":1,"data":{"totalUv":5,"totalPv":15,"monthUv":5,"monthPv":15,"weekUv":0,"weekPv":0,"todayUv":0,"todayPv":0},"errmsg":""}
                if (data.errcode === 0) {
                    alert(data.errmsg);
                    closeAdmin();
                } else if (data.errcode === 1) {
                    var json = data.data;
                    setPvUvDom(json);
                } else if (data.errcode === 2) {
                    alert(data.errmsg);
                    closeAdmin();
                    backtologin(data);
                } else {
                    alert('数据错误，请重新获取~');
                }
            });
        }
    });
    // 关闭浮层
    var timer = null;
    $('#btnSure').on('click', function () {
        closeAdmin({
            fn: function () {
                pvuv.removeClass().addClass('pvuv scaleDownUp');
                clearTimeout(timer);
                timer = setTimeout(function () {
                    pvuv.removeClass().addClass('pvuv scaleUpDown').hide();
                }, 1000);
            }
        });
    });

    // 项目选取进编辑页
    $('#add_new_temp').on('click', function () {
        // 增加loading动画
        showAdmin({
            fn: function () {
                modelContent.hide();
            }
        });
        $.get(pcSite + '?c=admin&a=ajaxSelectMultiTemplateToCreateNewProject&id=' + thispid, function (data) {
            if (data.errcode === 0) {
                alert(data.errmsg);
                closeAdmin({
                    fn: function () {
                        bigBg.hide();
                    }
                });
            } else if (data.errcode === 2) {
                alert(data.errmsg);
                closeAdmin({
                    fn: function () {
                        bigBg.hide();
                        backtologin(data);
                    }
                });
            } else {
                var id = data.id;
                window.location.href = pcSite + '?c=admin&a=edit&id=' + id;
            }
        });
    });

    $('#cat').on('click', 'span', function () {
        // 添加类别
        var selSpan = $(this),
            catType = selSpan.attr('type-id'),
            tmpUrl = pcSite + '?c=admin&a=ajaxSysTemplateByType&id=' + thispid + '&type=' + catType,
            urlCon = $('#modelCon'),
            conText ='',coverUrl;
        selSpan.siblings('span').removeClass('active').end().addClass('active');
        $.get(tmpUrl, function (data) {
            if (data.errcode && parseInt(data.errcode) === 1) {

                $.each(data.list, function(index, ele) {
                    if (ele.cover.indexOf('soufunimg.com') > -1) {
                        coverUrl = ele.cover;
                    } else {
                        coverUrl = imgSiteUrl +ele.cover;
                    }
                    conText += '<li pid="' + ele.id +'">';
                    conText += '<img src="'+ coverUrl +'"/>';
                    conText += '<p>' + ele.name + '</p><div class=\"text-box\"><div class=\"text-con\">'+ ele.name +'</div></div></li>';
                });

            }
            urlCon.html(conText);
        });
    });
    // 新建空白模板
    $('#add_empt_temp').on('click', function () {
        // 增加loading动画
        showAdmin({
            fn: function () {
                modelContent.hide();
            }
        });
        $.get(pcSite + '?c=admin&a=ajaxCreateNewProject', function (data) {
            if (data.errcode === 0) {
                alert(data.errmsg);
                closeAdmin({
                    fn: function () {
                        bigBg.hide();
                    }
                });
            } else if (data.errcode === 2) {
                alert(data.errmsg);
                closeAdmin({
                    fn: function () {
                        bigBg.hide();
                        backtologin(data);
                    }
                });
            } else {
                var pid = data.id;
                window.location.href = pcSite + '?c=admin&a=edit&id=' + pid;
            }
        });
    });
    // 模板编辑(需有权限)
    $('#edit_new_temp').on('click', function () {
        // 增加loading动画
        showAdmin({
            fn: function () {
                modelContent.hide();
                window.location.href = pcSite + '?c=admin&a=edit&id=' + thispid + '&designer=1';
            }
        });
    });
    // 表单导出
    $('.list_cover_count').on('click', function () {
        var pid = $(this).parent().parent().attr('pid');
        $.get(pcSite + '?c=admin&a=ajaxGetSignInfo&projectid=' + pid, function (data) {
            if (data.errcode === 0) {
                alert(data.errmsg);
            } else if (data.errcode === 2) {
                alert(data.errmsg);
                backtologin(data);
            } else {
                window.location.href = pcSite + '?c=admin&a=formInfo&id=' + pid;
            }
        });
    });
    // 增加微信转发人数、转发总次数
    $('.list_li_num').on('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var that = $(this),
            pid = that.attr('pid'),
            shareTimes = that.html(),
            title = that.next(),
            aB = title.find('b');
        $.get(pcSite + '?c=admin&a=ajaxGetWxManNum&id=' + pid, function (data) {
            if (data.errcode) {
                //that.attr('title','微信转发人数:' + data.data + '<br>微信转发次数:' + shareTimes);
                aB.eq(0).html(data.data);
                aB.eq(1).html(shareTimes);
                title.removeClass().addClass('list_li_titleNum fromTopSlow').show();
            } else if (!data.errcode) {
                if (data.errmsg) {
                    title.html(data.errmsg).css('line-height', '60px').removeClass().addClass('list_li_titleNum fromTopSlow').show();
                }
            }
            setTimeout(function () {
                title.removeClass().addClass('list_li_titleNum toTopSlow').fadeOut(700);
            }, 2000);
        });
    });

    /*
     * 增加回收站功能
     * 2015-12-25
     * */
    // 判断浏览器类型，非chorme浏览器提示下载
    var hint = $('#hint');
    window.navigator.userAgent.toLowerCase().indexOf('chrome') === -1 && hint.show();
    hint.on('click', function () {
        $(this).hide();
    });
    // 回收站页面点击恢复按钮恢复项目
    var projectGoback = $('.list_goback_icon');
    projectGoback.on('click', function () {
        var gobackId = $(this).parent().attr('pid');
        $.ajax({
            url: pcSite,
            type: 'GET',
            dataType: 'json',
            data: {
                c: 'admin',
                a: 'ajaxUpdateProject',
                status: 'recover',
                id: gobackId
            },
            success: function (data) {
                if (parseInt(data.errcode) === 1) {
                    alert('项目已恢复~');
                    window.location.reload();
                } else {
                    alert('恢复失败，请重试~');
                }
            }
        });
    });
    /**
     * 进入点赞统计页面
     * 2016-05-05
     * 谭坤鹏
     */
    $('.list_cover_dianzan').on('click', function () {
        var pid = $(this).parent().parent().attr('pid');
        $.get(pcSite + '?c=admin&a=ajaxGetSignInfo&projectid=' + pid, function (data) {
            if (data.errcode === 0) {
                alert(data.errmsg);
            } else if (data.errcode === 2) {
                alert(data.errmsg);
                backtologin(data);
            } else {
                window.location.href = pcSite + '?c=admin&a=getVoteInfo&id=' + pid;
            }
        });
    });
});