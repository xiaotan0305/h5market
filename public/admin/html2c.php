<?php
/**
 * Project:     搜房网php框架
 * File:        uploadimgcallback.php
 *
 * <pre>
 * 描述：图片上传回调
 * </pre>
 *
 * @category   PHP
 * @package    Public
 * @subpackage Admin
 * @author     yueyanlei <yueyanlei@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
echo $_GET['callback'].'("http://'.$_SERVER["HTTP_HOST"].'/imgproxy.php?url='.urlencode($_GET['url']).'");';
