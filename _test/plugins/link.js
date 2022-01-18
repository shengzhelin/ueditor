module( "plugins.link" );

/*trace 879*/
test( '同時去多個超鏈接', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p><a href="http://www.baidu.com/">hello</a>first<a href="http://www.google.com/">second</a></p><p>third<a href="http://www.sina.com/">sina</a></p><table><tbody><tr><td><a href="http://www.baidu.com/">baidu</a></td></tr></tbody></table>' );
    stop();
    setTimeout(function () {
    range.selectNode( editor.body ).select();
    editor.execCommand( 'unlink' );
    equal( editor.body.firstChild.innerHTML, 'hellofirstsecond', '第一段去掉超鏈接' );
    equal( editor.body.firstChild.nextSibling.innerHTML, 'thirdsina', '第二段去掉超鏈接' );
    equal( editor.body.lastChild.getElementsByTagName( 'td' )[0].innerHTML, 'baidu', '表格內的超鏈接被去掉' );
        start();
    }, 100);
} );

test( '光標閉合且沒有超鏈接', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello</p>' );
    range.setStart( editor.body.firstChild, 0 ).collapse( 1 ).select();
    editor.execCommand( 'unlink' );
    equal( ua.getChildHTML( editor.body ), '<p>hello</p>', '沒有超鏈接什麽都不做' );
} );

/*trace 833*/
test( '在超鏈接前加一個超鏈接', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello<a href="http://www.baidu.com/">baidu</a></p>' );
    range.selectNode( editor.body.firstChild.firstChild ).select();
    editor.execCommand( 'link', {href:'http://www.google.com/'} );
    ua.manualDeleteFillData( editor.body );
    ua.checkSameHtml( editor.getContent(), '<p><a href="http://www.google.com/" >hello</a><a href="http://www.baidu.com/" >baidu</a></p>');
} );

/*trace 798*/
test( '給圖片添加超鏈接', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p><img  style="width: 200px;height: 200px" src="http://ueditor.baidu.com/img/logo.png">hello</p>' );
    range.selectNode( editor.body.firstChild.firstChild ).select();
    editor.execCommand( 'link', {href:'http://www.baidu.com/'} );
    var html = '<a  href="http://www.baidu.com/" ><img  src="http://ueditor.baidu.com/img/logo.png" _src=\"http://ueditor.baidu.com/img/logo.png" style="width: 200px;height: 200px" ></a>hello';
    ua.checkHTMLSameStyle( html, editor.document, editor.body.firstChild, '給圖片添加超鏈接' );
//    equal(html,editor.body.firstChild.innerHTML);
} );

/*trace 758
 *並不是真的選中所有單元格，是假選
 * 先設置startContainer和endContainer為第一個單元格中的文本或占位符
 * 再在editor的currentSelectedArr設置當前選中的內容，使得看上去是選中了所有的td*/
test( '選中多個單元格插入超鏈接', function () {
    if(ua.browser.ie>8)return ;//TODO 1.2.6
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<table><tbody><tr><td></td><td></td></tr><tr><td>hello</td></tr></tbody></table>' );
    setTimeout(function(){
        var trs = editor.body.firstChild.getElementsByTagName( 'tr' );
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0],trs[1].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart( trs[0].cells[0], 0 ).collapse( true ).select();

        editor.execCommand( 'link', {href:'http://www.baidu.com/'} );
        var br = ua.browser.ie ? '' : '<br>';
        equal( ua.getChildHTML( trs[0].cells[0] ), '<a href="http://www.baidu.com/">http://www.baidu.com/</a>'+(ua.browser.ie>8?' ':br), '第一個單元格中插入超鏈接' );//原來空單元格的br不去掉
        equal( ua.getChildHTML( trs[0].cells[1] ), br, '第二個單元格中未插入超鏈接' );
        equal( ua.getChildHTML( trs[1].cells[0] ), '<a href="http://www.baidu.com/">hello</a>', '第三個單元格中插入超鏈接' );
        start();
    },50);
    stop();
} );

test( '去除表格中的鏈接', function () {
    if(ua.browser.ie>8)return ;//TODO 1.2.6
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<table><tbody><tr><td></td><td></td></tr><tr><td colspan="2">hello</td></tr></tbody></table>' );
    setTimeout(function(){
        var trs = editor.body.firstChild.getElementsByTagName( 'tr' );
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0],trs[1].cells[0]);
        ut.setSelected(cellsRange);
        range.setStart( trs[0].cells[0], 0 ).collapse( true ).select();

        editor.execCommand( 'link', {href:'http://www.baidu.com/'} );
        var br = ua.browser.ie ? '' : '<br>';
        equal( editor.queryCommandValue( 'link' ), trs[0].cells[0].firstChild, '查詢多個單元格的command value為a' );
        editor.execCommand( 'unlink' );
        equal( ua.getChildHTML( trs[0].cells[0] ), 'http://www.baidu.com/'+(ua.browser.ie>8?' ':br), '第一個單元格中插入超鏈接' );
        equal( ua.getChildHTML( trs[0].cells[1] ), br, '第二個單元格中未插入超鏈接' );
        equal( ua.getChildHTML( trs[1].cells[0] ), 'hello', '第三個單元格中插入超鏈接' );
        equal( editor.queryCommandValue( 'link' ), null, '查詢多個單元格的command value為null' );
        start();
    },50);
    stop();
} );

