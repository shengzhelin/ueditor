module('plugins.table');
//test('',function(){stop()})
/*trace992，合併單元格後多了一個td*/
test('向右合併--拆分成列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:2});
    ua.manualDeleteFillData(editor.body);

    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('mergeright');
    range.setStart(tds[1], 0).collapse(true).select();
    editor.execCommand('mergeright');
    tds = editor.body.getElementsByTagName('td');
    equal(tds.length, 2, '2個單元格');
    equal(tds[0].getAttribute('colspan'), 2, '第一行的單元格colspan為2');
    equal(tds[1].getAttribute('colspan'), 2, '第二行的單元格colspan為2');
    ua.manualDeleteFillData(editor.body);
    setTimeout(function () {
        editor.execCommand('source');
        start();
    });
    stop();
    tds = editor.body.getElementsByTagName('td');
    equal(tds.length, 2, '2個單元格');
    equal(tds[0].getAttribute('colspan'), 2, '切換到源碼後第一個的單元格colspan');
    equal(tds[1].getAttribute('colspan'), 2, '切換到源碼後第二行第一個的單元格colspan');

    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('splittocols');
    equal(tds[0].getAttribute('colspan'), 1, '拆分--[0][0]單元格colspan');
    equal(tds[0].rowSpan, 1, '拆分--[0][0]單元格rowspan');
});
test('trace 3985  向右合併--拆分成列:th', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:2});
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0],0).collapse(true).select();
    editor.execCommand('inserttitle');
    var ths = editor.body.getElementsByTagName('th');
    range.setStart(ths[0], 0).collapse(true).select();
    editor.execCommand('mergeright');
    ths = editor.body.getElementsByTagName('th');
    equal(ths.length, 1, '1個th');
    range.setStart(ths[0], 0).collapse(true).select();
    editor.execCommand('splittocols');
    equal(editor.body.getElementsByTagName('th').length, 2, '拆分單元格th');
});
test('trace 3985 向下合併-拆分成行', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:2});
    ua.manualDeleteFillData(editor.body);
    var tds = editor.body.getElementsByTagName('td');

    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('mergedown');
    range.setStart(tds[1], 0).collapse(true).select();
    editor.execCommand('mergedown');
    tds = editor.body.getElementsByTagName('td');
    equal(tds.length, 2, '2個單元格');
    equal(tds[0].getAttribute('rowspan'), 2, '合併--[0][0]單元格rowspan');
    equal(tds[1].getAttribute('rowspan'), 2, '合併--[0][1]單元格rowspan');

    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('splittorows');
    range.setStart(tds[1], 0).collapse(true).select();
    editor.execCommand('splittorows');
    equal(tds[0].colSpan, 1, '拆分--[0][0]單元格colspan');
    equal(tds[0].getAttribute('rowspan'), 1, '拆分--[0][0]單元格rowspan');
});

test('完全拆分單元格', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:3, numRows:3});
    ua.manualDeleteFillData(editor.body);

    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();

        editor.execCommand('mergecells');
        ut.clearSelected();
        var tds = editor.body.getElementsByTagName('td');
        equal(tds.length, 6, '單元格數');
        equal(tds[0].getAttribute('colspan'), 2, '合併--[0][0]單元格colspan');
        equal(tds[0].getAttribute('rowspan'), 2, '合併--[0][0]單元格rowspan');

        editor.execCommand('splittoCells');
        equal(tds.length, 9, '單元格數');
        equal(tds[0].getAttribute('colspan'), 1, '拆分--[0][0]單元格colspan');
        equal(tds[0].getAttribute('rowspan'), 1, '拆分--[0][0]單元格rowspan');
        equal(tds[1].colSpan, 1, '拆分--[0][1]單元格colspan');
        equal(tds[1].getAttribute('rowspan'), 1, '拆分--[0][1]單元格rowspan');

        editor.undoManger.undo();
        equal(tds[0].getAttribute('colspan'), 2, '撤銷--[0][0]單元格colspan');
        equal(tds[0].getAttribute('rowspan'), 2, '撤銷--[0][0]單元格rowspan');
        start();
    }, 50);
    stop();
});

test('刪除table', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable');
    ua.manualDeleteFillData(editor.body);
    equal(editor.queryCommandState('deletetable'), -1, '刪除按鈕灰色');

    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('deletetable');
    ua.manualDeleteFillData(editor.body);
    var table = editor.body.getElementsByTagName('table')[0];
    equal(table, undefined, '刪除成功');
});

test('平均分配行列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var html = '<table width="267" ><tbody><caption></caption><tr><th></th><th></th><th></th></tr><tr><td width="46" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" height="57" ><br/></td><td width="158" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" height="57" ><br/></td><td width="-1" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" height="57" ><br/></td></tr><tr><td width="46" valign="top" style="word-break: break-all;" height="134" ><br/></td><td width="158" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" height="134" ><br/></td><td width="-1" valign="top" style="word-break: break-all;" height="134" ><br/></td></tr><tr><td width="46" valign="top" style="word-break: break-all;" ><br/></td><td width="158" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" ><br/></td><td width="-1" valign="top" style="word-break: break-all;" ><br/></td></tr></tbody></table>';
    editor.setContent(html);
    var trs = editor.body.firstChild.getElementsByTagName('tr');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(trs[1].cells[0], trs[1].cells[2]);
    ut.setSelected(cellsRange);
    range.setStart(trs[1].cells[0], 0).collapse(true).select();
    editor.execCommand('averagedistributecol');
    ut.clearSelected();
    equal(editor.body.firstChild.getElementsByTagName('td')[1].width, editor.body.firstChild.getElementsByTagName('td')[2].width, '平均分配各列');
    cellsRange = ut.getCellsRange(trs[1].cells[0], trs[3].cells[0]);
    ut.setSelected(cellsRange);
    range.setStart(trs[1].cells[0], 0).collapse(true).select();
    editor.execCommand('averagedistributerow');
    ut.clearSelected();
    trs = editor.body.firstChild.getElementsByTagName('tr');
    equal(trs[2].cells[0].height, trs[3].cells[0].height, '平均分配各行');
});
test('選部分行時，平均分布行/選部分列時，平均分布列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var html = '<table width="267" ><tbody><tr><td width="46" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" height="57" ><br/></td><td width="158" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" height="57" ><br/></td><td width="-1" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" height="57" ><br/></td></tr><tr><td width="46" valign="top" style="word-break: break-all;" height="134" ><br/></td><td width="158" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" height="134" ><br/></td><td width="-1" valign="top" style="word-break: break-all;" height="134" ><br/></td></tr><tr><td width="46" valign="top" style="word-break: break-all;" ><br/></td><td width="158" valign="top" colspan="1" rowspan="1" style="word-break: break-all;" ><br/></td><td width="-1" valign="top" style="word-break: break-all;" ><br/></td></tr></tbody></table>';
    editor.setContent(html);
    var trs = editor.body.firstChild.getElementsByTagName('tr');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[2]);
    ut.setSelected(cellsRange);
    range.setStart(trs[0].cells[0], 0).collapse(true).select();
    editor.execCommand('averagedistributerow');
    ut.clearSelected();
    trs = editor.body.firstChild.getElementsByTagName('tr');
    equal(trs[1].cells[0].height, trs[0].cells[0].height, '平均分配各行');
    cellsRange = ut.getCellsRange(trs[0].cells[0], trs[2].cells[1]);
    ut.setSelected(cellsRange);
    range.setStart(trs[0].cells[0], 0).collapse(true).select();
    editor.execCommand('averagedistributecol');
    ut.clearSelected();
    equal(editor.body.firstChild.getElementsByTagName('td')[0].width, editor.body.firstChild.getElementsByTagName('td')[1].width, '平均分配各列');
});

