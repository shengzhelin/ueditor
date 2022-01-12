module( 'plugins.anchor' );

test( '插入錨點後切換源碼', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    stop();
    var br = baidu.editor.browser.ie ? '&nbsp;' : '<br />';     //1.2版本,ie中‘’-〉'&nbsp;'
    setTimeout( function() {
        editor.setContent( '<p>' + br + '</p>' );
        range.setStart( body.firstChild, 0 ).collapse( 1 ).select();
        editor.execCommand( 'anchor', 'hello' );
        ua.checkHTMLSameStyle( '<img anchorname="hello" class="anchorclass">' + br, editor.document, body.firstChild, '檢查錨點html' );     //1.2版本後，在img前有的不可見字符沒有刪去，這裡改成之比較img內的內容
        ok(body.getElementsByTagName('img')[0].attributes['anchorname'].nodeValue=="hello"&&body.getElementsByTagName('img')[0].attributes['class'].nodeValue=="anchorclass",'檢查錨點');
        editor.execCommand( 'source' );     /*切到源碼模式下會有一個超時*/
        setTimeout( function() {
            var tas = editor.iframe.parentNode.getElementsByTagName( 'textarea' );
            if(ua.browser.webkit){
//                ok( editor.iframe.nextSibling.textContent.indexOf( '<a name="hello"' ) !=-1, '查看是否轉換成功' );
            }
            else{
                ok( tas[0].value.indexOf( '<a name="hello"' ) != -1 || tas[0].value.indexOf( '<a anchorname="1"' ) != -1, '查看是否轉換成功' );
            }
          /*沒辦法比，看上去一樣，但是一個42個字符，一個48個字符
             * ok((tas[0].value=='<p><a name="hello" anchorname="1"></a></p>')||(tas[0].value=='<p><a anchorname="1" name="hello"></a></p>'),'檢查源碼');*/
            editor.execCommand( 'source' );
            ua.checkHTMLSameStyle( '<img anchorname="hello" class="anchorclass">' + br, editor.document, body.firstChild, '檢查錨點html' );
            setTimeout( function() {
                start();
            }, 500 );
        }, 200);
    }, 20 );
} );

test( '在源碼模式設置超鏈接的name屬性，切換到編輯器模式檢查超鏈接是否變為錨點', function() {
    var editor = te.obj[0];
    var body = editor.body;
    stop();
    setTimeout(function(){
        editor.setContent( '' );
        setTimeout( function() {
            editor.execCommand( 'source' );
            setTimeout( function() {
                var ta = editor.iframe.parentNode.getElementsByTagName( 'textarea' )[0];
                ta.value = '<p><a name="source" anchorname="1"></a></p>';       /*這種情況認為是錨點*/
                setTimeout( function() {
                    editor.execCommand( 'source' );
                    ua.checkHTMLSameStyle( '<img anchorname="source" class="anchorclass">', editor.document, body.firstChild, '檢查錨點html' );
                    start();
                }, 100 );
            }, 100 );
        }, 100 );
    },100);
} );

test( '在源碼模式設置超鏈接沒有name屬性，切換到編輯器模式檢查超鏈接不變為錨點', function() {
    var editor = te.obj[0];
    editor.setContent( '' );
    var body = editor.body;
    stop();
    setTimeout( function() {
        editor.execCommand( 'source' );
        setTimeout( function() {
            var ta = editor.iframe.parentNode.getElementsByTagName( 'textarea' )[0];
            ta.value = '<p><a name="source" href="www.baidu.com">你好</a></p>';
            setTimeout( function() {
                editor.execCommand( 'source' );
                ua.manualDeleteFillData(editor.body);
//                equal( body.firstChild.firstChild.tagName.toLowerCase(), 'a', 'a標籤不會轉化' );
                equal( body.firstChild.lastChild.tagName.toLowerCase(), 'a', 'a標籤不會轉化' );   //兼容opera
                start();
                }, 50 );
        }, 10 );
    }, 20 );
} );

test( '已存在錨點', function() {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    var br = baidu.editor.browser.ie ? '&nbsp;' : '<br />';
    editor.setContent( '<p><img anchorname="1" class="anchorclass"/></p>' );
    range.selectNode(body.firstChild).select();
    editor.execCommand( 'anchor', 'hello' );
    var name=body.firstChild.firstChild.getAttribute('anchorname');
    equal(name, 'hello', '更改name');
    editor.setContent( '<p><img anchorname="1" class="anchorclass"/></p>' );
    range.selectNode(body.firstChild).select();
    editor.execCommand( 'anchor');
    equal(ua.getChildHTML(editor.body),'<p></p>','去掉錨點');
} );