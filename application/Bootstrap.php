<?php
/**
 * Project:     搜房网php框架
 * File:        Bootstrap.php
 *
 * <pre>
 * 描述：初始化类
 * </pre>
 *
 * @category  PHP
 * @package   Application
 * @author    lizeyu <lizeyu@soufun.com>
 * @copyright 2015 Soufun, Inc.
 * @license   BSD Licence
 * @link      http://example.com
 */

/**
 * 初始化类
 *
 * Long description for file (if any)...
 *
 * @category  PHP
 * @package   Application
 * @author    lizeyu <lizeyu@soufun.com>
 * @copyright 2015 Soufun, Inc.
 * @license   BSD Licence
 * @link      http://example.com
 */
class Bootstrap extends Yaf_Bootstrap_Abstract
{
    /**
     * 配置信息
     * @var obj
     */
    private $_config;

    /**
     * 注册本地类初始化
     * @todo 读取application配置时，这里没有强制转化为数组，后续使用的时候需要注意，有几个地方没修改
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function _initBootstrap(Yaf_Dispatcher $dispatcher)
    {
        $this->_config = Yaf_Application::app()->getConfig();
        Yaf_Registry::set('application', $this->_config->toArray());
        //认证配置
        $auth_conf = new Yaf_Config_Ini(APP_PATH . "/conf/auth.ini", RUN_ENVIRON);
        Yaf_Registry::set('auth', $auth_conf->toArray());
        //缓存配置
        $cache_conf = new Yaf_Config_Ini(APP_PATH . "/conf/cache.ini", RUN_ENVIRON);
        Yaf_Registry::set('cache', $cache_conf->toArray());
        //Zookeeper配置
        $zk_conf = new Yaf_Config_Ini(APP_PATH . "/conf/zk.ini", RUN_ENVIRON);
        Yaf_Registry::set('zk', $zk_conf->toArray());
        if (RUN_ENVIRON == 'product') {
            //数据库配置 单独存放在conf文件中
            $filename = realpath(APP_PATH.'/../').DIRECTORY_SEPARATOR.'cfgfiles'.DIRECTORY_SEPARATOR.'h5market.fang.com'.DIRECTORY_SEPARATOR.'db.conf';
            self::__includeConf($filename);
        } else {
            //数据库配置
            $db_conf = new Yaf_Config_Ini(APP_PATH . "/conf/db.ini", RUN_ENVIRON);
            Yaf_Registry::set('db', $db_conf->toArray());
        }
        //接口配置
        $interface_conf = new Yaf_Config_Ini(APP_PATH . "/conf/interface.ini", RUN_ENVIRON);
        Yaf_Registry::set('interface', $interface_conf->toArray());
        $citylist_conf = new Yaf_Config_Ini(APP_PATH . "/conf/citylist.ini");
        Yaf_Registry::set('citylist', $citylist_conf->toArray());
        $groups_conf = new Yaf_Config_Ini(APP_PATH . "/conf/groups.ini");
        Yaf_Registry::set('groups', $groups_conf->toArray());
    }

    /**
     * 加载初始化
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function _initAutoload(Yaf_Dispatcher $dispatcher)
    {
        //设置yaf启用自动加载用于兼容smarty3和composer
        ini_set('yaf.use_spl_autoload', true);

        //models目录中命名空间autoload
        spl_autoload_register(function ($class) {
            if ($class) {
                $file = str_replace('\\', '/', __DIR__ . '/' . $class);
                $file = $file . '.php';
                if (file_exists($file)) {
                    Yaf_Loader::import($file);
                }
            }
        });
    }

    /**
     * 系统环境初始化
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function _initEnv(Yaf_Dispatcher $dispatcher)
    {
        //定义系统环境
        if (substr(PHP_OS, 0, 3) == "WIN") {
            define("__IS_WIN__", 1);
        } else {
            define("__IS_WIN__", 0);
        }

        //定义调试模式
        if ($this->_config['application']['debug'] && (isset($_REQUEST['__DEBUG_MODE__']) || (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '__DEBUG_MODE__') !== false))) {
            define('__DEBUG_MODE__', true);
        } else {
            define('__DEBUG_MODE__', false);
        }
    }

    /**
     * 本地类初始化，可以通过设置php.ini中的ap.library，启用全局library路径，下面指定的从配置文件中的ap.library中获取
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function _initLocalNamespace(Yaf_Dispatcher $dispatcher)
    {
        //目前暂时用不上
        //Yaf_Loader::getInstance()->registerLocalNamespace("Foo");
        //Yaf_Loader::getInstance()->registerLocalNamespace(array("Foo", "Bar"));
    }

    /**
     * Route初始化
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function _initRoute(Yaf_Dispatcher $dispatcher)
    {
        //读取路由配置，并启用
        $route_conf = new Yaf_Config_Ini(APP_PATH . "/conf/route.ini");
        Yaf_Dispatcher::getInstance()->getRouter()->addConfig($route_conf->routes);
    }

    /**
     * Error初始化
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function _initErrors(Yaf_Dispatcher $dispatcher)
    {
        //报错是否开启
        if ($this->_config['application']['showErrors']) {
            error_reporting(E_ALL);
            ini_set('display_errors', true);
        } else {
            error_reporting(0);
            ini_set('display_errors', false);
        }
    }

    /**
     * Smarty初始化
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function _initSmarty(Yaf_Dispatcher $dispatcher)
    {
        /* init smarty view engine */
        $smarty = new Smarty3Adapter(null, Yaf_Application::app()->getConfig('application')->smarty);
        $dispatcher->setView($smarty);

