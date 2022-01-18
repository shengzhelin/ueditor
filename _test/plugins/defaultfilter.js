/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 13-2-28
 * Time: 下午3:20
 * To change this template use File | Settings | File Templates.
 */
module( 'plugins.defaultfilter' );

//test('',function(){
//   stop();
//});
test( '對代碼的行號不處理', function () {
    var editor = te.obj[0];
    editor.setContent( '<td class="gutter"><div class="line number1 index0 alt2">1</div><div class="line number2 index1 alt1">2</div></td>');
//    var br = ua.browser.ie?'':'<br>';
    var html = '<table><tbody><tr><td class=\"gutter\"><div class=\"line number1 index0 alt2\">1</div><div class=\"line number2 index1 alt1\">2</div></td></tr></tbody></table>';
    ua.checkSameHtml(editor.body.innerHTML,html,'table補全,對代碼的行號不處理')
} );
test( '空td,th,caption', function () {
    var editor = te.obj[0];
    editor.setContent( '<table><caption></caption><tbody><tr><th></th><th></th></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table>' );
    var br = ua.browser.ie&&ua.browser.ie<11?'':'<br>';
    var html = '<table><caption>'+br+'</caption><tbody><tr><th>'+br+'</th><th>'+br+'</th></tr><tr><td>'+br+'</td><td>'+br+'</td></tr><tr><td>'+br+'</td><td>'+br+'</td></tr></tbody></table>';
    ua.checkSameHtml(editor.body.innerHTML,html,'空td,th,caption,添加text')
} );
test( '轉換a標簽', function () {
    var editor = te.obj[0];
    editor.setContent( '<a href="http://elearning.baidu.com/url/RepositoryEntry/68616197" target="_blank">' );
    var br = ua.browser.ie?'&nbsp;':'<br>';
    var html = '<p><a href="http://elearning.baidu.com/url/RepositoryEntry/68616197" target="_blank" _href="http://elearning.baidu.com/url/RepositoryEntry/68616197"></a></p>';
    ua.checkSameHtml(html,editor.body.innerHTML,'轉換a標簽');
} );
test( '轉換img標簽', function () {
    var editor = te.obj[0];
    editor.setContent( '<img src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" width="270" height="129" style="border: 0px;" />' );
//    var html = '<p><img src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" width="270" height="129" style="border: 0px;" _src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" /></p>';
    equal(editor.body.getElementsByTagName('img')[0].getAttribute('_src'),"http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif");
} );
test( '刪span中的white-space標簽', function () {
    if(ua.browser.webkit){
        var editor = te.obj[0];
        editor.setContent( '<span style=" display: block; white-space: nowrap " >sadfsadf</span>' );
        var html = '<p><span style=" display: block; ">sadfsadf</span></p>';
        ua.checkSameHtml(html,editor.body.innerHTML,'刪span中的white-space標簽');
    }
} );
//TODO 1.2.6
//test( '刪p中的margin|padding標簽', function () {
//    var editor = te.obj[0];
//    editor.setContent( '<p style="margin-left: 1em; list-style: none;" >hello</p>' );
//    var html = '<p style="list-style: none;">hello</p>';
//    ua.checkSameHtml(html,editor.body.innerHTML,'刪p中的margin|padding標簽');
//} );
test( '給空p加br&&轉對齊樣式', function () {
    var editor = te.obj[0];
    editor.setContent( '<p align ="center" ></p>' );
    var br = ua.browser.ie?'&nbsp;':'<br>';
//    "<p style=\"text-align:center;list-style: none;\"><br></p>"
    var html = '<p style=\"text-align:center;\">'+br+'</p>';
    ua.checkSameHtml(editor.body.innerHTML,html, '給空p加br&&轉對齊樣式');
} );
test( '刪div', function () {
    var editor = te.obj[0];
    editor.setContent( '<div class="socore" ><div class="sooption" style="padding: 1px;" ><p>視頻</p></div></div>' );
    var html = '<p>視頻</p>';
    ua.checkSameHtml(html,editor.body.innerHTML,'刪div');
} );
test( 'allowDivTransToP--false 不轉div', function () {
    var div = document.body.appendChild(document.createElement('div'));
    div.id ='ue';
    var editor = UE.getEditor('ue',{allowDivTransToP:false});
    stop();
    editor.ready(function(){
        var html = '<div class="socore" ><div class="sooption" style="padding: 1px;" >視頻</div></div>';
        editor.setContent( html );
        var padding = (ua.browser.ie&&ua.browser.ie<9)?'PADDING-BOTTOM: 1px; PADDING-LEFT: 1px; PADDING-RIGHT: 1px; PADDING-TOP: 1px':'padding: 1px;';
        var html_a =  '<div class="socore" ><div class="sooption" style="'+padding+'" >視頻</div></div>';
        ua.checkSameHtml(html_a,editor.body.innerHTML,'不轉div');
        UE.delEditor('ue');
        start();
    });
} );
test( 'li', function () {
    var editor = te.obj[0];
    editor.setContent( '<li style="margin: 0px 0px 0px 6px;" ><a href="http://www.baidu.com/p/pistachio%E5%A4%A9?from=zhidao" class="user-name"  >天<i class="i-arrow-down"></i></a></li>' );
    var html = '<ul class=" list-paddingleft-2"><li><p><a href="http://www.baidu.com/p/pistachio%E5%A4%A9?from=zhidao" class="user-name" _href="http://www.baidu.com/p/pistachio%E5%A4%A9?from=zhidao">天<em class="i-arrow-down"></em></a></p></li></ul>';
    ua.checkSameHtml(html,editor.body.innerHTML,'li');
} );
//<li style="margin: 0px 0px 0px 6px;" ><a href="http://www.baidu.com/p/pistachio%E5%A4%A9?from=zhidao" class="user-name"  >pistachio天<i class="i-arrow-down"></i></a></li>
//TODO 現在在過濾機制里面去除無用的標簽
test( "getContent--去除無用的空標簽:autoClearEmptyNode==true", function() {
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor('ue',{autoClearEmptyNode:true,'autoFloatEnabled':false});
    //
    stop();
    editor.ready(function () {
        te.dom.push(div);
        editor.focus();
        var innerHTML = '<span><span></span><strong>xx</strong><em>em</em><em></em></span><div>xxxx</div>';
        editor.setContent(innerHTML);
        editor.execCommand('source');
        setTimeout(function () {
            editor.execCommand('source');
            setTimeout(function () {
                equal(editor.getContent(), '<p><strong>xx</strong><em>em</em></p><p>xxxx</p>', "span style空，套空的em和不空的em");
                //style="color:#c4bd97;"
                innerHTML = '<span style="color:#c4bd97"><span></span><strong>xx</strong><em>em</em><em></em></span>';
                editor.setContent(innerHTML);
                if (ua.browser.ie>8) {
                    ua.checkSameHtml(editor.getContent().toLowerCase(), '<p><span style="color: rgb(196, 189, 151);" ><strong>xx</strong><em>em</em></span></p>', "span style不空，套空的em和不空的em");
                }
                else {
                    ua.checkSameHtml(editor.getContent().toLowerCase(),'<p><span style="color:#c4bd97" ><strong>xx</strong><em>em</em></span></p>', "span style不空，套空的em和不空的em");
                }
                innerHTML = '<span style="color:#c4bd97"></span><strong>xx</strong><em>em</em><em></em>';
                editor.setContent(innerHTML);
                /*inline標簽上只要有屬性就不清理*/
                if (ua.browser.ie >8) {
                    ua.checkSameHtml(editor.getContent().toLowerCase(), '<p><span style="color: rgb(196, 189, 151);" ></span><strong>xx</strong><em>em</em></p>', "span 有style但內容為空");
                }
                else {
                    ua.checkSameHtml(editor.getContent().toLowerCase(), '<p><span style="color:#c4bd97" ></span><strong>xx</strong><em>em</em></p>', "span 有style但內容為空");
                }
                innerHTML = '<span style="color:#c4bd97">asdf<strong>xx</strong><em>em</em><em></em></span>';
                editor.setContent(innerHTML);
                if (ua.browser.ie >8) {
                    ua.checkSameHtml(editor.getContent().toLowerCase(), '<p><span style="color: rgb(196, 189, 151);" >asdf<strong>xx</strong><em>em</em></span></p>', "span 有style內容不空");
                }
                else {
                    ua.checkSameHtml(editor.getContent().toLowerCase(), '<p><span style="color:#c4bd97" >asdf<strong>xx</strong><em>em</em></span></p>', "span 有style內容不空");
                }
                innerHTML = '<a href="http://www.baidu.com"></a><a>a</a><strong>xx</strong><em>em</em><em></em>';
                editor.setContent(innerHTML);
                ua.checkSameHtml(editor.getContent(), '<p><a href="http://www.baidu.com" ></a><a>a</a><strong>xx</strong><em>em</em></p>', "a 有href但內容為空,不過濾a標簽");
                setTimeout(function () {
                    UE.delEditor('ue');
                    start()
                },300);
            }, 50);
        }, 50);
    });
});

