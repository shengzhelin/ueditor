# 表格操作

每一次操作都會保存歷史記錄，用於撤銷和重做，如果在表格初始化的時候開啟了[共享編輯](/zh/guide/config.html#updateurl)功能，則會通過websocket將操作實時更新到後台。

> 源碼 [`src/controllers/server.js`](https://github.com/mengshukeji/Luckysheet/blob/master/src/controllers/server.js) 模塊實現了後台保存功能

通常，共享編輯（或者叫協同編輯）是需要和賬戶系統配合來控制權限的，開發者可以根據已有功能，配合自己的賬戶管理功能自行實現權限控制。

以下為所有的支持傳輸到後台的操作類型，並且以MongoDB做存儲示例，講解如何做前後端交互。

注意一點，對象中的i為當前sheet的index值，而不是order。

## 單元格刷新

### 單個單元格刷新

- **格式**：

    ```json
    {
        "t": "v",
        "i": "Sheet_0554kKiKl4M7_1597974810804",
        "v": {
            "v": 233,
            "ct": { "fa": "General", "t": "n" },
            "m": "233"
        },
        "r": 0,
        "c": 1
    }
    ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |v|單元格的值，數字、字符串或著對象格式，對象參考 [單元格屬性表](/zh/guide/cell.html#基本單元格)|
    |r|單元格的行號|
    |c|單元格的列號|

- **後台更新**：

    前端維護luckysheetfile[i].data，而單元格更新到後台，繼續維護`luckysheetfile[i].celldata` 參數，celldata是一個一維數組：
    ```json
    [
        {r:0, c:1, v: "值1"},
        {r:10, c:11, v:"值2"},
        {r:10, c:11, v:{f:"=sum", v:"100"}}
    ]
    ```
    後台在保存前台推送的數據時，會更新 `luckysheetfile[i].celldata` 字段，如果存在該單元格則更新，如果沒有則添加，如果存在該單元格但是`v`為null則刪除該單元格。
  

### 範圍單元格刷新

- **格式**：

    ```json
    {
        "t": "rv",
        "i": "Sheet_ahKdzaNC65iL_1598343160744",
        "v": [
            [
                { "v": 3, "ct": { "fa": "General", "t": "n" }, "m": "3" }
            ],
            [
                { "v": 4, "ct": { "fa": "General", "t": "n" }, "m": "4" }
            ]
        ],
        "range": {
            "row": [ 1, 2 ],
            "column": [ 1, 1 ]
        }
    }
    ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的索引值|
    |v|範圍二維數組，單元格對象參考 [單元格屬性表](/zh/guide/cell.html#基本單元格)|
    |range|範圍行列數|

- **後台更新**：

    前端維護luckysheetfile[i].data，而單元格更新到後台，繼續維護`luckysheetfile[i].celldata` 參數，需要將指定位置`range`的所有單元格數據替換為新的數據
  
## config操作

- **格式**：

  ```json
    {
        "t": "cg",
        "i": "Sheet_0554kKiKl4M7_1597974810804",
        "v": [ {
                "rangeType": "range",
                "borderType": "border-all",
                "color": "#000",
                "style": "1",
                "range": [ {"row": [ 0, 1 ], "column": [ 1, 1 ] } ]
            } ],
        "k": "borderInfo"
    }
  ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |v|需要更新value值|
    |k|操作的key值，可選 邊框：`'borderInfo'` / ：行隱藏：`'rowhidden'` / 列隱藏：`'colhidden'` / 行高：`'rowlen'` / 列寬：`'columnlen'` |

- **後台更新**：

    更新 `luckysheetfile[i].config[k] = v` ，如果`config`中不存在`k`，則新建一個`k`屬性並設置為空。

    注意一點，修改config中的某個配置時，會把這個配置全部傳輸到後台，比如修改borderInfo，本來已經有一個含邊框的單元格了，再新設置一個單元格邊框，這時候會把這兩個單元格邊框信息都傳輸到後台，而不做更細顆粒的操作。

    1. 行隱藏：
       - 發送到後台：
            ```json
            {
                "t": "cg",
                "i": "Sheet_0554kKiKl4M7_1597974810804",
                "v": { "5": 0, "6": 0, "13": 0, "14": 0 }, // 包含所有隱藏行信息
                "k": "rowhidden"
            }
            ```
       - 後台更新：`luckysheetfile["Sheet_0554kKiKl4M7_1597974810804"].config["rowhidden"] = { "5": 0, "6": 0, "13": 0, "14": 0 }`
    
    2. 修改行高：
       - 發送到後台：
            ```json
           {
                "t": "cg",
                "i": "Sheet_0554kKiKl4M7_1597974810804",
                "v": { "9": 20, "11": 71, "15": 58 }, // 包含所有修改過高度的單元格信息
                "k": "rowlen"
            }
            ```
       - 後台更新：`luckysheetfile["Sheet_0554kKiKl4M7_1597974810804"].config["rowlen"] = { "9": 20, "11": 71, "15": 58 }`
    
    3. 修改列寬：
       - 發送到後台：
            ```json
           {
                "t": "cg",
                "i": "Sheet_0554kKiKl4M7_1597974810804",
                "v": { "2": 135 },
                "k": "columnlen"
            }
            ```
       - 後台更新：`luckysheetfile["Sheet_0554kKiKl4M7_1597974810804"].config["columnlen"] = { "2": 135 }`
 
## 通用保存

- **格式**：

  ```json
    {
        "t": "all",
        "i": 0,
        "v": {
            "type": "rangeRow",
            "range": { "row_focus": 1, "column_focus": 1 }
        },
        "k": "frozen"
    }
  ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |v|需要更新value值|
    |k|操作的key值|

- **後台更新**：

    更新 `luckysheetfile[i][k] = v` ，如果`luckysheetfile[i]`中不存在`k`，則新建一個`k`屬性並設置為空。

    1. 凍結行列：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": 0,
                "v": {
                    "type": "rangeRow",
                    "range": { "row_focus": 1, "column_focus": 1 }
                },
                "k": "frozen"
            }
            ```
       - 後台更新：
            ```js
            luckysheetfile[0]["frozen"] = {
                    "type": "rangeRow",
                    "range": { "row_focus": 1, "column_focus": 1 }
                }
            ```

    2. 修改工作表名稱：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": 0,
                "v": "Cell22",
                "k": "name"
            }
            ```
       - 後台更新：`luckysheetfile[0]["name"] = "Cell22"`
    
    3. 修改工作表顏色：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": 0,
                "v": "#f02323",
                "k": "color"
            }
            ```
       - 後台更新：`luckysheetfile[0]["color"] = "#f02323"`
    
    4. 合並單元格：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": "Sheet_aheLt0Waf1lk_1598248231626",
                "v": {
                    "merge": {
                        "0_0": { "r": 0,  "c": 0, "rs": 2, "cs": 1 }
                    },
                    "rowlen": {}
                },
                "k": "config"
            }
            ```
       - 後台更新：
            ```js
            luckysheetfile["Sheet_aheLt0Waf1lk_1598248231626"]["config"] =  {
                "merge": {
                    "0_0": { "r": 0,  "c": 0, "rs": 2, "cs": 1 }
                },
                "rowlen": {}
            }
            ```
                
            注意，合並單元格的更新比較特殊，要求把整個config傳輸到後台，因為合並單元格可能會影響到其他參數。
    
    5. 篩選範圍：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": 0,
                "v": {
                    "row": [ 16, 21 ],
                    "column": [ 2, 3 ]
                },
                "k": "filter_select"
            }
            ```
       - 後台更新：
            ```js
            luckysheetfile[0]["filter_select"] =  {
                    "row": [ 16, 21 ],
                    "column": [ 2, 3 ]
                }
            ```
    
    6. 篩選的具體設置：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": "0",
                "v": {
                    "0": {
                        "caljs": {
                            "value": "textinclude",
                            "text": "Text contains",
                            "type": "1",
                            "value1": "Lucky"
                        },
                        "rowhidden": {
                            "18": 0
                        },
                        "optionstate": true,
                        "str": 17,
                        "edr": 19,
                        "cindex": 2,
                        "stc": 2,
                        "edc": 3
                    }
                },
                "k": "filter"
            }
            ```
       - 後台更新：
            ```js
            luckysheetfile[0]["filter"] = {
                    "0": {
                        "caljs": {
                            "value": "textinclude",
                            "text": "Text contains",
                            "type": "1",
                            "value1": "Lucky"
                        },
                        "rowhidden": {
                            "18": 0
                        },
                        "optionstate": true,
                        "str": 17,
                        "edr": 19,
                        "cindex": 2,
                        "stc": 2,
                        "edc": 3
                    }
                }
            ```
    
    7. 交替顏色：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": "Sheet_4N45tpMd0ni4_1598250591760",
                "v": [
                    {
                        "cellrange": {
                            "row": [ 2, 6 ],
                            "column": [ 1, 4 ]
                        },
                        "format": {
                            "head": {
                                "fc": "#000",
                                "bc": "#f6cb4b"
                            },
                            "one": {
                                "fc": "#000",
                                "bc": "#ffffff"
                            },
                            "two": {
                                "fc": "#000",
                                "bc": "#fff9e7"
                            },
                            "foot": {
                                "fc": "#000",
                                "bc": "#ffebac"
                            }
                        },
                        "hasRowHeader": true,
                        "hasRowFooter": true
                    }
                ],
                "k": "luckysheet_alternateformat_save"
            }
            ```
       - 後台更新：
            ```js
            luckysheetfile["Sheet_4N45tpMd0ni4_1598250591760"]["luckysheet_alternateformat_save"] =   [
                    {
                        "cellrange": {
                            "row": [ 2, 6 ],
                            "column": [ 1, 4 ]
                        },
                        "format": {
                            "head": {
                                "fc": "#000",
                                "bc": "#f6cb4b"
                            },
                            "one": {
                                "fc": "#000",
                                "bc": "#ffffff"
                            },
                            "two": {
                                "fc": "#000",
                                "bc": "#fff9e7"
                            },
                            "foot": {
                                "fc": "#000",
                                "bc": "#ffebac"
                            }
                        },
                        "hasRowHeader": true,
                        "hasRowFooter": true
                    }
                ]
            ```
    
    8. 條件格式：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": "Sheet_545W7w03kLkC_1598251927583",
                "v": [
                    {
                        "type": "default",
                        "cellrange": [
                            {
                                "row": [ 2, 6 ],
                                "column": [ 1, 3 ]
                            }
                        ],
                        "format": {
                            "textColor": "#9c0006",
                            "cellColor": "#ffc7ce"
                        },
                        "conditionName": "greaterThan",
                        "conditionRange": [],
                        "conditionValue": [ "3" ]
                    }
                ],
                "k": "luckysheet_conditionformat_save"
            }
            ```
       - 後台更新：
            ```js
            luckysheetfile["Sheet_545W7w03kLkC_1598251927583"]["luckysheet_conditionformat_save"] =   [
                    {
                        "type": "default",
                        "cellrange": [
                            {
                                "row": [ 2, 6 ],
                                "column": [ 1, 3 ]
                            }
                        ],
                        "format": {
                            "textColor": "#9c0006",
                            "cellColor": "#ffc7ce"
                        },
                        "conditionName": "greaterThan",
                        "conditionRange": [],
                        "conditionValue": [ "3" ]
                    }
                ]
            ```
    
    9. 數據透視表：
       - 發送到後台：
            ```json
            {
                "t": "all",
                "i": "Sheet_r3Cz5bbxipL3_1598252547290",
                "v": {
                    "pivot_select_save": {
                        "row": [ 0, 2 ],
                        "column": [ 0, 2 ]
                    },
                    "pivotDataSheetIndex": "Sheet_31ikLMip330K_1598252536645",
                    "column": [],
                    "row": [],
                    "filter": [],
                    "values": [],
                    "showType": "column"
                },
                "k": "pivotTable"
            }
            ```
       - 後台更新：
            ```js
            luckysheetfile["Sheet_r3Cz5bbxipL3_1598252547290"]["pivotTable"] =  {
                    "pivot_select_save": {
                        "row": [ 0, 2 ],
                        "column": [ 0, 2 ]
                    },
                    "pivotDataSheetIndex": "Sheet_31ikLMip330K_1598252536645",
                    "column": [],
                    "row": [],
                    "filter": [],
                    "values": [],
                    "showType": "column"
                }
            ```

            注意，雖然數據透視表的格式是這個，但是當你選擇一個範圍之後，點擊生產數據透視表時，Luckysheet會先執行新建sheet頁和切換到該sheet頁的操作，才能在新建的sheet頁加上數據透視表。
    
    10. 動態數組：
        - 發送到後台：
            ```json
            {
                "t": "all",
                "i": "Sheet_r3Cz5bbxipL3_1598252547290",
                "v": [
                    {
                        "r": 4,
                        "c": 5,
                        "f": "=UNIQUE(B2:E9)",
                        "data": [
                            [ 1, 2, 3, 4 ],
                            [ 2, 3, 4, 5 ],
                            [ 3, 4, 5, 6 ],
                            [ 4, 5, 6, 7 ],
                            [ 5, 6, 7, 8 ],
                            [ 6, 7, 8, 9 ],
                            [ 7, 8, 9, 10 ],
                            [ 8, 9, 10, 11 ]
                        ]
                    }
                ],
                "k": "dynamicArray"
            }
            ```
        - 後台更新：
            ```js
            luckysheetfile["Sheet_r3Cz5bbxipL3_1598252547290"]["dynamicArray"] =   [
                    {
                        "r": 4,
                        "c": 5,
                        "f": "=UNIQUE(B2:E9)",
                        "data": [
                            [ 1, 2, 3, 4 ],
                            [ 2, 3, 4, 5 ],
                            [ 3, 4, 5, 6 ],
                            [ 4, 5, 6, 7 ],
                            [ 5, 6, 7, 8 ],
                            [ 6, 7, 8, 9 ],
                            [ 7, 8, 9, 10 ],
                            [ 8, 9, 10, 11 ]
                        ]
                    }
                ]
            ```

