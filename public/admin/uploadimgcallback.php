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

$host = $_SERVER['HTTP_HOST'];
preg_match("/[\w\-]+\.\w+$/", $host, $arr);
$domain = $arr[0];
?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>uploadimgcallback</title><br>
<script>
document.domain = "<?php echo $domain;?>";
</script>
</head>

<body>
<div><?php echo $_GET['imgurl'];?></div>
</body>
</html>