//editor.options.autoClearEmptyNode
test("getContent--不去除無用的空標簽:autoClearEmptyNode==false", function() {
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor('ue',{autoClearEmptyNode:false,'autoFloatEnabled':false});
    stop();
    editor.ready(function () {
        te.dom.push(div);
        editor.focus();
        var innerHTML = '<span><span></span><strong>xx</strong><em>em</em><em></em><strong></strong></span>';
        editor.setContent(innerHTML);
        equal(editor.getContent().toLowerCase(), '<p><span><span></span><strong>xx</strong><em>em</em><em></em><strong></strong></span></p>', "span style空，套空的em和不空的em");
        innerHTML = '<span style="color:#c4bd97"></span><strong>xx</strong><em>em</em><em></em><strong></strong>';
        editor.setContent(innerHTML);
        ua.manualDeleteFillData(editor.body);
        if (ua.browser.ie >8) {
            ua.checkSameHtml(editor.getContent().toLowerCase(), '<p><span style="color: rgb(196, 189, 151);" ></span><strong>xx</strong><em>em</em><em></em><strong></strong></p>', "span 有style但內容為空");
        }
        else {
            ua.checkSameHtml(editor.getContent().toLowerCase(), '<p><span style="color:#c4bd97" ></span><strong>xx</strong><em>em</em><em></em><strong></strong></p>', "span 有style但內容為空");
        }
        setTimeout(function () {
            UE.delEditor('ue');
            start()
        }, 500);
    });
});

