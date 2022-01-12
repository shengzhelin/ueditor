/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-4-27
 * Time: 下午5:46
 * To change this template use File | Settings | File Templates.
 */
module( 'ui.menubutton' );
test( 'menubutton', function() {
    var editor = new baidu.editor.ui.Editor();
    editor.render("editor");
//設置選單內容
    var val=['1', '1.5','1.75','2', '3', '4', '5'];
    for(var i=0,ci,items=[];ci = val[i++];){
            items.push({
                label : ci,
                value: ci,
                onclick:function(){
                }
            })
    }
    editor.ready(function(){
        var menuButton = new te.obj[0].MenuButton({editor:editor,className : 'edui-for-lineheight',items :items});
        var value = val[1];
        menuButton.setValue(value);
        te.dom[0].innerHTML = menuButton.renderHtml();
        menuButton.postRender();
        menuButton.showPopup();
        equal(menuButton.popup.getDom().style.display,"",'窗口顯示');
        equal(document.getElementsByClassName("edui-popup edui-menu")[0].style.display,"",'menu窗口顯示');
//檢查初始化的顯示
        equal(document.getElementsByClassName("edui-menuitem  edui-"+editor.options.theme+" edui-state-checked").length,1,'設定已經選中一個value');
        equal(document.getElementsByClassName('edui-menuitem  edui-'+editor.options.theme+' edui-state-checked')[0].firstChild.lastChild.innerHTML,value,'檢查選中的value');
//click
        ua.click(document.getElementsByClassName("edui-menu-body")[0].childNodes[2]);
        equal(menuButton.popup.getDom().style.display,"none",'窗口關閉');
        equal(document.getElementsByClassName("edui-popup edui-menu")[0].style.display,"none",'menu窗口關閉');
        menuButton.showPopup();
        if(ua.browser.ie){
            ua.mouseenter(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ok(document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),'mouseover加上hover樣式');
            ua.mousedown(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ok(document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),'mousedown加上active樣式');//edui-state-active
            ua.mouseleave(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ok(!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),' mouseout去掉hover和active樣式');
////////mouseover->mouseout
            ua.mouseenter(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ua.mouseleave(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ok(!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),'mouseout去掉hover和active樣式');
        }
        else{
//mouseover->mousedown->mouseout
            ua.mouseover(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ok(document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),'mouseover加上hover樣式');
            ua.mousedown(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ok(document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),'mousedown加上active樣式');//edui-state-active
            ua.mouseout(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ok(!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),' mouseout去掉hover和active樣式');
////////mouseover->mouseout
            ua.mouseover(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ua.mouseout(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
            ok(!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),'mouseout去掉hover和active樣式');
        }
     /////mousedown->mouseup
        ua.mousedown(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
        ok(!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),'mousedown加上active樣式');
        ua.mouseup(document.getElementsByClassName("edui-menu-body")[0].childNodes[2],{relatedTarget:document.getElementsByClassName('edui-popup edui-menu')[0]});
        ok(!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-hover')&&!document.getElementsByClassName("edui-menu-body")[0].childNodes[2].className.match('edui-state-active'),'mouseup去掉active樣式');
        menuButton.popup.hide();
        start();
    });
    stop();
} );