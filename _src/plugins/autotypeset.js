/**
 * 自動排版
 * @file
 * @since 1.2.6.1
 */

/**
 * 對當前編輯器的內容執行自動排版， 排版的行為根據config配置文件里的“autotypeset”選項進行控制。
 * @command autotypeset
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @example
 * ```javascript
 * editor.execCommand( 'autotypeset' );
 * ```
 */

UE.plugins['autotypeset'] = function(){

    this.setOpt({'autotypeset': {
        mergeEmptyline: true,           //合並空行
        removeClass: true,              //去掉冗余的class
        removeEmptyline: false,         //去掉空行
        textAlign:"left",               //段落的排版方式，可以是 left,right,center,justify 去掉這個屬性表示不執行排版
        imageBlockLine: 'center',       //圖片的浮動方式，獨占一行劇中,左右浮動，默認: center,left,right,none 去掉這個屬性表示不執行排版
        pasteFilter: false,             //根據規則過濾沒事粘貼進來的內容
        clearFontSize: false,           //去掉所有的內嵌字號，使用編輯器默認的字號
        clearFontFamily: false,         //去掉所有的內嵌字體，使用編輯器默認的字體
        removeEmptyNode: false,         // 去掉空節點
        //可以去掉的標簽
        removeTagNames: utils.extend({div:1},dtd.$removeEmpty),
        indent: false,                  // 行首縮進
        indentValue : '2em',            //行首縮進的大小
        bdc2sb: false,
        tobdc: false
    }});

    var me = this,
        opt = me.options.autotypeset,
        remainClass = {
            'selectTdClass':1,
            'pagebreak':1,
            'anchorclass':1
        },
        remainTag = {
            'li':1
        },
        tags = {
            div:1,
            p:1,
            //trace:2183 這些也認為是行
            blockquote:1,center:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,
            span:1
        },
        highlightCont;
    //升級了版本，但配置項目里沒有autotypeset
    if(!opt){
        return;
    }

    readLocalOpts();

    function isLine(node,notEmpty){
        if(!node || node.nodeType == 3)
            return 0;
        if(domUtils.isBr(node))
            return 1;
        if(node && node.parentNode && tags[node.tagName.toLowerCase()]){
            if(highlightCont && highlightCont.contains(node)
                ||
                node.getAttribute('pagebreak')
            ){
                return 0;
            }

            return notEmpty ? !domUtils.isEmptyBlock(node) : domUtils.isEmptyBlock(node,new RegExp('[\\s'+domUtils.fillChar
                +']','g'));
        }
    }

    function removeNotAttributeSpan(node){
        if(!node.style.cssText){
            domUtils.removeAttributes(node,['style']);
            if(node.tagName.toLowerCase() == 'span' && domUtils.hasNoAttributes(node)){
                domUtils.remove(node,true);
            }
        }
    }
    function autotype(type,html){

        var me = this,cont;
        if(html){
            if(!opt.pasteFilter){
                return;
            }
            cont = me.document.createElement('div');
            cont.innerHTML = html.html;
        }else{
            cont = me.document.body;
        }
        var nodes = domUtils.getElementsByTagName(cont,'*');

        // 行首縮進，段落方向，段間距，段內間距
        for(var i=0,ci;ci=nodes[i++];){

            if(me.fireEvent('excludeNodeinautotype',ci) === true){
                continue;
            }
             //font-size
            if(opt.clearFontSize && ci.style.fontSize){
                domUtils.removeStyle(ci,'font-size');

                removeNotAttributeSpan(ci);

            }
            //font-family
            if(opt.clearFontFamily && ci.style.fontFamily){
                domUtils.removeStyle(ci,'font-family');
                removeNotAttributeSpan(ci);
            }

            if(isLine(ci)){
                //合並空行
                if(opt.mergeEmptyline ){
                    var next = ci.nextSibling,tmpNode,isBr = domUtils.isBr(ci);
                    while(isLine(next)){
                        tmpNode = next;
                        next = tmpNode.nextSibling;
                        if(isBr && (!next || next && !domUtils.isBr(next))){
                            break;
                        }
                        domUtils.remove(tmpNode);
                    }

                }
                 //去掉空行，保留占位的空行
                if(opt.removeEmptyline && domUtils.inDoc(ci,cont) && !remainTag[ci.parentNode.tagName.toLowerCase()] ){
                    if(domUtils.isBr(ci)){
                        next = ci.nextSibling;
                        if(next && !domUtils.isBr(next)){
                            continue;
                        }
                    }
                    domUtils.remove(ci);
                    continue;

                }

            }
            if(isLine(ci,true) && ci.tagName != 'SPAN'){
                if(opt.indent){
                    ci.style.textIndent = opt.indentValue;
                }
                if(opt.textAlign){
                    ci.style.textAlign = opt.textAlign;
                }
                // if(opt.lineHeight)
                //     ci.style.lineHeight = opt.lineHeight + 'cm';

            }

            //去掉class,保留的class不去掉
            if(opt.removeClass && ci.className && !remainClass[ci.className.toLowerCase()]){

                if(highlightCont && highlightCont.contains(ci)){
                     continue;
                }
                domUtils.removeAttributes(ci,['class']);
            }

            //表情不處理
            if(opt.imageBlockLine && ci.tagName.toLowerCase() == 'img' && !ci.getAttribute('emotion')){
                if(html){
                    var img = ci;
                    switch (opt.imageBlockLine){
                        case 'left':
                        case 'right':
                        case 'none':
                            var pN = img.parentNode,tmpNode,pre,next;
                            while(dtd.$inline[pN.tagName] || pN.tagName == 'A'){
                                pN = pN.parentNode;
                            }
                            tmpNode = pN;
                            if(tmpNode.tagName == 'P' && domUtils.getStyle(tmpNode,'text-align') == 'center'){
                                if(!domUtils.isBody(tmpNode) && domUtils.getChildCount(tmpNode,function(node){return !domUtils.isBr(node) && !domUtils.isWhitespace(node)}) == 1){
                                    pre = tmpNode.previousSibling;
                                    next = tmpNode.nextSibling;
                                    if(pre && next && pre.nodeType == 1 &&  next.nodeType == 1 && pre.tagName == next.tagName && domUtils.isBlockElm(pre)){
                                        pre.appendChild(tmpNode.firstChild);
                                        while(next.firstChild){
                                            pre.appendChild(next.firstChild);
                                        }
                                        domUtils.remove(tmpNode);
                                        domUtils.remove(next);
                                    }else{
                                        domUtils.setStyle(tmpNode,'text-align','');
                                    }


                                }


                            }
                            domUtils.setStyle(img,'float', opt.imageBlockLine);
                            break;
                        case 'center':
                            if(me.queryCommandValue('imagefloat') != 'center'){
                                pN = img.parentNode;
                                domUtils.setStyle(img,'float','none');
                                tmpNode = img;
                                while(pN && domUtils.getChildCount(pN,function(node){return !domUtils.isBr(node) && !domUtils.isWhitespace(node)}) == 1
                                    && (dtd.$inline[pN.tagName] || pN.tagName == 'A')){
                                    tmpNode = pN;
                                    pN = pN.parentNode;
                                }
                                var pNode = me.document.createElement('p');
                                domUtils.setAttributes(pNode,{

                                    style:'text-align:center'
                                });
                                tmpNode.parentNode.insertBefore(pNode,tmpNode);
                                pNode.appendChild(tmpNode);
                                domUtils.setStyle(tmpNode,'float','');

                            }


                    }
                } else {
                    var range = me.selection.getRange();
                    range.selectNode(ci).select();
                    me.execCommand('imagefloat', opt.imageBlockLine);
                }

            }

            //去掉冗余的標簽
            if(opt.removeEmptyNode){
                if(opt.removeTagNames[ci.tagName.toLowerCase()] && domUtils.hasNoAttributes(ci) && domUtils.isEmptyBlock(ci)){
                    domUtils.remove(ci);
                }
            }
        }
        if(opt.tobdc){
            var root = UE.htmlparser(cont.innerHTML);
            root.traversal(function(node){
                if(node.type == 'text'){
                    node.data = ToDBC(node.data)
                }
            });
            cont.innerHTML = root.toHtml()
        }
        if(opt.bdc2sb){
            var root = UE.htmlparser(cont.innerHTML);
            root.traversal(function(node){
                if(node.type == 'text'){
                    node.data = DBC2SB(node.data)
                }
            });
            cont.innerHTML = root.toHtml()
        }
        if(html){
            html.html = cont.innerHTML;
        }
    }
    if(opt.pasteFilter){
        me.addListener('beforepaste',autotype);
    }

    function DBC2SB(str) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i); //獲取當前字符的unicode編碼
            if (code >= 65281 && code <= 65373)//在這個unicode編碼範圍中的是所有的英文字母已經各種字符
            {
                result += String.fromCharCode(str.charCodeAt(i) - 65248); //把全角字符的unicode編碼轉換為對應半角字符的unicode碼
            } else if (code == 12288)//空格
            {
                result += String.fromCharCode(str.charCodeAt(i) - 12288 + 32);
            } else {
                result += str.charAt(i);
            }
        }
        return result;
    }
    function ToDBC(txtstring) {
        txtstring = utils.html(txtstring);
        var tmp = "";
        var mark = "";/*用於判斷,如果是html尖括里的標記,則不進行全角的轉換*/
        for (var i = 0; i < txtstring.length; i++) {
            if (txtstring.charCodeAt(i) == 32) {
                tmp = tmp + String.fromCharCode(12288);
            }
            else if (txtstring.charCodeAt(i) < 127) {
                tmp = tmp + String.fromCharCode(txtstring.charCodeAt(i) + 65248);
            }
            else {
                tmp += txtstring.charAt(i);
            }
        }
        return tmp;
    }

    function readLocalOpts() {
        var cookieOpt = me.getPreferences('autotypeset');
        utils.extend(me.options.autotypeset, cookieOpt);
    }

    me.commands['autotypeset'] = {
        execCommand:function () {
            me.removeListener('beforepaste',autotype);
            if(opt.pasteFilter){
                me.addListener('beforepaste',autotype);
            }
            autotype.call(me)
        }

    };

};

