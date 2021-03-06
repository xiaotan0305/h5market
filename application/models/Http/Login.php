<?php
/**
 * Project:     搜房网php框架
 * File:        Login.php
 *
 * <pre>
 * 描述：Login Http类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library/http
 * @author     chenhongyan <chenhongyan@fang.com>
 * @copyright  2017 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Login Http类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Library
 * @subpackage Library/http
 * @author     chenhongyan <chenhongyan@fang.com>
 * @copyright  2017 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
namespace models\Http;

use Http;
use Exception;
use Yaf_Exception;

class Login extends Http
{
    /**
     * 构造函数
     */
    public function __construct()
    {
        try {
            parent::__construct('login', 15);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 用户校验
     * @param array $query 查询数据
     * @return array
     */
    public function auth(array $query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['auth'], $query, 'get', array(), 'json');
            //判断返回数据格式是否符合文档要求
            if ($result['code'] == 0) {
                return $result;
            } else {
                throw new Yaf_Exception($result['msg'], $result['code']);
            }
        } catch (Exception $e) {
            throw $e;
        }
    }
}

/* End of file Login.php */
