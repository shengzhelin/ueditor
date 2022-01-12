///import core
///commands 遠程圖片抓取
///commandsName  catchRemoteImage,catchremoteimageenable
///commandsTitle  遠程圖片抓取
/**
 * 遠程圖片抓取,當開啟本插件時所有不符合本地域名的圖片都將被抓取成為本地服務器上的圖片
 */
UE.plugins["catchremoteimage"] = function() {
  var me = this,
    ajax = UE.ajax;

  /* 設置默認值 */
  if (me.options.catchRemoteImageEnable === false) return;
  me.setOpt({
    catchRemoteImageEnable: false
  });

  me.addListener("afterpaste", function() {
    me.fireEvent("catchRemoteImage");
  });

  me.addListener("catchRemoteImage", function() {
    var catcherLocalDomain = me.getOpt("catcherLocalDomain"),
      catcherActionUrl = me.getActionUrl(me.getOpt("catcherActionName")),
      catcherUrlPrefix = me.getOpt("catcherUrlPrefix"),
      catcherFieldName = me.getOpt("catcherFieldName");

    var remoteImages = [],
      loadingIMG =  me.options.themePath + me.options.theme + '/images/spacer.gif',
      imgs = me.document.querySelectorAll('[style*="url"],img'),
      test = function(src, urls) {
        if (src.indexOf(location.host) != -1 || /(^\.)|(^\/)/.test(src)) {
          return true;
        }
        if (urls) {
          for (var j = 0, url; (url = urls[j++]); ) {
            if (src.indexOf(url) !== -1) {
              return true;
            }
          }
        }
        return false;
      };

    for (var i = 0, ci; (ci = imgs[i++]); ) {
      if (ci.getAttribute("word_img")) {
        continue;
      }
      if(ci.nodeName == "IMG"){
        var src = ci.getAttribute("_src") || ci.src || "";
        if (/^(https?|ftp):/i.test(src) && !test(src, catcherLocalDomain)) {
          remoteImages.push(src);
          // 添加上傳時的uploading動畫
          domUtils.setAttributes(ci, {
            class: "loadingclass",
            _src: src,
            src: loadingIMG
          })
        }
      } else {
        // 獲取背景圖片url
        var backgroundImageurl = ci.style.cssText.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
        if (/^(https?|ftp):/i.test(backgroundImageurl) && !test(backgroundImageurl, catcherLocalDomain)) {
          remoteImages.push(backgroundImageurl);
          ci.style.cssText = ci.style.cssText.replace(backgroundImageurl, loadingIMG);
          domUtils.setAttributes(ci, {
            "data-background": backgroundImageurl
          })
        }
      }
    }

    if (remoteImages.length) {
      catchremoteimage(remoteImages, {
        //成功抓取
        success: function(r) {
          try {
            var info = r.state !== undefined
              ? r
              : eval("(" + r.responseText + ")");
          } catch (e) {
            return;
          }

          /* 獲取源路徑和新路徑 */
          var i,
            j,
            ci,
            cj,
            oldSrc,
            newSrc,
            list = info.list;

          /* 抓取失敗統計 */
          var catchFailList = [];
          /* 抓取成功統計 */
          var catchSuccessList = [];
          /* 抓取失敗時顯示的圖片 */
          var failIMG = me.options.themePath + me.options.theme + '/images/img-cracked.png';

          for (i = 0; ci = imgs[i++];) {
            oldSrc = ci.getAttribute("_src") || ci.src || "";
            oldBgIMG = ci.getAttribute("data-background") || "";
            for (j = 0; cj = list[j++];) {
              if (oldSrc == cj.source && cj.state == "SUCCESS") {
                newSrc = catcherUrlPrefix + cj.url;
                // 上傳成功是刪除uploading動畫
                domUtils.removeClasses( ci, "loadingclass" );
                domUtils.setAttributes(ci, {
                    "src": newSrc,
                    "_src": newSrc,
                    "data-catchResult":"img_catchSuccess"   // 添加catch成功標記
                });
                catchSuccessList.push(ci);
                break;
              } else if (oldSrc == cj.source && cj.state == "FAIL") {
                // 替換成統一的失敗圖片
                domUtils.removeClasses( ci, "loadingclass" );
                domUtils.setAttributes(ci, {
                    "src": failIMG,
                    "_src": failIMG,
                    "data-catchResult":"img_catchFail" // 添加catch失敗標記
                });
                catchFailList.push(ci);
                break;
              } else if (oldBgIMG == cj.source && cj.state == "SUCCESS") {
                newBgIMG = catcherUrlPrefix + cj.url;
                ci.style.cssText = ci.style.cssText.replace(loadingIMG, newBgIMG);
                domUtils.removeAttributes(ci,"data-background");
                domUtils.setAttributes(ci, {
                    "data-catchResult":"img_catchSuccess"   // 添加catch成功標記
                });
                catchSuccessList.push(ci);
                break;
              } else if (oldBgIMG == cj.source && cj.state == "FAIL"){
                ci.style.cssText = ci.style.cssText.replace(loadingIMG, failIMG);
                domUtils.removeAttributes(ci,"data-background");
                domUtils.setAttributes(ci, {
                    "data-catchResult":"img_catchFail"   // 添加catch失敗標記
                });
                catchFailList.push(ci);
                break;
              }
            }

          }
          // 監聽事件添加成功抓取和抓取失敗的dom列表參數
          me.fireEvent('catchremotesuccess',catchSuccessList,catchFailList);
        },
        //回調失敗，本次請求超時
        error: function() {
          me.fireEvent("catchremoteerror");
        }
      });
    }

    function catchremoteimage(imgs, callbacks) {
      var params =
        utils.serializeParam(me.queryCommandValue("serverparam")) || "",
        url = utils.formatUrl(
          catcherActionUrl +
            (catcherActionUrl.indexOf("?") == -1 ? "?" : "&") +
            params
        ),
        isJsonp = utils.isCrossDomainUrl(url),
        opt = {
          method: "POST",
          dataType: isJsonp ? "jsonp" : "",
          timeout: 60000, //單位：毫秒，回調請求超時設置。目標用戶如果網速不是很快的話此處建議設置一個較大的數值
          onsuccess: callbacks["success"],
          onerror: callbacks["error"]
        };
      opt[catcherFieldName] = imgs;
      ajax.request(url, opt);
    }
  });
};
