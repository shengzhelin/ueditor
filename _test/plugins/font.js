module("plugins.font");

//test('stop',function(){stop();});
test('trace1583:applyInlineStyle--MergeToParent', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    stop();
    setTimeout(function () {
        editor.setContent('<p>1<span style="font-size: 24px; ">23456<span style="font-size: 16px; ">7</span></span><span style="font-size: 16px; ">89</span>10</p>');
        range.setStart(editor.body.firstChild, 0).setEnd(editor.body.firstChild, 4).select();
        editor.execCommand('fontsize', '24px');
        var html = '<span style=\"font-size: 24px;\">12345678910</span>';
        ua.checkSameHtml(editor.body.firstChild.innerHTML.toLowerCase(), html, '');
        start();
    }, 50);

});
test('trace 3337：字符邊框', function () {

    if (ua.browser.opera)return;
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('fontborder');
    range = editor.selection.getRange();
    range.insertNode(editor.document.createTextNode('hello'));
    ua.manualDeleteFillData(editor.body);
    var br = baidu.editor.browser.ie ? '&nbsp;' : '<br>';
    if (ua.browser.ie && ua.browser.ie < 9) {
        equal(editor.queryCommandValue('fontborder'), '#000 1px solid', '檢查反射值');
        equal(ua.getChildHTML(editor.body.firstChild), "<span style=\"border-bottom: #000 1px solid; border-left: #000 1px solid; border-top: #000 1px solid; border-right: #000 1px solid\">hello</span>&nbsp;", '查看添加了字符邊框後的樣式');
    }
    else {
        equal(editor.queryCommandValue('fontborder'), '1px solid rgb(0, 0, 0)', '檢查反射值');
        ua.checkHTMLSameStyle('<span style="border: 1px solid rgb(0, 0, 0);">hello</span>' + br, editor.document, editor.body.firstChild, '查看添加了字符邊框後的樣式');
    }
    range.setStart(editor.body.firstChild.firstChild.firstChild, 5).collapse(true).select();
    editor.execCommand('fontborder');
    equal(editor.queryCommandState('fontborder'), '0');
    equal(editor.queryCommandValue('fontborder'), '', '無反射值');
    editor.setContent('<p><span style="color: red">歡</span>迎光臨</p>');
    range.setStart(editor.body.firstChild.firstChild, 0).setEnd(editor.body.firstChild.lastChild, 3).select();
    editor.execCommand('fontborder');
    var p1 = '<span style="border: 1px solid rgb(0, 0, 0);"><span style="color: red;">歡</span>迎光臨</span>';
    var p2 = '<span style=\"border-bottom: #000 1px solid; border-left: #000 1px solid; border-top: #000 1px solid; border-right: #000 1px solid\"><span style="color: red;">歡</span>迎光臨</span>';
    if (ua.browser.ie && ua.browser.ie < 9)
        ua.checkSameHtml(editor.body.firstChild.innerHTML, p2, '查看添加了字符邊框後的樣式');
    else
        ua.checkHTMLSameStyle(p1, editor.document, editor.body.firstChild, '查看添加了字符邊框後的樣式');
});
test('設置超鏈接前景色再清除顏色', function () {
    if (ua.browser.ie < 9)return;//TODO 1.2.6
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>hello<a href="www.baidu.com">baidu</a></p>');
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('forecolor', 'rgb(255,0,0)');
    editor.execCommand('backcolor', 'rgb(0,255,0)');
    editor.execCommand('forecolor', 'default');
    //        var html = '<span style="background-color: rgb(0, 255, 0);">hello</span><a href="www.baidu.com" _href=\"www.baidu.com\" style="text-decoration: underline;"><span style="background-color: rgb(0, 255, 0);">baidu</span></a>';todo 1.2.6.1 樣式覆制了一次
    var html = '<span style="background-color: rgb(0, 255, 0);">hello</span><a href="www.baidu.com" _href=\"www.baidu.com\" style="background-color: rgb(0, 255, 0);text-decoration: underline;"><span style="background-color: rgb(0, 255, 0);">baidu</span></a>';
    ua.checkHTMLSameStyle(html, editor.document, editor.body.firstChild, '清除前景色');
});


