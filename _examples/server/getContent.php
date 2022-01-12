<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<script src="../../ueditor.parse.js" type="text/javascript"></script>
<script>
    uParse('.content',{
        'rootPath': '../'
    })

</script>
<?php
    //獲取數據
    error_reporting(E_ERROR|E_WARNING);
    $content =  htmlspecialchars(stripslashes($_POST['myEditor']));


    //存入數據庫或者其他操作

    //顯示
    echo "第1個編輯器的值";
    echo  "<div class='content'>".htmlspecialchars_decode($content)."</div>";
