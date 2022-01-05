import functionImplementation from './functionImplementation';
import Store from '../store/index'
import locale from '../locale/locale';
//{"0":"數學","1":"統計","2":"查找","3":"Luckysheet內置","4":"數據挖掘","5":"數據源","6":"日期","7":"過濾器","8":"財務","9":"工程計算","10":"邏輯","11":"運算符","12":"文本","13":"轉換工具","14":"數組"}

const functionlist = function(){
    let _locale = locale();
    // internationalization,get function list
    let functionListOrigin = _locale.functionlist;

    // add new property f
    for (let i = 0; i < functionListOrigin.length; i++) {
        let func = functionListOrigin[i];
        func.f = functionImplementation[func.n];
    }

    Store.functionlist = functionListOrigin;
    
    // get n property
    const luckysheet_function = {};

    for (let i = 0; i < functionListOrigin.length; i++) {
        let func = functionListOrigin[i];
        luckysheet_function[func.n] = func;
    }

    window.luckysheet_function = luckysheet_function; //Mount window for eval() calculation formula
    
    Store.luckysheet_function = luckysheet_function;
}

export default functionlist;