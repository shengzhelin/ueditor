///**
// * Created by JetBrains PhpStorm.
// * User: dongyancen
// * Date: 12-9-19
// * Time: 下午4:19
// * To change this template use File | Settings | File Templates.
// */
module('plugins.contextmenu');

//test('stop', function () {stop();});
test('基本右鍵菜單', function () {
    var editor = te.obj[0];
    stop();

        ua.contextmenu(editor.body);
        var lang = editor.getLang("contextMenu");
        equal(document.getElementsByClassName("edui-menu-body").length, 3, '默認3個menu,一個主的，一個段落格式，一個表格');
        var menuBody = document.getElementsByClassName("edui-menu-body")[0];
        equal(menuBody.parentNode.parentNode.parentNode.style.display, '', '第一個menu顯示');
        equal(menuBody.childNodes.length, 11, '第一個menu8個items3個分隔線');
//    var space = browser.webkit||ua.browser.ie==9?"\n":'';
        var innerText = lang['selectall'] + lang.cleardoc + lang.paragraph + lang.table + lang.insertparagraphbefore + lang.insertparagraphafter + lang['copy'] + lang['paste'];
        if (browser.gecko) {
            equal(menuBody.textContent, innerText, '檢查menu顯示的字符');
        }
        else {
            equal(menuBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), innerText, '檢查menu顯示的字符');
        }
        ok(menuBody.childNodes[0].className.indexOf("edui-for-selectall") > -1, '檢查menu樣式');
        var menuparagraphBody = document.getElementsByClassName("edui-menu-body")[1];
        equal(menuparagraphBody.parentNode.parentNode.parentNode.style.display, 'none', '第二個menu隱藏');
        var menutableBody = document.getElementsByClassName("edui-menu-body")[2];
        if (ua.browser.ie) {
            ua.mouseenter(menuBody.childNodes[3]);
        } else {
            ua.mouseover(menuBody.childNodes[3]);
        }
        setTimeout(function () {
            lang = editor.getLang("contextMenu");
            equal(menuparagraphBody.parentNode.parentNode.parentNode.style.display, 'none', '顯示submenu,檢查submenu的display值:""');
            equal(menuparagraphBody.childNodes.length, 4, '檢查submenu的menuitems數量');
            equal(menutableBody.parentNode.parentNode.parentNode.style.display, 'none', '顯示table submenu,檢查submenu的display值:""');
            /*trace 3038*/
            if (ua.browser.ie && ua.browser.ie < 9) {
                equal(menutableBody.childNodes.length, 2, 'ie有一條分隔線');
            } else {
                equal(menutableBody.childNodes.length, 1, '只有插入表格選項');
            }
            innerText = lang["justifyleft" ] + lang["justifyright" ] + lang["justifycenter" ] + lang[ "justifyjustify" ];
            if (browser.gecko) {
                equal(menuparagraphBody.textContent, innerText, '檢查menu顯示的字符');
                equal(menutableBody.textContent, lang["inserttable" ], '檢查table menu顯示的字符');
            }
            else {
                equal(menuparagraphBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), innerText, '檢查menu顯示的字符');
                equal(menutableBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), lang["inserttable" ], '檢查table menu顯示的字符');
            }
            ua.click(menuparagraphBody.childNodes[1]);
            setTimeout(function () {
                equal(editor.body.firstChild.style.textAlign, 'right', '文本右對齊');
                document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
                te.dom.push(editor.container);
                start();
            }, 500);
        }, 200);
});

