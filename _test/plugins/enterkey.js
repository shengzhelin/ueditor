module( 'plugins.enterkey' );
///*
// 閉合選區
// 1.p末尾或中間回車
// 2.列表中回車(關於列表的回車必須加上li這個插件)
// 2.1 列表標號後面有文本
// 2.2列表標號後沒有文本
// 3.h1後回車
// 4.帶有BIU樣式的文本後面回車
//
// 不閉合選區
// 1.選中部分表格後回車
// 2.選中文本後回車
//

// 覆合操作
// 1.回車後撤銷
// */
//fixed in future
/*trace 3174*/
//test( 'trace 2864：table中回車,br做回車', function () {
//    te.dom[0].parentNode.removeChild(te.dom[0]);
//    var div2 = document.body.appendChild( document.createElement( 'div' ) );
//    $( div2 ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
//    te.dom.push(div2);
//    baidu.editor.plugins.table = function(){};
//    var editor = new baidu.editor.Editor({'initialContent':'<p>歡迎使用ueditor</p>','autoFloatEnabled':false,'enterTag':'br'});
//    te.obj.push(editor);
//    editor.render(div2);
//    var range = new baidu.editor.dom.Range( editor.document );
//    te.obj.push(range);
//    editor.setContent(' <table width="100%" border="1" bordercolor="#000000"><tbody><tr><td >aa</td></tbody></table>' );
//    stop();
//    setTimeout(function(){
//        te.obj[4].selectNode(editor.body.firstChild.firstChild.firstChild.firstChild).select();
//        ua.keydown(editor.body,{'keyCode':13});
//        setTimeout(function(){
//            equal(ua.getChildHTML(te.obj[3].body.firstChild),'<tbody><tr><td><br></td></tr></tbody>','<br>做回車');
//            te.dom[1].parentNode.removeChild(te.dom[1]);
//            start();
//        },50);
//    },50);
//} );
//test( 'br做回車,選區非閉合', function () {
//    te.dom[0].parentNode.removeChild(te.dom[0]);
//    var div2 = document.body.appendChild( document.createElement( 'div' ) );
//    $( div2 ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
//    te.dom.push(div2);
//    baidu.editor.plugins.table = function(){};
//    var editor = new baidu.editor.Editor({'initialContent':'<p>歡迎使用ueditor</p>','autoFloatEnabled':false,'enterTag':'br'});
//    te.obj.push(editor);
//    editor.render(div2);
//    stop();
//    editor.ready(function(){
//        var range = new baidu.editor.dom.Range( editor.document );
//        te.obj.push(range);
//        editor.setContent('<p>hello1</p><p>hello2</p>' );
//
//        setTimeout(function(){
//            te.obj[4].setStart(editor.body.firstChild,0).setEnd(editor.body.lastChild,1).select();
//            ua.keydown(editor.body,{'keyCode':13});
//            setTimeout(function(){
//                ua.manualDeleteFillData(te.obj[3].body);
//                var html = 'h<br>lo';
//                equal(ua.getChildHTML(te.obj[3].body.firstChild),html,'<br>做回車');
//                te.dom[1].parentNode.removeChild(te.dom[1]);
//                start();
//            },50);
//        },50);
//    });
//} );

