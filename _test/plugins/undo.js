module("plugins.undo");

//test('', function () {
//    stop()
//});
/*trace 856*/
test('trace 856 輸入文本後撤銷按鈕不亮', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    ua.keydown(editor.body);
    range.insertNode(editor.document.createTextNode('hello'));
    ua.keydown(editor.body);
    setTimeout(function () {
        equal(editor.queryCommandState('undo'), 0, '模擬輸入文本後撤銷按鈕應當高亮');
        start();
    }, 500);
    stop();
});

/*trace 583,1726*/
test('trace 583,1726 插入表格、表情,撤銷', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 2, numRows: 2});
    editor.execCommand('insertimage', {src: 'http://img.baidu.com/hi/jx2/j_0001.gif', width: 50, height: 50});
    editor.execCommand('undo');
    editor.execCommand('undo');
    editor.execCommand('undo');//需要3次undo，已經和RD確認過，暫時不改
    ua.manualDeleteFillData(editor.body);
    equal(editor.getContent().toLowerCase(), '', '插入表格、表情,撤銷');
});

/*trace 595*/
test('trace 595 撤銷合並單元格後再合並單元格', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 3, numRows: 3});
    var tds = editor.body.firstChild.getElementsByTagName('td');
    for (var i = 0; i < 5; i++) {
        tds[i].innerHTML = 'hello';
    }
    //合並單元格
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();

        editor.execCommand('mergecells');
        ua.manualDeleteFillData(editor.body);
        var tds = editor.body.getElementsByTagName('td');
        equal(tds.length, 6, '單元格數');
        equal(trs[0].cells[0].colSpan, 2, '合並--[0][0]單元格colspan');
        equal(trs[0].cells[0].rowSpan, 2, '合並--[0][0]單元格rowspan');
        equal(trs[0].cells[0].innerHTML.toLowerCase(), 'hello<br>hello<br>hello<br>hello', '內容覆制正確');

        //撤銷合並單元格的操作
        editor.execCommand('undo');
        ua.manualDeleteFillData(editor.body);
        ok(tds[0].colSpan == 1 && tds[0].rowSpan == 1 && tds.length == 9, '撤銷後，單元格回覆成多個');
        ok(tds[0].innerHTML.toLowerCase() == 'hello' && tds[1].innerHTML.toLowerCase() == 'hello' && tds[3].innerHTML.toLowerCase() == 'hello' && tds[4].innerHTML.toLowerCase() == 'hello', '內容覆制正確');

        //再次合並單元格
        setTimeout(function () {
            var trs = editor.body.firstChild.getElementsByTagName('tr');
            var ut = editor.getUETable(editor.body.firstChild);
            var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
            ut.setSelected(cellsRange);
            range.setStart(trs[0].cells[0], 0).collapse(true).select();
            editor.execCommand('mergecells');
            ua.manualDeleteFillData(editor.body);
            tds = editor.body.firstChild.getElementsByTagName('td');
            ok(tds[0].colSpan == 2 && tds[0].rowSpan == 2 && tds.length == 6, '再次合並，多個單元格合並成一個');
            equal(tds[0].innerHTML.toLowerCase(), 'hello<br>hello<br>hello<br>hello', '內容覆制正確');
            start();
        }, 50);
    }, 50);
    stop();
});

/*trace 599*/
test('trace 599 插入表格、表情、超鏈接、表情,撤銷2次', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 2, numRows: 2});        //插入表格
    range.setStart(editor.body.lastChild, 0).collapse(true).select();
    editor.execCommand('insertimage', {src: 'http://img.baidu.com/hi/jx2/j_0001.gif', width: 50, height: 50});    //插入表情
    range.setStartAfter(editor.body.lastChild).collapse(true).select();
    editor.execCommand('link', {href: 'http://www.baidu.com/'});       //插入超鏈接
    range.setStartAfter(editor.body.lastChild).collapse(true).select();
    editor.execCommand('insertimage', {src: 'http://img.baidu.com/hi/jx2/j_0001.gif', width: 50, height: 50});   //插入表情

    editor.execCommand('Undo');
    editor.execCommand('Undo');
    ua.manualDeleteFillData(editor.body);
    equal(editor.body.childNodes.length, 2, '撤銷2次後只剩表格、表情');
    var tag = editor.body.childNodes[0].firstChild.tagName.toLowerCase();
    ok(tag == 'table' || tag == 'tbody', '表格');
    equal(editor.body.childNodes[1].firstChild.tagName.toLowerCase(), 'img', '表情');
});

