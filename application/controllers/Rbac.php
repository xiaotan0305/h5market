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
}

/* End of file Rbac.php */
