module( "plugins.blockquote" );

/*trace 967*/
//這個用例暫不測ie，因為ie中輸入回車無效
//test( '切換到源碼模式再切換回來點引用', function () {
//    if(!ua.browser.ie){
//        var editor = te.obj[0];
//        var body = editor.body;
//        editor.setContent( 'hello' );
//        editor.execCommand( 'source' );
//        var tas = editor.iframe.parentNode.getElementsByTagName( 'textarea' );
//        tas[tas.length - 1].value = '';
//        stop();
//        setTimeout( function () {       //source.js中有延時操作
//            editor.execCommand( 'source' );
//            editor.execCommand( 'blockquote' );
//            setTimeout( function () {       //模擬回車,在引用後回車兩段都是引用
//                //firefox竟然要多觸發一次。。什麽亂七八糟的bug啊
//                //if ( ua.getBrowser() == "firefox" )
//                //te.presskey( "enter", "" );
//                editor.focus();
//                te.presskey( "enter", "" );
//                setTimeout( function () {
//                    editor.focus();
//                    setTimeout( function () {
//                        var bq = body.firstChild;
//                        equal( body.childNodes.length, 1, 'body有1個孩子' );
//                        equal( bq.childNodes.length, 2, 'blockquote有2個孩子' );
//                        ok( bq.childNodes[0]&&bq.childNodes[0].tagName.toLowerCase()=='p', '第一個孩子是p' );
//                        ok(  bq.childNodes[1]&&bq.childNodes[1].tagName.toLowerCase()=='p', '第二個孩子是p' );
//                        start();
//                    }, 50 );
//                }, 30 );
//            }, 60 );
//        }, 50 );
//    }
//    else
//    ok(ua.browser.ie,'這個用例暫不測，因為ie中輸入回車無效');
//} );

test( '在表格中添加和去除引用', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( 'hello<table><tbody><tr><td>hello</td></tr></tbody></table>' );
    var body = editor.body;
    var tds = body.lastChild.getElementsByTagName( 'td' );
    range.setStart( tds[0].firstChild, 2 ).collapse( true ).select();               /*閉合選取*/
    editor.execCommand( 'blockquote' );
    equal( body.lastChild.tagName.toLowerCase(), 'blockquote', '引用加到表格外面去了' );
    equal( tds[0].firstChild.nodeType, 3, 'td里仍然是文本' );
    equal( tds[0].firstChild.data, 'he', 'td里仍然是文本he' );
    range.setStart( tds[0].firstChild, 2 ).collapse( true ).select();
    editor.execCommand( 'blockquote' );         /*再執行一次引用，會去掉引用*/
    ok( body.lastChild.tagName.toLowerCase() != 'blockquote', '引用去掉了' );    //1.2版本table外加了div
    stop();
    setTimeout(function(){
        tds = body.lastChild.getElementsByTagName( 'td' );
        range.selectNode( tds[0] ).select();        /*不閉合選中表格，添加引用*/
        editor.execCommand( 'blockquote' );
        equal( body.lastChild.tagName.toLowerCase(), 'blockquote', '非閉合方式選中添加引用' );
        start();
    },50);
} );

test( '在列表中添加引用', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( 'hello<ol><li><p>hello1</p></li><li><p>hello2</p></li></ol>' );
    var body = editor.body;
    var lis = body.lastChild.getElementsByTagName( 'li' );
    range.setStart( lis[0].firstChild, 1 ).collapse( 1 ).select();      /*閉合選取*/
    editor.execCommand( 'blockquote' );
    equal( body.lastChild.tagName.toLowerCase(), 'blockquote', '引用加到列表外面去了' );
    equal( lis[0].firstChild.nodeType, 1, '列表里套著p' );
    equal( lis[0].firstChild.firstChild.data, 'hello1', '列表里仍然是文本hello1' );
} );

/*trace 1183*/
test( 'trace1183：選中列表中添加引用，再去掉引用', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello1</p><p>hello2</p>' );
    var body = editor.body;
    range.setStart( body, 0 ).setEnd( body, 2 ).select();
    editor.execCommand( 'insertorderedlist' );      /*添加列表*/
    ua.manualDeleteFillData( editor.body );
    var ol = body.getElementsByTagName( 'ol' )[0];
    var html = ua.getChildHTML( ol );

    editor.execCommand( 'blockquote' );
    editor.execCommand( 'blockquote' );
    ua.manualDeleteFillData( editor.body );
    equal( ua.getChildHTML( body.getElementsByTagName( 'ol' )[0] ), html, '引用前後列表沒有發生變化' );
    equal( body.getElementsByTagName( 'ol' ).length, 1, '只有一個有序列表' );
} );

