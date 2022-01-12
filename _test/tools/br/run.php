<?php
header( "Content-type: text/html; charset=utf-8" );
header( "Cache-Control: no-cache, max-age=10, must-revalidate" );
if ( !array_key_exists( 'quirk' , $_GET ) ) {
    print '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
}
;
require_once "case.class.php";
$c = new Kiss( '../../../' , $_GET[ 'case' ] );
$title = $c->name;
$cov = array_key_exists( 'cov' , $_GET );
?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title><?php print( "run case $title" );?></title>
    <?php $c->print_js( $cov ); ?>
</head>
<body>
<h1 id="qunit-header"><?php print( $c->name );?></h1>

<h2 id="qunit-banner"></h2>

<h2 id="qunit-userAgent"></h2>
<ol id="qunit-tests"></ol>
<script type="text/javascript">
    /**捕獲所有頁面的異常，當有異常時如果是關於用例執行完畢還有對editor的調用這種情況，一律忽略，其他照常拋異常**/
    window.onerror = function( e ) {
        msg1 = "Uncaught TypeError: Cannot call method 'select' of null";
        msg2 = "Uncaught TypeError: Cannot call method 'getSelection' of undefined";
        msg3 = "'sourceEditor' 為空或不是對象";
        msg4 = "未指明的錯誤。";
        if ( e != msg1 && e != msg2 && e.indexOf( msg3 ) < 0 && e != msg4 ) {
//            throw new Error( e );
        } else {
            return true;
        }
    };
</script>
<div>
    <object id="plugin" type="application/x-plugintest" width="1" height="1">
        <param name="onload" value="pluginLoaded"/>
    </object>
</div>
</body>
</html>