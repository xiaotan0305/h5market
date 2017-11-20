<?php
/**
 * Project:     手机搜房
 * File:        SocketDriver.php
 *
 * <pre>
 * 描述：Socket 通信底层驱动（核心底层，修改请务必通知）
 * </pre>
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */

/**
 * Socket 通信底层驱动
 *
 * Long description for file (if any)...
 *
 * @category   PHP
 * @package    Application
 * @subpackage Library
 * @author     lizeyu <lizeyu@soufun.com>
 * @copyright  2015 Soufun, Inc.
 * @license    BSD Licence
 * @link       http://example.com
 */
class SocketDriver
{
    /**
     * 主机名
     * @var string
     */
    private $_host = "";

    /**
     * 端口号
     * @var string
     */
    private $_port = "";

    /**
     * Socket链接句柄
     * @var obj
     */
    private $_socketHandle;

    /**
     * Socket结束标识符
     * @var string
     */
    private $_commandEnd = "\n";

    /**
     * Socket语句命令标识符
     * @var string
     */
    private $_arrCommand;

    /**
     * Socket语句空白标识符
     * @var string
     */
    private $_arrEscape;

    /**
     * Socket链接超时 单位秒
     * @var integer
     */
    private $_connectTimeout = 1;

    /**
     * Socket数据包超时 单位秒
     * @var integer
     */
    private $_streamTimeout = 1;

    /**
     * Fsockopen错误代码
     * @var integer
     */
    private $_errno = 0;

    /**
     * Fsockopen错误信息
     * @var strin
     */
    private $_errstr = "";

    /**
     * 构造方法，打开连接，并设置超时时限
     * @param string  $host           主机地址
     * @param integer $port           端口
     * @param integer $connectTimeout 连接超时时限，默认为 2 秒
     * @param integer $streamTimeout  数据包超时时限，默认为 2 秒
     * @return false/null
     */
    public function __construct($host, $port, $connectTimeout = 2, $streamTimeout = 2)
    {
        $this->_host = $host;
        $this->_port = $port;
        $this->_connectTimeout = $connectTimeout;
        $this->_streamTimeout = $streamTimeout;
        $this->_arrCommand = array_merge(array($this->_commandEnd), array('~', '^'));
        $this->_arrEscape = array(chr(1), chr(2), chr(3));
        //连接异常要容错！最后一个参数是指定超时秒数，到时就停止
        $this->_socketHandle = @fsockopen($this->_host, $this->_port, $this->_errno, $this->_errstr, $connectTimeout);
        if (false === $this->_socketHandle) {
            $msg = 'Cannot connect to Soceck Server, host:'.$this->_host.', port:'.$this->_port.' error:'.$this->_errstr;
            
            if (__DEBUG_MODE__) {
                echo $msg."<br />\n";
            }

            throw new Yaf_Exception($msg, $this->_errno);
        } elseif (__DEBUG_MODE__) {
            echo "<b>Soceck Server connect ok</b> host:".$this->_host . " port:". $this->_port ."<br />\n";
        }

        stream_set_timeout($this->_socketHandle, $streamTimeout);
    }

    /**
     * 设置结束标识符
     * @param string $end 结束标识符
     * @return null
     */
    public function setCommandEnd($end)
    {
        $this->_commandEnd = $end;
    }

    /**
     * 发送socket请求
     * @param string $writestr 通信文本串，不用带消息结束符
     * @return boolean
     */
    private function _put($writestr)
    {
        //统一加上消息结束符
        $writestr .= $this->_commandEnd;
        if (is_resource($this->_socketHandle)) {
            //fwrite 成功时返回写入的字符数
            $res = fwrite($this->_socketHandle, $writestr);
            if ($res === false) {
                $msg = 'Fail to write to Soceck Server, host:'.$this->_host.', port:'.$this->_port.' command:'.$writestr;

                if (__DEBUG_MODE__) {
                    echo $msg."<br />\n";
                }

                throw new Yaf_Exception($msg);
            } else {
                if (__DEBUG_MODE__) {
                    echo 'Succ to write to Soceck Server, host:'.$this->_host.', port:'.$this->_port.' command:'.$writestr."<br />\n";
                }

                return true;
            }
        }
    }

    /**
     * 关闭链接
     * @return null
     */
    public function close()
    {
        fclose($this->_socketHandle);
    }

    /**
     * 单纯发送并关闭，不取结果
     * @param string $writestr 通信文本串，不用带消息结束符
     * @return boolean
     */
    public function send($writestr)
    {
        try {
            $res = $this->_put($writestr);

            $this->close();

            return $res;
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 发送socket请求并获取输出
     * @param string $writestr 通信文本串，不用带消息结束符
     * @return string/false
     */
    public function receive($writestr)
    {
        try {
            $this->_put($writestr);
            $str = '';
            if (is_resource($this->_socketHandle)) {
                while (!feof($this->_socketHandle)) {
                    $str .= fread($this->_socketHandle, 102400);
                    $info = stream_get_meta_data($this->_socketHandle);
                    if (isset($info['timed_out']) && ''!=trim($info['timed_out'])) {
                        $this->_errstr = "time out";
                        $this->close();
                        $msg = 'Receive from Soceck Server timed out. Host:'.$this->_host.', port:'.$this->_port.' command:'.$writestr;

                        if (__DEBUG_MODE__) {
                            echo $msg."<br />\n";
                        }

                        throw new Yaf_Exception($msg);
                    }
                    //找到消息结束符时就结束读取
                    if (strpos($str, $this->_commandEnd) !== false) {
                        break;
                    }
                }
                $this->close();
                //最后再把消息结束符去掉
                $str = substr($str, 0, strrpos($str, $this->_commandEnd));

                if (__DEBUG_MODE__) {
                    echo 'Receive from Soceck Server. Host:'.$this->_host.', port:'.$this->_port.' command:'.$writestr."<br />\n".' response:'.$str."<br />\n";
                }

                return $str;
            }
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * 把消息用到的字符进行转义
     * @param string $writestr 未转义通信文本串，不用带消息结束符
     * @return string
     */
    public function escape($writestr)
    {
        $writestr = str_replace($this->_arrCommand, $this->_arrEscape, $writestr);
        return $writestr;
    }

    /**
     * 把转义后的字符串恢复回来
     * @param string $writestr 转义后的通讯文本
     * @return string
     */
    public function unescape($writestr)
    {
        $writestr = str_replace($this->_arrEscape, $this->_arrCommand, $writestr);
        return $writestr;
    }
}

/* End of file SocketDriver.php */
