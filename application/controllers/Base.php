<?php
/**
 * Project:     搜房网php框架
 * File:        Base.php
 *
 * <pre>
 * 描述：控制器基类
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
 * 控制器基类
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
abstract class BaseController extends Yaf_Controller_Abstract
{
    /**
     * Conf中的配置对象
     * @var obj
     */
    protected $conf = null;

    /**
     * 请求对象
     * @var obj
     */
    protected $request = null;

    /**
     * 请求参数
     * @var array
     */
    protected $http_param = null;

    /**
     * 自动执行
     * @return void
     */
    public function init()
    {
        $this->conf = Yaf_Registry::get('application');

        $this->request = $this->getRequest();
        $this->http_param['get'] = $this->request->getQuery();
        $this->http_param['post'] = $this->request->getPost();
        $this->http_param['cookie'] = $this->request->getCookie();
        $this->http_param['server'] = $this->request->getServer();
        $this->http_param['files'] = $this->request->getFiles();
        $this->http_param['params'] = $this->request->getParams();
        Yaf_Registry::set('http_param', $this->http_param);
    }
}

/* End of file Base.php */