test('表格中設置對齊方式', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<table><caption></caption><tbody><tr><td></td><td><p>hello</p></td></tr></tbody></table>');
    stop();
    setTimeout(function(){
        var caption = editor.body.getElementsByTagName('caption');
        range.setStart(caption[0], 0).collapse(true).select();
        editor.execCommand('cellalignment', {align:'right', vAlign:'top'});
        equal(caption[0].style.textAlign, 'right', 'caption對齊方式為右上對齊');
        equal(caption[0].style.verticalAlign, 'top', 'caption對齊方式為右上對齊');
        var tds = editor.body.getElementsByTagName('td');
        range.setStart(tds[0], 0).collapse(true).select();
        editor.execCommand('cellalignment', {align:'right', vAlign:'top'});
        equal(tds[0].align, 'right', 'td對齊方式為右上對齊');
        equal(tds[0].vAlign, 'top', 'td對齊方式為右上對齊');
        //*不閉合設置對齊方式*//*
        range.selectNode(tds[1].firstChild, 0).select();
        editor.execCommand('cellalignment', {align:'center', vAlign:'middle'});
        equal(tds[1].align, 'center', 'p對齊方式為居中對齊');
        start();
    },50);

});

test('修改table屬性', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:3});
    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
    editor.execCommand('tablealignment', 'center');
    var table = editor.body.getElementsByTagName('table')[0];
    equal(table.align, 'center', '對齊方式居中');
    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
    editor.execCommand('edittable', '#ff0000');
    ua.manualDeleteFillData(editor.body);
    var tds = editor.body.getElementsByTagName('td');
    if (ua.browser.ie && ua.browser.ie < 9) {
        equal(tds[0].style.borderColor, '#ff0000', '邊框顏色：紅色');
    } else {
        equal(tds[0].style.borderColor, 'rgb(255, 0, 0)', '邊框顏色：紅色');
    }
    equal(editor.queryCommandState('edittable'), 0, 'state');
});

test('修改單元格', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable');
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[2], 0).collapse(true).select();
    editor.execCommand('edittd', '#9bbb59');
    if (ua.browser.ie && ua.browser.ie < 9) {
        equal(tds[2].style.backgroundColor, '#9bbb59', '背景顏色');
    } else {
        equal(tds[2].style.backgroundColor, 'rgb(155, 187, 89)', '背景顏色');
    }
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(tds[0], tds[6]);
    ut.setSelected(cellsRange);
    range.setStart(tds[0], 0).collapse(true).select();

    editor.execCommand('edittd', '#9bbb59');
    editor.execCommand('cellalignment', {align:'center', vAlign:'bottom'});
    ut.clearSelected();
    tds = editor.body.firstChild.getElementsByTagName('td');
    if (ua.browser.ie && ua.browser.ie < 9) {
        equal(tds[5].style.backgroundColor, '#9bbb59', '背景顏色');
    } else {
        equal(tds[5].style.backgroundColor, 'rgb(155, 187, 89)', '背景顏色');
    }
    equal(tds[5].align, 'center', '水平居中');
    equal(tds[5].vAlign, 'bottom', '下方');
    equal(editor.queryCommandState('edittd'), 0, 'state');
    equal(editor.queryCommandState('cellalignment'), 0, 'state');
});

test('表格前插行', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable');
    var tds = editor.body.firstChild.getElementsByTagName('td');
    range.setStart(tds[1], 0).collapse(true).select();
    editor.execCommand('insertparagraphbeforetable');
    ua.manualDeleteFillData(editor.body);
    var br = ua.browser.ie ? '&nbsp;' : '<br>';
    equal(editor.body.firstChild.innerHTML, br, '表格前插行');
});

test('插入行', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:3, numRows:3});
    ua.manualDeleteFillData(editor.body);
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('mergedown');
    range.setStart(tds[4], 0).collapse(true).select();
    editor.execCommand('insertrow');
    tds = editor.body.getElementsByTagName('td');
    equal(tds[0].getAttribute('rowspan'), 3, '[0][0]單元格rowspan');
    editor.undoManger.undo();
    equal(tds[0].getAttribute('rowspan'), 2, '[0][0]單元格rowspan');
});
test('選中兩行，插入行', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<table width="984"><tbody><tr><td width="307" valign="top">hello</td><td width="307" valign="top"></td><td width="307" valign="top"></td></tr><tr><td width="307" valign="top"></td><td width="307" valign="top"></td><td width="307" valign="top"></td></tr><tr><td width="307" valign="top"></td><td width="307" valign="top"></td><td width="307" valign="top"></td></tr></tbody></table>');
    var trs = editor.body.firstChild.getElementsByTagName('tr');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[0]);
    ut.setSelected(cellsRange);
    range.setStart(trs[0].cells[0], 0).collapse(true).select();
    editor.execCommand('insertrow');
    ut.clearSelected();
    equal(editor.body.getElementsByTagName('tr').length, 5, '選中兩行，前插行，3行變5行');
    trs = editor.body.firstChild.getElementsByTagName('tr');
    ua.manualDeleteFillData(trs[2]);
    equal(trs[2].cells[0].innerHTML,'hello','原來的第1行變成第3行');
    ut = editor.getUETable(editor.body.firstChild);
    cellsRange = ut.getCellsRange(trs[2].cells[0], trs[3].cells[0]);
    ut.setSelected(cellsRange);
    range.setStart(trs[2].cells[0], 0).collapse(true).select();
    editor.execCommand('insertrownext');
    ut.clearSelected();
    equal(editor.body.getElementsByTagName('tr').length, 7,'選中兩行，前插行，5行變7行');
    trs = editor.body.firstChild.getElementsByTagName('tr');
    ua.manualDeleteFillData(trs[2]);
    equal(trs[2].cells[0].innerHTML,'hello','');
});
test('選中兩列，插入列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<table width="984"><tbody><tr><td width="307" valign="top">hello</td><td width="307" valign="top"></td><td width="307" valign="top"></td></tr><tr><td width="307" valign="top"></td><td width="307" valign="top"></td><td width="307" valign="top"></td></tr><tr><td width="307" valign="top"></td><td width="307" valign="top"></td><td width="307" valign="top"></td></tr></tbody></table>');
    var trs = editor.body.firstChild.getElementsByTagName('tr');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[0].cells[1]);
    ut.setSelected(cellsRange);
    range.setStart(trs[0].cells[0], 0).collapse(true).select();
    editor.execCommand('insertcol');
    ut.clearSelected();
    equal(editor.body.getElementsByTagName('tr')[0].childNodes.length, 5, '選中兩列，前插列，3行變5列');
    trs = editor.body.firstChild.getElementsByTagName('tr');
    ua.manualDeleteFillData(trs[0]);
    equal(trs[0].cells[2].innerHTML,'hello','原來的第1列變成第3列');
    ut = editor.getUETable(editor.body.firstChild);
    cellsRange = ut.getCellsRange(trs[0].cells[2], trs[0].cells[3]);
    ut.setSelected(cellsRange);
    range.setStart(trs[0].cells[2], 0).collapse(true).select();
    editor.execCommand('insertcolnext');
    ut.clearSelected();
    equal(editor.body.getElementsByTagName('tr')[0].childNodes.length, 7,'選中兩列，前插列，5列變7列');
    trs = editor.body.firstChild.getElementsByTagName('tr');
    ua.manualDeleteFillData(trs[0]);
    equal(trs[0].cells[2].innerHTML,'hello','');
});
test('trace 3986 插入列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:3, numRows:3});
    ua.manualDeleteFillData(editor.body);
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('mergeright');
    range.setStart(tds[3], 0).collapse(true).select();
    editor.execCommand('insertcol');
    tds = editor.body.getElementsByTagName('td');
    equal(tds[0].getAttribute('colspan'), 3, '[0][0]單元格colspan');
    editor.undoManger.undo();
    equal(tds[0].getAttribute('colspan'), 2, '[0][0]單元格colspan');
    range.setStart(tds[1], 0).setCursor();
    editor.execCommand("insertcol");
    equal(tds[0].parentNode.cells.length, 3, "插入了一列")
});
test('帶th的表格，插入列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:3});
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0],0).collapse(true).select();
    editor.execCommand('inserttitle');
    stop();
    setTimeout(function(){
        var tds = editor.body.getElementsByTagName('td');
        range.setStart(tds[0], 0).collapse(true).select();
        editor.execCommand('insertcol');
        var ths = editor.body.getElementsByTagName('tr')[0].childNodes;
        equal(ths.length,3,'第一行有3個單元');
        for(var i=0;i<ths.length;i++){
            equal(ths[i].tagName.toLowerCase(),'th','第'+i+'個單元tagName是th');
        }
        start();
    },20);
});
test('原表格非第一行帶th，插入列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<table width="984"><tbody><tr><td width="471" valign="top"></td><td width="471" valign="top"></td></tr><tr><th width="471" valign="top"></th><td width="471" valign="top"></td></tr></tbody></table>');
    stop();
    setTimeout(function(){
        var trs = editor.body.getElementsByTagName('tr');
        range.setStart(trs[1].cells[0], 0).collapse(true).select();
        editor.execCommand('insertcolnext');
        trs = editor.body.getElementsByTagName('tr');
        equal(trs[1].childNodes.length, 3, '插入一列');
        equal(trs[1].cells[1].tagName.toLowerCase(), 'td', '除第一行以外，插入的不能是th');
        start();
    }, 20);
});

