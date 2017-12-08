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
            //如果OA没有登录，判断通行证是否登录
            $UserModel = new UserModel();
            $passportUserinfo = $UserModel -> getLoginUser();
            if (is_array($passportUserinfo) && count($passportUserinfo) > 0) {
                //如果通行证已登录，先查询用户是否存在于passportUser表中，不存在的话插入数据
                $RbacModel = new RbacModel();
                $login_user_info = $RbacModel -> getUserByUserid($passportUserinfo['userid']);
                if (!isset($login_user_info['userid'])) {
                    $MarketModel = new MarketModel();
                    $data = [
                        'userid' => $passportUserinfo['userid'],
                        'name' => $passportUserinfo['username'],
                    ];
                    $insertResult = $MarketModel -> insertPassportUser($data);
                    if ($insertResult) {
                        self::$login_admin_info = $RbacModel -> getUserByUserid($passportUserinfo['userid']);
                    } else {
                        $this->redirectToPassportLogin();
                        exit;
                    }
                } else {
                    self::$login_admin_info = $login_user_info;
                }
            } else {
                //未登录通行证，跳转通行证登录
                $this->redirectToPassportLogin();
                exit;
            }
        } else {
            $RbacModel = new RbacModel();
            $userinfo = $RbacModel->getUserByEmail($admin_username);

            if (is_array($userinfo) && count($userinfo) > 0) {
                //在OA已登录的情况下先判断是否绑定通行证账号
                if (isset($userinfo['userid']) && $userinfo['userid'] != '') {
                    self::$login_admin_info = $RbacModel -> getUserByUserid($userinfo['userid']);
                } else {
                    //如果没有绑定通行证账号，判断通行证账号是否登录，未登录跳转登录页面
                    //获取通行证用户信息
                    $UserModel = new UserModel();
                    $passportUserinfo = $UserModel -> getLoginUser();

                    if ($passportUserinfo === false || !isset($passportUserinfo['userid'])) {
                        //未登录通行证，跳转通行证登录
                        $this->redirectToBindUser();
                        exit;
                    } else {
                        //如果没有绑定通行证账号，判断通行证账号是否登录，已登录的话进行绑定
                        $RbacModel = new RbacModel();
                        $passportInfo = $RbacModel -> getUserByUserid($passportUserinfo['userid']);

                        //在passportUser表里插入用户数据，更新project、media、music、myTemplate表中的user字段为通行证用户id
                        $MarketModel = new MarketModel();
                        $insertData = [
                            'userid' => $passportUserinfo['userid'],
                            'name' => $passportUserinfo['username'],
                            'isdelete' => $userinfo['isdelete'],
                            'city' => $userinfo['city'],
                            'groups' => $userinfo['groups'],
                            'source' => $userinfo['source']
                        ];
                        $bindResult = $MarketModel -> bindPassportUser($insertData, $passportUserinfo['userid'], $userinfo['email'], $passportInfo);

                        if ($bindResult) {
                            self::$login_admin_info = $RbacModel -> getUserByUserid($passportUserinfo['userid']);
                        } else {
                            $this->redirectToBindUser();
                            exit;
                        }
                    }
                }
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
        //通行证用户的登录信息
        //$this->_view->assign('login_user_info', self::$login_user_info);

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

    /**
     * 跳转到通行证登录页面
     * @return void
     */
    protected function redirectToPassportLogin()
    {
        $this->redirect('https://passport.fang.com/?backurl='.urlencode('http://'.$_SERVER["HTTP_HOST"].'/?c=admin&a=index'));
    }

    /**
     * 跳转到绑定通行证的提示页面
     */
    protected function redirectToBindUser()
    {
        $jsonArr['errcode'] = 2;
        $jsonArr['errmsg'] = '请前往通行证登录绑定通行证账号!';
        $jsonArr['url'] = 'https://passport.fang.com/?backurl='.urlencode('http://'.$_SERVER["HTTP_HOST"].'/?c=admin&a=index');
        $this->_view->assign('tipArr', $jsonArr);
        $this->_view->display('admin/bindUser.html');
    }
}

/* End of file AbstractAdmin.php */
