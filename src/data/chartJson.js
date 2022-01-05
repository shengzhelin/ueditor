/**
 * 圖表的樣式結構: 為chartOptions.defaultOption下的所有屬性,應該是所有圖表類型的並集
 * DOM的結構與此對應: DOM操作後修改此處參數,直接存儲後台, 渲染圖表時候經過一層引擎轉換才能使用各個圖表插件渲染; 後台拿到此參數,可對應綁定到DOM上
 *
 * 設計細節:
 * 1. 各個圖表類型之間的設置項不同,有交集和並集,此處設置統一存儲並集參數
 * 2. 切換圖表類型時,亦應保留所具有的設置參數,為切換回上一個圖表類型保留設置
 */
import { deepCopy } from '../utils/chartUtil';
const baseComponent = {
    label: {
        fontSize: 12, //字體大小 //fontSize為'custom'時,取cusFontSize的值
        color: '#333', //顏色
        fontFamily: 'sans-serif', //字體
        fontGroup: [], //字體, 加粗:選中:'bold',無:'normal'; 斜體: 選中:'italic',無:'normal';方向:選中:'vertical',無:'horizen'
        cusFontSize: 12, //自定義文字大小
    },
    formatter: {
        prefix: '', //前綴
        suffix: '', //後綴
        ratio: 1, //數值比例
        digit: 'auto', //小數位數
    },
};
const chartComponent = {
    //標題設置
    title: {
        show: false, //是否顯示
        text: '默認標題', //標題內容
        label: deepCopy(baseComponent.label),
        position: {
            value: 'left-top', //custom:自定義 //left-top  為custom的時候,取offsetX, offsetY
            offsetX: 40, //自定義的X位置,單位百分比
            offsetY: 50, //自定義的Y位置,單位百分比
        },
    },
    //副標題
    subtitle: {
        show: false, //是否顯示
        text: '', //標題內容
        label: deepCopy(baseComponent.label),
        distance: {
            value: 'auto', //'auto': 默認, 'far': 遠 // 'normal': 一般 'close':近 custom :取cusGap作為距離
            cusGap: 40, //自定義距離
        },
    },
    // 圖表設置
    config: {
        color: 'transparent', //默認顏色//'#333'
        fontFamily: 'Sans-serif',
        grid: {
            value: 'normal', //''normal':正常 'wide':寬 // 'narrow':窄 // 'slender':瘦長 'flat':扁平
            top: 5,
            left: 10,
            right: 20,
            bottom: 10,
        },
    },
    //圖例設置
    legend: {
        show: true,
        selectMode: 'multiple', //'single':單選 //'多選':multiple //'禁用':'disable'
        selected: [
            //圖例顯示選擇 //動態數據渲染 //分:初始化圖表+後台加載使用數據結構中數據 /編輯時根據系列實時變化
            {
                seriesName: '衣服', //
                isShow: true,
            },
            {
                seriesName: '食材', //
                isShow: true,
            },
            {
                seriesName: '圖書', //
                isShow: true,
            },
        ],
        label: deepCopy(baseComponent.label), //圖例文字樣式
        position: {
            value: 'left-top', //custom:自定義 //left-top  為custom的時候,取offsetX, offsetY
            offsetX: 40, //自定義的X位置,單位百分比
            offsetY: 50, //自定義的Y位置,單位百分比
            direction: 'horizontal', //圖例位置水平或者垂直 horizontal(水平)/vertical(垂直)
        },
        width: {
            //圖例圖標大小
            value: 'auto', //'auto':默認/ 'big':大/'medium':中/'small':小/'custom':自定義
            cusSize: 25, //圖例自定義寬度 ,單位px
        },
        height: {
            //圖例圖標大小
            value: 'auto', //'auto':默認/ 'big':大/'medium':中/'small':小/'custom':自定義
            cusSize: 14, //圖例自定義寬度 ,單位px
        },
        distance: {
            value: 'auto', //'auto':默認 /far':遠 / 'general':一般 / 'near':近 /'custom':自定義
            cusGap: 10, //自定義距離
        },
        itemGap: 10,
    },
    //提示設置
    tooltip: {
        show: true, //鼠標提示顯示
        label: deepCopy(baseComponent.label), //文字樣式
        backgroundColor: 'rgba(50,50,50,0.7)', // 鼠標提示框背景色
        triggerOn: 'mousemove', // 'mousemove':鼠標滑過 click':單擊 觸發條件
        triggerType: 'item', //觸發類型 //'axis':坐標軸觸發 'item':數據項圖形觸發
        axisPointer: {
            // 指示器配置
            type: 'line', // 'line':默認直線指示器 //'cross': 十字指示器配置 //'shadow': 陰影指示器配置
            style: {
                // 指示器樣式
                color: '#555',
                width: 'normal', //寬度:'normal':正常 'bold': 粗 'bolder':加粗
                type: 'solid', //'solid': 實線 'dash': 虛線 'dot':點線
            },
        },
        format: [
            //鼠標提示後綴
            {
                seriesName: '衣服',
                prefix: '', //前綴
                suffix: '', //後綴 (自定義單位)
                ratio: 1, //除以的數 // 1為默認, 0.1 /0.001 /...
                digit: 'auto', //小數位數 'auto' :不處理 // 數值:0 , 1 ,2 ...
            },
            {
                seriesName: '食材',
                prefix: '', //前綴
                suffix: '', //後綴
                ratio: 1,
                digit: 'auto',
            },
            {
                seriesName: '圖書',
                prefix: '', //前綴
                suffix: '', //後綴
                ratio: 1,
                digit: 'auto',
            },
        ],
        position: 'auto', // 鼠標提示位置 //'inside':中心位置 //'left'/'top'/'right'/'top'
    },
    // XY軸
    axis: {
        axisType: 'xAxisDown', //要顯示的坐標軸類型
        xAxisUp: {
            show: false, //顯示X軸
            title: {
                showTitle: false, //顯示X軸
                text: '', //標題內容
                nameGap: 15, //標題與軸線距離
                rotate: 0, //標題傾斜角度
                label: deepCopy(baseComponent.label),
                fzPosition: 'end', //標題對齊方式,end: 尾部, middle: 中間
            },
            name: '顯示X軸',
            inverse: false, //反向坐標軸 (echarts有)
            //刻度線
            tickLine: {
                show: true, //顯示刻度線
                width: 1, //刻度線寬度
                color: 'auto', //刻度線顏色
            },
            //刻度
            tick: {
                show: true, //顯示刻度
                position: 'outside', //刻度位置,默認: outside朝外 / inside: 朝內
                length: 5, //刻度長度
                width: 1, //刻度寬度
                color: 'auto', //刻度顏色
            },
            //標簽
            tickLabel: {
                show: true, //顯示刻度標簽
                label: deepCopy(baseComponent.label),
                rotate: 0, //傾斜標簽角度
                prefix: '', //標簽前綴
                suffix: '', //標簽後綴
                optimize: 0,
                distance: 0, //標簽與軸線距離
                min: 'auto', //最小值
                max: 'auto', //最大值
                ratio: 1,
                digit: 'auto',
            },
            //網格線
            netLine: {
                show: false, //顯示網格線
                width: 1, //網格線寬度
                type: 'solid', //網格線類型
                color: 'auto', //網格線顏色
                interval: {
                    //網格分割間隔數
                    value: 'auto',
                    cusNumber: 0,
                },
            },
            //網格區域
            netArea: {
                show: false, //顯示網格區域
                interval: {
                    //網格分割間隔數
                    value: 'auto',
                    cusNumber: 0,
                },
                colorOne: 'auto', //網格第一顏色
                colorTwo: 'auto', //網格第二顏色
            },
            axisLine: {
                //第二根X軸必需
                onZero: false,
            },
        },
        xAxisDown: {
            show: true, //顯示X軸
            title: {
                showTitle: false, //顯示X軸
                text: '', //標題內容
                nameGap: 15, //標題與軸線距離
                rotate: 0, //標題傾斜角度
                label: deepCopy(baseComponent.label),
                fzPosition: 'end', //標題對齊方式,end: 尾部, middle: 中間
            },
            name: '顯示X軸',
            inverse: false, //反向坐標軸 (echarts有)
            //刻度線
            tickLine: {
                show: true, //顯示刻度線
                width: 1, //刻度線寬度
                color: 'auto', //刻度線顏色
            },
            //刻度
            tick: {
                show: true, //顯示刻度
                position: 'outside', //刻度位置,默認: outside朝外 / inside: 朝內
                length: 5, //刻度長度
                width: 1, //刻度寬度
                color: 'auto', //刻度顏色
            },
            //標簽
            tickLabel: {
                show: true, //顯示刻度標簽
                label: deepCopy(baseComponent.label),
                rotate: 0, //傾斜標簽角度
                prefix: '', //標簽前綴
                suffix: '', //標簽後綴
                optimize: 0, //標簽間隔個數
                distance: 0, //標簽與軸線距離
                min: null, //最小值
                max: null, //最大值
                ratio: 1,
                digit: 'auto',
            },
            //網格線
            netLine: {
                show: false, //顯示網格線
                width: 1, //網格線寬度
                type: 'solid', //網格線類型
                color: 'auto', //網格線顏色
                interval: {
                    //網格分割間隔數
                    value: 'auto',
                    cusNumber: 0,
                },
            },
            //網格區域
            netArea: {
                show: false, //顯示網格區域
                interval: {
                    //網格分割間隔數
                    value: 'auto',
                    cusNumber: 0,
                },
                colorOne: 'auto', //網格第一顏色
                colorTwo: 'auto', //網格第二顏色
            },
        },
        yAxisLeft: {
            show: true, //顯示X軸
            title: {
                showTitle: false, //顯示X軸
                text: '', //標題內容
                nameGap: 15, //標題與軸線距離
                rotate: 0, //標題傾斜角度
                label: deepCopy(baseComponent.label),
                fzPosition: 'end', //標題對齊方式,end: 尾部, middle: 中間
            },
            name: '顯示Y軸',
            inverse: false, //反向坐標軸 (echarts有)
            //刻度線
            tickLine: {
                show: true, //顯示刻度線
                width: 1, //刻度線寬度
                color: 'auto', //刻度線顏色
            },
            //刻度
            tick: {
                show: true, //顯示刻度
                position: 'outside', //刻度位置,默認: outside朝外 / inside: 朝內
                length: 5, //刻度長度
                width: 1, //刻度寬度
                color: 'auto', //刻度顏色
            },
            //標簽
            tickLabel: {
                show: true, //顯示刻度標簽
                label: deepCopy(baseComponent.label),
                rotate: 0, //傾斜標簽角度
                formatter: deepCopy(baseComponent.formatter),
                split: 5, //分割段數
                min: null, //最小值
                max: null, //最大值
                prefix: '', //標簽前綴
                suffix: '', //標簽後綴
                ratio: 1,
                digit: 'auto',
                distance: 0, //標簽與軸線距離
            },
            //網格線
            netLine: {
                show: false, //顯示網格線
                width: 1, //網格線寬度
                type: 'solid', //網格線類型
                color: 'auto', //網格線顏色
                interval: {
                    //網格分割間隔數
                    value: 'auto',
                    cusNumber: 0,
                },
            },
            //網格區域
            netArea: {
                show: false, //顯示網格區域
                interval: {
                    //網格分割間隔數
                    value: 'auto',
                    cusNumber: 0,
                },
                colorOne: 'auto', //網格第一顏色
                colorTwo: 'auto', //網格第二顏色
            },
        },
        yAxisRight: {
            show: false, //顯示X軸
            title: {
                showTitle: false, //顯示X軸
                text: '', //標題內容
                nameGap: 15, //標題與軸線距離
                rotate: 0, //標題傾斜角度
                label: deepCopy(baseComponent.label),
                fzPosition: 'end', //標題對齊方式,end: 尾部, middle: 中間
            },
            name: '顯示Y軸',
            inverse: false, //反向坐標軸 (echarts有)
            //刻度線
            tickLine: {
                show: true, //顯示刻度線
                width: 1, //刻度線寬度
                color: 'auto', //刻度線顏色
            },
            //刻度
            tick: {
                show: true, //顯示刻度
                position: 'outside', //刻度位置,默認: outside朝外 / inside: 朝內
                length: 5, //刻度長度
                width: 1, //刻度寬度
                color: 'auto', //刻度顏色
            },
            //標簽
            tickLabel: {
                show: true, //顯示刻度標簽
                label: deepCopy(baseComponent.label),
                rotate: 0, //傾斜標簽角度
                formatter: deepCopy(baseComponent.formatter),
                split: 5, //分割段數
                min: null, //最小值
                max: null, //最大值
                prefix: '', //標簽前綴
                suffix: '', //標簽後綴
                ratio: 1,
                digit: 'auto',
                distance: 0, //標簽與軸線距離
            },
            //網格線
            netLine: {
                show: false, //顯示網格線
                width: 1, //網格線寬度
                type: 'solid', //網格線類型
                color: 'auto', //網格線顏色
                interval: {
                    //網格分割間隔數
                    value: 'auto',
                    cusNumber: 0,
                },
            },
            //網格區域
            netArea: {
                show: false, //顯示網格區域
                interval: {
                    //網格分割間隔數
                    value: 'auto',
                    cusNumber: 0,
                },
                colorOne: 'auto', //網格第一顏色
                colorTwo: 'auto', //網格第二顏色
            },
        },
    },
};

