/**
 * 清空文檔插件
 * @file
 * @since 1.2.6.1
 */

/**
 * 清空文檔
 * @command cleardoc
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @example
 * ```javascript
 * //editor 是編輯器實例
 * editor.execCommand('cleardoc');
 * ```
 */

UE.commands['cleardoc'] = {
    execCommand : function( cmdName) {
        var me = this,
            enterTag = me.options.enterTag,
            range = me.selection.getRange();
        if(enterTag == "br"){
            me.body.innerHTML = "<br/>";
            range.setStart(me.body,0).setCursor();
        }else{
            me.body.innerHTML = "<p>"+(ie ? "" : "<br/>")+"</p>";
            range.setStart(me.body.firstChild,0).setCursor(false,true);
        }
        setTimeout(function(){
            me.fireEvent("clearDoc");
        },0);

    }
};

