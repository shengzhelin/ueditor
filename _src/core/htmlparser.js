/**
 * html字符串轉換成uNode節點
 * @file
 * @module UE
 * @since 1.2.6.1
 */

/**
 * UEditor公用空間，UEditor所有的功能都掛載在該空間下
 * @unfile
 * @module UE
 */

/**
 * html字符串轉換成uNode節點的靜態方法
 * @method htmlparser
 * @param { String } htmlstr 要轉換的html代碼
 * @param { Boolean } ignoreBlank 若設置為true，轉換的時候忽略\n\r\t等空白字符
 * @return { uNode } 給定的html片段轉換形成的uNode對象
 * @example
 * ```javascript
 * var root = UE.htmlparser('<p><b>htmlparser</b></p>', true);
 * ```
 */

var htmlparser = (UE.htmlparser = function(htmlstr, ignoreBlank) {
  //todo 原來的方式  [^"'<>\/] 有\/就不能配對上 <TD vAlign=top background=../AAA.JPG> 這樣的標籤了
  //先去掉了，加上的原因忘了，這裡先記錄
  //var re_tag = /<(?:(?:\/([^>]+)>)|(?:!--([\S|\s]*?)-->)|(?:([^\s\/<>]+)\s*((?:(?:"[^"]*")|(?:'[^']*')|[^"'<>])*)\/?>))/g,
  //以上的正則表達式無法匹配:<div style="text-align:center;font-family:" font-size:14px;"=""><img src="http://hs-album.oss.aliyuncs.com/static/27/78/35/image/20161206/20161206174331_41105.gif" alt="" /><br /></div>
  //修改為如下正則表達式:
  var re_tag = /<(?:(?:\/([^>]+)>)|(?:!--([\S|\s]*?)-->)|(?:([^\/\s>]+)((?:\s+[\w\-:.]+(?:\s*=\s*?(?:(?:"[^"]*")|(?:'[^']*')|[^\s"'\/>]+))?)*)[\S\s]*?(\/?)>))/g,
    re_attr = /([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g;

  //ie下取得的html可能會有\n存在，要去掉，在處理replace(/[\t\r\n]*/g,'');代碼高量的\n不能去除
  var allowEmptyTags = {
    b: 1,
    code: 1,
    i: 1,
    u: 1,
    strike: 1,
    s: 1,
    tt: 1,
    strong: 1,
    q: 1,
    samp: 1,
    em: 1,
    span: 1,
    sub: 1,
    img: 1,
    sup: 1,
    font: 1,
    big: 1,
    small: 1,
    iframe: 1,
    a: 1,
    br: 1,
    pre: 1
  };
  htmlstr = htmlstr.replace(new RegExp(domUtils.fillChar, "g"), "");
  if (!ignoreBlank) {
    htmlstr = htmlstr.replace(
      new RegExp(
        "[\\r\\t\\n" +
          (ignoreBlank ? "" : " ") +
          "]*</?(\\w+)\\s*(?:[^>]*)>[\\r\\t\\n" +
          (ignoreBlank ? "" : " ") +
          "]*",
        "g"
      ),
      function(a, b) {
        //br暫時單獨處理
        if (b && allowEmptyTags[b.toLowerCase()]) {
          return a.replace(/(^[\n\r]+)|([\n\r]+$)/g, "");
        }
        return a
          .replace(new RegExp("^[\\r\\n" + (ignoreBlank ? "" : " ") + "]+"), "")
          .replace(
            new RegExp("[\\r\\n" + (ignoreBlank ? "" : " ") + "]+$"),
            ""
          );
      }
    );
  }

  var notTransAttrs = {
    href: 1,
    src: 1
  };

  var uNode = UE.uNode,
    needParentNode = {
      td: "tr",
      tr: ["tbody", "thead", "tfoot"],
      tbody: "table",
      th: "tr",
      thead: "table",
      tfoot: "table",
      caption: "table",
      li: ["ul", "ol"],
      dt: "dl",
      dd: "dl",
      option: "select"
    },
    needChild = {
      ol: "li",
      ul: "li"
    };

  function text(parent, data) {
    if (needChild[parent.tagName]) {
      var tmpNode = uNode.createElement(needChild[parent.tagName]);
      parent.appendChild(tmpNode);
      tmpNode.appendChild(uNode.createText(data));
      parent = tmpNode;
    } else {
      parent.appendChild(uNode.createText(data));
    }
  }

  function element(parent, tagName, htmlattr) {
    var needParentTag;
    if ((needParentTag = needParentNode[tagName])) {
      var tmpParent = parent,
        hasParent;
      while (tmpParent.type != "root") {
        if (
          utils.isArray(needParentTag)
            ? utils.indexOf(needParentTag, tmpParent.tagName) != -1
            : needParentTag == tmpParent.tagName
        ) {
          parent = tmpParent;
          hasParent = true;
          break;
        }
        tmpParent = tmpParent.parentNode;
      }
      if (!hasParent) {
        parent = element(
          parent,
          utils.isArray(needParentTag) ? needParentTag[0] : needParentTag
        );
      }
    }
    //按dtd處理嵌套
    //        if(parent.type != 'root' && !dtd[parent.tagName][tagName])
    //            parent = parent.parentNode;
    var elm = new uNode({
      parentNode: parent,
      type: "element",
      tagName: tagName.toLowerCase(),
      //是自閉合的處理一下
      children: dtd.$empty[tagName] ? null : []
    });
    //如果屬性存在，處理屬性
    if (htmlattr) {
      var attrs = {},
        match;
      while ((match = re_attr.exec(htmlattr))) {
        attrs[match[1].toLowerCase()] = notTransAttrs[match[1].toLowerCase()]
          ? match[2] || match[3] || match[4]
          : utils.unhtml(match[2] || match[3] || match[4]);
      }
      elm.attrs = attrs;
    }
    //trace:3970
    //        //如果parent下不能放elm
    //        if(dtd.$inline[parent.tagName] && dtd.$block[elm.tagName] && !dtd[parent.tagName][elm.tagName]){
    //            parent = parent.parentNode;
    //            elm.parentNode = parent;
    //        }
    parent.children.push(elm);
    //如果是自閉合節點返回父親節點
    return dtd.$empty[tagName] ? parent : elm;
  }

  function comment(parent, data) {
    parent.children.push(
      new uNode({
        type: "comment",
        data: data,
        parentNode: parent
      })
    );
  }

  var match,
    currentIndex = 0,
    nextIndex = 0;
  //設置根節點
  var root = new uNode({
    type: "root",
    children: []
  });
  var currentParent = root;

  while ((match = re_tag.exec(htmlstr))) {
    currentIndex = match.index;
    try {
      if (currentIndex > nextIndex) {
        //text node
        text(currentParent, htmlstr.slice(nextIndex, currentIndex));
      }
      if (match[3]) {
        if (dtd.$cdata[currentParent.tagName]) {
          text(currentParent, match[0]);
        } else {
          //start tag
          currentParent = element(
            currentParent,
            match[3].toLowerCase(),
            match[4]
          );
        }
      } else if (match[1]) {
        if (currentParent.type != "root") {
          if (dtd.$cdata[currentParent.tagName] && !dtd.$cdata[match[1]]) {
            text(currentParent, match[0]);
          } else {
            var tmpParent = currentParent;
            while (
              currentParent.type == "element" &&
              currentParent.tagName != match[1].toLowerCase()
            ) {
              currentParent = currentParent.parentNode;
              if (currentParent.type == "root") {
                currentParent = tmpParent;
                throw "break";
              }
            }
            //end tag
            currentParent = currentParent.parentNode;
          }
        }
      } else if (match[2]) {
        //comment
        comment(currentParent, match[2]);
      }
    } catch (e) {}

    nextIndex = re_tag.lastIndex;
  }
  //如果結束是文本，就有可能丟掉，所以這裡手動判斷一下
  //例如 <li>sdfsdfsdf<li>sdfsdfsdfsdf
  if (nextIndex < htmlstr.length) {
    text(currentParent, htmlstr.slice(nextIndex));
  }
  return root;
});
