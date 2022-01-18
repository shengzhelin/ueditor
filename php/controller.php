<?php
//header('Access-Control-Allow-Origin: http://www.baidu.com'); //設置http://www.baidu.com允許跨域訪問
//header('Access-Control-Allow-Headers: X-Requested-With,X_Requested_With'); //設置允許的跨域header
date_default_timezone_set("Asia/chongqing");
error_reporting(E_ERROR);
header("Content-Type: text/html; charset=utf-8");

$CONFIG = json_decode(preg_replace("/\/\*[\s\S]+?\*\//", "", file_get_contents("config.json")), true);
$action = $_GET['action'];

switch ($action) {
    case 'config':
        $result =  json_encode($CONFIG);
        break;

    /* 上傳圖片 */
    case 'uploadimage':
    /* 上傳塗鴉 */
    case 'uploadscrawl':
    /* 上傳視頻 */
    case 'uploadvideo':
    /* 上傳文件 */
    case 'uploadfile':
        $result = include("action_upload.php");
        break;

    /* 列出圖片 */
    case 'listimage':
        $result = include("action_list.php");
        break;
    /* 列出文件 */
    case 'listfile':
        $result = include("action_list.php");
        break;

    /* 抓取遠程文件 */
    case 'catchimage':
        $result = include("action_crawler.php");
        break;

    default:
        $result = json_encode(array(
            'state'=> '請求地址出錯'
        ));
        break;
}

/* 輸出結果 */
if (isset($_GET["callback"])) {
    if (preg_match("/^[\w_]+$/", $_GET["callback"])) {
        echo htmlspecialchars($_GET["callback"]) . '(' . $result . ')';
    } else {
        echo json_encode(array(
            'state'=> 'callback參數不合法'
        ));
    }
} else {
    echo $result;
}