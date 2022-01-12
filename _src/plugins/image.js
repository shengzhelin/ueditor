/**
 * 圖片插入、排版插件
 * @file
 * @since 1.2.6.1
 */

/**
 * 圖片對齊方式
 * @command imagefloat
 * @method execCommand
 * @remind 值center為獨占一行居中
 * @param { String } cmd 命令字符串
 * @param { String } align 對齊方式，可傳left、right、none、center
 * @remaind center表示圖片獨占一行
 * @example
 * ```javascript
 * editor.execCommand( 'imagefloat', 'center' );
 * ```
 */

/**
 * 如果選區所在位置是圖片區域
 * @command imagefloat
 * @method queryCommandValue
 * @param { String } cmd 命令字符串
 * @return { String } 返回圖片對齊方式
 * @example
 * ```javascript
 * editor.queryCommandValue( 'imagefloat' );
 * ```
 */

UE.commands["imagefloat"] = {
  execCommand: function(cmd, align) {
    var me = this,
      range = me.selection.getRange();
    if (!range.collapsed) {
      var img = range.getClosedNode();
      if (img && img.tagName == "IMG") {
        switch (align) {
          case "left":
          case "right":
          case "none":
            var pN = img.parentNode,
              tmpNode,
              pre,
              next;
            while (dtd.$inline[pN.tagName] || pN.tagName == "A") {
              pN = pN.parentNode;
            }
            tmpNode = pN;
            if (
              tmpNode.tagName == "P" &&
              domUtils.getStyle(tmpNode, "text-align") == "center"
            ) {
              if (
                !domUtils.isBody(tmpNode) &&
                domUtils.getChildCount(tmpNode, function(node) {
                  return !domUtils.isBr(node) && !domUtils.isWhitespace(node);
                }) == 1
              ) {
                pre = tmpNode.previousSibling;
                next = tmpNode.nextSibling;
                if (
                  pre &&
                  next &&
                  pre.nodeType == 1 &&
                  next.nodeType == 1 &&
                  pre.tagName == next.tagName &&
                  domUtils.isBlockElm(pre)
                ) {
                  pre.appendChild(tmpNode.firstChild);
                  while (next.firstChild) {
                    pre.appendChild(next.firstChild);
                  }
                  domUtils.remove(tmpNode);
                  domUtils.remove(next);
                } else {
                  domUtils.setStyle(tmpNode, "text-align", "");
                }
              }

              range.selectNode(img).select();
            }
            domUtils.setStyle(img, "float", align == "none" ? "" : align);
            if (align == "none") {
              domUtils.removeAttributes(img, "align");
            }

            break;
          case "center":
            if (me.queryCommandValue("imagefloat") != "center") {
              pN = img.parentNode;
              domUtils.setStyle(img, "float", "");
              domUtils.removeAttributes(img, "align");
              tmpNode = img;
              while (
                pN &&
                domUtils.getChildCount(pN, function(node) {
                  return !domUtils.isBr(node) && !domUtils.isWhitespace(node);
                }) == 1 &&
                (dtd.$inline[pN.tagName] || pN.tagName == "A")
              ) {
                tmpNode = pN;
                pN = pN.parentNode;
              }
              range.setStartBefore(tmpNode).setCursor(false);
              pN = me.document.createElement("div");
              pN.appendChild(tmpNode);
              domUtils.setStyle(tmpNode, "float", "");

              me.execCommand(
                "insertHtml",
                '<p id="_img_parent_tmp" style="text-align:center">' +
                  pN.innerHTML +
                  "</p>"
              );

              tmpNode = me.document.getElementById("_img_parent_tmp");
              tmpNode.removeAttribute("id");
              tmpNode = tmpNode.firstChild;
              range.selectNode(tmpNode).select();
              //去掉後邊多余的元素
              next = tmpNode.parentNode.nextSibling;
              if (next && domUtils.isEmptyNode(next)) {
                domUtils.remove(next);
              }
            }

            break;
        }
      }
    }
  },
  queryCommandValue: function() {
    var range = this.selection.getRange(),
      startNode,
      floatStyle;
    if (range.collapsed) {
      return "none";
    }
    startNode = range.getClosedNode();
    if (startNode && startNode.nodeType == 1 && startNode.tagName == "IMG") {
      floatStyle =
        domUtils.getComputedStyle(startNode, "float") ||
        startNode.getAttribute("align");

      if (floatStyle == "none") {
        floatStyle = domUtils.getComputedStyle(
          startNode.parentNode,
          "text-align"
        ) == "center"
          ? "center"
          : floatStyle;
      }
      return {
        left: 1,
        right: 1,
        center: 1
      }[floatStyle]
        ? floatStyle
        : "none";
    }
    return "none";
  },
  queryCommandState: function() {
    var range = this.selection.getRange(),
      startNode;

    if (range.collapsed) return -1;

    startNode = range.getClosedNode();
    if (startNode && startNode.nodeType == 1 && startNode.tagName == "IMG") {
      return 0;
    }
    return -1;
  }
};

