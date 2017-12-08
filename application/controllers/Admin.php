<?php
/**
 * Project:     搜房网php框架
 * File:        Admin.php
 *
 * <pre>
 * 描述：Admin控制器
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
 * Admin控制器
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
class AdminController extends AbstractAdminController
{

    /**
     * Index页面
     * @return void
     */
    public function indexAction()
    {
        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        //$user = self::$login_user_info['userid'];
        $params = Yaf_Registry::get('http_param');
        //分页页码
        $page = isset($params['get']['page']) && intval($params['get']['page']) > 0 ? intval($params['get']['page']) : 1;
        //$status为delete显示回收站中项目列表，否则显示我的项目列表
        $status = isset($params['get']['status']) && trim($params['get']['status']) === 'delete' ? 'delete' : 'online';
        try {
            $market = new MarketModel();
            $count = $market->getProjectCountByUser($user, $status);

            $project = $market->getProjectsByUserAndPage($user, $page, $status);
            $sysTemplate = $market->getMultiTemplate(1);//默认是分类id是1
            if (!empty($project) && is_array($project)) {
                $project = $market->getAbsoluteCoverPath($project);
                $project = $market->getPreviewUrl($project, self::$login_admin_info);
            } else {
                $project = array();
            }
        } catch (Exception $e) {
            $this->jumpToError();
            exit;
        }

        /**
         * @var Smarty3Adapter $smarty3Adapter
         */
        $smarty3Adapter = $this->_view;
        //拥有编辑系统组模板权限的用户组
        if (in_array($user, self::$users)) {
            $smarty3Adapter->assign('permission', true);
        } else {
            $smarty3Adapter->assign('permission', false);
        }
        $smarty3Adapter->assign('status', $status);
        $smarty3Adapter->assign('count', $count);
        $smarty3Adapter->assign('page', $page);
        $smarty3Adapter->assign('sysTemplate', $sysTemplate);
        $smarty3Adapter->assign('project', $project);
        $smarty3Adapter->display('admin/index.html');
    }

    /**
     * 帮助页面
     * @return void
     */
    public function helpAction()
    {
        $this->_view->display('admin/help.html');
    }

    /**
     * 更新日志页面
     * @return void
     */
    public function updateLogAction()
    {
        $this->_view->display('admin/log.html');
    }

    /**
     * 城市集团渠道选择页面
     * @return void
     */
    public function citylistAction()
    {
        $params = Yaf_Registry::get('http_param');
        $id = isset($params['get']['id']) && strlen(trim($params['get']['id'])) === 32 ? trim($params['get']['id']) : false;
        $from = isset($params['get']['from']) && trim($params['get']['from']) === 'preview' ? 'preview' : 'index';
        if ($from === 'preview') {
            $burl = $this->conf['domain']['siteUrl']['admin'] . '?c=admin&a=pcpreview&id=' . $id . '&t=p&f=index';
            $this->_view->assign('burl', $burl);
            $this->_view->assign('id', $id);
            try {
                $market = new MarketModel();
                $result = $market->getProjectById($id, 0, 'edit');
                //如果项目中没有城市集团渠道分享参数，则从用户表中取得
                if (isset($result[0]['city']) && !$result[0]['city']) {
                    $result[0]['city'] = self::$login_admin_info['city'];
                    $result[0]['groups'] = self::$login_admin_info['groups'];
                    $result[0]['source'] = self::$login_admin_info['source'];
                }

                $this->_view->assign('result', $result[0]);

            } catch (Exception $e) {
                $this->jumpToError();
                exit;
            }

        } else {
            $this->_view->assign('result', self::$login_admin_info);
            $this->_view->assign('id', '');
            $this->_view->assign('burl', '');
        }

        $this->_view->assign('groups', Yaf_Registry::get('groups')['groups']);
        $this->_view->assign('citylist', Yaf_Registry::get('citylist')['citylist']);
        $this->_view->assign('from', $from);
        $this->_view->display('admin/city.html');
    }

    /**
     * 集团流量数据统计
     * @return void
     */
    public function tongjiAction()
    {
        $this->_view->display('admin/tongji.html');
    }

    /**
     * 集团流量数据统计ajax
     * @return void
     */
    public function ajaxTongjiDataAction()
    {
        $params = Yaf_Registry::get('http_param');
        $flag = isset($params['get']['flag']) ? intval($params['get']['flag']) : 1;
        $begin = isset($params['get']['begin']) ? trim($params['get']['begin']) : '';
        $end = isset($params['get']['end']) ? trim($params['get']['end']) : '';
        $group = isset($params['get']['group']) ? trim($params['get']['group']) : '';
        $data = ['group' => $group, 'begin' => $begin, 'end' => $end];

        try {
            $market = new MarketModel();
            $result = $market->getProjectNum($data, $flag);
            //增加对city=quanguo的处理
            if (isset($result['quanguo'])) {
                $quanguo = $result['quanguo'];
                unset($result['quanguo']);
            } else {
                $quanguo = false;
            }
            $this->_view->assign('quanguo', $quanguo);
            $this->_view->assign('result', $result);
            Output::outputData(trim($this->_view->render('admin/ajaxTongji.html')));
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * Index页面删除项目按钮
     * @return void
     */
    public function ajaxDelProjectByIdAction()
    {
        $params = Yaf_Registry::get('http_param');
        $jsonArr = array();
        $id = isset($params['get']['id']) && trim($params['get']['id'] != false) ? trim($params['get']['id']) : '';
        if (!$id) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '项目删除失败,项目id为空';
            Output::outputData($jsonArr);
            exit;
        }
        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        $data = [
            'id' => $id,
            'user' => $user,
            'data' => [
                'status' => 'delete',
                'isopen' => 0,
                'loadcount' => 0,
            ],

        ];
        try {
            $market = new MarketModel();
            $result = $market->updateProjectByIdAndUser($data);
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,项目删除失败';
            Output::outputData($jsonArr);
            exit;
        }
        if ($result) {
            $jsonArr['errcode'] = 1;
            $jsonArr['errmsg'] = '项目删除成功';
        } else {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,项目删除失败';
        }
        Output::outputData($jsonArr);
    }

    /**
     * Index页面上下线项目按钮
     * @return void
     */
    public function ajaxChangeProjectStatusByIdAction()
    {
        $params = Yaf_Registry::get('http_param');
        $jsonArr = array();
        $id = isset($params['get']['id']) && trim($params['get']['id'] != false) ? trim($params['get']['id']) : '';
        $status = isset($params['get']['status']) && trim($params['get']['status'] != false) ? htmlspecialchars($params['get']['status']) : '';
        if (!$id) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '项目状态修改失败,项目id为空';
            Output::outputData($jsonArr);
            exit;
        }
        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        $data = array(
            'id' => $id,
            'user' => $user,
            'data' => array('status' => $status)
        );
        try {
            $market = new MarketModel();
            $result = $market->updateProjectByIdAndUser($data);
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,项目状态修改成功';
            Output::outputData($jsonArr);
            exit;
        }
        if ($result) {
            $jsonArr['errcode'] = 1;
            $jsonArr['errmsg'] = '项目状态修改成功';
        } else {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,项目状态修改失败,请稍后再试';
        }
        Output::outputData($jsonArr);
    }

    /**
     * Index页面复制项目按钮
     * @return void
     */
    public function ajaxCopyProjectByIdAction()
    {
        $params = Yaf_Registry::get('http_param');
        $jsonArr = array();
        $id = isset($params['get']['id']) && trim($params['get']['id'] != false) ? trim($params['get']['id']) : '';
        if (!$id) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '项目复制失败,项目id为空';
            Output::outputData($jsonArr);
            exit;
        }
        try {
            $market = new MarketModel();
            $data = $market->getProjectById($id, 0, 'edit');
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,项目复制失败';
            Output::outputData($jsonArr);
            exit;
        }
        $data = $data[0];
        //$data['user'] = self::$login_admin_info['email'];
        $data['user'] = self::$login_admin_info['userid'];
        $data['city'] = self::$login_admin_info['city'] ? self::$login_admin_info['city'] : '';
        $data['groups'] = self::$login_admin_info['groups'] ? self::$login_admin_info['groups'] : '';
        $data['source'] = self::$login_admin_info['source'] ? self::$login_admin_info['source'] : '';
        $data['isopen'] = 0;
        $data['loadcount'] = 0;
        $data['signinnum'] = 0;
        $data['uv'] = 0;
        $data['pv'] = 0;
        $data['friendnum'] = 0;
        $data['circlenum'] = 0;
        try {
            $market = new MarketModel();
            $result = $market->insertProject($data);
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,项目复制失败';
            Output::outputData($jsonArr);
            exit;
        }
        if ($result) {
            $jsonArr['errcode'] = 1;
            $jsonArr['errmsg'] = '项目复制成功';
            $jsonArr['pid'] = $result;
        } else {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,项目复制失败,请稍后再试';
        }
        Output::outputData($jsonArr);
    }

    /**
     * Edit页面
     * @return void
     */
    public function editAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        //获取项目id
        $id = isset($params['get']['id']) ? trim($params['get']['id']) : false;
        //id为空跳转404页面
        if (!$id) {
            $this->jumpToError();
            exit;
        }

        try {
            $market = new MarketModel();
            if (strlen($id) === 32) {
                $result = $market->getProjectById($id, 0, 'edit');
            } else {
                $result = $market->getMultiTemplateById($id);
            }
            if (!$result) {
                $this->jumpToError();
                exit;
            }
        } catch (Exception $e) {
            $this->jumpToError();
            exit;
        }
        $this->_view->display('admin/edit.html');
    }

    /**
     * Pcpreview页面
     * @return void
     */
    public function pcpreviewAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        //获取项目id
        $id = isset($params['get']['id']) && strlen(trim($params['get']['id'])) > 0 ? trim($params['get']['id']) : false;
        //类型 p为项目，m为组模板
        $t = isset($params['get']['t']) && trim($params['get']['t']) === 'm' ? 'm' : 'p';
        //来源页
        $from = ['index', 'edit', 'open'];
        $f = isset($params['get']['f']) && in_array(trim($params['get']['f']), $from) ? trim($params['get']['f']) : 'index';
        if (!$id) {
            Output::outputData(['errcode' => 0, 'errmsg' => 'id不能为空']);
            exit;
        }
        try {
            $market = new MarketModel();
            $isOpen = $market->getIsOpenById($id);
            $result = $market->getProjectById($id, 0, 'edit');
            if (!$result) {
                $this->jumpToError();
                exit;
            }

            //设置过项目中的流量本地化参数
            $color = '';
            //是否设置过用户默认的参数
            if (isset(self::$login_admin_info['city']) && self::$login_admin_info['city'] || (isset($result[0]['city']) && $result[0]['city'])) {
                $color = 'green';
            } else {
                $color = 'red';
            }

        } catch (Exception $e) {
            $this->jumpToError();
            exit;
        }

        //如果项目表中没有对应的城市集团渠道参数，则从用户表中取
        if (isset($result[0]['city']) && !$result[0]['city']) {
            $result[0]['city'] = self::$login_admin_info['city'];
            $result[0]['groups'] = self::$login_admin_info['groups'];
            $result[0]['source'] = self::$login_admin_info['source'];
        }

        $result[0]['createtime'] = date('Y-m-d H:i:s', $result[0]['createtime']);
        $result[0]['updatetime'] = date('Y-m-d H:i:s', $result[0]['updatetime']);
        //配置数据
        $conf = $this->conf;
        if (0 == preg_match('/^http:\/\/img\w{0,3}\.soufunimg\.com/', $result[0]['cover'])) {
            $result[0]['cover'] = $conf['domain']['imgUrl']['admin'] . 'imgs/' . $result[0]['cover'];
        }
        $burl = $this->conf['domain']['siteUrl']['admin'] . '?c=admin&a=pcpreview&id=' . $id . '&t=' . $t . '&f=' . $f;
        $this->_view->assign('f', $f);
        //$this->_view->assign('user', self::$login_admin_info['email']);
        $this->_view->assign('user', self::$login_admin_info['userid']);
        $this->_view->assign('color', $color);
        $this->_view->assign('id', $id);
        $this->_view->assign('result', $result);
        $this->_view->assign('isOpen', $isOpen[0]['isopen']);
        $this->_view->assign('burl', urlencode($burl));
        $this->_view->display('admin/PCPreview.html');
    }

    /**
     * 后台用户上传cover
     * @return void
     */
    public function ajaxUploadCoverAction()
    {

        try {
            $response = $this->_uploadAction();
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = $e->getMessage();
            exit;
        }
        $jsonArr = array();
        if ($response) {
            $jsonArr['errcode'] = 1;
            $jsonArr['errmsg'] = '成功';
            $jsonArr['url'] = $response;
        } else {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '失败';
        }
        Output::outputData($jsonArr);
    }

    /**
     * 后台用户上传音乐方法
     * @return string
     */
    private function _uploadMusicAction()
    {
        //$uid = self::$login_admin_info['email'];
        $uid = self::$login_admin_info['userid'];
        $arrIpPort = Util::getClientIpAndPort();
        $uip = $arrIpPort['ip'];
        $rand = rand(99, 999999);
        $timestamp = time();
        $input = "{$rand}^1.0^{$uid}^{$uip}^{$timestamp}";
        $token = Util::encrypt($input, 'Irsd4TxZ', '6o7VQA6H', 'UploadImg');
        $host = 'img1u.soufun.com';
        $url = "/upload/filesrv2?i=&city=&channel=h5market.res&t={$token}&uid={$uid}&isflash=y&_" . rand();
        $port = 80;
        $type = isset($_GET['type']) ? trim($_GET['type']) : 'audio/mp3';//这里格式如果不对的额话是否需要提示错误
        try {
            $response = PicUpload::uploadNew($host, $url, $port, $type);
        } catch (Exception $e) {
            throw $e;
        }
        // 没有值或者返回值不是完整的uri则认为上传失败。
        //返回值可能是图片地址，也可能是错误码
        if (!$response || substr($response, 0, 4) != 'http') {
            $response = str_replace('error: ', '', $response);
        }
        return $response;
    }

    /**
     * 后台用户上传img
     * @return void
     */
    public function ajaxUploadMediaAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        $type = (isset($params['get']['type']) && trim($params['get']['type']) != '') ? trim($params['get']['type']) : '';
        if ($type == 'audio/mp3') {
            $defaultFileName = '音乐.mp3';
            $typeZn = '音乐';
        } else {
            $defaultFileName = '图片.jpg';
            $typeZn = '图片';
        }
        $fileName = (isset($params['get']['fileName']) && trim($params['get']['fileName']) != false) ? trim($params['get']['fileName']) : $defaultFileName;
        //如果flag = 1不需上传图片服务器，直接入库
        $flag = isset($params['get']['flag']) && $params['get']['flag'] == 1 ? 1 : 0;

        if ($flag === 0) {
            try {
                if ($type == 'audio/mp3') {
                    $url = $this->_uploadMusicAction();
                    // 如果返回错误码，而非图片地址，则说明上传出错，需要给用户展示三种错误
                    if (is_numeric($url)) {
                        // 302 文件大小超过上限;303 无效的Content-Type;304 无效的文件类型;
                        $errArr = [302 => '文件过大啦！', 303 => '文件类型不对，请从网络下载其他资源！', 304 => '文件类型不对，请从网络下载其他资源！'];
                        $jsonArr = [];
                        $jsonArr['errcode'] = $errArr[$url] ? intval($url) : 0;
                        $jsonArr['errmsg'] = $errArr[$url] ? $errArr[$url] : '音乐上传失败！';
                        Output::outputData($jsonArr);
                        exit;
                    }
                } else {
                    $url = $this->_uploadAction();
                }
            } catch (Exception $e) {
                $jsonArr['errcode'] = 0;
                $jsonArr['errmsg'] = $e->getMessage();
                exit;
            }

            $jsonArr = array();
            if (!$url) {
                $jsonArr['errcode'] = 0;
                $jsonArr['errmsg'] = $typeZn . '上传失败';
                Output::outputData($jsonArr);
                exit;
            }
        } else {
            $url = isset($params['get']['url']) ? $params['get']['url'] : '';
        }

        $source['name'] = $fileName;
        $source['url'] = $url;

        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        $data = array(
            'source' => json_encode($source),
            'user' => $user,
            'createtime' => time(),
            'updatetime' => time()
        );
        try {
            $market = new MarketModel();
            //返回值就是图片id，音乐的id
            if ($type == 'audio/mp3') {
                $result = $market->insertMusic($data);
            } else {
                $result = $market->insertMedia($data);
            }
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = $e->getMessage();
            Output::outputData($jsonArr);
            exit;
        }
        if ($result) {
            $jsonArr['errcode'] = 1;
            $jsonArr['errmsg'] = '成功';
            $jsonArr['url'] = $url;
            if ($type == 'audio/mp3') {
                $jsonArr['musicid'] = $result;
            } else {
                $jsonArr['picid'] = $result;
            }
        } else {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '失败';
        }
        Output::outputData($jsonArr);
    }

    /**
     * 后台用户上传cover后重新发起请求将图片url插入数据库
     * @return void
     */
    public function ajaxUpdateCoverAction()
    {
        $params = Yaf_Registry::get('http_param');
        $url = (isset($params['get']['imgUrl']) && trim($params['get']['imgUrl']) != false) ? trim($params['get']['imgUrl']) : '';
        $id = (isset($params['get']['id']) && trim($params['get']['id']) != false) ? trim($params['get']['id']) : '';
        $jsonArr = array();
        if (!$url) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = 'url不能为空';
            Output::outputData($jsonArr);
            exit;
        }
        //判断是否是http开头
        if (strpos($url, 'http') !== 0) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = 'url错误';
            Output::outputData($jsonArr);
            exit;
        }
        if (!$id) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = 'id不能为空';
            Output::outputData($jsonArr);
            exit;
        }

        try {
            $market = new MarketModel();
            $projectMes = $market->getProjectById($id, 0, 'edit');
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '失败';
            Output::outputData($jsonArr);
            exit;
        }

        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        if ($projectMes[0]['user'] != $user) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '您没有更改该项目的权限';
            Output::outputData($jsonArr);
            exit;
        }
        $data = array(
            'id' => $id,
            'user' => $user,
            'data' => ['cover' => $url]
        );
        try {
            $market = new MarketModel();
            $result = $market->updateProjectByIdAndUser($data);
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '修改失败,服务器错误,请稍后再试';
            Output::outputData($jsonArr);
            exit;
        }

        if ($result) {
            $jsonArr['errcode'] = 1;
            $jsonArr['errmsg'] = '修改成功';
        } else {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,修改封面图片失败,请稍后再试';
        }
        Output::outputData($jsonArr);
    }

    /**
     * 后台用户删除图片
     * @return void
     */
    public function ajaxDelMediaAction()
    {
        $params = Yaf_Registry::get('http_param');
        $jsonArr = array();
        $id = (isset($params['post']['id']) && trim($params['post']['id']) != false) ? trim($params['post']['id']) : '';
        if (!$id) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = 'id不能为空';
            Output::outputData($jsonArr);
            exit;
        }
        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        try {
            $market = new MarketModel();
            $result = $market->delMediaByIdAndUser($id, $user);
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,删除图片失败,请稍后再试';
            Output::outputData($jsonArr);
            exit;
        }

        if ($result) {
            $jsonArr['errcode'] = 1;
            $jsonArr['errmsg'] = '删除成功';
        } else {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '删除失败';
        }
        Output::outputData($jsonArr);
    }

    /**
     * 后台用户上传文件方法
     * @return string
     */
    private function _uploadAction()
    {
        //$uid = self::$login_admin_info['email'];
        $uid = self::$login_admin_info['userid'];
        $arrIpPort = Util::getClientIpAndPort();
        $uip = $arrIpPort['ip'];
        $rand = rand(99, 999999);
        $timestamp = time();
        $input = "{$rand}^1.0^{$uid}^{$uip}^{$timestamp}";
        $token = Util::encrypt($input, 'YTTuzT3h', 'ynV26dTn', 'UploadImg');
        $host = 'img1u.soufun.com';
        $url = "/upload/pic2?isflash=y&channel=h5market.pic&city=&uid={$uid}&t={$token}&_" . rand();
        $port = 80;
        $type = isset($_GET['type']) ? trim($_GET['type']) : 'image/png';
        try {
            $response = PicUpload::uploadNew($host, $url, $port, $type);
        } catch (Exception $e) {
            throw $e;
        }
        // 没有值或者返回值不是完整的uri则认为上传失败。
        // @update yueyanlei
        if (!$response || substr($response, 0, 4) != 'http') {
            $response = '';
        }

        return $response;
    }

    /**
     * 对项目数据操作，编辑页面POST方式 预览页面GET方式更新数据
     * @return void
     */
    public function ajaxUpdateProjectAction()
    {
        //获取user
        $loginAdminInfo = self::$login_admin_info;
        //$user = $loginAdminInfo['email'];
        $user = $loginAdminInfo['userid'];
        try {
            $market = new MarketModel();
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
            exit;
        }
        $data = [];
        $data['user'] = $user;
        //如果是get请求方式
        if ($this->getRequest()->isGet()) {
            //获取所有http参数
            $params = Yaf_Registry::get('http_param');
            $getParams = $params['get'];

            if (isset($getParams['id']) && strlen(trim($getParams['id'])) > 0) {
                $data['id'] = $getParams['id'];
            } else {
                Output::outputData(['errcode' => 0, 'errmsg' => '项目id不能为空']);
                exit;
            }
            if (isset($getParams['name'])) {
                $data['data']['name'] = urldecode($getParams['name']);
            }
            if (isset($getParams['introduction'])) {
                $data['data']['introduction'] = urldecode($getParams['introduction']);
            }

            //恢复项目状态为上线状态
            if (isset($getParams['status']) && trim($getParams['status']) === 'recover') {
                $data['data']['status'] = 'online';
            }

            //更改项目分享本地流量化配置
            if (isset($getParams['share']) && trim($getParams['share']) === 'set') {
                //城市
                $data['data']['city'] = isset($getParams['city']) ? trim($getParams['city']) : '';
                //集团
                $data['data']['groups'] = isset($getParams['groups']) ? trim($getParams['groups']) : '';
                //渠道
                $data['data']['source'] = isset($getParams['source']) ? trim($getParams['source']) : '';
            }

            try {
                $result = $market->updateProjectByIdAndUser($data);
                //$result=1更新数据成功
                if ($result === 1) {
                    Output::outputData(['errcode' => 1, 'errmsg' => '更新数据成功']);
                } else {
                    Output::outputData(['errcode' => 0, 'errmsg' => '您没有更改(公开)该项目的权限']);
                }
            } catch (Exception $e) {
                Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
            }
            exit;
        } elseif ($this->getRequest()->isPost()) {
            $params = Yaf_Registry::get('http_param');
            $getParams = $params['post'];

            if (isset($getParams['id']) && strlen(trim($getParams['id'])) > 0) {
                $data['id'] = $getParams['id'];
            }
            if (isset($getParams['pdata']['json'])) {
                $data['data']['content'] = $getParams['pdata']['json'];
            }
            //判断项目是否有音乐
            if ($getParams['pdata']['music'] == '') {
                $data['data']['music'] = 0;
            } else {
                $data['data']['music'] = json_encode([
                    'id' => $getParams['pdata']['music']['id'],
                    'name' => $getParams['pdata']['music']['name']
                ], JSON_UNESCAPED_UNICODE);
            }
            //判断项目是否有loading
            $data['data']['loading'] = $getParams['pdata']['loading'];

            //判断项目中是否有表单
            if (isset($getParams['pdata']['form']) && count($getParams['pdata']['form']) > 0) {
                $formInfo = [];
                foreach ($getParams['pdata']['form'] as $k => $v) {
                    $formInfo[$k] = [
                        'formid' => $v['formid'],
                    ];
                    if (isset($v['title'])) {
                        $formInfo[$k]['title'] = strip_tags($v['title']);
                    }
                    foreach ($v['fields'] as $d) {
                        $formInfo[$k]['forminfo'][] = [
                            'id' => $d['id'],
                            'name' => $d['name']
                        ];
                    }
                }
                $data['data']['forminfo'] = json_encode($formInfo, JSON_UNESCAPED_UNICODE);
            }
            //判断项目中是否有投票按钮
            $data['data']['voteinfo'] = isset($getParams['pdata']['vote']) && intval($getParams['pdata']['vote']) >= 0 && intval($getParams['pdata']['vote']) <= 1 ? intval($getParams['pdata']['vote']) : 0;
            //判断项目中是否有字体
            if (isset($getParams['pdata']['font']) && count($getParams['pdata']['font']) > 0) {
                $data['data']['fontinfo'] = json_encode($getParams['pdata']['font'], JSON_UNESCAPED_UNICODE);
            } else {
                //当设置为默认字体时,前端不传font字段
                $data['data']['fontinfo'] = '';
            }
            try {
                //designer=liyingying 更改系统组模板
                if (isset($params['get']['designer']) && $params['get']['designer'] == 1) {
                    if (!in_array($user, self::$users)) {
                        Output::outputData(['errcode' => 0, 'errmsg' => '您没有更改的权限']);
                        exit;
                    }
                    $multiTemplateData = [
                        'id' => $data['id'],
                        'data' => [
                            'music' => $data['data']['music'],
                            'content' => $data['data']['content'],
                        ]
                    ];

                    $result = $market->updateMultiTemplate($multiTemplateData);

                } else {
                    $result = $market->updateProjectByIdAndUser($data);
                }

                //$result=1更新数据成功
                if ($result === 1) {
                    Output::outputData(['errcode' => 1, 'errmsg' => '更新数据成功']);
                } else {
                    Output::outputData(['errcode' => 0, 'errmsg' => '您没有更改的权限']);
                }
            } catch (Exception $e) {
                Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
            }
            exit;
        }

    }

    /**
     * 用户创建新的空白项目
     * @return void
     */
    public function ajaxCreateNewProjectAction()
    {
        //获取user
        //$data['user'] = self::$login_admin_info['email'];
        $data['user'] = self::$login_admin_info['userid'];
        $data['content'] = "";
        $data['city'] = self::$login_admin_info['city'] ? self::$login_admin_info['city'] : '';
        $data['groups'] = self::$login_admin_info['groups'] ? self::$login_admin_info['groups'] : '';
        $data['source'] = self::$login_admin_info['source'] ? self::$login_admin_info['source'] : '';
        try {
            $market = new MarketModel();
            $result = $market->insertProject($data);
            if ($result) {
                Output::outputData(['errcode' => 1, 'id' => $result]);
            } else {
                Output::outputData(['errcode' => 0, 'errmsg' => '新建项目失败']);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 用户选择系统组模板来创建新项目
     * @return void
     */
    public function ajaxSelectMultiTemplateToCreateNewProjectAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        $id = $params['get']['id'];
        $from = isset($params['get']['from']) && $params['get']['from'] === 'open' ? 'open' : 'index';
        try {
            $market = new MarketModel();
            if ($from === 'open') {
                $result = $market->getProjectById($id, 1, 'edit');
                $market->updateLoadCount($id);
            } else {
                $result = $market->getMultiTemplateById($id);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => '新建项目失败']);
            exit;
        }
        $data = [
            'name' => $result[0]['name'],
            'introduction' => $result[0]['introduction'],
            'cover' => $result[0]['cover'],
            'music' => $result[0]['music'],
            'content' => $result[0]['content'],
            //'user' => self::$login_admin_info['email'],
            'user' => self::$login_admin_info['userid'],
            'city' => self::$login_admin_info['city'] ? self::$login_admin_info['city'] : '',
            'groups' => self::$login_admin_info['groups'] ? self::$login_admin_info['groups'] : '',
            'source' => self::$login_admin_info['source'] ? self::$login_admin_info['source'] : '',
            'status' => $result[0]['status'],
            'isopen' => 0,
            'loadcount' => 0,
        ];

        try {
            $market = new MarketModel();
            $result = $market->insertProject($data);
            if ($result) {
                Output::outputData(['errcode' => 1, 'id' => $result]);
            } else {
                Output::outputData(['errcode' => 0, 'errmsg' => '新建项目失败']);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 操作数据库中单页模板
     * @method post
     * @return void
     */
    public function ajaxOperationTemplateAction()
    {
        $loginAdminInfo = self::$login_admin_info;
        // if ($loginAdminInfo['email'] !== 'liyingying') {
        //     Output::outputData(['errcode' => 0, 'errmsg' => '您没有权限进行该操作！']);
        //     exit;
        // }
        if (!in_array($loginAdminInfo['user'], self::$users)) {
            Output::outputData(['errcode' => 0, 'errmsg' => '您没有权限进行该操作！']);
            exit;
        }

        $params = Yaf_Registry::get('http_param');
        $id = isset($params['post']['id']) ? trim($params['post']['id']) : false;
        //$id存在执行update，$id不存在执行insert
        $data = [];
        if ($id !== false) {
            $data[] = [
                'id' => $id,
            ];
            if (isset($params['post']['type'])) {
                $data['data']['type'] = $params['post']['type'];
            }
            if (isset($params['post']['content'])) {
                $data['data']['content'] = $params['post']['content'];
            }
            if (isset($params['post']['cover'])) {
                $data['data']['cover'] = $params['post']['cover'];
            }
            //数据处理，更新单页模板数据
            try {
                $market = new MarketModel();
                $result = $market->updateTemplate($data);
                if ($result) {
                    Output::outputData(['errcode' => 1, 'errmsg' => '更新单页模板成功']);
                } else {
                    Output::outputData(['errcode' => 0, 'errmsg' => '更新单页模板失败']);
                }
            } catch (Exception $e) {
                Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
            }
        } else {
            $data[] = [
                'type' => $params['post']['type'],
                'content' => $params['post']['content'],
                'cover' => $params['post']['cover']
            ];

            //数据处理，向数据库插入模板数据
            try {
                $market = new MarketModel();
                $result = $market->insertTemplate($data);
                if ($result) {
                    Output::outputData(['errcode' => 1, 'errmsg' => '插入单页模板成功']);
                } else {
                    Output::outputData(['errcode' => 0, 'errmsg' => '插入单页模板失败']);
                }
            } catch (Exception $e) {
                Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
            }
        }

    }

    /**
     * 报名数据
     * @method get
     * @return void
     */
    public function ajaxGetSignInfoAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        //获取user
        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        //获项目id
        $projectId = isset($params['get']['projectid']) && strlen(trim($params['get']['projectid'])) > 0 ? trim($params['get']['projectid']) : false;
        try {
            //数据处理，通过项目id获取该项目报名表单信息
            $formModel = new FormModel();
            $result = $formModel->getSignInfoByProjId($projectId);
            //判断返回的$result
            if (is_array($result) && isset($result['errcode']) && $result['errcode'] == 0) {
                Output::outputData($result);
            } else {
                header("Content-Type: application/octet-stream");
                header('Content-Transfer-Encoding: binary');
                header('Content-Disposition: attachment; filename="form_data_list.csv"');
                foreach ($result as $key => $value) {
                    foreach ($value as $k => $v) {
                        echo iconv('utf-8', 'gbk', $v) . "\n";
                    }
                }
            }

        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
        exit;
    }

    /**
     * 向数据库中插入组模板
     * @method post
     * @return void
     */
    public function ajaxOperationMultiTemplateAction()
    {
        $loginAdminInfo = self::$login_admin_info;
        // if ($loginAdminInfo['email'] !== 'yueyanlei' && $loginAdminInfo['email'] !== 'liuxinlu') {
        //     Output::outputData(['errcode' => 0, 'errmsg' => '您没有权限进行该操作！']);
        //     exit;
        // }
        if (!in_array($loginAdminInfo['userid'], self::$users)) {
            Output::outputData(['errcode' => 0, 'errmsg' => '您没有权限进行该操作！']);
            exit;
        }
        $params = Yaf_Registry::get('http_param');
        $data = [];

        $data['introduction'] = '手机房天下是中国最大的房地产家居移动互联网门户，为亿万用户提供全面及时的房地产新闻资讯内容,为所有楼盘提供网上浏览及业主论坛信息。覆盖全国300多个城市,找新房、找二手房、找租房,更多便捷,更加精准。';
        $data['status'] = 1;
        if (isset($params['post']['name'])) {
            $data['name'] = $params['post']['name'];
        } else {
            $data['name'] = '系统模板';
        }
        if (isset($params['post']['music'])) {
            $data['music'] = $params['post']['music'];
        } else {
            $data['music'] = 0;
        }
        if (isset($params['post']['content'])) {
            $data['content'] = $params['post']['content'];
        }
        if (isset($params['post']['cover'])) {
            $data['cover'] = $params['post']['cover'];
        } else {
            $data['cover'] = 'cover/logo02.png';
        }
        //保存类型
        if (isset($params['post']['tplType'])) {
            $data['type'] = intval($params['post']['tplType']);
        } else {
            $data['type'] = 0;
        }


        //数据处理，向数据库插入组模板数据
        try {
            $market = new MarketModel();
            $result = $market->insertMultiTemplate($data);
            if ($result) {
                Output::outputData(['errcode' => 1, 'errmsg' => '插入组模板成功']);
            } else {
                Output::outputData(['errcode' => 0, 'errmsg' => '插入组模板失败']);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 导入外部MAKA的模板
     * @method get
     * @return void
     */
    public function addAction()
    {
        $this->_view->display('admin/addTemplate.html');
    }

    /**
     * 添加系统图片
     * @method get
     * @return void
     */
    public function ajaxAddTemplateMediaAction()
    {
        $params = Yaf_Registry::get('http_param');
        $tmpMusicData = isset($params['post']['musicData']) && is_array($params['post']['musicData']) && !empty($params['post']['musicData']) ? $params['post']['musicData'] : array();
        $tmpPicData = isset($params['post']['picData']) && is_array($params['post']['picData']) && !empty($params['post']['picData']) ? $params['post']['picData'] : array();
        $tmpBgPicData = isset($params['post']['bgpicData']) && is_array($params['post']['bgpicData']) && !empty($params['post']['bgpicData']) ? $params['post']['bgpicData'] : array();
        $tmpSlideData = isset($params['post']['slideData']) && is_array($params['post']['slideData']) && !empty($params['post']['slideData']) ? $params['post']['slideData'] : array();
        //var_dump($tmpBgPicData);exit;
        $market = new MarketModel();
        if (!empty($tmpMusicData)) {
            if (!isset($tmpMusicData[0])) {
                $musicData[0] = $tmpMusicData;
            } else {
                $musicData = $tmpMusicData;
            }
            foreach ($musicData as $key => $value) {
                $content = file_get_contents($value['url']);
                $flag = file_put_contents(APP_PATH . '/public/cdn/music/' . $value['id'] . '.mp3', $content);
                if ($flag !== false) {
                    $musicData['id'] = $value['id'];
                } else {
                    $musicData['id'] = '000';
                }
            }
        } else {
            $musicData = $tmpMusicData;
        }
        if (!empty($tmpPicData)) {
            if (!isset($tmpPicData[0])) {
                $picData[0] = $tmpPicData;
            } else {
                $picData = $tmpPicData;
            }
            $picData = $market->dealMediaData($picData, '/public/cdn/imgs/ele/', 'ele/');
        } else {
            $picData = $tmpPicData;
        }
        if (!empty($tmpBgPicData)) {
            if (!isset($tmpBgPicData[0])) {
                $bgPicData[0] = $tmpBgPicData;
            } else {
                $bgPicData = $tmpBgPicData;
            }
            $bgPicData = $market->dealMediaData($bgPicData, '/public/cdn/imgs/bgpic/', 'bgpic/');
        } else {
            $bgPicData = $tmpBgPicData;
        }
        if (!empty($tmpSlideData)) {
            if (!isset($tmpSlideData[0])) {
                $slideData[0] = $tmpSlideData;
            } else {
                $slideData = $tmpSlideData;
            }
            $slideData = $market->dealMediaData($slideData, '/public/cdn/imgs/ele/', 'ele/');
        } else {
            $slideData = $tmpSlideData;
        }
        Output::outputData(array(
            'errcode' => 1,
            'picData' => $picData,
            'bgPicData' => $bgPicData,
            'musicData' => $musicData,
            'slideData' => $slideData
        ));
    }

    /**
     * 用户查看项目的UV、PV
     * @method get
     * @return json
     */
    public function ajaxGetUvPvAction()
    {
        $param = Yaf_Registry::get('http_param');
        //当前项目的id
        $projectId = isset($param['get']['projectId']) && strlen(trim($param['get']['projectId'])) == 32 ? trim($param['get']['projectId']) : '';
        if ($projectId == '') {
            Output::outputData(array('errcode' => 0, 'errmsg' => '项目Id不正确'));
            exit;
        }
        
        try {
            $datacenterModel = new DatacenterModel();
            $result = $datacenterModel->getUvPv($projectId);
            Output::outputData($result);
        } catch (Exception $e) {
            Output::outputData(array('errcode' => 0, 'errmsg' => $e->getMessage()));
        }
    }

    /**
     * 获取某一项目的微信转发人次
     * @method get
     * @return void
     */
    public function ajaxGetWxManNumAction()
    {
        $param = Yaf_Registry::get('http_param');
        //当前项目的id
        $projectId = isset($param['get']['id']) && strlen(trim($param['get']['id'])) == 32 ? trim($param['get']['id']) : false;
        if (!$projectId) {
            Output::outputData(['errcode' => 0, 'errmsg' => '项目id不可为空']);
        }
        try {
            $market = new MarketModel();
            //获取微信转发人次
            $manNum = $market->getUserCountByCondition($projectId);
            Output::outputData(['errcode' => 1, 'data' => $manNum]);
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 设置用户默认的流量本地化参数
     * @method get
     * @return void
     */
    public function ajaxUpdateUserSettingAction()
    {
        $param = Yaf_Registry::get('http_param');
        $data = [];
        $data['city'] = isset($param['get']['city']) ? $param['get']['city'] : '';
        $data['groups'] = isset($param['get']['groups']) ? $param['get']['groups'] : '';
        $data['source'] = isset($param['get']['source']) ? $param['get']['source'] : '';

        try {
            $rbac = new RbacModel();
            //$result = $rbac->updateUserByEmail($data, self::$login_admin_info['email']);
            $result = $rbac->updateUserByEmail($data, self::$login_admin_info['userid']);
            if ($result) {
                Output::outputData(['errcode' => 1, 'errmsg' => '设置成功']);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 公开的项目展示页
     * @return void
     */
    public function openAction()
    {
        $param = Yaf_Registry::get('http_param');
        //当前集团
        try {
            $market = new MarketModel();
            $groups = $market->getGroups();
            $groupsData = $market->getGroups(true);
            $group = isset($param['get']['group']) && in_array(trim($param['get']['group']), $groupsData) ? trim($param['get']['group']) : $groupsData[0];
            //当前集团下公开项目数
            $count = $market->getProjectCountByIsOpen($group);
            //默认展示全部公开项目列表
            $result = $market->getOpenProjectsByGroupAndPage($group);
            if (is_array($result)) {
                //配置封面路径
                $result = $market->getAbsoluteCoverPath($result);
                //配置前台预览路径
                $result = $market->getPreviewUrl($result, self::$login_admin_info);
            } else {
                $result = [];
            }
            //公开项目被使用量前5
            $leaderFive = $market->getLeaderFive();
            if (is_array($leaderFive)) {
                //配置封面路径
                $leaderFive = $market->getAbsoluteCoverPath($leaderFive);
                //配置前台预览路径
                $leaderFive = $market->getPreviewUrl($leaderFive, self::$login_admin_info);
            } else {
                $leaderFive = [];
            }
        } catch (Exception $e) {
            self::jumpToError();
            exit;
        }
        $this->_view->assign('group', $group);
        $this->_view->assign('qrUrl', 'http://u.fang.com/qrcode.php/');
        $this->_view->assign('groups', $groups['groups']);
        $this->_view->assign('count', $count);
        $this->_view->assign('result', $result);
        $this->_view->assign('leaderFive', $leaderFive);
        $this->_view->display('admin/open.html');
    }

    /**
     * 加载更多公开项目列表
     * @return void
     */
    public function ajaxGetMoreOpenAction()
    {
        $param = Yaf_Registry::get('http_param');
        $page = isset($param['get']['page']) && intval($param['get']['page']) > 0 ? $param['get']['page'] : 2;
        try {
            $market = new MarketModel();
            $groupsData = $market->getGroups(true);
            $group = isset($param['get']['group']) && in_array(trim($param['get']['group']), $groupsData) ? trim($param['get']['group']) : $groupsData[0];
            //默认展示新房集团公开项目列表
            $result = $market->getOpenProjectsByGroupAndPage($group, $page);
            if (is_array($result)) {
                //配置封面路径
                $result = $market->getAbsoluteCoverPath($result);
                //配置前台预览路径
                $result = $market->getPreviewUrl($result, self::$login_admin_info);
            } else {
                $result = [];
            }
        } catch (Exception $e) {
            self::jumpToError();
            exit;
        }
        $this->_view->assign('result', $result);
        $this->_view->assign('qrUrl', 'http://u.fang.com/qrcode.php/');
        Output::outputData(trim($this->_view->render('admin/ajaxGetMoreOpen.html')));
    }

    /**
     * 公开项目
     * @return void
     */
    public function ajaxOpenProjectAction()
    {
        $param = Yaf_Registry::get('http_param');
        //$data['user'] = self::$login_admin_info['email'];
        $data['user'] = self::$login_admin_info['userid'];
        $data['id'] = isset($param['get']['id']) && strlen(trim($param['get']['id'])) === 32 ? $param['get']['id'] : false;
        $data['data']['isopen'] = isset($param['get']['isOpen']) && $param['get']['isOpen'] == 1 ? 1 : 0;
        try {
            $market = new MarketModel();
            $result = $market->updateProjectByIdAndUser($data);
            //$result=1更新数据成功
            if ($result === 1) {
                Output::outputData(['errcode' => 1, 'errmsg' => '更新项目成功']);
            } else {
                Output::outputData(['errcode' => 0, 'errmsg' => '更新项目失败']);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 显示邀请用户页面
     * @return void
     */
    public function showInvitePageAction()
    {
        $this->_view->display('admin/inviteUser.html');
    }

    /**
     * 添加用户
     * @return void
     */
    public function addUserAction()
    {
        $params = Yaf_Registry::get('http_param');
        $email = (isset($params['post']['email']) && trim($params['post']['email']) !== false) ? trim($params['post']['email']) : '';
        $jsonArr = array('errmsg' => "邀请成功", 'errcode' => 1);
        try {
            $rbac = new RbacModel();
            $rbac->addIssoUser($email);
        } catch (Exception $e) {
            $jsonArr['errmsg'] = $e->getMessage();
            if ($e->getMessage() == 'Service Already Actv') {
                $jsonArr['errmsg'] = '该用户已经存在';
            }
            Output::outputData($jsonArr);
            exit;
        }
        Output::outputData($jsonArr);
    }

    /**
     * 获取用户个人的模板
     * @return void
     */
    public function ajaxGetMyTemplateAction()
    {
        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        $status = 'normal';
        $jsonArr = ['data' => ['datalist' => []]];
        if (!$user) {
            Output::outputData($jsonArr);
            exit;
        }
        try {
            $market = new MarketModel();
            $result = $market->getMyTemplateByUser($user, $status);
            if (!$result) {
                Output::outputData($jsonArr);
                exit;
            }
            $temp = array();
            foreach ($result as $value) {
                $temp[] = [
                    'instruction' => $value['instruction'],
                    'cover' => $value['cover'],
                    'content' => json_decode($value['content']),
                    'createtime' => $value['createtime']
                ];
            }
            $data = [
                'data' => [
                    'datalist' => $temp
                ]
            ];
            Output::outputData($data);
        } catch (Exception $e) {
            Output::outputData($jsonArr);
        }
    }

    /**
     * 添加用户个人的模板
     * @return void
     */
    public function ajaxAddMyTemplateAction()
    {
        $params = Yaf_Registry::get('http_param');
        $data['instruction'] = (isset($params['post']['instruction']) && trim($params['post']['instruction']) != false) ? trim($params['post']['instruction']) : '';
        $data['cover'] = (isset($params['post']['cover']) && trim($params['post']['cover']) != false) ? trim($params['post']['cover']) : '';
        $data['content'] = (isset($params['post']['content']) && $params['post']['content']) != '' ? $params['post']['content'] : '';
        //$data['user'] = self::$login_admin_info['email'];
        $data['user'] = self::$login_admin_info['userid'];
        $data['createtime'] = time();
        $data['updatetime'] = time();
        try {
            $market = new MarketModel();
            $result = $market->insertMyTemplate($data);
            if ($result) {
                Output::outputData(['errcode' => 1, 'errmsg' => '添加成功', 'createtime' => $data['createtime']]);
            } else {
                Output::outputData(['errcode' => 0, 'errmsg' => '添加个人模板失败,请稍候再试']);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 删除用户个人的模板
     * @author tangcheng.bj@fang.com
     * @return void
     */
    public function ajaxDelMyTemplateAction()
    {
        $params = Yaf_Registry::get('http_param');
        $createtime = (isset($params['post']['createtime']) && trim($params['post']['createtime']) != false) ? trim($params['post']['createtime']) : '';
        //$user = self::$login_admin_info['email'];
        $user = self::$login_admin_info['userid'];
        try {
            $market = new MarketModel();
            $result = $market->delMyTemplate($user, $createtime, ['status' => 'delete']);
            if ($result) {
                Output::outputData(['errcode' => 1, 'errmsg' => '删除成功']);
            } else {
                Output::outputData(['errcode' => 0, 'errmsg' => '删除失败,请稍候再试']);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 获取报名信息
     * @return void
     */
    public function formInfoAction()
    {
        $params = Yaf_Registry::get('http_param');
        //项目ID
        $id = isset($params['get']['id']) && strlen(trim($params['get']['id'])) === 32 ? $params['get']['id'] : false;
        $formId = isset($params['get']['formId']) && strlen($params['get']['formId']) >= 7 ? trim($params['get']['formId']) : false;
        $page = isset($params['get']['page']) && intval($params['get']['page']) >= 1 ? intval($params['get']['page']) : 1;
        try {
            //先根据项目ID取出表单信息
            $marketModel = new MarketModel();
            //$formInfo = $marketModel->getFromInfoByProjId($id, self::$login_admin_info['email']);
            $formInfo = $marketModel->getFromInfoByProjId($id, self::$login_admin_info['userid']);

            //如果项目中存在表单,再查询报名信息
            if (isset($formInfo) && isset($formInfo['formInfo']) && count($formInfo['formInfo']) > 0) {
                $formInfo['count'] = count($formInfo['formInfo']);
                if (!$formId) {
                    //如果地址上有传ID过来,且ID正确,按传递过来的ID查询报名信息.否则的话,按查询到的第一个表单查询报名信息
                    $formId = $formInfo['formInfo'][0]['formid'];
                } else {
                    //当地址中有formID传过来时,从表单信息中查询该form ID是否正确
                    foreach ($formInfo['formInfo'] as $key => $val) {
                        $formIdArr[] = $val['formid'];
                    }
                    if (!in_array($formId, $formIdArr)) {
                        $formId = $formInfo['formInfo'][0]['formid'];
                    }
                }
                try {
                    //分页查询报名信息
                    $signInfo = $marketModel->getSignInfoByEventId($id, $formId, $page, 30);
                    foreach ($signInfo as $k => $val) {
                        $signInfo[$k]['content'] = Util::parseJson($val['content']);
                    }
                } catch (Exception $e) {
                    Output::outputData(['errcode' => 1, 'errmsg' => $e->getMessage()]);
                }
                $formModel = new FormModel();
                $count = $formModel->getSignNum($id, $formId);

                $this->_view->assign('formInfo', $formInfo);
                $this->_view->assign('formId', $formId);
                $this->_view->assign('page', $page);
                $this->_view->assign('count', $count);
                $this->_view->assign('pageCount', ceil($count / 30));
                $this->_view->assign('signInfo', $signInfo);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 1, 'errmsg' => $e->getMessage()]);
        }
        $this->_view->display('admin/form.html');
    }

    /**
     * 获取专题报名人数排名
     */
    public function getSignNumAction()
    {
        //接收查询时间段
        $startTime = isset($_GET['startTime']) && trim($_GET['startTime']) != '' ? trim($_GET['startTime']) : '';
        $endTime = isset($_GET['endTime']) && trim($_GET['endTime']) != '' ? trim($_GET['endTime']) : '';
        //是否需要展示uv pv
        $showUv = isset($_GET['showUv']) && (intval($_GET['showUv']) == 0 && intval($_GET['showUv']) == 1) ? intval($_GET['showUv']) : 0;
        $showPv = isset($_GET['showPv']) && (intval($_GET['showPv']) == 0 && intval($_GET['showPv']) == 1) ? intval($_GET['showPv']) : 0;
        //集团信息
        $groups = isset($_GET['groups']) && trim($_GET['groups']) != '' ? trim($_GET['groups']) : '';
        $marketModel = new MarketModel();
        //获取新房集团下的所有有报名表单的项目
        //需要返回的字段
        $columns = ['id', 'name', 'city', 'uv', 'pv', 'signinnum','source', 'groups'];
        //需要的查询条件
        $where = [['status', '!=', 'delete'], ['forminfo', '!=', ''], ['forminfo', '!=', 'NULL'], ['createtime', '>=', strtotime($startTime . ' 00:00:00')], ['createtime', '<=', strtotime($endTime . ' 00:00:00')]];
        if (isset($groups) && $groups != '') {
            $where[] = ['groups', '=', $groups];
        }
        //需要的排序条件
        $order = [['column' => 'signinnum', 'order' => 'desc']];

        //获取城市列表
        $cityList = Yaf_Registry::get('citylist');

        try {
            //获取有表单的项目
            $project = $marketModel->getProjects($columns, $where, $order);
            if (isset($project) && isset($project[0])) {
                $domain = Yaf_Registry::get('application')['domain']['siteUrl']['web'];
                foreach ($project as $key => $value) {
                    $project[$key]['url'] = $domain . $value['id'] . '/?city=' . $value['city'] . '&channel='.$value['groups'].'&source=' . $value['source'];//domain.siteUrl.admin
                    if ($value['city'] !== '' && $value['city'] === 'quanguo') {
                        $project[$key]['cityname'] = '全国';
                    } else if ($value['city'] !== '') {
                        //这里不能使用城市简拼的首字母进行循环,有些城市的首字母和所在的数组不一致,例如澳门citylist.A.6.cityname   = '澳门' citylist.A.6.shortname  = 'macau'
                        foreach ($cityList['citylist'] as $k => $item) {
                            foreach ($item as $ckey => $val) {
                                if ($value['city'] == $val['shortname']) {
                                    $project[$key]['cityname'] = $val['cityname'];
                                    break 2;
                                }
                            }

                        }
                    } else {
                        $project[$key]['cityname'] = '';
                    }
                }
            }

            $this->_view->assign('showUv', $showUv);
            $this->_view->assign('showPv', $showPv);
            $this->_view->assign('project', $project);
            $this->_view->display('admin/count.html');
        } catch (Exception $e) {
            Output::outputData($e->getMessage());
        }
    }

    /**
     * 获取项目里点赞(投票)数目
     * @return void
     * @author chenhongyan 20160504
     */
    public function getVoteInfoAction()
    {
        $params = Yaf_Registry::get('http_param');
        //项目id
        $id = isset($params['get']['id']) ? trim($params['get']['id']) : '';
        try {
            $formModel = new FormModel();
            $result = $formModel->getVoteInfo($id);
            $this->_view->assign('result', $result);
            $this->_view->display('admin/dianzan.html');
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 通过分类id查询系统组模板
     * @method get
     * @return void
     * @author zhangjinyu 20160720
     */
    public function ajaxSysTemplateByTypeAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        $type = (isset($params['get']['type']) && intval($params['get']['type']) >= 0) ? intval($params['get']['type']) : 0;
        try {
            $market = new MarketModel();
            $result = $market->getMultiTemplate($type);
            if (!$result) {
                Output::outputData(['list' => '', 'errcode' => 0, 'errmsg' => '数据出错']);
                exit;
            }
        } catch (Exception $e) {
            Output::outputData(['list' => '', 'errcode' => 0, 'errmsg' => $e->getMessage()]);
            exit;
        }
        Output::outputData(['list' => $result, 'errcode' => 1]);
    }

    /**
     * 把本站的优秀模板导入公共模板(project表导入到multitemplate表)
     * @return void
     * @author zhangjinyu 20160720
     */
    public function ajaxPickSysTplAction()
    {
        $params = Yaf_Registry::get('http_param');
        //project表的id字段
        $projectId = (isset($params['post']['projectId']) && strlen($params['post']['projectId']) > 0) ? trim($params['post']['projectId']) : 0;
        //系统模板类型
        $type = (isset($params['post']['tplType']) && intval($params['post']['tplType']) >= 0) ? intval($params['post']['tplType']) : 0;
        if ($projectId === 0) {
            Output::outputData(['source' => '', 'errcode' => 0, 'errmsg' => '请输入要导入的源模板id']);
            exit;
        }
        try {
            $market = new MarketModel();
            $project = $market->getProjectById($projectId, 0, 'edit');
            if (!$project) {
                Output::outputData(['source' => '', 'errcode' => 0, 'errmsg' => '导入的源模板数据出错']);
                exit;
            }
        } catch (Exception $e) {
            Output::outputData(['source' => '', 'errcode' => 0, 'errmsg' => $e->getMessage()]);
            exit;
        }
        $data = [];
        $data['name'] = $project[0]['name'];
        //保存类型
        $data['type'] = $type;
        //组模板简介
        $data['introduction'] = $project[0]['introduction'];
        // 封面图片url
        $data['cover'] = $project[0]['cover'];
        // 背景音乐
        $data['music'] = $project[0]['music'];
        // 项目资源内容
        $data['content'] = $project[0]['content'];
        //组模板状态（0 下架 1 上架）
        $data['status'] = 1;

        //插入到multitemplate表
        try {
            $market = new MarketModel();
            $result = $market->insertMultiTemplate($data);
            if ($result) {
                Output::outputData(['source' => 1, 'errcode' => 1, 'errmsg' => '导入模板成功！']);
                exit;
            } else {
                Output::outputData(['source' => 1, 'errcode' => 0, 'errmsg' => '导入模板失败！']);
                exit;
            }
        } catch (Exception $e) {
            Output::outputData(['source' => 1, 'errcode' => 0, 'errmsg' => $e->getMessage()]);
            exit;
        }
    }
}
/* End of file Admin.php */
