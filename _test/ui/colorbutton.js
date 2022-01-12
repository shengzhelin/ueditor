/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-4-12
 * Time: 下午4:47
 * To change this template use File | Settings | File Templates.
 */
module( 'ui.colorbutton' );
test( 'colorpicker的功能', function () {
    var testButton = document.body.appendChild( document.createElement( 'div' ) );
    var editor = new te.obj[0].Editor();
    editor.render("editor");
    editor.ready(function(){
        var colorButton = new te.obj[0].ColorButton({editor:editor});
        testButton.innerHTML = colorButton.renderHtml();
        colorButton.postRender();
        //_onTableClick
        colorButton.showPopup();
        var pick = document.getElementById(colorButton.popup.content.id).getElementsByTagName( 'table' )[0].firstChild.childNodes[2].childNodes[1].firstChild;
        equal( document.getElementById(colorButton.id+'_colorlump').style.backgroundColor, '', 'edui-colorlump 默認顏色' );
        ua.click( pick );
        var bgcolor = $('#'+colorButton.id+'_colorlump').css( 'backgroundColor' );
        ok( bgcolor == 'rgb(127,127,127)' || bgcolor == '#7f7f7f'||bgcolor== 'rgb(127, 127, 127)' , '檢查_onTableClick選擇的顏色edui-colorlump' );
        equal( $('#'+colorButton.id+'_colorlump').length, 1, '檢查edui-colorlump個數' );
        equal( colorButton.popup._hidden, true, '點擊按鈕後，關閉窗口' );
//_onTableOver&_onTableClick
        pick = document.getElementById(colorButton.popup.content.id).getElementsByTagName( 'table' )[0].firstChild.childNodes[2].childNodes[2].firstChild;
        equal( document.getElementById(colorButton.popup.content.id+'_preview').style.backgroundColor, '', 'edui-colorpicker-preview 默認顏色' );
        ua.mouseover( pick );
//colorButton.popup.content.id
        bgcolor = $( '#'+colorButton.popup.content.id+'_preview' ).css( 'backgroundColor' );
        ok( bgcolor == 'rgb(221, 217, 195)' || bgcolor == '#ddd9c3'||bgcolor=='rgb(221,217,195)', '檢查_onTableClick選擇的顏色edui-colorlump' );
        equal($('#'+colorButton.popup.content.id+'_preview' ).length, 1, '檢查edui-colorlump個數' );
        equal( colorButton.popup._hidden, true, '點擊按鈕後，關閉窗口' );
        ua.click( pick );
        bgcolor = $('#'+colorButton.id+'_colorlump').css( 'backgroundColor' );
        ok( bgcolor == 'rgb(221, 217, 195)' || bgcolor == '#ddd9c3'||bgcolor == 'rgb(221,217,195)' , '再次選擇顏色' );
        ua.mouseout( pick );
        equal( document.getElementById(colorButton.popup.content.id+'_preview').style.backgroundColor, '', '鼠標移開，edui-colorpicker-preview 恢覆默認顏色' );
        //_onPickNoColor
        colorButton.showPopup();
        pick = document.getElementsByClassName( 'edui-colorpicker-nocolor' )[0];
        ua.click( pick );
        equal( colorButton.popup._hidden, true, '點擊PickNoColor按鈕後，關閉窗口' );
//        editor.destroy();
        var ed = document.getElementById('editor');
        ed.parentNode.removeChild(ed);
        start();
    });
    stop();
} );

test( 'colorbutton', function () {
        //檢查colorButton的屬性
    var editor = new baidu.editor.ui.Editor();
    stop();
    setTimeout(function(){
        var colorButton = new te.obj[0].ColorButton({editor:editor});
        equal( colorButton.popup.content.noColorText, editor.getLang("clearColor"), '檢查colorButton的文本 ' );
        start();
    },50);
} );

test( 'colorpicker', function () {
        //檢查colorPicker的屬性
    var editor = new baidu.editor.ui.Editor();
    stop();
    setTimeout(function(){
        var colorPicker = new te.obj[0].ColorPicker({editor:editor});
        equal( colorPicker.noColorText, editor.getLang("clearColor"));
        //檢查colorPicker生成的html代碼的內容
        colorPicker.render(te.dom[0]);
        var testPicker = te.dom[0];
        equal( testPicker.getElementsByTagName( 'table' )[0].className, 'edui-box edui-'+editor.options.theme,'' );
        start();
    },50);
} );