test('刪除行', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<table><tbody><tr><td width="483" valign="top">1</td><td width="483" valign="top">2</td></tr><tr><td width="483" valign="top">3</td><td width="483" valign="top">4</td></tr><tr><td width="483" valign="top">5</td><td width="483" valign="top">6</td></tr></tbody></table>');
    //

    stop();
    setTimeout(function () {
        var tds = editor.body.getElementsByTagName('td');
        range.setStart(tds[0], 0).collapse(1).select();
        editor.execCommand('deleterow');
        equal(editor.body.getElementsByTagName('tr').length, 2, '刪除行');
        editor.undoManger.undo();
        setTimeout(function () {
            equal(editor.body.getElementsByTagName('tr').length, 3, '撤銷後的行數');
            tds = editor.body.getElementsByTagName('td');
            range.setStart(tds[5], 0).collapse(1).select();
            editor.execCommand('deleterow');
            setTimeout(function () {
                equal(editor.body.getElementsByTagName('tr').length, 2, '刪除行');
                var table = editor.document.getElementsByTagName("table")[0];
                var cell = table.rows[0].cells[0];
                setTimeout(function () {
                    range.setStart(cell, 0).setCursor();
                    editor.execCommand("mergeDown");
                    equal(cell.rowSpan, 2, "合併了一行");
                    editor.execCommand("deleterow");
                    equal(table.rows.length, 1, "在合併的單元格中刪除行後，表格變成了一行");
                    start();
                }, 50);
            }, 50);
        }, 50);
    }, 50);
});
test('選中部分單元格，刪除行列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 3, numRows: 3});
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[0].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        editor.execCommand('deleterow');
        ut.clearSelected();
        equal(editor.body.getElementsByTagName('tr').length, 2, '選中部分單元格，刪除行');
        trs = editor.body.firstChild.getElementsByTagName('tr');
        ut = editor.getUETable(editor.body.firstChild);
        cellsRange = ut.getCellsRange(trs[0].cells[0], trs[0].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).setEnd(trs[0].cells[1], 1).select();
        editor.execCommand('deletecol');
        ut.clearSelected();
        equal(trs[0].childNodes.length, 1, '選中部分單元格，刪除列');
        trs = editor.body.firstChild.getElementsByTagName('tr');
        ut = editor.getUETable(editor.body.firstChild);
        cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[0]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        ut.clearSelected();
        editor.execCommand('deletecol');
        equal(editor.body.getElementsByTagName('table').length, 0, '刪除列至表格刪空');
        range.setStart(editor.body.firstChild, 0).collapse(true).select();
        editor.execCommand('inserttable', {numCols: 3, numRows: 3});
        trs = editor.body.firstChild.getElementsByTagName('tr');
        ut = editor.getUETable(editor.body.firstChild);
        cellsRange = ut.getCellsRange(trs[0].cells[0], trs[2].cells[0]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        editor.execCommand('deleterow');
        ut.clearSelected();
        equal(editor.body.getElementsByTagName('table').length, 0, '刪除列至表格刪空');
        start();
    }, 50);
    stop();
});
test('settablebackground', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p></p>' );
    range.setStart( editor.body.firstChild, 0 ).collapse( true ).select();
    editor.execCommand( 'inserttable', {numCols:2,numRows:2} );
    var tds = editor.body.firstChild.getElementsByTagName('td');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(tds[0], tds[2]);
    ut.setSelected(cellsRange);
    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand("settablebackground",{repeat:true,colorList:["#bbb","#ccc"]});
    setTimeout(function(){
        var br = ua.browser.ie?'':'<br>';
        var tds = editor.body.firstChild.getElementsByTagName('td');
        if(ua.browser.ie&&ua.browser.ie<9){
            ok( tds[0].style.backgroundColor === '#bbb', '選區隔行變色， 第一列第一行顏色匹配' );
            ok( tds[2].style.backgroundColor === '#ccc', '選區隔行變色， 第一列第二行顏色匹配' );
        }
        else{
            ok( tds[0].style.backgroundColor === 'rgb(187, 187, 187)', '選區隔行變色， 第一列第一行顏色匹配' );
            ok( tds[2].style.backgroundColor === 'rgb(204, 204, 204)', '選區隔行變色， 第一列第二行顏色匹配' );
        }
        range.setStart(tds[0], 0).collapse(true).select();
        editor.execCommand('cleartablebackground');
        setTimeout(function(){
            ok( tds[0].style.backgroundColor === '', '取消選區隔行變色， 第一列第一行顏色匹配' );
            ok( tds[2].style.backgroundColor === '', '取消選區隔行變色， 第一列第二行顏色匹配' );
            start();
        },20);
    },20);
    stop();
});
test('interlacetable', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:2});
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0], 0).collapse(1).select();
    editor.execCommand('interlacetable');
    stop();
    setTimeout(function () {
        equal(editor.body.firstChild.attributes['interlaced'].nodeValue, 'enabled', '');
        equal(editor.body.getElementsByTagName('tr')[0].className, 'ue-table-interlace-color-single firstRow', '');
        equal(editor.body.getElementsByTagName('tr')[1].className, 'ue-table-interlace-color-double', '');
        tds = editor.body.getElementsByTagName('td');
        range.setStart(tds[0], 0).collapse(1).select();
        editor.execCommand('uninterlacetable');
        setTimeout(function () {
            equal(editor.body.firstChild.attributes['interlaced'].nodeValue, 'disabled', '');
            equal(editor.body.getElementsByTagName('tr')[0].className, 'firstRow', '');
            start();
        }, 20);
    }, 20);
});
//
//*trace 750，1308*//*
//test( 'trace1308：前插入行的樣式和原先不同', function() {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent( '<p></p>' );
//    range.setStart( editor.body.firstChild, 0 ).collapse( true ).select();
//    editor.execCommand( 'inserttable', {numCols:2,numRows:2} );
//    ua.manualDeleteFillData( editor.body );
//    range.setStartAfter( editor.body.firstChild ).collapse( true ).select();
//    //cellborder:2,不支持了
//    editor.execCommand( 'inserttable', {border:2,numCols:2,numRows:2} );
//    var table2 = editor.body.getElementsByTagName( 'table' )[1];
//    range.setStart( table2.getElementsByTagName( 'td' )[0], 0 ).collapse( true ).select();
//    editor.execCommand( 'insertrow' );
//    var tds = table2.getElementsByTagName( 'td' );
//*//*firefox下用jquery的方式去不到border-width*//*
//    for(var index = 0;index<tds.length;index++)
//*//*邊框寬度加到table上了*//*
//equal(table2.getAttribute('border'),'2','表格邊框為2px');
////    equal( $( tds[index] ).css( 'border-width' ) || tds[index].style.borderWidth, '2px', '表格邊框為2px' );
////    for ( var index = 0; index < tds.length; index++ ) {
////        equal( $( tds[index ] ).css( 'border-width' ) || tds[index].style.borderWidth, '2px', '查看第' + (index + 1) + '個單元格的邊框' )
////    }
//} );