test('font轉span', function () {
    var editor = te.obj[0];
    editor.setContent('<font size="12" color="red" lang="en" face="arial"><b><i>hello</i>hello</b>');
    var html = '<span style="font-size:12px;color:red;font-family:arial"><strong><em>hello</em>hello</strong></span>';
    ua.checkHTMLSameStyle(html, editor.document, editor.body.firstChild, '轉換font標籤');
    /*size的值在sizeMap中有對應的值*/
    editor.setContent('<b><font size="10" color="#ff0000" lang="en" face="楷體">hello');
    html = '<strong><span style="font-size:10px;color:#ff0000;font-family:楷體">hello</span></strong>';
    ua.checkHTMLSameStyle(html, editor.document, editor.body.firstChild, '轉換font標籤');
});
test('beforegetContent', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.body.innerHTML = '<p>hello<span></span></p>';
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('forecolor', 'rgb(255,0,0)');
    var div = document.createElement('div');
    var div1 = document.createElement('div');
    stop();
    setTimeout(function () {
        /*getContent會觸發beforegetcontent事件*/
        div1.innerHTML = editor.getContent();
        div.innerHTML = '<p><span style="color: rgb(255, 0, 0);" >hello</span></p>';
//    ok( ua.haveSameAllChildAttribs( div, div1 ), '查看空span是否被刪除' );
//        equal(ua.getChildHTML(div), ua.getChildHTML(div1));
        start();
    }, 50);
});

/*為超鏈接添加刪除線，超鏈接仍然有刪除線，trace946*/
test('underline and linethrough', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    stop();
    editor.setContent('hello<a href="http://www.baidu.com/">baidu</a>test');
    setTimeout(function () {
        if (!ua.browser.opera) {
            editor.focus();
        }
        var body = editor.body;
        ua.manualDeleteFillData(editor.body);
        range.selectNode(body.firstChild.firstChild.nextSibling).select();
        ok(/underline/.test(editor.queryCommandValue('underline')), 'query command value is underline');
        ok(/underline/.test(editor.queryCommandValue('strikethrough')), 'query command value is underline');
        ok(editor.queryCommandState('underline'), 'query underline state');
        editor.execCommand('strikethrough');
        var html = 'hello<a href="http://www.baidu.com/" _href=\"http://www.baidu.com/\" style="text-decoration: line-through" >baidu</a>test';
        ua.checkHTMLSameStyle(html, editor.document, body.firstChild, 'check results');
        start();
    }, 50);
});

/*為不同字號的文本加背景色，trace981*/
test('background--不同字號', function () {
    if (!ua.browser.opera) {
        var editor = te.obj[0];
        var range = te.obj[1];
        editor.setContent('你好');
        editor.focus();
        var body = editor.document.body;
        ua.manualDeleteFillData(editor.body);
        range.selectNode(body.firstChild.firstChild).select();
        editor.execCommand('backcolor', 'rgb(255,0,0)');
        range.setStart(body.firstChild.firstChild, 1).collapse(1).select();
        editor.execCommand('fontsize', '30px');
        range = editor.selection.getRange();
        range.insertNode(editor.document.createTextNode('hello'));
        stop();
        setTimeout(function () {
            ua.manualDeleteFillData(editor.body);
            /*去掉空白字符*/
            var color = ua.browser.ie && ua.browser.ie < 9 ? '' : ';background-color: rgb(255, 0, 0); ';
            var html = '<span style="background-color: rgb(255, 0, 0)">你好<span style="font-size: 30px ' + color + '">hello</span></span>';
            ua.checkHTMLSameStyle(html, editor.document, editor.body.firstChild, '檢查不同字號的文本背景色是否一致');
            start();
        }, 50);
    }
});

/*trace 937,chrome,safari,maxthon有問題*/
test('trace 937：為第一個有樣式的字加刪除線', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p><span style="color: red">歡</span>迎光臨</p>');
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('strikethrough');
    var p1 = editor.document.createElement('p');
    p1.innerHTML = '<span style="text-decoration: line-through;"><span style="text-decoration: line-through; color: red;">歡</span>迎光臨</span>';
    ok(ua.haveSameAllChildAttribs(editor.body.firstChild, p1), '查看添加了下劃線後的樣式');
});

