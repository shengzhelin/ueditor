module("plugins.list");
/*
 * <li>有序列表切換到無序
 * <li>無序列表切換到有序
 * <li>有序之間相互切換
 * <li>無序之間相互切換
 * <li>先引用後列表
 * <li>表格中插入列表
 * <li>h1套列表
 * <li>去除鏈接
 *
 * */

//test('',function(){stop();})
test('trace 3859 回車將p轉成列表', function () {
    if(ua.browser.ie==9||ua.browser.ie==10)return;
    var editor = te.obj[0];
    var range = te.obj[1];
    var br = ua.browser.ie ? '' : '<br>';
    editor.setContent('<p>1. 2</p>');
    stop();
    setTimeout(function () {
        range.setStart(editor.body.firstChild, 0).collapse(true).select();
        ua.keydown(editor.body, {keyCode:13});
        setTimeout(function () {
            ua.checkSameHtml(ua.getChildHTML(editor.body), '<ol style=\"list-style-type: decimal;\" class=\" list-paddingleft-2\"><li><p> 2</p></li><li><p>' + br + '</p></li></ol>', '回車將p轉成列表');
            start()
        }, 50);
    }, 100);
});

//todo bug3418
test('ol標簽嵌套', function () {
    var editor = te.obj[0];
    editor.setContent('<ol class="custom_num list-paddingleft-1"><li class="list-num-1-1 list-num-paddingleft-1"><p>a</p></li><ol class="custom_num list-paddingleft-1"><li class="list-num-1-1 list-num-paddingleft-1"><p>b</p></li></ol></ol>');
    ua.checkSameHtml(editor.body.innerHTML, '<ol class=\"custom_num list-paddingleft-1\"><li class=\"list-num-1-1 list-num-paddingleft-1\"><p>a</p></li><ol class=\"custom_num1 list-paddingleft-2\"><li class=\"list-num-2-1 list-num1-paddingleft-1\"><p>b</p></li></ol></ol>');
});

test('li內添加p標簽', function () {
    var editor = te.obj[0];
    editor.setContent('<ol><li>asd<p>asd</p></li></ol>');
    ua.manualDeleteFillData(editor.body);
    ua.checkSameHtml(editor.body.innerHTML, '<ol class=\" list-paddingleft-2\"><li><p>asd</p><p>asd</p></li></ol>', '添加p標簽');
});
//todo 1.2.6.1
test('p轉成列表', function () {
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor('ue',{autoTransWordToList:true});
//    var br = ua.browser.ie ? '&nbsp;' : '';
    var br = '';
    editor.ready(function () {
        setTimeout(function(){
            editor.setContent('<p class="MsoListParagraph">1.a</p><ol><li>b</li></ol>');
            ua.manualDeleteFillData(editor.body);
            //todo 1.2.6.1
//    ua.checkSameHtml(editor.body.innerHTML,'<ol style=\"list-style-type: decimal;\" class=\" list-paddingleft-2\"><li><p>a</p></li><li><p>b</p></li></ol>','p轉成有序列表');
            editor.setContent('<p class="MsoListParagraph"><span style="font-family: Symbol;">abc</span></p>');
            ua.manualDeleteFillData(editor.body);
            ua.checkSameHtml(editor.body.innerHTML, '<ul style=\"list-style-type: disc;\" class=\" list-paddingleft-2\"><li><p>' + br + '</p></li></ul>', 'p轉成無序列表');
//todo bug3417
//    editor.setContent('<p class="MsoListParagraph"><span style="font-family: Symbol;">n</span></p>');
//    ua.manualDeleteFillData(editor.body);
//    ua.checkSameHtml(editor.body.innerHTML,'<ul style=\"list-style-type: disc;\" class=\" list-paddingleft-2\"><li><p><br></p></li></ul>','p轉成無序列表');
            UE.delEditor('ue');
            te.dom.push(document.getElementById('ue'));
            start();
        },200);
    });
    stop();

});

test('列表覆制粘貼', function () {
    var editor = te.obj[0];

        editor.setContent('<ol class="custom_num2 list-paddingleft-1"><li class="list-num-3-1 list-num2-paddingleft-1">a</li><li>b</li></ol><ul><li>a</li><li>b</li></ul>');
        ua.keydown(editor.body, {'keyCode':65, 'ctrlKey':true});
        ua.keydown(editor.body, {'keyCode':67, 'ctrlKey':true});
        /*ctrl+c*/

        setTimeout(function () {
            var html = {html:editor.body.innerHTML};
            editor.fireEvent('beforepaste', html);
            /*粘貼*/
//    range.setStart(editor.body,1).collapse(true).select();
//    editor.fireEvent("paste");
//    ua.manualDeleteFillData(editor.body);
//    equal(editor.body.innerHTML,'<p><br></p>','編輯器清空');
            editor.setContent('<ol><li>a</li><li>b</li></ol><ul><li>a</li><li>b</li></ul>');
            ua.keydown(editor.body, {'keyCode':65, 'ctrlKey':true});
            ua.keydown(editor.body, {'keyCode':67, 'ctrlKey':true});
            /*ctrl+c*/
            html = {html:editor.body.innerHTML};
            editor.fireEvent('beforepaste', html);
            /*粘貼*/
            editor.setContent('<ol><ol><li>a</li><li>b</li></ol><ul><li>a</li><li>b</li></ul></ol>');
            ua.keydown(editor.body, {'keyCode':65, 'ctrlKey':true});
            ua.keydown(editor.body, {'keyCode':67, 'ctrlKey':true});
            /*ctrl+c*/
            html = {html:editor.body.innerHTML};
            editor.fireEvent('beforepaste', html);
            /*粘貼*/
            editor.setContent('<ol class="custom_cn1 list-paddingleft-1"><ol><li>a</li><li>b</li></ol><ul><li>a</li><li>b</li></ul></ol>');
            ua.keydown(editor.body, {'keyCode':65, 'ctrlKey':true});
            ua.keydown(editor.body, {'keyCode':67, 'ctrlKey':true});
            /*ctrl+c*/
            html = {html:editor.body.innerHTML};
            setTimeout(function () {
                editor.fireEvent('beforepaste', html);
                /*粘貼*/
                start()
            }, 50);
        }, 50);
    stop();
});

