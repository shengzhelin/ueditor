UE.registerUI('combox',function(editor,uiName){
    //注冊按鈕執行時的command命令,用uiName作為command名字，使用命令默認就會帶有回退操作
    editor.registerCommand(uiName,{
        execCommand:function(cmdName,value){
            //這里借用fontsize的命令
            this.execCommand('fontsize',value + 'px')
        },
        queryCommandValue:function(){
            //這里借用fontsize的查詢命令
            return this.queryCommandValue('fontsize')
        }
    });


    //創建下拉菜單中的鍵值對，這里我用字體大小作為例子
    var items = [];
    for(var i= 0,ci;ci=[10, 11, 12, 14, 16, 18, 20, 24, 36][i++];){
        items.push({
            //顯示的條目
            label:'字體:' + ci + 'px',
            //選中條目後的返回值
            value:ci,
            //針對每個條目進行特殊的渲染
            renderLabelHtml:function () {
                //這個是希望每個條目的字體是不同的
                return '<div class="edui-label %%-label" style="line-height:2;font-size:' +
                    this.value + 'px;">' + (this.label || '') + '</div>';
            }
        });
    }
    //創建下來框
    var combox = new UE.ui.Combox({
        //需要指定當前的編輯器實例
        editor:editor,
        //添加條目
        items:items,
        //當選中時要做的事情
        onselect:function (t, index) {
            //拿到選中條目的值
            editor.execCommand(uiName, this.items[index].value);
        },
        //提示
        title:uiName,
        //當編輯器沒有焦點時，combox默認顯示的內容
        initValue:uiName
    });

    editor.addListener('selectionchange', function (type, causeByUi, uiReady) {
        if (!uiReady) {
            var state = editor.queryCommandState(uiName);
            if (state == -1) {
                combox.setDisabled(true);
            } else {
                combox.setDisabled(false);
                var value = editor.queryCommandValue(uiName);
                if(!value){
                    combox.setValue(uiName);
                    return;
                }
                //ie下從源碼模式切換回來時，字體會帶單引號，而且會有逗號
                value && (value = value.replace(/['"]/g, '').split(',')[0]);
                combox.setValue(value);

            }
        }

    });
    return combox;
},2/*index 指定添加到工具欄上的那個位置，默認時追加到最後,editorId 指定這個UI是那個編輯器實例上的，默認是頁面上所有的編輯器都會添加這個按鈕*/);