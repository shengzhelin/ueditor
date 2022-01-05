# API

Luckysheet針對常用的數據操作需求，開放了主要功能的API，開發者可以根據需要進行任意對接開發。

使用注意：
1. script全局引入時，所有API均掛載到window.luckysheet對象下面，可以在瀏覽器控制台打印看到；npm引入時，API也全部掛載在luckysheet對象下
2. `success`回調函數第一個參數為API方法的返回值
3. 需要新的API請到github [Issues](https://github.com/mengshukeji/Luckysheet/issues/new/choose)中提交，根據點讚數決定是否開放新API
4. API方法中所需的`order`參數為工作表對象中的`order`的值，而不是`index`

## 單元格操作

### getCellValue(row, column [,setting])<div id='getCellValue'></div>
 

- **參數**：

	- {Number} [row]: 單元格所在行數；從0開始的整數，0表示第一行
	- {Number} [column]: 單元格所在列數；從0開始的整數，0表示第一列
	- {PlainObject} [setting]: 可選參數
		+ {String} [type]: 單元格的值類型，可以設置為原始值`v`或者顯示值`m`；默認值為`v`,表示獲取單元格的實際值
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：
	
	獲取單元格的值。

	特殊情況，單元格格式為`yyyy-MM-dd`，`type`為`'v'`時會強制取`'m'`顯示值

- **示例**:

	- 返回當前工作表第1行第1列單元格的數據的v值
		
		`luckysheet.getCellValue(0, 0)`

	- 返回指定data數據的第2行第2列單元格的顯示值。
		
		`luckysheet.getCellValue(1, 1, {type:"m"})`

------------

### setCellValue(row, column, value [,setting])
 

- **參數**：

	- {Number} [row]: 單元格所在行數；從0開始的整數，0表示第一行
	- {Number} [column]: 單元格所在列數；從0開始的整數，0表示第一列
	- {Object | String | Number} [value]: 要設置的值；可以為字符串或數字，或為符合Luckysheet單元格格式的對象，參考 [單元格屬性表](/zh/guide/cell.html)
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Boolean} [isRefresh]: 是否刷新界面；默認為`true`；用於多個單元格賦值時候控制節流，前面單元格賦值的時候應設置為	`false`，最後一個單元格賦值時設置為`true`。
		+ {Function} [success]: 操作結束的回調函數

- **說明**：

	設置某個單元格的值，也可以設置整個單元格對象，用於同時設置多個單元格屬性。
	
	如果需要更新公式，也可以在這里賦值，Luckysheet在內部會主動把這個公式做計算並加入到公式鏈中，最後重刷界面。

- **示例**:

	- 設置當前工作表"A1"單元格的值為"1"
    	`luckysheet.setCellValue(0, 0, 1);`
	
	- 設置當前工作表"B1"單元格的值為公式"=sum(A1)"
    	`luckysheet.setCellValue(0, 1, "=sum(A1)");`
	
	- 設置當前工作表"C1"單元格的值為公式"=sum(A1:B1"，並帶有紅色背景，單元格對象可以不帶`v`和`m`值，Luckysheet會根據公式信息自動計算結果，如果帶了未更新或者是非公式結果的`v`和`m`值，Luckysheet也仍然會根據公式實際關聯的數據計算出準備的結果。
    	`luckysheet.setCellValue(0, 2, {f: "=sum(A1:B1)", bg:"#FF0000"})`

		再次設置"C1"單元格新的公式仍然可以生效
		
		`luckysheet.setCellValue(0, 2, {f: "=sum(A1)", bg:"#00FF00"})`

------------

### clearCell(row, column [,setting])
 

- **參數**：

	- {Number} [row]: 單元格所在行數；從0開始的整數，0表示第一行
	- {Number} [column]: 單元格所在列數；從0開始的整數，0表示第一列
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	清除指定工作表指定單元格的內容，返回清除掉的數據，不同於刪除單元格的功能，不需要設定單元格移動情況

- **示例**:

    - 清空單元格`B2`內容
      `luckysheet.clearCell(1,1)`
    
------------

### deleteCell(move, row, column [,setting])
 

- **參數**：
	- {String} [move]: 刪除後，右側還是下方的單元格移動
	
		`move`可能的值有：
		
		+ `"left"`: 右側單元格左移
		+ `"up"`: 下方單元格上移
	
	- {Number} [row]: 單元格所在行數；從0開始的整數，0表示第一行
	- {Number} [column]: 單元格所在列數；從0開始的整數，0表示第一列
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	刪除指定工作表指定單元格，返回刪除掉的數據，同時，指定是右側單元格左移還是下方單元格上移

- **示例**:

    - 刪除當前單元格並且在刪除後，右側單元格左移
      `luckysheet.deleteCell('left')`
    
------------

### setCellFormat(row, column, attr, value [,setting])
 

