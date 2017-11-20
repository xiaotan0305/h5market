<?php
/**
 * Project:     搜房网php框架
 * File:        User.php
 *
 * <pre>
 * 描述：用户Model
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 用户Model
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
use models\Http\Passport as PassportHttp;
use models\Http\Passportjk as PassportjkHttp;

class UserModel extends BaseModel
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
            $this->_cache_obj = new UserCache();
        } else {
            $this->_cache_open = false;
        }

        $this->_auth = Yaf_Registry::get('auth');
    }

    /**
     * 获取当前登录的用户信息
     * @param string $channel 通行证接口频道配置
     * @return array/false
     */
    public function getLoginUser($channel = 'default')
    {
        try {
            $http_param = Yaf_Registry::get('http_param');
            if (isset($http_param['cookie']['sfut'])) {
                //校验cookie合法性
                $query = array(
                    'cookie' => $http_param['cookie']['sfut']
                );
                $query += Util::getClientIpAndPort();
                $PassportjkHttp = new PassportjkHttp();
                $checkLogin = $PassportjkHttp->checkCookie($query);
                //获取通行证用户信息
                $user_base_info = $this->getUserInfoFromPassport($checkLogin['userid'], '', $channel);
                //和并用户类别
                $user_base_info['usertype'] = $checkLogin['usertype'];

                return $user_base_info;
            } else {
                return false;
            }
        } catch (Exception $e) {
            //不管什么原因获取登录用户信息失败，结果都是未登录状态
            return false;
        }
    }

    /**
     * 从通行证获取用户信息
     * @param integer $userid 通行证用户ID
     * @param string $username 通行证用户名
     * @param string $channel 通行证接口频道配置
     * @return array/false
     */
    public function getUserInfoFromPassport($userid = 0, $username = '', $channel = 'default')
    {
        try {
            if (!$userid && !$username) {
                return false;
            }

            $query['service'] = $this->_auth['passport'][$channel]['channelCode'];
            if ($username) {
                $query['username'] = $username;
            } else {
                $query['userid'] = $userid;
            }

            $PassportHttp = new PassportHttp();
            $user_base_info = $PassportHttp->getUserInfo($query);

            //处理头像缩放
            if (isset($user_base_info['avatar']) && strlen($user_base_info['avatar']) > 0) {
                $user_base_info['avatar'] = Util::picThum($user_base_info['avatar'], $suffix = 's');
            }

            return $user_base_info;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * 下发短信验证码
     * @param string $phone 手机号码
     * @param string $channel 通行证频道
     * @return array/false
     */
    public function sendVerifyCode($phone, $channel = 'default')
    {
        try {
            if (strlen($phone) < 11) {
                return false;
            }

            $query = array(
                'mobilephone' => $phone,
                'v' => Util::md5ForDotnet($this->_auth['passport'][$channel]['channelCode'] . $this->_auth['passport'][$channel]['username'] . $this->_auth['passport'][$channel]['password'] . $phone),
                'service' => $this->_auth['passport'][$channel]['channelCode'],
            );
            $query += Util::getClientIpAndPort();
            $PassportHttp = new PassportHttp();

            return $PassportHttp->sendVerifyCode($query);
        } catch (Exception $e) {
            //下发短信验证码的行为需要知道错误原因，这里必须抛出异常
            throw $e;
        }
    }

    /**
     * 通过短信验证码登录
     * @param string $phone 手机号码
     * @param string $checkcode 验证码
     * @param boolean $return_user_info 是否需要返回验证登录后的用户信息
     * @param string $channel 通行证频道
     * @param string $city 城市
     * @param integer $bindsoufuncard 是否绑定搜房卡
     * @param string $ext 附加信息
     * @return array/false
     */
    public function loginByVerifyCode($phone, $checkcode, $return_user_info = false, $channel = 'default', $city = '北京', $bindsoufuncard = 0, $ext = '')
    {
        try {
            if (strlen($phone) < 11 || strlen($checkcode) < 1) {
                return false;
            }

            $query = array(
                'mobilephone' => $phone,
                'verificationcode' => $checkcode,
                'v' => Util::md5ForDotnet($this->_auth['passport'][$channel]['channelCode'] . $this->_auth['passport'][$channel]['username'] . $this->_auth['passport'][$channel]['password'] . $phone),
                'service' => $this->_auth['passport'][$channel]['channelCode'],
                'host' => 'm.fang.com',
                'city' => mb_convert_encoding($city, 'gbk', 'utf-8'),
                'ext' => mb_convert_encoding($ext, 'gbk', 'utf-8'),
                'bindsoufuncard' => $bindsoufuncard,
                'limitip' => 1,
                'codetype' => 1,
            );
            $query += Util::getClientIpAndPort();
            $PassportHttp = new PassportHttp();
            $result = $PassportHttp->checkVerifyCode($query);
            $this->_setPassportCookie($result);
            if ($return_user_info === false) {
                return true;
            } else {
                return $this->getUserInfoFromPassport($result['userid']);
            }
        } catch (Exception $e) {
            //登录行为需要知道登录错误原因，这里必须抛出异常
            throw $e;
        }
    }

    /**
     * 种通行证Cookie
     * @param array $passport_return 通行证登录接口返回数组
     * @return null
     */
    private function _setPassportCookie($passport_return)
    {
        //通行证2014新版cookie
        setcookie('sfut', $passport_return['sfut_cookie'], time() + 30 * 24 * 60 * 60);
        //搜房卡cookie不一定有
        if (isset($passport_return['new_soufuncard'])) {
            setcookie('new_soufuncard', $passport_return['new_soufuncard'], time() + 30 * 24 * 60 * 60);
        }
    }
}

/* End of file User.php */