/*trace 918*/
test('trace 918：字體的狀態反射', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>歡迎你回來</p>');
    var p = editor.body.firstChild;
    range.selectNode(p).select();
    editor.execCommand('underline');
    var p1 = document.createElement('p');
    p1.innerHTML = '<span style="text-decoration: underline;">歡迎你回來</span>';
    if (!ua.browser.opera) {
        ok(ua.haveSameAllChildAttribs(p, p1), '檢查是否添加了下劃線');
    }
    range.setStart(p.firstChild.firstChild, 3).setEnd(p.firstChild.firstChild, 4).select();
    editor.execCommand('fontfamily', '楷體');
    var txt = '楷體';
    if (ua.browser.opera)
        txt = '\"楷體\"';
    equal(editor.queryCommandValue('fontfamily'), txt, '檢查字體的狀態反射');

});

test(' 選中文本設置前景色為默認', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    editor.setContent('hello');
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('forecolor', 'rgb(255,0,0)');
    ua.checkHTMLSameStyle('<span style="color:rgb(255, 0, 0)">hello</span>', editor.document, editor.body.firstChild, '文本的前景色設為紅色');
    editor.execCommand('forecolor', 'default');
    equal(ua.getChildHTML(editor.body), '<p>hello</p>', '設置字體顏色為默認顏色');

});

/*trace 869*/
//插件相關！！！！！！！！！！
//test( 'trace 869：設置前景色後清除前景色，再輸入文本', function() {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent( '' );
//    stop()
////    alert(navigator.userAgent)
//    setTimeout( function() {
//        range.setStart( editor.body.firstChild, 0 ).select();
//        editor.execCommand( 'forecolor', 'red' );
//        editor.execCommand( 'forecolor', 'default' );
//        range = editor.selection.getRange();
//        editor.focus();
//        setTimeout( function() {
//        //TODO maxthon有2種模式，句柄分為IE的和maxthon兩種，需要根據userAgent區別對待，但是貌似還是有問題的
//            te.presskey( '', 'e' );
//            editor.focus();
//            setTimeout( function() {
//                var br = baidu.editor.browser.ie ? '' : '<br />';
//                ua.manualDeleteFillData( editor.body );
//                equal( editor.getContent(), '<p>e' + br + '</p>' );
//            start();
//            }, 250 );
//        }, 100 );
////    range.insertNode( document.createTextNode( 'hello' ) );
//    }, 150 );
//} );

/*trace 823*/
//TODO 涉及文本輸入和光標位置移動的結合
// 不好測，采取workaround，不用輸入的方式
test('trace 823：設置前景色後設置刪除線', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    editor.setContent('<p><span style="color: rgb(153, 230, 0); ">你好<span style="color: rgb(255, 0, 0); ">​hello</span></span></p>');
    range.selectNode(editor.body.firstChild.firstChild, 0).select();
    editor.execCommand('strikethrough');
    var p1 = editor.document.createElement('p');
    p1.innerHTML = '<span style="color: rgb(153, 230, 0); text-decoration: line-through;">你好<span style="color: rgb(255, 0, 0); text-decoration: line-through;">hello</span></span>';
    ok(ua.haveSameAllChildAttribs(editor.body.firstChild, p1), '檢查加入刪除線後的樣式');

});

/*trace 819, 765*/
test('trace 819, 765：刪除線和下劃線互斥', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    var p1 = editor.document.createElement('p');
    editor.setContent('<p>你好</p>');
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('underline');
    p1.innerHTML = '<span style="text-decoration: underline">你好</span>';
    ok(ua.haveSameAllChildAttribs(editor.body.firstChild, p1), '下劃線');
    range.selectNode(editor.body.firstChild).select();

    editor.execCommand('strikethrough');
    p1.innerHTML = '<span style="text-decoration: line-through">你好</span>';
    ok(ua.haveSameAllChildAttribs(editor.body.firstChild, p1), '刪除線，和下劃線互斥');
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('underline');
    p1.innerHTML = '<span style="text-decoration: underline">你好</span>';
    ok(ua.haveSameAllChildAttribs(editor.body.firstChild, p1), '下劃線，和刪除線互斥');

});

