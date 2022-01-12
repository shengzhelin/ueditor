module( "plugins.removeformat" );

/*trace 860*/
test( 'trace 860:對包含超鏈接的段落清除樣式', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p><span style="color:red">hello</span><a href="http://www.baidu.com/" style="font-size: 16pt;">baidu</a></p>' );
    range.setStart( editor.body.firstChild.firstChild.nextSibling.firstChild, 2 ).collapse( true ).select();
    editor.execCommand( 'removeformat' );
    equal( editor.getContent(), '<p>hello<a href="http://www.baidu.com/">baidu</a></p>', '對包含超鏈接的段落去除樣式' );
} );

/*trace 800*/
test( 'trace 800:清除超鏈接的顏色', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
//    var editor = te.obj[2];
//    var div = document.body.appendChild( document.createElement( 'div' ) );
//    $( div ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
//    editor.render(div);
//    stop();
//    setTimeout(function(){
//        var range = new baidu.editor.dom.Range( te.obj[2].document );
        editor.setContent('<a href="http://www.baidu.com/">baidu</a>');
        range.selectNode(editor.body.firstChild).select();
        editor.execCommand( 'forecolor', 'rgb(255,0,0)' );
        var html = '<a href="http://www.baidu.com/" _href=\"http://www.baidu.com/\" style="color: rgb(255, 0, 0); text-decoration: underline;"><span style="color: rgb(255, 0, 0);">baidu</span></a>';
        ua.checkHTMLSameStyle( html, editor.document, editor.body.firstChild, '查看加了顏色後超鏈接的樣式' );
        editor.execCommand( 'removeformat' );
        var cl = ua.browser.ie && ua.browser.ie == 8 ? 'class=\"\"' : "";
        html = '<a href="http://www.baidu.com/" _href=\"http://www.baidu.com/\">baidu</a>';
        if(!ua.browser.ie)//TODO 1.2.6
            ua.checkHTMLSameStyle( html, editor.document, editor.body.firstChild, '查看清除樣式後超鏈接的樣式' );
//        div.parentNode.removeChild(div);
//        start();
//    },500);
} );

test( '清除顏色的區域有多個inline元素嵌套', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p><em><strong>hello1</strong></em></p><p><strong><em>hello2</em></strong></p>' );
    var strs = body.getElementsByTagName( 'strong' );
    range.setStart( strs[0].firstChild, 2 ).setEnd( strs[1].firstChild.firstChild, 3 ).select();
    editor.execCommand( 'removeformat' );
    equal( ua.getChildHTML( body ), '<p><em><strong>he</strong></em>llo1</p><p>hel<strong><em>lo2</em></strong></p>' );
} );

test( '指定刪除某一個style', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p><span style="color:red;font-size: 18px"><em><strong>hello1</strong></em></span></p><p><strong><span style="color:red;font-size: 18px">hello2</span></strong></p>' );
    var strs = body.getElementsByTagName( 'strong' );
    range.setStart( strs[0].firstChild, 2 ).setEnd( strs[1].firstChild.firstChild, 3 ).select();
    /*只刪除span的color style*/
    editor.execCommand( 'removeformat', 'span', 'color' );
    var html = '<p><span style="color:red;font-size: 18px"><em><strong>he</strong></em></span><span style="font-size: 18px"><em><strong>llo1</strong></em></span></p><p><strong><span style="font-size: 18px">hel</span></strong><strong><span style="color:red;font-size: 18px">lo2</span></strong></p>';
    ua.checkHTMLSameStyle( html, editor.document, body, '檢查去除特定標籤的樣式的結果' );
} );

test( '指定刪除的元素刪除屬性後是空元素', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p><span style="color:blue;"></span>hello2<span style="color:red;font-size: 12px"></span></p>' );
    range.setStart( body.firstChild, 0 ).collapse( 1 ).select();
    editor.execCommand( 'removeformat', 'span', 'color' );
    ua.checkHTMLSameStyle('hello2<span style="font-size: 12px"></span>',editor.document,body.firstChild,'清除span corlor');
} );

test( '閉合方式清除樣式', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p><span><em><strong>hello1</strong></em></span></p><p><strong><em>hello2</em></strong></p>' );
    range.setStart( body.firstChild.firstChild, 0 ).collapse( 1 ).select();
    editor.execCommand( 'removeformat' );
    equal( ua.getChildHTML( body ), '<p>hello1</p><p><strong><em>hello2</em></strong></p>' );
} );

//TODO 1.2.6 fixed in future
//test( 'trace 3294：移除表格中的樣式', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent( '<table><tbody><tr><td><span>表格文本1</span></td><td><em>表格文本2</em></td></tr></tbody></table>' );
//    var trs = editor.body.firstChild.getElementsByTagName( 'tr' );
//    var ut = editor.getUETable(editor.body.firstChild);
//    var cellsRange = ut.getCellsRange(trs[0].cells[0],trs[0].cells[1]);
//    ut.setSelected(cellsRange);
//    range.setStart( trs[0].cells[0], 0 ).collapse( true ).select();
//    editor.execCommand( 'removeformat' );
//    equal( ua.getChildHTML( trs[0].cells[0] ), '表格文本1', '第一個表格的span被清除了' );
//    equal( ua.getChildHTML( trs[0].cells[1] ), '表格文本2', '第二個表格的span被清除了' );
//} );

