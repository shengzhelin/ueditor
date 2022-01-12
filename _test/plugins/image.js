module( 'plugins.image' );
/**
 * 插入視頻
 * 插入圖像
 * 選區閉合和不閉合
 * 表格中插入圖像
 */
/*trace1491 修改動圖的寬高*/
test( 'trace1491 修改動圖的寬高', function () {
    setTimeout(function () {
        expect(3);
        var editor = te.obj[0];
        var range = te.obj[1];
        var body = editor.body;
        editor.setContent('<p><br></p>');
        setTimeout(function () {
            range.setStart(body.firstChild, 0).collapse(1).select();
            editor.execCommand('insertimage', {src: '../data/test.JPG'});
            setTimeout(function () {
                ua.manualDeleteFillData(editor.body);
                range.selectNode(body.firstChild.firstChild).select();
                var img = body.getElementsByTagName('img')[0];
                editor.execCommand('insertimage', {src: '../data/test.JPG', width: 50, height: 80});
                setTimeout(function () {
                    equal($(img).attr('width'), '50', '比較width');
                    equal($(img).attr('height'), '80', '比較width');
                    ok(/data\/test\.JPG/.test(img.getAttribute('src')), '比較src');
                    start();
                }, 500);
            }, 100);
        }, 100);
    }, 100);
    stop();
} );
test( '插入新圖像', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p><br></p>' );
    range.setStart( body.firstChild, 0 ).collapse( 1 ).select();
    editor.execCommand( 'insertimage', {src:'http://img.baidu.com/hi/jx2/j_0001.gif', width:50, height:51} );
    ua.manualDeleteFillData( editor.body );
    var img = body.getElementsByTagName( 'img' )[0];
    equal( img.getAttribute( 'src' ), 'http://img.baidu.com/hi/jx2/j_0001.gif', '比較src' );
    equal( img.getAttribute( 'width' ), '50', '比較width' );
    equal( img.getAttribute( 'height' ), '51', '比較height' );
} );

/*trace 1490 不設寬高，插入圖片*/
test( 'trace 1490 不設寬高，插入圖片', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p><br></p>' );
    range.setStart( body.firstChild, 0 ).collapse( 1 ).select();
    editor.execCommand( 'insertimage', {src:'http://img.baidu.com/hi/jx2/j_0001.gif'} );
    ua.manualDeleteFillData( editor.body );
    var img = body.getElementsByTagName( 'img' )[0];
    equal( img.getAttribute( 'src' ), 'http://img.baidu.com/hi/jx2/j_0001.gif', '比較src' );
} );

test( '插入對齊方式為居中對齊的圖像，新建一個p，在p上設置居中對齊', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello</p>' );
    range.setStart( body.firstChild, 0 ).collapse( 1 ).select();
    editor.execCommand( 'insertimage', {src:'http://img.baidu.com/hi/jx2/j_0001.gif', width:50, height:51, floatStyle:'center'} );
    ua.manualDeleteFillData( editor.body );

    var img = body.getElementsByTagName( 'img' )[0];
    equal( body.childNodes.length, 2, '2個p' );
    var p = body.firstChild;
    equal( p.style['textAlign'], 'center', '居中對齊' );
    ok( p.nextSibling.innerHTML.indexOf( 'hello' ) > -1, '第二個p里面是hello' );      //1.2版本在FF中，hello前有不可見字符
    if ( baidu.editor.browser.ie )
            equal( img.style['styleFloat'], '', 'float為空' );
    else
            equal( img.style['cssFloat'], '', 'float為空' );
    equal( img.getAttribute( 'src' ), 'http://img.baidu.com/hi/jx2/j_0001.gif', '比較src' );
    equal( img.getAttribute( 'width' ), '50', '比較width' );
    equal( img.getAttribute( 'height' ), '51', '比較height' );
} );

test( '修改已有圖片的屬性', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p><img src="http://img.baidu.com/hi/jx2/j_0004.gif" >hello<img src="http://img.baidu.com/hi/jx2/j_0053.gif" ></p>' );
    range.selectNode( body.firstChild.firstChild ).select();
    editor.execCommand( 'insertimage', {src:'http://img.baidu.com/hi/jx2/j_0018.gif'} );
    equal( ua.getChildHTML( body.firstChild ), '<img src="http://img.baidu.com/hi/jx2/j_0018.gif" _src=\"http://img.baidu.com/hi/jx2/j_0004.gif\">hello<img src="http://img.baidu.com/hi/jx2/j_0053.gif" _src=\"http://img.baidu.com/hi/jx2/j_0053.gif\">', '檢查插入的圖像地址' );
    equal( body.firstChild.childNodes.length, 3, '2個img孩子' );
} );


test( '選區不閉合插入圖像', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello1</p><p>hello2<img src="http://img.baidu.com/hi/jx2/j_0004.gif"></p>' );
    setTimeout(function(){
        range.setStart( body.firstChild.firstChild, 2 ).setEnd( body.lastChild, 2 ).select();
        editor.execCommand( 'insertimage', {src:'http://img.baidu.com/hi/jx2/j_0016.gif', width:'100', height:'100'} );
        ua.manualDeleteFillData( editor.body );
        equal( body.childNodes.length, 1, '只有一個p' );
        ua.clearWhiteNode(body.firstChild);
        var img = body.firstChild.lastChild;
        equal( img.getAttribute( 'src' ), 'http://img.baidu.com/hi/jx2/j_0016.gif', '比較src' );
        equal( img.getAttribute( 'width' ), '100', '比較width' );
        equal( img.getAttribute( 'height' ), '100', '比較height' );
        start();
    },50);
    stop();
} );

