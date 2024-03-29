module('plugins.elementpath');
/*
 <li>表格
 <li>列表
 <li>文本
 <li>圖片
 <li>超鏈接
 <li>加粗加斜
 <li>下劃線，刪除線
 * */

//1.2的版本中，表格的外面會自動套一個帶格式的div
test('表格', function () {
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor('ue', {'initialContent': '<p>歡迎使用ueditor</p>', 'elementPathEnabled': true, 'autoFloatEnabled': false});
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        editor.setContent('<table><tbody><tr><td>hello1</td><td><strong>strongText</strong>hello2<span style="text-decoration: underline">spanText</span></td></tr></tbody></table>');
        var body = editor.body;
        /*選中整個表格*/
        range.selectNode(body.firstChild).select();
        var eles = editor.queryCommandValue('elementpath');
        ua.checkElementPath(eles, ['body', 'table', 'tbody', 'tr', 'td'], '選中整個表格');
        /*在單元格中單擊*/
        var tds = body.getElementsByTagName('td');
        range.setStart(tds[0].firstChild, 0).collapse(true).select();
        ua.checkElementPath(eles, ['body', 'table', 'tbody', 'tr', 'td'], '在單元格中單擊');
        /*在單元格中的加粗文本中單擊*/
        ua.manualDeleteFillData(editor.body);
        range.setStart(tds[1].firstChild.firstChild, 1).collapse(true).select();
        eles = editor.queryCommandValue('elementpath');
        ua.checkElementPath(eles, ['body', 'table', 'tbody', 'tr', 'td', 'strong'], '在單元格中的加粗文本中單擊');
        /*在單元格中的下劃線文本中單擊*/
        ua.manualDeleteFillData(editor.body);
        range.setStart(tds[1].lastChild.firstChild, 1).collapse(true).select();
        eles = editor.queryCommandValue('elementpath');
        ua.checkElementPath(eles, ['body', 'table', 'tbody', 'tr', 'td', 'span'], '在單元格中的下劃線文本中單擊');
        /*選中有下劃線的文本*/
        ua.manualDeleteFillData(editor.body);
        range.setStart(tds[1].lastChild.lastChild, 1).setEnd(tds[1].lastChild.lastChild, 4).select();
        eles = editor.queryCommandValue('elementpath');
        ua.checkElementPath(eles, ['body', 'table', 'tbody', 'tr', 'td', 'span'], '選中有下劃線的文本');
        setTimeout(function(){
            UE.delEditor('ue');
            te.dom.push(document.getElementById('ue'));
            start();
        },200);
    });
    stop();
});
test(' 通過選區路徑取range', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.options.elementPathEnabled = true;
    editor.setContent('<table><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>45</td></tr></tbody></table>');
    stop();
    setTimeout(function () {
    var tds = editor.body.getElementsByTagName('td');
    var trs = editor.body.getElementsByTagName('tr');
    var tbodys = editor.body.getElementsByTagName('tbody');
    var table = editor.body.getElementsByTagName('table');
    range.setStart(tds[3].firstChild, 0).collapse(true).select();
    editor.queryCommandValue('elementpath');
    editor.execCommand('elementpath', '4');
    setTimeout(function () {
        range = editor.selection.getRange();
        if (ua.browser.gecko||ua.browser.webkit) {
            ua.checkResult(range, trs[1], trs[1], 1, 2, false, '取range--td');
        } else {
            if (ua.browser.ie)
                ua.checkResult(range, tds[3].firstChild, tds[3].lastChild, 0, 2, false, '取range--td');
            else
                ua.checkResult(range, tds[3].firstChild, editor.body, 0, 1, false, '取range--td');
        }
        range.setStart(tds[3].firstChild, 1).collapse(1).select();
        editor.execCommand('elementpath', '3');
        setTimeout(function () {
            range = editor.selection.getRange();
            if (ua.browser.gecko||ua.browser.webkit) {
                ua.checkResult(range, tbodys[0], tbodys[0], 1, 2, false, '取range--tr');
            } else {
                if (ua.browser.ie)
                    ua.checkResult(range, tds[2].firstChild, tds[3].lastChild, 0, 2, false, '取range--tr');
                else
                    ua.checkResult(range, tds[2].firstChild, editor.body, 0, 1, false, '取range--tr');
            }
            range.setStart(tds[3].firstChild, 0).collapse(1).select();
            editor.execCommand('elementpath', '2');
            setTimeout(function () {
                range = editor.selection.getRange();
                if (ua.browser.gecko||ua.browser.webkit) {
                    ua.checkResult(range, table[0], table[0], 0, 1, false, '取range--tbody');
                } else {
                    if (ua.browser.ie)
                        ua.checkResult(range, tds[0].firstChild, tds[3].lastChild, 0, 2, false, '取range--tbody');
                    else
                        ua.checkResult(range, editor.body, editor.body, 0, 1, false, '取range--tbody');
                }
                editor.setContent('<p>45645</p>');
                range.selectNode(editor.body.firstChild).select();
                editor.queryCommandValue('elementpath');
                editor.execCommand('elementpath', 1);
                setTimeout(function () {
                    range = editor.selection.getRange();
                    var p = editor.body.firstChild;
                    if (ua.browser.gecko||ua.browser.webkit) {
                        ua.checkResult(range, editor.body, editor.body, 0, 1, false, '取range--p');
                    } else {
                        ua.checkResult(range, p.firstChild, p.firstChild, 0, 5, false, '取range--p');
                    }
                    start();
                }, 20);
            }, 20);
        }, 100);
    }, 20);
    }, 50);
});