## 函數鏈操作

- **格式**：

  ```json

  {
    "t": "fc",
    "i": "0",
    "v": "{\"r\":1,\"c\":1,\"index\":\"0\",\"func\":[true,3,\"=sum(A1:B1)\"]}",
    "op": "add",
    "pos": 1
  }

  ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |v|對象值，這里對象的內部字段不需要單獨更新，所以存為文本即可|
    |op|操作類型,`add`為新增，`update`為更新，`del`為刪除|
    |pos|更新或者刪除的函數位置|

- **後台更新**：

    calcChain為一個數組
    - 如果`op`的值為`add`則添加到末尾 `luckysheetfile[0].calcChain.push(v)`， 
    - 如果`op`的值為`update`，格式為：
        ```json
        {
            "t": "fc",
            "i": "0",
            "v": "{\"r\":0,\"c\":3,\"index\":\"0\",\"func\":[true,1,\"=Formula!A1+Formula!B1+1\"],\"color\":\"w\",\"parent\":null,\"chidren\":{},\"times\":0}",
            "op": "update",
            "pos": 0
        }
        ```
        更新 `luckysheetfile[0].calcChain[pos] = v`，
    - 如果`op`的值為`del`則刪除，格式為：
        ```json
        {
            "t": "fc",
            "i": 0,
            "v": null,
            "op": "del",
            "pos": 0
        }
        ```
        `luckysheetfile[0].calcChain.splice(pos, 1)`。

## 行列操作

### 刪除行或列

- **格式**：

  ```json
  {
    "t": "drc",
    "i": 3,
    "v": {
        "index": 6,
        "len": 2
    },
    "rc": "r"
  }
  ```

- **說明**：

    <table>
        <tr>
            <td colspan="2">參數</td> 
            <td>說明</td> 
        </tr>
        <tr>
            <td colspan="2">t</td> 
            <td>操作類型表示符號</td> 
        </tr>
        <tr>
            <td colspan="2">i</td> 
            <td>當前sheet的index值</td> 
        </tr>
        <tr>
            <td colspan="2">rc</td> 
            <td>行操作還是列操作，值`r`代表行，`c`代表列</td> 
        </tr>
        <tr>
            <td rowspan="2">v</td> 
            <td>index</td> 
            <td>從第幾行或者列開始刪除</td> 
        </tr>
        <tr>
            <td>len</td> 
            <td>刪除多少行或者列</td> 
        </tr>
        
    </table>

- **後台更新**：
  
    如果`rc`的值是`'r'`刪除行， 如果`rc`的值為`'c'`則刪除列， 例如`rc='r'`，`index=4`，`len=5`，則代表從第4行開始刪除之後的5行（4、5、6、7、8）。

    主要是對 `luckysheetfile[i].celldata` 中的單元格進行操作，刪除參數中所描述符合條件的單元格並且更新其他單元格的行列值，以上述為例，首先查找單元格中`r`值在4到8的所有單元格並刪除，然後把本來行號9以後的單元格的`r`值減去5，最後把 `luckysheetfile[i].row` 減去5。
    如果`v`值為 `"#__qkdelete#"`（不含引號），則此處為需要刪除的單元格。

### 增加行或列

- **格式**：

  ```json
  {
    "t": "arc",
    "i": "0",
    "v": {
        "index": 1,
        "len": 1,
        "direction": "lefttop",
        "data": []
    },
    "rc": "r"
  }
  ```

- **說明**：

    <table>
        <tr>
            <td colspan="2">參數</td> 
            <td>說明</td> 
        </tr>
        <tr>
            <td colspan="2">t</td> 
            <td>操作類型表示符號</td> 
        </tr>
        <tr>
            <td colspan="2">i</td> 
            <td>當前sheet的index值</td> 
        </tr>
        <tr>
            <td colspan="2">rc</td> 
            <td>行操作還是列操作，值`r`代表行，`c`代表列</td> 
        </tr>
        <tr>
            <td rowspan="4">v</td> 
            <td>index</td> 
            <td>從第幾行或者列開始新增</td> 
        </tr>
        <tr>
            <td>len</td> 
            <td>增加多少行或者列</td> 
        </tr>
        <tr>
            <td>direction</td> 
            <td>方向</td> 
        </tr>
        <tr>
            <td>data</td> 
            <td>新增行或者列的內容</td> 
        </tr>
        
    </table>

- **後台更新**：
  
    如果`rc`的值是`r`新增行， 如果`rc`的值為`c`則新增列， 例如`rc=r，index=4，len=5`，則代表從第4行開始增加5行，如果`data`為空則增加空行，如果`data`不為空則用`data`中的數組添加新增的行中。

    主要是對 `luckysheetfile[i].celldata` 中的單元格進行操作，以上述為例，首先 `luckysheetfile[i].row` 加5，然後把`r`大於4的單元格的整體的`r`值+5，如果`data`為空則增加空行則結束，如果`data`不為空則把二維數組`data`轉換為 `{r:0,c:0,v:100}` 的格式並添加到`celldata`中，轉換的偽代碼如下：

    ```javascript
    var ret = [];
    for(var r=0;r<data.length;r++){
        for(var c=0;c<data[0].length;c++){
            if(d[r][c]==null){
                continue;
            }
            ret.push({r:r+5, c:c, v: data[r][c]});
        }
    }
    return ret;
    ```

## 篩選操作

### 清除篩選

- **格式**：

  ```json
  {
    "t": "fsc",
    "i": 0,
    "v": null
  }
  ```

- **後台更新**：
  
    清除 `luckysheetfile[0].filter = null` ， `luckysheetfile[i].filter_select = null`。

### 恢覆篩選

- **格式**：

  ```json
  {
    "t": "fsr",
    "i": 0,
    "v": {
        "filter": [],
        "filter_select": {}
    }
  }
  ```

- **後台更新**：
  
    清除 `luckysheetfile[i]. filter = v.filter`， `luckysheetfile[i]. filter_select = v. filter_select`。

## sheet操作

### 新建sheet

- **格式**：

  ```json
  {
    "t": "sha",
    "i": null,
    "v": {
        "name": "Sheet11",
        "color": "",
        "status": "0",
        "order": 10,
        "index": "Sheet_oWlM5pKnwL1s_1598331858653",
        "celldata": [],
        "row": 84,
        "column": 60,
        "config": {},
        "pivotTable": null,
        "isPivotTable": false
    }
  }
  ```

- **說明**：

    <table>
        <tr>
            <td colspan="2">參數</td> 
            <td>說明</td> 
        </tr>
        <tr>
            <td colspan="2">t</td> 
            <td>操作類型表示符號</td> 
        </tr>
        <tr>
            <td colspan="2">i</td> 
            <td>當前sheet的index值</td> 
        </tr>
        <tr>
            <td rowspan="11">v</td> 
            <td>name</td> 
            <td>隱藏後跳轉的sheet的index值</td> 
        </tr>
        <tr>
            <td>color</td> 
            <td>Sheet顏色</td> 
        </tr>
        <tr>
            <td>status</td> 
            <td>激活狀態</td> 
        </tr>
        <tr>
            <td>order</td> 
            <td>Sheet擺放順序</td> 
        </tr>
        <tr>
            <td>index</td> 
            <td>Index索引</td> 
        </tr>
        <tr>
            <td>celldata</td> 
            <td>單元格數據集</td> 
        </tr>
        <tr>
            <td>row</td> 
            <td>行數</td> 
        </tr>
        <tr>
            <td>column</td> 
            <td>列數</td> 
        </tr>
        <tr>
            <td>config</td> 
            <td>設置</td> 
        </tr>
        <tr>
            <td>pivotTable</td> 
            <td>數據透視表設置</td> 
        </tr>
        <tr>
            <td>isPivotTable</td> 
            <td>是否數據透視表</td> 
        </tr>
        
    </table>

- **後台更新**：
  
    添加一行（一個文檔）到數據庫中。
    `luckysheetfile.push(json)`


### 覆制sheet

- **格式**：

  ```json
  {
    "t": "shc",
    "i": "Sheet_e5pKTeloilhe_1598332166630",
    "v": {
        "copyindex": 0,
        "name": "Cell(Copy)"
    }
  }
  ```

- **後台更新**：
  
    覆制表格中的sheet索引值為`copyindex`並添加到數據庫中，添加的設置該新文檔的`index`為`i`對應的值。

### 刪除sheet

- **格式**：

  ```json
  {
    "t": "shd",
    "i": null,
    "v": {
        "deleIndex": 0
    }
  }
  ```

- **說明**：

    <table>
        <tr>
            <td colspan="2">參數</td> 
            <td>說明</td> 
        </tr>
        <tr>
            <td colspan="2">t</td> 
            <td>操作類型表示符號</td> 
        </tr>
        <tr>
            <td rowspan="2">v</td> 
            <td>deleIndex</td> 
            <td>需要刪除的sheet索引</td> 
        </tr>
                
    </table>

- **後台更新**：
  
    刪除索引為`deleIndex`對應值的sheet。

### 刪除sheet後恢覆操作

- **格式**：

  ```json
  {
    "t": "shre",
    "i": null,
    "v": {
        "reIndex": "0"
    }
  }
  ```

- **說明**：

    <table>
        <tr>
            <td colspan="2">參數</td> 
            <td>說明</td> 
        </tr>
        <tr>
            <td colspan="2">t</td> 
            <td>操作類型表示符號</td> 
        </tr>
        <tr>
            <td rowspan="2">v</td> 
            <td>deleIndex</td> 
            <td>需要恢覆的sheet索引</td> 
        </tr>
                
    </table>

- **後台更新**：
  
    恢覆索引為`reIndex`對應值的sheet。

### 調整sheet位置

- **格式**：

  ```json
  {
    "t": "shr",
    "i": null,
    "v": {
        "0": 1,
        "1": 0,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "Sheet_6az6nei65t1i_1596209937084": 8
    }
  }
  ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |v|設置Sheet的排序，為一個鍵值對，`key`代表sheet的`index`，`value`代表`order`值。格式為：`{"1": 3, "2":1, "0": 2, "3":0}`|

