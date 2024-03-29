module('plugins.autosave');

test('自動保存', function () {

    expect(8);

    var container = te.obj[0].container,
        editor = null,
        count = 0;

    UE.delEditor(te.obj[0]);
    container.parentNode.removeChild(container);

    container = document.createElement("div");
    container.id = "container";
    document.body.appendChild(container);
    editor = UE.getEditor("container", {
        initialContent: "",
        //無限制
        saveInterval: 0
    });


    editor.addListener("beforeautosave", function (type, data) {

        data.content = data.content.toLowerCase();
        equal(true, true, "成功觸發beforeautosave事件");
        equal(data.content === "<p>http://www.baidu.com</p>" || data.content === "<p>disable</p>", true, "事件攜帶數據正確");
    });

    editor.addListener("beforeautosave", function (type, data) {

        data.content = data.content.toLowerCase();
        if (data.content === "<p>disable</p>") {
            return false;
        }

        count++;

    });

    editor.addListener("afterautosave", function (type, data) {

        data.content = data.content.toLowerCase();
        equal(data.content, "<p>http://www.baidu.com</p>", "成功觸發afterautosave事件");

        equal(editor.execCommand("getlocaldata") !== null, true, "getlocaldata命令正常");
        editor.execCommand("clearlocaldata");
        equal(editor.execCommand("getlocaldata") === "", true, "clearlocaldata命令正常");

    });

    stop();
    window.setTimeout(function () {

        editor.setContent('<p>disable</p>');


        window.setTimeout(function () {

            editor.setContent('<p>http://www.baidu.com</p>');

            window.setTimeout(function () {

                equal(count, 1, "觸發事件次數");

                start();
            }, 500);

            UE.delEditor("container");
            container.parentNode.removeChild(container);

        }, 50);

    }, 500);

});
test('重建編輯器,加載草稿箱', function () {
    UE.delEditor(te.obj[0]);
    te.obj[0].container.parentNode.removeChild(te.obj[0].container);
    var div = document.body.appendChild(document.createElement('div'));
    div.id = 'ue';
    var editor = UE.getEditor('ue', {saveInterval: 0});
    setTimeout(function () {
        var content = '<p>內容</p>';
        editor.setContent(content);
        setTimeout(function () {
            UE.delEditor('ue');
            document.getElementById('ue') && document.getElementById('ue').parentNode.removeChild(document.getElementById('ue'));
            var div = document.body.appendChild(document.createElement('div'));
            div.id = 'ue';
            var editor2 = UE.getEditor('ue');
            setTimeout(function () {
                equal(editor2.queryCommandState('drafts'), 0, '草稿箱可用');
                editor2.execCommand('drafts');
                ua.checkSameHtml(editor2.body.innerHTML, content, '內容加載正確');
                UE.delEditor('ue');
                document.getElementById('ue') && document.getElementById('ue').parentNode.removeChild(document.getElementById('ue'));
                start();
            }, 500);
        }, 200);
    }, 500);
    stop();
});