test('trace 1539:列表', function () {
    var div = document.body.appendChild(document.createElement('div'));
    var editor = new baidu.editor.Editor({'initialContent': '<p>歡迎使用ueditor</p>', 'elementPathEnabled': true, 'autoFloatEnabled': false});
    stop();
    setTimeout(function () {
        editor.render(div);
        editor.ready(function () {
            var range = new baidu.editor.dom.Range(editor.document);
            editor.setContent('<ol><li>hello1</li><li>hello2<br><table><tbody><tr><td>hello3</td></tr></tbody></table></li></ol>');
            var body = editor.body;
            /*選中所有列表*/
            range.selectNode(body.firstChild).select();
            var eles = editor.queryCommandValue('elementpath');
            ua.checkElementPath(eles, ['body', 'ol', 'li', 'p'], '選中整個列表');
            /*選中列表中的表格*/
            range.selectNode(body.firstChild.getElementsByTagName('table')[0]).select();
            eles = editor.queryCommandValue('elementpath');
            ua.checkElementPath(eles, ['body', 'ol', 'li', 'table', 'tbody', 'tr', 'td'], '選中列表中的表格');
            /*選中列表中的br*/
            range.setStart(body.firstChild.firstChild.nextSibling.firstChild.firstChild, 6).collapse(true).select();
            eles = editor.queryCommandValue('elementpath');
            ua.checkElementPath(eles, ['body', 'ol', 'li', 'p'], '選中列表中的br');
            div.parentNode.removeChild(div);
            start();
        });
    }, 20);
});
test('文本和超鏈接', function () {
    var div = document.body.appendChild(document.createElement('div'));
    var editor = new baidu.editor.Editor({'initialContent': '<p>歡迎使用ueditor</p>', 'elementPathEnabled': true, 'autoFloatEnabled': false});
    editor.render(div);
    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        editor.setContent('<div><p>hello<a>a_link</a></p></div>');
        var body = editor.body;
        /*選中文本hello*/
        range.selectNode(body.firstChild.firstChild).select();
        var eles = editor.queryCommandValue('elementpath');
        ua.checkElementPath(eles, ['body', 'p'], '選中文本');
        /*選中超鏈接*/
        range.selectNode(body.firstChild.lastChild.firstChild).select();
        eles = editor.queryCommandValue('elementpath');
        ua.checkElementPath(eles, ['body', 'p', 'a'], '選中文本');
        div.parentNode.removeChild(div);
        start();
    });
});

