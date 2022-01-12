/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-9-18
 * Time: 下午4:33
 * To change this template use File | Settings | File Templates.
 */
module( 'plugins.autofloat' );
test( '檢查toolbar是否浮動在頁面頂端', function() {
    te.dom[0].parentNode.removeChild(te.dom[0]);
    var sc = document.createElement("script");
    sc.id="sc";
    sc.type = "text/plain";
    sc.style.height = "100px";
    document.body.appendChild(sc);
    var me = UE.getEditor('sc',{'autoFloatEnabled':true,'topOffset':60,'autoHeightEnabled':true,'scaleEnabled':false});
    stop();
    me.ready(function(){
        setTimeout(function () {
            me.setContent('<p><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>sdf</p>');
            var screenX = window.screenX ? window.screenX : window.screenLeft;//不同瀏覽器兼容
            var screenY = window.screenY ? window.screenY : window.screenTop;
            setTimeout(function () {
                var range = new baidu.editor.dom.Range(me.document);
                range.setStart(me.body.firstChild, 1).collapse(1).select();
                me.focus();
                setTimeout(function () {
                    window.scrollBy(screenX, screenY + $(document.body).height());
                    setTimeout(function () {
                        var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;//不同瀏覽器兼容
////                //ie6下，工具欄浮動不到正確位置
                        if (ua.browser.ie != 6&&!ua.browser.gecko)
                            equal(scrollTop, $(me.ui.getDom('toolbarbox')).offset().top - 60, '檢查toolbar是否在頁面頂端');
                        window.scrollTo(screenX, screenY - $(document.body).height());
                        setTimeout(function () {
                            equal(me.ui.getDom().childNodes[0].id, me.ui.getDom('toolbarbox').id, 'toolbar是第一個元素');
                            document.getElementById('sc').parentNode.removeChild(document.getElementById('sc'));
                            start();
                        }, 500);
                    }, 500);
                }, 1000);
            }, 200);
        }, 800);
    });

});