/*trace 617*/
test('trace 617 插入文本、分割線、文本,撤銷2次，撤銷掉分割線', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    editor.setContent('<p></p>');

    //輸入文本
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    ua.keydown(editor.body);
    range.insertNode(editor.document.createTextNode('hello'));
    if (!ua.browser.ie)
        ua.compositionstart(editor.body);
    ua.keyup(editor.body);
    //輸入分割符
    range.setStartAfter(editor.body.lastChild).collapse(true).select();
    editor.execCommand('Horizontal');
    //輸入文本
    range.setStartAfter(editor.body.lastChild).collapse(true).select();
    ua.keydown(editor.body);
    range.insertNode(editor.document.createTextNode('hello'));
    if (!ua.browser.ie)
        ua.compositionend(editor.body);
    ua.keyup(editor.body);

    editor.execCommand('Undo');
    editor.execCommand('Undo');
    equal(editor.body.getElementsByTagName('hr').length, 0, '分割線已刪除');

});

/*trace 632*/
test('trace 632 合並單元格後撤銷再合並單元格不會丟字', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 4, numRows: 4});
    var tds = editor.body.firstChild.getElementsByTagName('td');
    for (var i = 0; i < 6; i++) {
        tds[i].innerHTML = 'hello';
    }
    //合並單元格
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        editor.execCommand('mergecells');
        ua.manualDeleteFillData(editor.body);
        tds = editor.body.firstChild.getElementsByTagName('td');
        equal(tds[0].innerHTML.toLowerCase(), 'hello<br>hello<br>hello<br>hello', '合並單元格,內容覆制正確');

        //撤銷合並單元格的操作,再次合並單元格
        editor.execCommand('Undo');
        setTimeout(function () {
            var trs = editor.body.firstChild.getElementsByTagName('tr');
            var ut = editor.getUETable(editor.body.firstChild);
            var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
            ut.setSelected(cellsRange);
            range.setStart(trs[0].cells[0], 0).collapse(true).select();
            editor.execCommand('mergecells');
            ua.manualDeleteFillData(editor.body);
            tds = editor.body.firstChild.getElementsByTagName('td');
            equal(tds[0].innerHTML.toLowerCase(), 'hello<br>hello<br>hello<br>hello', '撤銷後再次合並單元格,內容覆制正確');
            start();
        }, 50);
    }, 50);
    stop();
});

/*trace 675  這個trace用例中的操作已經設為非法*/
/*trace 685*/
test('trace 685 合並單元格後,刪除行,再撤銷,再刪除行', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 4, numRows: 4});

    //選擇第一行的4格單元格，合並
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[0].cells[3]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        var tds = editor.body.getElementsByTagName('td');
        editor.execCommand('mergecells');
        ok(tds[0].colSpan == 4 && tds[0].rowSpan == 1, '第一行的4個單元格合並成一個');

        //選擇第2，3，4行的第1個單元格，合並
        setTimeout(function () {
            var trs = editor.body.firstChild.getElementsByTagName('tr');
            var ut = editor.getUETable(editor.body.firstChild);
            var cellsRange = ut.getCellsRange(trs[1].cells[0], trs[3].cells[0]);
            ut.setSelected(cellsRange);
            range.setStart(trs[0].cells[0], 0).collapse(true).select();
            var tds = editor.body.getElementsByTagName('td');
            editor.execCommand('mergecells');
            ok(tds[1].colSpan == 1 && tds[1].rowSpan == 3, '第2，3，4行的第一個單元格合並成一個');

            //單擊第二步合並的單元格，點擊刪除行
            range.setStart(tds[4], 0).collapse(true).select();
            editor.execCommand('deleterow');
            equal(editor.body.firstChild.getElementsByTagName('tr').length, 3, '點擊刪除行，表格剩三行');
            //撤銷
            editor.execCommand('undo');
            equal(editor.body.firstChild.getElementsByTagName('tr').length, 4, '撤銷後，表格恢覆成4行');
            //再次點擊刪除行
            range.setStart(tds[4], 0).collapse(true).select();
            editor.execCommand('deleterow');
            equal(editor.body.firstChild.getElementsByTagName('tr').length, 3, '撤銷後，再點擊刪除行，表格剩三行');
            start();
        }, 50);
    }, 50);
    stop();
});