//*trace 749*//*
test('trace 749：拆分為列後2列都有文本', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:2});
    ua.manualDeleteFillData(editor.body);
    var tds = editor.body.getElementsByTagName('td');
    tds[1].innerHTML = 'hello';
    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('mergeright');
    var tr = editor.body.getElementsByTagName('tr')[0];
    equal($(tr.firstChild).attr('colspan'), '2', '跨度2列');
    editor.execCommand('splittocols');
    ua.manualDeleteFillData(editor.body);
    tds = editor.body.getElementsByTagName('td');
    //1.2版本，合併拆分之後hello前多了空的占位符
    ok(tds[0].innerHTML, '第一個單元格中有內容');
    ok(tds[1].innerHTML == '' || tds[1].innerHTML == '<br>', '第二個單元格中有內容');
});

//*trace 743*//*
test('trace 743：合併單元格後刪除列再撤銷', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:4, numRows:4});
    ua.manualDeleteFillData(editor.body);
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[0].cells[3]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();

        editor.execCommand('mergecells');
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        editor.execCommand('deleterow');
        trs = editor.body.getElementsByTagName('tr');
        equal(trs.length, 3, '刪除後只剩3個tr');
        editor.undoManger.undo();
        trs = editor.body.getElementsByTagName('tr');
        equal(trs.length, 4, '撤銷後有4個tr');
        equal($(trs[0].cells[0]).attr('colspan'), 4, '第一行的第一個單元格colspan為4');
        start();
    }, 50);
    stop();
});

//*trace 726*//*
test('trace 726：選中合併過的單元格和普通單元格，查看完全拆分單元格選單是否高亮', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:4, numRows:4});
    ua.manualDeleteFillData(editor.body);
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();

        editor.execCommand('mergecells');
        equal(editor.queryCommandState('splittocells'), 0, '應當可以拆分單元格');
        setTimeout(function () {
            var trs = editor.body.firstChild.getElementsByTagName('tr');
            var ut = editor.getUETable(editor.body.firstChild);
            var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[3].cells[3]);
            ut.setSelected(cellsRange);
            range.setStart(trs[0].cells[0], 0).collapse(true).select();
            editor.queryCommandState('splittocells');
            equal(editor.queryCommandState('splittocells'), -1, '應當不可以拆分單元格');
            start();
        }, 50);
    }, 50);
    stop();
});

//*trace 718*//*
test('trace 718：2次撤銷刪除列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:4, numRows:4});
    ua.manualDeleteFillData(editor.body);
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[1].cells[1], trs[2].cells[2]);
        ut.setSelected(cellsRange);
        range.setStart(trs[1].cells[1], 0).collapse(true).select();

        editor.execCommand('mergecells');
        equal(trs[1].cells[1].rowSpan, 2, 'rowspan 為2');
        equal(trs[1].cells[1].colSpan, 2, 'colspan 為2');
        editor.execCommand('deletecol');
        equal(trs[1].cells.length, 3, '3個td');
        editor.undoManger.undo();

        trs = editor.body.firstChild.getElementsByTagName('tr');
        equal(trs[1].cells.length, 3, '3個td');
        equal(trs[1].cells[1].rowSpan, 2, 'rowspan 為2');
        equal(trs[1].cells[1].colSpan, 2, 'colspan 為2');

        range.setStart(trs[1].cells[1], 0).collapse(1).select();
        editor.execCommand('deletecol');
        equal(trs[1].cells.length, 3, '3個td');
        equal(trs[1].cells[1].rowSpan, 2, 'rowspan 為2');
        ok(trs[1].cells[1].colSpan == undefined || trs[1].cells[1].colSpan == 1, 'colspan為1或者undefined');
        start();
    }, 50);
    stop();
});

//*trace 1098 *//*
test('trace 1098:多次合併單元格偶切換到源碼再切回來', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:3, numRows:3});
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[2].cells[0]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        editor.execCommand('mergecells');

        setTimeout(function () {
            trs = editor.body.firstChild.getElementsByTagName('tr');
            ut = editor.getUETable(editor.body.firstChild);
            cellsRange = ut.getCellsRange(trs[0].cells[1], trs[2].cells[0]);
            ut.setSelected(cellsRange);
            range.setStart(trs[0].cells[1], 0).collapse(true).select();
            editor.execCommand('mergecells');
//
            setTimeout(function () {
                trs = editor.body.firstChild.getElementsByTagName('tr');
                ut = editor.getUETable(editor.body.firstChild);
                cellsRange = ut.getCellsRange(trs[0].cells[2], trs[1].cells[0]);
                ut.setSelected(cellsRange);
                range.setStart(trs[0].cells[2], 0).collapse(true).select();
                editor.execCommand('mergecells');
                editor.execCommand('source');
                setTimeout(function () {
                    editor.execCommand('source');
                    setTimeout(function () {
                        trs = editor.body.firstChild.getElementsByTagName('tr');
                        equal(trs.length, 3, '3個tr');
                        equal(trs[0].cells[0].rowSpan, 3, '第一個單元格rowspan 3');
                        equal(trs[0].cells[1].rowSpan, 3, '第二個單元格rowspan 3');
                        equal(trs[0].cells.length, 3, '3個td');
                        equal(trs[1].cells.length, 0, '0個td');
                        equal(trs[2].cells.length, 1, '1個td');
                        start();
                    }, 50);
                }, 50);
            }, 50);
        }, 50);
    }, 50);
    stop();
});