//TODO trace-3416 此處只為提高覆蓋率
//test('剪切列表',function(){
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent('<ol><li><p><img src="http://img.baidu.com/hi/jx2/j_0015.gif"/><br/></p></li><li></li></ol>');
//    range.setStart(editor.body.firstChild.lastChild,0).collapse(true).select();
//    ua.cut(editor.body);
//    stop();
//    setTimeout(function(){
//        ua.manualDeleteFillData(editor.body);
//        var br = ua.browser.ie?'':'<br>';
//       equal(editor.body.innerHTML,'<p>'+br+'</p>','編輯器清空');
//        editor.setContent('<ol><li><p><img src="http://img.baidu.com/hi/jx2/j_0015.gif"/><br/></p></li><li></li></ol><p>asdf</p>');
//        range.setStart(editor.body.firstChild.lastChild,0).collapse(true).select();
//        ua.cut(editor.body);
//        setTimeout(function(){
//            ua.manualDeleteFillData(editor.body);
//            equal(editor.body.innerHTML,'<p>asdf</p>','列表刪除');
//            editor.setContent('<a href="http://www.baidu.com">www.baidu.com</a><ol><li><p><img src="http://img.baidu.com/hi/jx2/j_0015.gif"/><br/></p></li><li></li></ol>');
//            range.setStart(editor.body.firstChild.nextSibling.lastChild,0).collapse(true).select();
//            ua.cut(editor.body);
//            setTimeout(function(){
//                ua.manualDeleteFillData(editor.body);
//                ua.checkSameHtml(editor.body.innerHTML,'<p><a href=\"http://www.baidu.com\" _href=\"http://www.baidu.com\">www.baidu.com</a></p>','列表刪除');
//                start();
//            },20);
//        },20);
//    },20);
//});

test('修改列表再刪除列表', function () {
    if ((ua.browser.safari && !ua.browser.chrome))return 0;
    var editor = te.obj[0];
    var range = te.obj[1];
    var br = baidu.editor.browser.ie ? "" : "<br>";
    editor.setContent('<ol>hello1</ol>');
    range.setStart(editor.body.firstChild, 0).collapse(true).select();
    editor.execCommand('insertorderedlist', 'cn2');
    ua.manualDeleteFillData(editor.body);
    equal(editor.body.firstChild.tagName.toLowerCase(), 'ol', '查詢列表的類型');
    equal(ua.getChildHTML(editor.body.firstChild), '<li class=\"list-cn-3-1 list-cn2-paddingleft-1\"><p>hello1</p></li>');
    range.setStart(editor.body.lastChild, 0).setEnd(editor.body.lastChild, 1).select();
    editor.execCommand('insertorderedlist', 'cn2');
    ua.manualDeleteFillData(editor.body);
    ua.checkSameHtml(editor.body.innerHTML, '<p>hello1</p>');
});

test('列表內沒有列表標號的項後退', function () {
    if ((ua.browser.safari && !ua.browser.chrome))return 0;
    var editor = te.obj[0];
    var range = te.obj[1];

        var lis;
        var br = ua.browser.ie ? '<br>' : '<br>';
        editor.setContent('<ol><li><p>hello</p><p><a href="http://www.baidu.com">www.baidu.com</a></p></li></ol>');
        range.setStart(editor.body.firstChild.firstChild.lastChild.lastChild, 0).collapse(true).select();
        ua.manualDeleteFillData(editor.body);
        ua.keydown(editor.body, {keyCode:8});

        setTimeout(function () {
            lis = editor.body.getElementsByTagName('li');
            equal(lis.length, '1', '列表長度不變');
            ua.checkSameHtml(ua.getChildHTML(editor.body), '<ol class=" list-paddingleft-2"><li><p>hello</p></li></ol><p><a href="http://www.baidu.com" _href="http://www.baidu.com">www.baidu.com</a></p>', 'p在列表外');
            start()
        }, 50);
    stop();
});

test('多個p，選中其中幾個變為列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<p>hello1</p><p>hello2</p><p>hello3</p><p>hello4</p>');
    setTimeout(function () {
        range.setStart(body.firstChild, 0).setEnd(body.firstChild.nextSibling, 1).select();
        editor.execCommand('insertorderedlist');
        equal(ua.getChildHTML(body.firstChild), '<li><p>hello1</p></li><li><p>hello2</p></li>', '檢查列表的內容');
        equal(body.firstChild.tagName.toLowerCase(), 'ol', '檢查列表的類型');
        equal(body.childNodes.length, 3, '3個孩子');
        equal(body.lastChild.tagName.toLowerCase(), 'p', '後面的p沒有變為列表');
        equal(body.lastChild.innerHTML.toLowerCase(), 'hello4', 'p里的文本');
        start();
    }, 50);
    stop();
});

//trace 988，有序123切到abc再切到123
test('有序列表的切換', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<p>你好</p><p>是的</p>');
    setTimeout(function () {
        range.setStart(body, 0).setEnd(body, 2).select();
        editor.execCommand('insertorderedlist', 'decimal');
        equal(editor.queryCommandValue('insertorderedlist'), 'decimal', '查詢插入數字列表的結果1');
        editor.execCommand('insertorderedlist', 'lower-alpha');
        equal(editor.queryCommandValue('insertorderedlist'), 'lower-alpha', '查詢插入字母列表的結果');
        editor.execCommand('insertorderedlist', 'decimal');
        equal(editor.queryCommandValue('insertorderedlist'), 'decimal', '查詢插入數字列表的結果2');
        start();
    }, 50);
    stop();
});

//trace 988，無序圓圈切到方塊再切到圓圈
test('無序列表之間的切換', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<p>你好</p><p>是的</p>');
    range.setStart(body, 0).setEnd(body, 2).select();
    editor.execCommand('insertunorderedlist', 'circle');
    equal(editor.queryCommandValue('insertunorderedlist'), 'circle', '查詢插入圓圈列表的結果1');
    editor.execCommand('insertunorderedlist', 'square');
    equal(editor.queryCommandValue('insertunorderedlist'), 'square', '查詢插入正方形列表的結果');
    editor.execCommand('insertunorderedlist', 'circle');
    equal(editor.queryCommandValue('insertunorderedlist'), 'circle', '查詢插入圓圈列表的結果1');
});

test('引用中插入列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<p></p>');
    range.setStart(body.firstChild, 0).collapse(1).select();
    editor.execCommand('blockquote');
    editor.execCommand('insertorderedlist');
    equal(body.firstChild.tagName.toLowerCase(), 'blockquote', 'firstChild of body is blockquote');
    equal(body.childNodes.length, 1, '只有一個孩子');
    equal(body.firstChild.firstChild.tagName.toLowerCase(), 'ol', 'insert an ordered list');
    equal(body.firstChild.childNodes.length, 1, 'blockquote只有一個孩子');
    equal($(body.firstChild.firstChild).css('list-style-type'), 'decimal', '數字列表');
    equal(editor.queryCommandValue('insertorderedlist'), 'decimal', 'queryCommand value is decimal');
});

