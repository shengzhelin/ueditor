var testingElement = {}, te = testingElement;
te.log = function( url ) {
    var img = new Image(),
        key = 'tangram_sio_log_' + Math.floor( Math.random() * 2147483648 ).toString( 36 );

    // 這裡一定要掛在window下
    // 在IE中，如果沒掛在window下，這個img變量又正好被GC的話，img的請求會abort
    // 導致服務器收不到日誌
    window[key] = img;

    img.onload = img.onerror = img.onabort = function() {
        // 下面這句非常重要
        // 如果這個img很不幸正好加載了一個存在的資源，又是個gif動畫
        // 則在gif動畫播放過程中，img會多次觸發onload
        // 因此一定要清空
        img.onload = img.onerror = img.onabort = null;

        window[key] = null;

        // 下面這句非常重要
        // new Image創建的是DOM，DOM的事件中形成閉包環引用DOM是典型的內存泄露
        // 因此這裡一定要置為null
        img = null;
    };

    // 一定要在註冊了事件之後再設置src
    // 不然如果圖片是讀緩存的話，會錯過事件處理
    // 最後，對於url最好是添加客戶端時間來防止緩存
    // 同時服務器也配合一下傳遞Cache-Control: no-cache;
    img.src = url;
};

(function() {
    function mySetup() {
        /*使用注意，由於實現機理的原因，SendKeyboard方法不能在調試狀態下使用
         （應該會導致尋找句柄和編輯器區域錯誤），關掉調試頁面即可正常使用*/
        te.presskey = function( funkey, charkey ) {
            /*必須取到最頂層的窗口的名稱，要不然取不到句柄*/
            var title = top.document.getElementsByTagName( 'title' )[0].innerHTML;
            var plugin = document.getElementById( 'plugin' );
            var browser = ua.getBrowser();
//            if(browser=='maxIE'){
//                title+=' - 傲遊瀏覽器 3.1.5.1000';
//            }
            /*ie需要先觸發一次空的*/
            if ( browser != "ie9" )
                plugin.sendKeyborad( browser, title, "null", "" );
            plugin.sendKeyborad( browser, title, funkey, charkey );
        };
        te.setClipData = function( pasteData ) {
            /*必須取到最頂層的窗口的名稱，要不然取不到句柄*/
            var title = top.document.getElementsByTagName( 'title' )[0].innerHTML;
            var plugin = document.getElementById( 'plugin' );
            var browser = ua.getBrowser();
            plugin.setClipboard( browser, title, pasteData );
        };
        te.dom = [];
        te.obj = [];
    }

    function myTeardown() {
        if ( te ) {
            if ( te.dom && te.dom.length ) {
                for ( var i = 0; i < te.dom.length; i++ )
                    if ( te.dom[i] && te.dom[i].parentNode )
                        te.dom[i].parentNode.removeChild( te.dom[i] );
            }
        }
    }

    var s = QUnit.testStart, e = QUnit.testDone, ms = QUnit.moduleStart, me = QUnit.moduleEnd, d = QUnit.done;
    QUnit.testStart = function() {
        mySetup();
        s.apply( this, arguments );
        ;
    };
    QUnit.testDone = function() {
        e.call( this, arguments );
        myTeardown();
    };
    // QUnit.moduleStart = function() {
    // var h = setInterval(function() {
    // if (window && window['baidu'] && window.document && window.document.body)
    // {
    // clearInterval(h);
    // start();
    // }
    // }, 20);
    // stop();
    // ms.apply(this, arguments);;
    // };
    // QUnit.moduleEnd = function() {
    // me.call(this, arguments);
    // };
    // QUnit.done = function(fail,total) {
    // // d.call(this, arguments);
    // d(fail,total);
    // };
})();

// function Include(src) {
// var url = "http://"
// + location.host
// + location.pathname.substring(0, location.pathname.substring(1)
// .indexOf('/') + 1);
// document.write("<script type='text/javascript' src='" + url
// + "/src/Import.php?f=" + src + "'></script>");
// }
