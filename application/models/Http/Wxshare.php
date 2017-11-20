<?php
/**
 * Project:     搜房网php框架
 * File:        Wxshare.php
 *
 * <pre>
 * 描述：微信分享类
 * </pre>
 *
 * @category   PHP
 * @package    models
 * @subpackage models/Http
 * @author     pandeng <pandeng.bj@soufun.com>
 * @copyright  2014 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 微信分享类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    models
 * @subpackage models/Http
 * @author     pandeng <pandeng.bj@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

namespace models\Http;

use Http;
use Exception;

class Wxshare extends Http
{
    /**
     * 微信分享接口参数初始化
     */
    public function __construct()
    {
        try {
            parent::__construct('wxshare', 5);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 接口获取java产生的分享签名信息
     * @return array|bool|mixed
     * @throws Exception
     */
    public function getWxShareSignInfo()
    {
        if ($this->conf['host'] === 'http://mm.test.fang.com') {
            return false;
        }
        $path = $this->conf['path']['share'];
        $query = [
            'm' => 'WXshareInfo',
            'class' => 'ActivityIMc',
            'shareurl' => urlencode(urlencode($this->conf['host'].'/h5market'.$_SERVER['REQUEST_URI']))
        ];
        try {
            $result = $this->httpGetContent($this->conf['host'], $path, $query);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }
}
