<?php
/**
 * Project:     搜房网php框架
 * File:        Base.php
 *
 * <pre>
 * 描述：Models基类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Models基类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
abstract class BaseModel
{
    /**
     * 缓存是否开启
     * @var boolean
     */
    private $_cache_open = true;

    /**
     * 缓存操作句柄
     * @var obj
     */
    private $_cache_obj = null;

    /**
     * Conf中的配置数组
     * @var array
     */
    protected $conf = null;

    /**
     * 构造函数
     */
    public function __construct()
    {
        $this->conf = Yaf_Registry::get('application');
    }

    /**
     * Cdn域名收敛
     * @param string $url 图片链接
     * @param integer $cdnDomainShrink 是否收敛
     * @return string
     */
    public function cdnDomainShrink($url)
    {

        $url = preg_replace('/^http[s]?:/', '', $url);

        $cdnDomain = array(
            'img.soufunimg.com' => array(
                'img.soufun.com', 'imgu.soufun.com', 'imgu.soufunimg.com', 'imgnew.jiatx.com', 'imgn0.soufunimg.com', 'imgn1.soufunimg.com', 'imgn2.soufunimg.com', 'imgn3.soufunimg.com', 'imgn5.soufunimg.com', 'img-0.soufunimg.com', 'img-1.soufunimg.com', 'img-2.soufunimg.com', 'img-3.soufunimg.com', 'img-5.soufunimg.com'
            ),
            'imgs.soufunimg.com' => array(
                'imgs.soufun.com', 'imgsu.soufun.com', 'imgsu.soufunimg.com', 'imgsnew.jiatx.com', 'imgs0.soufunimg.com', 'imgs1.soufunimg.com', 'imgs2.soufunimg.com', 'imgs3.soufunimg.com', 'imgs5.soufunimg.com'
            ),
            'img1.soufunimg.com' => array(
                'img1.soufun.com', 'imghome1.soufun.com', 'img1.soufunimg.com', 'img1u.soufunimg.com', 'imghome1.soufunimg.com', 'img1.jiatx.com', 'img1test.soufun.com', 'img1u1.soufun.com', 'img1-0.soufunimg.com', 'img1-1.soufunimg.com', 'img1-2.soufunimg.com', 'img1-3.soufunimg.com'
            ),
            'img1n.soufunimg.com' => array(
                'img1n.soufun.com', 'img1nu.soufun.com', 'img1nu.soufunimg.com', 'img1n.jiatx.com', 'img1n-0.soufunimg.com', 'img1n-1.soufunimg.com', 'img1n-2.soufunimg.com', 'img1n-3.soufunimg.com', 'imgworld.soufun.com'
            ),
            'img2.soufunimg.com' => array(
                'img2.soufun.com', 'img2.jiatx.com'
            ),
            'img2s.soufunimg.com' => array(
                'img2s.soufun.com', 'img2s.jiatx.com'
            ),
            'imgd.soufunimg.com' => array(
                'imgd.soufun.com', 'imgdu.soufun.com', 'imgdu.soufunimg.com', 'imgd0.soufunimg.com', 'imgd1.soufunimg.com', 'imgd2.soufunimg.com', 'imgd3.soufunimg.com', 'imgd5.soufunimg.com'
            ),
            'imgdn.soufunimg.com' => array(
                'imgdn.soufun.com', 'imgdnu.soufun.com', 'imgdnu.soufunimg.com', 'imgdn0.soufunimg.com', 'imgdn1.soufunimg.com', 'imgdn2.soufunimg.com', 'imgdn3.soufunimg.com', 'imgdn5.soufunimg.com'
            ),
            'fla.soufunimg.com' => array(
                'fla.soufun.com', 'flas.soufun.com', 'flas.soufunimg.com'
            ),
            'flv.soufunimg.com' => array(
                'flv.soufun.com', 'flvs.soufun.com', 'flvs.soufunimg.com'
            ),
            'flvn.soufunimg.com' => array(
                'flvn.soufun.com'
            ),
            'video2n.soufunimg.com' => array(
                'video2n.soufun.com'
            ),
            'video2s.soufunimg.com' => array(
                'video2s.soufun.com'
            ),
            'image1.soufunimg.com' => array(
                'image1.soufun.com'
            ),
        );

        foreach ($cdnDomain as $key => $value) {
            //与收敛目标一致不处理
            if (strpos($url, '//' . $key) !== false) {
                break;
            }
            //收敛替换
            if (($url = str_replace($value, $key, $url, $count)) && $count > 0) {
                break;
            }
        }
        //http2的极致收敛
        if ($this->conf['picThum']['cdnDomainShrink'] == 1) {
            //http2的极致收敛
            $patterns = array(
                //北方
                "/\/\/(img(\d+)n|img|imgdn|img2).soufunimg.com\//",
                //南方
                "/\/\/(img(\d+)|imgs|imgd|img2s).soufunimg.com\//",
            );
            $replacements = array(
                //北方
                '//cdnn.soufunimg.com/${1}/',
                //南方
                '//cdns.soufunimg.com/${1}/',
            );
            $url = preg_replace($patterns, $replacements, $url);
        }
        return $url;
    }

    /**
     * 内容中图片域名收敛
     * @param string $content
     * @return string
     * @author zhangjinyu
     */
    public function formatContent($content)
    {
        //$content = stripcslashes($content);
        $pattern = "/http[s]?:\/\/[^\"\']*?\.(jpg|jpeg|png|bmp|gif|mp3)/is";
        preg_match_all($pattern, $content, $data);
        if ($data && isset($data[0]) && $data[0] && is_array($data[0])) {
            $newData = [];
            foreach ($data[0] as $key => $val) {
                $newData[$key] = self::cdnDomainShrink($val);
            }
            $content = str_replace($data[0], $newData, $content);
        }
        return $content;
    }
}

/* End of file Base.php */
