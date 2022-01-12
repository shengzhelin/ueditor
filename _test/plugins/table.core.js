/**
 * Created with JetBrains PhpStorm.
 * User: taoqili
 * Date: 13-2-21
 * Time: 下午1:31
 * To change this template use File | Settings | File Templates.
 */
function getTable(str) {
    var div = document.getElementById("testTable");
    if (!div) {
        div = document.createElement("div");
        div.id = "testTable";
        document.body.appendChild(div);
    }
    div.innerHTML = "<table border='1'>" + str + "</table>";
    return div.firstChild;
}
UT = UE.UETable;
test("create UETable", function () {
    var table = getTable("<tr><td>ddd</td></tr>"),
        ut = new UT(table);
    ok(ut.table === table, "UT對象創建成功");
    ok(ut.colsNum == 1 && ut.rowsNum == 1, "單元格行、列數為1");
});

test("getMaxRows", function () {
    var table = getTable("<tr><td>1</td><td>2</td><td>3</td></tr>" +
            "<tr><td>1</td><td>2</td><td>3</td></tr>"),
        ut = new UT(table);
    var maxRows = ut.getMaxRows();
    equal(maxRows, 2, "最大行數為2");
    table = getTable("<tr><td rowspan='3'>1</td><td>2</td><td rowspan='2'>3</td></tr>" +
        "<tr><td>2</td></tr>");
    ut = new UT(table);
    maxRows = ut.getMaxRows();
    equal(maxRows, 3, "最大行數為3");
});
test("getMaxCols", function () {
    var table = getTable("<tr><td>1</td><td>2</td><td>3</td></tr>" +
            "<tr><td>1</td><td>2</td><td>3</td></tr>"),
        ut = new UT(table);
    var maxCols = ut.getMaxCols();
    equal(maxCols, 3, "最大列數為3");

    table = getTable("<tr><td rowspan='3'>1</td><td>2</td><td rowspan='2'>3</td></tr>" +
        "<tr><td>2</td><td colspan='3'></td></tr>");
    ut = new UT(table);
    maxCols = ut.getMaxCols();
    equal(maxCols, 6, "最大列數為6");
});

test("ie9 active trace 3728 getSameEndPosCells", function () {
    if(ua.browser.ie>9)return;
    var table = getTable("<tr><td rowspan='2'>1</td><td>2</td><td>3</td></tr><tr><td>2</td><td>3</td></tr>"),
        ut = new UT(table);
    var cell = table.rows[0].cells[0],
        cells1 = ut.getSameEndPosCells(cell, "x"),
        cells2 = ut.getSameEndPosCells(cell, "y");
    ok(cells1.length == 1, "獲取到同樣X軸結尾位置的cell1個");
    ok(cells2.length == 2, "獲取到同樣Y軸結尾位置的cell2個");
});

test("getHSideCell", function () {
    var table = getTable("<tr><td rowspan='2'>1</td><td>2</td><td>3</td></tr>" +
            "<tr><td>2</td><td>3</td></tr>"),
        ut = new UT(table);
    var rows = table.rows,
        cell = rows[1].cells[1],
        cell1 = ut.getHSideCell(cell),
        cell2 = ut.getHSideCell(cell, true);
    equal(cell1, rows[1].cells[0], "左邊單元格");
    equal(cell2, null, "位於右邊緣的單元格無右鄰居單元格");
    equal(ut.getHSideCell(rows[0][0]), null, "位於左邊緣的單元格無左鄰居單元格");
});

test("getVSideCell", function () {
    var table = getTable("<tr><td rowspan='2'>1</td><td>2</td><td>3</td></tr>" +
            "<tr><td>2</td><td>3</td></tr>"),
        ut = new UT(table);
    var rows = table.rows,
        cell = rows[1].cells[1],
        cell1 = ut.getVSideCell(cell),
        cell2 = ut.getVSideCell(cell, true),
        cell3 = ut.getVSideCell(cell, true, true);
    equal(cell1, rows[0].cells[2], "上邊單元格");
    equal(cell2, null, "位於下邊緣的單元格無下鄰居單元格");
    equal(cell3, null, "位於左邊緣的單元格無左鄰居單元格");
});
test("setCellContent", function () {
    var table = getTable("<tr><td rowspan='2'>1</td><td>2</td><td>3</td></tr>" +
            "<tr><td>2</td><td>3</td></tr>"),
        ut = new UT(table);
    var cell = table.rows[0].cells[0];
    ut.setCellContent(cell, "這是測試內容");
    equal(cell.innerHTML, "這是測試內容", "設置了正確的內容");
    ut.setCellContent(cell);
    equal(cell.innerHTML, browser.ie ? domUtils.fillChar : "<br>");
});

