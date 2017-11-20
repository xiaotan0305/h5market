<?php
/**
 * Project:     搜房网php框架
 * File:        HttpDriver.php
 *
 * <pre>
 * 描述：Http 底层驱动（核心底层，修改请务必通知）
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
 * Http 底层驱动
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
class HttpDriver
{
    /**
     * Curl默认配置参数
     * @var array
     */
    private $_init_curl_options = array(
        CURLOPT_RETURNTRANSFER => true,//信息以文件流的形式返回
        CURLOPT_ENCODING => 'gzip',//压缩格式
        CURLOPT_FOLLOWLOCATION => true,//服务器返回的"Location: "放在header中递归的返回给服务器
        CURLOPT_MAXREDIRS => 5,//限定 CURLOPT_FOLLOWLOCATION 递归数量
    );

    /**
     * 构造函数
     * @param integer $timeout 超时时间
     */
    public function __construct($timeout = 3)
    {
        if (!extension_loaded('curl')) {
            throw new Yaf_Exception('Failed to load curl extension');
        }

        //设置cURL允许执行的最长秒数
        $this->_init_curl_options[CURLOPT_TIMEOUT] = intval($timeout) > 0?intval($timeout):3;
    }

    /**
     * 发送请求
     * @param string $host          请求host，必须包含协议名称 http:// https://，结尾不能带 /，可以带端口
     * @param string $path          请求path，必须以 / 开头
     * @param array  $query         请求数据，key=>value 形式
     * @param string $method        请求类型，可以使用 get post delete put 等
     * @param array  $extra_options 其它附加curl参数
     * @param string $response_type 返回内容格式
     * @param string $charset       返回编码
     * @return mixed
     */
    public function sendRequest($host, $path, array $query = array(), $method = "get", array $extra_options = array(), $response_type = 'xml', $charset = 'default')
    {
        $options = array();
        //判断请求地址的类型
        if (parse_url($host, PHP_URL_SCHEME) === 'https') {
            $options[CURLOPT_SSL_VERIFYPEER] = false;//终止从服务端进行验证
            $options[CURLOPT_SSL_VERIFYHOST] = 2;//从证书中检查SSL加密算法是否存在，1不安全
        }

        //组装查询数据
        $query_str = http_build_query($query);
        //判断请求类型
        if (strtolower($method) === 'get') {
            $options[CURLOPT_URL] = $host.$path.'?'.$query_str;
        } elseif (strtolower($method) === 'post') {
            $options[CURLOPT_URL] = $host.$path;
            $options[CURLOPT_POST] = true;
            $options[CURLOPT_POSTFIELDS] = $query_str;
        } else {
            //处理其它请求类型，比如rest请求，请确认服务器支持
            $options[CURLOPT_URL] = $host.$path;
            $options[CURLOPT_CUSTOMREQUEST] = strtoupper($method);
            $options[CURLOPT_POSTFIELDS] = $query_str;
        }

        //和并传递进来的手动参数
        if (is_array($extra_options) && count($extra_options) > 0) {
            $options += $this->_init_curl_options + $extra_options;
        } else {
            $options += $this->_init_curl_options;
        }

        $ch = curl_init();
        if ($ch === false) {
            throw new Yaf_Exception(sprintf("Failed to init curl, error: '%s'", curl_error($ch)), curl_errno($ch));
        }

        //设置参数，由于 curl_setopt_array 处理其中一项出现错误时，会立即返回，后面参数项会忽略，所以要判断
        if (curl_setopt_array($ch, $options) === false) {
            throw new Yaf_Exception(sprintf("Failed to get curl option, error: '%s'", curl_error($ch)), curl_errno($ch));
        }

        //执行，获得数据
        $result = curl_exec($ch);
        //获取本次网络通讯结果
        $info = curl_getinfo($ch);
        //获取错误信息
        $error = curl_error($ch);
        $errno = curl_errno($ch);
        //关闭连接
        curl_close($ch);

        if (__DEBUG_MODE__) {
            echo __METHOD__.' '.strtoupper($method).' '.$host.$path.'?'.$query_str.' '.' uses '.$info['total_time'].' second.<br/>';
        }

        //判断返回结果，处理错误
        if ($result === false) {
            throw new Yaf_Exception(sprintf("Failed to get http data '%s', error: '%s'", (strtoupper($method).' '.$host.$path.'?'.$query_str), $error), $errno);
        } else {
            $result = $this->_parseResponse($result, strtolower($response_type), strtolower($charset));
        }

        return $result;
    }

    /**
     * 并行处理请求
     * @todo 目前对并发数量没有限制，后期可以增加Rolling队列方式
     * @param array $request_array 多个请求，参照sendRequest
     * @return array
     */
    public function sendRequestMulti(array $request_array = array())
    {
        if (!is_array($request_array) || count($request_array) === 0) {
            return array();
        }

        //第一步：调用curl_multi_init
        $ch_multi = curl_multi_init();

        //第二步：循环调用curl_multi_add_handle
        $curl = $result = array();
        foreach ($request_array as $key => $request) {
            //初始值
            if (!isset($request['query'])) {
                $request['query'] = array();
            }
            if (!isset($request['method'])) {
                $request['method'] = 'get';
            }
            if (!isset($request['extra_options'])) {
                $request['extra_options'] = array();
            }

            $options = array();
            //判断请求地址的类型
            if (parse_url($request['host'], PHP_URL_SCHEME) === 'https') {
                $options[CURLOPT_SSL_VERIFYPEER] = false;//终止从服务端进行验证
                $options[CURLOPT_SSL_VERIFYHOST] = 2;//从证书中检查SSL加密算法是否存在，1不安全
            }

            //组装查询数据
            $query_str = http_build_query($request['query']);
            //判断请求类型
            if (strtolower($request['method']) === 'get') {
                $options[CURLOPT_URL] = $request['host'].$request['path'].'?'.$query_str;
            } elseif (strtolower($request['method']) === 'post') {
                $options[CURLOPT_URL] = $request['host'].$request['path'];
                $options[CURLOPT_POST] = true;
                $options[CURLOPT_POSTFIELDS] = $query_str;
            } else {
                //处理其它请求类型，比如rest请求，请确认服务器支持
                $options[CURLOPT_URL] = $request['host'].$request['path'];
                $options[CURLOPT_CUSTOMREQUEST] = strtoupper($request['method']);
                $options[CURLOPT_POSTFIELDS] = $query_str;
            }

            //和并传递进来的手动参数
            if (is_array($request['extra_options']) && count($request['extra_options']) > 0) {
                $options += $this->_init_curl_options + $request['extra_options'];
            } else {
                $options += $this->_init_curl_options;
            }

            $curl[$key] = curl_init();
            //设置参数，由于 curl_setopt_array 处理其中一项出现错误时，会立即返回，后面参数项会忽略，所以要判断
            if (curl_setopt_array($curl[$key], $options) === false) {
                throw new Yaf_Exception(sprintf("Failed to get curl option, error: '%s'", $error), curl_errno($curl[$key]));
            }

            //这一步需要注意的是，curl_multi_add_handle的第二个参数是由curl_init而来的子handle。
            curl_multi_add_handle($ch_multi, $curl[$key]);
        }
        //第三步：持续调用curl_multi_exec
        $active = null;
        do {
            $mrc = curl_multi_exec($ch_multi, $active);
        } while ($mrc == CURLM_CALL_MULTI_PERFORM);

        while ($active and $mrc == CURLM_OK) {
            if (curl_multi_select($ch_multi) != -1) {
                usleep(1);
            }
            //继续执行直到所有子进程都处理完成
            do {
                $mrc = curl_multi_exec($ch_multi, $active);
            } while ($mrc == CURLM_CALL_MULTI_PERFORM);
        }
        //第四步：根据需要循环调用curl_multi_getcontent获取结果，并调用curl_multi_remove_handle关闭子链接
        foreach ($request_array as $key => $request) {
            //初始值
            if (!isset($request['response_type'])) {
                $request['response_type'] = 'xml';
            }
            if (!isset($request['charset'])) {
                $request['charset'] = 'default';
            }

            //获取本次网络通讯结果
            $info = curl_getinfo($curl[$key]);
            //获取错误信息
            $error = curl_error($curl[$key]);
            if (is_string($error) && strlen($error) === 0) {
                $return = curl_multi_getcontent($curl[$key]);
                $result[$key] = $this->_parseResponse($return, strtolower($request['response_type']), strtolower($request['charset']));
            }
            curl_multi_remove_handle($ch_multi, $curl[$key]);
        }
        //第五步：调用curl_multi_close
        curl_multi_close($ch_multi);
        return $result;
    }

    /**
     * 解析响应内容
     * @param string $result        返回的内容
     * @param string $response_type 返回数据类型
     * @param string $charset       返回内容编码
     * @return mixed
     */
    private function _parseResponse($result, $response_type, $charset)
    {
        $charset = ($charset === 'default')?'gbk, gb2312':$charset;
        //处理xml
        if ($response_type === 'xml') {
            try {
                return Util::parseXml($result, $charset);
            } catch (Exception $e) {
                throw $e;
            }
        } elseif ($response_type === 'json') {
            try {
                return Util::parseJson($result);
            } catch (Exception $e) {
                throw $e;
            }
        } else {
            //直接返回转码结果
            return mb_convert_encoding($result, "utf-8", $charset);
        }
    }
}

/* End of file HttpDriver.php */