test( 'br做回車,選區非閉合', function () {
    te.dom[0].parentNode.removeChild(te.dom[0]);
    var div2 = document.body.appendChild( document.createElement( 'div' ) );
    $( div2 ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
    te.dom.push(div2);
    baidu.editor.plugins.table = function(){};
    var editor = new baidu.editor.Editor({'initialContent':'<p>歡迎使用ueditor</p>','autoFloatEnabled':false,'enterTag':'br'});
    te.obj.push(editor);
    editor.render(div2);
    stop();
    editor.ready(function(){
        var range = new baidu.editor.dom.Range( editor.document );
        te.obj.push(range);
        editor.setContent('<p>hello</p>' );
        te.obj[4].setStart(editor.body.firstChild.firstChild,1).setEnd(editor.body.firstChild.firstChild,3).select();
        ua.keydown(editor.body,{'keyCode':13});
        setTimeout(function(){
            ua.manualDeleteFillData(te.obj[3].body);
            var html = 'h<br>lo';
            equal(ua.getChildHTML(te.obj[3].body.firstChild),html,'<br>做回車');
            editor.setContent('<h1>hello<br></h1><p><img src="http://img.baidu.com/hi/jx2/j_0015.gif" /><a href="http://www.baidu.com"></a></p>' );
            te.obj[4].setStart( editor.body.lastChild,0 ).setEnd(editor.body.lastChild,1).select();
            ua.keydown(editor.body,{'keyCode':13});
            setTimeout(function(){
                ua.manualDeleteFillData(te.obj[3].body);
                var html = 'hello<br>';
                equal(ua.getChildHTML(te.obj[3].body.firstChild),html,'<br>做回車');
                editor.setContent('<h1>hello<br></h1><p>he<img src="http://img.baidu.com/hi/jx2/j_0015.gif" />oll</p>' );
                te.obj[4].setStart( editor.body.lastChild,1 ).setEnd(editor.body.lastChild,2).select();
                ua.keydown(editor.body,{'keyCode':13});
                setTimeout(function(){
                    ua.manualDeleteFillData(te.obj[3].body);
                    var html = 'hello<br>';
                    equal(ua.getChildHTML(te.obj[3].body.firstChild),html,'<br>做回車');
                    editor.setContent('<h1>hello<br></h1><p><img src="http://img.baidu.com/hi/jx2/j_0015.gif" /><br></p>' );
                    te.obj[4].setStart( editor.body.lastChild,0 ).setEnd(editor.body.lastChild,1).select();
                    ua.keydown(editor.body,{'keyCode':13});
                    setTimeout(function(){
                        ua.manualDeleteFillData(te.obj[3].body);
                        var html = 'hello<br>';
                        equal(ua.getChildHTML(te.obj[3].body.firstChild),html,'<br>做回車');
                        editor.setContent('<h1>hello<br></h1><p><img src="http://img.baidu.com/hi/jx2/j_0015.gif" /><a href="http://www.baidu.com">www.baidu.com</a></p>' );
                        te.obj[4].setStart( editor.body.lastChild,0 ).setEnd(editor.body.lastChild,1).select();
                        ua.keydown(editor.body,{'keyCode':13});
                        setTimeout(function(){
                            ua.manualDeleteFillData(te.obj[3].body);
                            var html = 'hello<br>';
                            equal(ua.getChildHTML(te.obj[3].body.firstChild),html,'<br>做回車');
                            te.dom[1].parentNode.removeChild(te.dom[1]);
                            start();
                        },20);
                    },20);
                },20);
            },20);
        },20);
    });
} );

test( 'br做回車，選區閉合', function () {
    te.dom[0].parentNode.removeChild(te.dom[0]);
    var div2 = document.body.appendChild( document.createElement( 'div' ) );
    $( div2 ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
    te.dom.push(div2);
    baidu.editor.plugins.table = function(){};
    var editor = new baidu.editor.Editor({'initialContent':'<p>歡迎使用ueditor</p>','autoFloatEnabled':false,'enterTag':'br'});
    te.obj.push(editor);
    editor.render(div2);
    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        te.obj.push(range);
        editor.setContent('<p>hello</p>');

        setTimeout(function () {
            te.obj[4].setStart(editor.body.firstChild.firstChild, 1).collapse(true).select();
            ua.keydown(editor.body, {'keyCode':13});
            setTimeout(function () {
                ua.manualDeleteFillData(te.obj[3].body);
                var html = 'h<br>ello';
                equal(ua.getChildHTML(te.obj[3].body.firstChild), html, '<br>做回車，選區閉合');
                te.dom[1].parentNode.removeChild(te.dom[1]);
                start();
            }, 50);
        }, 50);
    });
} );

