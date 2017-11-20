<?php
/**
 * Project:     搜房网php框架
 * File:        AbstractApi.php
 *
 * <pre>
 * 描述：Api站点控制器基类
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
 * Api站点控制器基类
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
abstract class AbstractApiController extends BaseController
{
    /**
     * 自动执行
     * @return void
     */
    public function init()
    {
        parent::init();
        
        //输入过滤
        $params = Yaf_Registry::get('http_param');
        $params['get'] = Util::safeFileter($params['get']);
        $params['post'] = Util::safeFileter($params['post']);
        $params['params'] = Util::safeFileter($params['params']);
        Yaf_Registry::set('http_param', $params);

    }
}

/* End of file AbstractApi.php */
