<?php
/**
 * Project:     搜房网php框架
 * File:        Index.php
 *
 * <pre>
 * 描述：Index控制器
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Controllers
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Index控制器
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Controllers
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
class IndexController extends BaseController
{
    /**
     * Index首页
     * @return void
     */
    public function indexAction()
    {
        //setcookie('sfut', 'BCB5677E4E5A64866955A9E39E24868EB0606AE35478FF46A9E74EBAF794E5C2E4EDCED67700CAF4EF6A20CFCCE77FD779422613AB33957565E28A56109FA6D7A60D00B16DCE32F7', time()+86400);
        header('Content-Type:text/html; charset=utf-8');
        //Util::guid();
        //$UserModel = new UserModel();
        //print_r($UserModel->getUserInfoFromPassport(25387761));
        //print_r($UserModel->sendVerifyCode('13810923815'));
        //print_r($UserModel->loginByVerifyCode('13810923815', '505174', true));
        //$IssoModel = new IssoModel();
        //print_r($IssoModel->addIssoService('lizeyu'));
        $this->_view->assign("content", "Hello World");
        /*$Http_OaModel = new Http_OajkModel();
        $query = array(
            'method' => 'verifyTokenPc',
            'user' => 'test',
            'pwd' => '1234567',
            'isso_sid' => 278,
            'oa_token' => '216|/Dib+fXo3yAprvrbKgO+avpghl5WD0hrNbVm7+mEelsfrw46JZKFyw=='
            );
        print_r($Http_OaModel->auth($query));*/
        //$Http_Homewww2 = new Http_Homewww2();
        //print_r($Http_Homewww2->act(array()));
        //$Http_Passportjk = new Http_Passportjk();
        //$Http_Passportjk->checkCookie();
        //$Db_HouseDic = new Db_HouseDicModel('n');
        //print_r($Db_HouseDic->getPriceAndSquare(iconv('utf-8', 'gbk', '北京'), 'R', 'esfaverageprice'));
        //print_r($Db_HouseDic->getPriceAndSquareXf(iconv('utf-8', 'gbk', '北京'), iconv('utf-8', 'gbk', '住宅')));
        //print_r($Db_HouseDic->getDistrictAndBinding(iconv('utf-8', 'gbk', '北京')));
        //print_r($Db_HouseDic->getAreaAndBinding(iconv('utf-8', 'gbk', '北京'), 0));
        //print_r($Db_HouseDic->getSubwayLine(iconv('utf-8', 'gbk', '北京')));
        //print_r($Db_HouseDic->getSubwayLineInfoByEsfId(iconv('utf-8', 'gbk', '北京'),9));
        //print_r($Db_HouseDic->getSubwayStation(1));
        //print_r($Db_HouseDic->getCircle(iconv('utf-8', 'gbk', '北京'), iconv('utf-8', 'gbk', '住宅')));
        //print_r($Db_HouseDic->getDistrictComarea(iconv('utf-8', 'gbk', '北京')));

        //$Db_ZfDisBind = new Db_ZfDisBind();
        //print_r($Db_ZfDisBind->getDistrictAndBinding(iconv('utf-8', 'gbk', '北京')));
        
        //$Db_ZfDisBindSmallCity = new Db_ZfDisBindSmallCity();
        //print_r($Db_ZfDisBindSmallCity->getDistrictAndBinding(iconv('utf-8', 'gbk', '招远')));
        //exit;
        /*$array = array(
            'source' => 1,
            'cityname' => iconv('utf-8', 'gbk', '北京'),
            'page' => 1,
            'pagesize' => 5,
            );
        $request = array(
            'host' => 'http://jk.ask.fang.com',
            'path' => '/Interface/GetAskbyAnswerCount.aspx',
            'query' => $array,
            'method' => 'get',
            'extra_options' => array(),
            );
        try {
            $Driver_Http = new HttpDriver();
            //$result = $Driver_Http->sendRequest('http://jk.ask.fang.com', '/Interface/GetAskbyAnswerCount.aspx', $array, 'get');
            $result = $Driver_Http->sendRequestMulti(array($request,$request,$request,$request,$request,$request,$request,$request,$request,$request));
            print_r($result);
        } catch (Exception $e) {
            echo 'Caught exception: ',  $e->getMessage(), "\n";
        } finally {
            exit;
        }*/
    }

    /**
     * Index::test首页
     * @return void
     */
    public function testAction()
    {
        echo __METHOD__;
        exit;
    }
}

/* End of file Index.php */
