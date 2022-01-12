module( 'core.domUtils' );

test( 'isBoundaryNode--node是firstChild',function(){

    if(ua.browser.ie){
//        var body =  te.dom[1].contentDocument.appendChild(document.createElement('body'));
//        var div = body.appendChild(document.createElement('div'));
        var div = te.dom[2];
    }else{
        var div = te.dom[1].contentWindow.document.firstChild.lastChild.appendChild(document.createElement('div'));
    }
    div.innerHTML = "<span>sss</span>aaa<p>ppp</p>";
    var node = div.firstChild.nextSibling;
    equal( domUtils.isBoundaryNode(node, "firstChild"), 0 );
    equal( domUtils.isBoundaryNode(node, "lastChild"), 0 );
    node = div.firstChild.firstChild;
    if(ua.browser.ie){
        equal( domUtils.isBoundaryNode(node, "firstChild"), 0 );
    }else{
        equal( domUtils.isBoundaryNode(node, "firstChild"), 1 );
    }
    equal( domUtils.isBoundaryNode(node, "lastChild"), 0 );
    node = div.firstChild.nextSibling.nextSibling;
    equal( domUtils.isBoundaryNode(node, "firstChild"), 0 );
    equal( domUtils.isBoundaryNode(node, "lastChild"), 1 );
} );

test( 'getPosition--A和B是同一個節點', function() {
    var div = te.dom[2];
    div.innerHTML = "<span>span</span><img  /><b>bbb</b>xxx";
    var span_text = div.firstChild.firstChild;
    var domUtils = te.obj[3];
    equal( domUtils.getPosition( span_text, span_text ), 0, 'identical node' );
} );


test( 'getPosition--A和B是兄弟節點', function() {
    var div = te.dom[2];
    div.innerHTML = "<span>span</span><img  /><b>bbb</b>xxx";
    var span_text = div.firstChild.firstChild;
    var div_text = div.lastChild;
    var domUtils = te.obj[3];
    /*span_text在div_text前面*/
    equal( domUtils.getPosition( span_text, div_text ), domUtils.POSITION_PRECEDING, 'preceding node' );
    /*div_text在span_text後面*/
    equal( domUtils.getPosition( div_text, span_text ), domUtils.POSITION_FOLLOWING, 'following node' );
} );


test( 'getPosition--A是B的祖先', function() {
    var div = te.dom[2];
    div.innerHTML = "<span>span</span><img  /><b>bbb</b>xxx";
    var span_text = div.firstChild.firstChild;
    var domUtils = te.obj[3];
    /*A是B的祖先*/
    equal( domUtils.getPosition( div, span_text ), domUtils.POSITION_CONTAINS + domUtils.POSITION_PRECEDING, 'preceding node' );
    /*A是B的子孫*/
    equal( domUtils.getPosition( span_text, div ), domUtils.POSITION_IS_CONTAINED + domUtils.POSITION_FOLLOWING, 'following node' );
} );

test( 'getPosition--A和B在不同dom樹上', function() {
    stop();
    expect( 1 );
    var div = te.dom[2];
    div.innerHTML = "<span>span</span><img  /><b>bbb</b>xxx";
    var iframe = te.dom[1];
    setTimeout( function() {
        var frame_doc = iframe.contentWindow.document || iframe.contentDocument;
        var frame_div = frame_doc.createElement( 'div' );
        frame_doc.body.appendChild( frame_div );
        var domUtils = te.obj[3];
        /*A和B在不同dom樹上*/
        equal( domUtils.getPosition( div, frame_div ) & 1, 1, 'A和B不在同一個dom樹上' );
        start();
    }, 50 );

} );

test( 'getNodeIndex', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<strong>ddddd</strong><!----><!--hhhhh--><span></span><b>xxxxx</b><p id="p"><br /><img /><table id="table"><tr><td>dddd</td></tr></table></p>';
    var comment = div.firstChild.nextSibling.nextSibling;
    equal( domUtils.getNodeIndex( comment ), 2, 'check commnet index' );
    var td_text = document.getElementById( 'table' ).firstChild.firstChild.firstChild;
    equal( domUtils.getNodeIndex( td_text ), 0, 'check textNode index' );
    equal( domUtils.getNodeIndex( div.firstChild ), 0, 'check strong label index' );
    equal( domUtils.getNodeIndex( (document.getElementById( 'p' )) ), 5, 'check p label index' );
} );

test( 'findParent--body', function() {
    var domUtils = te.obj[3];
    equal( domUtils.findParent( document.body ), null, 'find parent for body' );
} );

/*找符合條件的上一個節點，如果條件為空則找父節點*/
test( 'findParent--tester為空', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<strong>ddddd</strong><!----><!--hhhhh--><span id="span">span</span><b>xxxxx</b><p id="p"><br /><img /><table id="table"><tr><td>dddd</td></tr></table></p>';
    var span_text = document.getElementById( 'span' ).firstChild;
    same( domUtils.findParent( span_text ), span_text.parentNode, 'find parent' );
} );

test( 'findParent--tester不為空', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<strong>ddddd</strong><!----><!--hhhhh--><span id="span">span</span><b>xxxxx</b><p id="p"><br /><img /><table id="table"><tr><td>dddd</td></tr></table></p>';
    var span_text = document.getElementById( 'span' ).firstChild;
    var div1 = domUtils.findParent( span_text, function( node ) {
        if ( node.id == "test" )
            return true;
        return false;
    } );
    same( div1, div, 'find parent' );
} );


/*不考慮includeSelf的時候取body的parent的情況*/
test( 'findParentByTagName--body', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    same( domUtils.findParentByTagName( document.body, 'body' ), null, 'parent is self' );
} );


test( 'findParentByTagName--tagName為字符串', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<strong>ddddd</strong><!----><!--hhhhh--><span id="span">span</span><b>xxxxx</b><p id="p"><br /><img /><table id="table"><tr><td>dddd</td></tr></table></p>';
    var br = document.getElementById( 'p' ).firstChild;
    same( domUtils.findParentByTagName( br, 'div' ), div, 'tagName為字符串' );
    same( domUtils.findParentByTagName( br, 'em' ), null, 'tagName為字符串返回null' );
} );

test( 'findParentByTagName--tagName為字符串數組', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<strong>ddddd</strong><!----><!--hhhhh--><span id="span">span</span><b>xxxxx</b><p id="p"><br /><img /><table id="table"><tr><td>dddd</td></tr></table></p>';
    var br = document.getElementById( 'p' ).firstChild;
    var tagName = ['em','p','div'];
    same( domUtils.findParentByTagName( br, tagName ), document.getElementById( 'p' ), 'tagName為字符串數組，找出第一個符合條件的父節點' );
} );


test( 'findParentByTagName--文本節點', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<strong>ddddd</strong><!----><!--hhhhh--><span id="span">span</span><b>xxxxx</b><p id="p"><br /><img /><table id="table"><tr><td>dddd</td></tr></table></p>';
    var span_text = document.getElementById( 'span' ).firstChild;
    var tagName = ['em','p','div'];
    same( domUtils.findParentByTagName( span_text, tagName ), div, '文本節點' );
} );

test( 'findParents', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<strong>ddddd</strong><!----><!--hhhhh--><span id="span">span</span><b>xxxxx</b><p id="p"><br /><img /><table id="table"><tr><td>dddd</td></tr></table></p>';
    var span_text = document.getElementById( 'span' ).firstChild;
    /*includeSelf*/
    var parents = domUtils.findParents( span_text, true );
    equal( parents.length, 4, 'check parent count' );
    same( parents[0], document.body, 'first  parent is body' );
    same( parents[1], div, 'second parent is div' );
    same( parents[2], span_text.parentNode, 'third parent is span' );
    same( parents[3], span_text, 'last parent is self' );
    /*不逆序存放祖先節點,closerFirst=false*/
    parents = domUtils.findParents( span_text, false, null, true );
    equal( parents.length, 3, 'check parent count' );
    same( parents[0], span_text.parentNode, 'first parent is span' );
    same( parents[1], div, 'second parent is div' );
    same( parents[2], document.body, 'last parent is body' );
} );


test( 'findParents--tester', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<div><p id="p"><br /><img id="img" /><table id="table"><tr><td>dddd</td></tr></table></p></div>';
    var img = document.getElementById( 'img' );
    var parents = domUtils.findParents( img, false, function( node ) {
        if ( node.tagName.toLowerCase() == 'div' || node.tagName.toLowerCase() == 'body' )
            return false;
        return true;
    } );
    equal( parents.length, 1, 'check parent count' );
    same( parents[0], div.firstChild.firstChild, 'first  parent is p' );
} );

test( 'insertAfter', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    var textNode = document.createTextNode( 'text' );
    domUtils.insertAfter( div, textNode );
    te.dom.push( textNode );
    equal( textNode, div.nextSibling, 'insertAfter' );
} );

test( 'remove--not keep children', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = "<p>xxx<span><em>xxxx</em>xxxx</span></p><div>xxxx</div>";
    var text = div.firstChild.firstChild;
    var p = div.firstChild;
    /*刪除文本節點*/
    var node = domUtils.remove( text );
    equal( ua.getChildHTML( div ), '<p><span><em>xxxx</em>xxxx</span></p><div>xxxx</div>' );
    same( text, node, 'check removed textNode' );
    /*刪除有孩子的節點*/
    node = domUtils.remove( p );
    equal( ua.getChildHTML( div ), '<div>xxxx</div>' );
    same( node, p, 'check removed p' );
} );

test( 'remove-- keep children', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<p id="p">xxx<span><em>xxxx</em>xxxx</span><img /></p><div>xxxx</div>';
    var text = div.firstChild.firstChild;
    var p = div.firstChild;
    /*刪除文本節點*/
    var node = domUtils.remove( text, true );
    equal( ua.getChildHTML( div ), '<p id="p"><span><em>xxxx</em>xxxx</span><img></p><div>xxxx</div>' );
    same( text, node, 'check removed textNode' );
    /*刪除有孩子的節點*/
    node = domUtils.remove( p, true );
    equal( ua.getChildHTML( div ), '<span><em>xxxx</em>xxxx</span><img><div>xxxx</div>' );
    same( node.id, p.id, 'check removed p' );
} );