        //设置Yaf默认不自动渲染模板
        Yaf_Dispatcher::getInstance()->autoRender(false);
    }

    /**
     * Plugin初始化
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function _initPlugin(Yaf_Dispatcher $dispatcher)
    {
        //加载xhprof插件
        //xhprof判断
        if (extension_loaded('xhprof')) {
            //加载xhprof日志类
            Yaf_Loader::import("3rdparty/xhprof/utils/xhprof_lib.php");
            Yaf_Loader::import("3rdparty/xhprof/utils/xhprof_runs.php");
            //设置xhprof日志存放路径
            ini_set('xhprof.output_dir', $this->_config['application']['logdir'].'xhprof');
            $dispatcher->registerPlugin(new XhprofPlugin());
        }
    }

    /**
     * 引用外部数据库配置文件
     * @param obj $dispatcher yaf分发器
     * @return void
     */
    private function __includeConf($filename)
    {
        $data = file_get_contents($filename);
        $getdata=str_replace("'", '"', $data);//将单引替换成双引
        $getdata = preg_replace('/,\s*([\]}])/m', '$1', $getdata);//去掉多余的逗号
        $data =  json_decode($getdata, true);
        $res = array();
        if ($data) {
            //处理数据格式保持之前数据格式一致
            foreach ($data as $key => $value) {
                $dbdata = array(
                    'dbtype' => $value['DBtype'],
                    'charset' => $value['DBcharset'],
                    'host' => $value['DBaddr'],
                    'port' => $value['DBport'],
                    'user' => $value['DBusername'],
                    'pwd' => $value['DBpw'],
                    'dbname' => $value['DBname'],
                    'DBusertype' => $value['DBusertype']
                );
                $length = strlen($value['DBname'])+1;
                if (strrpos($key, '_r') === (strlen($key)-2)) {
                    $k = substr($key, $length, (strrpos($key, '_r')-$length));
                    $res[$k]['slave'][] = $dbdata;
                } else {
                    $k = substr($key, $length, (strrpos($key, '_w')-$length));
                    $res[$k]['master'] = $dbdata;
                }
            }
        }
        Yaf_Registry::set('db', $res);
    }
}

/* End of file Bootstrap.php */