test("cloneCell", function () {
    var table = getTable("<tr><td style='border-top-color: red;border-bottom-color: green' rowspan='2'>1</td><td>2</td><td>3</td></tr>" +
            "<tr><td class='selectedClass'>2</td><td>3</td></tr>"),
        ut = new UT(table);

    var cell = ut.cloneCell(table.rows[0].cells[0]);
    equal(cell.rowSpan, 2, "clone了一個2行一列的單元格");
    equal(cell.style.borderTopColor, "green", "上邊框的顏色將會被下邊框取代");
    cell = ut.cloneCell(table.rows[0].cells[0], true);
    ok(cell.rowSpan, 1, "忽略被合併單元格時將會充值單元格的rowspan和colspan為1")
});


test("getCellsRange、getCells", function () {
    var table = getTable("<tr><td rowspan='2'>1</td><td>2</td><td>3</td></tr>" +
            "<tr><td class='selectedClass'>2</td><td>3</td></tr>"),
        ut = new UT(table);
    var range = ut.getCellsRange(table.rows[0].cells[1], table.rows[1].cells[0]);
    ok(range.beginRowIndex === 0 && range.beginColIndex === 1 && range.endRowIndex === 1 && range.endColIndex === 1, "獲取到range")

    var cells = ut.getCells(range);
    ok(cells.length == 2, "獲取到2個單元格");
    ok(cells[0] == table.rows[0].cells[1], "第一個單元格存在");
});

test("insertRow、deleterRow", function () {
    var table = getTable("<tr><td rowspan='2'>1</td><td>2</td><td>3</td></tr>" +
            "<tr><td class='selectedClass'>2</td><td>3</td></tr>"),
        ut = new UT(table);

    var cellPrototype = document.createElement("td");
    cellPrototype.innerHTML = "aa";
    cellPrototype.setAttribute("vAlign", "top");
    ut.insertRow(2, cellPrototype);
    ok(table.rows.length === 3, "行數變成3行");
    ok(table.rows[2].cells[0].getAttribute("vAlign") == "top", "新插入的單元格中包含原型單元格中的屬性");

});

test("mergeRight,mergeDown", function () {
    var table = getTable("<tr><td rowspan='3'>1</td><td>2</td><td>3</td><td rowspan='2'>4</td><td>5</td><td>6</td></tr>" +
            "<tr><td>2</td><td>3</td><td>5</td><td>6</td></tr>" +
            "<tr><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>"),
        ut = new UT(table);
    var cell = table.rows[0].cells[1];
    ut.mergeDown(cell);
    ok(cell.rowSpan === 2, "向下合併成功");

    ut.mergeDown(cell);
    ok(cell.rowSpan === 3, "向下合併成功");

    cell = cell.previousSibling;
    ut.mergeRight(cell);
    ok(cell.rowSpan === 3 && cell.colSpan === 2, "向右合併成功");

    equal(cell.parentNode.rowIndex, 0, "合併到了正確的位置")
});
test("mergeRange",function(){
    var table = getTable("<tr><td rowspan='3'>1</td><td>2</td><td>3</td><td rowspan='2'>4</td><td>5</td><td>6</td></tr>" +
            "<tr><td>2</td><td>3</td><td>5</td><td>6</td></tr>" +
            "<tr><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>"),
        ut = new UT(table);
    var range = ut.getCellsRange(table.rows[0].cells[1],table.rows[2].cells[3]);
    ut.setSelected(range);
    ut.mergeRange();
    ok(table.rows[0].cells[1].rowSpan===3,"合併選區")

});

