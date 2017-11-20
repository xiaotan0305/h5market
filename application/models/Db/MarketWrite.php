<?php
/**
 * Project:     搜房网php框架
 * File:        MarketWrite.php
 *
 * <pre>
 * 描述：h5market写数据层
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
 * H5Market写数据层
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

class MarketWrite extends Db
{
    /**
     * 构造函数，初始化写数据库连接
     */
    public function __construct()
    {
        parent::__construct('master', 'market');
    }

    /**
     * 插入方法
     * @param string $from 插入的表名
     * @param array  $data 插入的数据
     * @return string/false
     */
    public function insertData($from, $data)
    {
        $result = $this->from($from)->insert($data);
        if ($result) {
            return isset($data['id']) ? $data['id'] : $result;
        } else {
            return false;
        }
    }

    /**
     * 事务，在插入表单数据的同时，将报名专题报名数加1
     * @param string $from 插入的表名
     * @param array  $data 插入的数据
     * @param string $id   项目id
     * @return bool
     */
    public function trans($from, $data, $id)
    {
        $this->db->beginTransaction();
        $ret1 = $this->insertData($from, $data);
        $ret2 = $this->updateSignInNum($id);
        if ($ret1 && $ret2) {
            if ($this->db->commit()) {
                return true;
            } else {
                return false;
            }
        } else {
            $this->db->rollback();
            return false;
        }
    }

    /**
     * 更新方法
     * @param string $from   更新的表名
     * @param array  $wheres 更新条件数组
     * @param array  $data   更新数据
     * @return false/int
     */
    public function updateData($from, $wheres, $data)
    {
        $result = $this->from($from)->where($wheres, '', '')->update($data);
        if ($result !== false) {
            //当update的数据没有变化是,会返回受影响的行数为0,所以result的可能值为0,1,false
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * 微信分享计数
     * @param string $id 分享的项目id
     * @param integer $type 分享的类型 1：分享到朋友圈，0：发送给朋友
     * @return boolean
     */
    public function wxShareCountIncrease($id, $type)
    {
        $this->from('project')->where('id', '=', $id);
        if ($type === 1) {
            return $this->increment('circlenum');
        } else {
            return $this->increment('friendnum');
        }
    }

    /**
     * 更新公开项目被使用的次数
     * @param string $id 公开项目的id
     * @return bool
     */
    public function updateLoadCount($id)
    {
        $this->from('project')->where('id', '=', $id);
        return $this->increment('loadcount');
    }

    /**
     * 对于可报名专题，当有人报名时，更新报名数目
     * @param string $id 项目id
     * @return bool
     */
    public function updateSignInNum($id)
    {
        $this->from('project')->where('id', '=', $id);
        return $this->increment('signinnum');
    }

    /**
     * 往vote_*表里插入数据
     * @param string $id 项目ID
     * @param int    $voteId 投票项ID
     * @param string $name   投票项名称
     * @return array/false
     */
    public function insertVoteNum($id, $voteId, $name)
    {
        return $this->from('vote_'.strtolower(substr($id, -1)))->insertWithId(['pid'=>$id, 'btnid'=>$voteId, 'counts'=>1, 'name'=>$name]);
    }

    /**
     * 更新投票项的投票数
     * @param string $id 项目ID
     * @param int    $voteId 投票项ID
     * @return array/false
     */
    public function updateVoteNum($id, $voteId)
    {
        $this->from("vote_".strtolower(substr($id, -1)))->where([['pid', '=', $id],['btnid', '=', $voteId]], '', '');
        return $this->increment('counts');
    }
}