- **後台更新**：
  
    對sheet的`index`等於`key`的頁，設置其`order`屬性為`value`值。示例：

    `luckysheetfile[key1].order = value1`
    `luckysheetfile[key2].order = value2`
    `luckysheetfile[key3].order = value3`

### 切換到指定sheet

- **格式**：

  ```json
  {
    "t": "shs",
    "i": null,
    "v": 1
  }
  ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |v|要切換到的sheet頁索引|

- **後台更新**：
  
    對sheet的`index`等於`v`的頁，設置其`status`屬性為`1`值。示例：

    `luckysheetfile[v].status = 1`

## sheet屬性(隱藏或顯示)

- **格式**：

  ```json
  {
    "t": "sh",
    "i": 0,
    "v": 1,
    "op": "hide",
    "cur": 1
  }
  
  ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |op|操作選項，有hide、show|
    |v|如果`hide`為`1`則隱藏，為`0`或者空則為顯示|
    |cur|隱藏後設置索引對應`cur`的sheet為激活狀態|

- **後台更新**：
  
    更新`i`對應sheet的根路徑`hide`字段為`v`
    
    當隱藏時`status`值為`0`，更新`index`對應`cur`的sheet的`status`狀態為`1`
    
    `luckysheetfile[0].hide = 1`
    `luckysheetfile[0].status = 0`
    `luckysheetfile[1].status = 1`

    顯示某個sheet頁時，json為
    ```json
    {
        "t": "sh",
        "i": 6,
        "v": 0,
        "op": "show"
    }
    ```
    `status`值為`1`，上一個激活sheet的`status`狀態為`0`
    
    `luckysheetfile[6].hide = 0`
    `luckysheetfile[6].status = 1`
    `luckysheetfile[old_cur].status = 0`