test( 'br做回車，選區閉合,在節點尾部輸入回車，要插入2個br', function () {
    te.dom[0].parentNode.removeChild(te.dom[0]);
    var div2 = document.body.appendChild( document.createElement( 'div' ) );
    $(div2).css('width', '500px').css('height', '500px').css('border', '1px solid #ccc');
    te.dom.push(div2);
    baidu.editor.plugins.table = function () {
    };
    var editor = new baidu.editor.Editor({'initialContent':'<p>歡迎使用ueditor</p>', 'autoFloatEnabled':false, 'enterTag':'br'});
    te.obj.push(editor);
    editor.render(div2);
    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        te.obj.push(range);
        editor.setContent('<p>hello</p>');
        setTimeout(function () {
            te.obj[4].setStart(editor.body.firstChild.firstChild, 5).collapse(true).select();
            ua.keydown(editor.body, {'keyCode':13});
            setTimeout(function () {
                ua.manualDeleteFillData(te.obj[3].body);
                var html = 'hello<br><br>';
                equal(ua.getChildHTML(te.obj[3].body.firstChild), html, '<br>做回車，選區閉合,在節點尾部輸入回車');
                te.dom[1].parentNode.removeChild(te.dom[1]);
                start();
            }, 50);
        }, 50);
    });
});

test( 'table首行中回車', function () {
    var editor = te.obj[0];
    if(!ua.browser.ie){
        var range = new baidu.editor.dom.Range( editor.document );
        editor.setContent(' <table width="100%" border="1" bordercolor="#000000"><tbody><tr><td ><br /></td></tr></tbody></table>' );
        range.selectNode(editor.body.firstChild.firstChild.firstChild.firstChild).select();
        ua.keydown(editor.body,{'keyCode':13});
        stop();
        setTimeout(function(){
            equal(ua.getChildHTML(te.obj[0].body.firstChild),'<br>','加入p');//opera中，由原生方法實現p標簽
            start();
        },20);
    }
} );

test( '去除_moz_dirty', function () {
    if(browser.gecko){
        var editor = te.obj[0];
        var range = te.obj[1];
        editor.setContent( '<strong>迎使</strong><em  _moz_dirty=""><strong  _moz_dirty="">用ued</strong>it</em>' );
        range.selectNode(editor.body.firstChild.lastChild.firstChild).select();
        ua.keydown(editor.body,{'keyCode':13});
        setTimeout( function () {
            equal(ua.getChildHTML(editor.body),'<p><strong>迎使</strong><em><strong>用ued</strong>it</em></p>','');
            start();
        }, 20 );
        stop();
    }
} );