///*trace 810*/
//TODO 1.2.6
//test( 'trace 810：閉合時設置刪除線會改變文本前景色', function() {
//    if(!ua.browser.opera){
//        var editor = te.obj[2];
//        var div = document.body.appendChild( document.createElement( 'div' ) );
//        $( div ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
//        editor.render(div);
//        var range = new baidu.editor.dom.Range( editor.document );
//        stop();
//        setTimeout(function(){
//            editor.setContent( '<p><span style="color: rgb(153, 230, 0); ">你好<span style="color: rgb(255, 0, 0); ">​hello</span></span></p>' );
//            range.setStart( editor.body.firstChild.firstChild.lastChild, 1 ).collapse( true ).select();
//            editor.execCommand( 'strikethrough' );
//            range = editor.selection.getRange();
//            range.insertNode( editor.document.createTextNode( 'hey' ) );
//            /*ff下會自動加一個空的設置了style的span，比較時不作考慮*/
//            if ( baidu.editor.dom.domUtils.isEmptyNode( editor.body.firstChild.lastChild ) && baidu.editor.browser.gecko )
//                editor.body.firstChild.removeChild( editor.body.firstChild.lastChild );
//            var html = '<span style="color: rgb(153, 230, 0)">你好<span style="color: rgb(255, 0, 0)">hello<span style="color: rgb(255, 0, 0); text-decoration: line-through;">hey</span></span></span>';
//            ua.checkHTMLSameStyle( html, editor.document, editor.body.firstChild, '檢查插入的刪除線前景色是否正確' );
//            equal(editor.body.firstChild.innerHTML,html);
//            div.parentNode.removeChild(div);
//            start();
//        },50);
//    }
//} );

/*trace 809*/
test('trace 809：閉合時改變前景色和刪除線，再輸入文本', function () {
    if (!ua.browser.opera) {
        var editor = te.obj[0];
        var range = te.obj[1];

        editor.setContent('<p><span style="color: rgb(255, 0, 0); text-decoration: line-through; ">你好</span></p>');
        var p = editor.body.firstChild;
        range.setStart(p.firstChild, 1).collapse(true).select();
        editor.execCommand('forecolor', 'rgb(0,255,0)');
        range = editor.selection.getRange();
        editor.execCommand('underline');
        range = editor.selection.getRange();
        range.insertNode(editor.document.createTextNode('hey'));
        var p1 = editor.document.createElement('p');
        p1.innerHTML = '<span style="color: rgb(255, 0, 0); text-decoration: line-through; ">你好</span><span style="color: rgb(255, 0, 0); "><span style="color: rgb(0, 255, 0); text-decoration: underline; ">​hey</span></span>';
        ua.manualDeleteFillData(editor.body);
        /*ff下會自動加一個空的設置了style的span，比較時不作考慮*/
        if (baidu.editor.dom.domUtils.isEmptyNode(editor.body.firstChild.lastChild) && baidu.editor.browser.gecko)
            editor.body.firstChild.removeChild(editor.body.firstChild.lastChild);
        ok(ua.haveSameAllChildAttribs(editor.body.firstChild, p1), '檢查新輸入的文本下劃線和顏色是否正確');

    }
});

/*trace 805*/
test('trace 805：切換刪除線和下劃線，前景色沒了', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p><strong>你好早安</strong></p>');
    var text = editor.body.firstChild.firstChild.firstChild;
    range.selectNode(text).select();
    editor.execCommand('forecolor', 'rgb(255,0,0)');
    range.setStart(text, 0).setEnd(text, 2).select();
    editor.execCommand('underline');
    range.setStart(text, 0).setEnd(text, 2).select();
    editor.execCommand('strikethrough');
    var p1 = editor.document.createElement('p');
    p1.innerHTML = '<span style="color: rgb(255, 0, 0); text-decoration: line-through;"><strong>你好</strong></span><span style="color: rgb(255, 0, 0);"><strong>早安</strong></span>';
    ok(ua.haveSameAllChildAttribs(editor.body.firstChild, p1), '查看前景色是不是還在');

});

