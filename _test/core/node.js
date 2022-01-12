module( 'core.node' );

test( 'createElement', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('div');
    equals(node.tagName,'div','空div ——tagname');
    equals(node.type,'element','空div ——節點類型');
    node = uNode.createElement('<div id="aa">sdfadf</div>');
    equals(node.tagName,'div','非空div——tagname');
    equals(node.children[0].data,'sdfadf','非空div——數據內容');
});

test( 'getNodeById', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><div id="bb"></div>sdfadf</div>');
    node = node.getNodeById('bb');
    equals(node.getAttr('id'),'bb','獲取標籤id');
    node = uNode.createElement('<div id="aa"><div id="bb"><div id="cc"></div> </div>sdfadf</div>');
    node = node.getNodeById('cc');
    equals(node.getAttr('id'),'cc','獲取標籤id');
});

test( 'getNodesByTagName', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><div id="bb"><div id="cc"></div> </div>sdfadf</div>');
    var nodelist = node.getNodesByTagName('div');
    equals(nodelist.length,2,'div節點列表長度');
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<div id="bb"><div id="cc"></div></div>sdfadf','innerHTML內容');
});

test( 'innerHTML', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa">sdfadf</div>');
    node.innerHTML('<div><div><div></div></div></div>');
    var nodelist =node.getNodesByTagName('div');
    equals(nodelist.length,3,'div節點列表長度');
    for(var i= 0,ci;ci=nodelist[i++];){
        ci.tagName = 'p';
    }
    equals(node.innerHTML(),'<p><p><p></p></p></p>','innerHTML內容');
    node = uNode.createElement('<div></div>');
    node.innerHTML('asdf');
    equals(node.innerHTML(),'asdf','innerHTML內容');
});

test( 'innerText', function() {
    var tmp = new UE.uNode.createElement('area');
    tmp.innerHTML('<p></p>');
    equals(tmp.innerText(),tmp,'標籤類型特殊');
    tmp = new UE.uNode.createText('');
    tmp.innerHTML('<p></p>');
    equals(tmp.innerText(),tmp,'對象類型不為element');
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa">sdfadf</div>');
    node.innerHTML('<p>dfsdfsdf<b>eee</b>sdf</p>');
    equals(node.innerText(),'dfsdfsdfeeesdf','獲取標籤中純文本');
    node.innerText('sdf');
    equals(node.innerHTML(),'sdf','設置文本節點');
});

test( 'getData', function() {
    var tmp = new UE.uNode.createElement('div');
    equals(tmp.getData(),'','element元素');
    tmp = new UE.uNode.createText('askdj');
    equals(tmp.getData(),"askdj",'其他類型');
});

test( 'appendChild && insertBefore', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa">sdfadf</div>');
    node.innerHTML('<p><td></td></p>');
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p>','補全html標籤');
    var tmp = uNode.createElement('div');
    node.appendChild(tmp);
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p><div></div>','appendChild');
    node.insertBefore(tmp,node.firstChild());
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<div></div><p><table><tbody><tr><td></td></tr></tbody></table></p>','insertBefore');
    node.appendChild(tmp);
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p><div></div>','appendChild');
});

test( 'replaceChild && setAttr', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa">sdfadf</div>');
    node.innerHTML('<p><table><tbody><tr><td></td></tr></tbody></table></p><div></div>');
    var tmp = uNode.createElement('p');
    tmp.setAttr({'class':'test','id':'aa'});
    node.insertBefore(tmp,node.lastChild());
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p><p class="test" id="aa"></p><div></div>','setAttr不為空');
    node.replaceChild(uNode.createElement('div'),tmp);
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p><div></div><div></div>','replaceChild');

    node.removeChild(node.lastChild(),true);
    tmp = uNode.createElement('p');
    tmp.setAttr();
    node.insertAfter(tmp,node.lastChild());
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p><div></div><p></p>','setAttr為空');
    node.innerHTML('<p><td></td></p>');
    tmp = uNode.createElement('div');
    node.appendChild(tmp);
    node.replaceChild(node.firstChild(),tmp);
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p>','replaceChild');
});

test( 'insertAfter', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa">sdfadf</div>');
    node.innerHTML('<p><td></td></p>');
    var tmp = uNode.createElement('div');
    node.appendChild(tmp);
    node.insertAfter(tmp,node.firstChild());
    equals(node.innerHTML().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p><div></div>','在第一個子節點後插入');
});

