module( 'core.filternode' );

test( '過濾掉整個標籤', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf<b>sdf</b></p><i>sdf</i></div>');
    UE.filterNode(node,{
        'p':{},
        'b':'-'
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p>sdf</p>sdf</div>','保留p，過濾b');

    node.innerHTML('<p><p>sdfs</p><br/><br/><br/><br/></p>');
    UE.filterNode(node,{
        'p':{},
        'br':'-'
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p><p>sdfs</p></p></div>','保留p，過濾br');
});

test( '過濾標籤全部屬性', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf<b>sdf</b></p><i>sdf</i></div>');
    node.innerHTML('<div id="aa"><p style="color:#ccc"><p>sdfssdfs</p></p>sdfasdf</div>');
    UE.filterNode(node,{
        'p':{$:{}}
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p><p>sdfssdfs</p></p>sdfasdf</div>','過濾p全部屬性');

    node.innerHTML('<h6>asd<b>lk</b><i>fj</i></h6>');
    UE.filterNode(node,{
        'h6':function(node){
            node.tagName = 'p';
            node.setAttr();
        },
        '-':'b i',
        'p':{}
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p>asd</p></div>','同時過濾多個標籤屬性');
});

test( '過濾標籤部分屬性', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf<b>sdf</b></p><i>sdf</i></div>');
    node.innerHTML('<p style="color:#ccc;border:1px solid #ccc;"><table><tbody><tr><td></td></tr></tbody></table></p><div>sdfasdf</div>');
    UE.filterNode(node,{
        'p':{$:{
            style:['color']
        }},
        'td':{}
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p style="color:#ccc"><td></td></p>sdfasdf</div>','保留p的color屬性');

    node.innerHTML('<p style="text-indent:28px;line-height:200%;margin-top:62px;"><strong>sdfs</strong><span style="font-family:宋體">sdfs</span></p>');
    UE.filterNode(node,{
        'p':{$:{
            style:['line-height']
        }},
        'span':{$:{}},
        'strong':'-'
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p style="line-height:200%"><span>sdfs</span></p></div>','過濾span全部屬性，保留p部分屬性，過濾strong標籤');

    node.innerHTML('<p><a></a><u class="ad" id="underline">sdfs<sub class="ab">sdfs</sub><i>sdfs</i></u><i>sdfs</i></p>');
    UE.filterNode(node,{
        'p':{},
        'u':{$:{
            'class':['ad']
        }},
        'sub':{$:{}},
        'i':'-'
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p><u class="ad">sdfs<sub>sdfs</sub></u></p></div>','過濾sub全部屬性，保留u部分屬性，過濾i標籤');
});

test( '標籤替換過濾', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf<b>sdf</b></p><i>sdf</i></div>');
    node.innerHTML('<p style="color:#ccc;border:1px solid #ccc;"><table><tbody><tr><td>sdfs</td><td>sdfs</td></tr></tbody></table></p><div>sdfasdf</div>');
    UE.filterNode(node,{
        'p':{$:{
            style:['color']
        }},
        'tr':function(node){
            node.tagName = 'p';
            node.setAttr();
        },
        'td':function(node){
            node.parentNode.removeChild(node,true)
        }
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p style="color:#ccc"><p>sdfssdfs</p></p>sdfasdf</div>','tr替換為p，過濾掉td');

    node.innerHTML('<img src="http://img.baidu.com/hi/jx2/j_0020.gif" height="10px"/><table><caption>aldkfj</caption><tbody><tr style="background-color: #ccc;"><th>adf</th></tr><tr><td>lkj</td></tbody></table>');
    UE.filterNode(node,{
        'img':{$:{
            src:['']
        }},
        'table':{},
        'tbody':{},
        'tr':{$:{}},
        'td':{$:{}},
        'th':function(node){
            var txt = !!node.innerText();
            if(txt){
                node.parentNode.insertAfter(UE.uNode.createText(' &nbsp; &nbsp;'),node);
            }
            node.parentNode.removeChild(node,node.innerText())
        }
    });
    ua.checkSameHtml(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><img src="http://img.baidu.com/hi/jx2/j_0020.gif" /><table>aldkfj<tbody><tr>adf &nbsp; &nbsp;</tr><tr><td>lkj</td></tr></tbody></table></div>','th按文本內容替換，保留img部分屬性');
});

test( '保留標籤全部屬性', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf<b>sdf</b></p><i>sdf</i></div>');
    node.innerHTML('<ol><li><em>sdf</em></li><ul class=" list-paddingleft-2"><li>a</li><li>b</li><li>c</ul><li>jkl</ol>');
    UE.filterNode(node,{
        'ol':{},
        'ul':{$:{}},
        'li':{}
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><ol><li>sdf</li><ul><li>a</li><li>b</li><li>c</li></ul><li>jkl</li></ol></div>','保留ol、li全部屬性，過濾ul全部屬性');
});

test( '過濾規則為空', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf<b>sdf</b></p><i>sdf</i></div>');
    node.innerHTML('<p style="color:#ccc;border:1px solid #ccc;"><table><tbody><tr><td><h1>asd</h1></td></tr></tbody></table></p><div>sdfasdf</div>');
    UE.filterNode(node,{});
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p style="color:#ccc;border:1px solid #ccc;"><table><tbody><tr><td><h1>asd</h1></td></tr></tbody></table></p><div>sdfasdf</div></div>','過濾規則為空');
});

test( '特殊規則過濾', function() {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf</p><i>sdf</i></div>');
    node.innerHTML('<script></script>');
    UE.filterNode(node,{
        'b':'-'
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"></div>','過濾規則中包含html中不存在的標籤');

    node.innerHTML('<p><!--asdfjasldkfjasldkfj--></p>');
    UE.filterNode(node,{
        'p':{}
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa"><p></p></div>','innerHTML中包含注釋');
});

test( '只有white list--濾除屬性', function () {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf</p><i>sdf</i></div>');
    node.innerHTML('<table></table>hellotable<!--hello--><p><div class="div_class" id="div_id" name="div_name">hellodiv</div></p><span style="color:red;font-size:12px" >hellospan</span>');
    UE.filterNode(node,{
        div:{
            $:{
                id:{},
                'class':{}
            }
        },
        table:{},
        span:{}
    });
    ua.checkSameHtml(node.toHtml().replace(/[ ]+>/g,'>'), '<div id="aa"><table></table>hellotable<div id="div_id" class="div_class">hellodiv</div><span style="color:red;font-size:12px" >hellospan</span></div>', '濾除屬性');
} );

test( '只有black list', function () {
    var uNode = UE.uNode;
    var node = uNode.createElement('<div id="aa"><p>sdf</p><i>sdf</i></div>');
    node.innerHTML('<style  type="text/css"></style><script type="text/javascript"></script><!--comment--><div><script type="text/javascript"></script><span>hello1</span>hello2</div>');
    UE.filterNode(node,{
        span:'-',
        em:'-',
        '#comment':'-',
        script:'-',
        style:'-'
    });
    equals(node.toHtml().replace(/[ ]+>/g,'>'),'<div id="aa">hello2</div>','過濾規則中包含html中不存在的標籤');
} );