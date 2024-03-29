module("plugins.basestyle");

test('sub--table', function () {
    var editor = te.obj[0];
    setTimeout(function () {
        editor.setContent('<table border="solid"><tr><td>hello1</td><td>hello2</td></tr><tr><td>hello3</td><td>hello4</td></tr></table>');
        setTimeout(function () {
            var range = te.obj[1];
            var body = editor.document.body;
            //1.2的版本中，table標簽套了div標簽，原來的var tbody = body.firstChild.firstChild；改為如下
            var tbody = editor.document.getElementsByTagName('table')[0].firstChild;
            range.selectNode(body.firstChild).select();
            var tds = body.firstChild.getElementsByTagName('td');
            var td;
//        for ( var index = 0; td = tds[index++]; ) {
//                editor.currentSelectedArr.push( td );
//        }
            editor.execCommand('subscript');
            setTimeout(function () {
                equal(ua.getChildHTML(tbody.firstChild.firstChild), '<sub>hello1</sub>', '檢查第1個單元格中文本是否是下標');
                equal(ua.getChildHTML(tbody.firstChild.firstChild.nextSibling), '<sub>hello2</sub>', '檢查第2個單元格中文本是否是下標');
                equal(ua.getChildHTML(tbody.lastChild.firstChild), '<sub>hello3</sub>', '檢查第3個單元格中文本是否是下標');
                equal(ua.getChildHTML(tbody.lastChild.firstChild.nextSibling), '<sub>hello4</sub>', '檢查第4個單元格中文本是否是下標');
                equal(editor.queryCommandState('superscript'), 0, 'check sup state');
                equal(editor.queryCommandState('subscript'), 1, 'check sub state');

                editor.execCommand('subscript');
                /**trace 943，為表格去上下標**/
                equal(tbody.firstChild.firstChild.innerHTML, 'hello1', '檢查第1個單元格中文本是否不是下標');
                equal(tbody.firstChild.firstChild.nextSibling.innerHTML, 'hello2', '檢查第2個單元格中文本是否不是下標');
                equal(tbody.lastChild.firstChild.innerHTML, 'hello3', '檢查第3個單元格中文本是否不是下標');
                equal(tbody.lastChild.firstChild.nextSibling.innerHTML, 'hello4', '檢查第4個單元格中文本是否你是下標');
                equal(editor.queryCommandState('superscript'), 0, 'check sup state');
                equal(editor.queryCommandState('subscript'), 0, 'check sub state');

                editor.execCommand('superscript');
                /*上下標互斥*/
                equal(ua.getChildHTML(tbody.firstChild.firstChild), '<sup>hello1</sup>', '檢查第1個單元格中文本是否是上標');
                equal(ua.getChildHTML(tbody.firstChild.firstChild.nextSibling), '<sup>hello2</sup>', '檢查第2個單元格中文本是否是上標');
                equal(ua.getChildHTML(tbody.lastChild.firstChild), '<sup>hello3</sup>', '檢查第3個單元格中文本是否是上標');
                equal(ua.getChildHTML(tbody.lastChild.firstChild.nextSibling), '<sup>hello4</sup>', '檢查第4個單元格中文本是否是上標');
                equal(editor.queryCommandState('superscript'), 1, 'check sup state');
                equal(editor.queryCommandState('subscript'), 0, 'check sub state');
                start();
            }, 50);
        }, 50);
    }, 50);
    stop();
});

//如果沒有setTimeout在FF（3.6和9都是）中range會出錯，其他瀏覽器沒問題
test('閉合插入上下標', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>你好</p>');
    var body = editor.body;
    stop();
    setTimeout(function () {
        range.setStart(body.firstChild.firstChild, 1).collapse(1).select(true);
        editor.execCommand('superscript');
        equal(ua.getChildHTML(body.firstChild), '你<sup></sup>好', '查看執行上標後的結果');
        range = editor.selection.getRange();
        range.insertNode(editor.document.createTextNode('hello'));
        equal(ua.getChildHTML(body.firstChild), '你<sup>hello</sup>好', '上標標簽中插入文本');
        start();
    }, 100)
});

test('不閉合插入上下標', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<strong>hello1<em>hello2</em></strong><a href="http://www.baid.com/"><strong>baidu_link</strong></a>hello3');
    var body = editor.document.body;
    stop();
    setTimeout(function () {
        range.setStart(body.firstChild.firstChild, 0).setEnd(body.firstChild.lastChild, 3).select();
        editor.execCommand('superscript');
        ua.manualDeleteFillData(body);
        ua.checkSameHtml(editor.getContent(), '<p><sup><strong>hello1<em>hello2</em></strong></sup><a href="http://www.baid.com/" ><sup><strong>baidu_link</strong></sup></a><sup>hel</sup>lo3</p>', '普通文本添加上標');
        start();
    }, 100);
});

