<?php
/**
 * Project:     搜房网php框架
 * File:        SqlsrvDriver.php
 *
 * <pre>
 * 描述：Sqlsrv数据库驱动（核心底层，修改请务必通知）
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
 * Sqlsrv数据库驱动
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
class SqlsrvDriver extends DbDriver
{
    /**
     * 查询操作需要操作的部分
     * @var array
     */
    protected $selectComponents = array(
        'calculate','columns','from','joins','wheres',
        'groups','havings','orders','offset','limit',
    );

    /**
     * 构造函数
     * @param array $config 数据库配置信息
     */
    public function __construct($config)
    {
        if (!extension_loaded('pdo_sqlsrv') && !extension_loaded('pdo_dblib')) {
            throw new Yaf_Exception('Failed to load pdo_dblib or pdo_sqlsrv extension');
        }

        //Linux平台使用freetds连接mssql处理
        if (extension_loaded('pdo_dblib')) {
            $dsn = 'dblib:host='.$config['host'].':'.$config['port'].';dbname='.$config['dbname'].';';
            $options = array();
        } elseif (extension_loaded('pdo_sqlsrv')) { //Windows平台使用微软sqlsrv连接mssql处理
            $dsn = 'sqlsrv:Server='.$config['host'].','.$config['port'].';Database='.$config['dbname'].';';
            $options[PDO::SQLSRV_ATTR_ENCODING] = PDO::SQLSRV_ENCODING_SYSTEM;
        }

        parent::__construct($dsn, $config['user'], $config['pwd'], $options);
    }

    /**
     * 拼装跳过行数，重载父类中的同名方法
     * @param array $params 表、条件等参数
     * @return integer
     */
    protected function compileOffset(array $params)
    {
        return 'OFFSET '.(int) $params['offset'].' ROWS';
    }

    /**
     * 拼装数据行数，重载父类中的同名方法，重载父类中的同名方法
     * @param array $params 表、条件等参数
     * @return integer
     */
    protected function compileLimit(array $params)
    {
        return 'FETCH NEXT '.(int) $params['limit'].' ROWS ONLY';
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
        return '['.str_replace(']', ']]', $value).']';
    }

    /**
     * 获取数据库所有表名（实现方法在各子类）
     * @return array
     */
    public function getDbTables()
    {
        $sql = 'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'';

        return $this->query($sql);
    }

    /**
     * 获取数据库某一张表的结构（实现方法在各子类）
     * @return array
     */
    public function getTableFields()
    {
        $sql = "SELECT column_name, data_type, column_default, is_nullable 
        FROM information_schema.tables AS t
        JOIN information_schema.columns AS c
        ON  t.table_catalog = c.table_catalog
        AND t.table_schema  = c.table_schema
        AND t.table_name    = c.table_name
        WHERE  t.table_name = '".$this->wrap($this->from)."'";

        return $this->query($sql);
    }
}

/* End of file SqlsrvDriver.php */
