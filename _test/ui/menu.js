/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 12-4-12
 * Time: 下午4:45
 * To change this template use File | Settings | File Templates.
 */
module( 'ui.menu' );
test( 'menu,submenu的顯示', function() {
//設置選單內容\
    var editor = new te.obj[0].Editor();
    var items=[
            {
                label:'刪除',
                cmdName:'delete'
            },
            {
                label:'全選',
                cmdName:'selectall'
            },
            {
                label:'刪除代碼',
                cmdName:'highlightcode',
                icon:'deletehighlightcode'
            },
            {
                label:'清空文檔',
                cmdName:'cleardoc',
                exec:function () {

                    if ( confirm( '確定清空文檔嗎？' ) ) {

                        this.execCommand( 'cleardoc' );
                    }
                }
            },
            '-',
            {
                label:'取消鏈接',
                cmdName:'unlink'
            },
            '-',
            {
                label:'段落格式',
                icon:'justifyjustify',
                subMenu:{
                        items: [{
                            label:'靠左對齊',
                            cmdName:'justify',
                            value:'left',
                            editor:editor
                        },
                        {
                            label:'靠右對齊',
                            cmdName:'justify',
                            value:'right',
                            editor:editor
                        },
                        {
                            label:'居中對齊',
                            cmdName:'justify',
                            value:'center',
                            editor:editor
                        },
                        {
                            label:'兩端對齊',
                            cmdName:'justify',
                            value:'justify',
                            editor:editor
                        }],
                        editor:editor
                }
            }
    ];
    var menu = new te.obj[0].Menu({className : 'edui-for-lineheight',items :items,editor:te.obj[0].Editor()});
    menu.render(te.dom[0]);
    menu.postRender();
    menu.show();
    var menuBody = document.getElementsByClassName("edui-menu-body")[0];
    equal(menuBody.childNodes[0].className,"edui-menuitem  edui-"+editor.options.theme,'menu窗口顯示');
    equal(menuBody.childNodes[0].firstChild.lastChild.innerHTML,"刪除",'menu窗口顯示');
//edui-menuitem edui-menuseparator
    equal(menuBody.childNodes[4].className,"edui-menuitem edui-menuseparator edui-"+editor.options.theme,'menu窗口顯示');
    equal(menuBody.childNodes[4].firstChild.className,"edui-menuseparator-inner edui-"+editor.options.theme,'menu窗口顯示');//edui-menuitem  edui-hassubmenu
    equal(menuBody.childNodes[7].className,"edui-menuitem  edui-"+editor.options.theme + " edui-hassubmenu edui-hassubmenu",'第7個menu有子menu');
    //submenu
    var menuid1 = menu.items[7].id;
    var submenu1 = menu.items[7].subMenu.id;
    equal(document.getElementById(submenu1).style.display,'none','submenu初始的display值："none"');
    if(ua.browser.ie){
        ua.mouseenter(menuBody.childNodes[7]);
    }
    else{
        ua.mouseover(menuBody.childNodes[7]);    }
    setTimeout(function (){
        equal(document.getElementById(submenu1).style.display,'','顯示submenu,檢查submenu的display值:""');
        equal(getElementsByClassName_2(document.getElementById(submenu1),'div','edui-menu-body')[0].childNodes.length,4,'檢查submenu的menuitems數量');
        equal(getElementsByClassName_2(document.getElementById(submenu1),'div','edui-menu-body')[0].firstChild.className,'edui-menuitem  edui-'+editor.options.theme,'檢查submenu的內容');
        equal(getElementsByClassName_2(document.getElementById(submenu1),'div','edui-menuitem')[0].firstChild.lastChild.innerHTML,'靠左對齊','檢查menuitem的內容');
        var menuClass = document.getElementById(menuid1).className;
        equal(menuClass,"edui-menuitem  edui-"+editor.options.theme+" edui-hassubmenu edui-hassubmenu edui-state-hover edui-state-opened",'');
        if(ua.browser.ie){
            ua.mouseleave(document.getElementById(menuid1));
        }
        else{
            ua.mouseout(document.getElementById(menuid1));
        }
        setTimeout(function (){
            equal(document.getElementById(submenu1).style.display,'none','顯示submenu,檢查submenu的display值:""');
            menuClass = document.getElementById(menuid1).className;
            ok(menuClass.indexOf('edui-state-hover')==-1&&menuClass.indexOf('edui-state-opened')==-1,'');
            document.getElementById(submenu1).parentNode.removeChild(document.getElementById(submenu1));
            start();
        }, 450);
    }, 300);
 stop();
    function getElementsByClassName_2(oElm, strTagName, strClassName){
            var arrElements = (strTagName == "*" && oElm.all)? oElm.all :
            oElm.getElementsByTagName(strTagName);
            var arrReturnElements = new Array();
            strClassName = strClassName.replace(/\-/g, "\\-");
            var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
            var oElement;
            for(var i=0; i < arrElements.length; i++){
                oElement = arrElements[i];
                if(oRegExp.test(oElement.className)){
                        arrReturnElements.push(oElement);
                }
            }
            return (arrReturnElements);
        }
} );
test( '先打開一個submenu，再打開另一個submenu', function() {
var editor = new te.obj[0].Editor();
//設置選單內容
    var items=[
            {
                label:'刪除',
                cmdName:'delete'
            },
            {
                label:'段落格式',
                icon:'justifyjustify',
                subMenu:{
                        items: [{
                            label:'靠左對齊',
                            cmdName:'justify',
                            value:'left'

                        },
                        {
                            label:'靠右對齊',
                            cmdName:'justify',
                            value:'right'
                        },
                        {
                            label:'居中對齊',
                            cmdName:'justify',
                            value:'center'
                        },
                        {
                            label:'兩端對齊',
                            cmdName:'justify',
                            value:'justify'
                        }],
                    editor:editor
                }
            },
            {
                label:'表格',
                subMenu:{
                        items: [{
                            label:'靠左對齊',
                            cmdName:'justify',
                            value:'left'
                        },
                        {
                            label:'靠右對齊',
                            cmdName:'justify',
                            value:'right'
                        }],
                    editor:editor
                }
            }
    ];
    var menu = new te.obj[0].Menu({className : 'edui-for-lineheight',items :items,editor:editor});
    menu.render(te.dom[0]);
    menu.postRender();
    menu.show();
    var menuBody = document.getElementsByClassName("edui-menu-body")[0];
    //submenu
    var menuid1 = menu.items[1].id;
    var menuid2 = menu.items[2].id;
    var submenu1 = menu.items[1].subMenu.id;
    var submenu2 = menu.items[2].subMenu.id;
    equal(document.getElementById(submenu1).style.display,'none','submenu初始的display值："none"');
    //打開一個submenu
    if(ua.browser.ie){
        ua.mouseenter(document.getElementById(menuid1));
    }
    else{
        ua.mouseover(document.getElementById(menuid1));
    }
    setTimeout(function (){
        //檢查第一個submenu的內容顯示
        equal(document.getElementById(submenu1).style.display,'','顯示第一個submenu,檢查submenu的display值:""');
        var menuClass = document.getElementById(menuid1).className;
        equal(menuClass,"edui-menuitem  edui-"+editor.options.theme+" edui-hassubmenu edui-hassubmenu edui-state-hover edui-state-opened",'檢查第一個submenu的打開狀態');
        //打開第二個submenu
        if(ua.browser.ie){
            ua.mouseenter(document.getElementById(menuid2));
        }
        else{
            ua.mouseover(document.getElementById(menuid2));
        }
        setTimeout(function (){
            equal(document.getElementById(submenu1).style.display,'none','第一個submenu關閉,display值:"none"');
            menuClass = document.getElementById(menuid1).className;
            ok(menuClass.indexOf('edui-state-opened')==-1,'檢查第一個submenu的關閉狀態');
            equal(document.getElementById(submenu2).style.display,'','第二個submenu顯示,檢查submenu的display值:""');
            var menuClass = document.getElementById(menuid2).className;
            equal(menuClass,"edui-menuitem  edui-"+editor.options.theme+" edui-hassubmenu edui-hassubmenu edui-state-hover edui-state-opened",'檢查第二個submenu的打開狀態');
            document.getElementById(submenu1).parentNode.removeChild(document.getElementById(submenu2));
            start();
        }, 450);
    }, 300);
 stop();
} );
test( 'dispose', function() {
    var editor = new te.obj[0].Editor();
//設置選單內容
    var items=[
            {
                label:'刪除',
                cmdName:'delete'
            },
            {
                label:'全選',
                cmdName:'selectall'
            },
            {
                label:'刪除代碼',
                cmdName:'highlightcode',
                icon:'deletehighlightcode'
            },
            {
                label:'清空文檔',
                cmdName:'cleardoc',
                exec:function () {
                    if ( confirm( '確定清空文檔嗎？' ) ) {
                        this.execCommand( 'cleardoc' );
                    }
                }
            },
            '-',
            {
                label:'取消鏈接',
                cmdName:'unlink'
            },
            {
                label:'表格',
                subMenu:{
                        items: [{
                            label:'靠左對齊',
                            cmdName:'justify',
                            value:'left'
                        },
                        {
                            label:'靠右對齊',
                            cmdName:'justify',
                            value:'right'
                        }],
                    editor:editor
                }
            }
    ];
    var menu = new te.obj[0].Menu({className : 'edui-for-lineheight',items :items,editor:editor});
    te.dom[0].innerHTML = menu.renderHtml();
    menu.postRender();
    menu.show();
    equal(menu.items.length,7,'檢查menu里的items');
    equal(document.getElementById(menu.id).style.display,'','顯示menu,檢查menu的display值:""');
    menu.dispose();
    equal(menu.items.length,0,'dispose後，檢查menu里的items');
    equal(document.getElementById(menu.id),null,'menu不在頁面中');
} );
test( '_onClick', function() {
    var editor = new te.obj[0].Editor();
//設置選單內容
    var items=[
            {
                label:'取消鏈接',
                cmdName:'unlink'
            },
            {
                label:'表格',
                subMenu:{
                        items: [{
                            label:'靠左對齊',
                            cmdName:'justify',
                            value:'left'
                        },
                        {
                            label:'靠右對齊',
                            cmdName:'justify',
                            value:'right'
                        }],
                    editor:editor

                }
            }
    ];
    var menu = new te.obj[0].Menu({className : 'edui-for-lineheight',items :items,editor:editor});
    menu.render(te.dom[0]);
    menu.postRender();
    menu.show();
    var menuid1 = menu.items[1].id;
    var submenu1 = menu.items[1].subMenu.id;
     equal(document.getElementById(submenu1).style.display,'none','submenu初始的display值："none"');
    ua.click(document.getElementById(menuid1));
    setTimeout(function (){
        equal(document.getElementById(submenu1).style.display,'','顯示submenu,檢查submenu的display值:""');
         document.getElementById(submenu1).parentNode.removeChild(document.getElementById(submenu1));
        start();
    }, 300);
   stop();
} );