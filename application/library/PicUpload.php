<?php
/**
 * Project:     搜房网php框架
 * File:        PicUpload.php
 *
 * <pre>
 * 描述:PHP图片上传
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     yueyanlei <yueyanlei@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * PHP图片上传
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     yueyanlei <yueyanlei@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
class PicUpload
{
    /**
     * Boundary used to break up different parts of the http POST body
     * @var string
     */
    private static $_boundary = '';

    /**
     * Add one linebreak 添加空白行
     * @var string
     */
    private static $_LINEBREAK = "\r\n";

    /**
     * Add Double Dash 添加双破折号--
     * @var string
     */
    private static $_DOUBLEDASH = '--';

    /**
     * Get the boundary for the post.
     * Must be passed as part of the contentType of the UrlRequest
     * @return string
     */
    public static function getBoundary()
    {
        if (strlen(self::$_boundary) == 0) {
            self::$_boundary = '---------------------------' . substr(md5(rand(0, 32000)), 0, 10);
        }
        return self::$_boundary;
    }

    /**
     * Create post data to send in a fsockopen
     * @param string $fileName            上传文件的名字 "xxx.txt/xxx.jpg/xxx.pdf"
     * @param string $byteArray           上传文件的文件内容
     * @param string $uploadDataFieldName 上传数据字段的名字 默认值=filedata
     * @param string $parameters          参数 默认值=null
     * @return string 传输内容
     */
    public static function getPostData($fileName, $byteArray, $uploadDataFieldName = "filedata", $parameters = null)
    {
        //add Filename to parameters
        if ($parameters == null) {
            $parameters = array();
        }
        //设置上传文件名到parameters里
        $parameters['Filename'] = $fileName;

        $boundary = self::$_DOUBLEDASH . self::getBoundary();
        $data = self::$_DOUBLEDASH . $boundary . self::$_LINEBREAK;
        // form data
        foreach ($parameters as $key => $val) {
            $data .= 'Content-Disposition: form-data; name="'.$key.'"' . self::$_LINEBREAK;
            $data .= 'Content-Type: text/plain' . self::$_LINEBREAK . self::$_LINEBREAK;
            $data .= rawurlencode($val) . self::$_LINEBREAK;
            $data .= self::$_DOUBLEDASH . $boundary . self::$_LINEBREAK;
        }

        // file data
        $data .= 'Content-Disposition: form-data; name="'.$uploadDataFieldName.'"; filename="'.$fileName.'"' . self::$_LINEBREAK;
        $data .= 'Content-Type: application/octet-stream' . self::$_LINEBREAK . self::$_LINEBREAK;
        $data .= $byteArray.self::$_LINEBREAK;
        $data .= self::$_DOUBLEDASH . $boundary . self::$_DOUBLEDASH . self::$_LINEBREAK . self::$_LINEBREAK;
        return $data;
    }

    /**
     * 请求头设置
     * @param string $data 内容
     * @param string $host 主机
     * @param string $url  地址
     * @return string 传输头信息
     */
    public static function requestHeader($data, $host, $url)
    {
        $boundary = self::$_DOUBLEDASH . self::getBoundary();
        $header = 'POST ' . $url . ' HTTP/1.1'.self::$_LINEBREAK;
        $header .= 'Host:' . $host . self::$_LINEBREAK;
        $header .= 'Content-type:multipart/form-data; boundary='. $boundary . self::$_LINEBREAK;
        $header .= 'Content-length:' . strlen($data) . self::$_LINEBREAK;
        $header .= 'Connection:close'.self::$_LINEBREAK . self::$_LINEBREAK;
        $header .= $data;
        return $header;
    }

    /**
     * 文件传输
     * @param string  $host 主机
     * @param string  $url  网址
     * @param integer $port 端口，默认80
     * @param string  $type 图片类型
     * @return boolean/string 结果
     */
    public static function upload($host, $url, $port = 80, $type = 'image/jepg')
    {
        $errno = '';
        $errstr = '';
        $timeout = 30;
        $file_data = array(
            'name' => 'Filedata',
            'filename' => time().'.'.substr($type, 6)
        );
        $filecontent = file_get_contents("php://input");
        $filecontent = $_FILES['file'];

        $filecontent = file_get_contents($_FILES['file']['tmp_name']);
        if (!$filecontent) {
            return false;
        }
        // create connect
        if (!$fp = fsockopen($host, $port, $errno, $errstr, $timeout)) {
            return false;
        }
        // send request
        $data = self::getPostData($file_data['filename'], $filecontent, $file_data['name'], null);
        $out = self::requestHeader($data, $host, $url);
        fwrite($fp, $out);
        // get response
        $response = '';
        while ($row=fread($fp, 4096)) {
            $response .= $row;
        }
        fclose($fp);
        $pos = strpos($response, "\r\n\r\n");
        $response = substr($response, $pos+4);
        return $response;
    }
    /**
     * 文件传输
     * @param string  $host 主机
     * @param string  $url  网址
     * @param integer $port 端口，默认80
     * @param string  $type 图片类型,音乐类型
     * @return boolean/string 结果
     */
    public static function uploadNew($host, $url, $port = 80, $type = 'image/jpeg')
    {
        $errno = '';
        $errstr = '';
        $timeout = 30;
        $file_data = array(
            'name' => 'Filedata',
            'filename' => time().'.'.substr($type, 6)
        );
        if ($type == 'audio/mp3') {
            if (!$filecontent = file_get_contents("php://input")) {
                return false;
            }
        } else {
            $pattern = '/^(data:\s*image\/(\w+);base64,)/';
            $base64_image_content = $_POST['pic'];
            //匹配出图片的格式
            if (preg_match($pattern, $base64_image_content, $result)) {
                $len = strlen($result[1]);
                $filecontent = base64_decode(substr($base64_image_content, $len));
            } else {
                $filecontent = '';
            }
            if (!$filecontent) {
                return false;
            }
        }
        
        ini_set("default_socket_timeout", 30);
        $fp = fsockopen($host, $port, $errno, $errstr, $timeout);
        if (!$fp) {
            throw new Yaf_Exception('连接服务器超时');
        }
        // send request
        $data = self::getPostData($file_data['filename'], $filecontent, $file_data['name'], null);
        $out = self::requestHeader($data, $host, $url);
        fwrite($fp, $out);
        // get response
        $response = '';
        while ($row=fread($fp, 4096)) {
            $response .= $row;
        }
        fclose($fp);
        $pos = strpos($response, "\r\n\r\n");
        $response = substr($response, $pos+4);
        return $response;
    }
}

/* End of file PicUpload.php */
