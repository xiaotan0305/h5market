/**
 * @Author: 谭坤鹏
 * @Date:   2015/10/12
 * @Description: 页面预览
 * @Last Modified by:   谭坤鹏
 * @Last Modified time: 2015/10/12
 */
define('src/PCpreview/PCpreview', ['jquery'], function (require, exports, module) {
    'use strict';
    var $ = require('jquery');
    var vars = seajs.data.vars;

    function Preview() {
        this.quickmark = $('#quickmark');
        this.nextPage = $('#nextPage');
        this.prePage = $('#prePage');
        this.iframeBox = $('#iframeBox');
        this.sendFloat = $('#sendFloat');
        this.sendContent = this.sendFloat.find('span');
        this.projectCopy = $('#projectCopy');
        this.projectUrl = $('#projectUrl');
        this.titlecContent = $('.titlecContent');
        this.initTitle = this.titlecContent.eq(0);
        this.initTitleValue = this.initTitle.val();
        this.initDescribe = this.titlecContent.eq(1);
        this.initDescribeValue = this.initDescribe.val();
        this.titleOrDescribe = 0;
        this.imgSite = $('#imgSite').val();
        this.pcSite = $('#pcSite').val();
        this.phoneSite = $('#phoneSite').val();
        // 为编辑或者选取功能
        this.editSelect = $('#editSelect');
        // 为关闭
        this.close = $('#close');
        this.toHref = $('.toHref');
        this.projectID = $('#projectID').val();
        // 设为公开按钮
        this.openBtn = $('#openProject');
        // 页面来源
        this.from = $('#from').val();
        this.setCity = $('#setCity');
        this.init();
    }

    Preview.prototype = {
        constructor: Preview,
        init: function () {
            var me = this;
            // 二维码主路径
            this.barcodeUrl = 'http://u.fang.com/qrcode.php';

            // 获取url参数
            this.getUrlJson();
            // 短网址(分享地址含统计代码)
            this.url = this.phoneSite + this.projectID + '/?city=' + vars.city + '&channel=' + vars.channel + '&source=' + vars.source;
            // 长网址(编辑地址不含统计代码)
            this.urlEdit = this.phoneSite + this.projectID + '/?city=' + vars.city + '&channel=' + vars.channel + '&source=' + vars.source + '&isPc=1';
            // 获取手机分享页面
            this.barcode = new Image();
            this.barcode.src = this.barcodeUrl + '?url=' + encodeURIComponent(this.url) + '&type=market&resize=' + '180';
            this.barcode.title = this.url;
            this.quickmark.append(this.barcode);
            this.projectUrl.val(this.url);
            // iframe 加载
            this.iframe = document.createElement('iframe');
            this.iframe.src = this.urlEdit;
            this.iframe.name = 'previewFrame';
            $(this.iframe).on('load', {m: this}, function (e) {
                var me = e.data.m;
                me.iframeLoad();
            });
            this.iframeBox.prepend(this.iframe);

            // 修改头像
            require.async('plugin/upload', function () {
                var upload = window.upload;
                new upload({
                    url: '/?c=admin&a=ajaxUploadCover',
                    imgContainer: '#upload',
                    imgUrl: '',
                    onSuccess: function (file, result, uploadBase64) {
                        var data = JSON.parse(result);
                        if (data.errcode === 2) {
                            me.showMessage(data.errmsg, 2000, function () {
                                var openLink = $('<a target="_blank"></a>');
                                openLink.attr('href', data.url);
                                openLink[0].click();
                            });
                            return;
                        } else if (!data.errcode) {
                            me.showMessage('文件上传失败(；′⌒`)');
                            return;
                        }
                        var imgUrl = data.url;
                        me.imgObject = $(this.imgContainer);
                        me.ajaxFaceModifyFn(imgUrl, me.imgObject, uploadBase64);
                    },
                    onFailure: function (file) {
                        me.showMessage('文件上传失败(；′⌒`)');
                    },
                    onProgress: function (n) {
                    },
                    filter: function (files) {
                        var arrFiles = [];
                        for (var i = 0, file; file = files[i]; i++) {
                            if (file.type.indexOf('image') == 0) {
                                if (file.size >= 1024000) {
                                    me.showMessage('文件太大啦亲，图片文件不能大于1M哦');
                                } else {
                                    arrFiles.push(file);
                                }
                            } else {
                                me.showMessage('文件格式错误啦亲');
                            }
                        }
                        return arrFiles;
                    }
                });
            });

            // 复制
            require.async('plugin/jquery.zclip.min', function () {
                me.projectCopy.zclip({
                    path: me.imgSite + 'js/plugin/ZeroClipboard.swf',
                    copy: function () {
                        return me.projectUrl.val();
                    },
                    afterCopy: function () {
                        me.showMessage('复制成功');
                    }
                });
            });

            // 修改标题描述
            this.initTitle.on('blur', function () {
                me.titleOrDescribe = 1;
                me.titDescSave(me.titleOrDescribe, this);
            });
            this.initDescribe.on('blur', function () {
                me.titleOrDescribe = 2;
                me.titDescSave(me.titleOrDescribe, this);
            });

            // 点击该跳转到编辑页或者选取公开模板跳至编辑页
            this.editSelect.on('click', function () {
                var $this = $(this);
                if (me.from === 'index') {
                    window.parent.location.href = $this.find('a').attr('data-href');
                } else {
                    $.ajax({
                        url: me.pcSite,
                        type: 'GET',
                        data: {
                            c: 'admin',
                            a: 'ajaxSelectMultiTemplateToCreateNewProject',
                            id: me.projectID,
                            from: 'open'
                        },
                        success: function (data) {
                            if (data.errcode === 2) {
                                me.showMessage(data.errmsg, 2000, function () {
                                    var openLink = $('<a target="_blank"></a>');
                                    openLink.attr('href', data.url);
                                    openLink[0].click();
                                });
                                return false;
                            } else if (data.errcode === 1) {
                                window.parent.location.href = me.pcSite + '?c=admin&a=edit&id=' + data.id;
                            } else {
                                me.showMessage(data.errmsg);
                            }
                        }
                    });
                }
            });
            // 关闭当前父级页面浮层
            var parentDoc = window.parent.document;
            this.close.on('click', function () {
                parentDoc.getElementById('floating').style.display = 'none';
                parentDoc.getElementById('iframefloat').style.display = 'none';
                parentDoc.getElementById('previewarea').src = '';
                if (vars.needReload) {
                    window.parent.location.reload();
                }
            });


            // 设置项目状态
            var openA = me.openBtn.find('a');
            me.openBtn.on('click', function () {
                var openType;
                if (~~vars.isOpen) {
                    openType = '确认取消公开?';
                } else {
                    openType = '确认公开该项目?';
                }
                if (confirm(openType)) {
                    $.ajax({
                        url: me.pcSite,
                        type: 'GET',
                        data: {
                            c: 'admin',
                            a: 'ajaxOpenProject',
                            id: me.projectID,
                            isOpen: ~~vars.isOpen ? 0 : 1
                        },
                        success: function (data) {
                            if (data.errcode === 2) {
                                me.showMessage(data.errmsg, 2000, function () {
                                    var openLink = $('<a target="_blank"></a>');
                                    openLink.attr('href', data.url);
                                    openLink[0].click();
                                });
                                return false;
                            } else if (data.errcode === 1) {
                                if (~~vars.isOpen) {
                                    me.openBtn.css('background-color', '#df3031');
                                    vars.isOpen = 0;
                                    openA.html('设置为公开');
                                    me.showMessage('设置取消公开成功');
                                } else {
                                    me.openBtn.css('background-color', '#42c2b3');
                                    vars.isOpen = 1;
                                    openA.html('项目已公开');
                                    me.showMessage('设置公开成功');
                                }
                                vars.needReload = true;
                            } else {
                                me.showMessage(data.errmsg);
                            }
                        }
                    });
                }
            });
            // 设置城市跳转
            this.setCity.on('click',function () {
                window.parent.location.href = $(this).find('a').attr('data-href');
            });
        },
        getUrlJson: function () {
            // url地址参数获取函数
            this.urlArr = window.location.search.substring(1).split('&');
            this.urlJson = {};
            this.len = this.urlArr.length;
            for (var i = 0; i < this.len; i++) {
                this.urlArr[i] = this.urlArr[i].split('=');
                this.urlJson[this.urlArr[i][0]] = this.urlArr[i][1];
            }
        },
        iframeLoad: function () {
            this.iframe = window.frames['previewFrame'];
            this.nextPage.on('click', {m: this}, function (e) {
                var me = e.data.m;
                if (me.iframe.isLoad) {
                    me.iframe.editorCard.nextpage();
                }
            });
            this.prePage.on('click', {m: this}, function (e) {
                var me = e.data.m;
                if (me.iframe.isLoad) {
                    me.iframe.editorCard.prevpage();
                }
            });
        },
        showMessage: function (content, time, fn) {
            var me = this;
            time = time || 1500;
            if (!content) {
                return;
            }
            this.sendContent.text(content);
            this.sendFloat.addClass('bar-moveFromTopSlow').show();
            setTimeout(function () {
                me.sendFloat.removeClass('bar-moveFromTopSlow').addClass('bar-moveToTopSlow');
                setTimeout(function () {
                    me.sendFloat.removeClass('bar-moveToTopSlow').hide();
                },500);
                fn && fn();
            }, time);
        },
        ajaxFaceModifyFn: function (imgUrl, oImg, upload64) {
            var me = this;
            $.ajax({
                url: this.pcSite,
                type: 'GET',
                dataType: 'json',
                data: {
                    c: 'admin',
                    a: 'ajaxUpdateCover',
                    id: this.urlJson.id,
                    imgUrl: imgUrl
                },
                success: function (data) {
                    if (parseInt(data.errcode) === 1) {
                        oImg.attr('src', upload64);
                        me.showMessage('封面修改成功', 2000);
                    } else {
                        me.showMessage(data.errmsg, 2000);
                    }
                }
            });
        },
        titDescSave: function (titDes, obj) {
            var me = this;
            if (obj.value === this.initTitleValue || obj.value === this.initDescribeValue) {
                return;
            }
            var parm = {
                a: 'ajaxUpdateProject',
                c: 'admin',
                id: this.urlJson.id
            };
            if (titDes === 1) {
                parm.name = encodeURIComponent(obj.value);
            } else if (titDes === 2) {
                parm.introduction = encodeURIComponent(obj.value);
            } else {
                return;
            }
            $.ajax({
                url: me.pcSite,
                type: 'GET',
                data: parm,
                success: function (data) {
                    if (data.errcode === 2) {
                        me.showMessage(data.errmsg, 2000, function () {
                            var openLink = $('<a target="_blank"></a>');
                            openLink.attr('href', data.url);
                            openLink[0].click();
                        });
                        return false;
                    } else if (data.errcode === 1) {
                        switch (titDes) {
                            case 1:
                                me.showMessage('标题更新成功');
                                me.initTitleValue = parm.name;
                                break;
                            case 2:
                                me.showMessage('标题描述更新成功');
                                me.initDescribeValue = parm.introduction;
                                break;
                            default :
                                break;
                        }
                    } else {
                        me.showMessage(data.errmsg);
                    }
                },
                error: function (data) {
                    console.log(data);
                }
            });
        }
    };

    return new Preview();
});