//此類數據抽出來作為模板數據,每次使用deepCopy一份即可
//注: 若頁面展示的是語義化的參數,則此處也只定義語義化的參數,具體數值在引擎裡做轉換
//若界面選擇的直接是用戶期望的數值,則直接采用數值即可
/**
 *  位置訊息
 *
 */
const positionOption = [
    { value: 'left-top', label: '左上' },
    { value: 'left-middle', label: '左中' },
    { value: 'left-bottom', label: '左下' },
    { value: 'right-top', label: '右上' },
    { value: 'right-middle', label: '右中' },
    { value: 'right-bottom', label: '右下' },
    { value: 'center-top', label: '中上' },
    { value: 'center-middle', label: '居中' },
    { value: 'center-bottom', label: '中下' },
    { value: 'custom', label: '自定義' },
];

//距離
const distanceOption = [
    { value: 'auto', label: '默認' },
    { value: 'far', label: '遠' },
    { value: 'normal', label: '一般' },
    { value: 'close', label: '近' },
    { value: 'custom', label: '自定義' },
];

// 字體大小集合
const fontSizeOption = [
    { value: 6, label: '6px' },
    { value: 8, label: '8px' },
    { value: 10, label: '10px' },
    { value: 12, label: '12px' },
    { value: 14, label: '14px' },
    { value: 16, label: '16px' },
    { value: 18, label: '18px' },
    { value: 20, label: '20px' },
    { value: 22, label: '22px' },
    { value: 24, label: '24px' },
    { value: 30, label: '30x' },
    { value: 36, label: '36px' },
    { value: 'custom', label: '自定義' },
];

