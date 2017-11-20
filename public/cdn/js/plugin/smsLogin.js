/**
 * Created by tkp on 2016/03/31.
 * @Last Modified by:   tankunpeng
 * @Last Modified time: 2016/03/31
 */
(function (w, f) {
    'use strict';
    if (typeof define === 'function') {
        define('plugin/smsLogin', ['jquery'], function (require) {
            var $ = require('jquery');
            return f($);
        });
    } else if (typeof exports === 'object') {
        module.exports = f(w);
    } else {
        if (!w.jQuery) {
            alert('请先引入jQuery');
            return;
        }
        w.smsLogin = f(w.jQuery);
    }
})(window, function ($) {
    'use strict';
    function SmsLogin() {
        this.options = {
            // 必填，且必须已注册的service
            service: 'soufun-lottery-wap',
            // 用户手机号码
            mobilephone: '',
            // 图文验证码值
            mathcode: '',
            // jsonp回调函数名称，jsonp方式，不能为空
            callback: 'callback',
            // 发送验证码的类型（0：动态登录或注册；1：动态登录；2：注册）
            operatetype: '0',
            // 发送验证码的方式（0：文字短信验证码；1：语音电话验证码）
            sendvoice: '0'
        };
        // 发送验证码接口
        this.sendUrl = 'https://passport.fang.com/loginsendmsm.api';
        // 验证验证码
        this.verifyUrl = 'https://passport.fang.com/loginverifysms.api';
        this.init();
    }

    SmsLogin.prototype = {
        constructor: SmsLogin,
        init: function () {
        },
        send: function (mobilephone, succFn, errFn) {
            var that = this;
            // 覆盖原数据
            that.options.mobilephone = mobilephone;
            $.ajax({
                type: 'GET',
                async: false,
                cache: false,
                url: that.sendUrl,
                data: that.options,
                dataType: 'jsonp',
                jsonp: that.options.callback,
                success: function (json) {
                    if (json.Message === 'Success') {
                        succFn(json);
                    } else if (json.IsSent === 'true') {
                        errFn('手机上已有两条未验证验证码，不再发送验证码！');
                    } else if (json.IsShowMathCode === 'true') {
                        // 需要图文验证码
                        that.showImgCode(succFn, errFn);
                    } else {
                        errFn(json.Tip);
                    }
                },
                error: function () {
                    errFn('请求发送失败');
                }
            });
        },
        check: function (mobilephone, mobilecode, succFn, errFn) {
            var that = this;
            // 覆盖原数据
            that.options.mobilephone = mobilephone;
            that.options.mobilecode = mobilecode;
            $.ajax({
                type: 'get',
                async: false,
                url: that.verifyUrl,
                data: that.options,
                dataType: 'jsonp',
                jsonp: that.options.callback,
                success: function (json) {
                    if (json.Message === 'Success') {
                        succFn('验证码验证通过');
                    } else {
                        errFn(json.Tip);
                    }
                },
                error: function () {
                    errFn('请求发送失败');
                }
            });
        },
        showImgCode: function (succFn, errFn) {
            var that = this;
            var imgCodeBox = $('#imgCodeBox');
            this.imgCodeBox = imgCodeBox;
            if (imgCodeBox.length < 1) {
                var elelmentFlog = $('<div id="imgCodeBox"></div>');
                var elementOut = $('<div></div>');
                var elementTitle = $('<h3>请输入验证码</h3>');
                var elementCon = $('<div></div>');
                var elementImg = $('<img>');
                var elementInputText = $('<input type="text">');
                var elementSubmit = $('<div></div>');
                var elementA = $('<a>确定</a>');
                elelmentFlog.css({
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,.8)',
                    position: 'fixed',
                    left: '0',
                    top: '0',
                    'z-index': '10000'
                })
                ;
                elementOut.css({
                    position: 'fixed',
                    'z-index': '10000',
                    width: '300px',
                    height: '200px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    'border-radius': '10px',
                    background: '#fff',
                    overflow: 'hidden'
                });
                elementTitle.css({
                    height: '36px',
                    'text-align': 'center',
                    'font-weight': 'bold',
                    'font-size': '18px',
                    'border-bottom': '3px double #B4B6BD',
                    background: '#E83B3C',
                    'line-height': '36px',
                    color: '#fff'
                });
                elementCon.css({
                    width: '100%',
                    height: '80px',
                    'margin-top': '10px'
                });
                elementImg.css({
                    width: '50%',
                    'max-height': '100%',
                    'margin-left': '2%',
                    float: 'left'
                });
                elementInputText.css({
                    border: '1px solid #ccc',
                    width: '40%',
                    height: '50px',
                    'margin-left': '5%',
                    outline: 'none',
                    'font-size': '16px',
                    'line-height': '50px',
                    float: 'left'
                });
                elementSubmit.css({
                    width: '60%',
                    margin: '10px auto',
                    height: '40px'
                });
                elementA.css({
                    display: 'block',
                    margin: '0 8px',
                    'font-size': '16px',
                    'line-height': '34px',
                    'text-align': 'center',
                    color: '#fff',
                    'border-radius': '4px',
                    '-webkit-border-radius': '4px',
                    height: '34px',
                    'background-color': '#e83b3c'
                });

                var src = that.getImgCodeSrc();
                elementImg.attr('src', src);
                // 确认发送验证码
                elementSubmit.on('click', function () {
                    that.options.mathcode = elementInputText.val();
                    elelmentFlog.hide();
                    that.send(that.options.mobilephone,succFn, errFn);
                    that.options.mathcode = '';
                    var src = that.getImgCodeSrc();
                    elementImg.attr('src', src);
                    elementInputText.val('');
                });
                // 点击更换验证码
                elementImg.on('click', function () {
                    src = that.getImgCodeSrc();
                    $(this).attr('src', src);
                });


                elementCon.append(elementImg);
                elementCon.append(elementInputText);
                elementSubmit.append(elementA);
                elementOut.append(elementTitle);
                elementOut.append(elementCon);
                elementOut.append(elementSubmit);
                elelmentFlog.append(elementOut);
                $(document.body).append(elelmentFlog);
            } else {
                imgCodeBox.show();
            }
        },
        getImgCodeSrc: function () {
            // 图文验证码图片
            var time = Date.now(),
                imgSrc = '';
            if (time % 2) {
                imgSrc = '//captcha.fang.com/Display?type=soufangbang&width=100&height=32&r=' + time;
            } else {
                imgSrc = '//captcha.fang.com/Display?r=' + time;
            }
            return imgSrc;
        }
    };
    return new SmsLogin();
});