/*trace 1118*/
test('去除無序列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<p></p>');
    range.setStart(body.firstChild, 0).collapse(1).select();
    editor.execCommand('insertunorderedlist');
    equal(body.firstChild.tagName.toLowerCase(), 'ul', 'insert an unordered list');
    equal(body.childNodes.length, 1, 'body只有一個孩子');
    equal(editor.queryCommandValue('insertunorderedlist'), 'disc', 'queryCommand value is disc');
    ok(editor.queryCommandState('insertunorderedlist'), 'state是1');
    /*去除列表*/
    editor.execCommand('insertunorderedlist');
    ua.manualDeleteFillData(editor.body);
    equal(body.firstChild.tagName.toLowerCase(), 'p', '去除列表');
    equal(body.childNodes.length, 1, 'body只有一個孩子');
    ok(!editor.queryCommandState('insertunorderedlist'), 'state是0');
});

test('閉合方式有序和無序列表之間的切換', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<p></p>');
    range.setStart(body.firstChild, 0).collapse(1).select();
    editor.execCommand('insertunorderedlist');
    equal(body.firstChild.tagName.toLowerCase(), 'ul', 'insert an unordered list');
    equal(body.childNodes.length, 1, 'body只有一個孩子');
    equal(editor.queryCommandValue('insertunorderedlist'), 'disc', 'queryCommand value is disc');
    equal(editor.queryCommandValue('insertorderedlist'), null, '有序列表查詢結果為null');
    /*切換為有序列表*/
    editor.execCommand('insertorderedlist');
    ua.manualDeleteFillData(editor.body);
    equal(body.firstChild.tagName.toLowerCase(), 'ol', '變為有序列表');
    equal(body.childNodes.length, 1, 'body只有一個孩子');
    equal(editor.queryCommandValue('insertorderedlist'), 'decimal', 'queryCommand value is decimal');
    equal(editor.queryCommandValue('insertunorderedlist'), null, '無序列表查詢結果為null');
    /*切換為圓圈無序列表*/
    editor.execCommand('insertunorderedlist', 'circle');
    ua.manualDeleteFillData(editor.body);
    equal(body.firstChild.tagName.toLowerCase(), 'ul', '變為無序列表');
    equal(body.childNodes.length, 1, 'body只有一個孩子');
    equal(editor.queryCommandValue('insertunorderedlist'), 'circle', '無序列表是圓圈');
    equal(editor.queryCommandValue('insertorderedlist'), null, '有序列表查詢結果為null');
});

test('非閉合方式切換有序和無序列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    /*如果只選中hello然後切換有序無序的話，不同瀏覽器下表現不一樣*/
    editor.setContent('<ol><li>hello</li><li>hello3</li></ol><p>hello2</p>');
    range.selectNode(body.firstChild).select();
    editor.execCommand('insertunorderedlist', 'square');
    equal(body.firstChild.tagName.toLowerCase(), 'ul', '有序列表變為無序列表');
    equal(editor.queryCommandValue('insertunorderedlist'), 'square', '無序列表是方塊');
    equal(ua.getChildHTML(body.firstChild), '<li><p>hello</p></li><li><p>hello3</p></li>', 'innerHTML 不變');
    /*切換為有序列表*/
    editor.execCommand('insertorderedlist', 'upper-alpha');
    equal(body.firstChild.tagName.toLowerCase(), 'ol', '無序列表變為有序列表');
    equal(editor.queryCommandValue('insertorderedlist'), 'upper-alpha', '有序列表是A');
    equal(ua.getChildHTML(body.firstChild), '<li><p>hello</p></li><li><p>hello3</p></li>', '變為有序列表後innerHTML 不變');
});

test('將列表下的文本合並到列表中', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<ul><li>hello1</li></ul><p>是的</p>');
    setTimeout(function () {
        range.setStart(body.firstChild, 0).setEnd(body.lastChild, 1).select();
        /*將無序的變為有序，文本也相應變成無序列表的一部分*/
        editor.execCommand('insertorderedlist');
        ua.manualDeleteFillData(editor.body);
        equal(body.firstChild.tagName.toLowerCase(), 'ol', 'ul變為了ol');
        equal(ua.getChildHTML(body.firstChild), '<li><p>hello1</p></li><li><p>是的</p></li>');
        equal(body.childNodes.length, 1, '只有一個孩子是ol');
        start();
    }, 50);
    stop();
});

test('多個列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<ol><li>hello1</li></ol><ul><li>hello2</li></ul>');
    range.selectNode(body.lastChild).select();
    /*將無序的變為有序*/
    editor.execCommand('insertorderedlist');
    equal(body.firstChild.tagName.toLowerCase(), 'ol', '仍然是ol');
    equal(body.childNodes.length, 1, 'body只有1個孩子ol');
    equal(body.firstChild.childNodes.length, 2, '下面的列表合並到上面');
    equal(ua.getChildHTML(body.lastChild), '<li><p>hello1</p></li><li><p>hello2</p></li>', '2個li子節點');
});

test('修改列表中間某一段列表為另一種列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<ol><li>hello</li><li>hello2</li><li>hello3</li><li>hello4</li></ol>');
    var lis = body.firstChild.getElementsByTagName('li');
    range.setStart(lis[1], 0).setEnd(lis[2], 1).select();
    editor.execCommand('insertunorderedlist');
    equal(body.childNodes.length, 3, '3個列表');
    equal(ua.getChildHTML(body.firstChild), '<li><p>hello</p></li>', '第一個列表只有一個li');
    equal(ua.getChildHTML(body.lastChild), '<li><p>hello4</p></li>', '最後一個列表只有一個li');
    equal(body.childNodes[1].tagName.toLowerCase(), 'ul', '第二個孩子是無序列表');
    equal(ua.getChildHTML(body.childNodes[1]), '<li><p>hello2</p></li><li><p>hello3</p></li>', '檢查第二個列表的內容');
});

test('兩個列表，將下面的合並上去', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<ol><li>hello3</li></ol><ol><li>hello1</li></ol><ul><li>hello2</li></ul>');
    range.selectNode(body.lastChild).select();
    /*將無序的變為有序，有序上面的有序不會合並在一起了*/
    editor.execCommand('insertorderedlist');
    equal(body.firstChild.tagName.toLowerCase(), 'ol', '仍然是ol');
    equal(body.childNodes.length, 2, 'body有兩個孩子ol');
    equal(body.lastChild.childNodes.length, 2, '下面和上面的列表合並到上面去了');
//TODO 1.2.6不嚴重bug注釋 空style未刪除
//    equal( ua.getChildHTML( editor.body ), '<ol class=" list-paddingleft-2" ><li><p>hello3</p></li></ol><ol class=" list-paddingleft-2" ><li><p>hello1</p></li><li><p>hello2</p></li></ol>', '3個li子節點' );
});

