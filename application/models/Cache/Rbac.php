<?php
/**
 * Project:     搜房网php框架
 * File:        Rbac.php
 *
 * <pre>
 * 描述：Rbac权限管理Cache类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library/cache
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Rbac权限管理Cache类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Library
 * @subpackage Library/cache
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
namespace models\Cache;

use Cache;
use Exception;
use Yaf_Exception;

class Rbac extends Cache
{
    /**
     * 构造函数
     */
    public function __construct()
    {
        try {
            parent::__construct('memcache', 'default', 86400);
        } catch (Exception $e) {
            throw $e;
        }
    }
}

/* End of file Rbac.php */
