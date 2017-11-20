<?php
/**
 * Project:     搜房网php框架
 * File:        Output.php
 *
 * <pre>
 * 描述：输出类
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

/**
 * 输出类
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
class Output
{
    /**
     * 输出字符串格式 xml|json
     * @var string
     */
    private static $_format = 'json';

    /**
     * 设置输出格式
     * @param string $format 输出格式 xml/json
     * @return void
     */
    public static function setFormat($format = 'xml')
    {
        self::$_format = ($format == 'xml')?'xml':'json';
    }

    /**
     * 输出数据，根据输出格式，输出相应格式的数据
     * @param array  $data           数据数组
     * @param string $root           xml根节点名称
     * @param string $charset_in     输入编码
     * @param array  $xml_numkey_map 以数字为键的节点，输出为xml时需要替换为字符的配置
     * @return void
     */
    public static function outputData($data, $root = 'root', $charset_in = '', $xml_numkey_map = array())
    {
        if ($charset_in != '' && $charset_in != 'utf-8') {
            $data = self::_convertData($data, $charset_in, "utf-8");
        }
        if (self::$_format == 'xml') {
            $xml = self::_arrayToXml($data, $root, $xml_numkey_map);
            header("Content-type: text/xml; charset=utf-8");
            $output = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n".$xml;
        } else {
            header('Content-type: application/json; charset=utf-8');
            $output = json_encode($data, JSON_UNESCAPED_UNICODE);
        }
        echo $output;
    }

    /**
     * 将数组转换成XML
     * @param mixed  $data           数据
     * @param string $root           node值
     * @param array  $xml_numkey_map 以数字为键的节点，输出为xml时需要替换为字符的配置
     * @return string
     */
    private static function _arrayToXml($data, $root, array $xml_numkey_map)
    {
        $root = trim($root);
        if (strlen($root) == 0) {
            return '';
        }
        if (is_object($data) || is_resource($data)) {
            return '';
        }
        $xml = '';
        //如果数组的键是数字，则取$xml_numkey_map中的第一个作为node值
        if (is_numeric($root)) {
            $root = array_shift($xml_numkey_map);
        }
        //如果$xml_numkey_map中的第一个作为node值为空，则忽略
        if (!$root) {
            return '';
        }
        $xml = "<".$root.">";
        if (!is_array($data)) {
            $xml .= htmlspecialchars($data);
        } else {
            foreach ($data as $k => $v) {
                $xml .= self::_arrayToXml($v, $k, $xml_numkey_map);
            }
        }
        $xml .= "</".$root.">";
        return $xml;
    }

    /**
     * 将数据从$from编码转换成$to编码
     * @param mixed  $data 要转码的数据
     * @param string $from 源编码
     * @param string $to   目标编码
     * @return mixed
     */
    private static function _convertData($data, $from, $to)
    {
        $return = $data;
        if (is_array($data)) {
            foreach ($data as $key => $val) {
                $return[$key] = self::_convertData($val, $from, $to);
            }
        } else {
            $return = mb_convert_encoding($data, $to, $from);
        }
        return $return;
    }
}

/* End of file Output.php */
