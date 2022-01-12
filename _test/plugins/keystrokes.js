/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-10-9
 * Time: 下午6:52
 * To change this template use File | Settings | File Templates.
 */
module( "plugins.keystrokes" );

test('trace 3714跨節點輸入tab鍵',function(){
    var editor = te.obj[0];
    editor.setContent( '<h1>hello<br></h1><p>he<img src="http://img.baidu.com/hi/jx2/j_0015.gif" />oll</p>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart( editor.body.lastChild.firstChild,0 ).setEnd(editor.body.lastChild.firstChild.nextSibling,1).select();
        ua.keydown(editor.body,{'keyCode':9});
        ua.keyup(editor.body,{'keyCode':9});
        setTimeout(function(){
            equal(te.obj[0].undoManger.list.length,1,'');
            var html = '<h1>hello<br></h1><p>&nbsp;&nbsp;&nbsp;&nbsp;oll</p>';
            equal(ua.getChildHTML(te.obj[0].body),html,'跨節點輸入tab鍵');
            start();
        },20);
    },20);
    stop();
});

test('刪除塊元素，塊元素在後',function(){
    var editor = te.obj[0];
    editor.setContent( '<h1>hello<br></h1><h2><img src="http://img.baidu.com/hi/jx2/j_0015.gif" /></h2>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart( editor.body.lastChild.lastChild,0 ).setEnd(editor.body.lastChild.lastChild,1).select();
        ua.keydown(editor.body,{'keyCode':8});
        ua.keyup(editor.body,{'keyCode':8});
        setTimeout(function(){
            equal(te.obj[0].undoManger.index,1,'');
            var html = '<h1>hello<br></h1>';
            if(!ua.browser.opera)
                equal(ua.getChildHTML(te.obj[0].body),html,'刪除塊元素');
            start();
        },20);
    },20);
    stop();
});

test('刪除塊元素，塊元素在前',function(){
    var editor = te.obj[0];
    editor.setContent( '<h2><img src="http://img.baidu.com/hi/jx2/j_0015.gif" /></h2><h1>hello<br></h1>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart( editor.body.firstChild,0 ).setEnd(editor.body.firstChild,1).select();
        ua.keydown(editor.body,{'keyCode':8});
        ua.keyup(editor.body,{'keyCode':8});
        setTimeout(function(){
            equal(te.obj[0].undoManger.index,1,'');
            var html = '<h1>hello<br></h1>';
            equal(ua.getChildHTML(te.obj[0].body),html,'刪除塊元素');
            start();
        },20);
    },20);
    stop();
});

test('trace 2747 普通情況,選中一個節點，輸入tab鍵',function(){
    var editor = te.obj[0];
    editor.setContent( '<h1>hello<br></h1><p>he<img src="http://img.baidu.com/hi/jx2/j_0015.gif" />oll</p>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart( editor.body.lastChild,1 ).setEnd(editor.body.lastChild,2).select();
        ua.keydown(editor.body,{'keyCode':9});
        ua.keyup(editor.body,{'keyCode':9});
        setTimeout(function(){
            equal(te.obj[0].undoManger.list.length,1,'');
            var html = '<h1>hello<br></h1><p>he&nbsp;&nbsp;&nbsp;&nbsp;oll</p>';
            equal(ua.getChildHTML(te.obj[0].body),html,'普通情況，選中一個節點，輸入tab鍵');
            start();
        },20);
    },20);
    stop();
});

test('trace 2746 刪除自閉合標籤',function(){
    var editor = te.obj[0];
    editor.setContent( '<h1>hello<br></h1><p>he<img src="http://img.baidu.com/hi/jx2/j_0015.gif" />oll</p>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart( editor.body.lastChild,1 ).setEnd(editor.body.lastChild,2).select();
        ua.keydown(editor.body,{'keyCode':8});
        ua.keyup(editor.body,{'keyCode':8});
        setTimeout(function(){
            equal(te.obj[0].undoManger.index,1,'');
            var html = '<h1>hello<br></h1><p>heoll</p>';
            equal(ua.getChildHTML(te.obj[0].body),html,'刪除自閉合標籤');
            start();
        },20);
    },20);
    stop();
});