test('trace 3293：列表下的文本合並到列表中', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<ol><li>hello3</li><li>hello1</li></ol><p>文本1</p><p>文本2</p>');
    range.setStart(body, 1).setEnd(body, 3).select();
    /*選中文本變為有序列表，和上面的列表合並了*/
    editor.execCommand('insertorderedlist');
    var ol = body.firstChild;
    equal(body.childNodes.length, 1, '所有合並為一個列表');
    equal(ol.tagName.toLowerCase(), 'ol', '仍然是ol');
    equal(ol.childNodes.length, 4, '下面和上面的列表合並到上面去了');
    equal(ua.getChildHTML(body.firstChild), '<li><p>hello3</p></li><li><p>hello1</p></li><li><p>文本1</p></li><li><p>文本2</p></li>', '4個li子節點');
});

test('2個相同類型的列表合並', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<ol><li>hello3</li><li>hello1</li></ol><ol style="list-style-type: lower-alpha"><li><p>文本1</p></li><li><p>文本2</p></li></ol>');
    range.selectNode(body.lastChild).select();
    editor.execCommand('insertorderedlist');
    var ol = body.firstChild;
    equal(body.childNodes.length, 1, '所有合並為一個列表');
    equal(ol.tagName.toLowerCase(), 'ol', '仍然是ol');
    equal(ol.childNodes.length, 4, '下面和上面的列表合並到上面去了');
    equal(ua.getChildHTML(body.firstChild), '<li><p>hello3</p></li><li><p>hello1</p></li><li><p>文本1</p></li><li><p>文本2</p></li>', '4個li子節點');
});

test('不閉合情況h1套列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<h1>hello1</h1><h2>hello2</h2>');
    range.setStart(body.firstChild, 0).setEnd(body.lastChild, 1).select();
    /*對h1添加列表*/
    editor.execCommand('insertorderedlist');
    equal(body.firstChild.tagName.toLowerCase(), 'ol', '仍然是ol');
    equal(ua.getChildHTML(body.firstChild), '<li><h1>hello1</h1></li><li><h2>hello2</h2></li>', '查看插入列表後的結果');
    equal(body.childNodes.length, 1, 'body只有一個孩子ol');
    equal(body.firstChild.childNodes.length, 2, '2個li');
});

test('閉合情況h1套列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<h2>hello1</h2>');
    range.setStart(body.firstChild, 0).collapse(1).select();
    /*對h1添加列表*/
    editor.execCommand('insertorderedlist');
    equal(body.firstChild.tagName.toLowerCase(), 'ol', '仍然是ol');
    equal(ua.getChildHTML(body.firstChild), '<li><h2>hello1</h2></li>', '查看插入列表後的結果');
    equal(body.childNodes.length, 1, 'body只有一個孩子ol');
    equal(body.firstChild.childNodes.length, 1, '1個li');
});

test('列表內後退', function () {
    /*實際操作沒問題，取range時會在將文本節點分為兩個節點，後退操作無法實現*/
    if ((ua.browser.safari && !ua.browser.chrome))
        return 0;
    var editor = te.obj[0];
    var range = te.obj[1];

        var lis;
        var br = ua.browser.ie ? '<br>' : '<br>';
//////標簽空格的處理
        editor.setContent('<ol><li><br></li><li><p>hello2</p></li><li><br></li><li><sss>hello3</sss></li><li><p>hello4</p></li><li><p>hello5</p></li></ol>');
//    editor.setContent('<ol><li><br></li><li><p>hello2</p></li><li></li><li><sss>hello3</sss></li><li><p>hello4</p></li><li><p>hello5</p></li></ol>');
        range.setStart(editor.body.firstChild.lastChild.firstChild.firstChild, 0).collapse(1).select();
        ua.manualDeleteFillData(editor.body);
        ua.keydown(editor.body, {keyCode:8});

        var ol = editor.body.getElementsByTagName('ol');
        lis = editor.body.getElementsByTagName('li');
        equal(lis.length, '5', '變成5個列表項');
        equal(ua.getChildHTML(editor.body.firstChild), '<li><p>' + br + '</p></li><li><p>hello2</p></li><li><p>' + br + '</p></li><li><sss>hello3</sss></li><li><p>hello4</p><p>hello5</p></li>', '最後一個列表項');
        range.setStart(lis[0].firstChild, 0).collapse(1).select();
        ua.keydown(editor.body, {keyCode:8});

        lis = editor.body.getElementsByTagName('li');
        equal(lis.length, '4', '變成4個列表項');
        equal(ua.getChildHTML(editor.body.lastChild), '<li><p>hello2</p></li><li><p>' + br + '</p></li><li><sss>hello3</sss></li><li><p>hello4</p><p>hello5</p></li>', '第一個列表項且為空行');
        range.setStart(lis[1].firstChild, 0).collapse(1).select();
        ua.keydown(editor.body, {keyCode:8});

        lis = editor.body.getElementsByTagName('li');
        equal(lis.length, '3', '變成3個列表項');
        equal(ua.getChildHTML(editor.body.lastChild), '<li><p>hello2</p><p>' + br + '</p></li><li><sss>hello3</sss></li><li><p>hello4</p><p>hello5</p></li>', '中間列表項且為空行');
        if (!ua.browser.ie) {
            range.setStart(lis[1].firstChild.firstChild, 0).collapse(1).select();
            ua.manualDeleteFillData(editor.body);
            ua.keydown(editor.body, {keyCode:8});
//TODO 1.2.6不嚴重bug注釋 空style未刪除
//        equal(ua.getChildHTML(editor.body),'<p><br></p><ol class=\" list-paddingleft-2\"><li><p>hello2</p><p><br></p><sss>hello3</sss></li><li><p>hello4</p><p>hello5</p></li></ol>','自定義標簽後退');
        }

});

