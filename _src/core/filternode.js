/**
 * UE過濾節點的靜態方法
 * @file
 */

/**
 * UEditor公用空間，UEditor所有的功能都掛載在該空間下
 * @module UE
 */

/**
 * 根據傳入節點和過濾規則過濾相應節點
 * @module UE
 * @since 1.2.6.1
 * @method filterNode
 * @param { Object } root 指定root節點
 * @param { Object } rules 過濾規則json對象
 * @example
 * ```javascript
 * UE.filterNode(root,editor.options.filterRules);
 * ```
 */
var filterNode = (UE.filterNode = (function() {
  function filterNode(node, rules) {
    switch (node.type) {
      case "text":
        break;
      case "element":
        var val;
        if ((val = rules[node.tagName])) {
          if (val === "-") {
            node.parentNode.removeChild(node);
          } else if (utils.isFunction(val)) {
            var parentNode = node.parentNode,
              index = node.getIndex();
            val(node);
            if (node.parentNode) {
              if (node.children) {
                for (var i = 0, ci; (ci = node.children[i]); ) {
                  filterNode(ci, rules);
                  if (ci.parentNode) {
                    i++;
                  }
                }
              }
            } else {
              for (var i = index, ci; (ci = parentNode.children[i]); ) {
                filterNode(ci, rules);
                if (ci.parentNode) {
                  i++;
                }
              }
            }
          } else {
            var attrs = val["$"];
            if (attrs && node.attrs) {
              var tmpAttrs = {},
                tmpVal;
              for (var a in attrs) {
                tmpVal = node.getAttr(a);
                //todo 只先對style單獨處理
                if (a == "style" && utils.isArray(attrs[a])) {
                  var tmpCssStyle = [];
                  utils.each(attrs[a], function(v) {
                    var tmp;
                    if ((tmp = node.getStyle(v))) {
                      tmpCssStyle.push(v + ":" + tmp);
                    }
                  });
                  tmpVal = tmpCssStyle.join(";");
                }
                if (tmpVal) {
                  tmpAttrs[a] = tmpVal;
                }
              }
              node.attrs = tmpAttrs;
            }
            if (node.children) {
              for (var i = 0, ci; (ci = node.children[i]); ) {
                filterNode(ci, rules);
                if (ci.parentNode) {
                  i++;
                }
              }
            }
          }
        } else {
          //如果不在名單里扣出子節點並刪除該節點,cdata除外
          if (dtd.$cdata[node.tagName]) {
            node.parentNode.removeChild(node);
          } else {
            var parentNode = node.parentNode,
              index = node.getIndex();
            node.parentNode.removeChild(node, true);
            for (var i = index, ci; (ci = parentNode.children[i]); ) {
              filterNode(ci, rules);
              if (ci.parentNode) {
                i++;
              }
            }
          }
        }
        break;
      case "comment":
        node.parentNode.removeChild(node);
    }
  }
  return function(root, rules) {
    if (utils.isEmptyObject(rules)) {
      return root;
    }
    var val;
    if ((val = rules["-"])) {
      utils.each(val.split(" "), function(k) {
        rules[k] = "-";
      });
    }
    for (var i = 0, ci; (ci = root.children[i]); ) {
      filterNode(ci, rules);
      if (ci.parentNode) {
        i++;
      }
    }
    return root;
  };
})());
