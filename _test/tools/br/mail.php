<?php
/**
 * 
 * @author: peng.shan <peng.shan@happyelements.com>
 * @version $Id: mail.php 156323 2011-11-28 02:57:21Z peng.shan $
 */
class Mail {
	function send_mail($to,$subject = "",$body = "") {
		//error_reporting(E_STRICT);
		date_default_timezone_set("Asia/Shanghai");//設定時區東八區
		require_once('../libs/phpmailer/class.phpmailer.php');
		include("../libs/phpmailer/class.pop3.php");
		$mail             = new PHPMailer(); //new一個PHPMailer對象出來
		$body             = str_replace("[\]",'',$body); //對郵件內容進行必要的過濾
		$mail->CharSet ="UTF-8";//設定郵件編碼，默認ISO-8859-1，如果發中文此項必須設置，否則亂碼
//		$mail->IsSMTP(); // 設定使用SMTP服務
//		$mail->SMTPDebug  = 1;                     // 啟用SMTP調試功能
											   // 1 = errors and messages
											   // 2 = messages only
		$mail->SMTPAuth   = true;                  // 啟用 SMTP 驗證功能
		$mail->SMTPSecure = "ssl";                 // 安全協議
		$mail->Host       = "MAILBOX03.internal.baidu.com";      // SMTP 服務器
		$mail->Port       = 465;                   // SMTP服務器的端口號
		$mail->Username   = "zhuwemxuan";  // SMTP服務器用戶名
		$mail->Password   = "xxxxx";            // SMTP服務器密碼
		$mail->SetFrom('xxxx@baidu.com', '朱文軒');
		$mail->AddReplyTo("xxxx@baidu.com","郵件回覆人的名稱");
		$mail->Subject    = $subject;
		$mail->AltBody    = "To view the message, please use an HTML compatible email viewer! - From www.jiucool.com"; // optional, comment out and test
		$mail->MsgHTML($body);
		$address = $to;
		$mail->AddAddress($address, "收件人名稱");
		if(!$mail->Send()) {
			echo "Mailer Error: " . $mail->ErrorInfo;
		} else {
			echo "Message sent!恭喜，郵件發送成功！";
        }
    }
    function new_send_mail(){
        mail("xxxx@baidu.com","asdfasdf","asdfasdf");
//        require_once('../libs/phpmailer/class.phpmailer.php');
//        $mail = new PHPMailer();
//        $body             = "asdfdsf";
//        $body             = str_replace("[\]",'',$body);
//        $mail->SMTPAuth   = true;                  // 啟用 SMTP 驗證功能
//        $mail->SMTPSecure = "ssl";                 // 安全協議
//        $mail->IsSMTP();
//        $mail->CharSet='UTF-8';
//        $mail->SMTPDebug = 2;
//        $mail->Host     = 'smtp.baidu.com';
//        $mail->Port = 25;
//        $mail->Username = "xxxx@baidu.com";
//        $mail->Password = "xxxx";
//        $mail->SetFrom('xxxx@baidu.com', 'First Last');
//
//        $mail->AddReplyTo("zhuwen_xuan@126.com","First Last");
//
//        $mail->Subject    = "PHPMailer Test Subject via POP before SMTP, basic";
//
//        $mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test
//
//        $mail->MsgHTML($body);
//
//        $address = "zhuwen_xuan@126.com";
//        $mail->AddAddress($address, "John Doe");
//        if(!$mail->Send()) {
//          echo "Mailer Error: " . $mail->ErrorInfo;
//        } else {
//          echo "Message sent!";
//        }
    }

    function sendMain126(){
        require_once('../libs/phpmailer/class.phpmailer.php');
        $mail = new PHPMailer();
        $body             = "asdfdsf";
        $body             = str_replace("[\]",'',$body);
        $mail->SMTPAuth   = true;                  // 啟用 SMTP 驗證功能
        $mail->SMTPSecure = "ssl";                 // 安全協議
        $mail->IsSMTP();
        $mail->CharSet='UTF-8';
        $mail->SMTPDebug = 2;
        $mail->Host     = 'smtp.126.com';
        $mail->Port = 465;
        $mail->Username = "zhuwen_xuan@126.com";
        $mail->Password = "zwx19840818";
        $mail->SetFrom('zhuwen_xuan@126.com', 'First Last');

        $mail->AddReplyTo("xxxx@baidu.com","First Last");

        $mail->Subject    = "PHPMailer Test Subject via POP before SMTP, basic";

        $mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test

        $mail->MsgHTML($body);

        $address = "xxxxxx@baidu.com";
        $mail->AddAddress($address, "John Doe");
        if(!$mail->Send()) {
          echo "Mailer Error: " . $mail->ErrorInfo;
        } else {
          echo "Message sent!";
        }
    }

}
$m = new Mail();
$m->new_send_mail();




    