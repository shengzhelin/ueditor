/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-4-12
 * Time: 下午4:44
 * To change this template use File | Settings | File Templates.
 */
module( 'ui.autotypeset' );
test( 'AutoTypeSetButton/AutoTypeSetPicker', function() {
    //打開一個自動排版的對話框
    var editor = new baidu.editor.ui.Editor();
    editor.render("editor");
    editor.ready(function(){
        var autotypesetButton = new te.obj[0].AutoTypeSetButton({editor:editor});
        te.dom[0].innerHTML = autotypesetButton.renderHtml();
        autotypesetButton.postRender();
        autotypesetButton.showPopup();
        equal(autotypesetButton.popup._hidden,false,'窗口顯示');
//    檢查每個input的選中情況是否和editor.options里設置的一樣

        var AutoPickerBodyInput = document.getElementsByClassName("edui-autotypesetpicker-body")[0].getElementsByTagName('input');
        for(var i=0;i<AutoPickerBodyInput.length;i++){
            var inputName = AutoPickerBodyInput[i].name;
            if(inputName=="textAlign"||inputName=="imageBlockLine"){
                equal(AutoPickerBodyInput[i].checked,editor.options.autotypeset[inputName]!= null,inputName+":"+editor.options.autotypeset[inputName]);
            }
            else if(/textAlignValue\d/.test(inputName)||/imageBlockLineValue\d/.test(inputName)){
                equal(AutoPickerBodyInput[i].checked,editor.options.autotypeset[inputName.replace(new RegExp('Value\\d',"g"),'')]==AutoPickerBodyInput[i].value,inputName+":"+editor.options.autotypeset[inputName]);
            }
            else{
                if(inputName=='bdc')continue;
                equal(AutoPickerBodyInput[i].checked,editor.options.autotypeset[inputName],inputName+":"+editor.options.autotypeset[inputName]);
            }
        }
        //更改兩個input 的選擇
        var flagChecked = document.getElementsByClassName("edui-autotypesetpicker-body")[0].getElementsByTagName("input")[0].checked ;
        document.getElementsByClassName("edui-autotypesetpicker-body")[0].getElementsByTagName("input")[0].checked = !flagChecked;
        document.getElementById("imageBlockLineValue"+editor.uid).childNodes[2].checked = true;
//    //關閉對話框再重新打開，檢查更改的input內容是否仍然有效
        autotypesetButton.popup.hide();
        equal(autotypesetButton.popup._hidden,true ,'窗口關閉');
        autotypesetButton.showPopup();
        equal(document.getElementsByClassName("edui-autotypesetpicker-body")[0].getElementsByTagName("input")[0].checked,!flagChecked,'檢查更改的input內容');
        equal(document.getElementById("imageBlockLineValue"+editor.uid).childNodes[2].checked,true,'檢查更改的input內容');
        equal(document.getElementById("imageBlockLineValue"+editor.uid).childNodes[1].checked,null,'檢查更改的input內容');
        autotypesetButton.popup.hide();
        start();

    });
    stop();


} );