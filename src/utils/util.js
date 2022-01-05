import { columeHeader_word, columeHeader_word_index, luckysheetdefaultFont } from '../controllers/constant';
import menuButton from '../controllers/menuButton';
import { isdatatype, isdatatypemulti } from '../global/datecontroll';
import { hasChinaword,isRealNum } from '../global/validate';
import Store from '../store';
import locale from '../locale/locale';
import numeral from 'numeral';
// import method from '../global/method';

/**
 * Common tool methods
 */

/**
 * Determine whether a string is in standard JSON format
 * @param {String} str 
 */
function isJsonString(str) {
    try {
        if (typeof JSON.parse(str) == "object") {
            return true;
        }
    }
    catch (e) { }
    return false;
}


/**
 * extend two objects
 * @param {Object } jsonbject1
 * @param {Object } jsonbject2 
 */
function common_extend(jsonbject1, jsonbject2) {
    let resultJsonObject = {};

    for (let attr in jsonbject1) {
        resultJsonObject[attr] = jsonbject1[attr];
    }

    for (let attr in jsonbject2) {
        // undefined is equivalent to no setting
        if(jsonbject2[attr] == undefined){
            continue;
        }
        resultJsonObject[attr] = jsonbject2[attr];
    }

    return resultJsonObject;
};

// 替換temp中的${xxx}為指定內容 ,temp:字符串，這里指html代碼，dataarry：一個對象{"xxx":"替換的內容"}
// 例：luckysheet.replaceHtml("${image}",{"image":"abc","jskdjslf":"abc"})   ==>  abc
function replaceHtml(temp, dataarry) {
    return temp.replace(/\$\{([\w]+)\}/g, function (s1, s2) { let s = dataarry[s2]; if (typeof (s) != "undefined") { return s; } else { return s1; } });
};

//獲取數據類型
function getObjType(obj) {
    let toString = Object.prototype.toString;

    let map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    }

    // if(obj instanceof Element){
    //     return 'element';
    // }

    return map[toString.call(obj)];
}

//獲取當前日期時間
function getNowDateTime(format) {
    let now = new Date();
    let year = now.getFullYear();  //得到年份
    let month = now.getMonth();  //得到月份
    let date = now.getDate();  //得到日期
    let day = now.getDay();  //得到周幾
    let hour = now.getHours();  //得到小時
    let minu = now.getMinutes();  //得到分鐘
    let sec = now.getSeconds();  //得到秒

    month = month + 1;
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minu < 10) minu = "0" + minu;
    if (sec < 10) sec = "0" + sec;

    let time = '';

    //日期
    if(format == 1) {
        time = year + "-" + month + "-" + date;
    }
    //日期時間
    else if(format == 2) {
        time = year + "-" + month + "-" + date+ " " + hour + ":" + minu + ":" + sec;
    }

    return time;
}

