module( 'plugins.lineheight' );
//test( '', function() {
//    equal('','','');
//} );
/*
 *
 *利用pict工具生成的用例設計結果，有微調。3to1表示先設置行距為3再設置為1，選區“singlePara”表示選中一個段落，
 * “multiPara”表示選中多個段落，“字號統一”表示所有的字號都是一樣大，“16to36To16”表示先設置大小為16px，再設置為36，再設置為16
 設置行距順序	選區	選區內字號順序
 <li>3to1        	collapse	     字號統一</li>
 <li>1             	multiPara	  36To16To36</li>
 <li>1to3to1 	singlePara	  字號統一</li>
 <li>1              collapse 	      16to36To16</li>
 <li>1to3to1	multiPara	16to36To16</li>
 <li>3to1     	singlePara	  36To16To16</li>
 <li>3             	multiPara	 字號統一</li>
 <li>1to3to1	collapse	     36To16To16</li>
 <li>3to1     	multiPara	16to36To16</li>
 <li>3	         singlePara   	16to36To16</li>
 * */
//
//var compareLineHeight = function ( node, value,fontSize, descript ) {
//        var currLineHeight = $(node).css('lineHeight').replace(/px/,'');
//        var spans = node.getElementsByTagName('')
//        value = value.replace( /px/, '' );
//        var baseLineHeight = (ua.browser.ie ? domUtils.getComputedStyle( node, 'font-size' ).replace( /px/, '' ) : node.offsetHeight);
//        var fontSize = $( node ).css( 'font-size' ).replace( /px/, '' );
//        if ( value >= fontSize && value >= baseLineHeight ) {
//                ok( true, descript );
//        } else {
//                ok( false, descript + '--- "lineHeight應取fontSize和baseLineHeight*倍數的最大值":lineHeight=' + value + ' ;font-sze=' + fontSize + ';baseLineHeight=' + baseLineHeight );
//        }
//
//}
//
///*<li>3to1        	collapse	     字號統一</li>*/
test( '閉合情況，字號統一', function () {
        var editor = te.obj[0];
        var range = te.obj[1];
        var body = editor.body;
        editor.setContent( '<p style="font-size: 36px">hello</p>' );
        range.setStart(body.firstChild, 1).collapse(1).select();
        editor.execCommand('lineheight', 3);
        setTimeout( function () {
            var p = body.firstChild;
            equal( editor.queryCommandValue('lineheight'), "3", '行間距為3');
            editor.execCommand('lineheight', 1);
            p = body.firstChild;
            equal( editor.queryCommandValue('lineheight'), "1", '行間距為1');
            equal( p.style['lineHeight'], 'normal', '檢查行高' );
            equal( $( p ).css('font-size'), '36px', '檢查字體');
            start();
        }, 20 );
        stop();
} );

