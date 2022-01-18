///import core
///commands 當輸入內容超過編輯器高度時，編輯器自動增高
///commandsName  AutoHeight,autoHeightEnabled
///commandsTitle  自動增高
/**
 * @description 自動伸展
 * @author zhanyi
 */
UE.plugins['autoheight'] = function () {
    var me = this;
    //提供開關，就算加載也可以關閉
    me.autoHeightEnabled = me.options.autoHeightEnabled !== false;
    if (!me.autoHeightEnabled) {
        return;
    }

    var bakOverflow,
        lastHeight = 0,
        options = me.options,
        currentHeight,
        timer;

    function adjustHeight() {
        var me = this;
        clearTimeout(timer);
        if(isFullscreen)return;
        if (!me.queryCommandState || me.queryCommandState && me.queryCommandState('source') != 1) {
            timer = setTimeout(function(){

                var node = me.body.lastChild;
                while(node && node.nodeType != 1){
                    node = node.previousSibling;
                }
                if(node && node.nodeType == 1){
                    node.style.clear = 'both';
                    currentHeight = Math.max(domUtils.getXY(node).y + node.offsetHeight + 25 ,Math.max(options.minFrameHeight, options.initialFrameHeight)) ;
                    if (currentHeight != lastHeight) {
                        if (currentHeight !== parseInt(me.iframe.parentNode.style.height)) {
                            me.iframe.parentNode.style.height = currentHeight + 'px';
                        }
                        me.body.style.height = currentHeight + 'px';
                        lastHeight = currentHeight;
                    }
                    domUtils.removeStyle(node,'clear');
                }


            },50)
        }
    }
    var isFullscreen;
    me.addListener('fullscreenchanged',function(cmd,f){
        isFullscreen = f
    });
    me.addListener('destroy', function () {
        me.removeListener('contentchange afterinserthtml keyup mouseup',adjustHeight)
    });
    me.enableAutoHeight = function () {
        var me = this;
        if (!me.autoHeightEnabled) {
            return;
        }
        var doc = me.document;
        me.autoHeightEnabled = true;
        bakOverflow = doc.body.style.overflowY;
        doc.body.style.overflowY = 'hidden';
        me.addListener('contentchange afterinserthtml keyup mouseup',adjustHeight);
        //ff不給事件算得不對

        setTimeout(function () {
            adjustHeight.call(me);
        }, browser.gecko ? 100 : 0);
        me.fireEvent('autoheightchanged', me.autoHeightEnabled);
    };
    me.disableAutoHeight = function () {

        me.body.style.overflowY = bakOverflow || '';

        me.removeListener('contentchange', adjustHeight);
        me.removeListener('keyup', adjustHeight);
        me.removeListener('mouseup', adjustHeight);
        me.autoHeightEnabled = false;
        me.fireEvent('autoheightchanged', me.autoHeightEnabled);
    };

    me.on('setHeight',function(){
        me.disableAutoHeight()
    });
    me.addListener('ready', function () {
        me.enableAutoHeight();
        //trace:1764
        var timer;
        domUtils.on(browser.ie ? me.body : me.document, browser.webkit ? 'dragover' : 'drop', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                //trace:3681
                adjustHeight.call(me);
            }, 100);

        });
        //修覆內容過多時，回到頂部，頂部內容被工具欄遮擋問題
        var lastScrollY;
        window.onscroll = function(){
            if(lastScrollY === null){
                lastScrollY = this.scrollY
            }else if(this.scrollY == 0 && lastScrollY != 0){
                me.window.scrollTo(0,0);
                lastScrollY = null;
            }
        }
    });


};

