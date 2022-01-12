module('core.ajax');
var ajax_request_baseurl = upath + 'ajax.php';


test("post請求，無數據", function () {
    UE.ajax.request(ajax_request_baseurl, {
        onsuccess: function (xhr) {
            equals(xhr.responseText, "", "post請求，無數據");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});

test("get請求，無數據,url中有數據", function () {
    UE.ajax.request(ajax_request_baseurl + "?get1=ueditor&get2=baidu", {
        method: 'GET',
        onsuccess: function (xhr) {
            equals(xhr.responseText, "get1='ueditor'&get2='baidu'", "post請求，數據放在url中傳遞");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});


test("get請求,有數據,url中有數據", function () {
    UE.ajax.request(ajax_request_baseurl + "?get1=ueditor&get2=baidu", {
        method: 'GET',
        content: "img1=http://www.baidu.com&img2=http://ueditor.baidu.com",
        onsuccess: function (xhr) {
            equals(xhr.responseText, "get1='ueditor'&get2='baidu'&img1=http://www.baidu.com&img2=http://ueditor.baidu.com", "post請求，數據放在url中傳遞");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});

test("get請求，有data字段，無數據,url中有數據", function () {
    UE.ajax.request(ajax_request_baseurl + "?get1=ueditor&get2=baidu", {
        method: 'GET',
        data: {
            img1: 'http://www.baidu.com', img2: 'http://www.google.com'
        },
        onsuccess: function (xhr) {
            equals(xhr.responseText, "get1='ueditor'&get2='baidu'&img1='http://www.baidu.com'&img2='http://www.google.com'", "post請求，數據放在url中傳遞");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});

test("post請求，有data字段", function () {
    UE.ajax.request(ajax_request_baseurl, {
        data: {
            img1: 'http://www.baidu.com', img2: 'http://www.google.com'
        },
        onsuccess: function (xhr) {
            equals(xhr.responseText, "img1='http://www.baidu.com'&img2='http://www.google.com'", "post請求，有data字段");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});

test("post請求，沒有data字段，有其他數據", function () {
    UE.ajax.request(ajax_request_baseurl, {
        content: "img1=http://www.baidu.com&img2=http://ueditor.baidu.com",
        onsuccess: function (xhr) {
            equals(xhr.responseText, "img1=http://www.baidu.com&img2=http://ueditor.baidu.com", "沒有data字段，有其他數據");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});

test("post請求，有data字段，有其他數據", function () {
    UE.ajax.request(ajax_request_baseurl, {
        data: {
            img1: 'http://www.baidu.com', img2: 'http://www.google.com'
        },
        content: "i1=http://www.baidu.com&i2=http://ueditor.baidu.com",
        onsuccess: function (xhr) {
            equals(xhr.responseText, "img1='http://www.baidu.com'&img2='http://www.google.com'&i1=http://www.baidu.com&i2=http://ueditor.baidu.com", "有data字段，有其他數據");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});

test("get請求，有data字段，有其他數據", function () {
    UE.ajax.request(ajax_request_baseurl, {
        method: 'GET',
        data: {
            get1: 'http://www.baidu.com', get2: 'http://www.google.com'
        },
        content: "i1=http://www.baidu.com&i2=http://ueditor.baidu.com",
        onsuccess: function (xhr) {
            equals(xhr.responseText, "get1='http://www.baidu.com'&get2='http://www.google.com'&i1=http://www.baidu.com&i2=http://ueditor.baidu.com", "有data字段，有其他數據");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});


test("並發多個post請求", function () {

    UE.ajax.request(ajax_request_baseurl, {
        data: {
            img1: 'http://ueditor.baidu.com', img2: 'http://www.google.com'
        },
        content: "i1=http://www.baidu.com&i2=http://ueditor.baidu.com",
        onsuccess: function (xhr) {
            equals(xhr.responseText, "img1='http://ueditor.baidu.com'&img2='http://www.google.com'&i1=http://www.baidu.com&i2=http://ueditor.baidu.com", "有data字段，有其他數據");
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
        }
    });

    UE.ajax.request(ajax_request_baseurl, {
        data: {
            img1: 'http://map.baidu.com', img2: 'http://www.google.com'
        },
        content: "p1=http://www.baidu.com&p2=http://ueditor.baidu.com",
        onsuccess: function (xhr) {
            equals(xhr.responseText, "img1='http://map.baidu.com'&img2='http://www.google.com'&p1=http://www.baidu.com&p2=http://ueditor.baidu.com", "有data字段，有其他數據");
            start();
        },
        onerror: function () {
            ok(false, 'fail to send ajax request');
            start();
        }
    });
    stop();
});

test("jsonp請求,無數據", function () {

    UE.ajax.request(ajax_request_baseurl, {
        dataType: 'jsonp',
        onsuccess: function (r) {
            notDeepEqual(r, null, '返回內容不為空');
            notEqual(r.callback, null, '返回內容有callback參數');
            start();
        },
        onerror: function () {
            ok(false, 'fail to send jsonp request');
            start();
        }
    });
    stop();

});

test("jsonp請求,無數據,url上有數據", function () {

    UE.ajax.request(ajax_request_baseurl + '?get1=getcontent1&get2=getcontent2', {
        dataType: 'jsonp',
        onsuccess: function (r) {
            equal(r.get1, 'getcontent1', 'url上的參數1正常');
            equal(r.get2, 'getcontent2', 'url上的參數2正常');
            start();
        },
        onerror: function () {
            ok(false, 'fail to send jsonp request');
            start();
        }
    });
    stop();

});

test("jsonp請求,有數據,url上有數據", function () {

    UE.ajax.request(ajax_request_baseurl + '?get1=getcontent1&get2=getcontent2', {
        key1: 'keycontent1',
        key2: 'keycontent2',
        dataType: 'jsonp',
        onsuccess: function (r) {
            equal(r.get1, 'getcontent1', 'url上的參數1正常');
            equal(r.get2, 'getcontent2', 'url上的參數2正常');
            equal(r.key1, 'keycontent1', '數據上的參數1正常');
            equal(r.key2, 'keycontent2', '數據上的參數2正常');
            start();
        },
        onerror: function () {
            ok(false, 'fail to send jsonp request');
            start();
        }
    });
    stop();

});

test("jsonp請求,有數據,data上有數據,url上有數據", function () {

    UE.ajax.request(ajax_request_baseurl + '?get1=getcontent1&get2=getcontent2', {
        key1: 'keycontent1',
        key2: 'keycontent2',
        data: {
            'datakey1': 'datakeycontent1',
            'datakey2': 'datakeycontent2'
        },
        dataType: 'jsonp',
        onsuccess: function (r) {
            equal(r.get1, 'getcontent1', 'url上的參數1正常');
            equal(r.get2, 'getcontent2', 'url上的參數2正常');
            equal(r.key1, 'keycontent1', '數據上的參數1正常');
            equal(r.key2, 'keycontent2', '數據上的參數2正常');
            equal(r.datakey1, 'datakeycontent1', 'data數據上的參數1正常');
            equal(r.datakey2, 'datakeycontent2', 'data數據上的參數2正常');
            start();
        },
        onerror: function () {
            ok(false, 'fail to send jsonp request');
            start();
        }
    });
    stop();

});

test("通過getJSONP方法發送jsonp請求", function () {

    UE.ajax.getJSONP(ajax_request_baseurl + '?get1=getcontent1&get2=getcontent2', {
        'datakey1': 'datakeycontent1',
        'datakey2': 'datakeycontent2'
    }, function (r) {
        equal(r.get1, 'getcontent1', 'url上的參數1正常');
        equal(r.get2, 'getcontent2', 'url上的參數2正常');
        equal(r.datakey1, 'datakeycontent1', 'data數據上的參數1正常');
        equal(r.datakey2, 'datakeycontent2', 'data數據上的參數2正常');
        start();
    });
    stop();

});