test('全選後，退格，剩下空p',function(){
    var editor = te.obj[0];
    editor.setContent( 'hello' );
    var range = te.obj[1];
    range.selectNode( editor.body.firstChild ).select();
    editor.execCommand( 'bold' );
    editor.execCommand('selectall');
    ua.keydown(editor.body,{'keyCode':8});
    ua.keyup(editor.body,{'keyCode':8});
    stop();
    setTimeout(function(){
        var br = ua.browser.ie?'':'<br>';
        equal(ua.getChildHTML(te.obj[0].body),'<p>'+br+'</p>','全選後，退格，剩下空p');
        start();
    },20);
});
//TODO 1.2.6
//test('針對ff下在列表首行退格，不能刪除空格行的問題 ',function(){
//    if(ua.browser.gecko){
//        var editor = te.obj[0];
//        editor.body.innerHTML = '<p>歡迎使用ueditor!</p><ol style="list-style-type:decimal;"><li><br /></li></ol>';
//        var range = te.obj[1];
//        setTimeout(function(){
//            range.setStartAtFirst(editor.body.firstChild).collapse(true);
//            ua.keyup(te.obj[0].body,{'keyCode':8});
//            setTimeout(function(){
//                equal(ua.getChildHTML(editor.body),'<p>歡迎使用ueditor!</p>','刪除空行 ');
//                start();
//            },20);
//        },20);
//        stop();
//    }
//});

test('在列表中，跨行選中第2，3行，輸入tab鍵',function(){
    var editor = te.obj[0];
    editor.setContent( '<ol style="list-style-type:decimal;"><li><p>歡迎使用</p></li><li><p>ueditor</p></li><li><p>ueditor</p></li></ol>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart( editor.body.childNodes[0].childNodes[1].firstChild.firstChild,1 ).setEnd(editor.body.childNodes[0].childNodes[2].firstChild.firstChild,1 ).select();
        ua.keydown(editor.body,{'keyCode':9});
        ua.keyup(editor.body,{'keyCode':9});
        setTimeout(function(){
            ua.manualDeleteFillData(te.obj[0].body);
            equal(te.obj[0].body.firstChild.tagName.toLowerCase(),'ol','原列表');
            equal($(te.obj[0].body.firstChild).css('list-style-type'),'decimal','原列表類型');
            equal(ua.getChildHTML(te.obj[0].body.firstChild.firstChild),'<p>歡迎使用</p>','第一行保持原來的列表樣式');
            equal(te.obj[0].body.firstChild.lastChild.tagName.toLowerCase(),'ol','後兩行變成第二層列表');
            equal($(te.obj[0].body.firstChild.lastChild).css('list-style-type'),'lower-alpha','第二層列表類型');
            equal(ua.getChildHTML(te.obj[0].body.firstChild.lastChild),'<li><p>ueditor</p></li><li><p>ueditor</p></li>','檢查內容');
            start();
        },20);
    },50);
    stop();
});

//todo 這個檢查存在問題，如何檢查 evt.preventDefault();？
test('在h1內輸入del',function(){
    var editor = te.obj[0];
    editor.setContent( '<h1><br></h1><p>hello</p>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart(editor.body.childNodes[0],0).collapse(true).select(true);
        ua.keydown(te.obj[0].body,{'keyCode':46});
        ua.keyup(te.obj[0].body,{'keyCode':46});
        setTimeout(function(){
            equal(ua.getChildHTML(te.obj[0].body),'<h1><br></h1><p>hello</p>','在h1內輸入del');
            start();
        },20);
    },20);
    stop();
});

test('在列表中，跨行選中，輸入tab鍵',function(){
    var editor = te.obj[0];
    editor.setContent( '<ol style="list-style-type:decimal;"><li><p>歡迎使用</p></li><li><p>ueditor</p></li><li><p>ueditor</p></li></ol>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart( editor.body.firstChild.firstChild.firstChild.firstChild,1 ).setEnd(editor.body.firstChild.childNodes[1].firstChild.firstChild,1 ).select();
        ua.keydown(editor.body,{'keyCode':9});
        ua.keyup(editor.body,{'keyCode':9});
        setTimeout(function(){
            equal(te.obj[0].undoManger.index,1,'undoManger.index');
            ua.manualDeleteFillData(te.obj[0].body);
            equal(te.obj[0].body.firstChild.tagName.toLowerCase(),'ol','外面套了一層ol');
            equal(te.obj[0].body.firstChild.childNodes.length,2,'');
            equal(te.obj[0].body.firstChild.firstChild.tagName.toLowerCase(),'ol','原列表');
            equal($(te.obj[0].body.firstChild).css('list-style-type'),'decimal','原列表類型');
            equal(ua.getChildHTML(te.obj[0].body.firstChild.firstChild),'<li><p>歡迎使用</p></li><li><p>ueditor</p></li>','檢查內容');
            start();
        },20);
    },50);
    stop();
});

