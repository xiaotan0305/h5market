<?php
/**
 * Project:     搜房网php框架
 * File:        Passportjk.php
 *
 * <pre>
 * 描述：通行证jkHttp类
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
 * 通行证jkHttp类
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

class Passportjk extends Http
{
    /**
     * 构造函数
     */
    public function __construct()
    {
        try {
            parent::__construct('passportjk', 5);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 用户cookie校验
     * @param array $query 查询数据
     * @return array
     */
    public function checkCookie(array $query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['checkcookie'], $query);
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

/* End of file Passportjk.php */