/*trace 870*/
//無法模擬光標自動移到的場景，因此模擬輸入文本通過插入文本節點實現的方法，在插入文本後光標仍然在原來的位置
// 我們不確定光標實際在哪
test('trace 870:加粗文本前面去加粗', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('<p><br></p>');
    range.setStart(body.firstChild, 0).collapse(true).select();
    editor.execCommand('bold');
    range = editor.selection.getRange();
    range.insertNode(editor.document.createTextNode('hello'));
    equal(editor.queryCommandState('bold'), 1, '加粗');
    editor.execCommand('bold');
    range = editor.selection.getRange();
    equal(editor.queryCommandState('bold'), 0, '不加粗');
    range.insertNode(editor.document.createTextNode('hello2'));
    /*插入一個文本節點*/
    ua.manualDeleteFillData(editor.body);
    /*ie下插入節點後會自動移動光標到節點後面，而其他瀏覽器不會*/
    if (ua.browser.chrome || ua.browser.safari || (ua.browser.ie && ua.browser.ie > 8 && ua.browser.ie<11))// ie9,10改range
        equal(editor.getContent(), '<p>hello2<strong>hello</strong><br/></p>');
    else
        equal(editor.getContent(), '<p><strong>hello</strong>hello2<br/></p>');
});

/*trace 1043*/
test('bold-在已加粗文本中間去除加粗', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('<b>hello</b>ssss');
    range.setStart(body.firstChild.firstChild, 0).collapse(true).select();
    editor.execCommand('bold');
    range = editor.selection.getRange();
    equal(editor.queryCommandState('bold'), 0, "<strong> 被去掉");
    range.insertNode(range.document.createTextNode('aa'));
    /*在當前的range選區插入文本節點*/
    ua.manualDeleteFillData(editor.body);
    equal(ua.getChildHTML(body.firstChild), "aa<strong>hello</strong>ssss", "新文本節點沒有加粗");
});

/*trace 958*/
test('bold-在已加粗文本中間去除加粗', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('');
    editor.execCommand('bold');
    ok(ua.getChildHTML(body), "<stong></stong>", "editor不focus時點加粗，不會多一個空行");
});

/*trace 958*/
test('bold-加粗狀態反射', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('<p>this is a dog</p>');
    stop();
    setTimeout(function () {
        range.selectNode(body.firstChild).select();
        editor.execCommand('bold');
        range.setStart(body.firstChild.firstChild.firstChild, 2).collapse(true).select();
        equal(editor.queryCommandState('bold'), 1, '閉合選擇，加粗高亮');
        ua.manualDeleteFillData(editor.body);
        range.setStart(body.firstChild.firstChild.firstChild, 0).setEnd(body.firstChild.firstChild.lastChild, 4).select();
        equal(editor.queryCommandState('bold'), 1, '不閉合選擇，加粗高亮');
        start();
    }, 100)
});

/*trace 580*/
test('bold-連續加粗2次', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('<p>this is a dog</p>');
    var text = body.firstChild.firstChild;
    range.setStart(text, 0).setEnd(text, 3).select();
    editor.execCommand('bold');
    /*第一次加粗*/
    equal(editor.queryCommandState('bold'), 1, '加粗按鈕高亮');
    text = body.firstChild.lastChild;
    range.setStart(text, 1).setEnd(text, 3).select();
    /*不閉合選區文本*/
    equal(editor.queryCommandState('bold'), 0, '不閉合選擇，加粗不高亮');
    ua.manualDeleteFillData(editor.body);
    editor.execCommand('bold');
    /*第二次加粗*/
    equal(editor.queryCommandState('bold'), 1, '加粗高亮');
});

/*trace 1983*/
test('bold-2個單詞，中間有空格第一個單詞加粗，第二個單詞加粗再去加粗', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    body.innerHTML = '<p>hello world</p>';   //用setContent覆現不了這個問題
    var text = body.firstChild.firstChild;
    range.setStart(text, 0).setEnd(text, 5).select();
    editor.execCommand('bold');
    text = body.firstChild.lastChild;
    range.setStart(text, 1).setEnd(text, 6).select();
    editor.execCommand('bold');
    editor.execCommand('bold');
    ok(body.firstChild.childNodes.length == 3 && body.firstChild.childNodes[1].length == 1, '空格保留');
});