test(' 光標定位到列表前，輸入tab鍵',function(){
    var editor = te.obj[0];
    editor.setContent( '<ol style="list-style-type:decimal;"><li><p>歡迎使用</p></li><li><p>ueditor</p></li></ol>' );
    var range = te.obj[1];
    setTimeout(function(){
        range.setStart( editor.body.firstChild.firstChild.firstChild,0 ).collapse(true).select();
        ua.keydown(editor.body,{'keyCode':9});
        ua.keyup(editor.body,{'keyCode':9});
        setTimeout(function(){
            equal(te.obj[0].undoManger.list.length,1,'undoManger.index');
            ua.manualDeleteFillData(te.obj[0].body);
            equal($(te.obj[0].body.firstChild).css('list-style-type'),'decimal','原列表類型');
            equal(te.obj[0].body.firstChild.childNodes.length,2,'列表有兩個子節點');
            equal($(te.obj[0].body.firstChild.firstChild).css('list-style-type'),'lower-alpha','第一個節點是另一類型的列表');
            equal(ua.getChildHTML(te.obj[0].body.firstChild.firstChild),'<li><p>歡迎使用</p></li>','檢查內容');
            equal(te.obj[0].body.firstChild.lastChild.tagName.toLowerCase(),'li','第一個節點是原列表的li');
            equal(ua.getChildHTML(te.obj[0].body.firstChild.lastChild),'<p>ueditor</p>','檢查內容');
            start();
        },20);
    },50);
    stop();
});

test( '刪除inline的標籤', function() {
    var editor = te.obj[0];
    editor.setContent( '<p><strong><em>hello world</em><span>wasai</span></strong></p>' );
    var range = te.obj[1];
    setTimeout(function(){
        var strong = editor.body.firstChild.firstChild;
        range.selectNode( strong ).select();
        ua.keydown(editor.body,{'keyCode':8});
        ua.keyup(editor.body,{'keyCode':8});
        setTimeout(function(){
            ua.manualDeleteFillData( editor.body );
            equal( editor.body.firstChild.tagName.toLowerCase(), 'p', 'strong 以及子inline節點都被刪除' );
            if ( !baidu.editor.browser.ie )
                equal( editor.body.lastChild.innerHTML, '<br>', '內容被刪除了' );
            else
                equal( editor.body.lastChild.innerHTML, '', '內容被刪除了' );
            start();
        },20);
    },20);
    stop();
} );

/*trace 1089*/
test( '跨行選擇2個塊元素', function() {
    var editor = te.obj[0];
    editor.setContent( '<p><strong>hello world<span>wasai</span></strong></p><div><em><span>hello 2</span></em></div>' );
    var range = te.obj[1];
    setTimeout(function(){
        var body = editor.body;
        range.setStart( body.firstChild, 0 ).setEnd( body.lastChild,1 ).select();
        ua.keydown(editor.body,{'keyCode':8});
        ua.keyup(editor.body,{'keyCode':8});
        setTimeout(function(){
            ua.manualDeleteFillData( editor.body );
            range = editor.selection.getRange();
            equal( body.childNodes.length, 1, 'div被刪除，保留p' );
            var br = baidu.editor.browser.ie?"":"<br>";
            equal( ua.getChildHTML( body ), '<p>'+br+'</p>' );
            start();
        },20);
    },20);
    stop();
} );

//test('刪除空節點 ',function(){
//        var editor = te.obj[0];
//        editor.setContent('<p><em><span style="color: red"><br></span></em></p>') ;
//        var range = te.obj[1];
//        setTimeout(function(){
//            range.setStartAtFirst(editor.body.getElementsByTagName('span')[0]).collapse(true).select(true);
//            ua.keyup(te.obj[0].body,{'keyCode':8});
//            setTimeout(function(){
//                var br = ua.browser.ie?'':'<br>';
//                equal(ua.getChildHTML(editor.body),'<p>'+br+'</p>','刪除空節點');
//                start();
//            },20);
//        },20);
//        stop();
//});