/*trace 711 這個要中文輸入法再模擬鍵盤輸入，貌似不能寫？？？*/
/*trace 718*/
test('trace 718 合並單元格後,刪除列,再撤銷,再刪除列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 4, numRows: 4});

    //選擇中間的4格單元格，合並
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[1].cells[1], trs[2].cells[2]);
        ut.setSelected(cellsRange);
        range.setStart(trs[1].cells[1], 0).collapse(true).select();
        var tds = editor.body.firstChild.getElementsByTagName('td');
        editor.execCommand('mergecells');
        ok(tds[5].colSpan == 2 && tds[5].rowSpan == 2, '對一個4*4的表格，選擇中間的4格單元格，合並成一個');
        //光標定位在合並後的大單元格中，點擊刪除列按鈕
        range.setStart(tds[5], 0).collapse(true).select();
        editor.execCommand('deletecol');
        equal(editor.body.firstChild.getElementsByTagName('tr')[0].childNodes.length, 3, '點擊刪除列，表格剩三列');
        //撤銷
        editor.execCommand('undo');
        equal(editor.body.firstChild.getElementsByTagName('tr')[0].childNodes.length, 4, '撤銷後，表格剩四列');
        //再次點擊刪除列按鈕
        //TODO 1.2.6
        if (!ua.browser.gecko && !ua.browser.ie) {
            range.setStart(tds[5], 0).collapse(true).select();
            editor.execCommand('deletecol');
            equal(editor.body.firstChild.getElementsByTagName('tr')[0].childNodes.length, 3, '再次點擊刪除列，表格剩三列');
        }
        equal(editor.body.firstChild.getElementsByTagName('tr').length, 4, '表格依然有4行');
        start();
    }, 50);
    stop();
});

/*trace 722 需要中文輸入法*/
/*trace 743*/
test('trace 743 合並單元格後,刪除列,再撤銷', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 4, numRows: 4});

    //第一行的4格單元格，合並
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[0].cells[3]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        editor.execCommand('mergecells');
        var tds = editor.body.firstChild.getElementsByTagName('td');
        ok(tds[0].colSpan == 4 && tds[0].rowSpan == 1 && tds.length == 13, '對一個4*4的表格，選擇第一行的4格單元格，合並成一個');
        //點擊刪除列按鈕
        editor.execCommand('deletecol');
        equal(editor.body.firstChild.getElementsByTagName('tr')[1].childNodes.length, 3, '點擊刪除列，表格剩3列');
        //撤銷
        editor.execCommand('undo');
        equal(editor.body.firstChild.getElementsByTagName('tr')[1].childNodes.length, 4, '撤銷後，表格恢覆成4列');
        equal(editor.body.firstChild.getElementsByTagName('tr').length, 4, '表格依然有4行');
        start();
    }, 50);
    stop();
});

/*trace 808 需要觀察光標延遲，這個問題已經被標為不修*/
/*trace 855 這個用例描述有問題，而且可以跟trace 584合成一個*/
/*trace 873*/
//test( 'trace 873 光標不在編輯器中時替換一個文本後按撤銷', function () {
//    if(ua.browser.opera)
//        return;
//    var editor = te.obj[0];
//    editor.setContent('歡迎使用ueditor');
//    editor.execCommand( 'searchreplace', {searchStr:'歡迎', replaceStr:'welcom'} );
//    ua.manualDeleteFillData(editor.body);
//    equal( editor.body.firstChild.innerHTML, 'welcom使用ueditor', '查找替換' );
//    editor.execCommand( 'Undo' );
//    ua.manualDeleteFillData( editor.body );
//    equal( editor.body.firstChild.innerHTML, '歡迎使用ueditor', '撤銷' );
//} );

