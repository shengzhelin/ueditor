///import core
///plugin 編輯器默認的過濾轉換機制

UE.plugins['defaultfilter'] = function () {
    var me = this;
    me.setOpt({
        'allowDivTransToP':true,
        'disabledTableInTable':true
    });
    //默認的過濾處理
    //進入編輯器的內容處理
    me.addInputRule(function (root) {
        var allowDivTransToP = this.options.allowDivTransToP;
        var val;
        function tdParent(node){
            while(node && node.type == 'element'){
                if(node.tagName == 'td'){
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }
        //進行默認的處理
        root.traversal(function (node) {
            if (node.type == 'element') {
                if (!dtd.$cdata[node.tagName] && me.options.autoClearEmptyNode && dtd.$inline[node.tagName] && !dtd.$empty[node.tagName] && (!node.attrs || utils.isEmptyObject(node.attrs))) {
                    if (!node.firstChild()) node.parentNode.removeChild(node);
                    else if (node.tagName == 'span' && (!node.attrs || utils.isEmptyObject(node.attrs))) {
                        node.parentNode.removeChild(node, true)
                    }
                    return;
                }
                switch (node.tagName) {
                    case 'style':
                    case 'script':
                        node.setAttr({
                            cdata_tag: node.tagName,
                            cdata_data: (node.innerHTML() || ''),
                            '_ue_custom_node_':'true'
                        });
                        node.tagName = 'div';
                        node.innerHTML('');
                        break;
                    case 'a':
                        if (val = node.getAttr('href')) {
                            node.setAttr('_href', val)
                        }
                        break;
                    case 'img':
                        //todo base64暫時去掉，後邊做遠程圖片上傳後，幹掉這個
                        if (val = node.getAttr('src')) {
                            if (/^data:/.test(val)) {
                                node.parentNode.removeChild(node);
                                break;
                            }
                        }
                        node.setAttr('_src', node.getAttr('src'));
                        break;
                    case 'span':
                        if (browser.webkit && (val = node.getStyle('white-space'))) {
                            if (/nowrap|normal/.test(val)) {
                                node.setStyle('white-space', '');
                                if (me.options.autoClearEmptyNode && utils.isEmptyObject(node.attrs)) {
                                    node.parentNode.removeChild(node, true)
                                }
                            }
                        }
                        val = node.getAttr('id');
                        if(val && /^_baidu_bookmark_/i.test(val)){
                            node.parentNode.removeChild(node)
                        }
                        break;
                    case 'p':
                        if (val = node.getAttr('align')) {
                            node.setAttr('align');
                            node.setStyle('text-align', val)
                        }
                        //trace:3431
//                        var cssStyle = node.getAttr('style');
//                        if (cssStyle) {
//                            cssStyle = cssStyle.replace(/(margin|padding)[^;]+/g, '');
//                            node.setAttr('style', cssStyle)
//
//                        }
                        //p標簽不允許嵌套
                        utils.each(node.children,function(n){
                            if(n.type == 'element' && n.tagName == 'p'){
                                var next = n.nextSibling();
                                node.parentNode.insertAfter(n,node);
                                var last = n;
                                while(next){
                                    var tmp = next.nextSibling();
                                    node.parentNode.insertAfter(next,last);
                                    last = next;
                                    next = tmp;
                                }
                                return false;
                            }
                        });
                        if (!node.firstChild()) {
                            node.innerHTML(browser.ie ? '&nbsp;' : '<br/>')
                        }
                        break;
                    case 'div':
                        if(node.getAttr('cdata_tag')){
                            break;
                        }
                        //針對代碼這里不處理插入代碼的div
                        val = node.getAttr('class');
                        if(val && /^line number\d+/.test(val)){
                            break;
                        }
                        if(!allowDivTransToP){
                            break;
                        }
                        var tmpNode, p = UE.uNode.createElement('p');
                        while (tmpNode = node.firstChild()) {
                            if (tmpNode.type == 'text' || !UE.dom.dtd.$block[tmpNode.tagName]) {
                                p.appendChild(tmpNode);
                            } else {
                                if (p.firstChild()) {
                                    node.parentNode.insertBefore(p, node);
                                    p = UE.uNode.createElement('p');
                                } else {
                                    node.parentNode.insertBefore(tmpNode, node);
                                }
                            }
                        }
                        if (p.firstChild()) {
                            node.parentNode.insertBefore(p, node);
                        }
                        node.parentNode.removeChild(node);
                        break;
                    case 'dl':
                        node.tagName = 'ul';
                        break;
                    case 'dt':
                    case 'dd':
                        node.tagName = 'li';
                        break;
                    case 'li':
                        var className = node.getAttr('class');
                        if (!className || !/list\-/.test(className)) {
                            node.setAttr()
                        }
                        var tmpNodes = node.getNodesByTagName('ol ul');
                        UE.utils.each(tmpNodes, function (n) {
                            node.parentNode.insertAfter(n, node);
                        });
                        break;
                    case 'td':
                    case 'th':
                    case 'caption':
                        if(!node.children || !node.children.length){
                            node.appendChild(browser.ie11below ? UE.uNode.createText(' ') : UE.uNode.createElement('br'))
                        }
                        break;
                    case 'table':
                        if(me.options.disabledTableInTable && tdParent(node)){
                            node.parentNode.insertBefore(UE.uNode.createText(node.innerText()),node);
                            node.parentNode.removeChild(node)
                        }
                }

            }
//            if(node.type == 'comment'){
//                node.parentNode.removeChild(node);
//            }
        })

    });

    //從編輯器出去的內容處理
    me.addOutputRule(function (root) {

        var val;
        root.traversal(function (node) {
            if (node.type == 'element') {

                if (me.options.autoClearEmptyNode && dtd.$inline[node.tagName] && !dtd.$empty[node.tagName] && (!node.attrs || utils.isEmptyObject(node.attrs))) {

                    if (!node.firstChild()) node.parentNode.removeChild(node);
                    else if (node.tagName == 'span' && (!node.attrs || utils.isEmptyObject(node.attrs))) {
                        node.parentNode.removeChild(node, true)
                    }
                    return;
                }
                switch (node.tagName) {
                    case 'div':
                        if (val = node.getAttr('cdata_tag')) {
                            node.tagName = val;
                            node.appendChild(UE.uNode.createText(node.getAttr('cdata_data')));
                            node.setAttr({cdata_tag: '', cdata_data: '','_ue_custom_node_':''});
                        }
                        break;
                    case 'a':
                        if (val = node.getAttr('_href')) {
                            node.setAttr({
                                'href': utils.html(val),
                                '_href': ''
                            })
                        }
                        break;
                        break;
                    case 'span':
                        val = node.getAttr('id');
                        if(val && /^_baidu_bookmark_/i.test(val)){
                            node.parentNode.removeChild(node)
                        }
                        break;
                    case 'img':
                        if (val = node.getAttr('_src')) {
                            node.setAttr({
                                'src': node.getAttr('_src'),
                                '_src': ''
                            })
                        }


                }
            }

        })


    });
};
