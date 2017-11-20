<?php
/**
 * Project:     搜房网php框架
 * File:        Market.php
 *
 * <pre>
 * 描述：Market数据处理
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     pandeng <pandeng@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Market数据处理
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Models
 * @author     pandeng <pandeng@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
use models\Db\MarketRead as MarketReadDb;
use models\Db\MarketWrite as MarketWriteDb;

class MarketModel extends BaseModel
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
    }

    /**
     * 获取当前用户的所有项目
     * @param array $columns 需要查询的字段
     * @return array/false
     * @throws Exception
     */
    public function getProjectsByCondition($columns)
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('project', $columns);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 根据项目id获取项目的公开状态
     * @param string $id 项目id
     * @return false
     * @throws Exception
     */
    public function getIsOpenById($id)
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('project', 'isopen', [['id', '=', $id]]);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 分页查询用户项目
     * @param string $user   用户邮箱
     * @param int    $page   页码
     * @param string $status 项目的状态 online在线，offline下线，delete删除
     * @return false/array
     * @throws Exception
     */
    public function getProjectsByUserAndPage($user, $page, $status)
    {
        if ($status === 'delete') {
            $wheres = [['user', '=', $user], ['status', '=', 'delete']];
        } else {
            $wheres = [['user', '=', $user], ['status', '!=', 'delete']];
        }
        $orders = [['column' => 'updatetime', 'order' => 'desc']];
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('project', ['*'], $wheres, $page, $orders);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取公开项目被使用量前5的公开项目
     * @return array
     * @throws Exception
     */
    public function getLeaderFive()
    {
        $wheres = [['isopen', '=', 1], ['loadcount', '!=', 0], ['status', '!=', 'delete']];
        $orders = [['column' => 'loadcount', 'order' => 'desc'], ['column' => 'updatetime', 'order' => 'asc']];
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('project', ['*'], $wheres, 1, $orders, 5);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 公开项目分页
     * @param string $group 集团
     * @param int $page  页码
     * @return array
     * @throws Exception
     */
    public function getOpenProjectsByGroupAndPage($group, $page = 1)
    {
        $groups = Yaf_Registry::get('groups');
        $d = [];
        foreach ($groups['groups'] as $v) {
            $d[$v['shortname']] = $v['name'];
        }
        if ($group === 'all') {
            $wheres = [['isopen', '=', 1], ['status', '!=', 'delete']];
        } else {
            $wheres = [['groups', '=', $group], ['isopen', '=', 1], ['status', '!=', 'delete']];
        }
        $orders = [['column' => 'updatetime', 'order' => 'desc']];
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('project', ['*'], $wheres, $page, $orders, 20);
            foreach ($result as &$v) {
                if ($v['groups']) {
                    $v['groups'] = $d[$v['groups']];
                } else {
                    $v['groups'] = '暂无';
                }
            }

            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }


    /**
     * 根据用户查询项目数
     * @param string $user   用户
     * @param string $status 项目的状态 online在线，offline下线，delete删除
     * @return array
     * @throws Exception
     */
    public function getProjectCountByUser($user, $status)
    {
        $wheres = [['user', '=', $user], ['status', '=', $status]];
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getProjectCountByCondition($wheres);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 根据集团查询公开项目数
     * @param string $groups 集团
     * @return array
     * @throws Exception
     */
    public function getProjectCountByIsOpen($groups)
    {
        $wheres = [['groups', '=', $groups], ['isopen', '=', 1]];
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getProjectCountByCondition($wheres);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取系统组模板数据列表
     * @param integer $type 模板分类id
     * @return array
     * @throws Exception
     */
    public function getMultiTemplate($type)
    {
        $column = ['id', 'cover', 'name'];
        $wheres = [['status', '=', 1], ['type', '=', $type]];
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('multitemplate', $column, $wheres);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 通过模板类型获取模板列表
     * @param string $type 模板类型 0:全部 1:封面 2:图文 3:滑块 4:表单
     * @return false/array
     * @throws Exception
     */
    public function getTemplatesByType($type)
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getTemplatesByType($type);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 根据id获取系统组模板数据列表
     * @param string $id 系统组模板id
     * @return array
     * @throws Exception
     */
    public function getMultiTemplateById($id)
    {
        $wheres = [['id', '=', $id]];
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('multitemplate', ['*'], $wheres);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 根据id获取项目信息
     * @param string $id     项目id
     * @param int    $isOpen 公开状态 0未公开 1公开
     * @param string $type 来源（如果是edit,则不需要域名收敛）
     * @return false/array
     * @throws Exception
     */
    public function getProjectById($id, $isOpen = 0, $type = '')
    {
        $wheres = [['id', '=', $id]];
        if ($isOpen !== 0) {
            $wheres[] = ['isopen', '=', 1];
        }
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('project', ['*'], $wheres);
            if ($type !== 'edit' && $result) {
                $result[0]['music'] = parent::formatContent(stripcslashes($result[0]['music']));
                $result[0]['cover'] = parent::formatContent(stripcslashes($result[0]['cover']));
                $result[0]['content'] = parent::formatContent($result[0]['content']);
            }
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取系统所有分类的图片
     * @return array
     * @throws Exception
     */
    public function getAllPic()
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getAllPic();
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取系统某一个分类的图片
     * @param string $type    图片所属类型
     * @param string $subType 图片所属类型
     * @return array
     * @throws Exception
     */
    public function getPicByType($type = 'background', $subType = 'other')
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getPicByType($type, $subType);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取系统一些音乐
     * @param int $pageSize  每一次获取几条音乐
     * @param int $pageIndex 当前第几页
     * @return array
     * @throws Exception
     */
    public function getSomeMusic($pageIndex = 1, $pageSize = 10)
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getMusic($pageIndex, $pageSize);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取系统音乐总数
     * @return int
     * @throws Exception
     */
    public function getMusicCount()
    {
        try {
            $MarketReadDb = new MarketReadDb();
            return $MarketReadDb->getMusicCount();
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取系统所有图片分类
     * @return array
     * @throws Exception
     */
    public function getPicType()
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getPicType();
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取某一个用户上传的所有图片资源
     * @param string $user   用户id
     * @param array $columns 选取的列
     * @return array
     * @throws Exception
     */
    public function getMediaByUserId($user, $columns = ['*'])
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getMediaByUserId($user, $columns);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取某一个用户上传的所有音乐资源
     * @param string $user   用户id
     * @param array $columns 选取的列
     * @return array
     * @throws Exception
     */
    public function getMusicByUserId($user, $columns = ['*'])
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getMusicByUserId($user, $columns);
            if ($result) {
                foreach ($result as $k => $v) {
                    $result[$k]['source'] = self::formatContent($v['source']);
                }
            }
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

//    public function getMediaByUserId($user, $type = 'pic', $columns = ['*'], $page)
//    {
//        $wheres = [['user', '=', $user], ['type', '=', $type], ['status', '=', 'normal']];
//        $orders = [['column' => 'createtime', 'order' => 'desc']];
//        try {
//            $MarketReadDb = new MarketReadDb();
//            $result = $MarketReadDb->selectDataByCondition('media', $columns, $wheres, $page, $orders, 20);
//            return $result;
//        } catch (Exception $e) {
//            throw $e;
//        }
//    }

    /**
     * 查询某一项目的转发人次或总数
     * @param string $projectId 项目id
     * @param string $type      转发类型 cirlce:转发朋友圈，friend:转发朋友
     * @param boolean $distinct 去重 为true则查询某项目的转发人数，为false查询该项目被转发次数
     * @return int
     * @throws Exception
     */
    public function getUserCountByCondition($projectId, $type = 'circle', $distinct = true)
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getUserCountByCondition($projectId, $type, $distinct);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 根据id查询项目返回的数据处理
     * @param array $data 返回的项目数据
     * @return object
     */
    public function getProjectsByIdDao($data)
    {
        $result = [];
        foreach ($data as $v) {
            $result = [
                'errcode' => 1,
                'data' => [
                    'id' => $v['id'],
                    'title' => $v['name'],
                    'loading' => $v['loading'],
                    'cover' => $v['cover'],
                    'introduction' => $v['introduction'],
                    'status' => $v['status'],
                    'createtime' => $v['createtime'],
                    'fontinfo' => $v['fontinfo'],//字体
                ]
            ];

            if ($v['content'] == '') {
                $result['data']['pdata'] = '';
            } else {
                $result['data']['pdata']['json'] = Util::parseJson($v['content']);
            }

            if ($v['music'] != '0') {
                $music = Util::parseJson($v['music']);
                $result['data']['pdata']['music'] = ['id' => $music['id'], 'name' => $music['name']];
            } else {
                $result['data']['pdata']['music'] = 0;
            }
        }

        return $result;
    }

    /**
     * 系统组模板的数据处理
     * @param array $data 返回的项目数据
     * @return object
     */
    public function getMultiTemplateIdDao($data)
    {
        $result = [];
        foreach ($data as $v) {
            $result = [
                'errcode' => 1,
                'data' => [
                    'id' => $v['id'],
                    'title' => $v['name'],
                    'cover' => $v['cover'],
                    'introduction' => $v['introduction'],
                    'status' => $v['status']
                ]
            ];

            if ($v['content'] == '') {
                $result['data']['pdata'] = '';
            } else {
                $result['data']['pdata']['json'] = Util::parseJson($v['content']);
            }

            if ($v['music'] != '0') {
                $music = Util::parseJson($v['music']);
                $result['data']['pdata']['music'] = ['id' => $music['id'], 'name' => $music['name']];
            } else {
                $result['data']['pdata']['music'] = 0;
            }
        }

        return $result;
    }

    /**
     * 处理从某一个项目中取出的表单数据
     * @param string $eventId 项目id_formid
     * @return array/false
     */
    public function getFormInfoByeventId($eventId)
    {
        $eventArr = explode('_', $eventId);
        try {
            $marketDb = new MarketReadDb();
            $formInfo = $marketDb->selectDataByCondition('project', ['id', 'forminfo', 'content'], [['id', '=', $eventArr[0]]]);

            //判断提交的表单是否是需要验证手机验证码的表单
            if (strpos($formInfo[0]['content'], '"limit":"nameTel"')) {
                $result['limit'] = 'nameTel';
            } else {
                $result['limit'] = 'none';
            }
            if (isset($formInfo) && is_array($formInfo) && count($formInfo) > 0) {
                if ($formInfo[0]['id'] != $eventArr[0]) {
                    return array('errcode' => '0', 'errmsg' => '项目不存在');
                }
                if (isset($formInfo[0]['forminfo']) && count($formInfo[0]['forminfo']) > 0) {
                    $formInfo[0]['forminfo'] = Util::parseJson($formInfo[0]['forminfo']);
                    $flag = false;//用来判断formid是否存在
                    foreach ($formInfo[0]['forminfo'] as $key => $value) {
                        if ($value['formid'] == $eventArr[1]) {
                            $flag = true;
                            foreach ($value['forminfo'] as $k => $val) {
                                $formInputId [$k] = $val['id'];
                            }
                        }
                    }
                    if ($flag == false) {
                        //formid不存在
                        return array('errcode' => '0', 'errmsg' => '表单不存在');
                    } else {
                        $result['formInputId'] = $formInputId;
                        return $result;
                    }
                }
            } else {
                return array('errcode' => '0', 'errmsg' => '项目不存在');
            }
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 处理用户自己的图片数据source
     * @param array $medias 用户的资源
     * @type string $type 资源类型，eg:pic,music等
     * @return array
     */
    public function getFormMedia($medias, $type = 'pic')
    {
        foreach ($medias as $key => $value) {
            $tmp = Util::parseJson($value['source']);
            $medias[$key]['name'] = $tmp['name'];
            $medias[$key]['url'] = $tmp['url'];
            if ($type == 'pic') {
                $medias[$key]['picid'] = $medias[$key]['id'];
            } else if ($type == 'music') {
                $medias[$key]['musicid'] = $medias[$key]['id'];
            }
            unset($medias[$key]['id'], $medias[$key]['source']);
        }

        return $medias;
    }

    /**
     * 处理项目的cover图片路径，相对路径转成绝对路径
     * @param array $project 项目数据
     * @return array
     */
    public function getAbsoluteCoverPath($project)
    {
        $imgUrl = $this->conf['domain']['imgUrl']['admin'];
        foreach ($project as $key => $value) {
            if (strpos($value['cover'], 'http') === false) {
                $project[$key]['cover'] = $imgUrl . 'imgs/' . $value['cover'];
            }
        }

        return $project;
    }

    /**
     * 将本项目的前台预览地址拼接出来
     * @param array $project 项目数据
     * @param array $user    用户信息
     * @return array
     */
    public function getPreviewUrl($project, $user)
    {
        $siteUrl = $this->conf['domain']['siteUrl']['web'];
        foreach ($project as $key => $value) {
            if (isset($value['city']) && !$value['city']) {
                $project[$key]['previewUrl'] = urlencode($siteUrl . $value['id'] . '/?city=' . $user['city'] . '&channel=' . $user['groups'] . '&source=' . $user['source']);
            } else {
                $project[$key]['previewUrl'] = urlencode($siteUrl . $value['id'] . '/?city=' . $value['city'] . '&channel=' . $value['groups'] . '&source=' . $value['source']);
            }
        }

        return $project;
    }

    /**
     * 通过项目id获取报名表单信息
     * @param  string $projectId 项目id
     * @param  string $formId    表单的id
     * @param  int    $page      页数
     * @param  int    $pagesize  每页条数
     * @return false/array
     * @throws Exception
     * update  chenhongyan 2016.3.2
     */
    public function getSignInfoByEventId($projectId, $formId, $page = 0, $pagesize = 30)
    {
        //获取项目id最后一位拼接表名
        $id = substr($projectId, -1, 1);
        $wheres = [['eventid', '=', $projectId . '_' . $formId]];

        if ($page > 0) {
            $order = [['column' => 'createtime', 'order' => 'desc']];
        } else {
            $order = [];
        }
        try {
            $marketReadDb = new MarketReadDb();
            $result = $marketReadDb->selectDataByCondition('form_' . $id, ['*'], $wheres, $page, $order, $pagesize);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }

    }

    /**
     * 处理上传模板media
     * @param array $media 媒体数据
     * @param array $path 存储的路径
     * @param array $subPath 项目的子目录，存储路径最后一层
     * @return array
     */
    public function dealMediaData($media, $path, $subPath)
    {
        //判断文件类型的资源，提前实例化
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        //用于存储每一个背景图片的重命名后的fileName与原url对应关系的数组，用于判断是否有重复的url
        $tmpArr = array();
        if (!empty($media)) {
            foreach ($media as $key => $value) {
                if ($fileName = array_search($value['url'], $tmpArr)) {
                    //$media[$key]['url'] = 'bgpic/' . $fileName;
                    $media[$key]['url'] = $subPath . $fileName;
                    continue;
                }
                $content = file_get_contents($value['url']);
                $fileName = Util::guid();
                $pathName = APP_PATH . $path . $fileName;
                file_put_contents($pathName, $content);
                $mimetype = finfo_file($finfo, $pathName);
                switch ($mimetype) {
                    case 'image/jpeg':
                        $newPath = $pathName . '.jpeg';
                        $newName = $fileName . '.jpeg';
                        break;
                    case 'image/png':
                        $newPath = $pathName . '.png';
                        $newName = $fileName . '.png';
                        break;
                    case 'image/jpg':
                        $newPath = $pathName . '.jpg';
                        $newName = $fileName . '.jpg';
                        break;
                    default:
                        $newPath = $pathName . '.jpeg';
                        $newName = $fileName . '.jpeg';
                }
                $tmpArr[$newName] = $value['url'];
                rename($pathName, $newPath);
                $media[$key]['url'] = $subPath . $newName;
            }
        }

        return $media;
    }

    /**
     * 增加某一个用户图片
     * @param array $data 上传文件的信息
     * @return string/boolean
     * @throws Exception
     */
    public function insertMedia($data)
    {
        $data['id'] = Util::guid();
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->insertData('media', $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 增加某一个用户音乐
     * @param array $data 上传音乐的信息
     * @return string/boolean
     * @throws Exception
     */
    public function insertMusic($data)
    {
        $data['id'] = Util::guid();
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->insertData('music', $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 向数据库插入一条新建的项目数据
     * @param array $data 一维数组项目数据
     * @return bool
     * @throws Exception
     */
    public function insertProject($data)
    {
        //将id与添加时间合并到数组中
        $data['id'] = Util::guid();
        $data['createtime'] = $data['updatetime'] = time();
        //默认项目封面
        if (!isset($data['cover'])) {
            $data['cover'] = 'cover/logo02.png';
        }
        //插入组系统模板
        if (!isset($data['music'])) {
            $data['music'] = 0;
        }
        //默认项目标题
        if (!isset($data['name'])) {
            $data['name'] = '我的房天下H5作品';
        }
        //默认项目简介
        if (!isset($data['introduction'])) {
            $data['introduction'] = '手机房天下是中国最大的房地产家居移动互联网门户，为亿万用户提供全面及时的房地产新闻资讯内容,为所有楼盘提供网上浏览及业主论坛信息。覆盖全国300多个城市,找新房、找二手房、找租房,更多便捷,更加精准。';
        }
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->insertData('project', $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 向数据库插入用户的报名信息
     * @param  array $data 用户的报名信息
     * @param  string $form_sign form表名的最后一位
     * @return bool
     * @throws Exception
     */
    public function insertSignInfo($data, $form_sign)
    {
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->insertData('form_' . $form_sign, $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }

    }

    /**
     * 向数据库插入模板
     * @param array $data 模板信息
     * @return bool
     * @throws Exception
     */
    public function insertTemplate($data)
    {
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->insertData('template', $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 向数据库插入组模板
     * @param array $data 模板信息
     * @return bool
     * @throws Exception
     */
    public function insertMultiTemplate(array $data)
    {
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->insertData('multitemplate', $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 记录用户的微信分享情况
     * @param array $data ['guid'=>$global_cookie, 'projectid'=>$projectid, type=>$type]
     * @return boolean
     * @throws Exception
     */
    public function insertUserCountLiog($data)
    {
        $data['createtime'] = time();
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->insertData('UserCountLog', $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 通过项目id更新项目
     * @param array $data 要更新的项目数据 $data = ['id'=>'xxx', 'user' => 'xxx' 'data'=>['name'=>'xxx']]
     * @return integer/bool
     * @throws Exception
     */
    public function updateProjectByIdAndUser($data)
    {
        //更新项目时候
        if (!isset($data['data']['uv']) && !isset($data['data']['pv'])) {
            $data['data']['updatetime'] = time();
        }
        try {
            $MarketWriteDb = new MarketWriteDb();
            //isopen代表项目公开状态 loadcount代表项目被当做模板的选用次数
            if (isset($data['data']['isopen']) &&  $data['data']['isopen'] == 0) {
                $data['data']['loadcount'] = 0;
            }
            //给yueyuanlei开通权限,可以修改所有人的项目
            if ($data['user'] === 'yueyanlei') {
                $wheres = [['id', '=', $data['id']]];
            } else {
                $wheres = [['id', '=', $data['id']], ['user', '=', $data['user']]];
            }

            $result = $MarketWriteDb->updateData('project', $wheres, $data['data']);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 删除某一个用户图片
     * @param string $id 媒体资源的id
     * @param string $user 用户id
     * @return boolean
     * @throws Exception
     */
    public function delMediaByIdAndUser($id, $user)
    {
        try {
            $MarketWriteDb = new MarketWriteDb();
            $wheres = [['id', '=', $id], ['user', '=', $user]];
            $data = ['status' => 'delete'];
            $result = $MarketWriteDb->updateData('media', $wheres, $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 更新单页模板
     * @param array $data 要更新的单页模板数据 $data = ['id'=>'xxx', 'data'=>['name'=>'xxx']]
     * @return integer/bool
     * @throws Exception
     */
    public function updateTemplate($data)
    {
        try {
            $MarketWriteDb = new MarketWriteDb();
            $wheres = [['id', '=', $data['id']]];
            $result = $MarketWriteDb->updateData('template', $wheres, $data['data']);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 更新组模板
     * @param array $data 要更新的组模板数据 $data = ['id'=>'xxx', 'data'=>['name'=>'xxx']]
     * @return integer/bool
     * @throws Exception
     */
    public function updateMultiTemplate($data)
    {
        $wheres = [['id', '=', $data['id']]];
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->updateData('multitemplate', $wheres, $data['data']);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 微信分享计数
     * @param string $id 分享的项目id
     * @param integer $type 分享的类型 1：分享到朋友圈，0：发送给朋友
     * @return boolean
     * @throws Exception
     */
    public function wxShareCountIncrease($id, $type)
    {
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->wxShareCountIncrease($id, $type);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 更新公开模板被使用的次数
     * @param string $id 项目id
     * @return bool
     * @throws Exception
     */
    public function updateLoadCount($id)
    {
        try {
            $MarketWriteDb = new MarketWriteDb();
            $result = $MarketWriteDb->updateLoadCount($id);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 对配置文件中的集团数据进行处理
     * @param bool $flag 标志位,false和true两种处理方式
     * @return array
     */
    public function getGroups($flag = false)
    {
        $groups = Yaf_Registry::get('groups');
        array_unshift($groups['groups'], ['shortname' => 'all', 'name' =>'全部']);
        if ($flag) {
            $d = [];
            foreach ($groups['groups'] as $v) {
                $d[] = $v['shortname'];
            }
            return $d;
        } else {
            return $groups;
        }
    }

    /**
     * 集团流量数据统计
     * @param array $data 统计所需参数数组
     * @param int   $flag 1 统计某集团各城市下专题总数，2 统计某集团各城市报名总人数，3 统计某集团各称城市UV
     * @return array/false
     * @throws Exception
     */
    public function getProjectNum($data, $flag = 1)
    {
        $begin = strtotime($data['begin']);
        $end = strtotime($data['end']) + 86400;
        $cityList = Yaf_Registry::get('citylist');
        //首字母数组
        $d = [];
        //最终统计结果
        $tongjiData = [];
        try {
            $MarketReadDb = new MarketReadDb();
            // 集团各城市专题数据统计
            if ($flag == 1) {
                $result = $MarketReadDb->getTongjiData($data['group'], $begin, $end);
                foreach ($result as $value) {
                    if ($value['city'] !== '' && $value['city'] === 'quanguo') {
                        $tongjiData['quanguo'] = ['cityname' => '全国', 'shortname' => 'quanguo', 'num' => $value['num']];
                    } else if ($value['city'] !== '') {
                        //这里不能使用城市简拼的首字母进行循环,有些城市的首字母和所在的数组不一致,例如澳门citylist.A.6.cityname   = '澳门' citylist.A.6.shortname  = 'macau'
                        foreach ($cityList['citylist'] as $key => $item) {
                            foreach ($item as $k => $val) {
                                if ($value['city'] == $val['shortname']) {
                                    $tongjiData[$key][] = ['cityname' => $val['cityname'], 'shortname' => $val['shortname'], 'num' => $value['num']];
                                    break 2;
                                }
                            }
                        }
                    }
                }
                ksort($tongjiData);
                return $tongjiData;
            } elseif ($flag == 2) {
                //直接从project表中获取signinnum字段来获取项目中表单的报名数
                $signNum = $MarketReadDb -> getCitySignNUmByGroups($data['group'], $begin, $end);
                foreach ($signNum as $k => $v) {
                    //页面上只展示uv大于0的城市
                    if ($v['num'] > 0) {
                        foreach ($cityList['citylist'] as $key => $item) {
                            foreach ($item as $k => $val) {
                                if ($v['city'] === $val['shortname']) {
                                    $tongjiData[$key][] = ['cityname' => $val['cityname'], 'shortname' => $val['shortname'], 'num' => $v['num']];
                                    break 2;
                                } else if ($v['city'] === 'quanguo') {
                                    $tongjiData['quanguo'] = ['cityname' => '全国', 'shortname' => 'quanguo', 'num' => $v['num']];
                                    break 2;
                                }
                            }
                        }
                    }
                }
                ksort($tongjiData);
                return $tongjiData;
            } else {
                $uvs = $MarketReadDb->getCityUvByGroups($data['group'], $begin, $end, 2);
                foreach ($uvs as $k => $v) {
                    if ($v['uv'] > 0) {
                        foreach ($cityList['citylist'] as $key => $item) {
                            foreach ($item as $k => $val) {
                                if ($v['city'] === $val['shortname']) {
                                    $tongjiData[$key][] = ['cityname' => $val['cityname'], 'shortname' => $val['shortname'], 'num' => $v['uv']];
                                    break 2;
                                } else if ($v['city'] === 'quanguo') {
                                    $tongjiData['quanguo'] = ['cityname' => '全国', 'shortname' => 'quanguo', 'num' => $v['uv']];
                                    break 2;
                                }
                            }
                        }
                    }
                }
                ksort($tongjiData);
                return $tongjiData;
            }
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 根据用户分页查询
     * @param string $user 用户
     * @param int    $page 页码
     * @return array
     * @throws Exception
     */
//    public function getMyTemplateByUser($user, $page)
//    {
//        $where = [['user', '=', $user]];
//        try {
//            $marketReadDb = new MarketReadDb();
//            $result = $marketReadDb->selectDataByCondition('MyTemplate', ['*'], $where, $page);
//            return $result;
//        } catch (Exception $e) {
//            throw $e;
//        }
//    }

    /**
     * 插入我的模板
     * @param array $data 模板数据
     * @return string/bool
     * @throws Exception
     */
    public function insertMyTemplate(array $data)
    {
        try {
            $marketWriteDb = new MarketWriteDb();
            $result = $marketWriteDb->insertData('MyTemplate', $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 逻辑删除我的模板
     * @param string $user       用户名
     * @param string $createtime 创建时间
     * @param array  $data       更新数据
     * @author tangcheng.bj@fang.com
     * @throws Exception
     */
    public function delMyTemplate($user, $createtime, $data)
    {
        $wheres = [['user', '=', $user], ['createtime', '=', $createtime]];
        try {
            $marketWriteDb = new MarketWriteDb();
            $result = $marketWriteDb->updateData('MyTemplate', $wheres, $data);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 根据项目ID获取其中的表单信息
     * @param string $id 项目ID
     * @param string $user 用户账号
     * @return array/false
     * chenhongyan   2016.3.2
     */
    public function getFromInfoByProjId($id, $user)
    {
        try {
            $marketReadDb = new MarketReadDb();
            if ($user === 'chenhongyan') {
                //给chenhongyan增加查看报名信息列表的权限
                $where = [['id', '=', $id]];
            } else {
                $where = [['id', '=', $id],['user', '=', $user]];
            }
            $result = $marketReadDb -> selectDataByCondition('project', $columns = ['id','formInfo'], $where);

            if (isset($result) && isset($result[0])) {
                foreach ($result as $key => $value) {
                    $result[$key]['formInfo'] = Util::parseJson($value['formInfo']);
                }
            } else {
                $result[0] = array('count'=>0);
            }
            return $result[0];
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 分页查询用户个人模板
     * @param string $user   用户邮箱
     * @param string $status 项目的状态 online在线，offline下线，delete删除
     * @return false/array
     * @author tangcheng.bj@fang.com
     * @throws Exception
     */
    public function getMyTemplateByUser($user, $status)
    {
        if ($status === 'delete') {
            $wheres = [['user', '=', $user], ['status', '=', 'delete']];
        } else {
            $wheres = [['user', '=', $user], ['status', '!=', 'delete']];
        }
        $orders = [['column' => 'updatetime', 'order' => 'desc']];
        $page = 0;
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('MyTemplate', ['*'], $wheres, $page, $orders);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取有表单的项目信息和表单信息
     * @param array $columns 查询字段 ['*']
     * @param array $wheres  查询条件
     * @param array $order   排序条件
     * @return array
     * @throws Exception
     * @author chenhongyan 2016.3.8
     */
    public function getProjects($columns = ['*'], $wheres = [], $order = [])
    {
        try {
            $marketReadDb = new MarketReadDb();
            $project = $marketReadDb -> selectDataByCondition('project', $columns, $wheres, 0, $order);
            return $project;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 获取系统一些字体
     * @return array
     * @throws Exception
     */
    public function getSomeFonts()
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->getFonts();
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }
    /**
     * 获取当前用户的pv/uv
     * @param array $columns 需要查询的字段
     * @param array $where   需要查询的条件
     * @return array/false
     * @throws Exception
     */
    public function getProjectsById($columns, $where)
    {
        try {
            $MarketReadDb = new MarketReadDb();
            $result = $MarketReadDb->selectDataByCondition('project', $columns, $where);
            return $result;
        } catch (Exception $e) {
            throw $e;
        }
    }
}
/* End of file Market.php */
