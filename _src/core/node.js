/**
 * 編輯器模擬的節點類
 * @file
 * @module UE
 * @class uNode
 * @since 1.2.6.1
 */

/**
 * UEditor公用空間，UEditor所有的功能都掛載在該空間下
 * @unfile
 * @module UE
 */

(function () {

    /**
     * 編輯器模擬的節點類
     * @unfile
     * @module UE
     * @class uNode
     */

    /**
     * 通過一個鍵值對，創建一個uNode對象
     * @constructor
     * @param { Object } attr 傳入要創建的uNode的初始屬性
     * @example
     * ```javascript
     * var node = new uNode({
     *     type:'element',
     *     tagName:'span',
     *     attrs:{style:'font-size:14px;'}
     * }
     * ```
     */
    var uNode = UE.uNode = function (obj) {
        this.type = obj.type;
        this.data = obj.data;
        this.tagName = obj.tagName;
        this.parentNode = obj.parentNode;
        this.attrs = obj.attrs || {};
        this.children = obj.children;
    };

    var notTransAttrs = {
        'href':1,
        'src':1,
        '_src':1,
        '_href':1,
        'cdata_data':1
    };

    var notTransTagName = {
        style:1,
        script:1
    };

    var indentChar = '    ',
        breakChar = '\n';

    function insertLine(arr, current, begin) {
        arr.push(breakChar);
        return current + (begin ? 1 : -1);
    }

    function insertIndent(arr, current) {
        //插入縮進
        for (var i = 0; i < current; i++) {
            arr.push(indentChar);
        }
    }

    //創建uNode的靜態方法
    //支持標簽和html
    uNode.createElement = function (html) {
        if (/[<>]/.test(html)) {
            return UE.htmlparser(html).children[0]
        } else {
            return new uNode({
                type:'element',
                children:[],
                tagName:html
            })
        }
    };
    uNode.createText = function (data,noTrans) {
        return new UE.uNode({
            type:'text',
            'data':noTrans ? data : utils.unhtml(data || '')
        })
    };
    function nodeToHtml(node, arr, formatter, current) {
        switch (node.type) {
            case 'root':
                for (var i = 0, ci; ci = node.children[i++];) {
                    //插入新行
                    if (formatter && ci.type == 'element' && !dtd.$inlineWithA[ci.tagName] && i > 1) {
                        insertLine(arr, current, true);
                        insertIndent(arr, current)
                    }
                    nodeToHtml(ci, arr, formatter, current)
                }
                break;
            case 'text':
                isText(node, arr);
                break;
            case 'element':
                isElement(node, arr, formatter, current);
                break;
            case 'comment':
                isComment(node, arr, formatter);
        }
        return arr;
    }

    function isText(node, arr) {
        if(node.parentNode.tagName == 'pre'){
            //源碼模式下輸入html標簽，不能做轉換處理，直接輸出
            arr.push(node.data)
        }else{
            arr.push(notTransTagName[node.parentNode.tagName] ? utils.html(node.data) : node.data.replace(/[ ]{2}/g,' &nbsp;'))
        }

    }

    function isElement(node, arr, formatter, current) {
        var attrhtml = '';
        if (node.attrs) {
            attrhtml = [];
            var attrs = node.attrs;
            for (var a in attrs) {
                //這里就針對
                //<p>'<img src='http://nsclick.baidu.com/u.gif?&asdf=\"sdf&asdfasdfs;asdf'></p>
                //這里邊的\"做轉換，要不用innerHTML直接被截斷了，屬性src
                //有可能做的不夠
                attrhtml.push(a + (attrs[a] !== undefined ? '="' + (notTransAttrs[a] ? utils.html(attrs[a]).replace(/["]/g, function (a) {
                   return '&quot;'
                }) : utils.unhtml(attrs[a])) + '"' : ''))
            }
            attrhtml = attrhtml.join(' ');
        }
        arr.push('<' + node.tagName +
            (attrhtml ? ' ' + attrhtml  : '') +
            (dtd.$empty[node.tagName] ? '\/' : '' ) + '>'
        );
        //插入新行
        if (formatter  &&  !dtd.$inlineWithA[node.tagName] && node.tagName != 'pre') {
            if(node.children && node.children.length){
                current = insertLine(arr, current, true);
                insertIndent(arr, current)
            }

        }
        if (node.children && node.children.length) {
            for (var i = 0, ci; ci = node.children[i++];) {
                if (formatter && ci.type == 'element' &&  !dtd.$inlineWithA[ci.tagName] && i > 1) {
                    insertLine(arr, current);
                    insertIndent(arr, current)
                }
                nodeToHtml(ci, arr, formatter, current)
            }
        }
        if (!dtd.$empty[node.tagName]) {
            if (formatter && !dtd.$inlineWithA[node.tagName]  && node.tagName != 'pre') {

                if(node.children && node.children.length){
                    current = insertLine(arr, current);
                    insertIndent(arr, current)
                }
            }
            arr.push('<\/' + node.tagName + '>');
        }

    }

    function isComment(node, arr) {
        arr.push('<!--' + node.data + '-->');
    }

    function getNodeById(root, id) {
        var node;
        if (root.type == 'element' && root.getAttr('id') == id) {
            return root;
        }
        if (root.children && root.children.length) {
            for (var i = 0, ci; ci = root.children[i++];) {
                if (node = getNodeById(ci, id)) {
                    return node;
                }
            }
        }
    }

    function getNodesByTagName(node, tagName, arr) {
        if (node.type == 'element' && node.tagName == tagName) {
            arr.push(node);
        }
        if (node.children && node.children.length) {
            for (var i = 0, ci; ci = node.children[i++];) {
                getNodesByTagName(ci, tagName, arr)
            }
        }
    }
    function nodeTraversal(root,fn){
        if(root.children && root.children.length){
            for(var i= 0,ci;ci=root.children[i];){
                nodeTraversal(ci,fn);
                //ci被替換的情況，這里就不再走 fn了
                if(ci.parentNode ){
                    if(ci.children && ci.children.length){
                        fn(ci)
                    }
                    if(ci.parentNode) i++
                }
            }
        }else{
            fn(root)
        }

    }
    uNode.prototype = {

        /**
         * 當前節點對象，轉換成html文本
         * @method toHtml
         * @return { String } 返回轉換後的html字符串
         * @example
         * ```javascript
         * node.toHtml();
         * ```
         */

        /**
         * 當前節點對象，轉換成html文本
         * @method toHtml
         * @param { Boolean } formatter 是否格式化返回值
         * @return { String } 返回轉換後的html字符串
         * @example
         * ```javascript
         * node.toHtml( true );
         * ```
         */
        toHtml:function (formatter) {
            var arr = [];
            nodeToHtml(this, arr, formatter, 0);
            return arr.join('')
        },

        /**
         * 獲取節點的html內容
         * @method innerHTML
         * @warning 假如節點的type不是'element'，或節點的標簽名稱不在dtd列表里，直接返回當前節點
         * @return { String } 返回節點的html內容
         * @example
         * ```javascript
         * var htmlstr = node.innerHTML();
         * ```
         */

        /**
         * 設置節點的html內容
         * @method innerHTML
         * @warning 假如節點的type不是'element'，或節點的標簽名稱不在dtd列表里，直接返回當前節點
         * @param { String } htmlstr 傳入要設置的html內容
         * @return { UE.uNode } 返回節點本身
         * @example
         * ```javascript
         * node.innerHTML('<span>text</span>');
         * ```
         */
        innerHTML:function (htmlstr) {
            if (this.type != 'element' || dtd.$empty[this.tagName]) {
                return this;
            }
            if (utils.isString(htmlstr)) {
                if(this.children){
                    for (var i = 0, ci; ci = this.children[i++];) {
                        ci.parentNode = null;
                    }
                }
                this.children = [];
                var tmpRoot = UE.htmlparser(htmlstr);
                for (var i = 0, ci; ci = tmpRoot.children[i++];) {
                    this.children.push(ci);
                    ci.parentNode = this;
                }
                return this;
            } else {
                var tmpRoot = new UE.uNode({
                    type:'root',
                    children:this.children
                });
                return tmpRoot.toHtml();
            }
        },

        /**
         * 獲取節點的純文本內容
         * @method innerText
         * @warning 假如節點的type不是'element'，或節點的標簽名稱不在dtd列表里，直接返回當前節點
         * @return { String } 返回節點的存文本內容
         * @example
         * ```javascript
         * var textStr = node.innerText();
         * ```
         */

        /**
         * 設置節點的純文本內容
         * @method innerText
         * @warning 假如節點的type不是'element'，或節點的標簽名稱不在dtd列表里，直接返回當前節點
         * @param { String } textStr 傳入要設置的文本內容
         * @return { UE.uNode } 返回節點本身
         * @example
         * ```javascript
         * node.innerText('<span>text</span>');
         * ```
         */
        innerText:function (textStr,noTrans) {
            if (this.type != 'element' || dtd.$empty[this.tagName]) {
                return this;
            }
            if (textStr) {
                if(this.children){
                    for (var i = 0, ci; ci = this.children[i++];) {
                        ci.parentNode = null;
                    }
                }
                this.children = [];
                this.appendChild(uNode.createText(textStr,noTrans));
                return this;
            } else {
                return this.toHtml().replace(/<[^>]+>/g, '');
            }
        },

        /**
         * 獲取當前對象的data屬性
         * @method getData
         * @return { Object } 若節點的type值是elemenet，返回空字符串，否則返回節點的data屬性
         * @example
         * ```javascript
         * node.getData();
         * ```
         */
        getData:function () {
            if (this.type == 'element')
                return '';
            return this.data
        },

        /**
         * 獲取當前節點下的第一個子節點
         * @method firstChild
         * @return { UE.uNode } 返回第一個子節點
         * @example
         * ```javascript
         * node.firstChild(); //返回第一個子節點
         * ```
         */
        firstChild:function () {
//            if (this.type != 'element' || dtd.$empty[this.tagName]) {
//                return this;
//            }
            return this.children ? this.children[0] : null;
        },

        /**
         * 獲取當前節點下的最後一個子節點
         * @method lastChild
         * @return { UE.uNode } 返回最後一個子節點
         * @example
         * ```javascript
         * node.lastChild(); //返回最後一個子節點
         * ```
         */
        lastChild:function () {
//            if (this.type != 'element' || dtd.$empty[this.tagName] ) {
//                return this;
//            }
            return this.children ? this.children[this.children.length - 1] : null;
        },

        /**
         * 獲取和當前節點有相同父親節點的前一個節點
         * @method previousSibling
         * @return { UE.uNode } 返回前一個節點
         * @example
         * ```javascript
         * node.children[2].previousSibling(); //返回子節點node.children[1]
         * ```
         */
        previousSibling : function(){
            var parent = this.parentNode;
            for (var i = 0, ci; ci = parent.children[i]; i++) {
                if (ci === this) {
                   return i == 0 ? null : parent.children[i-1];
                }
            }

        },

        /**
         * 獲取和當前節點有相同父親節點的後一個節點
         * @method nextSibling
         * @return { UE.uNode } 返回後一個節點,找不到返回null
         * @example
         * ```javascript
         * node.children[2].nextSibling(); //如果有，返回子節點node.children[3]
         * ```
         */
        nextSibling : function(){
            var parent = this.parentNode;
            for (var i = 0, ci; ci = parent.children[i++];) {
                if (ci === this) {
                    return parent.children[i];
                }
            }
        },

        /**
         * 用新的節點替換當前節點
         * @method replaceChild
         * @param { UE.uNode } target 要替換成該節點參數
         * @param { UE.uNode } source 要被替換掉的節點
         * @return { UE.uNode } 返回替換之後的節點對象
         * @example
         * ```javascript
         * node.replaceChild(newNode, childNode); //用newNode替換childNode,childNode是node的子節點
         * ```
         */
        replaceChild:function (target, source) {
            if (this.children) {
                if(target.parentNode){
                    target.parentNode.removeChild(target);
                }
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === source) {
                        this.children.splice(i, 1, target);
                        source.parentNode = null;
                        target.parentNode = this;
                        return target;
                    }
                }
            }
        },

        /**
         * 在節點的子節點列表最後位置插入一個節點
         * @method appendChild
         * @param { UE.uNode } node 要插入的節點
         * @return { UE.uNode } 返回剛插入的子節點
         * @example
         * ```javascript
         * node.appendChild( newNode ); //在node內插入子節點newNode
         * ```
         */
        appendChild:function (node) {
            if (this.type == 'root' || (this.type == 'element' && !dtd.$empty[this.tagName])) {
                if (!this.children) {
                    this.children = []
                }
                if(node.parentNode){
                    node.parentNode.removeChild(node);
                }
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === node) {
                        this.children.splice(i, 1);
                        break;
                    }
                }
                this.children.push(node);
                node.parentNode = this;
                return node;
            }


        },

        /**
         * 在傳入節點的前面插入一個節點
         * @method insertBefore
         * @param { UE.uNode } target 要插入的節點
         * @param { UE.uNode } source 在該參數節點前面插入
         * @return { UE.uNode } 返回剛插入的子節點
         * @example
         * ```javascript
         * node.parentNode.insertBefore(newNode, node); //在node節點後面插入newNode
         * ```
         */
        insertBefore:function (target, source) {
            if (this.children) {
                if(target.parentNode){
                    target.parentNode.removeChild(target);
                }
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === source) {
                        this.children.splice(i, 0, target);
                        target.parentNode = this;
                        return target;
                    }
                }

            }
        },

        /**
         * 在傳入節點的後面插入一個節點
         * @method insertAfter
         * @param { UE.uNode } target 要插入的節點
         * @param { UE.uNode } source 在該參數節點後面插入
         * @return { UE.uNode } 返回剛插入的子節點
         * @example
         * ```javascript
         * node.parentNode.insertAfter(newNode, node); //在node節點後面插入newNode
         * ```
         */
        insertAfter:function (target, source) {
            if (this.children) {
                if(target.parentNode){
                    target.parentNode.removeChild(target);
                }
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === source) {
                        this.children.splice(i + 1, 0, target);
                        target.parentNode = this;
                        return target;
                    }

                }
            }
        },

        /**
         * 從當前節點的子節點列表中，移除節點
         * @method removeChild
         * @param { UE.uNode } node 要移除的節點引用
         * @param { Boolean } keepChildren 是否保留移除節點的子節點，若傳入true，自動把移除節點的子節點插入到移除的位置
         * @return { * } 返回剛移除的子節點
         * @example
         * ```javascript
         * node.removeChild(childNode,true); //在node的子節點列表中移除child節點，並且吧child的子節點插入到移除的位置
         * ```
         */
        removeChild:function (node,keepChildren) {
            if (this.children) {
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === node) {
                        this.children.splice(i, 1);
                        ci.parentNode = null;
                        if(keepChildren && ci.children && ci.children.length){
                            for(var j= 0,cj;cj=ci.children[j];j++){
                                this.children.splice(i+j,0,cj);
                                cj.parentNode = this;

                            }
                        }
                        return ci;
                    }
                }
            }
        },

        /**
         * 獲取當前節點所代表的元素屬性，即獲取attrs對象下的屬性值
         * @method getAttr
         * @param { String } attrName 要獲取的屬性名稱
         * @return { * } 返回attrs對象下的屬性值
         * @example
         * ```javascript
         * node.getAttr('title');
         * ```
         */
        getAttr:function (attrName) {
            return this.attrs && this.attrs[attrName.toLowerCase()]
        },

        /**
         * 設置當前節點所代表的元素屬性，即設置attrs對象下的屬性值
         * @method setAttr
         * @param { String } attrName 要設置的屬性名稱
         * @param { * } attrVal 要設置的屬性值，類型視設置的屬性而定
         * @return { * } 返回attrs對象下的屬性值
         * @example
         * ```javascript
         * node.setAttr('title','標題');
         * ```
         */
        setAttr:function (attrName, attrVal) {
            if (!attrName) {
                delete this.attrs;
                return;
            }
            if(!this.attrs){
                this.attrs = {};
            }
            if (utils.isObject(attrName)) {
                for (var a in attrName) {
                    if (!attrName[a]) {
                        delete this.attrs[a]
                    } else {
                        this.attrs[a.toLowerCase()] = attrName[a];
                    }
                }
            } else {
                if (!attrVal) {
                    delete this.attrs[attrName]
                } else {
                    this.attrs[attrName.toLowerCase()] = attrVal;
                }

            }
        },

        /**
         * 獲取當前節點在父節點下的位置索引
         * @method getIndex
         * @return { Number } 返回索引數值，如果沒有父節點，返回-1
         * @example
         * ```javascript
         * node.getIndex();
         * ```
         */
        getIndex:function(){
            var parent = this.parentNode;
            for(var i= 0,ci;ci=parent.children[i];i++){
                if(ci === this){
                    return i;
                }
            }
            return -1;
        },

        /**
         * 在當前節點下，根據id查找節點
         * @method getNodeById
         * @param { String } id 要查找的id
         * @return { UE.uNode } 返回找到的節點
         * @example
         * ```javascript
         * node.getNodeById('textId');
         * ```
         */
        getNodeById:function (id) {
            var node;
            if (this.children && this.children.length) {
                for (var i = 0, ci; ci = this.children[i++];) {
                    if (node = getNodeById(ci, id)) {
                        return node;
                    }
                }
            }
        },

        /**
         * 在當前節點下，根據元素名稱查找節點列表
         * @method getNodesByTagName
         * @param { String } tagNames 要查找的元素名稱
         * @return { Array } 返回找到的節點列表
         * @example
         * ```javascript
         * node.getNodesByTagName('span');
         * ```
         */
        getNodesByTagName:function (tagNames) {
            tagNames = utils.trim(tagNames).replace(/[ ]{2,}/g, ' ').split(' ');
            var arr = [], me = this;
            utils.each(tagNames, function (tagName) {
                if (me.children && me.children.length) {
                    for (var i = 0, ci; ci = me.children[i++];) {
                        getNodesByTagName(ci, tagName, arr)
                    }
                }
            });
            return arr;
        },

        /**
         * 根據樣式名稱，獲取節點的樣式值
         * @method getStyle
         * @param { String } name 要獲取的樣式名稱
         * @return { String } 返回樣式值
         * @example
         * ```javascript
         * node.getStyle('font-size');
         * ```
         */
        getStyle:function (name) {
            var cssStyle = this.getAttr('style');
            if (!cssStyle) {
                return ''
            }
            var reg = new RegExp('(^|;)\\s*' + name + ':([^;]+)','i');
            var match = cssStyle.match(reg);
            if (match && match[0]) {
                return match[2]
            }
            return '';
        },

        /**
         * 給節點設置樣式
         * @method setStyle
         * @param { String } name 要設置的的樣式名稱
         * @param { String } val 要設置的的樣值
         * @example
         * ```javascript
         * node.setStyle('font-size', '12px');
         * ```
         */
        setStyle:function (name, val) {
            function exec(name, val) {
                var reg = new RegExp('(^|;)\\s*' + name + ':([^;]+;?)', 'gi');
                cssStyle = cssStyle.replace(reg, '$1');
                if (val) {
                    cssStyle = name + ':' + utils.unhtml(val) + ';' + cssStyle
                }

            }

            var cssStyle = this.getAttr('style');
            if (!cssStyle) {
                cssStyle = '';
            }
            if (utils.isObject(name)) {
                for (var a in name) {
                    exec(a, name[a])
                }
            } else {
                exec(name, val)
            }
            this.setAttr('style', utils.trim(cssStyle))
        },

        /**
         * 傳入一個函數，遞歸遍歷當前節點下的所有節點
         * @method traversal
         * @param { Function } fn 遍歷到節點的時，傳入節點作為參數，運行此函數
         * @example
         * ```javascript
         * traversal(node, function(){
         *     console.log(node.type);
         * });
         * ```
         */
        traversal:function(fn){
            if(this.children && this.children.length){
                nodeTraversal(this,fn);
            }
            return this;
        }
    }
})();
