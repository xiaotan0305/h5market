<?php
/**
 * Project:     搜房网php框架
 * File:        MemcachedDriver.php
 *
 * <pre>
 * 描述：Memcached 底层驱动（核心底层，修改请务必通知）
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
 * Memcached 底层驱动
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
class MemcachedDriver extends CacheDriver
{
    /**
     * Memcached链接句柄
     * @var array
     */
    private $_cacheHandle = null;

    /**
     * Memcached链接服务器信息数组
     * @var array
     */
    private $_hostLists = array();

    /**
     * 构造函数（传输多个链接配置时，自动使用一致性hash方式）
     * @param array $hostLists 链接的服务器信息 array("0" => array("host" => ,"port" => ), "1" => array("host" => ,"port" => )...)
     */
    public function __construct($hostLists)
    {
        if (!extension_loaded('memcached')) {
            throw new Yaf_Exception('Failed to load memcached extension');
        }

        //处理数据格式
        foreach ($hostLists as $key => $value) {
            $temp_array = array();
            $temp_array[0] = $value["host"];
            $temp_array[1] = $value["port"];
            $temp_array[2] = $value["weight"];
            $this->_hostLists[$key] = $temp_array;
        }

        if (__DEBUG_MODE__) {
            echo "<b>Memcached::__construct() ok</b><br>\n";
            foreach ($hostLists as $host) {
                echo "host:".$host["host"]." port:".$host["port"]." weight:".$host["weight"]."<br>\n";
            }
        }

        $this->_cacheHandle = new Memcached();
        $this->_cacheHandle->addServers($this->_hostLists);
        //默认关闭压缩
        $this->_cacheHandle->setOption(Memcached::OPT_COMPRESSION, false);
        //开启异步IO
        $this->_cacheHandle->setOption(Memcached::OPT_NO_BLOCK, true);
        //开启已连接socket的无延迟特性
        $this->_cacheHandle->setOption(Memcached::OPT_TCP_NODELAY, true);
        //开启使用二进制协议，并使用igbinary进行压缩
        if (Memcached::HAVE_IGBINARY) {
            $this->_cacheHandle->setOption(Memcached::OPT_BINARY_PROTOCOL, true);
            $this->_cacheHandle->setOption(Memcached::OPT_SERIALIZER, Memcached::SERIALIZER_IGBINARY);
        }

        //如果有多个的情况，就是用一致性hash
        if (is_array($this->_hostLists) && count($this->_hostLists) > 1) {
            //使用基于libketama的一致性hash
            $this->_cacheHandle->setOption(Memcached::OPT_DISTRIBUTION, Memcached::DISTRIBUTION_CONSISTENT);
            //使用MurMur算法，还可以使用 Memcached::HASH_MD5 Memcached::HASH_CRC 算法等
            $this->_cacheHandle->setOption(Memcached::OPT_HASH, Memcached::HASH_MURMUR);
            //如果缓存需要对其他基于libketama的客户端（比如python，urby）在同样的服务端配置下可以透明的访问key，需要开启以下设置。注意调整后，算法会自动变为 Memcached::HASH_MD5，需要注释上面那行
            //$this->_cacheHandle->setOption(Memcached::OPT_LIBKETAMA_COMPATIBLE, true);
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
        //参见 http://cn2.php.net/manual/zh/memcached.expiration.php
        $expire_time = intval($expire_time);
        if ($expire_time < 0 || $expire_time > 2592000) {
            $expire_time = 0;
        }

        $this->_cacheHandle->set($itemkey, $itemvalue, $expire_time);
        if (__DEBUG_MODE__) {
            echo "Memcached::set ".$itemkey."<br>\n";
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
                echo "Memcached::get ".$keyList."<br>\n";
            }
            return $this->_cacheHandle->get($keyList);
        } elseif (is_array($keyList)) {
            if (__DEBUG_MODE__) {
                echo "Memcached::getMulti ".implode(",", $keyList)."<br>\n";
            }
            return $this->_cacheHandle->getMulti($keyList);
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
            echo "Memcached::delete ".$itemkey."<br>\n";
        }

        return true;
    }

    /**
     * 清空Memcached所有数据
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

/* End of file MemcachedDriver.php */
