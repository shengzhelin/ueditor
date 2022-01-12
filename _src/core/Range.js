/**
 * Range封裝
 * @file
 * @module UE.dom
 * @class Range
 * @since 1.2.6.1
 */

/**
 * dom操作封裝
 * @unfile
 * @module UE.dom
 */

/**
 * Range實現類，本類是UEditor底層核心類，封裝不同瀏覽器之間的Range操作。
 * @unfile
 * @module UE.dom
 * @class Range
 */

(function() {
  var guid = 0,
    fillChar = domUtils.fillChar,
    fillData;

  /**
     * 更新range的collapse狀態
     * @param  {Range}   range    range對象
     */
  function updateCollapse(range) {
    range.collapsed =
      range.startContainer &&
      range.endContainer &&
      range.startContainer === range.endContainer &&
      range.startOffset == range.endOffset;
  }

  function selectOneNode(rng) {
    return (
      !rng.collapsed &&
      rng.startContainer.nodeType == 1 &&
      rng.startContainer === rng.endContainer &&
      rng.endOffset - rng.startOffset == 1
    );
  }
  function setEndPoint(toStart, node, offset, range) {
    //如果node是自閉合標籤要處理
    if (
      node.nodeType == 1 &&
      (dtd.$empty[node.tagName] || dtd.$nonChild[node.tagName])
    ) {
      offset = domUtils.getNodeIndex(node) + (toStart ? 0 : 1);
      node = node.parentNode;
    }
    if (toStart) {
      range.startContainer = node;
      range.startOffset = offset;
      if (!range.endContainer) {
        range.collapse(true);
      }
    } else {
      range.endContainer = node;
      range.endOffset = offset;
      if (!range.startContainer) {
        range.collapse(false);
      }
    }
    updateCollapse(range);
    return range;
  }

  function execContentsAction(range, action) {
    //調整邊界
    //range.includeBookmark();
    var start = range.startContainer,
      end = range.endContainer,
      startOffset = range.startOffset,
      endOffset = range.endOffset,
      doc = range.document,
      frag = doc.createDocumentFragment(),
      tmpStart,
      tmpEnd;
    if (start.nodeType == 1) {
      start =
        start.childNodes[startOffset] ||
        (tmpStart = start.appendChild(doc.createTextNode("")));
    }
    if (end.nodeType == 1) {
      end =
        end.childNodes[endOffset] ||
        (tmpEnd = end.appendChild(doc.createTextNode("")));
    }
    if (start === end && start.nodeType == 3) {
      frag.appendChild(
        doc.createTextNode(
          start.substringData(startOffset, endOffset - startOffset)
        )
      );
      //is not clone
      if (action) {
        start.deleteData(startOffset, endOffset - startOffset);
        range.collapse(true);
      }
      return frag;
    }
    var current,
      currentLevel,
      clone = frag,
      startParents = domUtils.findParents(start, true),
      endParents = domUtils.findParents(end, true);
    for (var i = 0; startParents[i] == endParents[i]; ) {
      i++;
    }
    for (var j = i, si; (si = startParents[j]); j++) {
      current = si.nextSibling;
      if (si == start) {
        if (!tmpStart) {
          if (range.startContainer.nodeType == 3) {
            clone.appendChild(
              doc.createTextNode(start.nodeValue.slice(startOffset))
            );
            //is not clone
            if (action) {
              start.deleteData(
                startOffset,
                start.nodeValue.length - startOffset
              );
            }
          } else {
            clone.appendChild(!action ? start.cloneNode(true) : start);
          }
        }
      } else {
        currentLevel = si.cloneNode(false);
        clone.appendChild(currentLevel);
      }
      while (current) {
        if (current === end || current === endParents[j]) {
          break;
        }
        si = current.nextSibling;
        clone.appendChild(!action ? current.cloneNode(true) : current);
        current = si;
      }
      clone = currentLevel;
    }
    clone = frag;
    if (!startParents[i]) {
      clone.appendChild(startParents[i - 1].cloneNode(false));
      clone = clone.firstChild;
    }
    for (var j = i, ei; (ei = endParents[j]); j++) {
      current = ei.previousSibling;
      if (ei == end) {
        if (!tmpEnd && range.endContainer.nodeType == 3) {
          clone.appendChild(
            doc.createTextNode(end.substringData(0, endOffset))
          );
          //is not clone
          if (action) {
            end.deleteData(0, endOffset);
          }
        }
      } else {
        currentLevel = ei.cloneNode(false);
        clone.appendChild(currentLevel);
      }
      //如果兩端同級，右邊第一次已經被開始做了
      if (j != i || !startParents[i]) {
        while (current) {
          if (current === start) {
            break;
          }
          ei = current.previousSibling;
          clone.insertBefore(
            !action ? current.cloneNode(true) : current,
            clone.firstChild
          );
          current = ei;
        }
      }
      clone = currentLevel;
    }
    if (action) {
      range
        .setStartBefore(
          !endParents[i]
            ? endParents[i - 1]
            : !startParents[i] ? startParents[i - 1] : endParents[i]
        )
        .collapse(true);
    }
    tmpStart && domUtils.remove(tmpStart);
    tmpEnd && domUtils.remove(tmpEnd);
    return frag;
  }

  /**
     * 創建一個跟document綁定的空的Range實例
     * @constructor
     * @param { Document } document 新建的選區所屬的文檔對象
     */

  /**
     * @property { Node } startContainer 當前Range的開始邊界的容器節點, 可以是一個元素節點或者是文本節點
     */

  /**
     * @property { Node } startOffset 當前Range的開始邊界容器節點的偏移量, 如果是元素節點，
     *                              該值就是childNodes中的第幾個節點， 如果是文本節點就是文本內容的第幾個字符
     */

  /**
     * @property { Node } endContainer 當前Range的結束邊界的容器節點, 可以是一個元素節點或者是文本節點
     */

  /**
     * @property { Node } endOffset 當前Range的結束邊界容器節點的偏移量, 如果是元素節點，
     *                              該值就是childNodes中的第幾個節點， 如果是文本節點就是文本內容的第幾個字符
     */

  /**
     * @property { Boolean } collapsed 當前Range是否閉合
     * @default true
     * @remind Range是閉合的時候， startContainer === endContainer && startOffset === endOffset
     */

  /**
     * @property { Document } document 當前Range所屬的Document對象
     * @remind 不同range的的document屬性可以是不同的
     */
  var Range = (dom.Range = function(document) {
    var me = this;
    me.startContainer = me.startOffset = me.endContainer = me.endOffset = null;
    me.document = document;
    me.collapsed = true;
  });

  /**
     * 刪除fillData
     * @param doc
     * @param excludeNode
     */
  function removeFillData(doc, excludeNode) {
    try {
      if (fillData && domUtils.inDoc(fillData, doc)) {
        if (!fillData.nodeValue.replace(fillCharReg, "").length) {
          var tmpNode = fillData.parentNode;
          domUtils.remove(fillData);
          while (
            tmpNode &&
            domUtils.isEmptyInlineElement(tmpNode) &&
            //safari的contains有bug
            (browser.safari
              ? !(
                  domUtils.getPosition(tmpNode, excludeNode) &
                  domUtils.POSITION_CONTAINS
                )
              : !tmpNode.contains(excludeNode))
          ) {
            fillData = tmpNode.parentNode;
            domUtils.remove(tmpNode);
            tmpNode = fillData;
          }
        } else {
          fillData.nodeValue = fillData.nodeValue.replace(fillCharReg, "");
        }
      }
    } catch (e) {}
  }

  /**
     * @param node
     * @param dir
     */
  function mergeSibling(node, dir) {
    var tmpNode;
    node = node[dir];
    while (node && domUtils.isFillChar(node)) {
      tmpNode = node[dir];
      domUtils.remove(node);
      node = tmpNode;
    }
  }

  Range.prototype = {
    /**
         * 複製選區的內容到一個DocumentFragment里
         * @method cloneContents
         * @return { DocumentFragment | NULL } 如果選區是閉合的將返回null， 否則， 返回包含所clone內容的DocumentFragment元素
         * @example
         * ```html
         * <body>
         *      <!-- 中括號表示選區 -->
         *      <b>x<i>x[x</i>xx]x</b>
         *
         *      <script>
         *          //range是已選中的選區
         *          var fragment = range.cloneContents(),
         *              node = document.createElement("div");
         *
         *          node.appendChild( fragment );
         *
         *          //output: <i>x</i>xx
         *          console.log( node.innerHTML );
         *
         *      </script>
         * </body>
         * ```
         */
    cloneContents: function() {
      return this.collapsed ? null : execContentsAction(this, 0);
    },

    /**
         * 刪除當前選區範圍中的所有內容
         * @method deleteContents
         * @remind 執行完該操作後， 當前Range對象變成了閉合狀態
         * @return { UE.dom.Range } 當前操作的Range對象
         * @example
         * ```html
         * <body>
         *      <!-- 中括號表示選區 -->
         *      <b>x<i>x[x</i>xx]x</b>
         *
         *      <script>
         *          //range是已選中的選區
         *          range.deleteContents();
         *
         *          //豎線表示閉合後的選區位置
         *          //output: <b>x<i>x</i>|x</b>
         *          console.log( document.body.innerHTML );
         *
         *          //此時， range的各項屬性為
         *          //output: B
         *          console.log( range.startContainer.tagName );
         *          //output: 2
         *          console.log( range.startOffset );
         *          //output: B
         *          console.log( range.endContainer.tagName );
         *          //output: 2
         *          console.log( range.endOffset );
         *          //output: true
         *          console.log( range.collapsed );
         *
         *      </script>
         * </body>
         * ```
         */
    deleteContents: function() {
      var txt;
      if (!this.collapsed) {
        execContentsAction(this, 1);
      }
      if (browser.webkit) {
        txt = this.startContainer;
        if (txt.nodeType == 3 && !txt.nodeValue.length) {
          this.setStartBefore(txt).collapse(true);
          domUtils.remove(txt);
        }
      }
      return this;
    },

    /**
         * 將當前選區的內容提取到一個DocumentFragment里
         * @method extractContents
         * @remind 執行該操作後， 選區將變成閉合狀態
         * @warning 執行該操作後， 原來選區所選中的內容將從dom樹上剝離出來
         * @return { DocumentFragment } 返回包含所提取內容的DocumentFragment對象
         * @example
         * ```html
         * <body>
         *      <!-- 中括號表示選區 -->
         *      <b>x<i>x[x</i>xx]x</b>
         *
         *      <script>
         *          //range是已選中的選區
         *          var fragment = range.extractContents(),
         *              node = document.createElement( "div" );
         *
         *          node.appendChild( fragment );
         *
         *          //豎線表示閉合後的選區位置
         *
         *          //output: <b>x<i>x</i>|x</b>
         *          console.log( document.body.innerHTML );
         *          //output: <i>x</i>xx
         *          console.log( node.innerHTML );
         *
         *          //此時， range的各項屬性為
         *          //output: B
         *          console.log( range.startContainer.tagName );
         *          //output: 2
         *          console.log( range.startOffset );
         *          //output: B
         *          console.log( range.endContainer.tagName );
         *          //output: 2
         *          console.log( range.endOffset );
         *          //output: true
         *          console.log( range.collapsed );
         *
         *      </script>
         * </body>
         */
    extractContents: function() {
      return this.collapsed ? null : execContentsAction(this, 2);
    },

    /**
         * 設置Range的開始容器節點和偏移量
         * @method  setStart
         * @remind 如果給定的節點是元素節點，那麽offset指的是其子元素中索引為offset的元素，
         *          如果是文本節點，那麽offset指的是其文本內容的第offset個字符
         * @remind 如果提供的容器節點是一個不能包含子元素的節點， 則該選區的開始容器將被設置
         *          為該節點的父節點， 此時， 其距離開始容器的偏移量也變成了該節點在其父節點
         *          中的索引
         * @param { Node } node 將被設為當前選區開始邊界容器的節點對象
         * @param { int } offset 選區的開始位置偏移量
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         * <!-- 選區 -->
         * <b>xxx<i>x<span>xx</span>xx<em>xx</em>xxx</i>[xxx]</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.setStart( document.getElementsByTagName("i")[0], 1 );
         *
         *     //此時， 選區變成了
         *     //<b>xxx<i>x[<span>xx</span>xx<em>xx</em>xxx</i>xxx]</b>
         *
         * </script>
         * ```
         * @example
         * ```html
         * <!-- 選區 -->
         * <b>xxx<img>[xx]x</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.setStart( document.getElementsByTagName("img")[0], 3 );
         *
         *     //此時， 選區變成了
         *     //<b>xxx[<img>xx]x</b>
         *
         * </script>
         * ```
         */
    setStart: function(node, offset) {
      return setEndPoint(true, node, offset, this);
    },

    /**
         * 設置Range的結束容器和偏移量
         * @method  setEnd
         * @param { Node } node 作為當前選區結束邊界容器的節點對象
         * @param { int } offset 結束邊界的偏移量
         * @see UE.dom.Range:setStart(Node,int)
         * @return { UE.dom.Range } 當前range對象
         */
    setEnd: function(node, offset) {
      return setEndPoint(false, node, offset, this);
    },

    /**
         * 將Range開始位置設置到node節點之後
         * @method  setStartAfter
         * @remind 該操作將會把給定節點的父節點作為range的開始容器， 且偏移量是該節點在其父節點中的位置索引+1
         * @param { Node } node 選區的開始邊界將緊接著該節點之後
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         * <!-- 選區示例 -->
         * <b>xx<i>xxx</i><span>xx[x</span>xxx]</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.setStartAfter( document.getElementsByTagName("i")[0] );
         *
         *     //結果選區
         *     //<b>xx<i>xxx</i>[<span>xxx</span>xxx]</b>
         *
         * </script>
         * ```
         */
    setStartAfter: function(node) {
      return this.setStart(node.parentNode, domUtils.getNodeIndex(node) + 1);
    },

    /**
         * 將Range開始位置設置到node節點之前
         * @method  setStartBefore
         * @remind 該操作將會把給定節點的父節點作為range的開始容器， 且偏移量是該節點在其父節點中的位置索引
         * @param { Node } node 新的選區開始位置在該節點之前
         * @see UE.dom.Range:setStartAfter(Node)
         * @return { UE.dom.Range } 當前range對象
         */
    setStartBefore: function(node) {
      return this.setStart(node.parentNode, domUtils.getNodeIndex(node));
    },

    /**
         * 將Range結束位置設置到node節點之後
         * @method  setEndAfter
         * @remind 該操作將會把給定節點的父節點作為range的結束容器， 且偏移量是該節點在其父節點中的位置索引+1
         * @param { Node } node 目標節點
         * @see UE.dom.Range:setStartAfter(Node)
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         * <!-- 選區示例 -->
         * <b>[xx<i>xxx</i><span>xx]x</span>xxx</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.setStartAfter( document.getElementsByTagName("span")[0] );
         *
         *     //結果選區
         *     //<b>[xx<i>xxx</i><span>xxx</span>]xxx</b>
         *
         * </script>
         * ```
         */
    setEndAfter: function(node) {
      return this.setEnd(node.parentNode, domUtils.getNodeIndex(node) + 1);
    },

    /**
         * 將Range結束位置設置到node節點之前
         * @method  setEndBefore
         * @remind 該操作將會把給定節點的父節點作為range的結束容器， 且偏移量是該節點在其父節點中的位置索引
         * @param { Node } node 目標節點
         * @see UE.dom.Range:setEndAfter(Node)
         * @return { UE.dom.Range } 當前range對象
         */
    setEndBefore: function(node) {
      return this.setEnd(node.parentNode, domUtils.getNodeIndex(node));
    },

    /**
         * 設置Range的開始位置到node節點內的第一個子節點之前
         * @method  setStartAtFirst
         * @remind 選區的開始容器將變成給定的節點， 且偏移量為0
         * @remind 如果給定的節點是元素節點， 則該節點必須是允許包含子節點的元素。
         * @param { Node } node 目標節點
         * @see UE.dom.Range:setStartBefore(Node)
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         * <!-- 選區示例 -->
         * <b>xx<i>xxx</i><span>[xx]x</span>xxx</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.setStartAtFirst( document.getElementsByTagName("i")[0] );
         *
         *     //結果選區
         *     //<b>xx<i>[xxx</i><span>xx]x</span>xxx</b>
         *
         * </script>
         * ```
         */
    setStartAtFirst: function(node) {
      return this.setStart(node, 0);
    },

    /**
         * 設置Range的開始位置到node節點內的最後一個節點之後
         * @method setStartAtLast
         * @remind 選區的開始容器將變成給定的節點， 且偏移量為該節點的子節點數
         * @remind 如果給定的節點是元素節點， 則該節點必須是允許包含子節點的元素。
         * @param { Node } node 目標節點
         * @see UE.dom.Range:setStartAtFirst(Node)
         * @return { UE.dom.Range } 當前range對象
         */
    setStartAtLast: function(node) {
      return this.setStart(
        node,
        node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length
      );
    },

    /**
         * 設置Range的結束位置到node節點內的第一個節點之前
         * @method  setEndAtFirst
         * @param { Node } node 目標節點
         * @remind 選區的結束容器將變成給定的節點， 且偏移量為0
         * @remind node必須是一個元素節點， 且必須是允許包含子節點的元素。
         * @see UE.dom.Range:setStartAtFirst(Node)
         * @return { UE.dom.Range } 當前range對象
         */
    setEndAtFirst: function(node) {
      return this.setEnd(node, 0);
    },

    /**
         * 設置Range的結束位置到node節點內的最後一個節點之後
         * @method  setEndAtLast
         * @param { Node } node 目標節點
         * @remind 選區的結束容器將變成給定的節點， 且偏移量為該節點的子節點數量
         * @remind node必須是一個元素節點， 且必須是允許包含子節點的元素。
         * @see UE.dom.Range:setStartAtFirst(Node)
         * @return { UE.dom.Range } 當前range對象
         */
    setEndAtLast: function(node) {
      return this.setEnd(
        node,
        node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length
      );
    },

    /**
         * 選中給定節點
         * @method  selectNode
         * @remind 此時， 選區的開始容器和結束容器都是該節點的父節點， 其startOffset是該節點在父節點中的位置索引，
         *          而endOffset為startOffset+1
         * @param { Node } node 需要選中的節點
         * @return { UE.dom.Range } 當前range對象，此時的range僅包含當前給定的節點對象
         * @example
         * ```html
         * <!-- 選區示例 -->
         * <b>xx<i>xxx</i><span>[xx]x</span>xxx</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.selectNode( document.getElementsByTagName("i")[0] );
         *
         *     //結果選區
         *     //<b>xx[<i>xxx</i>]<span>xxx</span>xxx</b>
         *
         * </script>
         * ```
         */
    selectNode: function(node) {
      return this.setStartBefore(node).setEndAfter(node);
    },

    /**
         * 選中給定節點內部的所有節點
         * @method  selectNodeContents
         * @remind 此時， 選區的開始容器和結束容器都是該節點， 其startOffset為0，
         *          而endOffset是該節點的子節點數。
         * @param { Node } node 目標節點， 當前range將包含該節點內的所有節點
         * @return { UE.dom.Range } 當前range對象， 此時range僅包含給定節點的所有子節點
         * @example
         * ```html
         * <!-- 選區示例 -->
         * <b>xx<i>xxx</i><span>[xx]x</span>xxx</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.selectNode( document.getElementsByTagName("b")[0] );
         *
         *     //結果選區
         *     //<b>[xx<i>xxx</i><span>xxx</span>xxx]</b>
         *
         * </script>
         * ```
         */
    selectNodeContents: function(node) {
      return this.setStart(node, 0).setEndAtLast(node);
    },

    /**
         * clone當前Range對象
         * @method  cloneRange
         * @remind 返回的range是一個全新的range對象， 其內部所有屬性與當前被clone的range相同。
         * @return { UE.dom.Range } 當前range對象的一個副本
         */
    cloneRange: function() {
      var me = this;
      return new Range(me.document)
        .setStart(me.startContainer, me.startOffset)
        .setEnd(me.endContainer, me.endOffset);
    },

    /**
         * 向當前選區的結束處閉合選區
         * @method  collapse
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         * <!-- 選區示例 -->
         * <b>xx<i>xxx</i><span>[xx]x</span>xxx</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.collapse();
         *
         *     //結果選區
         *     //“|”表示選區已閉合
         *     //<b>xx<i>xxx</i><span>xx|x</span>xxx</b>
         *
         * </script>
         * ```
         */

    /**
         * 閉合當前選區，根據給定的toStart參數項決定是向當前選區開始處閉合還是向結束處閉合，
         * 如果toStart的值為true，則向開始位置閉合， 反之，向結束位置閉合。
         * @method  collapse
         * @param { Boolean } toStart 是否向選區開始處閉合
         * @return { UE.dom.Range } 當前range對象，此時range對象處於閉合狀態
         * @see UE.dom.Range:collapse()
         * @example
         * ```html
         * <!-- 選區示例 -->
         * <b>xx<i>xxx</i><span>[xx]x</span>xxx</b>
         *
         * <script>
         *
         *     //執行操作
         *     range.collapse( true );
         *
         *     //結果選區
         *     //“|”表示選區已閉合
         *     //<b>xx<i>xxx</i><span>|xxx</span>xxx</b>
         *
         * </script>
         * ```
         */
    collapse: function(toStart) {
      var me = this;
      if (toStart) {
        me.endContainer = me.startContainer;
        me.endOffset = me.startOffset;
      } else {
        me.startContainer = me.endContainer;
        me.startOffset = me.endOffset;
      }
      me.collapsed = true;
      return me;
    },

    /**
         * 調整range的開始位置和結束位置，使其"收縮"到最小的位置
         * @method  shrinkBoundary
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         * <span>xx<b>xx[</b>xxxxx]</span> => <span>xx<b>xx</b>[xxxxx]</span>
         * ```
         *
         * @example
         * ```html
         * <!-- 選區示例 -->
         * <b>x[xx</b><i>]xxx</i>
         *
         * <script>
         *
         *     //執行收縮
         *     range.shrinkBoundary();
         *
         *     //結果選區
         *     //<b>x[xx]</b><i>xxx</i>
         * </script>
         * ```
         *
         * @example
         * ```html
         * [<b><i>xxxx</i>xxxxxxx</b>] => <b><i>[xxxx</i>xxxxxxx]</b>
         * ```
         */

    /**
         * 調整range的開始位置和結束位置，使其"收縮"到最小的位置，
         * 如果ignoreEnd的值為true，則忽略對結束位置的調整
         * @method  shrinkBoundary
         * @param { Boolean } ignoreEnd 是否忽略對結束位置的調整
         * @return { UE.dom.Range } 當前range對象
         * @see UE.dom.domUtils.Range:shrinkBoundary()
         */
    shrinkBoundary: function(ignoreEnd) {
      var me = this,
        child,
        collapsed = me.collapsed;
      function check(node) {
        return (
          node.nodeType == 1 &&
          !domUtils.isBookmarkNode(node) &&
          !dtd.$empty[node.tagName] &&
          !dtd.$nonChild[node.tagName]
        );
      }
      while (
        me.startContainer.nodeType == 1 && //是element
        (child = me.startContainer.childNodes[me.startOffset]) && //子節點也是element
        check(child)
      ) {
        me.setStart(child, 0);
      }
      if (collapsed) {
        return me.collapse(true);
      }
      if (!ignoreEnd) {
        while (
          me.endContainer.nodeType == 1 && //是element
          me.endOffset > 0 && //如果是空元素就退出 endOffset=0那麽endOffst-1為負值，childNodes[endOffset]報錯
          (child = me.endContainer.childNodes[me.endOffset - 1]) && //子節點也是element
          check(child)
        ) {
          me.setEnd(child, child.childNodes.length);
        }
      }
      return me;
    },

    /**
         * 獲取離當前選區內包含的所有節點最近的公共祖先節點，
         * @method  getCommonAncestor
         * @remind 返回的公共祖先節點一定不是range自身的容器節點， 但有可能是一個文本節點
         * @return { Node } 當前range對象內所有節點的公共祖先節點
         * @example
         * ```html
         * //選區示例
         * <span>xxx<b>x[x<em>xx]x</em>xxx</b>xx</span>
         * <script>
         *
         *     var node = range.getCommonAncestor();
         *
         *     //公共祖先節點是： b節點
         *     //輸出： B
         *     console.log(node.tagName);
         *
         * </script>
         * ```
         */

    /**
         * 獲取當前選區所包含的所有節點的公共祖先節點， 可以根據給定的參數 includeSelf 決定獲取到
         * 的公共祖先節點是否可以是當前選區的startContainer或endContainer節點， 如果 includeSelf
         * 的取值為true， 則返回的節點可以是自身的容器節點， 否則， 則不能是容器節點
         * @method  getCommonAncestor
         * @param { Boolean } includeSelf 是否允許獲取到的公共祖先節點是當前range對象的容器節點
         * @return { Node } 當前range對象內所有節點的公共祖先節點
         * @see UE.dom.Range:getCommonAncestor()
         * @example
         * ```html
         * <body>
         *
         *     <!-- 選區示例 -->
         *     <b>xxx<i>xxxx<span>xx[x</span>xx]x</i>xxxxxxx</b>
         *
         *     <script>
         *
         *         var node = range.getCommonAncestor( false );
         *
         *         //這裡的公共祖先節點是B而不是I， 是因為參數限制了獲取到的節點不能是容器節點
         *         //output: B
         *         console.log( node.tagName );
         *
         *     </script>
         *
         * </body>
         * ```
         */

    /**
         * 獲取當前選區所包含的所有節點的公共祖先節點， 可以根據給定的參數 includeSelf 決定獲取到
         * 的公共祖先節點是否可以是當前選區的startContainer或endContainer節點， 如果 includeSelf
         * 的取值為true， 則返回的節點可以是自身的容器節點， 否則， 則不能是容器節點； 同時可以根據
         * ignoreTextNode 參數的取值決定是否忽略類型為文本節點的祖先節點。
         * @method  getCommonAncestor
         * @param { Boolean } includeSelf 是否允許獲取到的公共祖先節點是當前range對象的容器節點
         * @param { Boolean } ignoreTextNode 獲取祖先節點的過程中是否忽略類型為文本節點的祖先節點
         * @return { Node } 當前range對象內所有節點的公共祖先節點
         * @see UE.dom.Range:getCommonAncestor()
         * @see UE.dom.Range:getCommonAncestor(Boolean)
         * @example
         * ```html
         * <body>
         *
         *     <!-- 選區示例 -->
         *     <b>xxx<i>xxxx<span>x[x]x</span>xxx</i>xxxxxxx</b>
         *
         *     <script>
         *
         *         var node = range.getCommonAncestor( true, false );
         *
         *         //output: SPAN
         *         console.log( node.tagName );
         *
         *     </script>
         *
         * </body>
         * ```
         */
    getCommonAncestor: function(includeSelf, ignoreTextNode) {
      var me = this,
        start = me.startContainer,
        end = me.endContainer;
      if (start === end) {
        if (includeSelf && selectOneNode(this)) {
          start = start.childNodes[me.startOffset];
          if (start.nodeType == 1) return start;
        }
        //只有在上來就相等的情況下才會出現是文本的情況
        return ignoreTextNode && start.nodeType == 3 ? start.parentNode : start;
      }
      return domUtils.getCommonAncestor(start, end);
    },

    /**
         * 調整當前Range的開始和結束邊界容器，如果是容器節點是文本節點,就調整到包含該文本節點的父節點上
         * @method trimBoundary
         * @remind 該操作有可能會引起文本節點被切開
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         *
         * //選區示例
         * <b>xxx<i>[xxxxx]</i>xxx</b>
         *
         * <script>
         *     //未調整前， 選區的開始容器和結束都是文本節點
         *     //執行調整
         *     range.trimBoundary();
         *
         *     //調整之後， 容器節點變成了i節點
         *     //<b>xxx[<i>xxxxx</i>]xxx</b>
         * </script>
         * ```
         */

    /**
         * 調整當前Range的開始和結束邊界容器，如果是容器節點是文本節點,就調整到包含該文本節點的父節點上，
         * 可以根據 ignoreEnd 參數的值決定是否調整對結束邊界的調整
         * @method trimBoundary
         * @param { Boolean } ignoreEnd 是否忽略對結束邊界的調整
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         *
         * //選區示例
         * <b>xxx<i>[xxxxx]</i>xxx</b>
         *
         * <script>
         *     //未調整前， 選區的開始容器和結束都是文本節點
         *     //執行調整
         *     range.trimBoundary( true );
         *
         *     //調整之後， 開始容器節點變成了i節點
         *     //但是， 結束容器沒有發生變化
         *     //<b>xxx[<i>xxxxx]</i>xxx</b>
         * </script>
         * ```
         */
    trimBoundary: function(ignoreEnd) {
      this.txtToElmBoundary();
      var start = this.startContainer,
        offset = this.startOffset,
        collapsed = this.collapsed,
        end = this.endContainer;
      if (start.nodeType == 3) {
        if (offset == 0) {
          this.setStartBefore(start);
        } else {
          if (offset >= start.nodeValue.length) {
            this.setStartAfter(start);
          } else {
            var textNode = domUtils.split(start, offset);
            //跟新結束邊界
            if (start === end) {
              this.setEnd(textNode, this.endOffset - offset);
            } else if (start.parentNode === end) {
              this.endOffset += 1;
            }
            this.setStartBefore(textNode);
          }
        }
        if (collapsed) {
          return this.collapse(true);
        }
      }
      if (!ignoreEnd) {
        offset = this.endOffset;
        end = this.endContainer;
        if (end.nodeType == 3) {
          if (offset == 0) {
            this.setEndBefore(end);
          } else {
            offset < end.nodeValue.length && domUtils.split(end, offset);
            this.setEndAfter(end);
          }
        }
      }
      return this;
    },

    /**
         * 如果選區在文本的邊界上，就擴展選區到文本的父節點上, 如果當前選區是閉合的， 則什麽也不做
         * @method txtToElmBoundary
         * @remind 該操作不會修改dom節點
         * @return { UE.dom.Range } 當前range對象
         */

    /**
         * 如果選區在文本的邊界上，就擴展選區到文本的父節點上, 如果當前選區是閉合的， 則根據參數項
         * ignoreCollapsed 的值決定是否執行該調整
         * @method txtToElmBoundary
         * @param { Boolean } ignoreCollapsed 是否忽略選區的閉合狀態， 如果該參數取值為true， 則
         *                      不論選區是否閉合， 都會執行該操作， 反之， 則不會對閉合的選區執行該操作
         * @return { UE.dom.Range } 當前range對象
         */
    txtToElmBoundary: function(ignoreCollapsed) {
      function adjust(r, c) {
        var container = r[c + "Container"],
          offset = r[c + "Offset"];
        if (container.nodeType == 3) {
          if (!offset) {
            r[
              "set" +
                c.replace(/(\w)/, function(a) {
                  return a.toUpperCase();
                }) +
                "Before"
            ](container);
          } else if (offset >= container.nodeValue.length) {
            r[
              "set" +
                c.replace(/(\w)/, function(a) {
                  return a.toUpperCase();
                }) +
                "After"
            ](container);
          }
        }
      }

      if (ignoreCollapsed || !this.collapsed) {
        adjust(this, "start");
        adjust(this, "end");
      }
      return this;
    },

    /**
         * 在當前選區的開始位置前插入節點，新插入的節點會被該range包含
         * @method  insertNode
         * @param { Node } node 需要插入的節點
         * @remind 插入的節點可以是一個DocumentFragment依次插入多個節點
         * @return { UE.dom.Range } 當前range對象
         */
    insertNode: function(node) {
      var first = node,
        length = 1;
      if (node.nodeType == 11) {
        first = node.firstChild;
        length = node.childNodes.length;
      }
      this.trimBoundary(true);
      var start = this.startContainer,
        offset = this.startOffset;
      var nextNode = start.childNodes[offset];
      if (nextNode) {
        start.insertBefore(node, nextNode);
      } else {
        start.appendChild(node);
      }
      if (first.parentNode === this.endContainer) {
        this.endOffset = this.endOffset + length;
      }
      return this.setStartBefore(first);
    },

    /**
         * 閉合選區到當前選區的開始位置， 並且定位光標到閉合後的位置
         * @method  setCursor
         * @return { UE.dom.Range } 當前range對象
         * @see UE.dom.Range:collapse()
         */

    /**
         * 閉合選區，可以根據參數toEnd的值控制選區是向前閉合還是向後閉合， 並且定位光標到閉合後的位置。
         * @method  setCursor
         * @param { Boolean } toEnd 是否向後閉合， 如果為true， 則閉合選區時， 將向結束容器方向閉合，
         *                      反之，則向開始容器方向閉合
         * @return { UE.dom.Range } 當前range對象
         * @see UE.dom.Range:collapse(Boolean)
         */
    setCursor: function(toEnd, noFillData) {
      return this.collapse(!toEnd).select(noFillData);
    },

    /**
         * 創建當前range的一個書簽，記錄下當前range的位置，方便當dom樹改變時，還能找回原來的選區位置
         * @method createBookmark
         * @param { Boolean } serialize 控制返回的標記位置是對當前位置的引用還是ID，如果該值為true，則
         *                              返回標記位置的ID， 反之則返回標記位置節點的引用
         * @return { Object } 返回一個書簽記錄鍵值對， 其包含的key有： start => 開始標記的ID或者引用，
         *                          end => 結束標記的ID或引用， id => 當前標記的類型， 如果為true，則表示
         *                          返回的記錄的類型為ID， 反之則為引用
         */
    createBookmark: function(serialize, same) {
      var endNode,
        startNode = this.document.createElement("span");
      startNode.style.cssText = "display:none;line-height:0px;";
      startNode.appendChild(this.document.createTextNode("\u200D"));
      startNode.id = "_baidu_bookmark_start_" + (same ? "" : guid++);

      if (!this.collapsed) {
        endNode = startNode.cloneNode(true);
        endNode.id = "_baidu_bookmark_end_" + (same ? "" : guid++);
      }
      this.insertNode(startNode);
      if (endNode) {
        this.collapse().insertNode(endNode).setEndBefore(endNode);
      }
      this.setStartAfter(startNode);
      return {
        start: serialize ? startNode.id : startNode,
        end: endNode ? (serialize ? endNode.id : endNode) : null,
        id: serialize
      };
    },

    /**
         *  調整當前range的邊界到書簽位置，並刪除該書簽對象所標記的位置內的節點
         *  @method  moveToBookmark
         *  @param { BookMark } bookmark createBookmark所創建的標籤對象
         *  @return { UE.dom.Range } 當前range對象
         *  @see UE.dom.Range:createBookmark(Boolean)
         */
    moveToBookmark: function(bookmark) {
      var start = bookmark.id
        ? this.document.getElementById(bookmark.start)
        : bookmark.start,
        end = bookmark.end && bookmark.id
          ? this.document.getElementById(bookmark.end)
          : bookmark.end;
      this.setStartBefore(start);
      domUtils.remove(start);
      if (end) {
        this.setEndBefore(end);
        domUtils.remove(end);
      } else {
        this.collapse(true);
      }
      return this;
    },

    /**
         * 調整range的邊界，使其"放大"到最近的父節點
         * @method  enlarge
         * @remind 會引起選區的變化
         * @return { UE.dom.Range } 當前range對象
         */

    /**
         * 調整range的邊界，使其"放大"到最近的父節點，根據參數 toBlock 的取值， 可以
         * 要求擴大之後的父節點是block節點
         * @method  enlarge
         * @param { Boolean } toBlock 是否要求擴大之後的父節點必須是block節點
         * @return { UE.dom.Range } 當前range對象
         */
    enlarge: function(toBlock, stopFn) {
      var isBody = domUtils.isBody,
        pre,
        node,
        tmp = this.document.createTextNode("");
      if (toBlock) {
        node = this.startContainer;
        if (node.nodeType == 1) {
          if (node.childNodes[this.startOffset]) {
            pre = node = node.childNodes[this.startOffset];
          } else {
            node.appendChild(tmp);
            pre = node = tmp;
          }
        } else {
          pre = node;
        }
        while (1) {
          if (domUtils.isBlockElm(node)) {
            node = pre;
            while ((pre = node.previousSibling) && !domUtils.isBlockElm(pre)) {
              node = pre;
            }
            this.setStartBefore(node);
            break;
          }
          pre = node;
          node = node.parentNode;
        }
        node = this.endContainer;
        if (node.nodeType == 1) {
          if ((pre = node.childNodes[this.endOffset])) {
            node.insertBefore(tmp, pre);
          } else {
            node.appendChild(tmp);
          }
          pre = node = tmp;
        } else {
          pre = node;
        }
        while (1) {
          if (domUtils.isBlockElm(node)) {
            node = pre;
            while ((pre = node.nextSibling) && !domUtils.isBlockElm(pre)) {
              node = pre;
            }
            this.setEndAfter(node);
            break;
          }
          pre = node;
          node = node.parentNode;
        }
        if (tmp.parentNode === this.endContainer) {
          this.endOffset--;
        }
        domUtils.remove(tmp);
      }

      // 擴展邊界到最大
      if (!this.collapsed) {
        while (this.startOffset == 0) {
          if (stopFn && stopFn(this.startContainer)) {
            break;
          }
          if (isBody(this.startContainer)) {
            break;
          }
          this.setStartBefore(this.startContainer);
        }
        while (
          this.endOffset ==
          (this.endContainer.nodeType == 1
            ? this.endContainer.childNodes.length
            : this.endContainer.nodeValue.length)
        ) {
          if (stopFn && stopFn(this.endContainer)) {
            break;
          }
          if (isBody(this.endContainer)) {
            break;
          }
          this.setEndAfter(this.endContainer);
        }
      }
      return this;
    },
    enlargeToBlockElm: function(ignoreEnd) {
      while (!domUtils.isBlockElm(this.startContainer)) {
        this.setStartBefore(this.startContainer);
      }
      if (!ignoreEnd) {
        while (!domUtils.isBlockElm(this.endContainer)) {
          this.setEndAfter(this.endContainer);
        }
      }
      return this;
    },
    /**
         * 調整Range的邊界，使其"縮小"到最合適的位置
         * @method adjustmentBoundary
         * @return { UE.dom.Range } 當前range對象
         * @see UE.dom.Range:shrinkBoundary()
         */
    adjustmentBoundary: function() {
      if (!this.collapsed) {
        while (
          !domUtils.isBody(this.startContainer) &&
          this.startOffset ==
            this.startContainer[
              this.startContainer.nodeType == 3 ? "nodeValue" : "childNodes"
            ].length &&
          this.startContainer[
            this.startContainer.nodeType == 3 ? "nodeValue" : "childNodes"
          ].length
        ) {
          this.setStartAfter(this.startContainer);
        }
        while (
          !domUtils.isBody(this.endContainer) &&
          !this.endOffset &&
          this.endContainer[
            this.endContainer.nodeType == 3 ? "nodeValue" : "childNodes"
          ].length
        ) {
          this.setEndBefore(this.endContainer);
        }
      }
      return this;
    },

    /**
         * 給range選區中的內容添加給定的inline標籤
         * @method applyInlineStyle
         * @param { String } tagName 需要添加的標籤名
         * @example
         * ```html
         * <p>xxxx[xxxx]x</p>  ==>  range.applyInlineStyle("strong")  ==>  <p>xxxx[<strong>xxxx</strong>]x</p>
         * ```
         */

    /**
         * 給range選區中的內容添加給定的inline標籤， 並且為標籤附加上一些初始化屬性。
         * @method applyInlineStyle
         * @param { String } tagName 需要添加的標籤名
         * @param { Object } attrs 跟隨新添加的標籤的屬性
         * @return { UE.dom.Range } 當前選區
         * @example
         * ```html
         * <p>xxxx[xxxx]x</p>
         *
         * ==>
         *
         * <!-- 執行操作 -->
         * range.applyInlineStyle("strong",{"style":"font-size:12px"})
         *
         * ==>
         *
         * <p>xxxx[<strong style="font-size:12px">xxxx</strong>]x</p>
         * ```
         */
    applyInlineStyle: function(tagName, attrs, list) {
      if (this.collapsed) return this;
      this.trimBoundary()
        .enlarge(false, function(node) {
          return node.nodeType == 1 && domUtils.isBlockElm(node);
        })
        .adjustmentBoundary();
      var bookmark = this.createBookmark(),
        end = bookmark.end,
        filterFn = function(node) {
          return node.nodeType == 1
            ? node.tagName.toLowerCase() != "br"
            : !domUtils.isWhitespace(node);
        },
        current = domUtils.getNextDomNode(bookmark.start, false, filterFn),
        node,
        pre,
        range = this.cloneRange();
      while (
        current &&
        domUtils.getPosition(current, end) & domUtils.POSITION_PRECEDING
      ) {
        if (current.nodeType == 3 || dtd[tagName][current.tagName]) {
          range.setStartBefore(current);
          node = current;
          while (
            node &&
            (node.nodeType == 3 || dtd[tagName][node.tagName]) &&
            node !== end
          ) {
            pre = node;
            node = domUtils.getNextDomNode(
              node,
              node.nodeType == 1,
              null,
              function(parent) {
                return dtd[tagName][parent.tagName];
              }
            );
          }
          var frag = range.setEndAfter(pre).extractContents(),
            elm;
          if (list && list.length > 0) {
            var level, top;
            top = level = list[0].cloneNode(false);
            for (var i = 1, ci; (ci = list[i++]); ) {
              level.appendChild(ci.cloneNode(false));
              level = level.firstChild;
            }
            elm = level;
          } else {
            elm = range.document.createElement(tagName);
          }
          if (attrs) {
            domUtils.setAttributes(elm, attrs);
          }
          elm.appendChild(frag);
          //針對嵌套span的全局樣式指定，做容錯處理
          if (elm.tagName == "SPAN" && attrs && attrs.style) {
            utils.each(elm.getElementsByTagName("span"), function(s) {
              s.style.cssText = s.style.cssText + ";" + attrs.style;
            });
          }
          range.insertNode(list ? top : elm);
          //處理下滑線在a上的情況
          var aNode;
          if (
            tagName == "span" &&
            attrs.style &&
            /text\-decoration/.test(attrs.style) &&
            (aNode = domUtils.findParentByTagName(elm, "a", true))
          ) {
            domUtils.setAttributes(aNode, attrs);
            domUtils.remove(elm, true);
            elm = aNode;
          } else {
            domUtils.mergeSibling(elm);
            domUtils.clearEmptySibling(elm);
          }
          //去除子節點相同的
          domUtils.mergeChild(elm, attrs);
          current = domUtils.getNextDomNode(elm, false, filterFn);
          domUtils.mergeToParent(elm);
          if (node === end) {
            break;
          }
        } else {
          current = domUtils.getNextDomNode(current, true, filterFn);
        }
      }
      return this.moveToBookmark(bookmark);
    },

    /**
         * 移除當前選區內指定的inline標籤，但保留其中的內容
         * @method removeInlineStyle
         * @param { String } tagName 需要移除的標籤名
         * @return { UE.dom.Range } 當前的range對象
         * @example
         * ```html
         * xx[x<span>xxx<em>yyy</em>zz]z</span>  => range.removeInlineStyle(["em"])  => xx[x<span>xxxyyyzz]z</span>
         * ```
         */

    /**
         * 移除當前選區內指定的一組inline標籤，但保留其中的內容
         * @method removeInlineStyle
         * @param { Array } tagNameArr 需要移除的標籤名的數組
         * @return { UE.dom.Range } 當前的range對象
         * @see UE.dom.Range:removeInlineStyle(String)
         */
    removeInlineStyle: function(tagNames) {
      if (this.collapsed) return this;
      tagNames = utils.isArray(tagNames) ? tagNames : [tagNames];
      this.shrinkBoundary().adjustmentBoundary();
      var start = this.startContainer,
        end = this.endContainer;
      while (1) {
        if (start.nodeType == 1) {
          if (utils.indexOf(tagNames, start.tagName.toLowerCase()) > -1) {
            break;
          }
          if (start.tagName.toLowerCase() == "body") {
            start = null;
            break;
          }
        }
        start = start.parentNode;
      }
      while (1) {
        if (end.nodeType == 1) {
          if (utils.indexOf(tagNames, end.tagName.toLowerCase()) > -1) {
            break;
          }
          if (end.tagName.toLowerCase() == "body") {
            end = null;
            break;
          }
        }
        end = end.parentNode;
      }
      var bookmark = this.createBookmark(),
        frag,
        tmpRange;
      if (start) {
        tmpRange = this.cloneRange()
          .setEndBefore(bookmark.start)
          .setStartBefore(start);
        frag = tmpRange.extractContents();
        tmpRange.insertNode(frag);
        domUtils.clearEmptySibling(start, true);
        start.parentNode.insertBefore(bookmark.start, start);
      }
      if (end) {
        tmpRange = this.cloneRange()
          .setStartAfter(bookmark.end)
          .setEndAfter(end);
        frag = tmpRange.extractContents();
        tmpRange.insertNode(frag);
        domUtils.clearEmptySibling(end, false, true);
        end.parentNode.insertBefore(bookmark.end, end.nextSibling);
      }
      var current = domUtils.getNextDomNode(bookmark.start, false, function(
        node
      ) {
        return node.nodeType == 1;
      }),
        next;
      while (current && current !== bookmark.end) {
        next = domUtils.getNextDomNode(current, true, function(node) {
          return node.nodeType == 1;
        });
        if (utils.indexOf(tagNames, current.tagName.toLowerCase()) > -1) {
          domUtils.remove(current, true);
        }
        current = next;
      }
      return this.moveToBookmark(bookmark);
    },

    /**
         * 獲取當前選中的自閉合的節點
         * @method  getClosedNode
         * @return { Node | NULL } 如果當前選中的是自閉合節點， 則返回該節點， 否則返回NULL
         */
    getClosedNode: function() {
      var node;
      if (!this.collapsed) {
        var range = this.cloneRange().adjustmentBoundary().shrinkBoundary();
        if (selectOneNode(range)) {
          var child = range.startContainer.childNodes[range.startOffset];
          if (
            child &&
            child.nodeType == 1 &&
            (dtd.$empty[child.tagName] || dtd.$nonChild[child.tagName])
          ) {
            node = child;
          }
        }
      }
      return node;
    },

    /**
         * 在頁面上高亮range所表示的選區
         * @method select
         * @return { UE.dom.Range } 返回當前Range對象
         */
    //這裡不區分ie9以上，trace:3824
    select: browser.ie
      ? function(noFillData, textRange) {
          var nativeRange;
          if (!this.collapsed) this.shrinkBoundary();
          var node = this.getClosedNode();
          if (node && !textRange) {
            try {
              nativeRange = this.document.body.createControlRange();
              nativeRange.addElement(node);
              nativeRange.select();
            } catch (e) {}
            return this;
          }
          var bookmark = this.createBookmark(),
            start = bookmark.start,
            end;
          nativeRange = this.document.body.createTextRange();
          nativeRange.moveToElementText(start);
          nativeRange.moveStart("character", 1);
          if (!this.collapsed) {
            var nativeRangeEnd = this.document.body.createTextRange();
            end = bookmark.end;
            nativeRangeEnd.moveToElementText(end);
            nativeRange.setEndPoint("EndToEnd", nativeRangeEnd);
          } else {
            if (!noFillData && this.startContainer.nodeType != 3) {
              //使用<span>|x<span>固定住光標
              var tmpText = this.document.createTextNode(fillChar),
                tmp = this.document.createElement("span");
              tmp.appendChild(this.document.createTextNode(fillChar));
              start.parentNode.insertBefore(tmp, start);
              start.parentNode.insertBefore(tmpText, start);
              //當點b,i,u時，不能清除i上邊的b
              removeFillData(this.document, tmpText);
              fillData = tmpText;
              mergeSibling(tmp, "previousSibling");
              mergeSibling(start, "nextSibling");
              nativeRange.moveStart("character", -1);
              nativeRange.collapse(true);
            }
          }
          this.moveToBookmark(bookmark);
          tmp && domUtils.remove(tmp);
          //IE在隱藏狀態下不支持range操作，catch一下
          try {
            nativeRange.select();
          } catch (e) {}
          return this;
        }
      : function(notInsertFillData) {
          function checkOffset(rng) {
            function check(node, offset, dir) {
              if (node.nodeType == 3 && node.nodeValue.length < offset) {
                rng[dir + "Offset"] = node.nodeValue.length;
              }
            }
            check(rng.startContainer, rng.startOffset, "start");
            check(rng.endContainer, rng.endOffset, "end");
          }
          var win = domUtils.getWindow(this.document),
            sel = win.getSelection(),
            txtNode;
          //FF下關閉自動長高時滾動條在關閉dialog時會跳
          //ff下如果不body.focus將不能定位閉合光標到編輯器內
          browser.gecko ? this.document.body.focus() : win.focus();
          if (sel) {
            sel.removeAllRanges();
            // trace:870 chrome/safari後邊是br對於閉合得range不能定位 所以去掉了判斷
            // this.startContainer.nodeType != 3 &&! ((child = this.startContainer.childNodes[this.startOffset]) && child.nodeType == 1 && child.tagName == 'BR'
            if (this.collapsed && !notInsertFillData) {
              //                    //opear如果沒有節點接著，原生的不能夠定位,不能在body的第一級插入空白節點
              //                    if (notInsertFillData && browser.opera && !domUtils.isBody(this.startContainer) && this.startContainer.nodeType == 1) {
              //                        var tmp = this.document.createTextNode('');
              //                        this.insertNode(tmp).setStart(tmp, 0).collapse(true);
              //                    }
              //
              //處理光標落在文本節點的情況
              //處理以下的情況
              //<b>|xxxx</b>
              //<b>xxxx</b>|xxxx
              //xxxx<b>|</b>
              var start = this.startContainer,
                child = start;
              if (start.nodeType == 1) {
                child = start.childNodes[this.startOffset];
              }
              if (
                !(start.nodeType == 3 && this.startOffset) &&
                (child
                  ? !child.previousSibling ||
                      child.previousSibling.nodeType != 3
                  : !start.lastChild || start.lastChild.nodeType != 3)
              ) {
                txtNode = this.document.createTextNode(fillChar);
                //跟著前邊走
                this.insertNode(txtNode);
                removeFillData(this.document, txtNode);
                mergeSibling(txtNode, "previousSibling");
                mergeSibling(txtNode, "nextSibling");
                fillData = txtNode;
                this.setStart(txtNode, browser.webkit ? 1 : 0).collapse(true);
              }
            }
            var nativeRange = this.document.createRange();
            if (
              this.collapsed &&
              browser.opera &&
              this.startContainer.nodeType == 1
            ) {
              var child = this.startContainer.childNodes[this.startOffset];
              if (!child) {
                //往前靠攏
                child = this.startContainer.lastChild;
                if (child && domUtils.isBr(child)) {
                  this.setStartBefore(child).collapse(true);
                }
              } else {
                //向後靠攏
                while (child && domUtils.isBlockElm(child)) {
                  if (child.nodeType == 1 && child.childNodes[0]) {
                    child = child.childNodes[0];
                  } else {
                    break;
                  }
                }
                child && this.setStartBefore(child).collapse(true);
              }
            }
            //是createAddress最後一位算的不準，現在這裡進行微調
            checkOffset(this);
            nativeRange.setStart(this.startContainer, this.startOffset);
            nativeRange.setEnd(this.endContainer, this.endOffset);
            sel.addRange(nativeRange);
          }
          return this;
        },

    /**
         * 滾動到當前range開始的位置
         * @method scrollToView
         * @param { Window } win 當前range對象所屬的window對象
         * @return { UE.dom.Range } 當前Range對象
         */

    /**
         * 滾動到距離當前range開始位置 offset 的位置處
         * @method scrollToView
         * @param { Window } win 當前range對象所屬的window對象
         * @param { Number } offset 距離range開始位置處的偏移量， 如果為正數， 則向下偏移， 反之， 則向上偏移
         * @return { UE.dom.Range } 當前Range對象
         */
    scrollToView: function(win, offset) {
      win = win ? window : domUtils.getWindow(this.document);
      var me = this,
        span = me.document.createElement("span");
      //trace:717
      span.innerHTML = "&nbsp;";
      me.cloneRange().insertNode(span);
      domUtils.scrollToView(span, win, offset);
      domUtils.remove(span);
      return me;
    },

    /**
         * 判斷當前選區內容是否占位符
         * @private
         * @method inFillChar
         * @return { Boolean } 如果是占位符返回true，否則返回false
         */
    inFillChar: function() {
      var start = this.startContainer;
      if (
        this.collapsed &&
        start.nodeType == 3 &&
        start.nodeValue.replace(new RegExp("^" + domUtils.fillChar), "")
          .length +
          1 ==
          start.nodeValue.length
      ) {
        return true;
      }
      return false;
    },

    /**
         * 保存
         * @method createAddress
         * @private
         * @return { Boolean } 返回開始和結束的位置
         * @example
         * ```html
         * <body>
         *     <p>
         *         aaaa
         *         <em>
         *             <!-- 選區開始 -->
         *             bbbb
         *             <!-- 選區結束 -->
         *         </em>
         *     </p>
         *
         *     <script>
         *         //output: {startAddress:[0,1,0,0],endAddress:[0,1,0,4]}
         *         console.log( range.createAddress() );
         *     </script>
         * </body>
         * ```
         */
    createAddress: function(ignoreEnd, ignoreTxt) {
      var addr = {},
        me = this;

      function getAddress(isStart) {
        var node = isStart ? me.startContainer : me.endContainer;
        var parents = domUtils.findParents(node, true, function(node) {
          return !domUtils.isBody(node);
        }),
          addrs = [];
        for (var i = 0, ci; (ci = parents[i++]); ) {
          addrs.push(domUtils.getNodeIndex(ci, ignoreTxt));
        }
        var firstIndex = 0;

        if (ignoreTxt) {
          if (node.nodeType == 3) {
            var tmpNode = node.previousSibling;
            while (tmpNode && tmpNode.nodeType == 3) {
              firstIndex += tmpNode.nodeValue.replace(fillCharReg, "").length;
              tmpNode = tmpNode.previousSibling;
            }
            firstIndex += isStart ? me.startOffset : me.endOffset; // - (fillCharReg.test(node.nodeValue) ? 1 : 0 )
          } else {
            node = node.childNodes[isStart ? me.startOffset : me.endOffset];
            if (node) {
              firstIndex = domUtils.getNodeIndex(node, ignoreTxt);
            } else {
              node = isStart ? me.startContainer : me.endContainer;
              var first = node.firstChild;
              while (first) {
                if (domUtils.isFillChar(first)) {
                  first = first.nextSibling;
                  continue;
                }
                firstIndex++;
                if (first.nodeType == 3) {
                  while (first && first.nodeType == 3) {
                    first = first.nextSibling;
                  }
                } else {
                  first = first.nextSibling;
                }
              }
            }
          }
        } else {
          firstIndex = isStart
            ? domUtils.isFillChar(node) ? 0 : me.startOffset
            : me.endOffset;
        }
        if (firstIndex < 0) {
          firstIndex = 0;
        }
        addrs.push(firstIndex);
        return addrs;
      }
      addr.startAddress = getAddress(true);
      if (!ignoreEnd) {
        addr.endAddress = me.collapsed
          ? [].concat(addr.startAddress)
          : getAddress();
      }
      return addr;
    },

    /**
         * 保存
         * @method createAddress
         * @private
         * @return { Boolean } 返回開始和結束的位置
         * @example
         * ```html
         * <body>
         *     <p>
         *         aaaa
         *         <em>
         *             <!-- 選區開始 -->
         *             bbbb
         *             <!-- 選區結束 -->
         *         </em>
         *     </p>
         *
         *     <script>
         *         var range = editor.selection.getRange();
         *         range.moveToAddress({startAddress:[0,1,0,0],endAddress:[0,1,0,4]});
         *         range.select();
         *         //output: 'bbbb'
         *         console.log(editor.selection.getText());
         *     </script>
         * </body>
         * ```
         */
    moveToAddress: function(addr, ignoreEnd) {
      var me = this;
      function getNode(address, isStart) {
        var tmpNode = me.document.body,
          parentNode,
          offset;
        for (var i = 0, ci, l = address.length; i < l; i++) {
          ci = address[i];
          parentNode = tmpNode;
          tmpNode = tmpNode.childNodes[ci];
          if (!tmpNode) {
            offset = ci;
            break;
          }
        }
        if (isStart) {
          if (tmpNode) {
            me.setStartBefore(tmpNode);
          } else {
            me.setStart(parentNode, offset);
          }
        } else {
          if (tmpNode) {
            me.setEndBefore(tmpNode);
          } else {
            me.setEnd(parentNode, offset);
          }
        }
      }
      getNode(addr.startAddress, true);
      !ignoreEnd && addr.endAddress && getNode(addr.endAddress);
      return me;
    },

    /**
         * 判斷給定的Range對象是否和當前Range對象表示的是同一個選區
         * @method equals
         * @param { UE.dom.Range } 需要判斷的Range對象
         * @return { Boolean } 如果給定的Range對象與當前Range對象表示的是同一個選區， 則返回true， 否則返回false
         */
    equals: function(rng) {
      for (var p in this) {
        if (this.hasOwnProperty(p)) {
          if (this[p] !== rng[p]) return false;
        }
      }
      return true;
    },

    /**
         * 遍歷range內的節點。每當遍歷一個節點時， 都會執行參數項 doFn 指定的函數， 該函數的接受當前遍歷的節點
         * 作為其參數。
         * @method traversal
         * @param { Function }  doFn 對每個遍歷的節點要執行的方法， 該方法接受當前遍歷的節點作為其參數
         * @return { UE.dom.Range } 當前range對象
         * @example
         * ```html
         *
         * <body>
         *
         *     <!-- 選區開始 -->
         *     <span></span>
         *     <a></a>
         *     <!-- 選區結束 -->
         * </body>
         *
         * <script>
         *
         *     //output: <span></span><a></a>
         *     console.log( range.cloneContents() );
         *
         *     range.traversal( function ( node ) {
         *
         *         if ( node.nodeType === 1 ) {
         *             node.className = "test";
         *         }
         *
         *     } );
         *
         *     //output: <span class="test"></span><a class="test"></a>
         *     console.log( range.cloneContents() );
         *
         * </script>
         * ```
         */

    /**
         * 遍歷range內的節點。
         * 每當遍歷一個節點時， 都會執行參數項 doFn 指定的函數， 該函數的接受當前遍歷的節點
         * 作為其參數。
         * 可以通過參數項 filterFn 來指定一個過濾器， 只有符合該過濾器過濾規則的節點才會觸
         * 發doFn函數的執行
         * @method traversal
         * @param { Function } doFn 對每個遍歷的節點要執行的方法， 該方法接受當前遍歷的節點作為其參數
         * @param { Function } filterFn 過濾器， 該函數接受當前遍歷的節點作為參數， 如果該節點滿足過濾
         *                      規則， 請返回true， 該節點會觸發doFn， 否則， 請返回false， 則該節點不
         *                      會觸發doFn。
         * @return { UE.dom.Range } 當前range對象
         * @see UE.dom.Range:traversal(Function)
         * @example
         * ```html
         *
         * <body>
         *
         *     <!-- 選區開始 -->
         *     <span></span>
         *     <a></a>
         *     <!-- 選區結束 -->
         * </body>
         *
         * <script>
         *
         *     //output: <span></span><a></a>
         *     console.log( range.cloneContents() );
         *
         *     range.traversal( function ( node ) {
         *
         *         node.className = "test";
         *
         *     }, function ( node ) {
         *          return node.nodeType === 1;
         *     } );
         *
         *     //output: <span class="test"></span><a class="test"></a>
         *     console.log( range.cloneContents() );
         *
         * </script>
         * ```
         */
    traversal: function(doFn, filterFn) {
      if (this.collapsed) return this;
      var bookmark = this.createBookmark(),
        end = bookmark.end,
        current = domUtils.getNextDomNode(bookmark.start, false, filterFn);
      while (
        current &&
        current !== end &&
        domUtils.getPosition(current, end) & domUtils.POSITION_PRECEDING
      ) {
        var tmpNode = domUtils.getNextDomNode(current, false, filterFn);
        doFn(current);
        current = tmpNode;
      }
      return this.moveToBookmark(bookmark);
    }
  };
})();
