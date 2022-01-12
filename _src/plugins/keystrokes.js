/* 處理特殊鍵的兼容性問題 */
UE.plugins["keystrokes"] = function() {
  var me = this;
  var collapsed = true;
  me.addListener("keydown", function(type, evt) {
    var keyCode = evt.keyCode || evt.which,
      rng = me.selection.getRange();

    //處理全選的情況
    if (
      !rng.collapsed &&
      !(evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey) &&
      ((keyCode >= 65 && keyCode <= 90) ||
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 96 && keyCode <= 111) ||
        {
          13: 1,
          8: 1,
          46: 1
        }[keyCode])
    ) {
      var tmpNode = rng.startContainer;
      if (domUtils.isFillChar(tmpNode)) {
        rng.setStartBefore(tmpNode);
      }
      tmpNode = rng.endContainer;
      if (domUtils.isFillChar(tmpNode)) {
        rng.setEndAfter(tmpNode);
      }
      rng.txtToElmBoundary();
      //結束邊界可能放到了br的前邊，要把br包含進來
      // x[xxx]<br/>
      if (rng.endContainer && rng.endContainer.nodeType == 1) {
        tmpNode = rng.endContainer.childNodes[rng.endOffset];
        if (tmpNode && domUtils.isBr(tmpNode)) {
          rng.setEndAfter(tmpNode);
        }
      }
      if (rng.startOffset == 0) {
        tmpNode = rng.startContainer;
        if (domUtils.isBoundaryNode(tmpNode, "firstChild")) {
          tmpNode = rng.endContainer;
          if (
            rng.endOffset ==
              (tmpNode.nodeType == 3
                ? tmpNode.nodeValue.length
                : tmpNode.childNodes.length) &&
            domUtils.isBoundaryNode(tmpNode, "lastChild")
          ) {
            me.fireEvent("saveScene");
            me.body.innerHTML = "<p>" + (browser.ie ? "" : "<br/>") + "</p>";
            rng.setStart(me.body.firstChild, 0).setCursor(false, true);
            me._selectionChange();
            return;
          }
        }
      }
    }

    //處理backspace
    if (keyCode == keymap.Backspace) {
      rng = me.selection.getRange();
      collapsed = rng.collapsed;
      if (me.fireEvent("delkeydown", evt)) {
        return;
      }
      var start, end;
      //避免按兩次刪除才能生效的問題
      if (rng.collapsed && rng.inFillChar()) {
        start = rng.startContainer;

        if (domUtils.isFillChar(start)) {
          rng.setStartBefore(start).shrinkBoundary(true).collapse(true);
          domUtils.remove(start);
        } else {
          start.nodeValue = start.nodeValue.replace(
            new RegExp("^" + domUtils.fillChar),
            ""
          );
          rng.startOffset--;
          rng.collapse(true).select(true);
        }
      }

      //解決選中control元素不能刪除的問題
      if ((start = rng.getClosedNode())) {
        me.fireEvent("saveScene");
        rng.setStartBefore(start);
        domUtils.remove(start);
        rng.setCursor();
        me.fireEvent("saveScene");
        domUtils.preventDefault(evt);
        return;
      }
      //阻止在table上的刪除
      if (!browser.ie) {
        start = domUtils.findParentByTagName(rng.startContainer, "table", true);
        end = domUtils.findParentByTagName(rng.endContainer, "table", true);
        if ((start && !end) || (!start && end) || start !== end) {
          evt.preventDefault();
          return;
        }
      }
    }
    //處理tab鍵的邏輯
    if (keyCode == keymap.Tab) {
      //不處理以下標籤
      var excludeTagNameForTabKey = {
        ol: 1,
        ul: 1,
        table: 1
      };
      //處理組件里的tab按下事件
      if (me.fireEvent("tabkeydown", evt)) {
        domUtils.preventDefault(evt);
        return;
      }
      var range = me.selection.getRange();
      me.fireEvent("saveScene");
      for (
        var i = 0,
          txt = "",
          tabSize = me.options.tabSize || 4,
          tabNode = me.options.tabNode || "&nbsp;";
        i < tabSize;
        i++
      ) {
        txt += tabNode;
      }
      var span = me.document.createElement("span");
      span.innerHTML = txt + domUtils.fillChar;
      if (range.collapsed) {
        range.insertNode(span.cloneNode(true).firstChild).setCursor(true);
      } else {
        var filterFn = function(node) {
          return (
            domUtils.isBlockElm(node) &&
            !excludeTagNameForTabKey[node.tagName.toLowerCase()]
          );
        };
        //普通的情況
        start = domUtils.findParent(range.startContainer, filterFn, true);
        end = domUtils.findParent(range.endContainer, filterFn, true);
        if (start && end && start === end) {
          range.deleteContents();
          range.insertNode(span.cloneNode(true).firstChild).setCursor(true);
        } else {
          var bookmark = range.createBookmark();
          range.enlarge(true);
          var bookmark2 = range.createBookmark(),
            current = domUtils.getNextDomNode(bookmark2.start, false, filterFn);
          while (
            current &&
            !(
              domUtils.getPosition(current, bookmark2.end) &
              domUtils.POSITION_FOLLOWING
            )
          ) {
            current.insertBefore(
              span.cloneNode(true).firstChild,
              current.firstChild
            );
            current = domUtils.getNextDomNode(current, false, filterFn);
          }
          range.moveToBookmark(bookmark2).moveToBookmark(bookmark).select();
        }
      }
      domUtils.preventDefault(evt);
    }
    //trace:1634
    //ff的del鍵在容器空的時候，也會刪除
    if (browser.gecko && keyCode == 46) {
      range = me.selection.getRange();
      if (range.collapsed) {
        start = range.startContainer;
        if (domUtils.isEmptyBlock(start)) {
          var parent = start.parentNode;
          while (
            domUtils.getChildCount(parent) == 1 &&
            !domUtils.isBody(parent)
          ) {
            start = parent;
            parent = parent.parentNode;
          }
          if (start === parent.lastChild) evt.preventDefault();
          return;
        }
      }
    }

    /* 修覆在編輯區域快捷鍵 (Mac:meta+alt+I; Win:ctrl+shift+I) 打不開 chrome 控制台的問題 */
    browser.chrome &&
      me.on("keydown", function(type, e) {
        var keyCode = e.keyCode || e.which;
        if (
          ((e.metaKey && e.altKey) || (e.ctrlKey && e.shiftKey)) &&
          keyCode == 73
        ) {
          return true;
        }
      });
  });
  me.addListener("keyup", function(type, evt) {
    var keyCode = evt.keyCode || evt.which,
      rng,
      me = this;
    if (keyCode == keymap.Backspace) {
      if (me.fireEvent("delkeyup")) {
        return;
      }
      rng = me.selection.getRange();
      if (rng.collapsed) {
        var tmpNode,
          autoClearTagName = ["h1", "h2", "h3", "h4", "h5", "h6"];
        if (
          (tmpNode = domUtils.findParentByTagName(
            rng.startContainer,
            autoClearTagName,
            true
          ))
        ) {
          if (domUtils.isEmptyBlock(tmpNode)) {
            var pre = tmpNode.previousSibling;
            if (pre && pre.nodeName != "TABLE") {
              domUtils.remove(tmpNode);
              rng.setStartAtLast(pre).setCursor(false, true);
              return;
            } else {
              var next = tmpNode.nextSibling;
              if (next && next.nodeName != "TABLE") {
                domUtils.remove(tmpNode);
                rng.setStartAtFirst(next).setCursor(false, true);
                return;
              }
            }
          }
        }
        //處理當刪除到body時，要重新給p標籤展位
        if (domUtils.isBody(rng.startContainer)) {
          var tmpNode = domUtils.createElement(me.document, "p", {
            innerHTML: browser.ie ? domUtils.fillChar : "<br/>"
          });
          rng.insertNode(tmpNode).setStart(tmpNode, 0).setCursor(false, true);
        }
      }

      //chrome下如果刪除了inline標籤，瀏覽器會有記憶，在輸入文字還是會套上剛才刪除的標籤，所以這裡再選一次就不會了
      if (
        !collapsed &&
        (rng.startContainer.nodeType == 3 ||
          (rng.startContainer.nodeType == 1 &&
            domUtils.isEmptyBlock(rng.startContainer)))
      ) {
        if (browser.ie) {
          var span = rng.document.createElement("span");
          rng.insertNode(span).setStartBefore(span).collapse(true);
          rng.select();
          domUtils.remove(span);
        } else {
          rng.select();
        }
      }
    }
  });
};
