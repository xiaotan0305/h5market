<?php
/**
 * Project:     搜房网php框架
 * File:        Smarty3Adapter.php
 *
 * <pre>
 * 描述：Smarty3到Yaf_View视图引擎适配类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

//一般方式加载Smarty3
Yaf_Loader::import('3rdparty/Smarty/Smarty.class.php');
//composer方式加载Smarty3
//Yaf_Loader::import('3rdparty/composer/vendor/autoload.php');

/**
 * Smarty3到Yaf_View视图引擎适配类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
class Smarty3Adapter implements Yaf_View_Interface
{
    /**
     * Smarty对象
     * @var obj
     */
    private $_smarty;

    /**
     * 构造函数
     * @param string $tmplPath    模板的根目录
     * @param array  $extraParams 额外的配置参数
     */
    public function __construct($tmplPath = null, $extraParams = array())
    {
        $this->_smarty = new Smarty;
        //输出前过滤器 修改后，需要把编译出的文件删除，否则不会重新编译模板。如果启用 HTML 浓缩，HTML 页面里的 JS 就不能用 // 的单行注释了，因为换行都没有了，会把正式的语句变成注释而不执行的。可以用 /**/ 这样的块注释，而更好的办法是用 Smarty 的注释 {**}，不仅不受浓缩函数的影响，而且写多少注释都不会输出到浏览器。
        //开发过程中先注释掉这行，以方便查看源码。实际上线时启用它
        $this->_smarty->registerFilter('output', array(&$this,'htmlConcentrate'));

        if (null !== $tmplPath) {
            $this->setScriptPath($tmplPath);
        }

        foreach ($extraParams as $key => $value) {
            if ($key == 'template_dir') {
                $this->_smarty->setTemplateDir($value);
            } elseif ($key == 'compile_dir') {
                $this->_smarty->setCompileDir($value);
            } elseif ($key == 'cache_dir') {
                $this->_smarty->setCacheDir($value);
            } elseif ($key == 'config_dir') {
                $this->_smarty->setConfigDir($value);
            } elseif ($key == 'plugins_dir') {
                $this->_smarty->setPluginsDir($value);
            } else {
                $this->_smarty->$key = $value;
            }
        }
    }

    /**
     * Html代码浓缩
     * @param string $tpl_source 模版资源路径
     * @param obj    $smarty     smarty对象
     * @return string
     */
    public function htmlConcentrate($tpl_source, $smarty)
    {
        //preg_replace 支持模式和替换成的字符串都可以用数组。
        //现在主要是这3类转换，HTML 注释清理掉，多余的空白字符变成一个空格（不论在标记还是内容里，多个空白字符精简成1个空格都不影响效果），>\s< 表示HTML标记之间的空白，如 </p> <p> 之间的多个空白全部清除
        $patterns = array('/<!--.*-->/U', '/\s+/m', '/>\s+</m', '/;\s+/m');
        $replacements = array('', ' ', '><', ';');
        return preg_replace($patterns, $replacements, $tpl_source);
    }

    /**
     * 获取当前模版引擎对象
     * @return obj
     */
    public function getEngine()
    {
        return $this->_smarty;
    }

    /**
     * 设置模版的根目录
     * @param string $path 模版的根目录
     * @return void
     */
    public function setScriptPath($path)
    {
        if (is_readable($path)) {
            $this->_smarty->setTemplateDir($path);
            return;
        }

        throw new Exception('Invalid path provided');
    }

    /**
     * 获取模版的根目录
     * @return string 模版的根目录
     */
    public function getScriptPath()
    {
        return $this->_smarty->template_dir;
    }

    /**
     * 设置模版的根目录，setScriptPath 同名函数
     * @param string $path   模版的根目录
     * @param string $prefix 模版前缀，未使用
     * @return void
     */
    public function setBasePath($path, $prefix = 'Zend_View')
    {
        return $this->setScriptPath($path);
    }

    /**
     * 设置模版的根目录，setScriptPath 同名函数
     * @param string $path   模版的根目录
     * @param string $prefix 模版前缀，未使用
     * @return void
     */
    public function addBasePath($path, $prefix = 'Zend_View')
    {
        return $this->setScriptPath($path);
    }

    /**
     * 在模版引擎中赋值变量
     * @param string $key 变量的名称
     * @param mixed  $val 变量的值
     * @return void
     */
    public function __set($key, $val)
    {
        $this->_smarty->assign($key, $val);
    }

    /**
     * 是否变量在模版引擎中被赋值
     * @param string $key 变量的名称
     * @return boolean
     */
    public function __isset($key)
    {
        return (null !== $this->_smarty->getTemplateVars($key));
    }

    /**
     * 取消变量在模版引擎中的赋值
     * @param string $key 变量的名称
     * @return void
     */
    public function __unset($key)
    {
        $this->_smarty->clearAssign($key);
    }

    /**
     * 在模版引擎中赋值变量，变量名或key=>val数组赋值
     * @param mixed $spec  变量的名称 或 变量key=>val数组
     * @param mixed $value 变量的值
     * @return void
     */
    public function assign($spec, $value = null)
    {
        if (is_array($spec)) {
            $this->_smarty->assign($spec);
            return;
        }

        $this->_smarty->assign($spec, $value);
    }

    /**
     * 取消模版引擎中的全部赋值
     * @return void
     */
    public function clearVars()
    {
        $this->_smarty->clearAllAssign();
    }

    /**
     * 返回模版渲染的结果
     * @param string $name  模版名称
     * @param mixed  $value 值，暂未使用
     * @return string
     */
    public function render($name, $value = null)
    {
        return $this->_smarty->fetch($name);
    }

    /**
     * 输出模版渲染的结果
     * @param string $name  模版名称
     * @param mixed  $value 缓存时间，单位小时
     * @return string
     */
    public function display($name, $value = null)
    {
        if (is_numeric($value) && ($value > 0)) {
            $expires = $value*3600;
            header("Cache-Control: max-age=$expires");
            header('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT');
            header('Expires: '.gmdate('D, d M Y H:i:s', time()+$expires).' GMT');
        } else {
            header("Cache-Control: max-age=0");
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
            header('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT');
            header("Cache-Control: no-store, no-cache, must-revalidate");
            header('Pragma: no-cache');//兼容http1.0和https
        }
        echo $this->_smarty->fetch($name);
    }
}

/* End of file Smarty3Adapter.php */
