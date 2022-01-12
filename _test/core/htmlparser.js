/**
 * Created with JetBrains PhpStorm.
 * User: luqiong
 * Date: 13-3-14
 * Time: 下午2:31
 * To change this template use File | Settings | File Templates.
 */
module( 'core.htmlparser' );

test( '普通標籤處理', function() {
    var root = UE.htmlparser('<i>sdfsdfsdfsf</i>');
    equals(root.toHtml(),'<i>sdfsdfsdfsf</i>','單個普通標籤');
    root = UE.htmlparser('<i>sdf<b>sdfsdsd</b>fsdfsf</i>');
    equals(root.toHtml(),'<i>sdf<b>sdfsdsd</b>fsdfsf</i>','多個普通標籤');
    root = UE.htmlparser('<i dsf="sdf" sdf="wewe" readonly >sdf</i>');
    ua.checkSameHtml(root.toHtml(),'<i dsf="sdf" sdf="wewe" readonly=\"\" >sdf</i>','添加屬性的標籤');
    root = UE.htmlparser('<img src="file:///C:/DOCUME~1/DONGYA~1/LOCALS~1/Temp/msohtmlclip1/01/clip_image002.jpg" width="553" height="275" />');
    ua.checkSameHtml(root.toHtml(),'<img src="file:///C:/DOCUME~1/DONGYA~1/LOCALS~1/Temp/msohtmlclip1/01/clip_image002.jpg" width="553" height="275" />','img標籤');
});

test( '特殊標籤處理', function() {
    var root = UE.htmlparser('<i dsf="sdf" sdf="wewe" readonly >sd<!--fasdf-->f</i>');
    ua.checkSameHtml(root.toHtml(),'<i dsf="sdf" sdf="wewe" readonly=\"\" >sd<!--fasdf-->f</i>','包含注釋');
    root = UE.htmlparser('<script type="text/javascript" charset="utf-8" src="editor_api.js"></script>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<script type="text/javascript" charset="utf-8" src="editor_api.js"></script>','script標籤');
    root = UE.htmlparser('<table width="960"><tbody><tr><td width="939" valign="top"><br></td></tr></tbody></table><p><br></p>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<table width="960"><tbody><tr><td width="939" valign="top"><br/></td></tr></tbody></table><p><br/></p>','br標籤');
    root = UE.htmlparser('<li>sdfsdfsdf<li>sdfsdfsdfsdf');
    equals(root.toHtml(),'<ul><li>sdfsdfsdf</li><li>sdfsdfsdfsdf</li></ul>','以文本結束的html');
});