test( 'getStyle', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('div');
    node.innerHTML('<div style=""><div>');
    node = node.firstChild();
    equals(node.getStyle(''),'','空cssStyle');
    node.innerHTML('<div style="border:1px solid #ccc"><div>');
    node = node.firstChild();
    equals(node.getStyle('border'),'1px solid #ccc','有border，取border樣式');
    node.innerHTML('<div style="border:1px solid #ccc"><div>');
    node = node.firstChild();
    equals(node.getStyle('color'),'','無color樣式，取color樣式');
    node.innerHTML('<div style=" border:1px solid #ccc; background-color:#fff; color:#ccc"></div>');
    node = node.firstChild();
    equals(node.getStyle('color'),'#ccc','有2個樣式，取其一');
});

test( 'setStyle', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('div');
    node.innerHTML('<div style="border:1px solid #ccc;color:#ccc"><div>');
    node = node.firstChild();
    node.setStyle('border','2px solid #ccc');
    equals(node.getAttr('style'),'border:2px solid #ccc;color:#ccc','修改樣式中的一個');
    node.setStyle({
        'font':'12px',
        'background':'#ccc'
    });
    equals(node.getAttr('style'),'background:#ccc;font:12px;border:2px solid #ccc;color:#ccc','添加新樣式');
    node.setStyle({
        'font':'',
        'background':'',
        'border':'',
        'color':''
    });
    equals(node.getAttr('style'),undefined,'清空樣式');
    node.setStyle('border','<script>alert("")</script>');
    equals(node.getAttr('style'),"border:&lt;script&gt;alert(&quot;&quot;)&lt;/script&gt;;",'腳本');
    equals(node.toHtml(),'<div style=\"border:&lt;script&gt;alert(&quot;&quot;)&lt;/script&gt;;\"><div></div></div>','腳本轉html');
    node.innerHTML('<div>asdfasdf<b>sdf</b></div>');
    node.removeChild(node.firstChild(),true);
    equals(node.toHtml(),'<div style=\"border:&lt;script&gt;alert(&quot;&quot;)&lt;/script&gt;;\">asdfasdf<b>sdf</b></div>','移除子節點');
    node.innerHTML('<div style="border:1px solid #ccc;color:#ccc"></div>');
    node.firstChild().setStyle('border');
    equals(node.firstChild().toHtml(),'<div style="color:#ccc"></div>','刪除分號');
    node.innerHTML('<div style="border:1px solid #ccc;color:#ccc" dfasdfas="sdfsdf" sdfsdf="sdfsdfs" ></div>');
    equals(node.firstChild().toHtml(),'<div style="border:1px solid #ccc;color:#ccc" dfasdfas="sdfsdf" sdfsdf="sdfsdfs"></div>');

    node.innerHTML('<div style=" border:1px "></div>');
    node.firstChild().setStyle('border');

    equals(node.firstChild().toHtml(),'<div></div>');
    node.innerHTML('<div style=" border:1px solid #ccc; background-color:#fff; color:#ccc"></div>');
    node.firstChild().setStyle('border');
    equals(node.firstChild().toHtml(),'<div style="background-color:#fff; color:#ccc"></div>');
    node.firstChild().setStyle('color');
    equals(node.firstChild().toHtml(),'<div style="background-color:#fff;"></div>');
    node.firstChild().setStyle('background-color');
    equals(node.firstChild().toHtml(),'<div></div>');
});

test( 'getIndex', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('div');
    node.innerHTML('<div>asdfasdf<b>sdf</b></div>')
    node.removeChild(node.firstChild(),true);
    var tmp = new UE.uNode.createElement('div');
    node.appendChild(tmp);
    equals(tmp.getIndex(),2,'節點索引');
});

test( 'traversal', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('div');
    node.innerHTML('<div>asdfasdf<b>sdf</b></div>')
    var count = 0;
    node.traversal(function(node){
        count++;
    });
    equals(count,4);
    count = 0;
    node.traversal(function(node){
        if(node.type == 'text'){
            count++
        }
    });
    equals(count,2);
    node.traversal(function(node){
        if(node.type == 'text'){

            node.parentNode.removeChild(node)
        }
    });
    equals(node.toHtml(),'<div><div><b></b></div></div>');
    node.innerHTML('<div>asdfasdf<b>sdf</b></div>');
    node.traversal(function(node){
        if(node.type == 'text'){
            var span = uNode.createElement('span');
            node.parentNode.insertBefore(span,node);
            span.appendChild(node);
        }
    });
    equals(node.toHtml(),'<div><div><span>asdfasdf</span><b><span>sdf</span></b></div></div>');
});