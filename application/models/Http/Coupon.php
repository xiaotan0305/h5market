<?php
/**
 * Project:     搜房网php框架
 * File:        Coupon.php
 *
 * <pre>
 * 描述：优惠券Http类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library/http
 * @author     chenhongyan <chenhongyan@fang.com>
 * @copyright  2016 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 优惠券Http类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Library
 * @subpackage Library/http
 * @author     chenhongyan <chenhongyan@fang.com>
 * @copyright  2016 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
namespace models\Http;

use Http;
use Exception;

class Coupon extends Http
{
    /**
     * 构造函数
     */
    public function __construct()
    {
        try {
            parent::__construct('coupon', 5);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 查询优惠券信息
     * @param array $query 查询数据
     * @return array
     */
    public function queryCoupon($query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['queryCoupon'], $query, 'POST');
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 领取房天下优惠券
     * @param array $query 查询数据
     * @return array
     */
    public function getFangCoupon($query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['getFangCoupon'], $query, 'POST');
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 领取第三方优惠券
     * @param array $query 查询数据
     * @return array
     */
    public function getThirdCoupon($query)
    {
        try {
            $result = $this->httpGetContent($this->conf['host'], $this->conf['path']['getThirdCoupon'], $query, 'POST');
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }
}
/* End of file Datacenter.php */
