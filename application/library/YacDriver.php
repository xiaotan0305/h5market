<?php
/**
 * Project:     搜房网php框架
 * File:        YacDriver.php
 *
 * <pre>
 * 描述：Yac 底层驱动（核心底层，修改请务必通知）
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
 * Yac 底层驱动
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
class YacDriver extends CacheDriver
{
    /**
     * Yac链接句柄
     * @var array
     */
    private $_cacheHandle = null;

    /**
     * 构造函数
     */
    public function __construct()
    {
        if (!extension_loaded('yac')) {
            throw new Yaf_Exception('Failed to load yac extension');
        }

        $this->_cacheHandle = new Yac();

        if (__DEBUG_MODE__) {
            echo "<b>Yac::__construct() ok</b><br>\n";
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

        $itemkey = $this->_keyLengthCut($itemkey);

        $this->_cacheHandle->set($itemkey, $itemvalue, $expire_time);
        if (__DEBUG_MODE__) {
            echo "Yac::set ".$itemkey."<br>\n";
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
        $keyList = $this->_keyLengthCut($keyList);

        if (__DEBUG_MODE__) {
            if (is_string($keyList)) {
                echo "Yac::get ".$keyList."<br>\n";
            } elseif (is_array($keyList)) {
                echo "Yac::get multi key ".implode(",", $keyList)."<br>\n";
            }
        }
        
        return $this->_cacheHandle->get($keyList);
    }

    /**
     * 删除指定元素key的内容
     * @param  string $itemkey 元素的key
     * @return true
     */
    public function delete($itemkey)
    {
        $itemkey = $this->_keyLengthCut($itemkey);

        if (__DEBUG_MODE__) {
            echo "Yac::delete ".$itemkey."<br>\n";
        }

        return $this->_cacheHandle->delete($itemkey);
    }

    /**
     * 键名长度处理
     * @param  string|array $itemkey 键名
     * @return string
     */
    private function _keyLengthCut($itemkey)
    {
        if (is_string($itemkey)) {
            $itemkey = trim($itemkey);

            //yac的key最长48位，大于这个长度的进行md5处理
            if (strlen($itemkey) > 48) {
                $itemkey = md5($itemkey);
            }
        } elseif (is_array($itemkey)) {
            foreach ($itemkey as $key => $value) {
                $itemkey[$key] = $this->_keyLengthCut($value);
            }
        }

        return $itemkey;
    }

    /**
     * 清空Yac所有数据
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

/* End of file YacDriver.php */
