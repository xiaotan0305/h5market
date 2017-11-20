<?php
/**
 * Project:     搜房网php框架
 * File:        RbacRead.php
 *
 * <pre>
 * 资源表 RbacResource
 * +----------------+----------------------+------+-----+---------+-------+
 * | Field          | Type                 | Null | Key | Default | Extra |
 * +----------------+----------------------+------+-----+---------+-------+
 * | id             | char(32)             | NO   | PRI |         |       |
 * | parentid       | varchar(32)          | NO   | MUL |         |       |
 * | name           | varchar(16)          | NO   |     |         |       |
 * | controller     | varchar(64)          | NO   |     |         |       |
 * | action         | varchar(64)          | NO   |     |         |       |
 * | relationaction | text                 | NO   |     | NULL    |       |
 * | isdelete       | enum('y','n')        | NO   |     | n       |       |
 * | createtime     | int(10) unsigned     | NO   |     | NULL    |       |
 * | updatetime     | int(10) unsigned     | NO   |     | NULL    |       |
 * | weight         | smallint(5) unsigned | NO   |     | NULL    |       |
 * +----------------+----------------------+------+-----+---------+-------+
 * 角色表 RbacRole
 * +------------+----------------------+------+-----+---------+-------+
 * | Field      | Type                 | Null | Key | Default | Extra |
 * +------------+----------------------+------+-----+---------+-------+
 * | id         | char(32)             | NO   | PRI |         |       |
 * | parentid   | varchar(32)          | NO   | MUL |         |       |
 * | name       | varchar(16)          | NO   |     |         |       |
 * | isdelete   | enum('y','n')        | NO   |     | n       |       |
 * | createtime | int(10) unsigned     | NO   |     | NULL    |       |
 * | updatetime | int(10) unsigned     | NO   |     | NULL    |       |
 * | weight     | smallint(5) unsigned | NO   |     | NULL    |       |
 * +------------+----------------------+------+-----+---------+-------+
 * 角色资源对应表 RbacRoleToResource
 * +------------+----------+------+-----+---------+-------+
 * | Field      | Type     | Null | Key | Default | Extra |
 * +------------+----------+------+-----+---------+-------+
 * | id         | char(32) | NO   | PRI |         |       |
 * | roleid     | char(32) | NO   | MUL |         |       |
 * | resourceid | char(32) | NO   |     |         |       |
 * +------------+----------+------+-----+---------+-------+
 * 用户表 RbacUser
 * +------------+------------------+------+-----+---------+-------+
 * | Field      | Type             | Null | Key | Default | Extra |
 * +------------+------------------+------+-----+---------+-------+
 * | id         | char(32)         | NO   | PRI |         |       |
 * | email      | varchar(32)      | NO   | UNI |         |       |
 * | name       | varchar(16)      | NO   |     |         |       |
 * | isdelete   | enum('y','n')    | NO   | MUL | n       |       |
 * | createtime | int(10) unsigned | NO   |     | NULL    |       |
 * | updatetime | int(10) unsigned | NO   |     | NULL    |       |
 * +------------+------------------+------+-----+---------+-------+
 * 用户角色对应表 RbacUserToRole;
 * +--------+----------+------+-----+---------+-------+
 * | Field  | Type     | Null | Key | Default | Extra |
 * +--------+----------+------+-----+---------+-------+
 * | id     | char(32) | NO   | PRI |         |       |
 * | userid | char(32) | NO   | MUL |         |       |
 * | roleid | char(32) | NO   |     |         |       |
 * +--------+----------+------+-----+---------+-------+
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models/db
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Rbac权限管理数据库读
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models/db
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
namespace models\Db;

use Db;

class RbacRead extends Db
{
    /**
     * 构造函数，初始化数据库连接
     */
    public function __construct()
    {
        parent::__construct('slave', 'market');
    }

    /**
     * 获取资源列表
     * @param  string $parentid 父资源id
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getResourceList($parentid = '', $isdelete = 'n')
    {
        return $this->from('RbacResource')->where('parentid', '=', $parentid)->where('isdelete', '=', $isdelete)->orderBy('weight', 'ASC')->get();
    }

    /**
     * 根据资源id获取资源信息
     * @param  mixed $id 资源id
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getResourceById($id, $isdelete = 'n')
    {
        if (is_array($id)) {
            return $this->from('RbacResource')->whereIn('id', $id)->where('isdelete', '=', $isdelete)->get();
        } elseif (is_string($id)) {
            return $this->from('RbacResource')->where('id', '=', $id)->where('isdelete', '=', $isdelete)->get();
        } else {
            return array();
        }
    }

    /**
     * 获取角色列表
     * @param  string $parentid 父角色id
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getRoleList($parentid = '', $isdelete = 'n')
    {
        return $this->from('RbacRole')->where('parentid', '=', $parentid)->where('isdelete', '=', $isdelete)->orderBy('weight', 'ASC')->get();
    }

    /**
     * 根据角色id获取角色信息
     * @param  mixed $id 角色id
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getRoleById($id, $isdelete = 'n')
    {
        if (is_array($id)) {
            return $this->from('RbacRole')->whereIn('id', $id)->where('isdelete', '=', $isdelete)->get();
        } elseif (is_string($id)) {
            return $this->from('RbacRole')->where('id', '=', $id)->where('isdelete', '=', $isdelete)->get();
        } else {
            return array();
        }
    }

    /**
     * 根据角色id获取角色对应的资源id列表
     * @param  string $roleid 角色id
     * @return boolean/array
     */
    public function getRoleResourceidListByRoleId($roleid)
    {
        if (is_array($roleid)) {
            return $this->from('RbacRoleToResource')->distinct('resourceid')->whereIn('roleid', $roleid)->get();
        } elseif (is_string($roleid)) {
            return $this->from('RbacRoleToResource')->distinct('resourceid')->where('roleid', '=', $roleid)->get();
        } else {
            return array();
        }
    }

    /**
     * 获取用户数量
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getUserCount($isdelete = 'n')
    {
        return $this->from('RbacUser')->where('isdelete', '=', $isdelete)->count();
    }

    /**
     * 按页获取用户列表
     * @param  integer $page 页码，0 全部数据
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getUserListForPage($page = 1, $isdelete = 'n')
    {
        if ($page < 1) {
            return $this->from('RbacUser')->where('isdelete', '=', $isdelete)->get();
        } else {
            return $this->from('RbacUser')->where('isdelete', '=', $isdelete)->forPage($page)->get();
        }
    }

    /**
     * 根据用户id获取用户资料
     * @param  mixed $id 用户id
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getUserById($id, $isdelete = 'n')
    {
        if (is_array($id)) {
            return $this->from('RbacUser')->whereIn('id', $id)->where('isdelete', '=', $isdelete)->get();
        } elseif (is_string($id)) {
            return $this->from('RbacUser')->where('id', '=', $id)->where('isdelete', '=', $isdelete)->get();
        } else {
            return array();
        }
    }

    /**
     * 根据用户email获取用户资料
     * @param  mixed $email 用户email
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getUserByEmail($email, $isdelete = 'n')
    {
        if (is_array($email)) {
            return $this->from('RbacUser')->whereIn('email', $email)->where('isdelete', '=', $isdelete)->get();
        } elseif (is_string($email)) {
            return $this->from('RbacUser')->where('email', '=', $email)->where('isdelete', '=', $isdelete)->get();
        } else {
            return array();
        }
    }

    /**
     * 根据用户id获取用户对应的角色id列表
     * @param  string $userid 用户id
     * @return boolean/array
     */
    public function getUserRoleByUserid($userid)
    {
        return $this->from('RbacRoleToResource')->where('userid', '=', $userid)->get(array('roleid'));
    }
}
/* End of file RbacRead.php */
