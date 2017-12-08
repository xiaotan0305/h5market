<?php
/**
 * Project:     搜房网php框架
 * File:        Web.php
 *
 * <pre>
 * 描述：Web控制器
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Controllers
 * @author     pandeng <pandeng.bj@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Api控制器
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Controllers
 * @author     pandeng <pandeng.bj@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
 
use models\Http\Wxshare;
 
class WebController extends AbstractWebController
{
    /**
     * 外部用户预览页面
     * @return void
     */
    public function indexAction()
    {
        //微信分享
        $wxShare = new WxShare();
        $signInfo = $wxShare->getWxShareSignInfo();
        //获取所有的http参数
        $params = Yaf_Registry::get('http_param');
        //为了获取url中的city，channel，source参数
        $requestUri = $params['server']['REQUEST_URI'];
        $parseUrl = parse_url($requestUri);
        if (isset($parseUrl['query'])) {
            parse_str($parseUrl['query'], $query);
        }
        //判断是手机预览还是PC
        $isPc = isset($query['isPc']) && intval($query['isPc']) === 1 ? true : false;
        $id = isset($params['params']['id']) && strlen($params['params']['id']) > 0 ? trim($params['params']['id']) : '';
        if (!$id) {
            $id = isset($params['get']['id']) && strlen($params['get']['id']) > 0 ? trim($params['get']['id']) : '';
        }

        $type = isset($params['params']['t']) ? $params['params']['t'] : '';
        if ($type === '') {
            $type = isset($params['get']['t']) ? $params['get']['t'] : '';
        }
        if ($type !== 'm' && $type !== 'p') {
            $type = 'p';
        }
        //预览页面的标题与简介
        $result = [];
        try {
            $market = new MarketModel();
            $result = $market->getProjectById($id);

            if (!$result) {
                $result = $market->getMultiTemplateById($id);
                $result[0]['loading'] = '';
                $result[0]['user'] = 'admin';
            }

            if (count($result) > 0) {
                //配置数据
                $conf = $this->conf;
                if (isset($result[0]['cover']) && 0 == preg_match('/(^(https?:)?\/\/cdn[n|s]\.soufunimg\.com)|((https?:)?\/\/img\w{0,3}\.soufunimg\.com)|(^(https?:)?\/\/\w+\.soufunimg\.com\/h5)/', $result[0]['cover'])) {
                    $result[0]['cover'] = $conf['domain']['imgUrl']['admin'] . 'imgs/' . $result[0]['cover'];
                }

                if ($result[0]['loading'] != '' && false === strpos($result[0]['loading'], 'img8.soufunimg.com')) {
                    $result[0]['loading'] = $conf['domain']['imgUrl']['admin'] . 'imgs/' . $result[0]['loading'];
                }

                $result = $result[0];

            }

            //生成一个关闭浏览器就失效的cookie，防止刷手机验证码
            if (!isset($_COOKIE['code_cookie'])) {
                $value = Util::encrypt(rand(10000, 100000000), 'hde36ikr', 'hde36ikr', 'UploadImg');
                setcookie('code_cookie', $value, 0, '/');
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
            exit;
        }
        if (count($signInfo) > 0) {
            $this->_view->assign('signInfo', $signInfo);
        } else {
            $this->_view->assign('signInfo', false);
        }
        //为表单设置httponly的cookie
        if (isset($result['forminfo'])) {
            $forminfo = json_decode($result['forminfo'], true);
            foreach ($forminfo as $key => $val) {
                setcookie($val['formid'], $id.'_'.$val['formid'], time()+3600, '/', '.fang.com', false, true);
            }
            if ($isPc === false) {
                $logData['id'] = $id;//项目id
                $logData['ip'] = Util::getClientIpAndPort(true)['ip'];//获取客户端ip
                $logData['referer'] = isset($params['server']['HTTP_REFERER']) ? trim($params['server']['HTTP_REFERER']) : '';
                $logData['ua'] = $params['server']['HTTP_USER_AGENT'];
                if (isset($params['cookie']['sfut'])) {
                    $logData['sfut'] = $params['cookie']['sfut'];
                } else {
                    $logData['sfut'] = '';
                }
                self::writeSignInfoLog($logData, 'indexLog');
            }
        }
        $this->_view->assign('id', $id);
        $this->_view->assign('type', $type);
        $this->_view->assign('result', $result);
        $this->_view->assign('isPc', $isPc);
        isset($query['city']) ? $this->_view->assign('city', $query['city']) : $this->_view->assign('city', '');
        isset($query['channel']) ? $this->_view->assign('channel', $query['channel']) : $this->_view->assign('channel', '');
        isset($query['source']) ? $this->_view->assign('source', $query['source']) : $this->_view->assign('source', '');
        $this->_view->display('web/preview.html');
    }

    /**
     * 报名数据提交
     * @return json
     * @author chenhongyan
     */
    public function ajaxSubSignInfoAction()
    {
        //获取所有的http参数
        $params = Yaf_Registry::get('http_param');
        //获取用户提交的报名信息
        $eventid = isset($params['post']['eventid']) && strlen($params['post']['eventid']) > 0 ? trim($params['post']['eventid']) : '';
        $mobile = isset($params['post'][2]) && strlen($params['post'][2]) > 0 ? trim($params['post'][2]) : '';
        //优惠券id
        $couponId = isset($params['post']['couponId']) && strlen(trim($params['post']['couponId'])) > 0?trim($params['post']['couponId']) : '';
        //城市
        $city = isset($params['post']['city']) && trim($params['post']['city']) != '' ? trim($params['post']['city']) : 'bj';

        //重复提交限制，获得表单id
        if (strpos($eventid, '_')) {
            $formid = explode('_', $eventid)[1];
        }
        if (!isset($_COOKIE[$formid]) || !$_COOKIE[$formid]) {
            Output::outputData(array('errcode' => 0, 'errmsg' => '请不要重复提交数据!'));
            exit;
        }
        //需要记录到日志中的数据
        $logData = ['eventid' => $eventid, 'mobile' => $mobile, 'couponId'=> $couponId];
        //先从project表中取出表单的相关信息
        try {
            $market = new MarketModel();
            $formInfo = $market->getFormInfoByeventId($eventid);
            //判断提交的表单是否需要验证验证码
            //array(0=>'1',2=>'2')
            if (isset($formInfo['errcode']) && $formInfo['errcode'] == 0) {
                Output::outputData($formInfo);
                exit;
            } else {
                if (isset($formInfo['limit']) && $formInfo['limit'] === 'nameTel') {
                    //如果该表单需要验证验证码,就进行下面的操作,否则就提交报名信息
                     //验证数据格式，姓名、手机号、验证码必填
                    if (!Validator::isMobile($mobile)) {
                        Output::outputData(array('errcode' => 0, 'errmsg' => '手机号格式不正确!'));
                        exit;
                    }
                    try {
                        //获取用户信息
                        $userModel = new UserModel();
                        $userinfo = $userModel -> getLoginUser();
                        if ($userinfo == false || empty($userinfo['userid'])) {
                            $logData['errmsg'] = "获取登录用户信息失败";
                            $logData['result'] = $userinfo ? json_encode($userinfo) : 'false';
                            $logData['ip'] = Util::getClientIpAndPort()['ip'];//获取客户端ip
                            $logData['referer'] = isset($params['server']['HTTP_REFERER']) ? trim($params['server']['HTTP_REFERER']) : '';
                            $logData['ua'] = $params['server']['HTTP_USER_AGENT'];
                            self::writeSignInfoLog($logData, 'signInfoLog');
                            Output::outputData(array('errcode' => 0, 'errmsg' => '验证码验证失败!'));
                            exit;
                        } else {
                            //如果是需要验证码的话,就给提交到数据库的数据中增加userid字段
                            $userid = $userinfo['userid'];
                        }
                        $logData['limit'] = 'nameTel';
                    } catch (Exception $e) {
                        $logData['errmsg'] = "获取登录用户信息失败";
                        $logData['ip'] = Util::getClientIpAndPort()['ip'];//获取客户端ip
                        $logData['referer'] = isset($params['server']['HTTP_REFERER']) ? trim($params['server']['HTTP_REFERER']) : '';
                        $logData['ua'] = $params['server']['HTTP_USER_AGENT'];
                        self::writeSignInfoLog($logData, 'signInfoLog');
                        Output::outputData(array('errcode' => 0, 'errmsg' => '验证码验证失败!'));
                        exit;
                    }

                } else {
                    //如果是不需要验证码的话,就给提交到数据库的数据中userid字段为空
                    $userid = '';
                    $logData['limit'] = 'none';
                }
                $logData['userid'] = $userid;
                //将表单数据从$params变量中取出和$formInfo中的inputId对应
                foreach ($formInfo['formInputId'] as $key => $val) {
                    //获取要存入form_*表中的数据
                    $data[$val] = trim($params['post'][$val]);
                }
                //20160311增加验证用户提交信息是否都为空,如果都为空就限制用户提交
                $dataLength = count($data);//获取用户提交的信息条数
                $emptyLength = 0;//记录用户提交的空信息的条数
                foreach ($data as $value) {
                    if ($value == '') {
                        $emptyLength++;
                    }
                }
                if ($dataLength == $emptyLength) {
                    Output::outputData(array('errcode' => 0, 'errmsg' => '您输入的内容不能全部为空'));
                    exit;
                }
                $data[] = date('Y-m-d H:i:s');
                $logData['data'] = json_encode($data);
                try {
                    $formModel = new FormModel();
                    //如果是需要手机验证码的表单,提交的时候先验证userid是否已经提交过,如果提交过就不让再次提交
                    if (isset($formInfo['limit']) && $formInfo['limit'] === 'nameTel') {
                        $isExist = $formModel -> isExistSignInfo($eventid, $userid);
                        if (isset($isExist) && isset($isExist[0]['userid']) && $isExist[0]['userid'] == $userid) {
                            $logData['result'] = json_encode(array('errcode' => 0, 'errmsg' => '该手机号已经提交过数据!'));
                            $logData['ip'] = Util::getClientIpAndPort()['ip'];//获取客户端ip
                            $logData['referer'] = isset($params['server']['HTTP_REFERER']) ? trim($params['server']['HTTP_REFERER']) : '';
                            $logData['ua'] = $params['server']['HTTP_USER_AGENT'];
                            if (isset($params['cookie']['sfut'])) {
                                $logData['sfut'] = $params['cookie']['sfut'];
                            } else {
                                $logData['sfut'] = '';
                            }
                            self::writeSignInfoLog($logData, 'signInfoLog');
                            Output::outputData(array('errcode' => 0, 'errmsg' => '该手机号已经提交过数据!'));
                            exit;
                        }
                    }

                    $result = $formModel->insertSignInfo($data, $eventid, $userid);
                    //提交成功删除cookie，防止重复提交
                    if ($result == true) {
                        if (isset($_COOKIE[$formid])) {
                            setcookie($formid, '', time()-3600, '/', '.fang.com', false, true);
                        }
                        //当用户报名成功后并且有手机号和活动ID才能领取优惠券
                        if (isset($mobile) && isset($couponId) && $couponId != '') {
                            $formModel = new FormModel();
                            //先根据优惠券ID查询该优惠券是房天下优惠券还是第三方优惠券
                            $couponModel = new CouponModel();
                            $couponInfo = $couponModel -> queryCoupon($couponId);
                            if (isset($couponInfo) && isset($couponInfo['issuccess']) && $couponInfo['issuccess'] === 'T') {
                                //如果正常返回了优惠券信息说明是房天下优惠券,使用房天下接口领取优惠券
                                $getCoupon = $couponModel -> getFangCoupon($userid, $couponId);
                            } else {
                                //否则调用第三方接口发放优惠券
                                //获取城市名称
                                $citylist = Yaf_Registry::get('citylist')['citylist'][strtoupper($city[0])];
                                foreach ($citylist as $key => $value) {
                                    if ($value['shortname'] == $city) {
                                        $cityname = $value['cityname'];
                                        break;
                                    } else {
                                        $cityname = '北京';
                                    }
                                }
                                $getCoupon = $couponModel -> getThirdCoupon($userid, $couponId, $cityname);
                            }
                            $logData['getCoupon'] = json_encode($getCoupon);
                            if (isset($getCoupon) && isset($getCoupon['issuccess']) && $getCoupon['issuccess'] == 'T') {
                                //当领取奖品成功后,返回领取的奖品名称
                                $result = array('errcode' => 1, 'errmsg' => $getCoupon['message']);
                            } else {
                                $result = array('errcode' => 1, 'errmsg' => '');
                            }
                        } else {
                            $result = array('errcode' => 1, 'errmsg' => '');
                        }
                    } else {
                        $result = array('errcode' => 0, 'errmsg' => '提交信息失败');
                    }
                    $logData['result'] = json_encode($result);
                    $logData['ip'] = Util::getClientIpAndPort()['ip'];//获取客户端ip
                    $logData['referer'] = isset($params['server']['HTTP_REFERER']) ? trim($params['server']['HTTP_REFERER']) : '';
                    $logData['ua'] = $params['server']['HTTP_USER_AGENT'];
                    if (isset($params['cookie']['sfut'])) {
                        $logData['sfut'] = $params['cookie']['sfut'];
                    } else {
                        $logData['sfut'] = '';
                    }

                    self::writeSignInfoLog($logData, 'signInfoLog');
                    Output::outputData($result);
                } catch (Exception $e) {
                    $logData['errmsg'] = $e->getMessage();
                    $logData['ip'] = Util::getClientIpAndPort()['ip'];//获取客户端ip
                    $logData['referer'] = isset($params['server']['HTTP_REFERER']) ? trim($params['server']['HTTP_REFERER']) : '';
                    $logData['ua'] = $params['server']['HTTP_USER_AGENT'];
                    self::writeSignInfoLog($logData, 'signInfoLog');
                    Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
                }
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }

    }

    /**
     * 微信分享计数
     * @method get
     * @return void
     */
    public function ajaxWeiXinShareCountAction()
    {
        //获取所有的http参数
        $params = Yaf_Registry::get('http_param');
        //项目的id
        $id = isset($params['get']['id']) && strlen($params['get']['id']) > 0 ? trim($params['get']['id']) : '';
        //type为1则为分享到朋友圈，type为0则为发送到朋友
        $type = isset($params['get']['type']) && intval($params['get']['type']) == 1 ? 1 : 0;
        //用户统计日志数据
        $data = [
            'guid' => $params['cookie']['global_cookie'],
            'projectid' => $id,
            'type' => $type ? 'circle' : 'friend'
        ];
        try {
            $markert = new MarketModel();
            //插入数据到用户统计日志
            $log = $markert->insertUserCountLiog($data);
            $result = $markert->wxShareCountIncrease($id, $type);
            if ($result && $log) {
                Output::outputData(['errcode' => 1, 'errmsg' => '分享成功']);
            } else {
                Output::outputData(['errcode' => 0, 'errmsg' => '分享失败']);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 统计投票数
     * @return void
     * @author chenhongyan
     * @date   20160422
     */
    public function ajaxVoteAction()
    {
        //获取所有的http参数
        $params = Yaf_Registry::get('http_param');
        //项目ID
        $projectId = isset($params['get']['id']) && trim($params['get']['id']) != '' ? trim($params['get']['id']) : '';
        //投票项的ID
        $voteId = isset($params['get']['voteId']) && trim($params['get']['voteId']) != '' ? trim($params['get']['voteId']) : '';
        //name 投票项的名称
        $name = isset($params['get']['name']) && trim($params['get']['name']) != '' ? trim($params['get']['name']) : '';

        if ($projectId == '') {
            Output::outputData(['errcode'=>0, 'errmsg'=>'项目的ID不能为空!']);
            exit;
        }
        if ($voteId == '') {
            Output::outputData(['errcode'=>0, 'errmsg'=>'投票的ID不能为空!']);
            exit;
        }
        //根据cookie,限制投票
        if (isset($_COOKIE[$projectId.'_'.$voteId])) {
            //重复投票,提示
            Output::outputData(['errcode'=>0, 'errmsg'=>'您已经点过赞!']);
            exit;
        }
        try {
            $formModel = new FormModel();
            $result = $formModel->vote($projectId, $voteId, $name);
            if ($result['errcode'] > 0) {
                Output::outputData(['errcode'=>1, 'errmsg'=>'投票成功!', 'counts'=>$result['counts']]);
            } else {
                Output::outputData(['errcode'=>0, 'errmsg'=>'投票失败!', 'counts'=>$result['counts']]);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode'=>0, 'errmsg'=>'投票失败!']);
        }
    }

    /**
     *记录用户发送验证码的行为日志
     */
    public function ajaxSendCodeLogAction()
    {
        $params = Yaf_Registry::get('http_param');
        $data['eventid'] = isset($params['post']['eventid']) && strlen($params['post']['eventid']) > 0 ? trim($params['post']['eventid']) : '';
        $data['mobile'] = isset($params['post']['mobile']) && strlen($params['post']['mobile']) > 0 ? trim($params['post']['mobile']) : '';
        $logData['ip'] = Util::getClientIpAndPort()['ip'];//获取客户端ip
        $logData['referer'] = isset($params['server']['HTTP_REFERER']) ? trim($params['server']['HTTP_REFERER']) : '';
        $logData['ua'] = $params['server']['HTTP_USER_AGENT'];
        if (isset($params['cookie']['sfut'])) {
            $logData['sfut'] = $params['cookie']['sfut'];
        } else {
            $logData['sfut'] = '';
        }
        $data['date'] = date('Y-m-d H:i:s', time());
        self::writeSignInfoLog($data, 'sendCodeLog');
    }
    /**
     *记录用户发送验证码的行为日志
     */
    public function imLogAction()
    {
        $params = Yaf_Registry::get('http_param');
        $type = isset($params['post']['type']) ? $params['post']['type'] : 'flash';
        $logData['mesg'] = isset($params['post']['mesg']) ? $params['post']['mesg'] : '';
        $logData['ip'] = Util::getClientIpAndPort()['ip'];//获取客户端ip
        $logData['referer'] = $params['server']['HTTP_REFERER'];
        $logData['ua'] = $params['server']['HTTP_USER_AGENT'];
        if (isset($params['cookie']['sfut'])) {
            $logData['sfut'] = $params['cookie']['sfut'];
        } else {
            $logData['sfut'] = '';
        }
        $logData['date'] = date('Y-m-d H:i:s', time());
        if ($type !== 'flash') {
            $type = 'web';
        }
        self::writeSignInfoLog($logData, 'im'.$type.'Log');
        Output::outputData(['errcode'=>1, 'errmsg'=>'ok']);
    }

    /**
     * 记录用户报名的行为日志
     * @param array $data 需要记录的数据
     */
    private function writeSignInfoLog($data, $filename)
    {
        $log = new Log($filename);
        $str = '';
        if (isset($data) && is_array($data)) {
            foreach ($data as $key => $value) {
                $str .= $value.';;';
            }
        }
        $log -> fileWrite($str);
    }
}
/* End of file Web.php */