test( '圖像設置左右浮動', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello1</p><p>hello2<img src="http://img.baidu.com/hi/jx2/j_0004.gif"></p>' );
    range.selectNode( body.lastChild.lastChild ).select();
    editor.execCommand( 'imagefloat', 'left' );
    equal( body.getElementsByTagName( 'img' )[0].style['cssFloat'] || body.getElementsByTagName( 'img' )[0].style['styleFloat'], 'left', '左浮動' );
//        equal( body.getElementsByTagName( 'img' )[0].style['float'], 'left', '左浮動' );
    equal( editor.queryCommandValue( 'imagefloat' ), 'left' );

    editor.execCommand( 'imagefloat', 'right' );
    equal( body.getElementsByTagName( 'img' )[0].style['cssFloat'] || body.getElementsByTagName( 'img' )[0].style['styleFloat'], 'right', '右浮動' );
    equal( editor.queryCommandValue( 'imagefloat' ), 'right' );
    equal( editor.queryCommandState( 'imagefloat' ), 0, '圖片被選中，因此圖片選單高亮' );
    range.setStart( body.firstChild, 0 ).collapse( 1 ).select();
    equal( editor.queryCommandState( 'imagefloat' ), -1, '光標閉合，因此圖片選單高不高亮' );
    equal( editor.queryCommandValue( 'justify' ), 'left', '段落的對齊方式為左對齊' );
    equal( editor.queryCommandValue( 'imagefloat' ), 'none', '圖片對齊方式在閉合情況獲取為空' )
    range.selectNode( body.firstChild.firstChild ).select();
    equal( editor.queryCommandValue( 'imagefloat' ), 'none', '選中文本，因此圖片選單高不高亮' );
} );

test( '左浮動變為默認的樣式和居中', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello1</p><p>hello2<img src="http://img.baidu.com/hi/jx2/j_0004.gif" style="float:left"></p>' );
    range.selectNode( body.lastChild.lastChild ).select();
    editor.execCommand( 'imagefloat', 'none' );
    equal( ua.getFloatStyle( body.getElementsByTagName( 'img' )[0] ), '', '沒有浮動方式' );
    equal( editor.queryCommandValue( 'imagefloat' ), 'none' );
    $( body.getElementsByTagName( 'img' )[0] ).css( 'float' );
    range.selectNode( body.getElementsByTagName( 'img' )[0] ).select();
    editor.execCommand( 'imagefloat', 'center' );
    equal( editor.queryCommandValue( 'imagefloat' ), 'center' );
    equal( body.childNodes.length, 3, '3個p，image被切出一個p出來了' );
    var p = body.childNodes[2];
    equal( p.tagName.toLowerCase(), 'p', '第2個是p' );
        equal( p.firstChild.tagName.toLowerCase(), 'img', 'p的孩子為image' );
        equal( ua.getFloatStyle( p.firstChild ), '', 'image對齊方式float為空' );
        equal( editor.queryCommandValue( 'justify' ), 'center', '段落的對齊方式為居中' );
} );

test( ' 帶有超鏈接的圖片', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello1</p><p>hello2<a href="www.baidu.com"><img src="http://img.baidu.com/hi/jx2/j_0004.gif" style="float:left"></a></p>' );
    range.selectNode( body.lastChild.lastChild ).select();
    editor.execCommand( 'imagefloat', 'center' );
    var p = body.childNodes[2];
    equal( p.firstChild.tagName.toLowerCase(), 'a', 'p的孩子為a' );
    equal( ua.getFloatStyle( p.firstChild ), '', 'image對齊方式float為空' );
    equal( editor.queryCommandValue( 'justify' ), 'center', '段落的對齊方式為居中' );

    editor.execCommand( 'imagefloat', 'left' );
    equal( p.firstChild.tagName.toLowerCase(), 'a', 'p的孩子為a' );
    equal( ua.getFloatStyle( p.firstChild.firstChild ), 'left', 'image對齊方式float為left' );

    editor.execCommand( 'imagefloat', 'none' );
    equal( p.firstChild.tagName.toLowerCase(), 'a', 'p的孩子為a' );
    equal( ua.getFloatStyle( p.firstChild.firstChild ), '', 'image對齊方式float為空' );
} );

test( ' 默認樣式切換到居中再切換回默認，會把居中導致的3個p合併', function () {
    var editor = te.obj[0];
    var range = te.obj[1];
    var body = editor.body;
    editor.setContent( '<p>hello2<a href="www.baidu.com"><img src="http://img.baidu.com/hi/jx2/j_0004.gif" style="float:left"></a>hello3</p>' );
    setTimeout( function () {
        range.selectNode( body.getElementsByTagName( 'a' )[0] ).select();
        editor.execCommand( 'imagefloat', 'center' );
        var p = body.childNodes[1];
        equal( p.firstChild.tagName.toLowerCase(), 'a', 'p的孩子為a' );
        equal( ua.getFloatStyle( p.firstChild ), '', 'image對齊方式float為空' );
        equal( editor.queryCommandValue( 'justify' ), 'center', '段落的對齊方式為居中' );
        editor.execCommand( 'imagefloat', 'none' );
        equal( body.childNodes.length, 1, '3個p合併為1個' );

        var a = body.firstChild.firstChild.nextSibling;
        equal( a.tagName.toLowerCase(), 'a', 'p的孩子為a' );
        equal( a.firstChild.tagName.toLowerCase(), 'img', 'a的孩子是img' );
        equal( ua.getFloatStyle( a.firstChild ), '', 'image對齊方式float為空' );
        start();
    }, 50 );
    stop();
} );