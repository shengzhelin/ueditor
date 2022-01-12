/**
 * 快捷鍵提交
 * @file
 * @since 1.2.6.1
 */

/**
 * 提交表單
 * @command autosubmit
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @example
 * ```javascript
 * editor.execCommand( 'autosubmit' );
 * ```
 */

UE.plugin.register("autosubmit", function() {
  return {
    shortcutkey: {
      autosubmit: "ctrl+13" //手動提交
    },
    commands: {
      autosubmit: {
        execCommand: function() {
          var me = this,
            form = domUtils.findParentByTagName(me.iframe, "form", false);
          if (form) {
            if (me.fireEvent("beforesubmit") === false) {
              return;
            }
            me.sync();
            form.submit();
          }
        }
      }
    }
  };
});