test( 'getNextDomNode--沒有filter', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<p id="p">p_text<span><em>xxxx</em>xxxx</span><img /></p><div>xxxx</div>';
    var p = div.firstChild;
    /*直接查找兄弟節點*/
    same( domUtils.getNextDomNode( p ), div.lastChild, '後兄弟節點' );
//    same( domUtils.getPreviousDomNode( divChild ), p, '前一個兄弟節點' );
    /*startFromChild=true，查找孩子結點*/
    equal( domUtils.getNextDomNode( p, true ).data, 'p_text', 'text node' );
//    equal( domUtils.getPreviousDomNode( p, true ), p.lastChild, 'text node' );
} );


test( 'getNextDomNode--有filter', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<div id="p"><span><em>xxxx</em>xxxx</span><p>xx</p><img /></div><div>xxxx</div>';
    document.body.insertBefore( document.createElement( 'span' ), div );
    var span = div.firstChild.firstChild;
    var filter = function( node ) {
        if ( $( node ).css( 'display' ) == 'block' )
            return false;
        return true;
    };
    same( domUtils.getNextDomNode( span, false, filter ), div.firstChild.lastChild, '找到第一個不為block元素的兄弟節點' );
//    same( domUtils.getPreviousDomNode( div, true, filter ), div.previousSibling, '孩子中沒有block元素，則找父親的previousSibling節點' );
    te.obj.push( div.previousSibling );
} );
test( 'getNextDomNode-沒有兄弟或孩子', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    div.innerHTML = '<p id="p">p_text<span><em>xxxx</em>xxxx</span><img /></p><div>xxxx</div>';
    var p = div.firstChild;
    /*直接查找兄弟節點*/
//    same( domUtils.getPreviousDomNode( p ), div.previousSibling, '前面木有兄弟' );
    same( domUtils.getNextDomNode( div.lastChild ), div.nextSibling, '後面木有兄弟' );
} );

test( 'isBookmarkNode', function() {
    var domUtils = te.obj[3];
    var div = te.dom[2];
    var range = te.obj[2];
    div.innerHTML = '<span><em>xxxx</em>xxxx</span><img><div>xxxx</div>';
    range.setStart( div, 0 ).setEnd( div, 1 );
    range.createBookmark();
    ok( domUtils.isBookmarkNode( div.firstChild ), 'is BookmarkNode' );
    ok( !domUtils.isBookmarkNode( div.firstChild.nextSibling ), 'not BookmarkNode' );

} );

test( 'getWindow', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    var w = domUtils.getWindow( div );
    ok( w === self.window, 'check window' );
} );

test( 'getWindow--iframe', function() {
    var f = te.dom[1];
    var domUtils = te.obj[3];
    expect( 1 );
    var frame_doc = f.contentWindow.document || f.contentDocument;
    stop();
    setTimeout( function() {
        var frame_div = frame_doc.createElement( 'div' );
        frame_doc.body.appendChild( frame_div );
        var w = domUtils.getWindow( frame_div );
        ok( f.contentWindow === w, 'same window' );
        start();
    } );

} );

test( 'getCommonAncestor--body', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    equal( domUtils.getCommonAncestor( div, document.body ).tagName.toLocaleLowerCase(), 'body', '第二個參數是body' );
    equal( domUtils.getCommonAncestor( document.body, div ).tagName.toLocaleLowerCase(), 'body', '第一個參數是body' );
} );

test( 'getCommonAncestor--自己', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    same( domUtils.getCommonAncestor( div, div ), div, '自己和自己的公共祖先' );

} );

test( 'getCommonAncestor--兄弟節點', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span>xxxx</span><p><table><tr><td id="td">dddd</td></tr></table></p>';
    var span_text = div.firstChild.firstChild;
    var td = document.getElementById( 'td' );
    same( domUtils.getCommonAncestor( span_text, td ), div, '兄弟節點' );
} );

test( 'getCommonAncestor--不在一個dom樹', function() {
    stop();
    expect( 1 );
    var div = te.dom[2];
    var f = te.dom[1];
    setTimeout( function() {
        var domUtils = te.obj[3];
        var frame_doc = f.contentWindow.document || f.contentDocument;
        var frame_div = frame_doc.createElement( 'div' );
        frame_doc.body.appendChild( frame_div );
        same( domUtils.getCommonAncestor( frame_div, div ), null, '不在一個dom樹' );
        start();
    }, 50 );

} );

test( 'isWhitespace', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = "aaa\ufeff\u200B\t\t\n\r";
    ok( !domUtils.isWhitespace( div.firstChild ), 'not whiteSpace' );
    div.innerHTML = baidu.editor.browser.ie && baidu.editor.browser.version == '6' ? '\ufeff' : '\u200B' + '\t\t\n\r';
    ok( domUtils.isWhitespace( div.firstChild ), 'is whiteSpace' );
} );

test( 'isEmptyInlineElement', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span><b><i><b>\n\r</b>xxxx</i></b><i></i></span>';
    var b1 = div.firstChild.firstChild;
    ok( !domUtils.isEmptyInlineElement( b1 ), 'not empty inline' );
    ok( domUtils.isEmptyInlineElement( b1.firstChild.firstChild ), 'is emtpy inline element' );
} );

test( 'isEmptyInlineElement-nodeType!=1', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span><b>\n\r\ufeff\u200B</b>xxxx<i></i></span>';
    ok( !domUtils.isEmptyInlineElement( div.firstChild.firstChild.firstChild ), 'textNode not inline element' );
} );

test( 'isEmptyInlineElement-block element', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span><b><i><b>\n\r</b>xxxx</i></b><i></i></span>';
    ok( !domUtils.isEmptyInlineElement( div ), 'not inline element' );
} );


test( 'clearEmptySibling', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<p>xxx<span><u><i><b></b></i></u>xxxxx</span><img /></p><table><tr><td><i></i></td></tr></table>';
    var text = div.firstChild.firstChild;
    /*沒有空sibling*/
    domUtils.clearEmptySibling( text );
    equal( ua.getChildHTML( div ), '<p>xxx<span><u><i><b></b></i></u>xxxxx</span><img></p><table><tbody><tr><td><i></i></td></tr></tbody></table>', '沒有空sibling' );
    var span = text.nextSibling;
    domUtils.clearEmptySibling( span );
    equal( ua.getChildHTML( div ), '<p>xxx<span><u><i><b></b></i></u>xxxxx</span><img></p><table><tbody><tr><td><i></i></td></tr></tbody></table>' );
    /*左邊有空sibling*/
    domUtils.clearEmptySibling( span.lastChild );
    equal( ua.getChildHTML( div ), '<p>xxx<span>xxxxx</span><img></p><table><tbody><tr><td><i></i></td></tr></tbody></table>', '左邊有空sibling' );
    /*左右邊有空sibling*/
    div.innerHTML = '<p><i></i>\n<b>\t<i><u>\n\t\r</u></i></b>xxxx<b></b></p>';
    domUtils.clearEmptySibling( div.firstChild.lastChild.previousSibling );

    //TODO 有空白文本的時候是否需要刪除
    equal( div.innerHTML.toLocaleLowerCase(), '<p>xxxx</p>', '左右邊有空sibling' );
    /*左右多個連續的空inline sibling*/
    div.innerHTML = '<span><b></b><i>\t\t</i><div id="div"></div><var></var></span>';
    var div_new = document.getElementById( 'div' );
    domUtils.clearEmptySibling( div_new );
    equal( ua.getChildHTML( div ), '<span><div id="div"></div></span>', '連續空inline sibling' );
    /*左右邊有空塊元素*/
    div.innerHTML = '<div><p></p>xxxx<b></b></div>';
    domUtils.clearEmptySibling( div.firstChild.firstChild.nextSibling );
    equal( ua.getChildHTML( div ), '<div><p></p>xxxx</div>', '左右邊有空塊元素' );
} );

/*不能誤刪bookmark*/
test( 'clearEmptySibling--bookmark', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    var r = te.obj[2];
    div.innerHTML = '<span><a>link</a></span>';
    var a = div.firstChild.firstChild;
    var link = a.firstChild;
    r.selectNode( link );
    r.createBookmark();
    /*bookmark節點*/
    domUtils.clearEmptySibling( link );
    ok( /_baidu_bookmark_end/.test( link.nextSibling.id ), '右邊的bookmark sibling沒有刪掉' );
    ok( /_baidu_bookmark_start/.test( link.previousSibling.id ), '左邊的bookmark sibling沒有刪掉' );
} );

test( 'clearEmptySibling--ignoreNext/ignorePrevious', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    /*ignoreNext*/
    div.innerHTML = '<p><i></i>\n<b>\t<i><u>\n\t\r</u></i></b>xxxx<b></b></p>';
    domUtils.clearEmptySibling( div.firstChild.lastChild.previousSibling, true );
    equal( div.innerHTML.toLocaleLowerCase(), '<p>xxxx<b></b></p>', 'ignore next' );
    /*ignorePrevious*/
    div.innerHTML = '<p><i></i>\n<b>\t<i><u>\n\t\r</u></i></b>xxxx<b></b></p>';
    domUtils.clearEmptySibling( div.firstChild.lastChild.previousSibling, false, true );
    equal( ua.getChildHTML( div ), '<p><i></i><b><i><u></u></i></b>xxxx</p>', 'ignore next' );
    /*ignorePrevious&&ignoreNext*/
    div.innerHTML = '<p><i></i>\n<b>\t<i><u>\n\t\r</u></i></b>xxxx<b></b></p>';
    domUtils.clearEmptySibling( div.firstChild.lastChild.previousSibling, true, true );
    equal( ua.getChildHTML( div ), '<p><i></i><b><i><u></u></i></b>xxxx<b></b></p>', 'ignore next&&previous' );
} );

