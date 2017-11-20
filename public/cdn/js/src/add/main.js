/**
 * Created by tangcheng on 16/2/18.
 */
define('src/add/main',['jquery'],function (require) {
    'use strict';
    var $ = require('jquery');
    var vars = seajs.data.vars;
    var preload = [];
    $('input[type=hidden]').each(function (index,element) {
        vars[element.id] = element.value;
    });
    if (vars.action !== '') {
        preload.push('src/add/' + vars.action);
    }
    require.async(preload);
});