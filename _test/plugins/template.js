module( 'plugins.template' );

test( '模板', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent( '<p>hello</p>' );
    range.setStart(editor.body.firstChild,0).collapse(true).select();
    editor.execCommand('template',{html:'<p class="ue_t">歡迎使用UEditor！</p>'});
    ua.manualDeleteFillData(editor.body);
    equal(ua.getHTML(editor.body.firstChild),'<p class=\"ue_t\">歡迎使用ueditor！</p>');
    if(!(ua.browser.gecko||ua.browser.ie>8)){
        if(ua.browser.webkit){
            ua.click(editor.body.firstChild);
            equal(editor.selection.getRange().startContainer.firstChild.length,'12','檢查選區');
            ua.keydown(editor.body.firstChild);
            equal(editor.selection.getRange().startContainer.firstChild.length,'12','檢查選區');
        }else{
            ua.click(editor.body.firstChild);
            equal(editor.selection.getRange().startContainer.length,'12','檢查選區');
            ua.keydown(editor.body.firstChild);
            equal(editor.selection.getRange().startContainer.length,'12','檢查選區');
        }
    }
} );