//*trace 1307*//*
test('trace 1307:adjustTable--多次合併單元格切換到源碼再切回來--選中單元格瀏覽器會假死', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:4, numRows:4});
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[1].cells[0], trs[3].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[1].cells[0], 0).collapse(true).select();

        editor.execCommand('mergecells');
        setTimeout(function () {
            var trs = editor.body.firstChild.getElementsByTagName('tr');
            var ut = editor.getUETable(editor.body.firstChild);
            var cellsRange = ut.getCellsRange(trs[0].cells[2], trs[2].cells[0]);
            ut.setSelected(cellsRange);
            range.setStart(trs[0].cells[2], 0).collapse(true).select();
            editor.execCommand('mergecells');
            editor.execCommand('source');
            setTimeout(function () {
                editor.execCommand('source');
                setTimeout(function () {
                    trs = editor.body.getElementsByTagName('tr');
                    equal(trs[1].rowIndex, 1, '（1,1）行索引');
                    equal(trs[1].cells[0].cellIndex, 0, '（1,0）列索引');
                    equal(trs[1].cells[1].cellIndex, 1, '（1,1）列索引');
                    equal(trs[2].rowIndex, 2, '（2,2）行索引');
                    equal(trs[2].cells[0].cellIndex, 0, '（2,0）列索引');

                    equal(trs[1].cells[0].rowSpan, 3, '第二行第一個單元格rowspan 3');
                    equal(trs[1].cells[0].colSpan, 2, '第二行第一個單元格colspan 2');
                    equal(trs[0].cells[2].rowSpan, 3, '第一行第三個單元格rowspan 3');
                    equal(trs.length, 4, '4個tr');
                    equal(trs[0].cells.length, 4, '4個td');
                    equal(trs[1].cells.length, 2, '2個td');
                    equal(trs[2].cells.length, 1, '1個td');
                    equal(trs[3].cells.length, 2, '2個td');
                    start();
                }, 50);
            }, 50);
        }, 50);
    }, 50);
    stop();
});
//*//*trace 2378*//*
//test('不覆蓋原來的class',function(){
//    var editor = te.obj[0];
//    editor.setContent('<table class="asdf" border="0" cellspacing="1" cellpadding="3" width="332"><tbody><tr><td></td></tr></tbody></table>');
//    editor.execCommand('source');
//    editor.execCommand('source');
//    var table = editor.body.getElementsByTagName('table');
//    equal($(table).attr('class'),'asdf noBorderTable','table的class');
//});

//*trace 3121*//*
//*trace 3195*//*
test('單元格對齊方式-align', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:3, numRows:3});
    ua.manualDeleteFillData(editor.body);
    var trs = editor.body.firstChild.getElementsByTagName('tr');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[0].cells[2]);
    ut.setSelected(cellsRange);
    range.setStart(trs[0].cells[0], 0).collapse(true).select();

    editor.execCommand('mergecells');
    ut.clearSelected();
    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
    editor.execCommand('cellalign', 'center');
    ua.manualDeleteFillData(editor.body);
    var tds = editor.body.getElementsByTagName('td');
    equal(tds[0].align, 'center', '第一個單元格居中對齊');
    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('splittocols');
    tds = editor.body.getElementsByTagName('td');
    equal(tds[0].align, 'center', '第一個單元格居中對齊');
    equal(tds[1].align, 'center', '第二個單元格居中對齊');
    equal(tds[2].align, 'center', '第二個單元格居中對齊');
});

test('單元格對齊方式-vAlign', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:2});
    ua.manualDeleteFillData(editor.body);

    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
    editor.execCommand('mergedown');
    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
    editor.execCommand('cellvalign', 'middle');
    ua.manualDeleteFillData(editor.body);
    var tds = editor.body.getElementsByTagName('td');
    equal(tds[0].vAlign, 'middle', '第一個單元格居中對齊');
    range.setStart(tds[0], 0).collapse(true).select();
    editor.execCommand('splittorows');
    tds = editor.body.getElementsByTagName('td');
    equal(tds[0].vAlign, 'middle', '第一個單元格居中對齊');
    equal(tds[2].vAlign, 'middle', '第二個單元格居中對齊');
});

test('adaptbytext，adaptbywindow', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:2});
    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
    if(ua.browser.ie!=8)
        ok( editor.body.offsetWidth === editor.body.getElementsByTagName('table')[0].offsetWidth ,'默認按窗口計算寬度');//數值不具體計算了
    editor.execCommand('adaptbytext');//parseInt
    stop();
    setTimeout(function(){
        equal(editor.body.firstChild.width,'','按內容自適應')
        editor.execCommand('adaptbywindow');
        setTimeout(function(){
            ok((parseInt(editor.body.firstChild.width)-editor.body.offsetWidth/2)>0,'默認按窗口計算寬度');
            start();
        },20);
    },20);
});

test('deletetitle', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p></p>' );
    range.setStart( editor.body.firstChild, 0 ).collapse( true ).select();
    editor.execCommand( 'inserttable', {numCols:2, numRows:2});
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0],0).collapse(true).select();
    editor.execCommand('inserttitle');
    stop();
    setTimeout(function(){
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        equal(trs.length,3,'表格增加一行');
        for(var i = 0; i< trs[0].childNodes.length;i++){
            equal(trs[0].childNodes[i].tagName.toLowerCase(),'th','增加的th');
        }
        range.setStart(tds[0],0).collapse(true).select();
        editor.execCommand('deletetitle');
        setTimeout(function(){
            equal(editor.body.firstChild.getElementsByTagName('tr').length,2,'表格減少一行');
            equal(editor.body.firstChild.getElementsByTagName('tr')[0].firstChild.tagName.toLowerCase(),'td','第一行不是標題');
            start();
        },20);
    },20);
});

/*trace 3222*/
test('trace 3222：在合併後的單元格中按tab鍵', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable');
    ua.manualDeleteFillData(editor.body);
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[1].cells[1], trs[2].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[1].cells[1], 0).collapse(true).select();

        editor.execCommand('mergecells');
        trs[1].cells[2].innerHTML = 'asd';
        range.setStart(trs[1].cells[1], 0).collapse(true).select();
        ua.keydown(editor.body, {'keyCode':9});
        if (ua.browser.gecko||ua.browser.webkit)
            equal(editor.selection.getRange().startContainer.innerHTML, 'asd', '第一次tab鍵');
        else
            equal(editor.selection.getRange().startContainer.data, 'asd', '第一次tab鍵');
        range.setStart(trs[1].cells[1], 0).collapse(true).select();
        ua.keydown(editor.body, {'keyCode':9});
        if (ua.browser.gecko||ua.browser.webkit)
            equal(editor.selection.getRange().startContainer.innerHTML, 'asd', '第二次tab鍵');
        else
            equal(editor.selection.getRange().startContainer.data, 'asd', '第二次tab鍵');
        start();
    }, 50);
    stop();
});

/*trace 3191*/
test('trace 3191：刪除表格名稱', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable');
    setTimeout(function () {
        var tds = editor.body.getElementsByTagName('td');
        range.setStart(tds[0], 0).collapse(true).select();
        editor.execCommand('insertcaption');
        range.setStart(editor.body.getElementsByTagName('caption')[0], 0).collapse(true).select();
        editor.execCommand('deletecaption');
        equal(editor.body.getElementsByTagName('caption').length, '0', '表格名稱被刪除');
        range.setStart(editor.body.firstChild, 0).collapse(true).select();
        ua.keydown(editor.body, {keyCode: 90, ctrlKey: true});
        equal(editor.body.getElementsByTagName('caption').length, '1', '表格名稱被還原');
        start();
    }, 50);
    stop();
});

