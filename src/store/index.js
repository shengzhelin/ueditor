const Store = {
    container: null, 
    loadingObj:{},
    luckysheetfile: null, 
    defaultcolumnNum: 60, 
    defaultrowNum: 84, 
    fullscreenmode: true,
    devicePixelRatio: 1,

    currentSheetIndex: 0,
    calculateSheetIndex: 0,
	flowdata: [],
    config: {},

    visibledatarow: [],
    visibledatacolumn: [],
    ch_width: 0,
    rh_height: 0,

    cellmainWidth: 0,
    cellmainHeight: 0,
    toolbarHeight: 0,
    infobarHeight: 0,
    calculatebarHeight: 0,
    rowHeaderWidth: 46,
    columnHeaderHeight: 20,
    cellMainSrollBarSize: 12,
    sheetBarHeight: 31,
    statisticBarHeight: 23,
    luckysheetTableContentHW: [0, 0], 

    defaultcollen: 73,
    defaultrowlen: 19,

    jfcountfuncTimeout: null, 
    jfautoscrollTimeout: null,

    luckysheet_select_status: false,
    luckysheet_select_save: [{ "row": [0, 0], "column": [0, 0] }],
    luckysheet_selection_range: [],

    luckysheet_copy_save: {}, //覆制粘貼
    luckysheet_paste_iscut: false,

    filterchage: true, //篩選
    luckysheet_filter_save: { "row": [], "column": [] },

    luckysheet_sheet_move_status: false,
    luckysheet_sheet_move_data: [],
    luckysheet_scroll_status: false,

    luckysheetisrefreshdetail: true,
    luckysheetisrefreshtheme: true,
    luckysheetcurrentisPivotTable: false,

    luckysheet_rows_selected_status: false,  //行列標題相關參
    luckysheet_cols_selected_status: false,  
    luckysheet_rows_change_size: false,
    luckysheet_rows_change_size_start: [],
    luckysheet_cols_change_size: false,
    luckysheet_cols_change_size_start: [],
    luckysheet_cols_dbclick_timeout: null,
    luckysheet_cols_dbclick_times: 0,

    luckysheetCellUpdate: [],
    
    luckysheet_shiftpositon: null,

    iscopyself: true,

    orderbyindex: 0, //排序下標

    luckysheet_model_move_state: false, //模態框拖動
    luckysheet_model_xy: [0, 0],
    luckysheet_model_move_obj: null,

    luckysheet_cell_selected_move: false,  //選區拖動替換
    luckysheet_cell_selected_move_index: [],

    luckysheet_cell_selected_extend: false,  //選區下拉
    luckysheet_cell_selected_extend_index: [],
    luckysheet_cell_selected_extend_time: null,

    clearjfundo: true,
    jfundo: [],
    jfredo: [],
    lang: 'en', //language
    createChart: '',
    highlightChart: '',
    zIndex: 15,
    chartparam: {
        luckysheetCurrentChart: null, //current chart_id
        luckysheetCurrentChartActive: false,
        luckysheetCurrentChartMove: null, // Debounce state
        luckysheetCurrentChartMoveTimeout: null,//拖動圖表框的節流定時器
        luckysheetCurrentChartMoveObj: null, //chart DOM object
        luckysheetCurrentChartMoveXy: null, //上一次操作結束的圖表訊息，x,y: chart框位置，scrollLeft1,scrollTop1: 滾動條位置
        luckysheetCurrentChartMoveWinH: null, //左右滾動條滑動距離
        luckysheetCurrentChartMoveWinW: null, //上下滾動條滑動距離
        luckysheetCurrentChartResize: null,
        luckysheetCurrentChartResizeObj: null,
        luckysheetCurrentChartResizeXy: null,
        luckysheetCurrentChartResizeWinH: null,
        luckysheetCurrentChartResizeWinW: null,
        luckysheetInsertChartTosheetChange: true, // 正在執行撤銷
        luckysheetCurrentChartZIndexRank : 100,
        luckysheet_chart_redo_click:false, //撤銷重做時標識
        luckysheetCurrentChartMaxState: false, //圖表全屏狀態
        jfrefreshchartall: '',
        changeChartCellData: '',
        renderChart: '',
        getChartJson: ''
    },
    functionList:null, //function list explanation
    luckysheet_function:null,
    chart_selection: {},
    currentChart: '',
    scrollRefreshSwitch:true,

    measureTextCache:{},
    measureTextCellInfoCache:{},
    measureTextCacheTimeOut:null,
    cellOverflowMapCache:{},

    zoomRatio:1,

    visibledatacolumn_unique:null,
    visibledatarow_unique:null,

    showGridLines:true,

    toobarObject: {}, //toolbar constant
    inlineStringEditCache:null,
    inlineStringEditRange:null,

    fontList:[],
    defaultFontSize: 10,

    currentSheetView:"viewNormal",

    // cooperative editing
    cooperativeEdit:{
        usernameTimeout:{

        },
        changeCollaborationSize:[], //改變行高或者列寬時，協同提示框需要跟隨改變所需數據
        allDataColumnlen:[],//列寬發生過改變的列
        merge_range:{},//合併時單元格訊息
        checkoutData:[],//切換表格頁時所需數據
    },

    // Resources that currently need to be loaded asynchronously, especially plugins. 'Core' marks the core rendering process.
    asyncLoad:['core'],
    // 默認單元格
    defaultCell: {
        bg: null,
        bl: 0,
        ct: {fa: "General", t: "n"},
        fc: "rgb(51, 51, 51)",
        ff: 0,
        fs: 11,
        ht: 1,
        it: 0,
        vt: 1,
        m: '',
        v: ''
    }

}

export default Store;