test("getContent--轉換空格，nbsp與空格相間顯示", function() {
    var editor = te.obj[0];
    editor.focus();
    //策略改變,原nbsp不做處理,類似:'<p> d </p>'中的空格會被過濾
    var innerHTML = '<div>x  x   x &nbsp;x&nbsp;&nbsp;  &nbsp;</div>';
    editor.setContent(innerHTML);
    equal(editor.getContent(), '<p>x &nbsp;x &nbsp; x &nbsp;x&nbsp;&nbsp; &nbsp;&nbsp;</p>', "轉換空格，nbsp與空格相間顯示");
});
test( '轉換script標簽', function () {
    var editor = te.obj[0];
    var br = ua.browser.ie?'<p>&nbsp;</p>':('<p><br></p>');
    editor.setContent( '<script type="text/javascript">ueditor</script>' );
    var html = br+'<div type="text/javascript" cdata_tag=\"script\"  cdata_data=\"ueditor\" _ue_custom_node_=\"true\"></div>';
    ua.checkSameHtml(editor.body.innerHTML,html,'轉換script標簽');
} );
test( 'trace 3698 1.3.0 版本修覆: script(style)標簽里面的內容不轉碼', function () {
    var editor = te.obj[0];
    editor.setContent('<script type="text/plain" id="myEditor" name="myEditor">var ue=UE.getEditor("editor");</script>');
    equal(editor.document.getElementById('myEditor').innerHTML,'','內容不保留');//1.3.6 針對ie下標簽不能隱藏問題的修覆
    // todo 1.3.0 trace 3698
    editor.setContent('<style type="text/css" id="myEditor">        .clear {            clear: both;        }     </style>');
    var br = ua.browser.ie?'<p>&nbsp;</p>':('<p><br></p>');
    ua.checkSameHtml(editor.getContent(),br+'<style type="text/css" id="myEditor">.clear {            clear: both;        }</style>','內容不轉碼');
} );
test( '轉換style標簽:style data不為空', function () {
    var editor = te.obj[0];
    editor.setContent( '<style type="text/css">sdf</style>' );
    var br = ua.browser.ie?'<p>&nbsp;</p>':('<p><br></p>');
    var html = br+'<div type="text/css" cdata_tag="style" cdata_data=\"sdf\" _ue_custom_node_=\"true\"></div>';
    ua.checkSameHtml(editor.body.innerHTML,html,'轉換script標簽');
} );
test( '轉換style標簽:style data不空', function () {
    var editor = te.obj[0];
    editor.setContent( '<style type="text/css"></style>' );
    var br = ua.browser.ie?'<p>&nbsp;</p>':('<p><br></p>');

    var html = br+'<div type="text/css" cdata_tag="style" _ue_custom_node_=\"true\"></div>';
    ua.checkSameHtml(editor.body.innerHTML,html,'轉換script標簽');
} );
test( 'div出編輯器轉換', function () {
    var editor = te.obj[0];
    var str =  '<script type="text/javascript">ueditor</script>' ;
    var html = '<div type="text/javascript" cdata_tag=\"script\" >ueditor</div>';
    editor.body.innerHTML = html;
    editor.execCommand( 'source' );
    stop();
    setTimeout(function(){
        equal(editor.getContent(),str,'div出編輯器轉換');
        start();
    },20);
} );
test( 'img出編輯器轉換', function () {
    var editor = te.obj[0];
    var str = ua.browser.ie? '<p><img src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" width="270" height="129" style="border: 0px currentColor;"/></p>':'<p><img src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" width="270" height="129" style="border: 0px"/></p>' ;
    if(ua.browser.ie==8)
        str ='<p><img src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" width="270" height="129" style=\"BORDER-BOTTOM: 0px; BORDER-LEFT: 0px; BORDER-TOP: 0px; BORDER-RIGHT: 0px\"/></p>';
    if(ua.browser.ie==11)
        str = '<p><img src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" width="270" height="129" style="border: 0px currentColor;border-image: none;"/></p>';
    var html = '<p><img src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" width="270" height="129" style="border: 0px;" _src="http://www.baidu.com/img/shouye_b5486898c692066bd2cbaeda86d74448.gif" /></p>';
    editor.body.innerHTML = html;
    editor.execCommand( 'source' );
    stop();
    setTimeout(function(){
        ua.checkSameHtml(editor.getContent(),str,'img出編輯器轉換');
        start();
    },20);
} );
//ue.setContent('<a href="http://elearning.baidu.com/url/RepositoryEntry/68616197" target="_blank">');