test('列表內回車', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

        var lis;
        var br = ua.browser.ie ? '' : '<br>';
        editor.setContent('<ol><li><sss></sss><sss></sss></li></ol>');
        lis = editor.body.getElementsByTagName('li');
        range.setStart(lis[0], 0).collapse(1).select();
        ua.keydown(editor.body, {keyCode:13});
        var spa = ua.browser.opera ? '<br>' : '';
        equal(ua.getChildHTML(editor.body), spa + '<p><sss></sss><sss></sss></p>', '空列表項回車--無列表');

        editor.setContent('<ol><li><sss>hello1</sss><p>hello2</p></li></ol>');
        lis = editor.body.getElementsByTagName('li');
        range.setStart(lis[0].lastChild, 0).collapse(1).select();
        ua.keydown(editor.body, {keyCode:13});
        equal(ua.getChildHTML(editor.body.firstChild), '<li><p><sss>hello1</sss><p></p></p></li><li><p><p>hello2</p></p></li>', '單個列表項內回車');
//////標簽空格的處理
//    editor.setContent('<ol><li><br></li><li><p>hello5</p></li><li><p><br></p><p><br></p></li></ol>');
        editor.setContent('<ol><li><br></li><li><p>hello5</p></li><li><p><br></p><p><br></p></li></ol>');
        lis = editor.body.getElementsByTagName('li');
        range.setStart(lis[2].firstChild.firstChild, 0).setEnd(lis[2].lastChild.firstChild, 0).select();
        ua.keydown(editor.body, {keyCode:13});
//TODO 1.2.6不嚴重bug注釋 空style未刪除
//    equal(ua.getChildHTML(editor.body),'<ol class=\" list-paddingleft-2\"><li><p>'+br+'</p></li><li><p>hello5</p></li></ol><p>'+br+'</p>','最後一個列表項為空行回車');

        /*trace 2652*/
        range.setStart(editor.body.firstChild.firstChild.firstChild, 0).collapse(1).select();
        ua.keydown(editor.body, {keyCode:13});
//TODO 1.2.6不嚴重bug注釋 空style未刪除
//    equal(ua.getChildHTML(editor.body),'<p>'+br+'</p><ol class=\" list-paddingleft-2\"><li><p>hello5</p></li></ol><p>'+br+'</p>','第一個列表項為空行下回車');

        /*trace 2653*/
        editor.setContent('<ol><li><p>hello2</p></li><li><p>hello3</p></li><li><p><br /></p><p>hello5</p></li></ol>');
        lis = editor.body.getElementsByTagName('li');
        range.setStart(lis[0].firstChild.firstChild, 2).setEnd(lis[1].firstChild.firstChild, 4).select();
        ua.keydown(editor.body, {keyCode:13});
        equal(ua.getChildHTML(editor.body.firstChild), '<li><p>he</p></li><li><p>o3</p></li><li><p><br></p><p>hello5</p></li>', '非閉合回車');

        editor.setContent('<ol><li><sss>hello</sss><p>hello4</p></li><li><p>hello5</p></li></ol>');
        lis = editor.body.getElementsByTagName('li');
        range.setStart(lis[0].lastChild.firstChild, 1).setEnd(lis[0].lastChild.firstChild, 2).select();
        ua.keydown(editor.body, {keyCode:13});
        equal(ua.getChildHTML(editor.body.firstChild), '<li><p><sss>hello</sss><p>h</p></p></li><li><p><p>llo4</p></p></li><li><p>hello5</p></li>', '一個列表項內兩行');

});

test('tab鍵', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

        var lis;
        editor.setContent('<ol><li><p>hello1</p></li><li><p>hello2</p></li></ol>');
        lis = editor.body.getElementsByTagName('li');
        range.setStart(lis[1], 0).collapse(1).select();
        ua.keydown(editor.body, {keyCode:9});
        ua.keydown(editor.body, {keyCode:9});
        var str = '<li><p>hello1</p></li><ol style="list-style-type: lower-alpha;" class=" list-paddingleft-2" ><ol style="list-style-type: lower-roman;" class=" list-paddingleft-2" ><li><p>hello2</p></li></ol></ol>';
        ua.checkSameHtml(str, editor.body.firstChild.innerHTML.toLowerCase(), '有序列表---tab鍵');

});

test('回車後產生新的li-選區閉合', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        var body = editor.body;
        editor.setContent('<p>hello1</p><p>hello2</p>');
        setTimeout(function () {
            range.setStart(body.firstChild, 0).setEnd(body.firstChild.nextSibling, 1).select();
            editor.execCommand('insertorderedlist');
            var lastLi = body.firstChild.lastChild.firstChild.firstChild;
            range.setStart(lastLi, lastLi.length).collapse(1).select();
            setTimeout(function () {
                ua.keydown(editor.body, {'keyCode':13});
                equal(body.firstChild.childNodes.length, 3, '回車後產生新的li');
                equal(body.firstChild.lastChild.tagName.toLowerCase(), 'li', '回車後產生新的li');
                var br = ua.browser.ie ? '' : '<br>';
                equal(ua.getChildHTML(body.firstChild), '<li><p>hello1</p></li><li><p>hello2</p></li><li><p>' + br + '</p></li>', '檢查內容');
                var lastLi = body.firstChild.lastChild.firstChild.firstChild;
                range.setStart(lastLi, lastLi.length).collapse(1).select();
                setTimeout(function () {
                    ua.keydown(editor.body, {'keyCode':13});
                    equal(body.firstChild.childNodes.length, 2, '空li後回車，刪除此行li');
                    equal(body.lastChild.tagName.toLowerCase(), 'p', '產生p');
                    br = ua.browser.ie ? '' : '<br>';
                    ua.manualDeleteFillData(body.lastChild);
                    equal(body.lastChild.innerHTML.toLowerCase().replace(/\r\n/ig, ''), br, '檢查內容');
                    start()
                }, 20);
            }, 20);
        }, 50);
    stop();
});

/*trace 3074*/
test('trace 1622：表格中插入列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<table><tbody><tr><td><br></td><td>你好</td></tr><tr><td>hello2</td><td>你好2</td></tr></tbody></table>');
    /*必須加br，否則沒辦法占位*/
    stop()
    setTimeout(function () {
        var tds = body.getElementsByTagName('td');
        range.setStart(tds[0], 0).collapse(1).select();
        /*選中一個單元格*/
        editor.execCommand('insertorderedlist');
        /*插入有序列表*/
        equal(tds[0].firstChild.tagName.toLowerCase(), 'ol', '查詢列表的類型');
        equal(tds[0].firstChild.style['listStyleType'], 'decimal', '查詢有序列表的類型');
        var br = baidu.editor.browser.ie ? "<br>" : "<br>";
        equal(ua.getChildHTML(tds[0].firstChild), '<li>' + '<p>' + br + '</p>' + '</li>');
        setTimeout(function () {
            var trs = editor.body.firstChild.getElementsByTagName('tr');
            /*選中多個單元格*/
            var ut = editor.getUETable(editor.body.firstChild);
            var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[1].cells[1]);
            ut.setSelected(cellsRange);
            range.setStart(trs[0].cells[0], 0).collapse(true).select();
            tds = body.getElementsByTagName('td');
            editor.execCommand('insertunorderedlist', 'circle');
            /*插入無序列表*/
            equal(tds[1].firstChild.tagName.toLowerCase(), 'ul', '查詢無序列表');
            equal(tds[1].firstChild.style['listStyleType'], 'circle', '查詢無序列表的類型');
            equal(ua.getChildHTML(tds[1].firstChild), '<li>你好</li>');
            equal(ua.getChildHTML(tds[3].firstChild), '<li>你好2</li>');
            start();
        }, 50);
    }, 50);
});

