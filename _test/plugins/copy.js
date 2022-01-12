module('plugins.copy');

//需要點擊授權彈出框,暫時去除
//test('檢查IE下覆制命令是否執行正常', function () {
//
//    if (browser.ie) {
//        var editor = te.obj[0];
//        editor.setContent('<p>hello</p>');
//        editor.focus();
//
//        editor.execCommand('selectall');
//        editor.execCommand('copy');
//        editor.body.innerHTML = '';
//        editor.execCommand('selectall');
//        editor.body.document.execCommand('paste');
//
//        equal(utils.trim(window.clipboardData.getData('text')), 'hello', '檢查粘貼板內容,IE下成功覆制內容');
//        setTimeout(function(){
//            equal(editor.getContent(), '<p>hello</p>', '檢查原生粘貼命令,IE下成功覆制內容');
//            start();
//        },100);
//
//        stop();
//    }
//
//});

test('檢查非IE下是否正常加載zeroclipboard粘貼板插件', function () {
    te.dom[0].parentNode.removeChild(te.dom[0]);
    var sc = document.createElement("script");
    sc.id="sc";
    sc.type = "text/plain";
    sc.style.height = "100px";
    document.body.appendChild(sc);
    var me = UE.getEditor('sc',{'autoFloatEnabled':true,'topOffset':60,'autoHeightEnabled':true,'scaleEnabled':false});
    me.ready(function(){
        setTimeout(function(){
            if (!browser.ie) {
            ok(window.ZeroClipboard, '是否正常加載zeroclipboard粘貼板插件');
            }
            setTimeout(function () {
                UE.delEditor('sc');
                document.getElementById('sc')&&document.getElementById('sc').parentNode.removeChild(document.getElementById('sc'));
                start();
            }, 500);
        }, 300);
    });
    stop();

});