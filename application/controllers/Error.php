<?php
/**
 * Project:     搜房网php框架
 * File:        Error.php
 *
 * <pre>
 * 描述：Error控制器
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
 * Error控制器
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
class ErrorController extends BaseController
{
    /**
     * 自动执行函数
     * @return void
     */
    public function init()
    {
        parent::init();
        //设置error.html的模板路径，否则modules下产生的error访问不到该模板
        $this->_view->setScriptPath(APP_PATH ."/application/views/");
    }

    /**
     * Error错误处理
     * @param  obj $exception PHP报错句柄
     * @return void
     */
    public function errorAction(Exception $exception)
    {
        //记录日志
        $e = sprintf("%s:%d %s (%d) [%s]\n", $exception->getFile(), $exception->getLine(), $exception->getMessage(), $exception->getCode(), get_class($exception));
        $Log = new Log('error');
        $Log->fileWrite($e);
        //开启debug设置并且进行调试
        if ($this->conf['application']['debug'] && __DEBUG_MODE__) {
            $this->_view->assign("e", $e);
            $this->_view->display('error/error.html');
        } else {
            switch ($exception->getCode()) {
                case YAF_ERR_AUTOLOAD_FAILED:
                case YAF_ERR_NOTFOUND_MODULE:
                case YAF_ERR_NOTFOUND_CONTROLLER:
                case YAF_ERR_NOTFOUND_ACTION:
                case YAF_ERR_NOTFOUND_VIEW:
                    header('HTTP/1.1 404 Not Found');
                    break;
                default:
                    header('HTTP/1.1 500 Internal Server Error');
                    break;
            }
        }
    }
}

/* End of file Error.php */