/*trace 802*/
test('trace 802：為設置了字體的文本添加刪除線', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    editor.setContent('<p><strong>你好早安</strong></p>');
    var text = editor.body.firstChild.firstChild.firstChild;
    range.setStart(text, 0).setEnd(text, 2).select();
    editor.execCommand('strikethrough');
    var p1 = editor.document.createElement('p');
    p1.innerHTML = '<span style="text-decoration: line-through;"><strong>你好</strong></span><strong>早安</strong>';
    ok(ua.haveSameAllChildAttribs(editor.body.firstChild, p1), '檢查刪除線是否正確');
    editor.execCommand('fontfamily', '隸書');
    editor.execCommand('source');
    var txt = '隸書';
    if (ua.browser.opera)
        txt = '\"隸書\"';
    if(!ua.browser.gecko)//todo 1.4.0
        equal(editor.queryCommandValue('fontfamily'), txt);

});

/*trace 744*/
test('trace 744：設置超鏈接背景色後切換到源碼再切回來', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    stop();
    editor.setContent('<p>hello<a href="www.baidu.com">baidu</a></p>');
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('backcolor', 'rgb(255,0,0)');
    var html = editor.body.firstChild.innerHTML;
    editor.execCommand('source');
    setTimeout(function () {
        editor.execCommand('source');
        setTimeout(function () {
            ua.checkHTMLSameStyle(html, editor.document, editor.body.firstChild, '切換後html代碼不變');
            /*切換源碼前後代碼應當相同*/
            start();
        }, 50);
    }, 50);
});


test('對表格中的文本添加顏色和下劃線', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    stop();
    editor.setContent('<table><tbody><tr><td>hello1</td><td>hello2</td></tr><tr><td colspan="2">hello3</td></tr></tbody></table>');
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[0]);
        ut.setSelected(cellsRange);
        if (ua.browser.ie && ua.browser.ie < 9) {
            range.setStart(editor.body.firstChild.firstChild.firstChild.firstChild, 0).setEnd(editor.body.firstChild.firstChild.lastChild.firstChild, 6).select();
        }
        else {
            range.setStart(trs[0].cells[0].firstChild, 0).setEnd(trs[1].cells[0].firstChild, 6).select();
        }

        editor.execCommand('forecolor', 'rgb(255,100,100)');
        setTimeout(function () {
            ut.clearSelected();
            trs = editor.body.firstChild.getElementsByTagName('tr');
            ut = editor.getUETable(editor.body.firstChild);
            range.selectNode(trs[0].firstChild).select();
            ut.setSelected(range);
            setTimeout(function () {
                editor.execCommand('underline');
                setTimeout(function () {
                    var tds = editor.body.firstChild.getElementsByTagName('td');
                    trs = editor.body.firstChild.getElementsByTagName('tr');
                    ua.checkSameHtml('<span style="color: rgb(255, 100, 100); text-decoration: underline; ">hello1</span>', tds[0].innerHTML, '第一個單元格有下劃線和前景色');
//                    equal('<span style="color: rgb(255, 100, 100); text-decoration: underline; ">hello1</span>', tds[0].innerHTML, '第一個單元格有下劃線和前景色');
                    ua.checkSameHtml('<span style="color: rgb(255, 100, 100); ">hello2</span>',  tds[1].innerHTML, '第2個單元格有前景色');
                    ua.checkSameHtml('<span style="color: rgb(255, 100, 100); ">hello3</span>',  tds[2].innerHTML, '第3個單元格有前景色');
                    equal(trs[1].firstChild.getAttribute('colspan'), 2, 'colspan為2');
                    equal(editor.queryCommandState('underline'), true, '狀態是underline');
                    equal(editor.queryCommandState('forecolor'), 0, '非underline和line-through返回0');
                    setTimeout(function () {
                        start();
                    }, 100);
                }, 100);
            }, 100);
        }, 100);
    }, 50);
});