// 線樣式
const lineStyleOption = [
    { value: 'solid', label: '實線' },
    { value: 'dashed', label: '虛線' },
    { value: 'dotted', label: '點線' },
];

// 線寬度
const lineWeightOption = [
    { value: 'normal', label: '正常' },
    { value: 'bold', label: '粗' },
    { value: 'bolder', label: '加粗' },
];

// 普通位置集合
const posOption = [
    { value: 'auto', label: '默認' },
    { value: 'inside', label: '中心位置' },
    { value: 'top', label: '上側' },
    { value: 'left', label: '左側' },
    { value: 'right', label: '右側' },
    { value: 'bottom', label: '底側' },
];

// 數值比例集合
const ratioOption = [
    { value: 100, label: '乘以100' },
    { value: 10, label: '乘以10' },
    { value: 1, label: '默認' },
    { value: 0.1, label: '除以10' },
    { value: 0.01, label: '除以100' },
    { value: 0.001, label: '除以1000' },
    { value: 0.0001, label: '除以一萬' },
    { value: 0.00001, label: '除以10萬' },
    { value: 0.000001, label: '除以一百萬' },
    { value: 0.0000001, label: '除以一千萬' },
    { value: 0.00000001, label: '除以一億' },
    { value: 0.000000001, label: '除以十億' },
];

