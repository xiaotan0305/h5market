/*
 * @Author: tankunpeng
 * @Date:   2015-09-07
 * @description: 模块入口
 * @Last Modified by:   tankunpeng
 * @Last Modified time: 2015-09-08
 */
define('src/PCpreview/main',['jquery'],function (require) {
    'use strict';
    var $ = require('jquery');
    var vars = seajs.data.vars;
    var preload = [];
    $('input[type=hidden]').each(function (index,element) {
        vars[element.id] = element.value;
    });
    if (vars.action !== '') {
        preload.push('src/PCpreview/' + vars.action);
    }
    require.async(preload);
});