module('plugins.source');
//test('初始化進入源碼模式',function(){
//    if(ua.browser.ie>0 && ua.browser.ie<8)
//        return 0;
//    var div = document.createElement('div');
//    document.body.appendChild(div);
//    div.id = 'e';
//    var editor = UE.getEditor('e');//,{sourceEditorFirst:true}
//    stop();
////    editor.ready(function(){
////        setTimeout(function(){
//////            equal(editor.queryCommandState('source'),1,'源碼高亮');
////            equal(editor.queryCommandState('bold'),-1,'加粗灰色');
////////            start();
////        },100);
////    });
//});
test('chrome刪除後切換源碼再切換回來，光標沒了', function () {
    //opera 取不到range值
    if (ua.browser.opera) return 0;
    var editor = te.obj[0];
    var div = te.dom[0];
    editor.render(div);
    editor.setContent('hello');
    var range = editor.selection.getRange();
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('cleardoc');
    stop();
    expect(2);
    //source 包含超時操作，ie下必須有同步操作，否則會報錯
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            start();
        }, 20);
    }, 20);
    range = editor.selection.getRange();
    equal(range.startContainer.nodeType, 1, '光標定位在p里');
    equal(range.startContainer.tagName.toLowerCase(), 'p', 'startContainer為p');
    te.dom.push(div);
});
//TODO 1.2.6
/*trace 986*/
//test( '切換源碼，視頻地址被添加了網站前綴', function () {
//    if ( !ua.browser.ie ) {
//        var editor = te.obj[0];
//        var range = te.obj[1];
//        editor.setContent( '<p><br></p>' );
//        setTimeout(function(){
//            range.setStart( editor.body.firstChild, 0 ).collapse( 1 ).select();
//            /*涉及到video的一些特殊處理，因此直接設置編輯器的html不是很可行，所以這裡用了video這個插件*/
//            editor.execCommand( 'insertvideo', {url:'www.baidu.com'} );
//            setTimeout( function () {
//                editor.execCommand( 'source' );
//                range.setStart( editor.body.firstChild, 0 ).collapse( 1 ).select();
//                setTimeout( function () {
//                    editor.execCommand( 'source' );
//                    start();
//                }, 50 );
//            }, 50 );
//
//            var img = editor.document.getElementsByTagName( 'img' )[0];
//            equal( $( img ).attr( '_url' ), 'www.baidu.com', '檢查超鏈接前是否添加了網站的路徑' );
//        },50);
//        stop();
//    }
//    else
//        ok( true, 'ie里加了視頻節點embed,在節點embed後加bookmark會出錯' );
//} );

//trace 852
test('切換源碼，源碼中多處空行', function () {
    var editor = te.obj[0];
    editor.setContent('<p>hello<a href="http://www.baidu.com/">baidu</a></p>');
    stop();
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            setTimeout(function () {
                var html = editor.getContent();
                equal(html, '<p>hello<a href="http://www.baidu.com/">baidu</a></p>');
                start();
            }, 100);
        }, 100);
    }, 100);

    //    var html = '<p>\nhello<a href="http://www.baidu.com/">\n\tbaidu\n</a>\n</p>';
    //無奈的驗證，有不可見字符
    //多余不可見字符的的bug已經修改了，現在用例字符串長度：53

    // ok(html.length>=58&&html.length<=60,'切換源碼不會多空行');
});

/*trace 710*/
test('設置源碼內容沒有p標籤，切換源碼後會自動添加', function () {
    var editor = te.obj[0];
    editor.setContent('<strong><em>helloworld你好啊</em></strong>大家好，<strong><i>你在幹嘛呢</i></strong><em><strong>。謝謝，不用謝</strong></em>~~%199<p>hello</p>');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            setTimeout(function () {
                editor.execCommand('source');
                setTimeout(function () {
                    var childs = editor.body.childNodes;
                    ok(childs.length, 3, '3個p');
                    for (var index = 0; index < 3; index++) {
                        equal(childs[0].tagName.toLowerCase(), 'p', '第' + index + '個孩子為p');
                    }
                    start();
                }, 100);
            }, 100);
        }, 100);
    }, 100);
    stop();
});

test('切換源碼去掉空的span', function () {
    var editor = te.obj[0];
    editor.setContent('<p>切換源碼<span>去掉空的span</span></p>');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            start();
        }, 100);
    }, 100);
    stop();
    equal(editor.getContent(), '<p>切換源碼去掉空的span</p>');
});

test('b,i標籤，切換源碼後自動轉換成strong和em', function () {
    var editor = te.obj[0];
    editor.setContent('<p><b>加粗的內容</b><i>斜體的內容<b>加粗且斜體</b></i></p>');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            start();
        }, 100);
    }, 100);
    stop();
    equal(editor.getContent(), '<p><strong>加粗的內容</strong><em>斜體的內容<strong>加粗且斜體</strong></em></p>');
});