///*presskey*/
//test( ' trace 1536:刪除部分列表', function () {
//    var editor = te.obj[0];
//    editor.setContent( '<ol><li>hello1</li><li>你好</li><li>hello3</li></ol>' );
//    var body = editor.body;
//    var range = te.obj[1];
//    stop();
//    expect( 2 );
//    range.setStart( body.firstChild, 1 ).setEnd( body.firstChild, 2 ).select();
//    editor.focus();
//    te.presskey( 'del', '' );
//    editor.focus();
//    setTimeout( function () {
//        equal( body.childNodes.length, 1, '刪除後只剩一個ol元素' );
//        var br = (baidu.editor.browser.ie || baidu.editor.browser.gecko) ? "" : "<br>";
//        //todo 不同瀏覽器原生選區的差別導致
////        equal( ua.getChildHTML( body ), '<ol><li><p>hello1</p></li><li><p>hello3' + br + '</p></li></ol>', '第二個li被刪除' );
//        start();
//    }, 30 );
//} );
///*presskey*/
//test( ' trace 1544,1624 :列表中回車後再回退，會產生一個空行', function () {
//    var editor = te.obj[0];
//    editor.setContent( '<ol><li><p>hello1</p></li><li><p>你好</p></li></ol>' );
//    var body = editor.body;
//    var ol = body.firstChild;
//    var range = te.obj[1];
//
//    range.setStart( ol.firstChild.firstChild, 1 ).collapse( 1 ).select();
//    editor.focus();
//    te.presskey( 'enter', '' );
//    equal(editor.selection.getRange().startContainer.parentNode.innerHTML,'');
//
//    setTimeout( function () {
//        range.setStart( ol.childNodes[1], 0 ).collapse( 1 ).select();
//        equal(editor.selection.getRange().startContainer.parentNode.innerHTML,'');
//        editor.focus();
//        te.presskey( 'back', '' );
//        setTimeout( function () {
//            editor.focus();
//            var br = ua.browser.ie ? "" : "<br>";
//            equal( ua.getChildHTML( body ), '<ol><li><p>hello1</p><p>' + br + '</p></li><li><p>你好</p></li></ol>', '第二個li被刪除' );
//            range.setStart( body, 0 ).setEnd( body, 1 ).select();
//            editor.execCommand( 'insertorderedlist' );
//            equal( ua.getChildHTML( body ), '<p>hello1</p><p>' + br + '</p><p>你好</p>', '應當變為純文本' );
//            start();
//        }, 70 );
//    }, 50 );
//    stop();
//} );

test('trace1620：修改上面的列表與下面的列表一致', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>你好</p><ol><li><p>數字列表1</p></li><li><p>數字列表2</p></li></ol><ol style="list-style-type:lower-alpha; "><li><p>字母列表2</p></li><li><p>字母列表2</p></li></ol>');
    range.selectNode(editor.body.firstChild.nextSibling).select();
    editor.execCommand('insertorderedlist', 'lower-alpha');
    var html = '<p>你好</p><ol style="list-style-type: lower-alpha;" class=" list-paddingleft-2" ><li><p>數字列表1</p></li><li><p>數字列表2</p></li><li><p>字母列表2</p></li><li><p>字母列表2</p></li></ol>'
    ua.checkSameHtml(html, editor.body.innerHTML.toLowerCase(), '檢查列表結果');
});

test('trace 1621：選中多重列表，設置為相同類型的列表', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent('<ol style="list-style-type:decimal; "><li><p>數字列表1</p></li><li><p>數字列表2</p></li></ol><ol style="list-style-type:lower-alpha; "><li><p>字母列表1</p></li><li><p>字母列表2</p></li></ol><ol style="list-style-type: upper-alpha; "><li><p>​大寫字母1<br></p></li><li><p>大寫字母2</p></li><li><p>大寫字母3</p></li></ol>');
    range.setStart(body, 1).setEnd(body.lastChild.firstChild.nextSibling, 1).select();
    var html = '<ol style="list-style-type: decimal;" class=" list-paddingleft-2" ><li><p>數字列表1</p></li><li><p>數字列表2</p></li></ol><ol style="list-style-type: upper-alpha;" class=" list-paddingleft-2" ><li><p>字母列表1</p></li><li><p>字母列表2</p></li><li><p>大寫字母1<br/></p></li><li><p>大寫字母2</p></li><li><p>大寫字母3</p></li></ol>';
    editor.execCommand('insertorderedlist', 'upper-alpha');
    ua.checkSameHtml(html, editor.body.innerHTML.toLowerCase(), 'trace 1621');
});
//TODO 1.2.6不嚴重bug注釋 空style未刪除
//test( 'trace 3049：列表內有引用', function () {
//    var editor = te.obj[0];
//    editor.setContent( '<blockquote><ol class="custom_cn1 list-paddingleft-1" ><li class="list-cn-2-1 list-cn1-paddingleft-1" ><p>a</p></li><li class="list-cn-2-2 list-cn1-paddingleft-1" ><p>b</p></li></ol></blockquote>' );
//    editor.execCommand( 'selectall');
//    editor.execCommand( 'blockquote' );
//    var html = '<ol class="custom_cn1 list-paddingleft-1" ><li class="list-cn-2-1 list-cn1-paddingleft-1"><p>a</p></li><li class="list-cn-2-2 list-cn1-paddingleft-1"><p>b</p></li></ol>';
//    equal(ua.getChildHTML(editor.body),html,'檢查列表結果');
//});

/*trace 3056：模擬不完全，還需手動測試*/
test('trace 3056：列表內表格後回車', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

        var body = editor.body;
        editor.setContent('<ol class="custom_cn2 list-paddingleft-1" ><li class="list-cn-3-1 list-cn2-paddingleft-1" ><p>a</p></li><li class="list-cn-3-2 list-cn2-paddingleft-1" ><p><br></p></li><li class="list-cn-3-3 list-cn2-paddingleft-1" ><p>c</p></li></ol>');
        var lis = editor.body.getElementsByTagName('li');
        range.setStart(lis[1].firstChild, 0).collapse(true).select();

        setTimeout(function () {
            editor.execCommand('inserttable');
            var tds = body.getElementsByTagName('td');
            tds[0].innerHTML = 'asd<br>';
            range.setStart(tds[0].firstChild, 3).collapse(true).select();
            setTimeout(function () {
                ua.keydown(body, {'keyCode':13});
                equal(body.childNodes.length, 1, 'body只有一個孩子');
                equal(editor.body.getElementsByTagName('li').length, 3, 'ol有3個孩子');
                equal(editor.body.getElementsByTagName('table').length, 1, '只有1個table');
                start()
            }, 20);
        }, 50);
    stop();
});