//顏色 16進制轉rgb
function hexToRgb(hex) {
    let color = [], rgb = [];
    hex = hex.replace(/#/, "");

    if (hex.length == 3) { // 處理 "#abc" 成 "#aabbcc"
        let tmp = [];

        for (let i = 0; i < 3; i++) {
            tmp.push(hex.charAt(i) + hex.charAt(i));
        }

        hex = tmp.join("");
    }

    for (let i = 0; i < 3; i++) {
        color[i] = "0x" + hex.substr(i + 2, 2);
        rgb.push(parseInt(Number(color[i])));
    }

    return 'rgb(' + rgb.join(",") + ')';
};

//顏色 rgb轉16進制
function rgbTohex(color) {
    let rgb;

    if (color.indexOf("rgba") > -1) {
        rgb = color.replace("rgba(", "").replace(")", "").split(',');
    }
    else {
        rgb = color.replace("rgb(", "").replace(")", "").split(',');
    }

    let r = parseInt(rgb[0]);
    let g = parseInt(rgb[1]);
    let b = parseInt(rgb[2]);

    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return hex;
};

//列下標  字母轉數字
function ABCatNum(a) {
    // abc = abc.toUpperCase();

    // let abc_len = abc.length;
    // if (abc_len == 0) {
    //     return NaN;
    // }

    // let abc_array = abc.split("");
    // let wordlen = columeHeader_word.length;
    // let ret = 0;

    // for (let i = abc_len - 1; i >= 0; i--) {
    //     if (i == abc_len - 1) {
    //         ret += columeHeader_word_index[abc_array[i]];
    //     }
    //     else {
    //         ret += Math.pow(wordlen, abc_len - i - 1) * (columeHeader_word_index[abc_array[i]] + 1);
    //     }
    // }

    // return ret;
    if(a==null || a.length==0){
        return NaN;
    }
    var str=a.toLowerCase().split("");
    var num=0;
    var al = str.length;
    var getCharNumber = function(charx){
        return charx.charCodeAt() -96;
    };
    var numout = 0;
    var charnum = 0;
    for(var i = 0; i < al; i++){
        charnum = getCharNumber(str[i]);
        numout += charnum * Math.pow(26, al-i-1);
    };
    // console.log(a, numout-1);
    if(numout==0){
        return NaN;
    }
    return numout-1;
};

//列下標  數字轉字母
function chatatABC(n) {
    // let wordlen = columeHeader_word.length;

    // if (index < wordlen) {
    //     return columeHeader_word[index];
    // }
    // else {
    //     let last = 0, pre = 0, ret = "";
    //     let i = 1, n = 0;

    //     while (index >= (wordlen / (wordlen - 1)) * (Math.pow(wordlen, i++) - 1)) {
    //         n = i;
    //     }

    //     let index_ab = index - (wordlen / (wordlen - 1)) * (Math.pow(wordlen, n - 1) - 1);//970
    //     last = index_ab + 1;

    //     for (let x = n; x > 0; x--) {
    //         let last1 = last, x1 = x;//-702=268, 3

    //         if (x == 1) {
    //             last1 = last1 % wordlen;

    //             if (last1 == 0) {
    //                 last1 = 26;
    //             }

    //             return ret + columeHeader_word[last1 - 1];
    //         }

    //         last1 = Math.ceil(last1 / Math.pow(wordlen, x - 1));
    //         //last1 = last1 % wordlen;
    //         ret += columeHeader_word[last1 - 1];

    //         if (x > 1) {
    //             last = last - (last1 - 1) * wordlen;
    //         }
    //     }
    // }

    var orda = 'a'.charCodeAt(0); 
   
    var ordz = 'z'.charCodeAt(0); 
   
    var len = ordz - orda + 1; 
   
    var s = ""; 
   
    while( n >= 0 ) { 
   
        s = String.fromCharCode(n % len + orda) + s; 
   
        n = Math.floor(n / len) - 1; 
   
    } 
   
    return s.toUpperCase(); 
};

function ceateABC(index) {
    let wordlen = columeHeader_word.length;

    if (index < wordlen) {
        return columeHeader_word;
    }
    else {
        let relist = [];
        let i = 2, n = 0;

        while (index < (wordlen / (wordlen - 1)) * (Math.pow(wordlen, i) - 1)) {
            n = i;
            i++;
        }

        for (let x = 0; x < n; x++) {

            if (x == 0) {
                relist = relist.concat(columeHeader_word);
            }
            else {
                relist = relist.concat(createABCdim(x), index);
            }
        }
    }
};

function createABCdim(x, count) {
    let chwl = columeHeader_word.length;

    if (x == 1) {
        let ret = [];
        let c = 0, con = true;

        for (let i = 0; i < chwl; i++) {
            let b = columeHeader_word[i];

            for (let n = 0; n < chwl; n++) {
                let bq = b + columeHeader_word[n];
                ret.push(bq);
                c++;

                if (c > index) {
                    return ret;
                }
            }
        }
    }
    else if (x == 2) {
        let ret = [];
        let c = 0, con = true;

        for (let i = 0; i < chwl; i++) {
            let bb = columeHeader_word[i];

            for (let w = 0; w < chwl; w++) {
                let aa = columeHeader_word[w];

                for (let n = 0; n < chwl; n++) {
                    let bqa = bb + aa + columeHeader_word[n];
                    ret.push(bqa);
                    c++;

                    if (c > index) {
                        return ret;
                    }
                }
            }
        }
    }
};

/**
 * 計算字符串字節長度
 * @param {*} val 字符串
 * @param {*} subLen 要截取的字符串長度
 */
function getByteLen(val,subLen) {
    if(subLen === 0){
        return "";
    }

    if (val == null) {
        return 0;
    }

    let len = 0;
    for (let i = 0; i < val.length; i++) {
        let a = val.charAt(i);

        if (a.match(/[^\x00-\xff]/ig) != null) {
            len += 2;
        }
        else {
            len += 1;
        }

        if(isRealNum(subLen) && len === ~~subLen){
            return val.substring(0,i)
        }

    }

    return len;
};

//數組去重
function ArrayUnique(dataArr) {
    let result = [];
    let obj = {};
    if (dataArr.length > 0) {
        for (let i = 0; i < dataArr.length; i++) {
            let item = dataArr[i];
            if (!obj[item]) {
                result.push(item);
                obj[item] = 1;
            }
        }
    }
    return result
}

//獲取字體配置
function luckysheetfontformat(format) {
    let fontarray = locale().fontarray;
    if (getObjType(format) == "object") {
        let font = "";

        //font-style
        if (format.it == "0" || format.it == null) {
            font += "normal ";
        }
        else {
            font += "italic ";
        }

        //font-variant
        font += "normal ";

        //font-weight
        if (format.bl == "0" || format.bl == null) {
            font += "normal ";
        }
        else {
            font += "bold ";
        }

        //font-size/line-height
        if (!format.fs) {
            font += Store.defaultFontSize + "pt ";
        }
        else {
            font += Math.ceil(format.fs) + "pt ";
        }

        if (!format.ff) {
            
            font += fontarray[0] + ', "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
        }
        else {
            let fontfamily = null;
            let fontjson = locale().fontjson;
            if (isdatatypemulti(format.ff)["num"]) {
                fontfamily = fontarray[parseInt(format.ff)];
            }
            else {

                // fontfamily = fontarray[fontjson[format.ff]];
                fontfamily = format.ff;

                fontfamily = fontfamily.replace(/"/g, "").replace(/'/g, "");

                if(fontfamily.indexOf(" ")>-1){
                    fontfamily = '"' + fontfamily + '"';
                }

                if(fontfamily!=null && document.fonts && !document.fonts.check("12px "+fontfamily)){
                    menuButton.addFontTolist(fontfamily);
                }
            }

            if (fontfamily == null) {
                fontfamily = fontarray[0];
            }

            font += fontfamily + ', "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
        }

        return font;
    }
    else {
        return luckysheetdefaultFont();
    }
}

//右鍵菜單
function showrightclickmenu($menu, x, y) {
    let winH = $(window).height(), winW = $(window).width();
    let menuW = $menu.width(), menuH = $menu.height();
    let top = y, left = x;

    if (x + menuW > winW) {
        left = x - menuW;
    }

    if (y + menuH > winH) {
        top = y - menuH;
    }

    if (top < 0) {
        top = 0;
    }

    $menu.css({ "top": top, "left": left }).show();
}

//單元格編輯聚焦
function luckysheetactiveCell() {
    if (!!Store.fullscreenmode) {
        setTimeout(function () {
            // need preventScroll:true,fix Luckysheet has been set top, and clicking the cell will trigger the scrolling problem
            const input = document.getElementById('luckysheet-rich-text-editor');
            input.focus({preventScroll:true});
            $("#luckysheet-rich-text-editor").select();
            // $("#luckysheet-rich-text-editor").focus().select();
        }, 50);
    }
}

//單元格編輯聚焦
function luckysheetContainerFocus() {
    
    // $("#" + Store.container).focus({ 
    //     preventScroll: true 
    // });
    
    // fix jquery error: Uncaught TypeError: ((n.event.special[g.origType] || {}).handle || g.handler).apply is not a function
    // $("#" + Store.container).attr("tabindex", 0).focus();

    // need preventScroll:true,fix Luckysheet has been set top, and clicking the cell will trigger the scrolling problem
    document.getElementById(Store.container).focus({preventScroll:true});
}

//數字格式
function numFormat(num, type) {
    if (num == null || isNaN(parseFloat(num)) || hasChinaword(num) || num == -Infinity || num == Infinity) {
        return null;
    }

    let floatlen = 6, ismustfloat = false;
    if (type == null || type == "auto") {
        if (num < 1) {
            floatlen = 6;
        }
        else {
            floatlen = 1;
        }
    }
    else {
        if (isdatatype(type) == "num") {
            floatlen = parseInt(type);
            ismustfloat = true;
        }
        else {
            floatlen = 6;
        }
    }

    let format = "", value = null;
    for (let i = 0; i < floatlen; i++) {
        format += "0";
    }

    if (!ismustfloat) {
        format = "[" + format + "]";
    }

    if (num >= 1e+21) {
        value = parseFloat(numeral(num).value());
    }
    else {
        value = parseFloat(numeral(num).format("0." + format));
    }

    return value;
}

function numfloatlen(n) {
    if (n != null && !isNaN(parseFloat(n)) && !hasChinaword(n)) {
        let value = numeral(n).value();
        let lens = value.toString().split(".");

        if (lens.length == 1) {
            lens = 0;
        }
        else {
            lens = lens[1].length;
        }

        return lens;
    }
    else {
        return null;
    }
}

//二級菜單顯示位置
function mouseclickposition($menu, x, y, p) {
    let winH = $(window).height(), winW = $(window).width();
    let menuW = $menu.width(), menuH = $menu.height();
    let top = y, left = x;

    if (p == null) {
        p = "lefttop";
    }

    if (p == "lefttop") {
        $menu.css({ "top": y, "left": x }).show();
    }
    else if (p == "righttop") {
        $menu.css({ "top": y, "left": x - menuW }).show();
    }
    else if (p == "leftbottom") {
        $menu.css({ "bottom": winH - y - 12, "left": x }).show();
    }
    else if (p == "rightbottom") {
        $menu.css({ "bottom": winH - y - 12, "left": x - menuW }).show();
    }
}

/**
 * 元素選擇器
 * @param {String}  selector css選擇器
 * @param {String}  context  指定父級DOM
 */
function $$(selector, context) {
    context = context || document
    var elements = context.querySelectorAll(selector)
    return elements.length == 1
        ? Array.prototype.slice.call(elements)[0]
        : Array.prototype.slice.call(elements)
}

/** 
 * 串行加載指定的腳本
 * 串行加載[異步]逐個加載，每個加載完成後加載下一個
 * 全部加載完成後執行回調
 * @param {Array|String}  scripts 指定要加載的腳本
 * @param {Object} options 屬性設置
 * @param {Function} callback 成功後回調的函數
 * @return {Array} 所有生成的腳本元素對象數組
 */

function seriesLoadScripts(scripts, options, callback) {
    if (typeof (scripts) !== 'object') {
        var scripts = [scripts];
    }
    var HEAD = document.getElementsByTagName('head')[0] || document.documentElement;
    var s = [];
    var last = scripts.length - 1;
    //遞歸
    var recursiveLoad = function (i) {
        s[i] = document.createElement('script');
        s[i].setAttribute('type', 'text/javascript');
        // Attach handlers for all browsers
        // 異步
        s[i].onload = s[i].onreadystatechange = function () {
            if (!/*@cc_on!@*/0 || this.readyState === 'loaded' || this.readyState === 'complete') {
                this.onload = this.onreadystatechange = null;
                this.parentNode.removeChild(this);
                if (i !== last) {
                    recursiveLoad(i + 1);
                } else if (typeof (callback) === 'function') {
                    callback()
                };
            }
        }
        // 同步
        s[i].setAttribute('src', scripts[i]);

        // 設置屬性
        if (typeof options === 'object') {
            for (var attr in options) {
                s[i].setAttribute(attr, options[attr]);
            }
        }

        HEAD.appendChild(s[i]);
    };
    recursiveLoad(0);
}


/**
 * 並行加載指定的腳本
 * 並行加載[同步]同時加載，不管上個是否加載完成，直接加載全部
 * 全部加載完成後執行回調
 * @param {Array|String}  scripts 指定要加載的腳本
 * @param {Object} options 屬性設置
 * @param {Function} callback 成功後回調的函數
 * @return {Array} 所有生成的腳本元素對象數組
 */

function parallelLoadScripts(scripts, options, callback) {
    if (typeof (scripts) !== 'object') {
        var scripts = [scripts];
    }
    var HEAD = document.getElementsByTagName('head')[0] || document.documentElement;
    var s = [];
    var loaded = 0;
    for (var i = 0; i < scripts.length; i++) {
        s[i] = document.createElement('script');
        s[i].setAttribute('type', 'text/javascript');
        // Attach handlers for all browsers
        // 異步
        s[i].onload = s[i].onreadystatechange = function () {
            if (!/*@cc_on!@*/0 || this.readyState === 'loaded' || this.readyState === 'complete') {
                loaded++;
                this.onload = this.onreadystatechange = null;
                this.parentNode.removeChild(this);
                if (loaded === scripts.length && typeof (callback) === 'function') callback();
            }
        };
        // 同步
        s[i].setAttribute('src', scripts[i]);

        // 設置屬性
        if (typeof options === 'object') {
            for (var attr in options) {
                s[i].setAttribute(attr, options[attr]);
            }
        }

        HEAD.appendChild(s[i]);
    }
}

/**
* 動態添加css
* @param {String}  url 指定要加載的css地址
*/
function loadLink(url) {
    var doc = document;
    var link = doc.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", url);

    var heads = doc.getElementsByTagName("head");
    if (heads.length) {
        heads[0].appendChild(link);
    }
    else {
        doc.documentElement.appendChild(link);
    }
}

/**
* 動態添加一組css
* @param {String}  url 指定要加載的css地址
*/
function loadLinks(urls) {
    if (typeof (urls) !== 'object') {
        urls = [urls];
    }
    if (urls.length) {
        urls.forEach(url => {
            loadLink(url);
        });
    }
}

function transformRangeToAbsolute(txt1){
    if(txt1 ==null ||txt1.length==0){
        return null;
    }

    let txtArray = txt1.split(",");
    let ret = "";
    for(let i=0;i<txtArray.length;i++){
        let txt = txtArray[i];
        let txtSplit = txt.split("!"), sheetName="", rangeTxt="";
        if(txtSplit.length>1){
            sheetName = txtSplit[0];
            rangeTxt = txtSplit[1];
        }
        else{
            rangeTxt = txtSplit[0];
        }

        let rangeTxtArray = rangeTxt.split(":");

        let rangeRet = "";
        for(let a=0;a<rangeTxtArray.length;a++){
            let t = rangeTxtArray[a];

            let row = t.replace(/[^0-9]/g, "");
            let col = t.replace(/[^A-Za-z]/g, "");
            let rangeTT = ""
            if(col!=""){
                rangeTT += "$" + col;
            }

            if(row!=""){
                rangeTT += "$" + row;
            }

            rangeRet+=rangeTT+":";
        }

        rangeRet = rangeRet.substr(0, rangeRet.length-1);

        ret += sheetName + rangeRet + ",";
    }

    return ret.substr(0, ret.length-1); 
}

function openSelfModel(id, isshowMask=true){
    let $t = $("#"+id)
            .find(".luckysheet-modal-dialog-content")
            .css("min-width", 300)
            .end(), 
        myh = $t.outerHeight(), 
        myw = $t.outerWidth();
    let winw = $(window).width(), winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
    $t.css({ 
    "left": (winw + scrollLeft - myw) / 2, 
    "top": (winh + scrollTop - myh) / 3 
    }).show();

    if(isshowMask){
        $("#luckysheet-modal-dialog-mask").show();
    }
}

/**
 * 監控對象變更
 * @param {*} data 
 */
// const createProxy = (data,list=[]) => {
//     if (typeof data === 'object' && data.toString() === '[object Object]') {
//       for (let k in data) {
//         if(list.includes(k)){
//             if (typeof data[k] === 'object') {
//               defineObjectReactive(data, k, data[k])
//             } else {
//               defineBasicReactive(data, k, data[k])
//             }
//         }
//       }
//     }
// }

const createProxy = (data, k, callback) => {
    if(!data.hasOwnProperty(k)){ 
        console.info('No %s in data',k);
        return; 
    };

    if (getObjType(data) === 'object') {
        if (getObjType(data[k]) === 'object' || getObjType(data[k]) === 'array') {
            defineObjectReactive(data, k, data[k], callback)
        } else {
            defineBasicReactive(data, k, data[k], callback)
        }
    }
}
  
function defineObjectReactive(obj, key, value, callback) {
    // 遞歸
    obj[key] = new Proxy(value, {
      set(target, property, val, receiver) {
        
          setTimeout(() => {
            callback(target, property, val, receiver);
          }, 0);

        return Reflect.set(target, property, val, receiver)
      }
    })
}
  
function defineBasicReactive(obj, key, value, callback) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get() {
        return value
      },
      set(newValue) {
        if (value === newValue) return
        console.log(`發現 ${key} 屬性 ${value} -> ${newValue}`)

        setTimeout(() => {
            callback(value,newValue);
        }, 0);

        value = newValue

      }
    })
}