## 表格信息更改

### 修改工作簿名稱

- **格式**：

    ```json
    {
        "t": "na",
        "i": null,
        "v": "Luckysheet Demo1"
    }
    ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |v|工作簿名稱|

- **後台更新**：
  
    Luckysheet配置，修改title為`"Luckysheet Demo1"`

## 圖表(TODO)

圖表操作類型有4種，分別為新增圖表"add"、移動圖表位置"xy"、縮放圖表"wh"、修改圖表配置"update"

### 新增圖表

- **格式**：

    ```json
    {
        "t": "c",
        "i": 0,
        "op":"add",
        "v": {
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
                        "show": true,
                        "text": "默認標題"
                    }
                }
            },
            "isShow": true
        }
    }
    ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |op|操作選項|
    |v|圖表的配置信息|

- **後台更新**：
  
    更新對應sheet頁中的圖表設置，如果`luckysheetfile[i].chart`為null，則初始化為空數組 `[]`

    ```json
    luckysheetfile[0].chart.push(v)
    ```

### 移動圖表位置

- **格式**：

    ```json
    {
        "t": "c",
        "i": 0,
        "op":"xy",
        "v": {
            "chart_id": "chart_p145W6i73otw_1596209943446",
            "left": 20,
            "top": 120
        }
    }
    ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |op|操作選項|
    |v|圖表的配置信息|

- **後台更新**：
  
    更新對應sheet頁中的圖表設置

    ```js
    luckysheetfile[0].chart[v.chart_id].left = v.left;
    luckysheetfile[0].chart[v.chart_id].top = v.top;
    ```

### 縮放圖表

- **格式**：

    ```json
    {
        "t": "c",
        "i": 0,
        "op":"wh",
        "v": {
            "chart_id": "chart_p145W6i73otw_1596209943446",
            "width": 400,
            "height": 250,
            "left": 20,
            "top": 120
        }
    }
    ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |op|操作選項|
    |v|圖表的配置信息|

