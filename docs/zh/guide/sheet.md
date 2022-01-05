# 工作表配置

## 初始化配置
表格初始化配置`options`時，需要配置一個由每個工作表參數組成的一維數組，賦給`options.data`。

> 表格初始化完成之後，通過方法[`luckysheet.getAllSheets()`](/zh/guide/api.html#getAllSheets([setting]))可以獲取所有工作表的配置信息。

options.data示例如下：
```json
[
    {
        "name": "Cell", //工作表名稱
        "color": "", //工作表顏色
        "index": 0, //工作表索引
        "status": 1, //激活狀態
        "order": 0, //工作表的下標
        "hide": 0,//是否隱藏
        "row": 36, //行數
        "column": 18, //列數
        "defaultRowHeight": 19, //自定義行高
        "defaultColWidth": 73, //自定義列寬
        "celldata": [], //初始化使用的單元格數據
        "config": {
            "merge":{}, //合並單元格
            "rowlen":{}, //表格行高
            "columnlen":{}, //表格列寬
            "rowhidden":{}, //隱藏行
            "colhidden":{}, //隱藏列
            "borderInfo":{}, //邊框
            "authority":{}, //工作表保護
            
        },
        "scrollLeft": 0, //左右滾動條位置
        "scrollTop": 315, //上下滾動條位置
        "luckysheet_select_save": [], //選中的區域
        "calcChain": [],//公式鏈
        "isPivotTable":false,//是否數據透視表
        "pivotTable":{},//數據透視表設置
        "filter_select": {},//篩選範圍
        "filter": null,//篩選配置
        "luckysheet_alternateformat_save": [], //交替顏色
        "luckysheet_alternateformat_save_modelCustom": [], //自定義交替顏色	
        "luckysheet_conditionformat_save": {},//條件格式
        "frozen": {}, //凍結行列配置
        "chart": [], //圖表配置
        "zoomRatio":1, // 縮放比例
        "image":[], //圖片
        "showGridLines": 1, //是否顯示網格線
        "dataVerification":{} //數據驗證配置
    },
    {
        "name": "Sheet2",
        "color": "",
        "index": 1,
        "status": 0,
        "order": 1,
        "celldata": [],
        "config": {}
    },
    {
        "name": "Sheet3",
        "color": "",
        "index": 2,
        "status": 0,
        "order": 2,
        "celldata": [],
        "config": {},
    }
]
```
        
### name
- 類型：String
- 默認值："Sheet1"
- 作用：工作表名稱

------------
### color
- 類型：String
- 默認值："##f20e0e"
- 作用：工作表顏色,工作表名稱下方會有一條底部邊框

------------
### index
- 類型：String
- 默認值：""
- 作用：工作表索引，作為唯一key值使用，新增工作表時會自動賦值一個隨機字符串。注意`index`不是工作表順序，和`order`區分開。

------------
### status
- 類型：Number
- 默認值：1
- 作用： 激活狀態，僅有一個激活狀態的工作表，其他工作表為 0

------------
### order
- 類型：Number
- 默認值：0
- 作用： 工作表的下標，代表工作表在底部sheet欄展示的順序，新增工作表時會遞增，從0開始

------------
### hide
- 類型：Number
- 默認值：0
- 作用： 是否隱藏，`0`為不隱藏，`1`為隱藏

------------
### row
- 類型：Number
- 默認值：36
- 作用： 單元格行數

------------
### column
- 類型：Number
- 默認值：18
- 作用： 單元格列數

------------
### defaultRowHeight
- 類型：Number
- 默認值：19
- 作用： 自定義的默認行高，單位為px

------------
### defaultColWidth
- 類型：Number
- 默認值：73
- 作用： 自定義的默認列寬，單位為px

------------
### celldata
- 類型：Array
- 默認值：[]
- 作用： 原始單元格數據集，存儲sheet中所有單元格中的值，是一個包含`{r:0,c:0,v:{m:"value",v:"value",ct: {fa: "General", t: "g"}}}`格式單元格信息的一維數組，只在初始化的時候使用。

    r代表行，c代表列，v代表該單元格的值，值可以是字符、數字或者對象。

    Luckysheet在建立的時候會根據 `options.data[i].row` 和 `options.data[i].column` 的行列數量大小新建一個表格data，然後再使用 `data[r][c]=v` 的方式填充表格數據，空數據單元格以null表示。

    使用celldata初始化完表格後，數據轉換為luckysheetfile中的字段[data](#data)，如`luckysheetfile[i].data`,後續操作表格的數據更新，會更新到這個data字段中，celldata不再使用。 

- 示例：
    ```js
    [{
        "r": 0,
        "c": 0,
        "v": {
            ct: {fa: "General", t: "g"},
            m:"value1",
            v:"value1"
        }
    }, {
        "r": 0,
        "c": 1,
        "v": {
            ct: {fa: "General", t: "g"},
            m:"value2",
            v:"value2"
        }
    }]
    ```
> 詳細了解 [單元格格式](/zh/guide/cell.html)

------------
### config
- 類型：Object
- 默認值：{}
- 作用：表格行高、列寬、合並單元格、邊框、隱藏行等設置

    注意，config如果為空,必須為空對象`{}`,不能為字符串或者null

#### config.merge
- 類型：Object
- 默認值：{}
- 作用：合並單元格設置
- 示例：
    ```js
    {
            "13_5": {
                "r": 13,
                "c": 5,
                "rs": 3,
                "cs": 1
            },
            "13_7": {
                "r": 13,
                "c": 7,
                "rs": 3,
                "cs": 2
            },
            "14_2": {
                "r": 14,
                "c": 2,
                "rs": 1,
                "cs": 2
            }
        }
    ```
    對象中的`key`為`r + '_' + c`的拼接值，`value`為左上角單元格信息: r:行數，c:列數，rs：合並的行數，cs:合並的列數

#### config.rowlen
- 類型：Object
- 默認值：{}
- 作用：每個單元格的行高
- 示例：
    ```js
    "rowlen": {
                "0": 20,
                "1": 20,
                "2": 20
            }
    ```

#### config.columnlen
- 類型：Object
- 默認值：{}
- 作用：每個單元格的列寬
- 示例：
    ```js
    "columnlen": {
                "0": 97,
                "1": 115,
                "2": 128
            }
    ```

#### config.rowhidden
- 類型：Object
- 默認值：{}
- 作用：隱藏行信息，格式為：`rowhidden[行數]: 0`,

    `key`指定行數即可，`value`總是為`0`
- 示例：
    ```js
    "rowhidden": {
                "30": 0,
                "31": 0
            }
    ```

#### config.colhidden
- 類型：Object
- 默認值：{}
- 作用：隱藏列
    格式為：`colhidden[列數]: 0`,

        `key`指定列數即可，`value`總是為`0`
- 示例：
    ```js
    "colhidden": {
                "30": 0,
                "31": 0
            }
    ```

#### config.borderInfo
- 類型：Array
- 默認值：{}
- 作用：單元格的邊框信息
- 示例：
    ```js
    "borderInfo": [{
            "rangeType": "cell",
            "value": {
                "row_index": 3,
                "col_index": 3,
                "l": {
                    "style": 10,
                    "color": "rgb(255, 0, 0)"
                },
                "r": {
                    "style": 10,
                    "color": "rgb(255, 0, 0)"
                },
                "t": {
                    "style": 10,
                    "color": "rgb(255, 0, 0)"
                },
                "b": {
                    "style": 10,
                    "color": "rgb(255, 0, 0)"
                }
            }
        },
        {
            "rangeType": "range",
            "borderType": "border-all",
            "style": "3",
            "color": "#0000ff",
            "range": [{
                "row": [7, 8],
                "column": [2, 3]
            }]
        }, {
            "rangeType": "range",
            "borderType": "border-inside",
            "style": "3",
            "color": "#0000ff",
            "range": [{
                "row": [7, 8],
                "column": [8, 9]
            }]
        }]
    ```
    範圍類型分單個單元格和選區兩種情況
    1. 選區 `rangeType: "range"`

        + 邊框類型 `borderType："border-left" | "border-right" | "border-top" | "border-bottom" | "border-all" | "border-outside" | "border-inside" | "border-horizontal" | "border-vertical" | "border-none"`，
        + 邊框粗細 `style:  1 Thin | 2 Hair | 3 Dotted | 4 Dashed | 5 DashDot | 6 DashDotDot | 7 Double | 8 Medium | 9 MediumDashed | 10 MediumDashDot | 11 MediumDashDotDot | 12 SlantedDashDot | 13 Thick`，和aspose.cells的getLineStyle()的值對應的話，需要自己做個轉換，參考 [aspose.cells](https://apireference.aspose.com/cells/net/aspose.cells/cellbordertype)
        + 邊框顏色 `color: 16進制顏色值`
        + 選區範圍 `range: 行列信息數組`

    2. 單個單元格 `rangeType："cell"` 
        + 單元格的行數和列數索引 `value.row_index: 數字，value.col_index: 數字`
        + 四個邊框對象 `value.l:左邊框，value.r:右邊框，value.t:上邊框，value.b:下邊框`
        + 邊框粗細 `value.l.style: 1 Thin | 2 Hair | 3 Dotted | 4 Dashed | 5 DashDot | 6 DashDotDot | 7 Double | 8 Medium | 9 MediumDashed | 10 MediumDashDot | 11 MediumDashDotDot | 12 SlantedDashDot | 13 Thick`
        + 邊框顏色 `value.l.color: 16進制顏色值`

    更多模板：

        + ```js
        {
            "rangeType": "range",
            "borderType": "border-all",
            "style": "3",
            "color": "#0000ff",
            "range": [{
                "row": [7, 8],
                "column": [2, 3]
            }]
        }
        ```
        表示設置範圍為`{"row": [7, 8],"column": [2, 3]}`的選區，類型為所有邊框，邊框粗細為`Dotted`，顏色為`"#0000ff"`

        + ```js
            {
                "rangeType": "cell",
                "value": {
                    "row_index": 3,
                    "col_index": 3,
                    "l": {
                        "style": 10,
                        "color": "rgb(255, 0, 0)"
                    },
                    "r": {
                        "style": 10,
                        "color": "rgb(255, 0, 0)"
                    },
                    "t": {
                        "style": 10,
                        "color": "rgb(255, 0, 0)"
                    },
                    "b": {
                        "style": 10,
                        "color": "rgb(255, 0, 0)"
                    }
                }
            }
            ```
            表示設置單元格`"D4"`，上邊框/下邊框/左邊框/右邊框都是邊框粗細為`"MediumDashDot"`,顏色為`"rgb(255, 0, 0)"`

#### config.authority
- 類型：Object
- 默認值：{}
- 作用：工作表保護，可以設置當前整個工作表不允許編輯或者部分區域不可編輯，如果要申請編輯權限需要輸入密碼，自定義配置用戶可以操作的類型等。
- 示例：
    ```js        
    "authority":{//當前工作表的權限配置
        selectLockedCells:1, //選定鎖定單元格
        selectunLockedCells:1, //選定解除鎖定的單元格
        formatCells:1, //設置單元格格式
        formatColumns:1, //設置列格式
        formatRows:1, //設置行格式
        insertColumns:1, //插入列
        insertRows:1, //插入行
        insertHyperlinks:1, //插入超鏈接
        deleteColumns:1, //刪除列
        deleteRows:1, //刪除行
        sort:1, //排序
        filter:1, //使用自動篩選
        usePivotTablereports:1, //使用數據透視表和報表
        editObjects:1, //編輯對象
        editScenarios:1, //編輯方案    
        sheet:1, //如果為1或true，則該工作表受到保護；如果為0或false，則該工作表不受保護。
        hintText:"", //彈窗提示的文字
        algorithmName:"None",//加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
        saltValue:null, //密碼解密的鹽參數，為一個自己定的隨機數值
        
        allowRangeList:[{ //區域保護
            name:"area", //名稱
            password:"1", //密碼
            hintText:"", //提示文字
            algorithmName:"None",//加密方案：MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
            saltValue:null, //密碼解密的鹽參數，為一個自己定的隨機數值
            sqref:"$C$1:$D$5" //區域範圍
        }],
    },
    ```

------------
### scrollLeft
- 類型：Number
- 默認值：0
- 作用： 左右滾動條位置

------------
### scrollTop
- 類型：Number
- 默認值：0
- 作用： 上下滾動條位置

------------
### luckysheet_select_save
- 類型：Array
- 默認值：[]
- 作用： 選中的區域，支持多選，是一個包含多個選區對象的一維數組
- 示例：
    ```js
    [
        {
            "row": [ 0, 1 ],
            "column": [ 0, 0 ]
        },
        {
            "row": [ 3, 4 ],
            "column": [ 1, 2 ]
        },
        {
            "row": [ 1, 3 ],
            "column": [ 3, 3 ]
        }
    ]
    ```

------------
### calcChain
- 類型：Array
- 默認值：[]
- 作用： 公式鏈是一個由用戶指定順序排列的公式信息數組，Luckysheet會根據此順序來決定公式執行的順序。

    注意，在初始化工作簿的時候，如果有單元格包含公式，請務必添加對應單元格位置的公式鏈，否則Luckysheet無法識別公式。
    
- 示例：
    ```js
    [{
        "r": 6, //行數
        "c": 3, //列數
        "index": 1, //工作表id
        "func": [true, 23.75, "=AVERAGE(D3:D6)"], //公式信息，包含公式計算結果和公式字符串
        "color": "w", //"w"：采用深度優先算法 "b":普通計算
        "parent": null,
        "chidren": {},
        "times": 0
    }, {
        "r": 7,
        "c": 3,
        "index": 1,
        "func": [true, 30, "=MAX(D3:D6)"],
        "color": "w",
        "parent": null,
        "chidren": {},
        "times": 0
    }]
    ```

------------
### isPivotTable
- 類型：Boolean
- 默認值：false
- 作用： 是否數據透視表

------------
### pivotTable
- 類型：Object
- 默認值：{}
- 作用： 數據透視表設置
- 示例：
    ```js
    {
        "pivot_select_save": {
            "row": [0, 12],
            "column": [0, 4]
        },
        "pivotDataSheetIndex": 6, //源數據所在的sheet頁
        "column": [{
            "index": 3,
            "name": "subject",
            "fullname": "subject"
        }],
        "row": [{
            "index": 1,
            "name": "student",
            "fullname": "student"
        }],
        "filter": [],
        "values": [{
            "index": 4,
            "name": "score",
            "fullname": "count:score",
            "sumtype": "COUNTA",
            "nameindex": 0
        }],
        "showType": "column",
        "pivotDatas": [ //數據透視表的源數據
            ["count:score", "science", "mathematics", "foreign language", "English", "total"],
            ["Alex", 1, 1, 1, 1, 4],
            ["Joy", 1, 1, 1, 1, 4],
            ["Tim", 1, 1, 1, 1, 4],
            ["total", 3, 3, 3, 3, 12]
        ],
        "drawPivotTable": false,
        "pivotTableBoundary": [5, 6]
    }
    ```

------------
### filter_select
- 類型：Object
- 默認值：{}
- 作用： 篩選範圍。一個選區，一個sheet只有一個篩選範圍，類似`luckysheet_select_save`。如果僅僅只是創建一個選區打開篩選功能，則配置這個範圍即可，如果還需要進一步設置詳細的篩選條件，則需要另外配置同級的 [filter](#filter) 屬性。
- 示例：
    ```js
    {
        
        "row": [ 2, 6 ],
        "column": [ 1, 3 ]
    }
    ```

------------
### filter
- 類型：Object
- 默認值：{}
- 作用： 篩選的具體設置，跟`filter_select`篩選範圍是互相搭配的。當你在第一個sheet頁創建了一個篩選區域，通過`luckysheet.getLuckysheetfile()[0].filter`也可以看到第一個sheet的篩選配置信息。

    以下是一個完整的篩選配置案例
    ```js
    {   
        //"0"表示第一列
        "0": {
            "caljs": { // 按條件篩選
                "value": "cellnull", // 篩選類型
                "text": "Is empty", // 類型說明
                "type": "0" // 篩選大類
            },
            "rowhidden": { "3": 0, "4": 0 }, // 隱藏行信息
            "optionstate": true, // 是否開啟配置
            "cindex": 1, // 當前範圍列順序，這里表示第一列
            "str": 2, // 範圍，起始行
            "edr": 6, // 範圍，結束行
            "stc": 1, // 範圍，起始列
            "edc": 3 // 範圍，結束列
        },
        //"1"表示第二列
        "1": {
            "caljs": {},
            "rowhidden": { "1": 0},
            "optionstate": true,
            "cindex": 2, // 當前範圍列順序，這里表示第二列
            "str": 2,
            "edr": 6,
            "stc": 1,
            "edc": 3
        }
    }
    ```
    1. `filter[key]`的`key`值，表示是列索引，從0開始，具體設置項中的`cindex`是從1開始，和這里的`key`是同一個意思。
    2. `caljs`用來設置按條件篩選的類型和對應的值，設置生效後，會計算隱藏行信息存儲在`rowhidden`中。以下是全部的可設置的類型，其中`value1`和`value2`就是用戶自己填的文本信息：
       + `caljs:{value: null, text: "無", type: "0"}`
       + `caljs:{value: "cellnull", text: "單元格為空", type: "0"}`
       + `caljs:{value: "cellnonull", text: "單元格有數據", type: "0"}`
       + `caljs:{value: "textinclude", text: "文本包含", type: "1", value1: "Lucky"}`
       + `caljs:{value: "textnotinclude", text: "文本不包含", type: "1", value1: "Lucky"}`
       + `caljs:{value: "textstart", text: "文本開頭為", type: "1", value1: "Lucky"}`
       + `caljs:{value: "textend", text: "文本結尾為", type: "1", value1: "Lucky"}`
       + `caljs:{value: "textequal", text: "文本等於", type: "1", value1: "Lucky"}`
       + `caljs:{value: "dateequal", text: "日期等於", type: "1", value1: "2020-10-16"}`
       + `caljs:{value: "datelessthan", text: "日期早於", type: "1", value1: "2020-10-16"}`
       + `caljs:{value: "datemorethan", text: "日期晚於", type: "1", value1: "2020-10-16"}`
       + `caljs:{value: "morethan", text: "大於", type: "1", value1: "10"}`
       + `caljs:{value: "moreequalthan", text: "大於等於", type: "1", value1: "10"}`
       + `caljs:{value: "lessthan", text: "小於", type: "1", value1: "10"}`
       + `caljs:{value: "lessequalthan", text: "小於等於", type: "1", value1: "10"}`
       + `caljs:{value: "equal", text: "等於", type: "1", value1: "10"}`
       + `caljs:{value: "noequal", text: "不等於", type: "1", value1: "10"}`
       + `caljs:{value: "include", text: "介於", type: "2", value1: "15", value2: "25"}`
       + `caljs:{value: "noinclude", text: "不在其中", type: "2", value1: "15", value2: "25"}`
    3. `rowhidden`是存儲的隱藏行信息，但是如果沒有設置`caljs`按條件篩選，則表明是設置了按顏色篩選（如果行之間有顏色區分的話）和按值進行篩選。所以可以看出，`caljs`的優先級大於`rowhidden`。
    4. `optionstate`表示是否開啟配置，這是一個內部標識，直接設置`true`即可。
    5. `cindex`表示當前設置的列順序，從1開始計數，和`filter[key]`的`key`值形成對應，結果是`key`+1。
    6. `str`是起始行，`edr`是結束行，`stc`是起始列，`edc`是結束列，四個數字代表整個篩選範圍，與`filter_select`的內容保持一致即可。

------------
### luckysheet_alternateformat_save
- 類型：Array
- 默認值：[]
- 作用： 交替顏色配置
- 示例：
    ```js
    [{
        "cellrange": { //單元格範圍
            "row": [1, 6],
            "column": [1, 5]
        },
        "format": {
            "head": { //頁眉顏色
                "fc": "#000",
                "bc": "#5ed593"
            },
            "one": { //第一種顏色
                "fc": "#000",
                "bc": "#ffffff"
            },
            "two": { //第二種顏色
                "fc": "#000",
                "bc": "#e5fbee"
            },
            "foot": { //頁腳顏色
                "fc": "#000",
                "bc": "#a5efcc"
            }
        },
        "hasRowHeader": false, //含有頁眉
        "hasRowFooter": false //含有頁腳
    }, {
        "cellrange": {
            "row": [1, 6],
            "column": [8, 12]
        },
        "format": {
            "head": {
                "fc": "#000",
                "bc": "#5599fc"
            },
            "one": {
                "fc": "#000",
                "bc": "#ffffff"
            },
            "two": {
                "fc": "#000",
                "bc": "#ecf2fe"
            },
            "foot": {
                "fc": "#000",
                "bc": "#afcbfa"
            }
        },
        "hasRowHeader": false,
        "hasRowFooter": false
    }]
    ```

------------
### luckysheet_alternateformat_save_modelCustom
- 類型：Array
- 默認值：[]
- 作用：自定義交替顏色，包含多個自定義交替顏色的配置
- 示例：
    ```js
    [{
        "head": { //頁眉顏色
            "fc": "#6aa84f",
            "bc": "#ffffff"
        },
        "one": { //第一種顏色
            "fc": "#000",
            "bc": "#ffffff"
        },
        "two": { //第二種顏色
            "fc": "#000",
            "bc": "#e5fbee"
        },
        "foot": { //頁腳顏色
            "fc": "#000",
            "bc": "#a5efcc"
        }
    }]
    ```

------------
### luckysheet_conditionformat_save
- 類型：Array
- 默認值：[]
- 作用： 條件格式配置信息，包含多個條件格式配置對象的一維數組，

    type: "default": 突出顯示單元格規則和項目選區規則，

    "dataBar":數據條，

    "icons":圖標集，

    "colorGradation": 色階

    API中對此設置也有介紹[API setRangeConditionalFormat](/zh/guide/api.html)
- 示例：
    ```js
    [
        {
            "type": "default",
            "cellrange": [ //應用的範圍
                {
                    "row": [ 2, 7 ],
                    "column": [ 2, 2 ]
                }
            ],
            "format": { //type 為 default 時 應設置文本顏色和單元格顏色
                "textColor": "#000000",
                "cellColor": "#ff0000"
            },
            "conditionName": "betweenness", //類型
            "conditionRange": [ //條件值所在單元格
                {
                    "row": [ 4, 4 ],
                    "column": [ 2, 2 ]
                },
                {
                    "row": [ 6, 6 ],
                    "column": [ 2, 2 ]
                }
            ],
            "conditionValue": [ 2, 4
            ] //自定義傳入的條件值
        },
        {
            "type": "dataBar",
            "cellrange": [
                {
                    "row": [ 10, 15 ],
                    "column": [ 10, 11 ]
                }
            ],
            "format": [
                "#6aa84f",
                "#ffffff"
            ]
        },
        {
            "type": "icons",
            "cellrange": [
                {
                    "row": [ 19, 23 ],
                    "column": [ 2, 2 ]
                }
            ],
            "format": {
                "len": "3",
                "leftMin": "0",
                "top": "0"
            }
        },
        {
            "type": "colorGradation",
            "cellrange": [
                {
                    "row": [ 10, 15 ],
                    "column": [ 6, 6 ]
                }
            ],
            "format": [
                "rgb(99, 190, 123)",
                "rgb(255, 235, 132)",
                "rgb(248, 105, 107)"
            ]
        }
    ]
    ```

------------
### frozen
- 類型：Array
- 默認值：[]
- 作用： 凍結行列設置，分為6種類型
    1. "row": 凍結首行
    2. "column": 凍結首列
    3. "both": 凍結行列
    4. "rangeRow": 凍結行到選區
    5. "rangeColumn": 凍結列到選區
    6. "rangeBoth": 凍結行列到選區
    7. "cancel": 取消凍結

    當設置凍結到選區的時候，需要設置開啟凍結的單元格位置，格式為`{ row_focus:0, column_focus:0 }`，意為當前激活的單元格的行數和列數。

    sheet新的配置屬性，存儲更語義化的配置，用於初始化和傳給後端。
    
    注意一點，luckysheetfile中還有一個配置freezen，其中的freezenhorizontaldata仍然用作本地數據，但是不發給後台存儲，只做本地調試。

- 示例：
    - 凍結首行
    ```json
    {
        type: 'row'
    }
    ```
    - 凍結行到`'A1'`選區
     ```json
    {
        type: 'rangeRow',
        range: {row_focus: 0, column_focus: 0}
    }
    ```
    - 凍結行列到`'B2'`選區
     ```json
    {
        type: 'rangeBoth',
        range: {row_focus: 1, column_focus: 1}
    }
    ```

------------
### chart
- 類型：Array
- 默認值：[]
- 作用： 圖表配置，參照chartMix的配置格式，允許只設置想要的圖表屬性，一個完整的配置案例如下。
- 示例：
    :::::: details
    ```json
    {
        "chart_id": "chart_p145W6i73otw_1596209943446",
        "width": 400,
        "height": 250,
        "left": 20,
        "top": 120,
        "sheetIndex": "Sheet_6az6nei65t1i_1596209937084",
        "needRangeShow": true,
        "chartOptions": {
            "chart_id": "chart_p145W6i73otw_1596209943446",
            "chartAllType": "echarts|line|default",
            "rangeArray": [ { "row": [ 0, 4 ], "column": [ 0, 7 ] } ],
            "rangeColCheck": { "exits": true, "range": [ 0, 0 ] },
            "rangeRowCheck": { "exits": true, "range": [ 0, 0 ] },
            "rangeConfigCheck": false,
            "defaultOption": {
                "title": {
                    "show": false,
                    "text": "默認標題",
                    "label": {
                        "fontSize": 12,
                        "color": "#333",
                        "fontFamily": "sans-serif",
                        "fontGroup": [],
                        "cusFontSize": 12
                    },
                    "position": {
                        "value": "left-top",
                        "offsetX": 40,
                        "offsetY": 50
                    }
                },
                "subtitle": {
                    "show": false,
                    "text": "",
                    "label": {
                        "fontSize": 12,
                        "color": "#333",
                        "fontFamily": "sans-serif",
                        "fontGroup": [],
                        "cusFontSize": 12
                    },
                    "distance": {
                        "value": "auto",
                        "cusGap": 40
                    }
                },
                "config": {
                    "color": "transparent",
                    "fontFamily": "Sans-serif",
                    "grid": {
                        "value": "normal",
                        "top": 5,
                        "left": 10,
                        "right": 20,
                        "bottom": 10
                    }
                },
                "legend": {
                    "show": true,
                    "selectMode": "multiple",
                    "selected": [
                        {
                            "seriesName": "衣服",
                            "isShow": true
                        },
                        {
                            "seriesName": "食材",
                            "isShow": true
                        },
                        {
                            "seriesName": "圖書",
                            "isShow": true
                        }
                    ],
                    "label": {
                        "fontSize": 12,
                        "color": "#333",
                        "fontFamily": "sans-serif",
                        "fontGroup": [],
                        "cusFontSize": 12
                    },
                    "position": {
                        "value": "left-top",
                        "offsetX": 40,
                        "offsetY": 50,
                        "direction": "horizontal"
                    },
                    "width": {
                        "value": "auto",
                        "cusSize": 25
                    },
                    "height": {
                        "value": "auto",
                        "cusSize": 14
                    },
                    "distance": {
                        "value": "auto",
                        "cusGap": 10
                    },
                    "itemGap": 10,
                    "data": [
                        "Mon",
                        "Tues",
                        "Wed",
                        "Thur",
                        "Fri",
                        "Sat",
                        "Sun"
                    ]
                },
                "tooltip": {
                    "show": true,
                    "label": {
                        "fontSize": 12,
                        "color": "#333",
                        "fontFamily": "sans-serif",
                        "fontGroup": [],
                        "cusFontSize": 12
                    },
                    "backgroundColor": "rgba(50,50,50,0.7)",
                    "triggerOn": "mousemove",
                    "triggerType": "item",
                    "axisPointer": {
                        "type": "line",
                        "style": {
                            "color": "#555",
                            "width": "normal",
                            "type": "solid"
                        }
                    },
                    "format": [
                        {
                            "seriesName": "衣服",
                            "prefix": "",
                            "suffix": "",
                            "ratio": 1,
                            "digit": "auto"
                        },
                        {
                            "seriesName": "食材",
                            "prefix": "",
                            "suffix": "",
                            "ratio": 1,
                            "digit": "auto"
                        },
                        {
                            "seriesName": "圖書",
                            "prefix": "",
                            "suffix": "",
                            "ratio": 1,
                            "digit": "auto"
                        }
                    ],
                    "position": "auto"
                },
                "axis": {
                    "axisType": "xAxisDown",
                    "xAxisUp": {
                        "show": false,
                        "title": {
                            "showTitle": false,
                            "text": "",
                            "nameGap": 15,
                            "rotate": 0,
                            "label": {
                                "fontSize": 12,
                                "color": "#333",
                                "fontFamily": "sans-serif",
                                "fontGroup": [],
                                "cusFontSize": 12
                            },
                            "fzPosition": "end"
                        },
                        "name": "顯示X軸",
                        "inverse": false,
                        "tickLine": {
                            "show": true,
                            "width": 1,
                            "color": "auto"
                        },
                        "tick": {
                            "show": true,
                            "position": "outside",
                            "length": 5,
                            "width": 1,
                            "color": "auto"
                        },
                        "tickLabel": {
                            "show": true,
                            "label": {
                                "fontSize": 12,
                                "color": "#333",
                                "fontFamily": "sans-serif",
                                "fontGroup": [],
                                "cusFontSize": 12
                            },
                            "rotate": 0,
                            "prefix": "",
                            "suffix": "",
                            "optimize": 0,
                            "distance": 0,
                            "min": "auto",
                            "max": "auto",
                            "ratio": 1,
                            "digit": "auto"
                        },
                        "netLine": {
                            "show": false,
                            "width": 1,
                            "type": "solid",
                            "color": "auto",
                            "interval": {
                                "value": "auto",
                                "cusNumber": 0
                            }
                        },
                        "netArea": {
                            "show": false,
                            "interval": {
                                "value": "auto",
                                "cusNumber": 0
                            },
                            "colorOne": "auto",
                            "colorTwo": "auto"
                        },
                        "axisLine": {
                            "onZero": false
                        }
                    },
                    "xAxisDown": {
                        "show": true,
                        "title": {
                            "showTitle": false,
                            "text": "",
                            "nameGap": 15,
                            "rotate": 0,
                            "label": {
                                "fontSize": 12,
                                "color": "#333",
                                "fontFamily": "sans-serif",
                                "fontGroup": [],
                                "cusFontSize": 12
                            },
                            "fzPosition": "end"
                        },
                        "name": "顯示X軸",
                        "inverse": false,
                        "tickLine": {
                            "show": true,
                            "width": 1,
                            "color": "auto"
                        },
                        "tick": {
                            "show": true,
                            "position": "outside",
                            "length": 5,
                            "width": 1,
                            "color": "auto"
                        },
                        "tickLabel": {
                            "show": true,
                            "label": {
                                "fontSize": 12,
                                "color": "#333",
                                "fontFamily": "sans-serif",
                                "fontGroup": [],
                                "cusFontSize": 12
                            },
                            "rotate": 0,
                            "prefix": "",
                            "suffix": "",
                            "optimize": 0,
                            "distance": 0,
                            "min": null,
                            "max": null,
                            "ratio": 1,
                            "digit": "auto"
                        },
                        "netLine": {
                            "show": false,
                            "width": 1,
                            "type": "solid",
                            "color": "auto",
                            "interval": {
                                "value": "auto",
                                "cusNumber": 0
                            }
                        },
                        "netArea": {
                            "show": false,
                            "interval": {
                                "value": "auto",
                                "cusNumber": 0
                            },
                            "colorOne": "auto",
                            "colorTwo": "auto"
                        },
                        "data": [
                            "BUS",
                            "UBER",
                            "TAXI",
                            "SUBWAY"
                        ],
                        "type": "category"
                    },
                    "yAxisLeft": {
                        "show": true,
                        "title": {
                            "showTitle": false,
                            "text": "",
                            "nameGap": 15,
                            "rotate": 0,
                            "label": {
                                "fontSize": 12,
                                "color": "#333",
                                "fontFamily": "sans-serif",
                                "fontGroup": [],
                                "cusFontSize": 12
                            },
                            "fzPosition": "end"
                        },
                        "name": "顯示Y軸",
                        "inverse": false,
                        "tickLine": {
                            "show": true,
                            "width": 1,
                            "color": "auto"
                        },
                        "tick": {
                            "show": true,
                            "position": "outside",
                            "length": 5,
                            "width": 1,
                            "color": "auto"
                        },
                        "tickLabel": {
                            "show": true,
                            "label": {
                                "fontSize": 12,
                                "color": "#333",
                                "fontFamily": "sans-serif",
                                "fontGroup": [],
                                "cusFontSize": 12
                            },
                            "rotate": 0,
                            "formatter": {
                                "prefix": "",
                                "suffix": "",
                                "ratio": 1,
                                "digit": "auto"
                            },
                            "split": 5,
                            "min": null,
                            "max": null,
                            "prefix": "",
                            "suffix": "",
                            "ratio": 1,
                            "digit": "auto",
                            "distance": 0
                        },
                        "netLine": {
                            "show": false,
                            "width": 1,
                            "type": "solid",
                            "color": "auto",
                            "interval": {
                                "value": "auto",
                                "cusNumber": 0
                            }
                        },
                        "netArea": {
                            "show": false,
                            "interval": {
                                "value": "auto",
                                "cusNumber": 0
                            },
                            "colorOne": "auto",
                            "colorTwo": "auto"
                        },
                        "type": "value"
                    },
                    "yAxisRight": {
                        "show": false,
                        "title": {
                            "showTitle": false,
                            "text": "",
                            "nameGap": 15,
                            "rotate": 0,
                            "label": {
                                "fontSize": 12,
                                "color": "#333",
                                "fontFamily": "sans-serif",
                                "fontGroup": [],
                                "cusFontSize": 12
                            },
                            "fzPosition": "end"
                        },
                        "name": "顯示Y軸",
                        "inverse": false,
                        "tickLine": {
                            "show": true,
                            "width": 1,
                            "color": "auto"
                        },
                        "tick": {
                            "show": true,
                            "position": "outside",
                            "length": 5,
                            "width": 1,
                            "color": "auto"
                        },
                        "tickLabel": {
                            "show": true,
                            "label": {
                                "fontSize": 12,
                                "color": "#333",
                                "fontFamily": "sans-serif",
                                "fontGroup": [],
                                "cusFontSize": 12
                            },
                            "rotate": 0,
                            "formatter": {
                                "prefix": "",
                                "suffix": "",
                                "ratio": 1,
                                "digit": "auto"
                            },
                            "split": 5,
                            "min": null,
                            "max": null,
                            "prefix": "",
                            "suffix": "",
                            "ratio": 1,
                            "digit": "auto",
                            "distance": 0
                        },
                        "netLine": {
                            "show": false,
                            "width": 1,
                            "type": "solid",
                            "color": "auto",
                            "interval": {
                                "value": "auto",
                                "cusNumber": 0
                            }
                        },
                        "netArea": {
                            "show": false,
                            "interval": {
                                "value": "auto",
                                "cusNumber": 0
                            },
                            "colorOne": "auto",
                            "colorTwo": "auto"
                        }
                    }
                }
            }
        },
        "isShow": true
    }
    ```
    :::

------------
### zoomRatio
- 類型：Number
- 默認值：1
- 作用： 此sheet頁的縮放比例，為0~1之間的二位小數數字。比如`0.1`、`0.56`

------------
### image
- 類型：Array
- 默認值：[]
- 作用： 插入表格中圖片信息，包含圖片地址、寬高、位置、裁剪等信息
- 示例：
    以下為一個`imageItem`案例，通常一個工作表中可能存在多個圖片，所以`image`的格式為數組`[imageItem,imageItem,...]`
    ```json
    {
        type: '3',  //1移動並調整單元格大小 2移動並且不調整單元格的大小 3不要移動單元格並調整其大小
        src: '',  //圖片url
        originWidth: 1484,  //圖片原始寬度
        originHeight: 834,  //圖片原始高度
        default: {
            width: 293,  //圖片 寬度
            height: 196,  //圖片 高度
            left: 409,  //圖片離表格左邊的 位置
            top: 248,  //圖片離表格頂部的 位置
        },
        crop: {
            width: 293,  //圖片裁剪後 寬度
            height: 196,  //圖片裁剪後 高度
            offsetLeft: 0,  //圖片裁剪後離未裁剪時 左邊的位移
            offsetTop: 0,  //圖片裁剪後離未裁剪時 頂部的位移
        },
        isFixedPos: false,  //固定位置
        fixedLeft: 507,  //固定位置 左位移
        fixedTop: 141,  //固定位置 右位移
        border: {
            width: 0,  //邊框寬度
            radius: 0,  //邊框半徑
            style: 'solid',  //邊框類型
            color: '#000',  //邊框顏色
        }
    }
    ```
------------
### showGridLines
- 類型：Number
- 默認值：1
- 作用：是否顯示網格線，`1`表示顯示，`0`表示隱藏

------------
### dataVerification
- 類型：Object
- 默認值：{}
- 作用：數據驗證的配置信息。以下列出了所有需要設置的詳細字段：
  + {String} [type]: 類型；值可為
    + `"dropdown"`(下拉列表)
    + `"checkbox"`(覆選框)
    + `"number"`(數字)
    + `"number_integer"`(數字-整數)
    + `"number_decimal"`(數字-小數)
    + `"text_content"`(文本-內容)
    + `"text_length"`(文本-長度)
    + `"date"`(日期)
    + `"validity"`(有效性)；
  + {String | Null} [type2]: 條件類型；
    + 類型`type`值為`"checkbox"`時，`type2`值可為        
        + `null`；
    + 類型`type`值為`"dropdown"`時，`type2`值可為
        + `true` （多選） `false` （單選）
    + 類型`type`值為`"number"/"number_integer"/"number_decimal"/"text_length"`時，`type2`值可為
      + `"bw"`(介於)
      + `"nb"`(不介於)
      + `"eq"`(等於)
      + `"ne"`(不等於)
      + `"gt"`(大於)
      + `"lt"`(小於)
      + `"gte"`(大於等於)
      + `"lte"`(小於等於)
    + 類型`type`值為`"text_content"`時，`type2`值可為
      + `"include"`(包括)
      + `"exclude"`(不包括)
      + `"equal"`(等於)
    + 類型`type`值為`"date"`時，`type2`值可為
      + `"bw"`(介於)
      + `"nb"`(不介於)
      + `"eq"`(等於)
      + `"ne"`(不等於)
      + `"bf"`(早於)
      + `"nbf"`(不早於)
      + `"af"`(晚於)
      + `"naf"`(不晚於)
    + 類型`type`值為`"validity"`時，`type2`值可為
      + `"card"`(身份證號碼)
      + `"phone"`(手機號)；
  + {String | Number} [value1]: 條件值1；
    + 類型`type`值為`"dropdown"`時，`value1`值可為選區或以英文逗號隔開的字符串，如`"1,2,3"`或者`"A1:B2"`；
    + 類型`type`值為`"validity"`時，`value1`值可為空；
    + 其他類型時`value1`值為數值或字符串；
  + {String | Number} [value2]: 條件值2；
    + 類型`type`值為`"checkbox"`或者條件類型`type2`值為`"bw"`、`"nb"`時有`value2`值，條件值為數值或日期時，條件值2要大於等於條件值1；其它情況可為空；
  + {Boolean} [remote]: 自動遠程獲取選項；默認為`false`；
  + {Boolean} [prohibitInput]: 輸入數據無效時禁止輸入；默認為`false`；
  + {Boolean} [hintShow]: 選中單元格時顯示提示語；默認為`false`；
  + {String} [hintText]: 提示語文本；`hintShow`為`true`時需配置；
  + {Boolean} [checked]: 是否勾選中覆選框；`type`為`checkbox`時需配置；

    一個完整的配置案例請參考源碼DEMO示例 [/src/demoData/sheetDataVerification.js](https://github.com/mengshukeji/Luckysheet/blob/master/src/demoData/sheetDataVerification.js)
------------
## 調試信息

初始化所需要的參數，會從簡潔的角度出發來考慮設計，但是本地存儲的參數則不同。

Luckysheet在初始化完成之後進行的一系列操作，會將更多本地參數存儲在luckysheetfile中，作為本地使用的參數，實現一些類似Store數據中心的作用。比如，freezen的參數格式也會變化。

此時的luckysheetfile包含很多非初始化使用的本地參數，可用於調試代碼、本地狀態分析。如下展示了更豐富luckysheetfile信息，可通過方法 `luckysheet.getluckysheetfile()`獲得：

::: details
```json
[
    {
        "name": "Cell", //工作表名稱
        "color": "", //工作表顏色
        "index": 0, //工作表索引
        "status": 1, //激活狀態
        "order": 0, //工作表的下標
        "hide": 0,//是否隱藏
        "row": 36, //行數
        "column": 18, //列數
        "celldata": [], //初始化使用的單元格數據
        "config": {
            "merge":{}, //合並單元格
            "rowlen":{}, //表格行高
            "columnlen":{}, //表格列寬
            "rowhidden":{}, //隱藏行
            "colhidden":{}, //隱藏列
            "borderInfo":{}, //邊框
            "authority":{}, //工作表保護
        },
        "scrollLeft": 0, //左右滾動條位置
        "scrollTop": 315, //上下滾動條位置
        "luckysheet_select_save": [], //選中的區域
        "calcChain": [],//公式鏈
        "isPivotTable":false,//是否數據透視表
        "pivotTable":{},//數據透視表設置
        "filter_select": {},//篩選範圍
        "filter": null,//篩選配置
        "luckysheet_alternateformat_save": [], //交替顏色
        "luckysheet_alternateformat_save_modelCustom": [], //自定義交替顏色	
        "luckysheet_conditionformat_save": {},//條件格式
        "frozen": {}, //凍結行列配置
        "freezen": {}, //凍結行列的渲染數據存儲
        "chart": [], //圖表配置
        "zoomRatio":1, // 縮放比例
        "image":[], //圖片
        "showGridLines": 1, //是否顯示網格線
        "dataVerification":{} //數據驗證配置
        

        "visibledatarow": [], //所有行的位置
        "visibledatacolumn": [], //所有列的位置
        "ch_width": 2322, //工作表區域的寬度
        "rh_height": 949, //工作表區域的高度
        "load": "1", //已加載過此sheet的標識
        "data": [], //更新和存儲使用的單元格數據
    },
    {
        "name": "Sheet2",
        "color": "",
        "index": 1,
        "status": 0,
        "order": 1,
        "celldata": [],
        "config": {}
    },
    {
        "name": "Sheet3",
        "color": "",
        "index": 2,
        "status": 0,
        "order": 2,
        "celldata": [],
        "config": {},
    }
]
```
:::

### visibledatarow
- 類型：Number
- 默認值：[]
- 作用： 所有行的位置信息，遞增的行位置數據，初始化無需設置

------------
### visibledatacolumn
- 類型：Number
- 默認值：[]
- 作用： 所有列的位置信息，遞增的列位置數據，初始化無需設置

------------
### ch_width
- 類型：Number
- 默認值：2322
- 作用： 整個工作表區域的寬度(包含邊界的灰色區域)，初始化無需設置

------------
### rh_height
- 類型：Number
- 默認值：2322
- 作用： 整個工作表區域的高度(包含邊界的灰色區域)，初始化無需設置

------------
### load
- 類型：Number
- 默認值：0
- 作用： 當前sheet是否加載過，內部標識，初始化無需設置

------------
### data
- 類型：Array
- 默認值：[]
- 作用： 初始化時從celldata轉換而來，後續操作表格的數據更新，會更新到這個data字段中，初始化無需設置
- 示例：
    以下是一個二行二列的數據
    ```json
    [
        [{
            ct: {fa: "General", t: "g"},
            m:"value1",
            v:"value1"
        }, {
            ct: {fa: "General", t: "g"},
            m:"value2",
            v:"value2"
        }],
        [{
            ct: {fa: "General", t: "g"},
            m:"value3",
            v:"value3"
        }, {
            ct: {fa: "General", t: "g"},
            m:"value4",
            v:"value4"
        }]
    ]

    ```

------------
