///import core
///commands 為非ie瀏覽器自動添加a標籤
///commandsName  AutoLink
///commandsTitle  自動增加鏈接
/**
 * @description 為非ie瀏覽器自動添加a標籤
 * @author zhanyi
 */

UE.plugin.register(
  "autolink",
  function() {
    var cont = 0;

    return !browser.ie
      ? {
          bindEvents: {
            reset: function() {
              cont = 0;
            },
            keydown: function(type, evt) {
              var me = this;
              var keyCode = evt.keyCode || evt.which;

              if (keyCode == 32 || keyCode == 13) {
                var sel = me.selection.getNative(),
                  range = sel.getRangeAt(0).cloneRange(),
                  offset,
                  charCode;

                var start = range.startContainer;
                while (start.nodeType == 1 && range.startOffset > 0) {
                  start =
                    range.startContainer.childNodes[range.startOffset - 1];
                  if (!start) {
                    break;
                  }
                  range.setStart(
                    start,
                    start.nodeType == 1
                      ? start.childNodes.length
                      : start.nodeValue.length
                  );
                  range.collapse(true);
                  start = range.startContainer;
                }

                do {
                  if (range.startOffset == 0) {
                    start = range.startContainer.previousSibling;

                    while (start && start.nodeType == 1) {
                      start = start.lastChild;
                    }
                    if (!start || domUtils.isFillChar(start)) {
                      break;
                    }
                    offset = start.nodeValue.length;
                  } else {
                    start = range.startContainer;
                    offset = range.startOffset;
                  }
                  range.setStart(start, offset - 1);
                  charCode = range.toString().charCodeAt(0);
                } while (charCode != 160 && charCode != 32);

                if (
                  range
                    .toString()
                    .replace(new RegExp(domUtils.fillChar, "g"), "")
                    .match(/(?:https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.)/i)
                ) {
                  while (range.toString().length) {
                    if (
                      /^(?:https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.)/i.test(
                        range.toString()
                      )
                    ) {
                      break;
                    }
                    try {
                      range.setStart(
                        range.startContainer,
                        range.startOffset + 1
                      );
                    } catch (e) {
                      //trace:2121
                      var start = range.startContainer;
                      while (!(next = start.nextSibling)) {
                        if (domUtils.isBody(start)) {
                          return;
                        }
                        start = start.parentNode;
                      }
                      range.setStart(next, 0);
                    }
                  }
                  //range的開始邊界已經在a標籤里的不再處理
                  if (
                    domUtils.findParentByTagName(
                      range.startContainer,
                      "a",
                      true
                    )
                  ) {
                    return;
                  }
                  var a = me.document.createElement("a"),
                    text = me.document.createTextNode(" "),
                    href;

                  me.undoManger && me.undoManger.save();
                  a.appendChild(range.extractContents());
                  a.href = a.innerHTML = a.innerHTML.replace(/<[^>]+>/g, "");
                  href = a
                    .getAttribute("href")
                    .replace(new RegExp(domUtils.fillChar, "g"), "");
                  href = /^(?:https?:\/\/)/gi.test(href)
                    ? href
                    : "http://" + href;
                  a.setAttribute("_src", utils.html(href));
                  a.href = utils.html(href);

                  range.insertNode(a);
                  a.parentNode.insertBefore(text, a.nextSibling);
                  range.setStart(text, 0);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                  me.undoManger && me.undoManger.save();
                }
              }
            }
          }
        }
      : {};
  },
  function() {
    var keyCodes = {
      37: 1,
      38: 1,
      39: 1,
      40: 1,
      13: 1,
      32: 1
    };
    function checkIsCludeLink(node) {
      if (node.nodeType == 3) {
        return null;
      }
      if (node.nodeName == "A") {
        return node;
      }
      var lastChild = node.lastChild;

      while (lastChild) {
        if (lastChild.nodeName == "A") {
          return lastChild;
        }
        if (lastChild.nodeType == 3) {
          if (domUtils.isWhitespace(lastChild)) {
            lastChild = lastChild.previousSibling;
            continue;
          }
          return null;
        }
        lastChild = lastChild.lastChild;
      }
    }
    browser.ie &&
      this.addListener("keyup", function(cmd, evt) {
        var me = this,
          keyCode = evt.keyCode;
        if (keyCodes[keyCode]) {
          var rng = me.selection.getRange();
          var start = rng.startContainer;

          if (keyCode == 13) {
            while (
              start &&
              !domUtils.isBody(start) &&
              !domUtils.isBlockElm(start)
            ) {
              start = start.parentNode;
            }
            if (start && !domUtils.isBody(start) && start.nodeName == "P") {
              var pre = start.previousSibling;
              if (pre && pre.nodeType == 1) {
                var pre = checkIsCludeLink(pre);
                if (pre && !pre.getAttribute("_href")) {
                  domUtils.remove(pre, true);
                }
              }
            }
          } else if (keyCode == 32) {
            if (start.nodeType == 3 && /^\s$/.test(start.nodeValue)) {
              start = start.previousSibling;
              if (
                start &&
                start.nodeName == "A" &&
                !start.getAttribute("_href")
              ) {
                domUtils.remove(start, true);
              }
            }
          } else {
            start = domUtils.findParentByTagName(start, "a", true);
            if (start && !start.getAttribute("_href")) {
              var bk = rng.createBookmark();

              domUtils.remove(start, true);
              rng.moveToBookmark(bk).select(true);
            }
          }
        }
      });
  }
);
