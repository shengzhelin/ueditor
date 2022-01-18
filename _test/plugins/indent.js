module( 'plugins.indent' );

/*trace 1030*/
test( '同時加縮進和段前距', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>hello1</p><p>hello2</p>');
    /*selectNode不能直接選body，否則在ff下回冒到外面去了，一直回冒到外面的html上去了*/
//    range.selectNode( editor.body ).select();
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).setEnd(editor.body.lastChild, 1).select();
        editor.execCommand('rowspacing', 15, 'top');
        editor.execCommand('indent');
//    stop()

        equal(editor.body.firstChild.style['textIndent'], '2em', '查看縮進量');
        equal(editor.queryCommandValue('rowspacing', 'top'), 15, '查詢段前距');
        start();
    }, 50);
    stop();
} );

test( 'trace1241--首行縮進的狀態反射', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<h1>hello1</h1>' );
    setTimeout(function(){
        range.setStart( editor.body.firstChild, 1 ).collapse( 1 ).select();
        equal( editor.queryCommandState( 'indent' ), 0, '開始沒有縮進' );
        editor.execCommand( 'indent' );
        equal( editor.queryCommandState( 'indent' ), 1, '有縮進' );
        editor.execCommand( 'indent' );
        equal( editor.queryCommandState( 'indent' ), 0, '沒有縮進' );
        start();
    },50);
    stop();
} );

/*trace 1031*/
test( '縮進後再h1', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello1</p><p>hello2</p>' );
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).setEnd(editor.body.lastChild, 1).select();
        editor.execCommand('indent');
        editor.execCommand('paragraph', 'h1');
        equal(editor.queryCommandValue('paragraph'), 'h1', '段落格式為h1');
        equal(editor.body.firstChild.style['textIndent'], '2em', '查看縮進量');
        start();
    }, 50);
    stop();
} );


test( '先設h1再縮進', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello1</p><p>hello2</p>' );
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).setEnd(editor.body.lastChild, 1).select();
        editor.execCommand('paragraph', 'h1');
        editor.execCommand('indent');
        equal(editor.queryCommandValue('paragraph'), 'h1', '段落格式為h1');
        equal(editor.body.firstChild.style['textIndent'], '2em', '查看縮進量');
        start();
    }, 50);
    stop();
} );
/*trace 1479 首行縮進按鈕功能有效*/
test('trace 1479 首行縮進按鈕功能有效',function(){
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>hello</p>');
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).collapse(true).select();
        editor.execCommand('indent');
        equal(editor.body.firstChild.style['textIndent'], '2em', '選擇文字，首行縮進');//text-indent:2em
        equal(editor.queryCommandState('indent'), 1, '縮進按鈕高亮');
        start();
    }, 50);
    stop();
});
/*trace 1516 選Heading格式的文字首行縮進按鈕高亮*/
test('trace 1516 選Heading格式的文字首行縮進按鈕高亮',function(){
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<h1>hello</h1>' );
    setTimeout(function(){
        range.setStart(editor.body.firstChild,0).collapse(true).select();
        editor.execCommand( 'indent' );
        equal(editor.body.firstChild.style['textIndent'], '2em', '選Heading格式的文字首行縮進');//text-indent:2em
        equal(editor.queryCommandState('indent'), 1, '縮進按鈕高亮');
        start();
    },50);
    stop();
});
test( '先對齊方式再縮進', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello1</p><p>hello2</p>' );
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).setEnd(editor.body.lastChild, 1).select();
        editor.execCommand('justify', 'right');
        editor.execCommand('indent');
        equal(editor.queryCommandValue('justify'), 'right', '段落格式為h1');
        equal(editor.body.firstChild.style['textIndent'], '2em', '查看縮進量');
        start();
    }, 50);
    stop();
} );

test( '先縮進再對齊方式', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello1</p><p>hello2</p>' );
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).setEnd(editor.body.lastChild, 1).select();
        editor.execCommand('indent');
        editor.execCommand('justify', 'right');
        equal(editor.queryCommandValue('justify'), 'right', '段落格式為h1');
        equal(editor.body.firstChild.style['textIndent'], '2em', '查看縮進量');
        start();
    }, 50);
    stop();
} );

