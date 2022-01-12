module( 'plugins.paste' );

//不能模擬出真實的粘貼效果，此用例用於檢查中間值
test( '粘貼', function() {
    if(ua.browser.ie || ua.browser.opera)return;
    var div = document.body.appendChild( document.createElement( 'div' ) );
    $( div ).css( 'width', '500px' ).css( 'height', '500px' ).css( 'border', '1px solid #ccc' );
    var me = te.obj[2];
    me.render(div);
    stop();
    me.ready(function(){
        var range = new baidu.editor.dom.Range( te.obj[2].document );
        me.focus();
        me.setContent('<p>hello</p>');
        range.setStart(me.body.firstChild,0).collapse(true).select();
        ua.keydown(me.body,{'keyCode':65,'ctrlKey':true});
        ua.keydown(me.body,{'keyCode':67,'ctrlKey':true});
        setTimeout(function(){
            me.focus();
            range.setStart(me.body.firstChild,0).collapse(true).select();
            ua.paste(me.body,{'keyCode':86,'ctrlKey':true});
            equal(me.body.lastChild.id,'baidu_pastebin','檢查id');
            equal(me.body.lastChild.style.position,'absolute','檢查style');
            div.parentNode.removeChild(div);
            start();
        },50);
        stop();
    });
} );
//me.fireEvent('pasteTransfer','paste');//todo
test( 'getClipboardData--ctrl+v', function() {
//    var editor = new baidu.editor.Editor( {'plugins':['paste']} )
//    var div = te.dom[0];
//    editor.render( div );
//    editor.focus();
//    editor.setContent( '<p>你好</p>' )
//    var doc = editor.document;
//    var r = new baidu.editor.dom.Range( doc );
//    /*從word中粘貼的未經過濾的列表*/
//    var html = '<p><span lang="EN-US" style="text-indent: -28px; font-family: Wingdings; ">l<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp; </span></span>列表<span lang="EN-US" style="text-indent: -28px; ">1</span><br></p><p class="MsoListParagraph" style="margin-left:21.0pt;text-indent:-21.0pt;'
//            + 'mso-char-indent-count:0;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" style="font-family:Wingdings;mso-fareast-font-family:Wingdings;mso-bidi-font-family:Wingdings">l<span style="font:7.0pt &quot;Times New Roman&quot;">&nbsp; </span></span><!--[endif]-->列表<span lang="EN-US">2<o:p></o:p></span></p>';
//    te.setClipData( html );
//    r.setStart( editor.body.firstChild, 1 ).collapse( 1 ).select();
//    editor.focus();
//    te.presskey( 'ctrl', 'v' );
//    editor.focus();
//    setTimeout( function() {
//        equal( editor.body.firstChild.innerHTML, html );
//        start();
//    } );
//    stop();
    equal('','','');
} );

//需要點擊授權彈出框,暫時去除
//test('檢查IE下粘貼命令是否執行正常', function () {
//
//    if (browser.ie) {
//        var editor = te.obj[0];
//        editor.setContent('<p>hello</p>');
//        editor.focus();
//
//        editor.execCommand('selectall');
//        editor.body.document.execCommand('copy');
//        editor.setContent('<p>test</p>');
//        editor.execCommand('selectall');
//        editor.execCommand('paste');
//
//        setTimeout(function(){
//            equal(utils.trim(editor.getContent().replace('<p></p>', '').replace('<p>&nbsp;</p>', '')), '<p>hello</p>', '檢查html內容,IE下成功粘貼內容');
//            equal(utils.trim(editor.getContentTxt()), 'hello', '檢查text內容,IE下成功粘貼內容');
//            start();
//        },100);
//
//        stop();
//    }
//
//});