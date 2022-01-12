module('plugins.searchreplace');

test('trace 3381：查找',function(){
    if(ua.browser.opera)
        return;
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>hello啊</p>');
    stop();
    setTimeout(function(){
        range.setStart(editor.body.firstChild,0).collapse(true).select();
        var num = editor.execCommand('searchreplace',{searchStr:'啊'});

        ua.manualDeleteFillData(editor.body);
        equal(editor.body.firstChild.innerHTML,'hello啊');

        equal(editor.selection.getRange().collapsed,false,'檢查選區:不閉合為找到');
        start();
    },20);
});
//
///*trace 974,先替換再撤銷再全部替換，則不會替換
//* ie下會出現的bug*/
test(' trace 3697全部替換',function(){
    //todo trace 3697
    if(ua.browser.opera)
        return;
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>歡迎回來</p>');
    range.setStart(editor.body.firstChild,0).collapse(true).select();
    editor.execCommand('searchreplace',{searchStr:'歡迎',replaceStr:'你好'});
    editor.undoManger.undo();
    editor.execCommand('searchreplace',{searchStr:'歡迎',replaceStr:'你好',all:true});
    ua.manualDeleteFillData(editor.body);
    equal(editor.body.firstChild.innerHTML,'你好回來');
});

///*trace 917*/
///*trace 3288*/todo
//test('替換內容包含查找內容,全部替換',function(){
//    if(ua.browser.opera)
//        return;
//    var editor = te.obj[0];
//    var range = te.obj[1];
//    editor.setContent('<p>hello回來</p>');
//    range.setStart(editor.body.firstChild,0).collapse(true).select();
//   /*searchreplace文件里是一個閉包，閉包中有一個全局變量currentRange，在上一次用例執行結束後仍然會保存這個值，導致下一次用例受影響*/
//    editor.execCommand('searchreplace',{searchStr:'hello',replaceStr:'hello啊',all:true});
//    ua.manualDeleteFillData(editor.body);
//    equal(editor.body.firstChild.innerHTML,'hello啊回來');
//});

/*trace 973*/
test(' trace 3697替換內容包含查找內容',function(){
    if(ua.browser.opera)
        return;
    var editor = te.obj[0];
    var range = te.obj[1];
    editor.setContent('<p>歡迎回來</p>');
    range.setStart(editor.body.firstChild,0).collapse(1).select();
    editor.execCommand('searchreplace',{searchStr:'歡迎',replaceStr:'歡迎啊'});
    ua.manualDeleteFillData(editor.body);
    equal(editor.body.firstChild.innerHTML,'歡迎啊回來');
    editor.undoManger.undo();
    ua.manualDeleteFillData(editor.body);
    equal(editor.body.firstChild.innerHTML,'歡迎回來');
});
//
///*trace 1286*/todo
//test('連續2次全部替換',function(){
//    if(ua.browser.opera)
//        return;
//        var editor = te.obj[0];
//        editor.setContent('<p>歡迎回來</p>');
//        editor.execCommand('searchreplace',{searchStr:'歡迎',replaceStr:'歡迎啊',all:true});
//        ua.manualDeleteFillData(editor.body);
//        equal(editor.body.firstChild.innerHTML,'歡迎啊回來');
//        editor.execCommand('searchreplace',{searchStr:'歡迎',replaceStr:'歡迎啊',all:true});
//        ua.manualDeleteFillData(editor.body);
//        equal(editor.body.firstChild.innerHTML,'歡迎啊啊回來');
//});
//
test('替換內容為空',function(){
    if(ua.browser.opera)
        return;
    var editor = te.obj[0];
    editor.setContent('<p>歡迎回來</p>');
    stop();
    setTimeout(function(){
        editor.focus();
        editor.execCommand('searchreplace',{searchStr:'歡迎',replaceStr:''});
        ua.manualDeleteFillData(editor.body);
        equal(editor.body.firstChild.innerHTML,'回來');
        start();
    },50);
});
//
test('全部替換內容為空',function(){
    if(ua.browser.opera)
        return;
    var editor = te.obj[0];
    editor.setContent('<p>歡迎回來 歡迎啊</p>');
    editor.execCommand('searchreplace',{searchStr:'歡迎',replaceStr:'',all:true});
    ua.manualDeleteFillData(editor.body);
    equal(editor.body.firstChild.innerHTML,'回來 啊');
});

//test('查找替換支持正則',function(){
//    if(ua.browser.opera)
//        return;
//    var editor = te.obj[0];
//    editor.setContent('<p>sd2323fasdfasd3434f</p>');
//    //因為是字符表示的正則要做轉換
//    editor.execCommand('searchreplace',{searchStr:'/\\d+/',replaceStr:'',all:true});
//    ua.manualDeleteFillData(editor.body);
//    equal(editor.body.firstChild.innerHTML,'sdfasdfasdf');
//    editor.setContent('<p>sd2323fasdfasd3434f</p><p>首都發生地2323方</p>');
//    editor.execCommand('searchreplace',{searchStr:'/\\d+/',replaceStr:'',all:true});
//    ua.manualDeleteFillData(editor.body);
//    equal(editor.body.innerHTML.toLowerCase().replace(/>\s+</g,'><'),'<p>sdfasdfasdf</p><p>首都發生地方</p>');
//});