test( 'trace 3298：對段落添加引用和去除引用', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p><strong><em>hello1</em></strong></p><p>hello2  world</p>' );
    var body = editor.body;
    range.setStart( body.firstChild, 0 ).setEnd( body.lastChild, 1 ).select();      /*不閉合添加引用*/
    editor.execCommand( 'blockquote' );
    equal( ua.getChildHTML( body ), '<blockquote><p><strong><em>hello1</em></strong></p><p>hello2 &nbsp;world</p></blockquote>', '不閉合添加引用' );
    equal( editor.queryCommandState( 'blockquote' ), 1, '引用高亮' );

    range.setStart( body.firstChild.lastChild, 0 ).collapse( true ).select();       /*閉合去除引用*/
    editor.execCommand( 'blockquote' );
    equal( ua.getChildHTML( body ), '<blockquote><p><strong><em>hello1</em></strong></p></blockquote><p>hello2 &nbsp;world</p>', '閉合去除引用' );
    equal( editor.queryCommandState( 'blockquote' ), 0, '引用不高亮' );

    range.setStart( body.firstChild, 0 ).setEnd( body.lastChild, 1 ).select();      /*非閉合去除引用*/
    editor.execCommand( 'blockquote' );
    equal( ua.getChildHTML( body ), '<p><strong><em>hello1</em></strong></p><p>hello2 &nbsp;world</p>' );
    equal( editor.queryCommandState( 'blockquote' ), 0, '非閉合去除引用後，引用不高亮' );

    range.setStart( body.lastChild, 0 ).collapse( true ).select();                  /*閉合添加引用*/
    editor.execCommand( 'blockquote' );
    equal( ua.getChildHTML( body ), '<p><strong><em>hello1</em></strong></p><blockquote><p>hello2 &nbsp;world</p></blockquote>', '閉合添加引用 ' );
} );

/*trace 3285*/
test( 'trace 3285：startContainer為body添加引用', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( 'hello<ol><li>hello1</li><li>hello2</li></ol>' );
    var body = editor.body;
    range.setStart( body, 0 ).setEnd( body, 2 ).select();       /*不閉合選取*/
    editor.execCommand( 'blockquote' );
//    var padding  = ua.browser.ie&&ua.browser.ie<9?' style=\" list-paddingleft-2\"':(ua.browser.webkit?' class=\" list-paddingleft-2\"':' style=\" list-paddingleft-2\"');
    var padding  = ' class=\" list-paddingleft-2\"';
    equal( ua.getChildHTML( body ), '<blockquote><p>hello</p><ol'+padding+'><li><p>hello1</p></li><li><p>hello2</p></li></ol></blockquote>', '選中body加引用' );
    equal( editor.queryCommandState( 'blockquote' ), 1, '引用高亮' );
    editor.undoManger.undo();
    range.setStart( body, 1 ).collapse( true ).select();        /*閉合選取*/
    equal( editor.queryCommandState( 'blockquote' ), 0, '引用不高亮' );
} );

//ie 不通過
test('aa標簽',function(){
    var editor = te.obj[0];
    var range = te.obj[1];
    if(!ua.browser.ie){
        editor.setContent('<aa>hello</aa>');
        range.setStart(editor.body.firstChild.firstChild,0).collapse(1).select();
        editor.execCommand('blockquote');
        equal(ua.getChildHTML(editor.body),'<blockquote><aa>hello</aa></blockquote>','aa標簽');
        editor.setContent('hello<aa>hello2</aa>');
        range.setStart(editor.body.lastChild.firstChild,0).setEnd(editor.body.lastChild.firstChild,3).select();
        editor.execCommand('blockquote');
        equal(ua.getChildHTML(editor.body),'<p>hello</p><blockquote><aa>hello2</aa></blockquote>','<aa>');
    }
});

/*trace 3284*/
test('trace 3284：列表內引用',function(){
    var editor = te.obj[0];
    var range = te.obj[1];
//    var padding  = ua.browser.ie&&ua.browser.ie<9?' style=\"padding-left: 30px\"':(ua.browser.webkit?' style=\"padding-left: 30px;\"':' style=\"padding-left: 30px;\"');
    var padding  = ' class=\" list-paddingleft-2\"';
    editor.setContent('<ol><li><blockquote><p>hello1</p></blockquote></li><blockquote><li><p>hello2</p></li></blockquote></ol>');
    range.setStart(editor.body.firstChild.firstChild.firstChild.firstChild,0).setEnd(editor.body.firstChild.lastChild.firstChild.firstChild,6).select();
    editor.execCommand('blockquote');
    equal(ua.getChildHTML(editor.body ),'<ol'+padding+'><li><p>hello1</p></li><li><p>hello2</p></li></ol>','引用刪除');
});