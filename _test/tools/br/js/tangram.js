(function(){
	// Copyright (c) 2009, Baidu Inc. All rights reserved.
	//
	// Licensed under the BSD License
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	// 
//	      http://tangram.baidu.com/license.html
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS-IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */

	 /**
	 * @namespace T Tangram七巧板
	 * @name T
	 * @version 1.3.9
	*/

	/**
	 * 聲明baidu包
	 * @author: allstar, erik, meizz, berg
	 */
	var T,
	    baidu = T = baidu || {version: "1.3.9"}; 
	window.TT = T;

	//提出guid，防止在與老版本Tangram混用時
	//在下一行錯誤的修改window[undefined]
	baidu.guid = "$BAIDU$";

	//Tangram可能被放在閉包中
	//一些頁面級別唯一的屬性，需要掛載在window[baidu.guid]上
	window[baidu.guid] = window[baidu.guid] || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/ajax.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/11/13
	 */


	/**
	 * @namespace baidu.ajax 對XMLHttpRequest請求的封裝。
	*/
	baidu.ajax = baidu.ajax || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 *
	 * path: baidu/fn.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/11/02
	 */


	/**
	 * @namespace baidu.fn 對方法的操作，解決內存泄露問題。
	 */
	baidu.fn = baidu.fn || {};
	/*
	 * Tangram
	 * Copyright 2011 Baidu Inc. All rights reserved.
	 */



	/**
	 * 這是一個空函數，用於需要排除函數作用域鏈幹擾的情況.
	 * @author rocy
	 * @name baidu.fn.blank
	 * @function
	 * @grammar baidu.fn.blank()
	 * @meta standard
	 * @version 1.3.3
	 */
	baidu.fn.blank = function () {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */




	/**
	 * 發送一個ajax請求
	 * @author: allstar, erik, berg
	 * @name baidu.ajax.request
	 * @function
	 * @grammar baidu.ajax.request(url[, options])
	 * @param {string} 	url 發送請求的url
	 * @param {Object} 	opt_options 發送請求的選項參數
	 * @config {String} 	[method] 			請求發送的類型。默認為GET
	 * @config {Boolean}  [async] 			是否異步請求。默認為true（異步）
	 * @config {String} 	[data] 				需要發送的數據。如果是GET請求的話，不需要這個屬性
	 * @config {Object} 	[headers] 			要設置的http request header
	 * @config {number}   [timeout]       超時時間，單位ms
	 * @config {String} 	[username] 			用戶名
	 * @config {String} 	[password] 			密碼
	 * @config {Function} [onsuccess] 		請求成功時觸發，function(XMLHttpRequest xhr, string responseText)。
	 * @config {Function} [onfailure] 		請求失敗時觸發，function(XMLHttpRequest xhr)。
	 * @config {Function} [onbeforerequest]	發送請求之前觸發，function(XMLHttpRequest xhr)。
	 * @config {Function} [on{STATUS_CODE}] 	當請求為相應狀態碼時觸發的事件，如on302、on404、on500，function(XMLHttpRequest xhr)。3XX的狀態碼瀏覽器無法獲取，4xx的，可能因為未知問題導致獲取失敗。
	 * @config {Boolean}  [noCache] 			是否需要緩存，默認為false（緩存），1.1.1起支持。
	 * 
	 * @meta standard
	 * @see baidu.ajax.get,baidu.ajax.post,baidu.ajax.form
	 *             
	 * @returns {XMLHttpRequest} 發送請求的XMLHttpRequest對象
	 */
	baidu.ajax.request = function (url, opt_options) {
	    var options     = opt_options || {},
	        data        = options.data || "",
	        async       = !(options.async === false),
	        username    = options.username || "",
	        password    = options.password || "",
	        method      = (options.method || "GET").toUpperCase(),
	        headers     = options.headers || {},
	        // 基本的邏輯來自lili同學提供的patch
	        timeout     = options.timeout || 0,
	        eventHandlers = {},
	        tick, key, xhr;

	    /**
	     * readyState發生變更時調用
	     * 
	     * @ignore
	     */
	    function stateChangeHandler() {
	        if (xhr.readyState == 4) {
	            try {
	                var stat = xhr.status;
	            } catch (ex) {
	                // 在請求時，如果網絡中斷，Firefox會無法取得status
	                fire('failure');
	                return;
	            }
	            
	            fire(stat);
	            
	            // http://www.never-online.net/blog/article.asp?id=261
	            // case 12002: // Server timeout      
	            // case 12029: // dropped connections
	            // case 12030: // dropped connections
	            // case 12031: // dropped connections
	            // case 12152: // closed by server
	            // case 13030: // status and statusText are unavailable
	            
	            // IE error sometimes returns 1223 when it 
	            // should be 204, so treat it as success
	            if ((stat >= 200 && stat < 300)
	                || stat == 304
	                || stat == 1223) {
	                fire('success');
	            } else {
	                fire('failure');
	            }
	            
	            /*
	             * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
	             * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
	             * function maybe still be called after it is deleted. The theory is that the
	             * callback is cached somewhere. Setting it to null or an empty function does
	             * seem to work properly, though.
	             * 
	             * On IE, there are two problems: Setting onreadystatechange to null (as
	             * opposed to an empty function) sometimes throws an exception. With
	             * particular (rare) versions of jscript.dll, setting onreadystatechange from
	             * within onreadystatechange causes a crash. Setting it from within a timeout
	             * fixes this bug (see issue 1610).
	             * 
	             * End result: *always* set onreadystatechange to an empty function (never to
	             * null). Never set onreadystatechange from within onreadystatechange (always
	             * in a setTimeout()).
	             */
	            window.setTimeout(
	                function() {
	                    // 避免內存泄露.
	                    // 由new Function改成不含此作用域鏈的 baidu.fn.blank 函數,
	                    // 以避免作用域鏈帶來的隱性循環引用導致的IE下內存泄露. By rocy 2011-01-05 .
	                    xhr.onreadystatechange = baidu.fn.blank;
	                    if (async) {
	                        xhr = null;
	                    }
	                }, 0);
	        }
	    }
	    
	    /**
	     * 獲取XMLHttpRequest對象
	     * 
	     * @ignore
	     * @return {XMLHttpRequest} XMLHttpRequest對象
	     */
	    function getXHR() {
	        if (window.ActiveXObject) {
	            try {
	                return new ActiveXObject("Msxml2.XMLHTTP");
	            } catch (e) {
	                try {
	                    return new ActiveXObject("Microsoft.XMLHTTP");
	                } catch (e) {}
	            }
	        }
	        if (window.XMLHttpRequest) {
	            return new XMLHttpRequest();
	        }
	    }
	    
	    /**
	     * 觸發事件
	     * 
	     * @ignore
	     * @param {String} type 事件類型
	     */
	    function fire(type) {
	        type = 'on' + type;
	        var handler = eventHandlers[type],
	            globelHandler = baidu.ajax[type];
	        
	        // 不對事件類型進行驗證
	        if (handler) {
	            if (tick) {
	              clearTimeout(tick);
	            }

	            if (type != 'onsuccess') {
	                handler(xhr);
	            } else {
	                //處理獲取xhr.responseText導致出錯的情況,比如請求圖片地址.
	                try {
	                    xhr.responseText;
	                } catch(error) {
	                    return handler(xhr);
	                }
	                handler(xhr, xhr.responseText);
	            }
	        } else if (globelHandler) {
	            //onsuccess不支持全局事件
	            if (type == 'onsuccess') {
	                return;
	            }
	            globelHandler(xhr);
	        }
	    }
	    
	    
	    for (key in options) {
	        // 將options參數中的事件參數覆制到eventHandlers對象中
	        // 這里覆制所有options的成員，eventHandlers有冗余
	        // 但是不會產生任何影響，並且代碼緊湊
	        eventHandlers[key] = options[key];
	    }
	    
	    headers['X-Requested-With'] = 'XMLHttpRequest';
	    
	    
	    try {
	        xhr = getXHR();
	        
	        if (method == 'GET') {
	            if (data) {
	                url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
	                data = null;
	            }
	            if(options['noCache'])
	                url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + (+ new Date) + '=1';
	        }
	        
	        if (username) {
	            xhr.open(method, url, async, username, password);
	        } else {
	            xhr.open(method, url, async);
	        }
	        
	        if (async) {
	            xhr.onreadystatechange = stateChangeHandler;
	        }
	        
	        // 在open之後再進行http請求頭設定
	        // FIXME 是否需要添加; charset=UTF-8呢
	        if (method == 'POST') {
	            xhr.setRequestHeader("Content-Type",
	                (headers['Content-Type'] || "application/x-www-form-urlencoded"));
	        }
	        
	        for (key in headers) {
	            if (headers.hasOwnProperty(key)) {
	                xhr.setRequestHeader(key, headers[key]);
	            }
	        }
	        
	        fire('beforerequest');

	        if (timeout) {
	          tick = setTimeout(function(){
	            xhr.onreadystatechange = baidu.fn.blank;
	            xhr.abort();
	            fire("timeout");
	          }, timeout);
	        }
	        xhr.send(data);
	        
	        if (!async) {
	            stateChangeHandler();
	        }
	    } catch (ex) {
	        fire('failure');
	    }
	    
	    return xhr;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/ajax/form.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */




	/**
	 * 將一個表單用ajax方式提交
	 * @name baidu.ajax.form
	 * @function
	 * @grammar baidu.ajax.form(form[, options])
	 * @param {HTMLFormElement} form             需要提交的表單元素
	 * @param {Object} 	[options] 					發送請求的選項參數
	 * @config {Boolean} [async] 			是否異步請求。默認為true（異步）
	 * @config {String} 	[username] 			用戶名
	 * @config {String} 	[password] 			密碼
	 * @config {Object} 	[headers] 			要設置的http request header
	 * @config {Function} [replacer] 			對參數值特殊處理的函數,replacer(string value, string key)
	 * @config {Function} [onbeforerequest] 	發送請求之前觸發，function(XMLHttpRequest xhr)。
	 * @config {Function} [onsuccess] 		請求成功時觸發，function(XMLHttpRequest xhr, string responseText)。
	 * @config {Function} [onfailure] 		請求失敗時觸發，function(XMLHttpRequest xhr)。
	 * @config {Function} [on{STATUS_CODE}] 	當請求為相應狀態碼時觸發的事件，如on302、on404、on500，function(XMLHttpRequest xhr)。3XX的狀態碼瀏覽器無法獲取，4xx的，可能因為未知問題導致獲取失敗。
		
	 * @see baidu.ajax.request
	 *             
	 * @returns {XMLHttpRequest} 發送請求的XMLHttpRequest對象
	 */
	baidu.ajax.form = function (form, options) {
	    options = options || {};
	    var elements    = form.elements,
	        len         = elements.length,
	        method      = form.getAttribute('method'),
	        url         = form.getAttribute('action'),
	        replacer    = options.replacer || function (value, name) {
	            return value;
	        },
	        sendOptions = {},
	        data = [],
	        i, item, itemType, itemName, itemValue, 
	        opts, oi, oLen, oItem;
	        
	    /**
	     * 向緩沖區添加參數數據
	     * @private
	     */
	    function addData(name, value) {
	        data.push(name + '=' + value);
	    }
	    
	    // 覆制發送參數選項對象
	    for (i in options) {
	        if (options.hasOwnProperty(i)) {
	            sendOptions[i] = options[i];
	        }
	    }
	    
	    for (i = 0; i < len; i++) {
	        item = elements[i];
	        itemName = item.name;
	        
	        // 處理：可用並包含表單name的表單項
	        if (!item.disabled && itemName) {
	            itemType = item.type;
	            itemValue = item.value;
	        
	            switch (itemType) {
	            // radio和checkbox被選中時，拼裝queryString數據
	            case 'radio':
	            case 'checkbox':
	                if (!item.checked) {
	                    break;
	                }
	                
	            // 默認類型，拼裝queryString數據
	            case 'textarea':
	            case 'text':
	            case 'password':
	            case 'hidden':
	            case 'select-one':
	                addData(itemName, replacer(itemValue, itemName));
	                break;
	                
	            // 多行選中select，拼裝所有選中的數據
	            case 'select-multiple':
	                opts = item.options;
	                oLen = opts.length;
	                for (oi = 0; oi < oLen; oi++) {
	                    oItem = opts[oi];
	                    if (oItem.selected) {
	                        addData(itemName, replacer(oItem.value, itemName));
	                    }
	                }
	                break;
	            }
	        }
	    }
	    
	    // 完善發送請求的參數選項
	    sendOptions.data = data.join('&');
	    sendOptions.method = form.getAttribute('method') || 'GET';
	    
	    // 發送請求
	    return baidu.ajax.request(url, sendOptions);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/ajax/get.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */




	/**
	 * 發送一個get請求
	 * @name baidu.ajax.get
	 * @function
	 * @grammar baidu.ajax.get(url[, onsuccess])
	 * @param {string} 	url 		發送請求的url地址
	 * @param {Function} [onsuccess] 請求成功之後的回調函數，function(XMLHttpRequest xhr, string responseText)
	 * @meta standard
	 * @see baidu.ajax.post,baidu.ajax.request
	 *             
	 * @returns {XMLHttpRequest} 	發送請求的XMLHttpRequest對象
	 */
	baidu.ajax.get = function (url, onsuccess) {
	    return baidu.ajax.request(url, {'onsuccess': onsuccess});
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/ajax/post.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */




	/**
	 * 發送一個post請求
	 * @name baidu.ajax.post
	 * @function
	 * @grammar baidu.ajax.post(url, data[, onsuccess])
	 * @param {string} 	url 		發送請求的url地址
	 * @param {string} 	data 		發送的數據
	 * @param {Function} [onsuccess] 請求成功之後的回調函數，function(XMLHttpRequest xhr, string responseText)
	 * @meta standard
	 * @see baidu.ajax.get,baidu.ajax.request
	 *             
	 * @returns {XMLHttpRequest} 	發送請求的XMLHttpRequest對象
	 */
	baidu.ajax.post = function (url, data, onsuccess) {
	    return baidu.ajax.request(
	        url, 
	        {
	            'onsuccess': onsuccess,
	            'method': 'POST',
	            'data': data
	        }
	    );
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 *
	 * path: baidu/array.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * @namespace baidu.array 操作數組的方法。
	 */

	baidu.array = baidu.array || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/array/indexOf.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 查詢數組中指定元素的索引位置
	 * @name baidu.array.indexOf
	 * @function
	 * @grammar baidu.array.indexOf(source, match[, fromIndex])
	 * @param {Array} source 需要查詢的數組
	 * @param {Any} match 查詢項
	 * @param {number} [fromIndex] 查詢的起始位索引位置，如果為負數，則從source.length+fromIndex往後開始查找
	 * @see baidu.array.find,baidu.array.lastIndexOf
	 *             
	 * @returns {number} 指定元素的索引位置，查詢不到時返回-1
	 */
	baidu.array.indexOf = function (source, match, fromIndex) {
	    var len = source.length,
	        iterator = match;
	        
	    fromIndex = fromIndex | 0;
	    if(fromIndex < 0){//小於0
	        fromIndex = Math.max(0, len + fromIndex)
	    }
	    for ( ; fromIndex < len; fromIndex++) {
	        if(fromIndex in source && source[fromIndex] === match) {
	            return fromIndex;
	        }
	    }
	    
	    return -1;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */




	/**
	 * 判斷一個數組中是否包含給定元素
	 * @name baidu.array.contains
	 * @function
	 * @grammar baidu.array.contains(source, obj)
	 * @param {Array} source 需要判斷的數組.
	 * @param {Any} obj 要查找的元素.
	 * @return {boolean} 判斷結果.
	 * @author berg
	 */
	baidu.array.contains = function(source, obj) {
	    return (baidu.array.indexOf(source, obj) >= 0);
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/array/each.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 遍歷數組中所有元素
	 * @name baidu.array.each
	 * @function
	 * @grammar baidu.array.each(source, iterator[, thisObject])
	 * @param {Array} source 需要遍歷的數組
	 * @param {Function} iterator 對每個數組元素進行調用的函數，該函數有兩個參數，第一個為數組元素，第二個為數組索引值，function (item, index)。
	 * @param {Object} [thisObject] 函數調用時的this指針，如果沒有此參數，默認是當前遍歷的數組
	 * @remark
	 * each方法不支持對Object的遍歷,對Object的遍歷使用baidu.object.each 。
	 * @shortcut each
	 * @meta standard
	 *             
	 * @returns {Array} 遍歷的數組
	 */
	 
	baidu.each = baidu.array.forEach = baidu.array.each = function (source, iterator, thisObject) {
	    var returnValue, item, i, len = source.length;
	    
	    if ('function' == typeof iterator) {
	        for (i = 0; i < len; i++) {
	            item = source[i];
	            //TODO
	            //此處實現和標準不符合，標準中是這樣說的：
	            //If a thisObject parameter is provided to forEach, it will be used as the this for each invocation of the callback. If it is not provided, or is null, the global object associated with callback is used instead.
	            returnValue = iterator.call(thisObject || source, item, i);
	    
	            if (returnValue === false) {
	                break;
	            }
	        }
	    }
	    return source;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 清空一個數組
	 * @name baidu.array.empty
	 * @function
	 * @grammar baidu.array.empty(source)
	 * @param {Array} source 需要清空的數組.
	 * @author berg
	 */
	baidu.array.empty = function(source) {
	    source.length = 0;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷一個數組中是否所有元素都滿足給定條件
	 * @name baidu.array.every
	 * @function
	 * @grammar baidu.array.every(source, iterator[,thisObject])
	 * @param {Array} source 需要判斷的數組.
	 * @param {Function} iterator 判斷函數.
	 * @param {Object} [thisObject] 函數調用時的this指針，如果沒有此參數，默認是當前遍歷的數組
	 * @return {boolean} 判斷結果.
	 * @see baidu.array.some
	 */
	baidu.array.every = function(source, iterator, thisObject) {
	    var i = 0,
	        len = source.length;
	    for (; i < len; i++) {
	        if (i in source && !iterator.call(thisObject || source, source[i], i)) {
	            return false;
	        }
	    }
	    return true;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 從數組中篩選符合條件的元素
	 * @name baidu.array.filter
	 * @function
	 * @grammar baidu.array.filter(source, iterator[, thisObject])
	 * @param {Array} source 需要篩選的數組
	 * @param {Function} iterator 對每個數組元素進行篩選的函數，該函數有兩個參數，第一個為數組元素，第二個為數組索引值，function (item, index)，函數需要返回true或false
	 * @param {Object} [thisObject] 函數調用時的this指針，如果沒有此參數，默認是當前遍歷的數組
	 * @meta standard
	 * @see baidu.array.find
	 *             
	 * @returns {Array} 符合條件的數組項集合
	 */

	baidu.array.filter = function (source, iterator, thisObject) {
	    var result = [],
	        resultIndex = 0,
	        len = source.length,
	        item,
	        i;
	    
	    if ('function' == typeof iterator) {
	        for (i = 0; i < len; i++) {
	            item = source[i];
	            //TODO
	            //和標準不符，see array.each
	            if (true === iterator.call(thisObject || source, item, i)) {
	                // resultIndex用於優化對result.length的多次讀取
	                result[resultIndex++] = item;
	            }
	        }
	    }
	    
	    return result;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/array/find.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 從數組中尋找符合條件的第一個元素
	 * @name baidu.array.find
	 * @function
	 * @grammar baidu.array.find(source, iterator)
	 * @param {Array} source 需要查找的數組
	 * @param {Function} iterator 對每個數組元素進行查找的函數，該函數有兩個參數，第一個為數組元素，第二個為數組索引值，function (item, index)，函數需要返回true或false
	 * @see baidu.array.filter,baidu.array.indexOf
	 *             
	 * @returns {Any|null} 符合條件的第一個元素，找不到時返回null
	 */
	baidu.array.find = function (source, iterator) {
	    var item, i, len = source.length;
	    
	    if ('function' == typeof iterator) {
	        for (i = 0; i < len; i++) {
	            item = source[i];
	            if (true === iterator.call(source, item, i)) {
	                return item;
	            }
	        }
	    }
	    
	    return null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 將兩個數組參數合並成一個類似hashMap結構的對象，這個對象使用第一個數組做為key，使用第二個數組做為值，如果第二個參數未指定，則把對象的所有值置為true。
	 * @name baidu.array.hash
	 * @function
	 * @grammar baidu.array.hash(keys[, values])
	 * @param {Array} keys 作為key的數組
	 * @param {Array} [values] 作為value的數組，未指定此參數時，默認值將對象的值都設為true。
	 *             
	 * @returns {Object} 合並後的對象{key : value}
	 */
	baidu.array.hash = function(keys, values) {
	    var o = {}, vl = values && values.length, i = 0, l = keys.length;
	    for (; i < l; i++) {
	        o[keys[i]] = (vl && vl > i) ? values[i] : true;
	    }
	    return o;
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/array/lastIndexOf.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/14
	 */



	/**
	 * 從後往前，查詢數組中指定元素的索引位置
	 * @name baidu.array.lastIndexOf
	 * @function
	 * @grammar baidu.array.lastIndexOf(source, match)
	 * @param {Array} source 需要查詢的數組
	 * @param {Any} match 查詢項
	 * @param {number} [fromIndex] 查詢的起始位索引位置，如果為負數，則從source.length+fromIndex往前開始查找
	 * @see baidu.array.indexOf
	 *             
	 * @returns {number} 指定元素的索引位置，查詢不到時返回-1
	 */

	baidu.array.lastIndexOf = function (source, match, fromIndex) {
	    var len = source.length;

	    fromIndex = fromIndex | 0;

	    if(!fromIndex || fromIndex >= len){
	        fromIndex = len - 1;
	    }
	    if(fromIndex < 0){
	        fromIndex += len;
	    }
	    for(; fromIndex >= 0; fromIndex --){
	        if(fromIndex in source && source[fromIndex] === match){
	            return fromIndex;
	        }
	    }
	    
	    return -1;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 遍歷數組中所有元素，將每一個元素應用方法進行轉換，並返回轉換後的新數組。
	 * @name baidu.array.map
	 * @function
	 * @grammar baidu.array.map(source, iterator[, thisObject])
	 * @param {Array}    source   需要遍歷的數組.
	 * @param {Function} iterator 對每個數組元素進行處理的函數.
	 * @param {Object} [thisObject] 函數調用時的this指針，如果沒有此參數，默認是當前遍歷的數組
	 * @return {Array} map後的數組.
	 * @see baidu.array.reduce
	 */
	baidu.array.map = function(source, iterator, thisObject) {
	    var results = [],
	        i = 0,
	        l = source.length;
	    for (; i < l; i++) {
	        results[i] = iterator.call(thisObject || source, source[i], i);
	    }
	    return results;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 遍歷數組中所有元素，將每一個元素應用方法進行合並，並返回合並後的結果。
	 * @name baidu.array.reduce
	 * @function
	 * @grammar baidu.array.reduce(source, iterator[, initializer])
	 * @param {Array}    source 需要遍歷的數組.
	 * @param {Function} iterator 對每個數組元素進行處理的函數，函數接受四個參數：上一次reduce的結果（或初始值），當前元素值，索引值，整個數組.
	 * @param {Object}   [initializer] 合並的初始項，如果沒有此參數，默認用數組中的第一個值作為初始值.
	 * @return {Array} reduce後的值.
	 * @version 1.3.4
	 * @see baidu.array.reduce
	 */
	baidu.array.reduce = function(source, iterator, initializer) {
	    var i = 0,
	        l = source.length,
	        found = 0;

	    if( arguments.length < 3){
	        //沒有initializer的情況，找到第一個可用的值
	        for(; i < l; i++){
	            initializer = source[i++];
	            found = 1;
	            break;
	        }
	        if(!found){
	            return ;
	        }
	    }

	    for (; i < l; i++) {
	        if( i in source){
	            initializer = iterator(initializer, source[i] , i , source);
	        }
	    }
	    return initializer;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/array/remove.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/30
	 */



	/**
	 * 移除數組中的項
	 * @name baidu.array.remove
	 * @function
	 * @grammar baidu.array.remove(source, match)
	 * @param {Array} source 需要移除項的數組
	 * @param {Any} match 要移除的項
	 * @meta standard
	 * @see baidu.array.removeAt
	 *             
	 * @returns {Array} 移除後的數組
	 */
	baidu.array.remove = function (source, match) {
	    var len = source.length;
	        
	    while (len--) {
	        if (len in source && source[len] === match) {
	            source.splice(len, 1);
	        }
	    }
	    return source;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/array/removeAt.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/30
	 */



	/**
	 * 移除數組中的項
	 * @name baidu.array.removeAt
	 * @function
	 * @grammar baidu.array.removeAt(source, index)
	 * @param {Array} source 需要移除項的數組
	 * @param {number} index 要移除項的索引位置
	 * @see baidu.array.remove
	 * @meta standard
	 * @returns {Any} 被移除的數組項
	 */
	baidu.array.removeAt = function (source, index) {
	    return source.splice(index, 1)[0];
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷一個數組中是否有部分元素滿足給定條件
	 * @name baidu.array.some
	 * @function
	 * @grammar baidu.array.some(source, iterator[,thisObject])
	 * @param {Array} source 需要判斷的數組.
	 * @param {Function} iterator 判斷函數.
	 * @param {Object} [thisObject] 函數調用時的this指針，如果沒有此參數，默認是當前遍歷的數組
	 * @return {boolean} 判斷結果.
	 * @see baidu.array.every
	 */
	baidu.array.some = function(source, iterator, thisObject) {
	    var i = 0,
	        len = source.length;
	    for (; i < len; i++) {
	        if (i in source && iterator.call(thisObject || source, source[i], i)) {
	            return true;
	        }
	    }
	    return false;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/array/unique.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 過濾數組中的相同項。如果兩個元素相同，會刪除後一個元素。
	 * @name baidu.array.unique
	 * @function
	 * @grammar baidu.array.unique(source[, compareFn])
	 * @param {Array} source 需要過濾相同項的數組
	 * @param {Function} [compareFn] 比較兩個數組項是否相同的函數,兩個數組項作為函數的參數。
	 *             
	 * @returns {Array} 過濾後的新數組
	 */
	baidu.array.unique = function (source, compareFn) {
	    var len = source.length,
	        result = source.slice(0),
	        i, datum;
	        
	    if ('function' != typeof compareFn) {
	        compareFn = function (item1, item2) {
	            return item1 === item2;
	        };
	    }
	    
	    // 從後往前雙重循環比較
	    // 如果兩個元素相同，刪除後一個
	    while (--len > 0) {
	        datum = result[len];
	        i = len;
	        while (i--) {
	            if (compareFn(datum, result[i])) {
	                result.splice(len, 1);
	                break;
	            }
	        }
	    }

	    return result;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */


	/**
	 * @namespace baidu.async 對異步調用的封裝。
	 * @author rocy
	 */
	baidu.async = baidu.async || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/object.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */


	/**
	 * @namespace baidu.object 操作原生對象的方法。
	 */
	baidu.object = baidu.object || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 將源對象的所有屬性拷貝到目標對象中
	 * @author erik
	 * @name baidu.object.extend
	 * @function
	 * @grammar baidu.object.extend(target, source)
	 * @param {Object} target 目標對象
	 * @param {Object} source 源對象
	 * @see baidu.array.merge
	 * @remark
	 * 
	1.目標對象中，與源對象key相同的成員將會被覆蓋。<br>
	2.源對象的prototype成員不會拷貝。
			
	 * @shortcut extend
	 * @meta standard
	 *             
	 * @returns {Object} 目標對象
	 */
	baidu.extend =
	baidu.object.extend = function (target, source) {
	    for (var p in source) {
	        if (source.hasOwnProperty(p)) {
	            target[p] = source[p];
	        }
	    }
	    
	    return target;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */


	/**
	 * @namespace baidu.lang 對語言層面的封裝，包括類型判斷、模塊擴展、繼承基類以及對象自定義事件的支持。
	*/
	baidu.lang = baidu.lang || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/isFunction.js
	 * author: rocy
	 * version: 1.1.2
	 * date: 2010/06/12
	 */



	/**
	 * 判斷目標參數是否為function或Function實例
	 * @name baidu.lang.isFunction
	 * @function
	 * @grammar baidu.lang.isFunction(source)
	 * @param {Any} source 目標參數
	 * @version 1.2
	 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
	 * @meta standard
	 * @returns {boolean} 類型判斷結果
	 */
	baidu.lang.isFunction = function (source) {
	    // chrome下,'function' == typeof /a/ 為true.
	    return '[object Function]' == Object.prototype.toString.call(source);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷給定object是否包含Deferred主要特征.
	 * @param {Object} obj 待判定object.
	 * @return {Boolean} 判定結果, true 則該object符合Deferred特征.
	 * @private 
	 * @author rocy
	 */
	baidu.async._isDeferred = function(obj) {
	    var isFn = baidu.lang.isFunction;
	    return obj && isFn(obj.success) && isFn(obj.then)
	        && isFn(obj.fail) && isFn(obj.cancel);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */






	/**
	 * 用於支持異步處理, 使同步異步的調用風格統一.
	 * @class
	 * @private
	 * @grammar new baidu.async.Deferred()
	 * @remark
	 * 示例:
	    function someAsync(){
	        var deferred = new baidu.async.Deferred();
	        setTimeout(function(){
	            afterSomeOperation();
	            if(someReason){
	                deferred.resolve(someValue);
	            } else {
	                deferred.reject(someError);
	            }
	        },100);
	        return deferred;
	    }
	    //用類似同步的方式調用異步操作.
	    someAsync().then(onSuccess, onFail);
	    //onSuccess或onFail可以確保在正確的時間點執行.

	 * @author rocy
	 */
	baidu.async.Deferred = function() {
	    var me = this;
	    baidu.extend(me, {
	        _fired: 0,
	        _firing: 0,
	        _cancelled: 0,
	        _resolveChain: [],
	        _rejectChain: [],
	        _result: [],
	        _isError: 0
	    });

	    function fire() {
	        if (me._cancelled || me._firing) {
	            return;
	        }
	        //如果已有nextDeferred對象,則轉移到nextDeferred上.
	        if (me._nextDeferred) {
	            me._nextDeferred.then(me._resolveChain[0], me._rejectChain[0]);
	            return;
	        }
	        me._firing = 1;
	        var chain = me._isError ? me._rejectChain : me._resolveChain,
	            result = me._result[me._isError ? 1 : 0];
	        // 此處使用while而非for循環,是為了避免firing時插入新函數.
	        while (chain[0] && (! me._cancelled)) {
	            //所有函數僅調用一次.
	            //TODO: 支持傳入 this 和 arguments, 而不是僅僅一個值.
	            try {
	                var chainResult = chain.shift().call(me, result);
	                //若方法返回Deferred,則將剩余方法延至Deferred中執行
	                if (baidu.async._isDeferred(chainResult)) {
	                    me._nextDeferred = chainResult;
	                    [].push.apply(chainResult._resolveChain, me._resolveChain);
	                    [].push.apply(chainResult._rejectChain, me._rejectChain);
	                    chain = me._resolveChain = [];
	                    me._rejectChain = [];
	                }
	            } catch (error) {
	                throw error;
	            } finally {
	                me._fired = 1;
	                me._firing = 0;
	            }
	        }
	    }


	    /**
	     * 調用onSuccess鏈.使用給定的value作為函數參數.
	     * @param {*} value 成功結果.
	     * @return {baidu.async.Deferred} this.
	     */
	    me.resolve = me.fireSuccess = function(value) {
	        me._result[0] = value;
	        fire();
	        return me;
	    };

	    /**
	     * 調用onFail鏈. 使用給定的error作為函數參數.
	     * @param {Error} error 失敗原因.
	     * @return {baidu.async.Deferred} this.
	     */
	    me.reject = me.fireFail = function(error) {
	        me._result[1] = error;
	        me._isError = 1;
	        fire();
	        return me;
	    };

	    /**
	     * 添加onSuccess和onFail方法到各自的鏈上. 如果該deferred已觸發,則立即執行.
	     * @param {Function} onSuccess 該deferred成功時的回調函數.第一個形參為成功時結果.
	     * @param {Function} onFail 該deferred失敗時的回調函數.第一個形參為失敗時結果.
	     * @return {baidu.async.Deferred} this.
	     */
	    me.then = function(onSuccess, onFail) {
	        me._resolveChain.push(onSuccess);
	        me._rejectChain.push(onFail);
	        if (me._fired) {
	            fire();
	        }
	        return me;
	    };
	    
	    /**
	     * 添加方法到onSuccess鏈上. 如果該deferred已觸發,則立即執行.
	     * @param {Function} onSuccess 該deferred成功時的回調函數.第一個形參為成功時結果.
	     * @return {baidu.async.Deferred} this.
	     */
	    me.success = function(onSuccess) {
	        return me.then(onSuccess, baidu.fn.blank);
	    };

	    /**
	     * 添加方法到onFail鏈上. 如果該deferred已觸發,則立即執行.
	     * @param {Function} onFail 該deferred失敗時的回調函數.第一個形參為失敗時結果.
	     * @return {baidu.async.Deferred} this.
	     */
	    me.fail = function(onFail) {
	        return me.then(baidu.fn.blank, onFail);
	    };
	     
	    /**
	     * 中斷該deferred, 使其失效.
	     */
	    me.cancel = function() {
	        me._cancelled = 1;
	    };
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */




	/**
	 * 支持異步的ajax.get封裝.
	 * @param {String} url 請求地址.
	 * @version 1.3.9 
	 * @return {baidu.async.Deferred} Deferred對象,支持鏈式調用.
	 */
	baidu.async.get = function(url){
	    var deferred = new baidu.async.Deferred();
	    baidu.ajax.request(url, {
	        onsuccess: function(xhr, responseText) {
	            deferred.resolve({xhr: xhr, responseText: responseText}); 
	        },
	        onfailure: function(xhr) {
	            deferred.reject({xhr: xhr});
	        }
	    });
	    return deferred;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */




	/**
	 * 支持異步的ajax.post封裝.
	 * @param {String} url 請求地址.
	 * @param {String} data 請求數據.
	 * @version 1.3.9 
	 * @return {baidu.async.Deferred} Deferred對象,支持鏈式調用.
	 */
	baidu.async.post = function(url, data){
	    var deferred = new baidu.async.Deferred();
	    baidu.ajax.request(url, {
	        method: 'POST',
	        data: data,
	        onsuccess: function(xhr, responseText) {
	            deferred.resolve({xhr: xhr, responseText: responseText}); 
	        },
	        onfailure: function(xhr) {
	            deferred.reject({xhr: xhr});
	        }
	    });
	    return deferred;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */




	/**
	 * 保證onResolve或onReject可以按序執行. 若第一個參數為deferred,則deferred完成後執行.否則立即執行onResolve,並傳入第一個參數.
	 * @param {baidu.async.Deferred|*} deferredOrValue deferred實例或任意值.
	 * @param {Function} onResolve 成功時的回調函數.若第一個參數不是Deferred實例,則立即執行此方法.
	 * @param {Function} onReject 失敗時的回調函數.
	 * @version 1.3.9 
	 * @remark
	 * 示例一:異步調用: baidu.async.when(asyncLoad(), onResolve, onReject).then(nextSuccess, nextFail);
	 * 示例二:同步異步不確定的調用: baidu.async.when(syncOrNot(), onResolve, onReject).then(nextSuccess, nextFail);
	 * 示例三:同步接異步的調用: baidu.async.when(sync(), onResolve, onReject).then(asyncSuccess, asyncFail).then(afterAllSuccess, afterAllFail);
	 * @return {baidu.async.Deferred} deferred.
	 */
	baidu.async.when = function(deferredOrValue, onResolve, onReject) {
	    if (baidu.async._isDeferred(deferredOrValue)) {
	        deferredOrValue.then(onResolve, onReject);
	        return deferredOrValue;
	    }
	    var deferred = new baidu.async.Deferred();
	    deferred.then(onResolve, onReject).resolve(deferredOrValue);
	    return deferred;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * @namespace baidu.browser 判斷瀏覽器類型和特性的屬性。
	 */
	baidu.browser = baidu.browser || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/chrome.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/24
	 */


	if (/chrome\/(\d+\.\d)/i.test(navigator.userAgent)) {
	/**
	 * 判斷是否為chrome瀏覽器
	 * @grammar baidu.browser.chrome
	 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.opera   
	 * @property chrome chrome版本號
	 */
	    baidu.browser.chrome = + RegExp['\x241'];
	}
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/firefox.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	if (/firefox\/(\d+\.\d)/i.test(navigator.userAgent)) {
	/**
	 * 判斷是否為firefox瀏覽器
	 * @property firefox firefox版本號
	 * @grammar baidu.browser.firefox
	 * @meta standard
	 * @see baidu.browser.ie,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome   
	 */
	    baidu.browser.firefox = + RegExp['\x241'];
	}
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/ie.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/23
	 */


	if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
	    //IE 8下，以documentMode為準
	    //在百度模板中，可能會有$，防止沖突，將$1 寫成 \x241
	/**
	 * 判斷是否為ie瀏覽器
	 * @property ie ie版本號
	 * @grammar baidu.browser.ie
	 * @meta standard
	 * @shortcut ie
	 * @see baidu.browser.firefox,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome,baidu.browser.maxthon 
	 */
	   baidu.browser.ie = baidu.ie = document.documentMode || + RegExp['\x241'];
	}
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/isGecko.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	/**
	 * 判斷是否為gecko內核
	 * @property isGecko 
	 * @grammar baidu.browser.isGecko
	 * @meta standard
	 * @see baidu.browser.isWebkit
	 */
	baidu.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/isStrict.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	/**
	 * 判斷是否嚴格標準的渲染模式
	 * @property isStrict 
	 * @grammar baidu.browser.isStrict
	 * @meta standard
	 */
	baidu.browser.isStrict = document.compatMode == "CSS1Compat";
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/isWebkit.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	/**
	 * 判斷是否為webkit內核
	 * @property isWebkit 
	 * @grammar baidu.browser.isWebkit
	 * @meta standard
	 * @see baidu.browser.isGecko
	 */
	baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/maxthon.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	try {
	    if (/(\d+\.\d)/.test(external.max_version)) {
	/**
	 * 判斷是否為maxthon瀏覽器
	 * @property maxthon maxthon版本號
	 * @grammar baidu.browser.maxthon
	 * @see baidu.browser.ie  
	 */
	        baidu.browser.maxthon = + RegExp['\x241'];
	    }
	} catch (e) {}
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/opera.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
	/**
	 * 判斷是否為opera瀏覽器
	 * @property opera opera版本號
	 * @grammar baidu.browser.opera
	 * @meta standard
	 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.chrome 
	 */
	    baidu.browser.opera = + RegExp['\x241'];
	}
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/browser/safari.js
	 * author: allstar, rocy
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	(function(){
	    var ua = navigator.userAgent;
	    /*
	     * 兼容瀏覽器為safari或ipad,其中,一段典型的ipad UA 如下:
	     * Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10
	     */
	    if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua)){
	        /**
	         * 判斷是否為safari瀏覽器, 支持ipad
	         * @property safari safari版本號
	         * @grammar baidu.browser.safari
	         * @meta standard
	         * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.opera,baidu.browser.chrome   
	         */
	    	baidu.browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
	    }
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/cookie.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */


	/**
	 * @namespace baidu.cookie 操作cookie的方法。
	 */
	baidu.cookie = baidu.cookie || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/cookie/_isValidKey.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 驗證字符串是否合法的cookie鍵名
	 * 
	 * @param {string} source 需要遍歷的數組
	 * @meta standard
	 * @return {boolean} 是否合法的cookie鍵名
	 */
	baidu.cookie._isValidKey = function (key) {
	    // http://www.w3.org/Protocols/rfc2109/rfc2109
	    // Syntax:  General
	    // The two state management headers, Set-Cookie and Cookie, have common
	    // syntactic properties involving attribute-value pairs.  The following
	    // grammar uses the notation, and tokens DIGIT (decimal digits) and
	    // token (informally, a sequence of non-special, non-white space
	    // characters) from the HTTP/1.1 specification [RFC 2068] to describe
	    // their syntax.
	    // av-pairs   = av-pair *(";" av-pair)
	    // av-pair    = attr ["=" value] ; optional value
	    // attr       = token
	    // value      = word
	    // word       = token | quoted-string
	    
	    // http://www.ietf.org/rfc/rfc2068.txt
	    // token      = 1*<any CHAR except CTLs or tspecials>
	    // CHAR       = <any US-ASCII character (octets 0 - 127)>
	    // CTL        = <any US-ASCII control character
	    //              (octets 0 - 31) and DEL (127)>
	    // tspecials  = "(" | ")" | "<" | ">" | "@"
	    //              | "," | ";" | ":" | "\" | <">
	    //              | "/" | "[" | "]" | "?" | "="
	    //              | "{" | "}" | SP | HT
	    // SP         = <US-ASCII SP, space (32)>
	    // HT         = <US-ASCII HT, horizontal-tab (9)>
	        
	    return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/cookie/getRaw.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 獲取cookie的值，不對值進行解碼
	 * @name baidu.cookie.getRaw
	 * @function
	 * @grammar baidu.cookie.getRaw(key)
	 * @param {string} key 需要獲取Cookie的鍵名
	 * @meta standard
	 * @see baidu.cookie.get,baidu.cookie.setRaw
	 *             
	 * @returns {string|null} 獲取的Cookie值，獲取不到時返回null
	 */
	baidu.cookie.getRaw = function (key) {
	    if (baidu.cookie._isValidKey(key)) {
	        var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
	            result = reg.exec(document.cookie);
	            
	        if (result) {
	            return result[2] || null;
	        }
	    }

	    return null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/cookie/get.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 獲取cookie的值，用decodeURIComponent進行解碼
	 * @name baidu.cookie.get
	 * @function
	 * @grammar baidu.cookie.get(key)
	 * @param {string} key 需要獲取Cookie的鍵名
	 * @remark
	 * <b>注意：</b>該方法會對cookie值進行decodeURIComponent解碼。如果想獲得cookie源字符串，請使用getRaw方法。
	 * @meta standard
	 * @see baidu.cookie.getRaw,baidu.cookie.set
	 *             
	 * @returns {string|null} cookie的值，獲取不到時返回null
	 */
	baidu.cookie.get = function (key) {
	    var value = baidu.cookie.getRaw(key);
	    if ('string' == typeof value) {
	        value = decodeURIComponent(value);
	        return value;
	    }
	    return null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/cookie/setRaw.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 設置cookie的值，不對值進行編碼
	 * @name baidu.cookie.setRaw
	 * @function
	 * @grammar baidu.cookie.setRaw(key, value[, options])
	 * @param {string} key 需要設置Cookie的鍵名
	 * @param {string} value 需要設置Cookie的值
	 * @param {Object} [options] 設置Cookie的其他可選參數
	 * @config {string} [path] cookie路徑
	 * @config {Date|number} [expires] cookie過期時間,如果類型是數字的話, 單位是毫秒
	 * @config {string} [domain] cookie域名
	 * @config {string} [secure] cookie是否安全傳輸
	 * @remark
	 * 
	<b>options參數包括：</b><br>
	path:cookie路徑<br>
	expires:cookie過期時間，Number型，單位為毫秒。<br>
	domain:cookie域名<br>
	secure:cookie是否安全傳輸
			
	 * @meta standard
	 * @see baidu.cookie.set,baidu.cookie.getRaw
	 */
	baidu.cookie.setRaw = function (key, value, options) {
	    if (!baidu.cookie._isValidKey(key)) {
	        return;
	    }
	    
	    options = options || {};
	    //options.path = options.path || "/"; // meizz 20100402 設定一個初始值，方便後續的操作
	    //berg 20100409 去掉，因為用戶希望默認的path是當前路徑，這樣和瀏覽器對cookie的定義也是一致的
	    
	    // 計算cookie過期時間
	    var expires = options.expires;
	    if ('number' == typeof options.expires) {
	        expires = new Date();
	        expires.setTime(expires.getTime() + options.expires);
	    }
	    
	    document.cookie =
	        key + "=" + value
	        + (options.path ? "; path=" + options.path : "")
	        + (expires ? "; expires=" + expires.toGMTString() : "")
	        + (options.domain ? "; domain=" + options.domain : "")
	        + (options.secure ? "; secure" : ''); 
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/cookie/remove.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 刪除cookie的值
	 * @name baidu.cookie.remove
	 * @function
	 * @grammar baidu.cookie.remove(key, options)
	 * @param {string} key 需要刪除Cookie的鍵名
	 * @param {Object} options 需要刪除的cookie對應的 path domain 等值
	 * @meta standard
	 */
	baidu.cookie.remove = function (key, options) {
	    options = options || {};
	    options.expires = new Date(0);
	    baidu.cookie.setRaw(key, '', options);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/cookie/set.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 設置cookie的值，用encodeURIComponent進行編碼
	 * @name baidu.cookie.set
	 * @function
	 * @grammar baidu.cookie.set(key, value[, options])
	 * @param {string} key 需要設置Cookie的鍵名
	 * @param {string} value 需要設置Cookie的值
	 * @param {Object} [options] 設置Cookie的其他可選參數
	 * @config {string} [path] cookie路徑
	 * @config {Date|number} [expires] cookie過期時間,如果類型是數字的話, 單位是毫秒
	 * @config {string} [domain] cookie域名
	 * @config {string} [secure] cookie是否安全傳輸
	 * @remark
	 * 
	1. <b>注意：</b>該方法會對cookie值進行encodeURIComponent編碼。如果想設置cookie源字符串，請使用setRaw方法。<br><br>
	2. <b>options參數包括：</b><br>
	path:cookie路徑<br>
	expires:cookie過期時間，Number型，單位為毫秒。<br>
	domain:cookie域名<br>
	secure:cookie是否安全傳輸
			
	 * @meta standard
	 * @see baidu.cookie.setRaw,baidu.cookie.get
	 */
	baidu.cookie.set = function (key, value, options) {
	    baidu.cookie.setRaw(key, encodeURIComponent(value), options);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/date.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/04
	 */


	/**
	 * @namespace baidu.date 操作日期的方法。
	 */
	baidu.date = baidu.date || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/number.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/2
	 */


	/**
	 * @namespace baidu.number 操作number的方法。
	 */
	baidu.number = baidu.number || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/number/pad.js
	 * author: dron, erik, berg
	 * version: 1.1.0
	 * date: 20100412
	 */



	/**
	 * 對目標數字進行0補齊處理
	 * @name baidu.number.pad
	 * @function
	 * @grammar baidu.number.pad(source, length)
	 * @param {number} source 需要處理的數字
	 * @param {number} length 需要輸出的長度
	 *             
	 * @returns {string} 對目標數字進行0補齊處理後的結果
	 */
	baidu.number.pad = function (source, length) {
	    var pre = "",
	        negative = (source < 0),
	        string = String(Math.abs(source));

	    if (string.length < length) {
	        pre = (new Array(length - string.length + 1)).join('0');
	    }

	    return (negative ?  "-" : "") + pre + string;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/date/format.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/04
	 */




	/**
	 * 對目標日期對象進行格式化
	 * @name baidu.date.format
	 * @function
	 * @grammar baidu.date.format(source, pattern)
	 * @param {Date} source 目標日期對象
	 * @param {string} pattern 日期格式化規則
	 * @remark
	 * 
	<b>格式表達式，變量含義：</b><br><br>
	hh: 帶 0 補齊的兩位 12 進制時表示<br>
	h: 不帶 0 補齊的 12 進制時表示<br>
	HH: 帶 0 補齊的兩位 24 進制時表示<br>
	H: 不帶 0 補齊的 24 進制時表示<br>
	mm: 帶 0 補齊兩位分表示<br>
	m: 不帶 0 補齊分表示<br>
	ss: 帶 0 補齊兩位秒表示<br>
	s: 不帶 0 補齊秒表示<br>
	yyyy: 帶 0 補齊的四位年表示<br>
	yy: 帶 0 補齊的兩位年表示<br>
	MM: 帶 0 補齊的兩位月表示<br>
	M: 不帶 0 補齊的月表示<br>
	dd: 帶 0 補齊的兩位日表示<br>
	d: 不帶 0 補齊的日表示
			
	 *             
	 * @returns {string} 格式化後的字符串
	 */

	baidu.date.format = function (source, pattern) {
	    if ('string' != typeof pattern) {
	        return source.toString();
	    }

	    function replacer(patternPart, result) {
	        pattern = pattern.replace(patternPart, result);
	    }
	    
	    var pad     = baidu.number.pad,
	        year    = source.getFullYear(),
	        month   = source.getMonth() + 1,
	        date2   = source.getDate(),
	        hours   = source.getHours(),
	        minutes = source.getMinutes(),
	        seconds = source.getSeconds();

	    replacer(/yyyy/g, pad(year, 4));
	    replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
	    replacer(/MM/g, pad(month, 2));
	    replacer(/M/g, month);
	    replacer(/dd/g, pad(date2, 2));
	    replacer(/d/g, date2);

	    replacer(/HH/g, pad(hours, 2));
	    replacer(/H/g, hours);
	    replacer(/hh/g, pad(hours % 12, 2));
	    replacer(/h/g, hours % 12);
	    replacer(/mm/g, pad(minutes, 2));
	    replacer(/m/g, minutes);
	    replacer(/ss/g, pad(seconds, 2));
	    replacer(/s/g, seconds);

	    return pattern;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/date/parse.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/04
	 */



	/**
	 * 將目標字符串轉換成日期對象
	 * @name baidu.date.parse
	 * @function
	 * @grammar baidu.date.parse(source)
	 * @param {string} source 目標字符串
	 * @remark
	 * 
	對於目標字符串，下面這些規則決定了 parse 方法能夠成功地解析： <br>
	<ol>
	<li>短日期可以使用“/”或“-”作為日期分隔符，但是必須用月/日/年的格式來表示，例如"7/20/96"。</li>
	<li>以 "July 10 1995" 形式表示的長日期中的年、月、日可以按任何順序排列，年份值可以用 2 位數字表示也可以用 4 位數字表示。如果使用 2 位數字來表示年份，那麽該年份必須大於或等於 70。 </li>
	<li>括號中的任何文本都被視為注釋。這些括號可以嵌套使用。 </li>
	<li>逗號和空格被視為分隔符。允許使用多個分隔符。 </li>
	<li>月和日的名稱必須具有兩個或兩個以上的字符。如果兩個字符所組成的名稱不是獨一無二的，那麽該名稱就被解析成最後一個符合條件的月或日。例如，"Ju" 被解釋為七月而不是六月。 </li>
	<li>在所提供的日期中，如果所指定的星期幾的值與按照該日期中剩余部分所確定的星期幾的值不符合，那麽該指定值就會被忽略。例如，盡管 1996 年 11 月 9 日實際上是星期五，"Tuesday November 9 1996" 也還是可以被接受並進行解析的。但是結果 date 對象中包含的是 "Friday November 9 1996"。 </li>
	<li>JScript 處理所有的標準時區，以及全球標準時間 (UTC) 和格林威治標準時間 (GMT)。</li> 
	<li>小時、分鐘、和秒鐘之間用冒號分隔，盡管不是這三項都需要指明。"10:"、"10:11"、和 "10:11:12" 都是有效的。 </li>
	<li>如果使用 24 小時計時的時鐘，那麽為中午 12 點之後的時間指定 "PM" 是錯誤的。例如 "23:15 PM" 就是錯誤的。</li> 
	<li>包含無效日期的字符串是錯誤的。例如，一個包含有兩個年份或兩個月份的字符串就是錯誤的。</li>
	</ol>
			
	 *             
	 * @returns {Date} 轉換後的日期對象
	 */

	baidu.date.parse = function (source) {
	    var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
	    if ('string' == typeof source) {
	        if (reg.test(source) || isNaN(Date.parse(source))) {
	            var d = source.split(/ |T/),
	                d1 = d.length > 1 
	                        ? d[1].split(/[^\d]/) 
	                        : [0, 0, 0],
	                d0 = d[0].split(/[^\d]/);
	            return new Date(d0[0] - 0, 
	                            d0[1] - 1, 
	                            d0[2] - 0, 
	                            d1[0] - 0, 
	                            d1[1] - 0, 
	                            d1[2] - 0);
	        } else {
	            return new Date(source);
	        }
	    }
	    
	    return new Date();
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */


	/**
	 * @namespace baidu.dom 操作dom的方法。
	 */
	baidu.dom = baidu.dom || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/g.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 從文檔中獲取指定的DOM元素
	 * @name baidu.dom.g
	 * @function
	 * @grammar baidu.dom.g(id)
	 * @param {string|HTMLElement} id 元素的id或DOM元素
	 * @shortcut g,T.G
	 * @meta standard
	 * @see baidu.dom.q
	 *             
	 * @returns {HTMLElement|null} 獲取的元素，查找不到時返回null,如果參數不合法，直接返回參數
	 */
	baidu.dom.g = function (id) {
	    if ('string' == typeof id || id instanceof String) {
	        return document.getElementById(id);
	    } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
	        return id;
	    }
	    return null;
	};

	// 聲明快捷方法
	baidu.g = baidu.G = baidu.dom.g;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */


	/**
	 * @namespace baidu.string 操作字符串的方法。
	 */
	baidu.string = baidu.string || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/trim.js
	 * author: dron, erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 刪除目標字符串兩端的空白字符
	 * @name baidu.string.trim
	 * @function
	 * @grammar baidu.string.trim(source)
	 * @param {string} source 目標字符串
	 * @remark
	 * 不支持刪除單側空白字符
	 * @shortcut trim
	 * @meta standard
	 *             
	 * @returns {string} 刪除兩端空白字符後的字符串
	 */

	(function () {
	    var trimer = new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g");
	    
	    baidu.string.trim = function (source) {
	        return String(source)
	                .replace(trimer, "");
	    };
	})();

	// 聲明快捷方法
	baidu.trim = baidu.string.trim;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All right reserved.
	 * 
	 * path: baidu/dom/addClass.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/2
	 */




	/**
	 * 為目標元素添加className
	 * @name baidu.dom.addClass
	 * @function
	 * @grammar baidu.dom.addClass(element, className)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} className 要添加的className，允許同時添加多個class，中間使用空白符分隔
	 * @remark
	 * 使用者應保證提供的className合法性，不應包含不合法字符，className合法字符參考：http://www.w3.org/TR/CSS2/syndata.html。
	 * @shortcut addClass
	 * @meta standard
	 * @see baidu.dom.removeClass
	 * 	
	 * 	            
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.addClass = function (element, className) {
	    element = baidu.dom.g(element);
	    var classArray = className.split(/\s+/),
	        result = element.className,
	        classMatch = " " + result + " ",
	        i = 0,
	        l = classArray.length;

	    for (; i < l; i++){
	         if ( classMatch.indexOf( " " + classArray[i] + " " ) < 0 ) {
	             result += (result ? ' ' : '') + classArray[i];
	         }
	    }

	    element.className = result;
	    return element;
	};

	// 聲明快捷方法
	baidu.addClass = baidu.dom.addClass;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/children.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */




	/**
	 * 獲取目標元素的直接子元素列表
	 * @name baidu.dom.children
	 * @function
	 * @grammar baidu.dom.children(element)
	 * @param {HTMLElement|String} element 目標元素或目標元素的id
	 * @meta standard
	 *             
	 * @returns {Array} 目標元素的子元素列表，沒有子元素時返回空數組
	 */
	baidu.dom.children = function (element) {
	    element = baidu.dom.g(element);

	    for (var children = [], tmpEl = element.firstChild; tmpEl; tmpEl = tmpEl.nextSibling) {
	        if (tmpEl.nodeType == 1) {
	            children.push(tmpEl);
	        }
	    }
	    
	    return children;    
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/isString.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/30
	 */



	/**
	 * 判斷目標參數是否string類型或String對象
	 * @name baidu.lang.isString
	 * @function
	 * @grammar baidu.lang.isString(source)
	 * @param {Any} source 目標參數
	 * @shortcut isString
	 * @meta standard
	 * @see baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
	 *             
	 * @returns {boolean} 類型判斷結果
	 */
	baidu.lang.isString = function (source) {
	    return '[object String]' == Object.prototype.toString.call(source);
	};

	// 聲明快捷方法
	baidu.isString = baidu.lang.isString;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/g.js
	 * author: allstar, erik, berg
	 * version: 1.3
	 * date: 2010-07-07
	 */




	/**
	 * 從文檔中獲取指定的DOM元素
	 * **內部方法**
	 * 
	 * @param {string|HTMLElement} id 元素的id或DOM元素
	 * @meta standard
	 * @return {HTMLElement} DOM元素，如果不存在，返回null，如果參數不合法，直接返回參數
	 */
	baidu.dom._g = function (id) {
	    if (baidu.lang.isString(id)) {
	        return document.getElementById(id);
	    }
	    return id;
	};

	// 聲明快捷方法
	baidu._g = baidu.dom._g;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/contains.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 判斷一個元素是否包含另一個元素
	 * @name baidu.dom.contains
	 * @function
	 * @grammar baidu.dom.contains(container, contained)
	 * @param {HTMLElement|string} container 包含元素或元素的id
	 * @param {HTMLElement|string} contained 被包含元素或元素的id
	 * @meta standard
	 * @see baidu.dom.intersect
	 *             
	 * @returns {boolean} contained元素是否被包含於container元素的DOM節點上
	 */
	baidu.dom.contains = function (container, contained) {

	    var g = baidu.dom._g;
	    container = g(container);
	    contained = g(contained);

	    //fixme: 無法處理文本節點的情況(IE)
	    return container.contains
	        ? container != contained && container.contains(contained)
	        : !!(container.compareDocumentPosition(contained) & 16);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_NAME_ATTRS.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/2
	 */




	/**
	 * 提供給setAttr與getAttr方法作名稱轉換使用
	 * ie6,7下class要轉換成className
	 * @meta standard
	 */

	baidu.dom._NAME_ATTRS = (function () {
	    var result = {
	        'cellpadding': 'cellPadding',
	        'cellspacing': 'cellSpacing',
	        'colspan': 'colSpan',
	        'rowspan': 'rowSpan',
	        'valign': 'vAlign',
	        'usemap': 'useMap',
	        'frameborder': 'frameBorder'
	    };
	    
	    if (baidu.browser.ie < 8) {
	        result['for'] = 'htmlFor';
	        result['class'] = 'className';
	    } else {
	        result['htmlFor'] = 'for';
	        result['className'] = 'class';
	    }
	    
	    return result;
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/setAttr.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */




	/**
	 * 設置目標元素的attribute值
	 * @name baidu.dom.setAttr
	 * @function
	 * @grammar baidu.dom.setAttr(element, key, value)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} key 要設置的attribute鍵名
	 * @param {string} value 要設置的attribute值
	 * @remark
	 * 
	            設置object的自定義屬性時，由於瀏覽器限制，無法設置。
	        
	 * @shortcut setAttr
	 * @meta standard
	 * @see baidu.dom.getAttr,baidu.dom.setAttrs
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.setAttr = function (element, key, value) {
	    element = baidu.dom.g(element);

	    if ('style' == key){
	        element.style.cssText = value;
	    } else {
	        key = baidu.dom._NAME_ATTRS[key] || key;
	        element.setAttribute(key, value);
	    }

	    return element;
	};

	// 聲明快捷方法
	baidu.setAttr = baidu.dom.setAttr;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/setAttrs.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */




	/**
	 * 批量設置目標元素的attribute值
	 * @name baidu.dom.setAttrs
	 * @function
	 * @grammar baidu.dom.setAttrs(element, attributes)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {Object} attributes 要設置的attribute集合
	 * @shortcut setAttrs
	 * @meta standard
	 * @see baidu.dom.setAttr,baidu.dom.getAttr
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.setAttrs = function (element, attributes) {
	    element = baidu.dom.g(element);

	    for (var key in attributes) {
	        baidu.dom.setAttr(element, key, attributes[key]);
	    }

	    return element;
	};

	// 聲明快捷方法
	baidu.setAttrs = baidu.dom.setAttrs;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All right reserved.
	 */


	/**
	 * 創建 Element 對象。
	 * @author berg
	 * @name baidu.dom.create
	 * @function
	 * @grammar baidu.dom.create(tagName[, options])
	 * @param {string} tagName 標簽名稱.
	 * @param {Object} opt_attributes 元素創建時擁有的屬性，如style和className.
	 * @version 1.3
	 * @meta standard
	 * @return {HTMLElement} 創建的 Element 對象
	 */
	baidu.dom.create = function(tagName, opt_attributes) {
	    var el = document.createElement(tagName),
	        attributes = opt_attributes || {};
	    return baidu.dom.setAttrs(el, attributes);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/guid.js
	 * author: meizz
	 * version: 1.1.0
	 * date: 2010/02/04
	 */

	/**
	 * 返回一個當前頁面的唯一標識字符串。
	 * @name baidu.lang.guid
	 * @function
	 * @grammar baidu.lang.guid()
	 * @version 1.1.1
	 * @meta standard
	 *             
	 * @returns {String} 當前頁面的唯一標識字符串
	 */

	(function(){
	    //不直接使用window，可以提高3倍左右性能
	    var guid = window[baidu.guid];

	    baidu.lang.guid = function() {
	        return "TANGRAM__" + (guid._counter ++).toString(36);
	    };

	    guid._counter = guid._counter || 1;
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/_instances.js
	 * author: meizz, erik
	 * version: 1.1.0
	 * date: 2009/12/1
	 */




	/**
	 * 所有類的實例的容器
	 * key為每個實例的guid
	 * @meta standard
	 */

	window[baidu.guid]._instances = window[baidu.guid]._instances || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/Class.js
	 * author: meizz, erik
	 * version: 1.1.0
	 * date: 2009/12/1
	 */





	/**
	 * 
	 * @class  Tangram繼承機制提供的一個基類，用戶可以通過繼承baidu.lang.Class來獲取它的屬性及方法。
	 * @name 	baidu.lang.Class
	 * @grammar baidu.lang.Class(guid)
	 * @param 	{string}	guid	對象的唯一標識
	 * @meta standard
	 * @remark baidu.lang.Class和它的子類的實例均包含一個全局唯一的標識guid。guid是在構造函數中生成的，因此，繼承自baidu.lang.Class的類應該直接或者間接調用它的構造函數。<br>baidu.lang.Class的構造函數中產生guid的方式可以保證guid的唯一性，及每個實例都有一個全局唯一的guid。
	 * @meta standard
	 * @see baidu.lang.inherits,baidu.lang.Event
	 */
	baidu.lang.Class = function(guid) {
	    this.guid = guid || baidu.lang.guid();
	    window[baidu.guid]._instances[this.guid] = this;
	};
	window[baidu.guid]._instances = window[baidu.guid]._instances || {};

	/**
	 * 釋放對象所持有的資源，主要是自定義事件。
	 * @name dispose
	 * @grammar obj.dispose()
	 * TODO: 將_listeners中綁定的事件剔除掉
	 */
	baidu.lang.Class.prototype.dispose = function(){
	    delete window[baidu.guid]._instances[this.guid];

	    for(var property in this){
	        if (!baidu.lang.isFunction(this[property])) {
	            delete this[property];
	        }
	    }
	    this.disposed = true;   // 20100716
	};

	/**
	 * 重載了默認的toString方法，使得返回信息更加準確一些。
	 * @return {string} 對象的String表示形式
	 */
	baidu.lang.Class.prototype.toString = function(){
	    return "[object " + (this._className || "Object" ) + "]";
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/Event.js
	 * author: meizz, erik, berg
	 * version: 1.1.1
	 * date: 2009/11/24
	 * modify: 2010/04/19 berg
	 */






	/**
	 * 
	 * @class   自定義的事件對象。
	 * @name 	baidu.lang.Event
	 * @grammar baidu.lang.Event(type[, target])
	 * @param 	{string} type	 事件類型名稱。為了方便區分事件和一個普通的方法，事件類型名稱必須以"on"(小寫)開頭。
	 * @param 	{Object} [target]觸發事件的對象
	 * @meta standard
	 * @remark 引入該模塊，會自動為Class引入3個事件擴展方法：addEventListener、removeEventListener和dispatchEvent。
	 * @meta standard
	 * @see baidu.lang.Class
	 */
	baidu.lang.Event = function (type, target) {
	    this.type = type;
	    this.returnValue = true;
	    this.target = target || null;
	    this.currentTarget = null;
	};

	/**
	 * 注冊對象的事件監聽器。引入baidu.lang.Event後，Class的子類實例才會獲得該方法。
	 * @grammar obj.addEventListener(type, handler[, key])
	 * @param 	{string}   type         自定義事件的名稱
	 * @param 	{Function} handler      自定義事件被觸發時應該調用的回調函數
	 * @param 	{string}   [key]		為事件監聽函數指定的名稱，可在移除時使用。如果不提供，方法會默認為它生成一個全局唯一的key。
	 * @remark 	事件類型區分大小寫。如果自定義事件名稱不是以小寫"on"開頭，該方法會給它加上"on"再進行判斷，即"click"和"onclick"會被認為是同一種事件。 
	 */
	baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
	    if (!baidu.lang.isFunction(handler)) {
	        return;
	    }

	    !this.__listeners && (this.__listeners = {});

	    var t = this.__listeners, id;
	    if (typeof key == "string" && key) {
	        if (/[^\w\-]/.test(key)) {
	            throw("nonstandard key:" + key);
	        } else {
	            handler.hashCode = key; 
	            id = key;
	        }
	    }
	    type.indexOf("on") != 0 && (type = "on" + type);

	    typeof t[type] != "object" && (t[type] = {});
	    id = id || baidu.lang.guid();
	    handler.hashCode = id;
	    t[type][id] = handler;
	};
	 
	/**
	 * 移除對象的事件監聽器。引入baidu.lang.Event後，Class的子類實例才會獲得該方法。
	 * @grammar obj.removeEventListener(type, handler)
	 * @param {string}   type     事件類型
	 * @param {Function|string} handler  要移除的事件監聽函數或者監聽函數的key
	 * @remark 	如果第二個參數handler沒有被綁定到對應的自定義事件中，什麽也不做。
	 */
	baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
	    if (typeof handler != "undefined") {
	        if ( (baidu.lang.isFunction(handler) && ! (handler = handler.hashCode))
	            || (! baidu.lang.isString(handler))
	        ){
	            return;
	        }
	    }

	    !this.__listeners && (this.__listeners = {});

	    type.indexOf("on") != 0 && (type = "on" + type);

	    var t = this.__listeners;
	    if (!t[type]) {
	        return;
	    }
	    if (typeof handler != "undefined") {
	        t[type][handler] && delete t[type][handler];
	    } else {
	        for(var guid in t[type]){
	            delete t[type][guid];
	        }
	    }
	};

	/**
	 * 派發自定義事件，使得綁定到自定義事件上面的函數都會被執行。引入baidu.lang.Event後，Class的子類實例才會獲得該方法。
	 * @grammar obj.dispatchEvent(event, options)
	 * @param {baidu.lang.Event|String} event 	Event對象，或事件名稱(1.1.1起支持)
	 * @param {Object} 					options 擴展參數,所含屬性鍵值會擴展到Event對象上(1.2起支持)
	 * @remark 處理會調用通過addEventListenr綁定的自定義事件回調函數之外，還會調用直接綁定到對象上面的自定義事件。例如：<br>
	myobj.onMyEvent = function(){}<br>
	myobj.addEventListener("onMyEvent", function(){});
	 */
	baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
	    if (baidu.lang.isString(event)) {
	        event = new baidu.lang.Event(event);
	    }
	    !this.__listeners && (this.__listeners = {});

	    // 20100603 添加本方法的第二個參數，將 options extend到event中去傳遞
	    options = options || {};
	    for (var i in options) {
	        event[i] = options[i];
	    }

	    var i, t = this.__listeners, p = event.type;
	    event.target = event.target || this;
	    event.currentTarget = this;

	    p.indexOf("on") != 0 && (p = "on" + p);

	    baidu.lang.isFunction(this[p]) && this[p].apply(this, arguments);

	    if (typeof t[p] == "object") {
	        for (i in t[p]) {
	            t[p][i].apply(this, arguments);
	        }
	    }
	    return event.returnValue;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/createSingle.js
	 * author: meizz, berg
	 * version: 1.1.2
	 * date: 2010-05-13
	 */





	/**
	 * 創建一個baidu.lang.Class的單例實例
	 * @name baidu.lang.createSingle
	 * @function
	 * @grammar baidu.lang.createSingle(json)
	 * @param {Object} json 直接掛載到這個單例里的預定屬性/方法
	 * @version 1.2
	 * @see baidu.lang.Class
	 *             
	 * @returns {Object} 一個實例
	 */
	baidu.lang.createSingle = function (json) {
	    var c = new baidu.lang.Class();

	    for (var key in json) {
	        c[key] = json[key];
	    }
	    return c;
	};

	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/dragManager.js
	 * author: rocy
	 * version: 1.4.0
	 * date: 2010/10/14
	 */



	/**
	 * 拖曳管理器
	 * @function
	 * @param   {HTMLElement|ID}    element 被拖曳的元素
	 * @param   {JSON}              options 拖曳配置項 {toggle, autoStop, interval, capture, range, ondragstart, ondragend, ondrag}
	 * @return {DOMElement}                 可拖拽的元素
	 */
	baidu.dom.ddManager = baidu.lang.createSingle({
		_targetsDroppingOver:{}
	});
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/getDocument.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 獲取目標元素所屬的document對象
	 * @name baidu.dom.getDocument
	 * @function
	 * @grammar baidu.dom.getDocument(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @meta standard
	 * @see baidu.dom.getWindow
	 *             
	 * @returns {HTMLDocument} 目標元素所屬的document對象
	 */
	baidu.dom.getDocument = function (element) {
	    element = baidu.dom.g(element);
	    return element.nodeType == 9 ? element : element.ownerDocument || element.document;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */





	/**
	 * 獲取目標元素的computed style值。如果元素的樣式值不能被瀏覽器計算，則會返回空字符串（IE）
	 *
	 * @author berg
	 * @name baidu.dom.getComputedStyle
	 * @function
	 * @grammar baidu.dom.getComputedStyle(element, key)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} key 要獲取的樣式名
	 *
	 * @see baidu.dom.getStyle
	 *             
	 * @returns {string} 目標元素的computed style值
	 */

	baidu.dom.getComputedStyle = function(element, key){
	    element = baidu.dom._g(element);
	    var doc = baidu.dom.getDocument(element),
	        styles;
	    if (doc.defaultView && doc.defaultView.getComputedStyle) {
	        styles = doc.defaultView.getComputedStyle(element, null);
	        if (styles) {
	            return styles[key] || styles.getPropertyValue(key);
	        }
	    }
	    return ''; 
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_styleFixer.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 提供給setStyle與getStyle使用
	 */
	baidu.dom._styleFixer = baidu.dom._styleFixer || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_styleFilters.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 提供給setStyle與getStyle使用
	 */
	baidu.dom._styleFilter = baidu.dom._styleFilter || [];

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_styleFilter/filter.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 為獲取和設置樣式的過濾器
	 * @private
	 * @meta standard
	 */
	baidu.dom._styleFilter.filter = function (key, value, method) {
	    for (var i = 0, filters = baidu.dom._styleFilter, filter; filter = filters[i]; i++) {
	        if (filter = filter[method]) {
	            value = filter(key, value);
	        }
	    }

	    return value;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/toCamelCase.js
	 * author: erik, berg
	 * version: 1.2
	 * date: 2010-06-22
	 */



	/**
	 * 將目標字符串進行駝峰化處理
	 * @name baidu.string.toCamelCase
	 * @function
	 * @grammar baidu.string.toCamelCase(source)
	 * @param {string} source 目標字符串
	 * @remark
	 * 支持單詞以“-_”分隔
	 * @meta standard
	 *             
	 * @returns {string} 駝峰化處理後的字符串
	 */
	 
	 //todo:考慮以後去掉下劃線支持？
	baidu.string.toCamelCase = function (source) {
	    //提前判斷，提高getStyle等的效率 thanks xianwei
	    if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
	        return source;
	    }
	    return source.replace(/[-_][^-_]/g, function (match) {
	        return match.charAt(1).toUpperCase();
	    });
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */







	/**
	 * 獲取目標元素的樣式值
	 * @name baidu.dom.getStyle
	 * @function
	 * @grammar baidu.dom.getStyle(element, key)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} key 要獲取的樣式名
	 * @remark
	 * 
	 * 為了精簡代碼，本模塊默認不對任何瀏覽器返回值進行歸一化處理（如使用getStyle時，不同瀏覽器下可能返回rgb顏色或hex顏色），也不會修覆瀏覽器的bug和差異性（如設置IE的float屬性叫styleFloat，firefox則是cssFloat）。<br />
	 * baidu.dom._styleFixer和baidu.dom._styleFilter可以為本模塊提供支持。<br />
	 * 其中_styleFilter能對顏色和px進行歸一化處理，_styleFixer能對display，float，opacity，textOverflow的瀏覽器兼容性bug進行處理。	
	 * @shortcut getStyle
	 * @meta standard
	 * @see baidu.dom.setStyle,baidu.dom.setStyles, baidu.dom.getComputedStyle
	 *             
	 * @returns {string} 目標元素的樣式值
	 */
	// TODO
	// 1. 無法解決px/em單位統一的問題（IE）
	// 2. 無法解決樣式值為非數字值的情況（medium等 IE）
	baidu.dom.getStyle = function (element, key) {
	    var dom = baidu.dom;

	    element = dom.g(element);
	    key = baidu.string.toCamelCase(key);
	    //computed style, then cascaded style, then explicitly set style.
	    var value = element.style[key] ||
	                (element.currentStyle ? element.currentStyle[key] : "") || 
	                dom.getComputedStyle(element, key);

	    // 在取不到值的時候，用fixer進行修正
	    if (!value) {
	        var fixer = dom._styleFixer[key];
	        if(fixer){
	            value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
	        }
	    }
	    
	    /* 檢查結果過濾器 */
	    if (fixer = dom._styleFilter) {
	        value = fixer.filter(key, value, 'get');
	    }

	    return value;
	};

	// 聲明快捷方法
	baidu.getStyle = baidu.dom.getStyle;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * @namespace baidu.event 屏蔽瀏覽器差異性的事件封裝。
	 * @property target 	事件的觸發元素
	 * @property pageX 		鼠標事件的鼠標x坐標
	 * @property pageY 		鼠標事件的鼠標y坐標
	 * @property keyCode 	鍵盤事件的鍵值
	 */
	baidu.event = baidu.event || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/_listeners.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	/**
	 * 事件監聽器的存儲表
	 * @private
	 * @meta standard
	 */
	baidu.event._listeners = baidu.event._listeners || [];
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/on.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/16
	 */




	/**
	 * 為目標元素添加事件監聽器
	 * @name baidu.event.on
	 * @function
	 * @grammar baidu.event.on(element, type, listener)
	 * @param {HTMLElement|string|window} element 目標元素或目標元素id
	 * @param {string} type 事件類型
	 * @param {Function} listener 需要添加的監聽器
	 * @remark
	 * 
	1. 不支持跨瀏覽器的鼠標滾輪事件監聽器添加<br>
	2. 改方法不為監聽器灌入事件對象，以防止跨iframe事件掛載的事件對象獲取失敗
	    
	 * @shortcut on
	 * @meta standard
	 * @see baidu.event.un
	 *             
	 * @returns {HTMLElement|window} 目標元素
	 */
	baidu.event.on = function (element, type, listener) {
	    type = type.replace(/^on/i, '');
	    element = baidu.dom._g(element);

	    var realListener = function (ev) {
	            // 1. 這里不支持EventArgument,  原因是跨frame的事件掛載
	            // 2. element是為了修正this
	            listener.call(element, ev);
	        },
	        lis = baidu.event._listeners,
	        filter = baidu.event._eventFilter,
	        afterFilter,
	        realType = type;
	    type = type.toLowerCase();
	    // filter過濾
	    if(filter && filter[type]){
	        afterFilter = filter[type](element, type, realListener);
	        realType = afterFilter.type;
	        realListener = afterFilter.listener;
	    }
	    
	    // 事件監聽器掛載
	    if (element.addEventListener) {
	        element.addEventListener(realType, realListener, false);
	    } else if (element.attachEvent) {
	        element.attachEvent('on' + realType, realListener);
	    }
	  
	    // 將監聽器存儲到數組中
	    lis[lis.length] = [element, type, listener, realListener, realType];
	    return element;
	};

	// 聲明快捷方法
	baidu.on = baidu.event.on;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/un.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/16
	 */




	/**
	 * 為目標元素移除事件監聽器
	 * @name baidu.event.un
	 * @function
	 * @grammar baidu.event.un(element, type, listener)
	 * @param {HTMLElement|string|window} element 目標元素或目標元素id
	 * @param {string} type 事件類型
	 * @param {Function} listener 需要移除的監聽器
	 * @shortcut un
	 * @meta standard
	 * @see baidu.event.on
	 *             
	 * @returns {HTMLElement|window} 目標元素
	 */
	baidu.event.un = function (element, type, listener) {
	    element = baidu.dom._g(element);
	    type = type.replace(/^on/i, '').toLowerCase();
	    
	    var lis = baidu.event._listeners, 
	        len = lis.length,
	        isRemoveAll = !listener,
	        item,
	        realType, realListener;
	    
	    //如果將listener的結構改成json
	    //可以節省掉這個循環，優化性能
	    //但是由於un的使用頻率並不高，同時在listener不多的時候
	    //遍歷數組的性能消耗不會對代碼產生影響
	    //暫不考慮此優化
	    while (len--) {
	        item = lis[len];
	        
	        // listener存在時，移除element的所有以listener監聽的type類型事件
	        // listener不存在時，移除element的所有type類型事件
	        if (item[1] === type
	            && item[0] === element
	            && (isRemoveAll || item[2] === listener)) {
	           	realType = item[4];
	           	realListener = item[3];
	            if (element.removeEventListener) {
	                element.removeEventListener(realType, realListener, false);
	            } else if (element.detachEvent) {
	                element.detachEvent('on' + realType, realListener);
	            }
	            lis.splice(len, 1);
	        }
	    }
	    
	    return element;
	};

	// 聲明快捷方法
	baidu.un = baidu.event.un;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/preventDefault.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	/**
	 * 阻止事件的默認行為
	 * @name baidu.event.preventDefault
	 * @function
	 * @grammar baidu.event.preventDefault(event)
	 * @param {Event} event 事件對象
	 * @meta standard
	 * @see baidu.event.stop,baidu.event.stopPropagation
	 */
	baidu.event.preventDefault = function (event) {
	   if (event.preventDefault) {
	       event.preventDefault();
	   } else {
	       event.returnValue = false;
	   }
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */


	/**
	 * @namespace baidu.page 對頁面層面的封裝，包括頁面的高寬屬性、以及外部css和js的動態添加。
	 */
	baidu.page = baidu.page || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/getScrollTop.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 獲取縱向滾動量
	 * @name baidu.page.getScrollTop
	 * @function
	 * @grammar baidu.page.getScrollTop()
	 * @see baidu.page.getScrollLeft
	 * @meta standard
	 * @returns {number} 縱向滾動量
	 */
	baidu.page.getScrollTop = function () {
	    var d = document;
	    return window.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;
	};
	/**
	 * 獲取橫向滾動量
	 * @name baidu.page.getScrollLeft
	 * @function
	 * @grammar baidu.page.getScrollLeft()
	 * @see baidu.page.getScrollTop
	 *             
	 * @returns {number} 橫向滾動量
	 */
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/getScrollLeft.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 獲取橫向滾動量
	 * 
	 * @return {number} 橫向滾動量
	 */
	baidu.page.getScrollLeft = function () {
	    var d = document;
	    return window.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
	};
	/**
	 * 獲得頁面里的目前鼠標所在的坐標
	 * @name baidu.page.getMousePosition
	 * @function
	 * @grammar baidu.page.getMousePosition()
	 * @version 1.2
	 *             
	 * @returns {object} 鼠標坐標值{x:[Number], y:[Number]}
	 */
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/getMousePosition.js
	 * author: meizz
	 * version: 1.1.0
	 * date: 2010/06/02
	 */




	/**
	 * 取得當前頁面里的目前鼠標所在的坐標（x y）
	 *
	 * @return  {JSON}  當前鼠標的坐標值({x, y})
	 */
	(function(){

	 baidu.page.getMousePosition = function(){
	 return {
	x : baidu.page.getScrollLeft() + xy.x,
	y : baidu.page.getScrollTop() + xy.y
	};
	};

	var xy = {x:0, y:0};
	// 監聽當前網頁的 mousemove 事件以獲得鼠標的實時坐標
	baidu.event.on(document, "onmousemove", function(e){
	    e = window.event || e;
	    xy.x = e.clientX;
	    xy.y = e.clientY;
	    });

	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/getPosition.js
	 * author: berg
	 * version: 1.2.0
	 * date: 2010/12/16
	 *
	 * thanks google closure & jquery
	 * 本函數部分思想來自：http://code.google.com/p/doctype/wiki/ArticlePageOffset
	 */










	/**
	 * 獲取目標元素相對於整個文檔左上角的位置
	 * @name baidu.dom.getPosition
	 * @function
	 * @grammar baidu.dom.getPosition(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @meta standard
	 *             
	 * @returns {Object} 目標元素的位置，鍵值為top和left的Object。
	 */
	baidu.dom.getPosition = function (element) {
	    element = baidu.dom.g(element);
	    var doc = baidu.dom.getDocument(element), 
	        browser = baidu.browser,
	        getStyle = baidu.dom.getStyle,
	    // Gecko 1.9版本以下用getBoxObjectFor計算位置
	    // 但是某些情況下是有bug的
	    // 對於這些有bug的情況
	    // 使用遞歸查找的方式
	        BUGGY_GECKO_BOX_OBJECT = browser.isGecko > 0 && 
	                                 doc.getBoxObjectFor &&
	                                 getStyle(element, 'position') == 'absolute' &&
	                                 (element.style.top === '' || element.style.left === ''),
	        pos = {"left":0,"top":0},
	        viewport = (browser.ie && !browser.isStrict) ? doc.body : doc.documentElement,
	        parent,
	        box;
	    
	    if(element == viewport){
	        return pos;
	    }


	    if(element.getBoundingClientRect){ // IE and Gecko 1.9+
	        
	    	//當HTML或者BODY有border width時, 原生的getBoundingClientRect返回值是不符合預期的
	    	//考慮到通常情況下 HTML和BODY的border只會設成0px,所以忽略該問題.
	        box = element.getBoundingClientRect();

	        pos.left = Math.floor(box.left) + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
	        pos.top  = Math.floor(box.top)  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop);
		    
	        // IE會給HTML元素添加一個border，默認是medium（2px）
	        // 但是在IE 6 7 的怪異模式下，可以被html { border: 0; } 這條css規則覆蓋
	        // 在IE7的標準模式下，border永遠是2px，這個值通過clientLeft 和 clientTop取得
	        // 但是。。。在IE 6 7的怪異模式，如果用戶使用css覆蓋了默認的medium
	        // clientTop和clientLeft不會更新
	        pos.left -= doc.documentElement.clientLeft;
	        pos.top  -= doc.documentElement.clientTop;
	        
	        var htmlDom = doc.body,
	            // 在這里，不使用element.style.borderLeftWidth，只有computedStyle是可信的
	            htmlBorderLeftWidth = parseInt(getStyle(htmlDom, 'borderLeftWidth')),
	            htmlBorderTopWidth = parseInt(getStyle(htmlDom, 'borderTopWidth'));
	        if(browser.ie && !browser.isStrict){
	            pos.left -= isNaN(htmlBorderLeftWidth) ? 2 : htmlBorderLeftWidth;
	            pos.top  -= isNaN(htmlBorderTopWidth) ? 2 : htmlBorderTopWidth;
	        }
	    /*
	     * 因為firefox 3.6和4.0在特定頁面下(場景待補充)都會出現1px偏移,所以暫時移除該邏輯分支
	     * 如果 2.0版本時firefox仍存在問題,該邏輯分支將徹底移除. by rocy 2011-01-20
	    } else if (doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT){ // gecko 1.9-

	        // 1.9以下的Gecko，會忽略ancestors的scroll值
	        // https://bugzilla.mozilla.org/show_bug.cgi?id=328881 and
	        // https://bugzilla.mozilla.org/show_bug.cgi?id=330619

	        box = doc.getBoxObjectFor(element);
	        var vpBox = doc.getBoxObjectFor(viewport);
	        pos.left = box.screenX - vpBox.screenX;
	        pos.top  = box.screenY - vpBox.screenY;
	        */
	    } else { // safari/opera/firefox
	        parent = element;

	        do {
	            pos.left += parent.offsetLeft;
	            pos.top  += parent.offsetTop;
	      
	            // safari里面，如果遍歷到了一個fixed的元素，後面的offset都不準了
	            if (browser.isWebkit > 0 && getStyle(parent, 'position') == 'fixed') {
	                pos.left += doc.body.scrollLeft;
	                pos.top  += doc.body.scrollTop;
	                break;
	            }
	            
	            parent = parent.offsetParent;
	        } while (parent && parent != element);

	        // 對body offsetTop的修正
	        if(browser.opera > 0 || (browser.isWebkit > 0 && getStyle(element, 'position') == 'absolute')){
	            pos.top  -= doc.body.offsetTop;
	        }

	        // 計算除了body的scroll
	        parent = element.offsetParent;
	        while (parent && parent != doc.body) {
	            pos.left -= parent.scrollLeft;
	            // see https://bugs.opera.com/show_bug.cgi?id=249965
//	            if (!b.opera || parent.tagName != 'TR') {
	            if (!browser.opera || parent.tagName != 'TR') {
	                pos.top -= parent.scrollTop;
	            }
	            parent = parent.offsetParent;
	        }
	    }

	    return pos;
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/drag.js
	 * author: meizz, berg, lxp
	 * version: 1.1.0
	 * date: 2010/06/02
	 */















	/**
	 * 拖動指定的DOM元素
	 * @name baidu.dom.drag
	 * @function
	 * @grammar baidu.dom.drag(element, options)
	 * @param {HTMLElement|string} element 元素或者元素的id
	 * @param {Object} options 拖曳配置項
	                
	 * @param {Array} options.range 限制drag的拖拽範圍，數組中必須包含四個值，分別是上、右、下、左邊緣相對上方或左方的像素距離。默認無限制
	 * @param {Number} options.interval 拖曳行為的觸發頻度（時間：毫秒）
	 * @param {Boolean} options.capture 鼠標拖曳粘滯
	 * @param {Object} options.mouseEvent 鍵名為clientX和clientY的object，若不設置此項，默認會獲取當前鼠標位置
	 * @param {Function} options.ondragstart drag開始時觸發
	 * @param {Function} options.ondrag drag進行中觸發
	 * @param {Function} options.ondragend drag結束時觸發
	 * @param {function} options.autoStop 是否在onmouseup時自動停止拖拽。默認為true
	 * @version 1.2
	 * @remark
	 * 
	            要拖拽的元素必須事先設定樣式的postion值，如果postion為absloute，並且沒有設定top和left，拖拽開始時，無法取得元素的top和left值，這時會從[0,0]點開始拖拽
	        
	 * @see baidu.dom.draggable
	 */
	/**
	 * 拖曳DOM元素
	 * @param   {HTMLElement|ID}    element 被拖曳的元素
	 * @param   {JSON}              options 拖曳配置項
	 *          {autoStop, interval, capture, range, ondragstart, ondragend, ondrag, mouseEvent}
	 */
	(function(){
	    var target, // 被拖曳的DOM元素
	        op, ox, oy, //timer, 
	        top, left, mozUserSelect,
	        lastLeft, lastTop,
	        isFunction = baidu.lang.isFunction,
	        timer,
	        offset_parent,offset_target;
	    
	    baidu.dom.drag = function(element, options) {
	        //每次開始拖拽的時候重置lastTop和lastLeft
	        lastTop = lastLeft = null;
	        
	        if (!(target = baidu.dom.g(element))) return false;
	        op = baidu.object.extend({
	            autoStop:true   // false 用戶手動結束拖曳 ｜ true 在mouseup時自動停止拖曳
	            ,capture : true // 鼠標拖曳粘滯
	            ,interval : 16  // 拖曳行為的觸發頻度（時間：毫秒）
	            ,handler : target
	        }, options);

	        offset_parent = baidu.dom.getPosition(target.offsetParent);
	        offset_target = baidu.dom.getPosition(target);
	       
	        if(baidu.getStyle(target,'position') == "absolute"){
	            top =  offset_target.top - (target.offsetParent == document.body ? 0 : offset_parent.top);
	            left = offset_target.left - (target.offsetParent == document.body ? 0 :offset_parent.left);
	        }else{
	            top = parseFloat(baidu.getStyle(target,"top")) || -parseFloat(baidu.getStyle(target,"bottom")) || 0;
	            left = parseFloat(baidu.getStyle(target,"left")) || -parseFloat(baidu.getStyle(target,"right")) || 0; 
	        }

	        if(op.mouseEvent){
	            // [2010/11/16] 可以不依賴getMousePosition，直接通過一個可選參數獲得鼠標位置
	            ox = baidu.page.getScrollLeft() + op.mouseEvent.clientX;
	            oy = baidu.page.getScrollTop() + op.mouseEvent.clientY;
	        }else{
	            var xy = baidu.page.getMousePosition();    // 得到當前鼠標坐標值
	            ox = xy.x;
	            oy = xy.y;
	        }

	        //timer = setInterval(render, op.interval);

	        // 這項為 true，缺省在 onmouseup 事件終止拖曳
	        op.autoStop && baidu.event.on(op.handler, "mouseup", stop);
	        op.autoStop && baidu.event.on(window, "mouseup", stop);
	        
	        // 在拖曳過程中頁面里的文字會被選中高亮顯示，在這里修正
	        baidu.event.on(document, "selectstart", unselect);

	        // 設置鼠標粘滯
	        if (op.capture && op.handler.setCapture) {
	            op.handler.setCapture();
	        } else if (op.capture && window.captureEvents) {
	            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
	        }
	        //baidu.on(target,"mousemove",render);

	        // fixed for firefox
	        mozUserSelect = document.body.style.MozUserSelect;
	        document.body.style.MozUserSelect = "none";

	        // ondragstart 事件
	        if(isFunction(op.ondragstart)){
	            op.ondragstart(target, op);
	        }
	        
	        timer = setInterval(render, op.interval);
	        return {stop : stop, update : update};
	    };

	    /**
	     * 更新當前拖拽對象的屬性
	     */
	    function update(options){
	        baidu.extend(op, options);
	    }

	    /**
	     * 手動停止拖拽
	     */
	    function stop() {
	        clearInterval(timer);

	        // 解除鼠標粘滯
	        if (op.capture && op.handler.releaseCapture) {
	            op.handler.releaseCapture();
	        } else if (op.capture && window.releaseEvents) {
	            window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
	        }

	        // 拖曳時網頁內容被框選
	        document.body.style.MozUserSelect = mozUserSelect;
	        baidu.event.un(document, "selectstart", unselect);
	        op.autoStop && baidu.event.un(op.handler, "mouseup", stop);
	        op.autoStop && baidu.event.un(window, "mouseup", stop);

	        // ondragend 事件
	        if(isFunction(op.ondragend)){
	            op.ondragend(target, op);
	        }
	    }

	    // 對DOM元素進行top/left賦新值以實現拖曳的效果
	    function render(e) {
	        var rg = op.range,
	            xy = baidu.page.getMousePosition(),
	            el = left + xy.x - ox,
	            et = top  + xy.y - oy;

	        // 如果用戶限定了可拖動的範圍
	        if (typeof rg == "object" && rg && rg.length == 4) {
	            el = Math.max(rg[3], el);
	            el = Math.min(rg[1] - target.offsetWidth,  el);
	            et = Math.max(rg[0], et);
	            et = Math.min(rg[2] - target.offsetHeight, et);
	        }
	        target.style.top = et + "px";
	        target.style.left = el + "px";

	        if((lastLeft !== el || lastTop !== et) && (lastLeft !== null || lastTop !== null) ){
	            if(isFunction(op.ondrag)){
	                op.ondrag(target, op);   
	            }
	        }
	        lastLeft = el;
	        lastTop = et;
	    }

	    // 對document.body.onselectstart事件進行監聽，避免拖曳時文字被選中
	    function unselect(e) {
	        return baidu.event.preventDefault(e, false);
	    }
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/setStyle.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/18
	 */






	/**
	 * 設置目標元素的style樣式值
	 * @name baidu.dom.setStyle
	 * @function
	 * @grammar baidu.dom.setStyle(element, key, value)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} key 要設置的樣式名
	 * @param {string} value 要設置的樣式值
	 * @remark
	 * 
	            為了精簡代碼，本模塊默認不對任何瀏覽器返回值進行歸一化處理（如使用getStyle時，不同瀏覽器下可能返回rgb顏色或hex顏色），也不會修覆瀏覽器的bug和差異性（如設置IE的float屬性叫styleFloat，firefox則是cssFloat）。<br />
	baidu.dom._styleFixer和baidu.dom._styleFilter可以為本模塊提供支持。<br />
	其中_styleFilter能對顏色和px進行歸一化處理，_styleFixer能對display，float，opacity，textOverflow的瀏覽器兼容性bug進行處理。
			
	 * @shortcut setStyle
	 * @meta standard
	 * @see baidu.dom.getStyle,baidu.dom.setStyles
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.setStyle = function (element, key, value) {
	    var dom = baidu.dom, fixer;
	    
	    // 放棄了對firefox 0.9的opacity的支持
	    element = dom.g(element);
	    key = baidu.string.toCamelCase(key);

	    if (fixer = dom._styleFilter) {
	        value = fixer.filter(key, value, 'set');
	    }

	    fixer = dom._styleFixer[key];
	    (fixer && fixer.set) ? fixer.set(element, value) : (element.style[fixer || key] = value);

	    return element;
	};

	// 聲明快捷方法
	baidu.setStyle = baidu.dom.setStyle;
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 */














	/**
	 * 讓一個DOM元素可拖拽
	 * @name baidu.dom.draggable
	 * @function
	 * @grammar baidu.dom.draggable(element[, options])
	 * @param  {string|HTMLElement}   element 		        元素或者元素的ID.
	 * @param  {Object} 		      [options] 			選項.
	 * @config {Array} 		          [range] 		        限制drag的拖拽範圍，數組中必須包含四個值，分別是上、右、下、左邊緣相對上方或左方的像素距離。默認無限制.
	 * @config {Number} 	          [interval] 	        拖曳行為的觸發頻度（時間：毫秒）.
	 * @config {Boolean} 	          [capture] 	        鼠標拖曳粘滯.
	 * @config {Object} 	          [mouseEvent] 	        鍵名為clientX和clientY的object，若不設置此項，默認會獲取當前鼠標位置.
	 * @config {Function} 	          [onbeforedragstart]   drag開始前觸發（即鼠標按下時）.
	 * @config {Function} 	          [ondragstart]         drag開始時觸發.
	 * @config {Function} 	          [ondrag] 		        drag進行中觸發.
	 * @config {Function} 	          [ondragend] 	        drag結束時觸發.
	 * @config {HTMLElement}          [handler] 	        用於拖拽的手柄，比如dialog的title.
	 * @config {Function} 	          [toggle] 		        在每次ondrag的時候，會調用這個方法判斷是否應該停止拖拽。如果此函數返回值為false，則停止拖拽.
	 * @version 1.2
	 * @remark    要拖拽的元素必須事先設定樣式的postion值，如果postion為absloute，並且沒有設定top和left，拖拽開始時，無法取得元素的top和left值，這時會從[0,0]點開始拖拽<br>如果要拖拽的元素是static定位，會被改成relative定位方式。
	 * @see baidu.dom.drag
	 * @return {Draggable Instance} 拖拽實例，包含cancel方法，可以停止拖拽.
	 */

	baidu.dom.draggable = function(element, options) {
	    options = baidu.object.extend({toggle: function() {return true}}, options || {});
	    options.autoStop = true;
	    element = baidu.dom.g(element);
	    options.handler = options.handler || element;
	    var manager,
	        events = ['ondragstart', 'ondrag', 'ondragend'],
	        i = events.length - 1,
	        eventName,
	        dragSingle,
	        draggableSingle = {
	            dispose: function() {
	                dragSingle && dragSingle.stop();
	                baidu.event.un(options.handler, 'onmousedown', handlerMouseDown);
	                baidu.lang.Class.prototype.dispose.call(draggableSingle);
	            }
	        },
	        me = this;

	    //如果存在ddManager, 將事件轉發到ddManager中
	    if (manager = baidu.dom.ddManager) {
	        for (; i >= 0; i--) {
	            eventName = events[i];
	            options[eventName] = (function(eventName) {
	                var fn = options[eventName];
	                return function() {
	                    baidu.lang.isFunction(fn) && fn.apply(me, arguments);
	                    manager.dispatchEvent(eventName, {DOM: element});
	                }
	            })(eventName);
	        }
	    }


	    // 拖曳只針對有 position 定位的元素
	    if (element) {
	        function handlerMouseDown(e) {
	            var event = options.mouseEvent = window.event || e;
	            if (event.button > 1 //只支持鼠標左鍵拖拽; 左鍵代碼: IE為1,W3C為0
	                // 可以通過配置項里的這個開關函數暫停或啟用拖曳功能
	                || (baidu.lang.isFunction(options.toggle) && !options.toggle())) {
	                return;
	            }
	            if (baidu.dom.getStyle(element, 'position') == 'static') {
	                baidu.dom.setStyle(element, 'position', 'relative');
	            }
	            if (baidu.lang.isFunction(options.onbeforedragstart)) {
	                options.onbeforedragstart(element);
	            }
	            dragSingle = baidu.dom.drag(element, options);
	            draggableSingle.stop = dragSingle.stop;
	            draggableSingle.update = dragSingle.update;
	            //防止ff下出現禁止拖拽的圖標
	            baidu.event.preventDefault(event);
	        }

	        // 對拖曳的扳機元素監聽 onmousedown 事件，以便進行拖曳行為
	        baidu.event.on(options.handler, 'onmousedown', handlerMouseDown);
	    }
	    return {
	        cancel: function() {
	            draggableSingle.dispose();
	        }
	    };
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/intersect.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/12/02
	 */




	/**
	 * 檢查兩個元素是否相交
	 * @name baidu.dom.intersect
	 * @function
	 * @grammar baidu.dom.intersect(element1, element2)
	 * @param {HTMLElement|string} element1 要檢查的元素或元素的id
	 * @param {HTMLElement|string} element2 要檢查的元素或元素的id
	 * @see baidu.dom.contains
	 *             
	 * @returns {boolean} 兩個元素是否相交的檢查結果
	 */
	baidu.dom.intersect = function (element1, element2) {
	    var g = baidu.dom.g, 
	        getPosition = baidu.dom.getPosition, 
	        max = Math.max, 
	        min = Math.min;

	    element1 = g(element1);
	    element2 = g(element2);

	    var pos1 = getPosition(element1),
	        pos2 = getPosition(element2);

	    return max(pos1.left, pos2.left) <= min(pos1.left + element1.offsetWidth, pos2.left + element2.offsetWidth)
	        && max(pos1.top, pos2.top) <= min(pos1.top + element1.offsetHeight, pos2.top + element2.offsetHeight);
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/droppable.js
	 * author: rocy
	 * version: 1.4.0
	 * date: 2010/10/14
	 */








	//TODO: 添加對 accept, hoverclass 等參數的支持.
	/**
	 * 讓一個DOM元素可以容納被拖拽的DOM元素
	 * @name baidu.dom.droppable
	 * @function
	 * @grammar baidu.dom.droppable(element[, options])
	 * @param {HTMLElement|string} element 容器元素或者容器元素的ID
	 * @param {Object} [options] 選項，拖拽元素對於容器元素的事件
	                
	 * @config {Function} [ondrop] 當元素放到容器元素內部觸發
	 * @config {Function} [ondropover] 當元素在容器元素上方時觸發
	 * @config {Function} [ondropout] 當元素移除容器元素時觸發
	 * @version 1.3
	 * @remark
	 * 
	            需要將元素和容器元素的定位都設置為absolute
	        
	 * @see baidu.dom.droppable
	 *             
	 * @returns {Function} cancel取消拖拽
	 */
	baidu.dom.droppable = function(element, options){
		options = options || {};
		var manager = baidu.dom.ddManager,
			target = baidu.dom.g(element),
		    guid = baidu.lang.guid(),
			//拖拽進行時判斷
			_dragging = function(event){
				var _targetsDroppingOver = manager._targetsDroppingOver,
				    eventData = {trigger:event.DOM,reciever: target};
				//判斷被拖拽元素和容器是否相撞
				if(baidu.dom.intersect(target, event.DOM)){
					//進入容器區域
					if(! _targetsDroppingOver[guid]){
						//初次進入
						(typeof options.ondropover == 'function') && options.ondropover.call(target,eventData);
						manager.dispatchEvent("ondropover", eventData);
						_targetsDroppingOver[guid] = true;
					}
				} else {
					//出了容器區域
					if(_targetsDroppingOver[guid]){
						(typeof options.ondropout == 'function') && options.ondropout.call(target,eventData);
						manager.dispatchEvent("ondropout", eventData);
					}
					delete _targetsDroppingOver[guid];
				}
			},
			//拖拽結束時判斷
			_dragend = function(event){
				var eventData = {trigger:event.DOM,reciever: target};
				if(baidu.dom.intersect(target, event.DOM)){
					typeof options.ondrop == 'function' && options.ondrop.call(target, eventData);
					manager.dispatchEvent("ondrop", eventData);
				}
				delete manager._targetsDroppingOver[guid];
			};
		//事件注冊,return object提供事件解除
		manager.addEventListener("ondrag", _dragging);
		manager.addEventListener("ondragend", _dragend);
		return {
			cancel : function(){
				manager.removeEventListener("ondrag", _dragging);
				manager.removeEventListener("ondragend",_dragend);
			}
		};
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/empty.js
	 * author: berg
	 * version: 1.0
	 * date: 2010-07-06
	 */

	/**
	 * 刪除一個節點下面的所有子節點。
	 * @name baidu.dom.empty
	 * @function
	 * @grammar baidu.dom.empty(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @version 1.3
	 *             
	 * @returns {HTMLElement} 目標元素
	        
	 */



	baidu.dom.empty = function (element) {
	    element = baidu.dom.g(element);
	    
	    while(element.firstChild){
	        element.removeChild(element.firstChild);
	    }
	    //todo：刪除元素上綁定的事件等?

	    return element;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_matchNode.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/18
	 */




	/**
	 * 從目標元素指定的方向搜索元素
	 *
	 * @param {HTMLElement|string} element   目標元素或目標元素的id
	 * @param {string}             direction 遍歷的方向名稱，取值為previousSibling,nextSibling
	 * @param {string}             start     遍歷的開始位置，取值為firstChild,lastChild,previousSibling,nextSibling
	 * @meta standard
	 * @return {HTMLElement} 搜索到的元素，如果沒有找到，返回 null
	 */
	baidu.dom._matchNode = function (element, direction, start) {
	    element = baidu.dom.g(element);

	    for (var node = element[start]; node; node = node[direction]) {
	        if (node.nodeType == 1) {
	            return node;
	        }
	    }

	    return null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/first.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/11/18
	 */



	/**
	 * 獲取目標元素的第一個元素節點
	 * @name baidu.dom.first
	 * @function
	 * @grammar baidu.dom.first(element)
	 * @param {HTMLElement|String} element 目標元素或目標元素的id
	 * @see baidu.dom.last,baidu.dom.prev,baidu.dom.next
	 * @meta standard
	 * @returns {HTMLElement|null} 目標元素的第一個元素節點，查找不到時返回null
	 */
	baidu.dom.first = function (element) {
	    return baidu.dom._matchNode(element, 'nextSibling', 'firstChild');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/getAttr.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */




	/**
	 * 獲取目標元素的屬性值
	 * @name baidu.dom.getAttr
	 * @function
	 * @grammar baidu.dom.getAttr(element, key)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} key 要獲取的attribute鍵名
	 * @shortcut getAttr
	 * @meta standard
	 * @see baidu.dom.setAttr,baidu.dom.setAttrs
	 *             
	 * @returns {string|null} 目標元素的attribute值，獲取不到時返回null
	 */
	baidu.dom.getAttr = function (element, key) {
	    element = baidu.dom.g(element);

	    if ('style' == key){
	        return element.style.cssText;
	    }

	    key = baidu.dom._NAME_ATTRS[key] || key;
	    return element.getAttribute(key);
	};

	// 聲明快捷方法
	baidu.getAttr = baidu.dom.getAttr;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/setStyles.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/18
	 */




	/**
	 * 批量設置目標元素的style樣式值
	 * @name baidu.dom.setStyles
	 * @function
	 * @grammar baidu.dom.setStyles(element, styles)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {Object} styles 要設置的樣式集合
	 * @shortcut setStyles
	 * @meta standard
	 * @see baidu.dom.setStyle,baidu.dom.getStyle
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.setStyles = function (element, styles) {
	    element = baidu.dom.g(element);

	    for (var key in styles) {
	        baidu.dom.setStyle(element, key, styles[key]);
	    }

	    return element;
	};

	// 聲明快捷方法
	baidu.setStyles = baidu.dom.setStyles;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/getViewHeight.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/20
	 */



	/**
	 * 獲取頁面視覺區域高度
	 * @name baidu.page.getViewHeight
	 * @function
	 * @grammar baidu.page.getViewHeight()
	 * @see baidu.page.getViewWidth
	 * @meta standard
	 * @returns {number} 頁面視覺區域高度
	 */
	baidu.page.getViewHeight = function () {
	    var doc = document,
	        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

	    return client.clientHeight;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/getViewWidth.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/20
	 */



	/**
	 * 獲取頁面視覺區域寬度
	 * @name baidu.page.getViewWidth
	 * @function
	 * @grammar baidu.page.getViewWidth()
	 * @see baidu.page.getViewHeight
	 *             
	 * @returns {number} 頁面視覺區域寬度
	 */
	baidu.page.getViewWidth = function () {
	    var doc = document,
	        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

	    return client.clientWidth;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_styleFilter/px.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 提供給setStyle與getStyle使用
	 * @meta standard
	 */
	baidu.dom._styleFilter[baidu.dom._styleFilter.length] = {
	    set: function (key, value) {
	        if (value.constructor == Number 
	            && !/zIndex|fontWeight|opacity|zoom|lineHeight/i.test(key)){
	            value = value + "px";
	        }

	        return value;
	    }
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All right reserved.
	 */
















	/**
	 * 使目標元素擁有可進行與頁面可見區域相對位置保持不變的移動的能力
	 * @name T.dom.fixable
	 * @function
	 * @param {HTMLElement|String} element 目標元素或目標元素的id
	 * @param {Object} options 配置項
	 * @config {String} [vertival] 取值[top|bottom] 默認值 top
	 * @config {Strgin} [horizontal] 取值[left|right] 默認值 left
	 * @config {Object} [offset] {x:String|Number, y:String|Number}} 橫向與縱向的取值
	 * @config {Boolean} [autofix] 是否自動進行fix，默認值為true
	 * @config {Function} [onrender] 當被渲染時候觸發
	 * @config {Function} [onupdate] 當位置被更新的時候觸發
	 * @config {Function} [onrelease] 當被釋放的時候觸發
	 * @return {Object} 返回值一個對象，有三個方法：render、update、release
	 */

	baidu.dom.fixable = function(element, options){

	    var target  = baidu.g(element),
	        isUnderIE7 = baidu.browser.ie && baidu.browser.ie <= 7 ? true : false,
	        vertival = options.vertival || 'top',
	        horizontal = options.horizontal || 'left',
	        autofix = typeof options.autofix != 'undefined' ? options.autofix : true,
	        origPos,offset,isRender = false,
	        onrender = options.onrender || new Function(),
	        onupdate = options.onupdate || new Function(),
	        onrelease = options.onrelease || new Function();

	    if(!target) return;

	    //獲取target原始值
	    origPos = _getOriginalStyle();
	    //設置offset值
	    offset = {
	        y: isUnderIE7 ? (origPos.position == "static" ? baidu.dom.getPosition(target).top :  baidu.dom.getPosition(target).top - baidu.dom.getPosition(target.parentNode).top) : target.offsetTop,
	        x: isUnderIE7 ? (origPos.position == "static" ? baidu.dom.getPosition(target).left :  baidu.dom.getPosition(target).left - baidu.dom.getPosition(target.parentNode).left) : target.offsetLeft
	    };
	    baidu.extend(offset, options.offset || {});

	    autofix && render();
	   
	    function _convert(){
	        return {
	            top : vertival == "top" ? offset.y : baidu.page.getViewHeight() - offset.y - origPos.height,
	            left: horizontal == "left" ? offset.x : baidu.page.getViewWidth() - offset.x - origPos.width
	        };
	    }

	    /**
	     * 
	     */
	    function _handleOnMove(){
	        var p = _convert(); 
	        
	        target.style.setExpression("left","eval((document.body.scrollLeft || document.documentElement.scrollLeft) + " + p.left + ") + 'px'");
	        target.style.setExpression("top", "eval((document.body.scrollTop || document.documentElement.scrollTop) + " + p.top + ") + 'px'");
	    }

	    /**
	     * 返回target原始position值
	     * @return {Object}
	     */
	    function _getOriginalStyle(){
	        var result = {
	            position: baidu.getStyle(target,"position"),
	            height: function(){
	                var h = baidu.getStyle(target,"height");
	                return (h != "auto") ? (/\d+/.exec(h)[0]) : target.offsetHeight;
	            }(),
	            width: function(){			
	                var w = baidu.getStyle(target,"width");
	                return (w != "auto") ? (/\d+/.exec(w)[0]) : target.offsetWidth;
	            }()
	        };

	        _getValue('top', result);
	        _getValue('left', result);
	        _getValue('bottom', result);
	        _getValue('right', result);
	        
	        return result;
	    }

	    function _getValue(position, options){
	        var result;

	        if(options.position == 'static'){
	            options[position] = '';   
	        }else{
	            result = baidu.getStyle(target, position);
	            if(result == 'auto' || result == '0px' ){
	                options[position] = '';
	            }else{
	                options[position] = result;
	            }
	        }
	    }

	    function render(){
	        if(isRender) return;

	        baidu.setStyles(target, {top:'', left:'', bottom:'', right:''});
	        
	        if(!isUnderIE7){
	            var style = {position:"fixed"};
	            style[vertival == "top" ? "top" : "bottom"] = offset.y + "px";
	            style[horizontal == "left" ? "left" : "right"] = offset.x + "px";

	            baidu.setStyles(target, style);
	        }else{
	            baidu.setStyle(target,"position","absolute");
	            _handleOnMove();
	        }

	        onrender();
	        isRender = true;
	    }

	    function release(){
	       if(!isRender) return;

	       var style = {
	           position: origPos.position,
	           left: origPos.left == '' ? 'auto' : origPos.left,
	           top: origPos.top == '' ? 'auto' : origPos.top,
	           bottom: origPos.bottom == '' ? 'auto' : origPos.bottom,
	           right: origPos.right == '' ?  'auto' : origPos.right
	       };

	        if(isUnderIE7){
	            target.style.removeExpression("left");
	            target.style.removeExpression("top");
	        }
	        baidu.setStyles(target, style);

	        onrelease();
	        isRender = false;
	    }

	    function update(options){
	        if(!options) return;

	        //更新事件
	        onrender = options.onrender || onrender;
	        onupdate = options.onupdate || onupdate;
	        onrelease = options.onrelease || onrelease;
	        
	        //更新設置
	        vertival = options.vertival || 'top';
	        horizontal = options.horizontal || 'left';

	        //更新offset
	        baidu.extend(offset, options.offset || {});

	        onupdate();
	    }

	    return {render: render, update: update, release:release};
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/getAncestorBy.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 獲取目標元素符合條件的最近的祖先元素
	 * @name baidu.dom.getAncestorBy
	 * @function
	 * @grammar baidu.dom.getAncestorBy(element, method)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {Function} method 判斷祖先元素條件的函數，function (element)
	 * @see baidu.dom.getAncestorByTag,baidu.dom.getAncestorByClass
	 *             
	 * @returns {HTMLElement|null} 符合條件的最近的祖先元素，查找不到時返回null
	 */
	baidu.dom.getAncestorBy = function (element, method) {
	    element = baidu.dom.g(element);

	    while ((element = element.parentNode) && element.nodeType == 1) {
	        if (method(element)) {
	            return element;
	        }
	    }

	    return null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/getAncestorByClass.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */




	/**
	 * 獲取目標元素指定元素className最近的祖先元素
	 * @name baidu.dom.getAncestorByClass
	 * @function
	 * @grammar baidu.dom.getAncestorByClass(element, className)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} className 祖先元素的class，只支持單個class
	 * @remark 使用者應保證提供的className合法性，不應包含不合法字符，className合法字符參考：http://www.w3.org/TR/CSS2/syndata.html。
	 * @see baidu.dom.getAncestorBy,baidu.dom.getAncestorByTag
	 *             
	 * @returns {HTMLElement|null} 指定元素className最近的祖先元素，查找不到時返回null
	 */
	baidu.dom.getAncestorByClass = function (element, className) {
	    element = baidu.dom.g(element);
	    className = new RegExp("(^|\\s)" + baidu.string.trim(className) + "(\\s|\x24)");

	    while ((element = element.parentNode) && element.nodeType == 1) {
	        if (className.test(element.className)) {
	            return element;
	        }
	    }

	    return null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/getAncestorByTag.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 獲取目標元素指定標簽的最近的祖先元素
	 * @name baidu.dom.getAncestorByTag
	 * @function
	 * @grammar baidu.dom.getAncestorByTag(element, tagName)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} tagName 祖先元素的標簽名
	 * @see baidu.dom.getAncestorBy,baidu.dom.getAncestorByClass
	 *             
	 * @returns {HTMLElement|null} 指定標簽的最近的祖先元素，查找不到時返回null
	 */
	baidu.dom.getAncestorByTag = function (element, tagName) {
	    element = baidu.dom.g(element);
	    tagName = tagName.toUpperCase();

	    while ((element = element.parentNode) && element.nodeType == 1) {
	        if (element.tagName == tagName) {
	            return element;
	        }
	    }

	    return null;
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All right reserved.
	 * 
	 * path: baidu/dom/getParent.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/12/02
	 */



	/**
	 * 獲得元素的父節點
	 * @name baidu.dom.getParent
	 * @function
	 * @grammar baidu.dom.getParent(element)
	 * @param {HTMLElement|string} element   目標元素或目標元素的id
	 * @return {HTMLElement|null} 父元素，如果找不到父元素，返回null
	 */
	baidu.dom.getParent = function (element) {
	    element = baidu.dom._g(element);
	    //parentElement在IE下準確，parentNode在ie下可能不準確
	    return element.parentElement || element.parentNode || null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/getText.js
	 * author: berg
	 * version: 1.0
	 * date: 2010/07/16 
	 */



	/**
	 * 獲得元素中的文本內容。
	 * @name baidu.dom.getText
	 * @function
	 * @grammar baidu.dom.getText(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @version 1.3
	 *             
	 * @returns {String} 元素中文本的內容      
	 */
	baidu.dom.getText = function (element) {
	    var ret = "", childs, i=0, l;

	    element = baidu._g(element);

	    //  text 和 CDATA 節點，取nodeValue
	    if ( element.nodeType === 3 || element.nodeType === 4 ) {
	        ret += element.nodeValue;
	    } else if ( element.nodeType !== 8 ) {// 8 是 comment Node
	        childs = element.childNodes;
	        for(l = childs.length; i < l; i++){
	            ret += baidu.dom.getText(childs[i]);
	        }
	    }

	    return ret;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/getWindow.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */




	/**
	 * 獲取目標元素所屬的window對象
	 * @name baidu.dom.getWindow
	 * @function
	 * @grammar baidu.dom.getWindow(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @see baidu.dom.getDocument
	 *             
	 * @returns {window} 目標元素所屬的window對象
	 */
	baidu.dom.getWindow = function (element) {
	    element = baidu.dom.g(element);
	    var doc = baidu.dom.getDocument(element);
	    
	    // 沒有考慮版本低於safari2的情況
	    // @see goog/dom/dom.js#goog.dom.DomHelper.prototype.getWindow
	    return doc.parentWindow || doc.defaultView || null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/hasAttr.js
	 * author: berg
	 * version: 1.0
	 * date: 2010/07/16 
	 */



	/**
	 * 查詢一個元素是否包含指定的屬性
	 * @name baidu.dom.hasAttr
	 * @function
	 * @grammar baidu.dom.hasAttr(element, name)
	 * @param {DOMElement|string} element DOM元素或元素的id
	 * @param {string} name 要查找的屬性名
	 * @version 1.3
	 *             
	 * @returns {Boolean} 是否包含此屬性        
	 */

	baidu.dom.hasAttr = function (element, name){
	    element = baidu.g(element);
	    var attr = element.attributes.getNamedItem(name);
	    return !!( attr && attr.specified );
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/hasClass.js
	 * author: berg
	 * version: 1.0
	 * date: 2010-07-06
	 */






	/**
	 * 判斷元素是否擁有指定的className
	 * @name baidu.dom.hasClass
	 * @function
	 * @grammar baidu.dom.hasClass(element, className)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} className 要判斷的className，可以是用空格拼接的多個className
	 * @version 1.2
	 * @remark
	 * 對於參數className，支持空格分隔的多個className
	 * @see baidu.dom.addClass, baidu.dom.removeClass
	 * @meta standard
	 * @returns {Boolean} 是否擁有指定的className，如果要查詢的classname有一個或多個不在元素的className中，返回false
	 */
	baidu.dom.hasClass = function (element, className) {
	    element = baidu.dom.g(element);
	    var classArray = baidu.string.trim(className).split(/\s+/), 
	        len = classArray.length;

	    className = element.className.split(/\s+/).join(" ");

	    while (len--) {
	        if(!(new RegExp("(^| )" + classArray[len] + "( |\x24)")).test(className)){
	            return false;
	        }
	    }
	    return true;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/hide.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 隱藏目標元素
	 * @name baidu.dom.hide
	 * @function
	 * @grammar baidu.dom.hide(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @shortcut hide
	 * @meta standard
	 * @see baidu.dom.show,baidu.dom.toggle
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.hide = function (element) {
	    element = baidu.dom.g(element);
	    element.style.display = "none";

	    return element;
	};

	// 聲明快捷方法
	baidu.hide = baidu.dom.hide;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/insertAfter.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 將目標元素添加到基準元素之後
	 * @name baidu.dom.insertAfter
	 * @function
	 * @grammar baidu.dom.insertAfter(newElement, existElement)
	 * @param {HTMLElement|string} newElement 被添加的目標元素
	 * @param {HTMLElement|string} existElement 基準元素
	 * @meta standard
	 * @see baidu.dom.insertBefore
	 *             
	 * @returns {HTMLElement} 被添加的目標元素
	 */
	baidu.dom.insertAfter = function (newElement, existElement) {
	    var g, existParent;
	    g = baidu.dom._g;
	    newElement = g(newElement);
	    existElement = g(existElement);
	    existParent = existElement.parentNode;
	    
	    if (existParent) {
	        existParent.insertBefore(newElement, existElement.nextSibling);
	    }
	    return newElement;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/insertBefore.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 將目標元素添加到基準元素之前
	 * @name baidu.dom.insertBefore
	 * @function
	 * @grammar baidu.dom.insertBefore(newElement, existElement)
	 * @param {HTMLElement|string} newElement 被添加的目標元素
	 * @param {HTMLElement|string} existElement 基準元素
	 * @meta standard
	 * @see baidu.dom.insertAfter
	 *             
	 * @returns {HTMLElement} 被添加的目標元素
	 */
	baidu.dom.insertBefore = function (newElement, existElement) {
	    var g, existParent;
	    g = baidu.dom._g;
	    newElement = g(newElement);
	    existElement = g(existElement);
	    existParent = existElement.parentNode;

	    if (existParent) {
	        existParent.insertBefore(newElement, existElement);
	    }

	    return newElement;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/insertHTML.js
	 * author: allstar, erik, berg,wenyuxiang,lixiaopeng
	 * version: 1.1.2
	 * date: 2010-07-13
	 */



	/**
	 * 在目標元素的指定位置插入HTML代碼
	 * @name baidu.dom.insertHTML
	 * @function
	 * @grammar baidu.dom.insertHTML(element, position, html)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} position 插入html的位置信息，取值為beforeBegin,afterBegin,beforeEnd,afterEnd
	 * @param {string} html 要插入的html
	 * @remark
	 * 
	 * 對於position參數，大小寫不敏感<br>
	 * 參數的意思：beforeBegin&lt;span&gt;afterBegin   this is span! beforeEnd&lt;/span&gt; afterEnd <br />
	 * 此外，如果使用本函數插入帶有script標簽的HTML字符串，script標簽對應的腳本將不會被執行。
	 * 
	 * @shortcut insertHTML
	 * @meta standard
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.insertHTML = function (element, position, html) {
	    element = baidu.dom.g(element);
	    var range,begin;

	    if (element.insertAdjacentHTML) {
	        element.insertAdjacentHTML(position, html);
	    } else {
	        // 這里不做"undefined" != typeof(HTMLElement) && !window.opera判斷，其它瀏覽器將出錯？！
	        // 但是其實做了判斷，其它瀏覽器下等於這個函數就不能執行了
	        range = element.ownerDocument.createRange();
	        // FF下range的位置設置錯誤可能導致創建出來的fragment在插入dom樹之後html結構亂掉
	        // 改用range.insertNode來插入html, by wenyuxiang @ 2010-12-14.
	        position = position.toUpperCase();
	        if (position == 'AFTERBEGIN' || position == 'BEFOREEND') {
	            range.selectNodeContents(element);
	            range.collapse(position == 'AFTERBEGIN');
	        } else {
	            begin = position == 'BEFOREBEGIN';
	            range[begin ? 'setStartBefore' : 'setEndAfter'](element);
	            range.collapse(begin);
	        }
	        range.insertNode(range.createContextualFragment(html));
	    }
	    return element;
	};

	baidu.insertHTML = baidu.dom.insertHTML;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/last.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/18
	 */



	/**
	 * 獲取目標元素的最後一個元素節點
	 * @name baidu.dom.last
	 * @function
	 * @grammar baidu.dom.last(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @see baidu.dom.first,baidu.dom.prev,baidu.dom.next
	 *             
	 * @returns {HTMLElement|null} 目標元素的最後一個元素節點，查找不到時返回null
	 */
	baidu.dom.last = function (element) {
	    return baidu.dom._matchNode(element, 'previousSibling', 'lastChild');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/next.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/18
	 */



	/**
	 * 獲取目標元素的下一個兄弟元素節點
	 * @name baidu.dom.next
	 * @function
	 * @grammar baidu.dom.next(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @see baidu.dom.first,baidu.dom.last,baidu.dom.prev
	 * @meta standard
	 * @returns {HTMLElement|null} 目標元素的下一個兄弟元素節點，查找不到時返回null
	 */
	baidu.dom.next = function (element) {
	    return baidu.dom._matchNode(element, 'nextSibling', 'nextSibling');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/prev.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/18
	 */



	/**
	 * 獲取目標元素的上一個兄弟元素節點
	 * @name baidu.dom.prev
	 * @function
	 * @grammar baidu.dom.prev(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @see baidu.dom.first,baidu.dom.last,baidu.dom.next
	 *             
	 *             
	 * @returns {HTMLElement|null} 目標元素的上一個兄弟元素節點，查找不到時返回null
	 */
	baidu.dom.prev = function (element) {
	    return baidu.dom._matchNode(element, 'previousSibling', 'previousSibling');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/escapeReg.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 將目標字符串中可能會影響正則表達式構造的字符串進行轉義。
	 * @name baidu.string.escapeReg
	 * @function
	 * @grammar baidu.string.escapeReg(source)
	 * @param {string} source 目標字符串
	 * @remark
	 * 給以下字符前加上“\”進行轉義：.*+?^=!:${}()|[]/\
	 * @meta standard
	 *             
	 * @returns {string} 轉義後的字符串
	 */
	baidu.string.escapeReg = function (source) {
	    return String(source)
	            .replace(new RegExp("([.*+?^=!:\x24{}()|[\\]\/\\\\])", "g"), '\\\x241');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/q.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */





	/**
	 * 通過className獲取元素
	 * @name baidu.dom.q
	 * @function
	 * @grammar baidu.dom.q(className[, element, tagName])
	 * @param {string} className 元素的class，只能指定單一的class，如果為空字符串或者純空白的字符串，返回空數組。
	 * @param {string|HTMLElement} [element] 開始搜索的元素，默認是document。
	 * @param {string} [tagName] 要獲取元素的標簽名，如果沒有值或者值為空字符串或者純空白的字符串，表示不限制標簽名。
	 * @remark 不保證返回數組中DOM節點的順序和文檔中DOM節點的順序一致。
	 * @shortcut q,T.Q
	 * @meta standard
	 * @see baidu.dom.g
	 *             
	 * @returns {Array} 獲取的元素集合，查找不到或className參數錯誤時返回空數組.
	 */
	baidu.dom.q = function (className, element, tagName) {
	    var result = [], 
	    trim = baidu.string.trim, 
	    len, i, elements, node;

	    if (!(className = trim(className))) {
	        return result;
	    }
	    
	    // 初始化element參數
	    if ('undefined' == typeof element) {
	        element = document;
	    } else {
	        element = baidu.dom.g(element);
	        if (!element) {
	            return result;
	        }
	    }
	    
	    // 初始化tagName參數
	    tagName && (tagName = trim(tagName).toUpperCase());
	    
	    // 查詢元素
	    if (element.getElementsByClassName) {
	        elements = element.getElementsByClassName(className); 
	        len = elements.length;
	        for (i = 0; i < len; i++) {
	            node = elements[i];
	            if (tagName && node.tagName != tagName) {
	                continue;
	            }
	            result[result.length] = node;
	        }
	    } else {
	        className = new RegExp(
	                        "(^|\\s)" 
	                        + baidu.string.escapeReg(className)
	                        + "(\\s|\x24)");
	        elements = tagName 
	                    ? element.getElementsByTagName(tagName) 
	                    : (element.all || element.getElementsByTagName("*"));
	        len = elements.length;
	        for (i = 0; i < len; i++) {
	            node = elements[i];
	            className.test(node.className) && (result[result.length] = node);
	        }
	    }

	    return result;
	};

	// 聲明快捷方法
	baidu.q = baidu.Q = baidu.dom.q;
	/*
	 * Tangram query
	 *
	 * code from https://github.com/hackwaly/Q
	 * 
	 * version: 1.0.0
	 * date: 20110801
	 * author: wenyuxiang
	 */




	/**
	 * 提供css選擇器功能
	 * @name baidu.dom.query
	 * @function
	 * @grammar baidu.dom.query(selector[, context, results])
	 * @param {String} selector 選擇器定義
	 * @param {HTMLElement | DOMDocument} [context] 查找的上下文
	 * @param {Array} [results] 查找的結果會追加到這個數組中
	 * @version 1.2
	 * @remark
	 * 
	            選擇器支持所有的<a href="http://www.w3.org/TR/css3-selectors/">css3選擇器</a> ，核心實現采用sizzle。可參考<a href="http://wiki.github.com/jeresig/sizzle/" target="_blank">sizzle 文檔</a>
	        
	 * @see baidu.dom.g, baidu.dom.q, baidu.dom.query.matches
	 *             
	 * @returns {Array}        包含所有篩選出的DOM元素的數組
	 */

	baidu.dom.query = (function (){
	    var d = document;
	    d._Q_rev = 0;

	    var MUTATION = false;
	    var _onMu = function (){
	        d._Q_rev ++;
	        MUTATION = true;
	    };
	    if (d.addEventListener) {
	        d.addEventListener('DOMNodeInserted', _onMu, false);
	        d.addEventListener('DOMNodeRemoved', _onMu, false);
	    }

	    var BY_ID1;
	    var BY_CLASS;
	    var IE678 = window.ActiveXObject && !d.addEventListener;
	    (function (){
	        var div = d.createElement('div');
	        div.innerHTML = '<a name="d"></a><div id="d"></div>';
	        BY_ID1 = div.getElementsByTagName('*')["d"] === div.lastChild;
	        div.innerHTML = '<div class="t e"></div><div class="t"></div>';
	        div.lastChild.className = 'e';
	        BY_CLASS = div.getElementsByClassName && div.getElementsByClassName('e').length == 2;
	    })();
	    var BY_NAME = !!d.getElementsByName;
	    var BY_ELEMENT = typeof d.documentElement.nextElementSibling !== 'undefined';
	    var BY_CHILDREN = !!d.documentElement.children;
	    var BY_CHILDREN_TAG = BY_CHILDREN && !!d.documentElement.children.tags;

	    var PATTERN = /(?:\s*([ ~+>,])\s*)?(?:([:.#]?)((?:[\w\u00A1-\uFFFF-]|\\.)+|\*)|\[\s*((?:[\w\u00A1-\uFFFF-]|\\.)+)(?:\s*([~^$|*!]?=)\s*((['"]).*?\7|[^\]]*))?\s*\])/g;

	    function trim(str){
	        return str.replace(/^\s*|\s*$/, '');
	    }
	    function make(kind, array){
	        return (array.kind = kind, array);
	    }
	    var parse = function (){
	        var text;
	        var index;

	        function match(regex){
	            var mc = (regex.lastIndex = index, regex.exec(text));
	            return mc && mc.index == index ? (index = regex.lastIndex, mc) : null;
	        }
	        function dequote(str){
	            var ch = str.charAt(0);
	            return ch == '"' || ch == "'" ? str.slice(1, -1) : str;
	        }
	        function error(){ throw ['ParseError', text, index]; }

	        function parse(){
	            var mc, simple, seq = [], chain = [seq], group = [chain];
	            while (mc = match(PATTERN)) {
	                if (mc[1]) {
	                    if (mc[1] == ',') group.push(chain = []);
	                    if (seq.length) chain.push(seq = []);
	                    if (mc[1] != ',') seq.comb = mc[1];
	                }
	                simple = [mc[4] || mc[3]];
	                if (mc[6]) simple.push(dequote(mc[6]));
	                simple.kind = mc[5] || (mc[4] ? '[' : mc[2] || 'T');
	                if (simple[0] == '*' && simple.kind != 'T') error();
	                if (mc[2] == ':') {
	                    simple.kind = ':' + mc[3];
	                    if (text.charAt(index) == '(') {
	                        index ++;
	                        if (mc[3] == 'not' || mc[3] == 'has') {
	                            var t = index;
	                            simple[0] = parse();
	                            simple[1] = text.slice(t, index);
	                            if (text.charAt(index) == ')') index ++; else error();
	                        } else {
	                            var tmpIndex = text.indexOf(')', index);
	                            if (tmpIndex != -1) {
	                                simple[0] = trim(text.slice(index, tmpIndex));
	                                index = tmpIndex + 1;
	                            } else error();

	                            if (mc[3].indexOf('nth') == 0) {
	                                var tmp = simple[0];
	                                tmp = (tmp == 'even' ? '2n' : tmp == 'odd' ? '2n+1' :
	                                    (tmp.indexOf('n') == -1 ? '0n': '') + tmp.replace(/\s*/g, '')).split('n');
	                                simple[0] = !tmp[0] ? 1 : Number(tmp[0]) | 0;
	                                simple[1] = Number(tmp[1]) | 0;
	                            } else if (mc[3] == 'contains') {
	                                simple[0] = dequote(simple[0]);
	                            }
	                        }
	                    }
	                }
	                seq.push(simple);
	            }
	            return group;
	        }

	        return function (selector){
	            return (text = selector, index = 0, selector = parse(), match(/\s*/g), index < text.length) ? error() : selector;
	        };

	    }();

	    var fRMap = { '#': 9, 'N': BY_NAME ? 7 : 0, '.': BY_CLASS ? 6 : 0, 'T': 5 };
	    var tRMap = { '#': 9, '=': 9, '[': 8, 'N': 9, 'T': 8, '.': 5,  '~=': 3, '|=': 3, '*=': 3,
	        ':not': 6, ':has': 1, ':contains': 3, ':nth-child': 2, ':nth-last-child': 2,
	        ':first-child': 3, ':last-child': 3, ':only-child': 3, ':not-ex': 7 };
	    var efMap = { id: '#', name: 'N' };
	    var testingOrder = function (a, b){ return a.tR - b.tR; };
	    var regPos = /:(nth|eq|gt|lt|first|last|even|odd)$/;

	    function process(seq){
	        var finder, t;
	        var k = seq.length;
	        while (k --) {
	            var simple = seq[k];
	            // 轉化[id="xxx"][name="xxx"][tagName="xxx"][className~="xxx"]之類的選擇器
	            // 識別:root,html|head|body|title等全局僅一個的標簽的選擇器，忽略*選擇器
	            // 合並類選擇器以便於使用getElementsByClassName
	            if (simple.kind == ':html') simple = make('T', 'html');
	            if (simple.kind == '=') {
	                if (efMap[simple[0]]) simple = make(efMap[simple[0]], [simple[1]]);
	            } else if (simple.kind == '~=' && simple[0] == 'className') simple = make('.', [simple[1]]);
	            if (simple.kind == 'T') {
	                if (simple[0] == '*') simple.kind = '*'; else seq.tag = simple;
	                t = simple[0].toLowerCase();
	            } else if (simple.kind == '.') {
	                if (!seq.classes) seq.classes = simple; else {
	                    seq.classes.push(simple[0]);
	                    simple.kind = '*';
	                }
	            }
	            if (simple.kind == ':not' && !((t=simple[0],t.length==1)&&(t=t[0],t.length==1))) {
	                simple.kind = ':not-ex';
	            }
	            //remark: 這里是為了支持sizzle的setFilter系列
	            if (regPos.test(simple.kind)) {
	                simple[0] = Number(simple[0]) | 0;
	                var newSimple = make(simple.kind, simple.slice(0));
	                simple.kind = '*';
	                if (!seq.allPoses) {
	                    seq.allPoses = [newSimple];
	                } else {
	                    seq.allPoses.push(newSimple);
	                }
	            }
	            // 計算選擇器的得分用於優先級排序等策略
	            simple.fR = fRMap[simple.kind] | 0;
	            simple.tR = tRMap[simple.kind] | 0;
	            if (simple.fR && (!finder || simple.fR > finder.fR)) finder = simple;
	            seq[k] = simple;
	        }
	        // 按照優先級對用於測試的選擇器進行排序
	        seq.sort(testingOrder);
	        // 記錄用於getElementXXX的最佳的選擇器
	        seq.$ = finder;
	        return seq;
	    }
	    // 對chain進行處理
	    // 注意為了處理方便, 返回的數組是倒序的
	    // div p a => [div] [p] [a]
	    // div p>a => [div] [p>a]
	    function slice(chain){
	        var part = [];
	        var parts = [part];
	        var k = chain.length;
	        while (k --) {
	            var seq = chain[k];
	            seq = process(seq);
	            seq.N = 'node' + k;
	            //remark: 這里是為了支持sizzle的setFilter.
	            if (seq.allPoses) {
	                if (!chain.allPoses) {
	                    chain.allPoses = [];
	                }
	                chain.allPoses.push.apply(chain.allPoses, seq.allPoses);
	            }
	            if (seq.$ && (!part.fR || seq.$.fR > part.fR || (seq.$.fR == part.fR && parts.length == 1))) {
	                part.fR = seq.$.fR;
	                part.fI = part.length;
	            }
	            part.push(seq);
	            if (seq.comb == ' ' && k && part.fI != null) {
	                parts.push(part = []);
	                part.fR = 0;
	            }
	            if (k == chain.length - 1 && seq.tag) chain.tag = seq.tag;
	        }
	        for (var i=0; i<parts.length; i++) {
	            part = parts[i];
	            var part1 = parts[i + 1];
	            if (part1 != null) {
	                if (part.fR > part1.fR || (part.fR == part1.fR && part1.fI != 0)){
	                    parts.splice(i + 1, 1);
	                    part.push.apply(part, part1);
	                    i --;
	                } else {
	                    part.R = part1[0].N;
	                }
	            } else {
	                part.R = 'root';
	            }
	        }
	        // 如果沒有找到任何一個可以用於find的seq.
	        if (parts[0].fI == null) {
	            parts[0].fI = 0;
	            parts[0][0].$ = make('*', ['*']);
	        }
	        return parts;
	    }

	    function format(tpl, params){
	        return tpl.replace(/#\{([^}]+)\}/g, function (m, p){
	            return params[p] == null ? m : params[p] + '';
	        });
	    }

	    var CTX_NGEN = 0;

	    var TPL_DOC = '/*^var doc=root.ownerDocument||root;^*/';
	    var TPL_XHTML = TPL_DOC + '/*^var xhtml=Q._isXHTML(doc);^*/';
	    var TPL_CONTAINS = IE678 ? '#{0}.contains(#{1})' : '#{0}.compareDocumentPosition(#{1})&16';
	    var TPL_QID = '#{N}._Q_id||(#{N}._Q_id=++qid)';
	    var TPL_FIND = {
	        '#': 'var #{N}=Q._byId("#{P}", #{R});if(#{N}){#{X}}',
	        'N': TPL_DOC + 'var #{N}A=doc.getElementsByName("#{P}");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){if(#{R}===doc||' + format(TPL_CONTAINS, ['#{R}', '#{N}']) +'){#{X}}}',
	        'T': 'var #{N}A=#{R}.getElementsByTagName("#{P}");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){#{X}}',
	        '.': 'var #{N}A=#{R}.getElementsByClassName("#{P}");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){#{X}}',
	        '*': 'var #{N}A=#{R}.getElementsByTagName("*");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){#{X}}',
	        '+': BY_ELEMENT ? '/*^var #{N};^*/if(#{N}=#{R}.nextElementSibling){#{X}}' : 'var #{N}=#{R};while(#{N}=#{N}.nextSibling){if(#{N}.nodeType==1){#{X}break;}}',
	        '~': BY_ELEMENT ? '/*^var #{N}H={};^*/var #{N}=#{R};while(#{N}=#{N}.nextElementSibling){if(#{N}H[' + TPL_QID + '])break;#{N}H[' + TPL_QID + ']=1;#{X}}' : '/*^var #{N}H={};^*/var #{N}=#{R};while(#{N}=#{N}.nextSibling){if(#{N}.nodeType==1){if(#{N}H[' + TPL_QID + '])break;#{N}H[' + TPL_QID + ']=1;#{X}}}',
	        '>': 'var #{N}A=#{R}.children||#{R}.childNodes;for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){if(#{N}.nodeType==1){#{X}}}',
	        '>T': 'var #{N}A=#{R}.children.tags("#{P}");for(var #{N}I=0,#{N};#{N}=#{N}A[#{N}I];#{N}I++){#{X}}'
	    };
	    var TPL_LEFT = 'var #{R}V={_:false};NP_#{R}:{P_#{R}:{#{X}break NP_#{R};}#{R}V._=true;#{Y}}';
	    var TPL_TOPASS = 'if(t=#{N}H[' + TPL_QID + ']){if(t._){break P_#{R};}else{break NP_#{R};}}#{N}H[' + TPL_QID + ']=#{R}V;#{X}';
	    var TPL_TOPASS_UP = format(TPL_TOPASS, { X: 'if(#{N}!==#{R}){#{X}}' });
	    var TPL_PASSED = 'break P_#{R};';
	    var TPL_PASS = {
	        '>': '/*^var #{N}H={};^*/var #{N}=#{C}.parentNode;' + TPL_TOPASS_UP,
	        ' ': '/*^var #{N}H={};^*/var #{N}=#{C};while(#{N}=#{N}.parentNode){' + TPL_TOPASS_UP + '}',
	        '+': BY_ELEMENT ? '/*^var #{N}H={};var #{N};^*/if(#{N}=#{C}.previousElementSibling){#{X}}' : '/*^var #{N}H={};^*/var #{N}=#{C};while(#{N}=#{N}.previousSibling){#{X}break;}',
	        '~': BY_ELEMENT ? '/*^var #{N}H={};^*/var #{N}=#{C};while(#{N}=#{N}.previousElementSibling){' + TPL_TOPASS + '}' : '/*^var #{N}H={};^*/var #{N}=#{C};while(#{N}=#{N}.previousSibling){' + TPL_TOPASS + '}'
	    };
	    var TPL_MAIN = 'function(root){var result=[];var qid=Q.qid,t,l=result.length;BQ:{#{X}}Q.qid=qid;return result;}';
	    var TPL_HELP = '/*^var #{N}L;^*/if(!#{N}L||!(' + format(TPL_CONTAINS, ['#{N}L', '#{N}']) +')){#{X}#{N}L=#{N};}';
	    var TPL_PUSH = 'result[l++]=#{N};';
	    var TPL_INPUT_T = TPL_XHTML + '/*^var input_t=!xhtml?"INPUT":"input";^*/';
	    var TPL_POS = '/*^var pos=-1;^*/';
	    var TPL_TEST = {
	        'T': TPL_XHTML +'/*^var #{N}T=!xhtml?("#{0}").toUpperCase():"#{0}";^*/#{N}.nodeName==#{N}T',
	        '#': '#{N}.id=="#{0}"',
	        'N': '#{N}.name=="#{0}"',

	        '[': IE678 ? '(t=#{N}.getAttributeNode("#{0}"))&&(t.specified)' : '#{N}.hasAttribute("#{0}")',
	        '=': '#{A}=="#{1}"',
	        '!=': '#{A}!="#{1}"',
	        '^=': '(t=#{A})&&t.slice(0,#{L})=="#{1}"',
	        '$=': '(t=#{A})&&t.slice(-#{L})=="#{1}"',
	        '*=': '(t=#{A})&&t.indexOf("#{1}")!==-1',
	        '|=': '(t=#{A})&&(t=="#{1}"||t.slice(0,#{L})=="#{P}")',
	        '~=': '(t=#{A})&&(" "+t+" ").indexOf("#{P}")!==-1',

	        ':element': '#{N}.nodeType==1',
	        ':contains': '(#{N}.textContent||#{N}.innerText).indexOf("#{0}")!==-1',
	        ':first-child': BY_ELEMENT ? '#{N}.parentNode.firstElementChild===#{N}' : 'Q._isFirstChild(#{N})',
	        ':nth-child': TPL_DOC + '/*^var rev=doc._Q_rev||(doc._Q_rev=Q.qid++);^*/Q._index(#{N},#{0},#{1},rev)',
	        ':last-child': BY_ELEMENT ? '#{N}.parentNode.lastElementChild===#{N}' : 'Q._isLastChild(#{N})',
	        ':only-child': BY_ELEMENT ? '(t=#{N}.parentNode)&&(t.firstElementChild===#{N}&&t.lastElementChild===#{N})' : 'Q._isOnlyChild(#{N})',

	        ':not-ex': '/*^var _#{G}=Q._hash(Q("#{1}",root));qid=Q.qid;^*/!_#{G}[' + TPL_QID + ']',
	        ':has': '(t=Q("#{1}", #{N}),qid=Q.qid,t.length>0)',
	        ':parent': '!!#{N}.firstChild',
	        ':empty': '!#{N}.firstChild',

	        ':header': '/h\\d/i.test(#{N}.nodeName)',
	        ':input': '/input|select|textarea|button/i.test(#{N}.nodeName)',
	        ':enabled': '#{N}.disabled===false&&#{N}.type!=="hidden"',
	        ':disabled': '#{N}.disabled===true',
	        ':checked': '#{N}.checked===true',
	        ':selected': '(#{N}.parentNode.selectedIndex,#{N}.selected===true)',

	        // TODO: 這些偽類可以轉化成為標簽選擇器加以優化！
	        ':focus': TPL_DOC + '#{N}===doc.activeElement',
	        ':button': TPL_INPUT_T + '#{N}.nodeName==="button"||(#{N}.nodeName===input_t&&#{N}.type==="button")',
	        ':submit': TPL_INPUT_T + '#{N}.nodeName===input_t&&#{N}.type==="submit"',
	        ':reset': TPL_INPUT_T + '#{N}.nodeName===input_t&&#{N}.type==="reset"',
	        ':text': TPL_INPUT_T + '#{N}.nodeName===input_t&&#{N}.type==="text"&&(t=#{N}.getAttribute("type"),t==="text"||t===null)',
	        ':radio': TPL_INPUT_T + '#{N}.nodeName===input_t&&#{N}.type==="radio"',
	        ':checkbox': TPL_INPUT_T + '#{N}.nodeName===input_t&&#{N}.type==="checkbox"',
	        ':file': TPL_INPUT_T + '#{N}.nodeName===input_t&&#{N}.type==="file"',
	        ':password': TPL_INPUT_T + '#{N}.nodeName===input_t&&#{N}.type==="password"',
	        ':image': TPL_INPUT_T + '#{N}.nodeName===input_t&&#{N}.type==="image"'
	    };

	    function genAttrCode(attr){
	        if (attr == 'for') return '#{N}.htmlFor';
	        if (attr == 'class') return '#{N}.className';
	        if (attr == 'type') return '#{N}.getAttribute("type")';
	        if (attr == 'href') return '#{N}.getAttribute("href",2)';
	        return '(#{N}["' + attr + '"]||#{N}.getAttribute("' + attr + '"))';
	    }

	    function genTestCode(simple){
	        if (simple.kind.indexOf('=') !== -1) {
	            simple.A = genAttrCode(simple[0]);
	        }
	        var t;
	        switch (simple.kind) {
	        case '.':
	            var k = simple.length;
	            var buff = [];
	            while (k --) {
	                buff.push('t.indexOf(" #{'+ k +'} ")!==-1');
	            }
	            return format('(t=#{N}.className)&&((t=" "+t+" "),(' + buff.join(' && ') + '))', simple);
	        case '^=':
	        case '$=':
	            simple.L = simple[1].length;
	            break;
	        case '|=':
	            simple.L = simple[1].length + 1;
	            simple.P = simple[1] + '-';
	            break;
	        case '~=':
	            simple.P = ' ' + simple[1] + ' ';
	            break;
	        case ':nth-child':
//	        case ':nth-last-child':
	            if (simple[0] == 1 && simple[1] == 0) return '';
	            break;
	        case ':not':
	            t = genCondCode(simple[0][0][0]);
	            return t ? '!(' + t + ')' : 'false';
	        case ':not-ex':
	        case ':has':
	            simple.G = CTX_NGEN ++;
	            break;
	        case '*':
	            return '';
	        }
	        return format(TPL_TEST[simple.kind], simple);
	    }
	    function genCondCode(seq){
	        var buff = [];
	        var k = seq.length;
	        var code;
	        while (k --) {
	            var simple = seq[k];
	            if (code = genTestCode(simple)) {
	                buff.push(code);
	            }
	        }
	        return buff.join(' && ');
	    }
	    function genThenCode(seq){
	        var code = genCondCode(seq);
	        return code ? format('if('+code+'){#{X}}', { N: seq.N }) : '#{X}';
	    }
	    var NEEDNOT_ELEMENT_CHECK = { '#': 1, 'T': 1, '.': 1, 'N': 1, ':element': 1 };
	    function genFindCode(seq, R, comb){
	        comb = comb || seq.comb;
	        var tpl;
	        if (comb == ' ') {
	            var finder = seq.$;
	            if (finder) {
	                tpl = TPL_FIND[finder.kind];
	                // 有hack的嫌疑, 讓產生test代碼時忽略已經用於find的seq.
	                finder.kind = '*';
	            } else {
	                tpl = TPL_FIND['*'];
	                if (IE678 && !NEEDNOT_ELEMENT_CHECK[seq[seq.length - 1].kind]) {
	                    seq.push(make(':element', []));
	                }
	            }
	        } else if (BY_CHILDREN_TAG && comb == '>' && seq.tag) {
	            tpl = TPL_FIND['>T'];
	            finder = seq.tag;
	            seq.tag.kind = '*';
	        } else {
//	            if (!BY_ELEMENT && (comb == '+' || comb == '~') && !NEEDNOT_ELEMENT_CHECK[seq[seq.length - 1].kind]) {
//	                seq.push(make(':element', []));
//	            }
	            tpl = TPL_FIND[comb];
	        }
	        return format(tpl, {
	            P: finder && (finder.kind == '.' ? finder.join(' ') : finder[0]),
	            N: seq.N,
	            R: R,
	            X: genThenCode(seq)
	        });
	    }
	    function genNextCode(part, thenCode){
	        var code = '#{X}';
	        var k = part.fI;
	        while (k --) {
	            code = format(code, { X: genFindCode(part[k], part[k+1].N) });
	        }
	        var nextCode;
	        if (!thenCode) {
	            if (part.fI == 0 && (k = part[0].$.kind) && (k != 'S' && k != '#')) {
	                nextCode = format(TPL_HELP, { N: part[0].N });
	                code = format(code, { X: nextCode })
	            }
	        } else {
	            nextCode = format(thenCode, { N: part[0].N });
	            code = format(code, { X: nextCode });
	        }
	        return code;
	    }
	    function genPassCode(seq, C, comb){
	        return format(TPL_PASS[comb], {
	            N: seq.N,
	            C: C,
	            X: genThenCode(seq)
	        });
	    }
	    function genLeftCode(part){
	        var code = TPL_LEFT;
	        for (var i=part.fI+1,l=part.length; i<l; i++) {
	            var seq = part[i];
	            var lastSeq = part[i-1];
	            code = format(code, { X: genPassCode(seq, lastSeq.N, part[i-1].comb) });
	        }
	        code = format(code, { X: TPL_PASSED });
	        code = format(code, { R: part.R });
	        return code;
	    }
	    function genPartCode(part, thenCode){
	        var code = genFindCode(part[part.fI], part.R, ' ');
	        var nextCode = genNextCode(part, thenCode);
	        if (part.fI < part.length - 1) {
	            var passCode = genLeftCode(part);
	            nextCode = format(passCode, { Y: nextCode });
	        }
	        return format(code, { X: nextCode });
	    }

	    function genThatCode(seq){
	        var obj = {};
	        var k = seq.length;
	        while (k --) {
	            var simple = seq[k];
	            if (simple.kind == ':first') {
	                simple = make(':nth', [0]);
	            } else if (simple.kind == ':last') {
	                obj.last = 1;
	            }
	            if (simple.kind == ':lt') {
	                obj.lt = obj.lt === undefined ? simple[0] : Math.min(obj.lt, simple[0]);
	            } else if (simple.kind == ':gt') {
	                obj.gt = obj.gt === undefined ? simple[0] : Math.max(obj.gt, simple[0]);
	            } else if (simple.kind == ':eq' || simple.kind == ':nth') {
	                if (obj.eq && obj.eq !== simple[0]) {
	                    obj.no = true;
	                } else obj.eq = simple[0];
	            } else if (simple.kind == ':even' || simple.kind == ':odd') {
	                obj[simple.kind.slice(1)] = 1;
	            }
	        }
	        if ((obj.lt != null && obj.eq != null && obj.eq >= obj.lt) || (obj.lt != null && obj.gt != null && obj.lt <= obj.gt) || (obj.even && obj.odd)) {
	            obj.no = 1;
	        }

	        if (obj.no) {
	            return '/*^break BQ;^*/';
	        }
	        var buff = [];
	        if (obj.even) {
	            buff.push('pos%2===0');
	        } else if (obj.odd) {
	            buff.push('pos%2===1');
	        }
	        var code = obj.eq == null ? TPL_PUSH : 'if(pos===' + obj.eq + '){result=[#{N}];break BQ;}';
	        if (obj.gt != null) {
	            buff.push('pos>'+obj.gt);
	        }
	        code = buff.length ? 'if (' + buff.join('&&') + '){' + code + '}' : code;
	        code = obj.lt != null ? 'if (pos<' + obj.lt + '){' + code + '}else break BQ;' : code;
	        if (obj.last) {
	            code += '/*$result=result.slice(-1);$*/';
	        }
	        return code;
	    }
	    function genCode(chain){
	        var parts = slice(chain);

	        var thenCode = chain.allPoses ? TPL_POS + 'pos++;' + genThatCode(chain.allPoses) : TPL_PUSH;
	        CTX_NGEN = 0;
	        var code = '#{X}';

	        var k = parts.length;
	        while (k --) {
	            var part = parts[k];
	            code = format(code, { X: genPartCode(part, k == 0 ? thenCode : false ) });
	        }
	        return code;
	    }

	    var documentOrder;
	    if (d.documentElement.sourceIndex) {
	        documentOrder = function (nodeA, nodeB){ return nodeA === nodeB ? 0 : nodeA.sourceIndex - nodeB.sourceIndex; };
	    } else if (d.compareDocumentPosition) {
	        documentOrder = function (nodeA, nodeB){ return nodeA === nodeB ? 0 : nodeB.compareDocumentPosition(nodeA) & 0x02 ? -1 : 1; };
	    }
	    function uniqueSort(nodeSet, notUnique){
	        if (!nodeSet.length) return nodeSet;
	        nodeSet.sort(documentOrder);
	        if (notUnique) return nodeSet;
	        var resultSet = [nodeSet[0]];
	        var node, j = 0;
	        for (var i=1, l=nodeSet.length; i<l; i++) {
	            if (resultSet[j] !== (node = nodeSet[i])) {
	                resultSet[++ j] = node;
	            }
	        }
	        return resultSet;
	    }

	    function compile(expr){
	        var group = parse(expr);
	        var tags = {};
	        var k = group.length;
	        while (k --) {
	            var chain = group[k];
	            var code = genCode(chain);
	            if (tags && chain.tag && !tags[chain.tag[0]]) {
	                tags[chain.tag[0]] = 1;
	            } else {
	                tags = null;
	            }
	            var hash = {};
	            var pres = [];
	            var posts = [];
	            code = code.replace(/\/\*\^(.*?)\^\*\//g, function (m, p){
	                return (hash[p] || (hash[p] = pres.push(p)), '');
	            });
	            code = code.replace(/\/\*\$(.*?)\$\*\//g, function (m, p){
	                return (hash[p] || (hash[p] = posts.push(p)), '');
	            });
	            code = format(TPL_MAIN, { X: pres.join('') + code + posts.join('') });
	            group[k] = new Function('Q', 'return(' + code + ')')(Q);
	        }
	        if (group.length == 1) {
	            return group[0];
	        }
	        return function (root){
	            var k = group.length;
	            var result = [];
	            while (k --) {
	                result.push.apply(result, group[k](root));
	            }
	            return uniqueSort(result, tags != null);
	        };
	    }

	    Q._hash = function (result){
	        var hash = result._Q_hash;
	        if (hash == null) {
	            hash = result._Q_hash = {};
	            var k = result.length;
	            var qid = Q.qid;
	            while (k --) {
	                var el = result[k];
	                hash[el._Q_id||(el._Q_id=++qid)] = 1;
	            }
	            Q.qid = qid;
	        }
	        return hash;
	    };
	    var _slice = Array.prototype.slice;
	    Q._toArray1 = function (staticNodeList){
	        var k = staticNodeList.length;
	        var a = new Array(k);
	        while (k --) {
	            a[k] = staticNodeList[k];
	        }
	        return a;
	    };
	    Q._toArray = function (staticNodeList){
	        try {
	            return _slice.call(staticNodeList, 0);
	        } catch(ex){}
	        return (Q._toArray = Q._toArray1)(staticNodeList);
	    };

	    function queryXML(expr, root){
	        throw ['NotImpl'];
	    }
	    var cache = {};
	    var inQuery = false;
	    function query(expr, root){
	        var doc = root.ownerDocument || root;
	        var ret;
	        if (!doc.getElementById) {
	            return queryXML(expr, root);
	        }
	        if (root === doc && doc.querySelectorAll && !/#/.test(expr)) {
	            try { return Q._toArray(doc.querySelectorAll(expr)); } catch(ex){}
	        }
	        var fn  = cache[expr] || (cache[expr] = compile(expr));
	        if (!inQuery) {
	            inQuery = true;
	            if (!MUTATION) {
	                doc._Q_rev = Q.qid ++;
	            }
	            ret = fn(root);
	            inQuery = false;
	        } else {
	            ret = fn(root);
	        }
	        return ret;
	    }

	    Q.qid = 1;
	    Q._byId = function (id, root){
	        if (BY_ID1) {
	            return root.getElementsByTagName('*')[id];
	        }
	        var doc = root.ownerDocument || root;
	        var node = doc.getElementById(id);
	        if (node && ((root === doc) || Q.contains(root, node)) && (!IE678 || (node.id === id || node.getAttributeNode('id').nodeValue === id))) {
	            return node;
	        }
	        return null;
	    };
	    Q._in = function (nodes, nodeSet){
	        var hash = Q._hash(nodeSet);
	        var ret = [];
	        for (var i=0; i<nodes.length; i++) {
	            var node = nodes[i];
	            if (hash[node._Q_id||(node._Q_id=++Q.qid)]) {
	                ret.push(node);
	            }
	        }
	        return ret;
	    };
	    Q.matches = function (expr, set){
	        return Q(expr, null, null, set);
	    };
	    Q.contains = d.documentElement.contains ? function (a, b){
	        return a !== b && a.contains(b);
	    } : function (a, b) {
	        return a !== b && a.compareDocumentPosition(b) & 16;
	    };
	    Q._has = function (node, nodes){
	        for (var i=0, tnode; tnode=nodes[i++];) {
	            if (!Q.contains(node, tnode)) return false;
	        }
	        return true;
	    };
	    Q._index = function (node, a, b, rev){
	        var parent = node.parentNode;
	        if (parent._Q_magic !== rev) {
	            var tnode;
	            var count = 1;
	            if (BY_ELEMENT) {
	                tnode = parent.firstElementChild;
	                while (tnode) {
	                    tnode._Q_index = count ++;
	                    tnode = tnode.nextElementSibling;
	                }
	            } else {
	                var nodes = parent.children || parent.childNodes;
	                for (var i=0; tnode=nodes[i]; i++) {
	                    if (tnode.nodeType == 1) {
	                        tnode._Q_index = count ++;
	                    }
	                    tnode = tnode.nextSibling;
	                }
	            }
	            parent._Q_count1 = count;
	            parent._Q_magic = rev;
	        }
	        return a ? (node._Q_index - b) % a == 0 : node._Q_index == b;
	    };
	    Q._isOnlyChild = function (node){
	        return Q._isFirstChild(node) && Q._isLastChild(node);
	    };
	    Q._isFirstChild = function (node){
	        while (node = node.previousSibling) {
	            if (node.nodeType == 1) return false;
	        }
	        return true;
	    };
	    Q._isLastChild = function (node){
	        while (node = node.nextSibling) {
	            if (node.nodeType == 1) return false;
	        }
	        return true;
	    };
	    Q._isXHTML = function (doc){
	        return doc.documentElement.nodeName == 'html';
	    };
	    function Q(expr, root, result, seed){
	        root = root || d;
	        var ret = query(expr, root);
	        if (seed) {
	            ret = Q._in(seed, ret);
	        }
	        if (result) {
	            ret.push.apply(result, ret);
	        } else {
	            result = ret;
	        }
	        return result;
	    }
	    return Q;
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */






	/**
	 * 使函數在頁面dom節點加載完畢時調用
	 * @author allstar
	 * @name baidu.dom.ready
	 * @function
	 * @grammar baidu.dom.ready(callback)
	 * @param {Function} callback 頁面加載完畢時調用的函數.
	 * @remark
	 * 如果有條件將js放在頁面最底部, 也能達到同樣效果，不必使用該方法。
	 * @meta standard
	 */
	(function() {

	    var ready = baidu.dom.ready = function() {
	        var readyBound = false,
	            readyList = [],
	            DOMContentLoaded;

	        if (document.addEventListener) {
	            DOMContentLoaded = function() {
	                document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);
	                ready();
	            };

	        } else if (document.attachEvent) {
	            DOMContentLoaded = function() {
	                if (document.readyState === 'complete') {
	                    document.detachEvent('onreadystatechange', DOMContentLoaded);
	                    ready();
	                }
	            };
	        }

	        function ready() {
	            if (!ready.isReady) {
	                ready.isReady = true;
	                for (var i = 0, j = readyList.length; i < j; i++) {
	                    readyList[i]();
	                }
	            }
	        }

	        function doScrollCheck(){
	            try {
	                document.documentElement.doScroll("left");
	            } catch(e) {
	                setTimeout( doScrollCheck, 1 );
	                return;
	            }   
	            ready();
	        }

	        function bindReady() {
	            if (readyBound) {
	                return;
	            }
	            readyBound = true;

	            if (document.addEventListener) {

	                document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
	                window.addEventListener('load', ready, false);

	            } else if (document.attachEvent) {

	                document.attachEvent('onreadystatechange', DOMContentLoaded);
	                window.attachEvent('onload', ready);

	                var toplevel = false;

	                try {
	                    toplevel = window.frameElement == null;
	                } catch (e) {}

	                if (document.documentElement.doScroll && toplevel) {
	                    doScrollCheck();
	                }
	            }
	        }
	        bindReady();

	        return function(callback) {
	            ready.isReady ? callback() : readyList.push(callback);
	        };
	    }();

	    ready.isReady = false;
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/remove.js
	 * author: allstar,berg
	 * version: 1.1.0
	 * date: 2009/11/17
	 */




	/**
	 * 從DOM樹上移除目標元素
	 * @name baidu.dom.remove
	 * @function
	 * @grammar baidu.dom.remove(element)
	 * @param {HTMLElement|string} element 需要移除的元素或元素的id
	 * @remark
	 * <b>注意：</b>對於移除的dom元素，IE下會釋放該元素的空間，繼續使用該元素的引用進行操作將會引發不可預料的問題。
	 * @meta standard
	 */
	baidu.dom.remove = function (element) {
	    element = baidu.dom._g(element);
		var tmpEl = element.parentNode;
	    //去掉了對ie下的特殊處理：創建一個div，appendChild，然後div.innerHTML = ""
	    tmpEl && tmpEl.removeChild(element);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/removeClass.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */




	/**
	 * 移除目標元素的className
	 * @name baidu.dom.removeClass
	 * @function
	 * @grammar baidu.dom.removeClass(element, className)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {string} className 要移除的className，允許同時移除多個class，中間使用空白符分隔
	 * @remark
	 * 使用者應保證提供的className合法性，不應包含不合法字符，className合法字符參考：http://www.w3.org/TR/CSS2/syndata.html。
	 * @shortcut removeClass
	 * @meta standard
	 * @see baidu.dom.addClass
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.removeClass = function (element, className) {
	    element = baidu.dom.g(element);

	    var oldClasses = element.className.split(/\s+/),
	        newClasses = className.split(/\s+/),
	        lenOld,
	        lenDel = newClasses.length,
	        j,
	        i = 0;
	    //考慮到同時刪除多個className的應用場景概率較低,故放棄進一步性能優化 
	    // by rocy @1.3.4
	    for (; i < lenDel; ++i){
	        for(j = 0, lenOld = oldClasses.length; j < lenOld; ++j){
	            if(oldClasses[j] == newClasses[i]){
	            	oldClasses.splice(j, 1);
	            	break;
	            }
	        }
	    }
	    element.className = oldClasses.join(' ');
	    return element;
	};

	// 聲明快捷方法
	baidu.removeClass = baidu.dom.removeClass;
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 *
	 * path: baidu/dom/removeStyle.js
	 * author: wenyuxiang, berg
	 * version: 1.0.1
	 * date: 2010/9/10
	 */




	/**
	 * 刪除元素的某個樣式
	 * @name baidu.dom.removeStyle
	 * @function
	 * @grammar baidu.dom.removeStyle(element, styleName)
	 * @param {HTMLElement|String} element 需要刪除樣式的元素或者元素id
	 * @param {string} styleName 需要刪除的樣式名字
	 * @version 1.3
	 * @see baidu.dom.setStyle
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	 
	// todo: 1. 只支持現代瀏覽器，有一些老瀏覽器可能不支持; 2. 有部分屬性無法被正常移除
	baidu.dom.removeStyle = function (){
	    var ele = document.createElement("DIV"),
	        fn,
	        _g = baidu.dom._g;
	    
	    if (ele.style.removeProperty) {// W3C, (gecko, opera, webkit)
	        fn = function (el, st){
	            el = _g(el);
	            el.style.removeProperty(st);
	            return el;
	        };
	    } else if (ele.style.removeAttribute) { // IE
	        fn = function (el, st){
	            el = _g(el);
	            el.style.removeAttribute(baidu.string.toCamelCase(st));
	            return el;
	        };
	    }
	    ele = null;
	    return fn;
	}();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/object/each.js
	 * author: berg
	 * version: 1.1.1
	 * date: 2010-04-19
	 */



	/**
	 * 遍歷Object中所有元素，1.1.1增加
	 * @name baidu.object.each
	 * @function
	 * @grammar baidu.object.each(source, iterator)
	 * @param {Object} source 需要遍歷的Object
	 * @param {Function} iterator 對每個Object元素進行調用的函數，function (item, key)
	 * @version 1.1.1
	 *             
	 * @returns {Object} 遍歷的Object
	 */
	baidu.object.each = function (source, iterator) {
	    var returnValue, key, item; 
	    if ('function' == typeof iterator) {
	        for (key in source) {
	            if (source.hasOwnProperty(key)) {
	                item = source[key];
	                returnValue = iterator.call(source, item, key);
	        
	                if (returnValue === false) {
	                    break;
	                }
	            }
	        }
	    }
	    return source;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷目標參數是否number類型或Number對象
	 * @name baidu.lang.isNumber
	 * @function
	 * @grammar baidu.lang.isNumber(source)
	 * @param {Any} source 目標參數
	 * @meta standard
	 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
	 *             
	 * @returns {boolean} 類型判斷結果
	 * @remark 用本函數判斷NaN會返回false，盡管在Javascript中是Number類型。
	 */
	baidu.lang.isNumber = function (source) {
	    return '[object Number]' == Object.prototype.toString.call(source) && isFinite(source);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/getTarget.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 獲取事件的觸發元素
	 * @name baidu.event.getTarget
	 * @function
	 * @grammar baidu.event.getTarget(event)
	 * @param {Event} event 事件對象
	 * @meta standard
	 * @returns {HTMLElement} 事件的觸發元素
	 */
	 
	baidu.event.getTarget = function (event) {
	    return event.target || event.srcElement;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */









	/**
	 * 按照border-box模型設置元素的height和width值。只支持元素的padding/border/height/width使用同一種計量單位的情況。<br/> 不支持：<br/> 1. 非數字值(medium)<br/> 2. em/px在不同的屬性中混用
	 * @name baidu.dom.setBorderBoxSize
	 * @author berg
	 * @function
	 * @grammar baidu.dom.setBorderBoxSize(element, size)
	 * @param {HTMLElement|string} element 元素或DOM元素的id
	 * @param {object} size 包含height和width鍵名的對象
	 *
	 * @see baidu.dom.setBorderBoxWidth, baidu.dom.setBorderBoxHeight
	 *
	 * @return {HTMLElement}  設置好的元素
	 */
	baidu.dom.setBorderBoxSize= function (element, size) {
	    var result = {};
	    size.width && (result.width = parseFloat(size.width));
	    size.height && (result.height = parseFloat(size.height));

	    function getNumericalStyle(element, name){
	        return parseFloat(baidu.getStyle(element, name)) || 0;
	    }
	    
	    if(baidu.browser.isStrict){
	        if(size.width){
	            result.width = parseFloat(size.width)  -
	                           getNumericalStyle(element, 'paddingLeft') - 
	                           getNumericalStyle(element, 'paddingRight') - 
	                           getNumericalStyle(element, 'borderLeftWidth') -
	                           getNumericalStyle(element, 'borderRightWidth');
	            result.width < 0 && (result.width = 0);
	        }
	        if(size.height){
	            result.height = parseFloat(size.height) -
	                            getNumericalStyle(element, 'paddingTop') - 
	                            getNumericalStyle(element, 'paddingBottom') - 
	                            getNumericalStyle(element, 'borderTopWidth') - 
	                            getNumericalStyle(element, 'borderBottomWidth');
	            result.height < 0 && (result.height = 0);
	        }
	    }
	    return baidu.dom.setStyles(element, result);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */




	/**
	 * 按照border-box模型設置元素的height值
	 * 
	 * @author berg
	 * @name baidu.dom.setBorderBoxHeight
	 * @function
	 * @grammar baidu.dom.setBorderBoxHeight(element, height)
	 * 
	 * @param {HTMLElement|string} element DOM元素或元素的id
	 * @param {number|string} height 要設置的height
	 *
	 * @return {HTMLElement}  設置好的元素
	 * @see baidu.dom.setBorderBoxWidth, baidu.dom.setBorderBoxSize
	 * @shortcut dom.setOuterHeight
	 */
	baidu.dom.setOuterHeight = 
	baidu.dom.setBorderBoxHeight = function (element, height) {
	    return baidu.dom.setBorderBoxSize(element, {height : height});
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */




	/**
	 * 按照border-box模型設置元素的width值
	 * 
	 * @author berg
	 * @name baidu.dom.setBorderBoxWidth
	 * @function
	 * @grammar baidu.dom.setBorderBoxWidth(element, width)
	 * 
	 * @param {HTMLElement|string} 	element DOM元素或元素的id
	 * @param {number|string} 		width 	要設置的width
	 *
	 * @return {HTMLElement}  設置好的元素
	 * @see baidu.dom.setBorderBoxHeight, baidu.dom.setBorderBoxSize
	 * @shortcut dom.setOuterWidth
	 */
	baidu.dom.setOuterWidth = 
	baidu.dom.setBorderBoxWidth = function (element, width) {
	    return baidu.dom.setBorderBoxSize(element, {width : width});
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 */






















	/**
	 * 繪制可以根據鼠標行為改變HTMLElement大小的resize handle
	 * @name baidu.dom.resizable
	 * @function
	 * @grammar baidu.dom.resizable(element[, options])
	 * @param {HTMLElement|string} element 需要改變大小的元素或者元素的id.
	 * @param {Object} [options] resizable參數配置
	 * @config {Array} [direction] 可以改變的方向[e,se,s,ws,w,wn,n,en]
	 * @config {Function} [onresizestart] 開始改變大小時觸發
	 * @config {Function} [onresizeend] 大小改變結束時觸發
	 * @config {Function} [onresize] 大小改變後時觸發
	 * @config {Number|String} [maxWidth] 可改變的最大寬度
	 * @config {Number|String} [maxHeight] 可改變的最大高度
	 * @config {Number|String} [minWidth] 可改變的最小寬度
	 * @config {Number|String} [minHeight] 可改變的最小高度
	 * @config {String} [classPrefix] className 前綴
	 * @config {Object} [directionHandlePosition] resizHandle的位置參數
	 * @return {Object} {cancel:Function} cancel函數
	 * @remark  需要將元素的定位設置為absolute
	 * @author lixiaopeng
	 * @version 1.3
	 */
	baidu.dom.resizable = function(element,options) {
	    var target,
	        op,
	        resizeHandle = {},
	        directionHandlePosition,
	        orgStyles = {},
	        range, mozUserSelect,
	        orgCursor,
	        offsetParent,
	        currentEle,
	        handlePosition,
	        timer,
	        isCancel = false,
	        defaultOptions = {
	            direction: ['e', 's', 'se'],
	            minWidth: 16,
	            minHeight: 16,
	            classPrefix: 'tangram',
	            directionHandlePosition: {}
	        };

	        
	    if (!(target = baidu.dom.g(element)) && baidu.getStyle(target, 'position') == 'static') {
	        return false;
	    }
	    offsetParent = target.offsetParent;
	    var orgPosition = baidu.getStyle(target,'position');

	    /*
	     * 必要參數的擴展
	     * resize handle以方向命名
	     * 順時針的順序為
	     * north northwest west southwest south southeast east northeast
	     */
	    op = baidu.extend(defaultOptions, options);

	    /*
	     * 必要參數轉換
	     */
	    baidu.each(['minHeight', 'minWidth', 'maxHeight', 'maxWidth'], function(style) {
	        op[style] && (op[style] = parseFloat(op[style]));
	    });

	    /*
	     * {Array[Number]} rangeObject
	     * minWidth,maxWidth,minHeight,maxHeight
	     */
	    range = [
	        op.minWidth || 0,
	        op.maxWidth || Number.MAX_VALUE,
	        op.minHeight || 0,
	        op.maxHeight || Number.MAX_VALUE
	    ];

	    render(); 

	    /**
	     * 繪制resizable handle 
	     */
	    function render(){
	      
	        //位置屬性
	        handlePosition = baidu.extend({
	            'e' : {'right': '-5px', 'top': '0px', 'width': '7px', 'height': target.offsetHeight},
	            's' : {'left': '0px', 'bottom': '-5px', 'height': '7px', 'width': target.offsetWidth},
	            'n' : {'left': '0px', 'top': '-5px', 'height': '7px', 'width': target.offsetWidth},
	            'w' : {'left': '-5px', 'top': '0px', 'height':target.offsetHeight , 'width': '7px'},
	            'se': {'right': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
	            'sw': {'left': '1px', 'bottom': '1px', 'height': '16px', 'width': '16px'},
	            'ne': {'right': '1px', 'top': '1px', 'height': '16px', 'width': '16px'},
	            'nw': {'left': '1px', 'top': '1px', 'height': '16px', 'width': '16px'}
	        },op.directionHandlePosition);
	        
	        //創建resizeHandle
	        baidu.each(op.direction, function(key) {
	            var className = op.classPrefix.split(' ');
	            className[0] = className[0] + '-resizable-' + key;

	            var ele = baidu.dom.create('div', {
	                className: className.join(' ')
	            }),
	                styles = handlePosition[key];

	            styles['cursor'] = key + '-resize';
	            styles['position'] = 'absolute';
	            baidu.setStyles(ele, styles);
	            
	            ele.key = key;
	            ele.style.MozUserSelect = 'none';

	            target.appendChild(ele);
	            resizeHandle[key] = ele;

	            baidu.on(ele, 'mousedown', start);
	        });

	        isCancel = false;
	    }

	    /**
	     * cancel resizeHandle
	     * @public
	     * @return  void
	     */
	    function cancel(){
	        currentEle && stop();
	        baidu.object.each(resizeHandle,function(item){
	            baidu.un(item,"mousedown",start);
	            baidu.dom.remove(item);
	        });
	        isCancel = true;    
	    }

	    /**
	     * update resizable
	     * @public 
	     * @param {Object} options
	     * @return null
	     */
	    function update(options){
	        if(!isCancel){
	            op = baidu.extend(op,options || {});
	            cancel();
	            render();
	        }
	    }

	    /**
	     * resizeHandle相應mousedown事件的函數
	     * @param {Event} e
	     * @return void
	     */
	    function start(e){
	        var ele = baidu.event.getTarget(e),
	            key = ele.key;
	        currentEle = ele;

	        if (ele.setCapture) {
	            ele.setCapture();
	        } else if (window.captureEvents) {
	            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
	        }

	        /*
	         * 給body設置相應的css屬性
	         * 添加事件監聽
	         */
	        orgCursor = baidu.getStyle(document.body, 'cursor');
	        baidu.setStyle(document.body, 'cursor', key + '-resize');
	        baidu.on(ele, 'mouseup',stop);
	        baidu.on(document.body, 'selectstart', unselect);
	        mozUserSelect = document.body.style.MozUserSelect;
	        document.body.style.MozUserSelect = 'none';

	        /*
	         * 獲取鼠標坐標
	         * 偏移量計算
	         */
	        var orgMousePosition = baidu.page.getMousePosition();
	        orgStyles = _getOrgStyle();
	        timer = setInterval(function(){
	            resize(key,orgMousePosition);
	        }, 20);

	        baidu.lang.isFunction(op.onresizestart) && op.onresizestart();
	        baidu.event.preventDefault(e);
	    }

	    /**
	     * 當鼠標按鍵擡起時終止對鼠標事件的監聽
	     * @private
	     * @return void
	     */
	    function stop() {
	        if (currentEle.releaseCapture) {
	            currentEle.releaseCapture();
	        } else if (window.releaseEvents) {
	            window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
	        }

	        /*
	         * 刪除事件監聽
	         * 還原css屬性設置
	         */
	        baidu.un(currentEle, 'mouseup',stop);
	        baidu.un(document, 'selectstart', unselect);
	        document.body.style.MozUserSelect = mozUserSelect;
	        baidu.un(document.body, 'selectstart', unselect);

	        clearInterval(timer);
	        baidu.setStyle(document.body, 'cursor',orgCursor);
	        currentEle = null;

	        baidu.lang.isFunction(op.onresizeend) && op.onresizeend();
	    }

	    /**
	     * 根據鼠標移動的距離來繪制target
	     * @private
	     * @param {String} key handle的direction字符串
	     * @param {Object} orgMousePosition 鼠標坐標{x,y}
	     * @return void
	     */
	    function resize(key,orgMousePosition) {
	        var xy = baidu.page.getMousePosition(),
	            width = orgStyles['width'],
	            height = orgStyles['height'],
	            top = orgStyles['top'],
	            left = orgStyles['left'],
	            styles;

	        if (key.indexOf('e') >= 0) {
	            width = Math.max(xy.x - orgMousePosition.x + orgStyles['width'], range[0]);
	            width = Math.min(width, range[1]);
	        }else if (key.indexOf('w') >= 0) {
	            width = Math.max(orgMousePosition.x - xy.x + orgStyles['width'], range[0]);
	            width = Math.min(width, range[1]);
	            left -= width - orgStyles['width'];
	       }

	        if (key.indexOf('s') >= 0) {
	            height = Math.max(xy.y - orgMousePosition.y + orgStyles['height'], range[2]);
	            height = Math.min(height, range[3]);
	        }else if (key.indexOf('n') >= 0) {
	            height = Math.max(orgMousePosition.y - xy.y + orgStyles['height'], range[2]);
	            height = Math.min(height, range[3]);
	            top -= height - orgStyles['height'];
	        }
	         
	        styles = {'width': width, 'height': height, 'top': top, 'left': left};
	        baidu.dom.setOuterHeight(target,height);
	        baidu.dom.setOuterWidth(target,width);
	        baidu.setStyles(target,{"top":top,"left":left});

	        resizeHandle['n'] && baidu.setStyle(resizeHandle['n'], 'width', width);
	        resizeHandle['s'] && baidu.setStyle(resizeHandle['s'], 'width', width);
	        resizeHandle['e'] && baidu.setStyle(resizeHandle['e'], 'height', height);
	        resizeHandle['w'] && baidu.setStyle(resizeHandle['w'], 'height', height);

	        baidu.lang.isFunction(op.onresize) && op.onresize({current:styles,original:orgStyles});
	    }

	    /**
	     * 阻止文字被選中
	     * @private
	     * @param {Event} e
	     * @return {Boolean}
	     */
	    function unselect(e) {
	        return baidu.event.preventDefault(e, false);
	    }

	    /**
	     * 獲取target的原始寬高
	     * @private
	     * @return {Object} {width,height,top,left}
	     */
	    function _getOrgStyle() {
	        var offset_parent = baidu.dom.getPosition(target.offsetParent),
	            offset_target = baidu.dom.getPosition(target),
	            top,
	            left;
	       
	        if(orgPosition == "absolute"){
	            top =  offset_target.top - (target.offsetParent == document.body ? 0 : offset_parent.top);
	            left = offset_target.left - (target.offsetParent == document.body ? 0 :offset_parent.left);
	        }else{
	            top = parseFloat(baidu.getStyle(target,"top")) || -parseFloat(baidu.getStyle(target,"bottom")) || 0;
	            left = parseFloat(baidu.getStyle(target,"left")) || -parseFloat(baidu.getStyle(target,"right")) || 0; 
	        }
	        baidu.setStyles(target,{top:top,left:left});

	        return {
	            width:target.offsetWidth,
	            height:target.offsetHeight,
	            top:top,
	            left:left
	        };
	    }
	    
	    return {cancel:cancel,update:update,enable:render};
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/setPosition.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/12/14
	 */









	/**
	 * 設置目標元素的top和left值到用戶指定的位置
	 * 
	 * @name baidu.dom.setPosition
	 * @function
	 * @grammar baidu.dom.setPosition(element, position)
	 * 
	 * @param {HTMLElement|string}	element 	目標元素或目標元素的id
	 * @param {object} 				position 	位置對象 {top: {number}, left : {number}}
	 *
	 * @return {HTMLElement}  進行設置的元素
	 */
	baidu.dom.setPosition = function (element, position) {
	    return baidu.dom.setStyles(element, {
	        left : position.left - (parseFloat(baidu.dom.getStyle(element, "margin-left")) || 0),
	        top : position.top - (parseFloat(baidu.dom.getStyle(element, "margin-top")) || 0)
	    });
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 顯示目標元素，即將目標元素的display屬性還原成默認值。默認值可能在stylesheet中定義，或者是繼承了瀏覽器的默認樣式值
	 * @author allstar, berg
	 * @name baidu.dom.show
	 * @function
	 * @grammar baidu.dom.show(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @remark
	 * 注意1：如果在CSS中定義此元素的樣式為display:none
	 * 在調用本函數以後，會將display屬性仍然還原成none，元素仍然無法顯示。
	 * 注意2：如果這個元素的display屬性被設置成inline
	 * （由element.style.display或者HTML中的style屬性設置）
	 * 調用本方法將清除此inline屬性，導致元素的display屬性變成繼承值
	 * 因此，針對上面兩種情況，建議使用dom.setStyle("display", "something")
	 * 來明確指定要設置的display屬性值。
	 * 
	 * @shortcut show
	 * @meta standard
	 * @see baidu.dom.hide,baidu.dom.toggle
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.show = function (element) {
	    element = baidu.dom.g(element);
	    element.style.display = "";

	    return element;
	};

	// 聲明快捷方法
	baidu.show = baidu.dom.show;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/toggle.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 改變目標元素的顯示/隱藏狀態
	 * @name baidu.dom.toggle
	 * @function
	 * @grammar baidu.dom.toggle(element)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @meta standard
	 * @see baidu.dom.show,baidu.dom.hide
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.dom.toggle = function (element) {
	    element = baidu.dom.g(element);
	    element.style.display = element.style.display == "none" ? "" : "none";

	    return element;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/toggleClass.js
	 * author: berg
	 * version: 1.0
	 * date: 2010-07-06
	 */

	/**
	 * 添加或者刪除一個節點中的指定class，如果已經有就刪除，否則添加
	 * @name baidu.dom.toggleClass
	 * @function
	 * @grammar baidu.dom.toggleClass(element, className)
	 * @param {HTMLElement|string} element 目標元素或目標元素的id
	 * @param {String} className 指定的className。允許同時添加多個class，中間使用空白符分隔
	 * @version 1.3
	 * @remark
	 * 
	 * 傳入多個class時，只要其中有一個class不在當前元素中，則添加所有class，否則刪除所有class。
	 */





	baidu.dom.toggleClass = function (element, className) {
	    if(baidu.dom.hasClass(element, className)){
	        baidu.dom.removeClass(element, className);
	    }else{
	        baidu.dom.addClass(element, className);
	    }
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_styleFilter/color.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */



	/**
	 * 提供給setStyle與getStyle使用
	 * @meta standard
	 */
	baidu.dom._styleFilter[baidu.dom._styleFilter.length] = {
	    get: function (key, value) {
	        if (/color/i.test(key) && value.indexOf("rgb(") != -1) {
	            var array = value.split(",");

	            value = "#";
	            for (var i = 0, color; color = array[i]; i++){
	                color = parseInt(color.replace(/[^\d]/gi, ''), 10).toString(16);
	                value += color.length == 1 ? "0" + color : color;
	            }

	            value = value.toUpperCase();
	        }

	        return value;
	    }
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_styleFixer/display.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/24
	 */





	/**
	 * 提供給setStyle與getStyle使用
	 * @meta standard
	 */
	baidu.dom._styleFixer.display = baidu.browser.ie && baidu.browser.ie < 8 ? { // berg: 修改到<8，因為ie7同樣存在這個問題，from 先偉
	    set: function (element, value) {
	        element = element.style;
	        if (value == 'inline-block') {
	            element.display = 'inline';
	            element.zoom = 1;
	        } else {
	            element.display = value;
	        }
	    }
	} : baidu.browser.firefox && baidu.browser.firefox < 3 ? {
	    set: function (element, value) {
	        element.style.display = value == 'inline-block' ? '-moz-inline-box' : value;
	    }
	} : null;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All right reserved.
	 * 
	 * path: baidu/dom/_styleFixer/float.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 提供給setStyle與getStyle使用
	 * @meta standard
	 */
	baidu.dom._styleFixer["float"] = baidu.browser.ie ? "styleFloat" : "cssFloat";
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_styleFixer/opacity.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */




	/**
	 * 提供給setStyle與getStyle使用
	 * @meta standard
	 */
	baidu.dom._styleFixer.opacity = baidu.browser.ie ? {
	    get: function (element) {
	        var filter = element.style.filter;
	        return filter && filter.indexOf("opacity=") >= 0 ? (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) + "" : "1";
	    },

	    set: function (element, value) {
	        var style = element.style;
	        // 只能Quirks Mode下面生效??
	        style.filter = (style.filter || "").replace(/alpha\([^\)]*\)/gi, "") + (value == 1 ? "" : "alpha(opacity=" + value * 100 + ")");
	        // IE filters only apply to elements with "layout."
	        style.zoom = 1;
	    }
	} : null;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/dom/_styleFixer/textOverflow.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/17
	 */






	/**
	 * 提供給setStyle與getStyle使用，在做textOverflow時會向element對象中添加,_baiduOverflow, _baiduHTML兩個屬性保存原始的innerHTML信息
	 */
	baidu.dom._styleFixer.textOverflow = (function () {
	    var fontSizeCache = {};

	    function pop(list) {
	        var o = list.length;
	        if (o > 0) {
	            o = list[o - 1];
	            list.length--;
	        } else {
	            o = null;
	        }
	        return o;
	    }

	    function setText(element, text) {
	        element[baidu.browser.firefox ? "textContent" : "innerText"] = text;
	    }

	    function count(element, width, ellipsis) {
	        /* 計算cache的名稱 */
	        var o = baidu.browser.ie ? element.currentStyle || element.style : getComputedStyle(element, null),
	            fontWeight = o.fontWeight,
	            cacheName =
	                "font-family:" + o.fontFamily + ";font-size:" + o.fontSize
	                + ";word-spacing:" + o.wordSpacing + ";font-weight:" + ((parseInt(fontWeight) || 0) == 401 ? 700 : fontWeight)
	                + ";font-style:" + o.fontStyle + ";font-variant:" + o.fontVariant,
	            cache = fontSizeCache[cacheName];

	        if (!cache) {
	            o = element.appendChild(document.createElement("div"));

	            o.style.cssText = "float:left;" + cacheName;
	            cache = fontSizeCache[cacheName] = [];

	            /* 計算ASCII字符的寬度cache */
	            for (var i=0; i < 256; i++) {
	                i == 32 ? (o.innerHTML = "&nbsp;") : setText(o, String.fromCharCode(i));
	                cache[i] = o.offsetWidth;
	            }

	            /* 計算非ASCII字符的寬度、字符間距、省略號的寬度,\u4e00是漢字一的編碼*/
	            setText(o, "\u4e00");
	            cache[256] = o.offsetWidth;
	            setText(o, "\u4e00\u4e00");
	            cache[257] = o.offsetWidth - cache[256] * 2;
	            cache[258] = cache[".".charCodeAt(0)] * 3 + cache[257] * 3;

	            element.removeChild(o);
	        }

	        for (
	            /* wordWidth是每個字符或子節點計算之前的寬度序列 */
	            var node = element.firstChild, charWidth = cache[256], wordSpacing = cache[257], ellipsisWidth = cache[258],
	                wordWidth = [], ellipsis = ellipsis ? ellipsisWidth : 0;
	            node;
	            node = node.nextSibling
	        ) {
	            if (width < ellipsis) {
	                element.removeChild(node);
	            }
	            else if (node.nodeType == 3) {
	                for (var i = 0, text = node.nodeValue, length = text.length; i < length; i++) {
	                    o = text.charCodeAt(i);
	                    /* 計算增加字符後剩余的長度 */
	                    wordWidth[wordWidth.length] = [width, node, i];
	                    width -= (i ? wordSpacing : 0) + (o < 256 ? cache[o] : charWidth);
	                    if (width < ellipsis) {
	                        break;
	                    }
	                }
	            }
	            else {
	                o = node.tagName;
	                if (o == "IMG" || o == "TABLE") {
	                    /* 特殊元素直接刪除 */
	                    o = node;
	                    node = node.previousSibling;
	                    element.removeChild(o);
	                }
	                else {
	                    wordWidth[wordWidth.length] = [width, node];
	                    width -= node.offsetWidth;
	                }
	            }
	        }

	        if (width < ellipsis) {
	            /* 過濾直到能得到大於省略號寬度的位置 */
	            while (o = pop(wordWidth)) {
	                width = o[0];
	                node = o[1];
	                o = o[2];
	                if (node.nodeType == 3) {
	                    if (width >= ellipsisWidth) {
	                        node.nodeValue = node.nodeValue.substring(0, o) + "...";
	                        return true;
	                    }
	                    else if (!o) {
	                        element.removeChild(node);
	                    }
	                }
	                else if (count(node, width, true)) {
	                    return true;
	                }
	                else {
	                    element.removeChild(node);
	                }
	            }

	            /* 能顯示的寬度小於省略號的寬度，直接不顯示 */
	            element.innerHTML = "";
	        }
	    }

	    return {
			get: function (element) {
	            var browser = baidu.browser,
	                getStyle = dom.getStyle;
				return (browser.opera ?
	                        getStyle("OTextOverflow") :
	                        browser.firefox ?
	                            element._baiduOverflow :
	                            getStyle("textOverflow")) ||
	                   "clip";
			},

			set: function (element, value) {
	            var browser = baidu.browser;
				if (element.tagName == "TD" || element.tagName == "TH" || browser.firefox) {
					element._baiduHTML && (element.innerHTML = element._baiduHTML);

					if (value == "ellipsis") {
						element._baiduHTML = element.innerHTML;
						var o = document.createElement("div"), width = element.appendChild(o).offsetWidth;
						element.removeChild(o);
						count(element, width);
					}
					else {
						element._baiduHTML = "";
					}
				}

				o = element.style;
				browser.opera ? (o.OTextOverflow = value) : browser.firefox ? (element._baiduOverflow = value) : (o.textOverflow = value);
			}
	    };
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/isArray.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/30
	 */



	/**
	 * 判斷目標參數是否Array對象
	 * @name baidu.lang.isArray
	 * @function
	 * @grammar baidu.lang.isArray(source)
	 * @param {Any} source 目標參數
	 * @meta standard
	 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
	 *             
	 * @returns {boolean} 類型判斷結果
	 */
	baidu.lang.isArray = function (source) {
	    return '[object Array]' == Object.prototype.toString.call(source);
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/toArray.js
	 * author: berg
	 * version: 1.0
	 * date: 2010-07-05
	 */





	/**
	 * 將一個變量轉換成array
	 * @name baidu.lang.toArray
	 * @function
	 * @grammar baidu.lang.toArray(source)
	 * @param {mix} source 需要轉換成array的變量
	 * @version 1.3
	 * @meta standard
	 * @returns {array} 轉換後的array
	 */
	baidu.lang.toArray = function (source) {
	    if (source === null || source === undefined)
	        return [];
	    if (baidu.lang.isArray(source))
	        return source;

	    // The strings and functions also have 'length'
	    if (typeof source.length !== 'number' || typeof source === 'string' || baidu.lang.isFunction(source)) {
	        return [source];
	    }

	    //nodeList, IE 下調用 [].slice.call(nodeList) 會報錯
	    if (source.item) {
	        var l = source.length, array = new Array(l);
	        while (l--)
	            array[l] = source[l];
	        return array;
	    }

	    return [].slice.call(source);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/fn/methodize.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/11/02 
	 */



	/**
	 * 將一個靜態函數變換成一個對象的方法，使其的第一個參數為this，或this[attr]
	 * @name baidu.fn.methodize
	 * @function
	 * @grammar baidu.fn.methodize(func[, attr])
	 * @param {Function}	func	要方法化的函數
	 * @param {string}		[attr]	屬性
	 * @version 1.3
	 * @returns {Function} 已方法化的函數
	 */
	baidu.fn.methodize = function (func, attr) {
	    return function(){
	        return func.apply(this, [(attr ? this[attr] : this)].concat([].slice.call(arguments)));
	    };
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 包裝函數的返回值，使其在能按照index指定的方式返回。<br/>如果其值為-1，直接返回返回值。 <br/>如果其值為0，返回"返回值"的包裝結果。<br/> 如果其值大於0，返回第i個位置的參數的包裝結果（從1開始計數）
	 * @author berg
	 * @name baidu.fn.wrapReturnValue
	 * @function
	 * @grammar baidu.fn.wrapReturnValue(func, wrapper, mode)
	 * @param {function} func    需要包裝的函數
	 * @param {function} wrapper 包裝器
	 * @param {number} 包裝第幾個參數
	 * @version 1.3.5
	 * @return {function} 包裝後的函數
	 */
	baidu.fn.wrapReturnValue = function (func, wrapper, mode) {
	    mode = mode | 0;
	    return function(){
	        var ret = func.apply(this, arguments); 

	        if(mode > 0){
	            return new wrapper(arguments[mode - 1]);
	        }
	        if(!mode){
	            return new wrapper(ret);
	        }
	        return ret;
	    }
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/fn/multize.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/11/02 
	 */



	/**
	 * 對函數進行集化，使其在第一個參數為array時，結果也返回一個數組
	 * @name baidu.fn.multize
	 * @function
	 * @grammar baidu.fn.multize(func[, recursive])
	 * @param {Function}	func 		需要包裝的函數
	 * @param {Boolean}		[recursive] 是否遞歸包裝（如果數組里面一項仍然是數組，遞歸），可選
	 * @param {Boolean}		[joinArray] 將操作的結果展平後返回（如果返回的結果是數組，則將多個數組合成一個），可選
	 * @version 1.3
	 *
	 * @returns {Function} 已集化的函數
	 */
	baidu.fn.multize = function (func, recursive, joinArray) {
	    var newFunc = function(){
	        var list = arguments[0],
	            fn = recursive ? newFunc : func,
	            ret = [],
	            moreArgs = [].slice.call(arguments,0),
	            i = 0,
	            len,
	            r;

	        if(list instanceof Array){
	            for(len = list.length; i < len; i++){
	                moreArgs[0]=list[i];
	                r = fn.apply(this, moreArgs);
	                if (joinArray) {
	                    if (r) {
	                        //TODO: 需要去重嗎？
	                        ret = ret.concat(r);
	                    }
	                } else {
	                    ret.push(r); 	
	                }
	            }
	            return ret;
	        }else{
	            return func.apply(this, arguments);
	        }
	    }
	    return newFunc;
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All right reserved.
	 * 
	 * path: baidu/dom/element.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010-07-12
	 */














	/**
	 * @namespace baidu.element 通過該方法封裝的對象可使用dom、event方法集合以及each方法進行鏈式調用。
	 */
	baidu.element = baidu.e = function(node){
	    var gNode = baidu._g(node);
	    if(!gNode && baidu.dom.query){
	        gNode = baidu.dom.query(node);
	    }
	    return new baidu.element.Element(gNode);
	};

	/**
	 * Element類，所有擴展到鏈條上的方法都會被放在這里面
	 * @name baidu.element.Element
	 * @grammar baidu.element.Element(node)
	 * @param {DOMElement|NodeList} node   目標元素，可以是數組或者單個node節點
	 * @returns {ElementObj} 包裝後的DOM對象
	 * @version 1.3
	 */
	baidu.element.Element = function(node){
	    if(!baidu.element._init){
	        //由於element可能會在其他代碼之前加載，因此用這個方法來延遲加載
	        baidu.element._makeChain();
	        baidu.element._init = true;
	    }
	    /**
	     * @private
	     * @type {Array.<Node>}
	     */
	    this._dom = (node.tagName || '').toLowerCase() == 'select' ? 
	    	[node] : baidu.lang.toArray(node);
	};

	/**
	 * 以每一個匹配的元素作為上下文執行傳遞進來的函數，方便用戶自行遍歷dom。
	 * @name baidu.element.each
	 * @function
	 * @grammar baidu.element(node).each(iterator)
	 * @param {Function} iterator 遍歷Dom時調用的方法
	 * @version 1.3
	 */
	baidu.element.Element.prototype.each = function(iterator) {
	    // 每一個iterator接受到的都是封裝好的node
	    baidu.array.each(this._dom, function(node, i){
	        iterator.call(node, node, i);
	    });
	};

	/*
	 * 包裝靜態方法，使其變成一個鏈條方法。
	 * 先把靜態方法multize化，讓其支持接受數組參數，
	 * 然後包裝返回值，返回值是一個包裝類
	 * 最後把靜態方法methodize化，讓其變成一個對象方法。
	 *
	 * @param {Function}    func    要包裝的靜態方法
	 * @param {number}      index   包裝函數的第幾個返回值
	 *
	 * @return {function}   包裝後的方法，能直接掛到Element的prototype上。
	 * @private
	 */
	baidu.element._toChainFunction = function(func, index, joinArray){
	    return baidu.fn.methodize(baidu.fn.wrapReturnValue(baidu.fn.multize(func, 0, 1), baidu.element.Element, index), '_dom');
	};

	/**
	 * element對象包裝了dom包下的除了drag和ready,create,ddManager之外的大部分方法。這樣做的目的是提供更為方便的鏈式調用操作。其中doms代指dom包下的方法名。
	 * @name baidu.element.doms
	 * @function
	 * @grammar baidu.element(node).doms
	 * @param 詳見dom包下相應方法的參數。
	 * @version 1.3
	 * @private
	 */
	baidu.element._makeChain = function(){ //將dom/event包下的東西掛到prototype里面
	    var proto = baidu.element.Element.prototype,
	        fnTransformer = baidu.element._toChainFunction;

	    //返回值是第一個參數的包裝
	    baidu.each(("draggable droppable resizable").split(' '),
	              function(fn){
	                  proto[fn] =  fnTransformer(baidu.dom[fn], 1);
	              });

	    //直接返回返回值
	    baidu.each(("remove getText contains getAttr getPosition getStyle hasClass intersect hasAttr getComputedStyle").split(' '),
	              function(fn){
	                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = fnTransformer(baidu.dom[fn], -1);
	              });

	    //包裝返回值
	    //包含
	    //1. methodize
	    //2. multize，結果如果是數組會被展平
	    //3. getXx == xx
	    baidu.each(("addClass empty hide show insertAfter insertBefore insertHTML removeClass " + 
	              "setAttr setAttrs setStyle setStyles show toggleClass toggle next first " + 
	              "getAncestorByClass getAncestorBy getAncestorByTag getDocument getParent getWindow " +
	              "last next prev g removeStyle setBorderBoxSize setOuterWidth setOuterHeight " +
	              "setBorderBoxWidth setBorderBoxHeight setPosition children query").split(' '),
	              function(fn){
	                  proto[fn] = proto[fn.replace(/^get[A-Z]/g, stripGet)] = fnTransformer(baidu.dom[fn], 0);
	              });

	    //對於baidu.dom.q這種特殊情況，將前兩個參數調轉
	    //TODO：需要將這種特殊情況歸納到之前的情況中
	    proto['q'] = proto['Q'] = fnTransformer(function(arg1, arg2){
	        return baidu.dom.q.apply(this, [arg2, arg1].concat([].slice.call(arguments, 2)));
	    }, 0);

	    //包裝event中的on 和 un
	    baidu.each(("on un").split(' '), function(fn){
	        proto[fn] = fnTransformer(baidu.event[fn], 0);
	    });
	  
	    /** 
	     * 方法提供了事件綁定的快捷方式，事件發生時會觸發傳遞進來的函數。events代指事件方法的總和。
	     * @name baidu.element.events 
	     * @function
	     * @grammar baidu.element(node).events(fn)
	     * @param {Function} fn 事件觸發時要調用的方法
	     * @version 1.3
	     * @remark 包裝event的快捷方式具體包括blur、focus、focusin、focusout、load 、resize 、scroll 、unload 、click、 dblclick、mousedown 、mouseup 、mousemove、 mouseover 、mouseout 、mouseenter、 mouseleave、change 、select 、submit 、keydown、 keypress 、keyup、 error。
	     * @returns {baidu.element} Element對象
	     */
	    //包裝event的快捷方式
	    baidu.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
	                "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + 
	                "change select submit keydown keypress keyup error").split(' '), function(fnName){
	        proto[fnName] = function(fn){
	            return this.on(fnName, fn);
	        };
	    });


	    /**
	     * 把get去掉
	     * 鏈里面的方法可以不以get開頭調用
	     * 如 baidu.element("myDiv").parent() == baidu.element("myDiv").getParent();
	     * TODO: 合並getter和setter. baidu.e('myDiv').style() &  baidu.e('myDiv').style('width', '100');
	     */
	    function stripGet(match) {  
	        return match.charAt(3).toLowerCase();
	    }
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/element/extend.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/12/16
	 */







	 /**
	 * 為element對象擴展一個方法。
	 * @name baidu.element.extend
	 * @function
	 * @grammar baidu.element.extend(json)
	 * @param {Object} json 要擴展的方法名以及方法
	 * @version 1.3
	 * @shortcut e
	 * @returns {baidu.element.Element} Element對象
	 *
	 */
	baidu.element.extend = function(json){
	    var e = baidu.element;
	    baidu.object.each(json, function(item, key){
	        e.Element.prototype[key] = baidu.element._toChainFunction(item, -1);
	    });
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/EventArg.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2010/01/11
	 */



	/**
	 * 事件對象構造器，屏蔽瀏覽器差異的事件類
	 * @name baidu.event.EventArg
	 * @function
	 * @grammar baidu.event.EventArg(event[, win])
	 * @param {Event}   event   事件對象
	 * @param {Window}  [win]	窗口對象，默認為window
	 * @meta standard
	 * @remark 1.1.0開始支持
	 * @see baidu.event.get
	 * @constructor
	 */
	baidu.event.EventArg = function (event, win) {
	    win = win || window;
	    event = event || win.event;
	    var doc = win.document;
	    
	    this.target = /** @type {Node} */ (event.target) || event.srcElement;
	    this.keyCode = event.which || event.keyCode;
	    for (var k in event) {
	        var item = event[k];
	        // 避免拷貝preventDefault等事件對象方法
	        if ('function' != typeof item) {
	            this[k] = item;
	        }
	    }
	    
	    if (!this.pageX && this.pageX !== 0) {
	        this.pageX = (event.clientX || 0) 
	                        + (doc.documentElement.scrollLeft 
	                            || doc.body.scrollLeft);
	        this.pageY = (event.clientY || 0) 
	                        + (doc.documentElement.scrollTop 
	                            || doc.body.scrollTop);
	    }
	    this._event = event;
	};

	/**
	 * 阻止事件的默認行為
	 * @name preventDefault
	 * @grammar eventArgObj.preventDefault()
	 * @returns {baidu.event.EventArg} EventArg對象
	 */
	baidu.event.EventArg.prototype.preventDefault = function () {
	    if (this._event.preventDefault) {
	        this._event.preventDefault();
	    } else {
	        this._event.returnValue = false;
	    }
	    return this;
	};

	/**
	 * 停止事件的傳播
	 * @name stopPropagation
	 * @grammar eventArgObj.stopPropagation()
	 * @returns {baidu.event.EventArg} EventArg對象
	 */
	baidu.event.EventArg.prototype.stopPropagation = function () {
	    if (this._event.stopPropagation) {
	        this._event.stopPropagation();
	    } else {
	        this._event.cancelBubble = true;
	    }
	    return this;
	};

	/**
	 * 停止事件
	 * @name stop
	 * @grammar eventArgObj.stop()
	 * @returns {baidu.event.EventArg} EventArg對象
	 */
	baidu.event.EventArg.prototype.stop = function () {
	    return this.stopPropagation().preventDefault();
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/object/values.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 獲取目標對象的值列表
	 * @name baidu.object.values
	 * @function
	 * @grammar baidu.object.values(source)
	 * @param {Object} source 目標對象
	 * @see baidu.object.keys
	 *             
	 * @returns {Array} 值列表
	 */
	baidu.object.values = function (source) {
	    var result = [], resultLen = 0, k;
	    for (k in source) {
	        if (source.hasOwnProperty(k)) {
	            result[resultLen++] = source[k];
	        }
	    }
	    return result;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/fire.js
	 * author: linlingyu
	 * version: 1.1.0
	 * date: 2010/10/28
	 */






	/**
	 * 觸發已經注冊的事件。注：在ie下不支持load和unload事件
	 * @name baidu.event.fire
	 * @function
	 * @grammar baidu.event.fire(element, type, options)
	 * @param {HTMLElement|string|window} element 目標元素或目標元素id
	 * @param {string} type 事件類型
	 * @param {Object} options 觸發的選項
					
	 * @param {Boolean} options.bubbles 是否冒泡
	 * @param {Boolean} options.cancelable 是否可以阻止事件的默認操作
	 * @param {window|null} options.view 指定 Event 的 AbstractView
	 * @param {1|Number} options.detail 指定 Event 的鼠標單擊量
	 * @param {Number} options.screenX 指定 Event 的屏幕 x 坐標
	 * @param {Number} options.screenY number 指定 Event 的屏幕 y 坐標
	 * @param {Number} options.clientX 指定 Event 的客戶端 x 坐標
	 * @param {Number} options.clientY 指定 Event 的客戶端 y 坐標
	 * @param {Boolean} options.ctrlKey 指定是否在 Event 期間按下 ctrl 鍵
	 * @param {Boolean} options.altKey 指定是否在 Event 期間按下 alt 鍵
	 * @param {Boolean} options.shiftKey 指定是否在 Event 期間按下 shift 鍵
	 * @param {Boolean} options.metaKey 指定是否在 Event 期間按下 meta 鍵
	 * @param {Number} options.button 指定 Event 的鼠標按鍵
	 * @param {Number} options.keyCode 指定 Event 的鍵盤按鍵
	 * @param {Number} options.charCode 指定 Event 的字符編碼
	 * @param {HTMLElement} options.relatedTarget 指定 Event 的相關 EventTarget
	 * @version 1.3
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	(function(){
		var browser = baidu.browser,
		keys = {
			keydown : 1,
			keyup : 1,
			keypress : 1
		},
		mouses = {
			click : 1,
			dblclick : 1,
			mousedown : 1,
			mousemove : 1,
			mouseup : 1,
			mouseover : 1,
			mouseout : 1
		},
		htmls = {
			abort : 1,
			blur : 1,
			change : 1,
			error : 1,
			focus : 1,
			load : browser.ie ? 0 : 1,
			reset : 1,
			resize : 1,
			scroll : 1,
			select : 1,
			submit : 1,
			unload : browser.ie ? 0 : 1
		},
		bubblesEvents = {
			scroll : 1,
			resize : 1,
			reset : 1,
			submit : 1,
			change : 1,
			select : 1,
			error : 1,
			abort : 1
		},
		parameters = {
			"KeyEvents" : ["bubbles", "cancelable", "view", "ctrlKey", "altKey", "shiftKey", "metaKey", "keyCode", "charCode"],
			"MouseEvents" : ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "relatedTarget"],
			"HTMLEvents" : ["bubbles", "cancelable"],
			"UIEvents" : ["bubbles", "cancelable", "view", "detail"],
			"Events" : ["bubbles", "cancelable"]
		};
		baidu.object.extend(bubblesEvents, keys);
		baidu.object.extend(bubblesEvents, mouses);
		function parse(array, source){//按照array的項在source中找到值生成新的obj並把source中對應的array的項刪除
			var i = 0, size = array.length, obj = {};
			for(; i < size; i++){
				obj[array[i]] = source[array[i]];
				delete source[array[i]];
			}
			return obj;
		};
		function eventsHelper(type, eventType, options){//非IE內核的事件輔助
			options = baidu.object.extend({}, options);
			var param = baidu.object.values(parse(parameters[eventType], options)),
				evnt = document.createEvent(eventType);
			param.unshift(type);
			if("KeyEvents" == eventType){
				evnt.initKeyEvent.apply(evnt, param);
			}else if("MouseEvents" == eventType){
				evnt.initMouseEvent.apply(evnt, param);
			}else if("UIEvents" == eventType){
				evnt.initUIEvent.apply(evnt, param);
			}else{//HTMMLEvents, Events
				evnt.initEvent.apply(evnt, param);
			}
			baidu.object.extend(evnt, options);//把多出來的options再附加上去,這是為解決當創建一個其它event時，當用Events代替後需要把參數附加到對象上
			return evnt;
		};
		function eventObject(options){//ie內核的構建方式
			var evnt;
			if(document.createEventObject){
				evnt = document.createEventObject();
				baidu.object.extend(evnt, options);
			}
			return evnt;
		};
		function keyEvents(type, options){//keyEvents
			options = parse(parameters["KeyEvents"], options);
			var evnt;
			if(document.createEvent){
				try{//opera對keyEvents的支持極差
					evnt = eventsHelper(type, "KeyEvents", options);
				}catch(keyError){
					try{
						evnt = eventsHelper(type, "Events", options);
					}catch(evtError){
						evnt = eventsHelper(type, "UIEvents", options);
					}
				}
			}else{
				options.keyCode = options.charCode > 0 ? options.charCode : options.keyCode;
				evnt = eventObject(options);
			}
			return evnt;
		};
		function mouseEvents(type, options){//mouseEvents
			options = parse(parameters["MouseEvents"], options);
			var evnt;
			if(document.createEvent){
				evnt = eventsHelper(type, "MouseEvents", options);//mouseEvents基本瀏覽器都支持
				if(options.relatedTarget && !evnt.relatedTarget){
					if("mouseout" == type.toLowerCase()){
						evnt.toElement = options.relatedTarget;
					}else if("mouseover" == type.toLowerCase()){
						evnt.fromElement = options.relatedTarget;
					}
				}
			}else{
				options.button = options.button == 0 ? 1
									: options.button == 1 ? 4
										: baidu.lang.isNumber(options.button) ? options.button : 0;
				evnt = eventObject(options);
			}
			return evnt;
		};
		function htmlEvents(type, options){//htmlEvents
			options.bubbles = bubblesEvents.hasOwnProperty(type);
			options = parse(parameters["HTMLEvents"], options);
			var evnt;
			if(document.createEvent){
				try{
					evnt = eventsHelper(type, "HTMLEvents", options);
				}catch(htmlError){
					try{
						evnt = eventsHelper(type, "UIEvents", options);
					}catch(uiError){
						evnt = eventsHelper(type, "Events", options);
					}
				}
			}else{
				evnt = eventObject(options);
			}
			return evnt;
		};
		baidu.event.fire = function(element, type, options){
			var evnt;
			type = type.replace(/^on/i, "");
			element = baidu.dom._g(element);
			options = baidu.object.extend({
				bubbles : true,
				cancelable : true,
				view : window,
				detail : 1,
				screenX : 0,
				screenY : 0,
				clientX : 0,
				clientY : 0,
				ctrlKey : false,
				altKey  : false,
				shiftKey: false,
				metaKey : false,
				keyCode : 0,
				charCode: 0,
				button  : 0,
				relatedTarget : null
			}, options);
			if(keys[type]){
				evnt = keyEvents(type, options);
			}else if(mouses[type]){
				evnt = mouseEvents(type, options);
			}else if(htmls[type]){
				evnt = htmlEvents(type, options);
			}else{
			    throw(new Error(type + " is not support!"));
			}
			if(evnt){//tigger event
				if(element.dispatchEvent){
					element.dispatchEvent(evnt);
				}else if(element.fireEvent){
					element.fireEvent("on" + type, evnt);
				}
			}
		}
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/get.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	/**
	 * 獲取擴展的EventArg對象
	 * @name baidu.event.get
	 * @function
	 * @grammar baidu.event.get(event[, win])
	 * @param {Event} event 事件對象
	 * @param {window} [win] 觸發事件元素所在的window
	 * @meta standard
	 * @see baidu.event.EventArg
	 *             
	 * @returns {EventArg} 擴展的事件對象
	 */
	baidu.event.get = function (event, win) {
	    return new baidu.event.EventArg(event, win);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/getKeyCode.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/23
	 */


	/**
	 * 獲取鍵盤事件的鍵值
	 * @name baidu.event.getKeyCode
	 * @function
	 * @grammar baidu.event.getKeyCode(event)
	 * @param {Event} event 事件對象
	 *             
	 * @returns {number} 鍵盤事件的鍵值
	 */
	baidu.event.getKeyCode = function (event) {
	    return event.which || event.keyCode;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/getPageX.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/16
	 */



	/**
	 * 獲取鼠標事件的鼠標x坐標
	 * @name baidu.event.getPageX
	 * @function
	 * @grammar baidu.event.getPageX(event)
	 * @param {Event} event 事件對象
	 * @see baidu.event.getPageY
	 *             
	 * @returns {number} 鼠標事件的鼠標x坐標
	 */
	baidu.event.getPageX = function (event) {
	    var result = event.pageX,
	        doc = document;
	    if (!result && result !== 0) {
	        result = (event.clientX || 0) 
	                    + (doc.documentElement.scrollLeft 
	                        || doc.body.scrollLeft);
	    }
	    return result;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/getPageY.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/16
	 */



	/**
	 * 獲取鼠標事件的鼠標y坐標
	 * @name baidu.event.getPageY
	 * @function
	 * @grammar baidu.event.getPageY(event)
	 * @param {Event} event 事件對象
	 * @see baidu.event.getPageX
	 *             
	 * @returns {number} 鼠標事件的鼠標y坐標
	 */
	baidu.event.getPageY = function (event) {
	    var result = event.pageY,
	        doc = document;
	    if (!result && result !== 0) {
	        result = (event.clientY || 0) 
	                    + (doc.documentElement.scrollTop 
	                        || doc.body.scrollTop);
	    }
	    return result;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/once.js
	 * author: wangcheng
	 * version: 1.1.0
	 * date: 2010/10/29
	 */





	/**
	 * 為目標元素添加一次事件綁定
	 * @name baidu.event.once
	 * @function
	 * @grammar baidu.event.once(element, type, listener)
	 * @param {HTMLElement|string} element 目標元素或目標元素id
	 * @param {string} type 事件類型
	 * @param {Function} listener 需要添加的監聽器
	 * @version 1.3
	 * @see baidu.event.un,baidu.event.on
	 *             
	 * @returns {HTMLElement} 目標元素
	 */
	baidu.event.once = function(element, type, listener){
	    element = baidu.dom._g(element);
	    function onceListener(event){
	        listener.call(element,event);
	        baidu.event.un(element, type, onceListener);
	    } 
	    
	    baidu.event.on(element, type, onceListener);
	    return element;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/stopPropagation.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/23
	 */



	/**
	 * 阻止事件傳播
	 * @name baidu.event.stopPropagation
	 * @function
	 * @grammar baidu.event.stopPropagation(event)
	 * @param {Event} event 事件對象
	 * @see baidu.event.stop,baidu.event.preventDefault
	 */
	baidu.event.stopPropagation = function (event) {
	   if (event.stopPropagation) {
	       event.stopPropagation();
	   } else {
	       event.cancelBubble = true;
	   }
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/stop.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/23
	 */




	/**
	 * 停止事件
	 * @name baidu.event.stop
	 * @function
	 * @grammar baidu.event.stop(event)
	 * @param {Event} event 事件對象
	 * @see baidu.event.stopPropagation,baidu.event.preventDefault
	 */
	baidu.event.stop = function (event) {
	    var e = baidu.event;
	    e.stopPropagation(event);
	    e.preventDefault(event);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/_eventFilter.js
	 * author: rocy
	 * version: 1.0.0
	 * date: 2010/10/29
	 */


	baidu.event._eventFilter = baidu.event._eventFilter || {};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/_eventFilter/_crossElementBoundary.js
	 * author: Rocy, berg
	 * version: 1.0.0
	 * date: 2010/12/16
	 */





	/**
	 * 事件僅在鼠標進入/離開元素區域觸發一次，當鼠標在元素區域內部移動的時候不會觸發，用於為非IE瀏覽器添加mouseleave/mouseenter支持。
	 * 
	 * @name baidu.event._eventFilter._crossElementBoundary
	 * @function
	 * @grammar baidu.event._eventFilter._crossElementBoundary(listener, e)
	 * 
	 * @param {function} listener	要觸發的函數
	 * @param {DOMEvent} e 			DOM事件
	 */

	baidu.event._eventFilter._crossElementBoundary = function(listener, e){
	    var related = e.relatedTarget,
	        current = e.currentTarget;
	    if(
	       related === false || 
	       // 如果current和related都是body，contains函數會返回false
	       current == related ||
	       // Firefox有時會把XUL元素作為relatedTarget
	       // 這些元素不能訪問parentNode屬性
	       // thanks jquery & mootools
	       (related && (related.prefix == 'xul' ||
	       //如果current包含related，說明沒有經過current的邊界
	       baidu.dom.contains(current, related)))
	      ){
	        return ;
	    }
	    return listener.call(current, e);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/fn/bind.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/11/02 
	 */





	/** 
	 * 為對象綁定方法和作用域
	 * @name baidu.fn.bind
	 * @function
	 * @grammar baidu.fn.bind(handler[, obj, args])
	 * @param {Function|String} handler 要綁定的函數，或者一個在作用域下可用的函數名
	 * @param {Object} obj 執行運行時this，如果不傳入則運行時this為函數本身
	 * @param {args* 0..n} args 函數執行時附加到執行時函數前面的參數
	 * @version 1.3
	 *
	 * @returns {Function} 封裝後的函數
	 */
	baidu.fn.bind = function(func, scope) {
	    var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
	    return function () {
	        var fn = baidu.lang.isString(func) ? scope[func] : func,
	            args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
	        return fn.apply(scope || fn, args);
	    };
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/_eventFilter/mouseenter.js
	 * author: Rocy
	 * version: 1.0.0
	 * date: 2010/11/09
	 */





	/**
	 * 用於為非IE瀏覽器添加mouseenter的支持;
	 * mouseenter事件僅在鼠標進入元素區域觸發一次,
	 *    當鼠標在元素內部移動的時候不會多次觸發.
	 */
	baidu.event._eventFilter.mouseenter = window.attachEvent ? null : function(element,type, listener){
		return {
			type: "mouseover",
			listener: baidu.fn.bind(baidu.event._eventFilter._crossElementBoundary, this, listener)
		}
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/event/_eventFilter/mouseleave.js
	 * author: Rocy, berg
	 * version: 1.0.0
	 * date: 2010/11/09
	 */




	/**
	 * 用於為非IE瀏覽器添加mouseleave的支持;
	 * mouseleave事件僅在鼠標移出元素區域觸發一次,
	 *    當鼠標在元素區域內部移動的時候不會觸發.
	 */
	baidu.event._eventFilter.mouseleave = window.attachEvent ? null : function(element,type, listener){
		return {
			type: "mouseout",
			listener: baidu.fn.bind(baidu.event._eventFilter._crossElementBoundary, this, listener)
		}
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 *
	 * path: baidu/event/_unload.js
	 * author: erik, berg
	 * version: 1.1.0
	 * date: 2009/12/16
	 */




	/**
	 * 卸載所有事件監聽器
	 * @private
	 */
	baidu.event._unload = function() {
	    var lis = baidu.event._listeners,
	        len = lis.length,
	        standard = !!window.removeEventListener,
	        item, el;

	    while (len--) {
	        item = lis[len];
	        //20100409 berg: 不解除unload的綁定，保證用戶的事件一定會被執行
	        //否則用戶掛載進入的unload事件也可能會在這里被刪除
	        if (item[1] == 'unload') {
	            continue;
	        }
	        //如果el被移除，不做判斷將導致js報錯
	        if (!(el = item[0])) {
	            continue;
	        }
	        if (el.removeEventListener) {
	            el.removeEventListener(item[1], item[3], false);
	        } else if (el.detachEvent) {
	            el.detachEvent('on' + item[1], item[3]);
	        }
	    }

	    if (standard) {
	        window.removeEventListener('unload', baidu.event._unload, false);
	    } else {
	        window.detachEvent('onunload', baidu.event._unload);
	    }
	};

	// 在頁面卸載的時候，將所有事件監聽器移除
	if (window.attachEvent) {
	    window.attachEvent('onunload', baidu.event._unload);
	} else {
	    window.addEventListener('unload', baidu.event._unload, false);
	}
	/*
	 * Tangram
	 * Copyright 2011 Baidu Inc. All rights reserved.
	 *
	 * path: baidu/fn/abstractMethod.js
	 * author: leeight
	 * version: 1.0.0
	 * date: 2011/04/29
	 */



	/**
	 * 定義一個抽象方法
	 * @type {!Function}
	 * @throws {Error} when invoked to indicate the method should be
	 *   overridden.
	 * @see goog.abstractMethod
	 */
	baidu.fn.abstractMethod = function() {
	    throw Error('unimplemented abstract method');
	};





















	/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/json.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/02
	 */


	/**
	 * @namespace baidu.json 操作json對象的方法。
	 */
	baidu.json = baidu.json || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/json/parse.js
	 * author: erik, berg
	 * version: 1.2
	 * date: 2009/11/23
	 */



	/**
	 * 將字符串解析成json對象。注：不會自動祛除空格
	 * @name baidu.json.parse
	 * @function
	 * @grammar baidu.json.parse(data)
	 * @param {string} source 需要解析的字符串
	 * @remark
	 * 該方法的實現與ecma-262第五版中規定的JSON.parse不同，暫時只支持傳入一個參數。後續會進行功能豐富。
	 * @meta standard
	 * @see baidu.json.stringify,baidu.json.decode
	 *             
	 * @returns {JSON} 解析結果json對象
	 */
	baidu.json.parse = function (data) {
	    //2010/12/09：更新至不使用原生parse，不檢測用戶輸入是否正確
	    return (new Function("return (" + data + ")"))();
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/json/decode.js
	 * author: erik, cat
	 * version: 1.3.4
	 * date: 2010/12/23
	 */



	/**
	 * 將字符串解析成json對象，為過時接口，今後會被baidu.json.parse代替
	 * @name baidu.json.decode
	 * @function
	 * @grammar baidu.json.decode(source)
	 * @param {string} source 需要解析的字符串
	 * @meta out
	 * @see baidu.json.encode,baidu.json.parse
	 *             
	 * @returns {JSON} 解析結果json對象
	 */
	baidu.json.decode = baidu.json.parse;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/json/stringify.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2010/01/11
	 */



	/**
	 * 將json對象序列化
	 * @name baidu.json.stringify
	 * @function
	 * @grammar baidu.json.stringify(value)
	 * @param {JSON} value 需要序列化的json對象
	 * @remark
	 * 該方法的實現與ecma-262第五版中規定的JSON.stringify不同，暫時只支持傳入一個參數。後續會進行功能豐富。
	 * @meta standard
	 * @see baidu.json.parse,baidu.json.encode
	 *             
	 * @returns {string} 序列化後的字符串
	 */
	baidu.json.stringify = (function () {
	    /**
	     * 字符串處理時需要轉義的字符表
	     * @private
	     */
	    var escapeMap = {
	        "\b": '\\b',
	        "\t": '\\t',
	        "\n": '\\n',
	        "\f": '\\f',
	        "\r": '\\r',
	        '"' : '\\"',
	        "\\": '\\\\'
	    };
	    
	    /**
	     * 字符串序列化
	     * @private
	     */
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
	    
	    /**
	     * 數組序列化
	     * @private
	     */
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
	                result.push(baidu.json.stringify(item));
	                preComma = 1;
	            }
	        }
	        result.push("]");
	        return result.join("");
	    }
	    
	    /**
	     * 處理日期序列化時的補零
	     * @private
	     */
	    function pad(source) {
	        return source < 10 ? '0' + source : source;
	    }
	    
	    /**
	     * 日期序列化
	     * @private
	     */
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
	            } else if (value instanceof Array) {
	                return encodeArray(value);
	            } else if (value instanceof Date) {
	                return encodeDate(value);
	            } else {
	                var result = ['{'],
	                    encode = baidu.json.stringify,
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
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/json/encode.js
	 * author: erik, cat
	 * version: 1.3.4
	 * date: 2010/12/23
	 */



	/**
	 * 將json對象序列化，為過時接口，今後會被baidu.json.stringify代替
	 * @name baidu.json.encode
	 * @function
	 * @grammar baidu.json.encode(value)
	 * @param {JSON} value 需要序列化的json對象
	 * @meta out
	 * @see baidu.json.decode,baidu.json.stringify
	 *             
	 * @returns {string} 序列化後的字符串
	 */
	baidu.json.encode = baidu.json.stringify;
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/Class/addEventListeners.js
	 * author: berg
	 * version: 1.0
	 * date: 2010-07-05
	 */




	/**
	 * 添加多個自定義事件。
	 * @grammar obj.addEventListeners(events, fn)
	 * @param 	{object}   events       json對象，key為事件名稱，value為事件被觸發時應該調用的回調函數
	 * @param 	{Function} fn	        要掛載的函數
	 * @version 1.3
	 */
	/* addEventListeners("onmyevent,onmyotherevent", fn);
	 * addEventListeners({
	 *      "onmyevent"         : fn,
	 *      "onmyotherevent"    : fn1
	 * });
	 */
	baidu.lang.Class.prototype.addEventListeners = function (events, fn) {
	    if(typeof fn == 'undefined'){
	        for(var i in events){
	            this.addEventListener(i, events[i]);
	        }
	    }else{
	        events = events.split(',');
	        var i = 0, len = events.length, event;
	        for(; i < len; i++){
	            this.addEventListener(baidu.trim(events[i]), fn);
	        }
	    }
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * @author: meizz
	 * @namespace: baidu.lang.createClass
	 * @version: 2010-05-13
	 */





	/**
	 * 創建一個類，包括創造類的構造器、繼承基類Class
	 * @name baidu.lang.createClass
	 * @function
	 * @grammar baidu.lang.createClass(constructor[, options])
	 * @param {Function} constructor 類的構造器函數
	 * @param {Object} [options] 
	                
	 * @config {string} [className] 類名
	 * @config {Function} [superClass] 父類，默認為baidu.lang.Class
	 * @version 1.2
	 * @remark
	 * 
	            使用createClass能方便的創建一個帶有繼承關系的類。同時會為返回的類對象添加extend方法，使用obj.extend({});可以方便的擴展原型鏈上的方法和屬性
	        
	 * @see baidu.lang.Class,baidu.lang.inherits
	 *             
	 * @returns {Object} 一個類對象
	 */

	baidu.lang.createClass = function(constructor, options) {
	    options = options || {};
	    var superClass = options.superClass || baidu.lang.Class;

	    // 創建新類的真構造器函數
	    var fn = function(){
	        // 繼承父類的構造器
	        if(superClass != baidu.lang.Class){
	            superClass.apply(this, arguments);
	        }else{
	            superClass.call(this);
	        }
	        constructor.apply(this, arguments);
	    };

	    fn.options = options.options || {};

	    var C = function(){},
	        cp = constructor.prototype;
	    C.prototype = superClass.prototype;

	    // 繼承父類的原型（prototype)鏈
	    var fp = fn.prototype = new C();

	    // 繼承傳參進來的構造器的 prototype 不會丟
	    for (var i in cp) fp[i] = cp[i];

	    typeof options.className == "string" && (fp._className = options.className);

	    // 修正這種繼承方式帶來的 constructor 混亂的問題
	    fp.constructor = cp.constructor;

	    // 給類擴展出一個靜態方法，以代替 baidu.object.extend()
	    fn.extend = function(json){
	        for (var i in json) {
	            fn.prototype[i] = json[i];
	        }
	        return fn;  // 這個靜態方法也返回類對象本身
	    };

	    return fn;
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/decontrol.js
	 * author: meizz
	 * version: 1.1.0
	 * $date$
	 */



	/**
	 * 解除instance中對指定類實例的引用關系。
	 * @name baidu.lang.decontrol
	 * @function
	 * @grammar baidu.lang.decontrol(guid)
	 * @param {string} guid 類的唯一標識
	 * @version 1.1.1
	 * @see baidu.lang.instance
	 */
	baidu.lang.decontrol = function(guid) {
	    var m = window[baidu.guid];
	    m._instances && (delete m._instances[guid]);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 事件中心
	 * @class 事件中心
	 * @name baidu.lang.eventCenter
	 * @author rocy
	 */
	baidu.lang.eventCenter = baidu.lang.eventCenter || baidu.lang.createSingle();

	/**
	 * 注冊全局事件監聽器。
	 * @name baidu.lang.eventCenter.addEventListener
	 * @function
	 * @grammar baidu.lang.eventCenter.addEventListener(type, handler[, key])
	 * @param 	{string}   type         自定義事件的名稱
	 * @param 	{Function} handler      自定義事件被觸發時應該調用的回調函數
	 * @param 	{string}   [key]		為事件監聽函數指定的名稱，可在移除時使用。如果不提供，方法會默認為它生成一個全局唯一的key。
	 * @remark 	事件類型區分大小寫。如果自定義事件名稱不是以小寫"on"開頭，該方法會給它加上"on"再進行判斷，即"click"和"onclick"會被認為是同一種事件。 
	 */

	/**
	 * 移除全局事件監聽器。
	 * @grammar baidu.lang.eventCenter.removeEventListener(type, handler)
	 * @param {string}   type     事件類型
	 * @param {Function|string} handler  要移除的事件監聽函數或者監聽函數的key
	 * @remark 	如果第二個參數handler沒有被綁定到對應的自定義事件中，什麽也不做。
	 */

	/**
	 * 派發全局自定義事件，使得綁定到全局自定義事件上面的函數都會被執行。
	 * @grammar baidu.lang.eventCenter.dispatchEvent(event, options)
	 * @param {baidu.lang.Event|String} event 	Event對象，或事件名稱(1.1.1起支持)
	 * @param {Object} 					options 擴展參數,所含屬性鍵值會擴展到Event對象上(1.2起支持)
	 */
	/*
	 * tangram
	 * copyright 2011 baidu inc. all rights reserved.
	 *
	 * path: baidu/lang/getModule.js
	 * author: leeight
	 * version: 1.1.0
	 * date: 2011/04/29
	 */



	/**
	 * 根據變量名或者命名空間來查找對象
	 * @param {string} name 變量或者命名空間的名字.
	 * @param {Object=} opt_obj 從這個對象開始查找，默認是window;
	 * @return {?Object} 返回找到的對象，如果沒有找到返回null.
	 * @see goog.getObjectByName
	 */
	baidu.lang.getModule = function(name, opt_obj) {
	    var parts = name.split('.'),
	        cur = opt_obj || window,
	        part;
	    for (; part = parts.shift(); ) {
	        if (cur[part] != null) {
	            cur = cur[part];
	        } else {
	          return null;
	        }
	    }

	    return cur;
	};



















	/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/inherits.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/24
	 */



	/**
	 * 為類型構造器建立繼承關系
	 * @name baidu.lang.inherits
	 * @function
	 * @grammar baidu.lang.inherits(subClass, superClass[, className])
	 * @param {Function} subClass 子類構造器
	 * @param {Function} superClass 父類構造器
	 * @param {string} className 類名標識
	 * @remark
	 * 
	使subClass繼承superClass的prototype，因此subClass的實例能夠使用superClass的prototype中定義的所有屬性和方法。<br>
	這個函數實際上是建立了subClass和superClass的原型鏈集成，並對subClass進行了constructor修正。<br>
	<strong>注意：如果要繼承構造函數，需要在subClass里面call一下，具體見下面的demo例子</strong>
		
	 * @shortcut inherits
	 * @meta standard
	 * @see baidu.lang.Class
	 */
	baidu.lang.inherits = function (subClass, superClass, className) {
	    var key, proto, 
	        selfProps = subClass.prototype, 
	        clazz = new Function();
	        
	    clazz.prototype = superClass.prototype;
	    proto = subClass.prototype = new clazz();
	    for (key in selfProps) {
	        proto[key] = selfProps[key];
	    }
	    subClass.prototype.constructor = subClass;
	    subClass.superClass = superClass.prototype;

	    // 類名標識，兼容Class的toString，基本沒用
	    if ("string" == typeof className) {
	        proto._className = className;
	    }
	};

	// 聲明快捷方法
	baidu.inherits = baidu.lang.inherits;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/instance.js
	 * author: meizz, erik
	 * version: 1.1.0
	 * date: 2009/12/1
	 */



	/**
	 * 根據參數(guid)的指定，返回對應的實例對象引用
	 * @name baidu.lang.instance
	 * @function
	 * @grammar baidu.lang.instance(guid)
	 * @param {string} guid 需要獲取實例的guid
	 * @meta standard
	 *             
	 * @returns {Object|null} 如果存在的話，返回;否則返回null。
	 */
	baidu.lang.instance = function (guid) {
	    return window[baidu.guid]._instances[guid] || null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/isBoolean.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/10/12
	 */



	/**
	 * 判斷目標參數是否Boolean對象
	 * @name baidu.lang.isBoolean
	 * @function
	 * @grammar baidu.lang.isBoolean(source)
	 * @param {Any} source 目標參數
	 * @version 1.3
	 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isElement,baidu.lang.isArray,baidu.lang.isDate
	 *             
	 * @returns {boolean} 類型判斷結果
	 */
	baidu.lang.isBoolean = function(o) {
	    return typeof o === 'boolean';
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/isDate.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/10/12 
	 */



	/**
	 * 判斷目標參數是否為Date對象
	 * @name baidu.lang.isDate
	 * @function
	 * @grammar baidu.lang.isDate(source)
	 * @param {Any} source 目標參數
	 * @version 1.3
	 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isBoolean,baidu.lang.isElement
	 *             
	 * @returns {boolean} 類型判斷結果
	 */
	baidu.lang.isDate = function(o) {
	    // return o instanceof Date;
	    return {}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/isElement.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/30
	 */



	/**
	 * 判斷目標參數是否為Element對象
	 * @name baidu.lang.isElement
	 * @function
	 * @grammar baidu.lang.isElement(source)
	 * @param {Any} source 目標參數
	 * @meta standard
	 * @see baidu.lang.isString,baidu.lang.isObject,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isBoolean,baidu.lang.isDate
	 *             
	 * @returns {boolean} 類型判斷結果
	 */
	baidu.lang.isElement = function (source) {
	    return !!(source && source.nodeName && source.nodeType == 1);
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/lang/isObject.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/30
	 */



	/**
	 * 判斷目標參數是否為Object對象
	 * @name baidu.lang.isObject
	 * @function
	 * @grammar baidu.lang.isObject(source)
	 * @param {Any} source 目標參數
	 * @shortcut isObject
	 * @meta standard
	 * @see baidu.lang.isString,baidu.lang.isNumber,baidu.lang.isArray,baidu.lang.isElement,baidu.lang.isBoolean,baidu.lang.isDate
	 *             
	 * @returns {boolean} 類型判斷結果
	 */
	baidu.lang.isObject = function (source) {
	    return 'function' == typeof source || !!(source && 'object' == typeof source);
	};

	// 聲明快捷方法
	baidu.isObject = baidu.lang.isObject;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 增加自定義模塊擴展,默認創建在當前作用域
	 * @author erik, berg
	 * @name baidu.lang.module
	 * @function
	 * @grammar baidu.lang.module(name, module[, owner])
	 * @param {string} name 需要創建的模塊名.
	 * @param {Any} module 需要創建的模塊對象.
	 * @param {Object} [owner] 模塊創建的目標環境，默認為window.
	 * @remark
	 *
	            從1.1.1開始，module方法會優先在當前作用域下尋找模塊，如果無法找到，則尋找window下的模塊

	 * @meta standard
	 */
	baidu.lang.module = function(name, module, owner) {
	    var packages = name.split('.'),
	        len = packages.length - 1,
	        packageName,
	        i = 0;

	    // 如果沒有owner，找當前作用域，如果當前作用域沒有此變量，在window創建
	    if (!owner) {
	        try {
	            if (!(new RegExp('^[a-zA-Z_\x24][a-zA-Z0-9_\x24]*\x24')).test(packages[0])) {
	                throw '';
	            }
	            owner = eval(packages[0]);
	            i = 1;
	        }catch (e) {
	            owner = window;
	        }
	    }

	    for (; i < len; i++) {
	        packageName = packages[i];
	        if (!owner[packageName]) {
	            owner[packageName] = {};
	        }
	        owner = owner[packageName];
	    }

	    if (!owner[packages[len]]) {
	        owner[packages[len]] = module;
	    }
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/number/comma.js
	 * author: dron, erik, berg
	 * version: 1.2.0
	 * date: 2010/09/07 
	 */



	/**
	 * 為目標數字添加逗號分隔
	 * @name baidu.number.comma
	 * @function
	 * @grammar baidu.number.comma(source[, length])
	 * @param {number} source 需要處理的數字
	 * @param {number} [length] 兩次逗號之間的數字位數，默認為3位
	 *             
	 * @returns {string} 添加逗號分隔後的字符串
	 */
	baidu.number.comma = function (source, length) {
	    if (!length || length < 1) {
	        length = 3;
	    }

	    source = String(source).split(".");
	    source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{'+length+'})+$)','ig'),"$1,");
	    return source.join(".");
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/number/randomInt.js
	 * author: berg
	 * version: 1.0.0
	 * date: 2010/12/14
	 */



	/**
	 * 生成隨機整數，範圍是[min, max]
	 * @name baidu.number.randomInt
	 * @function
	 * @grammar baidu.number.randomInt(min, max) 
	 * 
	 * @param 	{number} min 	隨機整數的最小值
	 * @param 	{number} max 	隨機整數的最大值
	 * @return 	{number} 		生成的隨機整數
	 */
	baidu.number.randomInt = function(min, max){
	    return Math.floor(Math.random() * (max - min + 1) + min);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */





	/**
	 * 判斷一個對象是不是字面量對象，即判斷這個對象是不是由{}或者new Object類似方式創建
	 * 
	 * @name baidu.object.isPlain
	 * @function
	 * @grammar baidu.object.isPlain(source)
	 * @param {Object} source 需要檢查的對象
	 * @remark
	 * 事實上來說，在Javascript語言中，任何判斷都一定會有漏洞，因此本方法只針對一些最常用的情況進行了判斷
	 *             
	 * @returns {Boolean} 檢查結果
	 */
	baidu.object.isPlain  = function(obj){
	    var hasOwnProperty = Object.prototype.hasOwnProperty,
	        key;
	    if ( !obj ||
	         //一般的情況，直接用toString判斷
	         Object.prototype.toString.call(obj) !== "[object Object]" ||
	         //IE下，window/document/document.body/HTMLElement/HTMLCollection/NodeList等DOM對象上一個語句為true
	         //isPrototypeOf掛在Object.prototype上的，因此所有的字面量都應該會有這個屬性
	         //對於在window上掛了isPrototypeOf屬性的情況，直接忽略不考慮
	         !('isPrototypeOf' in obj)
	       ) {
	        return false;
	    }

	    //判斷new fun()自定義對象的情況
	    //constructor不是繼承自原型鏈的
	    //並且原型中有isPrototypeOf方法才是Object
	    if ( obj.constructor &&
	        !hasOwnProperty.call(obj, "constructor") &&
	        !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
	        return false;
	    }
	    //判斷有繼承的情況
	    //如果有一項是繼承過來的，那麽一定不是字面量Object
	    //OwnProperty會首先被遍歷，為了加速遍歷過程，直接看最後一項
	    for ( key in obj ) {}
	    return key === undefined || hasOwnProperty.call( obj, key );
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */





	/**
	 * 對一個object進行深度拷貝
	 * 
	 * @author berg
	 * @name baidu.object.clone
	 * @function
	 * @grammar baidu.object.clone(source)
	 * @param {Object} source 需要進行拷貝的對象
	 * @remark
	 * 對於Object來說，只拷貝自身成員，不拷貝prototype成員
	 * @meta standard
	 *             
	 * @returns {Object} 拷貝後的新對象
	 */
	baidu.object.clone  = function (source) {
	    var result = source, i, len;
	    if (!source
	        || source instanceof Number
	        || source instanceof String
	        || source instanceof Boolean) {
	        return result;
	    } else if (baidu.lang.isArray(source)) {
	        result = [];
	        var resultLen = 0;
	        for (i = 0, len = source.length; i < len; i++) {
	            result[resultLen++] = baidu.object.clone(source[i]);
	        }
	    } else if (baidu.object.isPlain(source)) {
	        result = {};
	        for (i in source) {
	            if (source.hasOwnProperty(i)) {
	                result[i] = baidu.object.clone(source[i]);
	            }
	        }
	    }
	    return result;
	};
	/*
	 * tangram
	 * copyright 2011 baidu inc. all rights reserved.
	 *
	 * path: baidu/object/isEmpty.js
	 * author: leeight
	 * version: 1.1.0
	 * date: 2011/04/30
	 */



	/**
	 * 檢測一個對象是否是空的.
	 * 需要注意的是：
	 * 如果污染了Object.prototype或者Array.prototype，那麽
	 * baidu.object.isEmpty({})或者
	 * baidu.object.isEmpty([])可能返回的就是false.
	 * @param {Object} obj 需要檢測的對象.
	 * @return {boolean} 如果是空的對象就返回true.
	 */
	baidu.object.isEmpty = function(obj) {
	    for (var key in obj) {
	        return false;
	    }
	    
	    return true;
	};






















	/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/object/keys.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 獲取目標對象的鍵名列表
	 * @name baidu.object.keys
	 * @function
	 * @grammar baidu.object.keys(source)
	 * @param {Object} source 目標對象
	 * @see baidu.object.values
	 *             
	 * @returns {Array} 鍵名列表
	 */
	baidu.object.keys = function (source) {
	    var result = [], resultLen = 0, k;
	    for (k in source) {
	        if (source.hasOwnProperty(k)) {
	            result[resultLen++] = k;
	        }
	    }
	    return result;
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/object/map.js
	 * author: berg
	 * version: 1.1.0
	 * date: 2010/12/14
	 */



	/**
	 * 遍歷object中所有元素，將每一個元素應用方法進行轉換，返回轉換後的新object。
	 * @name baidu.object.map
	 * @function
	 * @grammar baidu.object.map(source, iterator)
	 * 
	 * @param 	{Array}    source   需要遍歷的object
	 * @param 	{Function} iterator 對每個object元素進行處理的函數
	 * @return 	{Array} 			map後的object
	 */
	baidu.object.map = function (source, iterator) {
	    var results = {};
	    for (var key in source) {
	        if (source.hasOwnProperty(key)) {
	            results[key] = iterator(source[key], key);
	        }
	    }
	    return results;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */





	/*
	 * 默認情況下，所有在源對象上的屬性都會被非遞歸地合並到目標對象上
	 * 並且如果目標對象上已有此屬性，不會被覆蓋
	 */
	/**
	 * 合並源對象的屬性到目標對象。
	 *
	 * @name baidu.object.merge
	 * @function
	 * @grammar baidu.object.merge(target, source[, opt_options])
	 *
	 * @param {Function} target 目標對象.
	 * @param {Function} source 源對象.
	 * @param {Object} opt_options optional merge選項.
	 * @config {boolean} overwrite optional 如果為真，源對象屬性會覆蓋掉目標對象上的已有屬性，默認為假.
	 * @config {string[]} whiteList optional 白名單，默認為空，如果存在，只有在這里的屬性才會被處理.
	 * @config {boolean} recursive optional 是否遞歸合並對象里面的object，默認為否.
	 * @return {object} merge後的object.
	 * @see baidu.object.extend
	 * @author berg
	 */
	(function() {
	var isPlainObject = function(source) {
	        return baidu.lang.isObject(source) && !baidu.lang.isFunction(source);
	    };

	function mergeItem(target, source, index, overwrite, recursive) {
	    if (source.hasOwnProperty(index)) {
	        if (recursive && isPlainObject(target[index])) {
	            // 如果需要遞歸覆蓋，就遞歸調用merge
	            baidu.object.merge(
	                target[index],
	                source[index],
	                {
	                    'overwrite': overwrite,
	                    'recursive': recursive
	                }
	            );
	        } else if (overwrite || !(index in target)) {
	            // 否則只處理overwrite為true，或者在目標對象中沒有此屬性的情況
	            target[index] = source[index];
	        }
	    }
	}

	baidu.object.merge = function(target, source, opt_options) {
	    var i = 0,
	        options = opt_options || {},
	        overwrite = options['overwrite'],
	        whiteList = options['whiteList'],
	        recursive = options['recursive'],
	        len;

	    // 只處理在白名單中的屬性
	    if (whiteList && whiteList.length) {
	        len = whiteList.length;
	        for (; i < len; ++i) {
	            mergeItem(target, source, whiteList[i], overwrite, recursive);
	        }
	    } else {
	        for (i in source) {
	            mergeItem(target, source, i, overwrite, recursive);
	        }
	    }

	    return target;
	};
	})();
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * @author: meizz
	 * @namespace: baidu.page.createStyleSheet
	 * @version: 2010-06-12
	 */





	/**
	 * 在頁面中創建樣式表對象
	 * @name baidu.page.createStyleSheet
	 * @function
	 * @grammar baidu.page.createStyleSheet(options)
	 * @param {Object} options 配置信息
	                
	 * @param {Document} options.document 指定在哪個document下創建，默認是當前文檔
	 * @param {String} options.url css文件的URL
	 * @param {Number} options.index 在文檔里的排序索引（注意，僅IE下有效）
	 * @version 1.2
	 * @remark
	 *  ie 下返回值styleSheet的addRule方法不支持添加逗號分隔的css rule.
	 * 
	 * @see baidu.page.createStyleSheet.StyleSheet
	 *             
	 * @returns {baidu.page.createStyleSheet.StyleSheet} styleSheet對象(注意: 僅IE下,其他瀏覽器均返回null)
	 */
	baidu.page.createStyleSheet = function(options){
	    var op = options || {},
	        doc = op.document || document,
	        s;

	    if (baidu.browser.ie) {
	        //修覆ie下會請求一個undefined的bug  berg 2010/08/27 
	        if(!op.url)
	            op.url = "";
	        return doc.createStyleSheet(op.url, op.index);
	    } else {
	        s = "<style type='text/css'></style>";
	        op.url && (s="<link type='text/css' rel='stylesheet' href='"+op.url+"'/>");
	        baidu.dom.insertHTML(doc.getElementsByTagName("HEAD")[0],"beforeEnd",s);
	        //如果用戶傳入了url參數，下面訪問sheet.rules的時候會報錯
	        if(op.url){
	            return null;
	        }

	        var sheet = doc.styleSheets[doc.styleSheets.length - 1],
	            rules = sheet.rules || sheet.cssRules;
	        return {
	            self : sheet
	            ,rules : sheet.rules || sheet.cssRules
	            ,addRule : function(selector, style, i) {
	                if (sheet.addRule) {
	                    return sheet.addRule(selector, style, i);
	                } else if (sheet.insertRule) {
	                    isNaN(i) && (i = rules.length);
	                    return sheet.insertRule(selector +"{"+ style +"}", i);
	                }
	            }
	            ,removeRule : function(i) {
	                if (sheet.removeRule) {
	                    sheet.removeRule(i);
	                } else if (sheet.deleteRule) {
	                    isNaN(i) && (i = 0);
	                    sheet.deleteRule(i);
	                }
	            }
	        }
	    }
	};
	/*
	 * styleSheet對象 有兩個方法 
	 *  addRule(selector, style, i)
	 *  removeRule(i)
	 *  這兩個方法已經做了瀏覽器兼容處理
	 * 一個集合
	 *  rules
	 */
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/getHeight.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/03
	 */



	/**
	 * 獲取頁面高度
	 * @name baidu.page.getHeight
	 * @function
	 * @grammar baidu.page.getHeight()
	 * @see baidu.page.getWidth
	 *             
	 * @returns {number} 頁面高度
	 */
	baidu.page.getHeight = function () {
	    var doc = document,
	        body = doc.body,
	        html = doc.documentElement,
	        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

	    return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/getWidth.js
	 * author: allstar, erik
	 * version: 1.1.0
	 * date: 2009/12/03
	 */



	/**
	 * 獲取頁面寬度
	 * @name baidu.page.getWidth
	 * @function
	 * @grammar baidu.page.getWidth()
	 * @see baidu.page.getHeight
	 * @meta standard
	 * @returns {number} 頁面寬度
	 */
	baidu.page.getWidth = function () {
	    var doc = document,
	        body = doc.body,
	        html = doc.documentElement,
	        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

	    return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
	};
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 */











	/**
	 * 延遲加載圖片. 默認只加載可見高度以上的圖片, 隨著窗口滾動加載剩余圖片.注意: 僅支持垂直方向.
	 * @name baidu.page.lazyLoadImage
	 * @function
	 * @grammar baidu.page.lazyLoadImage([options])
	 * @param {Object} options
	 * @param {String} [options.className] 延遲加載的IMG的className,如果不傳入該值將延遲加載所有IMG.
	 * @param {Number} [options.preloadHeight] 預加載的高度, 可見窗口下該高度內的圖片將被加載.
	 * @param {String} [options.placeHolder] 占位圖url.
	 * @param {Function} [options.onlazyload] 延遲加載回調函數,在實際加載時觸發.
	 * @author rocy
	 */
	baidu.page.lazyLoadImage = function(options) {
	    options = options || {};
	    options.preloadHeight = options.preloadHeight || 0;

	    baidu.dom.ready(function() {
	        var imgs = document.getElementsByTagName('IMG'),
	                targets = imgs,
	                len = imgs.length,
	                i = 0,
	                viewOffset = getLoadOffset(),
	                srcAttr = 'data-tangram-ori-src',
	                target;
	        //避免循環中每次都判斷className
	        if (options.className) {
	            targets = [];
	            for (; i < len; ++i) {
	                if (baidu.dom.hasClass(imgs[i], options.className)) {
	                    targets.push(imgs[i]);
	                }
	            }
	        }
	        //計算需要加載圖片的頁面高度
	        function getLoadOffset() {
	            return baidu.page.getScrollTop() + baidu.page.getViewHeight() + options.preloadHeight;
	        }
	        //加載可視圖片
	        for (i = 0, len = targets.length; i < len; ++i) {
	            target = targets[i];
	            if (baidu.dom.getPosition(target).top > viewOffset) {
	                target.setAttribute(srcAttr, target.src);
	                options.placeHolder ? target.src = options.placeHolder : target.removeAttribute('src');
	            }
	        }
	        //處理延遲加載
	        var loadNeeded = function() {
	            var viewOffset = getLoadOffset(),
	                imgSrc,
	                finished = true,
	                i = 0,
	                len = targets.length;
	            for (; i < len; ++i) {
	                target = targets[i];
	                imgSrc = target.getAttribute(srcAttr);
	                imgSrc && (finished = false);
	                if (baidu.dom.getPosition(target).top < viewOffset && imgSrc) {
	                    target.src = imgSrc;
	                    target.removeAttribute(srcAttr);
	                    baidu.lang.isFunction(options.onlazyload) && options.onlazyload(target);
	                }
	            }
	            //當全部圖片都已經加載, 去掉事件監聽
	            finished && baidu.un(window, 'scroll', loadNeeded);
	        };

	        baidu.on(window, 'scroll', loadNeeded);
	    });
	};

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 *
	 * path: baidu/page/load.js
	 * author: rocy
	 * version: 1.0.0
	 * date: 2010/11/29
	 */









	/**
	 *
	 * 加載一組資源，支持多種格式資源的串/並行加載，支持每個文件有單獨回調函數。
	 *
	 * @name baidu.page.load
	 * @function
	 * @grammar baidu.page.load(resources[, options])
	 *
	 * @param {Array} resources               資源描述數組，單個resource含如下屬性.
	 * @param {String} resources.url           鏈接地址.
	 * @param {String} [resources.type]        取值["css","js","html"]，默認參考文件後綴.
	 * @param {String} [resources.requestType] 取值["dom","ajax"]，默認js和css用dom標簽，html用ajax.
	 * @param {Function} resources.onload        當前resource加載完成的回調函數，若requestType為ajax，參數為xhr(可能失效)，responseText；若requestType為dom，無參數，執行時this為相應dom標簽。.
	 *
	 * @param {Object} [options]               可選參數.
	 * @param {Function} [options.onload]        資源全部加載完成的回調函數，無參數。.
	 * @param {Boolean} [options.parallel]      是否並行加載，默認為false，串行。.
	 * @param {Boolean} [ignoreAllLoaded]       全部加載之後不觸發回調事件.主要用於內部實現.
	 *
	 *
	 * @remark
	 *  //串行實例
	 *  baidu.page.load([
	 *      { url : "http://img.baidu.com/js/tangram-1.3.2.js" },
	 *      {url : "http://xxx.baidu.com/xpath/logicRequire.js",
	 *          onload : fnOnRequireLoaded
	 *      },
	 *      { url : "http://xxx.baidu.com/xpath/target.js" }
	 *  ],{
	 *      onload : fnWhenTargetOK
	 *  });
	 *  //並行實例
	 *  baidu.page.load([
	 *      {
	 *          url : "http://xxx.baidu.com/xpath/template.html",
	 *          onload : fnExtractTemplate
	 *      },
	 *      { url : "http://xxx.baidu.com/xpath/style.css"},
	 *      {
	 *          url : "http://xxx.baidu.com/xpath/import.php?f=baidu.*",
	 *          type : "js"
	 *      },
	 *      {
	 *          url : "http://xxx.baidu.com/xpath/target.js",
	 *      },
	 *      {
	 *          url : "http://xxx.baidu.com/xpath/jsonData.js",
	 *          requestType : "ajax",
	 *          onload : fnExtractData
	 *      }
	 *  ],{
	 *      parallel : true,
	 *      onload : fnWhenEverythingIsOK
	 * });
	 */
	baidu.page.load = function(resources, options, ignoreAllLoaded) {
	    //TODO failure, 整體onload能不能每個都調用; resources.charset
	    options = options || {};
	    var self = baidu.page.load,
	        cache = self._cache = self._cache || {},
	        loadingCache = self._loadingCache = self._loadingCache || {},
	        parallel = options.parallel;

	    function allLoadedChecker() {
	        for (var i = 0, len = resources.length; i < len; ++i) {
	            if (! cache[resources[i].url]) {
	                setTimeout(arguments.callee, 10);
	                return;
	            }
	        }
	        options.onload();
	    };

	    function loadByDom(res, callback) {
	        var node, loaded, onready;
	        switch (res.type.toLowerCase()) {
	            case 'css' :
	                node = document.createElement('link');
	                node.setAttribute('rel', 'stylesheet');
	                node.setAttribute('type', 'text/css');
	                break;
	            case 'js' :
	                node = document.createElement('script');
	                node.setAttribute('type', 'text/javascript');
	                node.setAttribute('charset', res.charset || self.charset);
	                break;
	            case 'html' :
	                node = document.createElement('iframe');
	                node.frameBorder = 'none';
	                break;
	            default :
	                return;
	        }

	        // HTML,JS works on all browsers, CSS works only on IE.
	        onready = function() {
	            if (!loaded && (!this.readyState ||
	                    this.readyState === 'loaded' ||
	                    this.readyState === 'complete')) {
	                loaded = true;
	                // 防止內存泄露
	                baidu.un(node, 'load', onready);
	                baidu.un(node, 'readystatechange', onready);
	                //node.onload = node.onreadystatechange = null;
	                callback.call(window, node);
	            }
	        };
	        baidu.on(node, 'load', onready);
	        baidu.on(node, 'readystatechange', onready);
	        //CSS has no onload event on firefox and webkit platform, so hack it.
	        if (res.type == 'css') {
	            (function() {
	                //避免重覆加載
	                if (loaded) return;
	                try {
	                    node.sheet.cssRule;
	                } catch (e) {
	                    setTimeout(arguments.callee, 20);
	                    return;
	                }
	                loaded = true;
	                callback.call(window, node);
	            })();
	        }

	        node.href = node.src = res.url;
	        document.getElementsByTagName('head')[0].appendChild(node);
	    }

	    //兼容第一個參數直接是資源地址.
	    baidu.lang.isString(resources) && (resources = [{url: resources}]);

	    //避免遞歸出錯,添加容錯.
	    if (! (resources && resources.length)) return;

	    function loadResources(res) {
	        var url = res.url,
	            shouldContinue = !!parallel,
	            cacheData,
	            callback = function(textOrNode) {
	                //ajax存入responseText,dom存入節點,用於保證onload的正確執行.
	                cache[res.url] = textOrNode;
	                delete loadingCache[res.url];

	                if (baidu.lang.isFunction(res.onload)) {
	                    //若返回false, 則停止接下來的加載.
	                    if (false === res.onload.call(window, textOrNode)) {
	                        return;
	                    }
	                }
	                //串行時遞歸執行
	                !parallel && self(resources.slice(1), options, true);
	                if ((! ignoreAllLoaded) && baidu.lang.isFunction(options.onload)) {
	                    allLoadedChecker();
	                }
	            };
	        //默認用後綴名, 並防止後綴名大寫
	        res.type = res.type || url.substr(url.lastIndexOf('.') + 1);
	        //默認html格式用ajax請求,其他都使用dom標簽方式請求.
	        res.requestType = res.requestType || (res.type == 'html' ? 'ajax' : 'dom');

	        if (cacheData = cache[res.url]) {
	            callback(cacheData);
	            return shouldContinue;
	        }
	        if (!options.refresh && loadingCache[res.url]) {
	            setTimeout(function() {loadResources(res);}, 10);
	            return shouldContinue;
	        }
	        loadingCache[res.url] = true;
	        if (res.requestType.toLowerCase() == 'dom') {
	            loadByDom(res, callback);
	        }else {//ajax
	            baidu.ajax.get(res.url, function(xhr, responseText) {callback(responseText);});
	        }
	        //串行模式,通過callback方法執行後續
	        return shouldContinue;
	    };

	    baidu.each(resources, loadResources);
	};
	//默認編碼設置為UTF8
	baidu.page.load.charset = 'UTF8';
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/loadCssFile.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/20
	 */



	/**
	 * 動態在頁面上加載一個外部css文件
	 * @name baidu.page.loadCssFile
	 * @function
	 * @grammar baidu.page.loadCssFile(path)
	 * @param {string} path css文件路徑
	 * @see baidu.page.loadJsFile
	 */

	baidu.page.loadCssFile = function (path) {
	    var element = document.createElement("link");
	    
	    element.setAttribute("rel", "stylesheet");
	    element.setAttribute("type", "text/css");
	    element.setAttribute("href", path);

	    document.getElementsByTagName("head")[0].appendChild(element);        
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/page/loadJsFile.js
	 * author: allstar
	 * version: 1.1.0
	 * date: 2009/11/20
	 */



	/**
	 * 動態在頁面上加載一個外部js文件
	 * @name baidu.page.loadJsFile
	 * @function
	 * @grammar baidu.page.loadJsFile(path)
	 * @param {string} path js文件路徑
	 * @see baidu.page.loadCssFile
	 */
	baidu.page.loadJsFile = function (path) {
	    var element = document.createElement('script');

	    element.setAttribute('type', 'text/javascript');
	    element.setAttribute('src', path);
	    element.setAttribute('defer', 'defer');

	    document.getElementsByTagName("head")[0].appendChild(element);    
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * @namespace baidu.platform 判斷平台類型和特性的屬性。
	 * @author jz
	 */
	baidu.platform = baidu.platform || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷是否為android平台
	 * @property android 是否為android平台
	 * @grammar baidu.platform.android
	 * @meta standard
	 * @see baidu.platform.x11,baidu.platform.windows,baidu.platform.macintosh,baidu.platform.iphone,baidu.platform.ipad
	 * @author jz
	 */
	baidu.platform.isAndroid = /android/i.test(navigator.userAgent);
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷是否為ipad平台
	 * @property ipad 是否為ipad平台
	 * @grammar baidu.platform.ipad
	 * @meta standard
	 * @see baidu.platform.x11,baidu.platform.windows,baidu.platform.macintosh,baidu.platform.iphone,baidu.platform.android   
	 * @author jz
	 */
	baidu.platform.isIpad = /ipad/i.test(navigator.userAgent);
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷是否為iphone平台
	 * @property iphone 是否為iphone平台
	 * @grammar baidu.platform.iphone
	 * @meta standard
	 * @see baidu.platform.x11,baidu.platform.windows,baidu.platform.macintosh,baidu.platform.ipad,baidu.platform.android
	 * @author jz
	 */
	baidu.platform.isIphone = /iphone/i.test(navigator.userAgent);
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷是否為macintosh平台
	 * @property macintosh 是否為macintosh平台
	 * @grammar baidu.platform.macintosh
	 * @meta standard
	 * @see baidu.platform.x11,baidu.platform.windows,baidu.platform.iphone,baidu.platform.ipad,baidu.platform.android 
	 * @author jz
	 */
	baidu.platform.isMacintosh = /macintosh/i.test(navigator.userAgent);
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷是否為windows平台
	 * @property windows 是否為windows平台
	 * @grammar baidu.platform.windows
	 * @meta standard
	 * @see baidu.platform.x11,baidu.platform.macintosh,baidu.platform.iphone,baidu.platform.ipad,baidu.platform.android 
	 * @author jz
	 */
	baidu.platform.isWindows = /windows/i.test(navigator.userAgent);
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 判斷是否為x11平台
	 * @property x11 是否為x11平台
	 * @grammar baidu.platform.x11
	 * @meta standard
	 * @see baidu.platform.windows,baidu.platform.macintosh,baidu.platform.iphone,baidu.platform.ipad,baidu.platform.android 
	 * @author jz
	 */
	baidu.platform.isX11 = /x11/i.test(navigator.userAgent);
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/sio.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/12/16
	 */


	/**
	 * @namespace baidu.sio 使用動態script標簽請求服務器資源，包括由服務器端的回調和瀏覽器端的回調。
	 */
	baidu.sio = baidu.sio || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 
	 * @param {HTMLElement} src script節點
	 * @param {String} url script節點的地址
	 * @param {String} [charset] 編碼
	 */
	baidu.sio._createScriptTag = function(scr, url, charset){
	    scr.setAttribute('type', 'text/javascript');
	    charset && scr.setAttribute('charset', charset);
	    scr.setAttribute('src', url);
	    document.getElementsByTagName('head')[0].appendChild(scr);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */



	/**
	 * 刪除script的屬性，再刪除script標簽，以解決修覆內存泄漏的問題
	 * 
	 * @param {HTMLElement} src script節點
	 */
	baidu.sio._removeScriptTag = function(scr){
	    if (scr.clearAttributes) {
	        scr.clearAttributes();
	    } else {
	        for (var attr in scr) {
	            if (scr.hasOwnProperty(attr)) {
	                delete scr[attr];
	            }
	        }
	    }
	    if(scr && scr.parentNode){
	        scr.parentNode.removeChild(scr);
	    }
	    scr = null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */





	/**
	 * 通過script標簽加載數據，加載完成由瀏覽器端觸發回調
	 * @name baidu.sio.callByBrowser
	 * @function
	 * @grammar baidu.sio.callByBrowser(url, opt_callback, opt_options)
	 * @param {string} url 加載數據的url
	 * @param {Function|string} opt_callback 數據加載結束時調用的函數或函數名
	 * @param {Object} opt_options 其他可選項
	 * @config {String} [charset] script的字符集
	 * @config {Integer} [timeOut] 超時時間，超過這個時間將不再響應本請求，並觸發onfailure函數
	 * @config {Function} [onfailure] timeOut設定後才生效，到達超時時間時觸發本函數
	 * @remark
	 * 1、與callByServer不同，callback參數只支持Function類型，不支持string。
	 * 2、如果請求了一個不存在的頁面，callback函數在IE/opera下也會被調用，因此使用者需要在onsuccess函數中判斷數據是否正確加載。
	 * @meta standard
	 * @see baidu.sio.callByServer
	 */
	baidu.sio.callByBrowser = function (url, opt_callback, opt_options) {
	    var scr = document.createElement("SCRIPT"),
	        scriptLoaded = 0,
	        options = opt_options || {},
	        charset = options['charset'],
	        callback = opt_callback || function(){},
	        timeOut = options['timeOut'] || 0,
	        timer;
	    
	    // IE和opera支持onreadystatechange
	    // safari、chrome、opera支持onload
	    scr.onload = scr.onreadystatechange = function () {
	        // 避免opera下的多次調用
	        if (scriptLoaded) {
	            return;
	        }
	        
	        var readyState = scr.readyState;
	        if ('undefined' == typeof readyState
	            || readyState == "loaded"
	            || readyState == "complete") {
	            scriptLoaded = 1;
	            try {
	                callback();
	                clearTimeout(timer);
	            } finally {
	                scr.onload = scr.onreadystatechange = null;
	                baidu.sio._removeScriptTag(scr);
	            }
	        }
	    };

	    if( timeOut ){
	        timer = setTimeout(function(){
	            scr.onload = scr.onreadystatechange = null;
	            baidu.sio._removeScriptTag(scr);
	            options.onfailure && options.onfailure();
	        }, timeOut);
	    }
	    
	    baidu.sio._createScriptTag(scr, url, charset);
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 */







	/**
	 * 通過script標簽加載數據，加載完成由服務器端觸發回調
	 * @name baidu.sio.callByServer
	 * @function
	 * @grammar baidu.sio.callByServer(url, callback[, opt_options])
	 * @param {string} url 加載數據的url.
	 * @param {Function|string} callback 服務器端調用的函數或函數名。如果沒有指定本參數，將在URL中尋找options['queryField']做為callback的方法名.
	 * @param {Object} opt_options 加載數據時的選項.
	 * @config {string} [charset] script的字符集
	 * @config {string} [queryField] 服務器端callback請求字段名，默認為callback
	 * @config {Integer} [timeOut] 超時時間(單位：ms)，超過這個時間將不再響應本請求，並觸發onfailure函數
	 * @config {Function} [onfailure] timeOut設定後才生效，到達超時時間時觸發本函數
	 * @remark
	 * 如果url中已經包含key為“options['queryField']”的query項，將會被替換成callback中參數傳遞或自動生成的函數名。
	 * @meta standard
	 * @see baidu.sio.callByBrowser
	 */
	baidu.sio.callByServer = function(url, callback, opt_options) {
	    var scr = document.createElement('SCRIPT'),
	        prefix = 'bd__cbs__',
	        callbackName,
	        callbackImpl,
	        options = opt_options || {},
	        charset = options['charset'],
	        queryField = options['queryField'] || 'callback',
	        timeOut = options['timeOut'] || 0,
	        timer,
	        reg = new RegExp('(\\?|&)' + queryField + '=([^&]*)'),
	        matches;

	    if (baidu.lang.isFunction(callback)) {
	        callbackName = prefix + Math.floor(Math.random() * 2147483648).toString(36);
	        window[callbackName] = getCallBack(0);
	    } else if(baidu.lang.isString(callback)){
	        // 如果callback是一個字符串的話，就需要保證url是唯一的，不要去改變它
	        // TODO 當調用了callback之後，無法刪除動態創建的script標簽
	        callbackName = callback;
	    } else {
	        if (matches = reg.exec(url)) {
	            callbackName = matches[2];
	        }
	    }

	    if( timeOut ){
	        timer = setTimeout(getCallBack(1), timeOut);
	    }

	    //如果用戶在URL中已有callback，用參數傳入的callback替換之
	    url = url.replace(reg, '\x241' + queryField + '=' + callbackName);
	    
	    if (url.search(reg) < 0) {
	        url += (url.indexOf('?') < 0 ? '?' : '&') + queryField + '=' + callbackName;
	    }
	    baidu.sio._createScriptTag(scr, url, charset);

	    /*
	     * 返回一個函數，用於立即（掛在window上）或者超時（掛在setTimeout中）時執行
	     */
	    function getCallBack(onTimeOut){
	        /*global callbackName, callback, scr, options;*/
	        return function(){
	            try {
	                if( onTimeOut ){
	                    options.onfailure && options.onfailure();
	                }else{
	                    callback.apply(window, arguments);
	                    clearTimeout(timer);
	                }
	                window[callbackName] = null;
	                delete window[callbackName];
	            } catch (exception) {
	                // ignore the exception
	            } finally {
	                baidu.sio._removeScriptTag(scr);
	            }
	        }
	    }
	};
	/*
	 * Tangram
	 * Copyright 2011 Baidu Inc. All rights reserved.
	 */



	/**
	 * 通過請求一個圖片的方式令服務器存儲一條日志
	 * author: int08h,leeight
	 * @param {string} url 要發送的地址.
	 */
	baidu.sio.log = function(url) {
	  var img = new Image(),
	      key = 'tangram_sio_log_' + Math.floor(Math.random() *
	            2147483648).toString(36);

	  // 這里一定要掛在window下
	  // 在IE中，如果沒掛在window下，這個img變量又正好被GC的話，img的請求會abort
	  // 導致服務器收不到日志
	  window[key] = img;

	  img.onload = img.onerror = img.onabort = function() {
	    // 下面這句非常重要
	    // 如果這個img很不幸正好加載了一個存在的資源，又是個gif動畫
	    // 則在gif動畫播放過程中，img會多次觸發onload
	    // 因此一定要清空
	    img.onload = img.onerror = img.onabort = null;

	    window[key] = null;

	    // 下面這句非常重要
	    // new Image創建的是DOM，DOM的事件中形成閉包環引用DOM是典型的內存泄露
	    // 因此這里一定要置為null
	    img = null;
	  };

	  // 一定要在注冊了事件之後再設置src
	  // 不然如果圖片是讀緩存的話，會錯過事件處理
	  // 最後，對於url最好是添加客戶端時間來防止緩存
	  // 同時服務器也配合一下傳遞Cache-Control: no-cache;
	  img.src = url;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/decodeHTML.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 對目標字符串進行html解碼
	 * @name baidu.string.decodeHTML
	 * @function
	 * @grammar baidu.string.decodeHTML(source)
	 * @param {string} source 目標字符串
	 * @shortcut decodeHTML
	 * @meta standard
	 * @see baidu.string.encodeHTML
	 *             
	 * @returns {string} html解碼後的字符串
	 */
	baidu.string.decodeHTML = function (source) {
	    var str = String(source)
	                .replace(/&quot;/g,'"')
	                .replace(/&lt;/g,'<')
	                .replace(/&gt;/g,'>')
	                .replace(/&amp;/g, "&");
	    //處理轉義的中文和實體字符
	    return str.replace(/&#([\d]+);/g, function(_0, _1){
	        return String.fromCharCode(parseInt(_1, 10));
	    });
	};

	baidu.decodeHTML = baidu.string.decodeHTML;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/encodeHTML.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 對目標字符串進行html編碼
	 * @name baidu.string.encodeHTML
	 * @function
	 * @grammar baidu.string.encodeHTML(source)
	 * @param {string} source 目標字符串
	 * @remark
	 * 編碼字符有5個：&<>"'
	 * @shortcut encodeHTML
	 * @meta standard
	 * @see baidu.string.decodeHTML
	 *             
	 * @returns {string} html編碼後的字符串
	 */
	baidu.string.encodeHTML = function (source) {
	    return String(source)
	                .replace(/&/g,'&amp;')
	                .replace(/</g,'&lt;')
	                .replace(/>/g,'&gt;')
	                .replace(/"/g, "&quot;")
	                .replace(/'/g, "&#39;");
	};

	baidu.encodeHTML = baidu.string.encodeHTML;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/filterFormat.js
	 * author: rocy
	 * version: 1.1.2
	 * date: 2010/06/10
	 */



	/**
	 * 對目標字符串進行格式化,支持過濾
	 * @name baidu.string.filterFormat
	 * @function
	 * @grammar baidu.string.filterFormat(source, opts)
	 * @param {string} source 目標字符串
	 * @param {Object|string...} opts 提供相應數據的對象
	 * @version 1.2
	 * @remark
	 * 
	在 baidu.string.format的基礎上,增加了過濾功能. 目標字符串中的#{url|escapeUrl},<br/>
	會替換成baidu.string.filterFormat["escapeUrl"](opts.url);<br/>
	過濾函數需要之前掛載在baidu.string.filterFormat屬性中.
			
	 * @see baidu.string.format,baidu.string.filterFormat.escapeJs,baidu.string.filterFormat.escapeString,baidu.string.filterFormat.toInt
	 * @returns {string} 格式化後的字符串
	 */
	baidu.string.filterFormat = function (source, opts) {
	    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
	    if(data.length){
		    data = data.length == 1 ? 
		    	/* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
		    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
		    	: data;
	    	return source.replace(/#\{(.+?)\}/g, function (match, key){
			    var filters, replacer, i, len, func;
			    if(!data) return '';
		    	filters = key.split("|");
		    	replacer = data[filters[0]];
		    	// chrome 下 typeof /a/ == 'function'
		    	if('[object Function]' == toString.call(replacer)){
		    		replacer = replacer(filters[0]/*key*/);
		    	}
		    	for(i=1,len = filters.length; i< len; ++i){
		    		func = baidu.string.filterFormat[filters[i]];
		    		if('[object Function]' == toString.call(func)){
		    			replacer = func(replacer);
		    		}
		    	}
		    	return ( ('undefined' == typeof replacer || replacer === null)? '' : replacer);
	    	});
	    }
	    return source;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/filterFormat/escapeJs.js
	 * author: rocy
	 * version: 1.1.2
	 * date: 2010/06/12
	 */


	/**
	 * 對js片段的字符做安全轉義,編碼低於255的都將轉換成\x加16進制數
	 * @name baidu.string.filterFormat.escapeJs
	 * @function
	 * @grammar baidu.string.filterFormat.escapeJs(source)
	 * @param {String} source 待轉義字符串
	 * 
	 * @see baidu.string.filterFormat,baidu.string.filterFormat.escapeString,baidu.string.filterFormat.toInt
	 * @version 1.2
	 * @return {String} 轉義之後的字符串
	 */
	baidu.string.filterFormat.escapeJs = function(str){
		if(!str || 'string' != typeof str) return str;
		var i,len,charCode,ret = [];
		for(i=0, len=str.length; i < len; ++i){
			charCode = str.charCodeAt(i);
			if(charCode > 255){
				ret.push(str.charAt(i));
			} else{
				ret.push('\\x' + charCode.toString(16));
			}
		}
		return ret.join('');
	};
	baidu.string.filterFormat.js = baidu.string.filterFormat.escapeJs;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/filterFormat/escapeString.js
	 * author: rocy
	 * version: 1.1.2
	 * date: 2010/06/12
	 */


	/**
	 * 對字符串做安全轉義,轉義字符包括: 單引號,雙引號,左右小括號,斜杠,反斜杠,上引號.
	 * @name baidu.string.filterFormat.escapeString
	 * @function
	 * @grammar baidu.string.filterFormat.escapeString(source)
	 * @param {String} source 待轉義字符串
	 * 
	 * @see baidu.string.filterFormat,baidu.string.filterFormat.escapeJs,baidu.string.filterFormat.toInt
	 * @version 1.2
	 * @return {String} 轉義之後的字符串
	 */
	baidu.string.filterFormat.escapeString = function(str){
		if(!str || 'string' != typeof str) return str;
		return str.replace(/["'<>\\\/`]/g, function($0){
		   return '&#'+ $0.charCodeAt(0) +';';
		});
	};

	baidu.string.filterFormat.e = baidu.string.filterFormat.escapeString;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/filterFormat/toInt.js
	 * author: rocy
	 * version: 1.1.2
	 * date: 2010/06/12
	 */


	/**
	 * 對數字做安全轉義,確保是十進制數字;否則返回0.
	 * @name baidu.string.filterFormat.toInt
	 * @function
	 * @grammar baidu.string.filterFormat.toInt(source)
	 * @param {String} source 待轉義字符串
	 * 
	 * @see baidu.string.filterFormat,baidu.string.filterFormat.escapeJs,baidu.string.filterFormat.escapeString
	 * @version 1.2
	 * @return {Number} 轉義之後的數字
	 */
	baidu.string.filterFormat.toInt = function(str){
		return parseInt(str, 10) || 0;
	};
	baidu.string.filterFormat.i = baidu.string.filterFormat.toInt;
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/format.js
	 * author: dron, erik
	 * version: 1.1.0
	 * date: 2009/11/30
	 */



	/**
	 * 對目標字符串進行格式化
	 * @name baidu.string.format
	 * @function
	 * @grammar baidu.string.format(source, opts)
	 * @param {string} source 目標字符串
	 * @param {Object|string...} opts 提供相應數據的對象或多個字符串
	 * @remark
	 * 
	opts參數為“Object”時，替換目標字符串中的#{property name}部分。<br>
	opts為“string...”時，替換目標字符串中的#{0}、#{1}...部分。
			
	 * @shortcut format
	 * @meta standard
	 *             
	 * @returns {string} 格式化後的字符串
	 */
	baidu.string.format = function (source, opts) {
	    source = String(source);
	    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
	    if(data.length){
		    data = data.length == 1 ? 
		    	/* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
		    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
		    	: data;
	    	return source.replace(/#\{(.+?)\}/g, function (match, key){
		    	var replacer = data[key];
		    	// chrome 下 typeof /a/ == 'function'
		    	if('[object Function]' == toString.call(replacer)){
		    		replacer = replacer(key);
		    	}
		    	return ('undefined' == typeof replacer ? '' : replacer);
	    	});
	    }
	    return source;
	};

	// 聲明快捷方法
	baidu.format = baidu.string.format;
	/*
	 * Tangram
	 * Copyright 2010 Baidu Inc. All rights reserved.
	 * 
	 * @author: meizz
	 * @namespace: baidu.string.formatColor
	 * @version: 2010-01-23
	 */



	/**
	 * 將各種瀏覽器里的顏色值轉換成 #RRGGBB 的格式
	 * @name baidu.string.formatColor
	 * @function
	 * @grammar baidu.string.formatColor(color)
	 * @param {string} color 顏色值字符串
	 * @version 1.3
	 *             
	 * @returns {string} #RRGGBB格式的字符串或空
	 */
	(function(){
	    // 將正則表達式預創建，可提高效率
	    var reg1 = /^\#[\da-f]{6}$/i,
	        reg2 = /^rgb\((\d+), (\d+), (\d+)\)$/,
	        keyword = {
	            black: '#000000',
	            silver: '#c0c0c0',
	            gray: '#808080',
	            white: '#ffffff',
	            maroon: '#800000',
	            red: '#ff0000',
	            purple: '#800080',
	            fuchsia: '#ff00ff',
	            green: '#008000',
	            lime: '#00ff00',
	            olive: '#808000',
	            yellow: '#ffff0',
	            navy: '#000080',
	            blue: '#0000ff',
	            teal: '#008080',
	            aqua: '#00ffff'
	        };

	    baidu.string.formatColor = function(color) {
	        if(reg1.test(color)) {
	            // #RRGGBB 直接返回
	            return color;
	        } else if(reg2.test(color)) {
	            // 非IE中的 rgb(0, 0, 0)
	            for (var s, i=1, color="#"; i<4; i++) {
	                s = parseInt(RegExp["\x24"+ i]).toString(16);
	                color += ("00"+ s).substr(s.length);
	            }
	            return color;
	        } else if(/^\#[\da-f]{3}$/.test(color)) {
	            // 簡寫的顏色值: #F00
	            var s1 = color.charAt(1),
	                s2 = color.charAt(2),
	                s3 = color.charAt(3);
	            return "#"+ s1 + s1 + s2 + s2 + s3 + s3;
	        }else if(keyword[color])
	            return keyword[color];
	        
	        return "";
	    };
	})();

	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/getByteLength.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */



	/**
	 * 獲取目標字符串在gbk編碼下的字節長度
	 * @name baidu.string.getByteLength
	 * @function
	 * @grammar baidu.string.getByteLength(source)
	 * @param {string} source 目標字符串
	 * @remark
	 * 獲取字符在gbk編碼下的字節長度, 實現原理是認為大於127的就一定是雙字節。如果字符超出gbk編碼範圍, 則這個計算不準確
	 * @meta standard
	 * @see baidu.string.subByte
	 *             
	 * @returns {number} 字節長度
	 */
	baidu.string.getByteLength = function (source) {
	    return String(source).replace(/[^\x00-\xff]/g, "ci").length;
	};
	/*
	 * tangram
	 * copyright 2011 baidu inc. all rights reserved.
	 *
	 * path: baidu/string/stripTags.js
	 * author: leeight
	 * version: 1.1.0
	 * date: 2011/04/30
	 */



	/**
	 * 去掉字符串中的html標簽
	 * @param {string} source 要處理的字符串.
	 * @return {string}
	 */
	baidu.string.stripTags = function(source) {
	    return String(source || '').replace(/<[^>]+>/g, '');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/subByte.js
	 * author: dron, erik, berg
	 * version: 1.2
	 * date: 2010-06-30
	 */



	/**
	 * 對目標字符串按gbk編碼截取字節長度
	 * @name baidu.string.subByte
	 * @function
	 * @grammar baidu.string.subByte(source, length)
	 * @param {string} source 目標字符串
	 * @param {number} length 需要截取的字節長度
	 * @param {string} [tail] 追加字符串,可選.
	 * @remark
	 * 截取過程中，遇到半個漢字時，向下取整。
	 * @see baidu.string.getByteLength
	 *             
	 * @returns {string} 字符串截取結果
	 */
	baidu.string.subByte = function (source, length, tail) {
	    source = String(source);
	    tail = tail || '';
	    if (length < 0 || baidu.string.getByteLength(source) <= length) {
	        return source + tail;
	    }
	    
	    //thanks 加寬提供優化方法
	    source = source.substr(0,length).replace(/([^\x00-\xff])/g,"\x241 ")//雙字節字符替換成兩個
	        .substr(0,length)//截取長度
	        .replace(/[^\x00-\xff]$/,"")//去掉臨界雙字節字符
	        .replace(/([^\x00-\xff]) /g,"\x241");//還原
	    return source + tail;

	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/toHalfWidth.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/15
	 */


	/**
	 * 將目標字符串中常見全角字符轉換成半角字符
	 * @name baidu.string.toHalfWidth
	 * @function
	 * @grammar baidu.string.toHalfWidth(source)
	 * @param {string} source 目標字符串
	 * @remark
	 * 
	將全角的字符轉成半角, 將“&amp;#xFF01;”至“&amp;#xFF5E;”範圍的全角轉成“&amp;#33;”至“&amp;#126;”, 還包括全角空格包括常見的全角數字/空格/字母, 用於需要同時支持全半角的轉換, 具體轉換列表如下("空格"未列出)：<br><br>

	！ => !<br>
	＂ => "<br>
	＃ => #<br>
	＄ => $<br>
	％ => %<br>
	＆ => &<br>
	＇ => '<br>
	（ => (<br>
	） => )<br>
	＊ => *<br>
	＋ => +<br>
	， => ,<br>
	－ => -<br>
	． => .<br>
	／ => /<br>
	０ => 0<br>
	１ => 1<br>
	２ => 2<br>
	３ => 3<br>
	４ => 4<br>
	５ => 5<br>
	６ => 6<br>
	７ => 7<br>
	８ => 8<br>
	９ => 9<br>
	： => :<br>
	； => ;<br>
	＜ => <<br>
	＝ => =<br>
	＞ => ><br>
	？ => ?<br>
	＠ => @<br>
	Ａ => A<br>
	Ｂ => B<br>
	Ｃ => C<br>
	Ｄ => D<br>
	Ｅ => E<br>
	Ｆ => F<br>
	Ｇ => G<br>
	Ｈ => H<br>
	Ｉ => I<br>
	Ｊ => J<br>
	Ｋ => K<br>
	Ｌ => L<br>
	Ｍ => M<br>
	Ｎ => N<br>
	Ｏ => O<br>
	Ｐ => P<br>
	Ｑ => Q<br>
	Ｒ => R<br>
	Ｓ => S<br>
	Ｔ => T<br>
	Ｕ => U<br>
	Ｖ => V<br>
	Ｗ => W<br>
	Ｘ => X<br>
	Ｙ => Y<br>
	Ｚ => Z<br>
	［ => [<br>
	＼ => \<br>
	］ => ]<br>
	＾ => ^<br>
	＿ => _<br>
	｀ => `<br>
	ａ => a<br>
	ｂ => b<br>
	ｃ => c<br>
	ｄ => d<br>
	ｅ => e<br>
	ｆ => f<br>
	ｇ => g<br>
	ｈ => h<br>
	ｉ => i<br>
	ｊ => j<br>
	ｋ => k<br>
	ｌ => l<br>
	ｍ => m<br>
	ｎ => n<br>
	ｏ => o<br>
	ｐ => p<br>
	ｑ => q<br>
	ｒ => r<br>
	ｓ => s<br>
	ｔ => t<br>
	ｕ => u<br>
	ｖ => v<br>
	ｗ => w<br>
	ｘ => x<br>
	ｙ => y<br>
	ｚ => z<br>
	｛ => {<br>
	｜ => |<br>
	｝ => }<br>
	～ => ~<br>
			
	 *             
	 * @returns {string} 轉換後的字符串
	 */

	baidu.string.toHalfWidth = function (source) {
	    return String(source).replace(/[\uFF01-\uFF5E]/g, 
	        function(c){
	            return String.fromCharCode(c.charCodeAt(0) - 65248);
	        }).replace(/\u3000/g," ");
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/string/wbr.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/30
	 */



	/**
	 * 為目標字符串添加wbr軟換行
	 * @name baidu.string.wbr
	 * @function
	 * @grammar baidu.string.wbr(source)
	 * @param {string} source 目標字符串
	 * @remark
	 * 
	1.支持html標簽、屬性以及字符實體。<br>
	2.任意字符中間都會插入wbr標簽，對於過長的文本，會造成dom節點元素增多，占用瀏覽器資源。
	3.在opera下，瀏覽器默認css不會為wbr加上樣式，導致沒有換行效果，可以在css中加上 wbr:after { content: "\00200B" } 解決此問題
			
	 *             
	 * @returns {string} 添加軟換行後的字符串
	 */
	baidu.string.wbr = function (source) {
	    return String(source)
	        .replace(/(?:<[^>]+>)|(?:&#?[0-9a-z]{2,6};)|(.{1})/gi, '$&<wbr>')
	        .replace(/><wbr>/g, '>');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/swf.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/16
	 */


	/**
	 * @namespace baidu.swf 操作flash對象的方法，包括創建flash對象、獲取flash對象以及判斷flash插件的版本號。
	*/
	baidu.swf = baidu.swf || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/swf/version.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 瀏覽器支持的flash插件版本
	 * @property version 瀏覽器支持的flash插件版本
	 * @grammar baidu.swf.version 
	 * @meta standard
	 */
	baidu.swf.version = (function () {
	    var n = navigator;
	    if (n.plugins && n.mimeTypes.length) {
	        var plugin = n.plugins["Shockwave Flash"];
	        if (plugin && plugin.description) {
	            return plugin.description
	                    .replace(/([a-zA-Z]|\s)+/, "")
	                    .replace(/(\s)+r/, ".") + ".0";
	        }
	    } else if (window.ActiveXObject && !window.opera) {
	        for (var i = 12; i >= 2; i--) {
	            try {
	                var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
	                if (c) {
	                    var version = c.GetVariable("$version");
	                    return version.replace(/WIN/g,'').replace(/,/g,'.');
	                }
	            } catch(e) {}
	        }
	    }
	})();
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/swf/createHTML.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */




	/**
	 * 創建flash對象的html字符串
	 * @name baidu.swf.createHTML
	 * @function
	 * @grammar baidu.swf.createHTML(options)
	 * 
	 * @param {Object} 	options 					創建flash的選項參數
	 * @param {string} 	options.id 					要創建的flash的標識
	 * @param {string} 	options.url 				flash文件的url
	 * @param {String} 	options.errorMessage 		未安裝flash player或flash player版本號過低時的提示
	 * @param {string} 	options.ver 				最低需要的flash player版本號
	 * @param {string} 	options.width 				flash的寬度
	 * @param {string} 	options.height 				flash的高度
	 * @param {string} 	options.align 				flash的對齊方式，允許值：middle/left/right/top/bottom
	 * @param {string} 	options.base 				設置用於解析swf文件中的所有相對路徑語句的基本目錄或URL
	 * @param {string} 	options.bgcolor 			swf文件的背景色
	 * @param {string} 	options.salign 				設置縮放的swf文件在由width和height設置定義的區域內的位置。允許值：l/r/t/b/tl/tr/bl/br
	 * @param {boolean} options.menu 				是否顯示右鍵菜單，允許值：true/false
	 * @param {boolean} options.loop 				播放到最後一幀時是否重新播放，允許值： true/false
	 * @param {boolean} options.play 				flash是否在瀏覽器加載時就開始播放。允許值：true/false
	 * @param {string} 	options.quality 			設置flash播放的畫質，允許值：low/medium/high/autolow/autohigh/best
	 * @param {string} 	options.scale 				設置flash內容如何縮放來適應設置的寬高。允許值：showall/noborder/exactfit
	 * @param {string} 	options.wmode 				設置flash的顯示模式。允許值：window/opaque/transparent
	 * @param {string} 	options.allowscriptaccess 	設置flash與頁面的通信權限。允許值：always/never/sameDomain
	 * @param {string} 	options.allownetworking 	設置swf文件中允許使用的網絡API。允許值：all/internal/none
	 * @param {boolean} options.allowfullscreen 	是否允許flash全屏。允許值：true/false
	 * @param {boolean} options.seamlesstabbing 	允許設置執行無縫跳格，從而使用戶能跳出flash應用程序。該參數只能在安裝Flash7及更高版本的Windows中使用。允許值：true/false
	 * @param {boolean} options.devicefont 			設置靜態文本對象是否以設備字體呈現。允許值：true/false
	 * @param {boolean} options.swliveconnect 		第一次加載flash時瀏覽器是否應啟動Java。允許值：true/false
	 * @param {Object} 	options.vars 				要傳遞給flash的參數，支持JSON或string類型。
	 * 
	 * @see baidu.swf.create
	 * @meta standard
	 * @returns {string} flash對象的html字符串
	 */
	baidu.swf.createHTML = function (options) {
	    options = options || {};
	    var version = baidu.swf.version, 
	        needVersion = options['ver'] || '6.0.0', 
	        vUnit1, vUnit2, i, k, len, item, tmpOpt = {},
	        encodeHTML = baidu.string.encodeHTML;
	    
	    // 覆制options，避免修改原對象
	    for (k in options) {
	        tmpOpt[k] = options[k];
	    }
	    options = tmpOpt;
	    
	    // 瀏覽器支持的flash插件版本判斷
	    if (version) {
	        version = version.split('.');
	        needVersion = needVersion.split('.');
	        for (i = 0; i < 3; i++) {
	            vUnit1 = parseInt(version[i], 10);
	            vUnit2 = parseInt(needVersion[i], 10);
	            if (vUnit2 < vUnit1) {
	                break;
	            } else if (vUnit2 > vUnit1) {
	                return ''; // 需要更高的版本號
	            }
	        }
	    } else {
	        return ''; // 未安裝flash插件
	    }
	    
	    var vars = options['vars'],
	        objProperties = ['classid', 'codebase', 'id', 'width', 'height', 'align'];
	    
	    // 初始化object標簽需要的classid、codebase屬性值
	    options['align'] = options['align'] || 'middle';
	    options['classid'] = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
	    options['codebase'] = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0';
	    options['movie'] = options['url'] || '';
	    delete options['vars'];
	    delete options['url'];
	    
	    // 初始化flashvars參數的值
	    if ('string' == typeof vars) {
	        options['flashvars'] = vars;
	    } else {
	        var fvars = [];
	        for (k in vars) {
	            item = vars[k];
	            fvars.push(k + "=" + encodeURIComponent(item));
	        }
	        options['flashvars'] = fvars.join('&');
	    }
	    
	    // 構建IE下支持的object字符串，包括屬性和參數列表
	    var str = ['<object '];
	    for (i = 0, len = objProperties.length; i < len; i++) {
	        item = objProperties[i];
	        str.push(' ', item, '="', encodeHTML(options[item]), '"');
	    }
	    str.push('>');
	    var params = {
	        'wmode'             : 1,
	        'scale'             : 1,
	        'quality'           : 1,
	        'play'              : 1,
	        'loop'              : 1,
	        'menu'              : 1,
	        'salign'            : 1,
	        'bgcolor'           : 1,
	        'base'              : 1,
	        'allowscriptaccess' : 1,
	        'allownetworking'   : 1,
	        'allowfullscreen'   : 1,
	        'seamlesstabbing'   : 1,
	        'devicefont'        : 1,
	        'swliveconnect'     : 1,
	        'flashvars'         : 1,
	        'movie'             : 1
	    };
	    
	    for (k in options) {
	        item = options[k];
	        k = k.toLowerCase();
	        if (params[k] && (item || item === false || item === 0)) {
	            str.push('<param name="' + k + '" value="' + encodeHTML(item) + '" />');
	        }
	    }
	    
	    // 使用embed時，flash地址的屬性名是src，並且要指定embed的type和pluginspage屬性
	    options['src']  = options['movie'];
	    options['name'] = options['id'];
	    delete options['id'];
	    delete options['movie'];
	    delete options['classid'];
	    delete options['codebase'];
	    options['type'] = 'application/x-shockwave-flash';
	    options['pluginspage'] = 'http://www.macromedia.com/go/getflashplayer';
	    
	    
	    // 構建embed標簽的字符串
	    str.push('<embed');
	    // 在firefox、opera、safari下，salign屬性必須在scale屬性之後，否則會失效
	    // 經過討論，決定采用BT方法，把scale屬性的值先保存下來，最後輸出
	    var salign;
	    for (k in options) {
	        item = options[k];
	        if (item || item === false || item === 0) {
	            if ((new RegExp("^salign\x24", "i")).test(k)) {
	                salign = item;
	                continue;
	            }
	            
	            str.push(' ', k, '="', encodeHTML(item), '"');
	        }
	    }
	    
	    if (salign) {
	        str.push(' salign="', encodeHTML(salign), '"');
	    }
	    str.push('></embed></object>');
	    
	    return str.join('');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/swf/create.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/17
	 */



	/**
	 * 在頁面中創建一個flash對象
	 * @name baidu.swf.create
	 * @function
	 * @grammar baidu.swf.create(options[, container])
	 * 
	 * @param {Object} 	options 					創建flash的選項參數
	 * @param {string} 	options.id 					要創建的flash的標識
	 * @param {string} 	options.url 				flash文件的url
	 * @param {String} 	options.errorMessage 		未安裝flash player或flash player版本號過低時的提示
	 * @param {string} 	options.ver 				最低需要的flash player版本號
	 * @param {string} 	options.width 				flash的寬度
	 * @param {string} 	options.height 				flash的高度
	 * @param {string} 	options.align 				flash的對齊方式，允許值：middle/left/right/top/bottom
	 * @param {string} 	options.base 				設置用於解析swf文件中的所有相對路徑語句的基本目錄或URL
	 * @param {string} 	options.bgcolor 			swf文件的背景色
	 * @param {string} 	options.salign 				設置縮放的swf文件在由width和height設置定義的區域內的位置。允許值：l/r/t/b/tl/tr/bl/br
	 * @param {boolean} options.menu 				是否顯示右鍵菜單，允許值：true/false
	 * @param {boolean} options.loop 				播放到最後一幀時是否重新播放，允許值： true/false
	 * @param {boolean} options.play 				flash是否在瀏覽器加載時就開始播放。允許值：true/false
	 * @param {string} 	options.quality 			設置flash播放的畫質，允許值：low/medium/high/autolow/autohigh/best
	 * @param {string} 	options.scale 				設置flash內容如何縮放來適應設置的寬高。允許值：showall/noborder/exactfit
	 * @param {string} 	options.wmode 				設置flash的顯示模式。允許值：window/opaque/transparent
	 * @param {string} 	options.allowscriptaccess 	設置flash與頁面的通信權限。允許值：always/never/sameDomain
	 * @param {string} 	options.allownetworking 	設置swf文件中允許使用的網絡API。允許值：all/internal/none
	 * @param {boolean} options.allowfullscreen 	是否允許flash全屏。允許值：true/false
	 * @param {boolean} options.seamlesstabbing 	允許設置執行無縫跳格，從而使用戶能跳出flash應用程序。該參數只能在安裝Flash7及更高版本的Windows中使用。允許值：true/false
	 * @param {boolean} options.devicefont 			設置靜態文本對象是否以設備字體呈現。允許值：true/false
	 * @param {boolean} options.swliveconnect 		第一次加載flash時瀏覽器是否應啟動Java。允許值：true/false
	 * @param {Object} 	options.vars 				要傳遞給flash的參數，支持JSON或string類型。
	 * 
	 * @param {HTMLElement|string} [container] 		flash對象的父容器元素，不傳遞該參數時在當前代碼位置創建flash對象。
	 * @meta standard
	 * @see baidu.swf.createHTML,baidu.swf.getMovie
	 */
	baidu.swf.create = function (options, target) {
	    options = options || {};
	    var html = baidu.swf.createHTML(options) 
	               || options['errorMessage'] 
	               || '';
	                
	    if (target && 'string' == typeof target) {
	        target = document.getElementById(target);
	    }
	    
	    if (target) {
	        target.innerHTML = html;
	    } else {
	        document.write(html);
	    }
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/swf/getMovie.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/16
	 */





	/**
	 * 獲得flash對象的實例
	 * @name baidu.swf.getMovie
	 * @function
	 * @grammar baidu.swf.getMovie(name)
	 * @param {string} name flash對象的名稱
	 * @see baidu.swf.create
	 * @meta standard
	 * @returns {HTMLElement} flash對象的實例
	 */
	baidu.swf.getMovie = function (name) {
		//ie9下, Object標簽和embed標簽嵌套的方式生成flash時,
		//會導致document[name]多返回一個Object元素,而起作用的只有embed標簽
		var movie = document[name], ret;
	    return baidu.browser.ie == 9 ?
	    	movie && movie.length ? 
	    		(ret = baidu.array.remove(baidu.lang.toArray(movie),function(item){
	    			return item.tagName.toLowerCase() != "embed";
	    		})).length == 1 ? ret[0] : ret
	    		: movie
	    	: movie || window[name];
	};
	/*
	 * Tangram
	 * Copyright 2011 Baidu Inc. All rights reserved.
	 */






	/**
	 * Js 調用 Flash方法的代理類.
	 * @function
	 * @name baidu.swf.Proxy
	 * @grammar new baidu.swf.Proxy(id, property, [, loadedHandler])
	 * @param {string} id Flash的元素id.object標簽id, embed標簽name.
	 * @param {string} property Flash的方法或者屬性名稱，用來檢測Flash是否初始化好了.
	 * @param {Function} loadedHandler 初始化之後的回調函數.
	 * @remark Flash對應的DOM元素必須已經存在, 否則拋錯. 可以使用baidu.swf.create預先創建Flash對應的DOM元素.
	 * @author liyubei@baidu.com (leeight)
	 */
	baidu.swf.Proxy = function(id, property, loadedHandler) {
	    /**
	     * 頁面上的Flash對象
	     * @type {HTMLElement}
	     */
	    var me = this,
	        flash = this._flash = baidu.swf.getMovie(id),
	        timer;
	    if (! property) {
	        return this;
	    }
	    timer = setInterval(function() {
	        try {
	            /** @preserveTry */
	            if (flash[property]) {
	                me._initialized = true;
	                clearInterval(timer);
	                if (loadedHandler) {
	                    loadedHandler();
	                }
	            }
	        } catch (e) {
	        }
	    }, 100);
	};
	/**
	 * 獲取flash對象.
	 * @return {HTMLElement} Flash對象.
	 */
	baidu.swf.Proxy.prototype.getFlash = function() {
	    return this._flash;
	};
	/**
	 * 判斷Flash是否初始化完成,可以與js進行交互.
	 */
	baidu.swf.Proxy.prototype.isReady = function() {
	    return !! this._initialized;
	};
	/**
	 * 調用Flash中的某個方法
	 * @param {string} methodName 方法名.
	 * @param {...*} var_args 方法的參數.
	 */
	baidu.swf.Proxy.prototype.call = function(methodName, var_args) {
	    try {
	        var flash = this.getFlash(),
	            args = Array.prototype.slice.call(arguments);

	        args.shift();
	        if (flash[methodName]) {
	            flash[methodName].apply(flash, args);
	        }
	    } catch (e) {
	    }
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/url.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/16
	 */


	/**
	 * @namespace baidu.url 操作url的方法。
	 */
	baidu.url = baidu.url || {};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/url/escapeSymbol.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/16
	 */



	/**
	 * 對字符串進行%&+/#=和空格七個字符進行url轉義
	 * @name baidu.url.escapeSymbol
	 * @function
	 * @grammar baidu.url.escapeSymbol(source)
	 * @param {string} source 需要轉義的字符串
	 * @return {string} 轉義之後的字符串.
	 * @remark
	 * 用於get請求轉義。在服務器只接受gbk，並且頁面是gbk編碼時，可以經過本轉義後直接發get請求。
	 *             
	 * @returns {string} 轉義後的字符串
	 */
	baidu.url.escapeSymbol = function (source) {
	    return String(source).replace(/\%/g, "%25")
	                        .replace(/&/g, "%26")
	                        .replace(/\+/g, "%2B")
	                        .replace(/\ /g, "%20")
	                        .replace(/\//g, "%2F")
	                        .replace(/\#/g, "%23")
	                        .replace(/\=/g, "%3D");
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/url/getQueryValue.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/16
	 */




	/**
	 * 根據參數名從目標URL中獲取參數值
	 * @name baidu.url.getQueryValue
	 * @function
	 * @grammar baidu.url.getQueryValue(url, key)
	 * @param {string} url 目標URL
	 * @param {string} key 要獲取的參數名
	 * @meta standard
	 * @see baidu.url.jsonToQuery
	 *             
	 * @returns {string|null} - 獲取的參數值，其中URI編碼後的字符不會被解碼，獲取不到時返回null
	 */
	baidu.url.getQueryValue = function (url, key) {
	    var reg = new RegExp(
	                        "(^|&|\\?|#)" 
	                        + baidu.string.escapeReg(key) 
	                        + "=([^&#]*)(&|\x24|#)", 
	                    "");
	    var match = url.match(reg);
	    if (match) {
	        return match[2];
	    }
	    
	    return null;
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/url/jsonToQuery.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/16
	 */





	/**
	 * 將json對象解析成query字符串
	 * @name baidu.url.jsonToQuery
	 * @function
	 * @grammar baidu.url.jsonToQuery(json[, replacer])
	 * @param {Object} json 需要解析的json對象
	 * @param {Function=} replacer_opt 對值進行特殊處理的函數，function (value, key)
	 * @see baidu.url.queryToJson,baidu.url.getQueryValue
	 *             
	 * @return {string} - 解析結果字符串，其中值將被URI編碼，{a:'&1 '} ==> "a=%261%20"。
	 */
	baidu.url.jsonToQuery = function (json, replacer_opt) {
	    var result = [], 
	        itemLen,
	        replacer = replacer_opt || function (value) {
	          return baidu.url.escapeSymbol(value);
	        };
	        
	    baidu.object.each(json, function(item, key){
	        // 這里只考慮item為數組、字符串、數字類型，不考慮嵌套的object
	        if (baidu.lang.isArray(item)) {
	            itemLen = item.length;
	            // FIXME value的值需要encodeURIComponent轉義嗎？
	            while (itemLen--) {
	                result.push(key + '=' + replacer(item[itemLen], key));
	            }
	        } else {
	            result.push(key + '=' + replacer(item, key));
	        }
	    });
	    
	    return result.join('&');
	};
	/*
	 * Tangram
	 * Copyright 2009 Baidu Inc. All rights reserved.
	 * 
	 * path: baidu/url/queryToJson.js
	 * author: erik
	 * version: 1.1.0
	 * date: 2009/11/16
	 */




	/**
	 * 解析目標URL中的參數成json對象
	 * @name baidu.url.queryToJson
	 * @function
	 * @grammar baidu.url.queryToJson(url)
	 * @param {string} url 目標URL
	 * @see baidu.url.jsonToQuery
	 *             
	 * @returns {Object} - 解析為結果對象，其中URI編碼後的字符不會被解碼，'a=%20' ==> {a:'%20'}。
	 */
	baidu.url.queryToJson = function (url) {
	    var query   = url.substr(url.lastIndexOf('?') + 1),
	        params  = query.split('&'),
	        len     = params.length,
	        result  = {},
	        i       = 0,
	        key, value, item, param;
	    
	    for (; i < len; i++) {
	        if(!params[i]){
	            continue;
	        }
	        param   = params[i].split('=');
	        key     = param[0];
	        value   = param[1];
	        
	        item = result[key];
	        if ('undefined' == typeof item) {
	            result[key] = value;
	        } else if (baidu.lang.isArray(item)) {
	            item.push(value);
	        } else { // 這里只可能是string了
	            result[key] = [item, value];
	        }
	    }
	    
	    return result;
	};

})();