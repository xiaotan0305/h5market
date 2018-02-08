<?php
/**
 * Project:     搜房网php框架
 * File:        Api.php
 *
 * <pre>
 * 描述：Api控制器
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
class ApiController extends AbstractApiController
{
    /**
     * 项目模板数据
     * @method get
     * @return void
     */
    public function ajaxProjectAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        //获取项目id
        $id = isset($params['get']['id']) && strlen(trim($params['get']['id'])) > 0 ? trim($params['get']['id']) : false;
        //type来判断来源，如果是edit,则不需要域名收敛
        $type = isset($params['get']['type']) && strlen(trim($params['get']['type'])) > 0 ? trim($params['get']['type']) : '';
        //数据处理，通过用户账号or项目id获取该用户的所有项目数据
        try {
            $market = new MarketModel();
            $result = $market->getProjectById($id, 0, $type);
            //因content单独在一张表里，需要再获取一下content
            $content = $market->getProjectContentById($id, $type);
            if (!$result || !$content) {
                Output::outputData(['errcode' => 0, 'errmsg' => '数据出错']);
                exit;
            } else {
                $result[0]['content'] = $content[0]['content'];
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
            exit;
        }
        Output::outputData($market->getProjectsByIdDao($result));
    }

    /**
     * 通过id查询系统组模板
     * @method get
     * @return void
     */
    public function ajaxMultiTemplateByIdAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        $id = $params['get']['id'];
        try {
            $market = new MarketModel();
            $result = $market->getMultiTemplateById($id);
            if (!$result) {
                Output::outputData(['errcode' => 0, 'errmsg' => '数据出错']);
                exit;
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
            exit;
        }
        Output::outputData($market->getMultiTemplateIdDao($result));
    }

    /**
     * 单页模板
     * @method get
     * @return void
     */
    public function ajaxTemplateAction()
    {
        //获取所有http参数
        $params = Yaf_Registry::get('http_param');
        //获取模板类型
        $type = isset($params['get']['type']) && strlen(trim($params['get']['type'])) > 0 ? trim($params['get']['type']) : false;

        //数据处理，通过模板类型获取模板列表
        try {
            $market = new MarketModel();
            $result = $market->getTemplatesByType($type);
            if (!$result) {
                Output::outputData(['errcode' => 0, 'errmsg' => '加载模板数据出错']);
                exit;
            } else {
                $temp = [];
                foreach ($result as $v) {
                    $temp[] = [
                        'type' => $v['type'],
                        'cover' => $v['cover'],
                        'content' => json_decode($v['content'])
                    ];
                }

                $data = [
                    'data' => [
                        'datalist' => $temp
                    ]
                ];
                Output::outputData($data);
            }
        } catch (Exception $e) {
            Output::outputData(['errcode' => 0, 'errmsg' => $e->getMessage()]);
        }
    }

    /**
     * 获取系统某一类图片
     * @method get
     * @return void
     */
    public function ajaxGetPicByTypeAction()
    {
        $params = Yaf_Registry::get('http_param');
        $type = isset($params['get']['type']) && strlen(trim($params['get']['type'])) > 0 ? trim($params['get']['type']) : 'background';
        $subType = isset($params['get']['subtype']) && strlen(trim($params['get']['subtype'])) > 0 ? trim($params['get']['subtype']) : 'scenery';
        $jsonArr = array();
        if (!$type || !$subType) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '图片类型错误';
            Output::outputData($jsonArr);
            exit;
        }
        try {
            $market = new MarketModel();
            $data = $market->getPicByType($type, $subType);
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '获取图片失败';
            Output::outputData($jsonArr);
            exit;
        }
        $data = array('data' => $data, 'errcode' => 1);
        Output::outputData($data);
    }

    /**
     * 获取用户自己的媒体资源
     * @method get
     * @return void
     */
    public function ajaxGetMediaAction()
    {
        $jsonArr = array();
        $params = Yaf_Registry::get('http_param');
        $user = isset($params['get']['user']) && trim($params['get']['user']) !== false ? trim($params['get']['user']) : '';
        $type = isset($params['get']['type']) && trim($params['get']['type']) !== false ? trim($params['get']['type']) : 'pic';
        if (!$user) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '服务器错误,请稍后再试';
            Output::outputData($jsonArr);
            exit;
        }
        $columns = array('id', 'source');
        try {
            $market = new MarketModel();
            if ($type == 'pic') {
                $result = $market->getMediaByUserId($user, $columns);
            } else if ($type == 'music') {
                $result = $market->getMusicByUserId($user, $columns);
            }
        } catch (Exception $e) {
            $jsonArr['errcode'] = 4;
            $jsonArr['errmsg'] = '服务器错误,请稍后再试';
            Output::outputData($jsonArr);
            exit;
        }
        if (!empty($result) && is_array($result)) {
            $medias = $market->getFormMedia($result, $type);
            $data = array('data' => $medias, 'errcode' => 1);
        } else {
            $data = array('data' => array(), 'errcode' => 1);
        }
        Output::outputData($data);
    }

    /**
     * 获取图片的所有分类
     * @method get
     * @return void
     */
    public function ajaxGetPicTypeAction()
    {
        $jsonArr = array();
        try {
            $market = new MarketModel();
            $type = $market->getPicType();
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '获取图片类型失败';
            Output::outputData($jsonArr);
            exit;
        }
        if (!empty($type) && is_array($type)) {
            $data = array('data' => $type, 'errcode' => 1);
        } else {
            $data['errcode'] = 0;
            $data['errmsg'] = '服务器错误,请稍后再试';
        }
        //前端需求这么包裹数据
        Output::outputData($data);
    }

    /**
     * 获取系统部分音乐
     * @method get
     * @return void
     */
    public function ajaxGetSomeMusicAction()
    {
        $params = Yaf_Registry::get('http_param');
        $pageIndex = isset($params['get']['pageIndex']) && trim($params['get']['pageIndex']) !== false ? trim($params['get']['pageIndex']) : '1';
        $pageSize = isset($params['get']['pageSize']) && trim($params['get']['pageSize']) !== false ? trim($params['get']['pageSize']) : '10';
        try {
            $market = new MarketModel();
            $music = $market->getSomeMusic($pageIndex, $pageSize);
            $musicCount = $market->getMusicCount();
            $pageCount = ceil($musicCount / $pageSize);
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '获取音乐失败';
            Output::outputData($jsonArr);
            exit;
        }
        if (!empty($music)) {
            $data = array('data' => $music, 'pageCount' => $pageCount, 'pageIndex' => $pageIndex, 'errcode' => 1);
        } else {
            $data = array('data' => array(), 'pageCount' => $pageCount, 'pageIndex' => $pageIndex, 'errcode' => 1);
        }
        Output::outputData($data);
    }

    /**
     * 获取系统部分字体
     * @method get
     * @return void
     */
    public function ajaxGetSomeFontsAction()
    {
        try {
            $market = new MarketModel();
            $fonts = $market->getSomeFonts();
        } catch (Exception $e) {
            $jsonArr['errcode'] = 0;
            $jsonArr['errmsg'] = '获取系统字体失败';
            Output::outputData($jsonArr);
            exit;
        }
        if (!empty($fonts)) {
            $data = array('data' => $fonts, 'errcode' => 1);
        } else {
            $data = array('data' => array(), 'errcode' => 1);
        }
        Output::outputData($data);
    }
}

/* End of file Api.php */
