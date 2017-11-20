<?php
/**
 * Project:     搜房网php框架
 * File:        AbstractWeb.php
 *
 * <pre>
 * 描述：前台用户站点控制器基类
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
 * 前台用户站点控制器基类
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
abstract class AbstractWebController extends BaseController
{
    /**
     * 用户信息
     * @var array
     */
    protected static $login_user_info;

    /**
     * 是否是登录状态访问
     * @var boolean
     */
    protected static $login_visit_mode;

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
        $UserModel = new UserModel();
        $login_user_info = $UserModel->getLoginUser();

        if (false === $login_user_info) {
            self::$login_visit_mode = false;
            self::$login_user_info = false;
        } else {
            self::$login_visit_mode = true;
            self::$login_user_info = $login_user_info;
        }

        //如果在未登录状态下，访问了不该访问的控制器，则跳转到登陆
        if (false === $this->_allowNoLoginVisit()) {
            exit;
        }

        //输入过滤
        $params = Yaf_Registry::get('http_param');
        $params['get'] = Util::safeFileter($params['get']);
        $params['post'] = Util::safeFileter($params['post']);
        $params['params'] = Util::safeFileter($params['params']);
        Yaf_Registry::set('http_param', $params);

        //登录信息
        $this->_view->assign('login_user_info', $login_user_info);
        //application配置信息
        $this->_view->assign('applicationConfig', Yaf_Registry::get('application'));
        //控制器及操作信息，目前只用在js模块引入上
        $this->_view->assign('controller', $this->request->getControllerName());
        $this->_view->assign('action', $this->request->getActionName());
    }

    /**
     * 检查未登录时，调用方法是否在允许访问类表内
     * @return boolean
     */
    private function _allowNoLoginVisit()
    {
        $controller = $this->request->getControllerName();
        $action = $this->request->getActionName();

        $accessAction = array('index', 'ajaxsendcode', 'ajaxsubsigninfo', 'ajaxweixinsharecount', 'ajaxvote', 'ajaxsendcodelog');
        if ($controller === 'Web' && in_array($action, $accessAction)) {
            return true;
        }
        return false;
    }
}

/* End of file AbstractWeb.php */