// 數值位數集合
const digitOption = [
    { value: 'auto', label: '自動顯示' },
    { value: 0, label: '整數' },
    { value: 1, label: '1位小數' },
    { value: 2, label: '2位小數' },
    { value: 3, label: '3位小數' },
    { value: 4, label: '4位小數' },
    { value: 5, label: '5位小數' },
    { value: 6, label: '6位小數' },
    { value: 7, label: '7位小數' },
    { value: 8, label: '8位小數' },
];

// (圖例)大小集合
const sizeOption = [
    { value: 'auto', label: '默認' },
    { value: 'big', label: '大' },
    { value: 'medium', label: '中' },
    { value: 'small', label: '小' },
    { value: 'custom', label: '自定義' },
];

// 間隔集合
const intervalOption = [
    { value: 'auto', label: '默認' },
    { value: 0, label: '每個刻度' },
    { value: 1, label: '間隔1個' },
    { value: 2, label: '間隔2個' },
    { value: 3, label: '間隔3個' },
    { value: 'custom', label: '自定義' },
];

//字體大小
const fontSizeList = [
    { label: '默認', value: 'auto' },
    { label: '6px', value: 6 },
    { label: '8px', value: 8 },
    { label: '10px', value: 10 },
    { label: '12px', value: 12 },
    { label: '14px', value: 14 },
    { label: '16px', value: 16 },
    { label: '18px', value: 18 },
    { label: '24px', value: 24 },
    { label: '28px', value: 28 },
    { label: '36px', value: 36 },
    { label: '自定義', value: 'custom' },
];

