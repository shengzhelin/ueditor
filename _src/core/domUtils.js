/**
 * Dom操作工具包
 * @file
 * @module UE.dom.domUtils
 * @since 1.2.6.1
 */

/**
 * Dom操作工具包
 * @unfile
 * @module UE.dom.domUtils
 */
function getDomNode(node, start, ltr, startFromChild, fn, guard) {
  var tmpNode = startFromChild && node[start],
    parent;
  !tmpNode && (tmpNode = node[ltr]);
  while (!tmpNode && (parent = (parent || node).parentNode)) {
    if (parent.tagName == "BODY" || (guard && !guard(parent))) {
      return null;
    }
    tmpNode = parent[ltr];
  }
  if (tmpNode && fn && !fn(tmpNode)) {
    return getDomNode(tmpNode, start, ltr, false, fn);
  }
  return tmpNode;
}
var attrFix = ie && browser.version < 9
  ? {
      tabindex: "tabIndex",
      readonly: "readOnly",
      for: "htmlFor",
      class: "className",
      maxlength: "maxLength",
      cellspacing: "cellSpacing",
      cellpadding: "cellPadding",
      rowspan: "rowSpan",
      colspan: "colSpan",
      usemap: "useMap",
      frameborder: "frameBorder"
    }
  : {
      tabindex: "tabIndex",
      readonly: "readOnly"
    },
  styleBlock = utils.listToMap([
    "-webkit-box",
    "-moz-box",
    "block",
    "list-item",
    "table",
    "table-row-group",
    "table-header-group",
    "table-footer-group",
    "table-row",
    "table-column-group",
    "table-column",
    "table-cell",
    "table-caption"
  ]);
