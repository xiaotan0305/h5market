<?php
/**
 * Project:     搜房网php框架
 * File:        Homewww2.php
 *
 * <pre>
 * 描述：单点登录Http类
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
 * 单点登录Http类
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

class Homewww2 extends Http
{
    /**
     * 构造函数
     */
    public function __construct()
    {
        try {
            parent::__construct('homewww2', 5);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 添加删除用户服务
     * @param array $query 查询数据
     * @return array
     */
    public function act(array $query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['act'], $query);
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

/* End of file Homewww2.php */