/*trace 740*/
test('trace 740：設置左右字為紅色，修改部分字顏色為藍色，再修改所有字體', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    stop();
    editor.setContent('<p>你好早安</p>');
    range.selectNode(editor.body.firstChild).select();
    editor.execCommand('forecolor', 'rgb(255,0,0)');
    var text = editor.body.firstChild.firstChild.firstChild;
    range.setStart(text, 2).setEnd(text, 4).select();
    editor.execCommand('forecolor', 'rgb(0,255,0)');
    range.setStart(editor.body.firstChild, 0).setEnd(editor.body.firstChild, 1).select();
    editor.execCommand('fontfamily', ' 楷體, 楷體_GB2312, SimKai; ');
    setTimeout(function () {
        var html = '<span style="color: rgb(255, 0, 0); font-family: 楷體, 楷體_GB2312, SimKai;">你好<span style="color: rgb(0, 255, 0);">早安</span></span>';
        ua.checkSameHtml(html, editor.body.firstChild.innerHTML, '查看字體和顏色是否正確');
        start();
    }, 50);
});

/*trace 721*/
test('trace 721：預先設置下劃線和字體顏色，再輸入文本，查看下劃線顏色', function () {
    if (!ua.browser.opera) {
        var editor = te.obj[0];
        var range = te.obj[1];

        editor.setContent('<p><br></p>');
        range.setStart(editor.body.firstChild, 0).collapse(true).select();
        editor.execCommand('underline');
        editor.execCommand('forecolor', 'rgb(255,0,0)');
        range = editor.selection.getRange();
        range.insertNode(editor.document.createTextNode('hello'));
        ua.manualDeleteFillData(editor.body);
        var html = '<span style="text-decoration:underline;color:rgb(255,0,0)">hello</span><br>';
        ua.checkHTMLSameStyle(html, editor.document, editor.body.firstChild, '查看下劃線顏色是否與字體顏色一致');

    }
});


test('trace 3342：字符ab， 給a 加邊框再給b加邊框，邊框效果錯誤', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>hello</p>');
    range.setStart(editor.body.firstChild.firstChild, 0).setEnd(editor.body.firstChild.firstChild, 2).select();
    editor.execCommand('fontborder');
    range.setStart(editor.body.firstChild.lastChild, 0).setEnd(editor.body.firstChild.lastChild, 2).select();
    editor.execCommand('fontborder');
//    var br = baidu.editor.browser.ie ? '&nbsp;' : '<br>';
    if (ua.browser.ie && ua.browser.ie < 9) {
        equal(ua.getChildHTML(editor.body.firstChild), "<span style=\"border-bottom: #000 1px solid; border-left: #000 1px solid; border-top: #000 1px solid; border-right: #000 1px solid\">hell</span>o", '查看添加了字符邊框後的樣式');
    }else if(ua.browser.ie && ua.browser.ie == 11){
        equal(ua.getChildHTML(editor.body.firstChild), '<span style="border: 1px solid rgb(0, 0, 0); border-image: none;">hell</span>o', '查看添加了字符邊框後的樣式');
    }
    else {
        equal(ua.getChildHTML(editor.body.firstChild), '<span style="border: 1px solid rgb(0, 0, 0);">hell</span>o', '查看添加了字符邊框後的樣式');
    }
});

test('trace 3096：單元格中改變字號', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 3, numRows: 3});
    var trs = editor.body.firstChild.getElementsByTagName('tr');
    trs[0].cells[0].innerHTML = 'asd';
    setTimeout(function () {
        range.setStart(editor.body.firstChild.firstChild.firstChild.firstChild.firstChild, 0).setEnd(editor.body.firstChild.firstChild.firstChild.firstChild.firstChild, 3).select();
        editor.execCommand('fontsize', '32px');
        equal(editor.body.firstChild.getElementsByTagName('td')[0].style.height, '', '不固定高度');
        start();
    }, 50);
    stop();
});

test('轉換font標籤', function () {
    var editor = te.obj[0];
    editor.setContent('<font size="16" color="red"><b><i>x</i></b></font>');
    var html = '<p><span style="font-size:16px;color:red" ><strong><em>x</em></strong></span></p>';
    ua.checkHTMLSameStyle(html, editor.document, editor.body, '轉換font標籤');
    editor.setContent('<font style="color:red"><u>x</u></font>');
    html = '<span style="color:red"><span style="text-decoration:underline;">x</span></span>';
    ua.checkHTMLSameStyle(html, editor.document, editor.body.firstChild, '轉換font標籤');
});