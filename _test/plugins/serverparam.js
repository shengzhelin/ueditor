module( 'plugins.serverparam' );

test( '檢查是否能正常設置參數', function () {
    var editor = te.obj[0];

    editor.execCommand('serverparam', {"a": 1, "b": 2});
    same( editor.queryCommandValue('serverparam'), {"a": 1, "b": 2}, '傳入對象設置參數');

    editor.execCommand('serverparam', "c", 3);
    same( editor.queryCommandValue('serverparam'), {"a": 1, "b": 2, "c": 3}, '傳入鍵和值設置參數');

    editor.execCommand('serverparam', "c");
    same( editor.queryCommandValue('serverparam'), {"a": 1, "b": 2}, '傳入鍵刪除參數');

    editor.execCommand('serverparam');
    same( editor.queryCommandValue('serverparam'), {}, '不傳參數,清空參數表');
} );