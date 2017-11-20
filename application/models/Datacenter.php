<?php
/**
 * Project:     搜房网php框架
 * File:        Datacenter.php
 *
 * <pre>
 * 描述：数据中心Model
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
 * 数据中心Model
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
use models\Http\Datacenter as DatacenterHttp;

class DatacenterModel extends BaseModel
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
     * 构造函数
     */
    public function __construct()
    {
        parent::__construct();

        $cache_conf = Yaf_Registry::get('cache');

        //如果这个模块设置开启，且配置文件允许缓存
        if ($this->_cache_open === true && $cache_conf['cacheOpen'] === true) {
            $this->_cache_obj = new DatacenterCache();
        } else {
            $this->_cache_open = false;
        }
    }

    /**
     * 获取当前项目的UV、PV
     * @param string $projectId 项目Id
     * @param string $startDate 项目上线时间
     * @return array/string/false
     */
    public function getUvPv($projectId)
    {
        //根据项目Id获取当前项目的url
        $url = 'm.fang.com/h5market/' . $projectId;//接口type参数的值中不需要地址里的最后的‘/’
        $nowDate = date('Y-m-d');//当前时间
        $days = date('N', strtotime($nowDate));//当前时间在本周的第几天
        $startDate = date('Y-m-d', strtotime('-'.$days.' days'));//本周开始时间
        $DatacenterHttp = new DatacenterHttp();
        $result = $DatacenterHttp->getUvPv(array(
            'startDate' => $startDate,
            'endDate' => $nowDate,
            'type' => $url
        ));
        //取出project表中的PV/UV
        $MarketModel = new MarketModel();
        $projects = $MarketModel->getProjectsById(['id', 'uv', 'pv'], [['id', '=', $projectId]]);
        if ((isset($result['state']) && $result['state'] == '1') || $result['Message'] == '对不起,没有数据！') {
            $res = array(
                'errcode' => 1,
                'data' => array(
                    'totalUv' => 0,
                    'totalPv' => 0,
                    'weekUv' => 0,
                    'weekPv' => 0,
                    'todayUv' => 0,
                    'todayPv' => 0,
                ),
                'errmsg' => ''
            );
            $res['data']['totalUv'] = $projects[0]['uv'];
            $res['data']['totalPv'] = $projects[0]['pv'];
            if (isset($result['data']) && is_array($result['data'])) {
                foreach ($result['data'] as $key => $value) {
                    //计算今天的uv、pv
                    if ($value['date'] == $nowDate) {
                        $res['data']['todayUv'] = $value['uv'];
                        $res['data']['todayPv'] = $value['pv'];
                    }
                    //计算本周的uv、pv
                    if (date('W', strtotime($value['date'])) == date('W', strtotime($nowDate)) && $value['hour'] == 23) {
                        $res['data']['weekUv'] += $value['uv'];
                        $res['data']['weekPv'] += $value['pv'];
                    }
                }
                $res['data']['totalUv'] += $res['data']['todayUv'];
                $res['data']['totalPv'] += $res['data']['todayPv'];
                $res['data']['weekUv'] += $res['data']['todayUv'];
                $res['data']['weekPv'] += $res['data']['todayPv'];
            }
            return $res;
        } else {
            return array('errcode' => 0, 'errmsg' => $result['Message']);
        }
    }

    /**
     * @param string $projectId 项目id
     * @param int    $begin     初始时间
     * @param int    $end       结束时间
     * @return int
     * @throws Exception
     */
    public function getUvByTime($projectId, $begin, $end)
    {
        //根据项目Id获取当前项目的url
        $url = 'm.fang.com/h5market/' . $projectId;
        $DatacenterHttp = new DatacenterHttp();
        $result = $DatacenterHttp->getUvPv(array(
            'startDate' => date('Y-m-d', $begin),
            'endDate' => date('Y-m-d', $end),
            'type' => $url
        ));
        $uv = 0;

        if (isset($result['state']) && $result['state'] == '1') {
            if (isset($result['data']) && is_array($result['data'])) {
                foreach ($result['data'] as $value) {
                    if ($value['hour'] == '23') {
                        $uv += $value['uv'];
                    }
                }
            }
        }

        return $uv;
    }

    /**
     * 获取当前项目的UV、PV(昨天一整天的)
     * @param string $projectId 项目Id
     * @param string $startDate 项目上线时间
     * http://datacenter.www2.fang.com/Api/GetUVForWAPByHourData?startDate=2016-12-07&endDate=2016-12-07&type=m.fang.com%2Fh5market%2Ff3321c01a7254da0f401812d9ca3f7b2
     * @return array/string/false
     */
    public function getTotalUvPv($projectId, $startDate)
    {
        //根据项目Id获取当前项目的url
        $url = 'm.fang.com/h5market/'.$projectId;
        $DatacenterHttp = new DatacenterHttp();
        $result = $DatacenterHttp->getUvPv(array('startDate'=>$startDate, 'endDate'=>$startDate, 'type'=>$url));
        if ((isset($result['state']) && $result['state'] == '1') || $result['Message'] == '对不起,没有数据！') {
            $res = array(
                    'errcode'  => 1,
                    'data' => array(
                            'totalUv' => 0,
                            'totalPv' => 0,
                    ),
            );
            if (isset($result['data']) && is_array($result['data'])) {
                foreach ($result['data'] as $key => $value) {
                    //计算全部的uv、pv(hour=23时是全天的UV,PV)
                    if ($value['hour'] == 23) {
                        $res['data']['totalUv'] = $value['uv'];
                        $res['data']['totalPv'] = $value['pv'];
                    }
                }
            }
            return $res;
        } else {
            return array('errcode'=>0, 'errmsg'=>$result['Message']);
        }
    }

    /**
     * 定时执行脚本获取项目昨天的UV、PV加到库里
     * @return array/boolean
     */
    public function upDateUvPv()
    {
        $file_log = new Log('updateuvpv');
        $file_log->fileWrite('~~脚本文件终于执行~~');
        try {
            //取出project表中的所有项目
            $MarketModel = new MarketModel();
            $projects = $MarketModel->getProjectsByCondition(['id', 'createtime', 'user', 'uv', 'pv']);
            if (isset($projects) && count($projects) > 0) {
                foreach ($projects as $key => $value) {
                    try {
                        //请求数据中心接口，获取项目昨天的uv、pv
                        $yesterday = date('Y-m-d', strtotime('-1 day'));
                        $result = $this->getTotalUvPv($value['id'], $yesterday);
                        if ($result['errcode'] == 1) {
                            //将uv、pv写入数据库project表中
                            if ($result['data']['totalUv'] != 0 || $result['data']['totalPv'] != 0) {
                                try {
                                    //将取到的昨天的UV,PV加到数据库中
                                    $result['data']['totalUv'] = $value['uv'] + $result['data']['totalUv'];
                                    $result['data']['totalPv'] = $value['pv'] + $result['data']['totalPv'];
                                    $data = ['id'=>$value['id'], 'user' => $value['user'], 'data'=>['uv'=>$result['data']['totalUv'], 'pv'=>$result['data']['totalPv']]];
                                    $res = $MarketModel->updateProjectByIdAndUser($data);
                                    if (isset($res) && $res > 0) {
                                        $file_log->fileWrite($value['id'].' uv、pv更新成功');
                                    } else {
                                        $file_log->fileWrite($value['id'].' uv、pv更新失败');
                                    }
                                } catch (Exception $e) {
                                    $file_log->fileWrite($value['id']. ' ' . $e->getMessage());
                                }
                            } else {
                                $file_log->fileWrite($value['id'].' uv '.$value['uv'].' '.$result['data']['totalUv'].' pv '.$value['pv'].' '.$result['data']['totalPv'].' uv或pv数量没有变化');
                            }
                        } else {
                            $file_log->fileWrite($value['id'].' '.$result['errmsg']);
                        }
                    } catch (Exception $e) {
                        $file_log->fileWrite($value['id']. ' ' . $e->getMessage());
                    }
                }
            } else {
                $file_log->fileWrite('没有获取到项目');
            }
        } catch (Exception $e) {
            $file_log->fileWrite($e->getMessage());
        }
    }
}

/* End of file Datecenter.php */