//label字體樣式 1 // 'bold','italic','vertical'
const fontStyleIBV = {
    bold: {
        des: '加粗',
        text: 'B',
    },
    italic: {
        des: '斜體',
        text: 'I',
    },
    vertical: {
        des: '文字方向',
        text: '垂直',
    },
};
//label字體樣式 2 // 'italic','bold'
const fontStyleIB = {
    bold: {
        des: '加粗',
        text: 'B',
    },
    italic: {
        des: '斜體',
        text: 'I',
    },
};

// model data
const chartModelData = [["地區", "衣服", "食材", "圖書"], ["上海", 134, 345, 51], ["北京", 345, 421, 234], ["廣州", 453, 224, 156], ["杭州", 321, 634, 213], ["南京", 654, 542, 231]];

// base chart option
const chartOptions = {
    //圖表類型設置集合
    chartAllType: 'echarts|line|default',

    //圖表配置
    defaultOption: deepCopy(chartComponent),

    //圖表數據
    chartData: deepCopy(chartModelData),
} //圖表設置項

export {
    chartComponent,
    positionOption,
    distanceOption,
    fontSizeOption,
    lineStyleOption,
    lineWeightOption,
    posOption,
    ratioOption,
    digitOption,
    sizeOption,
    fontSizeList,
    intervalOption,
    fontStyleIBV,
    fontStyleIB,
    chartOptions
};
