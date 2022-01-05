/**
 * 生成隨機圖表id
 */
function generateRandomKey(prefix) {
    if (prefix == null) {
        prefix = 'chart'
    }

    var userAgent = window.navigator.userAgent
        .replace(/[^a-zA-Z0-9]/g, '')
        .split('')
    var mid = ''
    for (var i = 0; i < 12; i++) {
        mid += userAgent[Math.round(Math.random() * (userAgent.length - 1))]
    }
    var time = new Date().getTime()

    return prefix + '_' + mid + '_' + time
}
/**
 * 深度複製數據,包括對象，數組，map
 * @param {*} obj 對象，數組，map
 */
function deepCopy(obj) {
    if (!isObject(obj) && !isMap(obj)) {
        return obj;
    }

    let cloneObj;
    if (isMap(obj)) {
        cloneObj = new Map();
        for (let key of obj.keys()) {
            let value = obj.get(key);
            if (isMap(value) || isObject(value) || Array.isArray(obj)) {
                let copyVal = deepCopy(value);
                cloneObj.set(key, copyVal);
            } else {
                cloneObj.set(key, value);
            }
        }
    } else if (typeof obj === "function") {
        cloneObj = obj
    } else {
        cloneObj = Array.isArray(obj) ? [] : {};
        if (obj instanceof HTMLElement) {
            cloneObj = obj.cloneNode(true)
        } else {
            for (let key in obj) {
                // if (obj.hasOwnProperty(key)) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    cloneObj[key] =
                        isMap(obj[key]) || isObject(obj[key])
                            ? deepCopy(obj[key])
                            : obj[key];
                }
            }

        }
    }
    return cloneObj;
}

/**
 * 判斷參數是否是Object類型
 * @param {*} o 
 */
function isObject(o) {
    return (
        !isMap(o) &&
        (typeof o === 'object' || typeof o === 'function') &&
        o !== null
    );
}

/**
 * 判斷參數是否是Map類型
 * @param {*} obj 
 */
function isMap(obj) {
    if (obj instanceof Map) {
        return true;
    } else {
        return false;
    }
}

// 替換temp中的${xxx}為指定內容 ,temp:字符串，這裡指html代碼，dataarry：一個對象{"xxx":"替換的內容"}
// 例：luckysheet.replaceHtml("${image}",{"image":"abc","jskdjslf":"abc"})   ==>  abc
function replaceHtml(temp, dataarry) {
    return temp.replace(/\$\{([\w]+)\}/g, function (s1, s2) { var s = dataarry[s2]; if (typeof (s) != "undefined") { return s; } else { return s1; } });
}

function hasChinaword(s) {
    var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    if (!patrn.exec(s)) {
        return false;
    }
    else {
        return true;
    }
}

export {
    isMap,
    isObject,
    deepCopy,
    generateRandomKey,
    replaceHtml
}