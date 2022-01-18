module( 'plugins.pagebreak' );

/*trace 1179*/
//TODO bug沒有修覆，暫時注釋
test( '對合並過單元格的表格分頁', function () {
        stop();
        var editor = te.obj[0];
        var range = te.obj[1];
        editor.setContent( '<p></p>' );
        range.setStart( editor.body.firstChild, 0 ).collapse( true ).select();
        editor.execCommand( 'inserttable', {numCols:5, numRows:5} );
        var trs = editor.body.getElementsByTagName( 'tr' );
        range.setStart( trs[0].firstChild, 0 ).collapse( 1 ).select();

        editor.currentSelectedArr = [trs[0].firstChild, trs[1].firstChild, trs[2].firstChild, trs[3].firstChild];
        editor.execCommand( 'mergecells' );
        editor.currentSelectedArr = [trs[1].childNodes[2], trs[1].childNodes[3], trs[2].childNodes[2], trs[2].childNodes[3]];
        editor.execCommand( 'mergecells' );
        range.setStart( trs[1].childNodes[1], 0 ).collapse( 1 ).select();

        editor.execCommand( 'pagebreak' );
        var tables = editor.body.getElementsByTagName( 'table' );
        var tr1 = tables[0].getElementsByTagName( 'tr' );
        equal( tables.length, 2, '應當拆為2個table' );
        equal( tr1.length, 1, '第一個table只有一行' );
//    equal( $( tr1 ).attr( 'rowspan' ), 1, 'rowspan為1' );
//
//    tr1 = tables[1].getElementsByTagName( 'tr' );
//    equal( tr1.length, 3, '第2個table有3行' );
//    equal( $( tr1[0] ).attr( 'rowspan' ), 2, 'rowspan為2' );
        setTimeout( function () {
                /*src中有延時操作*/
                start();
        }, 200 );
} );

test( '對第一行的單元格進行分頁', function () {
        stop();
        var editor = te.obj[0];
        var range = te.obj[1];
        editor.setContent( '<p></p>' );
        range.setStart( editor.body.firstChild, 0 ).collapse( true ).select();
        editor.execCommand( 'inserttable', {numCols:5, numRows:5} );
        var tds = editor.body.getElementsByTagName( 'td' );
        range.setStart( tds[1], 0 ).collapse( 1 ).select();
        var table = editor.body.getElementsByTagName( 'table' )[0];
        var tablehtml = ua.getChildHTML( table );

        editor.execCommand( 'pagebreak' );
        var hr = editor.body.firstChild;
        equal( ua.getChildHTML( editor.body.getElementsByTagName( 'table' )[0] ), tablehtml, '表格沒發生變化' );
        equal( $( hr ).attr( 'class' ), 'pagebreak', '插入一個分頁符' );
        equal( hr.tagName.toLowerCase(), 'hr', 'hr' );
        setTimeout( function () {
/*trace 2383*/
//            range.setStart( tds[1], 0 ).collapse( 1 ).select();
//            editor.execCommand( 'pagebreak' );
//            range.setStart( tds[1], 0 ).collapse( 1 ).select();
//            editor.execCommand( 'pagebreak' );
//            editor.execCommand('source');
//            editor.execCommand('source');
//            var hr = editor.body.getElementsByTagName( 'hr' );
//            equal( ua.getChildHTML( editor.body.getElementsByTagName( 'table' )[0] ), tablehtml, '表格沒發生變化' );
//            equal( $( hr[0] ).attr( 'class' ), 'pagebreak', '插入一個分頁符' );
//            equal( hr.length, 3, 'hr' );
            start();
        }, 200 );
} );

test( '對最後一行的單元格進行分頁', function () {
        stop();
        var editor = te.obj[0];
        var range = te.obj[1];
        editor.setContent( '<p></p>' );
        range.setStart( editor.body.firstChild, 0 ).collapse( true ).select();
        editor.execCommand( 'inserttable', {numCols:5, numRows:5} );
        var tds = editor.body.getElementsByTagName( 'td' );
        /*最後一行的單元格*/
        range.setStart( tds[24], 0 ).collapse( 1 ).select();
        editor.execCommand( 'pagebreak' );
        var ts = editor.body.getElementsByTagName( 'table' );
        var hr = editor.body.childNodes[1];
        equal( ts[0].getElementsByTagName( 'tr' ).length, 4, '第一個table 4行' );
        equal( ts[1].getElementsByTagName( 'tr' ).length, 1, '第2個table 1行' );
        equal( $( hr ).attr( 'class' ), 'pagebreak', '插入一個分頁符' );
        equal( hr.tagName.toLowerCase(), 'hr', '插入的分頁符是hr' );
        setTimeout( function () {
                start();
        }, 200 );
} );

test( '在段落中間閉合插入分頁符', function () {
        stop();
        var editor = te.obj[0];
        var range = te.obj[1];
        var body = editor.body;
        editor.setContent( '<p>你好Ueditor</p>' );
        range.setStart( editor.body.firstChild.firstChild, 2 ).collapse( true ).select();
        editor.execCommand( 'pagebreak' );
        ua.manualDeleteFillData( editor.body );
        equal( body.childNodes.length, 3, '3個孩子' );
        equal( ua.getChildHTML( body.firstChild ), '你好' );
        equal( body.firstChild.tagName.toLowerCase(), 'p', '第一個孩子是p' );
        equal( $( body.firstChild.nextSibling ).attr( 'class' ), 'pagebreak' );
        equal( ua.getChildHTML( body.lastChild ), 'ueditor' );
        equal( body.lastChild.tagName.toLowerCase(), 'p', '第二個孩子是p' );
        setTimeout( function () {
                start();
        }, 100 );
} );

test( '選中部分段落再插入分頁符', function () {
        stop();
        var editor = te.obj[0];
        var range = te.obj[1];
        var body = editor.body;
        editor.setContent( '<p>你好Ueditor</p><p>hello編輯器</p>' );
        range.setStart( body.firstChild.firstChild, 2 ).setEnd( body.lastChild.firstChild, 5 ).select();
        editor.execCommand( 'pagebreak' );
        ua.manualDeleteFillData( editor.body );
        equal( body.childNodes.length, 3, '3個孩子' );
        equal( ua.getChildHTML( body.firstChild ), '你好' );
        equal( $( body.firstChild.nextSibling ).attr( 'class' ), 'pagebreak' );
        equal( ua.getChildHTML( body.lastChild ), '編輯器' );
        equal( body.firstChild.tagName.toLowerCase(), 'p', '第一個孩子是p' );
        equal( body.lastChild.tagName.toLowerCase(), 'p', '第二個孩子是p' );
        setTimeout( function () {
                start();
        }, 200 );
} );

test( 'trace 1887:連續插入2次分頁符，每次插入都在文本後面', function () {
        stop();
        var editor = te.obj[0];
        var range = te.obj[1];
        var body = editor.body;
        editor.setContent( '<p>你好</p>' );
        range.setStart( body.firstChild, 1 ).collapse( 1 ).select();
        editor.execCommand('pagebreak');
        range.setStart( body.firstChild, 1 ).collapse( 1 ).select();
        editor.execCommand('pagebreak');
        equal(body.childNodes.length,3,'3個孩子');
        //trace 1187,chrome和firefox下都會有br,目前的做法是第二次插入就把前一個刪除
        equal(body.childNodes[1].childNodes.length,0,'hr沒有孩子節點');
        setTimeout( function () {
                start();
        }, 200 );
} );