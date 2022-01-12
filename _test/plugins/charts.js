module( 'plugins.charts' );

test( '圖表命令檢測', function() {
    expect(3);

    var container = te.obj[0].container,
        editor = null,
        count = 0;

    UE.delEditor( te.obj[0] );
    container.parentNode.removeChild( container );

    container = document.createElement( "div" );
    container.id = "container";
    document.body.appendChild( container );
    editor = UE.getEditor( "container", {
        initialContent: '<table><tbody><tr><td width="147" valign="top">' +
                        '<br></td><td width="147" valign="top"><br></td>' +
                        '<td width="147" valign="top"><br></td><td width="147" valign="top">' +
                        '<br></td><td width="147" valign="top"><br></td></tr></tbody></table>'
    } );


    stop();

    editor.ready( function () {

        var firstTd = editor.body.getElementsByTagName("td")[0];
        var range = new baidu.editor.dom.Range(editor.document);

        range.selectNode( firstTd).collapse(true).select();

        equal( editor.queryCommandState( 'charts' ), -1, '數據驗證失敗， 狀態為禁用' );



        //設置數據格式合法的表格
        editor.setContent('<table width="992"><tbody><tr class="firstRow"><th valign="null" width="141"><br></th><th width="141">a</th><th width="141">b</th><th width="142">c</th><th width="142">d</th><th width="142">e</th><th width="142">f</th></tr><tr><th valign="null" width="141">1999</th><td valign="top" width="141">1</td><td valign="top" width="141">2</td><td valign="top" width="142">3</td><td valign="top" width="142">4</td><td valign="top" width="142">5</td><td valign="top" width="142">6</td></tr></tbody></table>');

        firstTd = editor.body.getElementsByTagName("td")[0];

        range.setStart( firstTd,0).collapse(true).select();

        equal( editor.queryCommandState( 'charts' ) != -1, true, '數據合法， 狀態可用' );

        editor.execCommand( 'charts', {
            title: '測試標題',
            subTitle: '標題2',
            xTitle: 'X軸標題',
            yTitle: 'Y軸標題',
            suffix: '後綴',
            tip: '提示',
            dataFormat: '1',
            chartType: 1
        } );

        var tableNode = editor.body.getElementsByTagName("table")[0];

        equal( tableNode.getAttribute("data-chart") !== null, true, '插入圖表命令執行成功' );

        setTimeout(function(){
            UE.delEditor("container");
            document.getElementById("container")&&te.dom.push( document.getElementById("container"));
            start();
        },300);

    }  );

} );
test( '圖表命令檢測', function() {
//    expect(5);

    UE.delEditor( te.obj[0] );
    var div = document.createElement( "div" );
    div.id = "container";
    document.body.appendChild( div );
    var editor = UE.getEditor( "container", {
        initialContent: '<table><tbody><tr><td width="147" valign="top">' +
            '<br></td></tr><tr><td width="147" valign="top"><br></td></tr></tbody></table>'
    } );
    stop();
    editor.ready( function () {
        var  range = editor.selection.getRange();
        range.selectNode( editor.body.getElementsByTagName("td")[0]).collapse(true).select();
        equal( editor.queryCommandState( 'charts' ), -1, '列數不夠， 狀態為禁用' );
        // <table><tbody><tr class="firstRow"><th></th><th></th></tr><tr><td width="483" valign="top" style="word-break: break-all;">1</td><td width="483" valign="top" style="word-break: break-all;">2</td></tr><tr><td width="483" valign="top" style="word-break: break-all;">2</td><td width="483" valign="top" style="word-break: break-all;">2</td></tr></tbody></table>
        editor.setContent('<table><tbody><tr class="firstRow"><th></th><td>e</td></tr><tr><td width="483" valign="top" style="word-break: break-all;">1</td><td width="483" valign="top" style="word-break: break-all;">2</td></tr><tr><td width="483" valign="top" style="word-break: break-all;">2</td><td width="483" valign="top" style="word-break: break-all;">2</td></tr></tbody></table>');
        range.selectNode( editor.body.getElementsByTagName("td")[0]).collapse(true).select();
        equal( editor.queryCommandState( 'charts' ), -1, '第一行不都是th， 狀態為禁用' );
        editor.setContent('<table><tbody><tr class="firstRow"><th></th><th>e</th></tr><tr><td width="483" valign="top" style="word-break: break-all;">1</td><td width="483" valign="top" style="word-break: break-all;">2</td></tr><tr><td width="483" valign="top" style="word-break: break-all;">2</td><td width="483" valign="top" style="word-break: break-all;">2</td></tr></tbody></table>');
        range.selectNode( editor.body.getElementsByTagName("td")[0]).collapse(true).select();
        equal( editor.queryCommandState( 'charts' ), -1, '第一列不是th， 狀態為禁用' );
        editor.setContent('<table width="992" ><tbody><tr class="firstRow"><th width="364"></th><th width="364"></th><th width="364"></th></tr><tr><th valign="null" width="263">5</th><td valign="top" style="word-break: break-all;" width="364" rowspan="2" colspan="1">5</td><td valign="top" style="word-break: break-all;" width="364">2</td></tr><tr><th valign="null" width="263"></th><td valign="top" style="word-break: break-all;" width="364">2</td></tr>   <tr><th></th><td valign="top" colspan="1" rowspan="1">2</td><td valign="top" colspan="1" rowspan="1">4</td></tr></tbody></table>');
        range.selectNode( editor.body.getElementsByTagName("td")[0]).collapse(true).select();
        equal( editor.queryCommandState( 'charts' ), -1, '每行單元格數不匹配， 狀態為禁用' );
        editor.setContent('<table width="992"><tbody><tr class="firstRow"><th valign="null" width="263"></th><th width="364"></th><th width="364"></th></tr><tr><th valign="null" width="263"></th><td valign="top" style="word-break: break-all;" width="364" class="selectTdClass">1</td><td valign="top" style="word-break: break-all;" width="364">ee</td></tr><tr><th valign="null" width="263"></th><td valign="top" style="word-break: break-all;" width="364" class="selectTdClass">2</td><td valign="top" style="word-break: break-all;" width="364">2</td></tr></tbody></table>');
        range.selectNode( editor.body.getElementsByTagName("td")[0]).collapse(true).select();
        equal( editor.queryCommandState( 'charts' ), -1, '內容不是數字， 狀態為禁用' );
        setTimeout(function(){
            UE.delEditor("container");
            document.getElementById("container")&&te.dom.push( document.getElementById("container"));
            start();
        },300);
    }  );
} );