- **參數**：
	
	- {Number} [row]: 單元格所在行數；從0開始的整數，0表示第一行
	- {Number} [column]: 單元格所在列數；從0開始的整數，0表示第一列
    - {String} [attr]: 屬性類型，參考 [單元格屬性表](/zh/guide/cell.html)的屬性值
	- {String | Number | Object} [value]: 具體的設置值，一個屬性會對應多個值，參考 [單元格屬性表](/zh/guide/cell.html)的值示例，如果屬性類型`attr`是單元格格式`ct`，則設置值`value`應提供ct對象，如：`{fa:"General", t:"g"}`，比如設置A1單元格的格式為百分比格式：
	  
  	  `luckysheet.setCellFormat(0, 0, "ct", {fa:"0.00%", t:"n"})`

	- {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	設置某個單元格的屬性，如果要設置單元格的值或者同時設置多個單元格屬性，推薦使用`setCellValue`
	
	特殊的設置
    
  	邊框設置時，attr為`"bd"`，value為一個key/value對象，需要同時設置邊框類型:`borderType`/邊框粗細:`style`/邊框顏色:`color`，比如設置A1單元格的邊框為所有/紅色/細：
	  
	`luckysheet.setCellFormat(0, 0, "bd", {borderType: "border-right",style: "1", color: "#ff0000"})`
	
	完整可選的設置參數如下：

	+ 邊框類型 `borderType："border-left" | "border-right" | "border-top" | "border-bottom" | "border-all" | "border-outside" | "border-inside" | "border-horizontal" | "border-vertical" | "border-none"`，
	+ 邊框粗細 `style:  1 Thin | 2 Hair | 3 Dotted | 4 Dashed | 5 DashDot | 6 DashDotDot | 7 Double | 8 Medium | 9 MediumDashed | 10 MediumDashDot | 11 MediumDashDotDot | 12 SlantedDashDot | 13 Thick`
	+ 邊框顏色 `color: 16進制顏色值`

- **示例**:

   - 設置當前工作表A1單元格文本加粗
   		`luckysheet.setCellFormat(0, 0, "bl", 1)`
   - 設置第二個工作表的B2單元格背景為紅色
   		`luckysheet.setCellFormat(1, 1, "bg", "#ff0000", {order:1})`
   - 設置當前工作表"A1"單元格的值為"abc"
   		`luckysheet.setCellFormat(0, 0, 'v', 'abc');`

------------

### find(content [,setting])
 

- **參數**：
	
	- {String} [content]: 要查找的內容
	- {PlainObject} [setting]: 可選參數
		+ {Boolean} [isRegularExpression]: 是否正則表達式匹配；默認為 `false`
		+ {Boolean} [isWholeWord]: 是否整詞匹配；默認為 `false`
		+ {Boolean} [isCaseSensitive]: 是否區分大小寫匹配；默認為 `false`
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
    	+ {String} [type]: 單元格屬性；默認值為`"m"`

- **說明**：
	
	查找一個工作表中的指定內容，返回查找到的內容組成的單元格一位數組，數據格式同`celldata`。

- **示例**:

   - 當前工作表查找`"value"`字符串
   		`luckysheet.find("value")`
   - 當前工作表查找公式包含`"SUM"`的單元格
   		`luckysheet.find("SUM",{type:"f"})`

------------

### replace(content, replaceContent [,setting])
 

- **參數**：
	
	- {String} [content]: 要查找的內容
	- {String} [replaceContent]: 要替換的內容
	- {PlainObject} [setting]: 可選參數
		+ {Boolean} [isRegularExpression]: 是否正則表達式匹配；默認為 `false`
		+ {Boolean} [isWholeWord]: 是否整詞匹配；默認為 `false`
		+ {Boolean} [isCaseSensitive]: 是否區分大小寫匹配；默認為 `false`
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	查找一個工作表中的指定內容並替換成新的內容，返回替換後的內容組成的單元格一位數組，數據格式同`celldata`。

- **示例**:

   - 當前工作表查找`"value"`字符串並替換為`"out"`
   		`luckysheet.replace("value", "out")`

------------

### exitEditMode([,setting])

- **參數**：
	
	- {PlainObject} [setting]: 可選參數
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	退出編輯模式。鼠標雙擊單元格後，會進入單元格編輯模式，編輯完成後，當鼠標再次點擊別的地方輸入框失焦的時候，則會退出編輯模式，隨即單元格的值會進行保存。此Api就是自動退出編輯模式的操作，主要是為了觸發自動保存單元格。

- **示例**:

   - 手動觸發退出編輯模式
   		`luckysheet.exitEditMode()`

------------

## 行和列操作

### setHorizontalFrozen(isRange [,setting])
 

- **參數**：
	
	- {Boolean} [isRange]: 是否凍結行到選區
		`isRange`可能的值有：
		
		+ `"false"`: 凍結首行
		+ `"true"`: 凍結行到選區
	- {PlainObject} [setting]: 可選參數
    	+ {Array | Object | String} [range]: `isRange`為`true`的時候設置，開啟凍結的單元格位置，格式為`{ row_focus:0, column_focus:0 }`，意為當前激活的單元格的行數和列數；默認從當前選區最後的一個選區中取得
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	凍結行操作

	特別注意，只有在`isRange`設置為`true`的時候，才需要設置`setting`中的`range`，且與一般的range格式不同。

- **示例**:

   - 凍結首行

		`luckysheet.setHorizontalFrozen(false)`

   - 凍結到`B5`選區

		`luckysheet.setHorizontalFrozen(true, { range: 'B5' })`

------------

### setVerticalFrozen(isRange [,setting])
 

- **參數**：
	
	- {Boolean} [isRange]: 是否凍結列到選區
		`isRange`可能的值有：
		
		+ `"false"`: 凍結首列
		+ `"true"`: 凍結列到選區
	- {PlainObject} [setting]: 可選參數
    	+ {Array | Object | String} [range]: `isRange`為`true`的時候設置，開啟凍結的單元格位置，格式為`{ row_focus:0, column_focus:0 }`，意為當前激活的單元格的行數和列數；默認從當前選區最後的一個選區中取得
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	凍結列操作

	特別注意，只有在`isRange`設置為`true`的時候，才需要設置`setting`中的`range`，且與一般的range格式不同。

- **示例**:

   - 凍結首列

		`luckysheet.setVerticalFrozen(false)`

------------

### setBothFrozen(isRange [,setting])
 

- **參數**：
	
	- {Boolean} [isRange]: 是否凍結行列到選區
		`isRange`可能的值有：
		
		+ `"false"`: 凍結行列
		+ `"true"`: 凍結行列到選區
	- {PlainObject} [setting]: 可選參數
    	+ {Array | Object | String} [range]: `isRange`為`true`的時候設置，開啟凍結的單元格位置，格式為`{ row_focus:0, column_focus:0 }`，意為當前激活的單元格的行數和列數；默認從當前選區最後的一個選區中取得
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	凍結行列操作

	特別注意，只有在`isRange`設置為`true`的時候，才需要設置`setting`中的`range`，且與一般的range格式不同。
	
	如果想在工作簿初始化後使用此API設置凍結，可以在工作簿創建後的鉤子函數中執行，比如：
	```js
	luckysheet.create({
    	hook:{
				workbookCreateAfter:function(){
					luckysheet.setBothFrozen(false);
				}
			}
	});

	```

- **示例**:

   - 凍結行列

		`luckysheet.setBothFrozen(false)`

------------

### cancelFrozen([setting])
 

- **參數**：

	- {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	取消凍結操作

- **示例**:

   - 取消凍結

		`luckysheet.cancelFrozen()`

------------

### insertRow(row [,setting])
 

- **參數**：

	- {Number} [row]: 在第幾行插入空白行，從0開始

	- {PlainObject} [setting]: 可選參數
		+ {Number} [number]: 插入的空白行數；默認為 1
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	在第`row`行的位置，插入`number`行空白行

- **示例**:

   - 在第2行的位置插入1行空白行

		`luckysheet.insertRow(1)`

------------

### insertColumn( column [,setting])
 

- **參數**：

	- {Number} [column]: 在第幾列插入空白列

	- {PlainObject} [setting]: 可選參數
		+ {Number} [number]: 插入的空白列數；默認為 1
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	在第`column`列的位置，插入`number`列空白列

- **示例**:

   - 在第1列的位置插入3行空白行

		`luckysheet.insertColumn(0, { number: 3 })`

------------

### deleteRow(rowStart, rowEnd [,setting])
 

- **參數**：
	
	- {Number} [rowStart]: 要刪除的起始行
	- {Number} [rowEnd]: 要刪除的結束行
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	刪除指定的行

	特別提醒，刪除行之後，行的序號並不會變化，下面的行會補充到上面，注意觀察數據是否被正確刪除即可。

- **示例**:

   - 刪除2-4行

		`luckysheet.deleteRow(1, 3)`

------------

### deleteColumn(columnStart, columnEnd [,setting])
 
- **參數**：
	
	- {Number} [columnStart]: 要刪除的起始列
	- {Number} [columnEnd]: 要刪除的結束列
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	刪除指定的列

	特別提醒，刪除列之後，列的序號並不會變化，右邊的列會補充到左邊，注意觀察數據是否被正確刪除即可。

- **示例**:

   - 刪除2-4列

		`luckysheet.deleteColumn(1, 3)`

------------

### hideRow(rowStart, rowEnd [,setting])
 
- **參數**：
	
	- {Number} [rowStart]: 要隱藏的起始行
	- {Number} [rowEnd]: 要隱藏的結束行
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	隱藏指定的行

	特別提醒，隱藏行之後，行的序號會變化。

- **示例**:

   - 隱藏2-4行

		`luckysheet.hideRow(1, 3)`

------------

### hideColumn(columnStart, columnEnd [,setting])(TODO)
 
- **參數**：
	
	- {Number} [columnStart]: 要隱藏的起始列
	- {Number} [columnEnd]: 要隱藏的結束列
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	隱藏指定的列

	特別提醒，隱藏列之後，列的序號會變化。

- **示例**:

   - 隱藏2-4列

		`luckysheet.hideColumn(1, 3)`

------------

### showRow(rowStart, rowEnd [,setting])
 
- **參數**：
	
	- {Number} [rowStart]: 要顯示的起始行
	- {Number} [rowEnd]: 要顯示的結束行
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	顯示指定的行

- **示例**:

   - 顯示2-4行

		`luckysheet.showRow(1, 3)`

------------

### showColumn(columnStart, columnEnd [,setting])(TODO)
 
- **參數**：
	
	- {Number} [columnStart]: 要顯示的起始列
	- {Number} [columnEnd]: 要顯示的結束列
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	顯示指定的列

- **示例**:

   - 顯示2-4列

		`luckysheet.showColumn(1, 3)`

------------

### setRowHeight(rowInfo [,setting])

- **參數**：
	
	- {Object} [rowInfo]: 行數和高度對應關系
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	設置指定行的高度

- **示例**:

   - 設置第一行高度為50px，第二行高度為60px

		`luckysheet.setRowHeight({0：50，1：60})`

------------

### setColumnWidth(columnInfo [,setting])

- **參數**：
	
	- {Object} [columnInfo]: 列數和寬度對應關系
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	設置指定列的寬度

- **示例**:

   - 設置第一列寬度為50px，第二列寬度為60px

		`luckysheet.setColumnWidth({0：50，1：60})`

------------

### getRowHeight(rowInfo [,setting])

- **參數**：
	
	- {Array} [rowInfo]: 行號下標組成的數組；行號下標從0開始；
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	獲取指定工作表指定行的高度，得到行號和高度對應關系的對象（第一行行號為0）

- **示例**:

   - 第一行高度為50px，第二行高度為60px，獲取這些值

		`luckysheet.getRowHeight([0,1])`
		返回得到
		`{0：50，1：60}`

------------

### getColumnWidth(columnInfo [,setting])

- **參數**：
	
	- {Array} [columnInfo]: 列號下標組成的數組；列號下標從0開始；
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	獲取指定工作表指定列的寬度，得到列號和寬度對應關系的對象（第一列列號為0）

- **示例**:

   - 第一列寬度為50px，第二列寬度為60px，獲取這些值

		`luckysheet.getColumnWidth([0,1])`
		返回得到
		`{0：50，1：60}`

------------

### getDefaultRowHeight([,setting])

- **參數**：
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	獲取工作表的默認行高

- **示例**:

   - 返回工作表的默認行高

		`luckysheet.getDefaultRowHeight()`
		返回得到
		`19`

------------

### getDefaultColWidth([,setting])

- **參數**：
		
	- {PlainObject} [setting]: 可選參數
        + {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	獲取工作表的默認列寬

- **示例**:

   - 返回工作表的默認列寬

		`luckysheet.getDefaultColWidth()`
		返回得到
		`73`

------------

## 選區操作

### getRange()
 
- **說明**：

	返回當前選區對象的數組，可能存在多個選區。每個選區的格式為row/column信息組成的對象`{row:[0,1],column:[0,1]}`

- **示例**:

	- 當前選區為"A1:B2"和"B4:C5"，執行
		
		`luckysheet.getRange()`
		
		則返回結果為：
		```json
		[
			{ "row": [0,1], "column": [0,1] },
			{ "row": [3,4], "column": [1,2] }
		]
		```

------------

### getRangeWithFlatten()
 
- **說明**：

	返回表示指定區域內所有單元格位置的數組，區別getRange方法，該方法以cell單元格(而非某塊連續的區域)為單位來組織選區的數據。

- **示例**:

	- 在表格中選擇指定的區域，然後執行
		
		`luckysheet.getRange()`
		
		則返回結果為：
		```json
		[
			{"row":[0,0],"column":[0,2]},
			{"row":[1,1],"column":[0,0]},
			{"row":[3,3],"column":[0,0]}
		]
		```
		其中，{"row":[0,0],"column":[0,2]} 表示的是一整塊連續的區域。

	- 在表格中選擇上面的區域，然後執行
		
		`luckysheet.getRangeWithFlatten()`
		
		則返回結果為：
		```json
		[
			{"r":0,"c":0},
			{"r":0,"c":1},
			{"r":0,"c":2},
			{"r":1,"c":0},
			{"r":3,"c":0}
		]
		```

------------

### getRangeValuesWithFlatte()
 
- **說明**：

	返回表示指定區域內所有單元格內容的對象數組

- **示例**:

	- 在表格中選擇指定的區域，然後執行
		
		`luckysheet.getRange()`
		
		則返回結果為：
		```json
		[
			{"row":[0,0],"column":[0,2]},
			{"row":[1,1],"column":[0,0]},
			{"row":[3,3],"column":[0,0]}
		]
		```
		其中，{"row":[0,0],"column":[0,2]} 表示的是一整塊連續的區域。

	- 在表格中選擇上面的區域，然後執行
		
		`luckysheet.getRangeValuesWithFlatte()`
		
		則返回結果為：
		```json
		[
			{
				"bg": null,
				"bl": 0,
				"it": 0,
				"ff": 0,
				"fs": 11,
				"fc": "rgb(51, 51, 51)",
				"ht": 1,
				"vt": 1,
				"v": 1,
				"ct": {
					"fa": "General",
					"t": "n"
				},
				"m": "1"
			},
			{
				"bg": null,
				"bl": 0,
				"it": 0,
				"ff": 0,
				"fs": 11,
				"fc": "rgb(51, 51, 51)",
				"ht": 1,
				"vt": 1,
				"v": 2,
				"ct": {
					"fa": "General",
					"t": "n"
				},
				"m": "2"
			},
			{
				"bg": null,
				"bl": 0,
				"it": 0,
				"ff": 0,
				"fs": 11,
				"fc": "rgb(51, 51, 51)",
				"ht": 1,
				"vt": 1,
				"v": 3,
				"ct": {
					"fa": "General",
					"t": "n"
				},
				"m": "3"
			},
			{
				"v": "Background",
				"ct": {
					"fa": "General",
					"t": "g"
				},
				"m": "Background",
				"bg": null,
				"bl": 1,
				"it": 0,
				"ff": 0,
				"fs": 11,
				"fc": "rgb(51, 51, 51)",
				"ht": 1,
				"vt": 1
			},
			{
				"v": "Border",
				"ct": {
					"fa": "General",
					"t": "g"
				},
				"m": "Border",
				"bg": null,
				"bl": 1,
				"it": 0,
				"ff": 0,
				"fs": 11,
				"fc": "rgb(51, 51, 51)",
				"ht": 1,
				"vt": 1
			}
		]
		```
------------


### getRangeAxis()
 
- **說明**：

	返回對應當前選區的坐標字符串數組，可能存在多個選區。每個選區可能是單個單元格(如 A1)或多個單元格組成的矩形區域(如 D9:E12)

- **示例**:

	- 當前選區為"E10:E14"、"A7:B13"、"C4"、 "A3"和"C6:D9"，執行
		
		`luckysheet.getRangeAxis()`
		
		則返回結果為：
		```json
		["E10:E14", "A7:B13", "C4", "A3", "C6:D9"]
		```

------------

### getRangeValue([setting])

- **參數**：

	- {PlainObject} [setting]: 可選參數
		+ {Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：
	
	返回指定工作表指定範圍的單元格二維數組數據，每個單元格為一個對象。

	[單元格對象格式參考](/zh/guide/cell.html)

- **示例**:

	- 當前選區為"A1:B2"，執行
		
		`luckysheet.getRangeValue()`
		
		則返回結果為：
		```json
		[
			[
				{
					"v": "vaule1",
					"ct": { "fa": "General", "t": "g" },
					"m": "vaule1",
					"bg": "rgba(255,255,255)",
					"bl": 0,
					"it": 0,
					"ff": 1,
					"fs": 11,
					"fc": "rgb(51, 51, 51)",
					"ht": 1,
					"vt": 0
				},
				{
					"v": "value3",
					"ct": { "fa": "General", "t": "g" },
					"m": "value3",
					"bg": "rgba(255,255,255)",
					"bl": 0,
					"it": 0,
					"ff": 1,
					"fs": 11,
					"fc": "rgb(51, 51, 51)",
					"ht": 1,
					"vt": 0
				}
			],
			[
				{
					"v": "vaule2",
					"ct": { "fa": "General", "t": "g" },
					"m": "vaule2",
					"bg": "rgba(255,255,255)",
					"bl": 0,
					"it": 0,
					"ff": 1,
					"fs": 11,
					"fc": "rgb(51, 51, 51)",
					"ht": 1,
					"vt": 0
				},
				{
					"v": "value4",
					"ct": { "fa": "General", "t": "g" },
					"m": "value4",
					"bg": "rgba(255,255,255)",
					"bl": 0,
					"it": 0,
					"ff": 1,
					"fs": 11,
					"fc": "rgb(51, 51, 51)",
					"ht": 1,
					"vt": 0
				}
			]
		]
		```

------------

### getRangeHtml([setting])


- **參數**：

	- {PlainObject} [setting]: 可選參數
    	+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：
	
	覆制指定工作表指定單元格區域的數據，返回包含`<table>`html格式的數據，可用於粘貼到excel中保持單元格樣式。
	
	特別注意，如果覆制多個選區，這幾個選區必須有相同的行或者相同的列才能覆制，覆制出的結果也會自動合並成銜接的數組，比如，多選`"C18:C20"` / `"E18:E20"` / `"G18:H20"`是允許的，但是多選`"C18:C20"` / `"E18:E21"`是不允許的

- **示例**:

	- 當前選區為"A1:B2"，執行
		
		`luckysheet.getRangeHtml()`
		
		則返回結果為：
		```html
		<table data-type="luckysheet_copy_action_table">
			<colgroup width="72px">
			</colgroup>
			<colgroup width="72px">
			</colgroup>
			<tr>
				<td style="height:19px;">
					value1
				</td>
				<td style="">
					value3
				</td>
			</tr>
			<tr>
				<td style="height:19px;">
					value2
				</td>
				<td style="">
					value4
				</td>
			</tr>
		</table>
		```

------------

### getRangeJson(title [,setting])
 

- **參數**：

    - {Boolean} [title]: 是否首行為標題

		`title`可能的值有：
		
		+ `"true"`: 首行為標題
		+ `"false"`: 首行不為標題
	- {PlainObject} [setting]: 可選參數
		+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：

	覆制指定工作表指定單元格區域的數據，返回`json`格式的數據

- **示例**:

	- 當前選區為"A1:B2"，首行為標題取得json
		
		`luckysheet.getRangeJson(true)`
		
		則返回結果為：
		```json
		[
			{ "value1": "value2", "value3": "value4" }
		]
		```

	- 當前選區為"A1:B2"，首行不為標題取得json
		
		`luckysheet.getRangeJson(false)`
		
		則返回結果為：
		```json
		[
			{ "A": "value1", "B": "value3" },
			{ "A": "value2", "B": "value4" }
		]
		```

------------

### getRangeArray(dimensional [,setting])


- **參數**：

    - {String} [dimensional]: 數組維度
		
		`dimensional`可能的值有：
		
		+ `"oneDimensional"`: 一維數組
		+ `"twoDimensional"`: 二維數組
	- {PlainObject} [setting]: 可選參數
		+ {Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：
	
	覆制指定工作表指定單元格區域的數據，返回一維、二維或者自定義行列數的二維數組的數據。

	特別注意，只有在`dimensional`設置為`custom`的時候，才需要設置`setting`中的`row`和`column`

- **示例**:

	- 當前選區為"A1:B2"，一維數組
		
		`luckysheet.getRangeArray('oneDimensional')`
		
		則返回結果為：
		```json
		["value1","value3","value2","value4"]
		```

	- 當前選區為"A1:B2"，二維數組
		
		`luckysheet.getRangeArray('twoDimensional')`
		
		則返回結果為：
		```json
		[
			[ "value1", "value3" ],
			[ "value2", "value4" ]
		]
		```

	- 當前選區為"A1:C5"，由 'value1'到'value15'的值組成，得到3	行2列的二維數組數據
		
		`luckysheet.getRangeArray('custom', { row: 3, column: 2 })`
		
		則返回結果為：
		```json
		[
			[
				{
					"m": "value1",
					"ct": { "fa": "General", "t": "g" },
					"v": "value1"
				},
				{
					"ct": { "fa": "General", "t": "g" },
					"v": "value6",
					"m": "value6"
				}
			],
			[
				{
					"ct": { "fa": "General", "t": "g" },
					"v": "value11",
					"m": "value11"
				},
				{
					"m": "value2",
					"ct": { "fa": "General", "t": "g" },
					"v": "value2"
				}
			],
			[
				{
					"ct": { "fa": "General", "t": "g" },
					"v": "value7",
					"m": "value7"
				},
				{
					"ct": { "fa": "General", "t": "g" },
					"v": "value12",
					"m": "value12"
				}
			]
		]
		```

------------

### getRangeDiagonal(type [,setting])
 

- **參數**：

	- {String} [type]: 對角線還是對角線偏移
	
		`type`可能的值有：
		
		+ `"normal"`: 對角線
		+ `"anti"`: 反對角線
		+ `"offset"`: 對角線偏移
	- {PlainObject} [setting]: 可選參數
		- {Number} [column]: `type`為`offset`的時候設置，對角偏移的列數
		+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：
	
	覆制指定工作表指定單元格區域的數據，返回對角線或者對角線偏移`column`列後的數據。

	特別注意，只有在`type`設置為`offset`的時候，才需要設置`setting`中的`column`。

- **示例**:

	- 當前選區為"A1:B2"，對角線
		
		`luckysheet.getRangeDiagonal('normal')`
		
		則返回結果為：
		```json
		[
			{
				"m": "value1",
				"ct": { "fa": "General", "t": "g" },
				"v": "value1"
			},
			{
				"m": "value4",
				"ct": { "fa": "General", "t": "g" },
				"v": "value4"
			}
		]
		```

	- 當前選區為"A1:B2"，反對角線
		
		`luckysheet.getRangeDiagonal('anti')`
		
		則返回結果為：
		```json
		[
			{
				"m": "value3",
				"ct": { "fa": "General", "t": "g" },
				"v": "value3"
			},
			{
				"m": "value2",
				"ct": { "fa": "General", "t": "g" },
				"v": "value2"
			}
		]
		```
	- 當前選區為"A1:B2"，對角線偏移1列
		
		`luckysheet.getRangeDiagonal('offset', { column: 1 })`
		
		則返回結果為：
		```json
		[
			{
				"m": "value3",
				"ct": { "fa": "General", "t": "g" },
				"v": "value3"
			}
		]
		```
------------

### getRangeBoolean([setting])
 

- **參數**：

	- {PlainObject} [setting]: 可選參數
		+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：
	
	覆制指定工作表指定單元格區域的數據，返回布爾值的數據

- **示例**:

	- 當前選區為"A1:B2"
		
		`luckysheet.getRangeBoolean()`
		
		則返回結果為：
		```json
		[
			[ false, false ],
			[ false, false ]
		]
		```

------------

### setRangeShow(range [,setting])<div id='setRangeShow'></div>


- **參數**：

	- {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區
	- {PlainObject} [setting]: 可選參數
    	+ {Boolean} [show]: 是否顯示高亮選中效果；默認值為 `true`
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	指定工作表選中一個或多個選區為選中狀態並選擇是否高亮，支持多種格式設置。

	特別提醒，Luckysheet中涉及到的選區範圍設置都可以參考這個設置

- **示例**:

     + 設定當前工作表選區範圍`A1:B2`: 
      
		`luckysheet.setRangeShow("A1:B2")`
     + 設定選區範圍`A1:B2`: 
  		
		`luckysheet.setRangeShow(["A1:B2"])`
     + 設定選區範圍`A1:B2`: 
  
  		`luckysheet.setRangeShow({row:[0,1],column:[0,1]})`
     + 設定選區範圍`A1:B2`: 
  
  		`luckysheet.setRangeShow([{row:[0,1],column:[0,1]}])`
     + 設定選區範圍`A1:B2`和`C3:D4`:  
  
		`luckysheet.setRangeShow(["A1:B2","C3:D4"])`
     + 設定選區範圍`A1:B2`和`D3`: 
  
  		`luckysheet.setRangeShow([{row:[0,1],column:[0,1]},{row:[2,2],column:[3,3]}])`

------------

### setRangeValue(data [,setting])
 
- **參數**：

	- {Array} [data]: 要賦值的單元格二維數組數據，每個單元格的值，可以為字符串或數字，或為符合Luckysheet格式的對象，參考 [單元格屬性表](/zh/guide/cell.html)
	- {PlainObject} [setting]: 可選參數
		+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Boolean} [isRefresh]: 是否刷新界面；默認為`true`；用於多個單元格賦值時候控制節流，前面單元格賦值的時候應設置為	`false`，最後一個單元格賦值時設置為`true`。
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	將一個單元格數組數據賦值到指定的區域，數據格式同`getRangeValue`方法取到的數據。

	注意一點，通常`getRangeValue`方法只是取得選區數據，但是不包含邊框和合並單元格信息，當執行`setRangeValue`的時候，會動態判斷上一步是否執行過`getRangeValue`，如果執行過，會將邊框和合並單元格信息一並從Luckysheet配置中取得。

- **示例**:

     + 賦值到當前選區
      
		```js
		const data = [
				[
					{
						"m": "value1",
						"ct": {
							"fa": "General",
							"t": "g"
						},
						"v": "value1"
					},
					{
						"m": "value3",
						"ct": {
							"fa": "General",
							"t": "g"
						},
						"v": "value3"
					}
				],
				[
					{
						"m": "value2",
						"ct": {
							"fa": "General",
							"t": "g"
						},
						"v": "value2"
					},
					{
						"m": "value4",
						"ct": {
							"fa": "General",
							"t": "g"
						},
						"v": "value4"
					}
				]
			]
		luckysheet.setRangeValue(data,{range:"A1:B2"})
		```

------------

### setRangeFormat(attr, value [,setting])
 

- **參數**：

    - {String} [attr]: 屬性類型，
  	參考 [單元格屬性表](/zh/guide/cell.html)的屬性值
	- {String | Number | Object} [value]: 具體的設置值，一個屬性會對應多個值，參考 [單元格屬性表](/zh/guide/cell.html)的值示例，特殊情況：如果屬性類型`attr`是單元格格式`ct`，則設置值`value`應提供`ct.fa`，比如設置`"A1:B2"`單元格的格式為百分比格式：
	  
  	  `luckysheet.setRangeFormat("ct", "0.00%", {range:"A1:B2"})`

    - {PlainObject} [setting]: 可選參數
    	+ {Object | String} [range]: 設置參數的目標選區範圍，支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	  
	設置指定範圍的單元格格式，一般用作處理格式，賦值操作推薦使用`setRangeValue`方法
    
  	邊框設置時，attr為`"bd"`，value為一個key/value對象，需要同時設置邊框類型:`borderType`/邊框粗細:`style`/邊框顏色:`color`/，比如設置`"A1:B2"`單元格的邊框為所有/紅色/細：
	  
	`luckysheet.setRangeFormat("bd", {borderType: "border-right",style: "1", color: "#ff0000"}, {range:["A1:B2"]})`
	
	完整可選的設置參數如下：

	+ 邊框類型 `borderType："border-left" | "border-right" | "border-top" | "border-bottom" | "border-all" | "border-outside" | "border-inside" | "border-horizontal" | "border-vertical" | "border-none"`，
	+ 邊框粗細 `style:  1 Thin | 2 Hair | 3 Dotted | 4 Dashed | 5 DashDot | 6 DashDotDot | 7 Double | 8 Medium | 9 MediumDashed | 10 MediumDashDot | 11 MediumDashDotDot | 12 SlantedDashDot | 13 Thick`
	+ 邊框顏色 `color: 16進制顏色值`

- **示例**:

   - 設置當前工作表`"A1:B2"`範圍的單元格文本加粗
		
		`luckysheet.setRangeFormat("bl", 1, {range:"A1:B2"})`
   - 設置第二個工作表的`"B2"`和`"C4:D5"`範圍的單元格背景為紅色
		
		`luckysheet.setRangeFormat("bg", "#ff0000", {range:["B2","C4:D5"], order:1})`

------------

### setRangeFilter(type [,setting])


- **參數**：
	
	- {String} [type]: 打開還是關閉篩選功能
	
		`type`可能的值有：
		
		+ `"open"`: 打開篩選功能，返回當前篩選的範圍對象
		+ `"close"`: 關閉篩選功能，返回關閉前篩選的範圍對象
	- {PlainObject} [setting]: 可選參數
    	+ {Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	為指定下標的工作表，選定的範圍開啟或關閉篩選功能

- **示例**:

	- 打開第二個工作表"A1:B2"範圍的篩選功能
	`luckysheet.setRangeFilter("open",{range:"A1:B2",order:1})`

------------

### setRangeMerge(type [,setting])
 

- **參數**：
	
	- {String} [type]: 合並單元格類型
	
		`type`可能的值有：
		
		+ `"all"`: 全部合並，區域內所有單元格合並成一個大的單元格
		+ `"horizontal"`: 水平合並，區域內在同一行的單元格合並成一個單元格
		+ `"vertical"`: 垂直合並，區域內在同一列的單元格合並成一個單元格
	
	- {PlainObject} [setting]: 可選參數
    	+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	為指定下標的工作表，選定的範圍設定合並單元格

- **示例**:

	- 當前選區 'A1:B2' 設置為合並單元格，類型為全部合並
		
		`luckysheet.setRangeMerge("all")`
		得到 'A1:B1' 的數據為：
		```json
		[
			[
				{
					"m": "value1",
					"ct": { "fa": "General", "t": "g" },
					"v": "value1",
					"mc": { "r": 0, "c": 0, "rs": 2, "cs": 2 }
				},
				{
					"mc": { "r": 0, "c": 0 }
				}
			],
			[
				{
					"mc": { "r": 0, "c": 0 }
				},
				{
					"mc": { "r": 0, "c": 0 }
				}
			]
		]
		```

------------

### cancelRangeMerge( [setting])
 

- **參數**：
	
	- {PlainObject} [setting]: 可選參數
    	+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	為指定下標的工作表，選定的範圍取消合並單元格

- **示例**:

	- 當前選區 'A1:B2' 已為合並單元格，現在要取消合並
		
		`luckysheet.cancelRangeMerge()`
		
------------

### setRangeSort(type [,setting])
 

- **參數**：

	- {String} [type]: 排序類型
	
		`type`可能的值有：
		
		+ `"asc"`: 升序
		+ `"des"`: 降序
		
	- {PlainObject} [setting]: 可選參數
		
    	+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	為指定下標的工作表，選定的範圍開啟排序功能，返回選定範圍排序後的數據。

- **示例**:

   - 設置當前工作表當前選區為升序
   `luckysheet.setRangeSort("asc")`

------------

### setRangeSortMulti(title, sort [,setting])
 

- **參數**：

	- {Boolean} [title]: 數據是否具有標題行
	- {Array} [sort]: 列設置，設置需要排序的列索引和排序方式，格式如：`[{ i:0,sort:'asc' },{ i:1,sort:'des' }]`
	- {PlainObject} [setting]: 可選參數
		
    	+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	為指定下標的工作表，選定的範圍開啟多列自定義排序功能，返回選定範圍排序後的數據。

- **示例**:

   - 設置當前工作表當前選區為自定義排序，數據具有標題行，且按第一列升序第二列降序的規則進行排序
   `luckysheet.setRangeSortMulti(true,[{ i:0,sort:'asc' },{ i:1,sort:'des' }])`

------------

### setRangeConditionalFormatDefault(conditionName, conditionValue [,setting])

- **參數**：

	- {String} [conditionName]: 條件格式規則類型
	
		`conditionName`可能的值有：
		
		+ `"greaterThan"`: 大於（conditionValue值為 數值或單元格範圍）
		+ `"lessThan"`: 小於（conditionValue值為 數值或單元格範圍）
		+ `"betweenness"`: 介於（conditionValue值為 數值或單元格範圍）
		+ `"equal"`: 等於（conditionValue值為 數值或單元格範圍）
		+ `"textContains"`: 文本包含（conditionValue值為 文本或單元格範圍）
		+ `"occurrenceDate"`: 發生日期（conditionValue值為 日期）
		+ `"duplicateValue"`: 重覆值(conditionValue值為 '0':重覆值, '1':唯一值)
		+ `"top10"`: 前 N 項（conditionValue值為 1~1000）
		+ `"top10%"`: 前 N%（conditionValue值為 1~1000）
		+ `"last10"`: 後 N 項（conditionValue值為 1~1000）
		+ `"last10%"`: 後 N%（conditionValue值為 1~1000）
		+ `"AboveAverage"`: 高於平均值（conditionValue可為空數組）
		+ `"SubAverage"`: 低於平均值（conditionValue可為空數組）
		 
	- {Array} [conditionValue]: 可以設置條件單元格或者條件值
		取值規則 （條件值數組最少一個值，最多兩個值）
		```js
		[2]
		```
		或者 （若值為單元格範圍，則取左上角單元格值）
		```js
		['A1']
		```
	
	- {PlainObject} [setting]: 可選參數
		
      	+ {Object} [format]: 顏色設置
      	  
    		* 設置文本顏色和單元格顏色；默認值為` {
				"textColor": "#000000",
				"cellColor": "#ff0000"
			}`
    	+ {Array | Object | String} [cellrange]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區
    	
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	為指定下標的工作表，選定的範圍開啟條件格式，根據設置的條件格式規則突出顯示部分單元格，返回開啟條件格式後的數據。

- **示例**:

    - 突出顯示內容大於數字2的單元格
      `luckysheet.setRangeConditionalFormatDefault("greaterThan",{ type: 'value', content: [2] })`
    
	- 突出顯示內容小於單元格A1內容的單元格
	  `luckysheet.setRangeConditionalFormatDefault("lessThan",{ type: 'range', content: ['A1'] })`

	- 突出顯示內容介於2和10之間的單元格
	  `luckysheet.setRangeConditionalFormatDefault("betweenness",{ type: 'value', content: [2,10] })`
	
	- 突出顯示內容等於單元格A1內容的單元格
	  `luckysheet.setRangeConditionalFormatDefault("equal",{ type: 'range', content: ['A1'] })`
	
	- 突出顯示內容包含單元格A1內容的單元格
	  `luckysheet.setRangeConditionalFormatDefault("textContains",{ type: 'range', content: ['A1'] })`
	
	- 突出顯示日期在 `2020/09/24 - 2020/10/15` 之間的單元格
      `luckysheet.setRangeConditionalFormatDefault("occurrenceDate",{ type: 'value', content: ['2020/09/24 - 2020/10/15'] })`

	- 突出顯示重覆值的單元格，content為0
      `luckysheet.setRangeConditionalFormatDefault("duplicateValue",{ type: 'value', content: [0] })`

	- 突出顯示唯一值的單元格，content為1
      `luckysheet.setRangeConditionalFormatDefault("duplicateValue",{ type: 'value', content: [1] })`
	
	- 突出顯示排名前20名的單元格
      `luckysheet.setRangeConditionalFormatDefault("top",{ type: 'value', content: [20] })`
	
	- 突出顯示排名前30%的單元格
      `luckysheet.setRangeConditionalFormatDefault("topPercent",{ type: 'value', content: [30] })`
	
	- 突出顯示排名後15名的單元格
      `luckysheet.setRangeConditionalFormatDefault("last",{ type: 'value', content: [15] })`
	
	- 突出顯示排名後15%的單元格
      `luckysheet.setRangeConditionalFormatDefault("lastPercent",{ type: 'value', content: [15] })`
	
	- 突出顯示高於平均值的單元格
      `luckysheet.setRangeConditionalFormatDefault("AboveAverage",{ type: 'value', content: ['AboveAverage'] })`
	
	- 突出顯示低於平均值的單元格
	  `luckysheet.setRangeConditionalFormatDefault("SubAverage",{ type: 'value', content: ['SubAverage'] })`

------------

### setRangeConditionalFormat(type [,setting])

- **參數**：

	- {String} [type]: 條件格式規則類型
	
		`type`可能的值有：
		
		+ `"dataBar"`: 數據條
		+ `"icons"`: 圖標集
		+ `"colorGradation"`: 色階
		 
	- {PlainObject} [setting]: 可選參數
		
      	+ {Array | String} [format]: 顏色設置
    	 
		 	* `type`為`dataBar`時，應設置漸變色；默認值為藍-白漸變` ["#638ec6", "#ffffff"]`

				推薦的快捷取值：
				```js
				["#638ec6", "#ffffff"],  //藍-白漸變 數據條
				["#63c384", "#ffffff"],  //綠-白漸變 數據條
				["#ff555a", "#ffffff"],  //紅-白漸變 數據條
				["#ffb628", "#ffffff"],  //橙-白漸變 數據條
				["#008aef", "#ffffff"],  //淺藍-白漸變 數據條
				["#d6007b", "#ffffff"],  //紫-白漸變 數據條
				["#638ec6"],  //藍色 數據條
				["#63c384"],  //綠色 數據條
				["#ff555a"],  //紅色 數據條
				["#ffb628"],  //橙色 數據條
				["#008aef"],  //淺藍色 數據條
				["#d6007b"]   //紫色 數據條
				```
			
			* `type`為`icons`時，應設置圖標類型；默認值為"threeWayArrowMultiColor"：三向箭頭彩色，

				可取值為：
				
				`threeWayArrowMultiColor`：三向箭頭（彩色），
				
				`threeTriangles`：3個三角形，

				`fourWayArrowMultiColor`：四向箭頭（彩色），

				`fiveWayArrowMultiColor`：五向箭頭（彩色），

				`threeWayArrowGrayColor`：三向箭頭（灰色），

				`fourWayArrowGrayColor`：四向箭頭（灰色），

				`fiveWayArrowGrayColor`：五向箭頭（灰色），

				`threeColorTrafficLightRimless`：三色交通燈（無邊框），

				`threeSigns`：三標志，

				`greenRedBlackGradient`：綠-紅-黑漸變，

				`threeColorTrafficLightBordered`：三色交通燈（有邊框），

				`fourColorTrafficLight`：四色交通燈，

				`threeSymbolsCircled`：三個符號（有圓圈），

				`tricolorFlag`：三色旗，

				`threeSymbolsnoCircle`：三個符號（無圓圈），

				`threeStars`：3個星形，

				`fiveQuadrantDiagram`：五象限圖，

				`fiveBoxes`：5個框，

				`grade4`：四等級，

				`grade5`：五等級，

			* `type`為`colorGradation`時，應設置色階顏色值；默認值為綠-黃-紅色階` ["rgb(99, 190, 123)", "rgb(255, 235, 132)", "rgb(248, 105, 107)"]`

				推薦的快捷取值：
				```js
				["rgb(99, 190, 123)", "rgb(255, 235, 132)", "rgb(248, 105, 107)"],  //綠-黃-紅色階
				["rgb(248, 105, 107)", "rgb(255, 235, 132)", "rgb(99, 190, 123)"],  //紅-黃-綠色階

				["rgb(99, 190, 123)", "rgb(252, 252, 255)", "rgb(248, 105, 107)"],  //綠-白-紅色階
				["rgb(248, 105, 107)", "rgb(252, 252, 255)", "rgb(99, 190, 123)"],  //紅-白-綠色階
				
				["rgb(90, 138, 198)", "rgb(252, 252, 255)", "rgb(248, 105, 107)"],  //藍-白-紅色階
				["rgb(248, 105, 107)", "rgb(252, 252, 255)", "rgb(90, 138, 198)"],  //紅-白-藍色階
				
				["rgb(252, 252, 255)", "rgb(248, 105, 107)"],  //白-紅色階
				["rgb(248, 105, 107)", "rgb(252, 252, 255)"],  //紅-白色階

				["rgb(99, 190, 123)", "rgb(252, 252, 255)"],  //綠-白色階
				["rgb(252, 252, 255)", "rgb(99, 190, 123)"],  //白-綠色階

				["rgb(99, 190, 123)", "rgb(255, 235, 132)"],  //綠-黃色階
				["rgb(255, 235, 132)", "rgb(99, 190, 123)"]   //黃-綠色階
				```
			
		+ {Array | Object | String} [cellrange]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區
    	
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	為指定下標的工作表，選定的範圍開啟條件格式，返回開啟條件格式後的數據。

- **示例**:

    - 當前選區範圍開啟條件格式，顯示漸變色
      `luckysheet.setRangeConditionalFormat("dataBar", { format: ["#63c384", "#ffffff"] })`

------------

### deleteRangeConditionalFormat(itemIndex [,setting])

- **參數**：

	- {Number} [itemIndex]: 條件格式規則索引
		 
	- {PlainObject} [setting]: 可選參數
		  	
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	為指定下標的工作表，刪除條件格式規則，返回被刪除的條件格式規則。

- **示例**:

    - 刪除第三個條件格式規則
      `luckysheet.deleteRangeConditionalFormat(2)`
    
------------

### clearRange([setting])

- **參數**：

	- {PlainObject} [setting]: 可選參數
		+ {Array | Object | String} [range]: 要清除的選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	清除指定工作表指定單元格區域的內容，不同於刪除選區的功能，不需要設定單元格移動情況

- **示例**:

    - 清空當前選區內容
      `luckysheet.clearRange()`
    
------------

### deleteRange(move [,setting])

- **參數**：
	
	- {String} [move]: 刪除後，右側還是下方的單元格移動
	
		`move`可能的值有：
		
		+ `"left"`: 右側單元格左移
		+ `"up"`: 下方單元格上移
		
	- {PlainObject} [setting]: 可選參數
		+ {Object | String} [range]: 要刪除的選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	刪除指定工作表指定單元格區域，同時，指定是右側單元格左移還是下方單元格上移

- **示例**:

    - 刪除當前選區並且在刪除後，右側單元格左移
      `luckysheet.deleteRange('left')`
    
------------

### insertRange(move [,setting])

[todo]


- **參數**：
	
	- {String} [move]: 活動單元格右移或者下移
	
		`move`可能的值有：
		
		+ `"right"`: 活動單元格右移
		+ `"bottom"`: 活動單元格下移
		
	- {PlainObject} [setting]: 可選參數
		+ {Array} [data]: 賦值到range區域的單元格二維數組數據，[單元格對象格式參考](/zh/guide/cell.html)；默認值為空數組，即插入空白的區域
		+ {Array | Object | String} [range]: 要插入的位置，選區範圍，支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，默認為當前選區
    	
			當未設置data數據時，允許多個選區組成的數組，插入的空白區域即為這些選區的區域，
			
			當設置了data數據，只能為單個選區，並且會把data數據插入到當前選區的第一個單元格位置
			
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	在指定工作表指定單元格區域，賦值單元格數據，或者新建一塊空白區域，返回data數據，同時，指定活動單元格右移或者下移

- **示例**:

    - 當前選區位置插入空白單元格，並且插入後當前選區單元格右移
      `luckysheet.insertRange('right')`
    
------------

### matrixOperation(type [,setting])

- **參數**：
	
	- {String} [type]: 矩陣操作的類型
	
		`type`可能的值有：
		
		+ `"flipUpDown"`: 上下翻轉
		+ `"flipLeftRight"`: 左右翻轉
		+ `"flipClockwise"`: 順時針旋轉
		+ `"flipCounterClockwise"`: 逆時針旋轉api
		+ `"transpose"`: 轉置
		+ `"deleteZeroByRow"`: 按行刪除兩端0值
		+ `"deleteZeroByColumn"`: 按列刪除兩端0值
		+ `"removeDuplicateByRow"`: 按行刪除重覆值
		+ `"removeDuplicateByColumn"`: 按列刪除重覆值
		+ `"newMatrix"`: 生產新矩陣
	- {PlainObject} [setting]: 可選參數
    	+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	指定工作表指定單元格區域的數據進行矩陣操作，返回操作成功後的結果數據

- **示例**:

    - 當前選區上下翻轉
    		
		`luckysheet.matrixOperation('flipUpDown')`

		原來的選區覆制為二維數組：
		
		`[["value1","value3"],["value2","value4"]]`
		
		上下翻轉後選區覆制為二維數組：
		
		`[["value2","value4"],["value1","value3"]]`
    
------------

### matrixCalculation(type, number [,setting])

- **參數**：
	- {String} [type]: 計算方式
	
		`type`可能的值有：
		
		+ `"plus"`: 加
		+ `"minus"`: 減
		+ `"multiply"`: 乘
		+ `"divided"`: 除
		+ `"power"`: 次方
		+ `"root"`: 次方根
		+ `"log"`: log
	- {Number} [number]: 計算數值，如: 2
	- {PlainObject} [setting]: 可選參數
    	+ {Array | Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	指定工作表指定單元格區域的數據進行矩陣計算，返回計算成功後的結果數據

- **示例**:

    - 當前選區所有單元格值加2
    		
		`luckysheet.matrixCalculation('plus', 2)`

		原來的選區覆制為二維數組：
		
		`[[1,2],[3,4]]`
		
		加2後選區覆制為二維數組：
		
		`[[3,4],[5,6]]`
    
------------

## 工作表操作

### getAllSheets()

- **說明**：

	返回所有工作表配置，格式同工作表配置，得到的結果可用於表格初始化時作為options.data使用。

	所以此API適用於，手動操作配置完一個表格後，將所有工作表信息取出來自行保存，再用於其他地方的表格創建。如果想得到包括工作簿配置在內的所有工作簿數據，推薦使用 [toJson](#toJson())，並且可以直接用於初始化Luckysheet。

- **示例**:

	- 取得第一個工作表的所有基本信息
	`luckysheet.getAllSheets()[0]`
	
------------

### getLuckysheetfile()

- **說明**：

	返回所有表格數據結構的一維數組`luckysheetfile`，不同於`getAllSheets`方法，此方法得到的工作表參數會包含很多內部使用變量，最明顯的區別是表格數據操作會維護`luckysheetfile[i].data`，而初始化數據采用的是`options.data[i].celldata`，所以`luckysheetfile`可用於調試使用，但是不適用初始化表格。

	除此之外，加載過的工作表參數中會增加一個`load = 1`，這個參數在初始化數據的時候需要置為0才行。所以，將`getLuckysheetfile()`得到的數據拿來初始化工作簿，需要做兩個工作：
	
	- celldata轉為data，參考:[transToData](/zh/guide/api.html#transtodata-celldata-setting)
	- load重置為0或者刪除此字段

	現在已有`getAllSheets`來完成這個工作，無需再手動轉化數據。

- **示例**:

	- 取得第一個工作表的所有調試信息
	`luckysheet.getLuckysheetfile()[0]`
	
------------

### getSheet([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Number} [index]: 工作表索引；默認值為當前工作表索引
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
    	+ {Number} [name]: 工作表名稱；默認值為當前工作表名稱

- **說明**：

	根據index/order/name，快捷返回指定工作表的配置，同 `luckysheetfile[i]`。如果設置多個參數，優先級為：index > order > name。
	
------------

### getSheetData([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：

	快捷返回指定工作表的數據，同 `luckysheetfile[i].data`
	
------------

### getConfig([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標

- **說明**：

	快捷返回指定工作表的config配置，同 `luckysheetfile[i].config`

------------

### setConfig(cfg, [setting])

- **參數**：
	- {Object} [cfg]: config配置
    - {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
    	+ {Function} [success]: 操作結束的回調函數
	
- **說明**：

	快捷設置指定工作表config配置

------------
### updataSheet([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Array} [data]: 需要更新的工作表配置，參考create這個API的option.data
    	+ {Function} [success]: 操作結束的回調函數
	
- **說明**：

	根據所傳的工作表配置，更新相應的工作表

	
------------
### setSheetAdd([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Object} [sheetObject]: 新增的工作表的數據；默認值為空對象，工作表數據格式參考[options.data](/zh/guide/sheet.html#初始化配置)
    	+ {Number} [order]: 新增的工作表下標；默認值為最後一個下標位置
    	+ {Function} [success]: 操作結束的回調函數
	
- **說明**：

	新增一個sheet，返回新增的工作表對象，`setting`中可選設置數據為 `sheetObject`，不傳`sheetObject`則會新增一個空白的工作表。

- **示例**:

	- 在最後一個工作表下標位置新增一個空白的工作表
	`luckysheet.setSheetAdd()`
	
------------

### setSheetDelete([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
    	+ {Function} [success]: 操作結束的回調函數
	
- **說明**：

	刪除指定下標的工作表，返回已刪除的工作表對象

- **示例**:

	- 刪除當前工作表
	`luckysheet.setSheetDelete()`
			
------------

### setSheetCopy([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
		+ {Number} [targetOrder]: 新覆制的工作表目標下標位置；默認值為當前工作表下標的下一個下標位置（遞增）
    	+ {Number} [order]: 被覆制的工作表下標；默認值為當前工作表下標
    	+ {Function} [success]: 操作結束的回調函數
	
- **說明**：

	覆制指定下標的工作表到指定下標位置，在`setting`中可選設置指定下標位置`targetOrder`，返回新覆制的工作表對象

- **示例**:

	- 覆制當前工作表到下一個下標位置
	`luckysheet.setSheetCopy()`

------------

### setSheetHide([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 被隱藏的工作表下標；默認值為當前工作表下標
    	+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	隱藏指定下標的工作表，返回被隱藏的工作表對象

- **示例**:

	- 隱藏當前工作表
	`luckysheet.setSheetHide()`
	- 隱藏第三個工作表
	`luckysheet.setSheetHide({order:2})`

------------

### setSheetShow([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 被取消隱藏的工作表下標；默認值為當前工作表下標
    	+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	取消隱藏指定下標的工作表，返回被取消隱藏的工作表對象

- **示例**:

	- 取消隱藏第三個工作表
	`luckysheet.setSheetShow({order:2})`

------------

### setSheetActive(order [,setting])

- **參數**：

	- {Number} [order]: 要激活的工作表下標
	- {PlainObject} [setting]: 可選參數
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	設置指定下標的工作表為當前工作表（激活態），即切換到指定的工作表，返回被激活的工作表對象

- **示例**:

	- 切換到第二個工作表
	`luckysheet.setSheetActive(1)`

------------

### setSheetName(name [,setting])

- **參數**：

    - {String} [name]: 新的工作表名稱
	- {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數
	
- **說明**：
	
	修改工作表名稱

- **示例**:

	- 修改當前工作表名稱為"CellSheet"
	`luckysheet.setSheetName("CellSheet")`

------------

### setSheetColor(color [,setting])

- **參數**：
	
	- {String} [color]: 工作表顏色
	- {PlainObject} [setting]: 可選參數
        + {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	設置工作表名稱處的顏色

- **示例**:

	- 修改當前工作表名稱處的顏色為紅色
	`luckysheet.setSheetColor("#ff0000")`

------------

### setSheetMove(type [,setting])

- **參數**：

    - {String | Number} [type]: 工作表移動方向或者移動的目標下標，
		
		`type`可能的值有：
		
		+ `"left"`: 向左
		+ `"right"`: 向右
		+ `1`/`2`/`3`/...: 指定下標
	- {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	指定工作表向左邊或右邊移動一個位置，或者指定下標，返回指定的工作表對象

- **示例**:

	- 當前工作表向左移動一個位置
	`luckysheet.setSheetMove("left")`
	- 第二個工作表移動到第四個工作表的下標位置
	`luckysheet.setSheetMove(3,{order:1})`

------------

### setSheetOrder(orderList [,setting])

- **參數**：

    - {Array} [orderList]: 工作表順序，設置工作表的index和order來指定位置，如：
	
	```json
	[
		{index:'sheet_01',order: 2},
		{index:'sheet_02',order: 1},
		{index:'sheet_03',order: 0},
	]
	```
	數組中順序並不重要，關鍵是指定sheet index和order的對應關系。

	- {PlainObject} [setting]: 可選參數
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	重新排序所有工作表的位置，指定工作表順序的數組。


- **示例**:

	- 重排工作表，此工作簿含有3個工作表
	```js
	luckysheet.setSheetOrder([
		{index:'sheet_01',order: 2},
		{index:'sheet_02',order: 1},
		{index:'sheet_03',order: 0},
	])
	```

------------

### setSheetZoom(zoom [,setting])

- **參數**：

    - {Number} [zoom]: 工作表縮放比例，值範圍為0.1 ~ 4；

	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	設置工作表縮放比例


- **示例**:

	- 設置當前工作表縮放比例為0.5
	```js
	luckysheet.setSheetZoom(0.5)
	```

------------

### showGridLines([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 需要顯示網格線的工作表下標；默認值為當前工作表下標
    	+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	顯示指定下標工作表的網格線，返回操作的工作表對象

- **示例**:

	- 顯示當前工作表的網格線
	`luckysheet.showGridLines()`
	- 顯示第三個工作表的網格線
	`luckysheet.showGridLines({order:2})`

------------

### hideGridLines([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Number} [order]: 需要隱藏網格線的工作表下標；默認值為當前工作表下標
    	+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	隱藏指定下標工作表的網格線，返回操作的工作表對象

- **示例**:

	- 隱藏當前工作表的網格線
	`luckysheet.hideGridLines()`
	- 隱藏第三個工作表的網格線
	`luckysheet.hideGridLines({order:2})`

------------

## 工作簿操作

### create(options)

- **參數**：
	
	- {Object} [options]:表格的所有配置信息

- **說明**：
	
	初始化一個Luckysheet，可包含多個工作表，參考 [配置列表](/zh/guide/config.html)

------------

### refresh([setting])

- **參數**：
	
	- {PlainObject} [setting]: 可選參數
		+ {Function} [success]: 表格刷新成功後的回調函數

- **說明**：
	
	刷新canvas

------------

### scroll([setting])

- **參數**：
	
	- {PlainObject} [setting]: 可選參數
		+ {Number} [scrollLeft]：橫向滾動值。默認為當前橫向滾動位置。
		+ {Number} [scrollTop]：縱向滾動值。默認為當前縱向滾動位置。
		+ {Number} [targetRow]：縱向滾動到指定的行號。默認為當前縱向滾動位置。
		+ {Number} [targetColumn]：橫向滾動到指定的列號。默認為當前橫向滾動位置。
		+ {Function} [success]: 表格刷新成功後的回調函數

- **說明**：
	
	滾動當前工作表位置

------------

### resize([setting])

- **參數**：
		
	- {PlainObject} [setting]: 可選參數
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	根據窗口大小自動resize畫布

------------

### destroy([setting])

- **參數**：
	
	- {PlainObject} [setting]: 可選參數
		+ {Function} [success]: 表格釋放成功後的回調函數

- **說明**：
	
	刪除並釋放表格

------------

### getScreenshot([setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
		+ {Object | String} [range]: 選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區

- **說明**：
	
	返回當前表格指定選區截圖後生成的base64格式的圖片

------------

### setWorkbookName(name [,setting])

- **參數**：

    - {String} [name]: 工作簿名稱
    - {PlainObject} [setting]: 可選參數
    	+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	設置工作簿名稱

------------

### getWorkbookName([,setting])

- **參數**：

    - {PlainObject} [setting]: 可選參數
    	+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	獲取工作簿名稱

------------

### undo([setting])

- **參數**：

	- {PlainObject} [setting]: 可選參數
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	撤銷當前操作，返回剛剛撤銷的操作對象

------------

### redo([setting])

- **參數**：

	- {PlainObject} [setting]: 可選參數
        + {Function} [success]: 操作結束的回調函數

- **說明**：
	
	重做當前操作，返回剛剛重做的操作對象

------------

### refreshFormula([success])

- **參數**：

	- {Function} [success]: 操作結束的回調函數

- **說明**：
	
	強制刷新公式。當你直接修改了多個單元格的值，且沒有觸發刷新，且這些單元格跟公式相關聯，則可以使用這個api最後強制觸發一次公式刷新。

------------

### pagerInit([setting])

- **參數**：

	- {PlainObject} [setting]: 參數配置
		+ {Number} 		[pageIndex]:  當前的頁碼（必填）。
		+ {Number} 		[pageSize]:   每頁顯示多少條數據（必填）。
		+ {Number} 		[total]:  總條數（必填）。
		+ {Boolean} 	[showTotal]:  是否顯示總數，默認關閉：false。
		+ {Boolean} 	[showSkip]:  是否顯示跳頁，默認關閉：false。
		+ {Boolean} 	[showPN]:  是否顯示上下翻頁，默認開啟：true。
		+ {Array} 		[selectOption]:  選擇分頁的條數。
		+ {String} 		[prevPage]:  上翻頁文字描述，默認"上一頁"。
		+ {String} 		[nextPage]:  下翻頁文字描述，默認"下一頁"。
		+ {String} 		[totalTxt]:  數據總條數文字描述，默認"總共：{total}"。



- **說明**：
	
	初始化分頁器。ps：create階段，可以直接配置options.pager參數，渲染階段會將options.pager作為參數來初始化分頁器，可通過鉤子函數onTogglePager來監聽頁碼的切換

### refreshMenuButtonFocus([data],[r],[c],[success])

- **參數**：

	- {Array}  [data]: 操作數據
	- {Number} [r]: 指定的行
	- {Number} [c]: 指定的列
	- {Function} [success]: 操作結束的回調函數

- **說明**：
	
	刷新指定單元格的頂部狀態欄狀態。

------------

### checkTheStatusOfTheSelectedCells(type,status)

- **參數**：

	- {String} type: 類型
	- {String} status: 目標狀態值

- **說明**：
	
	檢查選區內所有cell指定類型的狀態是否滿足條件（主要是粗體、斜體、刪除線和下劃線等等）。

------------

## 圖表

### insertChart([setting])

[todo]


- **參數**：

    - {PlainObject} [setting]: 可選參數
		+ {Array | Object | String} [range]: 圖表數據的選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	指定工作表指定選區範圍生成一個圖表，返回圖表參數對象，包含圖表唯一標識符chart id

------------

### setChart(chartId, attr, value [,setting])

[todo]


- **參數**：
	
	- {String} [chartId]: 指定要修改的圖表id
	- {String} [attr]: 屬性類型
		
		`attr`可能的值有：
		
		+ `"left"`: 左邊到工作表邊緣的距離
		+ `"top"`: 上邊到工作表邊緣的距離
		+ `"width"`: 圖表外框的寬度
		+ `"height"`: 圖表外框的高度
		+ `"chartOptions"`: 圖表的詳細設置項
    
	- {Number | Object}} [value]: 屬性值，當`attr`為`chartOptions`時，直接設置整個chart的配置對象
	
	- {PlainObject} [setting]: 可選參數
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	修改指定id圖表的參數，返回修改後的整個圖表參數

------------

### getChart(chartId)

[todo]


- **參數**：
	
	- {String} [chartId]: 指定要獲取的圖表id

- **說明**：
	
	獲取指定id圖表的參數

------------

### deleteChart(chartId [,setting])

[todo]


- **參數**：
	
	- {String} [chartId]: 要刪除的圖表id
	
	- {PlainObject} [setting]: 可選參數
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	刪除指定id圖表，返回被刪除的圖表的參數

------------

## 數據驗證

### setDataVerification(optionItem, [setting])

- **參數**：
	
	- {Object} [optionItem]: 數據驗證的配置信息，具體詳細的配置信息參考[dataVerification](/zh/guide/sheet.html#dataVerification)
		
    - {PlainObject} [setting]: 可選參數
        + {Object | String} [range]: 數據驗證的選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	指定工作表範圍設置數據驗證功能，並設置參數

------------

### deleteDataVerification([setting])

- **參數**：
	
    - {PlainObject} [setting]: 可選參數
		+ {Object | String} [range]: 數據驗證的選區範圍,支持選區的格式為`"A1:B2"`、`"sheetName!A1:B2"`或者`{row:[0,1],column:[0,1]}`，只能為單個選區；默認為當前選區
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	指定工作表範圍刪除數據驗證功能

------------

## 圖片

### insertImage(src, [setting])

- **參數**：

	- {String} [src]: 圖片src
	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Number} [rowIndex]: 要插入圖片的單元格行下標；默認為當前選區聚焦單元格行下標 || 0
		+ {Number} [colIndex]: 要插入圖片的單元格列下標；默認為當前選區聚焦單元格列下標 || 0
		+ {Function} [success]: 操作結束的回調函數

- **說明**：

	在指定的工作表中指定單元格位置插入圖片

### deleteImage([setting])

- **參數**：

	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {String | Array} [idList]: 要刪除圖片的id集合，也可為字符串`"all"`，all為所有的字符串；默認為`"all"`
		+ {Function} [success]: 操作結束的回調函數

- **說明**：

	刪除指定工作表中的圖片

### getImageOption([setting])

- **參數**：

	- {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：

	獲取指定工作表的圖片配置

## 工作表保護


### setProtection(option, [setting])

[todo]

- **參數**：
	
	- {Object} [option]: 工作表保護的配置信息
    - {PlainObject} [setting]: 可選參數
		+ {Number} [order]: 工作表下標；默認值為當前工作表下標
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	指定工作表設置工作表保護功能

------------

## 工具方法

### transToCellData(data [,setting])<div id='transToCellData'></div>

- **參數**：
	
	- {Array} [data]: data數據
	
	- {PlainObject} [setting]: 可選參數
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	data => celldata ，data二維數組數據轉化成 {r, c, v}格式一維數組

------------

### transToData(celldata [,setting])<div id='transToData'></div>

- **參數**：
	
	- {Array} [celldata]: data數據
	
	- {PlainObject} [setting]: 可選參數
		+ {Function} [success]: 操作結束的回調函數

- **說明**：
	
	celldata => data ，celldata一維數組數據轉化成表格所需二維數組

------------

### toJson()


- **說明**：
	
	導出的json字符串可以直接當作`luckysheet.create(options)`初始化工作簿時的參數`options`使用，使用場景在用戶自己操作表格後想要手動保存全部的參數，再去別處初始化這個表格使用，類似一個luckysheet專有格式的導入導出。

------------

### changLang([lang])

- **參數**：

	+ {String} [lang]: 語言類型；暫支持`"zh"`、`"en"`、`"es"`；默認為`"zh"`；

- **說明**：

	傳入目標語言，切換到對應的語言界面

### closeWebsocket()

- **說明**：

	關閉websocket連接

### getRangeByTxt([txt])

- **說明**：
	
	將字符串格式的工作表範圍轉換為數組形式

- **參數**：

  	+ {String} [txt]: 選區範圍,支持選區的格式為`"A1:B2"`或者指定工作表名稱的寫法`"sheetName!A1:B2"`，只支持單個選區；默認為當前最後一個選區

- **示例**:

	- 當前選區為`A1:B2`，`luckysheet.getRangeByTxt()`返回：`{column: (2) [0, 1],row: (2) [0, 1]}`
	- `luckysheet.getRangeByTxt("A1:B2")`返回：`{column: (2) [0, 1],row: (2) [0, 1]}`
    - `luckysheet.getRangeByTxt("Cell!A1:B2")`返回：`{column: (2) [0, 1],row: (2) [0, 1]}`

------------

### getTxtByRange([range])

- **說明**：
	
	將數組格式的工作表範圍轉換為字符串格式的形式

- **參數**：

  	+ {Array | Object} [range]: 選區範圍,支持選區的格式為`{row:[0,1],column:[0,1]}`，允許多個選區組成的數組；默認為當前選區

- **示例**:

	- 當前選區為`A1:B3`，`luckysheet.getTxtByRange()`返回：當前選區`"A1:B3"`
	- `luckysheet.getTxtByRange({column:[0,1],row:[0,2]})`返回：`"A1:B3"`
	- `luckysheet.getTxtByRange([{column:[0,1],row:[0,2]}])`返回：`"A1:B3"`
	- `luckysheet.getTxtByRange([{column:[0,1],row:[0,2]},{column:[1,1],row:[1,2]}])`返回：`"A1:B3,B2:B3"`

------------


## 舊版API

::: warning
為保持兼容性，仍然支持舊版API，但是已不推薦使用。
:::

### getcellvalue([r] [,c] [,data] [,type])

- **參數**：
	
	- {Number} [r]:單元格所在行數；可選值；從0開始的整數，0表示第一行
	- {Number} [c]:單元格所在列數；可選值；從0開始的整數，0表示第一列
	- {Array} [data]:表數據，二維數組；可選值；默認值為當前表格數據
	- {String} [type]:單元格屬性值；可選值；默認值為'v',表示獲取單元格的實際值

- **說明**：

	此方法為獲取單元格的值。

	- luckysheet.getcellvalue()：返回當前工作表的所有數據；
	- luckysheet.getcellvalue(0)：返回當前工作表第1行數據；
	- luckysheet.getcellvalue(null,0)：返回當前工作表第1列數據；
	- luckysheet.getcellvalue(0,0)：返回當前工作表第1行第1列單元格的數據的v值；
	- luckysheet.getcellvalue(1,1,null,'m'): 返回指定data數據的第2行第2列單元格的原始值。
	
	特殊情況：單元格格式為yyyy-MM-dd，type為'v'時會強制取'm'顯示值

	> 推薦使用新API： <a href='#getCellValue'>getCellValue</a>

------------

### getluckysheetfile()

- **說明**：

	返回所有表格數據結構的一維數組`luckysheetfile`

	> 推薦使用新API： [getLuckysheetfile](#getLuckysheetfile())

------------

### getconfig()

- **說明**：

	快捷返回當前表格config配置，每個工作表的config信息仍然包含在luckysheetfile。
	
	> 推薦使用新API： [getConfig](#getConfig([setting]))

------------

### getluckysheet_select_save()

- **說明**：

	返回當前選區對象的數組，可能存在多個選區。

	> 推薦使用新API： [getRange](#getRange())

------------

### getdatabyselection([range] [,sheetOrder])

- **參數**：
	
	- {Object} [range]：選區對象，`object: { row: [r1, r2], column: [c1, c2] }`；默認為當前第一個選區。
	- {Number} [sheetOrder]：表格下標，從0開始的整數，0表示第一個表格；默認為當前表格下標。

- **說明**：

	返回某個表格第一個選區的數據。
	- `luckysheet.getdatabyselection()`: 返回當前工作表當前選區的數據
	- `luckysheet.getdatabyselection(null,1)`: 返回第2個工作表的當前選區的數據

	> 推薦使用新API： [getRangeValue](#getRangeValue([setting]))

------------

### luckysheetrefreshgrid(scrollWidth, scrollHeight)

- **參數**：
	
	- {Number} [scrollWidth]：橫向滾動值。默認為當前橫向滾動位置。
	- {Number} [scrollHeight]：縱向滾動值。默認為當前縱向滾動位置。

- **說明**：

	按照scrollWidth, scrollHeight刷新canvas展示數據。

	> 推薦使用新API： [scroll](/zh/guide/api.html#scroll-setting)
------------

### setcellvalue(r, c, d, v)

- **參數**：
	
	- {Number} [r]：單元格所在行數；從0開始的整數，0表示第一行。
	- {Number} [c]：單元格所在列數；從0開始的整數，0表示第一列。
	- {Array} [d]：表數據；可選值；二維數組。
	- {Object | String | Number} [v]：要設置的值；可為對象，對象是是要符合單元格對象格式。

- **說明**：

	設置某個單元格的值。可配合`luckysheet.jfrefreshgrid()`刷新查看單元格值改變。

	```js
	luckysheet.setcellvalue(0, 0, luckysheet.flowdata(), 'abc');
	luckysheet.jfrefreshgrid();
	```

------------

### jfrefreshgrid()

- **說明**：

	刷新canvas

	> 推薦使用新API： [refresh](#refresh([setting]))
	
------------

### setluckysheet_select_save(v)

- **參數**：
	
	- {Array} [v]：要設置的選區值(數組)。符合選區格式規則，如`[{ row: [r1, r2], column: [c1, c2] }]`。

- **說明**：
	
	設置當前表格選區的值。配合`luckysheet.selectHightlightShow()`可在界面查看選區改變。
	```js
	luckysheet.setluckysheet_select_save([{ row: [0, 1], column: [0, 1] }]);
	luckysheet.selectHightlightShow();
	```

	> 推薦使用新API：<a href='#setRangeShow'>setRangeShow</a>
	
------------

### selectHightlightShow()

- **說明**：

	高亮當前選區

	> 推薦使用新API：<a href='#setRangeShow'>setRangeShow</a>

------------

### flowdata()

- **說明**：
	
	快捷獲取當前表格的數據

	> 推薦使用新API：[getSheetData](#getSheetData())

------------

### buildGridData(file)

- **參數**：
	
	- {Object} [file]：[luckysheetfile](/zh/guide/sheet.html)

- **說明**：
	
	生成表格可以識別的二維數組

	> 推薦使用新API：<a href='#transToData'>transToData</a>

------------

### getGridData(data)

- **參數**：
	
	- {Array} [data]：工作表的二維數組數據

- **說明**：
	
	二維數組數據轉化成 `{r, c, v}` 格式 一維數組

	> 推薦使用新API：<a href='#transToCellData'>transToCellData</a>