/*trace 942*/
test('trace 942 用格式刷後撤銷', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var flag = true;
    stop();
    expect(1);
    editor.setContent('<p><strong>hello</strong></p><p><a href="http://www.baidu.com/">hello</a></p>');

    range.setStart(editor.body.firstChild.firstChild.firstChild, 2).setEnd(editor.body.firstChild.firstChild.firstChild, 4).select();
    editor.addListener('mouseup', function () {
        ua.manualDeleteFillData(editor.body);
        //從瀏覽器覆制了不可見的空文本
        equal(editor.body.lastChild.firstChild.innerHTML.toLowerCase(), 'h<strong></strong>ello');

    });
    editor.execCommand('formatmatch');
    range.setStart(editor.body.lastChild.firstChild.firstChild, 1).collapse(true).select();
    ua.mouseup(editor.body);
    setTimeout(function () {
        start();
    }, 100);
});

test('undo--redo', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    editor.focus();
    editor.execCommand('anchor', 'hello');
    editor.undoManger.undo();
    var spase = ua.browser.ie ? '&nbsp;' : '<br>';
    equal(ua.getChildHTML(editor.body), '<p>' + spase + '</p>', '');
    editor.undoManger.redo();
    ua.manualDeleteFillData(editor.body);
//    var cs=editor.body.firstChild.firstChild.getAttribute('class');
//    var an=editor.body.firstChild.firstChild.getAttribute('anchorname');
//    equal(cs,'anchorclass','錨點class');
//    equal(an,'hello','錨點name');
//    var br = (ua.browser.ie) ? '' : '<br>';
    if (ua.browser.ie)
        equal(ua.getChildHTML(editor.body), '<p><img class=\"anchorclass\" anchorname=\"hello\">' + spase + '</p>', '');
    else
        equal(ua.getChildHTML(editor.body), '<p><img anchorname=\"hello\" class=\"anchorclass\">' + spase + '</p>', '');
});
test('reset,index', function () {
    var editor = te.obj[0];
    editor.setContent('<p></p>');
    editor.focus();
    editor.execCommand('anchor', 'hello');
    var listLength = editor.undoManger.list.length;
    ok(listLength > 0, '檢查undoManger.list');
    equal(editor.undoManger.index, 1, '檢查undoManger.index');
    editor.undoManger.undo();
    equal(editor.undoManger.list.length, listLength, 'undo操作,undoManger.list不變');
    equal(editor.undoManger.index, 0, 'undo操作,undoManger.index-1');
    var spase = ua.browser.ie ? '&nbsp;' : '<br>';
    equal(ua.getChildHTML(editor.body), '<p>' + spase + '</p>', '檢查內容');
    editor.reset();
    equal(editor.undoManger.list.length, 0, 'reset,undoManger.list清空');
    equal(editor.undoManger.index, 0, 'reset,undoManger.index清空');
    editor.undoManger.redo();
    ua.manualDeleteFillData(editor.body);
    var spase = ua.browser.ie ? '&nbsp;' : '<br>';
    equal(ua.getChildHTML(editor.body), '<p>' + spase + '</p>', '檢查內容');

});
/*trace 1068  格式刷圖片*/
test('trace 1068 默認樣式的圖片刷左浮動圖片，撤銷，左浮動圖片刷默認樣式的圖片', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    var num = 0;

    var body = editor.body;
    editor.setContent('<p><br></p>');
    range.setStart(body.firstChild, 0).collapse(1).select();
    editor.execCommand('insertimage', {src: 'http://img.baidu.com/hi/jx2/j_0001.gif', width: 50, height: 51});
    range.selectNode(editor.body.getElementsByTagName('img')[0]).select();
    editor.execCommand('imagefloat', 'none');
    range.setStart(body.firstChild, 0).collapse(1).select();
    editor.execCommand('insertimage', {src: 'http://img.baidu.com/hi/jx2/j_0002.gif', width: 50, height: 51});
    range.selectNode(editor.body.getElementsByTagName('img')[0]).select();
    editor.execCommand('imagefloat', 'left');
    // equal(ua.getFloatStyle(body.getElementsByTagName( 'img' )[0]), "left", '左浮動' );
    //  equal(ua.getFloatStyle(body.getElementsByTagName( 'img' )[1]), "none", '默認' );
    range.selectNode(body.getElementsByTagName('img')[1]).select();
    editor.addListener('mouseup', function () {
        equal(editor.queryCommandState('formatmatch'), 0, '刷後狀態為0');
        if (num == 1) {
            equal(ua.getFloatStyle(body.getElementsByTagName('img')[0]), "none", '默認刷左浮動');
            editor.execCommand('Undo');
            equal(ua.getFloatStyle(body.getElementsByTagName('img')[0]), "left", '撤銷後，左浮動還原');
            range.selectNode(body.getElementsByTagName('img')[0]).select();
            editor.execCommand('formatmatch');
            range.selectNode(body.getElementsByTagName('img')[1]).select();
            num = 2;
            ua.mouseup(editor.body);
        }
        else if (num == 2) {
            if (!ua.browser.opera) {
                equal(ua.getFloatStyle(body.getElementsByTagName('img')[1]), 'left', '左浮動刷默認');
            }
            setTimeout(function () {
                start();
            }, 100);
        }
    });
    editor.execCommand('formatmatch');
    range.selectNode(body.getElementsByTagName('img')[0]).select();
    num = 1;
    ua.mouseup(body.getElementsByTagName('img')[0]);
    stop();
});

