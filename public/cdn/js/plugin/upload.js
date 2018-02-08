!function (require) {
    'use strict';
    function upload(option) {
        if (option) {
            $.extend(true, this.option, option);
        }
        this.init();
    }

    upload.prototype = {
        fileFilter: [],
        option: {
            url: '/bbs/?c=bbs&a=ajaxUploadImgNew',
            // 增加图片上传node接口
            urlnode:'',
            // 添加projectId
            projectId: '',
            imgContainer: '#upload',
            imgUrl: '',
            onSuccess: function (file, result) {
            },
            onFailure: function (file) {
            },
            filter: function (files, type) {
            }
        },
        upload: function (file, uploadBase64,type) {
            var that = this;
            if(type == 'pic') {
            $.ajax({
                url: that.option.urlnode,
                method:'POST',
                data: {
                    cteateTime: new Date().getTime(),
                    name:'uploaImg' + Math.random().toString(36).substring(2),
                    projectId: that.option.projectId,
                    base64:uploadBase64
                },
                success: function (data) {
                    if (data.code !== '100') {
                        that.option.onFailure(file, data);
                    }
                    that.option.onSuccess(file, data, uploadBase64);
                },
                fail:function () {
                    that.option.onFailure(file, data);
                }
            });
        } else {
            var xhr = new XMLHttpRequest();
            if (xhr.upload) {
                xhr.upload.addEventListener("progress", function (event) {
                    var progress = Math.round(event.lengthComputable ? event.loaded * 100 / event.total : 0);
                    that.option.onProgress(progress);
                }, false);
                // 文件上传成功或是失败
                xhr.onreadystatechange = function () {
                    if (Number(xhr.readyState) === 4) {
                        if (Number(xhr.status) === 200) {
                            that.option.onSuccess(file, xhr.responseText, uploadBase64);
                        } else {
                            that.option.onFailure(file, xhr.responseText);
                        }
                    }
                };
                // 开始上传
                xhr.open(
                    // method
                    'POST',
                    // target url
                    that.option.url + '&fileName=' + file.name + '&type=' + file.type
                    // , async, default to true
                );
                var uploadType = file.type === 'audio/mp3' ? 'music' : 'pic';
                // 如果上传文件为音乐类型，则添加以下头部信息 改上传方式为二进制文件上传
                if (uploadType === 'music') {
                    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                    xhr.setRequestHeader('Content-Disposition', 'attachment; name="' + encodeURIComponent(file.name) + '"; type="' + file.type + '"');
                    if(xhr.sendAsBinary) {
                        xhr.sendAsBinary(file.getAsBinary());
                    } else {
                        xhr.send(file);
                    }
                } else {
                    var formData = new FormData();
                    formData.append(uploadType, uploadBase64);
                    xhr.send(formData);
                }
            }
        }
        },

    inputHandle: function (e) {
            e.stopPropagation();
            var self = e.data.m,
                files = e.target.files || e.dataTransfer.files;
            self.init();
            var i = 0;
            var uplodeFileType = e.target.getAttribute('accept') || 'pic';
            var files = self.option.filter(files, uplodeFileType), uploadBase64;
            var funAppendImage = function () {
                var file = files[i];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        uploadBase64 = e.target.result;

                        if (uploadBase64.indexOf('data:image') < 0 && uploadBase64.indexOf('data:audio/mp3;') < 0) {
                            alert('上传文件格式不支持');
                            return false;
                        }
                        i++;
                        self.upload(file, uploadBase64, uplodeFileType);
                        funAppendImage();
                    };
                    reader.readAsDataURL(file);
                }
            };
            funAppendImage();
        },
        init: function () {
            var $uploadInput = $('body');
            $uploadInput.off('change').on('change', 'input.uploadBtn', {
                m: this
            }, this.inputHandle);
        }
    };
    window.upload = upload;
}();