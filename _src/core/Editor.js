/**
 * 編輯器主類，包含編輯器提供的大部分公用接口
 * @file
 * @module UE
 * @class Editor
 * @since 1.2.6.1
 */

/**
 * UEditor公用空間，UEditor所有的功能都掛載在該空間下
 * @unfile
 * @module UE
 */

/**
 * UEditor的核心類，為用戶提供與編輯器交互的接口。
 * @unfile
 * @module UE
 * @class Editor
 */

(function() {
  var uid = 0,
    _selectionChangeTimer;

  /**
     * 獲取編輯器的html內容，賦值到編輯器所在表單的textarea文本域里面
     * @private
     * @method setValue
     * @param { UE.Editor } editor 編輯器事例
     */
  function setValue(form, editor) {
    var textarea;
    if (editor.options.textarea) {
      if (utils.isString(editor.options.textarea)) {
        for (
          var i = 0, ti, tis = domUtils.getElementsByTagName(form, "textarea");
          (ti = tis[i++]);

        ) {
          if (ti.id == "ueditor_textarea_" + editor.options.textarea) {
            textarea = ti;
            break;
          }
        }
      } else {
        textarea = editor.textarea;
      }
    }
    if (!textarea) {
      form.appendChild(
        (textarea = domUtils.createElement(document, "textarea", {
          name: editor.options.textarea,
          id: "ueditor_textarea_" + editor.options.textarea,
          style: "display:none"
        }))
      );
      //不要產生多個textarea
      editor.textarea = textarea;
    }
    !textarea.getAttribute("name") &&
      textarea.setAttribute("name", editor.options.textarea);
    textarea.value = editor.hasContents()
      ? editor.options.allHtmlEnabled
        ? editor.getAllHtml()
        : editor.getContent(null, null, true)
      : "";
  }
  function loadPlugins(me) {
    //初始化插件
    for (var pi in UE.plugins) {
      UE.plugins[pi].call(me);
    }
  }
  function checkCurLang(I18N) {
    for (var lang in I18N) {
      return lang;
    }
  }

  function langReadied(me) {
    me.langIsReady = true;

    me.fireEvent("langReady");
  }

  /**
     * 編輯器準備就緒後會觸發該事件
     * @module UE
     * @class Editor
     * @event ready
     * @remind render方法執行完成之後,會觸發該事件
     * @remind
     * @example
     * ```javascript
     * editor.addListener( 'ready', function( editor ) {
     *     editor.execCommand( 'focus' ); //編輯器家在完成後，讓編輯器拿到焦點
     * } );
     * ```
     */
  /**
     * 執行destroy方法,會觸發該事件
     * @module UE
     * @class Editor
     * @event destroy
     * @see UE.Editor:destroy()
     */
  /**
     * 執行reset方法,會觸發該事件
     * @module UE
     * @class Editor
     * @event reset
     * @see UE.Editor:reset()
     */
  /**
     * 執行focus方法,會觸發該事件
     * @module UE
     * @class Editor
     * @event focus
     * @see UE.Editor:focus(Boolean)
     */
  /**
     * 語言加載完成會觸發該事件
     * @module UE
     * @class Editor
     * @event langReady
     */
  /**
     * 運行命令之後會觸發該命令
     * @module UE
     * @class Editor
     * @event beforeExecCommand
     */
  /**
     * 運行命令之後會觸發該命令
     * @module UE
     * @class Editor
     * @event afterExecCommand
     */
  /**
     * 運行命令之前會觸發該命令
     * @module UE
     * @class Editor
     * @event firstBeforeExecCommand
     */
  /**
     * 在getContent方法執行之前會觸發該事件
     * @module UE
     * @class Editor
     * @event beforeGetContent
     * @see UE.Editor:getContent()
     */
  /**
     * 在getContent方法執行之後會觸發該事件
     * @module UE
     * @class Editor
     * @event afterGetContent
     * @see UE.Editor:getContent()
     */
  /**
     * 在getAllHtml方法執行時會觸發該事件
     * @module UE
     * @class Editor
     * @event getAllHtml
     * @see UE.Editor:getAllHtml()
     */
  /**
     * 在setContent方法執行之前會觸發該事件
     * @module UE
     * @class Editor
     * @event beforeSetContent
     * @see UE.Editor:setContent(String)
     */
  /**
     * 在setContent方法執行之後會觸發該事件
     * @module UE
     * @class Editor
     * @event afterSetContent
     * @see UE.Editor:setContent(String)
     */
  /**
     * 每當編輯器內部選區發生改變時，將觸發該事件
     * @event selectionchange
     * @warning 該事件的觸發非常頻繁，不建議在該事件的處理過程中做重量級的處理
     * @example
     * ```javascript
     * editor.addListener( 'selectionchange', function( editor ) {
     *     console.log('選區發生改變');
     * }
     */
  /**
     * 在所有selectionchange的監聽函數執行之前，會觸發該事件
     * @module UE
     * @class Editor
     * @event beforeSelectionChange
     * @see UE.Editor:selectionchange
     */
  /**
     * 在所有selectionchange的監聽函數執行完之後，會觸發該事件
     * @module UE
     * @class Editor
     * @event afterSelectionChange
     * @see UE.Editor:selectionchange
     */
  /**
     * 編輯器內容發生改變時會觸發該事件
     * @module UE
     * @class Editor
     * @event contentChange
     */

  /**
     * 以默認參數構建一個編輯器實例
     * @constructor
     * @remind 通過 改構造方法實例化的編輯器,不帶ui層.需要render到一個容器,編輯器實例才能正常渲染到頁面
     * @example
     * ```javascript
     * var editor = new UE.Editor();
     * editor.execCommand('blod');
     * ```
     * @see UE.Config
     */

  /**
     * 以給定的參數集合創建一個編輯器實例，對於未指定的參數，將應用默認參數。
     * @constructor
     * @remind 通過 改構造方法實例化的編輯器,不帶ui層.需要render到一個容器,編輯器實例才能正常渲染到頁面
     * @param { Object } setting 創建編輯器的參數
     * @example
     * ```javascript
     * var editor = new UE.Editor();
     * editor.execCommand('blod');
     * ```
     * @see UE.Config
     */
  var Editor = (UE.Editor = function(options) {
    var me = this;
    me.uid = uid++;
    EventBase.call(me);
    me.commands = {};
    me.options = utils.extend(utils.clone(options || {}), UEDITOR_CONFIG, true);
    me.shortcutkeys = {};
    me.inputRules = [];
    me.outputRules = [];
    //設置默認的常用屬性
    me.setOpt(Editor.defaultOptions(me));

    /* 嘗試異步加載後台配置 */
    me.loadServerConfig();

    if (!utils.isEmptyObject(UE.I18N)) {
      //修改默認的語言類型
      me.options.lang = checkCurLang(UE.I18N);
      UE.plugin.load(me);
      langReadied(me);
    } else {
      utils.loadFile(
        document,
        {
          src:
            me.options.langPath +
              me.options.lang +
              "/" +
              me.options.lang +
              ".js",
          tag: "script",
          type: "text/javascript",
          defer: "defer"
        },
        function() {
          UE.plugin.load(me);
          langReadied(me);
        }
      );
    }

    UE.instants["ueditorInstant" + me.uid] = me;
  });
  Editor.prototype = {
    registerCommand: function(name, obj) {
      this.commands[name] = obj;
    },
    /**
         * 編輯器對外提供的監聽ready事件的接口， 通過調用該方法，達到的效果與監聽ready事件是一致的
         * @method ready
         * @param { Function } fn 編輯器ready之後所執行的回調, 如果在註冊事件之前編輯器已經ready，將會
         * 立即觸發該回調。
         * @remind 需要等待編輯器加載完成後才能執行的代碼,可以使用該方法傳入
         * @example
         * ```javascript
         * editor.ready( function( editor ) {
         *     editor.setContent('初始化完畢');
         * } );
         * ```
         * @see UE.Editor.event:ready
         */
    ready: function(fn) {
      var me = this;
      if (fn) {
        me.isReady ? fn.apply(me) : me.addListener("ready", fn);
      }
    },

    /**
         * 該方法是提供給插件里面使用，設置配置項默認值
         * @method setOpt
         * @warning 三處設置配置項的優先級: 實例化時傳入參數 > setOpt()設置 > config文件里設置
         * @warning 該方法僅供編輯器插件內部和編輯器初始化時調用，其他地方不能調用。
         * @param { String } key 編輯器的可接受的選項名稱
         * @param { * } val  該選項可接受的值
         * @example
         * ```javascript
         * editor.setOpt( 'initContent', '歡迎使用編輯器' );
         * ```
         */

    /**
         * 該方法是提供給插件里面使用，以{key:value}集合的方式設置插件內用到的配置項默認值
         * @method setOpt
         * @warning 三處設置配置項的優先級: 實例化時傳入參數 > setOpt()設置 > config文件里設置
         * @warning 該方法僅供編輯器插件內部和編輯器初始化時調用，其他地方不能調用。
         * @param { Object } options 將要設置的選項的鍵值對對象
         * @example
         * ```javascript
         * editor.setOpt( {
         *     'initContent': '歡迎使用編輯器'
         * } );
         * ```
         */
    setOpt: function(key, val) {
      var obj = {};
      if (utils.isString(key)) {
        obj[key] = val;
      } else {
        obj = key;
      }
      utils.extend(this.options, obj, true);
    },
    getOpt: function(key) {
      return this.options[key];
    },
    /**
         * 銷毀編輯器實例，使用textarea代替
         * @method destroy
         * @example
         * ```javascript
         * editor.destroy();
         * ```
         */
    destroy: function() {
      var me = this;
      me.fireEvent("destroy");
      var container = me.container.parentNode;
      var textarea = me.textarea;
      if (!textarea) {
        textarea = document.createElement("textarea");
        container.parentNode.insertBefore(textarea, container);
      } else {
        textarea.style.display = "";
      }

      textarea.style.width = me.iframe.offsetWidth + "px";
      textarea.style.height = me.iframe.offsetHeight + "px";
      textarea.value = me.getContent();
      textarea.id = me.key;
      container.innerHTML = "";
      domUtils.remove(container);
      var key = me.key;
      //trace:2004
      for (var p in me) {
        if (me.hasOwnProperty(p)) {
          delete this[p];
        }
      }
      UE.delEditor(key);
    },

    /**
         * 渲染編輯器的DOM到指定容器
         * @method render
         * @param { String } containerId 指定一個容器ID
         * @remind 執行該方法,會觸發ready事件
         * @warning 必須且只能調用一次
         */

    /**
         * 渲染編輯器的DOM到指定容器
         * @method render
         * @param { Element } containerDom 直接指定容器對象
         * @remind 執行該方法,會觸發ready事件
         * @warning 必須且只能調用一次
         */
    render: function(container) {
      var me = this,
        options = me.options,
        getStyleValue = function(attr) {
          return parseInt(domUtils.getComputedStyle(container, attr));
        };
      if (utils.isString(container)) {
        container = document.getElementById(container);
      }
      if (container) {
        if (options.initialFrameWidth) {
          options.minFrameWidth = options.initialFrameWidth;
        } else {
          options.minFrameWidth = options.initialFrameWidth =
            container.offsetWidth;
        }
        if (options.initialFrameHeight) {
          options.minFrameHeight = options.initialFrameHeight;
        } else {
          options.initialFrameHeight = options.minFrameHeight =
            container.offsetHeight;
        }

        container.style.width = /%$/.test(options.initialFrameWidth)
          ? "100%"
          : options.initialFrameWidth -
              getStyleValue("padding-left") -
              getStyleValue("padding-right") +
              "px";
        container.style.height = /%$/.test(options.initialFrameHeight)
          ? "100%"
          : options.initialFrameHeight -
              getStyleValue("padding-top") -
              getStyleValue("padding-bottom") +
              "px";

        container.style.zIndex = options.zIndex;

        var html =
          (ie && browser.version < 9 ? "" : "<!DOCTYPE html>") +
          "<html xmlns='http://www.w3.org/1999/xhtml' class='view' >" +
          "<head>" +
          "<style type='text/css'>" +
          //設置四周的留邊
          ".view{padding:0;word-wrap:break-word;cursor:text;height:90%;}\n" +
          //設置默認字體和字號
          //font-family不能呢隨便改，在safari下fillchar會有解析問題
          "body{margin:8px;font-family:sans-serif;font-size:16px;}" +
          //設置段落間距
          "p{margin:5px 0;}</style>" +
          (options.iframeCssUrl
            ? "<link rel='stylesheet' type='text/css' href='" +
                utils.unhtml(options.iframeCssUrl) +
                "'/>"
            : "") +
          (options.initialStyle
            ? "<style>" + options.initialStyle + "</style>"
            : "") +
          "</head>" +
          "<body class='view' ></body>" +
          "<script type='text/javascript' " +
          (ie ? "defer='defer'" : "") +
          " id='_initialScript'>" +
          "setTimeout(function(){editor = window.parent.UE.instants['ueditorInstant" +
          me.uid +
          "'];editor._setup(document);},0);" +
          "var _tmpScript = document.getElementById('_initialScript');_tmpScript.parentNode.removeChild(_tmpScript);" +
          "</script>" +
          (options.iframeJsUrl
            ? "<script type='text/javascript' src='" +
                utils.unhtml(options.iframeJsUrl) +
                "'></script>"
            : "") +
          "</html>";

        container.appendChild(
          domUtils.createElement(document, "iframe", {
            id: "ueditor_" + me.uid,
            width: "100%",
            height: "100%",
            frameborder: "0",
            //先注釋掉了，加的原因忘記了，但開啟會直接導致全屏模式下內容多時不會出現滾動條
            //                    scrolling :'no',
            src:
              "javascript:void(function(){document.open();" +
                (options.customDomain && document.domain != location.hostname
                  ? 'document.domain="' + document.domain + '";'
                  : "") +
                'document.write("' +
                html +
                '");document.close();}())'
          })
        );
        container.style.overflow = "hidden";
        //解決如果是給定的百分比，會導致高度算不對的問題
        setTimeout(function() {
          if (/%$/.test(options.initialFrameWidth)) {
            options.minFrameWidth = options.initialFrameWidth =
              container.offsetWidth;
            //如果這裡給定寬度，會導致ie在拖動窗口大小時，編輯區域不隨著變化
            //                        container.style.width = options.initialFrameWidth + 'px';
          }
          if (/%$/.test(options.initialFrameHeight)) {
            options.minFrameHeight = options.initialFrameHeight =
              container.offsetHeight;
            container.style.height = options.initialFrameHeight + "px";
          }
        });
      }
    },

    /**
         * 編輯器初始化
         * @method _setup
         * @private
         * @param { Element } doc 編輯器Iframe中的文檔對象
         */
    _setup: function(doc) {
      var me = this,
        options = me.options;
      if (ie) {
        doc.body.disabled = true;
        doc.body.contentEditable = true;
        doc.body.disabled = false;
      } else {
        doc.body.contentEditable = true;
      }
      doc.body.spellcheck = false;
      me.document = doc;
      me.window = doc.defaultView || doc.parentWindow;
      me.iframe = me.window.frameElement;
      me.body = doc.body;
      me.selection = new dom.Selection(doc);
      //gecko初始化就能得到range,無法判斷isFocus了
      var geckoSel;
      if (browser.gecko && (geckoSel = this.selection.getNative())) {
        geckoSel.removeAllRanges();
      }
      this._initEvents();
      //為form提交提供一個隱藏的textarea
      for (
        var form = this.iframe.parentNode;
        !domUtils.isBody(form);
        form = form.parentNode
      ) {
        if (form.tagName == "FORM") {
          me.form = form;
          if (me.options.autoSyncData) {
            domUtils.on(me.window, "blur", function() {
              setValue(form, me);
            });
          } else {
            domUtils.on(form, "submit", function() {
              setValue(this, me);
            });
          }
          break;
        }
      }
      if (options.initialContent) {
        if (options.autoClearinitialContent) {
          var oldExecCommand = me.execCommand;
          me.execCommand = function() {
            me.fireEvent("firstBeforeExecCommand");
            return oldExecCommand.apply(me, arguments);
          };
          this._setDefaultContent(options.initialContent);
        } else this.setContent(options.initialContent, false, true);
      }

      //編輯器不能為空內容

      if (domUtils.isEmptyNode(me.body)) {
        me.body.innerHTML = "<p>" + (browser.ie ? "" : "<br/>") + "</p>";
      }
      //如果要求focus, 就把光標定位到內容開始
      if (options.focus) {
        setTimeout(function() {
          me.focus(me.options.focusInEnd);
          //如果自動清除開著，就不需要做selectionchange;
          !me.options.autoClearinitialContent && me._selectionChange();
        }, 0);
      }
      if (!me.container) {
        me.container = this.iframe.parentNode;
      }
      if (options.fullscreen && me.ui) {
        me.ui.setFullScreen(true);
      }

      try {
        me.document.execCommand("2D-position", false, false);
      } catch (e) {}
      try {
        me.document.execCommand("enableInlineTableEditing", false, false);
      } catch (e) {}
      try {
        me.document.execCommand("enableObjectResizing", false, false);
      } catch (e) {}

      //掛接快捷鍵
      me._bindshortcutKeys();
      me.isReady = 1;
      me.fireEvent("ready");
      options.onready && options.onready.call(me);
      if (!browser.ie9below) {
        domUtils.on(me.window, ["blur", "focus"], function(e) {
          //chrome下會出現alt+tab切換時，導致選區位置不對
          if (e.type == "blur") {
            me._bakRange = me.selection.getRange();
            try {
              me._bakNativeRange = me.selection.getNative().getRangeAt(0);
              me.selection.getNative().removeAllRanges();
            } catch (e) {
              me._bakNativeRange = null;
            }
          } else {
            try {
              me._bakRange && me._bakRange.select();
            } catch (e) {}
          }
        });
      }
      //trace:1518 ff3.6body不夠寛，會導致點擊空白處無法獲得焦點
      if (browser.gecko && browser.version <= 10902) {
        //修覆ff3.6初始化進來，不能點擊獲得焦點
        me.body.contentEditable = false;
        setTimeout(function() {
          me.body.contentEditable = true;
        }, 100);
        setInterval(function() {
          me.body.style.height = me.iframe.offsetHeight - 20 + "px";
        }, 100);
      }

      !options.isShow && me.setHide();
      options.readonly && me.setDisabled();
    },

    /**
         * 同步數據到編輯器所在的form
         * 從編輯器的容器節點向上查找form元素，若找到，就同步編輯內容到找到的form里，為提交數據做準備，主要用於是手動提交的情況
         * 後台取得數據的鍵值，使用你容器上的name屬性，如果沒有就使用參數里的textarea項
         * @method sync
         * @example
         * ```javascript
         * editor.sync();
         * form.sumbit(); //form變量已經指向了form元素
         * ```
         */

    /**
         * 根據傳入的formId，在頁面上查找要同步數據的表單，若找到，就同步編輯內容到找到的form里，為提交數據做準備
         * 後台取得數據的鍵值，該鍵值默認使用給定的編輯器容器的name屬性，如果沒有name屬性則使用參數項里給定的“textarea”項
         * @method sync
         * @param { String } formID 指定一個要同步數據的form的id,編輯器的數據會同步到你指定form下
         */
    sync: function(formId) {
      var me = this,
        form = formId
          ? document.getElementById(formId)
          : domUtils.findParent(
              me.iframe.parentNode,
              function(node) {
                return node.tagName == "FORM";
              },
              true
            );
      form && setValue(form, me);
    },

    /**
         * 設置編輯器高度
         * @method setHeight
         * @remind 當配置項autoHeightEnabled為真時,該方法無效
         * @param { Number } number 設置的高度值，純數值，不帶單位
         * @example
         * ```javascript
         * editor.setHeight(number);
         * ```
         */
    setHeight: function(height, notSetHeight) {
      if (height !== parseInt(this.iframe.parentNode.style.height)) {
        this.iframe.parentNode.style.height = height + "px";
      }
      !notSetHeight &&
        (this.options.minFrameHeight = this.options.initialFrameHeight = height);
      this.body.style.height = height + "px";
      !notSetHeight && this.trigger("setHeight");
    },

    /**
         * 為編輯器的編輯命令提供快捷鍵
         * 這個接口是為插件擴展提供的接口,主要是為新添加的插件，如果需要添加快捷鍵，所提供的接口
         * @method addshortcutkey
         * @param { Object } keyset 命令名和快捷鍵鍵值對對象，多個按鈕的快捷鍵用“＋”分隔
         * @example
         * ```javascript
         * editor.addshortcutkey({
         *     "Bold" : "ctrl+66",//^B
         *     "Italic" : "ctrl+73", //^I
         * });
         * ```
         */
    /**
         * 這個接口是為插件擴展提供的接口,主要是為新添加的插件，如果需要添加快捷鍵，所提供的接口
         * @method addshortcutkey
         * @param { String } cmd 觸發快捷鍵時，響應的命令
         * @param { String } keys 快捷鍵的字符串，多個按鈕用“＋”分隔
         * @example
         * ```javascript
         * editor.addshortcutkey("Underline", "ctrl+85"); //^U
         * ```
         */
    addshortcutkey: function(cmd, keys) {
      var obj = {};
      if (keys) {
        obj[cmd] = keys;
      } else {
        obj = cmd;
      }
      utils.extend(this.shortcutkeys, obj);
    },

    /**
         * 對編輯器設置keydown事件監聽，綁定快捷鍵和命令，當快捷鍵組合觸發成功，會響應對應的命令
         * @method _bindshortcutKeys
         * @private
         */
    _bindshortcutKeys: function() {
      var me = this,
        shortcutkeys = this.shortcutkeys;
      me.addListener("keydown", function(type, e) {
        var keyCode = e.keyCode || e.which;
        for (var i in shortcutkeys) {
          var tmp = shortcutkeys[i].split(",");
          for (var t = 0, ti; (ti = tmp[t++]); ) {
            ti = ti.split(":");
            var key = ti[0],
              param = ti[1];
            if (
              /^(ctrl)(\+shift)?\+(\d+)$/.test(key.toLowerCase()) ||
              /^(\d+)$/.test(key)
            ) {
              if (
                ((RegExp.$1 == "ctrl" ? e.ctrlKey || e.metaKey : 0) &&
                  (RegExp.$2 != "" ? e[RegExp.$2.slice(1) + "Key"] : 1) &&
                  keyCode == RegExp.$3) ||
                keyCode == RegExp.$1
              ) {
                if (me.queryCommandState(i, param) != -1)
                  me.execCommand(i, param);
                domUtils.preventDefault(e);
              }
            }
          }
        }
      });
    },

    /**
         * 獲取編輯器的內容
         * @method getContent
         * @warning 該方法獲取到的是經過編輯器內置的過濾規則進行過濾後得到的內容
         * @return { String } 編輯器的內容字符串, 如果編輯器的內容為空，或者是空的標籤內容（如:”&lt;p&gt;&lt;br/&gt;&lt;/p&gt;“）， 則返回空字符串
         * @example
         * ```javascript
         * //編輯器html內容:<p>1<strong>2<em>34</em>5</strong>6</p>
         * var content = editor.getContent(); //返回值:<p>1<strong>2<em>34</em>5</strong>6</p>
         * ```
         */

    /**
         * 獲取編輯器的內容。 可以通過參數定義編輯器內置的判空規則
         * @method getContent
         * @param { Function } fn 自定的判空規則， 要求該方法返回一個boolean類型的值，
         *                      代表當前編輯器的內容是否空，
         *                      如果返回true， 則該方法將直接返回空字符串；如果返回false，則編輯器將返回
         *                      經過內置過濾規則處理後的內容。
         * @remind 該方法在處理包含有初始化內容的時候能起到很好的作用。
         * @warning 該方法獲取到的是經過編輯器內置的過濾規則進行過濾後得到的內容
         * @return { String } 編輯器的內容字符串
         * @example
         * ```javascript
         * // editor 是一個編輯器的實例
         * var content = editor.getContent( function ( editor ) {
         *      return editor.body.innerHTML === '歡迎使用UEditor'; //返回空字符串
         * } );
         * ```
         */
    getContent: function(cmd, fn, notSetCursor, ignoreBlank, formatter) {
      var me = this;
      if (cmd && utils.isFunction(cmd)) {
        fn = cmd;
        cmd = "";
      }
      if (fn ? !fn() : !this.hasContents()) {
        return "";
      }
      me.fireEvent("beforegetcontent");
      var root = UE.htmlparser(me.body.innerHTML, ignoreBlank);
      me.filterOutputRule(root);
      me.fireEvent("aftergetcontent", cmd, root);
      return root.toHtml(formatter);
    },

    /**
         * 取得完整的html代碼，可以直接顯示成完整的html文檔
         * @method getAllHtml
         * @return { String } 編輯器的內容html文檔字符串
         * @eaxmple
         * ```javascript
         * editor.getAllHtml(); //返回格式大致是: <html><head>...</head><body>...</body></html>
         * ```
         */
    getAllHtml: function() {
      var me = this,
        headHtml = [],
        html = "";
      me.fireEvent("getAllHtml", headHtml);
      if (browser.ie && browser.version > 8) {
        var headHtmlForIE9 = "";
        utils.each(me.document.styleSheets, function(si) {
          headHtmlForIE9 += si.href
            ? '<link rel="stylesheet" type="text/css" href="' + si.href + '" />'
            : "<style>" + si.cssText + "</style>";
        });
        utils.each(me.document.getElementsByTagName("script"), function(si) {
          headHtmlForIE9 += si.outerHTML;
        });
      }
      return (
        "<html><head>" +
        (me.options.charset
          ? '<meta http-equiv="Content-Type" content="text/html; charset=' +
              me.options.charset +
              '"/>'
          : "") +
        (headHtmlForIE9 ||
          me.document.getElementsByTagName("head")[0].innerHTML) +
        headHtml.join("\n") +
        "</head>" +
        "<body " +
        (ie && browser.version < 9 ? 'class="view"' : "") +
        ">" +
        me.getContent(null, null, true) +
        "</body></html>"
      );
    },

    /**
         * 得到編輯器的純文本內容，但會保留段落格式
         * @method getPlainTxt
         * @return { String } 編輯器帶段落格式的純文本內容字符串
         * @example
         * ```javascript
         * //編輯器html內容:<p><strong>1</strong></p><p><strong>2</strong></p>
         * console.log(editor.getPlainTxt()); //輸出:"1\n2\n
         * ```
         */
    getPlainTxt: function() {
      var reg = new RegExp(domUtils.fillChar, "g"),
        html = this.body.innerHTML.replace(/[\n\r]/g, ""); //ie要先去了\n在處理
      html = html
        .replace(/<(p|div)[^>]*>(<br\/?>|&nbsp;)<\/\1>/gi, "\n")
        .replace(/<br\/?>/gi, "\n")
        .replace(/<[^>/]+>/g, "")
        .replace(/(\n)?<\/([^>]+)>/g, function(a, b, c) {
          return dtd.$block[c] ? "\n" : b ? b : "";
        });
      //取出來的空格會有c2a0會變成亂碼，處理這種情況\u00a0
      return html
        .replace(reg, "")
        .replace(/\u00a0/g, " ")
        .replace(/&nbsp;/g, " ");
    },

    /**
         * 獲取編輯器中的純文本內容,沒有段落格式
         * @method getContentTxt
         * @return { String } 編輯器不帶段落格式的純文本內容字符串
         * @example
         * ```javascript
         * //編輯器html內容:<p><strong>1</strong></p><p><strong>2</strong></p>
         * console.log(editor.getPlainTxt()); //輸出:"12
         * ```
         */
    getContentTxt: function() {
      var reg = new RegExp(domUtils.fillChar, "g");
      //取出來的空格會有c2a0會變成亂碼，處理這種情況\u00a0
      return this.body[browser.ie ? "innerText" : "textContent"]
        .replace(reg, "")
        .replace(/\u00a0/g, " ");
    },

    /**
         * 設置編輯器的內容，可修改編輯器當前的html內容
         * @method setContent
         * @warning 通過該方法插入的內容，是經過編輯器內置的過濾規則進行過濾後得到的內容
         * @warning 該方法會觸發selectionchange事件
         * @param { String } html 要插入的html內容
         * @example
         * ```javascript
         * editor.getContent('<p>test</p>');
         * ```
         */

    /**
         * 設置編輯器的內容，可修改編輯器當前的html內容
         * @method setContent
         * @warning 通過該方法插入的內容，是經過編輯器內置的過濾規則進行過濾後得到的內容
         * @warning 該方法會觸發selectionchange事件
         * @param { String } html 要插入的html內容
         * @param { Boolean } isAppendTo 若傳入true，不清空原來的內容，在最後插入內容，否則，清空內容再插入
         * @example
         * ```javascript
         * //假設設置前的編輯器內容是 <p>old text</p>
         * editor.setContent('<p>new text</p>', true); //插入的結果是<p>old text</p><p>new text</p>
         * ```
         */
    setContent: function(html, isAppendTo, notFireSelectionchange) {
      var me = this;

      me.fireEvent("beforesetcontent", html);
      var root = UE.htmlparser(html);
      me.filterInputRule(root);
      html = root.toHtml();

      me.body.innerHTML = (isAppendTo ? me.body.innerHTML : "") + html;

      function isCdataDiv(node) {
        return node.tagName == "DIV" && node.getAttribute("cdata_tag");
      }
      //給文本或者inline節點套p標籤
      if (me.options.enterTag == "p") {
        var child = this.body.firstChild,
          tmpNode;
        if (
          !child ||
          (child.nodeType == 1 &&
            (dtd.$cdata[child.tagName] ||
              isCdataDiv(child) ||
              domUtils.isCustomeNode(child)) &&
            child === this.body.lastChild)
        ) {
          this.body.innerHTML =
            "<p>" +
            (browser.ie ? "&nbsp;" : "<br/>") +
            "</p>" +
            this.body.innerHTML;
        } else {
          var p = me.document.createElement("p");
          while (child) {
            while (
              child &&
              (child.nodeType == 3 ||
                (child.nodeType == 1 &&
                  dtd.p[child.tagName] &&
                  !dtd.$cdata[child.tagName]))
            ) {
              tmpNode = child.nextSibling;
              p.appendChild(child);
              child = tmpNode;
            }
            if (p.firstChild) {
              if (!child) {
                me.body.appendChild(p);
                break;
              } else {
                child.parentNode.insertBefore(p, child);
                p = me.document.createElement("p");
              }
            }
            child = child.nextSibling;
          }
        }
      }
      me.fireEvent("aftersetcontent");
      me.fireEvent("contentchange");

      !notFireSelectionchange && me._selectionChange();
      //清除保存的選區
      me._bakRange = me._bakIERange = me._bakNativeRange = null;
      //trace:1742 setContent後gecko能得到焦點問題
      var geckoSel;
      if (browser.gecko && (geckoSel = this.selection.getNative())) {
        geckoSel.removeAllRanges();
      }
      if (me.options.autoSyncData) {
        me.form && setValue(me.form, me);
      }
    },

    /**
         * 讓編輯器獲得焦點，默認focus到編輯器頭部
         * @method focus
         * @example
         * ```javascript
         * editor.focus()
         * ```
         */

    /**
         * 讓編輯器獲得焦點，toEnd確定focus位置
         * @method focus
         * @param { Boolean } toEnd 默認focus到編輯器頭部，toEnd為true時focus到內容尾部
         * @example
         * ```javascript
         * editor.focus(true)
         * ```
         */
    focus: function(toEnd) {
      try {
        var me = this,
          rng = me.selection.getRange();
        if (toEnd) {
          var node = me.body.lastChild;
          if (node && node.nodeType == 1 && !dtd.$empty[node.tagName]) {
            if (domUtils.isEmptyBlock(node)) {
              rng.setStartAtFirst(node);
            } else {
              rng.setStartAtLast(node);
            }
            rng.collapse(true);
          }
          rng.setCursor(true);
        } else {
          if (
            !rng.collapsed &&
            domUtils.isBody(rng.startContainer) &&
            rng.startOffset == 0
          ) {
            var node = me.body.firstChild;
            if (node && node.nodeType == 1 && !dtd.$empty[node.tagName]) {
              rng.setStartAtFirst(node).collapse(true);
            }
          }

          rng.select(true);
        }
        this.fireEvent("focus selectionchange");
      } catch (e) {}
    },
    isFocus: function() {
      return this.selection.isFocus();
    },
    blur: function() {
      var sel = this.selection.getNative();
      if (sel.empty && browser.ie) {
        var nativeRng = document.body.createTextRange();
        nativeRng.moveToElementText(document.body);
        nativeRng.collapse(true);
        nativeRng.select();
        sel.empty();
      } else {
        sel.removeAllRanges();
      }

      //this.fireEvent('blur selectionchange');
    },
    /**
         * 初始化UE事件及部分事件代理
         * @method _initEvents
         * @private
         */
    _initEvents: function() {
      var me = this,
        doc = me.document,
        win = me.window;
      me._proxyDomEvent = utils.bind(me._proxyDomEvent, me);
      domUtils.on(
        doc,
        [
          "click",
          "contextmenu",
          "mousedown",
          "keydown",
          "keyup",
          "keypress",
          "mouseup",
          "mouseover",
          "mouseout",
          "selectstart"
        ],
        me._proxyDomEvent
      );
      domUtils.on(win, ["focus", "blur"], me._proxyDomEvent);
      domUtils.on(me.body, "drop", function(e) {
        //阻止ff下默認的彈出新頁面打開圖片
        if (browser.gecko && e.stopPropagation) {
          e.stopPropagation();
        }
        me.fireEvent("contentchange");
      });
      domUtils.on(doc, ["mouseup", "keydown"], function(evt) {
        //特殊鍵不觸發selectionchange
        if (
          evt.type == "keydown" &&
          (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)
        ) {
          return;
        }
        if (evt.button == 2) return;
        me._selectionChange(250, evt);
      });
    },
    /**
         * 觸發事件代理
         * @method _proxyDomEvent
         * @private
         * @return { * } fireEvent的返回值
         * @see UE.EventBase:fireEvent(String)
         */
    _proxyDomEvent: function(evt) {
      if (
        this.fireEvent("before" + evt.type.replace(/^on/, "").toLowerCase()) ===
        false
      ) {
        return false;
      }
      if (this.fireEvent(evt.type.replace(/^on/, ""), evt) === false) {
        return false;
      }
      return this.fireEvent(
        "after" + evt.type.replace(/^on/, "").toLowerCase()
      );
    },
    /**
         * 變化選區
         * @method _selectionChange
         * @private
         */
    _selectionChange: function(delay, evt) {
      var me = this;
      //有光標才做selectionchange 為了解決未focus時點擊source不能觸發更改工具欄狀態的問題（source命令notNeedUndo=1）
      //            if ( !me.selection.isFocus() ){
      //                return;
      //            }

      var hackForMouseUp = false;
      var mouseX, mouseY;
      if (browser.ie && browser.version < 9 && evt && evt.type == "mouseup") {
        var range = this.selection.getRange();
        if (!range.collapsed) {
          hackForMouseUp = true;
          mouseX = evt.clientX;
          mouseY = evt.clientY;
        }
      }
      clearTimeout(_selectionChangeTimer);
      _selectionChangeTimer = setTimeout(function() {
        if (!me.selection || !me.selection.getNative()) {
          return;
        }
        //修覆一個IE下的bug: 鼠標點擊一段已選擇的文本中間時，可能在mouseup後的一段時間內取到的range是在selection的type為None下的錯誤值.
        //IE下如果用戶是拖拽一段已選擇文本，則不會觸發mouseup事件，所以這裡的特殊處理不會對其有影響
        var ieRange;
        if (hackForMouseUp && me.selection.getNative().type == "None") {
          ieRange = me.document.body.createTextRange();
          try {
            ieRange.moveToPoint(mouseX, mouseY);
          } catch (ex) {
            ieRange = null;
          }
        }
        var bakGetIERange;
        if (ieRange) {
          bakGetIERange = me.selection.getIERange;
          me.selection.getIERange = function() {
            return ieRange;
          };
        }
        me.selection.cache();
        if (bakGetIERange) {
          me.selection.getIERange = bakGetIERange;
        }
        if (me.selection._cachedRange && me.selection._cachedStartElement) {
          me.fireEvent("beforeselectionchange");
          // 第二個參數causeByUi為true代表由用戶交互造成的selectionchange.
          me.fireEvent("selectionchange", !!evt);
          me.fireEvent("afterselectionchange");
          me.selection.clear();
        }
      }, delay || 50);
    },

    /**
         * 執行編輯命令
         * @method _callCmdFn
         * @private
         * @param { String } fnName 函數名稱
         * @param { * } args 傳給命令函數的參數
         * @return { * } 返回命令函數運行的返回值
         */
    _callCmdFn: function(fnName, args) {
      var cmdName = args[0].toLowerCase(),
        cmd,
        cmdFn;
      cmd = this.commands[cmdName] || UE.commands[cmdName];
      cmdFn = cmd && cmd[fnName];
      //沒有querycommandstate或者沒有command的都默認返回0
      if ((!cmd || !cmdFn) && fnName == "queryCommandState") {
        return 0;
      } else if (cmdFn) {
        return cmdFn.apply(this, args);
      }
    },

    /**
         * 執行編輯命令cmdName，完成富文本編輯效果
         * @method execCommand
         * @param { String } cmdName 需要執行的命令
         * @remind 具體命令的使用請參考<a href="#COMMAND.LIST">命令列表</a>
         * @return { * } 返回命令函數運行的返回值
         * @example
         * ```javascript
         * editor.execCommand(cmdName);
         * ```
         */
    execCommand: function(cmdName) {
      cmdName = cmdName.toLowerCase();
      var me = this,
        result,
        cmd = me.commands[cmdName] || UE.commands[cmdName];
      if (!cmd || !cmd.execCommand) {
        return null;
      }
      if (!cmd.notNeedUndo && !me.__hasEnterExecCommand) {
        me.__hasEnterExecCommand = true;
        if (me.queryCommandState.apply(me, arguments) != -1) {
          me.fireEvent("saveScene");
          me.fireEvent.apply(
            me,
            ["beforeexeccommand", cmdName].concat(arguments)
          );
          result = this._callCmdFn("execCommand", arguments);
          //保存場景時，做了內容對比，再看是否進行contentchange觸發，這裡多觸發了一次，去掉
          //                    (!cmd.ignoreContentChange && !me._ignoreContentChange) && me.fireEvent('contentchange');
          me.fireEvent.apply(
            me,
            ["afterexeccommand", cmdName].concat(arguments)
          );
          me.fireEvent("saveScene");
        }
        me.__hasEnterExecCommand = false;
      } else {
        result = this._callCmdFn("execCommand", arguments);
        !me.__hasEnterExecCommand &&
          !cmd.ignoreContentChange &&
          !me._ignoreContentChange &&
          me.fireEvent("contentchange");
      }
      !me.__hasEnterExecCommand &&
        !cmd.ignoreContentChange &&
        !me._ignoreContentChange &&
        me._selectionChange();
      return result;
    },

    /**
         * 根據傳入的command命令，查選編輯器當前的選區，返回命令的狀態
         * @method  queryCommandState
         * @param { String } cmdName 需要查詢的命令名稱
         * @remind 具體命令的使用請參考<a href="#COMMAND.LIST">命令列表</a>
         * @return { Number } number 返回放前命令的狀態，返回值三種情況：(-1|0|1)
         * @example
         * ```javascript
         * editor.queryCommandState(cmdName)  => (-1|0|1)
         * ```
         * @see COMMAND.LIST
         */
    queryCommandState: function(cmdName) {
      return this._callCmdFn("queryCommandState", arguments);
    },

    /**
         * 根據傳入的command命令，查選編輯器當前的選區，根據命令返回相關的值
         * @method queryCommandValue
         * @param { String } cmdName 需要查詢的命令名稱
         * @remind 具體命令的使用請參考<a href="#COMMAND.LIST">命令列表</a>
         * @remind 只有部分插件有此方法
         * @return { * } 返回每個命令特定的當前狀態值
         * @grammar editor.queryCommandValue(cmdName)  =>  {*}
         * @see COMMAND.LIST
         */
    queryCommandValue: function(cmdName) {
      return this._callCmdFn("queryCommandValue", arguments);
    },

    /**
         * 檢查編輯區域中是否有內容
         * @method  hasContents
         * @remind 默認有文本內容，或者有以下節點都不認為是空
         * table,ul,ol,dl,iframe,area,base,col,hr,img,embed,input,link,meta,param
         * @return { Boolean } 檢查有內容返回true，否則返回false
         * @example
         * ```javascript
         * editor.hasContents()
         * ```
         */

    /**
         * 檢查編輯區域中是否有內容，若包含參數tags中的節點類型，直接返回true
         * @method  hasContents
         * @param { Array } tags 傳入數組判斷時用到的節點類型
         * @return { Boolean } 若文檔中包含tags數組里對應的tag，返回true，否則返回false
         * @example
         * ```javascript
         * editor.hasContents(['span']);
         * ```
         */
    hasContents: function(tags) {
      if (tags) {
        for (var i = 0, ci; (ci = tags[i++]); ) {
          if (this.document.getElementsByTagName(ci).length > 0) {
            return true;
          }
        }
      }
      if (!domUtils.isEmptyBlock(this.body)) {
        return true;
      }
      //隨時添加,定義的特殊標籤如果存在，不能認為是空
      tags = ["div"];
      for (i = 0; (ci = tags[i++]); ) {
        var nodes = domUtils.getElementsByTagName(this.document, ci);
        for (var n = 0, cn; (cn = nodes[n++]); ) {
          if (domUtils.isCustomeNode(cn)) {
            return true;
          }
        }
      }
      return false;
    },

    /**
         * 重置編輯器，可用來做多個tab使用同一個編輯器實例
         * @method  reset
         * @remind 此方法會清空編輯器內容，清空回退列表，會觸發reset事件
         * @example
         * ```javascript
         * editor.reset()
         * ```
         */
    reset: function() {
      this.fireEvent("reset");
    },

    /**
         * 設置當前編輯區域可以編輯
         * @method setEnabled
         * @example
         * ```javascript
         * editor.setEnabled()
         * ```
         */
    setEnabled: function() {
      var me = this,
        range;
      if (me.body.contentEditable == "false") {
        me.body.contentEditable = true;
        range = me.selection.getRange();
        //有可能內容丟失了
        try {
          range.moveToBookmark(me.lastBk);
          delete me.lastBk;
        } catch (e) {
          range.setStartAtFirst(me.body).collapse(true);
        }
        range.select(true);
        if (me.bkqueryCommandState) {
          me.queryCommandState = me.bkqueryCommandState;
          delete me.bkqueryCommandState;
        }
        if (me.bkqueryCommandValue) {
          me.queryCommandValue = me.bkqueryCommandValue;
          delete me.bkqueryCommandValue;
        }
        me.fireEvent("selectionchange");
      }
    },
    enable: function() {
      return this.setEnabled();
    },

    /** 設置當前編輯區域不可編輯
         * @method setDisabled
         */

    /** 設置當前編輯區域不可編輯,except中的命令除外
         * @method setDisabled
         * @param { String } except 例外命令的字符串
         * @remind 即使設置了disable，此處配置的例外命令仍然可以執行
         * @example
         * ```javascript
         * editor.setDisabled('bold'); //禁用工具欄中除加粗之外的所有功能
         * ```
         */

    /** 設置當前編輯區域不可編輯,except中的命令除外
         * @method setDisabled
         * @param { Array } except 例外命令的字符串數組，數組中的命令仍然可以執行
         * @remind 即使設置了disable，此處配置的例外命令仍然可以執行
         * @example
         * ```javascript
         * editor.setDisabled(['bold','insertimage']); //禁用工具欄中除加粗和插入圖片之外的所有功能
         * ```
         */
    setDisabled: function(except) {
      var me = this;
      except = except ? (utils.isArray(except) ? except : [except]) : [];
      if (me.body.contentEditable == "true") {
        if (!me.lastBk) {
          me.lastBk = me.selection.getRange().createBookmark(true);
        }
        me.body.contentEditable = false;
        me.bkqueryCommandState = me.queryCommandState;
        me.bkqueryCommandValue = me.queryCommandValue;
        me.queryCommandState = function(type) {
          if (utils.indexOf(except, type) != -1) {
            return me.bkqueryCommandState.apply(me, arguments);
          }
          return -1;
        };
        me.queryCommandValue = function(type) {
          if (utils.indexOf(except, type) != -1) {
            return me.bkqueryCommandValue.apply(me, arguments);
          }
          return null;
        };
        me.fireEvent("selectionchange");
      }
    },
    disable: function(except) {
      return this.setDisabled(except);
    },

    /**
         * 設置默認內容
         * @method _setDefaultContent
         * @private
         * @param  { String } cont 要存入的內容
         */
    _setDefaultContent: (function() {
      function clear() {
        var me = this;
        if (me.document.getElementById("initContent")) {
          me.body.innerHTML = "<p>" + (ie ? "" : "<br/>") + "</p>";
          me.removeListener("firstBeforeExecCommand focus", clear);
          setTimeout(function() {
            me.focus();
            me._selectionChange();
          }, 0);
        }
      }

      return function(cont) {
        var me = this;
        me.body.innerHTML = '<p id="initContent">' + cont + "</p>";

        me.addListener("firstBeforeExecCommand focus", clear);
      };
    })(),

    /**
         * 顯示編輯器
         * @method setShow
         * @example
         * ```javascript
         * editor.setShow()
         * ```
         */
    setShow: function() {
      var me = this,
        range = me.selection.getRange();
      if (me.container.style.display == "none") {
        //有可能內容丟失了
        try {
          range.moveToBookmark(me.lastBk);
          delete me.lastBk;
        } catch (e) {
          range.setStartAtFirst(me.body).collapse(true);
        }
        //ie下focus實效，所以做了個延遲
        setTimeout(function() {
          range.select(true);
        }, 100);
        me.container.style.display = "";
      }
    },
    show: function() {
      return this.setShow();
    },
    /**
         * 隱藏編輯器
         * @method setHide
         * @example
         * ```javascript
         * editor.setHide()
         * ```
         */
    setHide: function() {
      var me = this;
      if (!me.lastBk) {
        me.lastBk = me.selection.getRange().createBookmark(true);
      }
      me.container.style.display = "none";
    },
    hide: function() {
      return this.setHide();
    },

    /**
         * 根據指定的路徑，獲取對應的語言資源
         * @method getLang
         * @param { String } path 路徑根據的是lang目錄下的語言文件的路徑結構
         * @return { Object | String } 根據路徑返回語言資源的Json格式對象或者語言字符串
         * @example
         * ```javascript
         * editor.getLang('contextMenu.delete'); //如果當前是中文，那返回是的是'刪除'
         * ```
         */
    getLang: function(path) {
      var lang = UE.I18N[this.options.lang];
      if (!lang) {
        throw Error("not import language file");
      }
      path = (path || "").split(".");
      for (var i = 0, ci; (ci = path[i++]); ) {
        lang = lang[ci];
        if (!lang) break;
      }
      return lang;
    },

    /**
         * 計算編輯器html內容字符串的長度
         * @method  getContentLength
         * @return { Number } 返回計算的長度
         * @example
         * ```javascript
         * //編輯器html內容<p><strong>132</strong></p>
         * editor.getContentLength() //返回27
         * ```
         */
    /**
         * 計算編輯器當前純文本內容的長度
         * @method  getContentLength
         * @param { Boolean } ingoneHtml 傳入true時，只按照純文本來計算
         * @return { Number } 返回計算的長度，內容中有hr/img/iframe標籤，長度加1
         * @example
         * ```javascript
         * //編輯器html內容<p><strong>132</strong></p>
         * editor.getContentLength() //返回3
         * ```
         */
    getContentLength: function(ingoneHtml, tagNames) {
      var count = this.getContent(false, false, true).length;
      if (ingoneHtml) {
        tagNames = (tagNames || []).concat(["hr", "img", "iframe"]);
        count = this.getContentTxt().replace(/[\t\r\n]+/g, "").length;
        for (var i = 0, ci; (ci = tagNames[i++]); ) {
          count += this.document.getElementsByTagName(ci).length;
        }
      }
      return count;
    },

    /**
         * 註冊輸入過濾規則
         * @method  addInputRule
         * @param { Function } rule 要添加的過濾規則
         * @example
         * ```javascript
         * editor.addInputRule(function(root){
         *   $.each(root.getNodesByTagName('div'),function(i,node){
         *       node.tagName="p";
         *   });
         * });
         * ```
         */
    addInputRule: function(rule) {
      this.inputRules.push(rule);
    },

    /**
         * 執行註冊的過濾規則
         * @method  filterInputRule
         * @param { UE.uNode } root 要過濾的uNode節點
         * @remind 執行editor.setContent方法和執行'inserthtml'命令後，會運行該過濾函數
         * @example
         * ```javascript
         * editor.filterInputRule(editor.body);
         * ```
         * @see UE.Editor:addInputRule
         */
    filterInputRule: function(root) {
      for (var i = 0, ci; (ci = this.inputRules[i++]); ) {
        ci.call(this, root);
      }
    },

    /**
         * 註冊輸出過濾規則
         * @method  addOutputRule
         * @param { Function } rule 要添加的過濾規則
         * @example
         * ```javascript
         * editor.addOutputRule(function(root){
         *   $.each(root.getNodesByTagName('p'),function(i,node){
         *       node.tagName="div";
         *   });
         * });
         * ```
         */
    addOutputRule: function(rule) {
      this.outputRules.push(rule);
    },

    /**
         * 根據輸出過濾規則，過濾編輯器內容
         * @method  filterOutputRule
         * @remind 執行editor.getContent方法的時候，會先運行該過濾函數
         * @param { UE.uNode } root 要過濾的uNode節點
         * @example
         * ```javascript
         * editor.filterOutputRule(editor.body);
         * ```
         * @see UE.Editor:addOutputRule
         */
    filterOutputRule: function(root) {
      for (var i = 0, ci; (ci = this.outputRules[i++]); ) {
        ci.call(this, root);
      }
    },

    /**
         * 根據action名稱獲取請求的路徑
         * @method  getActionUrl
         * @remind 假如沒有設置serverUrl,會根據imageUrl設置默認的controller路徑
         * @param { String } action action名稱
         * @example
         * ```javascript
         * editor.getActionUrl('config'); //返回 "/ueditor/php/controller.php?action=config"
         * editor.getActionUrl('image'); //返回 "/ueditor/php/controller.php?action=uplaodimage"
         * editor.getActionUrl('scrawl'); //返回 "/ueditor/php/controller.php?action=uplaodscrawl"
         * editor.getActionUrl('imageManager'); //返回 "/ueditor/php/controller.php?action=listimage"
         * ```
         */
    getActionUrl: function(action) {
      var actionName = this.getOpt(action) || action,
        imageUrl = this.getOpt("imageUrl"),
        serverUrl = this.getOpt("serverUrl");

      if (!serverUrl && imageUrl) {
        serverUrl = imageUrl.replace(/^(.*[\/]).+([\.].+)$/, "$1controller$2");
      }

      if (serverUrl) {
        serverUrl =
          serverUrl +
          (serverUrl.indexOf("?") == -1 ? "?" : "&") +
          "action=" +
          (actionName || "");
        return utils.formatUrl(serverUrl);
      } else {
        return "";
      }
    }
  };
  utils.inherits(Editor, EventBase);
})();