/*<li>1             	multiPara	  36To16To36</li>*/
//test( '多個段落設置多倍行距，段落中字體大小各不相同', function () {
//        var editor = te.obj[0];
//        var range = te.obj[1];
//        var body = editor.body;
//        editor.setContent( '<p style="font-size: 36px">hello</p><p style="font-size: 16px">hello</p><p style="font-size: 36px">hello</p>' );
//        range.setStart( body.firstChild, 0 ).setEnd( body.lastChild, 1 ).select();
//        editor.execCommand( 'lineheight', 1 );
//        setTimeout( function () {
//                var ps = body.childNodes;
//                equal( $( ps[0] ).css( 'line-height' ), '36px', '第1個p行高為36px' );
//                equal( $( ps[1] ).css( 'line-height' ), '16px', '第2個p行高為36px' );
//                equal( $( ps[2] ).css( 'line-height' ), '36px', '第3個p行高為36px' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "1", '第1個p行間距為1' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "1", '第2個p行間距為1' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "1", '第3個p行間距為1' );
//                start();
//        }, 20 );
//        stop();
//} );
//
///*<li>1              collapse 	      16to36To16</li>*/
//test( '多個段落設置多倍行距，段落中字體大小各不相同', function () {
//        var editor = te.obj[0];
//        var range = te.obj[1];
//        var body = editor.body;
//        editor.setContent( '<p style="font-size: 16px">hello</p><p style="font-size: 36px">hello</p><p style="font-size: 16px">hello</p>' );
//        range.setStart( body.firstChild, 0 ).setEnd( body.lastChild, 1 ).select();
//        editor.execCommand( 'lineheight', 1 );
//        setTimeout( function () {
//                var ps = body.childNodes;
//                compareLineHeight( ps[0], $( ps[0] ).css( 'line-height' ), '行距為1，第1個p行高' );
//                compareLineHeight( ps[1], $( ps[1] ).css( 'line-height' ), '行距為1，第2個p行高' );
//                compareLineHeight( ps[2], $( ps[2] ).css( 'line-height' ), '行距為1，第3個p行高' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "1", '第1個p行間距為1' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "1", '第2個p行間距為1' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "1", '第3個p行間距為1' );
//                start();
//        }, 20 );
//        stop();
//} );
//
///*<li>1to3to1 	singlePara	  字號統一</li>*/
//test( '1個段落設置多倍行距，字號相同', function () {
//        var editor = te.obj[0];
//        var range = te.obj[1];
//        var body = editor.body;
//        editor.setContent( '<p style="font-size: 36px">hello</p>' );
//        range.selectNode( body.firstChild ).select();
//        editor.execCommand( 'lineheight', 1 );
//        setTimeout( function () {
//                var p = body.firstChild;
//                equal( $( p ).css( 'line-height' ), '36px', '第1個p行高為36px' );
//                editor.execCommand( 'lineheight', 3 );
//                p = body.firstChild;
//                compareLineHeight( p, $( p ).css( 'line-height' ), '行距為1，第1個p行高' );
//                editor.execCommand( 'lineheight', 1 );
//                var p = body.firstChild;
//                equal( $( p ).css( 'line-height' ), '36px', '第1個p行高為36px' );
//                start();
//        }, 20 );
//        stop();
//} );
//
///* <li>1to3to1	multiPara	16to36To16</li>*/
//test( '多個段落設置多倍行距，字號不同', function () {
//        var editor = te.obj[0];
//        var range = te.obj[1];
//        var body = editor.body;
//        editor.setContent( '<p style="font-size: 16px">hello</p><p style="font-size: 36px">hello</p><p style="font-size: 16px">hello</p>' );
//        range.setStart( body.firstChild.firstChild, 1 ).setEnd( body.lastChild.firstChild, 2 ).select();
//        editor.execCommand( 'lineheight', 1 );
//        setTimeout( function () {
//                var ps = body.childNodes;
//                compareLineHeight( ps[0], $( ps[0] ).css( 'line-height' ), '行距為1，第1個p行高' );
//                compareLineHeight( ps[1], $( ps[1] ).css( 'line-height' ), '行距為1，第2個p行高' );
//                compareLineHeight( ps[2], $( ps[2] ).css( 'line-height' ), '行距為1，第3個p行高' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "1", '第3個p行間距為1' );
//
//                range.setStart( body.firstChild.firstChild, 1 ).setEnd( body.lastChild.firstChild, 2 ).select();
//                editor.execCommand( 'lineheight', 3 );
//                ps = body.childNodes;
//                compareLineHeight( ps[0], $( ps[0] ).css( 'line-height' ), '行距為3，第1個p行高' );
//                compareLineHeight( ps[1], $( ps[1] ).css( 'line-height' ), '行距為3，第2個p行高' );
//                compareLineHeight( ps[2], $( ps[2] ).css( 'line-height' ), '行距為3，第3個p行高' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "3", '第1個p行間距為1' );
//
//                range.setStart( body.firstChild.firstChild, 1 ).setEnd( body.lastChild.firstChild, 2 ).select();
//                editor.execCommand( 'lineheight', 1 );
//                ps = body.childNodes;
//                compareLineHeight( ps[0], $( ps[0] ).css( 'line-height' ), '行距為1，第1個p行高' );
//                compareLineHeight( ps[1], $( ps[1] ).css( 'line-height' ), '行距為1，第2個p行高' );
//                compareLineHeight( ps[2], $( ps[2] ).css( 'line-height' ), '行距為1，第3個p行高' );
//                range.selectNode( ps[0] ).select();
//                equal( editor.queryCommandValue( 'lineheight' ), "1", '第1個p行間距為1' );
//                start();
//        }, 20 );
//        stop();
//
//} );