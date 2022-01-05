/**
 * The default luckysheet config object.
 */
export default {
    container: "luckysheet", //容器的ID
    loading:{}, //自定義loading
    column: 60, //空表格默認的列數量
    row: 84, //空表格默認的行數據量
    allowCopy: true, //是否允許拷貝
    showtoolbar: true, //是否第二列顯示工具欄
    showinfobar: true, //是否顯示頂部名稱欄
    showsheetbar: true, //是否顯示底部表格名稱區域
    showstatisticBar: true, //是否顯示底部計數欄
    pointEdit: false, //是否是編輯器插入表格模式
    pointEditUpdate: null, //編輯器表格更新函數
    pointEditZoom: 1, //編輯器表格編輯時縮放比例
    // menu: "undo|redo|freezenrow|freezencolumn|download|share|chart|pivot",
    data: [{ "name": "Sheet1", color: "", "status": "1", "order": "0", "data": [], "config": {}, "index":0 }, { "name": "Sheet2", color: "", "status": "0", "order": "1", "data": [], "config": {}, "index":1  }, { "name": "Sheet3", color: "", "status": "0", "order": "2", "data": [], "config": {}, "index":2  }], //客戶端sheet數據[sheet1, sheet2, sheet3]
    title: "Luckysheet Demo", //表格的名稱
    userInfo:false,// 右上角的用戶訊息展示樣式，支持 1. boolean類型：false:不展示，ture:展示默認 '<i style="font-size:16px;color:#ff6a00;" class="fa fa-taxi" aria-hidden="true"></i> rabbit' ，2. HTML模板字符串或者普通字符串，如：'<i style="font-size:16px;color:#ff6a00;" class="fa fa-taxi" aria-hidden="true"></i> Lucky'或者'用戶名'， 3. 對象格式，設置 userImage：用戶頭像地址 和 userName：用戶名 4. 不設置或者設置undefined同設置false
    userMenuItem: [{url:"www.baidu.com", "icon":'<i class="fa fa-folder" aria-hidden="true"></i>', "name":"我的表格"}, {url:"www.baidu.com", "icon":'<i class="fa fa-sign-out" aria-hidden="true"></i>', "name":"退出登入"}], //點擊右上角的用戶訊息彈出的選單
    myFolderUrl: "www.baidu.com", //左上角<返回按鈕的鏈接
    config: {}, //表格行高、列寬、合併單元格、公式等設置
    fullscreenmode: true, //是否全屏模式，非全屏模式下，標記框不會強制選中。
    devicePixelRatio: window.devicePixelRatio, //設備比例，比例越大表格分標率越高
    allowEdit: true, //是否允許前台編輯
    loadUrl: "", // 配置loadUrl的地址，luckysheet會通過ajax請求表格數據，默認載入status為1的sheet數據中的所有data，其余的sheet載入除data字段外的所有字段
    loadSheetUrl: "", //配置loadSheetUrl的地址，參數為gridKey（表格主鍵） 和 index（sheet主鍵合集，格式為[1,2,3]），返回的數據為sheet的data字段數據集合
    gridKey: "", // 表格唯一標識符
    updateUrl: "", //表格數據的更新地址
    updateImageUrl: "", //縮略圖的更新地址
    allowUpdate: false, //是否允許編輯後的後台更新
    functionButton: "", //右上角功能按鈕，例如'<button id="" class="btn btn-primary" style="padding:3px 6px;font-size: 12px;margin-right: 10px;">下載</button>    <button id="" class="btn btn-primary btn-danger" style="    padding:3px 6px;    font-size: 12px;    margin-right: 10px;">分享</button>    <button id="luckysheet-share-btn-title" class="btn btn-primary btn-danger" style="    padding:3px 6px;    font-size: 12px;    margin-right: 10px;">秀數據</button>'
    showConfigWindowResize: true, //圖表和數據透視表的配置會在右側彈出，設置彈出後表格是否會自動縮進
    enableAddRow: true,//允許添加行
    enableAddBackTop: true,//允許回到頂部
    // enablePage: false,//允許加載下一頁
    autoFormatw: false,  //自動格式化超過4位數的數字為 億萬格式 例：true or "true" or "TRUE"
    accuracy: undefined,  //設置傳輸來的數值的精確位數，小數點後n位 傳參數為數字或數字字符串，例： "0" 或 0
    pageInfo:{
        'queryExps':'',
        'reportId':'',
        'fields':'',
        'mobile':'',
        'frezon':'',
        'currentPage':'',
        "totalPage":10,
        "pageUrl":"",
    },
    editMode: false, //是否為編輯模式
    beforeCreateDom: null,//表格創建之前的方法
    fireMousedown: null, //單元格數據下鉆
    lang: 'en', //language
    plugins: [], //plugins, e.g. ['chart']
    forceCalculation:false,//強制刷新公式，公式較多會有性能問題，慎用
    rowHeaderWidth: 46,
    columnHeaderHeight: 20,
    defaultColWidth:73,
    defaultRowHeight:19,
    defaultFontSize:10,
    limitSheetNameLength:true,    //是否限制工作表名的長度
    defaultSheetNameMaxLength:31,  //默認工作表名稱的最大長度
    sheetFormulaBar:true, //是否顯示公式欄
    showtoolbarConfig:{}, //自定義工具欄
    showsheetbarConfig:{}, //自定義底部sheet頁
    showstatisticBarConfig:{}, //自定義計數欄
    cellRightClickConfig:{}, //自定義單元格右鍵選單
    sheetRightClickConfig:{}, //自定義底部sheet頁右擊選單
    imageUpdateMethodConfig:{}, //自定義圖片同步方式
}
