UE.registerUI('dialog',function(editor,uiName){

    //創建dialog
    var dialog = new UE.ui.Dialog({
        //指定彈出層中頁面的路徑，這裡只能支持頁面,因為跟addCustomizeDialog.js相同目錄，所以無需加路徑
        iframeUrl:'customizeDialogPage.html',
        //需要指定當前的編輯器實例
        editor:editor,
        //指定dialog的名字
        name:uiName,
        //dialog的標題
        title:"這是個測試浮層",

        //指定dialog的外圍樣式
        cssRules:"width:600px;height:300px;",

        //如果給出了buttons就代表dialog有確定和取消
        buttons:[
            {
                className:'edui-okbutton',
                label:'確定',
                onclick:function () {
                    dialog.close(true);
                }
            },
            {
                className:'edui-cancelbutton',
                label:'取消',
                onclick:function () {
                    dialog.close(false);
                }
            }
        ]});

    //參考addCustomizeButton.js
    var btn = new UE.ui.Button({
        name:'dialogbutton' + uiName,
        title:'dialogbutton' + uiName,
        //需要添加的額外樣式，指定icon圖標，這裡默認使用一個重覆的icon
        cssRules :'background-position: -500px 0;',
        onclick:function () {
            //渲染dialog
            dialog.render();
            dialog.open();
        }
    });

    return btn;
}/*index 指定添加到工具欄上的那個位置，默認時追加到最後,editorId 指定這個UI是那個編輯器實例上的，默認是頁面上所有的編輯器都會添加這個按鈕*/);