test('表格右鍵菜單', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    stop();
        var lang = editor.getLang("contextMenu");
        editor.setContent('<table width="100%" border="1" bordercolor="#000000"><tbody><tr><td style="width:50%;"><br /></td><td style="width:50%;"><br /></td></tr><tr><td style="width:50%;"></td><td style="width:50%;"><br /></td></tr></tbody></table>');
        setTimeout(function () {
            range.setStart(editor.body.firstChild.firstChild.firstChild.firstChild.firstChild, 0).collapse(true).select();
            ua.contextmenu(editor.body.firstChild.firstChild.firstChild);
// 點開右鍵菜單
            equal(document.getElementsByClassName("edui-menu-body").length, 5, '獲得edui-menu-body名稱的class個數5');
            var menuBody = document.getElementsByClassName("edui-menu-body")[0];
            equal(menuBody.childNodes.length, 13, '第一個menu11個items2個分隔線');
            var innerText = lang.selectall + lang.cleardoc + lang.table + lang.tablesort + lang.borderbk+ lang.aligntd + lang.aligntable + lang.insertparagraphbefore + lang.insertparagraphafter + lang['copy'] + lang['paste'];
            if (browser.gecko) {
                equal(menuBody.textContent, innerText, '檢查menu顯示的字符');
            }
            else {
                equal(menuBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), innerText, '檢查menu顯示的字符');
            }

            var menutableBody = document.getElementsByClassName("edui-menu-body")[1];
            var forTable = document.getElementsByClassName('edui-for-table');
//點開'表格'子菜單
            if (ua.browser.ie) {
                ua.mouseenter(forTable[forTable.length - 1]);
            } else {
                ua.mouseover(forTable[forTable.length - 1]);
            }
            setTimeout(function () {
                lang = editor.getLang("contextMenu");
                equal(menutableBody.parentNode.parentNode.parentNode.style.display, 'none', '顯示submenu,檢查submenu的display值:""');
                equal(menutableBody.childNodes.length, 19, '14個items5個分隔線');
                var innerText = lang.deletetable + lang.deleterow + lang.deletecol+ lang.insertcol + lang.insertcolnext + lang.insertrow + lang.insertrownext + lang.insertcaption + lang.inserttitle + lang.inserttitlecol + lang.mergeright + lang.mergedown + lang.edittd + lang.edittable+lang.setbordervisible;
                if (browser.gecko) {
                    equal(menutableBody.textContent, innerText, '檢查menu顯示的字符');
                }
                else {
                    equal(menutableBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), innerText, '檢查menu顯示的字符');
                }
                ua.click(menutableBody.childNodes[0]);
                equal(editor.body.getElementsByTagName('table').length, 0, '刪除表格');
                setTimeout(function () {
                    document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
                    te.dom.push(editor.container);
                    start();
                }, 200);
            }, 200);
        }, 100);
});

/*trace 3044*/
test('trace 3044：表格名稱中右鍵', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    stop();
        var lang = editor.getLang("contextMenu");
        editor.execCommand('cleardoc');
        editor.execCommand('inserttable');
        range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
        ua.contextmenu(editor.body.firstChild);
        var menutableBody = document.getElementsByClassName("edui-menu-body")[1];
        var forTable = document.getElementsByClassName('edui-for-table');
        if (ua.browser.ie) {
            ua.mouseenter(forTable[forTable.length - 1]);
        } else {
            ua.mouseover(forTable[forTable.length - 1]);
        }
        setTimeout(function () {
            lang = editor.getLang("contextMenu");
            ua.click(menutableBody.childNodes[9]);
            var caption = editor.body.getElementsByTagName('caption');
            equal(caption.length, 1, '插入表格名稱');
            range.setStart(caption[0], 0).collapse(true).select();
            ua.contextmenu(editor.body.firstChild.firstChild);
            forTable = document.getElementsByClassName('edui-for-table');
            if (ua.browser.ie) {
                ua.mouseenter(forTable[forTable.length - 1]);
            } else {
                ua.mouseover(forTable[forTable.length - 1]);
            }
            setTimeout(function () {
                lang = editor.getLang("contextMenu");
                menutableBody = document.getElementsByClassName("edui-menu-body")[1];
                if (ua.browser.ie == 8) {
                    equal(menutableBody.childNodes.length, 9, '9個子項目,其中有2條分隔線');
                } else {
                    equal(menutableBody.childNodes.length, 7, '7個子項目');
                }
                var innerText = lang.deletetable + lang.deletecaption + lang.inserttitle+lang.inserttitlecol + lang.edittd + lang.edittable+lang.setbordervisible;
                if (browser.gecko) {
                    equal(menutableBody.textContent, innerText, '檢查menu顯示的字符');
                } else {
                    equal(menutableBody.innerText.replace(/[\r\n\t\u200b\ufeff]/g, ''), innerText, '檢查menu顯示的字符');
                }
                setTimeout(function () {
                    document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
                    te.dom.push(editor.container);
                    start();
                }, 200);
            }, 200);
        }, 200);
});




