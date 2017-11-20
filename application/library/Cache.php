<?php
/**
 * Project:     搜房网php框架
 * File:        Cache.php
 *
 * <pre>
 * 描述：缓存基类
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
 * 缓存基类
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
class Cache
{
    /**
     * 缓存对象句柄
     * @var obj
     */
    private $_obj = null;

    /**
     * 过期时间
     * @var integer
     */
    private $_expire_time = 0;

    /**
     * 构造函数
     * @param string  $type       缓存类型，目前支持memcache、yac、redis
     * @param string  $channel    类型 操作的cache频道类型，参照sysConfig中的cache_info字段配置
     * @param integer $expiretime 缓存时间（单位秒） <= 0 永久有效
     * @return void
     */
    public function __construct($type = 'memcache', $channel = 'default', $expiretime = 0)
    {
        $config = Yaf_Registry::get('cache');

        if (!isset($config[$type])) {
            $type = 'memcache';
        }

        if (!isset($config[$type][$channel])) {
            $channel = 'default';
        }

        //初始化过期时间和压缩
        $this->_expire_time = intval($expiretime);

        $this->_obj = Loader::cacheFactory($config[$type][$channel], $type, $channel);
    }

    /**
     * 设置缓存过期时间
     * @param integer $expiretime 有效期，单位秒
     * @return void
     */
    public function setExpireTime($expiretime)
    {
        $this->_expire_time = intval($expiretime);
    }

    /**
     * 读取指定key对应的内容
     * @param mix $key 键名，多个键名用数组
     * @return mix 返回的数据内容
     */
    public function getItem($key)
    {
        $key = trim($key);

        if (strlen($key) > 0) {
            return $this->_obj->get($key);
        } else {
            return false;
        }
    }

    /**
     * 设置指定key对应的内容
     * @param string $key   键名
     * @param mix    $value 数据内容
     * @return boolean
     */
    public function setItem($key, $value)
    {
        $key = trim($key);

        if (strlen($key) > 0) {
            return $this->_obj->set($key, $value, $this->_expire_time);
        } else {
            return false;
        }
    }

    /**
     * 删除指定key对应的内容
     * @param string $key 键名
     * @return boolean
     */
    public function delItem($key)
    {
        $key = trim($key);

        if (strlen($key) > 0) {
            return $this->_obj->delete($key);
        } else {
            return false;
        }
    }

    /**
     * 获取服务器状态
     * @return array
     */
    public function getContainerStats()
    {
        return $this->_obj->getStats();
    }

    /**
     * 返回缓存链接句炳
     * @return obj
     */
    public function getObj()
    {
        return $this->_obj->getHandler();
    }
}

/* End of file Cache.php */
