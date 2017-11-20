<?php
/**
 * Project:     搜房网php框架
 * File:        Form.php
 *
 * <pre>
 * 描述：表单Model
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     chenhongyan <chenhongyan@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 表单Model
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     chenhongyan <chenhongyan@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
use models\Db\MarketWrite as MarketWriteDb;
use models\Db\MarketRead as MarketReadDb;
use models\Http\Coupon as CouponHttp;

class FormModel extends BaseModel
{
    /**
     * 将报名信息插入到数据库中
     * @param json $json_data 用户提交的报名信息
     * @param string $eventid 项目id_formid
     * @param int    $userid  当前登录用户的id
     * @return array/false
     */
    public function insertSignInfo($json_data, $eventid, $userid)
    {
        //处理formid取project的最后一位
        $id = explode('_', $eventid)[0];
        $form_sign = strtolower(substr($id, -1));
        $data = array('eventid' => $eventid, 'content' => json_encode($json_data), 'userid' => $userid, 'createtime' => strtotime($json_data[count($json_data)]));
        $MarketWriteDb = new MarketWriteDb();
        //某一个专题有人报名时，该专题的报名数加1
        $result = $MarketWriteDb->trans('form_' . $form_sign, $data, $id);
        return $result;
    }


    /**
     * 处理从某一个项目表单中取出的数据
     * @param string $projectId 项目id
     * @return array/false
     */
    public function getSignInfoByProjId($projectId)
    {
        //先从project表中取出form表单的Id，然后在从form表中取出报名信息
        $MarketReadDb = new MarketReadDb();
        $json_projInfo = $MarketReadDb->selectDataByCondition('project', ['id', 'forminfo'], [['id', '=', $projectId]]);
        if (isset($json_projInfo[0]['forminfo']) && $json_projInfo[0]['forminfo'] != '') {
            //如果存在forminfo，说明这个项目中有表单
            $formInfo = Util::parseJson($json_projInfo[0]['forminfo']);
            if (isset($formInfo) && is_array($formInfo) && count($formInfo) > 0) {
                foreach ($formInfo as $key => $value) {
                    $file[$value['formid']][0] = '';
                    $formid[$key] = $value['formid'];
                    $len[$key] = count($value['forminfo']);
                    $file[$value['formid']][0] = $value['title'];//表单的标题
                    $file[$value['formid']][1] = '';
                    foreach ($value['forminfo'] as $k => $v) {
                        $file[$value['formid']][1] .= $v['name'];
                        if ($k < $len[$key] - 1) {
                            $file[$value['formid']][1] .= ',';
                        } else {
                            $file[$value['formid']][1] .= ',提交时间';
                        }
                        $file[$value['formid']][0] .= ',';
                    }
                }
            }
        }

        if (isset($formid) && count($formid) > 0) {
            foreach ($formid as $fkey => $fval) {
                if ($fval != '') {
                    $id = substr($projectId, -1, 1);
                    $wheres = [['eventid', '=', $projectId . '_' . $fval]];
                    $MarketReadDb = new MarketReadDb();
                    $result[$fkey] = $MarketReadDb->selectDataByCondition('form_' . $id, ['*'], $wheres);
                }
            }
        }

        if (isset($result) && is_array($result) && count($result) > 0) {
            foreach ($result as $rkey => $rvalue) {
                if (is_array($rvalue) && count($rvalue) > 0) {
                    foreach ($rvalue as $key => $value) {
                        if ($value['eventid'] != '') {
                            $eventArr = explode('_', $value['eventid']);
                        }
                        $file[$eventArr[1]][$key + 2] = '';
                        $fileStr[$eventArr[1]] = '';
                        if ($value['content'] != '') {
                            $count = count(Util::parseJson($value['content']));
                            foreach (Util::parseJson($value['content']) as $k => $v) {
                                $file[$eventArr[1]][$key + 2] .= $v;
                                if ($k < $count) {
                                    $file[$eventArr[1]][$key + 2] .= ',';
                                }
                            }
                        }
                    }
                } else {
                    //判断form_*表中是否有报名信息
                    return $file = array(0 => array(0 => ''));
                }
            }
        }
        return $file;
    }

    /**
     * 领取优惠券
     * @param string $couponId 活动ID
     * @param string $phone 当前用户手机号
     * @return array/boolean
     */
    public function getCoupon($couponId, $phone)
    {
        try {
            $key = Util::encrypt($phone, '9e1c0wap', 'wap6g0g4', 'UploadImg');
            $couponHttp = new CouponHttp();
            $result = $couponHttp ->getCoupon(array('m' => 'getNewWheelPrize', 'class' => 'NewWheelHTML5Hc', 'lotteryId' => $couponId, 'phone' => $phone, 'key' => $key));
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取报名人数
     * @param string $id 项目ID
     * @param int    $fromid 表单ID
     * @return array/false
     * chenhongyan 2016.3.2
     */
    public function getSignNum($id, $formId)
    {
        try {
            $marketReadDb = new MarketReadDb();
            $count = $marketReadDb -> getSignNumById($id, $formId);
            return $count;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 投票
     * @param string $id 项目ID
     * @param int    $voteId 投票项ID
     * @param string $name   投票项名称
     * @return array/false
     * chenhongyan 2016.4.25
     */
    public function vote($id, $voteId, $name)
    {
        try {
            //先判断是否已经存在这条记录
            $marketRDModel = new MarketReadDb();
            $marketWTModel = new MarketWriteDb();
            $voteInfo = $marketRDModel -> getVoteInfo($id, $voteId);

            if (isset($voteInfo) && !empty($voteInfo)) {
                //如果成功返回int 1,失败返回int 0
                $res = $marketWTModel -> updateVoteNum($id, $voteId);
                if ($res == 1) {
                    $result['counts'] = $voteInfo[0]['counts']+1;
                } else {
                    $result['counts'] = $voteInfo[0]['counts'];
                }
            } else {
                //如果成功直接返回int类型,例如3
                $res = $marketWTModel -> insertVoteNum($id, $voteId, $name);
                if ($res > 0) {
                    $result['counts'] = 1;
                } else {
                    $result['counts'] = 0;
                }
            }
            $result['errcode'] = $res;
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取项目里的投票信息
     * @param string $id 项目id
     * @return array
     * @author chenhongyan 20150504
     */
    public function getVoteInfo($id)
    {
        try {
            $marketRead = new MarketReadDb();
            $result = $marketRead -> getVoteInfo($id, 0);

            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 根据eventid和userid查询该表单中是否已经存在这个userid的报名信息
     * 注意:只针对需要手机验证码的表单
     * @param string $eventid 项目ID_表单ID
     * @param int    $userid  当前用户的id
     * return false/array
     */
    public function isExistSignInfo($eventid, $userid)
    {
        //处理formid取project的最后一位
        $id = explode('_', $eventid)[0];
        $form_sign = strtolower(substr($id, -1));
        $where = [['eventid', '=' ,$eventid], ['userid', '=' , $userid]];
        //'project', ['id', 'forminfo'], [['id', '=', $projectId]]
        $marketReadDb = new MarketReadDb();
        //某一个专题有人报名时，该专题的报名数加1
        $result = $marketReadDb->selectDataByCondition('form_'.$form_sign, '*', $where);
        return $result;
    }
}

/* End of file Form.php */
