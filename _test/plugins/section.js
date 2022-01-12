/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-9-28
 * Time: 下午1:34
 * To change this template use File | Settings | File Templates.
 */
module('plugins.section');

test('getsections命令',function(){
    var editor = te.obj[0];
    var html = '<h1>一級標題1</h1><p>段落a</p><h2>二級標題2</h2><p>段落</p><h2>二級標題3</h2><p>段落</p><h3>三級標題4</h3><p>段落</p><h1>一級標題5</h1><p>段落</p>';
    editor.setContent(html);
    var sectionTree = editor.execCommand('getsections');

    equal(sectionTree.children.length, 2, '內容里有兩個一級標題');
    equal(sectionTree.children[1].title, '一級標題5', '驗證章節內容');
    same(sectionTree.children[1].startAddress, [8], '驗證章節開始位置');
    same(sectionTree.children[1].endAddress, [9], '驗證章節結束位置');
});

test('deletesection命令',function(){
    var editor = te.obj[0];
    var html = '<h1>一級標題1</h1><p>段落a</p><h2>二級標題2</h2><p>段落</p><h2>二級標題3</h2><p>段落</p><h3>三級標題4</h3><p>段落</p><h1>一級標題5</h1><p>段落b</p>';

    editor.setContent(html);
    var sectionTree = editor.execCommand('getsections');
    editor.execCommand('deleteSection', sectionTree.children[1]);
    equal(sectionTree.children[1].parentNode, null, '驗證章節標題是否已刪除');
    notEqual(editor.body.children[0].innerHTML, '段落a', '不傳入keepChild參數時,驗證章節內容是否已刪除');

    editor.setContent(html);
    sectionTree = editor.execCommand('getsections');
    editor.execCommand('deleteSection', sectionTree.children[0], true);
    equal(editor.body.children[0].innerHTML, '段落a', '傳入keepChild參數為true時,驗證章節內容是否已保留');
});

test('movesection命令',function(){
    var editor = te.obj[0];
    var html = '<h1>一級標題1</h1><p>段落a</p><h2>二級標題2</h2><p>段落</p><h2>二級標題3</h2><p>段落</p><h3>三級標題4</h3><p>段落</p><h1>一級標題5</h1><p>段落b</p>';

    editor.setContent(html);
    var sectionTree = editor.execCommand('getsections');
    editor.execCommand('movesection', sectionTree.children[1], sectionTree.children[0]);
    equal(editor.body.children[0].innerHTML, '一級標題5', ' 移動章節移動到目標章節之前,驗證章節是否移動正確');
    equal(editor.body.children[1].innerHTML, '段落b', ' 驗證移動章節移動到目標章節之前,驗證章節內容是否移動正確');

    editor.setContent(html);
    sectionTree = editor.execCommand('getsections');
    editor.execCommand('movesection', sectionTree.children[0], sectionTree.children[1], true);
    var len = editor.body.children.length;
    equal(editor.body.children[len-2].innerHTML, '一級標題1', ' 移動章節移動到目標章節之前,驗證章節是否移動正確');
    equal(editor.body.children[len-1].innerHTML, '段落a', ' 驗證移動章節移動到目標章節之前,驗證章節內容是否移動正確');
});

test('selectsection命令',function(){
    var editor = te.obj[0];
    var html = '<h1>一級標題1</h1><p>段落a</p><h2>二級標題2</h2><p>段落</p><h2>二級標題3</h2><p>段落</p><h3>三級標題4</h3><p>段落</p><h1>一級標題5</h1><p>段落b</p>';

    editor.setContent(html);
    var sectionTree = editor.execCommand('getsections');
    editor.execCommand('selectsection', sectionTree.children[1]);
    var range = editor.selection.getRange();
    ua.checkSameHtml($('<div>').append(range.cloneContents()).html(), '<h1>一級標題5</h1><p>段落b</p>', '判斷選區內容是否正確');
});
