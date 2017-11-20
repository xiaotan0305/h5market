<?php
/**
 * Project:     搜房网php框架
 * File:        ZK.php
 *
 * <pre>
 * 描述：Zookeeper操作基类
 * PHP Zookeeper
 * PHP Version 5.3
 * The PHP License, version 3.01
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     Lorenzo Alberton <l.alberton@quipo.it>
 * @copyright  2012 PHP Group
 * @license    http://www.php.net/license The PHP License, version 3.01
 * @link       https://github.com/andreiz/php-zookeeper
 */

/**
 * 描述：Zookeeper操作基类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     Lorenzo Alberton <l.alberton@quipo.it>
 * @copyright  2012 PHP Group
 * @license    http://www.php.net/license The PHP License, version 3.01
 * @link       https://github.com/andreiz/php-zookeeper
 */
class ZK
{
    /**
     * 缓存对象句柄
     * @var obj
     */
    private $_zookeeper;

    /**
     * 回调容器
     * @var array
     */
    private $_callback = array();

    /**
     * 构造函数
     * @param string $address CSV list of host:port values (e.g. "host1:2181,host2:2181")
     */
    public function __construct($channel = 'default')
    {
        $config = Yaf_Registry::get('zk');

        if (!isset($config[$channel])) {
            $channel = 'default';
        }

        $address = '';
        foreach ($config[$channel] as $value) {
            $prefix = ($address == '')?'':',';
            $address .= $prefix.$value['host'].':'.$value['port'];
        }

        try {
            $this->_zookeeper = new Zookeeper($address);
        } catch (Exception $e) {
            throw new Yaf_Exception($e);
        }
    }

    /**
     * Set a node to a value. If the node doesn't exist yet, it is created.
     * Existing values of the node are overwritten
     * @param  string $path  The path to the node
     * @param  mixed  $value The new value for the node
     * @return mixed previous value if set, or null
     */
    public function set($path, $value)
    {
        if (!$this->_zookeeper->exists($path)) {
            $this->makePath($path);
            $this->makeNode($path, $value);
        } else {
            $this->_zookeeper->set($path, $value);
        }
    }

    /**
     * Equivalent of "mkdir -p" on ZooKeeper
     * @param  string $path  The path to the node
     * @param  string $value The value to assign to each new node along the path
     * @return bool
     */
    public function makePath($path, $value = '')
    {
        $parts = explode('/', $path);
        $parts = array_filter($parts);
        $subpath = '';
        while (count($parts) > 1) {
            $subpath .= '/' . array_shift($parts);
            if (!$this->_zookeeper->exists($subpath)) {
                $this->makeNode($subpath, $value);
            }
        }
    }

    /**
     * Create a node on ZooKeeper at the given path
     * @param  string $path   The path to the node
     * @param  string $value  The value to assign to the new node
     * @param  array  $params Optional parameters for the Zookeeper node.
     *                       By default, a public node is created
     * @return string the path to the newly created node or null on failure
     */
    public function makeNode($path, $value, array $params = array())
    {
        if (empty($params)) {
            $params = array(
                array(
                    'perms'  => Zookeeper::PERM_ALL,
                    'scheme' => 'world',
                    'id'     => 'anyone',
                )
            );
        }
        return $this->_zookeeper->create($path, $value, $params);
    }

    /**
     * Get the value for the node
     * @param  string $path the path to the node
     * @return string|null
     */
    public function get($path)
    {
        if (!$this->_zookeeper->exists($path)) {
            return null;
        }
        return $this->_zookeeper->get($path);
    }

    /**
     * List the children of the given path, i.e. the name of the directories
     * within the current node, if any
     * @param  string $path the path to the node
     * @return array the subpaths within the given node
     */
    public function getChildren($path)
    {
        if (strlen($path) > 1 && preg_match('@/$@', $path)) {
            // remove trailing /
            $path = substr($path, 0, -1);
        }
        return $this->_zookeeper->getChildren($path);
    }

    /**
     * Delete the node if it does not have any children
     * @param  string $path the path to the node
     * @return true if node is deleted else null
     */
    public function deleteNode($path)
    {
        if (!$this->_zookeeper->exists($path)) {
             return null;
        } else {
            return $this->_zookeeper->delete($path);
        }
    }

    /**
     * Wath a given path
     * @param  string $path the path to node
     * @param  callable $callback callback function
     * @return string|null
     */
    public function watch($path, $callback)
    {
        if (!is_callable($callback)) {
            return null;
        }

        if ($this->_zookeeper->exists($path)) {
            if (!isset($this->_callback[$path])) {
                $this->_callback[$path] = array();
            }
            if (!in_array($callback, $this->_callback[$path])) {
                $this->_callback[$path][] = $callback;
                return $this->_zookeeper->get($path, array($this, 'watchCallback'));
            }
        }
    }

    /**
     * Wath event callback warper
     * @param  integer $event_type
     * @param  integer $stat
     * @param  string  $path
     * @return the return of the callback or null
     */
    public function watchCallback($event_type, $stat, $path)
    {
        if (!isset($this->_callback[$path])) {
            return null;
        }

        foreach ($this->_callback[$path] as $callback) {
            $this->_zookeeper->get($path, array($this, 'watchCallback'));
            return call_user_func($callback);
        }
    }

    /**
     * Delete watch callback on a node, delete all callback when $callback is null
     * @param  string   $path
     * @param  callable $callback
     * @return boolean|null
     */
    public function cancelWatch($path, $callback = null)
    {
        if (isset($this->_callback[$path])) {
            if (empty($callback)) {
                unset($this->_callback[$path]);
                $this->_zookeeper->get($path); //reset the callback
                return true;
            } else {
                $key = array_search($callback, $this->_callback[$path]);
                if ($key !== false) {
                    unset($this->_callback[$path][$key]);
                    return true;
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }
    }
}

/* End of file ZK.php */
