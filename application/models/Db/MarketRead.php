<?php
/**
 * Project:     搜房网php框架
 * File:        MarketRead.php
 *
 * <pre>
 * 描述：h5market读数据层
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models/db
 * @author     pandeng <pandeng@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * H5Market读数据层
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models/db
 * @author     pandeng <pandeng@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
namespace models\Db;

use Db;
use Yaf_Config_Ini;

class MarketRead extends Db
{
    protected $pic_config;
    protected $pic_type;

    /**
     * 构造函数，初始化读数据库连接
     */
    public function __construct()
    {
        parent::__construct('slave', 'market');
        $pic_config = new Yaf_Config_Ini(APP_PATH . "/conf/media.ini");
        $this->pic_config = $pic_config->get('pic')->toArray();
        $this->music_config = $pic_config->get('music')->toArray();
        $this->pic_type = $pic_config->get('picType')->toArray();
        $this->font_config = $pic_config->get('font')->toArray();
    }

    /**
     * 执行select操作，根据条件查询数据
     * @param string $from     需要查询的表
     * @param array  $columns  所需要选取的列
     * @param array  $wheres   查询条件
     * @param int    $page     页码
     * @param array  $orders    排序 [['column' => 'updatetime', 'order' => 'desc']]
     * @param int    $pageeach 分页时每页显示条数
     * @return false/array
     */
    public function selectDataByCondition($from, $columns = ['*'], $wheres = [], $page = 0, array $orders = [], $pageeach = 8)
    {

        if (count($wheres) > 0) {
            $this->where($wheres, '', '');
        }
        if ($page !== 0) {
            $this->pageeach = $pageeach;
            $this->forPage(intval($page));
        }

        if (count($orders) > 0) {
            foreach ($orders as $order) {
                if (isset($order['column']) && isset($order['order'])) {
                    $this->orderBy($order['column'], $order['order']);
                }
            }
        }

        return $this->from($from)->select($columns)->get();
    }

    /**
     * 查询某集团下各城市专题数量
     * @param string $group 集团
     * @param int    $begin 开始时间
     * @param int    $end   结束时间
     * @return mixed
     */
    public function getTongjiData($group, $begin, $end)
    {
        $sql = "SELECT COUNT('*') AS num, city from project where groups = '" . $group . "' AND createtime >= " . $begin . " AND createtime <= " . $end . " GROUP BY city";
        $result = $this->db->query($sql, []);
        return $result;
    }

    /**
     * 查询某集团下所有满足条件的城市
     * @param string $groups 集团
     * @param string $begin  初始时间
     * @param string $end    结束时间
     * @param int    $flag   1 可报名专题，2 所有专题
     * @return mixed
     */
    public function getDistinctCityByGroups($groups, $begin, $end, $flag = 1)
    {
        if ($flag === 1) {
            $this->where('forminfo', '!=', '')->where('forminfo', '!=', 'NULL');
        }
        return $this->distinct()->from('project')->where('groups', '=', $groups)->where('createtime', '>=', $begin)->where('createtime', '<=', $end)->get(['city']);
    }

    /**
     * 查询某城市下有表单专题的专题id
     * @param string $city   城市
     * @param string $begin  初始时间
     * @param string $end    结束时间
     * @param array  $column 查询字段
     * @param int    $flag   1 可报名专题，2 所有专题
     * @return mixed
     */
    public function getProjectId($city, $begin, $end, $column = ['id'], $flag = 1)
    {
        if ($flag === 1) {
            $id_forminfo = $this->where('forminfo', '!=', '')->where('forminfo', '!=', 'NULL')->from('project')->where('city', '=', $city)->where('createtime', '>=', $begin)->where('createtime', '<=', $end)->get($column);
            $data = array();
            foreach ($id_forminfo as $key => $value) {
                $id = $value['id'];
                $forminfo = json_decode($value['forminfo'], true);
                foreach ($forminfo as $k => $v) {
                    $eventids[] = $id . '_' . $v['formid'];
                }
                $data[$id] = $eventids;
            }
            return $data;
        } else {
            return $this->from('project')->where('city', '=', $city)->where('createtime', '>=', $begin)->where('createtime', '<=', $end)->get($column);
        }
    }

    /**
     * 根据项目id获取报名人数
     * @param string $id 项目id
     * @param array $eventids 项目id_表单id
     * @return mixed
     */
    public function getSignInNum($id, $eventids)
    {
        $form_sign = strtolower(substr($id, -1));
        return $this->from('form_' . $form_sign)->whereIn('eventid', $eventids)->count();
    }


    /**
     * 根据用户查询项目数
     * @param array $wheres 查询条件
     * @return array
     */
    public function getProjectCountByCondition($wheres)
    {
        $count = $this->from('project')->where($wheres, '', '')->count('id');

        return ['count' => $count, 'pages' => ceil($count / 8)];
    }

    /**
     * 通过模板类型获取模板列表
     * @param string $type 模板类型 0:全部 1:封面 2:图文 3:滑块 4:表单
     * @return false/array
     */
    public function getTemplatesByType($type)
    {
        if ($type == 0) {
            return $this->from('template')->where('type', '!=', '5')->orderBy('id', 'desc')->get(['*']);
        }

        return $this->from('template')->where('type', '=', $type)->orderBy('id', 'desc')->get(['*']);
    }

    /**
     * 根据id获取系统组模板数据列表
     * @param string $id 系统组模板id
     * @param array $columns 选取的列
     * @return array
     */
    public function getMultiTemplateById($id, $columns = ['*'])
    {
        return $this->from('multitemplate')->select($columns)->where('id', '=', $id)->get();
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
     * @param string $subType 图片所属类型
     * @return array
     */
    public function getPicByType($type = 'background', $subType = 'other')
    {
        return $this->pic_config['pic'][$type][$subType];
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
     * 获取系统部分音乐
     * @param string $pageSize 每一次获取几条音乐
     * @param string $pageIndex 当前第几页
     * @return array
     */
    public function getMusic($pageIndex, $pageSize)
    {
        return array_slice($this->music_config['music'], ($pageIndex - 1) * $pageSize, $pageSize);
    }

    /**
     * 获取系统音乐的总数
     * @return int
     */
    public function getMusicCount()
    {
        return count($this->music_config['music']);
    }

    /**
     * 获取某一个用户上传的所有图片资源
     * @param string $user 用户id
     * @param array $columns 选取的列
     * @return array
     */
    public function getMediaByUserId($user, $columns = ['*'])
    {
        if (!$user) {
            return array();
        }
        $result = $this->from('media')->select($columns)->where('user', '=', $user)->where('status', '=', 'normal')->orderby('createtime', 'desc')->get();
        if ($result && !is_array($result)) {
            return array();
        } else {
            return $result;
        }
    }

    /**
     * 获取某一个用户上传的所有图片资源
     * @param string $user 用户id
     * @param array $columns 选取的列
     * @return array
     */
    public function getMusicByUserId($user, $columns = ['*'])
    {
        if (!$user) {
            return array();
        }
        $result = $this->from('music')->select($columns)->where('user', '=', $user)->where('status', '=', 'normal')->orderby('createtime', 'desc')->get();
        if ($result && !is_array($result)) {
            return array();
        } else {
            return $result;
        }
    }

    /**
     * 查询某一项目的转发人次或总数
     * @param string $projectId 项目id
     * @param string $type 转发类型 cirlce:转发朋友圈，friend:转发朋友
     * @param boolean $distinct 去重 为true则查询某项目的转发人数，为false查询该项目被转发次数
     * @return int
     */
    public function getUserCountByCondition($projectId, $type = 'circle', $distinct = true)
    {
        if ($distinct) {
            $this->distinct();
        }
        return $this->from('UserCountLog')->where('projectid', '=', $projectId)->where('type', '=', $type)->count('guid');
    }

    /**
     * 根据项目id和formID获取报名人数
     * @param string $id 项目id
     * @param int    $fromid 表单ID
     * @return mixed
     */
    public function getSignNumById($id, $fromId)
    {
        $form_sign = strtolower(substr($id, -1));
        return $this->from('form_' . $form_sign)->where('eventid', '=', $id . '_' . $fromId)->count();
    }

    /**
     * 根据项目ID和投票项ID获取投票信息
     * @param string $id 项目ID
     * @param int    $voteId 投票项ID
     * @return array/false
     */
    public function getVoteInfo($id, $voteId)
    {
        $vote_sign = strtolower(substr($id, -1));
        if (isset($voteId) && $voteId != '') {
            return $this->from('vote_'.$vote_sign)->select(['*'])->where([['pid', '=', $id],['btnid', '=', $voteId]], '', '')->get();
        } else {
            return $this->from('vote_'.$vote_sign)->select(['*'])->where([['pid', '=', $id]], '', '')->get();
        }
    }

    /**
     * 获取系统部分字体
     * @param string $pageSize 每一次获取几条字体
     * @param string $pageIndex 当前第几页
     * @return array
     */
    public function getFonts()
    {
        return $this->font_config['font'];
    }

    /**
     * 查询某集团下各城市某段时间uv数量
     * @param string $group 集团
     * @param int    $begin 开始时间
     * @param int    $end   结束时间
     * @return mixed
     */
    public function getCityUvByGroups($group, $begin, $end)
    {
        $sql = "SELECT `city`,sum(`uv`) as uv FROM `project` WHERE `groups` = '" . $group . "' AND `createtime` >= " . $begin . " AND `createtime` <= " . $end . " group by `city`";
        $result = $this->db->query($sql, []);
        return $result;
    }

    /**
     * 查询某集团下各城市某段时间报名数量
     * @param string $group 集团
     * @param int    $begin 开始时间
     * @param int    $end   结束时间
     * @return mixed
     */
    public function getCitySignNUmByGroups($group, $begin, $end)
    {
        $sql = "SELECT `city`,sum(`signinnum`) as num FROM `project` WHERE `groups` = '" . $group . "' AND `createtime` >= " . $begin . " AND `createtime` <= " . $end . " group by `city`";
        $result = $this->db->query($sql, []);
        return $result;
    }
}
/* End of file MarketRead.php */