test('測試 userAction.manualdeleteFilldata', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('<p></p>');
    var fillData = editor.document.createTextNode(domUtils.fillChar);     //  在ie 6,7下，使用appendChild時，需要body先加載，必須將上句document前加editor,否則出錯
    body.appendChild(fillData);
    var space = ua.browser.ie ? '&nbsp;' : '<br>';//getContent（）結果：‘<br />’,innerHTML結果：<br>
    notEqual(body.innerHTML.toLowerCase(), '<p>' + space + '</p>', '清除不可見字符前不相等');
    ua.manualDeleteFillData(body);
    equal(body.innerHTML.toLowerCase(), '<p>' + space + '</p>', '清除不可見字符後相等');
});

test('trace 1884:單擊B再單擊I ', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('');
    range.setStart(body.firstChild, 0).collapse(1).select();
    editor.execCommand('bold');
    equal(editor.queryCommandState('bold'), 1, 'b高亮');
    editor.execCommand('italic');
    equal(editor.queryCommandState('italic'), 1, 'b高亮');
});

test('單擊B再在其他地方單擊I，空的strong標簽被刪除 ', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('<p>hello</p>');
    range.setStart(body.firstChild, 0).collapse(1).select();
    editor.execCommand('bold');
    equal(editor.queryCommandState('bold'), 1, 'b高亮');
    range.setStart(body.firstChild, 1).collapse(1).select();
    editor.execCommand('italic');
    equal(editor.queryCommandState('italic'), 1, 'b高亮');
    ua.manualDeleteFillData(body);
    if (!ua.browser.ie) {     //ie下有問題不能修，屏蔽ie
        equal(body.innerHTML.toLowerCase(), '<p><em></em>hello</p>', '空strong標簽被刪除')
    }
});

test('ctrl+i', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('<p>沒有加粗的文本</p>');
    range.selectNode(body.firstChild).select();
    var p = body.firstChild;
    setTimeout(function () {
        ua.keydown(editor.body, {'keyCode': 73, 'ctrlKey': true});
        editor.focus();
        setTimeout(function () {
            equal(ua.getChildHTML(p), '<em>沒有加粗的文本</em>');
            start();
        }, 150);
    }, 100);
    stop();
});

test('ctrl+u', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];
    editor.setContent('<p>沒有加粗的文本</p>');
    setTimeout(function () {
        range.selectNode(body.firstChild).select();
        setTimeout(function () {
            var html = '<span style="text-decoration: underline;">沒有加粗的文本</span>';
            ua.checkHTMLSameStyle(html, editor.document, body.firstChild, '文本被添加了下劃線');
            equal(editor.body.firstChild.firstChild.style.textDecoration, 'underline');
            start();
        }, 150);
        ua.keydown(editor.body, {'keyCode': 85, 'ctrlKey': true});
    }, 150);
    stop();
});

test('ctrl+b', function () {
    var editor = te.obj[0];
    var body = editor.body;
    var range = te.obj[1];

    editor.setContent('<p>沒有加粗的文本</p>');
    range.selectNode(body.firstChild).select();
    setTimeout(function () {
        ua.keydown(editor.body, {'keyCode': 66, 'ctrlKey': true});
        setTimeout(function () {
            equal(ua.getChildHTML(body.firstChild), '<strong>沒有加粗的文本</strong>');
            start();
        }, 150);
    }, 150);
    stop();
});

/*trace 3240*/
test('表格中文本加粗', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable');
    ua.manualDeleteFillData(editor.body);
    setTimeout(function () {
        var tds = editor.body.getElementsByTagName('td');
        tds[0].innerHTML = 'asd';
        tds[10].innerHTML = 'asd';
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[2].cells[0]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();

        editor.execCommand('bold');
        ua.manualDeleteFillData(editor.body);
        equal(editor.queryCommandState('bold'), 1, 'b高亮');
        equal(trs[0].cells[0].firstChild.tagName.toLowerCase(), 'strong', '[0][0]單元格中文本標簽');
        if (!ua.browser.ie)
            equal(trs[1].cells[0].firstChild.tagName.toLowerCase(), 'br', '[1][0]單元格中文本標簽');
        equal(trs[2].cells[0].firstChild.tagName.toLowerCase(), 'strong', '[2][0]單元格中文本標簽');
        start();
    }, 50);
    stop();
});