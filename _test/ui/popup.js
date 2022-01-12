/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-4-12
 * Time: 下午4:47
 * To change this template use File | Settings | File Templates.
 */
module( 'ui.popup' );
test( '檢查顯示內容和隱藏方法：getContentHtmlTpl，show()，hide()，isHidden()', function() {
    var editor = new baidu.editor.ui.Editor();
    stop();
    setTimeout(function(){
        var autoTypeSetPicker = new baidu.editor.ui.AutoTypeSetPicker({editor:editor});

        var popup = new te.obj[0].Popup({content: autoTypeSetPicker,'editor':editor});
        var content = autoTypeSetPicker.getHtmlTpl().replace(/##/g, autoTypeSetPicker.id)
                .replace(/%%/g, (autoTypeSetPicker.uiName ? 'edui-'+autoTypeSetPicker.uiName : '') + ' ' + autoTypeSetPicker.className);
        equal(popup.getContentHtmlTpl(),content, '檢查popup的內容');
        equal(popup.getDom(),null,'popup初始不顯示');

        popup.show();
        equal(popup.getDom().style.display,'','popup顯示成功');
        var popupContent = document.getElementById(popup.id+'_content');
        equal(popupContent.firstChild.id,autoTypeSetPicker.id,'popup內容autoTypeSetPicker顯示');
        equal(popup.isHidden(),false,'isHidden==false');

        popup.hide();
        equal(popup.getDom().style.display,'none','popup隱藏成功');
        equal(popup.isHidden(),true,'isHidden==true');

        autoTypeSetPicker.dispose();
        popup.dispose();
        start();
    },50);


} );
test( '定位顯示popup；mousedown時隱藏popup', function() {
    var editor = new baidu.editor.ui.Editor();
    editor.render('editor');
    editor.ready(function(){
        var autoTypeSetPicker = new baidu.editor.ui.AutoTypeSetPicker({editor:editor});
        var popup = new te.obj[0].Popup({content: autoTypeSetPicker,'editor':editor});
        var uiUtils = baidu.editor.ui.uiUtils;
        var leftLocation = 20;
        var topLocation = 100;
        popup.showAt({left:leftLocation,top:topLocation});
        equal($(popup.getDom()).css('top'),topLocation+'px','popup位置：top');
        equal($(popup.getDom()).css('left'),leftLocation+'px','popup位置：left');
        equal($(popup.getDom()).css('width'),uiUtils.getClientRect(popup.getDom('content')).width+'px','popup位置：width');
        ok(uiUtils.getClientRect(popup.getDom('content')).width>uiUtils.getClientRect(autoTypeSetPicker.getDom()).width,'popup的width大於其內容的width');
        equal($(popup.getDom()).css('height'),uiUtils.getClientRect(popup.getDom('content')).height+'px','popup位置：height');
        ok(uiUtils.getClientRect(popup.getDom('content')).height>uiUtils.getClientRect(autoTypeSetPicker.getDom()).height,'popup的height大於其內容的height');
       
        var popup2 = new te.obj[0].Popup({content: autoTypeSetPicker,'editor':editor});
//        var flag = 0;
//        popup2.addListener('postRenderAfter',function(){
//            flag = 1;
//        });
//        popup2.postRender();
        popup2.show();
        ua.mousedown(document.getElementById(popup.id+'_content'));
        equal(popup.isHidden(),false,'在popup上mousedown，popup不隱藏');
        equal(popup2.isHidden(),true,'在popup上mousedown，popup2隱藏');
        popup.show();
        popup2.show();
        ua.mousedown(document.getElementById('editor'));
        equal(popup.isHidden(),true,'在其他位置mousedown，popup隱藏');
        equal(popup2.isHidden(),true,'在其他位置mousedown，popup隱藏');
        popup.show();
        popup2.show();
//        $('#editor').scroll();
////        window.scrollTo( 0, document.body.scrollHeight );
//        equal(popup.isHidden(),true);
//        equal(popup2.isHidden(),true);
        autoTypeSetPicker.dispose();
        popup.dispose();
        popup2.dispose();
        start();
    });
    stop();


} );