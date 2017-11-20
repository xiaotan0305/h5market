<?php
/**
 * Project:     搜房网php框架
 * File:        AbstractAdmin.php
 *
 * <pre>
 * 描述：管理站点控制器基类
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
 * 管理站点控制器基类
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
abstract class AbstractAdminController extends BaseController
{
    /**
     * 管理员信息
     * @var array
     */
    protected static $login_admin_info;

    /**
     * 拥有编辑系统数据权限的用户
     * @var array
     */
    protected static $users = ['liuxinlu', 'tankunpeng', 'yueyanlei'];

    /**
     * 自动执行
     * @return void
     */
    public function init()
    {
        parent::init();
        //初始化视图
        $this->initView();
        //输出页面编码头
        header('Content-Type:text/html; charset=utf-8');
        //防点击劫持，IE8、Firefox3.6、Chrome4以上的版本可以支持
        if (isset($_SERVER['HTTP_REFERER']) && !strstr($_SERVER['HTTP_REFERER'], 'fang.com')) {
            header('X-FRAME-OPTIONS:DENY');
        }

        //处理登录状态和用户信息
        $IssoModel = new IssoModel();
        $admin_username = $IssoModel->getLoginUser();

        //如果没有登陆，去oa登陆
        $action = $this->request->getActionName();
        if (false === $admin_username) {
            if (strpos($action, 'ajax') !== false) {
                $jsonArr['errcode'] = 2;
                $jsonArr['errmsg'] = '您的登陆已超时，请在新页面打开oa登录，登录后再进行操作，否则将丢失部分数据!';
                $jsonArr['url'] = 'http://work.fang.com/v2/login/loginAct.do?method=login&fromSysId=1&ie=1';
                Output::outputData($jsonArr);
            } else {
                $this->redirectToLogin();
            }
            exit;
        } else {
            $RbacModel = new RbacModel();
            $userinfo = $RbacModel->getUserByEmail($admin_username);

            if (is_array($userinfo) && count($userinfo) > 0) {
                self::$login_admin_info = $userinfo;
            } else {
                //插入用户信息
                $result = $RbacModel->addUser(['email'=> $admin_username, 'name' => $admin_username]);
                if ($result) {
                    self::$login_admin_info = $RbacModel->getUserByEmail($admin_username);
                } else {
                    $this->redirectToLogin();
                    exit;
                }
            }
        }

        //登录信息
        $this->_view->assign('login_admin_info', self::$login_admin_info);

        //是否设置过默认的流量本地化参数,设置过为green，未设置为yellow
        $color = isset(self::$login_admin_info['city']) && self::$login_admin_info['city'] ? 'green' : 'yellow';
        $this->_view->assign('color', $color);

        //application配置信息
        $this->_view->assign('applicationConfig', Yaf_Registry::get('application'));
        $this->_view->assign('controllerName', $this->request->getControllerName());
        $this->_view->assign('actionName', $this->request->getActionName());
    }

    /**
     * 跳转到登录页面
     * @return void
     */
    protected function redirectToLogin()
    {
        $this->redirect('http://work.fang.com/v2/login/loginAct.do?method=login&fromSysId=1&ie=1&gopage='.urlencode('http://'.$_SERVER["HTTP_HOST"].'/?c=admin&a=index'));
    }

    /**
     * 跳转404
     * @return void
     */
    protected function jumpToError()
    {
        header('HTTP/1.1 404 Not Found');
        header("status: 404 Not Found");
        $this->_view->display('admin/error.html');
    }
}

/* End of file AbstractAdmin.php */
