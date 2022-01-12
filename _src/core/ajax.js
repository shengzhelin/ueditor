/**
 * @file
 * @module UE.ajax
 * @since 1.2.6.1
 */

/**
 * 提供對ajax請求的支持
 * @module UE.ajax
 */
UE.ajax = (function() {
  //創建一個ajaxRequest對象
  var fnStr = "XMLHttpRequest()";
  try {
    new ActiveXObject("Msxml2.XMLHTTP");
    fnStr = "ActiveXObject('Msxml2.XMLHTTP')";
  } catch (e) {
    try {
      new ActiveXObject("Microsoft.XMLHTTP");
      fnStr = "ActiveXObject('Microsoft.XMLHTTP')";
    } catch (e) {}
  }
  var creatAjaxRequest = new Function("return new " + fnStr);

  /**
     * 將json參數轉化成適合ajax提交的參數列表
     * @param json
     */
  function json2str(json) {
    var strArr = [];
    for (var i in json) {
      //忽略默認的幾個參數
      if (
        i == "method" ||
        i == "timeout" ||
        i == "async" ||
        i == "dataType" ||
        i == "callback"
      )
        continue;
      //忽略控制
      if (json[i] == undefined || json[i] == null) continue;
      //傳遞過來的對象和函數不在提交之列
      if (
        !(
          (typeof json[i]).toLowerCase() == "function" ||
          (typeof json[i]).toLowerCase() == "object"
        )
      ) {
        strArr.push(encodeURIComponent(i) + "=" + encodeURIComponent(json[i]));
      } else if (utils.isArray(json[i])) {
        //支持傳數組內容
        for (var j = 0; j < json[i].length; j++) {
          strArr.push(
            encodeURIComponent(i) + "[]=" + encodeURIComponent(json[i][j])
          );
        }
      }
    }
    return strArr.join("&");
  }

  function doAjax(url, ajaxOptions) {
    var xhr = creatAjaxRequest(),
      //是否超時
      timeIsOut = false,
      //默認參數
      defaultAjaxOptions = {
        method: "POST",
        timeout: 5000,
        async: true,
        data: {}, //需要傳遞對象的話只能覆蓋
        onsuccess: function() {},
        onerror: function() {}
      };

    if (typeof url === "object") {
      ajaxOptions = url;
      url = ajaxOptions.url;
    }
    if (!xhr || !url) return;
    var ajaxOpts = ajaxOptions
      ? utils.extend(defaultAjaxOptions, ajaxOptions)
      : defaultAjaxOptions;

    var submitStr = json2str(ajaxOpts); // { name:"Jim",city:"Beijing" } --> "name=Jim&city=Beijing"
    //如果用戶直接通過data參數傳遞json對象過來，則也要將此json對象轉化為字符串
    if (!utils.isEmptyObject(ajaxOpts.data)) {
      submitStr += (submitStr ? "&" : "") + json2str(ajaxOpts.data);
    }
    //超時檢測
    var timerID = setTimeout(function() {
      if (xhr.readyState != 4) {
        timeIsOut = true;
        xhr.abort();
        clearTimeout(timerID);
      }
    }, ajaxOpts.timeout);

    var method = ajaxOpts.method.toUpperCase();
    var str =
      url +
      (url.indexOf("?") == -1 ? "?" : "&") +
      (method == "POST" ? "" : submitStr + "&noCache=" + +new Date());
    xhr.open(method, str, ajaxOpts.async);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (!timeIsOut && xhr.status == 200) {
          ajaxOpts.onsuccess(xhr);
        } else {
          ajaxOpts.onerror(xhr);
        }
      }
    };
    if (method == "POST") {
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(submitStr);
    } else {
      xhr.send(null);
    }
  }

  function doJsonp(url, opts) {
    var successhandler = opts.onsuccess || function() {},
      scr = document.createElement("SCRIPT"),
      options = opts || {},
      charset = options["charset"],
      callbackField = options["jsonp"] || "callback",
      callbackFnName,
      timeOut = options["timeOut"] || 0,
      timer,
      reg = new RegExp("(\\?|&)" + callbackField + "=([^&]*)"),
      matches;

    if (utils.isFunction(successhandler)) {
      callbackFnName =
        "bd__editor__" + Math.floor(Math.random() * 2147483648).toString(36);
      window[callbackFnName] = getCallBack(0);
    } else if (utils.isString(successhandler)) {
      callbackFnName = successhandler;
    } else {
      if ((matches = reg.exec(url))) {
        callbackFnName = matches[2];
      }
    }

    url = url.replace(reg, "\x241" + callbackField + "=" + callbackFnName);

    if (url.search(reg) < 0) {
      url +=
        (url.indexOf("?") < 0 ? "?" : "&") +
        callbackField +
        "=" +
        callbackFnName;
    }

    var queryStr = json2str(opts); // { name:"Jim",city:"Beijing" } --> "name=Jim&city=Beijing"
    //如果用戶直接通過data參數傳遞json對象過來，則也要將此json對象轉化為字符串
    if (!utils.isEmptyObject(opts.data)) {
      queryStr += (queryStr ? "&" : "") + json2str(opts.data);
    }
    if (queryStr) {
      url = url.replace(/\?/, "?" + queryStr + "&");
    }

    scr.onerror = getCallBack(1);
    if (timeOut) {
      timer = setTimeout(getCallBack(1), timeOut);
    }
    createScriptTag(scr, url, charset);

    function createScriptTag(scr, url, charset) {
      scr.setAttribute("type", "text/javascript");
      scr.setAttribute("defer", "defer");
      charset && scr.setAttribute("charset", charset);
      scr.setAttribute("src", url);
      document.getElementsByTagName("head")[0].appendChild(scr);
    }

    function getCallBack(onTimeOut) {
      return function() {
        try {
          if (onTimeOut) {
            options.onerror && options.onerror();
          } else {
            try {
              clearTimeout(timer);
              successhandler.apply(window, arguments);
            } catch (e) {}
          }
        } catch (exception) {
          options.onerror && options.onerror.call(window, exception);
        } finally {
          options.oncomplete && options.oncomplete.apply(window, arguments);
          scr.parentNode && scr.parentNode.removeChild(scr);
          window[callbackFnName] = null;
          try {
            delete window[callbackFnName];
          } catch (e) {}
        }
      };
    }
  }

  return {
    /**
         * 根據給定的參數項，向指定的url發起一個ajax請求。 ajax請求完成後，會根據請求結果調用相應回調： 如果請求
         * 成功， 則調用onsuccess回調， 失敗則調用 onerror 回調
         * @method request
         * @param { URLString } url ajax請求的url地址
         * @param { Object } ajaxOptions ajax請求選項的鍵值對，支持的選項如下：
         * @example
         * ```javascript
         * //向sayhello.php發起一個異步的Ajax GET請求, 請求超時時間為10s， 請求完成後執行相應的回調。
         * UE.ajax.requeset( 'sayhello.php', {
         *
         *     //請求方法。可選值： 'GET', 'POST'，默認值是'POST'
         *     method: 'GET',
         *
         *     //超時時間。 默認為5000， 單位是ms
         *     timeout: 10000,
         *
         *     //是否是異步請求。 true為異步請求， false為同步請求
         *     async: true,
         *
         *     //請求攜帶的數據。如果請求為GET請求， data會經過stringify後附加到請求url之後。
         *     data: {
         *         name: 'ueditor'
         *     },
         *
         *     //請求成功後的回調， 該回調接受當前的XMLHttpRequest對象作為參數。
         *     onsuccess: function ( xhr ) {
         *         console.log( xhr.responseText );
         *     },
         *
         *     //請求失敗或者超時後的回調。
         *     onerror: function ( xhr ) {
         *          alert( 'Ajax請求失敗' );
         *     }
         *
         * } );
         * ```
         */

    /**
         * 根據給定的參數項發起一個ajax請求， 參數項里必須包含一個url地址。 ajax請求完成後，會根據請求結果調用相應回調： 如果請求
         * 成功， 則調用onsuccess回調， 失敗則調用 onerror 回調。
         * @method request
         * @warning 如果在參數項里未提供一個key為“url”的地址值，則該請求將直接退出。
         * @param { Object } ajaxOptions ajax請求選項的鍵值對，支持的選項如下：
         * @example
         * ```javascript
         *
         * //向sayhello.php發起一個異步的Ajax POST請求, 請求超時時間為5s， 請求完成後不執行任何回調。
         * UE.ajax.requeset( 'sayhello.php', {
         *
         *     //請求的地址， 該項是必須的。
         *     url: 'sayhello.php'
         *
         * } );
         * ```
         */
    request: function(url, opts) {
      if (opts && opts.dataType == "jsonp") {
        doJsonp(url, opts);
      } else {
        doAjax(url, opts);
      }
    },
    getJSONP: function(url, data, fn) {
      var opts = {
        data: data,
        oncomplete: fn
      };
      doJsonp(url, opts);
    }
  };
})();
