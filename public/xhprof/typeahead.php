<?php
/**
 * Project:     XHProf
 * File:        typeahead.php
 *
 * <pre>
 * AJAX endpoint for XHProf function name typeahead
 * </pre>
 *
 * @category  PHP
 * @package   XHPROF
 * @author    Kannan Muthukkaruppan <cjiang@facebook.com>
 * @author    Changhao Jiang <cjiang@facebook.com>
 * @copyright 2009 Facebook
 * @license   Apache License, Version 2.0
 * @link      http://www.apache.org/licenses/LICENSE-2.0
 */

//  Copyright (c) 2009 Facebook
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//

//
// AJAX endpoint for XHProf function name typeahead.
//
// @author(s)  Kannan Muthukkaruppan
//             Changhao Jiang
//

// by default assume that xhprof_html & xhprof_lib directories
// are at the same level.
//设置时区
date_default_timezone_set('Etc/GMT-8');
//定义根目录
define("APP_PATH", realpath(dirname(__FILE__).'/../../'));

$GLOBALS['XHPROF_LIB_ROOT'] = APP_PATH.'/application/library/3rdparty/xhprof';

require_once $GLOBALS['XHPROF_LIB_ROOT'].'/display/xhprof.php';

$xhprof_runs_impl = new XHProfRuns_Default();

require_once $GLOBALS['XHPROF_LIB_ROOT'].'/display/typeahead_common.php';
