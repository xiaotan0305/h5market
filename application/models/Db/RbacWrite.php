<?php
/**
 * Project:     搜房网php框架
 * File:        RbacWrite.php
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
 * Rbac权限管理数据库写
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

class RbacWrite extends Db
{
    /**
     * 构造函数，初始化数据库连接
     */
    public function __construct()
    {
        parent::__construct('master', 'market');
    }

    /**
     * 添加资源
     * @param  array $resource 新增的资源kv数据，多条数据使用多维数组
     * @return boolean
     */
    public function addResource(array $resource)
    {
        return $this->from('RbacResource')->insert($resource);
    }

    /**
     * 根据id更新资源
     * @param  array $resource 新的资源kv数据
     * @param  string $id 资源id
     * @return integer/false
     */
    public function updateResourceById(array $resource, $id)
    {
        return $this->from('RbacResource')->where('id', '=', $id)->update($resource);
    }

    /**
     * 添加角色
     * @param  array $role 新增的角色kv数据，多条数据使用多维数组
     * @return boolean
     */
    public function addRole($role)
    {
        return $this->from('RbacRole')->insert($role);
    }

    /**
     * 根据id更新角色
     * @param  array $role 新的角色kv数据
     * @param  string $id 角色id
     * @return integer/false
     */
    public function updateRoleById(array $role, $id)
    {
        return $this->from('RbacRole')->where('id', '=', $id)->update($role);
    }

    /**
     * 添加角色资源数据
     * @param  array $roletoresource 角色资源kv数据，多条数据使用多维数组
     * @return boolean
     */
    public function addRoleResource(array $roletoresource)
    {
        return $this->from('RoleResource')->insert($roletoresource);
    }

    /**
     * 根据角色id删除角色资源数据
     * @param  string $roleid 角色id
     * @return integer/false
     */
    public function deleteRoleResourceByRoleid($roleid)
    {
        return $this->from('RoleResource')->where('roleid', '=', $roleid)->delete();
    }

    /**
     * 添加用户
     * @param  array $user 新增的用户kv数据，多条数据使用多维数组
     * @return boolean
     */
    public function addUser(array $user)
    {
        return $this->from('RbacUser')->insert($user);
    }

    /**
     * 根据id更新用户
     * @param  array $user 新的用户kv数据
     * @param  string $id 用户id
     * @return integer/false
     */
    public function updateUserByid(array $user, $id)
    {
        return $this->from('RbacUser')->where('id', '=', $id)->update($user);
    }

    /**
     * 根据email更新用户
     * @param  array $user 新的用户kv数据
     * @param  string $email 用户email
     * @return integer/false
     */
    public function updateUserByEmail(array $user, $email)
    {
        return $this->from('RbacUser')->where('email', '=', $email)->update($user);
    }

    /**
     * 添加用户资源数据
     * @param  array $usertorole 新增的用户kv数据，多条数据使用多维数组
     * @return boolean
     */
    public function addUserRole(array $usertorole)
    {
        return $this->from('RbacUserToRole')->insert($usertorole);
    }

    /**
     * 根据用户id删除用户资源数据
     * @param  string $userid 用户id
     * @return integer/false
     */
    public function deleteUserRoleByUserid($userid)
    {
        return $this->from('RbacUserToRole')->where('userid', '=', $userid)->delete();
    }

    /**
     * 根据userid更新用户
     * @param  array $user 新的用户kv数据
     * @param  string $userid 用户userid
     * @return integer/false
     */
    public function updateUserByUserid(array $user, $userid)
    {
        return $this->from('passportUser')->where('userid', '=', $userid)->update($user);
    }
}
