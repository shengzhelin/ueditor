<?php
/**
 * check get or post
 *
 */
/*加上這句使得當php配置顯示Notice提示信息時也不會報錯*/
error_reporting(E_ERROR | E_WARNING);
if ($_SERVER['REQUEST_METHOD'] == 'POST') { // POST請求

    $img1 = $_POST['img1'];
    $img2 = $_POST['img2'];
    $content = $_POST['content'];
    $str = '';
    if ($img1 && $img2) {
        $str = "img1='" . $img1 . "'&img2='" . $img2 . "'";
    }
    if ($content) {
        if ($img1) {
            $str .= '&';
        }
        $str .= $content;
    }
    echo $str;

} else if (isset($_GET['callback'])) { // jsonp做的GET請求

    $callback = $_GET['callback'];

    echo $callback . '(' . json_encode($_GET) . ')';

} else { // 普通GET請求

    $get1 = $_GET['get1'];
    $get2 = $_GET['get2'];
    $img1 = $_GET['img1'];
    $img2 = $_GET['img2'];
    $content = $_GET['content'];
    $str = '';
    if ($get1 && $get2) {
        $str .= "get1='" . $get1 . "'&get2='" . $get2 . "'";
    }
    if ($img1 && $img2) {
        if ($get1) {
            $str .= '&';
        }
        $str .= "img1='" . $img1 . "'&img2='" . $img2 . "'";
    }
    if ($content) {
        if ($img1 || $get1) {
            $str .= '&';
        }
        $str .= $content;
    }
    echo $str;

}
?>