/*trace 3088*/
test('trace 3088：檢查表格屬性', function () {
//    if (ua.browser.ie >8)return;
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor('ue');

    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        var lang = editor.getLang("contextMenu");
        editor.execCommand('cleardoc');
        editor.execCommand('inserttable');
        range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
        editor.execCommand('inserttitle');
        range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
        editor.execCommand('insertcaption');
        range.setStart(editor.body.getElementsByTagName('caption')[0], 0).collapse(true).select();
        editor.execCommand('deletetitle');
        setTimeout(function () {
            range.setStart(editor.body.getElementsByTagName('caption')[0], 0).collapse(true).select();
            ua.contextmenu(editor.body.firstChild.firstChild);
            setTimeout(function () {
                var menutable = document.getElementsByClassName("edui-menu-body")[1];
                var forTable = document.getElementsByClassName('edui-for-table');
                //點開'表格屬性'(表格子菜單的倒數第二項)
                if (ua.browser.ie&&ua.browser.ie<9) {
                    ua.mouseenter(forTable[forTable.length - 1]);
                    ua.click(menutable.childNodes[menutable.childNodes.length-2]);
                } else {
                    ua.mouseover(forTable[forTable.length - 1]);
                    ua.click(menutable.childNodes[menutable.childNodes.length-2]);
                }
                lang = editor.getLang("contextMenu");
                setTimeout(function () {
                    var iframe = document.getElementsByTagName('iframe');
                    var iframe1  ;
                    for (var i = 0; i <iframe.length; i++) {
                        if (iframe[i].id && iframe[i].id.indexOf('edui') != -1) {
                            iframe1 = iframe[i];
                            break;
                        }
                    }
                    equal(iframe1.contentDocument.getElementById('J_title').checked, false, '無標題行');
                    equal(iframe1.contentDocument.getElementById('J_caption').checked, true, '有名稱');
                    range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
                    ua.contextmenu(editor.body.firstChild);
                    menutable = document.getElementsByClassName("edui-menu-body")[1];
                    forTable = document.getElementsByClassName('edui-for-table');
                    if (ua.browser.ie&&ua.browser.ie<9) {
                        ua.mouseenter(forTable[forTable.length - 1]);
                    } else {
                        ua.mouseover(forTable[forTable.length - 1]);
                    }
                    lang = editor.getLang("contextMenu");
                    ua.click(menutable.childNodes[14]);

                    setTimeout(function () {
                        iframe = document.getElementsByTagName('iframe');
                        iframe1 = null;
                        for (var i = 0; i <iframe.length; i++) {
                            if (iframe[i].id && iframe[i].id.indexOf('edui') != -1) {
                                iframe1 = iframe[i];
                                break;
                            }
                        }
                        equal(iframe1.contentDocument.getElementById('J_title').checked, false, '無標題行');
                        equal(iframe1.contentDocument.getElementById('J_caption').checked, true, '有名稱');
                        setTimeout(function () {
                            var c2 = document.getElementById('edui447_body');
                            ua.click(c2);
                            document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
                            UE.delEditor('ue');
                            te.dom.push(document.getElementById('ue'));
                            start();
                        }, 500);
                    },500);
                }, 600);
            }, 800);
        }, 800);
    });
});


/*trace 3045*/
/*trace 3098*/
/*trace 3410*/
/*trace 3448*/
test('檢查表格屬性', function () {
    if (ua.browser.ie&&ua.browser.ie <9 )return;//todo 1.2.6.1  #3098
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor('ue');
    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        var lang = editor.getLang("contextMenu");
        editor.execCommand('cleardoc');
        editor.execCommand('inserttable');
        range.setStart(editor.body.getElementsByTagName('td')[0], 0).collapse(true).select();
        editor.execCommand('insertcaption');
        setTimeout(function () {
            range.setStart(editor.body.getElementsByTagName('caption')[0], 0).collapse(true).select();
            ua.contextmenu(editor.body.firstChild.firstChild);
            var menutable = document.getElementsByClassName("edui-menu-body")[1];
            var forTable = document.getElementsByClassName('edui-for-table');
            if (ua.browser.ie&&ua.browser.ie<9) {
                ua.mouseenter(forTable[forTable.length - 1]);
                ua.click(menutable.childNodes[6]);
            } else {
                ua.mouseover(forTable[forTable.length - 1]);
                ua.click(menutable.childNodes[5]);
            }
            lang = editor.getLang("contextMenu");
            var iframe = document.getElementsByTagName('iframe');
            setTimeout(function () {
                var iframe1;
                for (var i = 0; i < iframe.length; i++) {
                    if (iframe[i].id.indexOf('edui') != -1) {
                        iframe1 = iframe[i];
                        break;
                    }
                }
                equal(iframe1.contentDocument.getElementById('J_tone').value.toLowerCase(), '#dddddd', '默認邊框顏色');
                equal(iframe1.contentDocument.getElementById('J_title').checked, false, '無標題行');
                equal(iframe1.contentDocument.getElementById('J_caption').checked, true, '有名稱');
                equal(iframe1.contentDocument.getElementById('J_autoSizePage').checked, true, '頁面自適應');
                setTimeout(function () {
                    document.getElementById('edui_fixedlayer').parentNode.removeChild(document.getElementById('edui_fixedlayer'));
                    UE.delEditor('ue');
                    te.dom.push(document.getElementById('ue'));
                    start();
                }, 200);
            }, 300);
        }, 500);
    });
});