test( 'split--offset正常', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span>span</span> >';
    var span = div.firstChild;
    domUtils.split( span.firstChild, 2 );
    equal( span.childNodes.length, 2, 'check child count' );
    equal( span.childNodes[0].data, 'sp', 'check firstChild' );
    equal( span.childNodes[1].data, 'an', 'check secondChild' );
} );

test( 'split--offset=0', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span>span</span> >';
    var span = div.firstChild;
    domUtils.split( span.firstChild, 0 );
    equal( span.childNodes.length, 2, 'check child count' );
    equal( span.childNodes[0].data, '', 'check firstChild' );
    equal( span.childNodes[1].data, 'span', 'check secondChild' );
} );

test( 'split--offset=data.length', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span>span</span> >';
    var span = div.firstChild;
    domUtils.split( span.firstChild, 4 );
    equal( span.childNodes.length, 2, 'check child count' );
    equal( span.childNodes[0].data, 'span', 'check firstChild' );
    equal( span.childNodes[1].data, '', 'check secondChild' );
} );

/*求相對視窗的位置而不是實際位置*/
//test( 'getXY', function() {
//    var div = te.dom[2];
//    var domUtils = te.obj[3];
//    equal( domUtils.getXY( div )['x'], ua.findPosition( div )[0] - document.documentElement.scrollLeft, 'check X' );
//    equal( domUtils.getXY( div )['y'], ua.findPosition( div )[1] - document.documentElement.scrollTop, 'check Y' );
//
//} );


test( 'on--跨iframe加載', function() {
    expect( 1 );
    var domUtils = te.obj[3];
    var op = {
        onafterstart : function( f ) {
            domUtils.on( f, 'load', function() {
                ok( true, 'on load of iframe success' );
            } );
        },
        ontest : function() {
            this.finish();
        }
    };
    ua.frameExt( op );
} );


test( 'on- 給不同的dom元素綁定相同的事件', function() {
    var domUtils = te.obj[3];
    expect( 2 );
    var div2 = document.body.appendChild( document.createElement( 'div' ) );
    div2.id = 'test2';
    te.dom.push( div2 );
    var handle = function( e ) {
        ok( true, e.type + ' event triggered' );
    };
    domUtils.on( te.dom[2], 'mouseover', handle);
    domUtils.on( te.dom[1], 'mouseover', handle );

    ua.mouseover( te.dom[2] );
    ua.mouseover( te.dom[1] );
} );
test( 'on-多事件的字符串參數', function() {
    var domUtils = te.obj[3];
    expect( 2 );
    var div2 = document.body.appendChild( document.createElement( 'div' ) );
    div2.id = 'test2';
    te.dom.push( div2 );
    var handle = function( e ) {
        ok( true, e.type + ' event triggered' );
    };
    domUtils.on( te.dom[2], 'mouseover mousedown', handle);


    ua.mouseover( te.dom[2] );
    ua.mousedown( te.dom[2] );
} );
test( 'un- 給不同的dom元素綁定相同的事件,解除一個，另一個仍然有效', function() {
    var domUtils = te.obj[3];
    expect( 1 );
    var div2 = document.body.appendChild( document.createElement( 'div' ) );
    div2.id = 'test2';
    te.dom.push( div2 );
    var handle = function( e ) {
        ok( true, e.type + ' event triggered' );
    };
    domUtils.on( te.dom[2], 'mouseover', handle);
    domUtils.on( te.dom[1], 'mouseover', handle );
    domUtils.un( te.dom[2],'mouseover', handle );
    ua.mouseover( te.dom[2] );
    ua.mouseover( te.dom[1] );
} );
test( 'un-多事件的字符串參數', function() {
    var domUtils = te.obj[3];
    expect( 0 );
    var div2 = document.body.appendChild( document.createElement( 'div' ) );
    div2.id = 'test2';
    te.dom.push( div2 );
    var handle = function( e ) {
        ok( false, e.type + ' 沒有註銷' );
    };
    domUtils.on( te.dom[2], 'mouseover mousedown', handle);

    domUtils.un(te.dom[2],'mouseover mousedown',handle);
    ua.mouseover( te.dom[2] );
    ua.mousedown( te.dom[2] );
    stop();
    setTimeout(function(){start()},2000)
} );

/*綁定多個事件*/
test( 'on', function() {
    var domUtils = te.obj[3];
    expect( 2 );
    domUtils.on( te.dom[2], ['mouseover','keypress'], function( e ) {
        ok( true, e.type + ' event triggered' );
    } );
    ua.mouseover( te.dom[2] );
    ua.keypress( te.dom[2] );
} );
test( "test case sensitive", function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    if ( ua.browser.ie ) {
        ok( true, 'IE下不支持諸如DOMNodeInserted等mutation事件' );
        return;
    }
    // ok(false, 'TODO: 添加大小寫敏感事件的on綁定和un取消用例,比如DOMMouseScroll');
    expect( 2 );
    domUtils.on( div, 'DOMNodeInserted', function() {
        ok( true, '用DOMNodeInserted測試大小寫敏感事件的on綁定' );
        domUtils.un( div, 'DOMNodeInserted' );
    } );
    div.appendChild( document.createElement( 'div' ) );
    div.appendChild( document.createElement( 'div' ) );
} );

test( "un--取消註冊unload事件", function() {
    expect( 1 );
    var domUtils = te.obj[3];
    var div = te.dom[2];
    var handle_a = function() {
        ok( true, "check unload" );
    };
    domUtils.on( div, "click", handle_a );
    /* 直接調用ua提供的接口跨瀏覽器接口，屏蔽瀏覽器之間的差異 */
    ua.click( div );
    domUtils.un( div, "click", handle_a );
    ua.click( div );
} );


test( "un--同一個回調註冊多個事件，後面事件會將第一個事件dhandler覆蓋掉", function() {
    expect( 1 );
    var domUtils = te.obj[3];
    var div = te.dom[2];
    var handle_a = function() {
        ok( true, "應當只會執行一次" );
    };
    /* 直接調用ua提供的接口跨瀏覽器接口，屏蔽瀏覽器之間的差異 */
    domUtils.on( div, "click", handle_a );
    domUtils.on(div,'dbclick',handle_a);
    ua.click( div );
    domUtils.un( div, "click", handle_a );
    ua.click( div );
} );

test( "un--同一個回調同一個事件註冊2次", function() {
    expect( 1 );
    var domUtils = te.obj[3];
    var div = te.dom[2];
    var handle_a = function() {
        ok( true, "check unload" );
    };
    /* 直接調用ua提供的接口跨瀏覽器接口，屏蔽瀏覽器之間的差異 */
    domUtils.on( div, "click", handle_a );
    domUtils.on(div,'click',handle_a);
    ua.click( div );
    domUtils.un( div, "click", handle_a );
    ua.click( div );
} );

test( "un--同一個事件取消註冊三次", function() {
    expect( 1 );
    var domUtils = te.obj[3];
    var div = te.dom[2];
    var handle_a = function() {
        ok( true, "check unload" );
    };
    /* 直接調用ua提供的接口跨瀏覽器接口，屏蔽瀏覽器之間的差異 */
    domUtils.on( div, "click", handle_a );
    ua.click( div );
    domUtils.un( div, "click", handle_a );
    domUtils.un( div, "click", handle_a );
    domUtils.un( div, "click", handle_a );
    ua.click( div );
} );

/** * 跨frame on然後un */
test( "window resize", function() {
    expect( 1 );
    var domUtils = te.obj[3];
    ua.frameExt( {
        onafterstart : function( f ) {
            $( f ).css( 'width', 200 );
        },
        ontest : function( w, f ) {
            var op = this;
            var fn = function() {
                ok( true );
            };
            domUtils.on( w, 'resize', fn );
            $( f ).css( 'width', 220 );
            /* 貌似通過jquery觸發窗體變化會存在延時 */
            setTimeout( function() {
                domUtils.un( w, 'resize', fn );
                $( f ).css( 'width', 240 );
                setTimeout( op.finish, 100 );
            }, 500 );
        }    } );
} );


test( 'isSameElement--compare with self', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    $( div ).attr( 'name', 'div_name' ).attr( 'class', 'div_class' ).css( 'background-color', 'red' ).css( 'border', '1px' ).css( 'font-size', '12px' ).css( 'height', '12px' ).css( 'width', '20px' );
    ok( domUtils.isSameElement( div, div ), 'compare with self' );
} );

test( 'isSameElement--tagName不一樣', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.appendChild( document.createElement( 'span' ) );
    $( div ).attr( 'name', 'div_name' ).attr( 'class', 'div_class' ).css( 'background-color', 'red' ).css( 'border', '1px' ).css( 'font-size', '12px' ).css( 'height', '12px' ).css( 'width', '20px' );
    ok( !domUtils.isSameElement( div, div.firstChild ), 'different tagName' );
} );

//TODO 目前的判斷有問題，ie下手動創建的img會自動添加一個complete屬性，導致比較結果為false,因此不對img進行比較
test( 'isSameElement--img的src和寬高比較', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span src="http://img.baidu.com/hi/jx2/j_0001.gif" width="50" height="51"></span>';

    var span = document.createElement( 'span' );
    span.setAttribute( 'src', 'http://img.baidu.com/hi/jx2/j_0001.gif' );
    span.setAttribute( 'height', '51' );
    span.setAttribute( 'width', '50' );
    div.appendChild( span );
    ok( domUtils.isSameElement( div.firstChild, div.lastChild ), '手動創建的img的src和寬高比較' );
} );

