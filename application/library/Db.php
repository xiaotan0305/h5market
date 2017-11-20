<?php
/**
 * Project:     搜房网php框架
 * File:        Db.php
 *
 * <pre>
 * 描述：数据库基类
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
 * 数据库基类
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
abstract class Db
{
    /**
     * 参数绑定
     * @var array
     */
    protected $bindings = array(
        'insert' => array(),
        'update' => array(),
        'select' => array(),
        'join'   => array(),
        'where'  => array(),
        'having' => array(),
        'order'  => array(),
    );

    /**
     * 需要的计算sql字段 count min max avg sum
     * @var array
     */
    protected $calculate;

    /**
     * 需要的sql字段
     * @var array
     */
    protected $columns;

    /**
     * 是否启用distinct
     * @var boolean
     */
    protected $distinct = false;

    /**
     * 查询的表
     * @var string
     */
    protected $from;

    /**
     * Join查询
     * @var array
     */
    protected $joins;

    /**
     * Where条件
     * @var array
     */
    protected $wheres;

    /**
     * GroupBy条件
     * @var array
     */
    protected $groups;

    /**
     * Having条件
     * @var array
     */
    protected $havings;

    /**
     * Order条件
     * @var array
     */
    protected $orders;

    /**
     * 跳过的行数
     * @var integer
     */
    protected $offset;

    /**
     * 获取数据行数
     * @var integer
     */
    protected $limit;

    /**
     * 允许使用的where操作
     * @var array
     */
    protected $operators = array(
        '=', '<', '>', '<=', '>=', '<>', '!=',
        'like', 'like binary', 'not like', 'between', 'ilike',
        //'&', '|', '^', '<<', '>>',
        //'rlike', 'regexp', 'not regexp',
        //'~', '~*', '!~', '!~*', 'similar to',
        //'not similar to',
    );

    /**
     * 每页数量
     * @var integer
     */
    protected $pageeach = 20;

    /**
     * 数据库对象
     * @var object
     */
    protected $db = null;

    /**
     * 构造函数
     * @param string $type    链接类别 slave 从库 master 主库
     * @param string $dbflag  数据库标识
     * @param string $subflag 数据库子配置标识
     */
    public function __construct($type = 'slave', $dbflag = 'default', $subflag = null)
    {
        $type == 'slave'?'slave':'master';
        $db = Yaf_Registry::get('db');
        if (isset($db[$dbflag])) {
            $db = $db[$dbflag];
        } else {
            $db = $db['default'];
        }

        if (isset($subflag) && isset($db[$subflag])) {
            $db = $db[$subflag];
        }

        $this->db = Loader::dbFactory($type, $db[$type]);
    }

    /**
     * 设置Select字段
     * @param mixed $columns 字段
     * @return obj
     */
    public function select($columns = ['*'])
    {
        $this->columns = is_array($columns) ? $columns : func_get_args();
        return $this;
    }

    /**
     * 设置开启Distinct查询
     * @return obj
     */
    public function distinct()
    {
        $this->distinct = true;
        return $this;
    }

    /**
     * 设置查询的表
     * @param string $table 表名
     * @return obj
     */
    public function from($table)
    {
        $this->from = $table;
        return $this;
    }

    /**
     * 拼装Join条件
     * @param string $table    链接的表名
     * @param string $one      字段1
     * @param string $operator 操作符
     * @param string $two      字段2
     * @param string $type     join 方式 inner left right
     * @return obj
     */
    public function join($table, $one, $operator, $two, $type = 'inner')
    {
        $this->joins[] = array($table, $one, $operator, $two, $type);
        return $this;
    }

    /**
     * 拼装LeftJoin条件
     * @param string $table    链接的表名
     * @param string $first    字段1
     * @param string $operator 操作符
     * @param string $second   字段2
     * @return obj
     */
    public function leftJoin($table, $first, $operator, $second)
    {
        return $this->join($table, $first, $operator, $second, 'left');
    }

    /**
     * 拼装RightJoin条件
     * @param string $table    链接的表名
     * @param string $first    字段1
     * @param string $operator 操作符
     * @param string $second   字段2
     * @return obj
     */
    public function rightJoin($table, $first, $operator, $second)
    {
        return $this->join($table, $first, $operator, $second, 'right');
    }

    /**
     * 设置Where条件
     * @param mixed  $column   单一字段或复杂查询数组
     * @param string $operator 操作符
     * @param mixed  $value    值
     * @param string $boolean  链接方式 and or
     * @return obj
     */
    public function where($column, $operator, $value, $boolean = 'and')
    {
        //判断嵌套
        if (is_array($column)) {
            return $this->_whereNested($column, $boolean);
        }

        if ($this->_invalidOperatorAndValue($operator, $value)) {
            //错误处理
        }

        //判断null
        if (is_null($value)) {
            return $this->_whereNull($column, $boolean, $operator != '=');
        }

        //添加到where数组
        $type = 'Basic';
        $this->wheres[] = compact('type', 'column', 'operator', 'value', 'boolean');

        $this->_addBinding($value, 'where');

        return $this;
    }

    /**
     * 设置or查询
     * @param mixed  $column   字段名或嵌套查询条件数组
     * @param string $operator 操作符
     * @param mixed  $value    值
     * @return obj
     */
    public function orWhere($column, $operator = null, $value = null)
    {
        return $this->where($column, $operator, $value, 'or');
    }

    /**
     * 设置in查询
     * @param mixed   $column  字段名
     * @param array   $values  值
     * @param string  $boolean 操作符
     * @param boolean $not     是否notin
     * @return obj
     */
    public function whereIn($column, array $values, $boolean = 'and', $not = false)
    {
        $type = $not ? 'NotIn' : 'In';

        $this->wheres[] = compact('type', 'column', 'values', 'boolean');

        $this->_addBinding($values, 'where');

        return $this;
    }

    /**
     * 处理where条件中的NULL
     * @param string  $column  字段名
     * @param string  $boolean 与之前的链接符号
     * @param boolean $not     是否是notnull
     * @return obj
     */
    private function _whereNull($column, $boolean = 'and', $not = false)
    {
        $type = $not ? 'NotNull' : 'Null';
        $this->wheres[] = compact('type', 'column', 'boolean');
        return $this;
    }

    /**
     * 设置嵌套Where查询
     * @param array  $query   嵌套查询条件数组
     * @param string $boolean 链接方式 and or
     * @return obj
     */
    private function _whereNested($query, $boolean = 'and')
    {
        $type = 'Nested';
        $this->wheres[] = compact('type', 'query', 'boolean');
        foreach ($query as $item) {
            $this->_addBinding($item[2], 'where');
        }
        return $this;
    }

    /**
     * 判断操作符号和值是否符合NULL查询
     * @param string $operator 操作符
     * @param mixed  $value    值
     * @return boolean
     */
    private function _invalidOperatorAndValue($operator, $value)
    {
        $isOperator = in_array($operator, $this->operators);
        return $isOperator && $operator != '=' && is_null($value);
    }

    /**
     * 设置Group
     * @return obj
     */
    public function groupBy()
    {
        foreach (func_get_args() as $arg) {
            $this->groups = array_merge((array) $this->groups, is_array($arg) ? $arg : [$arg]);
        }
        return $this;
    }

    /**
     * 设置Having
     * @param string $column   字段名
     * @param string $operator 操作符
     * @param mixed  $value    值
     * @return obj
     */
    public function having($column, $operator = null, $value = null)
    {
        $this->havings[] = array($column, $operator, $value);
        $this->_addBinding($value, 'having');
        return $this;
    }

    /**
     * 设置OrderBy
     * @param string $column    字段名
     * @param string $direction 排序方式 asc desc
     * @return obj
     */
    public function orderBy($column, $direction = 'asc')
    {
        $direction = strtolower($direction) == 'asc' ? 'asc' : 'desc';
        $this->orders[] = array($column, $direction);
        return $this;
    }

    /**
     * 设置需要跳过的数据数量
     * @param integer $value 需要跳过的数据数量
     * @return obj
     */
    public function offset($value)
    {
        $this->offset = max(0, $value);
        return $this;
    }

    /**
     * 设置需要的数据数量
     * @param integer $value 需要的数据数量
     * @return obj
     */
    public function limit($value = 0)
    {
        if ($value > 0) {
            $this->limit = $value;
        }
        return $this;
    }

    /**
     * 分页参数
     * @param intrger $page 页码
     * @return obj
     */
    public function forPage($page = 1)
    {
        return $this->offset(($page - 1) * $this->pageeach)->limit($this->pageeach);
    }

    /**
     * 添加参数绑定
     * @param mixed  $value 变量值或数组
     * @param string $type  绑定变量类型
     * @return obj
     */
    private function _addBinding($value, $type = 'where')
    {
        //判断绑定变量的类别是否存在
        if (! array_key_exists($type, $this->bindings)) {
            exit();//throw;
        }
        if (is_array($value)) {
            $this->bindings[$type] = array_values(array_merge($this->bindings[$type], $value));
        } else {
            $this->bindings[$type][] = $value;
        }
        return $this;
    }

    /**
     * 获取参数绑定
     * @return array
     */
    private function _getBindings()
    {
        $bindings = array();
        //Standard PHP Library (SPL) http://php.net/manual/zh/book.spl.php
        $array = new RecursiveIteratorIterator(new RecursiveArrayIterator($this->bindings));
        foreach ($array as $v) {
            $bindings[] = $v;
        }
        return $bindings;
    }

    /**
     * 插入数据（支持多条）
     * @param array $values 需要插入的数据
     * @return boolean
     */
    public function insert(array $values)
    {
        if (empty($values)) {
            return true;
        }

        //如果传入的参数是一维数组，转化为二维数组
        if (! is_array(reset($values))) {
            $values = [$values];
        } else {
            //防止多个数据键名输入错乱，进行排序处理
            foreach ($values as $key => $value) {
                ksort($value);
                $values[$key] = $value;
            }
        }

        //遍历数组处理字段名和绑定
        foreach ($values as $row) {
            foreach ($row as $value) {
                $this->_addBinding($value, 'insert');
            }
        }

        $params = array('from' => $this->from);
        $sql = $this->db->compileInsert($values, $params);

        $result = $this->db->execute($sql, $this->_getBindings());

        if ($result !== false) {
            $this->_resetQueryParams();
            return $result;
        } else {
            return false;
        }
    }

    /**
     * 插入一条数据并返回自增逐渐ID
     * @param array $values 需要插入的数据
     * @return integer
     */
    public function insertWithId(array $values)
    {
        //确保插入的是一条数据
        if (! is_array(reset($values))) {
            $values = [$values];
        } else {
            exit();//throw;
        }

        //遍历数组处理字段名和绑定
        foreach ($values as $row) {
            foreach ($row as $value) {
                $this->_addBinding($value, 'insert');
            }
        }

        $params = array('from' => $this->from);
        $sql = $this->db->compileInsert($values, $params);

        $this->db->execute($sql, $this->_getBindings());

        $id = $this->db->insertID();

        if (is_numeric($id)) {
            $this->_resetQueryParams();
            return (int) $id;
        } else {
            return $id;
        }
    }

    /**
     * 删除数据
     * @return mixed
     */
    public function delete()
    {
        $params = array(
            'from'   => $this->from,
            'wheres' => $this->wheres
        );
        $sql = $this->db->compileDelete($params);

        if ($this->db->execute($sql, $this->_getBindings()) === true) {
            $this->_resetQueryParams();
            return $this->db->rowCount();
        } else {
            return false;
        }
    }

    /**
     * 更新数据
     * @param array $values 需要更新的数组数据
     * @return mixed
     */
    public function update(array $values)
    {
        //遍历数组处理字段名和绑定
        foreach ($values as $value) {
            $this->_addBinding($value, 'update');
        }

        $params = array(
            'from'   => $this->from,
            'wheres' => $this->wheres,
            'joins'  => $this->joins
        );
        $sql = $this->db->compileUpdate($values, $params);

        if ($this->db->execute($sql, $this->_getBindings()) === true) {
            $this->_resetQueryParams();
            return $this->db->rowCount();
        } else {
            return false;
        }
    }

    /**
     * 字段增加更新
     * @param string  $column 字段
     * @param integer $amount 增加值
     * @param array   $values 其它需要同步更新的字段
     * @return boolean
     */
    public function increment($column, $amount = 1, array $values = array())
    {
        //遍历数组处理字段名和绑定
        foreach ($values as $value) {
            $this->_addBinding($value, 'update');
        }

        $params = array(
            'from'   => $this->from,
            'wheres' => $this->wheres,
            'joins'  => $this->joins
        );
        $sql = $this->db->compileUpdate($values, $params, array('increment' => array($column, abs(intval($amount)))));

        if ($this->db->execute($sql, $this->_getBindings()) === true) {
            $this->_resetQueryParams();
            return $this->db->rowCount();
        } else {
            return false;
        }
    }

    /**
     * 字段减少更新
     * @param string  $column 字段
     * @param integer $amount 增加值
     * @param array   $values 其它需要同步更新的字段
     * @return boolean
     */
    public function decrement($column, $amount = 1, array $values = array())
    {
        //遍历数组处理字段名和绑定
        foreach ($values as $value) {
            $this->_addBinding($value, 'update');
        }

        $params = array(
            'from'   => $this->from,
            'wheres' => $this->wheres,
            'joins'  => $this->joins
        );
        $sql = $this->db->compileUpdate($values, $params, array('decrement' => array($column, abs(intval($amount)))));

        if ($this->db->execute($sql, $this->_getBindings()) === true) {
            $this->_resetQueryParams();
            return $this->db->rowCount();
        } else {
            return false;
        }
    }

    /**
     * Count统计计算
     * @param mixed $columns 字段名
     * @return integer
     */
    public function count($columns = '*')
    {
        if (! is_array($columns)) {
            $columns = [$columns];
        }

        return (int) $this->calculate(__FUNCTION__, $columns);
    }

    /**
     * Min统计计算
     * @param string $column 字段名
     * @return integer
     */
    public function min($column)
    {
        return $this->calculate(__FUNCTION__, [$column]);
    }

    /**
     * Max统计计算
     * @param string $column 字段名
     * @return integer
     */
    public function max($column)
    {
        return $this->calculate(__FUNCTION__, [$column]);
    }

    /**
     * Sum统计计算
     * @param string $column 字段名
     * @return integer
     */
    public function sum($column)
    {
        $result = $this->calculate(__FUNCTION__, [$column]);
        return $result?$result:0;
    }

    /**
     * Avg统计计算
     * @param string $column 字段名
     * @return integer
     */
    public function avg($column)
    {
        return $this->calculate(__FUNCTION__, [$column]);
    }

    /**
     * Count统计计算
     * @param string $function 计算函数名称
     * @param mixed  $columns  字段名
     * @return integer
     */
    protected function calculate($function, $columns)
    {
        $this->calculate = array('function' => $function, 'columns' => $columns);

        $results = $this->get($columns);

        $this->calculate = null;

        if (isset($results[0])) {
            $result = array_change_key_case((array) $results[0]);
            return $result['calculate'];
        }
    }

    /**
     * 获取数据
     * @param array $columns 字段
     * @return mixed
     */
    public function get(array $columns = array('*'))
    {
        if (is_null($this->columns)) {
            $this->columns = $columns;
        }

        $params = array(
            'calculate' => $this->calculate,
            'columns'   => $this->columns,
            'distinct'  => $this->distinct,
            'from'      => $this->from,
            'joins'     => $this->joins,
            'wheres'    => $this->wheres,
            'groups'    => $this->groups,
            'havings'   => $this->havings,
            'orders'    => $this->orders,
            'offset'    => $this->offset,
            'limit'     => $this->limit,
        );

        $sql = $this->_concatenate($this->db->compileComponents($params));

        $result = $this->db->query($sql, $this->_getBindings());

        if ($result !== false) {
            $this->_resetQueryParams();
            return $result;
        } else {
            return false;
        }
    }

    /**
     * 连接sql语句的各个部分
     * @param array $segments sql语句的各部分
     * @return string
     */
    private function _concatenate($segments)
    {
        return implode(' ', array_filter($segments, array($this, '_filterEmpty')));
    }

    /**
     * 过滤为空的数据
     * @param string $value 数据
     * @return string
     */
    private function _filterEmpty($value)
    {
        return (string) $value !== '';
    }

    /**
     * 重置查询参数
     * @return void
     */
    private function _resetQueryParams()
    {
        $this->bindings = array(
            'insert' => array(),
            'update' => array(),
            'select' => array(),
            'join'   => array(),
            'where'  => array(),
            'having' => array(),
            'order'  => array(),
        );
        $this->calculate = null;
        $this->columns = null;
        $this->distinct = false;
        $this->from = null;
        $this->joins = null;
        $this->wheres = null;
        $this->groups = null;
        $this->havings = null;
        $this->orders = null;
        $this->offset = null;
        $this->limit = null;
    }
}

/* End of file Db.php */
