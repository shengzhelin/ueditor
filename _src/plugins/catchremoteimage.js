///import core
///commands 遠程圖片抓取
///commandsName  catchRemoteImage,catchremoteimageenable
///commandsTitle  遠程圖片抓取
/**
 * 遠程圖片抓取,當開啟本插件時所有不符合本地域名的圖片都將被抓取成為本地服務器上的圖片
 */
UE.plugins['catchremoteimage'] = function () {
    var me = this,
        ajax = UE.ajax;

    /* 設置默認值 */
    if (me.options.catchRemoteImageEnable === false) return;
    me.setOpt({
        catchRemoteImageEnable: false
    });

    me.addListener("afterpaste", function () {
        me.fireEvent("catchRemoteImage");
    });

    me.addListener("catchRemoteImage", function () {

        var catcherLocalDomain = me.getOpt('catcherLocalDomain'),
            catcherActionUrl = me.getActionUrl(me.getOpt('catcherActionName')),
            catcherUrlPrefix = me.getOpt('catcherUrlPrefix'),
            catcherFieldName = me.getOpt('catcherFieldName');

        var remoteImages = [],
            imgs = domUtils.getElementsByTagName(me.document, "img"),
            test = function (src, urls) {
                if (src.indexOf(location.host) != -1 || /(^\.)|(^\/)/.test(src)) {
                    return true;
                }
                if (urls) {
                    for (var j = 0, url; url = urls[j++];) {
                        if (src.indexOf(url) !== -1) {
                            return true;
                        }
                    }
                }
                return false;
            };

        for (var i = 0, ci; ci = imgs[i++];) {
            if (ci.getAttribute("word_img")) {
                continue;
            }
            var src = ci.getAttribute("_src") || ci.src || "";
            if (/^(https?|ftp):/i.test(src) && !test(src, catcherLocalDomain)) {
                remoteImages.push(src);
            }
        }

        if (remoteImages.length) {
            catchremoteimage(remoteImages, {
                //成功抓取
                success: function (r) {
                    try {
                        var info = r.state !== undefined ? r:eval("(" + r.responseText + ")");
                    } catch (e) {
                        return;
                    }

                    /* 獲取源路徑和新路徑 */
                    var i, j, ci, cj, oldSrc, newSrc, list = info.list;

                    for (i = 0; ci = imgs[i++];) {
                        oldSrc = ci.getAttribute("_src") || ci.src || "";
                        for (j = 0; cj = list[j++];) {
                            if (oldSrc == cj.source && cj.state == "SUCCESS") {  //抓取失敗時不做替換處理
                                newSrc = catcherUrlPrefix + cj.url;
                                domUtils.setAttributes(ci, {
                                    "src": newSrc,
                                    "_src": newSrc
                                });
                                break;
                            }
                        }
                    }
                    me.fireEvent('catchremotesuccess')
                },
                //回調失敗，本次請求超時
                error: function () {
                    me.fireEvent("catchremoteerror");
                }
            });
        }

        function catchremoteimage(imgs, callbacks) {
            var params = utils.serializeParam(me.queryCommandValue('serverparam')) || '',
                url = utils.formatUrl(catcherActionUrl + (catcherActionUrl.indexOf('?') == -1 ? '?':'&') + params),
                isJsonp = utils.isCrossDomainUrl(url),
                opt = {
                    'method': 'POST',
                    'dataType': isJsonp ? 'jsonp':'',
                    'timeout': 60000, //單位：毫秒，回調請求超時設置。目標用戶如果網速不是很快的話此處建議設置一個較大的數值
                    'onsuccess': callbacks["success"],
                    'onerror': callbacks["error"]
                };
            opt[catcherFieldName] = imgs;
            ajax.request(url, opt);
        }

    });
};