<?php
/**
 * Project:     搜房网php框架
 * File:        Rbac.php
 *
 * <pre>
 * 描述：RbacModel
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * RbacModel
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
use models\Db\RbacWrite as RbacWriteDb;
use models\Db\RbacRead as RbacReadDb;

class RbacModel extends BaseModel
{
    /**
     * 缓存是否开启
     * @var boolean
     */
    private $_cache_open = true;

    /**
     * 缓存操作句柄
     * @var obj
     */
    private $_cache_obj = null;

    /**
     * 构造函数
     */
    public function __construct()
    {
        parent::__construct();

        $cache_conf = Yaf_Registry::get('cache');

        //如果这个模块设置开启，且配置文件允许缓存
        if ($this->_cache_open === true && $cache_conf['cacheOpen'] === true) {
            $this->_cache_obj = new RbacCache();
        } else {
            $this->_cache_open = false;
        }
    }



    /********************************资源操作********************************/


    /**
     * 添加资源
     * @param  array $data 资源数据
     * @return string/false
     */
    public function addResource(array $data)
    {
        //去除头尾空白
        $data = array_map('trim', $data);
        //生成guid主键
        $id = Util::guid();
        //必填项检查
        if (!isset($data['name']) || strlen($data['name']) === 0) {
            throw new Yaf_Exception('资源名称不能为空');
        }

        $resource = array(
            'id' => $id,
            'parentid' => isset($data['parentid']) ? $data['parentid'] : '',
            'name' => $data['name'],
            'controller' => isset($data['controller']) ? $data['controller'] : '',
            'action' => isset($data['action']) ? $data['action'] : '',
            'relationaction' => isset($data['relationaction']) ? $data['relationaction'] : '',
            'isdelete' => (isset($data['isdelete']) && $data['isdelete'] == 'y') ? 'y' : 'n',
            'createtime' => time(),
            'updatetime' => 0,
            'weight' => (isset($data['weight']) && intval($data['weight']) >= 0) ? intval($data['weight']) : 0,
        );

        $RbacWriteDb = new RbacWriteDb();

        if ($RbacWriteDb->addResource($resource) === true) {
            return $id;
        } else {
            return false;
        }
    }

    /**
     * 根据id更新资源
     * @param  array $data 新的资源kv数据
     * @param  string $id 资源id
     * @return integer/false
     */
    public function updateResourceById(array $data, $id)
    {
        //检查需要更新的数据
        if (empty($data)) {
            return 0;
        }

        //去除头尾空白
        $data = array_map('trim', $data);
        $id = trim($id);
        //必填项检查
        if (strlen($id) === 0) {
            throw new Yaf_Exception('资源id不能为空');
        }
        if (isset($data['name']) && strlen($data['name']) === 0) {
            throw new Yaf_Exception('资源名称不能为空');
        }

        $resource = array(
            'updatetime' => time()
        );
        //可能需要更新的字段列表
        $columns = array('parentid', 'name', 'controller', 'action', 'relationaction', 'isdelete', 'weight');
        foreach ($columns as $column) {
            if (isset($data[$column])) {
                switch ($column) {
                    case 'isdelete':
                        $resource[$column] = ($data[$column] == 'y') ? 'y' : 'n';
                        break;
                    case 'weight':
                        $resource[$column] = (intval($data[$column]) >= 0) ? intval($data[$column]) : 0;
                        break;
                    default:
                        $resource[$column] = $data[$column];
                        break;
                }
            }
        }

        $RbacWriteDb = new RbacWriteDb();

        return $RbacWriteDb->updateResourceById($resource, $id);
    }

    /**
     * 获取资源列表
     * @param  string $parentid 资源父id
     * @param  string $isdelete 是否删除
     * @return array/false
     */
    public function getResourceList($parentid = '', $isdelete = 'n')
    {
        $isdelete == 'y' ? 'y' : 'n';

        $RbacReadDb = new RbacReadDb();

        return $RbacReadDb->getResourceList($parentid, $isdelete);
    }

    /**
     * 获取资源树
     * @param  string $parentid 资源父id
     * @param  string $isdelete 是否删除
     * @return array
     */
    public function getResourceTree($parentid = '', $isdelete = 'n')
    {
        $isdelete == 'y' ? 'y' : 'n';

        $root_resource = $this->getResourceList($parentid, $isdelete);

        if (!empty($root_resource)) {
            foreach ($root_resource as $key => $resource) {
                $root_resource[$key]['node'] = $this->getResourceTree($resource['id'], $isdelete);
            }
        }

        return $root_resource;
    }



    /********************************角色操作********************************/


    /**
     * 添加角色
     * @param  array $data 角色数据
     * @return string/false
     */
    public function addRole(array $data)
    {
        //去除头尾空白
        $data = array_map('trim', $data);
        //生成guid主键
        $id = Util::guid();
        //必填项检查
        if (!isset($data['name']) || strlen($data['name']) === 0) {
            throw new Yaf_Exception('角色名称不能为空');
        }

        $role = array(
            'id' => $id,
            'parentid' => isset($data['parentid']) ? $data['parentid'] : '',
            'name' => $data['name'],
            'isdelete' => (isset($data['isdelete']) && $data['isdelete'] == 'y') ? 'y' : 'n',
            'createtime' => time(),
            'updatetime' => 0,
            'weight' => (isset($data['weight']) && intval($data['weight']) >= 0) ? intval($data['weight']) : 0,
        );

        $RbacWriteDb = new RbacWriteDb();

        if ($RbacWriteDb->addRole($role) === true) {
            return $id;
        } else {
            return false;
        }
    }

    /**
     * 根据id更新角色
     * @param  array $data 新的角色kv数据
     * @param  string $id 角色id
     * @return integer/false
     */
    public function updateRoleById(array $data, $id)
    {
        //检查需要更新的数据
        if (empty($data)) {
            return 0;
        }

        //去除头尾空白
        $data = array_map('trim', $data);
        $id = trim($id);
        //必填项检查
        if (strlen($id) === 0) {
            throw new Yaf_Exception('角色id不能为空');
        }
        if (isset($data['name']) && strlen($data['name']) === 0) {
            throw new Yaf_Exception('角色名称不能为空');
        }

        $role = array(
            'updatetime' => time()
        );
        //可能需要更新的字段列表
        $columns = array('parentid', 'name', 'isdelete', 'weight');
        foreach ($columns as $column) {
            if (isset($data[$column])) {
                switch ($column) {
                    case 'isdelete':
                        $role[$column] = ($data[$column] == 'y') ? 'y' : 'n';
                        break;
                    case 'weight':
                        $role[$column] = (intval($data[$column]) >= 0) ? intval($data[$column]) : 0;
                        break;
                    default:
                        $role[$column] = $data[$column];
                        break;
                }
            }
        }

        $RbacWriteDb = new RbacWriteDb();

        return $RbacWriteDb->updateRoleById($role, $id);
    }

    /**
     * 获取角色列表
     * @param  string $parentid 角色父id
     * @param  string $isdelete 是否删除
     * @return array/false
     */
    public function getRoleList($parentid = '', $isdelete = 'n')
    {
        $isdelete == 'y' ? 'y' : 'n';

        $RbacReadDb = new RbacReadDb();

        return $RbacReadDb->getRoleList($parentid, $isdelete);
    }



    /********************************角色对资源操作********************************/


    /**
     * 添加角色资源数据
     * @param  string $roleid 角色id
     * @param  mixed $data 资源id数据，多条数据使用多维数组
     * @return boolean
     */
    public function addRoleResource($roleid, $data)
    {
        //去除头尾空白
        $roleid = trim($roleid);
        //必填项检查
        if (strlen($roleid) === 0) {
            throw new Yaf_Exception('角色id不能为空');
        }

        if (is_string($data)) {
            $data = [trim($data)];
        } elseif (is_array($data)) {
            $data = array_map('trim', $data);
        } else {
            throw new Yaf_Exception('data参数只支持字符串或一维数组');
        }

        $roletoresource = array();

        foreach ($data as $resourceid) {
            if (strlen($resourceid) > 0) {
                $temp = array(
                    'id' => Util::guid(),
                    'roleid' => $roleid,
                    'resourceid' => $resourceid
                );

                $roletoresource[] = $temp;
            }
        }

        $RbacWriteDb = new RbacWriteDb();

        return $RbacWriteDb->addRoleResource($roletoresource);
    }

    /**
     * 根据角色id删除角色资源数据
     * @param  string $roleid 角色id
     * @return integer/false
     */
    public function deleteRoleResourceByRoleid($roleid)
    {
        //去除头尾空白
        $roleid = trim($roleid);
        //必填项检查
        if (strlen($roleid) === 0) {
            throw new Yaf_Exception('角色id不能为空');
        }

        $RbacWriteDb = new RbacWriteDb();

        return $RbacWriteDb->deleteRoleResourceByRoleid($roleid);
    }



    /********************************用户操作********************************/


    /**
     * 添加用户
     * @param  array $data 用户数据
     * @return string/false
     */
    public function addUser(array $data)
    {
        //去除头尾空白
        $data = array_map('trim', $data);
        //生成guid主键
        $id = Util::guid();
        //必填项检查
        if (!isset($data['email']) || strlen($data['email']) === 0) {
            throw new Yaf_Exception('邮箱用户名不能为空');
        }
        if (!isset($data['name']) || strlen($data['name']) === 0) {
            throw new Yaf_Exception('用户名字不能为空');
        }

        $user = array(
            'id' => $id,
            'email' => $data['email'],
            'name' => $data['name'],
            'isdelete' => (isset($data['isdelete']) && $data['isdelete'] == 'y') ? 'y' : 'n',
            'createtime' => time(),
            'updatetime' => 0,
        );

        $RbacWriteDb = new RbacWriteDb();

        try {
            $RbacWriteDb->addUser($user);

            return $id;
        } catch (Exception $e) {
            if (1062 == $e->getCode()) {
                throw new Yaf_Exception('用户已存在');
            } else {
                throw $e;
            }
        }
    }

    /**
     * 批量添加用户
     * @return void
     */
    public function batchAddIssoUser()
    {
        $path = APP_PATH . '/conf/user.ini';
        $fp = fopen($path, 'r');
        $IssoModel = new IssoModel();
        $log = new Log('batchAddUser');
        while (!feof($fp)) {
            $user = trim(fgets($fp));
            if (empty($user)) {
                continue;
            }
            $data = array(
                'email' => $user,
                'name' => $user
            );
            try {
                $IssoModel->addIssoService($user);
                $this->addUser($data);
            } catch (Exception $e) {
                $log->fileWrite($user . ':' . $e->getMessage());
                throw $e;
            }
        }
    }

    /**
     * 添加单个用户到本系统中
     * @return void
     */
    public function addIssoUser($user)
    {
        $IssoModel = new IssoModel();
        $log = new Log('addIssoUser');
        if (empty($user)) {
            throw new Exception('用户名为空');
        }
        $data = array(
            'email' => $user,
            'name' => $user
        );
        try {
            $IssoModel->addIssoService($user);
            $this->addUser($data);
        } catch (Exception $e) {
            $log->fileWrite($user . ':' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 根据id更新用户
     * @param  array $data 新的用户kv数据
     * @param  string $id 用户id
     * @return integer/false
     */
    public function updateUserByid(array $data, $id)
    {
        //检查需要更新的数据
        if (empty($data)) {
            return 0;
        }

        //去除头尾空白
        $data = array_map('trim', $data);
        $id = trim($id);
        //必填项检查
        if (strlen($id) === 0) {
            throw new Yaf_Exception('用户id不能为空');
        }
        if (isset($data['name']) && strlen($data['name']) === 0) {
            throw new Yaf_Exception('用户名字不能为空');
        }

        $user = array(
            'updatetime' => time()
        );
        //可能需要更新的字段列表
        $columns = array('name', 'isdelete');
        foreach ($columns as $column) {
            if (isset($data[$column])) {
                switch ($column) {
                    case 'isdelete':
                        $user[$column] = ($data[$column] == 'y') ? 'y' : 'n';
                        break;
                    default:
                        $user[$column] = $data[$column];
                        break;
                }
            }
        }

        $RbacWriteDb = new RbacWriteDb();

        return $RbacWriteDb->updateUserByid($user, $id);
    }

    /**
     * 根据email更新用户
     * @param array  $data  新的用户kv数据
     * @param string $email 用户email
     * @return integer/false
     * @throws Yaf_Exception
     */
    public function updateUserByEmail(array $data, $email)
    {
        //检查需要更新的数据
        if (empty($data)) {
            return 0;
        }

        //去除头尾空白
        $data = array_map('trim', $data);
        $email = trim($email);
        //必填项检查
        if (strlen($email) === 0) {
            throw new Yaf_Exception('用户email不能为空');
        }
        $data['updatetime'] = time();
        //可能需要更新的字段列表
        $groups = Yaf_Registry::get('groups');
        $column = [];
        foreach ($groups['groups'] as $value) {
            $column[] = $value['shortname'];
        }

        if (isset($data['groups']) && !in_array($data['groups'], $column)) {
            throw new Yaf_Exception('用户groups设定无效');
        }

        $RbacWriteDb = new RbacWriteDb();

        return $RbacWriteDb->updateUserByEmail($data, $email);
    }

    /**
     * 获取用户数量
     * @param  string $isdelete 是否删除
     * @return integer
     */
    public function getUserCount($isdelete = 'n')
    {
        $isdelete == 'y' ? 'y' : 'n';

        $RbacReadDb = new RbacReadDb();

        return $RbacReadDb->getUserCount($isdelete);
    }

    /**
     * 获取全部用户
     * @param  string $isdelete 是否删除
     * @return array
     */
    public function getAllUser($isdelete = 'n')
    {
        $isdelete == 'y' ? 'y' : 'n';

        $RbacReadDb = new RbacReadDb();

        return $RbacReadDb->getUserListForPage(0, $isdelete);
    }

    /**
     * 分页获取用户
     * @param  integer $page 页码
     * @param  string $isdelete 是否删除
     * @return array
     */
    public function getUserListForPage($page = 1, $isdelete = 'n')
    {
        $page = (intval($page) > 1) ? intval($page) : 1;
        $isdelete == 'y' ? 'y' : 'n';

        $RbacReadDb = new RbacReadDb();

        return $RbacReadDb->getUserListForPage($page, $isdelete);
    }

    /**
     * 根据用户id获取用户资料
     * @param  mixed $id 用户id
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getUserById($id, $isdelete = 'n')
    {
        $id = trim($id);
        $isdelete == 'y' ? 'y' : 'n';

        //必填项检查
        if (strlen($id) === 0) {
            throw new Yaf_Exception('用户id不能为空');
        }

        $RbacReadDb = new RbacReadDb();

        $result = $RbacReadDb->getUserById($id, $isdelete);

        return (is_array($result) && count($result) > 0) ? array_shift($result) : array();
    }

    /**
     * 根据用户email获取用户资料
     * @param  mixed $email 用户email
     * @param  string $isdelete 是否删除
     * @return boolean/array
     */
    public function getUserByEmail($email, $isdelete = 'n')
    {
        $email = trim($email);
        $isdelete == 'y' ? 'y' : 'n';

        //必填项检查
        if (strlen($email) === 0) {
            throw new Yaf_Exception('用户邮箱用户名不能为空');
        }

        $RbacReadDb = new RbacReadDb();

        $result = $RbacReadDb->getUserByEmail($email, $isdelete);

        return (is_array($result) && count($result) > 0) ? array_shift($result) : array();
    }



    /********************************用户对角色操作********************************/


    /**
     * 添加角色资源数据
     * @param  string $userid 用户id
     * @param  mixed $data 资源id数据，多条数据使用多维数组
     * @return boolean
     */
    public function addUserRole($userid, $data)
    {
        //去除头尾空白
        $userid = trim($userid);
        //必填项检查
        if (strlen($userid) === 0) {
            throw new Yaf_Exception('用户id不能为空');
        }

        if (is_string($data)) {
            $data = [trim($data)];
        } elseif (is_array($data)) {
            $data = array_map('trim', $data);
        } else {
            throw new Yaf_Exception('data参数只支持字符串或一维数组');
        }

        $usertorole = array();

        foreach ($data as $roleid) {
            if (strlen($roleid) > 0) {
                $temp = array(
                    'id' => Util::guid(),
                    'userid' => $userid,
                    'roleid' => $roleid
                );

                $usertorole[] = $temp;
            }
        }

        $RbacWriteDb = new RbacWriteDb();

        return $RbacWriteDb->addUserRole($usertorole);
    }

    /**
     * 根据用户id删除用户角色数据
     * @param  string $userid 用户id
     * @return integer/false
     */
    public function deleteUserRoleByUserid($userid)
    {
        //去除头尾空白
        $userid = trim($userid);
        //必填项检查
        if (strlen($userid) === 0) {
            throw new Yaf_Exception('用户id不能为空');
        }

        $RbacWriteDb = new RbacWriteDb();

        return $RbacWriteDb->deleteUserRoleByUserid($userid);
    }
}

/* End of file Rbac.php */