///*不作處理chrome會產生div*/
test( 'chrome刪除div', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    if(ua.browser.webkit){
        editor.body.innerHTML = '<h1>一級標題</h1><div><br/></div>';
        range.setStart( body.firstChild.firstChild, 4 ).collapse( 1 ).select();
        ua.keydown(editor.body,{'keyCode':13});
        range.selectNode(body.lastChild.firstChild).select();
        var index = editor.undoManger.index;
        var br = ua.browser.ie ? '' : '<br>';
        ua.keyup(editor.body,{'keyCode':13});
        equal(editor.undoManger.list.length,2,'保存現場');
        setTimeout( function () {
            equal( body.childNodes.length, 2, '2個子節點' );
            equal(body.lastChild.tagName.toLowerCase(),'p','div轉成p');
            equal(ua.getChildHTML(body),'<h1>一級標題</h1><p><br></p>','檢查內容');
            start();
        }, 60 );
        stop();
    }else{
    }
} );
test( 'formatBlock', function () {
    if(ua.browser.ie)return; //這個處理不針對ie
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<table><tbody><tr><td>  hello1</td><td ></td></tr><tr><td >hello2</td><td ></td></tr></tbody></table>' );
    setTimeout( function () {
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0],1).collapse(true).select();
    ua.keydown(editor.body,{'keyCode':13});
    setTimeout( function () {
    ua.keyup(editor.body,{'keyCode':13});
        setTimeout( function () {
            var td = editor.body.getElementsByTagName('td')[0];
            equal(td.firstChild&&td.firstChild.tagName.toLowerCase(),'p','加上p');
            equal(td.firstChild.innerHTML,'hello1','hello1');
            start();
        }, 60 );
    }, 60 );
    }, 60 );
    stop();
} );
test( '跨td不刪', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<table><tbody><tr><td>  hello1</td><td ></td></tr><tr><td >hello2</td><td ></td></tr></tbody></table>' );
    editor.addListener("keydown", function (type, evt) {
        setTimeout( function () {
            ok(evt.defaultPrevented||!evt.returnValue, "keydown");
            start();
        }, 60 );
    });
    setTimeout(function () {
        var tds = editor.body.getElementsByTagName('td');
        range.setStart(tds[0], 0).setEnd(tds[2], 1).select();
        ua.keydown(editor.body, {'keyCode': 13});
    }, 60);
    stop();
} );
////presskey相關，先不測
//test( '普通文本<strong><span style="color: red">中間</span></strong>回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<p>你好編輯器</p>' );
//    range.setStart( body.firstChild.firstChild, 2 ).collapse( 1 ).select();
//    editor.focus();
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
//            var ps = body.childNodes;
//            equal( ps.length, 2, '2個p' );
//            equal( ps[0].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ps[1].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ua.getChildHTML( ps[0] ), '你好', '第一個p里是你好' );
//            equal( ua.getChildHTML( ps[1] ), '編輯器', '第一個p里是編輯器' );
//            start();
//        }, 30 );
//    }, 100 );
//    stop();
//} );
//
//test( '普通文本<strong><span style="color: red">末尾</span></strong>回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<p>你好編輯器</p>' );
//    range.setStart( body.firstChild, 1 ).collapse( 1 ).select();
//    editor.focus();
//    var br = (ua.browser.ie) ? '' : '<br>';
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        ua.keydown( body );
//        editor.focus();
//        setTimeout( function () {
//            var ps = body.childNodes;
//            equal( ps.length, 2, '2個p' );
//            equal( ps[0].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ps[1].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ua.getChildHTML( ps[0] ), '你好編輯器', '第一個p里是你好編輯器' );
//            equal( ua.getChildHTML( ps[1] ), br, '第一個p里是br' );
//            start();
//        }, 60 );
//    }, 100 );
//    stop();
//} );
//
// //不好檢查
//test( 'table中回車', function () {
//    var div2 = document.body.appendChild( document.createElement( 'div' ) );
//    $( div2 ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
//    baidu.editor.plugins.table = function(){};
//    var editor = new baidu.editor.Editor({'initialContent':'<p>歡迎使用ueditor</p>','autoFloatEnabled':false});
//    editor.render(div2);
//    stop();
//    setTimeout(function(){
//        var range = new baidu.editor.dom.Range( editor.document );
//        var body = editor.body;
//        editor.setContent(' <table width="100%" border="1" bordercolor="#000000"><tbody><tr><td ><br /></td><td ><br /></td></tr><tr><td ><br /></td><td ><br /></td></tr></tbody></table>' );
//        var tds = editor.body.getElementsByTagName( 'td' );
//        tds[0].innerHTML = 'hello';
//        tds[1].innerHTML = 'hello';
//        tds[2].innerHTML = 'hello';
//        range.setStart( tds[0].firstChild, 0 ).setEnd(tds[2].lastChild,1).select();
//        var re = ua.keydown(editor.body,{'keyCode':13});
//        setTimeout(function(){
//            start();
//        },20);
//    },20);
//} );
///*不作處理chrome會產生div*/
//test( 'trace766 :<strong><span style="color: red">H1</span></strong>回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<h1><span style="color:red">一級標題</span></h1>' );
//
//    range.setStart( body.firstChild, 1 ).collapse( 1 ).select();
//    editor.focus();
//    var br = ua.browser.ie ? '' : '<br>';
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
//
//            var tagName = body.lastChild.tagName.toLowerCase();
//            ok( tagName == 'p' || tagName == 'h1', '回車後不會產生div' );
//            equal( body.childNodes.length, 2, '2個子節點' );
//            start();
//        }, 60 );
//    }, 100 );
//    stop();
//} );
//
//
//test( 'trace 1382:<strong><span style="color: red">空列表標號後</span></strong>回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<ol><li></li></ol>' );
//    var li = body.getElementsByTagName( 'li' )[0];
//    range.setStart( li, 0 ).collapse( 1 ).select();
//    editor.focus();
//    var br = ua.browser.ie ? '' : '<br>';
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
//            var ol = body.getElementsByTagName( 'ol' );
//            equal( ol.length, 0, '列表被刪除了' );
//            start();
//        }, 100 );
//    }, 100 );
//    stop();
//} );
//
//test( '<strong><span style="color: red">列表有內容處</span></strong>回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<ol><li>列表1</li><li>列表2</li></ol>' );
//    var lis = body.getElementsByTagName( 'li' );
//    range.setStart( lis[1].firstChild, 1 ).collapse( 1 ).select();
//    editor.focus();
//    var br = ua.browser.ie ? '' : '<br>';
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
//            var ol = body.getElementsByTagName( 'ol' )[0];
//            lis = ol.childNodes;
//            equal( lis.length, 3, '3個li' );
//            for ( var index = 0; index < lis.length; index++ )
//                equal( lis[index].tagName.toLowerCase(), 'li', 'tag名為li' );
//            equal( ua.getChildHTML( lis[1] ), '<p>列表2</p>', '第二個列表自動加了p' );
//            equal( ua.getChildHTML( lis[2] ), '<p>' + br + '</p>', '新增了一個列表項' );
//            start();
//        }, 70 );
//    }, 100 );
//    stop();
//} );
//
//
//test( 'trace766 :<strong><span style="color: red">BIU文本中間</span></strong>回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<p><span style="color:red"><em><strong>有樣式的文本</strong></em></span></p>' );
//
//    var str = body.getElementsByTagName( 'strong' )[0];
//    range.setStart( str.firstChild, 2 ).collapse( 1 ).select();
//    editor.focus();
//    var br = ua.browser.ie ? '' : '<br>';
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
////           ua.checkHTMLSameStyle( '<span style="color:red"><em><strong>有樣​</strong></em></span>', editor.document, body.firstChild, '查看第1個p的內容' );
//            //1.2版本中，回車/空格只後有不可見的字符，ua.checkHTMLSameStyle檢查的話，<strong>的內容不好檢查，即<strong>會多出一個子節點，改成如下：
//            baidu.editor.dom.domUtils.removeDirtyAttr( body.lastChild );
//            if ( ua.browser.chrome ) {
//                equal( body.firstChild.innerHTML.toLowerCase(), '<span style=\"color:red\"><em><strong>有樣​</strong></em></span>', '查看第1個p的內容' );
//                ua.checkHTMLSameStyle( '<span  style="color:red"><em><strong>式的文本</strong></em></span>', editor.document, body.lastChild, '查看第2個p的內容' );
//            }
//            else if ( ua.browser.gecko ) {
//                equal( body.firstChild.innerHTML.toLowerCase(), '<span style=\"color: red;\"><em><strong>有樣</strong></em></span>', '查看第1個p的內容' );
//                equal( body.lastChild.innerHTML, '<span style=\"color:red\"><em><strong>​式的文本</strong></em></span>', '查看第2個p的內容' );
//            }
//            else {
//                equal( body.firstChild.innerHTML.toLowerCase(), '<span style=\"color: red\"><em><strong>有樣​</strong></em></span>', '查看第1個p的內容' );
//                ua.checkHTMLSameStyle( '<span  style="color:red"><em><strong>式的文本</strong></em></span>', editor.document, body.lastChild, '查看第2個p的內容' );
//            }
//            start();
//        }, 70 );
//    }, 100 );
//    stop();
//} );
//
//test( 'trace841  :<strong><span style="color: red">BIU文本後面</span></strong>回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<p><span style="color:red"><em><strong>有樣式的文本</strong></em></span></p>' );
//    var strong = body.getElementsByTagName( 'strong' )[0];
////    range.setStart( strong.firstChild, 6 ).collapse( 1 ).select();
//    range.setStart( strong, 1 ).collapse( 1 ).select();
//    editor.focus();
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
//            ua.keydown( body, {keyCode:13} );
//            baidu.editor.dom.domUtils.removeDirtyAttr( body.lastChild );
////            ua.checkHTMLSameStyle( '<span style="color:red"><em><strong>有樣​</strong></em></span>', editor.document, body.firstChild, '查看第1個p的內容' );
//            //1.2版本中，回車/空格只後有不可見的字符，ua.checkHTMLSameStyle檢查的話，<strong>的內容不好檢查，即<strong>會多出一個子節點，而且每種瀏覽器的具體結果不同，改成如下：
//            if ( ua.browser.chrome )
//                equal( body.firstChild.innerHTML.toLowerCase(), '<span style=\"color:red\"><em><strong>有樣式的文本​</strong></em></span>', '查看第1個p的內容' );
//            else if ( ua.browser.gecko )
//                equal( body.firstChild.innerHTML.toLowerCase(), '<span style=\"color: red;\"><em><strong>有樣式的文本</strong></em></span>', '查看第1個p的內容' );
//            else
//                equal( body.firstChild.innerHTML.toLowerCase(), '<span style=\"color: red\"><em><strong>有樣式的文本​</strong></em></span>', '查看第1個p的內容' );
//            /*ie中有一個已知bug，trace841，暫時不修的*/
//            var br = ua.browser.gecko ? '' : '<br>';
//            if ( !ua.browser.ie ) {
//                /*firefox不知道為什麽用程序的方式回車始終不會產生br，可能太快了，瀏覽器沒來得及處理*/
//                if ( ua.browser.gecko )
//                    equal( body.lastChild.innerHTML, '<span style=\"color:red\"><em><strong>​</strong></em></span>', '查看第2個p的內容' );
//                else
//                    ua.checkHTMLSameStyle( '<span style="color:red"><em><strong>' + br + '</strong></em></span>', editor.document, body.lastChild, '查看第2個p的內容' );
//            }
//            start();
//        }, 500 );
//    }, 100 );
//    stop();
//} );
//
//
//test( '<strong><span style="color: red">不閉合選擇</span></strong>普通文本回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<p>普通文本回車</p>' );
//    range.setStart( body.firstChild.firstChild, 2 ).setEnd( body.firstChild.firstChild, 4 ).select();
//    editor.focus();
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
//            var ps = body.childNodes;
//            equal( ps.length, 2, '2個p' );
//            equal( ps[0].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ps[1].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ua.getChildHTML( ps[0] ), '普通', '第一個p里是你好編輯器' );
//            equal( ua.getChildHTML( ps[1] ), '回車', '第2個p里是br' );
//            start();
//        }, 60 );
//    }, 100 );
//    stop();
//} );
//
//test( '<strong><span style="color: red">不閉合選擇</span></strong>段落回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<p>不閉合選擇兩個段落1</p><p>不閉合選擇兩個段落2</p>' );
//    range.setStart( body.firstChild.firstChild, 3 ).setEnd( body.lastChild.firstChild, 5 ).select();
//    editor.focus();
//    var br = ua.browser.ie ? '' : '<br>';
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
//            var ps = body.childNodes;
//            equal( ps.length, 2, '2個p' );
//            equal( ps[0].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ps[1].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ua.getChildHTML( ps[0] ), '不閉合', '第一個p里是你好編輯器' );
//            equal( ua.getChildHTML( ps[1] ), '兩個段落2', '第一個p里是br' );
//            start();
//        }, 60 );
//    }, 100 );
//    stop();
//} );
//
//
//test( '撤銷<strong><span style="color: red">回車不閉合刪除</span></strong>段落', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<p>不閉合選擇兩個段落1</p><p>不閉合選擇兩個段落2</p>' );
//    range.setStart( body.firstChild.firstChild, 3 ).setEnd( body.lastChild.firstChild, 5 ).select();
//    editor.focus();
//    var br = ua.browser.ie ? '' : '<br>';
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        editor.focus();
//        setTimeout( function () {
//            var ps = body.childNodes;
//            equal( ps.length, 2, '2個p' );
//            equal( ps[0].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ps[1].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ua.getChildHTML( ps[0] ), '不閉合', '第一個p里是你好編輯器' );
//            equal( ua.getChildHTML( ps[1] ), '兩個段落2', '第一個p里是br' );
//            editor.undoManger.undo();
//            equal( ps.length, 2, '2個p' );
//            equal( ps[0].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ps[1].tagName.toLowerCase(), 'p', 'tag名為p' );
//            equal( ua.getChildHTML( ps[0] ), '不閉合選擇兩個段落1', '第一個p里是你好編輯器' );
//            equal( ua.getChildHTML( ps[1] ), '不閉合選擇兩個段落2', '第一個p里是br' );
//            start();
//        }, 60 );
//    }, 100 );
//    stop();
//} );
//
///*1723 ie 在源碼中寫<ol><li></li></ol>，自動變成<ol><li><p><br></p></li></ol>，在ie中<br>會導致undo操作多記了一步*/
//test( '撤銷<strong><span style="color: red">回車刪除空列表</span></strong>', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<ol><li></li></ol>' );
//    var li = body.getElementsByTagName( 'li' )[0];
//    range.setStart( li.firstChild, 0 ).collapse( 1 ).select();
//    editor.focus();
//
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        /*好像用程序控制按回車的速度會比程序捕獲的速度快，
//         所以程序還沒反應過來時keydown已經觸發完了，
//         而keydown中用於進行場景保存的，這樣就會導致undo操作失效*/
//        ua.keydown( body );
//        editor.focus();
//        setTimeout( function () {
//            var ol = body.getElementsByTagName( 'ol' );
//            equal( ol.length, 0, '列表被刪除了' );
//            setTimeout( function () {
//                editor.undoManger.undo();
//                equal( ua.getChildHTML( body ), '<ol><li><p><br></p></li></ol>', '撤銷刪除列表' );
//                start();
//            }, 50 );
//
//        }, 150 );
//    }, 100 );
//    stop();
//} );
//
//test( '撤銷<strong><span style="color: red">列表中的</span></strong>回車', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<ol><li>列表</li></ol>' );
//    var li = body.getElementsByTagName( 'li' )[0];
//    range.setStart( li.firstChild, 1 ).collapse( 1 ).select();
//    editor.focus();
//    var br = ua.browser.ie ? '' : '<br>';
//
//    setTimeout( function () {
//        te.presskey( "enter", "" );
//        ua.keydown( body );
//        editor.focus();
//        setTimeout( function () {
//            var li = body.getElementsByTagName( 'li' );
//            equal( li.length, 2, '2個列表子項' );
//            equal( ua.getChildHTML( li[0] ), '<p>列表</p>' );
//            equal( ua.getChildHTML( li[1] ), '<p>' + br + '</p>' );
//            editor.undoManger.undo();
//            equal( ua.getChildHTML( body ), '<ol><li><p>列表</p></li></ol>', '撤銷後列表恢覆原狀' );
//            start();
//        }, 250 );
//    }, 100 );
//    stop();
//} );