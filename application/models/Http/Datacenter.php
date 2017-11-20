<?php
/**
 * Project:     搜房网php框架
 * File:        Datacenter.php
 *
 * <pre>
 * 描述：数据中心Http类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library/http
 * @author     chenhongyan <chenhongyan@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 数据中心Http类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Library
 * @subpackage Library/http
 * @author     chenhongyan <chenhongyan@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
namespace models\Http;

use Http;
use Exception;

class Datacenter extends Http
{
    /**
     * 构造函数
     */
    public function __construct()
    {
        try {
            parent::__construct('datacenter', 5);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取页面的UVPV
     * @param array $query 查询数据
     * @return array
     */
    public function getUvPv(array $query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['uv'], $query);

            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }
}

/* End of file Datacenter.php */