/*trace 3195*/
test('trace 3195：合併單元格後刪除列再撤銷', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:4, numRows:4});
    ua.manualDeleteFillData(editor.body);
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        trs[0].cells[1].innerHTML = 'asd';
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[2].cells[2]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();

        editor.execCommand('mergecells');
        range.setStart(trs[0].cells[0], 0).collapse(true).select();
        editor.execCommand('splittocols');
        trs = editor.body.getElementsByTagName('tr');
        equal(trs.length, 4, '4個tr');
        equal(trs[0].cells.length, 4, '4個td');
        equal(trs[1].cells.length, 1, '1個td');
        equal(trs[2].cells.length, 1, '1個td');
        equal(trs[3].cells.length, 4, '4個td');
        equal(trs[0].cells[0].vAlign, 'top', '單元格[0][0]的vAlign');
        equal(trs[0].cells[0].align, '', '單元格[0][0]的align');
        equal(trs[0].cells[1].vAlign, 'top', '單元格[0][1]的vAlign');
        equal(trs[0].cells[2].vAlign, 'top', '單元格[0][2]的vAlign');
        if (ua.browser.ie) {
            equal(trs[0].cells[1].align, '', '單元格[0][1]的align');
            equal(trs[0].cells[2].align, '', '單元格[0][2]的align');
        } else {
            equal(trs[0].cells[1].align, 'null', '單元格[0][1]的align');
            equal(trs[0].cells[2].align, 'null', '單元格[0][2]的align');
        }
        start();
    }, 50);
    stop();
});

/*trace 3231*/
test(' trace 3779 trace 3231：向右合併--拆分成列', function () {
    if(ua.browser.ie&& ua.browser.ie>8)return;//todo
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:2, numRows:2});
    setTimeout(function () {
        ua.manualDeleteFillData(editor.body);
        var tds = editor.body.getElementsByTagName('td');
        tds[1].innerHTML = 'asd';
        range.setStart(tds[1], 0).collapse(true).select();
        editor.execCommand('insertcolnext');
        ua.manualDeleteFillData(editor.body);
        equal(editor.body.getElementsByTagName('tr')[0].cells.length, '3', '3列');
        equal(editor.body.getElementsByTagName('td')[1].innerHTML, 'asd', '後插入行');
        var br = ua.browser.ie ? '' : '<br>';
        equal(editor.body.getElementsByTagName('td')[2].innerHTML, br, '後插入行');
        range.setStart(editor.body.getElementsByTagName('td')[2], 0).collapse(true).select();
        editor.execCommand('insertrownext');
        equal(editor.body.getElementsByTagName('tr').length, 3, '3行');
        editor.execCommand('deletecol');
        equal(editor.body.getElementsByTagName('td')[1].innerHTML, 'asd', '');
        equal(editor.body.getElementsByTagName('td').length, '6', '');
        start();
    }, 50);
    stop();
});
//test('標題行中底紋',function(){
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent( '<p></p>' );
//    range.setStart( editor.body.firstChild, 0 ).collapse( true ).select();
//    editor.execCommand( 'inserttable');
//    var tds = editor.body.getElementsByTagName('td');
//    range.setStart(tds[0],0).collapse(true).select();
//    editor.execCommand('inserttitle');
//
//    var ut = editor.getUETable(editor.body.firstChild);
//    var ths = editor.body.getElementsByTagName('th');
//    var cellsRange = ut.getCellsRange(ths[0],ths[4]);
//    ut.setSelected(cellsRange);
//    range.setStart( ths[0], 0 ).collapse( true ).select();
//    editor.execCommand('interlacetable');
//    ut.clearSelected();
//    equal(ths[0].style.backgroundColor,'red','紅色');
////    equal(editor.queryCommandState('settablebackground'),-1,'命令不可用');
//});

/*trace 713*/
test('trace 713：合併最後一列單元格後再前插入列', function () {
    if(ua.browser.ie)//TODO 1.2.6
        return;
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols:3, numRows:3});
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[2], trs[2].cells[2]);
        /*合併最後一列的單元格*/
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[2], 0).collapse(true).select();

        editor.execCommand('mergecells');
        setTimeout(function () {
            equal($(trs[0].cells[2]).attr('rowspan'), 3, '跨3行');
            editor.execCommand('insertcol');
            setTimeout(function () {
                /*前插入列*/
                trs = editor.body.getElementsByTagName('tr');
                equal(trs[0].cells.length, 4, '4列');
                equal($(trs[0].cells[3]).attr('rowspan'), 3, '跨3行');
                start();
            }, 50);
        }, 50);
    }, 50);
    stop();
});


test('inserttitlecol, deletetitlecol', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p></p>' );
    range.setStart( editor.body.firstChild, 0 ).collapse( true ).select();
    editor.execCommand( 'inserttable', {numCols:2, numRows:2});
    var tds = editor.body.getElementsByTagName('td');
    range.setStart(tds[0],0).collapse(true).select();
    editor.execCommand('inserttitlecol');
    stop();
    setTimeout(function(){
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        equal(trs[0].children.length,3,'表格增加一列');
        for(var i = 0; i< trs.length;i++){
            equal(trs[i].childNodes[0].tagName.toLowerCase(),'th','增加的th');
        }
        range.setStart(tds[0],0).collapse(true).select();
        editor.execCommand('deletetitlecol');
        setTimeout(function(){
            equal(trs[0].children.length,2,'表格減少一列');
            equal(editor.body.firstChild.getElementsByTagName('tr')[0].firstChild.tagName.toLowerCase(),'td','第一列不是標題');
            start();
        },20);
    },20);
});
/*trace 3216*/
test('contextMenu trace 3216：前插入行', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    stop();
    var lang = editor.getLang("contextMenu");
    editor.execCommand('cleardoc');
    editor.execCommand('inserttable');
    var tds = editor.body.getElementsByTagName('td');
    tds[0].innerHTML = 'asd';
    range.setStart(tds[0], 0).collapse(true).select();
    ua.contextmenu(editor.body.firstChild);
    var menutable = document.getElementsByClassName("edui-menu-body")[1];
    var forTable = document.getElementsByClassName('edui-for-table');
    if (ua.browser.ie) {
        ua.mouseenter(forTable[forTable.length - 1]);
    } else {
        ua.mouseover(forTable[forTable.length - 1]);
    }
    setTimeout(function () {
        lang = editor.getLang("contextMenu");
        ua.click(menutable.childNodes[6]);
        equal(editor.body.getElementsByTagName('tr').length, 6, '前插入行後有6行');
        equal(ua.getChildHTML(editor.body.getElementsByTagName('td')[5]), 'asd', '原單元格中文本未改變');
        setTimeout(function () {
            document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
            te.dom.push(editor.container);
            start();
        }, 200);
    }, 200);
});
test('contextMenu 選區背景隔行', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    stop();
    var lang = editor.getLang("contextMenu");
    editor.execCommand('cleardoc');
    editor.execCommand('inserttable');
    var trs = editor.body.firstChild.getElementsByTagName('tr');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
    ut.setSelected(cellsRange);
    range.setStart(trs[0].cells[0], 0).collapse(true).select();
    ua.contextmenu(editor.body.firstChild);
    var menutableBody = document.getElementsByClassName("edui-menu-body")[3];
    var forTable = document.getElementsByClassName('edui-for-table');
    if (ua.browser.ie) {
        ua.mouseenter(forTable[forTable.length - 1]);
    } else {
        ua.mouseover(forTable[forTable.length - 1]);
    }
    setTimeout(function () {
        lang = editor.getLang("contextMenu");
        equal(menutableBody.childNodes.length, 4, '4個子項目');
        if (browser.gecko) {
            equal(menutableBody.textContent, '表格隔行變色選區背景隔行紅藍相間三色漸變', '檢查menu顯示的字符');
        }
        else {
            equal(menutableBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), '表格隔行變色選區背景隔行紅藍相間三色漸變', '檢查menu顯示的字符');
        }
        ua.click(menutableBody.childNodes[1]);
        ut.clearSelected();
        trs = editor.body.getElementsByTagName('tr');
        if (ua.browser.ie == 8) {
            equal(trs[0].cells[0].style.backgroundColor, '#bbb', '第一行');
            equal(trs[1].cells[1].style.backgroundColor, '#ccc', '第二行');
        } else {
            equal(trs[0].cells[0].style.backgroundColor, 'rgb(187, 187, 187)', '第一行');
            equal(trs[1].cells[1].style.backgroundColor, 'rgb(204, 204, 204)', '第二行');
        }
        cellsRange = ut.getCellsRange(trs[0].cells[2], trs[1].cells[3]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[2], 0).collapse(true).select();
        ua.contextmenu(editor.body.firstChild);
        menutableBody = document.getElementsByClassName("edui-menu-body")[3];
        forTable = document.getElementsByClassName('edui-for-table');
        if (ua.browser.ie) {
            ua.mouseenter(forTable[forTable.length - 1]);
        } else {
            ua.mouseover(forTable[forTable.length - 1]);
        }
        setTimeout(function () {
            lang = editor.getLang("contextMenu");
            equal(menutableBody.childNodes.length, 4, '4個子項目');
            ua.click(menutableBody.childNodes[2]);
            ut.clearSelected();
            trs = editor.body.getElementsByTagName('tr');
            equal(trs[0].cells[2].style.backgroundColor, 'red', '第一行');
            equal(trs[1].cells[3].style.backgroundColor, 'blue', '第二行');
            ut = editor.getUETable(editor.body.firstChild);
            cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[3]);
            ut.setSelected(cellsRange);
            range.setStart(trs[0].cells[0], 0).collapse(true).select();
            ua.contextmenu(editor.body.firstChild);
            menutableBody = document.getElementsByClassName("edui-menu-body")[3];
            forTable = document.getElementsByClassName('edui-for-table');
            if (ua.browser.ie) {
                ua.mouseenter(forTable[forTable.length - 1]);
            } else {
                ua.mouseover(forTable[forTable.length - 1]);
            }
            setTimeout(function () {
                lang = editor.getLang("contextMenu");
                ua.click(menutableBody.childNodes[2]);
                trs = editor.body.getElementsByTagName('tr');
                equal(trs[1].cells[2].style.backgroundColor, '', '取消背景隔行');
                setTimeout(function () {
                    document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
                    te.dom.push(editor.container);
                    start();
                }, 200);
            }, 200);
        }, 200);
    }, 200);
});

