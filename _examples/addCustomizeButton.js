UE.registerUI('button',function(editor,uiName){
    //註冊按鈕執行時的command命令，使用命令默認就會帶有回退操作
    editor.registerCommand(uiName,{
        execCommand:function(){
            alert('execCommand:' + uiName)
        }
    });

    //創建一個button
    var btn = new UE.ui.Button({
        //按鈕的名字
        name:uiName,
        //提示
        title:uiName,
        //需要添加的額外樣式，指定icon圖標，這裡默認使用一個重覆的icon
        cssRules :'background-position: -500px 0;',
        //點擊時執行的命令
        onclick:function () {
            //這裡可以不用執行命令,做你自己的操作也可
           editor.execCommand(uiName);
        }
    });

    //當點到編輯內容上時，按鈕要做的狀態反射
    editor.addListener('selectionchange', function () {
        var state = editor.queryCommandState(uiName);
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });

    //因為你是添加button,所以需要返回這個button
    return btn;
}/*index 指定添加到工具欄上的那個位置，默認時追加到最後,editorId 指定這個UI是那個編輯器實例上的，默認是頁面上所有的編輯器都會添加這個按鈕*/);

//自定義引用樣式例子
UE.registerUI('myblockquote',function(editor,uiName){
    editor.registerCommand(uiName,{
        execCommand:function(){
            this.execCommand('blockquote',{
                "style":"border-left: 3px solid #E5E6E1; margin-left: 0px; padding-left: 5px; line-height:36px;"
            });
        }
    });

    var btn = new UE.ui.Button({
        name:uiName,
        title:'自定義引用',
        cssRules :"background-position: -220px 0;",
        onclick:function () {
           editor.execCommand(uiName);
        }
    });

    editor.addListener('selectionchange', function () {
        console.log(this);
        var state = editor.queryCommandState('blockquote');
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });

    return btn;
});
