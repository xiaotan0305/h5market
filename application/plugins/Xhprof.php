<?php
/**
 * Project:     搜房网php框架
 * File:        Xhprof.php
 *
 * <pre>
 * 描述：Xhprof插件
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Plugins
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Xhprof插件
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Plugins
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
class XhprofPlugin extends Yaf_Plugin_Abstract
{
    /**
     * Xhprof开启状态
     * @var boolean
     */
    private static $_xhprof_on;

    /**
     * 路由启动前
     * @param  obj $request  yaf请求对象
     * @param  obj $response yaf响应对象
     * @return void
     */
    public function routerStartup(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response)
    {
        $application_conf = Yaf_Registry::get('application');
        //如果没有开启xhprof or 采样率小于0 or 随机数大于1，就关闭采样
        if (intval($application_conf['xhprof']['openPercent']) <= 0 || mt_rand(1, intval($application_conf['xhprof']['openPercent'])) > 1) {
            self::$_xhprof_on = false;
        } else {
            self::$_xhprof_on = true;
            xhprof_enable(XHPROF_FLAGS_CPU|XHPROF_FLAGS_MEMORY|XHPROF_FLAGS_NO_BUILTINS, array('ignored_functions' => array('call_user_func','call_user_func_array')));
        }
    }

    /**
     * 路由关闭时
     * @param  obj $request  yaf请求对象
     * @param  obj $response yaf响应对象
     * @return void
     */
    public function routerShutdown(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response)
    {
    }

    /**
     * 分发寻路启动前
     * @param  obj $request  yaf请求对象
     * @param  obj $response yaf响应对象
     * @return void
     */
    public function dispatchLoopStartup(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response)
    {
    }

    /**
     * 分发前
     * @param  obj $request  yaf请求对象
     * @param  obj $response yaf响应对象
     * @return void
     */
    public function preDispatch(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response)
    {
    }

    /**
     * 分发后
     * @param  obj $request  yaf请求对象
     * @param  obj $response yaf响应对象
     * @return void
     */
    public function postDispatch(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response)
    {
    }
  
    /**
     * 分发寻路结束后
     * @param  obj $request  yaf请求对象
     * @param  obj $response yaf响应对象
     * @return void
     */
    public function dispatchLoopShutdown(Yaf_Request_Abstract $request, Yaf_Response_Abstract $response)
    {
        if (self::$_xhprof_on === true) {
            $controller = $request->getControllerName();
            $action = $request->getActionName();
            $XHProfRuns_Default = new XHProfRuns_Default();
            $XHProfRuns_Default->save_run(xhprof_disable(), $controller.'_'.$action);
        }
    }
}

/* End of file Xhprof.php */
