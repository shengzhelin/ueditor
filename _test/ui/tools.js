/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-4-12
 * Time: 下午1:26
 * To change this template use File | Settings | File Templates.
 */
(function() {
    function mySetup() {
        for (var config in window.UEDITOR_CONFIG) {
            if (typeof(window.UEDITOR_CONFIG[config]) == 'string')
                window.UEDITOR_CONFIG[config] = window.UEDITOR_CONFIG[config].replace('_test/tools/br/', '');
        }

        var ui = baidu.editor.ui;
        var div = document.createElement('div');
        document.body.appendChild(div);
        div.id = 'editor';
        var ue = new UE.ui.Editor({'UEDITOR_HOME_URL':'../../../','autoFloatEnabled':true});
        setTimeout(function(){
            te.dom.push(div);
            te.obj.push(ui);
            te.obj.push( ue );
            QUnit.readyFlag =1;
        },20);
        stop();
        QUnit.readyFlag =0;
        document.getElementsByClassName = function(eleClassName) {
            var getEleClass = [];//定義一個數組
            var myclass = new RegExp("\\b" + eleClassName + "\\b");//創建一個正則表達式對像
            var elem = this.getElementsByTagName("*");//獲取文檔里所有的元素
            for (var h = 0; h < elem.length; h++) {
                var classes = elem[h].className;//獲取class對像
                if (myclass.test(classes)) getEleClass.push(elem[h]);//正則比較，取到想要的CLASS對像
            }
            return getEleClass;//返回數組
        }
    }

    var _d = function() {
        if (te) {
            if (te.dom && te.dom.length) {
                for (var i = 0; i < te.dom.length; i++) {
                    if (te.dom[i] && te.dom[i].parentNode)
                        te.dom[i].parentNode.removeChild(te.dom[i]);
                }

            }
        }

        te.dom = [];
        te.obj = [];
    }

    var s = QUnit.testStart,d = QUnit.testDone;
    QUnit.testStart = function() {
        s.apply(this, arguments);
        mySetup();
    };
    QUnit.testDone = function() {
        _d();
        d.apply(this, arguments);
    }

})()