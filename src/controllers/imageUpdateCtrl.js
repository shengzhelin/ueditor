// 自定義圖片的更新方法例如: customImageUpdate("POST", "http://127.0.0.1:8000/luckysheetimageprocess/", d)
function customImageUpdate(method, url, obj) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open(method, url);
        xhr.send(JSON.stringify(obj)); // 發送 POST/GET 數據
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    resolve(xhr.responseText);
                } else {
                    reject("error");
                }
            }
        };
    });
}

export {
    customImageUpdate
}