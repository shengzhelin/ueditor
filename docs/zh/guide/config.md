# 整體配置

## 基礎結構

初始化表格時，可以設置一個對象配置串`options`來自定義配置Luckysheet表格。

如下是一個簡潔的配置案例：

```js
// 配置項
const options = {
    container: 'luckysheet', // 設定DOM容器的id
    title: 'Luckysheet Demo', // 設定表格名稱
    lang: 'zh' // 設定表格語言

    // 更多其他設置...
}

// 初始化表格
luckysheet.create(options)
```

這里的`options`配置項會作用於整個表格，特別的，單個sheet的配置則需要在`options.data`數組中，分別設置對應更詳細的參數，參考[工作表配置](/zh/guide/sheet.html)

針對個性化的需求，除了允許配置信息欄（[showinfobar](#showinfobar)）、工具欄（[showtoolbar](#showtoolbar)）、底部sheet頁（[showsheetbar](#showsheetbar)）、底部計數欄（[showstatisticBar](#showstatisticBar)）之外，
Luckysheet開放了更細致的自定義配置選項，分別有

- 自定義工具欄（[showtoolbarConfig](#showtoolbarConfig)）
- 自定義底部sheet頁（[showsheetbarConfig](#showsheetbarConfig)）
- 自定義計數欄（[showstatisticBarConfig](#showstatisticBarConfig)）
- 自定義單元格右鍵菜單（[cellRightClickConfig](#cellRightClickConfig)）
- 自定義底部sheet頁右擊菜單（[sheetRightClickConfig](#sheetRightClickConfig)）


## 配置項

以下為所有支持的設置參數

- 容器ID [container](#container)
- 工作簿名稱 [title](#title)
- 語言 [lang](#lang)
- 唯一key [gridKey](#gridKey)
- 加載整個工作簿 [loadUrl](#loadUrl)
- 加載其它頁celldata [loadSheetUrl](#loadSheetUrl)
- 允許更新 [allowUpdate](#allowUpdate)
- 更新地址 [updateUrl](#updateUrl)
- 縮略圖更新地址 [updateImageUrl](#updateImageUrl)
- 工作表配置 [data](#data)
- 插件 [plugins](#plugins)
- 列數 [column](#column)
- 行數 [row](#row)
- 億萬格式 [autoFormatw](#autoFormatw)
- 精度 [accuracy](#accuracy)
- 允許覆制 [allowCopy](#allowCopy)
- 工具欄 [showtoolbar](#showtoolbar)
- 自定義工具欄[showtoolbarConfig](#showtoolbarConfig)
- 信息欄 [showinfobar](#showinfobar)
- 底部sheet頁 [showsheetbar](#showsheetbar)
- 自定義底部sheet頁 [showsheetbarConfig](#showsheetbarConfig)
- 底部計數欄 [showstatisticBar](#showstatisticBar)
- 自定義計數欄 [showstatisticBarConfig](#showstatisticBarConfig)
- 允許添加行 [enableAddRow](#enableAddRow)
- 默認添加行的數目 [addRowCount](#addRowCount)
- 允許回到頂部 [enableAddBackTop](#enableAddBackTop)
- 用戶信息 [userInfo](#userInfo)
- 用戶信息菜單 [userMenuItem](#userMenuItem)
- 返回按鈕鏈接 [myFolderUrl](#myFolderUrl)
- 比例 [devicePixelRatio](#devicePixelRatio)
- 功能按鈕 [functionButton](#functionButton)
- 自動縮進界面 [showConfigWindowResize](#showConfigWindowResize)
- 刷新公式 [forceCalculation](#forceCalculation)
- 自定義單元格右鍵菜單 [cellRightClickConfig](#cellRightClickConfig)
- 自定義sheet頁右擊菜單 [sheetRightClickConfig](#sheetRightClickConfig)
- 行標題區域的寬度 [rowHeaderWidth](#rowHeaderWidth)
- 列標題區域的高度 [columnHeaderHeight](#columnHeaderHeight)
- 是否顯示公式欄 [sheetFormulaBar](#sheetFormulaBar)
- 初始化默認字體大小 [defaultFontSize](#defaultFontSize)
- 是否限制工作表名長度 [limitSheetNameLength](#limitSheetNameLength)
- 默認允許工作表名的最大長度 [defaultSheetNameMaxLength](#defaultSheetNameMaxLength)
- 分頁器 [pager](#pager)
- 自定義圖片上傳 [uploadImage](#uploadImage)
- 自定義圖片地址處理 [imageUrlHandle](#imageUrlHandle)

### container
- 類型：String
- 默認值："luckysheet"
- 作用：容器的ID
  
------------
### title
- 類型：String
- 默認值："Luckysheet Demo"
- 作用：工作簿名稱

------------
### lang
- 類型：String
- 默認值："en"
- 作用：國際化設置，允許設置表格的語言，支持簡體中文("zh")、英文("en")、繁體中文("zh_tw")和西班牙文("es")

------------
### gridKey
- 類型：String
- 默認值：""
- 作用：表格唯一標識符

------------
### loadUrl
- 類型：String
- 默認值：""
- 作用：配置`loadUrl`接口地址，加載所有工作表的配置，並包含當前頁單元格數據，與`loadSheetUrl`配合使用。參數為`gridKey`（表格主鍵）。

	源碼的請求寫法是：
	```js
	$.post(loadurl, {"gridKey" : server.gridKey}, function (d) {})
	```
	> 參見源碼 [`src/core.js`](https://github.com/mengshukeji/Luckysheet/blob/master/src/core.js)

	Luckysheet會通過ajax請求（POST）整個表格的數據，默認載入status為1的sheet數據中的`celldata`，其余的sheet載入除`celldata`字段外的所有配置字段。特別是在數據量大的時候，`loadUrl`只負責當前頁單元格數據，配置`loadSheetUrl`作為其它工作表異步加載單元格數據的接口，可以提高性能。
	
	一個合格的接口返回的json字符串數據為：

	```js
	"[	
		//status為1的sheet頁，重點是需要提供初始化的數據celldata
		{
			"name": "Cell",
			"index": "sheet_01",
			"order":  0,
			"status": 1,
			"celldata": [{"r":0,"c":0,"v":{"v":1,"m":"1","ct":{"fa":"General","t":"n"}}}]
		},
		//其他status為0的sheet頁，無需提供celldata，只需要配置項即可
		{
			"name": "Data",
			"index": "sheet_02",
			"order":  1,
			"status": 0
		},
		{
			"name": "Picture",
			"index": "sheet_03",
			"order":  2,
			"status": 0
		}
	]"
	```
	有幾個注意點
	+ 這是一個字符串，類似於JSON.stringify()處理後的json數據，壓縮後的數據便於傳輸
	+ loadUrl是一個post請求，也是為了支持大數據量
	+ 考慮到一些公式、圖表及數據透視表會引用其他sheet的數據，所以前台會加一個判斷，如果該當前sheet引用了其他sheet的數據則會通過`loadSheetUrl`配置的接口地址請求數據，把引用到的sheet的數據一並補全，而不用等切換到其它頁的時候再請求
	+ 當數據量小的時候，也可以不用Luckysheet提供的此接口，直接使用[data](#data)參數可以提前準備好所有表格數據用於初始化

------------
### loadSheetUrl
- 類型：String
- 默認值：""
- 作用：配置`loadSheetUrl`接口地址，用於異步加載其它單元格數據。參數為`gridKey`（表格主鍵） 和 `index`（sheet主鍵合集，格式為`["sheet_01","sheet_02","sheet_03"]`）。

	源碼的請求寫法是：
	```js
	$.post(loadSheetUrl, {"gridKey" : server.gridKey, "index": sheetindex.join(",")}, function (d) {})
	```
	> 參見源碼 [`src/controllers/sheetmanage.js`](https://github.com/mengshukeji/Luckysheet/blob/master/src/controllers/sheetmanage.js)

	返回的數據為sheet的`celldata`字段數據集合。

	一個合格的接口返回的json字符串數據為：

	```js
	"{
		"sheet_01": [
			{
				"r": 0,
				"c": 0,
				"v": { "v": 1, "m": "1", "ct": { "fa": "General", "t": "n" } }
			}
		],
		"sheet_02": [
			{
				"r": 0,
				"c": 0,
				"v": { "v": 1, "m": "1", "ct": { "fa": "General", "t": "n" } }
			}
		],
		"sheet_03": [
			{
				"r": 0,
				"c": 0,
				"v": { "v": 1, "m": "1", "ct": { "fa": "General", "t": "n" } }
			}
		]
	}"
	```
	同`loadUrl`類似，`loadSheetUrl`也要注意這幾點：
	+ 這是一個字符串格式數據
	+ 這是一個post請求
	+ 這個接口會在兩種情況下自動調用，一是在`loadUrl`加載的當前頁數據時發現當前工作表引用了其他工作表，二是切換到一個未曾加載過數據的工作表時

------------
### allowUpdate
- 類型：Boolean
- 默認值：false
- 作用：是否允許操作表格後的後台更新，與`updateUrl`配合使用。如果要開啟共享編輯，此參數必須設置為`true`。

------------
### updateUrl
- 類型：String
- 默認值：""
- 作用：操作表格後，實時保存數據的websocket地址，此接口也是共享編輯的接口地址。
	
	有個注意點，要想開啟共享編輯，必須滿足以下3個條件：
	+ `allowUpdate`為`true`
	+ 配置了`loadUrl`
	+ 配置了`updateUrl`

	注意，發送給後端的數據默認是經過pako壓縮過後的。後台拿到數據需要先解壓。

	通過共享編輯功能，可以實現Luckysheet實時保存數據和多人同步數據，每一次操作都會發送不同的參數到後台，具體的操作類型和參數參見[表格操作](/zh/guide/operate.html)

------------
### updateImageUrl
- 類型：String
- 默認值：""
- 作用：縮略圖的更新地址

------------
### data
- 類型：Array
- 默認值：[{ "name": "Sheet1", color: "", "status": "1", "order": "0", "data": [], "config": {}, "index":0 }, { "name": "Sheet2", color: "", "status": "0", "order": "1", "data": [], "config": {}, "index":1  }, { "name": "Sheet3", color: "", "status": "0", "order": "2", "data": [], "config": {}, "index":2  }]
- 作用：當未配置`loadUrl`和`loadSheetUrl`的時候，需要手動配置傳入整個客戶端所有sheet數據`[shee1, sheet2, sheet3]`，詳細參數設置參見[工作表配置](/zh/guide/sheet.html)

------------
### plugins
- 類型：Array
- 默認值：[]
- 作用：配置插件，支持圖表："chart"

------------
### column
- 類型：Number
- 默認值：60
- 作用：空表格默認的列數量

------------
### row
- 類型：Number
- 默認值：84
- 作用：空表格默認的行數據量

------------
### autoFormatw
- 類型：Boolean
- 默認值：false
- 作用：自動格式化超過4位數的數字為‘億萬格式’，例：true or "true" or "TRUE"

------------
### accuracy
- 類型：Number
- 默認值：undefined
- 作用：設置精度，小數點後的位數。傳參數為數字或數字字符串，例： "0" 或 0

------------
### allowCopy
- 類型：Boolean
- 默認值：true
- 作用：是否允許拷貝

------------
### showtoolbar
- 類型：Boolean
- 默認值：true
- 作用：是否顯示工具欄

------------
### showtoolbarConfig

- 類型：Object
- 默認值：{}
- 作用：自定義配置工具欄，可以與showtoolbar配合使用，`showtoolbarConfig`擁有更高的優先級。
- 格式1：
    ```json
    {
        undoRedo: false, //撤銷重做，注意撤消重做是兩個按鈕，由這一個配置決定顯示還是隱藏
        paintFormat: false, //格式刷
        currencyFormat: false, //貨幣格式
        percentageFormat: false, //百分比格式
        numberDecrease: false, // '減少小數位數'
        numberIncrease: false, // '增加小數位數
        moreFormats: false, // '更多格式'
        font: false, // '字體'
        fontSize: false, // '字號大小'
        bold: false, // '粗體 (Ctrl+B)'
        italic: false, // '斜體 (Ctrl+I)'
		strikethrough: false, // '刪除線 (Alt+Shift+5)'
		underline: false, // '下劃線 (Alt+Shift+6)'
        textColor: false, // '文本顏色'
        fillColor: false, // '單元格顏色'
        border: false, // '邊框'
        mergeCell: false, // '合並單元格'
        horizontalAlignMode: false, // '水平對齊方式'
        verticalAlignMode: false, // '垂直對齊方式'
        textWrapMode: false, // '換行方式'
        textRotateMode: false, // '文本旋轉方式'
		image:false, // '插入圖片'
		link:false, // '插入鏈接'
        chart: false, // '圖表'（圖標隱藏，但是如果配置了chart插件，右擊仍然可以新建圖表）
        postil:  false, //'批注'
        pivotTable: false,  //'數據透視表'
        function: false, // '公式'
        frozenMode: false, // '凍結方式'
        sortAndFilter: false, // '排序和篩選'
        conditionalFormat: false, // '條件格式'
		dataVerification: false, // '數據驗證'
        splitColumn: false, // '分列'
        screenshot: false, // '截圖'
        findAndReplace: false, // '查找替換'
		protection:false, // '工作表保護'
		print:false, // '打印'
    }
    ```
- 示例1：
	- 僅顯示撤消重做和字體按鈕：
		
		```js
			//options
			{
				showtoolbar: false,
				showtoolbarConfig:{
					undoRedo: true,
					font: true,
				}
			}
		```
	- 僅隱藏圖片和打印按鈕：
		
		```js
			//options
			{
				showtoolbar: true, // 默認就是true，可以不設置
				showtoolbarConfig:{
					image: false,
					print: false,
				}
			}
		```
- 格式2：
    對象格式可以很方便控制顯示隱藏，使用數組形式可輕松控制按鈕順序和位置， 以下為工具欄按鈕和分隔符的默認配置。
    ```json
	[   
		"undo", "redo", "paintFormat", "|", 
		"currencyFormat", "percentageFormat", "numberDecrease", "numberIncrease", "moreFormats", "|", 
		"font", "|", 
		"fontSize", "|", 
		"bold", "italic", "strikethrough", "underline", "textColor", "|", 
		"fillColor", "border", "mergeCell", "|", 
		"horizontalAlignMode", "verticalAlignMode", "textWrapMode", "textRotateMode", "|", 
		"image", "link", "chart", "postil", "pivotTable", "|", 
		"function", "frozenMode", "sortAndFilter", "conditionalFormat", "dataVerification", "splitColumn", "screenshot", "findAndReplace", "protection", "print"
	]
	```
- 示例2： 
	- 自定義按鈕和位置， 保護放到最前面， 只要字體樣式相關按鈕。
	    ```json
		{
			"showtoolbarConfig": [
				"protection", "|", 
				"font", "|", 
				"fontSize", "|", 
				"bold", "italic", "strikethrough", "underline", "textColor"
			]
		}
		```
------------
### showinfobar
- 類型：Boolean
- 默認值：true
- 作用：是否顯示頂部信息欄

------------
### showsheetbar
- 類型：Boolean
- 默認值：true
- 作用：是否顯示底部sheet頁按鈕

------------
### showsheetbarConfig

- 類型：Object
- 默認值：{}
- 作用：自定義配置底部sheet頁按鈕，可以與showsheetbar配合使用，`showsheetbarConfig`擁有更高的優先級。
- 格式：
    ```json
    {
        add: false, //新增sheet  
        menu: false, //sheet管理菜單
        sheet: false //sheet頁顯示
    }
    ```
- 示例：
	- 僅顯示新增sheet按鈕：
		
		```js
			//options
			{
				showsheetbar: false,
				showsheetbarConfig:{
					add: true,
				}
			}
		```
	- 僅隱藏新增sheet和管理按鈕：
		
		```js
			//options
			{
				showsheetbar: true, // 默認就是true，可以不設置
				showsheetbarConfig:{
					add: false,
					menu: false,
				}
			}
		```

------------
### showstatisticBar
- 類型：Boolean
- 默認值：true
- 作用：是否顯示底部計數欄

------------
### showstatisticBarConfig

- 類型：Object
- 默認值：{}
- 作用：自定義配置底部計數欄，可以與showstatisticBar配合使用，`showstatisticBarConfig`擁有更高的優先級。
- 格式：
    ```json
    {
        count: false, // 計數欄
		view: false, // 打印視圖
        zoom: false, // 縮放
    }
	```
- 示例：
	- 僅顯示縮放按鈕：
		
		```js
			//options
			{
				showstatisticBar: false,
				showstatisticBarConfig:{
					zoom: true,
				}
			}
		```
	- 僅隱藏打印視圖按鈕：
		
		```js
			//options
			{
				showstatisticBar: true, // 默認就是true，可以不設置
				showstatisticBarConfig:{
					view: false,
				}
			}
		```

------------
### enableAddRow
- 類型：Boolean
- 默認值：true
- 作用：允許添加行

### addRowCount
- Number
- 默認值：100
- 作用：配置新增行處默認新增的行數目

------------
### enableAddBackTop
- 類型：Boolean
- 默認值：true
- 作用：允許回到頂部

------------
### userInfo
- 類型：String | Boolean | Object
- 默認值：false
- 作用：右上角的用戶信息展示樣式，支持以下三種形式
	1. HTML模板字符串，如：
	
	```js
	options:{
		// 其他配置
		userInfo:'<i style="font-size:16px;color:#ff6a00;" class="fa fa-taxi" aria-hidden="true"></i> Lucky',
	}
	```

	或者一個普通字符串，如：
	
	```js
	options:{
		// 其他配置
		userInfo:'Lucky',
	}
	```
 
	2. Boolean類型，如：
   	
	`false`:不展示
	```js
	options:{
		// 其他配置
		userInfo:false, // 不展示用戶信息
	}

	```
	`ture`:展示默認的字符串
	```js
	options:{
		// 其他配置
		userInfo:true, // 展示HTML:'<i style="font-size:16px;color:#ff6a00;" class="fa fa-taxi" aria-hidden="true"></i> Lucky'
	}

	```
	3. 對象格式，設置 `userImage`：用戶頭像地址 和 `userName`：用戶名，如：
	```js
	options:{
		// 其他配置
		userImage:'https://cdn.jsdelivr.net/npm/luckyresources@1.0.3/assets/img/logo/logo.png', // 頭像url
		userName:'Lucky', // 用戶名
	}
	```

	4. 注意，設置為`undefined`或者不設置，同設置`false`

------------
### userMenuItem
- 類型：Array
- 默認值：`[{url:"www.baidu.com", "icon":'<i class="fa fa-folder" aria-hidden="true"></i>', "name":"我的表格"}, {url:"www.baidu.com", "icon":'<i class="fa fa-sign-out" aria-hidden="true"></i>', "name":"退出登陸"}]`
- 作用：點擊右上角的用戶信息彈出的菜單

------------
### myFolderUrl
- 類型：String
- 默認值："www.baidu.com"
- 作用：左上角<返回按鈕的鏈接

------------
### devicePixelRatio
- 類型：Number
- 默認值：window.devicePixelRatio
- 作用：設備比例，比例越大表格分辨率越高

------------
### functionButton
- 類型：String
- 默認值：""
- 作用：右上角功能按鈕，例如`'<button id="" class="btn btn-primary" style="padding:3px 6px;font-size: 12px;margin-right: 10px;">下載</button>    <button id="" class="btn btn-primary btn-danger" style="    padding:3px 6px;    font-size: 12px;    margin-right: 10px;">分享</button>    <button id="luckysheet-share-btn-title" class="btn btn-primary btn-danger" style="    padding:3px 6px;    font-size: 12px;    margin-right: 10px;">秀數據</button>'`

------------
### showConfigWindowResize
- 類型：Boolean
- 默認值：true
- 作用：圖表或數據透視表的配置會在右側彈出，設置彈出後表格是否會自動縮進

------------
### forceCalculation
- 類型：Boolean
- 默認值：false
- 作用：強制刷新公式。

    默認情況下，為提高加載性能，表格初始化的時候，含有公式的單元格會默認直接取得`v`和`m`作為數據結果，而不做實時計算。
    
    如果公式關聯到的單元格數據已經變化，或者公式所在的單元格數據結果改變了，則會導致關聯單元格應該計算得出的結果和實際顯示結果不一致，這是就需要開啟公式刷新，保證數據實時計算的準確性。
    
    ⚠️提醒，公式較多時會有性能問題，慎用！

------------
### cellRightClickConfig

- 類型：Object
- 默認值：{}
- 作用：自定義配置單元格右擊菜單
- 格式：
    ```json
    {
        copy: false, // 覆制
        copyAs: false, // 覆制為
        paste: false, // 粘貼
        insertRow: false, // 插入行
        insertColumn: false, // 插入列
        deleteRow: false, // 刪除選中行
        deleteColumn: false, // 刪除選中列
        deleteCell: false, // 刪除單元格
        hideRow: false, // 隱藏選中行和顯示選中行
        hideColumn: false, // 隱藏選中列和顯示選中列
        rowHeight: false, // 行高
        columnWidth: false, // 列寬
        clear: false, // 清除內容
        matrix: false, // 矩陣操作選區
        sort: false, // 排序選區
        filter: false, // 篩選選區
        chart: false, // 圖表生成
        image: false, // 插入圖片
        link: false, // 插入鏈接
        data: false, // 數據驗證
		cellFormat: false // 設置單元格格式
    }
	```
	除了單元格，這里的配置還包括行標題右擊菜單、列標題右擊菜單和列標題下拉箭頭的菜單，具體配置關系如下表格：
	
	|右擊菜單配置|單元格|行標題|列標題|列箭頭|
    | ------------ | ------------ | ------------ | ------------ | ------------ |
    |copy|覆制|覆制|覆制|覆制|
    |copyAs|覆制為|覆制為|覆制為|覆制為|
    |paste|粘貼|粘貼|粘貼|粘貼|
    |insertRow|插入行|向上增加N行，向下增加N行|-|-|
    |insertColumn|插入列|-|向左增加N列，向右增加N列|向左增加N列，向右增加N列|
    |deleteRow|刪除選中行|刪除選中行|-|-|
    |deleteColumn|刪除選中列|-|刪除選中列|刪除選中列|
    |deleteCell|刪除單元格|-|-|-|
    |hideRow|-|隱藏選中行和顯示選中行|-|-|
    |hideColumn|-|-|隱藏選中列和顯示選中列|隱藏選中列和顯示選中列|
    |rowHeight|-|行高|-|-|
    |columnWidth|-|-|列寬|列寬|
    |clear|清除內容|清除內容|清除內容|-|
    |matrix|矩陣操作選區|矩陣操作選區|矩陣操作選區|-|
    |sort|排序選區|排序選區|排序選區|A-Z排序和Z-A排序|
    |filter|篩選選區|篩選選區|篩選選區|-|
    |chart|圖表生成|圖表生成|圖表生成|-|
    |image|插入圖片|插入圖片|插入圖片|-|
    |link|插入鏈接|插入鏈接|插入鏈接|-|
    |data|數據驗證|數據驗證|數據驗證|-|
    |cellFormat|設置單元格格式|設置單元格格式|設置單元格格式|-|


------------
### sheetRightClickConfig

- 類型：Object
- 默認值：{}
- 作用：自定義配置sheet頁右擊菜單
- 格式：
    ```json
    {   
        delete: false, // 刪除
        copy: false, // 覆制
        rename: false, //重命名
        color: false, //更改顏色
        hide: false, //隱藏，取消隱藏
        move: false, //向左移，向右移
    }

------------
### rowHeaderWidth

- 類型：Number
- 默認值：46
- 作用：行標題區域的寬度，如果設置為0，則表示隱藏行標題

------------
### columnHeaderHeight

- 類型：Number
- 默認值：20
- 作用：列標題區域的高度，如果設置為0，則表示隱藏列標題

------------
### sheetFormulaBar

- 類型：Boolean
- 默認值：true
- 作用：是否顯示公式欄

------------
### defaultFontSize
- 類型：Number
- 默認值：11
- 作用：初始化默認字體大小

------------

### limitSheetNameLength
- 類型：Boolean
- 默認值：true
- 作用：工作表重命名等場景下是否限制工作表名稱的長度

------------

### defaultSheetNameMaxLength
- 類型：Number
- 默認值：31
- 作用：默認允許的工作表名最大長度

------------

### pager
- 類型：Object
- 默認值：null
- 作用：分頁器按鈕設置，初版方案是直接使用的jquery插件 [sPage](https://github.com/jvbei/sPage)
	點擊分頁按鈕會觸發鉤子函數 `onTogglePager`，返回當前頁碼，同`sPage`的`backFun`方法，此分頁器設置只負責UI部分，具體切換分頁後的數據請求和數據渲染，請在`onTogglePager`鉤子行數里自定義處理。
	```js
	pager: {
		pageIndex: 1, //當前頁碼，必填
		total: 100, //數據總條數，必填
		selectOption: [10, 20, 30], // 選擇每頁的行數，
		pageSize: 10, //每頁顯示多少條數據，默認10條
		showTotal: false, // 是否顯示總數，默認關閉：false
		showSkip: false, //是否顯示跳頁，默認關閉：false
		showPN: false, //是否顯示上下翻頁，默認開啟：true
		prevPage: '', //上翻頁文字描述，默認"上一頁"
		nextPage: '', //下翻頁文字描述，默認"下一頁"
		totalTxt: '', // 數據總條數文字描述，默認"總共：{total}"
	}
	```

### uploadImage

用於自定義圖片的上傳，默認情況下，插入的圖片是以base64的形式放入sheet數據中，如果需要單獨上傳圖片，僅在sheet中引用圖片地址可使用此配置。

- 類型： `function (file) => Promise(imgUrl)`，接受file對象，返回Promise，值為上傳完成的圖片url
- 默認值： `undefined`

:::details 查看示例配置

```js
{
    uploadImage: function (file) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://192.168.210.159/miniuiServer/imageUploader.php');

			// 額外的請求頭
            var headers = {};
            if (headers) {
                Object.keys(headers).forEach(function (k) {
                    xhr.setRequestHeader(k, headers[k]);
                });
            }
            var data = new FormData();
			// 要上傳的圖片文件
            data.append('file', file, file.name || '');

            xhr.send(data);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var res = JSON.parse(xhr.responseText);
                        var url = res.downloadUrl;
                        if (url) {
                            resolve(url); // 給上傳的後的地址
                        } else {
                            reject('image upload error');
                        }
                    } else {
                        reject('image upload error');
                    }
                }
            };
        });
    }
}

```

:::

### imageUrlHandle

圖片上傳的路徑處理函數，和 [uploadImage](#uploadImage) 相關，一般只有使用自定義圖片上傳才需要此配置。

- 類型： `function (string) => string`，接受原始路徑，返回新路徑
- 默認值： `undefined`
- 作用，處理圖片顯示時的路徑。  
  如上傳返回地址為接口地址，如： `rest/attach/[fileguid]`， 則需要處理為 `http://localhost:8080/xxx/rest/attach/[fileguid]` 才能顯示，但將前面域名信息寫入數據，後續使用可能會有問題，因此可使用此方法處理路徑，全路徑僅在展示使用，數據內僅存儲 `rest/attach/[fileguid]`

```js
{
    // 處理上傳圖片的地址
    imageUrlHandle: function (url) {
        // 已經是 // http data 開頭則不處理 
        if (/^(?:\/\/|(?:http|https|data):)/i.test(url)) {
            return url;
        }
        return location.origin + url;
    }
}
```

------------

## 鉤子函數

鉤子函數應用於二次開發時，會在各個常用鼠標或者鍵盤操作時植入鉤子，調用開發者傳入的函數，起到擴展Luckysheet功能的作用。

鉤子函數統一配置在`options.hook`下，可以分別針對單元格、sheet頁、表格創建配置hook。

> 使用案例可參考源碼 [src/index.html](https://github.com/mengshukeji/Luckysheet/blob/master/src/index.html)

## 單元格

### cellEditBefore

- 類型：Function
- 默認值：null
- 作用：進入單元格編輯模式之前觸發。在選中了某個單元格且在非編輯狀態下，通常有以下三種常規方法觸發進入編輯模式
	   
  - 雙擊單元格
  - 敲Enter鍵
  - 使用API：enterEditMode 

- 參數：
	- {Array} [range]: 當前選區範圍

------------
### cellUpdateBefore

- 類型：Function
- 默認值：null
- 作用：更新這個單元格值之前觸發，`return false` 則不執行後續的更新。在編輯狀態下修改了單元格之後，退出編輯模式並進行數據更新之前觸發這個鉤子。
- 參數：
	- {Number} [r]: 單元格所在行數
	- {Number} [c]: 單元格所在列數
	- {Object | String | Number} [value]: 要修改的單元格內容
	- {Boolean} [isRefresh]: 是否刷新整個表格

------------
### cellUpdated

- 類型：Function
- 默認值：null
- 作用：更新這個單元格後觸發
- 參數：
	- {Number} [r]: 單元格所在行數
	- {Number} [c]: 單元格所在列數
	- {Object} [oldValue]: 修改前的單元格對象
	- {Object} [newValue]: 修改後的單元格對象
	- {Boolean} [isRefresh]: 是否刷新整個表格

------------
### cellRenderBefore

- 類型：Function
- 默認值：null
- 作用：單元格渲染前觸發，`return false` 則不渲染該單元格
- 參數：
	- {Object} [cell]:單元格對象
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [c]:單元格所在列號
		+ {Number} [start_r]:單元格左上角的垂直坐標
		+ {Number} [start_c]:單元格左上角的水平坐標
		+ {Number} [end_r]:單元格右下角的垂直坐標
		+ {Number} [end_c]:單元格右下角的水平坐標
	- {Object} [sheet]:當前sheet對象
	- {Object} [ctx]: 當前畫布的context

------------
### cellRenderAfter

- 類型：Function
- 默認值：null
- 作用：單元格渲染結束後觸發，`return false` 則不渲染該單元格
- 參數：
	- {Object} [cell]:單元格對象
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [c]:單元格所在列號
		+ {Number} [start_r]:單元格左上角的垂直坐標
		+ {Number} [start_c]:單元格左上角的水平坐標
		+ {Number} [end_r]:單元格右下角的垂直坐標
		+ {Number} [end_c]:單元格右下角的水平坐標
	- {Object} [sheet]:當前sheet對象
	- {Object} [ctx]: 當前畫布的context

- 示例：

	一個在D1單元格的左上角和右下角分別繪制兩張圖的案例
	:::::: details
	```js
	luckysheet.create({
            hook: {
                cellRenderAfter: function (cell, position, sheetFile, ctx) {
                    var r = position.r;
                    var c = position.c;
                    if (r === 0 && c === 3) { // 指定處理D1單元格
                        if (!window.storeUserImage) {
                            window.storeUserImage = {}
                        }
						
                        if (!window.storeUserImage[r + '_' + c]) {
                            window.storeUserImage[r + '_' + c] = {}
                        }

                        var img = null;
                        var imgRight = null;

                        if (window.storeUserImage[r + '_' + c].image && window.storeUserImage[r + '_' + c].imgRight) {
							
							// 加載過直接取
                            img = window.storeUserImage[r + '_' + c].image;
                            imgRight = window.storeUserImage[r + '_' + c].imgRight;

                        } else {

                            img = new Image();
                            imgRight = new Image();

                            img.src = 'https://www.dogedoge.com/favicon/developer.mozilla.org.ico';
                            imgRight.src = 'https://www.dogedoge.com/static/icons/twemoji/svg/1f637.svg';

							// 圖片緩存到內存，下次直接取，不用再重新加載
                            window.storeUserImage[r + '_' + c].image = img;
                            window.storeUserImage[r + '_' + c].imgRight = imgRight;

                        }

						
                        if (img.complete) { // 已經加載完成的直接渲染
                            ctx.drawImage(img, position.start_c, position.start_r, 10, 10);
                        } else {
                            img.onload = function () {
                                ctx.drawImage(img, position.start_c, position.start_r, 10, 10);
                            }

                        }

                        if (imgRight.complete) {
                            ctx.drawImage(imgRight, position.end_c - 10, position.end_r - 10, 10, 10);
                        } else {

                            imgRight.onload = function () {
                                ctx.drawImage(imgRight, position.end_c - 10, position.end_r - 10, 10, 10);
                            }
                        }

                    }
                }
            }
        })
	```
	:::

------------
### cellAllRenderBefore

- 類型：Function
- 默認值：null
- 作用：所有單元格渲染之前執行的方法。在內部，這個方法加在了`luckysheetDrawMain`渲染表格之前。
- 參數：
	- {Object} [data]: 當前工作表二維數組數據
	- {Object} [sheet]:當前sheet對象
	- {Object} [ctx]: 當前畫布的context

------------
### rowTitleCellRenderBefore

- 類型：Function
- 默認值：null
- 作用：行標題單元格渲染前觸發，`return false` 則不渲染行標題
- 參數：
	- {String} [rowNum]:行號
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [top]:單元格左上角的垂直坐標
		+ {Number} [width]:單元格寬度
		+ {Number} [height]:單元格高度
	- {Object} [ctx]: 當前畫布的context

------------
### rowTitleCellRenderAfter

- 類型：Function
- 默認值：null
- 作用：行標題單元格渲染後觸發，`return false` 則不渲染行標題
- 參數：
	- {String} [rowNum]:行號
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [top]:單元格左上角的垂直坐標
		+ {Number} [width]:單元格寬度
		+ {Number} [height]:單元格高度
	- {Object} [ctx]: 當前畫布的context

------------
### columnTitleCellRenderBefore

- 類型：Function
- 默認值：null
- 作用：列標題單元格渲染前觸發，`return false` 則不渲染列標題
- 參數：
	- {Object} [columnAbc]:列標題字符
	- {Object} [position]:
		- {Number} [c]:單元格所在列號
		- {Number} [left]:單元格左上角的水平坐標
		- {Number} [width]:單元格寬度
		- {Number} [height]:單元格高度
	- {Object} [ctx]: 當前畫布的context

------------
### columnTitleCellRenderAfter

- 類型：Function
- 默認值：null
- 作用：列標題單元格渲染後觸發，`return false` 則不渲染列標題
- 參數：
	- {Object} [columnAbc]:列標題字符
	- {Object} [position]:
		- {Number} [c]:單元格所在列號
		- {Number} [left]:單元格左上角的水平坐標
		- {Number} [width]:單元格寬度
		- {Number} [height]:單元格高度
	- {Object} [ctx]: 當前畫布的context

------------

## 鼠標鉤子

### cellMousedownBefore

- 類型：Function
- 默認值：null
- 作用：單元格點擊前的事件，`return false`則終止之後的點擊操作
- 參數：
	- {Object} [cell]:單元格對象
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [c]:單元格所在列號
		+ {Number} [start_r]:單元格左上角的垂直坐標
		+ {Number} [start_c]:單元格左上角的水平坐標
		+ {Number} [end_r]:單元格右下角的垂直坐標
		+ {Number} [end_c]:單元格右下角的水平坐標
	- {Object} [sheet]:當前sheet對象
	- {Object} [ctx]: 當前畫布的context

------------
### cellMousedown

- 類型：Function
- 默認值：null
- 作用：單元格點擊後的事件，`return false`則終止之後的點擊操作
- 參數：
	- {Object} [cell]:單元格對象
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [c]:單元格所在列號
		+ {Number} [start_r]:單元格左上角的垂直坐標
		+ {Number} [start_c]:單元格左上角的水平坐標
		+ {Number} [end_r]:單元格右下角的垂直坐標
		+ {Number} [end_c]:單元格右下角的水平坐標
	- {Object} [sheet]:當前sheet對象
	- {Object} [ctx]: 當前畫布的context

------------
### sheetMousemove

- 類型：Function
- 默認值：null
- 作用：鼠標移動事件，可通過cell判斷鼠標停留在哪個單元格
- 參數：
	- {Object} [cell]:單元格對象
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [c]:單元格所在列號
		+ {Number} [start_r]:單元格左上角的垂直坐標
		+ {Number} [start_c]:單元格左上角的水平坐標
		+ {Number} [end_r]:單元格右下角的垂直坐標
		+ {Number} [end_c]:單元格右下角的水平坐標
	- {Object} [sheet]:當前sheet對象
	- {Object} [moveState]:鼠標移動狀態，可判斷現在鼠標操作的對象，false和true
		+ {Boolean} [functionResizeStatus]:工具欄拖動
		+ {Boolean} [horizontalmoveState]:水平凍結分割欄拖動
		+ {Boolean} [verticalmoveState]:垂直凍結分割欄拖動
		+ {Boolean} [pivotTableMoveState]:數據透視表字段拖動
		+ {Boolean} [sheetMoveStatus]:sheet改變你位置拖動
		+ {Boolean} [scrollStatus]:鼠標觸發了滾動條移動
		+ {Boolean} [selectStatus]:鼠標移動框選數據
		+ {Boolean} [rowsSelectedStatus]:通過行標題來選擇整行操作
		+ {Boolean} [colsSelectedStatus]:通過列標題來選擇整列操作
		+ {Boolean} [cellSelectedMove]:選框的移動
		+ {Boolean} [cellSelectedExtend]:選框下拉填充
		+ {Boolean} [colsChangeSize]:拖拽改變列寬
		+ {Boolean} [rowsChangeSize]:拖拽改變行高
		+ {Boolean} [chartMove]:圖表移動
		+ {Boolean} [chartResize]:圖表改變大小
		+ {Boolean} [rangeResize]:公式參數高亮選區的大小拖拽
		+ {Boolean} [rangeMove]:公式參數高亮選區的位置拖拽
	- {Object} [ctx]: 當前畫布的context

------------
### sheetMouseup

- 類型：Function
- 默認值：null
- 作用：鼠標按鈕釋放事件，可通過cell判斷鼠標停留在哪個單元格
- 參數：
	- {Object} [cell]:單元格對象
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [c]:單元格所在列號
		+ {Number} [start_r]:單元格左上角的垂直坐標
		+ {Number} [start_c]:單元格左上角的水平坐標
		+ {Number} [end_r]:單元格右下角的垂直坐標
		+ {Number} [end_c]:單元格右下角的水平坐標
	- {Object} [sheet]:當前sheet對象
	- {Object} [moveState]:鼠標移動狀態，可判斷現在鼠標操作的對象，false和true
		+ {Boolean} [functionResizeStatus]:工具欄拖動
		+ {Boolean} [horizontalmoveState]:水平凍結分割欄拖動
		+ {Boolean} [verticalmoveState]:垂直凍結分割欄拖動
		+ {Boolean} [pivotTableMoveState]:數據透視表字段拖動
		+ {Boolean} [sheetMoveStatus]:sheet改變你位置拖動
		+ {Boolean} [scrollStatus]:鼠標觸發了滾動條移動
		+ {Boolean} [selectStatus]:鼠標移動框選數據
		+ {Boolean} [rowsSelectedStatus]:通過行標題來選擇整行操作
		+ {Boolean} [colsSelectedStatus]:通過列標題來選擇整列操作
		+ {Boolean} [cellSelectedMove]:選框的移動
		+ {Boolean} [cellSelectedExtend]:選框下拉填充
		+ {Boolean} [colsChangeSize]:拖拽改變列寬
		+ {Boolean} [rowsChangeSize]:拖拽改變行高
		+ {Boolean} [chartMove]:圖表移動
		+ {Boolean} [chartResize]:圖表改變大小
		+ {Boolean} [rangeResize]:公式參數高亮選區的大小拖拽
		+ {Boolean} [rangeMove]:公式參數高亮選區的位置拖拽
		+ {Boolean} [cellRightClick]:單元格右擊
		+ {Boolean} [rowTitleRightClick]:行標題右擊
		+ {Boolean} [columnTitleRightClick]:列標題右擊
		+ {Boolean} [sheetRightClick]:底部sheet頁右擊
		+ {Boolean} [hyperlinkClick]:點擊超鏈接
	- {Object} [ctx]: 當前畫布的context

------------
### scroll

- 類型：Function
- 默認值：null
- 作用：鼠標滾動事件
- 參數：
	- {Object} [position]:
		+ {Number} [scrollLeft]:橫向滾動條的位置
		+ {Number} [scrollTop]:垂直滾動條的位置
		+ {Number} [canvasHeight]:canvas高度
		
------------
### cellDragStop

- 類型：Function
- 默認值：null
- 作用：鼠標拖拽文件到Luckysheet內部的結束事件
- 參數：
	- {Object} [cell]:單元格對象
	- {Object} [position]:
		+ {Number} [r]:單元格所在行號
		+ {Number} [c]:單元格所在列號
		+ {Number} [start_r]:單元格左上角的垂直坐標
		+ {Number} [start_c]:單元格左上角的水平坐標
		+ {Number} [end_r]:單元格右下角的垂直坐標
		+ {Number} [end_c]:單元格右下角的水平坐標
	- {Object} [sheet]:當前sheet對象
	- {Object} [ctx]: 當前畫布的context
	- {Object} [event]: 當前事件對象
		
------------

## 選區操作（包括單元格）

### rangeSelect

- 類型：Function
- 默認值：null
- 作用：框選或者設置選區後觸發
- 參數：
	- {Object} [sheet]:當前sheet對象
	- {Object | Array} [range]: 選區範圍，可能為多個選區

------------
### rangeMoveBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：移動選區前，包括單個單元格
- 參數：
	- {Array} [range]: 當前選區範圍，只能為單個選區

------------
### rangeMoveAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：移動選區後，包括單個單元格
- 參數：
	- {Array} [oldRange]: 移動前當前選區範圍，只能為單個選區
	- {Array} [newRange]: 移動後當前選區範圍，只能為單個選區

------------
### rangeEditBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區修改前
- 參數：
	- {Object | Array} [range]: 選區範圍，可能為多個選區
	- {Object} [data]: 選區範圍所對應的數據

------------
### rangeEditAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區修改後
- 參數：
	- {Object | Array} [range]: 選區範圍，可能為多個選區
    - {Object} [oldData]: 修改前選區範圍所對應的數據
    - {Object} [newData]: 修改後選區範圍所對應的數據

------------
### rangeCopyBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區覆制前
- 參數：
	- {Object | Array} [range]: 選區範圍，可能為多個選區
	- {Object} [data]: 選區範圍所對應的數據

------------
### rangeCopyAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區覆制後
- 參數：
	- {Object | Array} [range]: 選區範圍，可能為多個選區
	- {Object} [data]: 選區範圍所對應的數據

------------
### rangePasteBefore

- 類型：Function
- 默認值：null
- 作用：選區粘貼前
- 參數：
	- {Object | Array} [range]: 選區範圍，可能為多個選區
	- {Object} [data]: 要被粘貼的選區範圍所對應的數據

------------
### rangePasteAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區粘貼後
- 參數：
	- {Object | Array} [range]: 選區範圍，可能為多個選區
	- {Object} [originData]: 要被粘貼的選區範圍所對應的數據
	- {Object} [pasteData]: 要粘貼的數據

------------
### rangeCutBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區剪切前
- 參數：
	- {Array} [range]: 選區範圍，只能為單個範圍
	- {Object} [data]: 要被剪切的選區範圍所對應的數據

------------
### rangeCutAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區剪切後
- 參數：
	- {Array} [range]: 選區範圍，只能為單個範圍
	- {Object} [data]: 被剪切的選區範圍所對應的數據

------------
### rangeDeleteBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區刪除前
- 參數：
	- {Array} [range]: 選區範圍，只能為單個範圍
	- {Object} [data]: 要被刪除的選區範圍所對應的數據

------------
### rangeDeleteAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區刪除後
- 參數：
	- {Array} [range]: 選區範圍，只能為單個範圍
	- {Object} [data]: 被刪除的選區範圍所對應的數據

------------
### rangeClearBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區清除前
- 參數：
	- {Object | Array} [range]: 選區範圍，可能為多個選區
	- {Object} [data]: 要被清除的選區範圍所對應的數據

------------
### rangeClearAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區清除後
- 參數：
	- {Object | Array} [range]: 選區範圍，可能為多個選區
	- {Object} [data]: 被清除的選區範圍所對應的數據

------------
### rangePullBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區下拉前
- 參數：
	- {Array} [range]: 當前選區範圍，只能為單個範圍

------------
### rangePullAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：選區下拉後
- 參數：
	- {Array} [range]: 下拉後的選區範圍，只能為單個範圍

------------

## 工作表

### sheetCreateBefore

- 類型：Function
- 默認值：null
- 作用：創建sheet頁前觸發，sheet頁新建也包含數據透視表新建

------------
### sheetCreateAfter

- 類型：Function
- 默認值：null
- 作用：創建sheet頁後觸發，sheet頁新建也包含數據透視表新建
- 參數：
	- {Object} [sheet]: 當前新創建的sheet頁的配置

------------
### sheetCopyBefore

- 類型：Function
- 默認值：null
- 作用：拷貝創建sheet頁前觸發，sheet頁新建也包含數據透視表新建
- 參數：
	- {Object} [targetSheet]: 被拷貝的sheet頁配置
	- {Object} [copySheet]: 拷貝得到的sheet頁的配置
------------
### sheetCopyAfter

- 類型：Function
- 默認值：null
- 作用：拷貝創建sheet頁後觸發，sheet頁新建也包含數據透視表新建
- 參數：
	- {Object} [sheet]: 當前創建的sheet頁的配置

------------
### sheetHideBefore

- 類型：Function
- 默認值：null
- 作用：隱藏sheet頁前觸發
- 參數：
	- {Object} [sheet]: 將要隱藏的sheet頁的配置

------------
### sheetHideAfter

- 類型：Function
- 默認值：null
- 作用：隱藏sheet頁後觸發
- 參數：
	- {Object} [sheet]: 要隱藏的sheet頁的配置

------------
### sheetShowBefore

- 類型：Function
- 默認值：null
- 作用：顯示sheet頁前觸發
- 參數：
	- {Object} [sheet]: 將要顯示的sheet頁的配置

------------
### sheetShowAfter

- 類型：Function
- 默認值：null
- 作用：顯示sheet頁後觸發
- 參數：
	- {Object} [sheet]: 要顯示的sheet頁的配置

------------
### sheetMoveBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：sheet移動前
- 參數：
	- {Number} [i]: 當前sheet頁的`index`
	- {Number} [order]: 當前sheet頁`order`

------------
### sheetMoveAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：sheet移動後
- 參數：
	- {Number} [i]: 當前sheet頁的`index`
	- {Number} [oldOrder]: 修改前當前sheet頁`order`
	- {Number} [newOrder]: 修改後當前sheet頁`order`

------------
### sheetDeleteBefore

- 類型：Function
- 默認值：null
- 作用：sheet刪除前
- 參數：
	- {Object} [sheet]: 要被刪除sheet頁的配置

------------
### sheetDeleteAfter

- 類型：Function
- 默認值：null
- 作用：sheet刪除後
- 參數：
	- {Object} [sheet]: 已被刪除sheet頁的配置

------------
### sheetEditNameBefore

- 類型：Function
- 默認值：null
- 作用：sheet修改名稱前
- 參數：
	- {Number} [i]: sheet頁的`index`
	- {String} [name]: 當前sheet頁名稱

------------
### sheetEditNameAfter

- 類型：Function
- 默認值：null
- 作用：sheet修改名稱後
- 參數：
	- {Number} [i]: sheet頁的index
	- {String} [oldName]: 修改前當前sheet頁名稱
	- {String} [newName]: 修改後當前sheet頁名稱

------------
### sheetEditColorBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：sheet修改顏色前
- 參數：
	- {Number} [i]: sheet頁的`index`
	- {String} [color]: 當前sheet頁顏色

------------
### sheetEditColorAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：sheet修改顏色後
- 參數：
	- {Number} [i]: sheet頁的`index`
	- {String} [oldColor]: 修改前當前sheet頁顏色
	- {String} [newColor]: 修改後當前sheet頁顏色

------------
### sheetZoomBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：sheet縮放前
- 參數：
	- {Number} [i]: sheet頁的`index`
	- {String} [zoom]: 當前sheet頁縮放比例

------------
### sheetZoomAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：sheet縮放後
- 參數：
	- {Number} [i]: sheet頁的`index`
	- {String} [oldZoom]: 修改前當前sheet頁縮放比例
	- {String} [newZoom]: 修改後當前sheet頁縮放比例

------------
### sheetActivate

- 類型：Function
- 默認值：null
- 作用：激活工作表前
- 參數：
	- {Number} [i]: sheet頁的`index`
	- {Boolean} [isPivotInitial]: 是否切換到了數據透視表頁
	- {Boolean} [isNewSheet]: 是否新建了sheet頁

------------
### sheetDeactivateBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：工作表從活動狀態轉為非活動狀態前
- 參數：
	- {Number} [i]: sheet頁的`index`

------------
### sheetDeactivateAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：工作表從活動狀態轉為非活動狀態後
- 參數：
	- {Number} [i]: sheet頁的`index`
  
### imageDeleteBefore

- 類型：Function
- 默認值：null
- 作用：圖片刪除前觸發
- 參數：
	- {Object} [imageItem]: 要刪除的圖片配置對象

### imageDeleteAfter

- 類型：Function
- 默認值：null
- 作用：圖片刪除後觸發，如果自定義了圖片上傳，可在此處發請求刪除圖片
- 參數：
	- {Object} [imageItem]: 刪除的圖片配置對象

```js
{
	hook: {
		imageDeleteAfter: function (imageItem) {
			var src = imgItem.src;
			$.post('/rest/file/deletebyurl', {downloadUrl: src});
		}
	}
}
```

------------

## 工作簿

### workbookCreateBefore

- 類型：Function
- 默認值：null
- 作用：表格創建之前觸發。舊的鉤子函數叫做`beforeCreateDom`
- 參數：
	- {Object} [book]: 整個工作簿的配置（options）
    
------------
### workbookCreateAfter

- 類型：Function
- 默認值：null
- 作用：表格創建之後觸發
- 參數：
	- {Object} [book]: 整個工作簿的配置（options）
     
------------
### workbookDestroyBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：表格銷毀之前觸發
- 參數：
	- {Object} [book]: 整個工作簿的配置（options）
    
------------
### workbookDestroyAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：表格銷毀之後觸發
- 參數：
	- {Object} [book]: 整個工作簿的配置（options）
    
------------
### updated

- 類型：Function
- 默認值：null
- 作用：協同編輯中的每次操作後執行的方法，監聽表格內容變化，即客戶端每執行一次表格操作，Luckysheet將這次操作存到歷史記錄中後觸發，撤銷重做時因為也算一次操作，也會觸發此鉤子函數。
- 參數：
	- {Object} [operate]: 本次操作的歷史記錄信息，根據不同的操作，會有不同的歷史記錄，參考源碼 [歷史記錄](https://github.com/mengshukeji/Luckysheet/blob/master/src/controllers/controlHistory.js)
    
------------
### resized
（TODO）
- 類型：Function
- 默認值：null
- 作用：resize執行之後
- 參數：
	- {Object} [size]: 整個工作簿區域的寬高
    
------------
### scroll
- 類型：Function
- 默認值：null
- 作用：監聽表格滾動值
- 參數：
	- {Number} [scrollLeft]: 水平方向滾動值
	- {Number} [scrollTop]: 垂直方向滾動值
	- {Number} [canvasHeight]: 滾動容器的高度
    
------------


## 協作消息

### cooperativeMessage

- 類型：Function
- 默認值：null
- 作用：接受協作消息，二次開發。拓展協作消息指令集
- 參數：
	- {Object} : 收到服務器發送的整個協作消息體對象
  
## 圖片

### imageInsertBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：圖片插入之前
- 參數：
	- {Object} [url]: 圖片地址
    
------------
### imageInsertAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：圖片插入之後
- 參數：
	- {Object} [item]]: 圖片地址、寬高、位置等信息
    
------------
### imageUpdateBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：圖片修改之前，修改的內容包括寬高、位置、裁剪等操作
- 參數：
	- {Object} [item]]: 圖片地址、寬高、位置等信息
    
------------
### imageUpdateAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：圖片修改之後，修改的內容包括寬高、位置、裁剪等操作
- 參數：
	- {Object} [oldItem]]: 修改前圖片地址、寬高、位置等信息
	- {Object} [newItem]]: 修改後圖片地址、寬高、位置等信息
    
------------
### imageDeleteBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：圖片刪除之前
- 參數：
	- {Object} [item]]: 圖片地址、寬高、位置等信息
    
------------
### imageDeleteAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：圖片刪除之後
- 參數：
	- {Object} [item]]: 圖片地址、寬高、位置等信息
    
------------

## 批注

### commentInsertBefore

- 類型：Function
- 默認值：null
- 作用：插入批注之前，`return false` 則不插入批注
- 參數：
	- {Number} [r]:單元格所在行號
	- {Number} [c]:單元格所在列號

------------
### commentInsertAfter

- 類型：Function
- 默認值：null
- 作用：插入批注之後
- 參數：
	- {Number} [r]:單元格所在行號
	- {Number} [c]:單元格所在列號
	- {Object} [cell]: 被插入批注所在的單元格信息，如：`{ r:0,c:2,v:{m:'233',v:'233'}}`，包含批注信息
    
------------
### commentDeleteBefore

- 類型：Function
- 默認值：null
- 作用：刪除批注之前，`return false` 則不刪除批注
- 參數：
	- {Number} [r]:單元格所在行號
	- {Number} [c]:單元格所在列號
	- {Object} [cell]: 要刪除的批注所在的單元格信息，如：`{ r:0,c:2,v:{m:'233',v:'233'}}`，可以看到批注信息

------------
### commentDeleteAfter

- 類型：Function
- 默認值：null
- 作用：刪除批注之後
- 參數：
	- {Number} [r]:單元格所在行號
	- {Number} [c]:單元格所在列號
	- {Object} [cell]: 被刪除批注所在的單元格信息，如：`{ r:0,c:2,v:{m:'233',v:'233'}}`，可以看到批注已被刪除
    
------------
### commentUpdateBefore

- 類型：Function
- 默認值：null
- 作用：修改批注之前，`return false` 則不修改批注
- 參數：
	- {Number} [r]:單元格所在行號
	- {Number} [c]:單元格所在列號
	- {String} [value]: 新的批注內容

------------
### commentUpdateAfter

- 類型：Function
- 默認值：null
- 作用：修改批注之後
- 參數：
	- {Number} [r]:單元格所在行號
	- {Number} [c]:單元格所在列號
	- {Object} [oldCell]: 修改前批注所在的單元格信息，如：`{ r:0,c:2,v:{m:'233',v:'233'}}`
	- {Object} [newCell]: 修改後批注所在的單元格信息，如：`{ r:0,c:2,v:{m:'233',v:'233'}}`
    
------------

## 數據透視表

### pivotTableEditBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：修改數據透視表之前，操作如：拖動字段等
- 參數：
	- {Object} [sheet]: 數據透視表所在sheet頁配置

------------
### pivotTableEditAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：修改數據透視表之後，操作如：拖動字段等
- 參數：
	- {Object} [oldSheet]: 修改前數據透視表所在sheet頁配置
	- {Object} [newSheet]: 修改後數據透視表所在sheet頁配置
    
------------

## 凍結

### frozenCreateBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：設置凍結前
- 參數：
	- {Object} [frozen]: 凍結類型信息

------------
### frozenCreateAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：設置凍結後
- 參數：
	- {Object} [frozen]: 凍結類型信息
    
------------
### frozenCancelBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：取消凍結前
- 參數：
	- {Object} [frozen]: 凍結類型信息

------------
### frozenCancelAfter
（TODO）
- 類型：Function
- 默認值：null
- 作用：取消凍結後
- 參數：
	- {Object} [frozen]: 凍結類型信息
    
------------

## 打印

### printBefore
（TODO）
- 類型：Function
- 默認值：null
- 作用：打印前

------------

## 舊版鉤子函數

### fireMousedown

- 類型：Function
- 默認值：null
- 作用：單元格數據下鉆自定義方法，注意此鉤子函數是掛載在options下：`options.fireMousedown`

------------

## 分頁器

### onTogglePager

- 類型：Function
- 默認值：null
- 作用：點擊分頁按鈕回調函數，返回當前頁碼，具體參數參照[sPage backFun](https://github.com/jvbei/sPage)
- 參數：
	- {Object} [page]: 返回當前分頁對象

------------