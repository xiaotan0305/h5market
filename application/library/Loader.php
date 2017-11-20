<?php
/**
 * Project:     搜房网php框架
 * File:        Loader.php
 *
 * <pre>
 * 描述：单例驱动工厂类（核心底层，修改请务必通知）
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
 * 单例驱动工厂类
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
class Loader
{
    /**
     * 单例模式静态变量
     * @var null
     */
    private static $_instance = null;

    /**
     * 数据库工厂初始化
     * @param string $type   类别：masterDB(主库)/slaveDB(从库)
     * @param array  $dbinfo 数据库配置
     * @return null/obj
     */
    public static function dbFactory($type, $dbinfo)
    {
        switch ($type) {
            case "master":
                $dbinfo = self::_getMasterDbInfo($dbinfo);
                $key = $dbinfo['host'].':'.$dbinfo['port']."_".$dbinfo['dbname']."_masterDB_".__METHOD__;
                break;

            case "slave":
                $dbinfo = self::_getSlaveDbInfo($dbinfo);
                $key = $dbinfo['host'].':'.$dbinfo['port']."_".$dbinfo['dbname']."_slaveDB_".__METHOD__;
                break;

            default:
                return null;
        }

        if (isset(self::$_instance[__METHOD__][$key])) {
            return self::$_instance[__METHOD__][$key];
        }

        //链接mysql
        if ($dbinfo['dbtype'] == "mysql") {
            $link = new MysqlDriver($dbinfo);
        } elseif ($dbinfo['dbtype'] == "mssql") {
            $link = new SqlsrvDriver($dbinfo);
        } else {
            throw new Yaf_Exception('数据库支持的类型为 mysql & SQL server，请检查数据库配置文件');
        }
        $errno = $link->getErrno();
        $error = $link->getError();

        if ($errno || $error) {
            return null;
        }

        self::$_instance[__METHOD__][$key] = $link;

        return self::$_instance[__METHOD__][$key];
    }

    /**
     * 获取主库配置
     * @param array $info 主库配置一维数组(单写)
     * @return array
     */
    private static function _getMasterDbInfo($info)
    {
        return $info;
    }

    /**
     * 获取从库配置
     * @todo 目前已经使用vip，如果不支持故障转移，可以在这里实现
     * @param array $info 从库配置二维数组(多读)
     * @return array
     */
    private static function _getSlaveDbInfo($info)
    {
        return $info[0];
    }

    /**
     * 缓存工厂初始化
     * @param array  $info    配置文件二维数组
     * @param string $type    缓存类型，目前支持memcache、yac、redis
     * @param string $channel 频道配置
     * @return obj
     */
    public static function cacheFactory($info, $type, $channel)
    {
        if (isset(self::$_instance[__METHOD__][$type], self::$_instance[__METHOD__][$type][$channel])) {
            return self::$_instance[__METHOD__][$type][$channel];
        } elseif ($type == 'redis') {
            self::$_instance[__METHOD__][$type][$channel] = new RedisDriver($info);
        } elseif ($type == 'yac') {
            self::$_instance[__METHOD__][$type][$channel] = new YacDriver();
        } else {
            if (extension_loaded('memcached')) {
                self::$_instance[__METHOD__][$type][$channel] = new MemcachedDriver($info);
            } else {
                self::$_instance[__METHOD__][$type][$channel] = new MemcacheDriver($info);
            }
        }

        return self::$_instance[__METHOD__][$type][$channel];
    }
}

/* End of file Loader.php */