/**
 * Remove an item in the specified array
 * @param {array} array Target array 
 * @param {string} item What needs to be removed
 */
function arrayRemoveItem(array, item) {
    array.some((curr, index, arr)=>{
        if(curr === item){
            arr.splice(index, 1);
            return curr === item;
        }
    })
}

/**
 * camel 形式的單詞轉換為 - 形式 如 fillColor -> fill-color
 * @param {string} camel camel 形式
 * @returns
 */
 function camel2split(camel) {
    return camel.replace(/([A-Z])/g, function(all, group) {
        return '-' + group.toLowerCase();
    });
}
  
export {
    isJsonString,
    common_extend,
    replaceHtml,
    getObjType,
    getNowDateTime,
    hexToRgb,
    rgbTohex,
    ABCatNum,
    chatatABC,
    ceateABC,
    createABCdim,
    getByteLen,
    ArrayUnique,
    luckysheetfontformat,
    showrightclickmenu,
    luckysheetactiveCell,
    numFormat,
    numfloatlen,
    mouseclickposition,
    $$,
    seriesLoadScripts,
    parallelLoadScripts,
    loadLinks,
    luckysheetContainerFocus,
    transformRangeToAbsolute,
    openSelfModel,
    createProxy,
    arrayRemoveItem,
    camel2split
}