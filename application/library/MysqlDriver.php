<?php
/**
 * Project:     搜房网php框架
 * File:        MysqlDriver.php
 *
 * <pre>
 * 描述：Mysql数据库驱动（核心底层，修改请务必通知）
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
 * Mysql数据库驱动
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
class MysqlDriver extends DbDriver
{
    /**
     * 构造函数
     * @param array $config 数据库配置信息
     */
    public function __construct($config)
    {
        if (!extension_loaded('pdo_mysql')) {
            throw new Yaf_Exception('Failed to load pdo_mysql extension');
        }

        $dsn = $config['dbtype'].':host='.$config['host'].';port='.$config['port'].';dbname='.$config['dbname'].';charset='.$config['charset'].';';
        $options[PDO::MYSQL_ATTR_INIT_COMMAND] = 'SET NAMES '.$config['charset'].';';
        //使用mysqlnd作为连接底层时，使用socket方式创建连接，连接超时受socket超时设置控制
        //http://stackoverflow.com/questions/29493197/phps-pdo-is-ignoring-the-attr-timeout-option-for-mysql-when-server-cannot-be-re
        //http://php.net/manual/en/mysqlnd.notes.php
        if (extension_loaded('mysqlnd')) {
            ini_set("default_socket_timeout", 5);
        } else {
            $options[PDO::ATTR_TIMEOUT] = 5;
        }

        parent::__construct($dsn, $config['user'], $config['pwd'], $options);
    }

    /**
     * 包裹表名，重载父类中的同名方法
     * @param string $value 表名
     * @return string
     */
    protected function wrapValue($value)
    {
        if ($value === '*') {
            return $value;
        }
        return '`'.str_replace('`', '``', $value).'`';
    }

    /**
     * 获取数据库所有表名（实现方法在各子类）
     * @return array
     */
    public function getDbTables()
    {
        $sql = 'SHOW TABLES';

        return $this->query($sql);
    }

    /**
     * 获取数据库某一张表的结构（实现方法在各子类）
     * @return array
     */
    public function getTableFields()
    {
        $sql = 'DESC '.$this->wrap($this->from);

        return $this->query($sql);
    }
}

/* End of file MysqlDriver.php */