//test( '補全不完整table', function() {//TODO 1.2.6
//    var root = UE.htmlparser('<p><td></td></p>');
//    equals(root.toHtml(),'<p><table><tbody><tr><td></td></tr></tbody></table></p>','td完整，補全table');
//    root = UE.htmlparser('<p><td>sdfsdfsdf</p>');
//    equals(root.toHtml(),'<p><table><tbody><tr><td>sdfsdfsdf</td></tr></tbody></table></p>','td不完整，補全table');
//    root = UE.htmlparser('<td></td>' + '\n\r' + '<td></td>');
//    equals(root.toHtml(),'<table><tbody><tr><td></td><td></td></tr></tbody></table>','包含\n，補全table');
//    root = UE.htmlparser('<table>');
//    equals( root.toHtml().toLowerCase(), '<table></table>', '<table>--不補孩子' );
//    /*補parent*/
//    root = UE.htmlparser('<td>');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td></td></tr></tbody></table>', '<td>--補父親' );
//    /*補parent和child*/
//    root = UE.htmlparser('<tr>hello');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr>hello</tr></tbody></table>', '<tr>hello--補父親不補孩子' );
//
//    root = UE.htmlparser('<td>123');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td>123</td></tr></tbody></table>', '<td>123--文本放在table里' );
//
//    root = UE.htmlparser('123<td>');
//    equals( root.toHtml().toLowerCase(), '123<table><tbody><tr><td></td></tr></tbody></table>', '123<td>' );
//
//    root = UE.htmlparser('<tr><td>123');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td>123</td></tr></tbody></table>', '<tr><td>123' );
//
//    root = UE.htmlparser('<td>123<tr>');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td>123</td></tr><tr></tr></tbody></table>', '<td>123<tr>' );
//
//    /*補充為2個td*/
////    root = UE.htmlparser('<tr>123<td>');
////    equals( root.toHtml().toLowerCase(), '<table><tbody><tr></tr></tbody></table>123<table><tbody><tr><td></td></tr></tbody></table>', '<tr>123<td>--tr和td之間有文字' );//TODO 1.2.6
//
//    root = UE.htmlparser('<td><td>123');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td></td><td>123</td></tr></tbody></table>', '<td><td>123' );
//
//    root = UE.htmlparser('<td>123<td>');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td>123</td><td></td></tr></tbody></table>', '<td>123<td>' );
//
//    /*補2個table*/
////    root = UE.htmlparser('<td>123</td>132<tr>');
////    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td>123</td></tr></tbody></table>132<table><tbody><tr><td></td></tr></tbody></table>', '<td>123</td>132<tr>--補全2個table' );//TODO 1.2.6
//
//    /*開標籤、文本與閉標籤混合*/
////    root = UE.htmlparser('<tr>123</td>');
////    equals( root.toHtml().toLowerCase(), '<table><tbody><tr></tr></tbody></table>123', '<tr>123</td>--tr和td之間有文字' );//TODO 1.2.6
//
////    root = UE.htmlparser('<tr></td>123');
////    equals( root.toHtml().toLowerCase(), '<table><tbody><tr></tr></tbody></table>123', '<tr></td>123--td閉標籤後面有文字' );//TODO 1.2.6
//
//    root = UE.htmlparser('123</tr><td>');
//    equals( root.toHtml().toLowerCase(), '123<table><tbody><tr><td></td></tr></tbody></table>', '123</tr><td>' );
//
//    root = UE.htmlparser('</tr><td>123');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td>123</td></tr></tbody></table>', '</tr><td>123' );
//
//    root = UE.htmlparser('</tr>123<td>');
//    equals( root.toHtml().toLowerCase(), '123<table><tbody><tr><td></td></tr></tbody></table>', '</tr>123<td>' );
//    /*閉標籤、文本與閉標籤混合*/
//    root = UE.htmlparser('</td>123</tr>');
//    equals( root.toHtml().toLowerCase(), '123', '</td>123</tr>' );
//
//    root = UE.htmlparser('</tr>123</td>');
//    equals( root.toHtml().toLowerCase(), '123', '</td>123</tr>' );
//
//    root = UE.htmlparser('</tr>123<tr>');
//    equals( root.toHtml().toLowerCase(), '123<table><tbody><tr><td></td></tr></tbody></table>', '</td>123</tr>', '</tr>123<tr>' );
//
//    /*補前面的標籤*/
//    root = UE.htmlparser('</td>123');
//    equals( root.toHtml().toLowerCase(), '123', '</td>123' );
//
//    root = UE.htmlparser('123</td>');
//    equals( root.toHtml().toLowerCase(), '123', '123</td>' );
//    /*補全tr前面的標籤*/
//    root = UE.htmlparser('123</tr>');
//    equals( root.toHtml().toLowerCase(), '123', '123</tr>--刪除tr前後的標籤，前面有文本' );
//    /*補全table前面的標籤*/
//    root = UE.htmlparser('123</table>');
//    equals( root.toHtml().toLowerCase(), '123', '123</table>--刪除table前後的標籤，前面有文本' );
//    /*覆雜結構*/
//    root = UE.htmlparser('<table><tr><td>123<tr>456');
//    equals( root.toHtml().toLowerCase(), '<table><tr><td>123</td></tr><tr><td>456</td></tr></table>', '<table><tr><td>123<tr>456' );
//
//    root = UE.htmlparser('<td><span>hello1</span>hello2</tbody>');
//    equals( root.toHtml().toLowerCase(), '<table><tbody><tr><td><span>hello1</span>hello2</td></tr></tbody></table>', '解析<td><span>hello1</span>hello2</tbody>' );
//
//    root = UE.htmlparser('<table><td><span>hello1</span>hello2</tbody>');
//    equals( root.toHtml().toLowerCase(), '<table><tr><td><span>hello1</span>hello2<table><tbody><tr><td></td></tr></tbody></table></td></tr></table>', '解析<table><td><span>hello1</span>hello2</tbody>' );
//
//    root = UE.htmlparser('<table><tr></td>123');
//    equals( root.toHtml().toLowerCase(), '<table><tr><td></td></tr></table>123', '<table><tr></td>123' );
//});

test( '補全不完整li', function() {
    var root = UE.htmlparser('<ol><li><em><u>sdf<li>sdfsdf</ol>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<ol><li><em><u>sdf</u></em></li><li>sdfsdf</li></ol>','補全u，em');
    root = UE.htmlparser('<ol><li><em>sdf</em></li><ul><li>a</li><li>b</li><li>c</ul><li>jkl</ol>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<ol><li><em>sdf</em></li><ul><li>a</li><li>b</li><li>c</li></ul><li>jkl</li></ol>','補全li');
    root = UE.htmlparser('<li>123');
    equals(root.toHtml().replace(/[ ]+>/g,'>'), '<ul><li>123</li></ul>', '<li>123--補全li的parent--ul，前面有文本' );
    /*補ul的child*/
    root = UE.htmlparser('<ul>123');
    equals(root.toHtml().replace(/[ ]+>/g,'>'), '<ul><li>123</li></ul>', '<ul>123--補全ul的child--li，前面有文本' );
    /*補li開始標籤*/
    root = UE.htmlparser('</li>123');
    equals(root.toHtml().replace(/[ ]+>/g,'>'), '123', '</li>123--刪掉標籤' );
});