/*trace 3075：fix in future*/
//test( 'trace 3075：表格標題行中插入有序列表', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<table><tbody><tr><th><br></th><th><br></th><th><br></th></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>' ); /*必須加br，否則沒辦法占位*/
//    var ths = body.getElementsByTagName( 'th' );
//    range.setStart( ths[1], 0 ).collapse( 1 ).select();                             /*選中一個單元格*/
//    editor.execCommand( 'insertorderedlist' );                                      /*插入有序列表*/
//    equal( ths[1].firstChild.tagName.toLowerCase(), 'ol', '查詢列表的類型' );
//    equal( ths[1].firstChild.style['listStyleType'], 'decimal', '查詢有序列表的類型' );
//    var br = baidu.editor.browser.ie ? "" : "<br>";
//    equal( ua.getChildHTML( ths[0].firstChild ), '<li>' + '<p>' + br + '</p>' + '</li>' );
//    stop();
//    setTimeout(function() {
//        editor.execCommand('source');
//        setTimeout(function() {
//            editor.execCommand('source');
//            equal( body.getElementsByTagName('table').length, 1, '只有1個table' );
//            start();
//        },20);
//    },20);
//} );
//test( 'trace 3075：表格標題行中插入無序列表', function () {
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    var body = editor.body;
//    editor.setContent( '<table><tbody><tr><th><br></th><th><br></th><th><br></th></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>' ); /*必須加br，否則沒辦法占位*/
//    var trs = editor.body.firstChild.getElementsByTagName( 'tr' );                  /*選中多個單元格*/
//    var ut = editor.getUETable(editor.body.firstChild);
//    var cellsRange = ut.getCellsRange(trs[0].cells[1],trs[0].cells[2]);
//    ut.setSelected(cellsRange);
//    range.setStart( trs[0].cells[1], 0 ).collapse( true ).select();
//    var ths = body.getElementsByTagName( 'th' );
//    editor.execCommand( 'insertunorderedlist', 'circle' );                            /*插入無序列表*/
//    equal( ths[1].firstChild.tagName.toLowerCase(), 'ul', '查詢無序列表' );
//    equal( ths[1].firstChild.style['listStyleType'], 'circle', '查詢無序列表的類型' );
//    stop();
//    setTimeout(function() {
//        editor.execCommand('source');
//        setTimeout(function() {
//            editor.execCommand('source');
//            equal( body.getElementsByTagName('table').length, 1, '只有1個table' );
//            start();
//        },20);
//    },20);
//} );

test('trace 3117：列表內後退兩次', function () {
    /*實際操作沒問題，取range時會在將文本節點分為兩個節點，後退操作無法實現*/
    if ((ua.browser.safari && !ua.browser.chrome))return 0;
    var editor = te.obj[0];
    var range = te.obj[1];

        var br = ua.browser.ie ? '<br>' : '<br>';
        editor.setContent('<ol><li>hello</li><li><p><br></p></li></ol>');

        range.setStart(editor.body.firstChild.lastChild.firstChild, 0).collapse(1).select();
        ua.manualDeleteFillData(editor.body);
        ua.keydown(editor.body, {keyCode:8});
        var ol = editor.body.getElementsByTagName('ol');
        var lis = editor.body.getElementsByTagName('li');
        equal(lis.length, '1', '變成1個列表項');
        equal(ua.getChildHTML(editor.body.firstChild), '<li><p>hello</p><p>' + br + '</p></li>', '檢查列表內容');
//TODO 1.2.6不嚴重bug注釋 空style未刪除
//    range.setStart(lis[0].lastChild,0).collapse(1).select();
//    ua.keydown(editor.body,{keyCode:8});
//    equal(ua.getChildHTML(editor.body),'<ol class=\" list-paddingleft-2\"><li><p>hello</p></li></ol><p>'+br+'</p>','檢查body內容');
        /*模擬不到光標跳到上一行？*/
//    range.setStart(editor.body.lastChild,0).collapse(1).select();
//    ua.keydown(editor.body,{keyCode:8});
//    equal(ua.getChildHTML(editor.body),'<ol class=\" list-paddingleft-2\"><li><p>hello</p></li></ol>','檢查body內容');

});

/*trace 3136*/
test('trace 3118：全選後backspace', function () {
    /*實際操作沒問題，取range時會在將文本節點分為兩個節點，後退操作無法實現*/
    if ((ua.browser.safari && !ua.browser.chrome))return 0;
    var editor = te.obj[0];
    var range = te.obj[1];

        var br = ua.browser.ie ? '' : '<br>';
        editor.setContent('<ol><li>hello</li><li><p><br></p></li></ol>');
        ua.keydown(editor.body, {'keyCode':65, 'ctrlKey':true});
        ua.keydown(editor.body, {keyCode:8});
        equal(ua.getChildHTML(editor.body), '<p>' + br + '</p>', '');
        ok(!editor.queryCommandState('insertorderedlist'), 'state是0');

});

test('trace 3126：1.2.5+列表重構新增標簽，tab鍵', function () {
    var editor = te.obj[0];
    var range = te.obj[1];

        var body = editor.body;
        editor.setContent('<p>hello1</p><p>hello2</p><p>hello3</p><p>hello4</p>');
        editor.execCommand('selectAll');
        editor.execCommand('insertorderedlist', 'cn2');
        var lis = body.getElementsByTagName('li');
        range.setStart(lis[1].firstChild, 0).setEnd(lis[2].firstChild, 1).select();
        ua.keydown(editor.body, {keyCode:9});
        var str = '<li class="list-cn-3-1 list-cn2-paddingleft-1" ><p>hello1</p></li><ol style="list-style-type: decimal;" class=" list-paddingleft-3" ><li><p>hello2</p></li><li><p>hello3</p></li></ol><li class="list-cn-3-2 list-cn2-paddingleft-1" ><p>hello4</p></li>';
        ua.checkSameHtml(str, editor.body.firstChild.innerHTML.toLowerCase(), '有序列表---tab鍵');

});

test('trace 3132：單行列表backspace', function () {
    /*實際操作沒問題，取range時會在將文本節點分為兩個節點，後退操作無法實現*/
    if ((ua.browser.safari && !ua.browser.chrome))return 0;
    var editor = te.obj[0];
    var range = te.obj[1];

        editor.setContent('<ol><li><br></li></ol>');
        range.selectNode(editor.body.firstChild.firstChild.firstChild.firstChild).select();
        ua.keydown(editor.body, {keyCode:8});
        var space ='<br>';
        equal(ua.getChildHTML(editor.body), '<p>'+space+'</p>', '');

});