test( 'isSameElement--兩種元素的樣式通過不同方式設置', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    $( div ).attr( 'name', 'div_name' ).attr( 'class', 'div_class' ).css( 'background-color', 'red' ).css( 'border', '1px' ).css( 'font-size', '12px' ).css( 'height', '12px' ).css( 'width', '20px' );
    var div_new = document.createElement( 'div' );
    document.body.appendChild( div_new );
    te.dom.push( div_new );
    div_new.innerHTML = '<div id="test" class="div_class" name="div_name" style="border:1px;font-size:12px;background-color:red;width:20px;height:12px;"></div>';
    ok( domUtils.isSameElement( div_new.firstChild, div ), 'is sameElement' );
    /*防止前後順序引起的問題*/
    ok( domUtils.isSameElement( div, div_new.firstChild ), 'is sameElement' );
} );

test( 'isSameElement--A比B多一個屬性', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    div.innerHTML = '<span class="div_class" id="span_id1" name="span_name1"></span>';
    var div_new = document.createElement( 'div' );
    document.body.appendChild( div_new );
    te.dom.push( div_new );
    div_new.innerHTML = '<span class="div_class" id="span_id1"></span>';
    ok( !domUtils.isSameElement( div_new.firstChild, div ), 'A and B is not sameElement' );
    ok( ! domUtils.isSameElement( div, div_new.firstChild ), 'B and A is not sameElement' );
} );

test( 'isSameElement--img的屬性比較', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
//    var editor = new baidu.editor.Editor();
//    editor.render(div);
    div.innerHTML = '<img  style="width: 200px;height: 200px" src="http://ueditor.baidu.com/img/logo.png">hello';
    var div1 = document.createElement( 'div' );
    var html = '<img  src="http://ueditor.baidu.com/img/logo.png" style="width: 200px;height: 200px" >';
    div1.innerHTML = html;
    ok( domUtils.isSameElement( div.firstChild, div1.firstChild ), '屬性一致' )
} );

/*暫時不會對顏色不同表達方式做轉換*/
//test( 'isSameElement--style描述方式不同', function() {
//    var div = te.dom[2];
//    var domUtils = te.obj[3];
//    $( div ).attr( 'name', 'div_name' ).attr( 'class', 'div_class' ).css( 'background-color', 'red' ).css( 'border', '1px' ).css( 'font-size', '12px' ).css( 'height', '12px' ).css( 'width', '20px' );
//    var div_new = document.createElement( 'div' );
//    document.body.appendChild( div_new );
//    te.dom.push( div_new );
//    div_new.innerHTML = '<div id="test" class="div_class" name="div_name" style="border:1px;font-size:12px;background-color:rgb(255,0,0);width:20px;height:12px;"></div>';
//    ok( domUtils.isSameElement( div_new.firstChild, div ), 'A and B are sameElement' );
//    div_new.innerHTML = '<div id="test" class="div_class" name="div_name" style="border:1px;font-size:12px;background-color:#ff0000;width:20px;height:12px;"></div>';
//    ok( domUtils.isSameElement( div, div_new.firstChild ), 'B and A sameElement' );
//} );

test( 'isSameElement--A比B多一個style屬性', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    $( div ).attr( 'name', 'div_name' ).attr( 'class', 'div_class' ).css( 'background-color', 'red' ).css( 'border', '1px' ).css( 'font-size', '12px' ).css( 'height', '12px' ).css( 'width', '20px' );
    var div_new = document.createElement( 'div' );
    document.body.appendChild( div_new );
    te.dom.push( div_new );
    div_new.innerHTML = '<div id="test" class="div_class" name="div_name" style="border:1px;font-size:12px;background-color:rgb(255,0,0);width:20px;height:12px;left:12px"></div>';
    ok( !domUtils.isSameElement( div_new.firstChild, div ), 'A and B is not sameElement' );
    ok( ! domUtils.isSameElement( div, div_new.firstChild ), 'B and A is not sameElement' );
} );

//test( 'isRedundantSpan--非span', function() {
//    var div = te.dom[2];
//    var domUtils = te.obj[3];
//    div.innerHTML = 'text';
//    ok( !domUtils.isRedundantSpan( div ), 'not span' );
//    ok( !domUtils.isRedundantSpan( div.firstChild ), 'text node is not span' );
//} );
//
//test( 'isRedundentSpan', function() {
//    var div = te.dom[2];
//    var domUtils = te.obj[3];
//    div.innerHTML = '<span></span><span name="span" style="font-size:12px"></span>';
//    ok( domUtils.isRedundantSpan( div.firstChild ), 'is redundentSapn' );
//    ok( !domUtils.isRedundantSpan( div.lastChild ), 'is not redundentSpan' );
//    var span = document.createElement( 'span' );
//    div.appendChild( span );
//    ok( domUtils.isRedundantSpan( span ), 'is redundent span' );
//} );

/*rd說實際應用情況會按照固定的方式設置樣式，因此不考慮兼容rgb(255,0,0),#ff0000,red這三者的差別*/
test( 'isSameStyle', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    /*分號，空格*/
    div.innerHTML = '<span style="font-size:12px; background-color:rgb(255,0,0);"></span><span name="span" style="font-size:12px;background-color:rgb(255,0,0) "></span>';
    ok( domUtils.isSameStyle( div.firstChild, div.lastChild ), 'have same style' );
} );

test( 'isSameStyle--float', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    /*分號，空格*/
    div.innerHTML = '<span style=" float:left;font-size:12px; "></span><span name="span" style="font-size:12px;float:left"></span>';
    ok( domUtils.isSameStyle( div.firstChild, div.lastChild ), 'have same style' );
    div.firstChild.style.cssText = "float:left;font-size:12px;background-color:red";
    ok( ! domUtils.isSameStyle( div.firstChild, div.lastChild ), 'have differtnt style' );
} );


test( 'isBlockElm', function() {
    var div = te.dom[2];
    var domUtils = te.obj[3];
    /*isindex,noframes是特例，在這裡不做驗證*/
    var blockElms = ['address','blockquote','center','dir','div','dl','fieldset','form','h1','h2','h3','h4','h5','h6','hr','menu','ol','p','pre','table','ul'];
    var k = blockElms.length;
    while ( k ) {
        var elm = document.createElement( blockElms[k - 1] );
        div.appendChild( elm );
        ok( domUtils.isBlockElm( elm ), elm.tagName + ' is block elm' );
        k--;
    }
    blockElms = ['a','abbr','acronym','b','bdo','big','br','cite','code','dfn','em','font','i','img','input','kbd','label','q','s','samp','select','small','span','strike','strong','sub','sp','textarea','tt','u','noscript' ];
    k = blockElms.length;
    while ( k ) {
        var elm = document.createElement( blockElms[k - 1] );
        div.appendChild( elm );
        ok( !domUtils.isBlockElm( elm ), elm.tagName + ' is not block elm' );
        k--;
    }
} );

test( 'isbody', function() {
    var domUtils = te.obj[3];
    ok( domUtils.isBody( document.body ), 'is body' );
} );

/*parent參數是 node的直接父親*/
test( 'breakParent--一級祖先', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<p><span>xxxx</span><u><i>uitext</i></u><br /></p><div>xxxx</div>';
    var br = div.firstChild.lastChild;
    var returnNode = domUtils.breakParent( br, div.firstChild );
    equal( ua.getChildHTML( div ), '<p><span>xxxx</span><u><i>uitext</i></u></p><br><p></p><div>xxxx</div>' );
    equal( returnNode.tagName.toLowerCase(), 'br', 'check return value' );
} );

/*parent參數是 node的祖先節點*/
test( 'breakParent--二級祖先', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<p><span>xxxx</span><u><i>uitext</i></u><br /></p><div>xxxx</div>';
    domUtils.breakParent( div.firstChild.firstChild.firstChild, div.firstChild );
    equal( ua.getChildHTML( div ), '<p><span></span></p>xxxx<p><span></span><u><i>uitext</i></u><br></p><div>xxxx</div>' );
} );
/*bookMark已在clearEmptySibling中驗證*/
test( 'isEmptyInlineElement', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<p><u><em></em></u><span>xxxx</span><u><i>uitext</i></u><br /></p><div>xxxx</div><div></div>';
    var p = div.firstChild;
    /*非空元素*/
    ok( !domUtils.isEmptyInlineElement( p ), 'is not empty' );
    /*空inline元素*/
    ok( domUtils.isEmptyInlineElement( p.firstChild ), 'u is empty' );
    ok( domUtils.isEmptyInlineElement( p.firstChild.firstChild ), 'em is empty' );
    /*塊元素*/
    ok( !domUtils.isEmptyInlineElement( p.lastChild ), 'empty div is not inline' );
} );

test( 'trimWhiteTextNode', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '\n\t    <p><u><em></em></u><span>xxxx</span><u><i>uitext</i></u><br /></p><div>xxxx</div>    ';
    domUtils.trimWhiteTextNode( div );
    equal( ua.getChildHTML( div ), '<p><u><em></em></u><span>xxxx</span><u><i>uitext</i></u><br></p><div>xxxx</div>', 'trim white textnode' );
} );