test(' trace 3739 trace 1734 range的更新/特殊符號的轉換', function () {
    var editor = te.obj[0];
    editor.setContent('<p>"<></p>');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            equal(editor.getContent(), '<p>&quot;&lt;&gt;</p>');
            editor.setContent("<p>'<img src='http://nsclick.baidu.com/u.gif?&asdf=\"sdf&asdfasdfs;asdf'></p>");
//            var range = te.obj[1];
//            range.setStart(editor.body.firstChild,0).collapse(1).select();
            setTimeout(function () {
//                var label = ua.browser.gecko ? 'html' : 'body';
//                var label = 'html';
                ua.manualDeleteFillData(editor.body);
                var sc = (ua.browser.ie==11)?editor.selection.getRange().startContainer.parentNode.tagName.toLowerCase():editor.selection.getRange().startContainer.parentNode.parentNode.tagName.toLowerCase();
                equal(sc, 'html', 'range的更新');
                editor.execCommand('source');
                setTimeout(function () {
                    editor.execCommand('source');
                    equal(editor.getContent(), "<p>&#39;<img src=\"http://nsclick.baidu.com/u.gif?&asdf=&quot;sdf&asdfasdfs;asdf\"/></p>");
                    start();
                }, 100);
            }, 100);
        }, 100);
    }, 100);
    stop();
});

/*trace 1234 */
test('默認插入的占位符', function () {
    var editor = te.obj[0];
    editor.setContent('');
    equal(editor.getContent(), '');
});

test('插入分頁符,源碼中顯示：_baidu_page_break_tag_', function () {
    var editor = te.obj[0];
        var range = te.obj[1];
        editor.setContent('<p><br /></p>');
        setTimeout(function () {
            range.setStart(editor.body.firstChild, 0).collapse(1).select();
            editor.execCommand('pagebreak');
            ua.manualDeleteFillData(editor.body);
            var pagebreak = editor.body.getElementsByTagName('hr')[0];

            if (typeof pagebreak.attributes['class'] == "undefined") {
                equal(pagebreak.getAttribute('class'), 'pagebreak', 'pagebreak');
            }
            else {//適用於ie6,7
                equal(pagebreak.attributes['class'].nodeValue, 'pagebreak', 'pagebreak');
            }
            ua.manualDeleteFillData(editor.body);
//        var br = baidu.editor.browser.ie ? '&nbsp;' : '<br />';
            ok(editor.getContent().indexOf('_ueditor_page_break_tag_') >= 0, 'pagebreak被解析');
//        equal( editor.getContent(), '<p>' + br + '</p>_baidu_page_break_tag_<p>' + br + '</p>' );
            start();
        }, 200);
    stop();
});
//TODO 1.2.6
//test( 'trace 1977 1949 插入代碼,源碼中對應的標籤是pre', function () {
//    var div = document.body.appendChild( document.createElement( 'div' ) );
//    $( div ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
//    var editor = te.obj[2];
//    editor.render(div);
//    var range = new baidu.editor.dom.Range( editor.document );
//    var body = editor.body;
//    stop();
//    setTimeout(function(){
//        editor.setContent( '<p><br></p>' );
//        range.setStart( body.firstChild, 0 ).collapse( 1 ).select();
//        editor.execCommand( 'highlightcode', '<a href="http://net.tutsplus.com" class="logo">Nettuts+</a>', 'html' );
//        ua.manualDeleteFillData( editor.body );
//
//        var td_gutter = body.getElementsByTagName( 'td' )[0];
//        var td_code = body.getElementsByTagName( 'td' )[1];
//        equal( body.getElementsByTagName( 'td' ).length, 2, '顯示代碼的table分兩列' );
//        if(td_gutter!=''){
//            if ( typeof td_gutter.attributes['class'] == "undefined" ) {
//                equal( td_gutter.getAttribute( 'class' ), 'gutter', '第一列class=gutter' );
//                equal( td_code.getAttribute( 'class' ), 'code', '第一列class=code' );
//            }
//            else {//適用於ie6,7
//                equal( td_gutter.attributes['class'].nodeValue, 'gutter', '第一列class=gutter' );
//                equal( td_code.attributes['class'].nodeValue, 'code', '第一列class=code' );
//            }
//            equal( editor.getContent().substring( 0, 119 ), '<pre class=\"brush: html;toolbar:false;\" >&lt;a href=\"http://net.tutsplus.com\" class=\"logo\"&gt;Nettuts+&lt;/a&gt; </pre>' );
//            //highlightcode空格問題
////            equal( editor.getContent().substring( 0, 116 ), '<pre class=\"brush:html;toolbar:false;\" >&lt;a href=\"http://net.tutsplus.com\" class=\"logo\"&gt;Nettuts+&lt;/a&gt;</pre>' );
//            te.dom.push( div );
//        }
//        start();
//    },50);
//} );

test('不以http://開頭的超鏈接絕對路徑網址', function () {
    if (ua.browser.ie == 9)return 0;//TODO 1.2.6
    var editor = te.obj[0];
    editor.setContent('<p><a href="www.baidu.com">絕對路徑網址</a></p>');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            equal(editor.getContent(), '<p><a href="www.baidu.com">絕對路徑網址</a></p>');
            start();
        }, 100);
    }, 100);
    stop();
});

