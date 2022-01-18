module( ".path" );

/*trace 3683*/
test( '路徑查找測試', function () {
    equal( UE.getUEBasePath( 'http://www.baidu.com/', './ueditor.config.js' ), 'http://www.baidu.com/', 'WEB路徑-當前目錄下' );
    equal( UE.getUEBasePath( 'http://www.baidu.com/abc/def/', '../ueditor.config.js' ), 'http://www.baidu.com/abc/', 'WEB路徑-父目錄1' );
    equal( UE.getUEBasePath( 'http://www.baidu.com/abc/def', '../ueditor.config.js' ), 'http://www.baidu.com/', 'WEB路徑-父目錄2' );

    equal( UE.getUEBasePath( 'file:///home/hn/a/ueditor/_examples/completeDemo.html', './ueditor.config.js' ), 'file:///home/hn/a/ueditor/_examples/', '本地路徑-linux-當前目錄1' );
    equal( UE.getUEBasePath( 'file:///home/hn/a/ueditor/_examples/completeDemo.html', 'ueditor.config.js' ), 'file:///home/hn/a/ueditor/_examples/', '本地路徑-linux-當前目錄2' );
    equal( UE.getUEBasePath( 'file:///home/hn/a/ueditor/_examples/completeDemo.html', '../ueditor.config.js' ), 'file:///home/hn/a/ueditor/', '本地路徑-linux-父目錄1' );
    equal( UE.getUEBasePath( 'file:///home/hn/a/ueditor/_examples/completeDemo.html', './../ueditor.config.js' ), 'file:///home/hn/a/ueditor/', '本地路徑-linux-父目錄2' );

    equal( UE.getUEBasePath( 'file://C:\\webroot\\ueditor\\_examples\\completeDemo.html', './ueditor.config.js' ), 'file://C:/webroot/ueditor/_examples/', '本地路徑-windows-當前目錄1' );
    equal( UE.getUEBasePath( 'file://C:\\webroot\\ueditor\\_examples\\completeDemo.html', 'ueditor.config.js' ), 'file://C:/webroot/ueditor/_examples/', '本地路徑-windows-當前目錄2' );
    equal( UE.getUEBasePath( 'file://C:\\webroot\\ueditor\\_examples\\completeDemo.html', '../ueditor.config.js' ), 'file://C:/webroot/ueditor/', '本地路徑-windows-父目錄1' );
    equal( UE.getUEBasePath( 'file://C:\\webroot\\ueditor\\_examples\\completeDemo.html', './../ueditor.config.js' ), 'file://C:/webroot/ueditor/', '本地路徑-windows-父目錄2' );

    equal( UE.getUEBasePath( 'http://www.baidu.com/ueditor/completedemo.html', '/ueditorphp/ueditor.config.js' ), 'http://www.baidu.com/ueditorphp/', 'WEB路徑-當前目錄下' );
} );