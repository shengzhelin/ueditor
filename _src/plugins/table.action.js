/**
 * Created with JetBrains PhpStorm.
 * User: taoqili
 * Date: 12-10-12
 * Time: 上午10:05
 * To change this template use File | Settings | File Templates.
 */
UE.plugins['table'] = function () {
    var me = this,
        tabTimer = null,
        //拖動計時器
        tableDragTimer = null,
        //雙擊計時器
        tableResizeTimer = null,
        //單元格最小寬度
        cellMinWidth = 5,
        isInResizeBuffer = false,
        //單元格邊框大小
        cellBorderWidth = 5,
        //鼠標偏移距離
        offsetOfTableCell = 10,
        //記錄在有限時間內的點擊狀態， 共有3個取值， 0, 1, 2。 0代表未初始化， 1代表單擊了1次，2代表2次
        singleClickState = 0,
        userActionStatus = null,
        //雙擊允許的時間範圍
        dblclickTime = 360,
        UT = UE.UETable,
        getUETable = function (tdOrTable) {
            return UT.getUETable(tdOrTable);
        },
        getUETableBySelected = function (editor) {
            return UT.getUETableBySelected(editor);
        },
        getDefaultValue = function (editor, table) {
            return UT.getDefaultValue(editor, table);
        },
        removeSelectedClass = function (cells) {
            return UT.removeSelectedClass(cells);
        };

    function showError(e) {
//        throw e;
    }
    me.ready(function(){
        var me = this;
        var orgGetText = me.selection.getText;
        me.selection.getText = function(){
            var table = getUETableBySelected(me);
            if(table){
                var str = '';
                utils.each(table.selectedTds,function(td){
                    str += td[browser.ie?'innerText':'textContent'];
                })
                return str;
            }else{
                return orgGetText.call(me.selection)
            }

        }
    })

    //處理拖動及框選相關方法
    var startTd = null, //鼠標按下時的錨點td
        currentTd = null, //當前鼠標經過時的td
        onDrag = "", //指示當前拖動狀態，其值可為"","h","v" ,分別表示未拖動狀態，橫向拖動狀態，縱向拖動狀態，用於鼠標移動過程中的判斷
        onBorder = false, //檢測鼠標按下時是否處在單元格邊緣位置
        dragButton = null,
        dragOver = false,
        dragLine = null, //模擬的拖動線
        dragTd = null;    //發生拖動的目標td

    var mousedown = false,
    //todo 判斷混亂模式
        needIEHack = true;

    me.setOpt({
        'maxColNum':20,
        'maxRowNum':100,
        'defaultCols':5,
        'defaultRows':5,
        'tdvalign':'top',
        'cursorpath':me.options.UEDITOR_HOME_URL + "themes/default/images/cursor_",
        'tableDragable':false,
        'classList':["ue-table-interlace-color-single","ue-table-interlace-color-double"]
    });
    me.getUETable = getUETable;
    var commands = {
        'deletetable':1,
        'inserttable':1,
        'cellvalign':1,
        'insertcaption':1,
        'deletecaption':1,
        'inserttitle':1,
        'deletetitle':1,
        "mergeright":1,
        "mergedown":1,
        "mergecells":1,
        "insertrow":1,
        "insertrownext":1,
        "deleterow":1,
        "insertcol":1,
        "insertcolnext":1,
        "deletecol":1,
        "splittocells":1,
        "splittorows":1,
        "splittocols":1,
        "adaptbytext":1,
        "adaptbywindow":1,
        "adaptbycustomer":1,
        "insertparagraph":1,
        "insertparagraphbeforetable":1,
        "averagedistributecol":1,
        "averagedistributerow":1
    };
    me.ready(function () {
        utils.cssRule('table',
            //選中的td上的樣式
            '.selectTdClass{background-color:#edf5fa !important}' +
                'table.noBorderTable td,table.noBorderTable th,table.noBorderTable caption{border:1px dashed #ddd !important}' +
                //插入的表格的默認樣式
                'table{margin-bottom:10px;border-collapse:collapse;display:table;}' +
                'td,th{padding: 5px 10px;border: 1px solid #DDD;}' +
                'caption{border:1px dashed #DDD;border-bottom:0;padding:3px;text-align:center;}' +
                'th{border-top:1px solid #BBB;background-color:#F7F7F7;}' +
                'table tr.firstRow th{border-top-width:2px;}' +
                '.ue-table-interlace-color-single{ background-color: #fcfcfc; } .ue-table-interlace-color-double{ background-color: #f7faff; }' +
                'td p{margin:0;padding:0;}', me.document);

        var tableCopyList, isFullCol, isFullRow;
        //注冊del/backspace事件
        me.addListener('keydown', function (cmd, evt) {
            var me = this;
            var keyCode = evt.keyCode || evt.which;

            if (keyCode == 8) {

                var ut = getUETableBySelected(me);
                if (ut && ut.selectedTds.length) {

                    if (ut.isFullCol()) {
                        me.execCommand('deletecol')
                    } else if (ut.isFullRow()) {
                        me.execCommand('deleterow')
                    } else {
                        me.fireEvent('delcells');
                    }
                    domUtils.preventDefault(evt);
                }

                var caption = domUtils.findParentByTagName(me.selection.getStart(), 'caption', true),
                    range = me.selection.getRange();
                if (range.collapsed && caption && isEmptyBlock(caption)) {
                    me.fireEvent('saveScene');
                    var table = caption.parentNode;
                    domUtils.remove(caption);
                    if (table) {
                        range.setStart(table.rows[0].cells[0], 0).setCursor(false, true);
                    }
                    me.fireEvent('saveScene');
                }

            }

            if (keyCode == 46) {

                ut = getUETableBySelected(me);
                if (ut) {
                    me.fireEvent('saveScene');
                    for (var i = 0, ci; ci = ut.selectedTds[i++];) {
                        domUtils.fillNode(me.document, ci)
                    }
                    me.fireEvent('saveScene');
                    domUtils.preventDefault(evt);

                }

            }
            if (keyCode == 13) {

                var rng = me.selection.getRange(),
                    caption = domUtils.findParentByTagName(rng.startContainer, 'caption', true);
                if (caption) {
                    var table = domUtils.findParentByTagName(caption, 'table');
                    if (!rng.collapsed) {

                        rng.deleteContents();
                        me.fireEvent('saveScene');
                    } else {
                        if (caption) {
                            rng.setStart(table.rows[0].cells[0], 0).setCursor(false, true);
                        }
                    }
                    domUtils.preventDefault(evt);
                    return;
                }
                if (rng.collapsed) {
                    var table = domUtils.findParentByTagName(rng.startContainer, 'table');
                    if (table) {
                        var cell = table.rows[0].cells[0],
                            start = domUtils.findParentByTagName(me.selection.getStart(), ['td', 'th'], true),
                            preNode = table.previousSibling;
                        if (cell === start && (!preNode || preNode.nodeType == 1 && preNode.tagName == 'TABLE' ) && domUtils.isStartInblock(rng)) {
                            var first = domUtils.findParent(me.selection.getStart(), function(n){return domUtils.isBlockElm(n)}, true);
                            if(first && ( /t(h|d)/i.test(first.tagName) || first ===  start.firstChild )){
                                me.execCommand('insertparagraphbeforetable');
                                domUtils.preventDefault(evt);
                            }

                        }
                    }
                }
            }

            if ((evt.ctrlKey || evt.metaKey) && evt.keyCode == '67') {
                tableCopyList = null;
                var ut = getUETableBySelected(me);
                if (ut) {
                    var tds = ut.selectedTds;
                    isFullCol = ut.isFullCol();
                    isFullRow = ut.isFullRow();
                    tableCopyList = [
                        [ut.cloneCell(tds[0],null,true)]
                    ];
                    for (var i = 1, ci; ci = tds[i]; i++) {
                        if (ci.parentNode !== tds[i - 1].parentNode) {
                            tableCopyList.push([ut.cloneCell(ci,null,true)]);
                        } else {
                            tableCopyList[tableCopyList.length - 1].push(ut.cloneCell(ci,null,true));
                        }

                    }
                }
            }
        });
        me.addListener("tablehasdeleted",function(){
            toggleDraggableState(this, false, "", null);
            if (dragButton)domUtils.remove(dragButton);
        });

        me.addListener('beforepaste', function (cmd, html) {
            var me = this;
            var rng = me.selection.getRange();
            if (domUtils.findParentByTagName(rng.startContainer, 'caption', true)) {
                var div = me.document.createElement("div");
                div.innerHTML = html.html;
                //trace:3729
                html.html = div[browser.ie9below ? 'innerText' : 'textContent'];
                return;
            }
            var table = getUETableBySelected(me);
            if (tableCopyList) {
                me.fireEvent('saveScene');
                var rng = me.selection.getRange();
                var td = domUtils.findParentByTagName(rng.startContainer, ['td', 'th'], true), tmpNode, preNode;
                if (td) {
                    var ut = getUETable(td);
                    if (isFullRow) {
                        var rowIndex = ut.getCellInfo(td).rowIndex;
                        if (td.tagName == 'TH') {
                            rowIndex++;
                        }
                        for (var i = 0, ci; ci = tableCopyList[i++];) {
                            var tr = ut.insertRow(rowIndex++, "td");
                            for (var j = 0, cj; cj = ci[j]; j++) {
                                var cell = tr.cells[j];
                                if (!cell) {
                                    cell = tr.insertCell(j)
                                }
                                cell.innerHTML = cj.innerHTML;
                                cj.getAttribute('width') && cell.setAttribute('width', cj.getAttribute('width'));
                                cj.getAttribute('vAlign') && cell.setAttribute('vAlign', cj.getAttribute('vAlign'));
                                cj.getAttribute('align') && cell.setAttribute('align', cj.getAttribute('align'));
                                cj.style.cssText && (cell.style.cssText = cj.style.cssText)
                            }
                            for (var j = 0, cj; cj = tr.cells[j]; j++) {
                                if (!ci[j])
                                    break;
                                cj.innerHTML = ci[j].innerHTML;
                                ci[j].getAttribute('width') && cj.setAttribute('width', ci[j].getAttribute('width'));
                                ci[j].getAttribute('vAlign') && cj.setAttribute('vAlign', ci[j].getAttribute('vAlign'));
                                ci[j].getAttribute('align') && cj.setAttribute('align', ci[j].getAttribute('align'));
                                ci[j].style.cssText && (cj.style.cssText = ci[j].style.cssText)
                            }
                        }
                    } else {
                        if (isFullCol) {
                            cellInfo = ut.getCellInfo(td);
                            var maxColNum = 0;
                            for (var j = 0, ci = tableCopyList[0], cj; cj = ci[j++];) {
                                maxColNum += cj.colSpan || 1;
                            }
                            me.__hasEnterExecCommand = true;
                            for (i = 0; i < maxColNum; i++) {
                                me.execCommand('insertcol');
                            }
                            me.__hasEnterExecCommand = false;
                            td = ut.table.rows[0].cells[cellInfo.cellIndex];
                            if (td.tagName == 'TH') {
                                td = ut.table.rows[1].cells[cellInfo.cellIndex];
                            }
                        }
                        for (var i = 0, ci; ci = tableCopyList[i++];) {
                            tmpNode = td;
                            for (var j = 0, cj; cj = ci[j++];) {
                                if (td) {
                                    td.innerHTML = cj.innerHTML;
                                    //todo 定制處理
                                    cj.getAttribute('width') && td.setAttribute('width', cj.getAttribute('width'));
                                    cj.getAttribute('vAlign') && td.setAttribute('vAlign', cj.getAttribute('vAlign'));
                                    cj.getAttribute('align') && td.setAttribute('align', cj.getAttribute('align'));
                                    cj.style.cssText && (td.style.cssText = cj.style.cssText);
                                    preNode = td;
                                    td = td.nextSibling;
                                } else {
                                    var cloneTd = cj.cloneNode(true);
                                    domUtils.removeAttributes(cloneTd, ['class', 'rowSpan', 'colSpan']);

                                    preNode.parentNode.appendChild(cloneTd)
                                }
                            }
                            td = ut.getNextCell(tmpNode, true, true);
                            if (!tableCopyList[i])
                                break;
                            if (!td) {
                                var cellInfo = ut.getCellInfo(tmpNode);
                                ut.table.insertRow(ut.table.rows.length);
                                ut.update();
                                td = ut.getVSideCell(tmpNode, true);
                            }
                        }
                    }
                    ut.update();
                } else {
                    table = me.document.createElement('table');
                    for (var i = 0, ci; ci = tableCopyList[i++];) {
                        var tr = table.insertRow(table.rows.length);
                        for (var j = 0, cj; cj = ci[j++];) {
                            cloneTd = UT.cloneCell(cj,null,true);
                            domUtils.removeAttributes(cloneTd, ['class']);
                            tr.appendChild(cloneTd)
                        }
                        if (j == 2 && cloneTd.rowSpan > 1) {
                            cloneTd.rowSpan = 1;
                        }
                    }

                    var defaultValue = getDefaultValue(me),
                        width = me.body.offsetWidth -
                            (needIEHack ? parseInt(domUtils.getComputedStyle(me.body, 'margin-left'), 10) * 2 : 0) - defaultValue.tableBorder * 2 - (me.options.offsetWidth || 0);
                    me.execCommand('insertHTML', '<table  ' +
                        ( isFullCol && isFullRow ? 'width="' + width + '"' : '') +
                        '>' + table.innerHTML.replace(/>\s*</g, '><').replace(/\bth\b/gi, "td") + '</table>')
                }
                me.fireEvent('contentchange');
                me.fireEvent('saveScene');
                html.html = '';
                return true;
            } else {
                var div = me.document.createElement("div"), tables;
                div.innerHTML = html.html;
                tables = div.getElementsByTagName("table");
                if (domUtils.findParentByTagName(me.selection.getStart(), 'table')) {
                    utils.each(tables, function (t) {
                        domUtils.remove(t)
                    });
                    if (domUtils.findParentByTagName(me.selection.getStart(), 'caption', true)) {
                        div.innerHTML = div[browser.ie ? 'innerText' : 'textContent'];
                    }
                } else {
                    utils.each(tables, function (table) {
                        removeStyleSize(table, true);
                        domUtils.removeAttributes(table, ['style', 'border']);
                        utils.each(domUtils.getElementsByTagName(table, "td"), function (td) {
                            if (isEmptyBlock(td)) {
                                domUtils.fillNode(me.document, td);
                            }
                            removeStyleSize(td, true);
//                            domUtils.removeAttributes(td, ['style'])
                        });
                    });
                }
                html.html = div.innerHTML;
            }
        });

        me.addListener('afterpaste', function () {
            utils.each(domUtils.getElementsByTagName(me.body, "table"), function (table) {
                if (table.offsetWidth > me.body.offsetWidth) {
                    var defaultValue = getDefaultValue(me, table);
                    table.style.width = me.body.offsetWidth - (needIEHack ? parseInt(domUtils.getComputedStyle(me.body, 'margin-left'), 10) * 2 : 0) - defaultValue.tableBorder * 2 - (me.options.offsetWidth || 0) + 'px'
                }
            })
        });
        me.addListener('blur', function () {
            tableCopyList = null;
        });
        var timer;
        me.addListener('keydown', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                var rng = me.selection.getRange(),
                    cell = domUtils.findParentByTagName(rng.startContainer, ['th', 'td'], true);
                if (cell) {
                    var table = cell.parentNode.parentNode.parentNode;
                    if (table.offsetWidth > table.getAttribute("width")) {
                        cell.style.wordBreak = "break-all";
                    }
                }

            }, 100);
        });
        me.addListener("selectionchange", function () {
            toggleDraggableState(me, false, "", null);
        });


        //內容變化時觸發索引更新
        //todo 可否考慮標記檢測，如果不涉及表格的變化就不進行索引重建和更新
        me.addListener("contentchange", function () {
            var me = this;
            //盡可能排除一些不需要更新的狀況
            hideDragLine(me);
            if (getUETableBySelected(me))return;
            var rng = me.selection.getRange();
            var start = rng.startContainer;
            start = domUtils.findParentByTagName(start, ['td', 'th'], true);
            utils.each(domUtils.getElementsByTagName(me.document, 'table'), function (table) {
                if (me.fireEvent("excludetable", table) === true) return;
                table.ueTable = new UT(table);
                //trace:3742
//                utils.each(domUtils.getElementsByTagName(me.document, 'td'), function (td) {
//
//                    if (domUtils.isEmptyBlock(td) && td !== start) {
//                        domUtils.fillNode(me.document, td);
//                        if (browser.ie && browser.version == 6) {
//                            td.innerHTML = '&nbsp;'
//                        }
//                    }
//                });
//                utils.each(domUtils.getElementsByTagName(me.document, 'th'), function (th) {
//                    if (domUtils.isEmptyBlock(th) && th !== start) {
//                        domUtils.fillNode(me.document, th);
//                        if (browser.ie && browser.version == 6) {
//                            th.innerHTML = '&nbsp;'
//                        }
//                    }
//                });
                table.onmouseover = function () {
                    me.fireEvent('tablemouseover', table);
                };
                table.onmousemove = function () {
                    me.fireEvent('tablemousemove', table);
                    me.options.tableDragable && toggleDragButton(true, this, me);
                    utils.defer(function(){
                        me.fireEvent('contentchange',50)
                    },true)
                };
                table.onmouseout = function () {
                    me.fireEvent('tablemouseout', table);
                    toggleDraggableState(me, false, "", null);
                    hideDragLine(me);
                };
                table.onclick = function (evt) {
                    evt = me.window.event || evt;
                    var target = getParentTdOrTh(evt.target || evt.srcElement);
                    if (!target)return;
                    var ut = getUETable(target),
                        table = ut.table,
                        cellInfo = ut.getCellInfo(target),
                        cellsRange,
                        rng = me.selection.getRange();
//                    if ("topLeft" == inPosition(table, mouseCoords(evt))) {
//                        cellsRange = ut.getCellsRange(ut.table.rows[0].cells[0], ut.getLastCell());
//                        ut.setSelected(cellsRange);
//                        return;
//                    }
//                    if ("bottomRight" == inPosition(table, mouseCoords(evt))) {
//
//                        return;
//                    }
                    if (inTableSide(table, target, evt, true)) {
                        var endTdCol = ut.getCell(ut.indexTable[ut.rowsNum - 1][cellInfo.colIndex].rowIndex, ut.indexTable[ut.rowsNum - 1][cellInfo.colIndex].cellIndex);
                        if (evt.shiftKey && ut.selectedTds.length) {
                            if (ut.selectedTds[0] !== endTdCol) {
                                cellsRange = ut.getCellsRange(ut.selectedTds[0], endTdCol);
                                ut.setSelected(cellsRange);
                            } else {
                                rng && rng.selectNodeContents(endTdCol).select();
                            }
                        } else {
                            if (target !== endTdCol) {
                                cellsRange = ut.getCellsRange(target, endTdCol);
                                ut.setSelected(cellsRange);
                            } else {
                                rng && rng.selectNodeContents(endTdCol).select();
                            }
                        }
                        return;
                    }
                    if (inTableSide(table, target, evt)) {
                        var endTdRow = ut.getCell(ut.indexTable[cellInfo.rowIndex][ut.colsNum - 1].rowIndex, ut.indexTable[cellInfo.rowIndex][ut.colsNum - 1].cellIndex);
                        if (evt.shiftKey && ut.selectedTds.length) {
                            if (ut.selectedTds[0] !== endTdRow) {
                                cellsRange = ut.getCellsRange(ut.selectedTds[0], endTdRow);
                                ut.setSelected(cellsRange);
                            } else {
                                rng && rng.selectNodeContents(endTdRow).select();
                            }
                        } else {
                            if (target !== endTdRow) {
                                cellsRange = ut.getCellsRange(target, endTdRow);
                                ut.setSelected(cellsRange);
                            } else {
                                rng && rng.selectNodeContents(endTdRow).select();
                            }
                        }
                    }
                };
            });

            switchBorderColor(me, true);
        });

        domUtils.on(me.document, "mousemove", mouseMoveEvent);

        domUtils.on(me.document, "mouseout", function (evt) {
            var target = evt.target || evt.srcElement;
            if (target.tagName == "TABLE") {
                toggleDraggableState(me, false, "", null);
            }
        });
        /**
         * 表格隔行變色
         */
        me.addListener("interlacetable",function(type,table,classList){
            if(!table) return;
            var me = this,
                rows = table.rows,
                len = rows.length,
                getClass = function(list,index,repeat){
                    return list[index] ? list[index] : repeat ? list[index % list.length]: "";
                };
            for(var i = 0;i<len;i++){
                rows[i].className = getClass( classList|| me.options.classList,i,true);
            }
        });
        me.addListener("uninterlacetable",function(type,table){
            if(!table) return;
            var me = this,
                rows = table.rows,
                classList = me.options.classList,
                len = rows.length;
            for(var i = 0;i<len;i++){
                domUtils.removeClasses( rows[i], classList );
            }
        });

        me.addListener("mousedown", mouseDownEvent);
        me.addListener("mouseup", mouseUpEvent);
        //拖動的時候觸發mouseup
        domUtils.on( me.body, 'dragstart', function( evt ){
            mouseUpEvent.call( me, 'dragstart', evt );
        });
        me.addOutputRule(function(root){
            utils.each(root.getNodesByTagName('div'),function(n){
                if (n.getAttr('id') == 'ue_tableDragLine') {
                    n.parentNode.removeChild(n);
                }
            });
        });

        var currentRowIndex = 0;
        me.addListener("mousedown", function () {
            currentRowIndex = 0;
        });
        me.addListener('tabkeydown', function () {
            var range = this.selection.getRange(),
                common = range.getCommonAncestor(true, true),
                table = domUtils.findParentByTagName(common, 'table');
            if (table) {
                if (domUtils.findParentByTagName(common, 'caption', true)) {
                    var cell = domUtils.getElementsByTagName(table, 'th td');
                    if (cell && cell.length) {
                        range.setStart(cell[0], 0).setCursor(false, true)
                    }
                } else {
                    var cell = domUtils.findParentByTagName(common, ['td', 'th'], true),
                        ua = getUETable(cell);
                    currentRowIndex = cell.rowSpan > 1 ? currentRowIndex : ua.getCellInfo(cell).rowIndex;
                    var nextCell = ua.getTabNextCell(cell, currentRowIndex);
                    if (nextCell) {
                        if (isEmptyBlock(nextCell)) {
                            range.setStart(nextCell, 0).setCursor(false, true)
                        } else {
                            range.selectNodeContents(nextCell).select()
                        }
                    } else {
                        me.fireEvent('saveScene');
                        me.__hasEnterExecCommand = true;
                        this.execCommand('insertrownext');
                        me.__hasEnterExecCommand = false;
                        range = this.selection.getRange();
                        range.setStart(table.rows[table.rows.length - 1].cells[0], 0).setCursor();
                        me.fireEvent('saveScene');
                    }
                }
                return true;
            }

        });
        browser.ie && me.addListener('selectionchange', function () {
            toggleDraggableState(this, false, "", null);
        });
        me.addListener("keydown", function (type, evt) {
            var me = this;
            //處理在表格的最後一個輸入tab產生新的表格
            var keyCode = evt.keyCode || evt.which;
            if (keyCode == 8 || keyCode == 46) {
                return;
            }
            var notCtrlKey = !evt.ctrlKey && !evt.metaKey && !evt.shiftKey && !evt.altKey;
            notCtrlKey && removeSelectedClass(domUtils.getElementsByTagName(me.body, "td"));
            var ut = getUETableBySelected(me);
            if (!ut) return;
            notCtrlKey && ut.clearSelected();
        });

        me.addListener("beforegetcontent", function () {
            switchBorderColor(this, false);
            browser.ie && utils.each(this.document.getElementsByTagName('caption'), function (ci) {
                if (domUtils.isEmptyNode(ci)) {
                    ci.innerHTML = '&nbsp;'
                }
            });
        });
        me.addListener("aftergetcontent", function () {
            switchBorderColor(this, true);
        });
        me.addListener("getAllHtml", function () {
            removeSelectedClass(me.document.getElementsByTagName("td"));
        });
        //修正全屏狀態下插入的表格寬度在非全屏狀態下撐開編輯器的情況
        me.addListener("fullscreenchanged", function (type, fullscreen) {
            if (!fullscreen) {
                var ratio = this.body.offsetWidth / document.body.offsetWidth,
                    tables = domUtils.getElementsByTagName(this.body, "table");
                utils.each(tables, function (table) {
                    if (table.offsetWidth < me.body.offsetWidth) return false;
                    var tds = domUtils.getElementsByTagName(table, "td"),
                        backWidths = [];
                    utils.each(tds, function (td) {
                        backWidths.push(td.offsetWidth);
                    });
                    for (var i = 0, td; td = tds[i]; i++) {
                        td.setAttribute("width", Math.floor(backWidths[i] * ratio));
                    }
                    table.setAttribute("width", Math.floor(getTableWidth(me, needIEHack, getDefaultValue(me))))
                });
            }
        });

        //重寫execCommand命令，用於處理框選時的處理
        var oldExecCommand = me.execCommand;
        me.execCommand = function (cmd, datatat) {

            var me = this,
                args = arguments;

            cmd = cmd.toLowerCase();
            var ut = getUETableBySelected(me), tds,
                range = new dom.Range(me.document),
                cmdFun = me.commands[cmd] || UE.commands[cmd],
                result;
            if (!cmdFun) return;
            if (ut && !commands[cmd] && !cmdFun.notNeedUndo && !me.__hasEnterExecCommand) {
                me.__hasEnterExecCommand = true;
                me.fireEvent("beforeexeccommand", cmd);
                tds = ut.selectedTds;
                var lastState = -2, lastValue = -2, value, state;
                for (var i = 0, td; td = tds[i]; i++) {
                    if (isEmptyBlock(td)) {
                        range.setStart(td, 0).setCursor(false, true)
                    } else {
                        range.selectNode(td).select(true);
                    }
                    state = me.queryCommandState(cmd);
                    value = me.queryCommandValue(cmd);
                    if (state != -1) {
                        if (lastState !== state || lastValue !== value) {
                            me._ignoreContentChange = true;
                            result = oldExecCommand.apply(me, arguments);
                            me._ignoreContentChange = false;

                        }
                        lastState = me.queryCommandState(cmd);
                        lastValue = me.queryCommandValue(cmd);
                        if (domUtils.isEmptyBlock(td)) {
                            domUtils.fillNode(me.document, td)
                        }
                    }
                }
                range.setStart(tds[0], 0).shrinkBoundary(true).setCursor(false, true);
                me.fireEvent('contentchange');
                me.fireEvent("afterexeccommand", cmd);
                me.__hasEnterExecCommand = false;
                me._selectionChange();
            } else {
                result = oldExecCommand.apply(me, arguments);
            }
            return result;
        };


    });
    /**
     * 刪除obj的寬高style，改成屬性寬高
     * @param obj
     * @param replaceToProperty
     */
    function removeStyleSize(obj, replaceToProperty) {
        removeStyle(obj, "width", true);
        removeStyle(obj, "height", true);
    }

    function removeStyle(obj, styleName, replaceToProperty) {
        if (obj.style[styleName]) {
            replaceToProperty && obj.setAttribute(styleName, parseInt(obj.style[styleName], 10));
            obj.style[styleName] = "";
        }
    }

    function getParentTdOrTh(ele) {
        if (ele.tagName == "TD" || ele.tagName == "TH") return ele;
        var td;
        if (td = domUtils.findParentByTagName(ele, "td", true) || domUtils.findParentByTagName(ele, "th", true)) return td;
        return null;
    }

    function isEmptyBlock(node) {
        var reg = new RegExp(domUtils.fillChar, 'g');
        if (node[browser.ie ? 'innerText' : 'textContent'].replace(/^\s*$/, '').replace(reg, '').length > 0) {
            return 0;
        }
        for (var n in dtd.$isNotEmpty) {
            if (node.getElementsByTagName(n).length) {
                return 0;
            }
        }
        return 1;
    }


    function mouseCoords(evt) {
        if (evt.pageX || evt.pageY) {
            return { x:evt.pageX, y:evt.pageY };
        }
        return {
            x:evt.clientX + me.document.body.scrollLeft - me.document.body.clientLeft,
            y:evt.clientY + me.document.body.scrollTop - me.document.body.clientTop
        };
    }

    function mouseMoveEvent(evt) {

        if( isEditorDisabled() ) {
            return;
        }

        try {

            //普通狀態下鼠標移動
            var target = getParentTdOrTh(evt.target || evt.srcElement),
                pos;

            //區分用戶的行為是拖動還是雙擊
            if( isInResizeBuffer  ) {

                me.body.style.webkitUserSelect = 'none';

                if( Math.abs( userActionStatus.x - evt.clientX ) > offsetOfTableCell || Math.abs( userActionStatus.y - evt.clientY ) > offsetOfTableCell ) {
                    clearTableDragTimer();
                    isInResizeBuffer = false;
                    singleClickState = 0;
                    //drag action
                    tableBorderDrag(evt);
                }
            }

            //修改單元格大小時的鼠標移動
            if (onDrag && dragTd) {
                singleClickState = 0;
                me.body.style.webkitUserSelect = 'none';
                me.selection.getNative()[browser.ie9below ? 'empty' : 'removeAllRanges']();
                pos = mouseCoords(evt);
                toggleDraggableState(me, true, onDrag, pos, target);
                if (onDrag == "h") {
                    dragLine.style.left = getPermissionX(dragTd, evt) + "px";
                } else if (onDrag == "v") {
                    dragLine.style.top = getPermissionY(dragTd, evt) + "px";
                }
                return;
            }
            //當鼠標處於table上時，修改移動過程中的光標狀態
            if (target) {
                //針對使用table作為容器的組件不觸發拖拽效果
                if (me.fireEvent('excludetable', target) === true)
                    return;
                pos = mouseCoords(evt);
                var state = getRelation(target, pos),
                    table = domUtils.findParentByTagName(target, "table", true);

                if (inTableSide(table, target, evt, true)) {
                    if (me.fireEvent("excludetable", table) === true) return;
                    me.body.style.cursor = "url(" + me.options.cursorpath + "h.png),pointer";
                } else if (inTableSide(table, target, evt)) {
                    if (me.fireEvent("excludetable", table) === true) return;
                    me.body.style.cursor = "url(" + me.options.cursorpath + "v.png),pointer";
                } else {
                    me.body.style.cursor = "text";
                    var curCell = target;
                    if (/\d/.test(state)) {
                        state = state.replace(/\d/, '');
                        target = getUETable(target).getPreviewCell(target, state == "v");
                    }
                    //位於第一行的頂部或者第一列的左邊時不可拖動
                    toggleDraggableState(me, target ? !!state : false, target ? state : '', pos, target);

                }
            } else {
                toggleDragButton(false, table, me);
            }

        } catch (e) {
            showError(e);
        }
    }

    var dragButtonTimer;

    function toggleDragButton(show, table, editor) {
        if (!show) {
            if (dragOver)return;
            dragButtonTimer = setTimeout(function () {
                !dragOver && dragButton && dragButton.parentNode && dragButton.parentNode.removeChild(dragButton);
            }, 2000);
        } else {
            createDragButton(table, editor);
        }
    }

    function createDragButton(table, editor) {
        var pos = domUtils.getXY(table),
            doc = table.ownerDocument;
        if (dragButton && dragButton.parentNode)return dragButton;
        dragButton = doc.createElement("div");
        dragButton.contentEditable = false;
        dragButton.innerHTML = "";
        dragButton.style.cssText = "width:15px;height:15px;background-image:url(" + editor.options.UEDITOR_HOME_URL + "dialogs/table/dragicon.png);position: absolute;cursor:move;top:" + (pos.y - 15) + "px;left:" + (pos.x) + "px;";
        domUtils.unSelectable(dragButton);
        dragButton.onmouseover = function (evt) {
            dragOver = true;
        };
        dragButton.onmouseout = function (evt) {
            dragOver = false;
        };
        domUtils.on(dragButton, 'click', function (type, evt) {
            doClick(evt, this);
        });
        domUtils.on(dragButton, 'dblclick', function (type, evt) {
            doDblClick(evt);
        });
        domUtils.on(dragButton, 'dragstart', function (type, evt) {
            domUtils.preventDefault(evt);
        });
        var timer;

        function doClick(evt, button) {
            // 部分瀏覽器下需要清理
            clearTimeout(timer);
            timer = setTimeout(function () {
                editor.fireEvent("tableClicked", table, button);
            }, 300);
        }

        function doDblClick(evt) {
            clearTimeout(timer);
            var ut = getUETable(table),
                start = table.rows[0].cells[0],
                end = ut.getLastCell(),
                range = ut.getCellsRange(start, end);
            editor.selection.getRange().setStart(start, 0).setCursor(false, true);
            ut.setSelected(range);
        }

        doc.body.appendChild(dragButton);
    }