test( '屬性引號問題', function() {
    var root = UE.htmlparser('<img width=200 height=200 />');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<img width="200" height="200"/>');
    root = UE.htmlparser("<img width='200' height='200' />");
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<img width="200" height="200"/>');
    root = UE.htmlparser('<img width="200" height="200" />');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<img width="200" height="200"/>');
});

test( '大小寫', function() {
    var root = UE.htmlparser('<p><TD></TD></p>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<p><table><tbody><tr><td></td></tr></tbody></table></p>');
    root = UE.htmlparser('<OL><LI><em><u>sdf<LI>sdfsdf</OL>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<ol><li><em><u>sdf</u></em></li><li>sdfsdf</li></ol>','補全u，em');
    root = UE.htmlparser('<IMG width=200 height=200 />');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<img width="200" height="200"/>');
});

test( '裸字', function() {
    var root = UE.htmlparser('sdfasdfasdf');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'sdfasdfasdf');
});

test( '只有結束標籤的情況', function() {
    var root = UE.htmlparser('<p>hello1</a></p><p>hello2</p>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<p>hello1</p><p>hello2</p>');
});

test( '開始標籤與後面文本的空格過濾，其他不過濾inline節點之間的空格，過濾block節點之間的空格', function () {
    /*inline節點之間的空格要留著*/
    var root = UE.htmlparser('<a href="www.baidu.com">baidu</a> <a> hello </a>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<a href="www.baidu.com">baidu</a> <a> hello </a>');
    root = UE.htmlparser('<span> <span> hello </span></span> <span> he llo2<span> hello </span> </span>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<span> <span> hello </span></span> <span> he llo2<span> hello </span> </span>' );
    /*block節點之間的空格不要留著     這個太糾結，不必了。會把ol拆開，後面的變成ul*/
//        html = '<ol>   <li> li_test </li> <li> li test2 </li> </ol> ';
//        node = serialize.parseHTML( html );
//        node = serialize.filter( node );
//        equal( serialize.toHTML( node ), '<ol><li>li_test&nbsp;</li><li>li&nbsp;test2&nbsp;</li></ol>&nbsp;' );
} );

/*特殊字符需要轉義*/
test( '文本包含特殊字符，如尖括號', function () {
    var root = UE.htmlparser('<span><td  hello</span>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<span>&lt;td &nbsp;hello</span>', '字符轉義' );
} );

test( 'br', function () {
    var root = UE.htmlparser('<br />');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<br/>', '對br不操作');
    root = UE.htmlparser('<br>');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<br/>', '補充br後面的斜杠');
} );

/*考察標籤之間嵌套關系*/
test( '覆雜標籤嵌套', function() {
    var root = UE.htmlparser('<span>hello1<p><img>hello2<div>hello3<p>hello4');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<span>hello1<p><img/>hello2<div>hello3<p>hello4</p></div></p></span>');
} );

test( 'trace 1727:過濾超鏈接後面的空格', function () {
    var root = UE.htmlparser('<a href="www.baidu.com">baidu</a>  ddd');
    equals(root.toHtml().replace(/[ ]+>/g,'>'),'<a href="www.baidu.com">baidu</a> &nbsp;ddd','過濾超鏈接後面的空格');
} );

//test( '轉換img標籤', function () {
//    var root = UE.htmlparser('<img src="file:///C:/DOCUME~1/DONGYA~1/LOCALS~1/Temp/msohtmlclip1/01/clip_image002.jpg" width="553" height="275" />');
//    var spa=ua.browser.ie==6?' orgSrc="'+te.obj[1].options.UEDITOR_HOME_URL+'themes/default/images/spacer.gif"':'';
//    equals(root.toHtml().replace(/[ ]+>/g,'>'), '<img src="'+te.obj[1].options.UEDITOR_HOME_URL+'themes/default/images/spacer.gif" width="553" height="275" word_img="file:///C:/DOCUME~1/DONGYA~1/LOCALS~1/Temp/msohtmlclip1/01/clip_image002.jpg" style="background:url('+te.obj[1].options.UEDITOR_HOME_URL+'lang/'+te.obj[1].options.lang+'/images/localimage.png) no-repeat center center;border:1px solid #ddd"'+spa+' />' , '轉換img標籤');
//} );