/*trace 1033*/
test( '非閉合取消縮進', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>hello1</p><p>hello2</p>');
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).setEnd(editor.body.lastChild, 1).select();
        editor.execCommand('indent');
        equal(editor.body.firstChild.style['textIndent'], '2em', '查看縮進量');
        editor.execCommand('indent');
        equal(editor.body.firstChild.style['textIndent'], '0em', '查看縮進量');
        start();
    }, 50);
    stop();
} );

test( '閉合取消縮進', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello1</p><p>hello2</p>' );
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).setEnd(editor.body.lastChild, 1).select();
        editor.execCommand('indent');
        equal(editor.body.firstChild.style['textIndent'], '2em', '查看縮進量');
        range.setStart(editor.body.firstChild, 0).collapse(true).select();
        ua.manualDeleteFillData(editor.body);
        editor.execCommand('indent');
        equal(editor.body.firstChild.style['textIndent'], '0em', '查看縮進量');
        start();
    }, 50);
    stop();
} );

//test( '表格內閉合縮進和取消縮進', function() {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent( '<table><tbody><tr><td></td><td></td></tr><tr><td><p>hello</p></td><td></td></tr></tbody></table>' );
//    var tds = editor.body.firstChild.getElementsByTagName( 'td' );
//    range.setStart( tds[0], 0 ).collapse( true ).select();
//    editor.execCommand( 'indent' );
//    ua.manualDeleteFillData( editor.body );
//    equal( tds[0].firstChild.tagName.toLowerCase(), 'p', '插入一個p標簽' );
//    equal( tds[0].firstChild.style['textIndent'], '2em', '查看縮進量' );
//    range.setStart( tds[0].firstChild, 0 ).collapse( true ).select();
//    te.presskey( '', 'h' );
//    setTimeout( function() {
//        equal( tds[0].firstChild.style['textIndent'], '2em', '插入文本節點後查看縮進量' );
//        range.setStart( tds[0].firstChild, 0 ).collapse( true ).select();
//        editor.execCommand( 'indent' );
//        ua.manualDeleteFillData( editor.body );
//        equal( tds[0].firstChild.style['textIndent'], '0em', '取消縮進' );
//        /*選中一個單元格設置縮進*/
//        range.selectNode( tds[2] ).select();
//        editor.execCommand( 'indent' );
//        ua.manualDeleteFillData( editor.body );
//        equal( tds[2].firstChild.style['textIndent'], '2em', '查看縮進量' );
//        start();
//    }, 30 );
//    stop();
//} );

test( '多個單元格縮進和取消縮進', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<table><tbody><tr><td>hello1</td><td>hello2<img /></td></tr><tr><td><div>hello3</div></td><td><p>hello4</p></td></tr></tbody></table>' );
    setTimeout(function () {
        var tds = editor.body.firstChild.getElementsByTagName('td');
        range.selectNode(editor.body.firstChild).select();
        editor.execCommand('indent');
        ua.manualDeleteFillData(editor.body);
        /*會自動在非block元素外面套p*/
        equal(tds[0].firstChild.tagName.toLowerCase(), 'p', '插入一個p標簽');
        for (var index = 0; index < tds.length; index++) {
            equal(tds[index].firstChild.style['textIndent'], '2em', '查看第' + (index + 1) + '個單元格的縮進量');
        }
        range.selectNode(editor.body.firstChild).select();
        editor.execCommand('indent');
        for (index = 0; index < tds.length; index++) {
            equal(tds[index].firstChild.style['textIndent'], '0em', '查看第' + (index + 1) + '個單元格的縮進是否被取消');
        }
        start();
    }, 50);
    stop();
} );

/*trace 1097*/
test( '列表中縮進', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<ul><li>nihao</li><li>hello</li></ul>' );
    setTimeout(function () {
        range.setStart(editor.body.firstChild.firstChild, 0).collapse(true).select();
        editor.execCommand('indent');
        var p = editor.body.firstChild.firstChild.firstChild;
        equal(p.tagName.toLowerCase(), 'p', '自動創建一個p');
        equal(p.style['textIndent'], '2em', '設置縮進為2em');
        /*在有文本的列表中縮進*/
        range.setStart(editor.body.firstChild.lastChild.firstChild, 1).collapse(true).select();
        editor.execCommand('indent');
        p = editor.body.firstChild.lastChild.firstChild;
        equal(p.tagName.toLowerCase(), 'p', '自動創建一個p');
        equal(p.style['textIndent'], '2em', '設置縮進為2em');
        start();
    }, 50);
    stop();
} )