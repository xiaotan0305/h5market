<?php
/**
 * Project:     搜房网php框架
 * File:        Media.php
 *
 * <pre>
 * 描述：h5market media表数据层
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models/db
 * @author     tangcheng <tangcheng.bj@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * H5marketmedia表数据层
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models/db
 * @author     tangcheng <tangcheng.bj@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
namespace models\Db;

use Db;
use Yaf_Config_Ini;
use Util;

class Media extends Db
{
    protected $pic_config;
    protected $pic_type;

    /**
     * 构造函数，初始化数据库连接
     */
    public function __construct()
    {
        parent::__construct('slave', 'market');
        $pic_config = new Yaf_Config_Ini(APP_PATH . "/conf/media.ini");
        $this->pic_config = $pic_config->get('pic')->toArray();
        $this->pic_type = $pic_config->get('picType')->toArray();
    }

    /**
     * 获取系统所有分类的图片
     * @return array
     */
    public function getAllPic()
    {
        if (empty($this->pic_config)) {
            return array();
        }

        return $this->pic_config;
    }

    /**
     * 获取系统某一个分类的图片
     * @param string $type 图片所属类型
     * @return array
     */
    public function getPicByType($type = 'background')
    {
        if (!in_array($type, $this->pic_type['picType'])) {
            return array();
        }

        return $this->pic_config['pic'][$type];
    }

    /**
     * 获取系统所有图片分类
     * @return array
     */
    public function getPicType()
    {
        return $this->pic_type['picType'];
    }

    /**
     * 获取某一个用户上传的所有图片资源
     * @param string $user 用户id
     * @return array
     */
    public function getMediaByUserId($user)
    {
        if (!$user) {
            return array();
        }
        $result = $this->from('media')->where('user', '=', $user)->where('status', '=', 'normal')->orderby('createtime', 'desc')->get();
        if ($result && !is_array($result)) {
            return array();
        } else {
            return $result;
        }
    }

    /**
     * 增加某一个用户图片
     * @param array $data 上传文件的信息
     * @return boolean
     */
    public function insertMedia($data)
    {
        //将id合并到数组中
        if (is_array(reset($data))) {
            foreach ($data as $key => $v) {
                $data[$key]['id'] = substr(Util::guid(), 0, 10);
            }
        } else {
            $data['id'] = substr(Util::guid(), 0, 10);
        }
        $result = $this->from('media')->insert($data);

        return $result;
    }

    /**
     * 删除某一个用户图片
     * @param string $id 媒体资源的id
     * @return boolean
     */
    public function delMedia($id)
    {
        if (!$id) {
            return false;
        }
        $data = array('status' => 'delete');
        $result = $this->from('media')->where('id', '=', $id)->update($data);

        return $result;
    }
}