test('trace 1727:插入超鏈接後再插入空格，空格不能被刪除', function () {
    var editor = te.obj[0];
    editor.setContent('<p> <a href="http://www.baidu.com/">絕對路徑網址</a>  ddd</p>');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            equal(editor.body.innerHTML.toLowerCase(), '<p><a href="http://www.baidu.com/" _href=\"http://www.baidu.com/\">絕對路徑網址</a> &nbsp;ddd</p>', '查看空格是否被刪除');
            start();
        }, 100);
    }, 100);
    stop();
});
//TODO 1.2.6 空style未刪除
//test( '關於空格的問題', function () {
//    var editor = te.obj[0];
//    var html = '<ol>   <li> dd jj </li> <li> ll kdkd <a href = "http://www.baidu.com/"> baidu </a> </li> </ol>';
//    editor.setContent( html );
//    setTimeout(function(){
//        editor.execCommand( 'source' );
//        setTimeout( function () {
//            editor.execCommand( 'source' );
//            setTimeout( function () {
//                ua.manualDeleteFillData( editor.body );
//                equal( editor.body.innerHTML.toLowerCase().replace(/[\r\n\t]/g,''), '<ol class=\" list-paddingleft-2\"><li><p>dd&nbsp;jj</p></li><li><p>ll&nbsp;kdkd<a href="http://www.baidu.com/" >&nbsp;baidu&nbsp;</a></p></li></ol>' );
//                start();
//            }, 150 );
//        }, 100 );
//    },20);
//    stop();
//} );
//TODO 1.2.6
//test('初始化進入源碼模式',function(){
//    if(ua.browser.ie>0 && ua.browser.ie<8)
//        return 0;
//    var div = document.createElement('div');
//    document.body.appendChild(div);
//    var editor = UE.getEditor(div);//,{sourceEditorFirst:true}
//    stop();
//    editor.ready(function(){
//        setTimeout(function(){
////            equal(editor.queryCommandState('source'),1,'源碼高亮');
//            equal(editor.queryCommandState('bold'),-1,'加粗灰色');
//////            start();
//        },100);
//    });
//});

test('在font,b,i標籤中輸入，會自動轉換標籤 ', function () {
//    if(!ua.browser.gecko){
    var editor = te.obj[0];
    editor.body.innerHTML = '<p><font size="3" color="red"><b><i>x</i></b></font></p>';
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            equal(editor.body.firstChild.firstChild.tagName.toLowerCase(), 'span', 'font轉換成span');
            if (ua.browser.gecko || ua.browser.ie)
                equal($(editor.body.firstChild.firstChild).css('font-size'), '16px', '檢查style');
            else
                equal($(editor.body.firstChild.firstChild).css('font-size'), '16px', '檢查style');
            var EMstyle = $(editor.body.firstChild.firstChild).css('color');
            ok(EMstyle == 'rgb(255, 0, 0)' || EMstyle == 'red' || EMstyle == '#ff0000', '檢查style');
            equal(ua.getChildHTML(editor.body.firstChild.firstChild), '<strong><em>x</em></strong>', 'b轉成strong,i轉成em ');
            start();
        }, 20);
    }, 20);
    stop();
//    }
});

test('trace 3334:img和a之間不會產生多余空格', function () {
    var editor = te.obj[0];
    editor.setContent('<p><img src="http://img.baidu.com/hi/jx2/j_0001.gif" /><a href="http://www.baidu.com">http://www.baidu.com</a></p>');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            setTimeout(function () {
                editor.execCommand('source');
                ua.manualDeleteFillData(editor.body);
                var html = '<p><img src="http://img.baidu.com/hi/jx2/j_0001.gif" _src=\"http://img.baidu.com/hi/jx2/j_0001.gif\"><a href=\"http://www.baidu.com\" _href=\"http://www.baidu.com\">http://www.baidu.com</a></p>';
                ua.checkSameHtml(editor.body.innerHTML.toLowerCase(), html, '查看img和a之間是否會產生多余空格');
                start();
            }, 20);
        }, 20);
    }, 20);
    stop();
});

test('trace 3334:table中td不會產生多余空格', function () {
    if(ua.browser.ie)return ;//todo 1.3.0
    var editor = te.obj[0];
    editor.execCommand('inserttable');
    var br = ua.browser.ie ? '' : '<br>';
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            ua.manualDeleteFillData(editor.body);
            equal(editor.body.getElementsByTagName('table').length, 1, '有1個table');
            equal(editor.body.getElementsByTagName('tr').length, 5, '有5個tr');
            equal(editor.body.getElementsByTagName('td').length, 25, '有25個td');
            equal(editor.body.getElementsByTagName('td')[12].innerHTML, br, '不會產生多余空格');
            start();
        }, 20);
    }, 20);
    stop();
});

test('trace 3349：帶顏色的span切到源碼再切回，不會丟失span', function () {
    var editor = te.obj[0];
    editor.setContent('<p><span style="color: rgb(255, 0, 0);"></span><br></p>');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            ua.checkSameHtml(editor.body.innerHTML, '<p><span style="color: rgb(255, 0, 0);"></span><br></p>');
            start();
        }, 20);
    }, 20);
    stop();
});