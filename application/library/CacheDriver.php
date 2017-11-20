<?php
/**
 * Project:     手机搜房
 * File:        CacheDriver.php
 *
 * <pre>
 * 描述：Cache 底层驱动（核心底层，修改请务必通知）
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
 * Cache 底层驱动
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
abstract class CacheDriver
{
    /**
     * 通过魔术函数，实现读取不可访问属性
     * @param string $name 参数名
     * @return mixed
     */
    public function __get($name)
    {
        return $this->get($name);
    }

    /**
     * 通过魔术函数，给不可访问属性赋值
     * @param string $name  参数名
     * @param mixed  $value 值
     * @return boolean
     */
    public function __set($name, $value)
    {
        return $this->set($name, $value);
    }

    /**
     * 通过魔术函数，删除不可访问属性
     * @param string $name 参数名
     * @return boolean
     */
    public function __unset($name)
    {
        return $this->delete($name);
    }
}

/* End of file CacheDriver.php */
