/**
 * 設置文字輸入的方向的插件
 * @file
 * @since 1.2.6.1
 */
(function() {
  var block = domUtils.isBlockElm,
    getObj = function(editor) {
      //            var startNode = editor.selection.getStart(),
      //                parents;
      //            if ( startNode ) {
      //                //查找所有的是block的父親節點
      //                parents = domUtils.findParents( startNode, true, block, true );
      //                for ( var i = 0,ci; ci = parents[i++]; ) {
      //                    if ( ci.getAttribute( 'dir' ) ) {
      //                        return ci;
      //                    }
      //                }
      //            }
      return domUtils.filterNodeList(
        editor.selection.getStartElementPath(),
        function(n) {
          return n && n.nodeType == 1 && n.getAttribute("dir");
        }
      );
    },
    doDirectionality = function(range, editor, forward) {
      var bookmark,
        filterFn = function(node) {
          return node.nodeType == 1
            ? !domUtils.isBookmarkNode(node)
            : !domUtils.isWhitespace(node);
        },
        obj = getObj(editor);

      if (obj && range.collapsed) {
        obj.setAttribute("dir", forward);
        return range;
      }
      bookmark = range.createBookmark();
      range.enlarge(true);
      var bookmark2 = range.createBookmark(),
        current = domUtils.getNextDomNode(bookmark2.start, false, filterFn),
        tmpRange = range.cloneRange(),
        tmpNode;
      while (
        current &&
        !(
          domUtils.getPosition(current, bookmark2.end) &
          domUtils.POSITION_FOLLOWING
        )
      ) {
        if (current.nodeType == 3 || !block(current)) {
          tmpRange.setStartBefore(current);
          while (current && current !== bookmark2.end && !block(current)) {
            tmpNode = current;
            current = domUtils.getNextDomNode(current, false, null, function(
              node
            ) {
              return !block(node);
            });
          }
          tmpRange.setEndAfter(tmpNode);
          var common = tmpRange.getCommonAncestor();
          if (!domUtils.isBody(common) && block(common)) {
            //遍歷到了block節點
            common.setAttribute("dir", forward);
            current = common;
          } else {
            //沒有遍歷到，添加一個block節點
            var p = range.document.createElement("p");
            p.setAttribute("dir", forward);
            var frag = tmpRange.extractContents();
            p.appendChild(frag);
            tmpRange.insertNode(p);
            current = p;
          }

          current = domUtils.getNextDomNode(current, false, filterFn);
        } else {
          current = domUtils.getNextDomNode(current, true, filterFn);
        }
      }
      return range.moveToBookmark(bookmark2).moveToBookmark(bookmark);
    };

  /**
     * 文字輸入方向
     * @command directionality
     * @method execCommand
     * @param { String } cmdName 命令字符串
     * @param { String } forward 傳入'ltr'表示從左向右輸入，傳入'rtl'表示從右向左輸入
     * @example
     * ```javascript
     * editor.execCommand( 'directionality', 'ltr');
     * ```
     */

  /**
     * 查詢當前選區的文字輸入方向
     * @command directionality
     * @method queryCommandValue
     * @param { String } cmdName 命令字符串
     * @return { String } 返回'ltr'表示從左向右輸入，返回'rtl'表示從右向左輸入
     * @example
     * ```javascript
     * editor.queryCommandValue( 'directionality');
     * ```
     */
  UE.commands["directionality"] = {
    execCommand: function(cmdName, forward) {
      var range = this.selection.getRange();
      //閉合時單獨處理
      if (range.collapsed) {
        var txt = this.document.createTextNode("d");
        range.insertNode(txt);
      }
      doDirectionality(range, this, forward);
      if (txt) {
        range.setStartBefore(txt).collapse(true);
        domUtils.remove(txt);
      }

      range.select();
      return true;
    },
    queryCommandValue: function() {
      var node = getObj(this);
      return node ? node.getAttribute("dir") : "ltr";
    }
  };
})();