/*適用於inline節點*/
test( 'mergeChild--span', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;

    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div.innerHTML = '<span style="background-color:blue;"><span style="font-size:12px;color:red">span_1<span style="font-size:12px">span_2</span></span></span>';
    domUtils.mergeChild( div.firstChild.firstChild );
    /*span套span則進行合併*/
    div_new.innerHTML = '<span style="background-color:blue;"><span style="font-size:12px;color:red">span_1</span></span>';
    div_new.firstChild.firstChild.appendChild( document.createTextNode( 'span_2' ) );
    ok( ua.haveSameAllChildAttribs( div, div_new ), 'span套span則合併' );

    div.innerHTML = '<p><span style="font-size:12px;color:red">span_1<span style="font-size:12px">span_2</span></span></p>';
    domUtils.mergeChild( div.firstChild.firstChild );
    /*父節點style比子節點多，刪去子節點*/
    div_new.innerHTML = '<p><span style="font-size:12px;color:red">span_1</span></p>' || ua.getChildHTML( div ) == '<p><span style="color:red;font-size:12px">span_1span_2</span></p>';
    div_new.firstChild.firstChild.appendChild( document.createTextNode( 'dpan_2' ) );
    ok( ua.haveSameAllChildAttribs( div, div_new ), '父節點style比子節點多' );
    /*子節點style比父節點多，則不作調整*/
    div.innerHTML = '<p><span style="font-size:12px">span_1<span style="font-size:12px;color:red">span_2</span></span></p>';
    var span = div.firstChild.firstChild;
    domUtils.mergeChild( span );
    /*創建一個div，div的innerHTML與預期的結果相同，比較div_new與div的所有屬性，從而判斷style為預期結果*/
    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div_new.innerHTML = '<p><span style="font-size:12px">span_1<span style="font-size:12px;color:red">span_2</span></span></p>';
    ok( ua.haveSameAllChildAttribs( div, div_new ), '子節點style比父節點多' );

    /*多個子節點和兄弟節點，有的子節點style比父節點多，有的少，有的不同*/
    div.innerHTML = '<p><span style="font-size:12px;color:red;left:10px">span_1<span style="font-size:12px">span_2</span><span style="top:10px">span_3</span><span style="color:red;left:10px;right:10px">span_4</span></span><span style="font-size:12px"></span></p>';
    domUtils.mergeChild( div.firstChild.firstChild );
    div_new.innerHTML = '<p><span style="font-size:12px;color:red;left:10px">span_2<span style="font-size:12px;color:red;left:10px;top:10px">span_3</span><span style="font-size:12px;color:red;left:10px;right:10px">span_4</span></span><span style="font-size:12px"></span></p>';
    var span1 = div_new.firstChild.firstChild;
    span1.insertBefore( document.createTextNode( 'span_1' ), span1.firstChild );
    ok( ua.haveSameAllChildAttribs( div, div_new ), '多個子節點和兄弟節點，有的子節點style比父節點多，有的少，有的不同' );
} );


test( 'mergeChild--非span', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    /*父節點和子節點屬性不同*/
    div.innerHTML = '<b style="color:red;font-size:12px">b1<b style="font-size:12px;">b2</b></b>';
    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div_new.innerHTML = '<b style="color:red;font-size:12px">b1<b style="font-size:12px;">b2</b></b>';
    domUtils.mergeChild( div.firstChild );
    ok( ua.haveSameAllChildAttribs( div, div_new ), '父節點和子節點屬性不同，則不操作' );
    /*父節點和子節點屬性相同*/
    div.innerHTML = '<b style="color:red;font-size:12px">b1<b style="font-size:12px;color:red;">b2</b></b>';
    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div_new.innerHTML = '<b style="color:red;font-size:12px">b1</b>';
    domUtils.mergeChild( div.firstChild );
    div_new.firstChild.appendChild( document.createTextNode( 'b2' ) );
    ok( ua.haveSameAllChildAttribs( div, div_new ), '父節點和子節點屬性相同，則刪子節點' );
} );
test( 'mergeChild--span--attrs', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div.innerHTML = '<span style="background-color:blue;"><span style="font-size:12px;color:red">span_1<span style="font-size:12px">span_2</span></span></span>';
    var html = '<span style="font-size: 12px; color: red; background-color: blue;">span_1<span style="font-size: 12px; color: red; background-color: red;">span_2</span></span>';
    domUtils.mergeChild( div.firstChild ,'span',{style:'background-color:red'});
    ua.checkSameHtml(div.innerHTML,html,'mergeChild-給子節點中的span添加樣式');
} );
test( 'getElementsByTagName', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<p><u><em></em></u><span>xxxx</span><u><i>uitext</i></u><br /></p><div>xxxx</div> <p>xxxx</p>';
    var elms = domUtils.getElementsByTagName( div, 'p' );
    equal( elms.length, 2, 'check elem count' );
    equal( elms[0].innerHTML.toLowerCase(), '<u><em></em></u><span>xxxx</span><u><i>uitext</i></u><br>', 'check first p' );
    equal( elms[1].innerHTML, 'xxxx', 'check second p' );
} );

test( 'mergeToParent--一個span孩子', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<span style="color:red;font-size:12px;"><span style="left:10px;right:20px;"></span></span>';
    domUtils.mergeToParent( div.firstChild.firstChild );
    var div_new = document.createElement( 'div' );
    div_new.innerHTML = '<span style=color:red;font-size:12px;left:10px;right:20px;></span>';
    ok( ua.haveSameAllChildAttribs( div, div_new ), 'mergeTo parent' );
} );

test( 'mergeToParent--一個span孩子，孩子css樣式與父節點相同', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<span style="color:red;font-size:12px;"><span style="font-size:12px;color:red;">xxxxx</span></span>';
    domUtils.mergeToParent( div.firstChild.firstChild );
    var div_new = document.createElement( 'div' );
    div_new.innerHTML = '<span style="color:red;font-size:12px">xxxxx</span>';
    ok( ua.haveSameAllChildAttribs( div, div_new ), 'mergeTo parent，刪除樣式相同的子節點' );
} );

test( 'mergeToParent--多個span孩子,祖先節點不可被合併', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<span style="color:red;font-size:12px;"><span style="left:10px;right:20px;"></span><span style="top:10px"></span></span>';
    domUtils.mergeToParent( div.firstChild.firstChild );
    var div_new = document.createElement( 'div' );
    div_new.innerHTML = '<span style="color:red;font-size:12px;"><span style="left:10px;right:20px;color:red;font-size:12px;"></span><span style="top:10px"></span></span>';
    ok( ua.haveSameAllChildAttribs( div, div_new ), 'mergeTo parent--多個span孩子,' );
} );

//test( 'mergeToParent--a', function() {
//    var div = te.dom[2];
//    var domUtils = baidu.editor.dom.domUtils;
//    div.innerHTML = '<span style="text-decoration: line-through"><a href="http://www.baidu.com/">www.baidu.com</a></span>';
//
//
//} );


test( 'mergeToParent--其他inline節點', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<b>xxx<i>xxx<u>xxxx<em>xxx<i id="secondI"><b>xxxxxx</b></i></em></u></i></b>';
    var i = document.getElementById( 'secondI' );
    domUtils.mergeToParent( i.firstChild );
    ok( ua.getChildHTML( div ), '<b>xxx<i>xxx<u>xxxx<em>xxx<i>xxxxxx</i></em></u></i></b>' );
    domUtils.mergeToParent( i );
    ok( ua.getChildHTML( div ), '<b>xxx<i>xxx<u>xxxx<em>xxxxxxxxx</em></u></i></b>' );
} );

/*合併兄弟節點中有相同屬性包括style的節點*/
test( 'mergeSibling--左邊沒有兄弟', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<b>b1</b><b>b2</b><b id="b3">b3</b>';
    domUtils.mergeSibling( div.firstChild );
    ok( ua.getChildHTML( div ), '<b>b1b2</b><b id="b3">b3</b>' );
} );

test( 'mergeSibling--右邊沒有兄弟', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<b>b1</b><b>b2</b><b>b3</b>';
    domUtils.mergeSibling( div.lastChild );
    ok( ua.getChildHTML( div ), '<b>b1b2</b><b id="b3">b3</b>' );
} );


test( 'mergeSibling--兄弟節點沒有孩子', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<b></b><b>b2</b><b id="b3">b3</b>';
    domUtils.mergeSibling( div.firstChild.nextSibling );
    ok( ua.getChildHTML( div ), '<b>b2</b><b id="b3">b3</b>' );
} );


test( 'trace 3983 unselectable--檢查賦值是否成功', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div><p>xxxx<span><b><i>xxx</i></b>xxxx</span></p>dddd<p><img /><a>aaaa</a></p></div>';
    debugger
    domUtils.unSelectable( div );
    if ( UE.browser.gecko || UE.browser.webkit || (UE.browser.ie &&UE.browser.version>8) ) {
        equal( div.style.MozUserSelect || div.style.KhtmlUserSelect || div.style.MSUserSelect, 'none', 'webkit or gecko unselectable' );
    } else {
        equal( div.unselectable, 'on', '檢查unselectable屬性' );
        for ( var i = 0,ci; ci = div.all[i++]; ) {
            equal( ci.unselectable, 'on', '檢查子節點unselectable屬性' );
        }
    }
} );

test( 'unselectable--檢查是否真的不能選中', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<p>xxx</p>';
    //TODO ie下如何選中文本節點需要重新想一想，用程序選擇文本貌似不會考慮unselectable屬性，都是可以選中的
    if ( ! ua.browser.ie && !ua.browser.opera) {
//        var rng = document.body.createTextRange();
//          domUtils.unselectable( div );
//        rng.moveToElementText( div )
//        /*開始位置處向前移動一個字符，結束位置處向後移動一個字符*/
//        rng.moveEnd( 'character', 1 );
//        rng.moveStart( 'character', -1 );
//        rng.select();
//        equal( rng.text, '', 'after unselectable' );
//    } else {
        var r = te.obj[2];
        r.selectNode( div.firstChild ).select();
        equal( ua.getSelectedText(), 'xxx', 'before unselectable' );
        /*禁止選中*/
        domUtils.unSelectable( div );
        r.selectNode( div.firstChild ).select();
        equal( ua.getSelectedText(), '', 'after unselectable' );
    }
} );

/*不支持第二個參數為字符串，必須為數組*/
//test( 'removeAttributes--刪除一個屬性', function() {
//    var div = te.dom[2];
//    div.innerHTML = '<div class="div_class" name="div_name"></div>';
//    var domUtils = baidu.editor.dom.domUtils;
//    domUtils.removeAttributes( div.firstChild, 'class' );
//    equal( ua.getChildHTML( div ), '<div name="div_name"></div>' );
//} );