test("split", function () {
    var table = getTable("<tr><td rowspan='3'>1</td><td>2</td><td>3</td><td rowspan='2' colspan='2'>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>2</td><td>3</td><td>6</td><td>7</td></tr>" +
            "<tr><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    var cell = table.rows[0].cells[0],
        num = table.getElementsByTagName("td").length;
    ut.splitToCells(cell);
    ok(cell.rowSpan == 1 && cell.colSpan == 1, "單元格被成功拆分");

    var newNum = table.getElementsByTagName("td").length;
    ok(num + 2 == newNum, "單元格數量增加了2個");

    cell = table.rows[0].cells[3];
    ut.splitToCols(cell);
    ok(cell.colSpan === 1 && cell.rowSpan == 2, "被拆分成了2列");


});

test("selectRow", function () {
    var table = getTable("<tr><td rowspan='3'>1</td><td>2</td><td>3</td><td rowspan='2' colspan='2'>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>2</td><td>3</td><td>6</td><td>7</td></tr>" +
            "<tr><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    ut.selectRow(1);
    equal(ut.selectedTds.length, table.getElementsByTagName("td").length, "選中了所有單元格")
    var cells = table.rows[1].cells,
        flag = false;
    utils.each(cells, function (cell) {
        if (cell.className == "") {
            flag = true;
        }
    });
    ok(!flag, "所有單元格都被選中");
    ok(ut.cellsRange.beginRowIndex === 0, "cellsRange正確");

});
test("selectTable", function () {
    var table = getTable("<tr><td rowspan='3'>1</td><td>2</td><td>3</td><td rowspan='2' colspan='2'>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>2</td><td>3</td><td>6</td><td>7</td></tr>" +
            "<tr><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    ut.selectTable();
    ok(ut.selectedTds.length === table.getElementsByTagName("td").length, "選中了整個表格")

});

test("setBackground", function () {
    var table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>21</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    ut.setBackground(table.getElementsByTagName("td"), "green");
    var cell = table.rows[1].cells[1];
    ok(cell.style.backgroundColor == "green", "單種背景顏色設置成功");

    ut.removeBackground(table.getElementsByTagName("td"));
    ok(cell.style.backgroundColor == "", "背景顏色被清除");

    ut.setBackground(table.getElementsByTagName("td"), {
        repeat:true,
        colorList:["green", "red"]
    });
    ok(table.rows[0].cells[0].style.backgroundColor == "green", "第一行的單元格為綠色");
    ok(table.rows[1].cells[0].style.backgroundColor == "red", "第二行的單元格為紅色");
    ok(table.rows[2].cells[0].style.backgroundColor == "green", "第三行的單元格為綠色");

    ut.removeBackground(table.getElementsByTagName("td"));
    ut.setBackground(table.getElementsByTagName("td"), {
        repeat:false,
        colorList:["green", "red"]
    });
    ok(table.rows[0].cells[0].style.backgroundColor == "green", "第一行的單元格為綠色");
    ok(table.rows[1].cells[0].style.backgroundColor == "red", "第二行的單元格為紅色");
    ok(table.rows[2].cells[0].style.backgroundColor == "", "第三行的單元格沒有顏色");

});

test("isFullRow isFullCol", function () {
    var table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>21</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    var range = ut.getCellsRange(table.rows[0].cells[0], table.rows[1].cells[1]);
    ut.setSelected(range);
    ok(!ut.isFullRow(), "不是整行");
    range = ut.getCellsRange(table.rows[0].cells[0], table.rows[0].cells[5]);
    ut.setSelected(range);
    ok(ut.isFullRow(), "是整行");

    range = ut.getCellsRange(table.rows[0].cells[0], table.rows[2].cells[0]);
    ut.setSelected(range);
    ok(ut.isFullCol(), "是整列");
    range = ut.getCellsRange(table.rows[0].cells[0], table.rows[1].cells[0]);
    ut.setSelected(range);
    ok(!ut.isFullCol(), "不是整列");
});

test("last", function () {
    var table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>21</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    var cell = table.rows[2].cells[5];
    ok(ut.isLastCell(cell), "是最後一個單元格");
    ok(!ut.isLastCell(table.rows[1].cells[0]), "不是最後一個單元格");
});
test("getNextCell", function () {
    var table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>21</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    var cell = table.rows[2].cells[5];
    var newCell = ut.getNextCell(cell);
    ok(newCell === table.rows[1].cells[5], "找到正確單元格");
    cell = table.rows[0].cells[4];
    newCell = ut.getNextCell(cell);
    ok(!newCell, "頂行不存在nextCell");
    newCell = ut.getNextCell(cell, true);
    ok(newCell === table.rows[1].cells[4], "獲取到下一行的單元格");

});

test("getPreviewCell",function(){
    var table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>21</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    var cell = table.rows[2].cells[5];
    var newCell = ut.getPreviewCell(cell);
    ok(newCell===cell.previousSibling,"找到前置單元格");
});

test("getLastCell", function () {
    var table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>21</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    var cell = ut.getLastCell();
    ok(cell === table.rows[2].cells[5], "找到最後一個單元格");
});

test("getTabNextCell", function () {
    var table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
            "<tr><td>21</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>"),
        ut = new UT(table);
    var rows = table.rows,
        cell = rows[0].cells[0];
    var newCell = ut.getTabNextCell(cell);
    ok(newCell === table.rows[0].cells[1], "找到最後一個單元格");
    newCell = ut.getTabNextCell(rows[0].cells[5]);
    ok(newCell === table.rows[1].cells[0], "找到下一行的第一個單元格");
});

//test("getSameStartPosXCells", function () {
//    var table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
//            "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
//            "<tr><td>21</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>"),
//        ut = new UT(table);
//    var cell = table.rows[0].cells[1];
//    var cells = ut.getSameStartPosXCells(cell);
//    equal(cells.length, 3, "獲取到三個單元格")
//
//    table = getTable("<tr><td>01</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
//        "<tr><td>11</td><td>2</td><td>3</td><td>4</td><td>6</td><td>7</td></tr>" +
//        "<tr><td>21</td><td colspan='2'>2</td><td>4</td><td>6</td><td>7</td></tr>");
//    ut = new UT(table);
//    cells = ut.getSameStartPosXCells(cell);
//    ok(cells.length === 2, "獲取到2個單元格");
//
//    cells = ut.getSameStartPosXCells(table.rows[0].cells[0]);
//    ok(cells.length===3,"獲取到三個單元格");
//
//});

