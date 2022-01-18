/**
 * 工具函數包
 * @file
 * @module UE.utils
 * @since 1.2.6.1
 */

/**
 * UEditor封裝使用的靜態工具函數
 * @module UE.utils
 * @unfile
 */

var utils = UE.utils = {

    /**
     * 用給定的叠代器遍歷對象
     * @method each
     * @param { Object } obj 需要遍歷的對象
     * @param { Function } iterator 叠代器， 該方法接受兩個參數， 第一個參數是當前所處理的value， 第二個參數是當前遍歷對象的key
     * @example
     * ```javascript
     * var demoObj = {
     *     key1: 1,
     *     key2: 2
     * };
     *
     * //output: key1: 1, key2: 2
     * UE.utils.each( demoObj, funciton ( value, key ) {
     *
     *     console.log( key + ":" + value );
     *
     * } );
     * ```
     */

    /**
     * 用給定的叠代器遍歷數組或類數組對象
     * @method each
     * @param { Array } array 需要遍歷的數組或者類數組
     * @param { Function } iterator 叠代器， 該方法接受兩個參數， 第一個參數是當前所處理的value， 第二個參數是當前遍歷對象的key
     * @example
     * ```javascript
     * var divs = document.getElmentByTagNames( "div" );
     *
     * //output: 0: DIV, 1: DIV ...
     * UE.utils.each( divs, funciton ( value, key ) {
     *
     *     console.log( key + ":" + value.tagName );
     *
     * } );
     * ```
     */
    each : function(obj, iterator, context) {
        if (obj == null) return;
        if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if(iterator.call(context, obj[i], i, obj) === false)
                    return false;
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if(iterator.call(context, obj[key], key, obj) === false)
                        return false;
                }
            }
        }
    },

    /**
     * 以給定對象作為原型創建一個新對象
     * @method makeInstance
     * @param { Object } protoObject 該對象將作為新創建對象的原型
     * @return { Object } 新的對象， 該對象的原型是給定的protoObject對象
     * @example
     * ```javascript
     *
     * var protoObject = { sayHello: function () { console.log('Hello UEditor!'); } };
     *
     * var newObject = UE.utils.makeInstance( protoObject );
     * //output: Hello UEditor!
     * newObject.sayHello();
     * ```
     */
    makeInstance:function (obj) {
        var noop = new Function();
        noop.prototype = obj;
        obj = new noop;
        noop.prototype = null;
        return obj;
    },

    /**
     * 將source對象中的屬性擴展到target對象上
     * @method extend
     * @remind 該方法將強制把source對象上的屬性覆制到target對象上
     * @see UE.utils.extend(Object,Object,Boolean)
     * @param { Object } target 目標對象， 新的屬性將附加到該對象上
     * @param { Object } source 源對象， 該對象的屬性會被附加到target對象上
     * @return { Object } 返回target對象
     * @example
     * ```javascript
     *
     * var target = { name: 'target', sex: 1 },
     *      source = { name: 'source', age: 17 };
     *
     * UE.utils.extend( target, source );
     *
     * //output: { name: 'source', sex: 1, age: 17 }
     * console.log( target );
     *
     * ```
     */

    /**
     * 將source對象中的屬性擴展到target對象上， 根據指定的isKeepTarget值決定是否保留目標對象中與
     * 源對象屬性名相同的屬性值。
     * @method extend
     * @param { Object } target 目標對象， 新的屬性將附加到該對象上
     * @param { Object } source 源對象， 該對象的屬性會被附加到target對象上
     * @param { Boolean } isKeepTarget 是否保留目標對象中與源對象中屬性名相同的屬性
     * @return { Object } 返回target對象
     * @example
     * ```javascript
     *
     * var target = { name: 'target', sex: 1 },
     *      source = { name: 'source', age: 17 };
     *
     * UE.utils.extend( target, source, true );
     *
     * //output: { name: 'target', sex: 1, age: 17 }
     * console.log( target );
     *
     * ```
     */
    extend:function (t, s, b) {
        if (s) {
            for (var k in s) {
                if (!b || !t.hasOwnProperty(k)) {
                    t[k] = s[k];
                }
            }
        }
        return t;
    },

    /**
     * 將給定的多個對象的屬性覆制到目標對象target上
     * @method extend2
     * @remind 該方法將強制把源對象上的屬性覆制到target對象上
     * @remind 該方法支持兩個及以上的參數， 從第二個參數開始， 其屬性都會被覆制到第一個參數上。 如果遇到同名的屬性，
     *          將會覆蓋掉之前的值。
     * @param { Object } target 目標對象， 新的屬性將附加到該對象上
     * @param { Object... } source 源對象， 支持多個對象， 該對象的屬性會被附加到target對象上
     * @return { Object } 返回target對象
     * @example
     * ```javascript
     *
     * var target = {},
     *     source1 = { name: 'source', age: 17 },
     *     source2 = { title: 'dev' };
     *
     * UE.utils.extend2( target, source1, source2 );
     *
     * //output: { name: 'source', age: 17, title: 'dev' }
     * console.log( target );
     *
     * ```
     */
    extend2:function (t) {
        var a = arguments;
        for (var i = 1; i < a.length; i++) {
            var x = a[i];
            for (var k in x) {
                if (!t.hasOwnProperty(k)) {
                    t[k] = x[k];
                }
            }
        }
        return t;
    },

    /**
     * 模擬繼承機制， 使得subClass繼承自superClass
     * @method inherits
     * @param { Object } subClass 子類對象
     * @param { Object } superClass 超類對象
     * @warning 該方法只能讓subClass繼承超類的原型， subClass對象自身的屬性和方法不會被繼承
     * @return { Object } 繼承superClass後的子類對象
     * @example
     * ```javascript
     * function SuperClass(){
     *     this.name = "小李";
     * }
     *
     * SuperClass.prototype = {
     *     hello:function(str){
     *         console.log(this.name + str);
     *     }
     * }
     *
     * function SubClass(){
     *     this.name = "小張";
     * }
     *
     * UE.utils.inherits(SubClass,SuperClass);
     *
     * var sub = new SubClass();
     * //output: '小張早上好!
     * sub.hello("早上好!");
     * ```
     */
    inherits:function (subClass, superClass) {
        var oldP = subClass.prototype,
            newP = utils.makeInstance(superClass.prototype);
        utils.extend(newP, oldP, true);
        subClass.prototype = newP;
        return (newP.constructor = subClass);
    },

    /**
     * 用指定的context對象作為函數fn的上下文
     * @method bind
     * @param { Function } fn 需要綁定上下文的函數對象
     * @param { Object } content 函數fn新的上下文對象
     * @return { Function } 一個新的函數， 該函數作為原始函數fn的代理， 將完成fn的上下文調換工作。
     * @example
     * ```javascript
     *
     * var name = 'window',
     *     newTest = null;
     *
     * function test () {
     *     console.log( this.name );
     * }
     *
     * newTest = UE.utils.bind( test, { name: 'object' } );
     *
     * //output: object
     * newTest();
     *
     * //output: window
     * test();
     *
     * ```
     */
    bind:function (fn, context) {
        return function () {
            return fn.apply(context, arguments);
        };
    },

    /**
     * 創建延遲指定時間後執行的函數fn
     * @method defer
     * @param { Function } fn 需要延遲執行的函數對象
     * @param { int } delay 延遲的時間， 單位是毫秒
     * @warning 該方法的時間控制是不精確的，僅僅只能保證函數的執行是在給定的時間之後，
     *           而不能保證剛好到達延遲時間時執行。
     * @return { Function } 目標函數fn的代理函數， 只有執行該函數才能起到延時效果
     * @example
     * ```javascript
     * var start = 0;
     *
     * function test(){
     *     console.log( new Date() - start );
     * }
     *
     * var testDefer = UE.utils.defer( test, 1000 );
     * //
     * start = new Date();
     * //output: (大約在1000毫秒之後輸出) 1000
     * testDefer();
     * ```
     */

    /**
     * 創建延遲指定時間後執行的函數fn, 如果在延遲時間內再次執行該方法， 將會根據指定的exclusion的值，
     * 決定是否取消前一次函數的執行， 如果exclusion的值為true， 則取消執行，反之，將繼續執行前一個方法。
     * @method defer
     * @param { Function } fn 需要延遲執行的函數對象
     * @param { int } delay 延遲的時間， 單位是毫秒
     * @param { Boolean } exclusion 如果在延遲時間內再次執行該函數，該值將決定是否取消執行前一次函數的執行，
     *                     值為true表示取消執行， 反之則將在執行前一次函數之後才執行本次函數調用。
     * @warning 該方法的時間控制是不精確的，僅僅只能保證函數的執行是在給定的時間之後，
     *           而不能保證剛好到達延遲時間時執行。
     * @return { Function } 目標函數fn的代理函數， 只有執行該函數才能起到延時效果
     * @example
     * ```javascript
     *
     * function test(){
     *     console.log(1);
     * }
     *
     * var testDefer = UE.utils.defer( test, 1000, true );
     *
     * //output: (兩次調用僅有一次輸出) 1
     * testDefer();
     * testDefer();
     * ```
     */
    defer:function (fn, delay, exclusion) {
        var timerID;
        return function () {
            if (exclusion) {
                clearTimeout(timerID);
            }
            timerID = setTimeout(fn, delay);
        };
    },

    /**
     * 獲取元素item在數組array中首次出現的位置, 如果未找到item， 則返回-1
     * @method indexOf
     * @remind 該方法的匹配過程使用的是恒等“===”
     * @param { Array } array 需要查找的數組對象
     * @param { * } item 需要在目標數組中查找的值
     * @return { int } 返回item在目標數組array中首次出現的位置， 如果在數組中未找到item， 則返回-1
     * @example
     * ```javascript
     * var item = 1,
     *     arr = [ 3, 4, 6, 8, 1, 1, 2 ];
     *
     * //output: 4
     * console.log( UE.utils.indexOf( arr, item ) );
     * ```
     */

    /**
     * 獲取元素item數組array中首次出現的位置, 如果未找到item， 則返回-1。通過start的值可以指定搜索的起始位置。
     * @method indexOf
     * @remind 該方法的匹配過程使用的是恒等“===”
     * @param { Array } array 需要查找的數組對象
     * @param { * } item 需要在目標數組中查找的值
     * @param { int } start 搜索的起始位置
     * @return { int } 返回item在目標數組array中的start位置之後首次出現的位置， 如果在數組中未找到item， 則返回-1
     * @example
     * ```javascript
     * var item = 1,
     *     arr = [ 3, 4, 6, 8, 1, 2, 8, 3, 2, 1, 1, 4 ];
     *
     * //output: 9
     * console.log( UE.utils.indexOf( arr, item, 5 ) );
     * ```
     */
    indexOf:function (array, item, start) {
        var index = -1;
        start = this.isNumber(start) ? start : 0;
        this.each(array, function (v, i) {
            if (i >= start && v === item) {
                index = i;
                return false;
            }
        });
        return index;
    },

    /**
     * 移除數組array中所有的元素item
     * @method removeItem
     * @param { Array } array 要移除元素的目標數組
     * @param { * } item 將要被移除的元素
     * @remind 該方法的匹配過程使用的是恒等“===”
     * @example
     * ```javascript
     * var arr = [ 4, 5, 7, 1, 3, 4, 6 ];
     *
     * UE.utils.removeItem( arr, 4 );
     * //output: [ 5, 7, 1, 3, 6 ]
     * console.log( arr );
     *
     * ```
     */
    removeItem:function (array, item) {
        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i] === item) {
                array.splice(i, 1);
                i--;
            }
        }
    },

    /**
     * 刪除字符串str的首尾空格
     * @method trim
     * @param { String } str 需要刪除首尾空格的字符串
     * @return { String } 刪除了首尾的空格後的字符串
     * @example
     * ```javascript
     *
     * var str = " UEdtior ";
     *
     * //output: 9
     * console.log( str.length );
     *
     * //output: 7
     * console.log( UE.utils.trim( " UEdtior " ).length );
     *
     * //output: 9
     * console.log( str.length );
     *
     *  ```
     */
    trim:function (str) {
        return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
    },

    /**
     * 將字符串str以','分隔成數組後，將該數組轉換成哈希對象， 其生成的hash對象的key為數組中的元素， value為1
     * @method listToMap
     * @warning 該方法在生成的hash對象中，會為每一個key同時生成一個另一個全大寫的key。
     * @param { String } str 該字符串將被以','分割為數組， 然後進行轉化
     * @return { Object } 轉化之後的hash對象
     * @example
     * ```javascript
     *
     * //output: Object {UEdtior: 1, UEDTIOR: 1, Hello: 1, HELLO: 1}
     * console.log( UE.utils.listToMap( 'UEdtior,Hello' ) );
     *
     * ```
     */

    /**
     * 將字符串數組轉換成哈希對象， 其生成的hash對象的key為數組中的元素， value為1
     * @method listToMap
     * @warning 該方法在生成的hash對象中，會為每一個key同時生成一個另一個全大寫的key。
     * @param { Array } arr 字符串數組
     * @return { Object } 轉化之後的hash對象
     * @example
     * ```javascript
     *
     * //output: Object {UEdtior: 1, UEDTIOR: 1, Hello: 1, HELLO: 1}
     * console.log( UE.utils.listToMap( [ 'UEdtior', 'Hello' ] ) );
     *
     * ```
     */
    listToMap:function (list) {
        if (!list)return {};
        list = utils.isArray(list) ? list : list.split(',');
        for (var i = 0, ci, obj = {}; ci = list[i++];) {
            obj[ci.toUpperCase()] = obj[ci] = 1;
        }
        return obj;
    },

    /**
     * 將str中的html符號轉義,將轉義“'，&，<，"，>”五個字符
     * @method unhtml
     * @param { String } str 需要轉義的字符串
     * @return { String } 轉義後的字符串
     * @example
     * ```javascript
     * var html = '<body>&</body>';
     *
     * //output: &lt;body&gt;&amp;&lt;/body&gt;
     * console.log( UE.utils.unhtml( html ) );
     *
     * ```
     */
    unhtml:function (str, reg) {
        return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g, function (a, b) {
            if (b) {
                return a;
            } else {
                return {
                    '<':'&lt;',
                    '&':'&amp;',
                    '"':'&quot;',
                    '>':'&gt;',
                    "'":'&#39;'
                }[a]
            }

        }) : '';
    },
    /**
     * 將url中的html字符轉義， 僅轉義  ', ", <, > 四個字符
     * @param  { String } str 需要轉義的字符串
     * @param  { RegExp } reg 自定義的正則
     * @return { String }     轉義後的字符串
     */
    unhtmlForUrl:function (str, reg) {
        return str ? str.replace(reg || /[<">']/g, function (a) {
            return {
                '<':'&lt;',
                '&':'&amp;',
                '"':'&quot;',
                '>':'&gt;',
                "'":'&#39;'
            }[a]

        }) : '';
    },

    /**
     * 將str中的轉義字符還原成html字符
     * @see UE.utils.unhtml(String);
     * @method html
     * @param { String } str 需要逆轉義的字符串
     * @return { String } 逆轉義後的字符串
     * @example
     * ```javascript
     *
     * var str = '&lt;body&gt;&amp;&lt;/body&gt;';
     *
     * //output: <body>&</body>
     * console.log( UE.utils.html( str ) );
     *
     * ```
     */
    html:function (str) {
        return str ? str.replace(/&((g|l|quo)t|amp|#39|nbsp);/g, function (m) {
            return {
                '&lt;':'<',
                '&amp;':'&',
                '&quot;':'"',
                '&gt;':'>',
                '&#39;':"'",
                '&nbsp;':' '
            }[m]
        }) : '';
    },

    /**
     * 將css樣式轉換為駝峰的形式
     * @method cssStyleToDomStyle
     * @param { String } cssName 需要轉換的css樣式名
     * @return { String } 轉換成駝峰形式後的css樣式名
     * @example
     * ```javascript
     *
     * var str = 'border-top';
     *
     * //output: borderTop
     * console.log( UE.utils.cssStyleToDomStyle( str ) );
     *
     * ```
     */
    cssStyleToDomStyle:function () {
        var test = document.createElement('div').style,
            cache = {
                'float':test.cssFloat != undefined ? 'cssFloat' : test.styleFloat != undefined ? 'styleFloat' : 'float'
            };

        return function (cssName) {
            return cache[cssName] || (cache[cssName] = cssName.toLowerCase().replace(/-./g, function (match) {
                return match.charAt(1).toUpperCase();
            }));
        };
    }(),

    /**
     * 動態加載文件到doc中
     * @method loadFile
     * @param { DomDocument } document 需要加載資源文件的文檔對象
     * @param { Object } options 加載資源文件的屬性集合， 取值請參考代碼示例
     * @example
     * ```javascript
     *
     * UE.utils.loadFile( document, {
     *     src:"test.js",
     *     tag:"script",
     *     type:"text/javascript",
     *     defer:"defer"
     * } );
     *
     * ```
     */

    /**
     * 動態加載文件到doc中，加載成功後執行的回調函數fn
     * @method loadFile
     * @param { DomDocument } document 需要加載資源文件的文檔對象
     * @param { Object } options 加載資源文件的屬性集合， 該集合支持的值是script標簽和style標簽支持的所有屬性。
     * @param { Function } fn 資源文件加載成功之後執行的回調
     * @warning 對於在同一個文檔中多次加載同一URL的文件， 該方法會在第一次加載之後緩存該請求，
     *           在此之後的所有同一URL的請求， 將會直接觸發回調。
     * @example
     * ```javascript
     *
     * UE.utils.loadFile( document, {
     *     src:"test.js",
     *     tag:"script",
     *     type:"text/javascript",
     *     defer:"defer"
     * }, function () {
     *     console.log('加載成功');
     * } );
     *
     * ```
     */
    loadFile:function () {
        var tmpList = [];

        function getItem(doc, obj) {
            try {
                for (var i = 0, ci; ci = tmpList[i++];) {
                    if (ci.doc === doc && ci.url == (obj.src || obj.href)) {
                        return ci;
                    }
                }
            } catch (e) {
                return null;
            }

        }

        return function (doc, obj, fn) {
            var item = getItem(doc, obj);
            if (item) {
                if (item.ready) {
                    fn && fn();
                } else {
                    item.funs.push(fn)
                }
                return;
            }
            tmpList.push({
                doc:doc,
                url:obj.src || obj.href,
                funs:[fn]
            });
            if (!doc.body) {
                var html = [];
                for (var p in obj) {
                    if (p == 'tag')continue;
                    html.push(p + '="' + obj[p] + '"')
                }
                doc.write('<' + obj.tag + ' ' + html.join(' ') + ' ></' + obj.tag + '>');
                return;
            }
            if (obj.id && doc.getElementById(obj.id)) {
                return;
            }
            var element = doc.createElement(obj.tag);
            delete obj.tag;
            for (var p in obj) {
                element.setAttribute(p, obj[p]);
            }
            element.onload = element.onreadystatechange = function () {
                if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                    item = getItem(doc, obj);
                    if (item.funs.length > 0) {
                        item.ready = 1;
                        for (var fi; fi = item.funs.pop();) {
                            fi();
                        }
                    }
                    element.onload = element.onreadystatechange = null;
                }
            };
            element.onerror = function () {
                throw Error('The load ' + (obj.href || obj.src) + ' fails,check the url settings of file ueditor.config.js ')
            };
            doc.getElementsByTagName("head")[0].appendChild(element);
        }
    }(),

    /**
     * 判斷obj對象是否為空
     * @method isEmptyObject
     * @param { * } obj 需要判斷的對象
     * @remind 如果判斷的對象是NULL， 將直接返回true， 如果是數組且為空， 返回true， 如果是字符串， 且字符串為空，
     *          返回true， 如果是普通對象， 且該對象沒有任何實例屬性， 返回true
     * @return { Boolean } 對象是否為空
     * @example
     * ```javascript
     *
     * //output: true
     * console.log( UE.utils.isEmptyObject( {} ) );
     *
     * //output: true
     * console.log( UE.utils.isEmptyObject( [] ) );
     *
     * //output: true
     * console.log( UE.utils.isEmptyObject( "" ) );
     *
     * //output: false
     * console.log( UE.utils.isEmptyObject( { key: 1 } ) );
     *
     * //output: false
     * console.log( UE.utils.isEmptyObject( [1] ) );
     *
     * //output: false
     * console.log( UE.utils.isEmptyObject( "1" ) );
     *
     * ```
     */
    isEmptyObject:function (obj) {
        if (obj == null) return true;
        if (this.isArray(obj) || this.isString(obj)) return obj.length === 0;
        for (var key in obj) if (obj.hasOwnProperty(key)) return false;
        return true;
    },

    /**
     * 把rgb格式的顏色值轉換成16進制格式
     * @method fixColor
     * @param { String } rgb格式的顏色值
     * @param { String }
     * @example
     * rgb(255,255,255)  => "#ffffff"
     */
    fixColor:function (name, value) {
        if (/color/i.test(name) && /rgba?/.test(value)) {
            var array = value.split(",");
            if (array.length > 3)
                return "";
            value = "#";
            for (var i = 0, color; color = array[i++];) {
                color = parseInt(color.replace(/[^\d]/gi, ''), 10).toString(16);
                value += color.length == 1 ? "0" + color : color;
            }
            value = value.toUpperCase();
        }
        return  value;
    },
    /**
     * 只針對border,padding,margin做了處理，因為性能問題
     * @public
     * @function
     * @param {String}    val style字符串
     */
    optCss:function (val) {
        var padding, margin, border;
        val = val.replace(/(padding|margin|border)\-([^:]+):([^;]+);?/gi, function (str, key, name, val) {
            if (val.split(' ').length == 1) {
                switch (key) {
                    case 'padding':
                        !padding && (padding = {});
                        padding[name] = val;
                        return '';
                    case 'margin':
                        !margin && (margin = {});
                        margin[name] = val;
                        return '';
                    case 'border':
                        return val == 'initial' ? '' : str;
                }
            }
            return str;
        });

        function opt(obj, name) {
            if (!obj) {
                return '';
            }
            var t = obj.top , b = obj.bottom, l = obj.left, r = obj.right, val = '';
            if (!t || !l || !b || !r) {
                for (var p in obj) {
                    val += ';' + name + '-' + p + ':' + obj[p] + ';';
                }
            } else {
                val += ';' + name + ':' +
                    (t == b && b == l && l == r ? t :
                        t == b && l == r ? (t + ' ' + l) :
                            l == r ? (t + ' ' + l + ' ' + b) : (t + ' ' + r + ' ' + b + ' ' + l)) + ';'
            }
            return val;
        }

        val += opt(padding, 'padding') + opt(margin, 'margin');
        return val.replace(/^[ \n\r\t;]*|[ \n\r\t]*$/, '').replace(/;([ \n\r\t]+)|\1;/g, ';')
            .replace(/(&((l|g)t|quot|#39))?;{2,}/g, function (a, b) {
                return b ? b + ";;" : ';'
            });
    },

    /**
     * 克隆對象
     * @method clone
     * @param { Object } source 源對象
     * @return { Object } source的一個副本
     */

    /**
     * 深度克隆對象，將source的屬性克隆到target對象， 會覆蓋target重名的屬性。
     * @method clone
     * @param { Object } source 源對象
     * @param { Object } target 目標對象
     * @return { Object } 附加了source對象所有屬性的target對象
     */
    clone:function (source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (typeof tmp == 'object') {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clone(source[i], target[i])
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    },

    /**
     * 把cm／pt為單位的值轉換為px為單位的值
     * @method transUnitToPx
     * @param { String } 待轉換的帶單位的字符串
     * @return { String } 轉換為px為計量單位的值的字符串
     * @example
     * ```javascript
     *
     * //output: 500px
     * console.log( UE.utils.transUnitToPx( '20cm' ) );
     *
     * //output: 27px
     * console.log( UE.utils.transUnitToPx( '20pt' ) );
     *
     * ```
     */
    transUnitToPx:function (val) {
        if (!/(pt|cm)/.test(val)) {
            return val
        }
        var unit;
        val.replace(/([\d.]+)(\w+)/, function (str, v, u) {
            val = v;
            unit = u;
        });
        switch (unit) {
            case 'cm':
                val = parseFloat(val) * 25;
                break;
            case 'pt':
                val = Math.round(parseFloat(val) * 96 / 72);
        }
        return val + (val ? 'px' : '');
    },

    /**
     * 在dom樹ready之後執行給定的回調函數
     * @method domReady
     * @remind 如果在執行該方法的時候， dom樹已經ready， 那麽回調函數將立刻執行
     * @param { Function } fn dom樹ready之後的回調函數
     * @example
     * ```javascript
     *
     * UE.utils.domReady( function () {
     *
     *     console.log('123');
     *
     * } );
     *
     * ```
     */
    domReady:function () {

        var fnArr = [];

        function doReady(doc) {
            //確保onready只執行一次
            doc.isReady = true;
            for (var ci; ci = fnArr.pop(); ci()) {
            }
        }

        return function (onready, win) {
            win = win || window;
            var doc = win.document;
            onready && fnArr.push(onready);
            if (doc.readyState === "complete") {
                doReady(doc);
            } else {
                doc.isReady && doReady(doc);
                if (browser.ie && browser.version != 11) {
                    (function () {
                        if (doc.isReady) return;
                        try {
                            doc.documentElement.doScroll("left");
                        } catch (error) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }
                        doReady(doc);
                    })();
                    win.attachEvent('onload', function () {
                        doReady(doc)
                    });
                } else {
                    doc.addEventListener("DOMContentLoaded", function () {
                        doc.removeEventListener("DOMContentLoaded", arguments.callee, false);
                        doReady(doc);
                    }, false);
                    win.addEventListener('load', function () {
                        doReady(doc)
                    }, false);
                }
            }

        }
    }(),

    /**
     * 動態添加css樣式
     * @method cssRule
     * @param { String } 節點名稱
     * @grammar UE.utils.cssRule('添加的樣式的節點名稱',['樣式'，'放到哪個document上'])
     * @grammar UE.utils.cssRule('body','body{background:#ccc}') => null  //給body添加背景顏色
     * @grammar UE.utils.cssRule('body') =>樣式的字符串  //取得key值為body的樣式的內容,如果沒有找到key值先關的樣式將返回空，例如剛才那個背景顏色，將返回 body{background:#ccc}
     * @grammar UE.utils.cssRule('body',document) => 返回指定key的樣式，並且指定是哪個document
     * @grammar UE.utils.cssRule('body','') =>null //清空給定的key值的背景顏色
     */
    cssRule:browser.ie && browser.version != 11 ? function (key, style, doc) {
        var indexList, index;
        if(style === undefined || style && style.nodeType && style.nodeType == 9){
            //獲取樣式
            doc = style && style.nodeType && style.nodeType == 9 ? style : (doc || document);
            indexList = doc.indexList || (doc.indexList = {});
            index = indexList[key];
            if(index !==  undefined){
                return doc.styleSheets[index].cssText
            }
            return undefined;
        }
        doc = doc || document;
        indexList = doc.indexList || (doc.indexList = {});
        index = indexList[key];
        //清除樣式
        if(style === ''){
            if(index!== undefined){
                doc.styleSheets[index].cssText = '';
                delete indexList[key];
                return true
            }
            return false;
        }

        //添加樣式
        if(index!== undefined){
            sheetStyle =  doc.styleSheets[index];
        }else{
            sheetStyle = doc.createStyleSheet('', index = doc.styleSheets.length);
            indexList[key] = index;
        }
        sheetStyle.cssText = style;
    }: function (key, style, doc) {
        var head, node;
        if(style === undefined || style && style.nodeType && style.nodeType == 9){
            //獲取樣式
            doc = style && style.nodeType && style.nodeType == 9 ? style : (doc || document);
            node = doc.getElementById(key);
            return node ? node.innerHTML : undefined;
        }
        doc = doc || document;
        node = doc.getElementById(key);

        //清除樣式
        if(style === ''){
            if(node){
                node.parentNode.removeChild(node);
                return true
            }
            return false;
        }

        //添加樣式
        if(node){
            node.innerHTML = style;
        }else{
            node = doc.createElement('style');
            node.id = key;
            node.innerHTML = style;
            doc.getElementsByTagName('head')[0].appendChild(node);
        }
    },
    sort:function(array,compareFn){
        compareFn = compareFn || function(item1, item2){ return item1.localeCompare(item2);};
        for(var i= 0,len = array.length; i<len; i++){
            for(var j = i,length = array.length; j<length; j++){
                if(compareFn(array[i], array[j]) > 0){
                    var t = array[i];
                    array[i] = array[j];
                    array[j] = t;
                }
            }
        }
        return array;
    },
    serializeParam:function (json) {
        var strArr = [];
        for (var i in json) {
            //忽略默認的幾個參數
            if(i=="method" || i=="timeout" || i=="async") continue;
            //傳遞過來的對象和函數不在提交之列
            if (!((typeof json[i]).toLowerCase() == "function" || (typeof json[i]).toLowerCase() == "object")) {
                strArr.push( encodeURIComponent(i) + "="+encodeURIComponent(json[i]) );
            } else if (utils.isArray(json[i])) {
                //支持傳數組內容
                for(var j = 0; j < json[i].length; j++) {
                    strArr.push( encodeURIComponent(i) + "[]="+encodeURIComponent(json[i][j]) );
                }
            }
        }
        return strArr.join("&");
    },
    formatUrl:function (url) {
        var u = url.replace(/&&/g, '&');
        u = u.replace(/\?&/g, '?');
        u = u.replace(/&$/g, '');
        u = u.replace(/&#/g, '#');
        u = u.replace(/&+/g, '&');
        return u;
    },
    isCrossDomainUrl:function (url) {
        var a = document.createElement('a');
        a.href = url;
        if (browser.ie) {
            a.href = a.href;
        }
        return !(a.protocol == location.protocol && a.hostname == location.hostname &&
        (a.port == location.port || (a.port == '80' && location.port == '') || (a.port == '' && location.port == '80')));
    },
    clearEmptyAttrs : function(obj){
        for(var p in obj){
            if(obj[p] === ''){
                delete obj[p]
            }
        }
        return obj;
    },
    str2json : function(s){

        if (!utils.isString(s)) return null;
        if (window.JSON) {
            return JSON.parse(s);
        } else {
            return (new Function("return " + utils.trim(s || '')))();
        }

    },
    json2str : (function(){

        if (window.JSON) {

            return JSON.stringify;

        } else {

            var escapeMap = {
                "\b": '\\b',
                "\t": '\\t',
                "\n": '\\n',
                "\f": '\\f',
                "\r": '\\r',
                '"' : '\\"',
                "\\": '\\\\'
            };

            function encodeString(source) {
                if (/["\\\x00-\x1f]/.test(source)) {
                    source = source.replace(
                        /["\\\x00-\x1f]/g,
                        function (match) {
                            var c = escapeMap[match];
                            if (c) {
                                return c;
                            }
                            c = match.charCodeAt();
                            return "\\u00"
                            + Math.floor(c / 16).toString(16)
                            + (c % 16).toString(16);
                        });
                }
                return '"' + source + '"';
            }

            function encodeArray(source) {
                var result = ["["],
                    l = source.length,
                    preComma, i, item;

                for (i = 0; i < l; i++) {
                    item = source[i];

                    switch (typeof item) {
                        case "undefined":
                        case "function":
                        case "unknown":
                            break;
                        default:
                            if(preComma) {
                                result.push(',');
                            }
                            result.push(utils.json2str(item));
                            preComma = 1;
                    }
                }
                result.push("]");
                return result.join("");
            }

            function pad(source) {
                return source < 10 ? '0' + source : source;
            }

            function encodeDate(source){
                return '"' + source.getFullYear() + "-"
                + pad(source.getMonth() + 1) + "-"
                + pad(source.getDate()) + "T"
                + pad(source.getHours()) + ":"
                + pad(source.getMinutes()) + ":"
                + pad(source.getSeconds()) + '"';
            }

            return function (value) {
                switch (typeof value) {
                    case 'undefined':
                        return 'undefined';

                    case 'number':
                        return isFinite(value) ? String(value) : "null";

                    case 'string':
                        return encodeString(value);

                    case 'boolean':
                        return String(value);

                    default:
                        if (value === null) {
                            return 'null';
                        } else if (utils.isArray(value)) {
                            return encodeArray(value);
                        } else if (utils.isDate(value)) {
                            return encodeDate(value);
                        } else {
                            var result = ['{'],
                                encode = utils.json2str,
                                preComma,
                                item;

                            for (var key in value) {
                                if (Object.prototype.hasOwnProperty.call(value, key)) {
                                    item = value[key];
                                    switch (typeof item) {
                                        case 'undefined':
                                        case 'unknown':
                                        case 'function':
                                            break;
                                        default:
                                            if (preComma) {
                                                result.push(',');
                                            }
                                            preComma = 1;
                                            result.push(encode(key) + ':' + encode(item));
                                    }
                                }
                            }
                            result.push('}');
                            return result.join('');
                        }
                }
            };
        }

    })()

};
/**
 * 判斷給定的對象是否是字符串
 * @method isString
 * @param { * } object 需要判斷的對象
 * @return { Boolean } 給定的對象是否是字符串
 */

/**
 * 判斷給定的對象是否是數組
 * @method isArray
 * @param { * } object 需要判斷的對象
 * @return { Boolean } 給定的對象是否是數組
 */

/**
 * 判斷給定的對象是否是一個Function
 * @method isFunction
 * @param { * } object 需要判斷的對象
 * @return { Boolean } 給定的對象是否是Function
 */

/**
 * 判斷給定的對象是否是Number
 * @method isNumber
 * @param { * } object 需要判斷的對象
 * @return { Boolean } 給定的對象是否是Number
 */

/**
 * 判斷給定的對象是否是一個正則表達式
 * @method isRegExp
 * @param { * } object 需要判斷的對象
 * @return { Boolean } 給定的對象是否是正則表達式
 */

/**
 * 判斷給定的對象是否是一個普通對象
 * @method isObject
 * @param { * } object 需要判斷的對象
 * @return { Boolean } 給定的對象是否是普通對象
 */
utils.each(['String', 'Function', 'Array', 'Number', 'RegExp', 'Object', 'Date'], function (v) {
    UE.utils['is' + v] = function (obj) {
        return Object.prototype.toString.apply(obj) == '[object ' + v + ']';
    }
});
