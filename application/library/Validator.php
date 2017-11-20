<?php
/**
 * Project:     手机搜房
 * File:        Validator.php
 *
 * <pre>
 * 描述：验证表单信息类
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     liyang <liyang-bj@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * 验证表单信息类
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     liyang <liyang-bj@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
class Validator
{
    /**
     * 去除空格字符串
     * @param  string $str 输入的字符串
     * @return boolean
     */
    private static function _strTrim($str)
    {
        return preg_replace("/\s/", "", $str);
    }

    /**
     * 验证邮箱
     * @param  string $email 邮箱
     * @return boolean
     */
    public static function isEmail($email)
    {
        $email = self::_strTrim($email);
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 验证手机号
     * @param  string $mobile 手机号
     * @return boolean
     */
    public static function isMobile($mobile)
    {
        $mobile = self::_strTrim($mobile);
        if (preg_match("/^(13[0-9]|14[0-9]|15[0-9]|18[0-9]|17[0-9])\d{8}$/", $mobile)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 验证6位手机验证码
     * @param string $code 手机验证码
     * @return boolean
     */
    public static function isCode($code)
    {
        $code = self::_strTrim($code);
        if (preg_match("/^(\d){4}$/", $code)) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * 18位身份证校验码有效性检查
     * @param  string $idcard 身份证号
     * @return boolean
     */
    public static function isIdcard($idcard)
    {
        if (strlen($idcard) != 18) {
            return false;
        }
        $idcard_base = substr($idcard, 0, 17);
        if (self::_idcardVerifyNumber($idcard_base) != strtoupper(substr($idcard, 17, 1))) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 计算身份证校验码，根据国家标准GB 11643-1999
     * @param  string $idcard_base 身份证号
     * @return boolean
     */
    private static function _idcardVerifyNumber($idcard_base)
    {
        if (strlen($idcard_base) != 17) {
            return false;
        }
        //加权因子
        $factor = array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);

        //校验码对应值
        $verify_number_list = array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
        $checksum = 0;
        for ($i = 0; $i < strlen($idcard_base); $i++) {
            $checksum += substr($idcard_base, $i, 1) * $factor[$i];
        }
        $mod = $checksum % 11;
        $verify_number = $verify_number_list[$mod];
        return $verify_number;
    }

    /**
     * UTF-8验证
     * @param  string $str 字符串
     * @return boolean
     */
    public static function isUtf8($str)
    {
        if (preg_match("/^([" . chr(228) . "-" . chr(233) . "]{1}[" . chr(128) . "-" . chr(191) . "]{1}[" . chr(128) . "-" . chr(191) . "]{1}){1}/", $str) == true || preg_match("/([" . chr(228) . "-" . chr(233) . "]{1}[" . chr(128) . "-" . chr(191) . "]{1}[" . chr(128) . "-" . chr(191) . "]{1}){1}$/", $str) == true || preg_match("/([" . chr(228) . "-" . chr(233) . "]{1}[" . chr(128) . "-" . chr(191) . "]{1}[" . chr(128) . "-" . chr(191) . "]{1}){2,}/", $str) == true) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * 验证41位eventid
     * @param string $eventid projectid_formid
     * @return boolean
     */
    public static function isEventid($eventid)
    {
        $eventid = self::_strTrim($eventid);
        if (preg_match("/^[0-9a-z]{32}_[0-9]{8}$/", $eventid)) {
            return true;
        } else {
            return false;
        }
    }
}

/* End of file Validator.php */
