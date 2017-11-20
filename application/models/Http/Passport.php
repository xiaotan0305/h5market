<?php
/**
 * Project:     搜房网php框架
 * File:        Passport.php
 *
 * <pre>
 * 描述：通行证Http类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library/http
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 通行证Http类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Library
 * @subpackage Library/http
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
namespace models\Http;

use Http;
use Exception;
use Yaf_Exception;

class Passport extends Http
{
    /**
     * 默认查询参数，主要针对统一携带的参数
     * @var array
     */
    private $_default_query = array();

    /**
     * 构造函数
     */
    public function __construct()
    {
        try {
            parent::__construct('passport', 5);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取用户信息
     * @todo 可以增加获取多个用户支持
     * @param array $query 查询数据
     * @return array
     */
    public function getUserInfo(array $query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['userinfo'], $query);
            //判断返回数据格式是否符合文档要求
            if ($result['common']['return_result'] == 100) {
                return $result['common'];
            } else {
                throw new Yaf_Exception($result['common']['error_reason'], $result['common']['return_result']);
            }
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 下发短信验证码
     * @todo 错误代码对应关系可以改为配置
     * @param array $query 查询数据
     * @return array
     */
    public function sendVerifyCode(array $query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['sendVerifyCode'], $query);
            //判断返回数据格式是否符合文档要求
            if ($result['common']['return_result'] == 100) {
                return $result['common'];
            } else {
                throw new Yaf_Exception($result['common']['error_reason'], $result['common']['return_result']);
            }
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 验证短信验证码
     * @todo 错误代码对应关系可以改为配置
     * @param array $query 查询数据
     * @return array
     */
    public function checkVerifyCode(array $query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['checkVerifyCode'], $query);
            //判断返回数据格式是否符合文档要求
            if ($result['common']['return_result'] == 100) {
                return $result['common'];
            } else {
                throw new Yaf_Exception($result['common']['error_reason'], $result['common']['return_result']);
            }
        } catch (Exception $e) {
            throw $e;
        }
    }
}

/* End of file Passport.php */
