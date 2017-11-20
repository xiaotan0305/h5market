define('src/add/showInvitePage', ['jquery'], function (require, exports, module) {
    'use strict';
    var $ = require('jquery');
    var vars = seajs.data.vars;


    var isEmail = function (str) {
        return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(str);
    };

    $('#add').on('click', function () {
        var email = $('#email').val()+'@fang.com';
        if (!isEmail(email)) {
            alert('邮箱格式错误,请核查');
            return false;
        }
        $.post(vars.pcSite + '?c=admin&a=addUser', {email: email}, function(data) {
            alert(data.errmsg);
        });
    });
});