test( 'removeAttributes--刪除多個屬性，包括style', function() {
    var div = te.dom[2];
    div.innerHTML = '<div class="div_class" name="div_name" style="color:red;font-size:12px"></div>';
    var domUtils = baidu.editor.dom.domUtils;
    /*詭異模式下className可以刪除，而非詭異模式下不能刪除*/
    domUtils.removeAttributes( div.firstChild, ['class','name','style'] );
    equal( ua.getChildHTML( div ), '<div></div>' );
} );

test( 'setAttributes--設置class,style', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div></div>';
    domUtils.setAttributes( div.firstChild, {'class':'div_class','id':'div_id','style':'color:red;font-size:12px;'} );
    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div_new.innerHTML = '<div class="div_class" id="div_id" style="color:red;font-size:12px"></div>';
    ok( ua.haveSameAllChildAttribs( div, div_new ), 'check attributes' );
} );
test( 'setAttributes--設置innerHTML,value', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div></div>';
    domUtils.setAttributes( div.firstChild, {'innerHTML':'setAttributes_test','id':'div_id','value':'abcd'} );
    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div_new.innerHTML = '<div id="div_id" >setAttributes_test</div>';
    div_new.firstChild.value="abcd";
    ok( ua.haveSameAllChildAttribs( div, div_new ), 'check attributes' );
} );
test( 'getComputedStyle', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div class="div_class" name="div_name" style="color:red;font-size:12px"></div><span></span>';
    equal( domUtils.getComputedStyle( div.firstChild, 'font-size' ), '12px' );
    equal( domUtils.getComputedStyle( div.firstChild, 'display' ), 'block' );
    equal( domUtils.getComputedStyle( div.lastChild, 'display' ), 'inline' );
    equal( domUtils.getComputedStyle( div.firstChild, 'width' ),div.firstChild.offsetWidth + 'px');
    div.innerHTML = '<div class="div_class" name="div_name" style="width:30px;"></div><span></span>';
    equal( domUtils.getComputedStyle( div.firstChild, 'width' ),'30px');
} );

test( 'getComputedStyle--獲取默認的背景色', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div>hello</div>';
    /*chrome下不作特殊處理得到的結果是rgba(0,0,0,0)，處理後是結果是“”*/
    var result = baidu.editor.browser.webkit ? "" : "transparent";
    equal( domUtils.getComputedStyle( div, 'background-color' ), result, '默認背景色為透明色' );
} );

test( 'getComputedStyle-border', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<table style="border: 5px solid red"></table>';
    equal( domUtils.getComputedStyle( div.firstChild, 'border-width' ), '5px' );
    equal( domUtils.getComputedStyle( div.lastChild, 'border-style' ), 'solid' );
    equal( domUtils.getComputedStyle( div.lastChild, 'border-color' ), 'red' );
} );
//修覆ie下的一個bug，如果在body上強制設了字體大小，h1的字體大小就會繼承body的字體，而沒有辦法取到真是的字體大小
test( 'getComputedStyle-在body上設置字體大小,檢查h1字體大小', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var editor = new baidu.editor.Editor({'autoFloatEnabled':false});
    var div = document.body.appendChild( document.createElement( 'div' ) );
    editor.render( div );
    stop();
    editor.ready(function(){
        var body = editor.body;
        var range = new baidu.editor.dom.Range( editor.document );
        var h1 = body.appendChild( editor.document.createElement( 'h1' ) );
//    editor.body.style['fontSize'] = '10px';
//   h1的字體大小不是10px
        var fontSize = (ua.browser.ie&&ua.browser.ie<9)?'33px':'32px';//todo 1.2.7 trace 3588
        equal( domUtils.getComputedStyle( h1, 'font-size' ), fontSize, 'body的fontSize屬性不應當覆蓋p的fontSize屬性' );
        te.dom.push(div);
//    editor.setContent( '<h2>這是h2的文本<a>這是一個超鏈接</a></h2>' );
        start();
    });
} );

/*不支持一個class的刪除，必須為一個數組*/
//test( 'removeClasses--一個class', function() {
//    var div = te.dom[2];
//    var domUtils = baidu.editor.dom.domUtils;
//    div.innerHTML = '<div class="div_class" name="div_name" style="color:red;font-size:12px"></div>';
//    domUtils.removeClasses( div.firstChild, 'div_class' );
//    ok( ua.getChildHTML( div ) == '<div name="div_name" style="color:red;font-size:12px"></div>' || ua.getChildHTML( div ) == '<div name="div_name" style="font-size:12px;color:red;"></div>' );
//} );

test( 'removeClasses--多個class', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div class="div_class div_class2 div_class3" name="div_name" style="color:red;font-size:12px"></div>';
    var divChild = div.firstChild;
    domUtils.removeClasses( divChild, ['div_class2' ,'div_class3','div_class'] );
    equal( $.trim( divChild.className ), "", 'check className' );
    equal( $( divChild ).attr( 'name' ), 'div_name', 'check name' );
    equal( $( divChild ).css( 'font-size' ), '12px', 'check font-size' );
    equal( $( divChild ).css( 'font-size' ), '12px', 'check font-size' );
    equal( divChild.style[ 'color'], 'red', 'check red' );
} );

test( 'removeClasses--class包含”-“', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div class="b-b b-b-a " name="div_name" style="color:red;font-size:12px"></div>';
    var divChild = div.firstChild;
    domUtils.removeClasses( divChild, ['b-b'] );
    equal( $.trim( divChild.className ), "b-b-a", 'check className' );
    equal( $( divChild ).attr( 'name' ), 'div_name', 'check name' );
    equal( $( divChild ).css( 'font-size' ), '12px', 'check font-size' );
    equal( divChild.style[ 'color'], 'red', 'check red' );
    div.innerHTML = '<div class="b-b b-b-a " name="div_name" style="color:red;font-size:12px"></div>';
    domUtils.removeClasses( div.firstChild, ' b-b-a  b-b' );
    equal(div.firstChild.className,'')
} );

test( 'removeStyle--style不為空', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div name="div_name" style="color:red;font-size:12px"></div>';
    domUtils.removeStyle( div.firstChild, 'font-size' );
    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div_new.innerHTML = '<div name="div_name" style="color:red; "></div>';
    ok( ua.haveSameAllChildAttribs( div, div_new ), 'check removed style' );

} );
test( 'removeStyle--style不為空', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div name="div_name" style="border-left:1px solid #ccc"></div>';
    domUtils.removeStyle( div.firstChild, 'border-left' );
    var div_new = document.createElement( 'div' );
    div_new.id = 'test';
    div_new.innerHTML = '<div name="div_name" ></div>';
    ok( ua.haveSameAllChildAttribs( div, div_new ), 'check removed style' );

} );
test( 'removeStyle--style為空', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div name="div_name"></div>';
    domUtils.removeStyle( div.firstChild, 'color' );
    equal( ua.getChildHTML( div ), '<div name="div_name"></div>', ' style為空' );
} );

test( 'hasClass', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div class="div_class div_class2 div_class3" name="div_name" style="color:red;font-size:12px"></div>';
    var divChild = div.firstChild;
    ok( domUtils.hasClass( divChild, 'div_class3' ), '有這個class' );
    ok( !domUtils.hasClass( divChild, 'div' ), '木有這個class' );
    div.firstChild.className = 'a b  c';
    ok(domUtils.hasClass(div.firstChild,'b c a'))
} );

test( 'addClass', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div name="div_name" style="color:red;font-size:12px"></div>';
    domUtils.addClass(div.firstChild,'div_class div_class2 div_class3');
    equal(utils.trim(div.firstChild.className),div.firstChild.className,'判斷是否有前後空格');
    domUtils.addClass(div.firstChild,'div_class4');
    equal(div.firstChild.className,'div_class div_class2 div_class3 div_class4','增加class4');
    domUtils.addClass(div.firstChild,'div_class4');
    equal(div.firstChild.className,'div_class div_class2 div_class3 div_class4','再增加class4');
} );

test( "preventDefault", function() {
    expect( 1 );
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    /*img用來撐大頁面*/
    var img = document.createElement( 'img' );
    img.src = upath + 'test.jpg';
    img.style.height = "2000px";
    div.appendChild( img );
    document.body.appendChild( div );
    var a = document.createElement( 'a' );
    a.setAttribute( "href", "#" );
    a.innerHTML = 'ToTop';
    a.target = '_self';
    document.body.appendChild( a );
    window.scrollTo( 0, document.body.scrollHeight );

//    UserAction.beforedispatch = function( e ) {
//        e = e || window.event;
//        domUtils.preventDefault( e );
//    };
    a.onclick = function( e ) {
        domUtils.preventDefault( e );
    }
    UserAction.click( a );
    var top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    ok( top != 0, "preventDefault" );
    document.body.removeChild( a );
} );

test( 'getStyle--color is red', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div class="div_class div_class2 div_class3" name="div_name" style="top:13px;color:red;font-size:12px"></div>';
    equal( domUtils.getStyle( div.firstChild, 'color' ), 'red', 'check color' );
    equal( domUtils.getStyle( div.firstChild, 'font-size' ), '12px', 'check font size' );
    equal( domUtils.getStyle( div.firstChild, 'top' ), '13px', 'check top' );
} );

test( 'getStyle--color is rgb', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div class="div_class div_class2 div_class3" name="div_name" style="top:13px;color:rgb(255,0,0);font-size:12px"></div>';
    equal( domUtils.getStyle( div.firstChild, 'color' ), '#FF0000', 'check color' );
    equal( domUtils.getStyle( div.firstChild, 'font-size' ), '12px', 'check font size' );
    equal( domUtils.getStyle( div.firstChild, 'top' ), '13px', 'check top' );
} );