var domUtils = (dom.domUtils = {
  //節點常量
  NODE_ELEMENT: 1,
  NODE_DOCUMENT: 9,
  NODE_TEXT: 3,
  NODE_COMMENT: 8,
  NODE_DOCUMENT_FRAGMENT: 11,

  //位置關系
  POSITION_IDENTICAL: 0,
  POSITION_DISCONNECTED: 1,
  POSITION_FOLLOWING: 2,
  POSITION_PRECEDING: 4,
  POSITION_IS_CONTAINED: 8,
  POSITION_CONTAINS: 16,
  //ie6使用其他的會有一段空白出現
  fillChar: ie && browser.version == "6" ? "\ufeff" : "\u200B",
  //-------------------------Node部分--------------------------------
  keys: {
    /*Backspace*/ 8: 1,
    /*Delete*/ 46: 1,
    /*Shift*/ 16: 1,
    /*Ctrl*/ 17: 1,
    /*Alt*/ 18: 1,
    37: 1,
    38: 1,
    39: 1,
    40: 1,
    13: 1 /*enter*/
  },
  /**
     * 獲取節點A相對於節點B的位置關系
     * @method getPosition
     * @param { Node } nodeA 需要查詢位置關系的節點A
     * @param { Node } nodeB 需要查詢位置關系的節點B
     * @return { Number } 節點A與節點B的關系
     * @example
     * ```javascript
     * //output: 20
     * var position = UE.dom.domUtils.getPosition( document.documentElement, document.body );
     *
     * switch ( position ) {
     *
     *      //0
     *      case UE.dom.domUtils.POSITION_IDENTICAL:
     *          console.log('元素相同');
     *          break;
     *      //1
     *      case UE.dom.domUtils.POSITION_DISCONNECTED:
     *          console.log('兩個節點在不同的文檔中');
     *          break;
     *      //2
     *      case UE.dom.domUtils.POSITION_FOLLOWING:
     *          console.log('節點A在節點B之後');
     *          break;
     *      //4
     *      case UE.dom.domUtils.POSITION_PRECEDING;
     *          console.log('節點A在節點B之前');
     *          break;
     *      //8
     *      case UE.dom.domUtils.POSITION_IS_CONTAINED:
     *          console.log('節點A被節點B包含');
     *          break;
     *      case 10:
     *          console.log('節點A被節點B包含且節點A在節點B之後');
     *          break;
     *      //16
     *      case UE.dom.domUtils.POSITION_CONTAINS:
     *          console.log('節點A包含節點B');
     *          break;
     *      case 20:
     *          console.log('節點A包含節點B且節點A在節點B之前');
     *          break;
     *
     * }
     * ```
     */
  getPosition: function(nodeA, nodeB) {
    // 如果兩個節點是同一個節點
    if (nodeA === nodeB) {
      // domUtils.POSITION_IDENTICAL
      return 0;
    }
    var node,
      parentsA = [nodeA],
      parentsB = [nodeB];
    node = nodeA;
    while ((node = node.parentNode)) {
      // 如果nodeB是nodeA的祖先節點
      if (node === nodeB) {
        // domUtils.POSITION_IS_CONTAINED + domUtils.POSITION_FOLLOWING
        return 10;
      }
      parentsA.push(node);
    }
    node = nodeB;
    while ((node = node.parentNode)) {
      // 如果nodeA是nodeB的祖先節點
      if (node === nodeA) {
        // domUtils.POSITION_CONTAINS + domUtils.POSITION_PRECEDING
        return 20;
      }
      parentsB.push(node);
    }
    parentsA.reverse();
    parentsB.reverse();
    if (parentsA[0] !== parentsB[0]) {
      // domUtils.POSITION_DISCONNECTED
      return 1;
    }
    var i = -1;
    while ((i++, parentsA[i] === parentsB[i])) {}
    nodeA = parentsA[i];
    nodeB = parentsB[i];
    while ((nodeA = nodeA.nextSibling)) {
      if (nodeA === nodeB) {
        // domUtils.POSITION_PRECEDING
        return 4;
      }
    }
    // domUtils.POSITION_FOLLOWING
    return 2;
  },

  /**
     * 檢測節點node在父節點中的索引位置
     * @method getNodeIndex
     * @param { Node } node 需要檢測的節點對象
     * @return { Number } 該節點在父節點中的位置
     * @see UE.dom.domUtils.getNodeIndex(Node,Boolean)
     */

  /**
     * 檢測節點node在父節點中的索引位置， 根據給定的mergeTextNode參數決定是否要合併多個連續的文本節點為一個節點
     * @method getNodeIndex
     * @param { Node } node 需要檢測的節點對象
     * @param { Boolean } mergeTextNode 是否合併多個連續的文本節點為一個節點
     * @return { Number } 該節點在父節點中的位置
     * @example
     * ```javascript
     *
     *      var node = document.createElement("div");
     *
     *      node.appendChild( document.createTextNode( "hello" ) );
     *      node.appendChild( document.createTextNode( "world" ) );
     *      node.appendChild( node = document.createElement( "div" ) );
     *
     *      //output: 2
     *      console.log( UE.dom.domUtils.getNodeIndex( node ) );
     *
     *      //output: 1
     *      console.log( UE.dom.domUtils.getNodeIndex( node, true ) );
     *
     * ```
     */
  getNodeIndex: function(node, ignoreTextNode) {
    var preNode = node,
      i = 0;
    while ((preNode = preNode.previousSibling)) {
      if (ignoreTextNode && preNode.nodeType == 3) {
        if (preNode.nodeType != preNode.nextSibling.nodeType) {
          i++;
        }
        continue;
      }
      i++;
    }
    return i;
  },

  /**
     * 檢測節點node是否在給定的document對象上
     * @method inDoc
     * @param { Node } node 需要檢測的節點對象
     * @param { DomDocument } doc 需要檢測的document對象
     * @return { Boolean } 該節點node是否在給定的document的dom樹上
     * @example
     * ```javascript
     *
     * var node = document.createElement("div");
     *
     * //output: false
     * console.log( UE.do.domUtils.inDoc( node, document ) );
     *
     * document.body.appendChild( node );
     *
     * //output: true
     * console.log( UE.do.domUtils.inDoc( node, document ) );
     *
     * ```
     */
  inDoc: function(node, doc) {
    return domUtils.getPosition(node, doc) == 10;
  },
  /**
     * 根據給定的過濾規則filterFn， 查找符合該過濾規則的node節點的第一個祖先節點，
     * 查找的起點是給定node節點的父節點。
     * @method findParent
     * @param { Node } node 需要查找的節點
     * @param { Function } filterFn 自定義的過濾方法。
     * @warning 查找的終點是到body節點為止
     * @remind 自定義的過濾方法filterFn接受一個Node對象作為參數， 該對象代表當前執行檢測的祖先節點。 如果該
     *          節點滿足過濾條件， 則要求返回true， 這時將直接返回該節點作為findParent()的結果， 否則， 請返回false。
     * @return { Node | Null } 如果找到符合過濾條件的節點， 就返回該節點， 否則返回NULL
     * @example
     * ```javascript
     * var filterNode = UE.dom.domUtils.findParent( document.body.firstChild, function ( node ) {
     *
     *     //由於查找的終點是body節點， 所以永遠也不會匹配當前過濾器的條件， 即這裡永遠會返回false
     *     return node.tagName === "HTML";
     *
     * } );
     *
     * //output: true
     * console.log( filterNode === null );
     * ```
     */

  /**
     * 根據給定的過濾規則filterFn， 查找符合該過濾規則的node節點的第一個祖先節點，
     * 如果includeSelf的值為true，則查找的起點是給定的節點node， 否則， 起點是node的父節點
     * @method findParent
     * @param { Node } node 需要查找的節點
     * @param { Function } filterFn 自定義的過濾方法。
     * @param { Boolean } includeSelf 查找過程是否包含自身
     * @warning 查找的終點是到body節點為止
     * @remind 自定義的過濾方法filterFn接受一個Node對象作為參數， 該對象代表當前執行檢測的祖先節點。 如果該
     *          節點滿足過濾條件， 則要求返回true， 這時將直接返回該節點作為findParent()的結果， 否則， 請返回false。
     * @remind 如果includeSelf為true， 則過濾器第一次執行時的參數會是節點本身。
     *          反之， 過濾器第一次執行時的參數將是該節點的父節點。
     * @return { Node | Null } 如果找到符合過濾條件的節點， 就返回該節點， 否則返回NULL
     * @example
     * ```html
     * <body>
     *
     *      <div id="test">
     *      </div>
     *
     *      <script type="text/javascript">
     *
     *          //output: DIV, BODY
     *          var filterNode = UE.dom.domUtils.findParent( document.getElementById( "test" ), function ( node ) {
     *
     *              console.log( node.tagName );
     *              return false;
     *
     *          }, true );
     *
     *      </script>
     * </body>
     * ```
     */
  findParent: function(node, filterFn, includeSelf) {
    if (node && !domUtils.isBody(node)) {
      node = includeSelf ? node : node.parentNode;
      while (node) {
        if (!filterFn || filterFn(node) || domUtils.isBody(node)) {
          return filterFn && !filterFn(node) && domUtils.isBody(node)
            ? null
            : node;
        }
        node = node.parentNode;
      }
    }
    return null;
  },
  /**
     * 查找node的節點名為tagName的第一個祖先節點， 查找的起點是node節點的父節點。
     * @method findParentByTagName
     * @param { Node } node 需要查找的節點對象
     * @param { Array } tagNames 需要查找的父節點的名稱數組
     * @warning 查找的終點是到body節點為止
     * @return { Node | NULL } 如果找到符合條件的節點， 則返回該節點， 否則返回NULL
     * @example
     * ```javascript
     * var node = UE.dom.domUtils.findParentByTagName( document.getElementsByTagName("div")[0], [ "BODY" ] );
     * //output: BODY
     * console.log( node.tagName );
     * ```
     */

  /**
     * 查找node的節點名為tagName的祖先節點， 如果includeSelf的值為true，則查找的起點是給定的節點node，
     * 否則， 起點是node的父節點。
     * @method findParentByTagName
     * @param { Node } node 需要查找的節點對象
     * @param { Array } tagNames 需要查找的父節點的名稱數組
     * @param { Boolean } includeSelf 查找過程是否包含node節點自身
     * @warning 查找的終點是到body節點為止
     * @return { Node | NULL } 如果找到符合條件的節點， 則返回該節點， 否則返回NULL
     * @example
     * ```javascript
     * var queryTarget = document.getElementsByTagName("div")[0];
     * var node = UE.dom.domUtils.findParentByTagName( queryTarget, [ "DIV" ], true );
     * //output: true
     * console.log( queryTarget === node );
     * ```
     */
  findParentByTagName: function(node, tagNames, includeSelf, excludeFn) {
    tagNames = utils.listToMap(utils.isArray(tagNames) ? tagNames : [tagNames]);
    return domUtils.findParent(
      node,
      function(node) {
        return tagNames[node.tagName] && !(excludeFn && excludeFn(node));
      },
      includeSelf
    );
  },
  /**
     * 查找節點node的祖先節點集合， 查找的起點是給定節點的父節點，結果集中不包含給定的節點。
     * @method findParents
     * @param { Node } node 需要查找的節點對象
     * @return { Array } 給定節點的祖先節點數組
     * @grammar UE.dom.domUtils.findParents(node)  => Array  //返回一個祖先節點數組集合，不包含自身
     * @grammar UE.dom.domUtils.findParents(node,includeSelf)  => Array  //返回一個祖先節點數組集合，includeSelf指定是否包含自身
     * @grammar UE.dom.domUtils.findParents(node,includeSelf,filterFn)  => Array  //返回一個祖先節點數組集合，filterFn指定過濾條件，返回true的node將被選取
     * @grammar UE.dom.domUtils.findParents(node,includeSelf,filterFn,closerFirst)  => Array  //返回一個祖先節點數組集合，closerFirst為true的話，node的直接父親節點是數組的第0個
     */

  /**
     * 查找節點node的祖先節點集合， 如果includeSelf的值為true，
     * 則返回的結果集中允許出現當前給定的節點， 否則， 該節點不會出現在其結果集中。
     * @method findParents
     * @param { Node } node 需要查找的節點對象
     * @param { Boolean } includeSelf 查找的結果中是否允許包含當前查找的節點對象
     * @return { Array } 給定節點的祖先節點數組
     */
  findParents: function(node, includeSelf, filterFn, closerFirst) {
    var parents = includeSelf && ((filterFn && filterFn(node)) || !filterFn)
      ? [node]
      : [];
    while ((node = domUtils.findParent(node, filterFn))) {
      parents.push(node);
    }
    return closerFirst ? parents : parents.reverse();
  },

  /**
     * 在節點node後面插入新節點newNode
     * @method insertAfter
     * @param { Node } node 目標節點
     * @param { Node } newNode 新插入的節點， 該節點將置於目標節點之後
     * @return { Node } 新插入的節點
     */
  insertAfter: function(node, newNode) {
    return node.nextSibling
      ? node.parentNode.insertBefore(newNode, node.nextSibling)
      : node.parentNode.appendChild(newNode);
  },

  /**
     * 刪除節點node及其下屬的所有節點
     * @method remove
     * @param { Node } node 需要刪除的節點對象
     * @return { Node } 返回剛刪除的節點對象
     * @example
     * ```html
     * <div id="test">
     *     <div id="child">你好</div>
     * </div>
     * <script>
     *     UE.dom.domUtils.remove( document.body, false );
     *     //output: false
     *     console.log( document.getElementById( "child" ) !== null );
     * </script>
     * ```
     */

  /**
     * 刪除節點node，並根據keepChildren的值決定是否保留子節點
     * @method remove
     * @param { Node } node 需要刪除的節點對象
     * @param { Boolean } keepChildren 是否需要保留子節點
     * @return { Node } 返回剛刪除的節點對象
     * @example
     * ```html
     * <div id="test">
     *     <div id="child">你好</div>
     * </div>
     * <script>
     *     UE.dom.domUtils.remove( document.body, true );
     *     //output: true
     *     console.log( document.getElementById( "child" ) !== null );
     * </script>
     * ```
     */
  remove: function(node, keepChildren) {
    var parent = node.parentNode,
      child;
    if (parent) {
      if (keepChildren && node.hasChildNodes()) {
        while ((child = node.firstChild)) {
          parent.insertBefore(child, node);
        }
      }
      parent.removeChild(node);
    }
    return node;
  },

  /**
     * 取得node節點的下一個兄弟節點， 如果該節點其後沒有兄弟節點， 則遞歸查找其父節點之後的第一個兄弟節點，
     * 直到找到滿足條件的節點或者遞歸到BODY節點之後才會結束。
     * @method getNextDomNode
     * @param { Node } node 需要獲取其後的兄弟節點的節點對象
     * @return { Node | NULL } 如果找滿足條件的節點， 則返回該節點， 否則返回NULL
     * @example
     * ```html
     *     <body>
     *      <div id="test">
     *          <span></span>
     *      </div>
     *      <i>xxx</i>
     * </body>
     * <script>
     *
     *     //output: i節點
     *     console.log( UE.dom.domUtils.getNextDomNode( document.getElementById( "test" ) ) );
     *
     * </script>
     * ```
     * @example
     * ```html
     * <body>
     *      <div>
     *          <span></span>
     *          <i id="test">xxx</i>
     *      </div>
     *      <b>xxx</b>
     * </body>
     * <script>
     *
     *     //由於id為test的i節點之後沒有兄弟節點， 則查找其父節點（div）後面的兄弟節點
     *     //output: b節點
     *     console.log( UE.dom.domUtils.getNextDomNode( document.getElementById( "test" ) ) );
     *
     * </script>
     * ```
     */

  /**
     * 取得node節點的下一個兄弟節點， 如果startFromChild的值為ture，則先獲取其子節點，
     * 如果有子節點則直接返回第一個子節點；如果沒有子節點或者startFromChild的值為false，
     * 則執行<a href="#UE.dom.domUtils.getNextDomNode(Node)">getNextDomNode(Node node)</a>的查找過程。
     * @method getNextDomNode
     * @param { Node } node 需要獲取其後的兄弟節點的節點對象
     * @param { Boolean } startFromChild 查找過程是否從其子節點開始
     * @return { Node | NULL } 如果找滿足條件的節點， 則返回該節點， 否則返回NULL
     * @see UE.dom.domUtils.getNextDomNode(Node)
     */
  getNextDomNode: function(node, startFromChild, filterFn, guard) {
    return getDomNode(
      node,
      "firstChild",
      "nextSibling",
      startFromChild,
      filterFn,
      guard
    );
  },
  getPreDomNode: function(node, startFromChild, filterFn, guard) {
    return getDomNode(
      node,
      "lastChild",
      "previousSibling",
      startFromChild,
      filterFn,
      guard
    );
  },
  /**
     * 檢測節點node是否屬是UEditor定義的bookmark節點
     * @method isBookmarkNode
     * @private
     * @param { Node } node 需要檢測的節點對象
     * @return { Boolean } 是否是bookmark節點
     * @example
     * ```html
     * <span id="_baidu_bookmark_1"></span>
     * <script>
     *      var bookmarkNode = document.getElementById("_baidu_bookmark_1");
     *      //output: true
     *      console.log( UE.dom.domUtils.isBookmarkNode( bookmarkNode ) );
     * </script>
     * ```
     */
  isBookmarkNode: function(node) {
    return node.nodeType == 1 && node.id && /^_baidu_bookmark_/i.test(node.id);
  },
  /**
     * 獲取節點node所屬的window對象
     * @method  getWindow
     * @param { Node } node 節點對象
     * @return { Window } 當前節點所屬的window對象
     * @example
     * ```javascript
     * //output: true
     * console.log( UE.dom.domUtils.getWindow( document.body ) === window );
     * ```
     */
  getWindow: function(node) {
    var doc = node.ownerDocument || node;
    return doc.defaultView || doc.parentWindow;
  },
  /**
     * 獲取離nodeA與nodeB最近的公共的祖先節點
     * @method  getCommonAncestor
     * @param { Node } nodeA 第一個節點
     * @param { Node } nodeB 第二個節點
     * @remind 如果給定的兩個節點是同一個節點， 將直接返回該節點。
     * @return { Node | NULL } 如果未找到公共節點， 返回NULL， 否則返回最近的公共祖先節點。
     * @example
     * ```javascript
     * var commonAncestor = UE.dom.domUtils.getCommonAncestor( document.body, document.body.firstChild );
     * //output: true
     * console.log( commonAncestor.tagName.toLowerCase() === 'body' );
     * ```
     */
  getCommonAncestor: function(nodeA, nodeB) {
    if (nodeA === nodeB) return nodeA;
    var parentsA = [nodeA],
      parentsB = [nodeB],
      parent = nodeA,
      i = -1;
    while ((parent = parent.parentNode)) {
      if (parent === nodeB) {
        return parent;
      }
      parentsA.push(parent);
    }
    parent = nodeB;
    while ((parent = parent.parentNode)) {
      if (parent === nodeA) return parent;
      parentsB.push(parent);
    }
    parentsA.reverse();
    parentsB.reverse();
    while ((i++, parentsA[i] === parentsB[i])) {}
    return i == 0 ? null : parentsA[i - 1];
  },
  /**
     * 清除node節點左右連續為空的兄弟inline節點
     * @method clearEmptySibling
     * @param { Node } node 執行的節點對象， 如果該節點的左右連續的兄弟節點是空的inline節點，
     * 則這些兄弟節點將被刪除
     * @grammar UE.dom.domUtils.clearEmptySibling(node,ignoreNext)  //ignoreNext指定是否忽略右邊空節點
     * @grammar UE.dom.domUtils.clearEmptySibling(node,ignoreNext,ignorePre)  //ignorePre指定是否忽略左邊空節點
     * @example
     * ```html
     * <body>
     *     <div></div>
     *     <span id="test"></span>
     *     <i></i>
     *     <b></b>
     *     <em>xxx</em>
     *     <span></span>
     * </body>
     * <script>
     *
     *      UE.dom.domUtils.clearEmptySibling( document.getElementById( "test" ) );
     *
     *      //output: <div></div><span id="test"></span><em>xxx</em><span></span>
     *      console.log( document.body.innerHTML );
     *
     * </script>
     * ```
     */

  /**
     * 清除node節點左右連續為空的兄弟inline節點， 如果ignoreNext的值為true，
     * 則忽略對右邊兄弟節點的操作。
     * @method clearEmptySibling
     * @param { Node } node 執行的節點對象， 如果該節點的左右連續的兄弟節點是空的inline節點，
     * @param { Boolean } ignoreNext 是否忽略忽略對右邊的兄弟節點的操作
     * 則這些兄弟節點將被刪除
     * @see UE.dom.domUtils.clearEmptySibling(Node)
     */

  /**
     * 清除node節點左右連續為空的兄弟inline節點， 如果ignoreNext的值為true，
     * 則忽略對右邊兄弟節點的操作， 如果ignorePre的值為true，則忽略對左邊兄弟節點的操作。
     * @method clearEmptySibling
     * @param { Node } node 執行的節點對象， 如果該節點的左右連續的兄弟節點是空的inline節點，
     * @param { Boolean } ignoreNext 是否忽略忽略對右邊的兄弟節點的操作
     * @param { Boolean } ignorePre 是否忽略忽略對左邊的兄弟節點的操作
     * 則這些兄弟節點將被刪除
     * @see UE.dom.domUtils.clearEmptySibling(Node)
     */
  clearEmptySibling: function(node, ignoreNext, ignorePre) {
    function clear(next, dir) {
      var tmpNode;
      while (
        next &&
        !domUtils.isBookmarkNode(next) &&
        (domUtils.isEmptyInlineElement(next) ||
          //這裡不能把空格算進來會吧空格幹掉，出現文字間的空格丟掉了
          !new RegExp("[^\t\n\r" + domUtils.fillChar + "]").test(
            next.nodeValue
          ))
      ) {
        tmpNode = next[dir];
        domUtils.remove(next);
        next = tmpNode;
      }
    }
    !ignoreNext && clear(node.nextSibling, "nextSibling");
    !ignorePre && clear(node.previousSibling, "previousSibling");
  },
  /**
     * 將一個文本節點textNode拆分成兩個文本節點，offset指定拆分位置
     * @method split
     * @param { Node } textNode 需要拆分的文本節點對象
     * @param { int } offset 需要拆分的位置， 位置計算從0開始
     * @return { Node } 拆分後形成的新節點
     * @example
     * ```html
     * <div id="test">abcdef</div>
     * <script>
     *      var newNode = UE.dom.domUtils.split( document.getElementById( "test" ).firstChild, 3 );
     *      //output: def
     *      console.log( newNode.nodeValue );
     * </script>
     * ```
     */
  split: function(node, offset) {
    var doc = node.ownerDocument;
    if (browser.ie && offset == node.nodeValue.length) {
      var next = doc.createTextNode("");
      return domUtils.insertAfter(node, next);
    }
    var retval = node.splitText(offset);
    //ie8下splitText不會跟新childNodes,我們手動觸發他的更新
    if (browser.ie8) {
      var tmpNode = doc.createTextNode("");
      domUtils.insertAfter(retval, tmpNode);
      domUtils.remove(tmpNode);
    }
    return retval;
  },

  /**
     * 檢測文本節點textNode是否為空節點（包括空格、換行、占位符等字符）
     * @method  isWhitespace
     * @param { Node } node 需要檢測的節點對象
     * @return { Boolean } 檢測的節點是否為空
     * @example
     * ```html
     * <div id="test">
     *
     * </div>
     * <script>
     *      //output: true
     *      console.log( UE.dom.domUtils.isWhitespace( document.getElementById("test").firstChild ) );
     * </script>
     * ```
     */
  isWhitespace: function(node) {
    return !new RegExp("[^ \t\n\r" + domUtils.fillChar + "]").test(
      node.nodeValue
    );
  },
  /**
     * 獲取元素element相對於viewport的位置坐標
     * @method getXY
     * @param { Node } element 需要計算位置的節點對象
     * @return { Object } 返回形如{x:left,y:top}的一個key-value映射對象， 其中鍵x代表水平偏移距離，
     *                          y代表垂直偏移距離。
     *
     * @example
     * ```javascript
     * var location = UE.dom.domUtils.getXY( document.getElementById("test") );
     * //output: test的坐標為: 12, 24
     * console.log( 'test的坐標為： ', location.x, ',', location.y );
     * ```
     */
  getXY: function(element) {
    var x = 0,
      y = 0;
    while (element.offsetParent) {
      y += element.offsetTop;
      x += element.offsetLeft;
      element = element.offsetParent;
    }
    return { x: x, y: y };
  },
  /**
     * 為元素element綁定原生DOM事件，type為事件類型，handler為處理函數
     * @method on
     * @param { Node } element 需要綁定事件的節點對象
     * @param { String } type 綁定的事件類型
     * @param { Function } handler 事件處理器
     * @example
     * ```javascript
     * UE.dom.domUtils.on(document.body,"click",function(e){
     *     //e為事件對象，this為被點擊元素對戲那個
     * });
     * ```
     */

  /**
     * 為元素element綁定原生DOM事件，type為事件類型，handler為處理函數
     * @method on
     * @param { Node } element 需要綁定事件的節點對象
     * @param { Array } type 綁定的事件類型數組
     * @param { Function } handler 事件處理器
     * @example
     * ```javascript
     * UE.dom.domUtils.on(document.body,["click","mousedown"],function(evt){
     *     //evt為事件對象，this為被點擊元素對象
     * });
     * ```
     */
  on: function(element, type, handler) {
    var types = utils.isArray(type) ? type : utils.trim(type).split(/\s+/),
      k = types.length;
    if (k)
      while (k--) {
        type = types[k];
        if (element.addEventListener) {
          element.addEventListener(type, handler, false);
        } else {
          if (!handler._d) {
            handler._d = {
              els: []
            };
          }
          var key = type + handler.toString(),
            index = utils.indexOf(handler._d.els, element);
          if (!handler._d[key] || index == -1) {
            if (index == -1) {
              handler._d.els.push(element);
            }
            if (!handler._d[key]) {
              handler._d[key] = function(evt) {
                return handler.call(evt.srcElement, evt || window.event);
              };
            }

            element.attachEvent("on" + type, handler._d[key]);
          }
        }
      }
    element = null;
  },
  /**
     * 解除DOM事件綁定
     * @method un
     * @param { Node } element 需要解除事件綁定的節點對象
     * @param { String } type 需要接觸綁定的事件類型
     * @param { Function } handler 對應的事件處理器
     * @example
     * ```javascript
     * UE.dom.domUtils.un(document.body,"click",function(evt){
     *     //evt為事件對象，this為被點擊元素對象
     * });
     * ```
     */

  /**
     * 解除DOM事件綁定
     * @method un
     * @param { Node } element 需要解除事件綁定的節點對象
     * @param { Array } type 需要接觸綁定的事件類型數組
     * @param { Function } handler 對應的事件處理器
     * @example
     * ```javascript
     * UE.dom.domUtils.un(document.body, ["click","mousedown"],function(evt){
     *     //evt為事件對象，this為被點擊元素對象
     * });
     * ```
     */
  un: function(element, type, handler) {
    var types = utils.isArray(type) ? type : utils.trim(type).split(/\s+/),
      k = types.length;
    if (k)
      while (k--) {
        type = types[k];
        if (element.removeEventListener) {
          element.removeEventListener(type, handler, false);
        } else {
          var key = type + handler.toString();
          try {
            element.detachEvent(
              "on" + type,
              handler._d ? handler._d[key] : handler
            );
          } catch (e) {}
          if (handler._d && handler._d[key]) {
            var index = utils.indexOf(handler._d.els, element);
            if (index != -1) {
              handler._d.els.splice(index, 1);
            }
            handler._d.els.length == 0 && delete handler._d[key];
          }
        }
      }
  },

  /**
     * 比較節點nodeA與節點nodeB是否具有相同的標籤名、屬性名以及屬性值
     * @method  isSameElement
     * @param { Node } nodeA 需要比較的節點
     * @param { Node } nodeB 需要比較的節點
     * @return { Boolean } 兩個節點是否具有相同的標籤名、屬性名以及屬性值
     * @example
     * ```html
     * <span style="font-size:12px">ssss</span>
     * <span style="font-size:12px">bbbbb</span>
     * <span style="font-size:13px">ssss</span>
     * <span style="font-size:14px">bbbbb</span>
     *
     * <script>
     *
     *     var nodes = document.getElementsByTagName( "span" );
     *
     *     //output: true
     *     console.log( UE.dom.domUtils.isSameElement( nodes[0], nodes[1] ) );
     *
     *     //output: false
     *     console.log( UE.dom.domUtils.isSameElement( nodes[2], nodes[3] ) );
     *
     * </script>
     * ```
     */
  isSameElement: function(nodeA, nodeB) {
    if (nodeA.tagName != nodeB.tagName) {
      return false;
    }
    var thisAttrs = nodeA.attributes,
      otherAttrs = nodeB.attributes;
    if (!ie && thisAttrs.length != otherAttrs.length) {
      return false;
    }
    var attrA,
      attrB,
      al = 0,
      bl = 0;
    for (var i = 0; (attrA = thisAttrs[i++]); ) {
      if (attrA.nodeName == "style") {
        if (attrA.specified) {
          al++;
        }
        if (domUtils.isSameStyle(nodeA, nodeB)) {
          continue;
        } else {
          return false;
        }
      }
      if (ie) {
        if (attrA.specified) {
          al++;
          attrB = otherAttrs.getNamedItem(attrA.nodeName);
        } else {
          continue;
        }
      } else {
        attrB = nodeB.attributes[attrA.nodeName];
      }
      if (!attrB.specified || attrA.nodeValue != attrB.nodeValue) {
        return false;
      }
    }
    // 有可能attrB的屬性包含了attrA的屬性之外還有自己的屬性
    if (ie) {
      for (i = 0; (attrB = otherAttrs[i++]); ) {
        if (attrB.specified) {
          bl++;
        }
      }
      if (al != bl) {
        return false;
      }
    }
    return true;
  },

  /**
     * 判斷節點nodeA與節點nodeB的元素的style屬性是否一致
     * @method isSameStyle
     * @param { Node } nodeA 需要比較的節點
     * @param { Node } nodeB 需要比較的節點
     * @return { Boolean } 兩個節點是否具有相同的style屬性值
     * @example
     * ```html
     * <span style="font-size:12px">ssss</span>
     * <span style="font-size:12px">bbbbb</span>
     * <span style="font-size:13px">ssss</span>
     * <span style="font-size:14px">bbbbb</span>
     *
     * <script>
     *
     *     var nodes = document.getElementsByTagName( "span" );
     *
     *     //output: true
     *     console.log( UE.dom.domUtils.isSameStyle( nodes[0], nodes[1] ) );
     *
     *     //output: false
     *     console.log( UE.dom.domUtils.isSameStyle( nodes[2], nodes[3] ) );
     *
     * </script>
     * ```
     */
  isSameStyle: function(nodeA, nodeB) {
    var styleA = nodeA.style.cssText
      .replace(/( ?; ?)/g, ";")
      .replace(/( ?: ?)/g, ":"),
      styleB = nodeB.style.cssText
        .replace(/( ?; ?)/g, ";")
        .replace(/( ?: ?)/g, ":");
    if (browser.opera) {
      styleA = nodeA.style;
      styleB = nodeB.style;
      if (styleA.length != styleB.length) return false;
      for (var p in styleA) {
        if (/^(\d+|csstext)$/i.test(p)) {
          continue;
        }
        if (styleA[p] != styleB[p]) {
          return false;
        }
      }
      return true;
    }
    if (!styleA || !styleB) {
      return styleA == styleB;
    }
    styleA = styleA.split(";");
    styleB = styleB.split(";");
    if (styleA.length != styleB.length) {
      return false;
    }
    for (var i = 0, ci; (ci = styleA[i++]); ) {
      if (utils.indexOf(styleB, ci) == -1) {
        return false;
      }
    }
    return true;
  },
  /**
     * 檢查節點node是否為block元素
     * @method isBlockElm
     * @param { Node } node 需要檢測的節點對象
     * @return { Boolean } 是否是block元素節點
     * @warning 該方法的判斷規則如下： 如果該元素原本是block元素， 則不論該元素當前的css樣式是什麽都會返回true；
     *          否則，檢測該元素的css樣式， 如果該元素當前是block元素， 則返回true。 其余情況下都返回false。
     * @example
     * ```html
     * <span id="test1" style="display: block"></span>
     * <span id="test2"></span>
     * <div id="test3" style="display: inline"></div>
     *
     * <script>
     *
     *     //output: true
     *     console.log( UE.dom.domUtils.isBlockElm( document.getElementById("test1") ) );
     *
     *     //output: false
     *     console.log( UE.dom.domUtils.isBlockElm( document.getElementById("test2") ) );
     *
     *     //output: true
     *     console.log( UE.dom.domUtils.isBlockElm( document.getElementById("test3") ) );
     *
     * </script>
     * ```
     */
  isBlockElm: function(node) {
    return (
      node.nodeType == 1 &&
      (dtd.$block[node.tagName] ||
        styleBlock[domUtils.getComputedStyle(node, "display")]) &&
      !dtd.$nonChild[node.tagName]
    );
  },
  /**
     * 檢測node節點是否為body節點
     * @method isBody
     * @param { Element } node 需要檢測的dom元素
     * @return { Boolean } 給定的元素是否是body元素
     * @example
     * ```javascript
     * //output: true
     * console.log( UE.dom.domUtils.isBody( document.body ) );
     * ```
     */
  isBody: function(node) {
    return node && node.nodeType == 1 && node.tagName.toLowerCase() == "body";
  },
  /**
     * 以node節點為分界，將該節點的指定祖先節點parent拆分成兩個獨立的節點，
     * 拆分形成的兩個節點之間是node節點
     * @method breakParent
     * @param { Node } node 作為分界的節點對象
     * @param { Node } parent 該節點必須是node節點的祖先節點， 且是block節點。
     * @return { Node } 給定的node分界節點
     * @example
     * ```javascript
     *
     *      var node = document.createElement("span"),
     *          wrapNode = document.createElement( "div" ),
     *          parent = document.createElement("p");
     *
     *      parent.appendChild( node );
     *      wrapNode.appendChild( parent );
     *
     *      //拆分前
     *      //output: <p><span></span></p>
     *      console.log( wrapNode.innerHTML );
     *
     *
     *      UE.dom.domUtils.breakParent( node, parent );
     *      //拆分後
     *      //output: <p></p><span></span><p></p>
     *      console.log( wrapNode.innerHTML );
     *
     * ```
     */
  breakParent: function(node, parent) {
    var tmpNode,
      parentClone = node,
      clone = node,
      leftNodes,
      rightNodes;
    do {
      parentClone = parentClone.parentNode;
      if (leftNodes) {
        tmpNode = parentClone.cloneNode(false);
        tmpNode.appendChild(leftNodes);
        leftNodes = tmpNode;
        tmpNode = parentClone.cloneNode(false);
        tmpNode.appendChild(rightNodes);
        rightNodes = tmpNode;
      } else {
        leftNodes = parentClone.cloneNode(false);
        rightNodes = leftNodes.cloneNode(false);
      }
      while ((tmpNode = clone.previousSibling)) {
        leftNodes.insertBefore(tmpNode, leftNodes.firstChild);
      }
      while ((tmpNode = clone.nextSibling)) {
        rightNodes.appendChild(tmpNode);
      }
      clone = parentClone;
    } while (parent !== parentClone);
    tmpNode = parent.parentNode;
    tmpNode.insertBefore(leftNodes, parent);
    tmpNode.insertBefore(rightNodes, parent);
    tmpNode.insertBefore(node, rightNodes);
    domUtils.remove(parent);
    return node;
  },
  /**
     * 檢查節點node是否是空inline節點
     * @method  isEmptyInlineElement
     * @param { Node } node 需要檢測的節點對象
     * @return { Number }  如果給定的節點是空的inline節點， 則返回1, 否則返回0。
     * @example
     * ```html
     * <b><i></i></b> => 1
     * <b><i></i><u></u></b> => 1
     * <b></b> => 1
     * <b>xx<i></i></b> => 0
     * ```
     */
  isEmptyInlineElement: function(node) {
    if (node.nodeType != 1 || !dtd.$removeEmpty[node.tagName]) {
      return 0;
    }
    node = node.firstChild;
    while (node) {
      //如果是創建的bookmark就跳過
      if (domUtils.isBookmarkNode(node)) {
        return 0;
      }
      if (
        (node.nodeType == 1 && !domUtils.isEmptyInlineElement(node)) ||
        (node.nodeType == 3 && !domUtils.isWhitespace(node))
      ) {
        return 0;
      }
      node = node.nextSibling;
    }
    return 1;
  },

  /**
     * 刪除node節點下首尾兩端的空白文本子節點
     * @method trimWhiteTextNode
     * @param { Element } node 需要執行刪除操作的元素對象
     * @example
     * ```javascript
     *      var node = document.createElement("div");
     *
     *      node.appendChild( document.createTextNode( "" ) );
     *
     *      node.appendChild( document.createElement("div") );
     *
     *      node.appendChild( document.createTextNode( "" ) );
     *
     *      //3
     *      console.log( node.childNodes.length );
     *
     *      UE.dom.domUtils.trimWhiteTextNode( node );
     *
     *      //1
     *      console.log( node.childNodes.length );
     * ```
     */
  trimWhiteTextNode: function(node) {
    function remove(dir) {
      var child;
      while (
        (child = node[dir]) &&
        child.nodeType == 3 &&
        domUtils.isWhitespace(child)
      ) {
        node.removeChild(child);
      }
    }
    remove("firstChild");
    remove("lastChild");
  },

  /**
     * 合併node節點下相同的子節點
     * @name mergeChild
     * @desc
     * UE.dom.domUtils.mergeChild(node,tagName) //tagName要合併的子節點的標籤
     * @example
     * <p><span style="font-size:12px;">xx<span style="font-size:12px;">aa</span>xx</span></p>
     * ==> UE.dom.domUtils.mergeChild(node,'span')
     * <p><span style="font-size:12px;">xxaaxx</span></p>
     */
  mergeChild: function(node, tagName, attrs) {
    var list = domUtils.getElementsByTagName(node, node.tagName.toLowerCase());
    for (var i = 0, ci; (ci = list[i++]); ) {
      if (!ci.parentNode || domUtils.isBookmarkNode(ci)) {
        continue;
      }
      //span單獨處理
      if (ci.tagName.toLowerCase() == "span") {
        if (node === ci.parentNode) {
          domUtils.trimWhiteTextNode(node);
          if (node.childNodes.length == 1) {
            node.style.cssText = ci.style.cssText + ";" + node.style.cssText;
            domUtils.remove(ci, true);
            continue;
          }
        }
        ci.style.cssText = node.style.cssText + ";" + ci.style.cssText;
        if (attrs) {
          var style = attrs.style;
          if (style) {
            style = style.split(";");
            for (var j = 0, s; (s = style[j++]); ) {
              ci.style[utils.cssStyleToDomStyle(s.split(":")[0])] = s.split(
                ":"
              )[1];
            }
          }
        }
        if (domUtils.isSameStyle(ci, node)) {
          domUtils.remove(ci, true);
        }
        continue;
      }
      if (domUtils.isSameElement(node, ci)) {
        domUtils.remove(ci, true);
      }
    }
  },

  /**
     * 原生方法getElementsByTagName的封裝
     * @method getElementsByTagName
     * @param { Node } node 目標節點對象
     * @param { String } tagName 需要查找的節點的tagName， 多個tagName以空格分割
     * @return { Array } 符合條件的節點集合
     */
  getElementsByTagName: function(node, name, filter) {
    if (filter && utils.isString(filter)) {
      var className = filter;
      filter = function(node) {
        return domUtils.hasClass(node, className);
      };
    }
    name = utils.trim(name).replace(/[ ]{2,}/g, " ").split(" ");
    var arr = [];
    for (var n = 0, ni; (ni = name[n++]); ) {
      var list = node.getElementsByTagName(ni);
      for (var i = 0, ci; (ci = list[i++]); ) {
        if (!filter || filter(ci)) arr.push(ci);
      }
    }

    return arr;
  },
  /**
     * 將節點node提取到父節點上
     * @method mergeToParent
     * @param { Element } node 需要提取的元素對象
     * @example
     * ```html
     * <div id="parent">
     *     <div id="sub">
     *         <span id="child"></span>
     *     </div>
     * </div>
     *
     * <script>
     *
     *     var child = document.getElementById( "child" );
     *
     *     //output: sub
     *     console.log( child.parentNode.id );
     *
     *     UE.dom.domUtils.mergeToParent( child );
     *
     *     //output: parent
     *     console.log( child.parentNode.id );
     *
     * </script>
     * ```
     */
  mergeToParent: function(node) {
    var parent = node.parentNode;
    while (parent && dtd.$removeEmpty[parent.tagName]) {
      if (parent.tagName == node.tagName || parent.tagName == "A") {
        //針對a標籤單獨處理
        domUtils.trimWhiteTextNode(parent);
        //span需要特殊處理  不處理這樣的情況 <span stlye="color:#fff">xxx<span style="color:#ccc">xxx</span>xxx</span>
        if (
          (parent.tagName == "SPAN" && !domUtils.isSameStyle(parent, node)) ||
          (parent.tagName == "A" && node.tagName == "SPAN")
        ) {
          if (parent.childNodes.length > 1 || parent !== node.parentNode) {
            node.style.cssText =
              parent.style.cssText + ";" + node.style.cssText;
            parent = parent.parentNode;
            continue;
          } else {
            parent.style.cssText += ";" + node.style.cssText;
            //trace:952 a標籤要保持下劃線
            if (parent.tagName == "A") {
              parent.style.textDecoration = "underline";
            }
          }
        }
        if (parent.tagName != "A") {
          parent === node.parentNode && domUtils.remove(node, true);
          break;
        }
      }
      parent = parent.parentNode;
    }
  },
  /**
     * 合併節點node的左右兄弟節點
     * @method mergeSibling
     * @param { Element } node 需要合併的目標節點
     * @example
     * ```html
     * <b>xxxx</b><b id="test">ooo</b><b>xxxx</b>
     *
     * <script>
     *     var demoNode = document.getElementById("test");
     *     UE.dom.domUtils.mergeSibling( demoNode );
     *     //output: xxxxoooxxxx
     *     console.log( demoNode.innerHTML );
     * </script>
     * ```
     */

  /**
     * 合併節點node的左右兄弟節點， 可以根據給定的條件選擇是否忽略合併左節點。
     * @method mergeSibling
     * @param { Element } node 需要合併的目標節點
     * @param { Boolean } ignorePre 是否忽略合併左節點
     * @example
     * ```html
     * <b>xxxx</b><b id="test">ooo</b><b>xxxx</b>
     *
     * <script>
     *     var demoNode = document.getElementById("test");
     *     UE.dom.domUtils.mergeSibling( demoNode, true );
     *     //output: oooxxxx
     *     console.log( demoNode.innerHTML );
     * </script>
     * ```
     */

  /**
     * 合併節點node的左右兄弟節點，可以根據給定的條件選擇是否忽略合併左右節點。
     * @method mergeSibling
     * @param { Element } node 需要合併的目標節點
     * @param { Boolean } ignorePre 是否忽略合併左節點
     * @param { Boolean } ignoreNext 是否忽略合併右節點
     * @remind 如果同時忽略左右節點， 則該操作什麽也不會做
     * @example
     * ```html
     * <b>xxxx</b><b id="test">ooo</b><b>xxxx</b>
     *
     * <script>
     *     var demoNode = document.getElementById("test");
     *     UE.dom.domUtils.mergeSibling( demoNode, false, true );
     *     //output: xxxxooo
     *     console.log( demoNode.innerHTML );
     * </script>
     * ```
     */
  mergeSibling: function(node, ignorePre, ignoreNext) {
    function merge(rtl, start, node) {
      var next;
      if (
        (next = node[rtl]) &&
        !domUtils.isBookmarkNode(next) &&
        next.nodeType == 1 &&
        domUtils.isSameElement(node, next)
      ) {
        while (next.firstChild) {
          if (start == "firstChild") {
            node.insertBefore(next.lastChild, node.firstChild);
          } else {
            node.appendChild(next.firstChild);
          }
        }
        domUtils.remove(next);
      }
    }
    !ignorePre && merge("previousSibling", "firstChild", node);
    !ignoreNext && merge("nextSibling", "lastChild", node);
  },

  /**
     * 設置節點node及其子節點不會被選中
     * @method unSelectable
     * @param { Element } node 需要執行操作的dom元素
     * @remind 執行該操作後的節點， 將不能被鼠標選中
     * @example
     * ```javascript
     * UE.dom.domUtils.unSelectable( document.body );
     * ```
     */
  unSelectable: (ie && browser.ie9below) || browser.opera
    ? function(node) {
        //for ie9
        node.onselectstart = function() {
          return false;
        };
        node.onclick = node.onkeyup = node.onkeydown = function() {
          return false;
        };
        node.unselectable = "on";
        node.setAttribute("unselectable", "on");
        for (var i = 0, ci; (ci = node.all[i++]); ) {
          switch (ci.tagName.toLowerCase()) {
            case "iframe":
            case "textarea":
            case "input":
            case "select":
              break;
            default:
              ci.unselectable = "on";
              node.setAttribute("unselectable", "on");
          }
        }
      }
    : function(node) {
        node.style.MozUserSelect = node.style.webkitUserSelect = node.style.msUserSelect = node.style.KhtmlUserSelect =
          "none";
      },
  /**
     * 刪除節點node上的指定屬性名稱的屬性
     * @method  removeAttributes
     * @param { Node } node 需要刪除屬性的節點對象
     * @param { String } attrNames 可以是空格隔開的多個屬性名稱，該操作將會依次刪除相應的屬性
     * @example
     * ```html
     * <div id="wrap">
     *      <span style="font-size:14px;" id="test" name="followMe">xxxxx</span>
     * </div>
     *
     * <script>
     *
     *     UE.dom.domUtils.removeAttributes( document.getElementById( "test" ), "id name" );
     *
     *     //output: <span style="font-size:14px;">xxxxx</span>
     *     console.log( document.getElementById("wrap").innerHTML );
     *
     * </script>
     * ```
     */

  /**
     * 刪除節點node上的指定屬性名稱的屬性
     * @method  removeAttributes
     * @param { Node } node 需要刪除屬性的節點對象
     * @param { Array } attrNames 需要刪除的屬性名數組
     * @example
     * ```html
     * <div id="wrap">
     *      <span style="font-size:14px;" id="test" name="followMe">xxxxx</span>
     * </div>
     *
     * <script>
     *
     *     UE.dom.domUtils.removeAttributes( document.getElementById( "test" ), ["id", "name"] );
     *
     *     //output: <span style="font-size:14px;">xxxxx</span>
     *     console.log( document.getElementById("wrap").innerHTML );
     *
     * </script>
     * ```
     */
  removeAttributes: function(node, attrNames) {
    attrNames = utils.isArray(attrNames)
      ? attrNames
      : utils.trim(attrNames).replace(/[ ]{2,}/g, " ").split(" ");
    for (var i = 0, ci; (ci = attrNames[i++]); ) {
      ci = attrFix[ci] || ci;
      switch (ci) {
        case "className":
          node[ci] = "";
          break;
        case "style":
          node.style.cssText = "";
          var val = node.getAttributeNode("style");
          !browser.ie && val && node.removeAttributeNode(val);
      }
      node.removeAttribute(ci);
    }
  },
  /**
     * 在doc下創建一個標籤名為tag，屬性為attrs的元素
     * @method createElement
     * @param { DomDocument } doc 新創建的元素屬於該document節點創建
     * @param { String } tagName 需要創建的元素的標籤名
     * @param { Object } attrs 新創建的元素的屬性key-value集合
     * @return { Element } 新創建的元素對象
     * @example
     * ```javascript
     * var ele = UE.dom.domUtils.createElement( document, 'div', {
     *     id: 'test'
     * } );
     *
     * //output: DIV
     * console.log( ele.tagName );
     *
     * //output: test
     * console.log( ele.id );
     *
     * ```
     */
  createElement: function(doc, tag, attrs) {
    return domUtils.setAttributes(doc.createElement(tag), attrs);
  },
  /**
     * 為節點node添加屬性attrs，attrs為屬性鍵值對
     * @method setAttributes
     * @param { Element } node 需要設置屬性的元素對象
     * @param { Object } attrs 需要設置的屬性名-值對
     * @return { Element } 設置屬性的元素對象
     * @example
     * ```html
     * <span id="test"></span>
     *
     * <script>
     *
     *     var testNode = UE.dom.domUtils.setAttributes( document.getElementById( "test" ), {
     *         id: 'demo'
     *     } );
     *
     *     //output: demo
     *     console.log( testNode.id );
     *
     * </script>
     *
     */
  setAttributes: function(node, attrs) {
    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        var value = attrs[attr];
        switch (attr) {
          case "class":
            //ie下要這樣賦值，setAttribute不起作用
            node.className = value;
            break;
          case "style":
            node.style.cssText = node.style.cssText + ";" + value;
            break;
          case "innerHTML":
            node[attr] = value;
            break;
          case "value":
            node.value = value;
            break;
          default:
            node.setAttribute(attrFix[attr] || attr, value);
        }
      }
    }
    return node;
  },

  /**
     * 獲取元素element經過計算後的樣式值
     * @method getComputedStyle
     * @param { Element } element 需要獲取樣式的元素對象
     * @param { String } styleName 需要獲取的樣式名
     * @return { String } 獲取到的樣式值
     * @example
     * ```html
     * <style type="text/css">
     *      #test {
     *          font-size: 15px;
     *      }
     * </style>
     *
     * <span id="test"></span>
     *
     * <script>
     *     //output: 15px
     *     console.log( UE.dom.domUtils.getComputedStyle( document.getElementById( "test" ), 'font-size' ) );
     * </script>
     * ```
     */
  getComputedStyle: function(element, styleName) {
    //一下的屬性單獨處理
    var pros = "width height top left";

    if (pros.indexOf(styleName) > -1) {
      return (
        element[
          "offset" +
            styleName.replace(/^\w/, function(s) {
              return s.toUpperCase();
            })
        ] + "px"
      );
    }
    //忽略文本節點
    if (element.nodeType == 3) {
      element = element.parentNode;
    }
    //ie下font-size若body下定義了font-size，則從currentStyle里會取到這個font-size. 取不到實際值，故此修改.
    if (
      browser.ie &&
      browser.version < 9 &&
      styleName == "font-size" &&
      !element.style.fontSize &&
      !dtd.$empty[element.tagName] &&
      !dtd.$nonChild[element.tagName]
    ) {
      var span = element.ownerDocument.createElement("span");
      span.style.cssText = "padding:0;border:0;font-family:simsun;";
      span.innerHTML = ".";
      element.appendChild(span);
      var result = span.offsetHeight;
      element.removeChild(span);
      span = null;
      return result + "px";
    }
    try {
      var value =
        domUtils.getStyle(element, styleName) ||
        (window.getComputedStyle
          ? domUtils
              .getWindow(element)
              .getComputedStyle(element, "")
              .getPropertyValue(styleName)
          : (element.currentStyle || element.style)[
              utils.cssStyleToDomStyle(styleName)
            ]);
    } catch (e) {
      return "";
    }
    return utils.transUnitToPx(utils.fixColor(styleName, value));
  },
  /**
     * 刪除元素element指定的className
     * @method removeClasses
     * @param { Element } ele 需要刪除class的元素節點
     * @param { String } classNames 需要刪除的className， 多個className之間以空格分開
     * @example
     * ```html
     * <span id="test" class="test1 test2 test3">xxx</span>
     *
     * <script>
     *
     *     var testNode = document.getElementById( "test" );
     *     UE.dom.domUtils.removeClasses( testNode, "test1 test2" );
     *
     *     //output: test3
     *     console.log( testNode.className );
     *
     * </script>
     * ```
     */

  /**
     * 刪除元素element指定的className
     * @method removeClasses
     * @param { Element } ele 需要刪除class的元素節點
     * @param { Array } classNames 需要刪除的className數組
     * @example
     * ```html
     * <span id="test" class="test1 test2 test3">xxx</span>
     *
     * <script>
     *
     *     var testNode = document.getElementById( "test" );
     *     UE.dom.domUtils.removeClasses( testNode, ["test1", "test2"] );
     *
     *     //output: test3
     *     console.log( testNode.className );
     *
     * </script>
     * ```
     */
  removeClasses: function(elm, classNames) {
    classNames = utils.isArray(classNames)
      ? classNames
      : utils.trim(classNames).replace(/[ ]{2,}/g, " ").split(" ");
    for (var i = 0, ci, cls = elm.className; (ci = classNames[i++]); ) {
      cls = cls.replace(new RegExp("\\b" + ci + "\\b"), "");
    }
    cls = utils.trim(cls).replace(/[ ]{2,}/g, " ");
    if (cls) {
      elm.className = cls;
    } else {
      domUtils.removeAttributes(elm, ["class"]);
    }
  },
  /**
     * 給元素element添加className
     * @method addClass
     * @param { Node } ele 需要增加className的元素
     * @param { String } classNames 需要添加的className， 多個className之間以空格分割
     * @remind 相同的類名不會被重覆添加
     * @example
     * ```html
     * <span id="test" class="cls1 cls2"></span>
     *
     * <script>
     *     var testNode = document.getElementById("test");
     *
     *     UE.dom.domUtils.addClass( testNode, "cls2 cls3 cls4" );
     *
     *     //output: cl1 cls2 cls3 cls4
     *     console.log( testNode.className );
     *
     * <script>
     * ```
     */

  /**
     * 給元素element添加className
     * @method addClass
     * @param { Node } ele 需要增加className的元素
     * @param { Array } classNames 需要添加的className的數組
     * @remind 相同的類名不會被重覆添加
     * @example
     * ```html
     * <span id="test" class="cls1 cls2"></span>
     *
     * <script>
     *     var testNode = document.getElementById("test");
     *
     *     UE.dom.domUtils.addClass( testNode, ["cls2", "cls3", "cls4"] );
     *
     *     //output: cl1 cls2 cls3 cls4
     *     console.log( testNode.className );
     *
     * <script>
     * ```
     */
  addClass: function(elm, classNames) {
    if (!elm) return;
    classNames = utils.trim(classNames).replace(/[ ]{2,}/g, " ").split(" ");
    for (var i = 0, ci, cls = elm.className; (ci = classNames[i++]); ) {
      if (!new RegExp("\\b" + ci + "\\b").test(cls)) {
        cls += " " + ci;
      }
    }
    elm.className = utils.trim(cls);
  },
  /**
     * 判斷元素element是否包含給定的樣式類名className
     * @method hasClass
     * @param { Node } ele 需要檢測的元素
     * @param { String } classNames 需要檢測的className， 多個className之間用空格分割
     * @return { Boolean } 元素是否包含所有給定的className
     * @example
     * ```html
     * <span id="test1" class="cls1 cls2"></span>
     *
     * <script>
     *     var test1 = document.getElementById("test1");
     *
     *     //output: false
     *     console.log( UE.dom.domUtils.hasClass( test1, "cls2 cls1 cls3" ) );
     *
     *     //output: true
     *     console.log( UE.dom.domUtils.hasClass( test1, "cls2 cls1" ) );
     * </script>
     * ```
     */

  /**
     * 判斷元素element是否包含給定的樣式類名className
     * @method hasClass
     * @param { Node } ele 需要檢測的元素
     * @param { Array } classNames 需要檢測的className數組
     * @return { Boolean } 元素是否包含所有給定的className
     * @example
     * ```html
     * <span id="test1" class="cls1 cls2"></span>
     *
     * <script>
     *     var test1 = document.getElementById("test1");
     *
     *     //output: false
     *     console.log( UE.dom.domUtils.hasClass( test1, [ "cls2", "cls1", "cls3" ] ) );
     *
     *     //output: true
     *     console.log( UE.dom.domUtils.hasClass( test1, [ "cls2", "cls1" ]) );
     * </script>
     * ```
     */
  hasClass: function(element, className) {
    if (utils.isRegExp(className)) {
      return className.test(element.className);
    }
    className = utils.trim(className).replace(/[ ]{2,}/g, " ").split(" ");
    for (var i = 0, ci, cls = element.className; (ci = className[i++]); ) {
      if (!new RegExp("\\b" + ci + "\\b", "i").test(cls)) {
        return false;
      }
    }
    return i - 1 == className.length;
  },

  /**
     * 阻止事件默認行為
     * @method preventDefault
     * @param { Event } evt 需要阻止默認行為的事件對象
     * @example
     * ```javascript
     * UE.dom.domUtils.preventDefault( evt );
     * ```
     */
  preventDefault: function(evt) {
    evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
  },
  /**
     * 刪除元素element指定的樣式
     * @method removeStyle
     * @param { Element } element 需要刪除樣式的元素
     * @param { String } styleName 需要刪除的樣式名
     * @example
     * ```html
     * <span id="test" style="color: red; background: blue;"></span>
     *
     * <script>
     *
     *     var testNode = document.getElementById("test");
     *
     *     UE.dom.domUtils.removeStyle( testNode, 'color' );
     *
     *     //output: background: blue;
     *     console.log( testNode.style.cssText );
     *
     * </script>
     * ```
     */
  removeStyle: function(element, name) {
    if (browser.ie) {
      //針對color先單獨處理一下
      if (name == "color") {
        name = "(^|;)" + name;
      }
      element.style.cssText = element.style.cssText.replace(
        new RegExp(name + "[^:]*:[^;]+;?", "ig"),
        ""
      );
    } else {
      if (element.style.removeProperty) {
        element.style.removeProperty(name);
      } else {
        element.style.removeAttribute(utils.cssStyleToDomStyle(name));
      }
    }

    if (!element.style.cssText) {
      domUtils.removeAttributes(element, ["style"]);
    }
  },
  /**
     * 獲取元素element的style屬性的指定值
     * @method getStyle
     * @param { Element } element 需要獲取屬性值的元素
     * @param { String } styleName 需要獲取的style的名稱
     * @warning 該方法僅獲取元素style屬性中所標明的值
     * @return { String } 該元素包含指定的style屬性值
     * @example
     * ```html
     * <div id="test" style="color: red;"></div>
     *
     * <script>
     *
     *      var testNode = document.getElementById( "test" );
     *
     *      //output: red
     *      console.log( UE.dom.domUtils.getStyle( testNode, "color" ) );
     *
     *      //output: ""
     *      console.log( UE.dom.domUtils.getStyle( testNode, "background" ) );
     *
     * </script>
     * ```
     */
  getStyle: function(element, name) {
    var value = element.style[utils.cssStyleToDomStyle(name)];
    return utils.fixColor(name, value);
  },
  /**
     * 為元素element設置樣式屬性值
     * @method setStyle
     * @param { Element } element 需要設置樣式的元素
     * @param { String } styleName 樣式名
     * @param { String } styleValue 樣式值
     * @example
     * ```html
     * <div id="test"></div>
     *
     * <script>
     *
     *      var testNode = document.getElementById( "test" );
     *
     *      //output: ""
     *      console.log( testNode.style.color );
     *
     *      UE.dom.domUtils.setStyle( testNode, 'color', 'red' );
     *      //output: "red"
     *      console.log( testNode.style.color );
     *
     * </script>
     * ```
     */
  setStyle: function(element, name, value) {
    element.style[utils.cssStyleToDomStyle(name)] = value;
    if (!utils.trim(element.style.cssText)) {
      this.removeAttributes(element, "style");
    }
  },
  /**
     * 為元素element設置多個樣式屬性值
     * @method setStyles
     * @param { Element } element 需要設置樣式的元素
     * @param { Object } styles 樣式名值對
     * @example
     * ```html
     * <div id="test"></div>
     *
     * <script>
     *
     *      var testNode = document.getElementById( "test" );
     *
     *      //output: ""
     *      console.log( testNode.style.color );
     *
     *      UE.dom.domUtils.setStyles( testNode, {
     *          'color': 'red'
     *      } );
     *      //output: "red"
     *      console.log( testNode.style.color );
     *
     * </script>
     * ```
     */
  setStyles: function(element, styles) {
    for (var name in styles) {
      if (styles.hasOwnProperty(name)) {
        domUtils.setStyle(element, name, styles[name]);
      }
    }
  },
  /**
     * 刪除_moz_dirty屬性
     * @private
     * @method removeDirtyAttr
     */
  removeDirtyAttr: function(node) {
    for (
      var i = 0, ci, nodes = node.getElementsByTagName("*");
      (ci = nodes[i++]);

    ) {
      ci.removeAttribute("_moz_dirty");
    }
    node.removeAttribute("_moz_dirty");
  },
  /**
     * 獲取子節點的數量
     * @method getChildCount
     * @param { Element } node 需要檢測的元素
     * @return { Number } 給定的node元素的子節點數量
     * @example
     * ```html
     * <div id="test">
     *      <span></span>
     * </div>
     *
     * <script>
     *
     *     //output: 3
     *     console.log( UE.dom.domUtils.getChildCount( document.getElementById("test") ) );
     *
     * </script>
     * ```
     */

  /**
     * 根據給定的過濾規則， 獲取符合條件的子節點的數量
     * @method getChildCount
     * @param { Element } node 需要檢測的元素
     * @param { Function } fn 過濾器， 要求對符合條件的子節點返回true， 反之則要求返回false
     * @return { Number } 符合過濾條件的node元素的子節點數量
     * @example
     * ```html
     * <div id="test">
     *      <span></span>
     * </div>
     *
     * <script>
     *
     *     //output: 1
     *     console.log( UE.dom.domUtils.getChildCount( document.getElementById("test"), function ( node ) {
     *
     *         return node.nodeType === 1;
     *
     *     } ) );
     *
     * </script>
     * ```
     */
  getChildCount: function(node, fn) {
    var count = 0,
      first = node.firstChild;
    fn =
      fn ||
      function() {
        return 1;
      };
    while (first) {
      if (fn(first)) {
        count++;
      }
      first = first.nextSibling;
    }
    return count;
  },

  /**
     * 判斷給定節點是否為空節點
     * @method isEmptyNode
     * @param { Node } node 需要檢測的節點對象
     * @return { Boolean } 節點是否為空
     * @example
     * ```javascript
     * UE.dom.domUtils.isEmptyNode( document.body );
     * ```
     */
  isEmptyNode: function(node) {
    return (
      !node.firstChild ||
      domUtils.getChildCount(node, function(node) {
        return (
          !domUtils.isBr(node) &&
          !domUtils.isBookmarkNode(node) &&
          !domUtils.isWhitespace(node)
        );
      }) == 0
    );
  },
  clearSelectedArr: function(nodes) {
    var node;
    while ((node = nodes.pop())) {
      domUtils.removeAttributes(node, ["class"]);
    }
  },
  /**
     * 將顯示區域滾動到指定節點的位置
     * @method scrollToView
     * @param    {Node}   node    節點
     * @param    {window}   win      window對象
     * @param    {Number}    offsetTop    距離上方的偏移量
     */
  scrollToView: function(node, win, offsetTop) {
    var getViewPaneSize = function() {
      var doc = win.document,
        mode = doc.compatMode == "CSS1Compat";
      return {
        width:
          (mode ? doc.documentElement.clientWidth : doc.body.clientWidth) || 0,
        height:
          (mode ? doc.documentElement.clientHeight : doc.body.clientHeight) || 0
      };
    },
      getScrollPosition = function(win) {
        if ("pageXOffset" in win) {
          return {
            x: win.pageXOffset || 0,
            y: win.pageYOffset || 0
          };
        } else {
          var doc = win.document;
          return {
            x: doc.documentElement.scrollLeft || doc.body.scrollLeft || 0,
            y: doc.documentElement.scrollTop || doc.body.scrollTop || 0
          };
        }
      };
    var winHeight = getViewPaneSize().height,
      offset = winHeight * -1 + offsetTop;
    offset += node.offsetHeight || 0;
    var elementPosition = domUtils.getXY(node);
    offset += elementPosition.y;
    var currentScroll = getScrollPosition(win).y;
    // offset += 50;
    if (offset > currentScroll || offset < currentScroll - winHeight) {
      win.scrollTo(0, offset + (offset < 0 ? -20 : 20));
    }
  },
  /**
     * 判斷給定節點是否為br
     * @method isBr
     * @param { Node } node 需要判斷的節點對象
     * @return { Boolean } 給定的節點是否是br節點
     */
  isBr: function(node) {
    return node.nodeType == 1 && node.tagName == "BR";
  },
  /**
     * 判斷給定的節點是否是一個“填充”節點
     * @private
     * @method isFillChar
     * @param { Node } node 需要判斷的節點
     * @param { Boolean } isInStart 是否從節點內容的開始位置匹配
     * @returns { Boolean } 節點是否是填充節點
     */
  isFillChar: function(node, isInStart) {
    if (node.nodeType != 3) return false;
    var text = node.nodeValue;
    if (isInStart) {
      return new RegExp("^" + domUtils.fillChar).test(text);
    }
    return !text.replace(new RegExp(domUtils.fillChar, "g"), "").length;
  },
  isStartInblock: function(range) {
    var tmpRange = range.cloneRange(),
      flag = 0,
      start = tmpRange.startContainer,
      tmp;
    if (start.nodeType == 1 && start.childNodes[tmpRange.startOffset]) {
      start = start.childNodes[tmpRange.startOffset];
      var pre = start.previousSibling;
      while (pre && domUtils.isFillChar(pre)) {
        start = pre;
        pre = pre.previousSibling;
      }
    }
    if (this.isFillChar(start, true) && tmpRange.startOffset == 1) {
      tmpRange.setStartBefore(start);
      start = tmpRange.startContainer;
    }

    while (start && domUtils.isFillChar(start)) {
      tmp = start;
      start = start.previousSibling;
    }
    if (tmp) {
      tmpRange.setStartBefore(tmp);
      start = tmpRange.startContainer;
    }
    if (
      start.nodeType == 1 &&
      domUtils.isEmptyNode(start) &&
      tmpRange.startOffset == 1
    ) {
      tmpRange.setStart(start, 0).collapse(true);
    }
    while (!tmpRange.startOffset) {
      start = tmpRange.startContainer;
      if (domUtils.isBlockElm(start) || domUtils.isBody(start)) {
        flag = 1;
        break;
      }
      var pre = tmpRange.startContainer.previousSibling,
        tmpNode;
      if (!pre) {
        tmpRange.setStartBefore(tmpRange.startContainer);
      } else {
        while (pre && domUtils.isFillChar(pre)) {
          tmpNode = pre;
          pre = pre.previousSibling;
        }
        if (tmpNode) {
          tmpRange.setStartBefore(tmpNode);
        } else {
          tmpRange.setStartBefore(tmpRange.startContainer);
        }
      }
    }
    return flag && !domUtils.isBody(tmpRange.startContainer) ? 1 : 0;
  },

  /**
     * 判斷給定的元素是否是一個空元素
     * @method isEmptyBlock
     * @param { Element } node 需要判斷的元素
     * @return { Boolean } 是否是空元素
     * @example
     * ```html
     * <div id="test"></div>
     *
     * <script>
     *     //output: true
     *     console.log( UE.dom.domUtils.isEmptyBlock( document.getElementById("test") ) );
     * </script>
     * ```
     */

  /**
     * 根據指定的判斷規則判斷給定的元素是否是一個空元素
     * @method isEmptyBlock
     * @param { Element } node 需要判斷的元素
     * @param { RegExp } reg 對內容執行判斷的正則表達式對象
     * @return { Boolean } 是否是空元素
     */
  isEmptyBlock: function(node, reg) {
    if (node.nodeType != 1) return 0;
    reg = reg || new RegExp("[ \xa0\t\r\n" + domUtils.fillChar + "]", "g");

    if (
      node[browser.ie ? "innerText" : "textContent"].replace(reg, "").length > 0
    ) {
      return 0;
    }
    for (var n in dtd.$isNotEmpty) {
      if (node.getElementsByTagName(n).length) {
        return 0;
      }
    }
    return 1;
  },

  /**
     * 移動元素使得該元素的位置移動指定的偏移量的距離
     * @method setViewportOffset
     * @param { Element } element 需要設置偏移量的元素
     * @param { Object } offset 偏移量， 形如{ left: 100, top: 50 }的一個鍵值對， 表示該元素將在
     *                                  現有的位置上向水平方向偏移offset.left的距離， 在豎直方向上偏移
     *                                  offset.top的距離
     * @example
     * ```html
     * <div id="test" style="top: 100px; left: 50px; position: absolute;"></div>
     *
     * <script>
     *
     *     var testNode = document.getElementById("test");
     *
     *     UE.dom.domUtils.setViewportOffset( testNode, {
     *         left: 200,
     *         top: 50
     *     } );
     *
     *     //output: top: 300px; left: 100px; position: absolute;
     *     console.log( testNode.style.cssText );
     *
     * </script>
     * ```
     */
  setViewportOffset: function(element, offset) {
    var left = parseInt(element.style.left) | 0;
    var top = parseInt(element.style.top) | 0;
    var rect = element.getBoundingClientRect();
    var offsetLeft = offset.left - rect.left;
    var offsetTop = offset.top - rect.top;
    if (offsetLeft) {
      element.style.left = left + offsetLeft + "px";
    }
    if (offsetTop) {
      element.style.top = top + offsetTop + "px";
    }
  },

  /**
     * 用“填充字符”填充節點
     * @method fillNode
     * @private
     * @param { DomDocument } doc 填充的節點所在的docment對象
     * @param { Node } node 需要填充的節點對象
     * @example
     * ```html
     * <div id="test"></div>
     *
     * <script>
     *     var testNode = document.getElementById("test");
     *
     *     //output: 0
     *     console.log( testNode.childNodes.length );
     *
     *     UE.dom.domUtils.fillNode( document, testNode );
     *
     *     //output: 1
     *     console.log( testNode.childNodes.length );
     *
     * </script>
     * ```
     */
  fillNode: function(doc, node) {
    var tmpNode = browser.ie
      ? doc.createTextNode(domUtils.fillChar)
      : doc.createElement("br");
    node.innerHTML = "";
    node.appendChild(tmpNode);
  },

  /**
     * 把節點src的所有子節點追加到另一個節點tag上去
     * @method moveChild
     * @param { Node } src 源節點， 該節點下的所有子節點將被移除
     * @param { Node } tag 目標節點， 從源節點移除的子節點將被追加到該節點下
     * @example
     * ```html
     * <div id="test1">
     *      <span></span>
     * </div>
     * <div id="test2">
     *     <div></div>
     * </div>
     *
     * <script>
     *
     *     var test1 = document.getElementById("test1"),
     *         test2 = document.getElementById("test2");
     *
     *     UE.dom.domUtils.moveChild( test1, test2 );
     *
     *     //output: ""（空字符串）
     *     console.log( test1.innerHTML );
     *
     *     //output: "<div></div><span></span>"
     *     console.log( test2.innerHTML );
     *
     * </script>
     * ```
     */

  /**
     * 把節點src的所有子節點移動到另一個節點tag上去, 可以通過dir參數控制附加的行為是“追加”還是“插入頂部”
     * @method moveChild
     * @param { Node } src 源節點， 該節點下的所有子節點將被移除
     * @param { Node } tag 目標節點， 從源節點移除的子節點將被附加到該節點下
     * @param { Boolean } dir 附加方式， 如果為true， 則附加進去的節點將被放到目標節點的頂部， 反之，則放到末尾
     * @example
     * ```html
     * <div id="test1">
     *      <span></span>
     * </div>
     * <div id="test2">
     *     <div></div>
     * </div>
     *
     * <script>
     *
     *     var test1 = document.getElementById("test1"),
     *         test2 = document.getElementById("test2");
     *
     *     UE.dom.domUtils.moveChild( test1, test2, true );
     *
     *     //output: ""（空字符串）
     *     console.log( test1.innerHTML );
     *
     *     //output: "<span></span><div></div>"
     *     console.log( test2.innerHTML );
     *
     * </script>
     * ```
     */
  moveChild: function(src, tag, dir) {
    while (src.firstChild) {
      if (dir && tag.firstChild) {
        tag.insertBefore(src.lastChild, tag.firstChild);
      } else {
        tag.appendChild(src.firstChild);
      }
    }
  },

  /**
     * 判斷節點的標籤上是否不存在任何屬性
     * @method hasNoAttributes
     * @private
     * @param { Node } node 需要檢測的節點對象
     * @return { Boolean } 節點是否不包含任何屬性
     * @example
     * ```html
     * <div id="test"><span>xxxx</span></div>
     *
     * <script>
     *
     *     //output: false
     *     console.log( UE.dom.domUtils.hasNoAttributes( document.getElementById("test") ) );
     *
     *     //output: true
     *     console.log( UE.dom.domUtils.hasNoAttributes( document.getElementById("test").firstChild ) );
     *
     * </script>
     * ```
     */
  hasNoAttributes: function(node) {
    return browser.ie
      ? /^<\w+\s*?>/.test(node.outerHTML)
      : node.attributes.length == 0;
  },

  /**
     * 檢測節點是否是UEditor所使用的輔助節點
     * @method isCustomeNode
     * @private
     * @param { Node } node 需要檢測的節點
     * @remind 輔助節點是指編輯器要完成工作臨時添加的節點， 在輸出的時候將會從編輯器內移除， 不會影響最終的結果。
     * @return { Boolean } 給定的節點是否是一個輔助節點
     */
  isCustomeNode: function(node) {
    return node.nodeType == 1 && node.getAttribute("_ue_custom_node_");
  },

  /**
     * 檢測節點的標籤是否是給定的標籤
     * @method isTagNode
     * @param { Node } node 需要檢測的節點對象
     * @param { String } tagName 標籤
     * @return { Boolean } 節點的標籤是否是給定的標籤
     * @example
     * ```html
     * <div id="test"></div>
     *
     * <script>
     *
     *     //output: true
     *     console.log( UE.dom.domUtils.isTagNode( document.getElementById("test"), "div" ) );
     *
     * </script>
     * ```
     */
  isTagNode: function(node, tagNames) {
    return (
      node.nodeType == 1 &&
      new RegExp("\\b" + node.tagName + "\\b", "i").test(tagNames)
    );
  },

  /**
     * 給定一個節點數組，在通過指定的過濾器過濾後， 獲取其中滿足過濾條件的第一個節點
     * @method filterNodeList
     * @param { Array } nodeList 需要過濾的節點數組
     * @param { Function } fn 過濾器， 對符合條件的節點， 執行結果返回true， 反之則返回false
     * @return { Node | NULL } 如果找到符合過濾條件的節點， 則返回該節點， 否則返回NULL
     * @example
     * ```javascript
     * var divNodes = document.getElementsByTagName("div");
     * divNodes = [].slice.call( divNodes, 0 );
     *
     * //output: null
     * console.log( UE.dom.domUtils.filterNodeList( divNodes, function ( node ) {
     *     return node.tagName.toLowerCase() !== 'div';
     * } ) );
     * ```
     */

  /**
     * 給定一個節點數組nodeList和一組標籤名tagNames， 獲取其中能夠匹配標籤名的節點集合中的第一個節點
     * @method filterNodeList
     * @param { Array } nodeList 需要過濾的節點數組
     * @param { String } tagNames 需要匹配的標籤名， 多個標籤名之間用空格分割
     * @return { Node | NULL } 如果找到標籤名匹配的節點， 則返回該節點， 否則返回NULL
     * @example
     * ```javascript
     * var divNodes = document.getElementsByTagName("div");
     * divNodes = [].slice.call( divNodes, 0 );
     *
     * //output: null
     * console.log( UE.dom.domUtils.filterNodeList( divNodes, 'a span' ) );
     * ```
     */

  /**
     * 給定一個節點數組，在通過指定的過濾器過濾後， 如果參數forAll為true， 則會返回所有滿足過濾
     * 條件的節點集合， 否則， 返回滿足條件的節點集合中的第一個節點
     * @method filterNodeList
     * @param { Array } nodeList 需要過濾的節點數組
     * @param { Function } fn 過濾器， 對符合條件的節點， 執行結果返回true， 反之則返回false
     * @param { Boolean } forAll 是否返回整個節點數組, 如果該參數為false， 則返回節點集合中的第一個節點
     * @return { Array | Node | NULL } 如果找到符合過濾條件的節點， 則根據參數forAll的值決定返回滿足
     *                                      過濾條件的節點數組或第一個節點， 否則返回NULL
     * @example
     * ```javascript
     * var divNodes = document.getElementsByTagName("div");
     * divNodes = [].slice.call( divNodes, 0 );
     *
     * //output: 3（假定有3個div）
     * console.log( divNodes.length );
     *
     * var nodes = UE.dom.domUtils.filterNodeList( divNodes, function ( node ) {
     *     return node.tagName.toLowerCase() === 'div';
     * }, true );
     *
     * //output: 3
     * console.log( nodes.length );
     *
     * var node = UE.dom.domUtils.filterNodeList( divNodes, function ( node ) {
     *     return node.tagName.toLowerCase() === 'div';
     * }, false );
     *
     * //output: div
     * console.log( node.nodeName );
     * ```
     */
  filterNodeList: function(nodelist, filter, forAll) {
    var results = [];
    if (!utils.isFunction(filter)) {
      var str = filter;
      filter = function(n) {
        return (
          utils.indexOf(
            utils.isArray(str) ? str : str.split(" "),
            n.tagName.toLowerCase()
          ) != -1
        );
      };
    }
    utils.each(nodelist, function(n) {
      filter(n) && results.push(n);
    });
    return results.length == 0
      ? null
      : results.length == 1 || !forAll ? results[0] : results;
  },

  /**
     * 查詢給定的range選區是否在給定的node節點內，且在該節點的最末尾
     * @method isInNodeEndBoundary
     * @param { UE.dom.Range } rng 需要判斷的range對象， 該對象的startContainer不能為NULL
     * @param node 需要檢測的節點對象
     * @return { Number } 如果給定的選取range對象是在node內部的最末端， 則返回1, 否則返回0
     */
  isInNodeEndBoundary: function(rng, node) {
    var start = rng.startContainer;
    if (start.nodeType == 3 && rng.startOffset != start.nodeValue.length) {
      return 0;
    }
    if (start.nodeType == 1 && rng.startOffset != start.childNodes.length) {
      return 0;
    }
    while (start !== node) {
      if (start.nextSibling) {
        return 0;
      }
      start = start.parentNode;
    }
    return 1;
  },
  isBoundaryNode: function(node, dir) {
    var tmp;
    while (!domUtils.isBody(node)) {
      tmp = node;
      node = node.parentNode;
      if (tmp !== node[dir]) {
        return false;
      }
    }
    return true;
  },
  fillHtml: browser.ie11below ? "&nbsp;" : "<br/>"
});
var fillCharReg = new RegExp(domUtils.fillChar, "g");
