module( 'plugins.fiximgclick' );

test( 'webkit下圖片可以被選中並出現八個角', function() {
    if ( ua.browser.webkit ) {
        var sc = document.createElement("script");
        sc.id="sc";
        sc.type = "text/plain";
        document.body.appendChild(sc);
        var editor = new UE.ui.Editor({'autoFloatEnabled':true,'topOffset':60,'autoHeightEnabled':true,'scaleEnabled':false});
        editor.render(sc.id);
        editor.ready(function () {
            editor.setContent( '<p>修正webkit下圖片選擇的問題<img src="" width="200" height="100" />修正webkit下圖片選擇的問題</p>' );
            var img = editor.body.getElementsByTagName( 'img' )[0];
            var p = editor.body.firstChild;
            ua.click( img );
            var range = editor.selection.getRange();
            ua.checkResult( range, p, p, 1, 2, false, '檢查當前的range是否為img' );
            var scale = document.getElementById(editor.ui.id + '_scale');
            ok(scale && scale.style.display!='none', "檢查八個角是否已出現");
            ok(img.style.width == scale.style.width && img.style.height == scale.style.height, "檢查八個角和圖片寬高度是否相等");
            UE.delEditor(sc.id);
            domUtils.remove(sc);
            start();
        });
        stop();
    }
} );

test( '鼠標在八個角上拖拽改變圖片大小', function() {
    if ( ua.browser.webkit ) {
        var sc = document.createElement("script");
        sc.id="sc";
        sc.type = "text/plain";
        document.body.appendChild(sc);
        var editor = new UE.ui.Editor({'autoFloatEnabled':true,'topOffset':60,'autoHeightEnabled':true,'scaleEnabled':false});
        editor.render(sc.id);
        editor.ready(function () {
            editor.setContent( '<p>修正webkit下圖片選擇的問題<img src="" width="200" height="100" />修正webkit下圖片選擇的問題</p>' );
            var img = editor.body.getElementsByTagName( 'img' )[0];
            var p = editor.body.firstChild;
            ua.click( img );
            var scale = document.getElementById(editor.ui.id + '_imagescale');
            var hand0 = scale.children[0], width, height;
            width = parseInt(scale.style.width);
            height = parseInt(scale.style.height);
            ua.mousedown( hand0, {clientX: 322, clientY: 281} );
            ua.mousemove( document, {clientX: 352, clientY: 301} );
            equal(width-parseInt(scale.style.width), 30, "檢查鼠標拖拽中圖片寬度是否正確 --");
            equal(height-parseInt(scale.style.height), 20, "檢查鼠標拖拽中圖片高度是否正確 --");
            ua.mousemove( document, {clientX: 382, clientY: 321} );
            ua.mouseup( document, {clientX: 382, clientY: 321} );
            equal(width-parseInt(scale.style.width), 60, "檢查鼠標拖拽完畢圖片高度是否正確 --");
            equal(height-parseInt(scale.style.height), 40, "檢查鼠標拖拽完畢圖片高度是否正確 --");
            ok(img.style.width == scale.style.width && img.style.height == scale.style.height, "檢查八個角和圖片寬高度是否相等");
            UE.delEditor(sc.id);
            domUtils.remove(sc);
            start();
        });
        stop();
    }
} );

test( '鼠標點擊圖片外的其他區域時，八個角消失', function() {
    if ( ua.browser.webkit ) {
        var sc = document.createElement("script");
        sc.id="sc";
        sc.type = "text/plain";
        document.body.appendChild(sc);
        var editor = new UE.ui.Editor({'autoFloatEnabled':true,'topOffset':60,'autoHeightEnabled':true,'scaleEnabled':false});
        editor.render(sc.id);
        editor.ready(function () {
            editor.setContent( '<p>修正webkit下圖片選擇的問題<img src="" width="200" height="100" />修正webkit下圖片選擇的問題</p>' );
            var img = editor.body.getElementsByTagName( 'img' )[0];
            var p = editor.body.firstChild;
            ua.click( img );
            var scale = document.getElementById(editor.ui.id + '_imagescale'),
                cover = document.getElementById(editor.ui.id + '_imagescale_cover');
            ok(scale && scale.style.display!='none', "檢查八個角是否已出現");
            ok(cover && cover.style.display!='none', "檢查遮罩層是否已出現");
            ua.mousedown( editor.ui.getDom(), {clientX: 100, clientY: 100} );
            ok(cover && cover.style.display=='none', "檢查遮罩層是否已消失");
            ok(scale && scale.style.display=='none', "檢查八個角是否已消失");
            UE.delEditor(sc.id);
            domUtils.remove(sc);
            start();
        });
        stop();
    }
} );

test( '鍵盤有操作時，八個角消失', function() {
    if ( ua.browser.webkit ) {
        var sc = document.createElement("script");
        sc.id="sc";
        sc.type = "text/plain";
        document.body.appendChild(sc);
        var editor = new UE.ui.Editor({'autoFloatEnabled':true,'topOffset':60,'autoHeightEnabled':true,'scaleEnabled':false});
        editor.render(sc.id);
        editor.ready(function () {
            editor.setContent( '<p>修正webkit下圖片選擇的問題<img src="" width="200" height="100" />修正webkit下圖片選擇的問題</p>' );
            var img = editor.body.getElementsByTagName( 'img' )[0];
            var p = editor.body.firstChild;
            ua.click( img );
            var scale = document.getElementById(editor.ui.id + '_imagescale'),
                cover = document.getElementById(editor.ui.id + '_imagescale_cover');
            ok(scale && scale.style.display!='none', "檢查八個角是否已出現");
            ok(cover && cover.style.display!='none', "檢查遮罩層是否已出現");
            ua.keydown( editor.ui.getDom());
            ok(cover && cover.style.display=='none', "檢查遮罩層是否已消失");
            ok(scale && scale.style.display=='none', "檢查八個角是否已消失");
            UE.delEditor(sc.id);
            domUtils.remove(sc);
            start();
        });
        stop();
    }
} );