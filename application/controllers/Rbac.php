<?php
/**
 * Project:     搜房网php框架
 * File:        Rbac.php
 *
 * <pre>
 * 描述：Rbac控制器
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Controllers
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Rbac控制器
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Controllers
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
class RbacController extends AbstractAdminController
{
    /**
     * 添加用户
     * @return void
     */
    public function addUserAction()
    {
        //获取所有的http参数
        $params = Yaf_Registry::get('http_param');
        $username = trim($params['get']['username']);
        if ($username == '') {
            exit('用户名为空');
        }
        try {
            $data = array(
                'email' => $username,
                'name'  => $username,
            );
            $IssoModel = new IssoModel();
            $IssoModel->addIssoService($username);
            $RbacModel = new RbacModel();
            $RbacModel->addUser($data);
        } catch (Exception $e) {
            echo $e->getMessage();
        } finally {
            exit();
        }
    }


    /**
     * 批量添加用户web版
     * @return void
     */
    public function batchAddUserAction()
    {
        $rbacModel = new RbacModel();
        $rbacModel->batchAddUser();
    }

    /**
     * 获取用户，并调用OA接口查询用户是否离职
     * @return void
     */
    public function getUserInfoAction()
    {
        $rbacModel = new RbacModel();
        $result = $rbacModel -> getAllUser('n');

        $isso = new IssoModel();
        foreach ($result as $key => $value) {
            $status = $isso -> getUserOADetail($value['email'].'@fang.com');
            if ($status == 5) {
                //如果用户已离职，更新用户的isdelete字段为y
                $data = ['name' => $value['name'], 'isdelete' => 'y'];
                $rbacModel -> updateUserByid($data, $value['id']);
                $logData = ['id'=>$value['id'], 'name' => $value['name'], 'status'=>$status];
                self::updateUserStatusLog($logData, 'updateUserStatus');
            } else {
                $logData = ['id'=>$value['id'], 'name' => $value['name'], 'status'=>$status];
                self::updateUserStatusLog($logData, 'updateUserStatus');
            }
        }
    }

    /**
     * 记录离职用户日志
     * @param array $data 需要记录的数据
     */
    private function updateUserStatusLog($data, $filename)
    {
        $log = new Log($filename);
        $str = '';
        if (isset($data) && is_array($data)) {
            foreach ($data as $key => $value) {
                $str .= $value.';;';
            }
        }
        $log -> fileWrite($str);
    }
}

/* End of file Rbac.php */
