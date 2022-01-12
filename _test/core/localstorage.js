module("core.localstorage");

test('用 UE.LocalStorage 對字符串做保存/讀取/刪除操作', function () {

    var str = '1234567890-=!@#$%^&*()_+qwertyuiopasdfghjklzxcvbnm,./<>?;\':"[]\\{}|';
    UE.LocalStorage.saveLocalData('test_string1', str);
    equal(UE.LocalStorage.getLocalData('test_string1'), str, "保存內容，並讀取內容");

    UE.LocalStorage.saveLocalData('test_string2', str);
    UE.LocalStorage.removeItem('test_string2');
    equal(UE.LocalStorage.getLocalData('test_string2'), undefined, "保存內容，並刪除內容");

});

test('偏好設置相關方法setPreferencesue、getPreferences、removePreferences', function () {

    var editor = te.obj[1];

    var str = '1234567890-=!@#$%^&*()_+qwertyuiopasdfghjklzxcvbnm,./<>?;\':"[]\\{}|';
    editor.setPreferences('test_string', str);
    equal(editor.getPreferences('test_string'), str, "保存字符串，並讀取內容");

    var obj = {
        nul: null,
        boo1: true,
        boo2: false,
        str: 'aaa',
        arr: [1, '2', 'a'],
        obj: {k1:1, k2:'2', k3:'a'}
    };
    editor.setPreferences('test_object', obj);
    same(editor.getPreferences('test_object'), obj, "保存鍵值對象，並讀取內容");

    editor.setPreferences('test_boolean', true);
    equal(editor.getPreferences('test_boolean'), true, "保存布爾值，並讀取內容");

    var arr = [1, '2', 'a'];
    editor.setPreferences('test_string', arr);
    same(editor.getPreferences('test_string'), arr, "保存數組，並讀取內容");

    var tmpStr = 'string_content';
    editor.setPreferences('test_delete', tmpStr);
    editor.removePreferences('test_delete');
    equal(editor.getPreferences('test_delete'), undefined, "保存字符串，並刪除內容");

});