test( 'getStyle--color is #ff0000', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div class="div_class div_class2 div_class3" name="div_name" style="top:13px;color:#ff0000;font-size:12px"></div>';
    equal( domUtils.getStyle( div.firstChild, 'color' ).toUpperCase(), '#FF0000', 'check color' );
    equal( domUtils.getStyle( div.firstChild, 'font-size' ), '12px', 'check font size' );
    equal( domUtils.getStyle( div.firstChild, 'top' ), '13px', 'check top' );
} );


//test( 'getStyle--border', function() {
//    var div = te.dom[2];
//    div.innerHTML = '<table style="border: 5px solid red"><tr><td></td></tr></table>';
//} );
test( 'removeDirtyAttr', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div><span>xxx</span><img /></div>xx';
    $( div ).attr( '_moz_dirty', 'xxxx' );
    for ( var i = 0,ci,nodes = div.getElementsByTagName( '*' ); ci = nodes[i++]; ) {
        $( ci ).attr( '_moz_dirty', 'xxx' );
    }
    domUtils.removeDirtyAttr( div );

    for ( var i = 0,ci,nodes = div.getElementsByTagName( '*' ); ci = nodes[i++]; ) {
        equal( $( ci ).attr( '_moz_dirty' ), undefined, 'check  dirty attr ' );
    }
    equal( $( div ).attr( '_moz_dirty' ), undefined, 'check  dirty attr' );
} );

test( 'getChildCount', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div name="div_name" style="top:13px;color:#ff0000;font-size:12px"><p><span>xxx<b><u></u></b></span></p><span>xxxx</span>xxx<img/>xxx</div>';
    var divChild = div.firstChild;
    equal( domUtils.getChildCount( div ), 1, 'one childNode' );
    equal( domUtils.getChildCount( divChild ), 5, '5 childs' );
    equal( domUtils.getChildCount( divChild.firstChild.firstChild ), 2, 'inline span' );
    equal( domUtils.getChildCount( divChild.lastChild ), 0, 'text node have no child' );
    equal( domUtils.getChildCount( divChild.lastChild.previousSibling ), 0, 'img have no child' );

} );

test( 'setStyle', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div style="float: left"><p style="background: red"></p></div>';
    /*修改float值*/
    domUtils.setStyle( div.firstChild, 'float', 'right' );
    equal( $( div.firstChild ).css( 'float' ), 'right', '浮動方式改為了right' );
    domUtils.setStyle( div.firstChild.firstChild, 'text-indent', '10px' );
    equal( $( div.firstChild.lastChild ).css( 'text-indent' ), '10px', '設置了縮進樣式' );
} );

test( 'setStyles', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = '<div style="float: left"><p style="background: red"></p></div>';
    /*修改float值*/
    domUtils.setStyles( div.firstChild, {'float':'right','text-align':'center'} );
    equal( $( div.firstChild ).css( 'float' ), 'right', '浮動方式改為了right' );
    equal( $( div.firstChild.lastChild ).css( 'text-align' ), 'center', '設置了對齊方式樣式' );
} );

//zhuwenxuan add
//test( 'clearReduent', function() {
//    var div = te.dom[2];
//    var domUtils = baidu.editor.dom.domUtils;
//    //沒有內容
//    div.innerHTML = '<div><b><i></i></b></div>';
//    document.body.appendChild(div);
//    domUtils.clearReduent(div,["i","b"]);
//    ok( "<div></div>",div.innerHTML );
//    //有內容
//    div.innerHTML = '<div><b><i>ddd</i></b></div>';
//    domUtils.clearReduent(div,["i","b"]);
//    ok( "<div><b><i>ddd</i></b></div>",div.innerHTML );
//    div.innerHTML = '<div><i>ddd</i><b></b></div>';
//    domUtils.clearReduent(div,["i","b"]);
//    ok( "<div><i>ddd</i></div>",div.innerHTML );
//} );


//zhuwenxuan add
test( 'isEmptyNode', function() {
    var div = te.dom[2];
    var domUtils = baidu.editor.dom.domUtils;
    div.innerHTML = " \t\t\n\r";
    ok(domUtils.isEmptyNode(div));
    div.innerHTML = '<div><i></i><b>dasdf</b></div>';
    equal(false,domUtils.isEmptyNode(div));
} );

//zhuwenxuan add
test( 'clearSelectedArr', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    var span = document.createElement("span");
    div.className = "aaa";
    span.className = "span";
    document.body.appendChild(div);
    document.body.appendChild(span);
    var arr = [];
    arr.push(div);
    arr.push(span);
    domUtils.clearSelectedArr(arr);
    equal("",div.className);
    equal("",span.className);
} );


//zhuwenxuan add
test( 'isBr', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    div.innerHTML = "<br>";
    equal(true,domUtils.isBr(div.firstChild));
} );

//zhuwenxuan add
test( 'isFillChar', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    domUtils.fillNode(document,div);
    if(ua.browser.ie){
        ok(domUtils.isFillChar(div.lastChild));
    }
    var node = document.createTextNode(domUtils.fillChar + 'sdfsdf');
    ok(domUtils.isFillChar(node,true));
    ok(!domUtils.isFillChar(node));
    node = document.createTextNode(domUtils.fillChar +domUtils.fillChar);
    ok(domUtils.isFillChar(node,true));
    ok(domUtils.isFillChar(node))
} );


//zhuwenxuan add
test( 'isStartInblock', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    var range = new baidu.editor.dom.Range( document );
    domUtils.fillNode(document,div);
    range.setStart(div,0);
    ok(domUtils.isStartInblock(range));
    div.innerHTML = "asdfasdf";
    range.setStart(div,2);
    equal(0,domUtils.isStartInblock(range))
} );

//zhuwenxuan add
test( 'isEmptyBlock', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    domUtils.fillNode(document,div);
    ok(domUtils.isEmptyBlock(div));
    var span = document.createElement("span");
    equal(1,domUtils.isEmptyBlock(span));
    span.innerHTML = "asdf";
    equal(0,domUtils.isEmptyBlock(span));
} );

//zhuwenxuan add
test( 'fillNode', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    domUtils.fillNode(document,div);
    ok(div.innerHTML.length>0);
} );

//zhuwenxuan add
test( 'moveChild', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    div.innerHTML = "div child";
    var p = document.createElement("p");
    domUtils.moveChild(div,p);
    equal("div child",p.innerHTML);
    p.innerHTML = "";
    div.innerHTML = "<span>asdf</span>";
    domUtils.moveChild(div,p);
    equal("<span>asdf</span>",p.innerHTML.toLowerCase());
} );

test( 'hasNoAttributes', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    div.innerHTML = "<span>sdf</span>";

    ok(domUtils.hasNoAttributes(div.firstChild));
    div.firstChild.style.cssText = 'font-size:12px';
    ok(!domUtils.hasNoAttributes(div.firstChild));
    domUtils.removeAttributes(div.firstChild,['style']);
    ok(domUtils.hasNoAttributes(div.firstChild));
    div.innerHTML = '<span custorm>sf</span>';
    ok(!domUtils.hasNoAttributes(div.firstChild));

} );
test( 'isTagNode', function() {
    var domUtils = baidu.editor.dom.domUtils;
    var div = te.dom[2];
    div.innerHTML = "<p><span>sdf</span></p>";
    ok(domUtils.isTagNode(div.firstChild,"p"));
    ok(domUtils.isTagNode(div.firstChild.firstChild,"span"));
} );
test( 'filterNodelist', function() {
   var div = te.dom[2];
    div.innerHTML = '<span></span><span></span><i></i><i></i><i></i>';
    var arr = domUtils.filterNodeList(div.getElementsByTagName('*'),'i span');
    equals(arr.tagName,"SPAN");
    arr = domUtils.filterNodeList(div.getElementsByTagName('*'),'i');
    equals(arr.tagName,'I');
    arr = domUtils.filterNodeList(div.getElementsByTagName('*'),function(n){
        return n.tagName == 'SPAN'
    });
    equals(arr.tagName,'SPAN');
    arr = domUtils.filterNodeList(div.getElementsByTagName('*'),function(n){
        return n.tagName == 'SPAN'
    },true);
    equals(arr.length,2)
} );

test('inNodeEndBoundary',function(){
    var div = te.dom[2];
    div.innerHTML = "<span><b>span</b><a>aa</a></span><b>sp</b>";
    var range = te.obj[2];
    range.setStart(div.firstChild.lastChild.firstChild,2).collapse(1).select();
    range.createBookmark();
    ok(domUtils.isInNodeEndBoundary(range,div.firstChild),'firstchild.lastchild邊界');
    range.setStart(div.firstChild.firstChild.firstChild,4).collapse(1).select();
    range.createBookmark();
    ok(!domUtils.isInNodeEndBoundary(range,div.firstChild),'firstchild.firstchild邊界');
    range.setStart(div.lastChild.firstChild,2).collapse(1).select();
    range.createBookmark();
    ok(domUtils.isInNodeEndBoundary(range,div),'lastchild邊界');
});

//test( '閉合選區，標籤邊界', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var div = te.dom[2];
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    editor.render( div );
//    var range = new baidu.editor.dom.Range( editor.document );
//    editor.setContent( '<a>a_text1</a><a>a_text2</a>' );
//    var a = editor.body.firstChild.firstChild;
//    range.setStart( a, 0 ).collapse( 1 ).select();
//    same( domUtils.findTagNamesInSelection( range, ['h2','a','p'] ), a, '選區位置為(a,0)' );
//    range.setStart( a, 1 ).collapse( 1 ).select();
//    same( domUtils.findTagNamesInSelection( range, ['h2','a','p'] ), a, '選區位置為(a,1)' );
//
//    range.setStart( a.parentNode, 1 ).collapse( 1 ).select();
//    same( domUtils.findTagNamesInSelection( range, ['h2','a','p'] ), a.parentNode, '選區位置為(p,1)' );
//    same( domUtils.findTagNamesInSelection( range, ['h2','a'] ), null, '選區位置為(p,1)，但是不符合查找的條件' );
//} );

