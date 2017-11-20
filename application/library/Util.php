<?php
/**
 * Project:     搜房网php框架
 * File:        Util.php
 *
 * <pre>
 * 描述：工具类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 工具类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
class Util
{
    /**
     * 获取客户端ip及端口信息
     * @param boolean $forwarded 是否从HTTP_X_FORWARDED_FOR获取参数
     * @return array
     */
    public static function getClientIpAndPort($forwarded = false)
    {
        if (getenv("HTTP_X_REAL_IP") && strcasecmp(getenv("HTTP_X_REAL_IP"), "unknown") && $forwarded === false) {
            $ip = getenv("HTTP_X_REAL_IP");
        } elseif (getenv("HTTP_CLIENT_IP") && strcasecmp(getenv("HTTP_CLIENT_IP"), "unknown")) {
            $ip = getenv("HTTP_CLIENT_IP");
        } elseif (getenv("HTTP_X_FORWARDED_FOR") && strcasecmp(getenv("HTTP_X_FORWARDED_FOR"), "unknown")) {
            $ip = getenv("HTTP_X_FORWARDED_FOR");
        } elseif (getenv("REMOTE_ADDR") && strcasecmp(getenv("REMOTE_ADDR"), "unknown")) {
            $ip = getenv("REMOTE_ADDR");
        } elseif (isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], "unknown")) {
            $ip = $_SERVER['REMOTE_ADDR'];
        } else {
            $ip = "unknown";
        }

        if (false !== strpos($ip, ',')) {
            $arrIp = explode(', ', $ip);
            for ($i = 0; $i < count($arrIp); $i++) {
                if (!preg_match("/^(10\.|172\.16|192\.168\.)/", $arrIp[$i])) {
                    $ip = $arrIp[$i];
                    break;
                }
            }
        }

        //此字段是运维设置的，由前端逐级向后传递
        if (isset($_SERVER['HTTP_REMOTE_X_PORT']) && $_SERVER['HTTP_REMOTE_X_PORT'] > 0) {
            $port = intval($_SERVER['HTTP_REMOTE_X_PORT']);
        } elseif (isset($_SERVER['REMOTE_PORT']) && $_SERVER['REMOTE_PORT'] > 0) {
            $port = intval($_SERVER['REMOTE_PORT']);
        } else {
            $port = "unknown";
        }

        return(
            array(
                'ip'=>$ip,
                'port'=>$port
            )
        );
    }

    /**
     * 获取服务器ip
     * @param boolean $ip2long 是否需要ip2long转化
     * @return string
     */
    public static function getServerIp($ip2long = false)
    {
        $serverip = '';

        if (__IS_WIN__ == 0) {
            //优先获取外网ip
            $line = '/sbin/ifconfig | sed -n -e \'/eth/{N;p}\' | awk \'BEGIN{FS=":"}/inet addr/{print $2}\' | awk \'{print $1}\' | sed \'/192/d\' | head -1';
            $serverip = trim(exec($line));

            //如果为空，再获取内网ip
            if ($serverip == '') {
                $line = '/sbin/ifconfig | sed -n -e \'/eth/{N;p}\' | awk \'BEGIN{FS=":"}/inet addr/{print $2}\' | awk \'{print $1}\' | head -1';
                $serverip = trim(exec($line));
            }
        } else {
            $line = 'ipconfig';
            exec($line, $output);
            $my_reg_expr = "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$";
            foreach ($output as $row) {
                if (false !== strpos($row, 'IP Address')) {
                    preg_match('/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/', $row, $matches);
                    if (isset($matches[0])) {
                        $serverip = $matches[0];
                        break;
                    }
                }
            }
        }

        //如果还没有就给个默认值吧
        if ($serverip == '') {
            $serverip = '127.0.0.1';
        }

        if ($ip2long === true) {
            return abs(ip2long($serverip));//兼容32位
        } else {
            return $serverip;
        }
    }

    /**
     * 把 SimpleXMLElement 对象转换成数组，支持编码转换
     * @param string/simplexmlobj $xml               符合xml格式的字符串或者为simplexml对象
     * @param integer             $attribsAsElements 属性是否作为数组元素输出，默认为 0，不输出
     * @param string              $charset           字符集
     * @return array
     */
    public static function simplexml2Array($xml, $attribsAsElements = 0, $charset = '')
    {
        if (is_object($xml) && get_class($xml) == 'SimpleXMLElement') {
            $attributes = $xml->attributes();
            foreach ($attributes as $k => $v) {
                if ($v) {
                    $a[$k] = (string) $v;
                }
            }
            $x = $xml;
            $xml = get_object_vars($xml);
        }

        if (is_array($xml)) {
            if (count($xml) == 0) {
                return (string) $x;// for CDATA
            }

            foreach ($xml as $key => $value) {
                //这里递归调用，所以要把 $charset 再传递一下。
                $r[$key] = self::simplexml2Array($value, $attribsAsElements, $charset);
                if (!is_array($r[$key]) && ('' != $charset)) {
                    $r[$key] = mb_convert_encoding($r[$key], $charset, 'utf-8');
                }
            }

            if (isset($a)) {
                if ($attribsAsElements) {
                    $r = array_merge($a, $r);
                } else {
                    $r['@'] = $a; // Attributes
                }
            }

            return $r;
        }

        return (string) $xml;
    }

    /**
     * 解析XML
     * @param string $xmlstr  XML字符串
     * @param string $charset 原内容编码
     * @return array
     */
    public static function parseXml($xmlstr, $charset)
    {
        //开启XML错误
        libxml_use_internal_errors(true);
        //在encoding和消息体编码一致的情况下，不需要手动转换编码
        $simplexml = simplexml_load_string($xmlstr);
        //处理声明与消息体编码不一致的情况
        if ($simplexml === false) {
            //把xml转化为utf-8编码，注意头部声明也要调整
            //处理返回内容，分离XML头和消息体
            $xml_body = trim(substr(strstr($xmlstr, '?>'), 2));
            $xml_body = mb_convert_encoding($xml_body, "utf-8", $charset);
            $xml = '<?xml version="1.0" encoding="utf-8" ?>'."\n".$xml_body;
            $simplexml = simplexml_load_string($xml);
        }

        //经过两次转换还是失败，抛出异常
        if ($simplexml === false) {
            //获取错误
            $error = libxml_get_last_error();
            $message = $error->message;
            $code = $error->code;
            //清理错误
            libxml_clear_errors();
            throw new Yaf_Exception(sprintf("Failed to parse xml, error: '%s', charset: '%s'", $message, $charset), $code);
        } else {
            return self::simplexml2Array($simplexml);
        }
    }

    /**
     * 解析Json
     * @todo 目前不支持编码，可以考虑支持
     * @todo Json_decode很慢，可以考虑用jsond or jsonc 扩展
     * @param string $jsonstr Json字符串
     * @return array
     */
    public static function parseJson($jsonstr)
    {
        //json只接受utf8编码，这里暂时不转换，错误抛出异常
        $json = json_decode($jsonstr, true);
        if ($json === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new Yaf_Exception(sprintf("Failed to parse json '%s', error: '%s'", $jsonstr, json_last_error_msg()), json_last_error());
        } else {
            return $json;
        }
    }

    /**
     * Md5加密.net版本
     * @param string $str 需要加密的字符串
     * @return string
     */
    public static function md5ForDotnet($str)
    {
        return strtoupper(md5($str));
    }

    /**
     * 处理视频地址
     * @param string $url 视频地址
     * @return string
     */
    public static function videoThum($url)
    {
        $url = preg_replace('/^http[s]?:/', '', $url);
        return str_replace('video.fang.s3.bj.xs3cnc.com', 'cdns.soufunimg.com/flv.v', $url);
    }

    /**
     * 收敛图片域名，并生成指定尺寸的动态缩略图地址
     * @param string $picPath 图片源地址
     * @param string $suffix  图片格式（s:64x64，ms:80x80, m:120x120）
     * @return string
     */
    public static function picThum($picPath, $suffix = 'original')
    {
        //soufun.com是老域名，现在前台已经不用了，作为非cookie传递的分流域名合适，*.3g.fang.com除外
        if (strpos($picPath, '.3g.fang.com') === false) {
            $picPath = str_replace('.fang.com/', '.soufun.com/', $picPath);
        }
        //常规域名收敛
        $picPath = self::_cdnDomainShrink($picPath);
        //替换不支持https的程序静态资源域名
        $js_soufunimg = array('//js.soufunimg.com/', '//yjy.js.soufunimg.com/', '//esf.js.soufunimg.com/', '//jj.js.soufunimg.com/');
        $picPath = str_replace($js_soufunimg, '//static.soufunimg.com/', $picPath);
        $picPath = str_replace('//js.test.soufunimg.com/', '//static.test.soufunimg.com/', $picPath);
        //程序静态图片资源不支持缩放，无法处理
        if (strpos($picPath, '//static.soufunimg.com') === 0 || strpos($picPath, '//static.test.soufunimg.com') === 0 || strpos($picPath, '//statictest.soufunimg.com') === 0) {
            return $picPath;
        }
        //对cdn[n|s]地址进行还原，方便后续统一处理或不收敛用于pc展示
        //一般规则
        $reg = '/^\/\/cdn(?:n|s).soufunimg.com\/(img(?:\d+)n|img|imgdn|img2|video2n|flvn|img(?:\d+)|imgs|imgd|img2s|video2s|cdnsfb|flvs)\/(.+\/.+)\.(jpg|png|gif|jpeg)$/';
        if (1 === preg_match($reg, $picPath, $matches) && 4 == count($matches)) {
            $picPath = '//'.$matches[1].'.soufunimg.com/'.$matches[2].'.'.$matches[3];
        }
        //eimgn.jiatx.com特殊规则
        $reg = '/^\/\/cdn(?:n|s).soufunimg.com\/(eimgn.jiatx.com)\/(.+\/.+)\.(jpg|png|gif|jpeg)$/';
        if (1 === preg_match($reg, $picPath, $matches) && 4 == count($matches)) {
            $picPath = '//eimgn.jiatx.com/'.$matches[2].'.'.$matches[3];
        }
        //使用动态缩略图规则
        $reg = '/^(\/\/(?:img[\d\w]{0,2}|cdnsfb|[\w]+-10022965\.image)\.)(soufun|soufunimg|jiatx|myqcloud)(\.com\/)(.+\/.+)\.(jpg|png|gif|jpeg)$/';
        $sizeArr = array('s'=>'64x64','ms' => "80x80",'m'=>'120x120');
        if (isset($sizeArr[$suffix])) {
            $size = $sizeArr[$suffix];
        } else {
            $suffix = 'original';
        }
        $resPath = '';

        //如果使用原图，或者与正则不匹配，不需要处理
        if ($suffix != 'original' && 1 === preg_match($reg, $picPath, $matches) && 6 == count($matches)) {
            if (1 === preg_match("/(\/[\d]+x[\d]+(?:c[0-9]?)?).(jpg|png|gif|jpeg)$/", $picPath, $pre_matches_viem) && 3 == count($pre_matches_viem)) {
                $resPath = str_replace($pre_matches_viem[1], '/'.$size, $picPath);
            } else {
                for ($i=1; $i < 6; $i++) {
                    $resPath .= $matches[$i];
                    if (3 == $i) {
                        $resPath .= 'viewimage/';
                    } elseif (4 == $i) {
                        $resPath .= "/".$size.'.';
                    }
                }
            }
        }
        if ($resPath != '') {
            $picPath = $resPath;
        }
        //http2的极致收敛
        $patterns = array(
            //北方
            "/\/\/(img(?:\d+)n|img|imgdn|img2|video2n|flvn).soufunimg.com\//",
            //南方
            "/\/\/(img(?:\d+)|imgs|imgd|img2s|video2s|cdnsfb|flvs).soufunimg.com\//",
            //eimgn.jiatx.com特殊规则
            "/\/\/(eimgn.jiatx.com)\//",
        );
        $replacements = array(
            //北方
            '//cdnn.soufunimg.com/${1}/',
            //南方
            '//cdns.soufunimg.com/${1}/',
            //eimgn.jiatx.com特殊规则
            '//cdnn.soufunimg.com/${1}/',
        );

        return preg_replace($patterns, $replacements, $picPath);
    }

    /**
     * Cdn域名收敛
     * @param string $url 图片链接
     * @return string
     */
    private static function _cdnDomainShrink($url)
    {
        $url = preg_replace('/^http[s]?:/', '', $url);

        $cdnDomain = array(
            'img.soufunimg.com' => array(
                'img.soufun.com','imgu.soufun.com','imgu.soufunimg.com','imgnew.jiatx.com','imgn0.soufunimg.com','imgn1.soufunimg.com','imgn2.soufunimg.com','imgn3.soufunimg.com','imgn5.soufunimg.com','img-0.soufunimg.com','img-1.soufunimg.com','img-2.soufunimg.com','img-3.soufunimg.com','img-5.soufunimg.com'
            ),
            'imgs.soufunimg.com' => array(
                'imgs.soufun.com','imgsu.soufun.com','imgsu.soufunimg.com','imgsnew.jiatx.com','imgs0.soufunimg.com','imgs1.soufunimg.com','imgs2.soufunimg.com','imgs3.soufunimg.com','imgs5.soufunimg.com'
            ),
            'img1.soufunimg.com' => array(
                'img1.soufun.com','imghome1.soufun.com','img1.soufunimg.com','img1u.soufunimg.com','imghome1.soufunimg.com','img1.jiatx.com','img1test.soufun.com','img1u1.soufun.com','img1-0.soufunimg.com','img1-1.soufunimg.com','img1-2.soufunimg.com','img1-3.soufunimg.com'
            ),
            'img1n.soufunimg.com' => array(
                'img1n.soufun.com','img1nu.soufun.com','img1nu.soufunimg.com','img1n.jiatx.com','img1n-0.soufunimg.com','img1n-1.soufunimg.com','img1n-2.soufunimg.com','img1n-3.soufunimg.com','imgworld.soufun.com'
            ),
            'img2.soufunimg.com' => array(
                'img2.soufun.com','img2.jiatx.com'
            ),
            'img2s.soufunimg.com' => array(
                'img2s.soufun.com','img2s.jiatx.com'
            ),
            'imgd.soufunimg.com' => array(
                'imgd.soufun.com','imgdu.soufun.com','imgdu.soufunimg.com','imgd0.soufunimg.com','imgd1.soufunimg.com','imgd2.soufunimg.com','imgd3.soufunimg.com','imgd5.soufunimg.com'
            ),
            'imgdn.soufunimg.com' => array(
                'imgdn.soufun.com','imgdnu.soufun.com','imgdnu.soufunimg.com','imgdn0.soufunimg.com','imgdn1.soufunimg.com','imgdn2.soufunimg.com','imgdn3.soufunimg.com','imgdn5.soufunimg.com'
            ),
            'fla.soufunimg.com' => array(
                'fla.soufun.com','flas.soufun.com','flas.soufunimg.com'
            ),
            'flvs.soufunimg.com' => array(
                'flv.soufun.com','flv.soufunimg.com','flvs.soufun.com','flvs.soufunimg.com'
            ),
            'flvn.soufunimg.com' => array(
                'flvn.soufun.com'
            ),
            'video2n.soufunimg.com' => array(
                'video2n.soufun.com'
            ),
            'video2s.soufunimg.com' => array(
                'video2s.soufun.com'
            ),
            'image1.soufunimg.com' => array(
                'image1.soufun.com'
            ),
        );

        foreach ($cdnDomain as $key => $value) {
            //与收敛目标一致不处理
            if (strpos($url, '//'.$key) !== false) {
                break;
            }
            //收敛替换
            if (($url = str_ireplace($value, $key, $url, $count)) && $count > 0) {
                break;
            }
        }

        return $url;
    }

    /**
     * 生成guid
     * http://www.php.net/manual/en/function.com-create-guid.php
     * http://guid.us/GUID/PHP
     * @return string
     */
    public static function guid()
    {
        $application = Yaf_Registry::get('application');

        mt_srand((double) microtime() * 10000);
        $uuid = md5(uniqid(rand(), true));
        if (isset($application['application']['guidprefix']) && strlen(trim($application['application']['guidprefix'])) == 6) {
            return substr($application['application']['guidprefix'].$uuid, 0, 32);
        } else {
            throw new Yaf_Exception('配置文件中没有设置长度为6的guidprefix参数，请将参数设置为 '.substr($uuid, 0, 6));
        }
    }

    /**
     * 安全过滤
     * @param mixed   $val                 输入字符串（数字类型请用intval或者floatval转换处理）
     * @param boolean $onlycheck           是否仅检测（true:仅检测，返回结果为boolean; 默认:返回过滤字符串）
     * @param string  $allowable_html_tags 允许的html标签（'none':清除全部html标签; '<p><a>':保留p和a标签，同strip_tags第二个参数; 默认:不做处理）
     * @param boolean $htmlspecialchars    是否使用htmlspecialchars函数处理返回结果（ture:使用;默认:不使用）
     * @return mix
     */
    public static function safeFileter($val, $onlycheck = false, $allowable_html_tags = '', $htmlspecialchars = false)
    {
        $isdangerous = false;

        //如果是对象，提取public的属性进行过滤
        if (is_object($val)) {
            $val = get_object_vars($val);
        }

        if (is_array($val)) {
            //数组进行递归调用
            foreach ($val as $k => $v) {
                $val[$k] = call_user_func_array(array('Util', 'safeFileter'), array($v, $onlycheck, $allowable_html_tags, $htmlspecialchars));
            }

            return $val;
        } elseif (is_bool($val) || is_null($val) || is_int($val)) {
            //不做任何处理
        } else {
            if ($allowable_html_tags == 'none') {
                //如果设置了过滤全部html标签，则过滤全部标签
                $val = strip_tags($val);
            } elseif ($allowable_html_tags != '') {
                //如果设置了可使用的html标签，则保留这部分标签
                $val = strip_tags($val, $allowable_html_tags);
            }

            $val = preg_replace('/([\x00-\x08,\x0b-\x0c,\x0e-\x19])/', '', $val);
            $search = 'abcdefghijklmnopqrstuvwxyz';
            $search .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $search .= '1234567890!@#$%^&*()';
            $search .= '~`";:?+/={}[]-_|\'\\';
            for ($i = 0; $i < strlen($search); $i++) {
                $val = preg_replace('/(&#[xX]0{0,8}'.dechex(ord($search[$i])).';?)/i', $search[$i], $val);
                $val = preg_replace('/(&#0{0,8}'.ord($search[$i]).';?)/', $search[$i], $val);
            }
            $ra1 = array('javascript', 'vbscript', 'expression', 'applet', 'meta', '<xml', '&lt;xml', '&#60;xml', 'blink', 'link', 'style', 'script', 'embed', 'object', 'iframe', 'frame', 'frameset', 'ilayer', 'layer', 'bgsound', 'title', 'base');
            $ra2 = array('onabort', 'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate', 'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus', 'onbeforepaste', 'onbeforeprint', 'onbeforeunload', 'onbeforeupdate', 'onblur', 'onbounce', 'oncellchange', 'onchange', 'onclick', 'oncontextmenu', 'oncontrolselect', 'oncopy', 'oncut', 'ondataavailable', 'ondatasetchanged', 'ondatasetcomplete', 'ondblclick', 'ondeactivate', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onerror', 'onerrorupdate', 'onfilterchange', 'onfinish', 'onfocus', 'onfocusin', 'onfocusout', 'onhelp', 'onkeydown', 'onkeypress', 'onkeyup', 'onlayoutcomplete', 'onload', 'onlosecapture', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onmove', 'onmoveend', 'onmovestart', 'onpaste', 'onpropertychange', 'onreadystatechange', 'onreset', 'onresize', 'onresizeend', 'onresizestart', 'onrowenter', 'onrowexit', 'onrowsdelete', 'onrowsinserted', 'onscroll', 'onselect', 'onselectionchange', 'onselectstart', 'onstart', 'onstop', 'onsubmit', 'onunload');
            $ra = array_merge($ra1, $ra2);
            $found = true;
            while ($found == true) {
                $val_before = $val;
                for ($i = 0; $i < sizeof($ra); $i++) {
                    $pattern = '/';
                    for ($j = 0; $j < strlen($ra[$i]); $j++) {
                        if ($j > 0) {
                            $pattern .= '(';
                            $pattern .= '(&#[xX]0{0,8}([9ab]);)';
                            $pattern .= '|';
                            $pattern .= '|(&#0{0,8}([9|10|13]);)';
                            $pattern .= ')*';
                        }
                        $pattern .= $ra[$i][$j];
                    }
                    $pattern .= '/i';
                    $replacement = substr($ra[$i], 0, 2).'<x>'.substr($ra[$i], 2);
                    $val = preg_replace($pattern, $replacement, $val);
                    if ($val_before == $val) {
                        $found = false;
                    } else {
                        $isdangerous = true;
                    }
                }
            }
        }

        if ($onlycheck === false) {
            if ($htmlspecialchars === false) {
                return $val;
            } else {
                return htmlspecialchars($val);
            }
        } else {
            return $isdangerous;
        }
    }




    /**
     * 加密
     * @param string $input 字符串
     * @param string $key   key
     * @param string $iv    iv
     * @param string $type  加密类型
     * @return string/false
     */
    public static function encrypt($input, $key, $iv, $type = 'ISSO')
    {
        $method = '_encrypt'.strtoupper($type);
        if (is_callable(array('Util', $method))) {
            return self::$method($input, $key, $iv);
        } else {
            return false;
        }
    }

    /**
     * 解密
     * @param string $input 字符串
     * @param string $key   key
     * @param string $iv    iv
     * @param string $type  加密类型
     * @return string/false
     */
    public static function decrypt($input, $key, $iv, $type = 'ISSO')
    {
        $method = '_decrypt'.strtoupper($type);
        if (is_callable(array('Util', $method))) {
            return self::$method($input, $key, $iv);
        } else {
            return false;
        }
    }

    /**
     * ISSO单点登录加密
     * @param string $input 字符串
     * @param string $key   key
     * @param string $iv    iv
     * @return string
     */
    private static function _encryptISSO($input, $key, $iv)
    {
        $addnum = 8 - (strlen($input) % 8);
        for ($i = 0; $i < $addnum; $i++) {
            $input .= chr($addnum);
        }
        return openssl_encrypt($input, 'DES-CBC', $key, OPENSSL_ZERO_PADDING, $iv);
    }

    /**
     * ISSO单点登录解密
     * @param string $input 字符串
     * @param string $key   key
     * @param string $iv    iv
     * @return string
     */
    private static function _decryptISSO($input, $key, $iv)
    {
        $output = openssl_decrypt($input, 'DES-CBC', $key, OPENSSL_ZERO_PADDING, $iv);
        for ($i = 0; $i <= 8; $i++) {
            $output = str_replace(chr($i), "", $output);
        }
        return $output;
    }

    /**
     * 图片上传加密字符串
     * @param string $input 字符串
     * @param string $key   key
     * @param string $iv    iv
     * @return string 加密后的字符串
     */
    private static function _encryptUploadImg($input, $key, $iv)
    {
        return strtoupper(bin2hex(openssl_encrypt($input, 'DES-CBC', $key, OPENSSL_RAW_DATA, $iv)));
    }
    
    /**
     * 图片上传解密字符串
     * @param string $input 字符串
     * @param string $key   key
     * @param string $iv    iv
     * @return string 加密后的字符串
     */
    private static function _decryptUploadImg($input, $key, $iv)
    {
        return openssl_decrypt(hex2bin(strtolower($input)), 'DES-CBC', $key, OPENSSL_RAW_DATA, $iv);
    }
}

/* End of file Util.php */