//    function inPosition(table, pos) {
//        var tablePos = domUtils.getXY(table),
//            width = table.offsetWidth,
//            height = table.offsetHeight;
//        if (pos.x - tablePos.x < 5 && pos.y - tablePos.y < 5) {
//            return "topLeft";
//        } else if (tablePos.x + width - pos.x < 5 && tablePos.y + height - pos.y < 5) {
//            return "bottomRight";
//        }
//    }

    function inTableSide(table, cell, evt, top) {
        var pos = mouseCoords(evt),
            state = getRelation(cell, pos);

        if (top) {
            var caption = table.getElementsByTagName("caption")[0],
                capHeight = caption ? caption.offsetHeight : 0;
            return (state == "v1") && ((pos.y - domUtils.getXY(table).y - capHeight) < 8);
        } else {
            return (state == "h1") && ((pos.x - domUtils.getXY(table).x) < 8);
        }
    }

    /**
     * 獲取拖動時允許的X軸坐標
     * @param dragTd
     * @param evt
     */
    function getPermissionX(dragTd, evt) {
        var ut = getUETable(dragTd);
        if (ut) {
            var preTd = ut.getSameEndPosCells(dragTd, "x")[0],
                nextTd = ut.getSameStartPosXCells(dragTd)[0],
                mouseX = mouseCoords(evt).x,
                left = (preTd ? domUtils.getXY(preTd).x : domUtils.getXY(ut.table).x) + 20 ,
                right = nextTd ? domUtils.getXY(nextTd).x + nextTd.offsetWidth - 20 : (me.body.offsetWidth + 5 || parseInt(domUtils.getComputedStyle(me.body, "width"), 10));

            left += cellMinWidth;
            right -= cellMinWidth;

            return mouseX < left ? left : mouseX > right ? right : mouseX;
        }
    }

    /**
     * 獲取拖動時允許的Y軸坐標
     */
    function getPermissionY(dragTd, evt) {
        try {
            var top = domUtils.getXY(dragTd).y,
                mousePosY = mouseCoords(evt).y;
            return mousePosY < top ? top : mousePosY;
        } catch (e) {
            showError(e);
        }
    }

    /**
     * 移動狀態切換
     */
    function toggleDraggableState(editor, draggable, dir, mousePos, cell) {
        try {
            editor.body.style.cursor = dir == "h" ? "col-resize" : dir == "v" ? "row-resize" : "text";
            if (browser.ie) {
                if (dir && !mousedown && !getUETableBySelected(editor)) {
                    getDragLine(editor, editor.document);
                    showDragLineAt(dir, cell);
                } else {
                    hideDragLine(editor)
                }
            }
            onBorder = draggable;
        } catch (e) {
            showError(e);
        }
    }

    /**
     * 獲取與UETable相關的resize line
     * @param uetable UETable對象
     */
    function getResizeLineByUETable() {

        var lineId = '_UETableResizeLine',
            line = this.document.getElementById( lineId );

        if( !line ) {
            line = this.document.createElement("div");
            line.id = lineId;
            line.contnetEditable = false;
            line.setAttribute("unselectable", "on");

            var styles = {
                width: 2*cellBorderWidth + 1 + 'px',
                position: 'absolute',
                'z-index': 100000,
                cursor: 'col-resize',
                background: 'red',
                display: 'none'
            };

            //切換狀態
            line.onmouseout = function(){
                this.style.display = 'none';
            };

            utils.extend( line.style, styles );

            this.document.body.appendChild( line );

        }

        return line;

    }

    /**
     * 更新resize-line
     */
    function updateResizeLine( cell, uetable ) {

        var line = getResizeLineByUETable.call( this ),
            table = uetable.table,
            styles = {
                top: domUtils.getXY( table ).y + 'px',
                left: domUtils.getXY( cell).x + cell.offsetWidth - cellBorderWidth + 'px',
                display: 'block',
                height: table.offsetHeight + 'px'
            };

        utils.extend( line.style, styles );

    }

    /**
     * 顯示resize-line
     */
    function showResizeLine( cell ) {

        var uetable = getUETable( cell );

        updateResizeLine.call( this, cell, uetable );

    }

    /**
     * 獲取鼠標與當前單元格的相對位置
     * @param ele
     * @param mousePos
     */
    function getRelation(ele, mousePos) {
        var elePos = domUtils.getXY(ele);

        if( !elePos ) {
            return '';
        }

        if (elePos.x + ele.offsetWidth - mousePos.x < cellBorderWidth) {
            return "h";
        }
        if (mousePos.x - elePos.x < cellBorderWidth) {
            return 'h1'
        }
        if (elePos.y + ele.offsetHeight - mousePos.y < cellBorderWidth) {
            return "v";
        }
        if (mousePos.y - elePos.y < cellBorderWidth) {
            return 'v1'
        }
        return '';
    }

    function mouseDownEvent(type, evt) {

        if( isEditorDisabled() ) {
            return ;
        }

        userActionStatus = {
            x: evt.clientX,
            y: evt.clientY
        };

        //右鍵菜單單獨處理
        if (evt.button == 2) {
            var ut = getUETableBySelected(me),
                flag = false;

            if (ut) {
                var td = getTargetTd(me, evt);
                utils.each(ut.selectedTds, function (ti) {
                    if (ti === td) {
                        flag = true;
                    }
                });
                if (!flag) {
                    removeSelectedClass(domUtils.getElementsByTagName(me.body, "th td"));
                    ut.clearSelected()
                } else {
                    td = ut.selectedTds[0];
                    setTimeout(function () {
                        me.selection.getRange().setStart(td, 0).setCursor(false, true);
                    }, 0);

                }
            }
        } else {
            tableClickHander( evt );
        }

    }

    //清除表格的計時器
    function clearTableTimer() {
        tabTimer && clearTimeout( tabTimer );
        tabTimer = null;
    }

    //雙擊收縮
    function tableDbclickHandler(evt) {
        singleClickState = 0;
        evt = evt || me.window.event;
        var target = getParentTdOrTh(evt.target || evt.srcElement);
        if (target) {
            var h;
            if (h = getRelation(target, mouseCoords(evt))) {

                hideDragLine( me );

                if (h == 'h1') {
                    h = 'h';
                    if (inTableSide(domUtils.findParentByTagName(target, "table"), target, evt)) {
                        me.execCommand('adaptbywindow');
                    } else {
                        target = getUETable(target).getPreviewCell(target);
                        if (target) {
                            var rng = me.selection.getRange();
                            rng.selectNodeContents(target).setCursor(true, true)
                        }
                    }
                }
                if (h == 'h') {
                    var ut = getUETable(target),
                        table = ut.table,
                        cells = getCellsByMoveBorder( target, table, true );

                    cells = extractArray( cells, 'left' );

                    ut.width = ut.offsetWidth;

                    var oldWidth = [],
                        newWidth = [];

                    utils.each( cells, function( cell ){

                        oldWidth.push( cell.offsetWidth );

                    } );

                    utils.each( cells, function( cell ){

                        cell.removeAttribute("width");

                    } );

                    window.setTimeout( function(){

                        //是否允許改變
                        var changeable = true;

                        utils.each( cells, function( cell, index ){

                            var width = cell.offsetWidth;

                            if( width > oldWidth[index] ) {
                                changeable = false;
                                return false;
                            }

                            newWidth.push( width );

                        } );

                        var change = changeable ? newWidth : oldWidth;

                        utils.each( cells, function( cell, index ){

                            cell.width = change[index] - getTabcellSpace();

                        } );


                    }, 0 );

//                    minWidth -= cellMinWidth;
//
//                    table.removeAttribute("width");
//                    utils.each(cells, function (cell) {
//                        cell.style.width = "";
//                        cell.width -= minWidth;
//                    });

                }
            }
        }
    }

    function tableClickHander( evt ) {

        removeSelectedClass(domUtils.getElementsByTagName(me.body, "td th"));
        //trace:3113
        //選中單元格，點擊table外部，不會清掉table上掛的ueTable,會引起getUETableBySelected方法返回值
        utils.each(me.document.getElementsByTagName('table'), function (t) {
            t.ueTable = null;
        });
        startTd = getTargetTd(me, evt);
        if( !startTd ) return;
        var table = domUtils.findParentByTagName(startTd, "table", true);
        ut = getUETable(table);
        ut && ut.clearSelected();

        //判斷當前鼠標狀態
        if (!onBorder) {
            me.document.body.style.webkitUserSelect = '';
            mousedown = true;
            me.addListener('mouseover', mouseOverEvent);
        } else {
            //邊框上的動作處理
            borderActionHandler( evt );
        }


    }

    //處理表格邊框上的動作, 這里做延時處理，避免兩種動作互相影響
    function borderActionHandler( evt ) {

        if ( browser.ie ) {
            evt = reconstruct(evt );
        }

        clearTableDragTimer();

        //是否正在等待resize的緩沖中
        isInResizeBuffer = true;

        tableDragTimer = setTimeout(function(){
            tableBorderDrag( evt );
        }, dblclickTime);

    }

    function extractArray( originArr, key ) {

        var result = [],
            tmp = null;

        for( var i = 0, len = originArr.length; i<len; i++ ) {

            tmp = originArr[ i ][ key ];

            if( tmp ) {
                result.push( tmp );
            }

        }

        return result;

    }

    function clearTableDragTimer() {
        tableDragTimer && clearTimeout(tableDragTimer);
        tableDragTimer = null;
    }

    function reconstruct( obj ) {

        var attrs = ['pageX', 'pageY', 'clientX', 'clientY', 'srcElement', 'target'],
            newObj = {};

        if( obj ) {

            for( var i = 0, key, val; key = attrs[i]; i++ ) {
                val=obj[ key ];
                val && (newObj[ key ] = val);
            }

        }

        return newObj;

    }

    //邊框拖動
    function tableBorderDrag( evt ) {

        isInResizeBuffer = false;

        startTd = evt.target || evt.srcElement;
        if( !startTd ) return;
        var state = getRelation(startTd, mouseCoords(evt));
        if (/\d/.test(state)) {
            state = state.replace(/\d/, '');
            startTd = getUETable(startTd).getPreviewCell(startTd, state == 'v');
        }
        hideDragLine(me);
        getDragLine(me, me.document);
        me.fireEvent('saveScene');
        showDragLineAt(state, startTd);
        mousedown = true;
        //拖動開始
        onDrag = state;
        dragTd = startTd;
    }

    function mouseUpEvent(type, evt) {

        if( isEditorDisabled() ) {
            return ;
        }

        clearTableDragTimer();

        isInResizeBuffer = false;

        if( onBorder ) {
            singleClickState = ++singleClickState % 3;

            userActionStatus = {
                x: evt.clientX,
                y: evt.clientY
            };

            tableResizeTimer = setTimeout(function(){
                singleClickState > 0 && singleClickState--;
            }, dblclickTime );

            if( singleClickState === 2 ) {

                singleClickState = 0;
                tableDbclickHandler(evt);
                return;

            }

        }

        if (evt.button == 2)return;
        var me = this;
        //清除表格上原生跨選問題
        var range = me.selection.getRange(),
            start = domUtils.findParentByTagName(range.startContainer, 'table', true),
            end = domUtils.findParentByTagName(range.endContainer, 'table', true);

        if (start || end) {
            if (start === end) {
                start = domUtils.findParentByTagName(range.startContainer, ['td', 'th', 'caption'], true);
                end = domUtils.findParentByTagName(range.endContainer, ['td', 'th', 'caption'], true);
                if (start !== end) {
                    me.selection.clearRange()
                }
            } else {
                me.selection.clearRange()
            }
        }
        mousedown = false;
        me.document.body.style.webkitUserSelect = '';
        //拖拽狀態下的mouseUP
        if ( onDrag && dragTd ) {

            me.selection.getNative()[browser.ie9below ? 'empty' : 'removeAllRanges']();

            singleClickState = 0;
            dragLine = me.document.getElementById('ue_tableDragLine');

            // trace 3973
            if (dragLine) {
                var dragTdPos = domUtils.getXY(dragTd),
                    dragLinePos = domUtils.getXY(dragLine);

                switch (onDrag) {
                    case "h":
                        changeColWidth(dragTd, dragLinePos.x - dragTdPos.x);
                        break;
                    case "v":
                        changeRowHeight(dragTd, dragLinePos.y - dragTdPos.y - dragTd.offsetHeight);
                        break;
                    default:
                }
                onDrag = "";
                dragTd = null;

                hideDragLine(me);
                me.fireEvent('saveScene');
                return;
            }
        }
        //正常狀態下的mouseup
        if (!startTd) {
            var target = domUtils.findParentByTagName(evt.target || evt.srcElement, "td", true);
            if (!target) target = domUtils.findParentByTagName(evt.target || evt.srcElement, "th", true);
            if (target && (target.tagName == "TD" || target.tagName == "TH")) {
                if (me.fireEvent("excludetable", target) === true) return;
                range = new dom.Range(me.document);
                range.setStart(target, 0).setCursor(false, true);
            }
        } else {
            var ut = getUETable(startTd),
                cell = ut ? ut.selectedTds[0] : null;
            if (cell) {
                range = new dom.Range(me.document);
                if (domUtils.isEmptyBlock(cell)) {
                    range.setStart(cell, 0).setCursor(false, true);
                } else {
                    range.selectNodeContents(cell).shrinkBoundary().setCursor(false, true);
                }
            } else {
                range = me.selection.getRange().shrinkBoundary();
                if (!range.collapsed) {
                    var start = domUtils.findParentByTagName(range.startContainer, ['td', 'th'], true),
                        end = domUtils.findParentByTagName(range.endContainer, ['td', 'th'], true);
                    //在table里邊的不能清除
                    if (start && !end || !start && end || start && end && start !== end) {
                        range.setCursor(false, true);
                    }
                }
            }
            startTd = null;
            me.removeListener('mouseover', mouseOverEvent);
        }
        me._selectionChange(250, evt);
    }

    function mouseOverEvent(type, evt) {

        if( isEditorDisabled() ) {
            return;
        }

        var me = this,
            tar = evt.target || evt.srcElement;
        currentTd = domUtils.findParentByTagName(tar, "td", true) || domUtils.findParentByTagName(tar, "th", true);
        //需要判斷兩個TD是否位於同一個表格內
        if (startTd && currentTd &&
            ((startTd.tagName == "TD" && currentTd.tagName == "TD") || (startTd.tagName == "TH" && currentTd.tagName == "TH")) &&
            domUtils.findParentByTagName(startTd, 'table') == domUtils.findParentByTagName(currentTd, 'table')) {
            var ut = getUETable(currentTd);
            if (startTd != currentTd) {
                me.document.body.style.webkitUserSelect = 'none';
                me.selection.getNative()[browser.ie9below ? 'empty' : 'removeAllRanges']();
                var range = ut.getCellsRange(startTd, currentTd);
                ut.setSelected(range);
            } else {
                me.document.body.style.webkitUserSelect = '';
                ut.clearSelected();
            }

        }
        evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
    }

    function setCellHeight(cell, height, backHeight) {
        var lineHight = parseInt(domUtils.getComputedStyle(cell, "line-height"), 10),
            tmpHeight = backHeight + height;
        height = tmpHeight < lineHight ? lineHight : tmpHeight;
        if (cell.style.height) cell.style.height = "";
        cell.rowSpan == 1 ? cell.setAttribute("height", height) : (cell.removeAttribute && cell.removeAttribute("height"));
    }

    function getWidth(cell) {
        if (!cell)return 0;
        return parseInt(domUtils.getComputedStyle(cell, "width"), 10);
    }

    function changeColWidth(cell, changeValue) {

        var ut = getUETable(cell);
        if (ut) {

            //根據當前移動的邊框獲取相關的單元格
            var table = ut.table,
                cells = getCellsByMoveBorder( cell, table );

            table.style.width = "";
            table.removeAttribute("width");

            //修正改變量
            changeValue = correctChangeValue( changeValue, cell, cells );

            if (cell.nextSibling) {

                var i=0;

                utils.each( cells, function( cellGroup ){

                    cellGroup.left.width = (+cellGroup.left.width)+changeValue;
                    cellGroup.right && ( cellGroup.right.width = (+cellGroup.right.width)-changeValue );

                } );

            } else {

                utils.each( cells, function( cellGroup ){
                    cellGroup.left.width -= -changeValue;
                } );

            }
        }

    }

    function isEditorDisabled() {
        return me.body.contentEditable === "false";
    }

    function changeRowHeight(td, changeValue) {
        if (Math.abs(changeValue) < 10) return;
        var ut = getUETable(td);
        if (ut) {
            var cells = ut.getSameEndPosCells(td, "y"),
            //備份需要連帶變化的td的原始高度，否則後期無法獲取正確的值
                backHeight = cells[0] ? cells[0].offsetHeight : 0;
            for (var i = 0, cell; cell = cells[i++];) {
                setCellHeight(cell, changeValue, backHeight);
            }
        }

    }

    /**
     * 獲取調整單元格大小的相關單元格
     * @isContainMergeCell 返回的結果中是否包含發生合並後的單元格
     */
    function getCellsByMoveBorder( cell, table, isContainMergeCell ) {

        if( !table ) {
            table = domUtils.findParentByTagName( cell, 'table' );
        }

        if( !table ) {
            return null;
        }

        //獲取到該單元格所在行的序列號
        var index = domUtils.getNodeIndex( cell ),
            temp = cell,
            rows = table.rows,
            colIndex = 0;

        while( temp ) {
            //獲取到當前單元格在未發生單元格合並時的序列
            if( temp.nodeType === 1 ) {
                colIndex += (temp.colSpan || 1);
            }
            temp = temp.previousSibling;
        }

        temp = null;

        //記錄想關的單元格
        var borderCells = [];

        utils.each(rows, function( tabRow ){

            var cells = tabRow.cells,
                currIndex = 0;

            utils.each( cells, function( tabCell ){

                currIndex += (tabCell.colSpan || 1);

                if( currIndex === colIndex ) {

                    borderCells.push({
                        left: tabCell,
                        right: tabCell.nextSibling || null
                    });

                    return false;

                } else if( currIndex > colIndex ) {

                    if( isContainMergeCell ) {
                        borderCells.push({
                            left: tabCell
                        });
                    }

                    return false;
                }


            } );

        });

        return borderCells;

    }


    /**
     * 通過給定的單元格集合獲取最小的單元格width
     */
    function getMinWidthByTableCells( cells ) {

        var minWidth = Number.MAX_VALUE;

        for( var i = 0, curCell; curCell = cells[ i ] ; i++ ) {

            minWidth = Math.min( minWidth, curCell.width || getTableCellWidth( curCell ) );

        }

        return minWidth;

    }

    function correctChangeValue( changeValue, relatedCell, cells ) {

        //為單元格的paading預留空間
        changeValue -= getTabcellSpace();

        if( changeValue < 0 ) {
            return 0;
        }

        changeValue -= getTableCellWidth( relatedCell );

        //確定方向
        var direction = changeValue < 0 ? 'left':'right';

        changeValue = Math.abs(changeValue);

        //只關心非最後一個單元格就可以
        utils.each( cells, function( cellGroup ){

            var curCell = cellGroup[direction];

            //為單元格保留最小空間
            if( curCell ) {
                changeValue = Math.min( changeValue, getTableCellWidth( curCell )-cellMinWidth );
            }


        } );


        //修正越界
        changeValue = changeValue < 0 ? 0 : changeValue;

        return direction === 'left' ? -changeValue : changeValue;

    }

    function getTableCellWidth( cell ) {

        var width = 0,
            //偏移糾正量
            offset = 0,
            width = cell.offsetWidth - getTabcellSpace();

        //最後一個節點糾正一下
        if( !cell.nextSibling ) {

            width -= getTableCellOffset( cell );

        }

        width = width < 0 ? 0 : width;

        try {
            cell.width = width;
        } catch(e) {
        }

        return width;

    }

    /**
     * 獲取單元格所在表格的最末單元格的偏移量
     */
    function getTableCellOffset( cell ) {

        tab = domUtils.findParentByTagName( cell, "table", false);

        if( tab.offsetVal === undefined ) {

            var prev = cell.previousSibling;

            if( prev ) {

                //最後一個單元格和前一個單元格的width diff結果 如果恰好為一個border width， 則條件成立
                tab.offsetVal = cell.offsetWidth - prev.offsetWidth === UT.borderWidth ? UT.borderWidth : 0;

            } else {
                tab.offsetVal = 0;
            }

        }

        return tab.offsetVal;

    }

    function getTabcellSpace() {

        if( UT.tabcellSpace === undefined ) {

            var cell = null,
                tab = me.document.createElement("table"),
                tbody = me.document.createElement("tbody"),
                trow = me.document.createElement("tr"),
                tabcell = me.document.createElement("td"),
                mirror = null;

            tabcell.style.cssText = 'border: 0;';
            tabcell.width = 1;

            trow.appendChild( tabcell );
            trow.appendChild( mirror = tabcell.cloneNode( false ) );

            tbody.appendChild( trow );

            tab.appendChild( tbody );

            tab.style.cssText = "visibility: hidden;";

            me.body.appendChild( tab );

            UT.paddingSpace = tabcell.offsetWidth - 1;

            var tmpTabWidth = tab.offsetWidth;

            tabcell.style.cssText = '';
            mirror.style.cssText = '';

            UT.borderWidth = ( tab.offsetWidth - tmpTabWidth ) / 3;

            UT.tabcellSpace = UT.paddingSpace + UT.borderWidth;

            me.body.removeChild( tab );

        }

        getTabcellSpace = function(){ return UT.tabcellSpace; };

        return UT.tabcellSpace;

    }

    function getDragLine(editor, doc) {
        if (mousedown)return;
        dragLine = editor.document.createElement("div");
        domUtils.setAttributes(dragLine, {
            id:"ue_tableDragLine",
            unselectable:'on',
            contenteditable:false,
            'onresizestart':'return false',
            'ondragstart':'return false',
            'onselectstart':'return false',
            style:"background-color:blue;position:absolute;padding:0;margin:0;background-image:none;border:0px none;opacity:0;filter:alpha(opacity=0)"
        });
        editor.body.appendChild(dragLine);
    }

    function hideDragLine(editor) {
        if (mousedown)return;
        var line;
        while (line = editor.document.getElementById('ue_tableDragLine')) {
            domUtils.remove(line)
        }
    }

    /**
     * 依據state（v|h）在cell位置顯示橫線
     * @param state
     * @param cell
     */
    function showDragLineAt(state, cell) {
        if (!cell) return;
        var table = domUtils.findParentByTagName(cell, "table"),
            caption = table.getElementsByTagName('caption'),
            width = table.offsetWidth,
            height = table.offsetHeight - (caption.length > 0 ? caption[0].offsetHeight : 0),
            tablePos = domUtils.getXY(table),
            cellPos = domUtils.getXY(cell), css;
        switch (state) {
            case "h":
                css = 'height:' + height + 'px;top:' + (tablePos.y + (caption.length > 0 ? caption[0].offsetHeight : 0)) + 'px;left:' + (cellPos.x + cell.offsetWidth);
                dragLine.style.cssText = css + 'px;position: absolute;display:block;background-color:blue;width:1px;border:0; color:blue;opacity:.3;filter:alpha(opacity=30)';
                break;
            case "v":
                css = 'width:' + width + 'px;left:' + tablePos.x + 'px;top:' + (cellPos.y + cell.offsetHeight );
                //必須加上border:0和color:blue，否則低版ie不支持背景色顯示
                dragLine.style.cssText = css + 'px;overflow:hidden;position: absolute;display:block;background-color:blue;height:1px;border:0;color:blue;opacity:.2;filter:alpha(opacity=20)';
                break;
            default:
        }
    }

    /**
     * 當表格邊框顏色為白色時設置為虛線,true為添加虛線
     * @param editor
     * @param flag
     */
    function switchBorderColor(editor, flag) {
        var tableArr = domUtils.getElementsByTagName(editor.body, "table"), color;
        for (var i = 0, node; node = tableArr[i++];) {
            var td = domUtils.getElementsByTagName(node, "td");
            if (td[0]) {
                if (flag) {
                    color = (td[0].style.borderColor).replace(/\s/g, "");
                    if (/(#ffffff)|(rgb\(255,255,255\))/ig.test(color))
                        domUtils.addClass(node, "noBorderTable")
                } else {
                    domUtils.removeClasses(node, "noBorderTable")
                }
            }

        }
    }

    function getTableWidth(editor, needIEHack, defaultValue) {
        var body = editor.body;
        return body.offsetWidth - (needIEHack ? parseInt(domUtils.getComputedStyle(body, 'margin-left'), 10) * 2 : 0) - defaultValue.tableBorder * 2 - (editor.options.offsetWidth || 0);
    }

    /**
     * 獲取當前拖動的單元格
     */
    function getTargetTd(editor, evt) {

        var target = domUtils.findParentByTagName(evt.target || evt.srcElement, ["td", "th"], true),
            dir = null;

        if( !target ) {
            return null;
        }

        dir = getRelation( target, mouseCoords( evt ) );

        //如果有前一個節點， 需要做一個修正， 否則可能會得到一個錯誤的td

        if( !target ) {
            return null;
        }

        if( dir === 'h1' && target.previousSibling ) {

            var position = domUtils.getXY( target),
                cellWidth = target.offsetWidth;

            if( Math.abs( position.x + cellWidth - evt.clientX ) > cellWidth / 3 ) {
                target = target.previousSibling;
            }

        } else if( dir === 'v1' && target.parentNode.previousSibling ) {

            var position = domUtils.getXY( target),
                cellHeight = target.offsetHeight;

            if( Math.abs( position.y + cellHeight - evt.clientY ) > cellHeight / 3 ) {
                target = target.parentNode.previousSibling.firstChild;
            }

        }


        //排除了非td內部以及用於代碼高亮部分的td
        return target && !(editor.fireEvent("excludetable", target) === true) ? target : null;
    }

};
