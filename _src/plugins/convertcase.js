/**
 * 大小寫轉換
 * @file
 * @since 1.2.6.1
 */

/**
 * 把選區內文本變大寫，與“tolowercase”命令互斥
 * @command touppercase
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @example
 * ```javascript
 * editor.execCommand( 'touppercase' );
 * ```
 */

/**
 * 把選區內文本變小寫，與“touppercase”命令互斥
 * @command tolowercase
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @example
 * ```javascript
 * editor.execCommand( 'tolowercase' );
 * ```
 */
UE.commands["touppercase"] = UE.commands["tolowercase"] = {
  execCommand: function(cmd) {
    var me = this;
    var rng = me.selection.getRange();
    if (rng.collapsed) {
      return rng;
    }
    var bk = rng.createBookmark(),
      bkEnd = bk.end,
      filterFn = function(node) {
        return !domUtils.isBr(node) && !domUtils.isWhitespace(node);
      },
      curNode = domUtils.getNextDomNode(bk.start, false, filterFn);
    while (
      curNode &&
      domUtils.getPosition(curNode, bkEnd) & domUtils.POSITION_PRECEDING
    ) {
      if (curNode.nodeType == 3) {
        curNode.nodeValue = curNode.nodeValue[
          cmd == "touppercase" ? "toUpperCase" : "toLowerCase"
        ]();
      }
      curNode = domUtils.getNextDomNode(curNode, true, filterFn);
      if (curNode === bkEnd) {
        break;
      }
    }
    rng.moveToBookmark(bk).select();
  }
};
