/**
 * Created with JetBrains PhpStorm.
 * User: xuheng
 * Date: 13-6-13
 * Time: 下午12:38
 * To change this template use File | Settings | File Templates.
 */
module( 'plugins.contextmenu' );

test( '基本的shortcutmenu', function() {
//設置選單內容\
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor("ue", { shortcutMenu: ["fontfamily", "fontsize", "bold", "italic", "underline", "forecolor", "backcolor", "insertorderedlist", "insertunorderedlist"]});
    stop();
    editor.ready(function () {
        ua.contextmenu(editor.body);
        setTimeout(function () {
            var menu = document.getElementsByClassName("edui-shortcutmenu")[0];
            equal(!!menu, true, '右鍵檢查選單是否存在');

            ok(menu.style.display == "" || menu.style.display == "block", '右鍵檢查選單是否顯示');

            ua.mousedown(editor.body.firstChild);

            equal(menu.style.display, "none", '鼠標按下檢查選單是否隱藏');

            UE.delEditor('ue');

            te.dom.push(document.getElementById('ue'));
            te.dom.push(document.getElementById('edui_fixedlayer'));
            start()

        }, 100);
    });
});
test( '鍵盤操作,隱藏shortcutmenu', function() {
//設置選單內容\
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor("ue" ,{ shortcutMenu: ["fontfamily", "fontsize", "bold", "italic", "underline", "forecolor", "backcolor", "insertorderedlist", "insertunorderedlist"]});
    stop();
    editor.ready(function () {
        ua.contextmenu(editor.body);
        setTimeout(function(){
            var menu=document.getElementsByClassName("edui-shortcutmenu")[0];
            equal(!!menu,true,'右鍵檢查選單是否存在');
            ok(menu.style.display==""||menu.style.display=="block",'右鍵檢查選單是否顯示');
            ua.keydown(editor.body.firstChild);
            equal(menu.style.display,"none",'鍵盤按下檢查選單是否隱藏');
            UE.delEditor('ue');
            te.dom.push(document.getElementById('ue'));
            te.dom.push(document.getElementById('edui_fixedlayer'));
            start()
        },100);
    });
} );
test( '框選內容', function() {
//設置選單內容\
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor("ue" ,{ shortcutMenu: ["fontfamily", "fontsize", "bold", "italic", "underline", "forecolor", "backcolor", "insertorderedlist", "insertunorderedlist"]});
    stop();
    editor.ready(function () {
        editor.setContent('<p>hello</p>');
        var range = new baidu.editor.dom.Range(editor.document);
        range.setStart(editor.body.firstChild.firstChild,0).setEnd(editor.body.firstChild.firstChild,2).select();
        var sc =editor.selection.getRange().startContainer;
        var ec =editor.selection.getRange().endContainer;
        var so =editor.selection.getRange().startOffset;
        var eo =editor.selection.getRange().endOffset;
        var collapsed =editor.selection.getRange().collapsed;
        ua.contextmenu(editor.body);
        setTimeout(function(){
            var menu=document.getElementsByClassName("edui-shortcutmenu")[0];
            equal(!!menu,true,'右鍵檢查選單是否存在');
            ok(menu.style.display==""||menu.style.display=="block",'右鍵檢查選單是否顯示');
            ua.checkResult(editor.selection.getRange(), sc, ec, so, eo, collapsed,'檢查range不變');
            ua.keydown(editor.body.firstChild);
            UE.delEditor('ue');
            te.dom.push(document.getElementById('ue'));
            te.dom.push(document.getElementById('edui_fixedlayer'));
            start()
        },100);
    });
} );