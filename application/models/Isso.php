<?php
/**
 * Project:     搜房网php框架
 * File:        Isso.php
 *
 * <pre>
 * 描述：单点Model
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
 * 单点Model
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
use models\Http\Oajk as OajkHttp;
use models\Http\Homewww2 as Homewww2Http;

class IssoModel extends BaseModel
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
            $this->_cache_obj = new IssoCache();
        } else {
            $this->_cache_open = false;
        }

        $this->_auth = Yaf_Registry::get('auth');
    }

    /**
     * 获取当前登录后台用户信息
     * @return string/false
     */
    public function getLoginUser()
    {
        try {
            $http_param = Yaf_Registry::get('http_param');
            if (isset($http_param['cookie']['oa_token'])) {
                //校验cookie合法性
                $query = array(
                    'method' => 'verifyTokenPc',
                    'user' => $this->_auth['oa']['user'],
                    'pwd' => $this->_auth['oa']['pwd'],
                    'isso_sid' => $this->_auth['homewww2']['sid'],
                    'oa_token' => $http_param['cookie']['oa_token']
                );
                $OajkHttp = new OajkHttp();
                $result = $OajkHttp->auth($query);

                return $result['msg'];
            } else {
                return false;
            }
        } catch (Exception $e) {
            //不管什么原因获取登录用户信息失败，结果都是未登录状态
            return false;
        }
    }

    /**
     * 为用户开通服务
     * @param string $username 需要开通服务的用户名
     * @return array
     */
    public function addIssoService($username)
    {
        try {
            $username = trim($username);

            if (strlen($username) === 0) {
                throw new Yaf_Exception("用户名不能为空");
            }

            $query = array(
                'act' => 'actv_v2',
                'oa_username' => $username . '@soufun.com',
                'isso_sid' => $this->_auth['homewww2']['sid'],
                'sign' => Util::encrypt('actv_v2_' . $username . '@soufun.com_' . $this->_auth['homewww2']['sid'], $this->_auth['homewww2']['key'], $this->_auth['homewww2']['key'])
            );
            $query += Util::getClientIpAndPort();
            $Homewww2Http = new Homewww2Http();

            return $Homewww2Http->act($query);
        } catch (Exception $e) {
            //后台行为需要知道错误原因，这里必须抛出异常
            throw $e;
        }
    }

    /**
     * 为用户关闭服务
     * @param string $username 需要关闭服务的用户名
     * @return array
     */
    public function delIssoService($username)
    {
        try {
            $username = trim($username);

            if (strlen($username) === 0) {
                throw new Yaf_Exception("用户名不能为空");
            }

            $query = array(
                'act' => 'deactv_v2',
                'oa_username' => $username . '@soufun.com',
                'isso_sid' => $this->_auth['homewww2']['sid'],
                'sign' => Util::encrypt('deactv_v2_' . $username . '@soufun.com_' . $this->_auth['homewww2']['sid'], $this->_auth['homewww2']['key'], $this->_auth['homewww2']['key'])
            );
            $query += Util::getClientIpAndPort();
            $Homewww2Http = new Homewww2Http();

            return $Homewww2Http->act($query);
        } catch (Exception $e) {
            //后台行为需要知道错误原因，这里必须抛出异常
            throw $e;
        }
    }
}

/* End of file Isso.php */
