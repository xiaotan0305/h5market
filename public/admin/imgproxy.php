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
set_time_limit(1000);
/**
 * 添加用户个人的模板
 * @return void
 */
function download_file($url)
{
    $content = '';
    if (function_exists('curl_init')) {
        ob_start();
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_exec($ch);
        curl_close($ch);
        $content = ob_get_contents();
        ob_clean();
        unset($ch);
    } elseif ($content = @file_get_contents($url)) {
        //
    } elseif ($data = @file($url)) {
        $content = join('', $data);
        unset($data);
    } elseif (false !== @readfile($url)) {
        $content = ob_get_contents();
        ob_clean();
    } elseif (function_exists('fread') && ($fp = @fopen($url, 'rb'))) {
        $content = '';
        while (!feof($fp)) {
            $content .= fread($fp, 8192);
        }
        unset($fp);
    }
    return $content;
}
echo download_file($_GET['url']);
