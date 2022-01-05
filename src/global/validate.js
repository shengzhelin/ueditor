import luckysheetConfigsetting from '../controllers/luckysheetConfigsetting';
import Store from '../store';

export const error = {
    v: "#VALUE!",    //錯誤的參數或運算符
    n: "#NAME?",     //公式名稱錯誤
    na: "#N/A",      //函數或公式中沒有可用數值
    r: "#REF!",      //刪除了由其他公式引用的單元格
    d: "#DIV/0!",    //除數是0或空單元格
    nm: "#NUM!",     //當公式或函數中某個數字有問題時
    nl: "#NULL!",    //交叉運算符（空格）使用不正確
    sp: "#SPILL!"    //數組範圍有其它值
}

//是否是空值
function isRealNull(val) {
    if(val == null || val.toString().replace(/\s/g, "") == ""){
        return true;
    }
    else{
        return false;
    }
}

//是否是純數字
function isRealNum(val) {
    if(val == null || val.toString().replace(/\s/g, "") === ""){
        return false;
    }

    if(typeof val == "boolean"){
        return false;
    }

    if(!isNaN(val)){
        return true;
    }
    else{
        return false;
    }
}

//是否是錯誤類型
function valueIsError(value) {
    let isError = false;

    for(let x in error){
        if(value == error[x]){
            isError = true;
            break;
        }
    }

    return isError;
}

//是否有中文
function hasChinaword(s) {
    let patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    
    if (!patrn.exec(s)) {
        return false;
    }
    else {
        return true;
    }
}

//是否為非編輯模式
function isEditMode() {
    if(luckysheetConfigsetting.editMode){
        return true;
    }
    else{
        return false;
    }
}

/**
 * @description: 檢查是否允許前台進行表格編輯
 * @param {*}
 * @return {Boolean} true:允許編輯 fasle:不允許
 */
function checkIsAllowEdit(){
    if (Store.allowEdit) {
        return true;
    }
    else {
        return false;
    }
}

//範圍是否只包含部分合並單元格
function hasPartMC(cfg, r1, r2, c1, c2) {
    let hasPartMC = false;

    for(let x in Store.config["merge"]){
        let mc = cfg["merge"][x];

        if(r1 < mc.r){
            if(r2 >= mc.r && r2 < (mc.r + mc.rs - 1)){
                if(c1 >= mc.c && c1 <= (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c2 >= mc.c && c2 <= (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c1 < mc.c && c2 > (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
            }
            else if(r2 >= mc.r && r2 == (mc.r + mc.rs - 1)){
                if(c1 > mc.c && c1 < (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c2 > mc.c && c2 < (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c1 == mc.c && c2 < (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c1 > mc.c && c2 == (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
            }
            else if(r2 > (mc.r + mc.rs - 1)){
                if(c1 > mc.c && c1 <= (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c2 >= mc.c && c2 < (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c1 == mc.c && c2 < (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c1 > mc.c && c2 == (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
            }
        }
        else if(r1 == mc.r){
            if(r2 < (mc.r + mc.rs - 1)){
                if(c1 >= mc.c && c1 <= (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c2 >= mc.c && c2 <= (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c1 < mc.c && c2 > (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
            }
            else if(r2 >= (mc.r + mc.rs - 1)){
                if(c1 > mc.c && c1 <= (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c2 >= mc.c && c2 < (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c1 == mc.c && c2 < (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
                else if(c1 > mc.c && c2 == (mc.c + mc.cs - 1)){
                    hasPartMC = true;
                    break;
                }
            }
        }
        else if(r1 <= (mc.r + mc.rs - 1)){
            if(c1 >= mc.c && c1 <= (mc.c + mc.cs - 1)){
                hasPartMC = true;
                break;
            }
            else if(c2 >= mc.c && c2 <= (mc.c + mc.cs - 1)){
                hasPartMC = true;
                break;
            }
            else if(c1 < mc.c && c2 > (mc.c + mc.cs - 1)){
                hasPartMC = true;
                break;
            }
        }
    }

    return hasPartMC;
}

//獲取單個字符的字節數
function checkWordByteLength(value) {
    return Math.ceil(value.charCodeAt().toString(2).length / 8);
 }
 

export {
    isRealNull,
    isRealNum,
    valueIsError,
    hasChinaword,
    isEditMode,
    checkIsAllowEdit,
    hasPartMC,
    checkWordByteLength
}