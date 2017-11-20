<?php
/**
 * Project:     搜房网php框架
 * File:        RedisDriver.php
 *
 * <pre>
 * 描述：Redis 底层驱动（核心底层，修改请务必通知）
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
 * Redis 底层驱动
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
class RedisDriver extends CacheDriver
{
    /**
     * Redis链接句柄
     * @var array
     */
    private $_cacheHandle = null;

    /**
     * Redis链接服务器信息数组
     * @var array
     */
    private $_hostLists = array();

    /**
     * 构造函数
     * @param array $hostLists 链接的服务器信息 array("0" => array("host" => ,"port" => ,"weight" => ), "1" => array("host" => ,"port" => ,"weight" => )...)
     */
    public function __construct($hostLists)
    {
        if (!extension_loaded('redis')) {
            throw new Yaf_Exception('Failed to load redis extension');
        }

        if (count($hostLists) > 1) {
            //集群模式
            foreach ($hostLists as $value) {
                $this->_hostLists[] = $value['host'].':'.$value['port'];
            }

            $this->_cacheHandle = new RedisCluster(null, $this->_hostLists);
        } elseif (count($hostLists) == 1) {
            //单机模式
            $this->_hostLists = array_shift($hostLists);
            $this->_cacheHandle = new Redis();
            $this->_cacheHandle->connect($this->_hostLists['host'], $this->_hostLists['port']);
        }

        //设置序列化默认函数，兼容set函数对数组的支持
        if (extension_loaded('igbinary')) {
            $this->_cacheHandle->setOption(Redis::OPT_SERIALIZER, Redis::SERIALIZER_IGBINARY);
        } else {
            $this->_cacheHandle->setOption(Redis::OPT_SERIALIZER, Redis::SERIALIZER_PHP);
        }
    }

    /**
     * 设置缓存内容
     * @param  string  $itemkey     元素的key
     * @param  mix     $itemvalue   元素数据
     * @param  integer $expire_time 过期时间 <=0表示永远有效，单位秒
     * @return true
     */
    public function set($itemkey, $itemvalue, $expire_time = 0)
    {
        //过期时间，0-2592000秒（30天），与memcache缓存服务等效设置，超过时间范围永久有效
        $expire_time = intval($expire_time);
        if ($expire_time < 0 || $expire_time > 2592000) {
            $expire_time = 0;
        }

        if ($expire_time > 0) {
            $this->_cacheHandle->set($itemkey, $itemvalue, $expire_time);
            if (__DEBUG_MODE__) {
                echo "Redis::set ".$itemkey."<br>\n";
            }
        } else {
            $this->_cacheHandle->set($itemkey, $itemvalue);
            if (__DEBUG_MODE__) {
                echo "Redis::set ".$itemkey." no ttl<br>\n";
            }
        }

        return true;
    }

    /**
     * 获取指定元素key的内容
     * @param  string/array $keyList 元素的key
     * @return mix
     */
    public function get($keyList)
    {
        if (is_string($keyList)) {
            if (__DEBUG_MODE__) {
                echo "Redis::get ".$keyList."<br>\n";
            }
            return $this->_cacheHandle->get($keyList);
        } elseif (is_array($keyList)) {
            if (__DEBUG_MODE__) {
                echo "Memcached::mGet ".implode(",", $keyList)."<br>\n";
            }
            return $this->_cacheHandle->mGet($keyList);
        } else {
            return false;
        }
    }

    /**
     * 删除指定元素key的内容
     * @param  string $itemkey 元素的key
     * @return true
     */
    public function delete($itemkey)
    {
        $this->_cacheHandle->delete($itemkey);

        if (__DEBUG_MODE__) {
            echo "Redis::delete ".$itemkey."<br>\n";
        }

        return true;
    }

    /**
     * 清空Redis所有数据
     * @return true
     */
    public function flush()
    {
        $this->_cacheHandle->flushdb();

        return true;
    }

    /**
     * 返回缓存服务器状态
     * @return false/array
     */
    public function getStats()
    {
        return $this->_cacheHandle->info();
    }

    /**
     * 返回缓存链接句炳
     * @return obj
     */
    public function getHandler()
    {
        return $this->_cacheHandle;
    }
}

/* End of file RedisDriver.php */
