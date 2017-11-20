<?php
/**
 * Project:     搜房网php框架
 * File:        Coupon.php
 *
 * <pre>
 * 描述：优惠券Model
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     chenhongyan <chenhongyan@fang.com>
 * @copyright  2016 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 优惠券Model
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     chenhongyan <chenhongyan@fang.com>
 * @copyright  2016 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
use models\Http\Coupon as CouponHttp;

class CouponModel extends BaseModel
{
    /**
     * 验证信息
     * @var array
     */
    private $_auth = array();

    /**
     * 缓存是否开启
     * @var boolean
     */
    private $_cache_open = true;

    /**
     * 缓存操作句柄
     * @var obj
     */
    private $_cache_obj = null;

    /**
     * 构造函数
     */
    public function __construct()
    {
        parent::__construct();

        $cache_conf = Yaf_Registry::get('cache');

        //如果这个模块设置开启，且配置文件允许缓存
        if ($this->_cache_open === true && $cache_conf['cacheOpen'] === true) {
            $this->_cache_obj = new CouponCache();
        } else {
            $this->_cache_open = false;
        }

        $this->_auth = Yaf_Registry::get('auth');
    }

    /**
     * 查询优惠券信息,通过返回信息判断优惠券是房天下优惠券还是第三方优惠券
     * @param string $couponId 优惠券ID
     * return array/false
     * POST http://jk.coupon.test.fang.com/Coupon/Single_Coupon_Query.api?call_time=2016-08-30+14%3A37%3A58.680&group_sign_id=10120&origin=%E6%88%BF%E5%A4%A9%E4%B8%8B&platform=WAP&uid=d6aa4b4cab254376b0d2d3aee31f01cd&sign=af2551fcd2898b195d419da8e07099c3
     */
    public function queryCoupon($couponId)
    {
        try {
            $data['call_time'] = date('Y-m-d H:i:s.').floor(microtime()*1000);//精确到毫秒;//请求发起时间
            $data['group_sign_id'] = $this->_auth['coupon']['groupsignid'];//集团id
            $data['origin'] = '房天下';//来源,可以为空
            $data['platform'] = 'WAP';//平台,可以为空
            $data['uid'] = $couponId;//优惠券ID
            $sign = '';//签名字段
            $i = 0;
            foreach ($data as $key => $value) {
                $i++;
                $sign .= $key . '=' . $value;
                if ($i < 5) {
                    $sign .= '&';
                } else {
                    $sign .= '&key='.$this->_auth['coupon']['key'];
                }
            }

            $data['sign'] = MD5($sign);
            $couponHttp = new CouponHttp();
            $result = $couponHttp -> queryCoupon($data);
            return $result;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * 用户领取房天下优惠券
     * @param int $userid 当前登录用户的通行证id
     * @param string $couponId 优惠券ID
     * return array/false
     */
    public function getFangCoupon($userid, $couponId)
    {
        try {
            $data['CallTime'] = date('Y-m-d H:i:s.').floor(microtime()*1000);//精确到毫秒;//请求发起时间
            $data['CouponID'] = $couponId;//优惠券ID
            $data['group_sign_id'] = $this->_auth['coupon']['groupsignid'];//集团id
            $data['Type'] = 'WAP';//平台,可以为空
            $data['UserID'] = $userid;//当前登录用户的通行证id
            $sign = '';//签名字段
            $i = 0;
            foreach ($data as $key => $value) {
                $i++;
                $sign .= $key . '=' . $value;
                if ($i < 5) {
                    $sign .= '&';
                } else {
                    $sign .= '&key='.$this->_auth['coupon']['key'];
                }
            }

            $data['sign'] = MD5($sign);
            $couponHttp = new CouponHttp();
            $result = $couponHttp -> getFangCoupon($data);
            return $result;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * 用户领取第三方优惠券
     * @param int $userid 当前登录用户的id
     * @param string $couponId 优惠券Id
     * @param string $cityname 城市名称
     * @return array/false
     */
    public function getThirdCoupon($userid, $couponId, $cityname)
    {
        $data['call_time'] = date('Y-m-d H:i:s.').floor(microtime()*1000);//精确到毫秒;//请求发起时间
        $data['cityname'] = $cityname;//城市
        $data['coupon_id'] = $couponId;//优惠券ID
        $data['group_sign_id'] = $this->_auth['coupon']['groupsignid'];//集团id
        $data['origin'] = '房天下';//来源,可以为空
        $data['platform'] = 'WAP';//平台,可以为空
        $data['user_id'] = $userid;//当前登录用户的通行证id
        $sign = '';//签名字段
        $i = 0;
        foreach ($data as $key => $value) {
            $i++;
            $sign .= $key . '=' . $value;
            if ($i < 7) {
                $sign .= '&';
            } else {
                $sign .= '&key='.$this->_auth['coupon']['key'];
            }
        }

        $data['sign'] = MD5($sign);
        $couponHttp = new CouponHttp();
        $result = $couponHttp -> getThirdCoupon($data);
        return $result;

    }
}

/* End of file Isso.php */
