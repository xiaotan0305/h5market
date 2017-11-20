<?php
/**
 * Project:     搜房网php框架
 * File:        inc.php
 *
 * <pre>
 * 描述：cron入口配置文件
 * </pre>
 *
 * @category   PHP
 * @package    Public
 * @subpackage Cron
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

//设置时区
date_default_timezone_set('Etc/GMT-8');
//定义根目录
define("APP_PATH", realpath(dirname(__FILE__).'/../../'));
//根据目录确定运行环境，定义使用哪个配置文件，yaf.environ 目前只能通过php.ini设置
if (strpos(APP_PATH, 'h5market.fang.com') > 0) {
    define("RUN_ENVIRON", 'product');
} elseif (strpos(APP_PATH, 'h5market.test.fang.com') > 0) {
    define("RUN_ENVIRON", 'test');
} else {
    define("RUN_ENVIRON", 'develop');
}
//判断需要的扩展是否加载
if (!(extension_loaded('yaf') && extension_loaded('curl') && extension_loaded('pdo_mysql') && (extension_loaded('pdo_sqlsrv') || extension_loaded('pdo_dblib')))) {
    die('框架链接mysql需要安装pdo_mysql扩展，链接sqlserver需要安装pdo_sqlsrv(Windows平台)或pdo_dblib扩展(Linux平台)');
}

$app = new Yaf_Application(APP_PATH . "/conf/application.ini", RUN_ENVIRON);

//其它crontab，只写下面的就行了，具体使用方法参见 http://www.laruence.com/manual/yaf.incli.times.html

$app->bootstrap()->execute(array(new RbacModel(),'batchAddIssoUser'));
//$app->bootstrap()->execute(array(new RbacController(),'batchAddUserAction'));