//在版本1.2中，如果沒有setTimeout在FF（3.6和9都是）中range會出錯，其他瀏覽器沒問題
test('圖片', function () {
    if(ua.browser.ie>8)return;//todo 1.3.6 #3847
    var div = document.body.appendChild(document.createElement('div'));
    div.id = "ue";
    var editor = UE.getEditor("ue",{'initialContent': '<p>歡迎使用ueditor</p>', 'elementPathEnabled': true, 'autoFloatEnabled': false});
    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        editor.setContent('<div><p>hello<img /></p></div>');
        var body = editor.body;
        /*選中圖片*/
        setTimeout(function () {
            range.selectNode(body.firstChild.lastChild).select();
            var eles = editor.queryCommandValue('elementpath');
            ua.checkElementPath(eles, ['body', 'p', 'img'], '選中圖片');
            setTimeout(function () {
                UE.delEditor('ue');
                te.dom.push(document.getElementById('ue'));
                start();
            }, 200);

        }, 20)
    });
});

test('錨點', function () {
    if(ua.browser.ie>8)return;//todo 1.3.6 #3847
    var div = document.body.appendChild(document.createElement('div'));
    var editor = new baidu.editor.Editor({'initialContent': '<p>歡迎使用ueditor</p>', 'elementPathEnabled': true, 'autoFloatEnabled': false});
    editor.render(div);
    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        editor.setContent('<div><p>hello<img anchorname="hello" class="anchorclass"></p></div>');
        var body = editor.body;
        /*選中圖片*/
        setTimeout(function () {
            range.selectNode(body.firstChild.lastChild).select();
            var eles = editor.queryCommandValue('elementpath');
            ua.checkElementPath(eles, ['body', 'p', 'anchor'], '選中錨點');
            div.parentNode.removeChild(div);
            start();
        }, 20)
    });
});
test('文本', function () {
    var div = document.body.appendChild(document.createElement('div'));
    var editor = new baidu.editor.Editor({'initialContent': '<p>歡迎使用ueditor</p>', 'elementPathEnabled': true, 'autoFloatEnabled': false});
    editor.render(div);
    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        editor.setContent('hello');
        var body = editor.body;
        /*選中圖片*/
        setTimeout(function () {
            range.setStart(body.firstChild.firstChild, 1).setEnd(body.firstChild.firstChild, 3).select();
            var eles = editor.queryCommandValue('elementpath');
            ua.checkElementPath(eles, ['body', 'p'], '選中文本');
            div.parentNode.removeChild(div);
            start();
        }, 20)
    });
});

test('trace 3995表格和文本', function () {
    if(ua.browser.ie==11)return;//todo dev1.4.0

    var div = document.body.appendChild(document.createElement('div'));
    var editor = new baidu.editor.Editor({'initialContent': '<p>歡迎使用ueditor</p>', 'elementPathEnabled': true, 'autoFloatEnabled': false});
    editor.render(div);
    stop();
    editor.ready(function () {
        var range = new baidu.editor.dom.Range(editor.document);
        var body = editor.body;
        range.setStart(body.firstChild.firstChild, 2).collapse(true).select();
        editor.execCommand('inserttable');
        /*選中圖片*/
        setTimeout(function () {
            range.selectNode(body).select();
            var eles = editor.queryCommandValue('elementpath');
            editor.execCommand('elementpath', 1);
            ua.checkElementPath(eles, ['body', 'p'], '選中文本和表格');
            range.selectNode(body.firstChild.nextSibling).select();
            eles = editor.queryCommandValue('elementpath');
            ua.checkElementPath(eles, ['body', 'table'], '選中表格');
            editor.execCommand('elementpath', 4);
            eles = editor.queryCommandValue('elementpath');
            ua.checkElementPath(eles, ['body', 'table', 'tbody', 'tr', 'td'], '選中表格');
            div.parentNode.removeChild(div);
            start();
        }, 20);
    });
});