/**
 * 插入圖片
 * @command insertimage
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @param { Object } opt 屬性鍵值對，這些屬性都將被覆制到當前插入圖片
 * @remind 該命令第二個參數可接受一個圖片配置項對象的數組，可以插入多張圖片，
 * 此時數組的每一個元素都是一個Object類型的圖片屬性集合。
 * @example
 * ```javascript
 * editor.execCommand( 'insertimage', {
 *     src:'a/b/c.jpg',
 *     width:'100',
 *     height:'100'
 * } );
 * ```
 * @example
 * ```javascript
 * editor.execCommand( 'insertimage', [{
 *     src:'a/b/c.jpg',
 *     width:'100',
 *     height:'100'
 * },{
 *     src:'a/b/d.jpg',
 *     width:'100',
 *     height:'100'
 * }] );
 * ```
 */

UE.commands["insertimage"] = {
  execCommand: function(cmd, opt) {
    opt = utils.isArray(opt) ? opt : [opt];
    if (!opt.length) {
      return;
    }
    var me = this,
      range = me.selection.getRange(),
      img = range.getClosedNode();

    if (me.fireEvent("beforeinsertimage", opt) === true) {
      return;
    }

    if (
      img &&
      /img/i.test(img.tagName) &&
      (img.className != "edui-faked-video" ||
        img.className.indexOf("edui-upload-video") != -1) &&
      !img.getAttribute("word_img")
    ) {
      var first = opt.shift();
      var floatStyle = first["floatStyle"];
      delete first["floatStyle"];
      ////                img.style.border = (first.border||0) +"px solid #000";
      ////                img.style.margin = (first.margin||0) +"px";
      //                img.style.cssText += ';margin:' + (first.margin||0) +"px;" + 'border:' + (first.border||0) +"px solid #000";
      domUtils.setAttributes(img, first);
      me.execCommand("imagefloat", floatStyle);
      if (opt.length > 0) {
        range.setStartAfter(img).setCursor(false, true);
        me.execCommand("insertimage", opt);
      }
    } else {
      var html = [],
        str = "",
        ci;
      ci = opt[0];
      if (opt.length == 1) {
        str =
          '<img src="' +
          ci.src +
          '" ' +
          (ci._src ? ' _src="' + ci._src + '" ' : "") +
          (ci.width ? 'width="' + ci.width + '" ' : "") +
          (ci.height ? ' height="' + ci.height + '" ' : "") +
          (ci["floatStyle"] == "left" || ci["floatStyle"] == "right"
            ? ' style="float:' + ci["floatStyle"] + ';"'
            : "") +
          (ci.title && ci.title != "" ? ' title="' + ci.title + '"' : "") +
          (ci.border && ci.border != "0" ? ' border="' + ci.border + '"' : "") +
          (ci.alt && ci.alt != "" ? ' alt="' + ci.alt + '"' : "") +
          (ci.hspace && ci.hspace != "0"
            ? ' hspace = "' + ci.hspace + '"'
            : "") +
          (ci.vspace && ci.vspace != "0"
            ? ' vspace = "' + ci.vspace + '"'
            : "") +
          "/>";
        if (ci["floatStyle"] == "center") {
          str = '<p style="text-align: center">' + str + "</p>";
        }
        html.push(str);
      } else {
        for (var i = 0; (ci = opt[i++]); ) {
          str =
            "<p " +
            (ci["floatStyle"] == "center"
              ? 'style="text-align: center" '
              : "") +
            '><img src="' +
            ci.src +
            '" ' +
            (ci.width ? 'width="' + ci.width + '" ' : "") +
            (ci._src ? ' _src="' + ci._src + '" ' : "") +
            (ci.height ? ' height="' + ci.height + '" ' : "") +
            ' style="' +
            (ci["floatStyle"] && ci["floatStyle"] != "center"
              ? "float:" + ci["floatStyle"] + ";"
              : "") +
            (ci.border || "") +
            '" ' +
            (ci.title ? ' title="' + ci.title + '"' : "") +
            " /></p>";
          html.push(str);
        }
      }

      me.execCommand("insertHtml", html.join(""));
    }

    me.fireEvent("afterinsertimage", opt);
  }
};
