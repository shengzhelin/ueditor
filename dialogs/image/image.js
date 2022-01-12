/**
 * User: Jinqn
 * Date: 14-04-08
 * Time: 下午16:34
 * 上傳圖片對話框邏輯代碼,包括tab: 遠程圖片/上傳圖片/在線圖片/搜索圖片
 */

(function () {

    var remoteImage,
        uploadImage,
        onlineImage,
        searchImage;

    window.onload = function () {
        initTabs();
        initAlign();
        initButtons();
    };

    /* 初始化tab標籤 */
    function initTabs() {
        var tabs = $G('tabhead').children;
        for (var i = 0; i < tabs.length; i++) {
            domUtils.on(tabs[i], "click", function (e) {
                var target = e.target || e.srcElement;
                setTabFocus(target.getAttribute('data-content-id'));
            });
        }

        var img = editor.selection.getRange().getClosedNode();
        if (img && img.tagName && img.tagName.toLowerCase() == 'img') {
            setTabFocus('remote');
        } else {
            setTabFocus('upload');
        }
    }

    /* 初始化tabbody */
    function setTabFocus(id) {
        if(!id) return;
        var i, bodyId, tabs = $G('tabhead').children;
        for (i = 0; i < tabs.length; i++) {
            bodyId = tabs[i].getAttribute('data-content-id');
            if (bodyId == id) {
                domUtils.addClass(tabs[i], 'focus');
                domUtils.addClass($G(bodyId), 'focus');
            } else {
                domUtils.removeClasses(tabs[i], 'focus');
                domUtils.removeClasses($G(bodyId), 'focus');
            }
        }
        switch (id) {
            case 'remote':
                remoteImage = remoteImage || new RemoteImage();
                break;
            case 'upload':
                setAlign(editor.getOpt('imageInsertAlign'));
                uploadImage = uploadImage || new UploadImage('queueList');
                break;
            case 'online':
                setAlign(editor.getOpt('imageManagerInsertAlign'));
                onlineImage = onlineImage || new OnlineImage('imageList');
                onlineImage.reset();
                break;
            case 'search':
                setAlign(editor.getOpt('imageManagerInsertAlign'));
                searchImage = searchImage || new SearchImage();
                break;
        }
    }

    /* 初始化onok事件 */
    function initButtons() {

        dialog.onok = function () {
            var remote = false, list = [], id, tabs = $G('tabhead').children;
            for (var i = 0; i < tabs.length; i++) {
                if (domUtils.hasClass(tabs[i], 'focus')) {
                    id = tabs[i].getAttribute('data-content-id');
                    break;
                }
            }

            switch (id) {
                case 'remote':
                    list = remoteImage.getInsertList();
                    break;
                case 'upload':
                    list = uploadImage.getInsertList();
                    var count = uploadImage.getQueueCount();
                    if (count) {
                        $('.info', '#queueList').html('<span style="color:red;">' + '還有2個未上傳文件'.replace(/[\d]/, count) + '</span>');
                        return false;
                    }
                    break;
                case 'online':
                    list = onlineImage.getInsertList();
                    break;
                case 'search':
                    list = searchImage.getInsertList();
                    remote = true;
                    break;
            }

            if(list) {
                editor.execCommand('insertimage', list);
                remote && editor.fireEvent("catchRemoteImage");
            }
        };
    }


    /* 初始化對其方式的點擊事件 */
    function initAlign(){
        /* 點擊align圖標 */
        domUtils.on($G("alignIcon"), 'click', function(e){
            var target = e.target || e.srcElement;
            if(target.className && target.className.indexOf('-align') != -1) {
                setAlign(target.getAttribute('data-align'));
            }
        });
    }

    /* 設置對齊方式 */
    function setAlign(align){
        align = align || 'none';
        var aligns = $G("alignIcon").children;
        for(i = 0; i < aligns.length; i++){
            if(aligns[i].getAttribute('data-align') == align) {
                domUtils.addClass(aligns[i], 'focus');
                $G("align").value = aligns[i].getAttribute('data-align');
            } else {
                domUtils.removeClasses(aligns[i], 'focus');
            }
        }
    }
    /* 獲取對齊方式 */
    function getAlign(){
        var align = $G("align").value || 'none';
        return align == 'none' ? '':align;
    }


    /* 在線圖片 */
    function RemoteImage(target) {
        this.container = utils.isString(target) ? document.getElementById(target) : target;
        this.init();
    }
    RemoteImage.prototype = {
        init: function () {
            this.initContainer();
            this.initEvents();
        },
        initContainer: function () {
            this.dom = {
                'url': $G('url'),
                'width': $G('width'),
                'height': $G('height'),
                'border': $G('border'),
                'vhSpace': $G('vhSpace'),
                'title': $G('title'),
                'align': $G('align')
            };
            var img = editor.selection.getRange().getClosedNode();
            if (img) {
                this.setImage(img);
            }
        },
        initEvents: function () {
            var _this = this,
                locker = $G('lock');

            /* 改變url */
            domUtils.on($G("url"), 'keyup', updatePreview);
            domUtils.on($G("border"), 'keyup', updatePreview);
            domUtils.on($G("title"), 'keyup', updatePreview);

            domUtils.on($G("width"), 'keyup', function(){
                if(locker.checked) {
                    var proportion =locker.getAttribute('data-proportion');
                    $G('height').value = Math.round(this.value / proportion);
                } else {
                    _this.updateLocker();
                }
                updatePreview();
            });
            domUtils.on($G("height"), 'keyup', function(){
                if(locker.checked) {
                    var proportion =locker.getAttribute('data-proportion');
                    $G('width').value = Math.round(this.value * proportion);
                } else {
                    _this.updateLocker();
                }
                updatePreview();
            });
            domUtils.on($G("lock"), 'change', function(){
                var proportion = parseInt($G("width").value) /parseInt($G("height").value);
                locker.setAttribute('data-proportion', proportion);
            });

            function updatePreview(){
                _this.setPreview();
            }
        },
        updateLocker: function(){
            var width = $G('width').value,
                height = $G('height').value,
                locker = $G('lock');
            if(width && height && width == parseInt(width) && height == parseInt(height)) {
                locker.disabled = false;
                locker.title = '';
            } else {
                locker.checked = false;
                locker.disabled = 'disabled';
                locker.title = lang.remoteLockError;
            }
        },
        setImage: function(img){
            /* 不是正常的圖片 */
            if (!img.tagName || img.tagName.toLowerCase() != 'img' && !img.getAttribute("src") || !img.src) return;

            var wordImgFlag = img.getAttribute("word_img"),
                src = wordImgFlag ? wordImgFlag.replace("&amp;", "&") : (img.getAttribute('_src') || img.getAttribute("src", 2).replace("&amp;", "&")),
                align = editor.queryCommandValue("imageFloat");

            /* 防止onchange事件循環調用 */
            if (src !== $G("url").value) $G("url").value = src;
            if(src) {
                /* 設置表單內容 */
                $G("width").value = img.width || '';
                $G("height").value = img.height || '';
                $G("border").value = img.getAttribute("border") || '0';
                $G("vhSpace").value = img.getAttribute("vspace") || '0';
                $G("title").value = img.title || img.alt || '';
                setAlign(align);
                this.setPreview();
                this.updateLocker();
            }
        },
        getData: function(){
            var data = {};
            for(var k in this.dom){
                data[k] = this.dom[k].value;
            }
            return data;
        },
        setPreview: function(){
            var url = $G('url').value,
                ow = $G('width').value,
                oh = $G('height').value,
                border = $G('border').value,
                title = $G('title').value,
                preview = $G('preview'),
                width,
                height;

            width = ((!ow || !oh) ? preview.offsetWidth:Math.min(ow, preview.offsetWidth));
            width = width+(border*2) > preview.offsetWidth ? width:(preview.offsetWidth - (border*2));
            height = (!ow || !oh) ? '':width*oh/ow;

            if(url) {
                preview.innerHTML = '<img src="' + url + '" width="' + width + '" height="' + height + '" border="' + border + 'px solid #000" title="' + title + '" />';
            }
        },
        getInsertList: function () {
            var data = this.getData();
            if(data['url']) {
                return [{
                    src: data['url'],
                    _src: data['url'],
                    width: data['width'] || '',
                    height: data['height'] || '',
                    border: data['border'] || '',
                    floatStyle: data['align'] || '',
                    vspace: data['vhSpace'] || '',
                    alt: data['title'] || '',
                    style: "width:" + data['width'] + "px;height:" + data['height'] + "px;"
                }];
            } else {
                return [];
            }
        }
    };



    /* 上傳圖片 */
    function UploadImage(target) {
        this.$wrap = target.constructor == String ? $('#' + target) : $(target);
        this.init();
    }
    UploadImage.prototype = {
        init: function () {
            this.imageList = [];
            this.initContainer();
            this.initUploader();
        },
        initContainer: function () {
            this.$queue = this.$wrap.find('.filelist');
        },
        /* 初始化容器 */
        initUploader: function () {
            var _this = this,
                $ = jQuery,    // just in case. Make sure it's not an other libaray.
                $wrap = _this.$wrap,
            // 圖片容器
                $queue = $wrap.find('.filelist'),
            // 狀態欄，包括進度和控制按鈕
                $statusBar = $wrap.find('.statusBar'),
            // 文件總體選擇訊息。
                $info = $statusBar.find('.info'),
            // 上傳按鈕
                $upload = $wrap.find('.uploadBtn'),
            // 上傳按鈕
                $filePickerBtn = $wrap.find('.filePickerBtn'),
            // 上傳按鈕
                $filePickerBlock = $wrap.find('.filePickerBlock'),
            // 沒選擇文件之前的內容。
                $placeHolder = $wrap.find('.placeholder'),
            // 總體進度條
                $progress = $statusBar.find('.progress').hide(),
            // 添加的文件數量
                fileCount = 0,
            // 添加的文件總大小
                fileSize = 0,
            // 優化retina, 在retina下這個值是2
                ratio = window.devicePixelRatio || 1,
            // 縮略圖大小
                thumbnailWidth = 113 * ratio,
                thumbnailHeight = 113 * ratio,
            // 可能有pedding, ready, uploading, confirm, done.
                state = '',
            // 所有文件的進度訊息，key為file id
                percentages = {},
                supportTransition = (function () {
                    var s = document.createElement('p').style,
                        r = 'transition' in s ||
                            'WebkitTransition' in s ||
                            'MozTransition' in s ||
                            'msTransition' in s ||
                            'OTransition' in s;
                    s = null;
                    return r;
                })(),
            // WebUploader實例
                uploader,
                actionUrl = editor.getActionUrl(editor.getOpt('imageActionName')),
                acceptExtensions = (editor.getOpt('imageAllowFiles') || []).join('').replace(/\./g, ',').replace(/^[,]/, ''),
                imageMaxSize = editor.getOpt('imageMaxSize'),
                imageCompressBorder = editor.getOpt('imageCompressBorder');

            if (!WebUploader.Uploader.support()) {
                $('#filePickerReady').after($('<div>').html(lang.errorNotSupport)).hide();
                return;
            } else if (!editor.getOpt('imageActionName')) {
                $('#filePickerReady').after($('<div>').html(lang.errorLoadConfig)).hide();
                return;
            }

            uploader = _this.uploader = WebUploader.create({
                pick: {
                    id: '#filePickerReady',
                    label: lang.uploadSelectFile
                },
                accept: {
                    title: 'Images',
                    extensions: acceptExtensions,
                    mimeTypes: 'image/*'
                },
                swf: '../../third-party/webuploader/Uploader.swf',
                server: actionUrl,
                fileVal: editor.getOpt('imageFieldName'),
                duplicate: true,
                fileSingleSizeLimit: imageMaxSize,    // 默認 2 M
                compress: editor.getOpt('imageCompressEnable') ? {
                    width: imageCompressBorder,
                    height: imageCompressBorder,
                    // 圖片質量，只有type為`image/jpeg`的時候才有效。
                    quality: 90,
                    // 是否允許放大，如果想要生成小圖的時候不失真，此選項應該設置為false.
                    allowMagnify: false,
                    // 是否允許裁剪。
                    crop: false,
                    // 是否保留頭部meta訊息。
                    preserveHeaders: true
                }:false
            });
            uploader.addButton({
                id: '#filePickerBlock'
            });
            uploader.addButton({
                id: '#filePickerBtn',
                label: lang.uploadAddFile
            });

            setState('pedding');

            // 當有文件添加進來時執行，負責view的創建
            function addFile(file) {
                var $li = $('<li id="' + file.id + '">' +
                    '<p class="title">' + file.name + '</p>' +
                    '<p class="imgWrap"></p>' +
                    '<p class="progress"><span></span></p>' +
                    '</li>'),

                    $btns = $('<div class="file-panel">' +
                    '<span class="cancel">' + lang.uploadDelete + '</span>' +
                    '<span class="rotateRight">' + lang.uploadTurnRight + '</span>' +
                    '<span class="rotateLeft">' + lang.uploadTurnLeft + '</span></div>').appendTo($li),
                    $prgress = $li.find('p.progress span'),
                    $wrap = $li.find('p.imgWrap'),
                    $info = $('<p class="error"></p>').hide().appendTo($li),

                    showError = function (code) {
                        switch (code) {
                            case 'exceed_size':
                                text = lang.errorExceedSize;
                                break;
                            case 'interrupt':
                                text = lang.errorInterrupt;
                                break;
                            case 'http':
                                text = lang.errorHttp;
                                break;
                            case 'not_allow_type':
                                text = lang.errorFileType;
                                break;
                            default:
                                text = lang.errorUploadRetry;
                                break;
                        }
                        $info.text(text).show();
                    };

                if (file.getStatus() === 'invalid') {
                    showError(file.statusText);
                } else {
                    $wrap.text(lang.uploadPreview);
                    if (browser.ie && browser.version <= 7) {
                        $wrap.text(lang.uploadNoPreview);
                    } else {
                        uploader.makeThumb(file, function (error, src) {
                            if (error || !src) {
                                $wrap.text(lang.uploadNoPreview);
                            } else {
                                var $img = $('<img src="' + src + '">');
                                $wrap.empty().append($img);
                                $img.on('error', function () {
                                    $wrap.text(lang.uploadNoPreview);
                                });
                            }
                        }, thumbnailWidth, thumbnailHeight);
                    }
                    percentages[ file.id ] = [ file.size, 0 ];
                    file.rotation = 0;

                    /* 檢查文件格式 */
                    if (!file.ext || acceptExtensions.indexOf(file.ext.toLowerCase()) == -1) {
                        showError('not_allow_type');
                        uploader.removeFile(file);
                    }
                }

                file.on('statuschange', function (cur, prev) {
                    if (prev === 'progress') {
                        $prgress.hide().width(0);
                    } else if (prev === 'queued') {
                        $li.off('mouseenter mouseleave');
                        $btns.remove();
                    }
                    // 成功
                    if (cur === 'error' || cur === 'invalid') {
                        showError(file.statusText);
                        percentages[ file.id ][ 1 ] = 1;
                    } else if (cur === 'interrupt') {
                        showError('interrupt');
                    } else if (cur === 'queued') {
                        percentages[ file.id ][ 1 ] = 0;
                    } else if (cur === 'progress') {
                        $info.hide();
                        $prgress.css('display', 'block');
                    } else if (cur === 'complete') {
                    }

                    $li.removeClass('state-' + prev).addClass('state-' + cur);
                });

                $li.on('mouseenter', function () {
                    $btns.stop().animate({height: 30});
                });
                $li.on('mouseleave', function () {
                    $btns.stop().animate({height: 0});
                });

                $btns.on('click', 'span', function () {
                    var index = $(this).index(),
                        deg;

                    switch (index) {
                        case 0:
                            uploader.removeFile(file);
                            return;
                        case 1:
                            file.rotation += 90;
                            break;
                        case 2:
                            file.rotation -= 90;
                            break;
                    }

                    if (supportTransition) {
                        deg = 'rotate(' + file.rotation + 'deg)';
                        $wrap.css({
                            '-webkit-transform': deg,
                            '-mos-transform': deg,
                            '-o-transform': deg,
                            'transform': deg
                        });
                    } else {
                        $wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((file.rotation / 90) % 4 + 4) % 4) + ')');
                    }

                });

                $li.insertBefore($filePickerBlock);
            }

            // 負責view的銷毀
            function removeFile(file) {
                var $li = $('#' + file.id);
                delete percentages[ file.id ];
                updateTotalProgress();
                $li.off().find('.file-panel').off().end().remove();
            }

            function updateTotalProgress() {
                var loaded = 0,
                    total = 0,
                    spans = $progress.children(),
                    percent;

                $.each(percentages, function (k, v) {
                    total += v[ 0 ];
                    loaded += v[ 0 ] * v[ 1 ];
                });

                percent = total ? loaded / total : 0;

                spans.eq(0).text(Math.round(percent * 100) + '%');
                spans.eq(1).css('width', Math.round(percent * 100) + '%');
                updateStatus();
            }

            function setState(val, files) {

                if (val != state) {

                    var stats = uploader.getStats();

                    $upload.removeClass('state-' + state);
                    $upload.addClass('state-' + val);

                    switch (val) {

                        /* 未選擇文件 */
                        case 'pedding':
                            $queue.addClass('element-invisible');
                            $statusBar.addClass('element-invisible');
                            $placeHolder.removeClass('element-invisible');
                            $progress.hide(); $info.hide();
                            uploader.refresh();
                            break;

                        /* 可以開始上傳 */
                        case 'ready':
                            $placeHolder.addClass('element-invisible');
                            $queue.removeClass('element-invisible');
                            $statusBar.removeClass('element-invisible');
                            $progress.hide(); $info.show();
                            $upload.text(lang.uploadStart);
                            uploader.refresh();
                            break;

                        /* 上傳中 */
                        case 'uploading':
                            $progress.show(); $info.hide();
                            $upload.text(lang.uploadPause);
                            break;

                        /* 暫停上傳 */
                        case 'paused':
                            $progress.show(); $info.hide();
                            $upload.text(lang.uploadContinue);
                            break;

                        case 'confirm':
                            $progress.show(); $info.hide();
                            $upload.text(lang.uploadStart);

                            stats = uploader.getStats();
                            if (stats.successNum && !stats.uploadFailNum) {
                                setState('finish');
                                return;
                            }
                            break;

                        case 'finish':
                            $progress.hide(); $info.show();
                            if (stats.uploadFailNum) {
                                $upload.text(lang.uploadRetry);
                            } else {
                                $upload.text(lang.uploadStart);
                            }
                            break;
                    }

                    state = val;
                    updateStatus();

                }

                if (!_this.getQueueCount()) {
                    $upload.addClass('disabled')
                } else {
                    $upload.removeClass('disabled')
                }

            }

            function updateStatus() {
                var text = '', stats;

                if (state === 'ready') {
                    text = lang.updateStatusReady.replace('_', fileCount).replace('_KB', WebUploader.formatSize(fileSize));
                } else if (state === 'confirm') {
                    stats = uploader.getStats();
                    if (stats.uploadFailNum) {
                        text = lang.updateStatusConfirm.replace('_', stats.successNum).replace('_', stats.successNum);
                    }
                } else {
                    stats = uploader.getStats();
                    text = lang.updateStatusFinish.replace('_', fileCount).
                        replace('_KB', WebUploader.formatSize(fileSize)).
                        replace('_', stats.successNum);

                    if (stats.uploadFailNum) {
                        text += lang.updateStatusError.replace('_', stats.uploadFailNum);
                    }
                }

                $info.html(text);
            }

            uploader.on('fileQueued', function (file) {
                fileCount++;
                fileSize += file.size;

                if (fileCount === 1) {
                    $placeHolder.addClass('element-invisible');
                    $statusBar.show();
                }

                addFile(file);
            });

            uploader.on('fileDequeued', function (file) {
                if (file.ext && acceptExtensions.indexOf(file.ext.toLowerCase()) != -1 && file.size <= imageMaxSize) {
                    fileCount--;
                    fileSize -= file.size;
                }

                removeFile(file);
                updateTotalProgress();
            });

            uploader.on('filesQueued', function (file) {
                if (!uploader.isInProgress() && (state == 'pedding' || state == 'finish' || state == 'confirm' || state == 'ready')) {
                    setState('ready');
                }
                updateTotalProgress();
            });

            uploader.on('all', function (type, files) {
                switch (type) {
                    case 'uploadFinished':
                        setState('confirm', files);
                        break;
                    case 'startUpload':
                        /* 添加額外的GET參數 */
                        var params = utils.serializeParam(editor.queryCommandValue('serverparam')) || '',
                            url = utils.formatUrl(actionUrl + (actionUrl.indexOf('?') == -1 ? '?':'&') + 'encode=utf-8&' + params);
                        uploader.option('server', url);
                        setState('uploading', files);
                        break;
                    case 'stopUpload':
                        setState('paused', files);
                        break;
                }
            });

            uploader.on('uploadBeforeSend', function (file, data, header) {
                //這裡可以通過data對象添加POST參數
                if (actionUrl.toLowerCase().indexOf('jsp') != -1) {
                    header['X-Requested-With'] = 'XMLHttpRequest';
                }
            });

            uploader.on('uploadProgress', function (file, percentage) {
                var $li = $('#' + file.id),
                    $percent = $li.find('.progress span');

                $percent.css('width', percentage * 100 + '%');
                percentages[ file.id ][ 1 ] = percentage;
                updateTotalProgress();
            });

            uploader.on('uploadSuccess', function (file, ret) {
                var $file = $('#' + file.id);
                try {
                    var responseText = (ret._raw || ret),
                        json = utils.str2json(responseText);
                    if (json.state == 'SUCCESS') {
                        _this.imageList.push(json);
                        $file.append('<span class="success"></span>');
                    } else {
                        $file.find('.error').text(json.state).show();
                    }
                } catch (e) {
                    $file.find('.error').text(lang.errorServerUpload).show();
                }
            });

            uploader.on('uploadError', function (file, code) {
            });
            uploader.on('error', function (code, file) {
                if (code == 'Q_TYPE_DENIED' || code == 'F_EXCEED_SIZE') {
                    addFile(file);
                }
            });
            uploader.on('uploadComplete', function (file, ret) {
            });

            $upload.on('click', function () {
                if ($(this).hasClass('disabled')) {
                    return false;
                }

                if (state === 'ready') {
                    uploader.upload();
                } else if (state === 'paused') {
                    uploader.upload();
                } else if (state === 'uploading') {
                    uploader.stop();
                }
            });

            $upload.addClass('state-' + state);
            updateTotalProgress();
        },
        getQueueCount: function () {
            var file, i, status, readyFile = 0, files = this.uploader.getFiles();
            for (i = 0; file = files[i++]; ) {
                status = file.getStatus();
                if (status == 'queued' || status == 'uploading' || status == 'progress') readyFile++;
            }
            return readyFile;
        },
        destroy: function () {
            this.$wrap.remove();
        },
        getInsertList: function () {
            var i, data, list = [],
                align = getAlign(),
                prefix = editor.getOpt('imageUrlPrefix');
            for (i = 0; i < this.imageList.length; i++) {
                data = this.imageList[i];
                list.push({
                    src: prefix + data.url,
                    _src: prefix + data.url,
                    alt: data.original,
                    floatStyle: align
                });
            }
            return list;
        }
    };


    /* 在線圖片 */
    function OnlineImage(target) {
        this.container = utils.isString(target) ? document.getElementById(target) : target;
        this.init();
    }
    OnlineImage.prototype = {
        init: function () {
            this.reset();
            this.initEvents();
        },
        /* 初始化容器 */
        initContainer: function () {
            this.container.innerHTML = '';
            this.list = document.createElement('ul');
            this.clearFloat = document.createElement('li');

            domUtils.addClass(this.list, 'list');
            domUtils.addClass(this.clearFloat, 'clearFloat');

            this.list.appendChild(this.clearFloat);
            this.container.appendChild(this.list);
        },
        /* 初始化滾動事件,滾動到地步自動拉取數據 */
        initEvents: function () {
            var _this = this;

            /* 滾動拉取圖片 */
            domUtils.on($G('imageList'), 'scroll', function(e){
                var panel = this;
                if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                    _this.getImageData();
                }
            });
            /* 選中圖片 */
            domUtils.on(this.container, 'click', function (e) {
                var target = e.target || e.srcElement,
                    li = target.parentNode;

                if (li.tagName.toLowerCase() == 'li') {
                    if (domUtils.hasClass(li, 'selected')) {
                        domUtils.removeClasses(li, 'selected');
                    } else {
                        domUtils.addClass(li, 'selected');
                    }
                }
            });
        },
        /* 初始化第一次的數據 */
        initData: function () {

            /* 拉取數據需要使用的值 */
            this.state = 0;
            this.listSize = editor.getOpt('imageManagerListSize');
            this.listIndex = 0;
            this.listEnd = false;

            /* 第一次拉取數據 */
            this.getImageData();
        },
        /* 重置界面 */
        reset: function() {
            this.initContainer();
            this.initData();
        },
        /* 向後台拉取圖片列表數據 */
        getImageData: function () {
            var _this = this;

            if(!_this.listEnd && !this.isLoadingData) {
                this.isLoadingData = true;
                var url = editor.getActionUrl(editor.getOpt('imageManagerActionName')),
                    isJsonp = utils.isCrossDomainUrl(url);
                ajax.request(url, {
                    'timeout': 100000,
                    'dataType': isJsonp ? 'jsonp':'',
                    'data': utils.extend({
                        start: this.listIndex,
                        size: this.listSize
                    }, editor.queryCommandValue('serverparam')),
                    'method': 'get',
                    'onsuccess': function (r) {
                        try {
                            var json = isJsonp ? r:eval('(' + r.responseText + ')');
                            if (json.state == 'SUCCESS') {
                                _this.pushData(json.list);
                                _this.listIndex = parseInt(json.start) + parseInt(json.list.length);
                                if(_this.listIndex >= json.total) {
                                    _this.listEnd = true;
                                }
                                _this.isLoadingData = false;
                            }
                        } catch (e) {
                            if(r.responseText.indexOf('ue_separate_ue') != -1) {
                                var list = r.responseText.split(r.responseText);
                                _this.pushData(list);
                                _this.listIndex = parseInt(list.length);
                                _this.listEnd = true;
                                _this.isLoadingData = false;
                            }
                        }
                    },
                    'onerror': function () {
                        _this.isLoadingData = false;
                    }
                });
            }
        },
        /* 添加圖片到列表界面上 */
        pushData: function (list) {
            var i, item, img, icon, _this = this,
                urlPrefix = editor.getOpt('imageManagerUrlPrefix');
            for (i = 0; i < list.length; i++) {
                if(list[i] && list[i].url) {
                    item = document.createElement('li');
                    img = document.createElement('img');
                    icon = document.createElement('span');

                    domUtils.on(img, 'load', (function(image){
                        return function(){
                            _this.scale(image, image.parentNode.offsetWidth, image.parentNode.offsetHeight);
                        }
                    })(img));
                    img.width = 113;
                    img.setAttribute('src', urlPrefix + list[i].url + (list[i].url.indexOf('?') == -1 ? '?noCache=':'&noCache=') + (+new Date()).toString(36) );
                    img.setAttribute('_src', urlPrefix + list[i].url);
                    domUtils.addClass(icon, 'icon');

                    item.appendChild(img);
                    item.appendChild(icon);
                    this.list.insertBefore(item, this.clearFloat);
                }
            }
        },
        /* 改變圖片大小 */
        scale: function (img, w, h, type) {
            var ow = img.width,
                oh = img.height;

            if (type == 'justify') {
                if (ow >= oh) {
                    img.width = w;
                    img.height = h * oh / ow;
                    img.style.marginLeft = '-' + parseInt((img.width - w) / 2) + 'px';
                } else {
                    img.width = w * ow / oh;
                    img.height = h;
                    img.style.marginTop = '-' + parseInt((img.height - h) / 2) + 'px';
                }
            } else {
                if (ow >= oh) {
                    img.width = w * ow / oh;
                    img.height = h;
                    img.style.marginLeft = '-' + parseInt((img.width - w) / 2) + 'px';
                } else {
                    img.width = w;
                    img.height = h * oh / ow;
                    img.style.marginTop = '-' + parseInt((img.height - h) / 2) + 'px';
                }
            }
        },
        getInsertList: function () {
            var i, lis = this.list.children, list = [], align = getAlign();
            for (i = 0; i < lis.length; i++) {
                if (domUtils.hasClass(lis[i], 'selected')) {
                    var img = lis[i].firstChild,
                        src = img.getAttribute('_src');
                    list.push({
                        src: src,
                        _src: src,
                        alt: src.substr(src.lastIndexOf('/') + 1),
                        floatStyle: align
                    });
                }

            }
            return list;
        }
    };

    /*搜索圖片 */
    function SearchImage() {
        this.init();
    }
    SearchImage.prototype = {
        init: function () {
            this.initEvents();
        },
        initEvents: function(){
            var _this = this;

            /* 點擊搜索按鈕 */
            domUtils.on($G('searchBtn'), 'click', function(){
                var key = $G('searchTxt').value;
                if(key && key != lang.searchRemind) {
                    _this.getImageData();
                }
            });
            /* 點擊清除妞 */
            domUtils.on($G('searchReset'), 'click', function(){
                $G('searchTxt').value = lang.searchRemind;
                $G('searchListUl').innerHTML = '';
                $G('searchType').selectedIndex = 0;
            });
            /* 搜索框聚焦 */
            domUtils.on($G('searchTxt'), 'focus', function(){
                var key = $G('searchTxt').value;
                if(key && key == lang.searchRemind) {
                    $G('searchTxt').value = '';
                }
            });
            /* 搜索框回車鍵搜索 */
            domUtils.on($G('searchTxt'), 'keydown', function(e){
                var keyCode = e.keyCode || e.which;
                if (keyCode == 13) {
                    $G('searchBtn').click();
                }
            });

            /* 選中圖片 */
            domUtils.on($G('searchList'), 'click', function(e){
                var target = e.target || e.srcElement,
                    li = target.parentNode.parentNode;

                if (li.tagName.toLowerCase() == 'li') {
                    if (domUtils.hasClass(li, 'selected')) {
                        domUtils.removeClasses(li, 'selected');
                    } else {
                        domUtils.addClass(li, 'selected');
                    }
                }
            });
        },
        /* 改變圖片大小 */
        scale: function (img, w, h) {
            var ow = img.width,
                oh = img.height;

            if (ow >= oh) {
                img.width = w * ow / oh;
                img.height = h;
                img.style.marginLeft = '-' + parseInt((img.width - w) / 2) + 'px';
            } else {
                img.width = w;
                img.height = h * oh / ow;
                img.style.marginTop = '-' + parseInt((img.height - h) / 2) + 'px';
            }
        },
        getImageData: function(){
            var _this = this,
                key = $G('searchTxt').value,
                type = $G('searchType').value,
                keepOriginName = editor.options.keepOriginName ? "1" : "0",
                url = "http://image.baidu.com/i?ct=201326592&cl=2&lm=-1&st=-1&tn=baiduimagejson&istype=2&rn=32&fm=index&pv=&word=" + key + type + "&ie=utf-8&oe=utf-8&keeporiginname=" + keepOriginName + "&" + +new Date;

            $G('searchListUl').innerHTML = lang.searchLoading;
            ajax.request(url, {
                'dataType': 'jsonp',
                'charset': 'GB18030',
                'onsuccess':function(json){
                    var list = [];
                    if(json && json.data) {
                        for(var i = 0; i < json.data.length; i++) {
                            if(json.data[i].objURL) {
                                list.push({
                                    title: json.data[i].fromPageTitleEnc,
                                    src: json.data[i].objURL,
                                    url: json.data[i].fromURL
                                });
                            }
                        }
                    }
                    _this.setList(list);
                },
                'onerror':function(){
                    $G('searchListUl').innerHTML = lang.searchRetry;
                }
            });
        },
        /* 添加圖片到列表界面上 */
        setList: function (list) {
            var i, item, p, img, link, _this = this,
                listUl = $G('searchListUl');

            listUl.innerHTML = '';
            if(list.length) {
                for (i = 0; i < list.length; i++) {
                    item = document.createElement('li');
                    p = document.createElement('p');
                    img = document.createElement('img');
                    link = document.createElement('a');

                    img.onload = function () {
                        _this.scale(this, 113, 113);
                    };
                    img.width = 113;
                    img.setAttribute('src', list[i].src);

                    link.href = list[i].url;
                    link.target = '_blank';
                    link.title = list[i].title;
                    link.innerHTML = list[i].title;

                    p.appendChild(img);
                    item.appendChild(p);
                    item.appendChild(link);
                    listUl.appendChild(item);
                }
            } else {
                listUl.innerHTML = lang.searchRetry;
            }
        },
        getInsertList: function () {
            var child,
                src,
                align = getAlign(),
                list = [],
                items = $G('searchListUl').children;
            for(var i = 0; i < items.length; i++) {
                child = items[i].firstChild && items[i].firstChild.firstChild;
                if(child.tagName && child.tagName.toLowerCase() == 'img' && domUtils.hasClass(items[i], 'selected')) {
                    src = child.src;
                    list.push({
                        src: src,
                        _src: src,
                        alt: src.substr(src.lastIndexOf('/') + 1),
                        floatStyle: align
                    });
                }
            }
            return list;
        }
    };

})();
