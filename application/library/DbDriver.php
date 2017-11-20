<?php
/**
 * Project:     搜房网php框架
 * File:        DbDriver.php
 *
 * <pre>
 * 描述：Db驱动（核心底层，修改请务必通知）
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
 * Db驱动
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
abstract class DbDriver
{
    /**
     * 用户名
     * @var string
     */
    protected $user = "";

    /**
     * 密码
     * @var string
     */
    protected $pwd = "";

    /**
     * 连接串
     * @var string
     */
    protected $dsn = "";

    /**
     * Pdo选项变量
     * @var array
     */
    protected $options = "";

    /**
     * 链接句柄
     * @var obj
     */
    protected $obj;

    /**
     * 执行句柄
     * @var obj
     */
    protected $query_obj;

    /**
     * 查询次数
     * @var integer
     */
    protected $queryTimes = 0;

    /**
     * 执行次数
     * @var integer
     */
    protected $executeTimes = 0;

    /**
     * 一个事务中的执行次数
     * @var integer
     */
    protected $transactionTimes = 0;

    /**
     * 错误代码
     * @var integer
     */
    protected $errno = 0;

    /**
     * 错误信息
     * @var string
     */
    protected $error = "";

    /**
     * 查询操作需要操作的部分
     * @var array
     */
    protected $selectComponents = array(
        'calculate','columns','from','joins','wheres',
        'groups','havings','orders','limit','offset',
    );

    /**
     * 构造函数
     * @param string $dsn     pdo连接串
     * @param string $user    用户名
     * @param string $pwd     密码
     * @param string $options pdo自定义执行参数
     * @return void
     */
    public function __construct($dsn, $user, $pwd, array $options = array())
    {
        if (!extension_loaded('PDO')) {
            throw new Yaf_Exception('Failed to load PDO extension');
        }

        //默认参数，没有设置超时，dblib不支持，mysql在使用mysqlnd作为连接器时，需要设置default_socket_timeout
        $pdo_driver_options = array(
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        );
        //合并默认参数和自定义参数
        if (is_array($options) && count($options) > 0) {
            $options = $pdo_driver_options + $options;
        } else {
            $options = $pdo_driver_options;
        }

        $this->dsn = $dsn;
        $this->user = $user;
        $this->pwd = $pwd;
        $this->options = $options;
        //设置为自动连接
        $this->connect();
    }

    /**
     * 链接数据库
     * @param boolean $isreconnect 是否是重连
     * @return void
     */
    public function connect($isreconnect = false)
    {
        //初始化错误信息
        $this->_clearError();

        $timeStart = microtime(true);
        //添加连接 or 重连日志
        if ($isreconnect === false) {
            $file_log = new Log('db_connect');
        } else {
            $file_log = new Log('db_reconnect');
        }

        try {
            $this->obj = new PDO($this->dsn, $this->user, $this->pwd, $this->options);
        } catch (PDOException $e) {
            $file_log->fileWrite("failed to connect db dsn:".$this->dsn.", error: ".$e->getMessage());

            //retry connect to the database
            try {
                $this->obj = new PDO($this->dsn, $this->user, $this->pwd, $this->options);
                $file_log->fileWrite("retry ok dsn:".$this->dsn);
            } catch (PDOException $e) {
                $file_log->fileWrite("retry failed dsn:".$this->dsn." ".$e->getMessage());
                throw new Yaf_Exception('Failed to connect db dsn:'.$this->dsn.', error:'.$e->getMessage());
            }
        }

        if (__DEBUG_MODE__) {
            echo "<b> ".__CLASS__." connect ok</b> dsn:".$this->dsn."<br />\n";
        }

        //添加重连日志
        if ($isreconnect === true) {
            $file_log->fileWrite("connect ok dsn:".$this->dsn);
        }

        //记录连接时间超过0.1s行为
        if ((microtime(true) - $timeStart) > 0.1) {
            $file_log->fileWrite("connect ok dsn:".$this->dsn.' uses '.(microtime(true) - $timeStart).' second.');
        }
    }

    /**
     * 执行查询 非事务SQL 并返回数据集
     * @param string $sql      sql语句
     * @param array  $bindings 绑定数据
     * @return false/array
     */
    public function query($sql, array $bindings)
    {
        //释放上一次的数据集
        $this->_freeResult();

        //初始化错误信息
        $this->_clearError();
        $this->queryTimes++;
        $timeStart = microtime(true);

        try {
            $this->query_obj = $this->obj->prepare($sql);
        } catch (PDOException $e) {
            throw new Yaf_Exception('Failed to prepare db dsn:'.$this->dsn.', error:'.$e->getMessage());
        }

        if (!$this->query_obj->execute($bindings)) {
            $errorInfo = $this->query_obj->errorInfo();
            $this->_setErrno($errorInfo[1]);
            $this->_setError($errorInfo[2]);
            //判断错误类型是否需要重连
            if ($this->_tryAgainIfCausedByLostConnection() === true) {
                $this->connect(true);
                $this->_clearError();
                $this->query_obj = $this->obj->prepare($sql);
                if (!$this->query_obj->execute($bindings)) {
                    $errorInfo = $this->query_obj->errorInfo();
                    $this->_setErrno($errorInfo[1]);
                    $this->_setError($errorInfo[2]);
                    throw new Yaf_Exception('Failed to query after reconnect db dsn:'.$this->dsn.', error:'.$errorInfo[2], $errorInfo[1]);
                }
            } else {
                throw new Yaf_Exception('Failed to query db dsn:'.$this->dsn.', error:'.$errorInfo[2], $errorInfo[1]);
            }
        }

        if (__DEBUG_MODE__) {
            echo "SQL: ".$this->_parseSql($sql, $bindings)." <b> ".__CLASS__." query OK </b>".' uses '.(microtime(true) - $timeStart).' second.<br/>';
        }

        if ((microtime(true) - $timeStart) > 2) {
            //添加mysql慢查询日志
            $file_log = new Log('db_slow_query');
            $file_log->fileWrite("SQL: ".$this->_parseSql($sql, $bindings)." ".' uses '.(microtime(true) - $timeStart).' second.');
        }

        return $this->_fetchAll();
    }

    /**
     * 执行查询 事务SQL
     * @param string $sql      sql语句
     * @param array  $bindings 绑定数据
     * @return boolean
     */
    public function execute($sql, array $bindings)
    {
        //释放上一次的数据集
        $this->_freeResult();

        //初始化错误信息
        $this->_clearError();
        $this->executeTimes++;
        $timeStart = microtime(true);

        try {
            $this->query_obj = $this->obj->prepare($sql);
        } catch (PDOException $e) {
            throw new Yaf_Exception('Failed to prepare db dsn:'.$this->dsn.', error:'.$e->getMessage());
        }

        if (!$this->query_obj->execute($bindings)) {
            $errorInfo = $this->query_obj->errorInfo();
            $this->_setErrno($errorInfo[1]);
            $this->_setError($errorInfo[2]);
            //判断错误类型是否需要重连
            if ($this->_tryAgainIfCausedByLostConnection() === true) {
                $this->connect(true);
                $this->_clearError();
                $this->query_obj = $this->obj->prepare($sql);
                if (!$this->query_obj->execute($bindings)) {
                    $errorInfo = $this->query_obj->errorInfo();
                    $this->_setErrno($errorInfo[1]);
                    $this->_setError($errorInfo[2]);
                    throw new Yaf_Exception('Failed to execute after reconnect db dsn:'.$this->dsn.', error:'.$errorInfo[2], $errorInfo[1]);
                }
            } else {
                throw new Yaf_Exception('Failed to execute db dsn:'.$this->dsn.', error:'.$errorInfo[2], $errorInfo[1]);
            }
        }

        if (__DEBUG_MODE__) {
            echo "SQL: ".$this->_parseSql($sql, $bindings)." <b> ".__CLASS__." query OK </b>".' uses '.(microtime(true) - $timeStart).' second.<br/>';
        }

        if ((microtime(true) - $timeStart) > 2) {
            //添加mysql慢查询日志
            $file_log = new Log('db_slow_execute');
            $file_log->fileWrite("SQL: ".$this->_parseSql($sql, $bindings)." ".' uses '.(microtime(true) - $timeStart).' second.');
        }

        return true;
    }

    /**
     * 断线重试判断
     * @return boolean
     */
    private function _tryAgainIfCausedByLostConnection()
    {
        //断线错误信息特征字符串数组
        $msg_array = array(
            'server has gone away',
            'no connection to the server',
            'Lost connection',
            'is dead or not enabled',
        );

        $flag = false;
        foreach ($msg_array as $msg) {
            if (strpos($this->error, $msg) !== false) {
                $flag = true;
            }
        }
        return $flag;
    }

    /**
     * 获取数据库所有表名（实现方法在各子类）
     * @return array
     */
    public function getDbTables()
    {

    }

    /**
     * 获取数据库某一张表的结构（实现方法在各子类）
     * @return array
     */
    public function getTableFields()
    {

    }

    /**
     * 启动事务
     * @return boolean
     */
    public function beginTransaction()
    {
        //数据rollback 支持
        if ($this->transactionTimes == 0) {
            if (!$this->obj->beginTransaction()) {
                $errorInfo = $this->obj->errorInfo();
                $this->_setErrno($errorInfo[1]);
                $this->_setError($errorInfo[2]);
                //判断错误类型是否需要重连
                if ($this->_tryAgainIfCausedByLostConnection() === true) {
                    $this->connect(true);
                    $this->_clearError();
                    if (!$this->obj->beginTransaction()) {
                        $errorInfo = $this->obj->errorInfo();
                        $this->_setErrno($errorInfo[1]);
                        $this->_setError($errorInfo[2]);
                        throw new Yaf_Exception('Failed to beginTransaction after reconnect db dsn:'.$this->dsn.', error:'.$errorInfo[2], $errorInfo[1]);
                    }
                } else {
                    throw new Yaf_Exception('Failed to beginTransaction db dsn:'.$this->dsn.', error:'.$errorInfo[2], $errorInfo[1]);
                }
            }
        }
        $this->transactionTimes++;
    }

    /**
     * 提交事务
     * @return boolean
     */
    public function commit()
    {
        if ($this->transactionTimes > 0) {
            $this->transactionTimes = 0;
            if ($this->obj->commit() === false) {
                $errorInfo = $this->obj->errorInfo();
                $this->_setErrno($errorInfo[1]);
                $this->_setError($errorInfo[2]);
                throw new Yaf_Exception('Failed to commit db dsn:'.$this->dsn.', error:'.$errorInfo[2], $errorInfo[1]);
            }
        }
        return true;
    }

    /**
     * 回滚事务
     * @return boolean
     */
    public function rollback()
    {
        if ($this->transactionTimes > 0) {
            $this->transactionTimes = 0;
            if ($this->obj->rollback() === false) {
                $errorInfo = $this->obj->errorInfo();
                $this->_setErrno($errorInfo[1]);
                $this->_setError($errorInfo[2]);
                throw new Yaf_Exception('Failed to rollback db dsn:'.$this->dsn.', error:'.$errorInfo[2], $errorInfo[1]);
            }
        }
        return true;
    }

    /**
     * 返回最后插入行的ID或序列值
     * @return mixed
     */
    public function insertID()
    {
        return $this->obj->lastInsertId();
    }

    /**
     * 返回受上一个 SQL 语句影响的行数
     * @return integer
     */
    public function rowCount()
    {
        return $this->query_obj->rowCount();
    }

    /**
     * 返回全部结果集
     * @return array
     */
    private function _fetchAll()
    {
        return $this->query_obj->fetchAll();
    }

    /**
     * 释放查询结果
     * @return void
     */
    private function _freeResult()
    {
        $this->query_obj = null;
    }

    /**
     * 返回查询次数
     * @return integer
     */
    public function getQueryTimes()
    {
        return $this->queryTimes;
    }

    /**
     * 返回执行次数
     * @return integer
     */
    public function getExecuteTimes()
    {
        return $this->executeTimes;
    }

    /**
     * 返回同一事物中执行次数
     * @return integer
     */
    public function getTransactionTimes()
    {
        return $this->transactionTimes;
    }

    /**
     * 设置错误编号
     * @param integer $errno 错误编号
     * @return void
     */
    private function _setErrno($errno)
    {
        $this->errno = intval($errno);
    }

    /**
     * 设置错误描述
     * @param string $error 错误描述
     * @return void
     */
    private function _setError($error)
    {
        $this->error = $error;
    }

    /**
     * 返回错误编号
     * @return integer
     */
    public function getErrno()
    {
        return $this->errno;
    }

    /**
     * 返回错误描述
     * @return string
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * 初始化错误信息
     * @return void
     */
    private function _clearError()
    {
        $this->errno = "";
        $this->error = "";
    }

    /**
     * 返回数据库名称
     * @return string
     */
    public function getdbname()
    {
        return $this->dbname;
    }

    /**
     * 获取链接数据库的版本
     * @return string
     */
    public function getVersion()
    {
        return $this->obj->getAttribute(PDO::ATTR_SERVER_VERSION);
    }

    /**
     * 字符串过滤
     * @todo 如果PDO::quote支持的不好，可以直接使用addslashes替代，或者在子类里面自己实现
     * @param string $str SQL字符串
     * @return string
     */
    public function escapeString($str)
    {
        //return addslashes($str);
        if (is_int($str)) {
            return $str;
        } elseif (is_null($str)) {
            return $this->obj->quote($str, PDO::PARAM_NULL);
        } elseif (is_bool($str)) {
            return $this->obj->quote($str, PDO::PARAM_BOOL);
        } else {
            return $this->obj->quote($str, PDO::PARAM_STR);
        }
    }

    /**
     * 拼装sql语句各个部分
     * @param array $params 表、条件等参数
     * @return string
     */
    public function compileComponents(array $params)
    {
        $sql = [];

        foreach ($this->selectComponents as $component) {
            if (! is_null($params[$component])) {
                $method = 'compile'.ucfirst($component);
                $sql[$component] = $this->$method($params);
            }
        }

        return $sql;
    }

    /**
     * 拼装计算语句 count sum avg min max
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileCalculate(array $params)
    {
        $column = implode(', ', array_map([$this, 'wrap'], $params['calculate']['columns']));

        if ($params['distinct'] && $column !== '*') {
            $column = 'DISTINCT '.$column;
        }

        return 'SELECT '.strtoupper($params['calculate']['function']).'('.$column.') AS calculate';
    }

    /**
     * 拼装需要获取的查询字段
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileColumns(array $params)
    {
        if (! is_null($params['calculate'])) {
            return;
        }

        $select = $params['distinct'] ? 'SELECT DISTINCT ' : 'SELECT ';
        return $select.implode(', ', array_map([$this, 'wrap'], $params['columns']));
    }

    /**
     * 拼装表名
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileFrom(array $params)
    {
        return 'FROM '.$this->wrap($params['from']);
    }

    /**
     * 拼装join
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileJoins(array $params)
    {
        $sql = [];

        foreach ($params['joins'] as $value) {
            $sql[] = strtoupper($value[4].' JOIN ').$this->wrap($value[0]).' ON '.$this->wrap($value[1]).' '.$value[2].' '.$this->wrap($value[3]);
        }

        return implode(' ', $sql);
    }

    /**
     * 拼装where条件
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileWheres(array $params)
    {
        $sql = [];

        if (is_null($params['wheres'])) {
            return '';
        }

        foreach ($params['wheres'] as $where) {
            $method = "compileWhere{$where['type']}";
            $sql[] = strtoupper($where['boolean']).' '.$this->$method($where);
        }

        if (count($sql) > 0) {
            $sql = implode(' ', $sql);
            return 'WHERE '.$this->_removeLeadingBoolean($sql);
        }

        return '';
    }

    /**
     * 处理where条件中的基础部分
     * @param array $where where查询条件
     * @return string
     */
    protected function compileWhereBasic($where)
    {
        return $this->wrap($where['column']).' '.$where['operator'].' ?';
    }

    /**
     * 处理where条件中的嵌套部分
     * @param array $where where查询条件
     * @return string
     */
    protected function compileWhereNested($where)
    {
        $sql = [];

        //使用基础查询方法，处理嵌套查询中的每一组条件
        foreach ($where['query'] as $value) {
            $sql[] = $this->compileWhereBasic(array('column' => $value[0], 'operator' => $value[1]));
        }

        return '('.implode(' AND ', $sql).')';
    }

    /**
     * 处理where条件中的null条件
     * @param array $where where查询条件
     * @return string
     */
    protected function compileWhereNull($where)
    {
        return $this->wrap($where['column']).' IS NULL';
    }

    /**
     * 处理where条件中的notnull条件
     * @param array $where where查询条件
     * @return string
     */
    protected function compileWhereNotNull($where)
    {
        return $this->wrap($where['column']).' IS NOT NULL';
    }

    /**
     * 处理where条件中的in条件
     * @param array $where where查询条件
     * @return string
     */
    protected function compileWhereIn($where)
    {
        $values = '?'.str_repeat(',?', (count($where['values']) - 1));
        return $this->wrap($where['column']).' IN ('.$values.')';
    }

    /**
     * 处理where条件中的notin条件
     * @param array $where where查询条件
     * @return string
     */
    protected function compileWhereNotIn($where)
    {
        $values = '?'.str_repeat(',?', (count($where['values']) - 1));
        return $this->wrap($where['column']).' NOTIN ('.$values.')';
    }

    /**
     * 拼装group
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileGroups(array $params)
    {
        return 'GROUP BY '.implode(', ', array_map([$this, 'wrap'], $params['groups']));
    }

    /**
     * 拼装having
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileHavings(array $params)
    {
        $sql = [];

        //使用基础查询方法，处理嵌套查询中的每一组条件
        foreach ($params['havings'] as $value) {
            $sql[] = $this->compileWhereBasic(array('column' => $value[0], 'operator' => $value[1]));
        }

        return 'HAVING '.implode(' AND ', $sql);
    }

    /**
     * 拼装orderby
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileOrders(array $params)
    {
        $sql = [];

        foreach ($params['orders'] as $order) {
            $sql[] = $this->wrap($order[0]).' '.strtoupper($order[1]);
        }

        return 'ORDER BY '.implode(', ', $sql);
    }

    /**
     * 拼装数据行数
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileLimit(array $params)
    {
        return 'LIMIT '.(int) $params['limit'];
    }

    /**
     * 拼装跳过行数，mysql也是支持offset语法的 https://dev.mysql.com/doc/refman/5.0/en/select.html
     * @param array $params 表、条件等参数
     * @return string
     */
    protected function compileOffset(array $params)
    {
        return 'OFFSET '.(int) $params['offset'];
    }

    /**
     * 拼装插入数据语句
     * @param array $values 需要插入的数据
     * @param array $params 表、条件等参数
     * @return string
     */
    public function compileInsert(array $values, array $params)
    {
        $columns = array_map([$this, 'wrap'], array_keys(reset($values)));

        $data = array();

        foreach ($values as $value) {
            //所有的值都用 ? 代替，也就是在 ? 后面填充 $value 数组内元素个数 -1 个 ,?
            $data[] = '(?'.str_repeat(',?', (count($value) - 1)).')';
        }

        return 'INSERT INTO '.$this->wrap($params['from']).' ('.implode(',', $columns).') VALUES '.implode(', ', $data);
    }

    /**
     * 拼装删除语句
     * @param array $params 表、条件等参数
     * @return boolean
     */
    public function compileDelete(array $params)
    {
        $where = is_array($params['wheres']) ? $this->compileWheres($params) : '';

        return 'DELETE FROM '.$this->wrap($params['from']).' '.$where;
    }

    /**
     * 拼装更新数据语句
     * @param array $values  需要插入的数据
     * @param array $params  表、条件等参数
     * @param array $crement 增大或减少类型的更新
     * @return string
     */
    public function compileUpdate(array $values, array $params, array $crement = array())
    {
        $columns = [];

        if (isset($crement['increment']) || isset($crement['decrement'])) {
            $crement_key = array_keys($crement);
            $crement_value = reset($crement);
            $crement_do = $crement_key[0] == 'increment'?'+':'-';
            $columns[] = $this->wrap($crement_value[0]).' = '.$this->wrap($crement_value[0]).' '.$crement_do.' '.$crement_value[1];
        }

        foreach ($values as $key => $value) {
            $columns[] = $this->wrap($key).' = ?';
        }

        $columns = implode(', ', $columns);

        if (isset($params['joins'])) {
            $joins = ' '.$this->compileJoins($params);
        } else {
            $joins = '';
        }

        $where = $this->compileWheres($params);

        return 'UPDATE '.$this->wrap($params['from']).$joins.' SET '.$columns.' '.$where;
    }

    /**
     * 包裹
     * @todo 这里可以考虑增加表前缀功能
     * @param string $value 表名
     * @return string
     */
    protected function wrap($value)
    {
        if (strpos(strtolower($value), ' as ') !== false) {
            $segments = explode(' ', $value);

            return $this->wrapValue($segments[0]).' AS '.$this->wrapValue($segments[2]);
        } else {
            $wrapped = [];
            //处理带 table.column 这种数据
            $segments = explode('.', $value);

            //对其中的 table 和 column 都做处理
            foreach ($segments as $key => $segment) {
                $wrapped[] = $this->wrapValue($segment);
            }

            return implode('.', $wrapped);
        }
    }

    /**
     * 包裹字段名，不同的db子类需要重载这个方法，比如mysql需要 `` 包裹，sqlsrv 需要 [] 包裹
     * @param string $value 字段名
     * @return string
     */
    protected function wrapValue($value)
    {
        if ($value === '*') {
            return $value;
        }

        return '"'.str_replace('"', '""', $value).'"';
    }

    /**
     * 取出头部的where条件连接符
     * @param string $value 查询条件
     * @return string
     */
    private function _removeLeadingBoolean($value)
    {
        return preg_replace('/AND |OR /', '', $value, 1);
    }

    /**
     * 解析预处理sql
     * @param string $sql      预处理sql
     * @param array  $bindings 绑定的变量
     * @return string
     */
    private function _parseSql($sql, $bindings)
    {
        $sql_pieces = explode('?', $sql);

        //按照分隔符分割出的片段，应该和绑定数量+1一致
        if (count($sql_pieces) != (count($bindings) + 1)) {
            return $sql.';'.' params('.implode(', ', $bindings).')';
        }

        $parse_sql = "";
        foreach ($sql_pieces as $sql_piece) {
            $binding = array_shift($bindings);
            $parse_sql .= $sql_piece.$this->escapeString($binding);
        }

        //因为 count($sql_pieces) ＝ count($bindings) + 1，所以最后一定会多''，处理掉返回结果
        return preg_replace('/\'\'$/', '', $parse_sql).";";
    }
}

/* End of file DbDriver.php */
