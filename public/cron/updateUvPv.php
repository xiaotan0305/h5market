<?php
/**
 * Project:     搜房网php框架
 * File:        updateUvPv.php
 *
 * <pre>
 * 描述：cron入口配置文件
 * </pre>
 *
 * @category   PHP
 * @package    Public
 * @subpackage Cron
 * @author     chenhongyan <chenhongyan@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

include('../env.php');

//其它crontab，只写下面的就行了，具体使用方法参见 http://www.laruence.com/manual/yaf.incli.times.html
$app->bootstrap()->execute(array(new DatacenterModel(),'upDateUvPv'));