//test( '<strong style="color:red">文本閉合選區</strong>中查找是否包含特定的標籤列表', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    var div = te.dom[2];
//    editor.render( div );
//    var range = new baidu.editor.dom.Range( editor.document );
//    var body = editor.body;
//
//    editor.setContent( '<h2 id="tt-h2">我是測試的header:h2</h2><p id="tt-p"><strong>xx樂樂樂樂x</strong><a id="tt-a">我是標籤</a></p>' );
//    var expectH2 = editor.document.getElementById( 'tt-h2' ),
//            expectA = editor.document.getElementById( 'tt-a' );
//
//    //閉合情況下，文本節點里
//    var textH2 = body.firstChild.firstChild;
//    range.setStart( textH2, 2 ).collapse( true ).select();
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在h2中，tag順序：[h2, a, h3]' );
//    range.setStart( textH2, 0 ).collapse( true ).select();
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在h2的左邊界，tag順序：[h2, a, h3]' );
//    range.setStart( textH2, 14 ).collapse( true ).select();
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在h2的右邊界，tag順序：[h2, a, h3]' );
//
//    var p = editor.document.getElementsByTagName('p')[0];
//    var textA = p.lastChild.firstChild;
//    range.setStart( textA, 2 ).collapse( true ).select();
//    ok( expectA === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在a中，tag順序：[h2, a, h3]' );
//    range.setStart( textA, 0 ).collapse( true ).select();
//    ok( expectA === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在a的左邊界，tag順序：[h2, a, h3]' );
//    range.setStart( textA, 4 ).collapse( true ).select();
//    ok( expectA === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在a的右邊界，tag順序：[h2, a, h3]' );
//
//    var textStrong = p.firstChild.firstChild;
//    range.setStart( textStrong, 2 ).collapse( true ).select();
//    ok( null == domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在p中，tag順序：[h2, a, h3]' );
//    range.setStart( textStrong, 0 ).collapse( true ).select();
//    ok( null == domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在p的左邊界，tag順序：[h2, a, h3]' );
//    range.setStart( textStrong, 7 ).collapse( true ).select();
//    ok( null == domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '閉合情況下，cursor在p的右邊界，tag順序：[h2, a, h3]' );
//} );


//test( '<strong style="color:red">不閉合選區</strong>中查找，如果包含，則返回第一個dom節點', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    var div = te.dom[2];
//    editor.render( div );
//    var range = new baidu.editor.dom.Range( editor.document );
//    var body = editor.body;
//
//    editor.setContent( '<h2 id="tt-h2">我是測試的header:h2</h2><p id="tt-p"><strong>xx樂樂樂樂x</strong><a id="tt-a">我是標籤</a></p>' );
//    var expectH2 = editor.document.getElementById( 'tt-h2' ),
//            expectA = editor.document.getElementById( 'tt-a' );
//    var textH2 = body.firstChild.firstChild;
//    range.setStart( textH2, 3 ).setEnd( textH2, 9 ).select();
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '選中單個節點的一部分：tag順序：[h2, a, h3]' );
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['a', 'h2', 'h3'] ), '選中單個節點的一部分：tag順序：[a, h2, h3]' );
//
//    range.setStart( textH2, 0 ).setEnd( textH2, 14 ).select();
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '選中單個節點的全部：tag順序：[h2, a, h3]' );
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['a', 'h2', 'h3'] ), '選中單個節點的全部：tag順序：[a, h2, h3]' );
//
//        var p = editor.document.getElementsByTagName('p')[0];
//    range.setStart( textH2, 0 ).setEnd(p.lastChild.firstChild, 3 ).select();
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['h2', 'a', 'h3'] ), '跨節點選中：tag順序：[h2, a, h3]' );
//    ok( expectA === domUtils.findTagNamesInSelection( range, ['a', 'h2', 'h3'] ), '跨節點選中：tag順序：[a, h2, h3]' );
//} );

//test( '不閉合選區，選區包含<strong style="color:red">前半個</strong>半個標籤', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    var div = te.dom[2];
//    editor.render( div );
//    var body = editor.body;
//    var range = new baidu.editor.dom.Range( editor.document );
//    editor.setContent( '<h2>這是h2的文本<a>這是一個超鏈接</a></h2>' );
//    var a = body.firstChild.lastChild;
//    range.setStart( body, 0 ).setEnd( a.firstChild, 3 ).select();
//    same( domUtils.findTagNamesInSelection( range, ['a','h2','body','p'] ), a, '選擇h2和a的前半部分標籤，找到第一個為a' );
//    /*調換查找的數組中元素的順序*/
//    same( domUtils.findTagNamesInSelection( range, ['h2','a','body','p'] ), body.firstChild, '選擇h2和a的前半部分標籤，找到第一個為h2' );
//} );

//test( '不閉合選區，選區包含<strong style="color:red">後半個</strong>標籤', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    var div = te.dom[2];
//    editor.render( div );
//    var body = editor.body;
//    var range = new baidu.editor.dom.Range( editor.document );
//    editor.setContent( '<h2>這是h2的文本<a>這是一個超鏈接</a></h2>' );
//    var a = body.firstChild.lastChild;
//    range.setStart( a.firstChild, 3 ).setEnd( body, 1 ).select();
//    same( domUtils.findTagNamesInSelection( range, ['a','h2','body','p'] ), a, '選擇h2和a的後部分標籤，找到第一個為a' );
//    /*調換查找的數組中元素的順序*/
//    same( domUtils.findTagNamesInSelection( range, ['h2','a','body','p'] ), body.firstChild, '選擇h2和a的後部分標籤，找到第一個為h2' );
//} );

//test( '不閉合選區，選區包含2個相同的標籤', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    var div = te.dom[2];
//    editor.render( div );
//    var body = editor.body;
//    var range = new baidu.editor.dom.Range( editor.document );
//    editor.setContent( '<p><a>a_text1</a><a>a_tex2</a></p>' );
//    var a = body.firstChild.firstChild;
//    range.setStart( body.firstChild, 0 ).setEnd( body.firstChild, 2 ).select();
//    same( domUtils.findTagNamesInSelection( range, ['a'] ), a, '選區包含2個完整的a,選擇第一個a' );
//
//    range.setStart( body.firstChild, 0 ).setEnd( body.firstChild, 2 ).select();
//    same( domUtils.findTagNamesInSelection( range, ['p','a'] ), body.firstChild, '選區包含2個完整的a,選擇p' );
//
//    range.setStart( a, 0 ).setEnd( a.nextSibling, 1 ).select();
//    same( domUtils.findTagNamesInSelection( range, ['a'] ), a, '選區包含2個不完整的a,選擇第一個a' );
//} );

//test( '不閉合選區，選區緊挨著標籤邊界', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    var div = te.dom[2];
//    editor.render( div );
//    var body = editor.body;
//    var range = new baidu.editor.dom.Range( editor.document );
//    editor.setContent( '<p><a>a_text1</a>a_text3<a>a_tex2</a></p>' );
//    range.selectNode( body.firstChild.childNodes[1] ).select();
//    same( domUtils.findTagNamesInSelection( range, ['a'] ), null, '選區緊挨著a邊緣,找a返回null' );
//
//    same( domUtils.findTagNamesInSelection( range, ['a','p'] ), body.firstChild, '選區緊挨著a邊緣,找p返回p' );
//} );

//test( '不閉合選區，多節點，壓力測試', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    var div = te.dom[2];
//    editor.render( div );
//    var body = editor.body;
//    var range = new baidu.editor.dom.Range( editor.document );
//    editor.setContent( '<p><strong><em>我是p里的文本<span style="color:red">textTD2</span></em></strong></p><table><tbody><tr><td>textTD1</td><td><ol><li><p>我是列表1</p><p><strong><em>我是p里的文本<span style="color:red">textTD2</span></em></strong></p></li><li><strong><em>我是li 2里的文本<span style="color:red">textTD2</span></em></strong><p><strong><em>TextEM1<span id="spanID" style="color:red">我是列表2里的文本</span></em></strong></p></li></ol></td></tr></tbody></table>' );
//    var span = editor.document.getElementById( 'spanID' );
//    range.selectNode( span.firstChild ).select();
//    same(domUtils.findTagNamesInSelection(range,['div','pre','a','h1','h2','h3','h4','h5','h6','h7','table']),body.getElementsByTagName('table')[0],'深節點');
//} );

//test( '<strong style="color:red">control range</strong>中查找是否包含特定的標籤列表', function() {
//    var domUtils = baidu.editor.dom.domUtils;
//    var editor = new baidu.editor.ui.Editor({autoFloatEnabled:true});
//    var div = te.dom[2];
//    editor.render( div );
//    var range = new baidu.editor.dom.Range( editor.document );
//
//    editor.setContent( '<span id="tt-span">test_</span><img id="tt-h2" src="http://www.baidu.com/img/baidu_sylogo1.gif"/><p id="tt-p"><strong>xx樂樂樂樂x</strong><a id="tt-a">我是標籤</a></p>' );
//    var expectH2 = editor.document.getElementById( 'tt-h2' ),
//         expectA = editor.document.getElementById( 'tt-a' ),
//         expectSpan = editor.document.getElementById( 'tt-span' );
//
//
//    range.setStart(expectH2, 0).setEnd(expectA, 0).select();
//    ok( expectA === domUtils.findTagNamesInSelection( range, ['a', 'img', 'h3'] ), 'tag順序：[a, img, h3]' );
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['img', 'a', 'h3'] ), 'tag順序：[img, a, h3]' );
//
//
//    range.setStart(expectSpan, 0).setEnd(expectH2, 1).select();
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['a', 'img', 'h3'] ), 'tag順序：[a, img, h3]' );
//    ok( expectH2 === domUtils.findTagNamesInSelection( range, ['img', 'a', 'h3'] ), 'tag順序：[img, a, h3]' );
//} );