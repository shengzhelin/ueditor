/**
 * Created by JetBrains PhpStorm.
 * User: lisisi01
 * Date: 12-11-8
 * Time: 下午3:37
 * To change this template use File | Settings | File Templates.
 */
module( 'plugins.autosubmit' );

//這個插件是針對非ie的，單測用例同樣只針對非ie,仍需手動測試檢驗ie與非ie下效果是否一致
test( '輸入超鏈接後回車', function() {
    var form = document.body.appendChild( document.createElement( 'form' ) );
    var editor = new baidu.editor.Editor({'initialContent':'<p>歡迎使用ueditor</p>','autoFloatEnabled':false});
    editor.render(form);
//    form.body.appendChild(editor);
    editor.focus();
    var range = new baidu.editor.dom.Range( editor.document );
    range.setStart(editor.body.firstChild.firstChild,1).collapse(true).select();
    editor.execCommand('autosubmit');
    equal(editor.textarea.value,'<p>歡迎使用ueditor</p>','');
} );