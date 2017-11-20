<?php
/**
 * Project:     搜房网php框架
 * File:        MemcacheDriver.php
 *
 * <pre>
 * 描述：Memcache 底层驱动（核心底层，修改请务必通知）
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
 * Memcache 底层驱动
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
class MemcacheDriver extends CacheDriver
{
    /**
     * Memcache链接句柄
     * @var array
     */
    private $_cacheHandle = null;

    /**
     * Memcache链接服务器信息数组
     * @var array
     */
    private $_hostLists = array();

    /**
     * 构造函数（传输多个链接配置时，自动使用一致性hash方式）
     * @param array $hostLists 链接的服务器信息 array("0" => array("host" => ,"port" => ,"weight" => ), "1" => array("host" => ,"port" => ,"weight" => )...)
     */
    public function __construct($hostLists)
    {
        if (!extension_loaded('memcache')) {
            throw new Yaf_Exception('Failed to load memcache extension');
        }

        $this->_hostLists = $hostLists;

        //如果有多个的情况，就是用一致性hash
        if (is_array($this->_hostLists) && count($this->_hostLists) > 1) {
            //使用一致性hash
            ini_set('memcache.hash_strategy', 'consistent');
            //使用MurMur算法，还可以使用 Memcache::HASH_MD5 Memcache::HASH_CRC 算法等
            ini_set('memcache.hash_function', 'crc32');
        }

        $this->_cacheHandle = new Memcache();

        //链接memcache
        foreach ($this->_hostLists as $value) {
            $this->_cacheHandle->addServer($value['host'], $value['port'], true, $value['weight']);
        }

        if (__DEBUG_MODE__) {
            echo "<b>Memcache::__construct() ok</b><br>\n";
            foreach ($hostLists as $host) {
                echo "host:".$host["host"]." port:".$host["port"]." weight:".$host["weight"]."<br>\n";
            }
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
        //过期时间，0-2592000秒（30天），由于超过按照时间戳处理，这里处理为永久有效
        //参见 http://cn2.php.net/manual/zh/memcache.set.php
        $expire_time = intval($expire_time);
        if ($expire_time < 0 || $expire_time > 2592000) {
            $expire_time = 0;
        }

        $this->_cacheHandle->set($itemkey, $itemvalue, false, $expire_time);
        if (__DEBUG_MODE__) {
            echo "Memcache::set ".$itemkey."<br>\n";
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
                echo "Memcache::get ".$keyList."<br>\n";
            }
            return $this->_cacheHandle->get($keyList);
        } elseif (is_array($keyList)) {
            if (__DEBUG_MODE__) {
                echo "Memcache::get multi key ".implode(",", $keyList)."<br>\n";
            }
            return $this->_cacheHandle->get($keyList);
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
            echo "Memcache::delete ".$itemkey."<br>\n";
        }

        return true;
    }

    /**
     * 清空Memcache所有数据
     * @return true
     */
    public function flush()
    {
        $this->_cacheHandle->flush();

        return true;
    }

    /**
     * 返回缓存服务器状态
     * @return false/array
     */
    public function getStats()
    {
        return $this->_cacheHandle->getStats();
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

/* End of file MemcacheDriver.php */