//test(
//		'undo',
//		function() {
//			var editor = new baidu.editor.Editor({
//				enterkey : 'br',
//				initialContent : 'test'
//			});
//			editor.render(te.dom[0]);
//			var domUtils = baidu.editor.dom.domUtils, dtd = baidu.editor.dom.dtd, range = new baidu.editor.dom.Range(
//					editor.document);
//			editor.setContent('<b>xxxx</b><p>xxxx</p>');
//			range.selectNodeContents(editor.document.body).select();
//			editor.execCommand('bold');
//			editor.execCommand('Undo');
//			equals(getHTML(editor.document.body), '<b>xxxx</b><p>xxxx</p>');
//			editor.execCommand('redo');
//			equals(getHTML(editor.document.body), 'xxxx<p>xxxx</p>');
//			ok(!editor.hasRedo);
//
//			editor.execCommand('Undo');
//			editor.execCommand('Undo');
//			equals(getHTML(editor.document.body), 'test');
//		});

test('ctrl+z/y', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    var body = editor.body;
    editor.setContent('<p>沒有加粗的文本</p>');
    range.selectNode(body.firstChild).select();
    var p = body.firstChild;
    setTimeout(function () {
        ua.keydown(editor.body, {'keyCode': 66, 'ctrlKey': true});
        setTimeout(function () {
            equal(ua.getChildHTML(p), '<strong>沒有加粗的文本</strong>');
            ua.keydown(editor.body, {'keyCode': 90, 'ctrlKey': true});
            setTimeout(function () {
                editor.focus();
                equal(ua.getChildHTML(body.firstChild), '沒有加粗的文本');
                ua.keydown(editor.body, {'keyCode': 89, 'ctrlKey': true});
                editor.focus();
                setTimeout(function () {
                    equal(ua.getChildHTML(body.firstChild), '<strong>沒有加粗的文本</strong>');
                    start();
                }, 100);
            }, 100);
        }, 150);
    }, 100);
    stop();
});

/*trace 3209  格式刷圖片*/
test('trace 3209 插入表格,undo redo', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable');
    editor.execCommand('undo');
    equal(editor.getContent().toLowerCase(), '', '插入表格,撤銷');
    editor.execCommand('redo');
    ua.manualDeleteFillData(editor.body);
    equal(editor.body.firstChild.tagName.toLowerCase(), 'table', '插入表格,撤銷重做');
});