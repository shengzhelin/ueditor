/**
 * Created with JetBrains PhpStorm.
 * User: taoqili
 * Date: 12-6-5
 * Time: 下午2:52
 * To change this template use File | Settings | File Templates.
 */
module( 'plugins.webapp' );
test("插入一個webapp",function(){
        stop();
        expect(7);
    var editor = te.obj[0];
    equal(editor.options.initialContent,editor.getContent(),"沒插入webapp之前內容為空");

    editor.execCommand( "webapp", {
        url:"http://app.baidu.com/app/enter?appid=152311&amp;tn=app_canvas&amp;app_spce_id=1&amp;apikey=5r7SmiUici27lVfVBep1K7BA&amp;api_key=5r7SmiUici27lVfVBep1K7BA",
        width:300,
        height:400,
        logo:'http://apps1.bdimg.com/store/static/kvt/2c86377ca162d93547aeeca6fe252696.jpgo',
        title:'測試'
    });

    var backImg = editor.document.getElementsByTagName("img")[0];
    var div = document.createElement("div");
    div.innerHTML = editor.getContent();
    var iframe = div.getElementsByTagName("iframe")[0];
    ok(iframe,"插入webapp後獲取到的內容中包含一個iframe");
    if(iframe){
        equal(iframe.className,"edui-faked-webapp","獲取到的iframe中包含edui-faked-webapp類名");
        ok(iframe.getAttribute("logo_url"),"包含一個logo_url屬性");
    }
    setTimeout( function () {
        editor.execCommand( 'source' );
        setTimeout( function () {
            editor.execCommand( 'source' );
                var newImg = editor.document.getElementsByTagName("img")[0];
                ok(newImg.src ==backImg.src,"源碼切換之後占位圖片地址不變");
                ok(newImg.className ==backImg.className,"源碼切換之後占位圖片樣式類不變");
                ok(newImg._url ==backImg._url,"源碼切換之後占位圖片_url數據不變");
                start();
        }, 200 );
    }, 200 );



});