- **後台更新**：
  
    更新對應sheet頁中的圖表設置

    ```js
    luckysheetfile[0].chart[v.chart_id].left = v.left;
    luckysheetfile[0].chart[v.chart_id].top = v.top;
    luckysheetfile[0].chart[v.chart_id].width = v.width;
    luckysheetfile[0].chart[v.chart_id].height = v.height;
    ```

### 修改圖表配置

- **格式**：

    ```json
    {
        "t": "c",
        "i": 0,
        "op":"update",
        "v": {
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
                        "show": true,
                        "text": "默認標題"
                    }
                }
            },
            "isShow": true
        }
    }
    ```

- **說明**：

    |參數|說明|
    | ------------ | ------------ |
    |t|操作類型表示符號|
    |i|當前sheet的index值|
    |op|操作選項|
    |v|圖表的配置信息|

- **後台更新**：
  
    更新對應sheet頁中的圖表設置

    ```js
    luckysheetfile[0].chart[v.chart_id] = v;
    ```

## 後端返回格式

websocket 後端返回的數據格式
```js
{
    createTime: 命令發送時間
    data:{} 修改的命令
    id: "7a"   websocket的id
    returnMessage: "success"
    status: "0"  0告訴前端需要根據data的命令修改  1無意義
    type: 0：連接成功，1：發送給當前連接的用戶，2：發送信息給其他用戶，3：發送選區位置信息，999：用戶連接斷開
    username: 用戶名
}
```