/**
 * 全選
 * @file
 * @since 1.2.6.1
 */

/**
 * 選中所有內容
 * @command selectall
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @example
 * ```javascript
 * editor.execCommand( 'selectall' );
 * ```
 */
UE.plugins["selectall"] = function() {
  var me = this;
  me.commands["selectall"] = {
    execCommand: function() {
      //去掉了原生的selectAll,因為會出現報錯和當內容為空時，不能出現閉合狀態的光標
      var me = this,
        body = me.body,
        range = me.selection.getRange();
      range.selectNodeContents(body);
      if (domUtils.isEmptyBlock(body)) {
        //opera不能自動合併到元素的里邊，要手動處理一下
        if (browser.opera && body.firstChild && body.firstChild.nodeType == 1) {
          range.setStartAtFirst(body.firstChild);
        }
        range.collapse(true);
      }
      range.select(true);
    },
    notNeedUndo: 1
  };

  //快捷鍵
  me.addshortcutkey({
    selectAll: "ctrl+65"
  });
};
