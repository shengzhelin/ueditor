<?php
header( "Content-type: text/html; charset=utf-8" );
//被測&統計概率的部分
$filter = array_key_exists( 'filter' , $_GET ) ? $_GET[ 'filter' ] : '*';
//跑的用例
$filterRun = array_key_exists( 'filterRun' , $_GET ) ? $_GET[ 'filterRun' ] : $filter;
$quirk = array_key_exists( 'quirk' , $_GET );
if ( !$quirk ) {
    ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <?php } ?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Ueditor Test Index Page</title>
    <script type="text/javascript" src="js/jquery-1.5.1.js"></script>
    <script type="text/javascript" src="js/testrunner.js"></script>
    <script type="text/javascript" src="js/tools.js"></script>
    <script type="text/javascript" src="js/UserAction.js"></script>
    <script type="text/javascript" src="js/run.js"></script>
    <!--    <script type="text/javascript" src="js/log4js.js"></script>-->
    <link media="screen" href="css/tangramtest.css" type="text/css"
          rel="stylesheet"/>
</head>
<body>
<div id="title">
    <h1>Ueditor Test Index Page</h1>

    <p>
        <a href="http://ueditor.baidu.com">ueditor</a>
    </p>
</div>

<!--瀏覽器插件，可調用windows api-->
<div>
    <object id="plugin" type="application/x-plugintest" width="1" height="1">
        <param name="onload" value="pluginLoaded"/>
    </object>
</div>

<div id="id_control" class="control">
    <input id="id_control_runnext" type="checkbox"/>自動下一個<input
        id="id_control_breakonerror" type="checkbox"/>出錯時終止<input
        id="id_control_clearstatus" type="button" value="清除用例狀態"
        onclick="$('.testlist a').removeClass('running_case pass_case fail_case');"/>
</div>
<div>
    <a id="id_testlist_status" class="button"> <span
            onclick="$('div#id_testlist').slideToggle('slow');"> 折疊用例 </span> </a>
    <a id="id_srconly" class="button"><span
            onclick="$('#id_showSrcOnly').slideToggle('slow');">折疊缺失</span> </a>
    <a id="id_srconly" class="button"><span
            onclick="$('#id_runningarea').slideToggle('slow');">折疊執行</span> </a>
</div>
<div id="id_rerun" onclick="run($('#id_rerun').html());return false;"></div>
<div style="clear: both"></div>
<div id="id_testlist" class="testlist">
<?php
    /*分析所有源碼與測試代碼js文件一一對應的文件並追加到當前列表中*/
    require_once "case.class.php";
    Kiss::listcase( $filter ,$filterRun );
    ?>
    <div style="clear: both; overflow: hidden"></div>
</div>
<div id="id_runningarea" class="runningarea"
     style="border: solid; display: none"></div>
<div id="id_reportarea" class="reportarea" style="display: none;"></div>
<div class='clear'></div>
<div id="id_showSrcOnly" class="testlist" style="display: none;">
<?php
    require_once "case.class.php";
    //if(array_key_exists("showsrconly", $_GET))
    Kiss::listSrcOnly( true );
    ?>
    <div class="clear"></div>
</div>
</body>
</html>
