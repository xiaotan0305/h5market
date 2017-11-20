<?php
/**
 * Project:     搜房网php框架
 * File:        Http.php
 *
 * <pre>
 * 描述：Http基类
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
 * Http基类
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
abstract class Http
{
    /**
     * 超时时间
     * @var integer
     */
    private $_timeout;

    /**
     * 配置 来自interface.ini
     * @var obj
     */
    protected $conf;

    /**
     * 构造函数
     * @param string  $host    使用哪个配置文件中的主机配置
     * @param integer $timeout 超时时间
     */
    public function __construct($host, $timeout = 3)
    {
        $interface = Yaf_Registry::get('interface');
        if (isset($interface[$host])) {
            $this->conf = $interface[$host];
        } else {
            throw new Yaf_Exception('interface.ini 中没有关于 '.$host.' 的配置信息');
        }

        $this->_timeout = (intval($timeout) > 0)?intval($timeout):3;
    }

    /**
     * 获取http接口数据
     * @param mixed  $host          请求host，必须包含协议名称 http:// https://，结尾不能带 /，可以带端口，数组代表多个请求
     * @param string $path          请求path，必须以 / 开头
     * @param array  $query         请求数据，key=>value 形式
     * @param string $method        请求类型，可以使用 get post delete put 等
     * @param array  $extra_options 其它附加curl参数
     * @param string $response_type 返回内容格式
     * @param string $charset       返回编码
     * @return mixed
     */
    protected function httpGetContent($host, $path, array $query = array(), $method = "get", array $extra_options = array(), $response_type = 'xml', $charset = 'default')
    {
        try {
            $http = new HttpDriver($this->_timeout);

            if (is_array($host)) {
                return $http->sendRequestMulti($host);
            } else {
                return $http->sendRequest($host, $path, $query, $method, $extra_options, $response_type, $charset);
            }
        } catch (Exception $e) {
            throw $e;
        }
    }
}

/* End of file Http.php */