test('contextMenu 三色漸變', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

    stop();

    editor.execCommand('cleardoc');
    editor.execCommand('inserttable');
    var tds = editor.body.getElementsByTagName('td');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(tds[0], tds[16]);
    ut.setSelected(cellsRange);
    range.setStart(tds[0], 0).collapse(true).select();
    ua.contextmenu(editor.body.firstChild);
    var menutable = document.getElementsByClassName("edui-menu-body")[3];
    var forTable = document.getElementsByClassName('edui-for-table');
    if (ua.browser.ie) {
        ua.mouseenter(forTable[forTable.length - 1]);
    } else {
        ua.mouseover(forTable[forTable.length - 1]);
    }
    ua.click(menutable.childNodes[3]);
    ut.clearSelected();
    tds = editor.body.getElementsByTagName('td');
    if (ua.browser.ie == 8) {
        equal(tds[0].style.backgroundColor, '#aaa', '第一行');
        equal(tds[6].style.backgroundColor, '#bbb', '第二行');
        equal(tds[11].style.backgroundColor, '#ccc', '第二行');
    } else {
        equal(tds[0].style.backgroundColor, 'rgb(170, 170, 170)', '第一行');
        equal(tds[6].style.backgroundColor, 'rgb(187, 187, 187)', '第二行');
        equal(tds[11].style.backgroundColor, 'rgb(204, 204, 204)', '第二行');
    }
    setTimeout(function () {
        document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
        te.dom.push(editor.container);
        start();
    }, 20);
});

