module( "plugins.paragraph" );
/**
 * h1和p之間的轉換
 * 表格中添加p和h1
 * 列表里加h1
 * 傳入2個參數，style和attrs
 */

test( '不閉合h1和p之間的轉換', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello</p>' );
    setTimeout(function(){
    range.selectNode( body.firstChild.firstChild ).select();
    /*p===>h1*/
    editor.execCommand( 'paragraph', 'h1' );
    equal( ua.getChildHTML( body ), '<h1>hello</h1>' );
    equal( editor.queryCommandValue( 'paragraph' ), 'h1', '當前的blcok元素為h1' );
    /*h1===>p*/
    range.selectNode( body.firstChild.firstChild ).select();
    editor.execCommand( 'paragraph', 'p' );
    equal( ua.getChildHTML( body ), '<p>hello</p>' );
    /*多個段落的部分文本*/
    editor.setContent( '<p>hello</p><h2>hello2</h2>' );
        setTimeout(function(){
    range.setStart( body.firstChild.firstChild, 2 ).setEnd( body.lastChild.firstChild, 1 ).select();
    editor.execCommand( 'paragraph', 'h3' );
    equal( ua.getChildHTML( body ), '<h3>hello</h3><h3>hello2</h3>' );
    equal( editor.queryCommandValue( 'paragraph' ), 'h3', '當前的blcok元素為h3' );
        start();
    },50);
    },50);
    stop();
} );

test( '閉合h1和p之間的轉換', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello</p><p>hello2</p>' );
    setTimeout(function(){
    range.setStart( body.firstChild.firstChild, 1 ).collapse( 1 ).select();
    /*p===>h1*/
    editor.execCommand( 'paragraph', 'h1' );
    equal( ua.getChildHTML( body ), '<h1>hello</h1><p>hello2</p>' );
    /*h1===>p*/
    range.setStart( body.firstChild.firstChild, 1 ).collapse( 1 ).select();
    editor.execCommand( 'paragraph', 'p' );
    equal( ua.getChildHTML( body ), '<p>hello</p><p>hello2</p>' );
    equal( editor.queryCommandValue( 'paragraph' ), 'p', '當前的blcok元素為p' );
        start();
    },50);

stop();
} );


/*如果是h1===>p並且傳參的話，h1不會變化。因為這段代碼的操作是為了indent和justify做的，傳入參數p只是為了好處理，所以不支持h1變為p*/
test( '傳入段落的樣式', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello</p><p>hello2</p>' );
    setTimeout(function(){
    range.setStart( body.firstChild.firstChild, 1 ).collapse( 1 ).select();
    /*p===>p，但是變化了樣式*/
    editor.execCommand( 'paragraph', 'p', {style:'text-indent:2em'} );
    equal( body.firstChild.style.textIndent, '2em', '改變了第一個孩子的縮進量' );
    equal( body.firstChild.tagName.toLowerCase(), 'p', 'tagName仍然是p' );

    /*p===>h4，但是變化了樣式*/
    editor.execCommand( 'paragraph', 'h4', {style:'text-indent:3em'} );
    equal( body.firstChild.style['textIndent'], '3em', '改變了第一個孩子的縮進量' );
    equal( body.firstChild.tagName.toLowerCase(), 'h4', 'tagName是h4' );
    start();
},50);

stop();
} );


test( '對表格設置樣式', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<table><tbody><tr><td><h1>hello1</h1></td></tr><tr><td></td></tr></tbody></table>' );
    setTimeout(function(){
    var tds = body.getElementsByTagName( 'td' );
    range.setStart( tds[0].firstChild, 0 ).collapse( 1 ).select();
    editor.currentSelectedArr = [tds[0]];
    /*h4===>p，但是變化了樣式*/
    editor.execCommand( 'paragraph', 'p', {style:'text-indent:3em'} );
    equal( tds[0].firstChild.style['textIndent'], '3em', '改變了第一個孩子的縮進量' );
//    equal( tds[0].firstChild.tagName.toLowerCase(), 'h1', 'tagName仍然是h1' );
    range.setStart( tds[1], 0 ).collapse( 1 ).select();
    editor.currentSelectedArr = [tds[1]];
    editor.execCommand( 'paragraph', 'p', {style:'text-indent:3em'} );
//    ua.manualDeleteFillData( editor.body );
    ua.clearWhiteNode(tds[1]);
    equal( tds[1].firstChild.style['textIndent'], '3em', '改變了第一個孩子的縮進量' );
    equal( tds[1].firstChild.tagName.toLowerCase(), 'p', 'tagName是p' );
        start();
    },50);

    stop();
} );
