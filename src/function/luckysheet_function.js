import functionlist from './functionlist';

const luckysheet_function = {};

for (let i = 0; i < functionlist.length; i++) {
    let func = functionlist[i];
    luckysheet_function[func.n] = func;
}

window.luckysheet_function = luckysheet_function; //掛載window 用於 eval() 計算公式

export default luckysheet_function;