test('trace 3133：表格中插入列表再取消列表', function () {
    /*實際操作沒問題，取range時會在將文本節點分為兩個節點，後退操作無法實現*/
    if ((ua.browser.safari && !ua.browser.chrome))return 0;
    var editor = te.obj[0];
    var range = te.obj[1];

        var body = editor.body;
        var br = baidu.editor.browser.ie ? "" : "<br>";
        editor.setContent('<table><tbody><tr><td><br></td></tr></tbody></table>');
        /*插入一行一列的表格*/
        var tds = body.getElementsByTagName('td');
        range.setStart(tds[0], 0).collapse(1).select();
        editor.execCommand('insertorderedlist', 'num2');
        /*插入列表*/
        equal(tds[0].firstChild.tagName.toLowerCase(), 'ol', '查詢列表的類型');
        equal(ua.getChildHTML(tds[0].firstChild), '<li class="list-num-3-1 list-num2-paddingleft-1"><p><br></p></li>');
        editor.execCommand('insertorderedlist', 'num2');
        /*取消列表*/
        equal(ua.getChildHTML(tds[0]), '<p><br></p>');
        ua.keydown(editor.body, {'keyCode':65, 'ctrlKey':true});
        /*ctrl+a*/
        ua.keydown(editor.body, {keyCode:8});
        /*backspace*/
        equal(ua.getChildHTML(editor.body), '<p>' + br + '</p>', '');

});

test('trace 3164：添加列表，取消列表', function () {
    var editor = te.obj[0];
    var body = editor.body;
    editor.setContent('<p>hello1</p><p>hello2</p><p>hello3</p><p>hello4</p>');
    editor.execCommand('selectAll');
    editor.execCommand('insertunorderedlist', 'dash');
    equal(body.firstChild.tagName.toLowerCase(), 'ul', '檢查無序列表');
    equal(body.firstChild.className, 'custom_dash list-paddingleft-1', '查詢有序列表的類型');
    equal(editor.queryCommandValue('insertunorderedlist'), 'dash', '查詢插入無序列表的結果');
    ok(editor.queryCommandState('insertunorderedlist'), 'state是1');
    editor.execCommand('selectAll');
    editor.execCommand('insertunorderedlist', 'dash');
    ua.checkHTMLSameStyle('<p>hello1</p><p>hello2</p><p>hello3</p><p>hello4</p>', editor.document, editor.body, '取消列表');
    equal(editor.queryCommandValue('insertunorderedlist'), null, '查詢取消無序列表的結果');
    ok(!editor.queryCommandState('insertunorderedlist'), 'state是0');
});

test('trace 3165：檢查表格中列表tab鍵', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
        var body = editor.body;
        setTimeout(function () {
            editor.execCommand('inserttable');
            var tds = body.getElementsByTagName('td');
            range.setStart(tds[6], 0).collapse(1).select();
            editor.execCommand('insertorderedlist');
            equal(tds[6].firstChild.style['listStyleType'], 'decimal', '查詢有序列表的類型');
            tds = body.getElementsByTagName('td');
            range.setStart(tds[5], 0).collapse(1).select();
            range = editor.selection.getRange();
            if(ua.browser.ie==9||ua.browser.ie==10)
                equal(range.startContainer.tagName.toLowerCase(), 'td', 'tab鍵前光標位於td中');

            else
                equal(range.startContainer.parentNode.tagName.toLowerCase(), 'td', 'tab鍵前光標位於td中');
            ua.keydown(editor.body, {keyCode:9});
            setTimeout(function () {
                range = editor.selection.getRange();
                if (!ua.browser.gecko && !ua.browser.ie && !ua.browser.webkit)//TODO 1.2.6
                    equal(range.startContainer.parentNode.tagName.toLowerCase(), 'li', 'tab鍵後光標跳到有列表的單元格中');
                equal(tds[6].firstChild.style['listStyleType'], 'decimal', '檢查有序列表的類型不應該被改變');
                start();
            }, 100);
        }, 100);
    stop();
});

test('trace 3168：表格中列表更改樣式', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.execCommand('inserttable');
    var tds = body.getElementsByTagName('td');
    tds[0].innerHTML = 'asdf';
    tds[1].innerHTML = '<ol class="custom_num1 list-paddingleft-1"><li class="list-num-2-1 list-num1-paddingleft-1"><p>asd</p></li></ol>';
    setTimeout(function () {
        var trs = editor.body.firstChild.getElementsByTagName('tr');
        var ut = editor.getUETable(editor.body.firstChild);
        var cellsRange = ut.getCellsRange(trs[0].cells[0], trs[0].cells[1]);
        ut.setSelected(cellsRange);
        range.setStart(trs[0].cells[0], 0).collapse(true).select();

        editor.execCommand('insertorderedlist', 'cn1');
        equal(tds[0].firstChild.className, 'custom_cn1 list-paddingleft-1', '查詢有序列表的類型');
        equal(tds[1].firstChild.className, 'custom_cn1 list-paddingleft-1', '查詢有序列表的類型');
        equal(editor.queryCommandValue('insertorderedlist'), 'cn1', '查詢插入有序列表的結果');

        editor.execCommand('insertunorderedlist', 'dot');
        equal(tds[0].firstChild.className, 'custom_dot list-paddingleft-1', '查詢無序列表的類型');
        equal(tds[1].firstChild.className, 'custom_dot list-paddingleft-1', '查詢無序列表的類型');
        equal(editor.queryCommandValue('insertunorderedlist'), 'dot', '查詢插入無序列表的結果');
        start();
    }, 50);
    stop();
});
//todo 1.2.6.1
//test('trace 3213 3499：tab鍵後更改列表樣式', function () {
//    var div = document.body.appendChild(document.createElement('div'));
//    div.id = 'ue';
//    var editor = UE.getEditor('ue');
//    editor.ready(function () {
//        var range = new baidu.editor.dom.Range(editor.document);
//        editor.setContent('<ol><li><p>hello1</p></li><li><p>hello2</p></li><li><p>hello1</p></li><li><p>hello1</p></li></ol>');
//        var lis = editor.body.getElementsByTagName('li');
//        range.setStart(lis[2], 0).setEnd(lis[3], 1).select();
//        ua.keydown(editor.body, {keyCode:9});
//        ua.keydown(editor.body, {'keyCode':65, 'ctrlKey':true});
//        editor.execCommand('insertorderedlist', 'lower-alpha');
//        var str = '<ol style="list-style-type: lower-alpha;" class=" list-paddingleft-2"><li><p>hello1</p></li><li><p>hello2</p></li><li><p>hello1</p></li><li><p>hello1</p></li></ol>';
//        ua.checkSameHtml(str, editor.body.innerHTML.toLowerCase(), '');
//        UE.delEditor('ue');
//        start();
//    });
//    stop();
//});