/*trace 3210*/
test('contextMenu trace 3210：添加單元格背景色', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 3, numRows: 3});
    var trs = editor.body.firstChild.getElementsByTagName('tr');
    var ut = editor.getUETable(editor.body.firstChild);
    var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
    ut.setSelected(cellsRange);
    range.setStart(trs[0].cells[0], 0).collapse(true).select();
    editor.execCommand('edittd','#ff0000');
    stop();
    setTimeout(function () {
        var tds = editor.body.firstChild.getElementsByTagName('td');
        equal(tds[2].style.backgroundColor, '', '背景色不變');
        equal(ua.formatColor(tds[0].style.backgroundColor), '#ff0000', '添加單元格背景色');
        equal(ua.formatColor(tds[4].style.backgroundColor), '#ff0000', '添加單元格背景色');
        start();
    }, 50);

});
/*trace 3099*/
test('contextMenu trace 3099: 清除邊框顏色', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p></p>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('inserttable', {numCols: 3, numRows: 3});
    var trs = editor.body.firstChild.getElementsByTagName('tr');

    range.setStart(trs[0].cells[0], 0).collapse(true).select();
    editor.execCommand('edittable','#ff0000');
    stop();
    setTimeout(function () {
        var tds = editor.body.firstChild.getElementsByTagName('td');
        equal(ua.formatColor(tds[0].style.borderColor), '#ff0000', '添加邊框顏色');
        equal(ua.formatColor(tds[2].style.borderColor), '#ff0000', '添加邊框顏色');
        editor.execCommand('edittable','');
        setTimeout(function () {
            equal(tds[0].style.borderColor, '', '邊框顏色被清除');
            start();
        }, 50);
    }, 50);
//    var div = document.body.appendChild(document.createElement('div'));
//    div.id = 'ue';
//    var editor = UE.getEditor('ue');
//    stop();
//    editor.ready(function () {
//        var range = new baidu.editor.dom.Range(editor.document);
//        var lang = editor.getLang("contextMenu");
//        editor.execCommand('cleardoc');
//        editor.execCommand('inserttable');
//        setTimeout(function () {
//            range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
//            ua.contextmenu(editor.body.firstChild);
//            var menutable = document.getElementsByClassName("edui-menu-body")[1];
//            var forTable = document.getElementsByClassName('edui-for-table');
//            if (ua.browser.ie&&ua.browser.ie<9) {
//                ua.mouseenter(forTable[forTable.length - 1]);
//            } else {
//                ua.mouseover(forTable[forTable.length - 1]);
//            }
//            lang = editor.getLang("contextMenu");
//            ua.click(menutable.childNodes[menutable.childNodes.length-1]);//點開表格屬性
//            setTimeout(function () {
//                var iframe = document.getElementsByTagName('iframe');
//                var iframe1 ;
//                for (var i = iframe.length-1; i >-1; i--) {
//                    if (iframe[i].id && iframe[i].id.indexOf('edui') != -1) {
//                        iframe1 = iframe[i];
//                        break;
//                    }
//                }
//
//                iframe1.contentDocument.getElementById('J_tone').value = '#ff0000';
//                var buttonBody = document.getElementsByClassName('edui-dialog edui-for-edittable edui-default edui-state-centered')[0].firstChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.firstChild;
//                ua.click(buttonBody);
//                setTimeout(function () {
//                    var tds = editor.body.getElementsByTagName('td');
//                    if (ua.browser.ie == 8)
//                        equal(tds[0].style.borderColor, '#ff0000', '邊框顏色設置為紅色');
//                    else {
//                        equal(tds[0].style.borderColor, 'rgb(255, 0, 0)', '邊框顏色設置為紅色');
//                    }
//                    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
//                    ua.contextmenu(editor.body.firstChild);
//                    menutable = document.getElementsByClassName("edui-menu-body")[1];
//                    forTable = document.getElementsByClassName('edui-for-table');
//                    if (ua.browser.ie&&ua.browser.ie<9) {
//                        ua.mouseenter(forTable[forTable.length - 1]);
//                    } else {
//                        ua.mouseover(forTable[forTable.length - 1]);
//                    }
//                    lang = editor.getLang("contextMenu");
//                    ua.click(menutable.childNodes[menutable.childNodes.length-1]);
//                    setTimeout(function () {
//                        iframe = document.getElementsByTagName('iframe');
//                        iframe1 = null;
//                        for (var i = iframe.length-1; i >-1; i--) {
//                            if (iframe[i].id.indexOf('edui') != -1) {
//                                iframe1 = iframe[i];
//                                break;
//                            }
//                        }
//                        ua.click(iframe1.contentDocument.getElementById('J_tone'));
//                        setTimeout(function () {
//                            var div_nocolor = document.getElementsByClassName('edui-colorpicker-nocolor');
//                            ua.click(div_nocolor[0]);
//                            var buttonBody = document.getElementsByClassName('edui-dialog edui-for-edittable edui-default edui-state-centered')[1].firstChild.firstChild.lastChild.firstChild.firstChild.firstChild.firstChild.firstChild;
//                            ua.click(buttonBody);
//                            tds = editor.body.getElementsByTagName('td');
//                            equal(tds[0].style.borderColor, '', '邊框顏色被清除');
//                            setTimeout(function () {
//                                UE.delEditor('ue');
//                                document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
//                                te.dom.push(document.getElementById('ue'));
//                                start();
//                            }, 200);
//                        }, 200);
//                    }, 200);
//                }, 200);
//            }, 1000);
//        }, 200);
//    });
});
test('trace 3986 contextMenu 標題行中右插入列', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    stop();
    var lang = editor.getLang("contextMenu");
    editor.execCommand('cleardoc');
    editor.execCommand('inserttable');
    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
    editor.execCommand('inserttitle');
    range.setStart(editor.body.getElementsByTagName('th')[0], 0).collapse(true).select();
    ua.contextmenu(editor.body.firstChild);
    var menutable = document.getElementsByClassName("edui-menu-body")[1];
    var forTable = document.getElementsByClassName('edui-for-table');
    if (ua.browser.ie) {
        ua.mouseenter(forTable[forTable.length - 1]);
    } else {
        ua.mouseover(forTable[forTable.length - 1]);
    }
    setTimeout(function () {
        lang = editor.getLang("contextMenu");
        equal(menutable.childNodes.length, 15, '15個子項目');//當光標在th[0]時,有15個項目
        /*trace 3197：沒有後插行選項*/
        var innerText = lang.deletetable + lang.deleterow+ lang.deletecol + lang.insertcolnext + lang.insertcaption + lang.deletetitle +lang.inserttitlecol+ lang.mergeright + lang.edittd + lang.edittable+lang.setbordervisible;
        if (browser.gecko) {
            equal(menutable.textContent, innerText, '檢查menu顯示的字符');
        } else {
            equal(menutable.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), innerText, '檢查menu顯示的字符');
        }
        ua.click(menutable.childNodes[4]);
        equal(editor.body.getElementsByTagName('tr')[0].cells.length, 6, '左插入列後有6列');
        setTimeout(function () {
            document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
            te.dom.push(editor.container);
            start();
        }, 200);
    });
});
/*trace 3060*/
test('contextMenu trace 3060：單元格對齊方式', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    stop();

    var lang = editor.getLang("contextMenu");
    editor.execCommand('cleardoc');
    editor.execCommand('inserttable');
    editor.body.getElementsByTagName('td')[0].innerHTML = 'asd';
    range.setStart(editor.body.firstChild.firstChild.firstChild.firstChild, 0).collapse(true).select();
    ua.contextmenu(editor.body.firstChild);
    var menutableBody = document.getElementsByClassName("edui-for-aligntd")[0];
    setTimeout(function () {
        lang = editor.getLang("contextMenu");
        ua.click(menutableBody.childNodes[0]);
        var div = document.getElementsByClassName('edui-cellalignpicker-body')[0];
        equal(div.childNodes[0].getElementsByTagName('td').length, 9, '9種單元格對齊方式');
        ua.click(div.childNodes[0].childNodes[0].childNodes[1].childNodes[2].firstChild);
        setTimeout(function () {
            var tds = editor.body.getElementsByTagName('td');
            equal(tds[0].align, 'right', '水平靠右');
            equal(tds[0].vAlign, 'middle', '垂直居中');

            if(ua.browser.ie>8){
                equal(editor.selection.getRange().startContainer.tagName.toLowerCase(), 'td', '光標位於單元格中');

            }else{
                equal(editor.selection.getRange().startContainer.parentNode.tagName.toLowerCase(), 'td', '光標位於單元格中');
            }
            setTimeout(function () {
//                te.dom.push(editor.container);
//                document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
                start();
            }, 20);
        }, 200);
    }, 200);
//    });
});
/*trace 3315*/
/*trace 3411*/
test('contextMenu trace 3315：表格隔行變色', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var lang = editor.getLang("contextMenu");
    editor.execCommand('cleardoc');
    editor.execCommand('inserttable');
    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
    ua.contextmenu(editor.body.firstChild);
    var menutableBody = document.getElementsByClassName("edui-menu-body")[8];
    var forTable = document.getElementsByClassName('edui-for-table');
    if (ua.browser.ie) {
        ua.mouseenter(forTable[forTable.length - 1]);
    } else {
        ua.mouseover(forTable[forTable.length - 1]);
    }
    setTimeout(function () {
        lang = editor.getLang("contextMenu");
        equal(menutableBody.childNodes.length, 1, '1個子項目');
        if (browser.gecko) {
            equal(menutableBody.textContent, '表格隔行變色', '檢查menu顯示的字符');
        }
        else {
            equal(menutableBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), '表格隔行變色', '檢查menu顯示的字符');
        }
        ua.click(menutableBody.childNodes[0]);
        var trs = editor.body.getElementsByTagName('tr');
        for (var i = 0; i < trs.length; i++) {
            if (i % 2 == 0) {
                ok(trs[i].className.indexOf('ue-table-interlace-color-single')>-1,'第' + i + '行：淺色行');
            } else {
                ok(trs[i].className.indexOf('ue-table-interlace-color-double')>-1,'第' + i + '行：深色行');
            }
        }
        range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
        ua.contextmenu(editor.body.firstChild);
        menutableBody = document.getElementsByClassName("edui-menu-body")[8];
        forTable = document.getElementsByClassName('edui-for-table');
        if (ua.browser.ie) {
            ua.mouseenter(forTable[forTable.length - 1]);
        } else {
            ua.mouseover(forTable[forTable.length - 1]);
        }
        setTimeout(function () {
            lang = editor.getLang("contextMenu");
            equal(menutableBody.childNodes.length, 1, '2個子項目');
            if (browser.gecko) {
                equal(menutableBody.textContent, '取消表格隔行變色', '檢查menu顯示的字符');
            }
            else {
                equal(menutableBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), '取消表格隔行變色', '檢查menu顯示的字符');
            }
            ua.click(menutableBody.childNodes[0]);
            //            equal(editor.body.getElementsByTagName('table')[0].interlaced,'disabled','取消表格隔行變色');
            ok(editor.body.getElementsByTagName('tr')[0].className.indexOf('ue-table-interlace-color')<0, '取消表格隔行變色');
            setTimeout(function () {
                document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
                te.dom.push(editor.container);
                start();
            }, 200);
        }, 200);
    }, 200);
    stop();
});