/*1.2.5+不支持此功能*/
//test( 'trace 1728 去除鏈接--表格第一個單元格沒有超鏈接', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent( '<table><tbody><tr><td></td><td><a href="www.google.com">google</a></td></tbody></table>' );
//    var body = editor.body;
//    var tds = body.firstChild.getElementsByTagName( 'td' );
//    range.selectNode( body.firstChild ).select();
//    editor.currentSelectedArr = [tds[0], tds[1]];
//    editor.execCommand( 'unlink' );
//    if ( UE.browser.ie )
//        equal( tds[0].childNodes.length, 1, '第一個表格中有一個占位文本節點' );
//    range = editor.selection.getRange();
//    tds = body.firstChild.getElementsByTagName( 'td' );
//    equal( ua.getChildHTML( tds[1] ), 'google', 'a標簽被刪除' );
//    if ( UE.browser.gecko )
//        ua.checkResult( range, tds[0], tds[0], 0, 0, true, 'check unlink result' );
//    else if(UE.browser.opera)
//        ua.checkResult( range, tds[0].firstChild, tds[0].firstChild, 0, 0, true, 'check unlink result' );
//    else{
//        ua.checkResult( range, tds[0].firstChild, tds[0].firstChild, 1, 1, true, 'check unlink result' );
//    }
//    var br = ua.browser.ie ? '' : "<br>";
//    ua.manualDeleteFillData( tds[0] );
//    equal( ua.getChildHTML( tds[0] ), br, 'td 1 is empty' );
//} );

test( '添加鏈接--表格第一個單元格沒有超鏈接', function () {
    if(!ua.browser.ie){//TODO 1.2.6
        var editor = te.obj[0];
        var range = te.obj[1];
        editor.setContent( '<table><tbody><tr><td></td><td><a href="www.google.com">google</a></td></tbody></table>' );
        setTimeout(function(){
            var trs = editor.body.firstChild.getElementsByTagName( 'tr' );
            var ut = editor.getUETable(editor.body.firstChild);
            var cellsRange = ut.getCellsRange(trs[0].cells[0],trs[0].cells[1]);
            ut.setSelected(cellsRange);
//        range.setStart( trs[0].cells[0], 0 ).collapse( true ).select();
//        range.selectNode( body.firstChild ).select();
//        var tds = body.firstChild.getElementsByTagName( 'td' );
//        editor.currentSelectedArr = [tds[0], tds[1]];
            editor.execCommand( 'link', {href:'www.baidu.com'} );
            range = editor.selection.getRange();
            equal( ua.getChildHTML( trs[0].cells[1] ), '<a href="www.baidu.com">google</a>', 'a標簽的地址被修改了' );
            var br = ua.browser.ie ? '' : '<br>';
            equal( ua.getChildHTML( trs[0].cells[0] ), '<a href="www.baidu.com">www.baidu.com</a>'+br, 'td 1 被添加了超鏈接' );
            if ( (!baidu.editor.browser.gecko)&&(!baidu.editor.browser.webkit))
                ua.checkResult( range, trs[0].cells[0].firstChild.firstChild, trs[0].cells[0].firstChild.firstChild, 0, 0, true, 'check link result' );
            else
                ua.checkResult( range, trs[0].cells[0].firstChild, trs[0].cells[0].firstChild, 0, 0, true, 'check link result' );
            start();
        },50);
        stop();
    }
} );

test( '光標在超鏈接中間去除超鏈接', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p><a href="www.google.com">hello</a></p>' );
    var a_text = editor.body.getElementsByTagName( 'a' )[0].firstChild;
    range.setStart( a_text, 2 ).collapse( 1 ).select();
    same( editor.queryCommandValue( 'link' ), editor.body.firstChild.firstChild, 'command value is a' );
    editor.execCommand( 'unlink' );
    equal( ua.getChildHTML( editor.body ), '<p>hello</p>', '去除超鏈接後' );
    equal( editor.queryCommandState( 'unlink' ), -1, 'link state is -1' );
} );

test( '去除鏈接--選中區域包含超鏈接和非超鏈接', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello</p><p>hello2<a href="www.fanfou.com">famfou</a>hello3</p>' );
    var body = editor.body;
    range.setStart( body.firstChild, 0 ).setEnd( body.lastChild, 3 ).select();
    equal( editor.queryCommandValue( 'link' ), body.lastChild.firstChild.nextSibling, 'queryCommandvalue' );
} );

/*trace 1111*/
test( '插入超鏈接', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello</p>' );
    range.setStart( editor.body.firstChild, 1 ).collapse( 1 ).select();
    editor.execCommand( 'link', {href:'www.baidu.com'} );
    var a = editor.body.getElementsByTagName( 'a' )[0];
    range.selectNode( a ).select();
    range = editor.selection.getRange();
    same( editor.queryCommandValue( 'link' ), a, 'link value is a' );
    equal( ua.getChildHTML( editor.body ), '<p>hello<a href="www.baidu.com">www.baidu.com</a></p>' );
    equal( editor.queryCommandState( 'unlink' ), 0, 'link state is 0' );
} );

test( '對現有的超鏈接修改超鏈接地址', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p><a href="http://www.baidu.com">http://www.baidu.com</a>hello<a href="www.google.com">google</a></p>' );
    var a1 = body.firstChild.firstChild;
    range.selectNode( a1 ).select();

    editor.execCommand( 'link', {href:'ueditor.baidu.com'} );
    a1 = body.firstChild.firstChild;
    equal( a1.getAttribute( 'href' ), 'ueditor.baidu.com', 'check href' );
    equal( a1.innerHTML, 'ueditor.baidu.com', 'innerHTML也相應變化' );

    var a2 = body.firstChild.getElementsByTagName( 'a' )[1];
    range.selectNode( a2 ).select();
    editor.execCommand( 'link', {href:'mp3.baidu.com'} );
    a2 = body.firstChild.getElementsByTagName( 'a' )[1];

    equal( a2.getAttribute( 'href' ), 'mp3.baidu.com', 'check href for second a link' );
    equal( a2.innerHTML, 'google', 'innerHTML不變' );
} );


