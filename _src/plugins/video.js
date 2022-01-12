/**
 * video插件， 為UEditor提供視頻插入支持
 * @file
 * @since 1.2.6.1
 */

UE.plugins["video"] = function() {
  var me = this;

  /**
     * 創建插入視頻字符竄
     * @param url 視頻地址
     * @param width 視頻寬度
     * @param height 視頻高度
     * @param align 視頻對齊
     * @param toEmbed 是否以flash代替顯示
     * @param addParagraph  是否需要添加P 標籤
     */
  function creatInsertStr(url, width, height, id, align, classname, type) {
    var str;
    switch (type) {
      case "image":
        str =
          "<img " +
          (id ? 'id="' + id + '"' : "") +
          ' width="' +
          width +
          '" height="' +
          height +
          '" _url="' +
          url +
          '" class="' +
          classname.replace(/\bvideo-js\b/, "") +
          '"' +
          ' src="' +
          me.options.UEDITOR_HOME_URL +
          'themes/default/images/spacer.gif" style="background:url(' +
          me.options.UEDITOR_HOME_URL +
          "themes/default/images/videologo.gif) no-repeat center center; border:1px solid gray;" +
          (align ? "float:" + align + ";" : "") +
          '" />';
        break;
      case "embed":
        str =
          '<embed type="application/x-shockwave-flash" class="' +
          classname +
          '" pluginspage="http://www.macromedia.com/go/getflashplayer"' +
          ' src="' +
          utils.html(url) +
          '" width="' +
          width +
          '" height="' +
          height +
          '"' +
          (align ? ' style="float:' + align + '"' : "") +
          ' wmode="transparent" play="true" loop="false" menu="false" allowscriptaccess="never" allowfullscreen="true" >';
        break;
      case "video":
        var ext = url.substr(url.lastIndexOf(".") + 1);
        if (ext == "ogv") ext = "ogg";
        str =
          "<video" +
          (id ? ' id="' + id + '"' : "") +
          ' class="' +
          classname +
          ' video-js" ' +
          (align ? ' style="float:' + align + '"' : "") +
          ' controls preload="none" width="' +
          width +
          '" height="' +
          height +
          '" src="' +
          url +
          '" data-setup="{}">' +
          '<source src="' +
          url +
          '" type="video/' +
          ext +
          '" /></video>';
        break;
    }
    return str;
  }

  function switchImgAndVideo(root, img2video) {
    utils.each(
      root.getNodesByTagName(img2video ? "img" : "embed video"),
      function(node) {
        var className = node.getAttr("class");
        if (className && className.indexOf("edui-faked-video") != -1) {
          var html = creatInsertStr(
            img2video ? node.getAttr("_url") : node.getAttr("src"),
            node.getAttr("width"),
            node.getAttr("height"),
            null,
            node.getStyle("float") || "",
            className,
            img2video ? "embed" : "image"
          );
          node.parentNode.replaceChild(UE.uNode.createElement(html), node);
        }
        if (className && className.indexOf("edui-upload-video") != -1) {
          var html = creatInsertStr(
            img2video ? node.getAttr("_url") : node.getAttr("src"),
            node.getAttr("width"),
            node.getAttr("height"),
            null,
            node.getStyle("float") || "",
            className,
            img2video ? "video" : "image"
          );
          node.parentNode.replaceChild(UE.uNode.createElement(html), node);
        }
      }
    );
  }

  me.addOutputRule(function(root) {
    switchImgAndVideo(root, true);
  });
  me.addInputRule(function(root) {
    switchImgAndVideo(root);
  });

  /**
     * 插入視頻
     * @command insertvideo
     * @method execCommand
     * @param { String } cmd 命令字符串
     * @param { Object } videoAttr 鍵值對對象， 描述一個視頻的所有屬性
     * @example
     * ```javascript
     *
     * var videoAttr = {
     *      //視頻地址
     *      url: 'http://www.youku.com/xxx',
     *      //視頻寬高值， 單位px
     *      width: 200,
     *      height: 100
     * };
     *
     * //editor 是編輯器實例
     * //向編輯器插入單個視頻
     * editor.execCommand( 'insertvideo', videoAttr );
     * ```
     */

  /**
     * 插入視頻
     * @command insertvideo
     * @method execCommand
     * @param { String } cmd 命令字符串
     * @param { Array } videoArr 需要插入的視頻的數組， 其中的每一個元素都是一個鍵值對對象， 描述了一個視頻的所有屬性
     * @example
     * ```javascript
     *
     * var videoAttr1 = {
     *      //視頻地址
     *      url: 'http://www.youku.com/xxx',
     *      //視頻寬高值， 單位px
     *      width: 200,
     *      height: 100
     * },
     * videoAttr2 = {
     *      //視頻地址
     *      url: 'http://www.youku.com/xxx',
     *      //視頻寬高值， 單位px
     *      width: 200,
     *      height: 100
     * }
     *
     * //editor 是編輯器實例
     * //該方法將會向編輯器內插入兩個視頻
     * editor.execCommand( 'insertvideo', [ videoAttr1, videoAttr2 ] );
     * ```
     */

  /**
     * 查詢當前光標所在處是否是一個視頻
     * @command insertvideo
     * @method queryCommandState
     * @param { String } cmd 需要查詢的命令字符串
     * @return { int } 如果當前光標所在處的元素是一個視頻對象， 則返回1，否則返回0
     * @example
     * ```javascript
     *
     * //editor 是編輯器實例
     * editor.queryCommandState( 'insertvideo' );
     * ```
     */
  me.commands["insertvideo"] = {
    execCommand: function(cmd, videoObjs, type) {
      videoObjs = utils.isArray(videoObjs) ? videoObjs : [videoObjs];

      if (me.fireEvent("beforeinsertvideo", videoObjs) === true) {
        return;
      }

      var html = [],
        id = "tmpVedio",
        cl;
      for (var i = 0, vi, len = videoObjs.length; i < len; i++) {
        vi = videoObjs[i];
        cl = type == "upload"
          ? "edui-upload-video video-js vjs-default-skin"
          : "edui-faked-video";
        html.push(
          creatInsertStr(
            vi.url,
            vi.width || 420,
            vi.height || 280,
            id + i,
            null,
            cl,
            "image"
          )
        );
      }
      me.execCommand("inserthtml", html.join(""), true);
      var rng = this.selection.getRange();
      for (var i = 0, len = videoObjs.length; i < len; i++) {
        var img = this.document.getElementById("tmpVedio" + i);
        domUtils.removeAttributes(img, "id");
        rng.selectNode(img).select();
        me.execCommand("imagefloat", videoObjs[i].align);
      }

      me.fireEvent("afterinsertvideo", videoObjs);
    },
    queryCommandState: function() {
      var img = me.selection.getRange().getClosedNode(),
        flag =
          img &&
          (img.className == "edui-faked-video" ||
            img.className.indexOf("edui-upload-video") != -1);
      return flag ? 1 : 0;
    }
  };
};
