# 常見問題

本章內容搜集了大家反饋的常見問題，如果官方文檔和此列表都不能解答您的疑問，推薦到[官方論壇](https://github.com/mengshukeji/Luckysheet/discussions)反饋

## luckysheetfile中的data和celldata有什麽區別？

**<span style="font-size:20px;">A</span>**：表格初始化時使用一維數組格式的 [celldata](/zh/guide/sheet.html#celldata)，初始化完成後轉化為二維數組格式的data作為存儲更新使用，celldata不再使用。

如果需要將`data`拿出來作為初始化數據，則需要執行 [transToCellData(data)](/zh/guide/api.html#transtocelldata-data-setting)轉換為celldata數據。
其中`{ r, c, v }`格式的celldata轉換為二維數組使用的是[transToData(celldata)](/zh/guide/api.html#transtodata-celldata-setting)

總結如下：
```js
// data => celldata 二維數組數據 轉化成 {r, c, v}格式 一維數組
luckysheet.transToCellData(data)

// celldata => data 生成表格所需二維數組
luckysheet.transToData(celldata)
```

------------

## 單元格的類型有哪些？

**<span style="font-size:20px;">A</span>**：參考[單元格格式列表](/zh/guide/cell.html),例舉了可用的單元格格式

------------

## 如何在Vue/React項目中使用Luckysheet？

**<span style="font-size:20px;">A</span>**：參考

- Vue案例：[luckysheet-vue](https://github.com/mengshukeji/luckysheet-vue)
- React案例：[luckysheet-react](https://github.com/mengshukeji/luckysheet-react)

------------

## 為什麽初始化後表格里面的公式不會被觸發？

**<span style="font-size:20px;">A</span>**：參考 [表格數據格式](/zh/guide/sheet.html#calcchain) ,設置單元格數據對應的calcChain即可。

------------

## 遠端加載數據是loadUrl還是updateUrl？

**<span style="font-size:20px;">A</span>**：[loadUrl](/zh/guide/config.html#loadurl)。配置了loadUrl，Luckysheet會通過ajax請求整個表格數據，而updateUrl會作為協同編輯實時保存的接口地址。
注意：初始化數據需要配置loadUrl參數，而協同編輯則在配置loadUrl、updateUrl和allowUpdate四個參數才能生效。

------------

## 每個sheet頁的`index`和`order`有什麽區別？

**<span style="font-size:20px;">A</span>**：每個sheet頁都有一個唯一id，就是`index`，可以用數字遞增，也可以使用隨機字符串，而`order`是所有的sheet的排序情況，從0開始，只能為數字`0,1,2...`。

------------

## dist文件夾下為什麽不能直接運行項目？

**<span style="font-size:20px;">A</span>**：需要啟動本地服務器

- [Node搭建本地服務器](https://github.com/JacksonTian/anywhere)
- [Python搭建本地服務器](https://developer.mozilla.org/zh-CN/docs/Learn/Common_questions/set_up_a_local_testing_server)

------------

## excel導入導出怎麽做？

**<span style="font-size:20px;">A</span>**：配合Luckysheet開發的excel導入導出庫-[Luckyexcel](https://github.com/mengshukeji/Luckyexcel)已經實現了excel導入功能，導出功能正在開發當中。現階段excel導出可以參考這2篇博文： 

- [基於LuckySheet在線表格的Excel下載功能開發](https://www.cnblogs.com/recode-hyh/p/13168226.html)
- [使用exceljs導出luckysheet表格](https://blog.csdn.net/csdn_lsy/article/details/107179708)

------------

## 初始化時合並單元格怎麽做？

**<span style="font-size:20px;">A</span>**：參考以下案例
- [Luckysheet如何初始化含合並單元格的數據](https://www.cnblogs.com/DuShuSir/p/13272397.html)

------------

## Luckysheet如何把表格里的數據保存到數據庫？有沒有服務端存儲和協作的解決方案？

**<span style="font-size:20px;">A</span>**：有兩個方案：

- 一是表格操作完成後，使用`luckysheet.getAllSheets()`方法獲取到全部的工作表數據，全部發送到後台存儲。
- 二是開啟協同編輯功能，實時傳輸數據給後端。
具體的操作步驟參考這篇文章：[Luckysheet如何把表格里的數據保存到數據庫](https://www.cnblogs.com/DuShuSir/p/13857874.html)

------------

## 如何監聽單元格hover或者點擊事件？`cellRenderAfter`如何實時監聽變化？

**<span style="font-size:20px;">A</span>**：我們搜集到需要針對單元格事件的二次開發需求，規劃了單元格相關的鉤子函數，參考[單元格鉤子函數](/zh/guide/config.html#cellrenderafter)（顯示的TODO的暫未開放）

------------

## 頂部的工具欄不支持自定義配置？

**<span style="font-size:20px;">A</span>**：
頂部工具欄的自定義配置使用初始[options.showtoolbarconfig](/zh/guide/config.html#showtoolbarconfig)(如果標注TODO表示暫未開發)

------------

## 項目使用了jQuery嗎？

**<span style="font-size:20px;">A</span>**：是的。Luckysheet內部啟動時間比開源的時間早很多，所以用到了jQuery。打包工具會把jQuery集成到打包目錄的`./plugins/js/plugin.js`文件中。

如果您的項目中（比如React/Vue）也自己全局引用了jQuery，且造成了沖突，可以嘗試去掉一個jQuery。

要想在Luckysheet里去除jQuery，需要在源碼根目錄下的`gulpfile.js`文件中找到打包jQuery的地方：[src/plugins/js/jquery.min.js](https://github.com/mengshukeji/Luckysheet/blob/master/gulpfile.js)，刪除jQuery相關的信息即可。

------------

## 如何為單元格對象新增字段？

**<span style="font-size:20px;">A</span>**：首先參考[單元格對象格式](/zh/guide/cell.html)，然後參照源碼批注的部分[src/controllers/postil.js](https://github.com/mengshukeji/Luckysheet/blob/master/src/controllers/postil.js)。批注是一個加在單元格對象上的一個配置。

------------

## 工具欄圖標加載不出來？

**<span style="font-size:20px;">A</span>**：工具欄及其他部分圖標采用了iconfont圖標，加載不出來是因為缺少了iconfont.css的引入，之前舊版官方文檔未寫清楚這一點對大家造成誤導，很抱歉。

詳細的Luckysheet使用教程參考已經更新的[官方文檔](/zh/guide/#使用步驟)

------------

## Luckyexcel打包後不動？

**<span style="font-size:20px;">A</span>**：打包的終端命令行不顯示結束，但是如果`dist`文件夾內已經有了結果文件`luckyexcel.js`，則表明是正常的。

Luckyexcel是excel導入導出庫，項目采用了gulp作為打包工具，舊版打包工具有點問題在命令行顯示這塊有些問題，問題已經修覆。請還出現此問題的小夥伴做如下更新操作：
1. pull最新代碼
2. `npm i`
3. `npm run build`

更多詳細信息關注：[Luckyexcel](https://github.com/mengshukeji/Luckyexcel/)

------------

## 單元格不可編輯如何控制？表格保護怎麽操作？

**<span style="font-size:20px;">A</span>**：單元格不可編輯屬於工作表保護的功能範疇，需要配置在每個sheet頁中`config.authority`，最新的設置參數請參考[工作表保護](/zh/guide/sheet.html#config-authority)。

為了大家便於理解工作表保護的功能使用，下方的視頻演示了如何讓當前整個工作表不可編輯，但是允許某一列單元格可編輯的功能：

<iframe frameborder="0" src="https://v.qq.com/txp/iframe/player.html?vid=g3162sacwn6" allowFullScreen="true"></iframe>

跟著演示操作一下本地的工作表，然後打開瀏覽器控制台，使用`luckysheet.getLuckysheetfile()[0].config.authority`就可以獲取到第一個工作表的工作表保護參數。

------------

## 數據驗證怎麽配置？

**<span style="font-size:20px;">A</span>**：最新文檔已經提供了數據驗證的配置信息，參考[數據驗證配置](/zh/guide/sheet.html#dataVerification)。官方也提供了API方法 [setDataVerification](/zh/guide/api.html#setdataverification-optionitem-setting)，用於動態設置數據驗證功能。

------------

## Luckysheet通過引入CDN有案例嗎？

**<span style="font-size:20px;">A</span>**：Luckysheet支持CDN方式引入，參考：[本地HTML采用cdn加載方式引入Luckysheet的案例](https://www.cnblogs.com/DuShuSir/p/13859103.html)

------------

## 請問一下圖片怎麽限制在單元格里面自適應高度？

**<span style="font-size:20px;">A</span>**：首先需要對圖片設置移動並調整單元格大小，然後有以下幾種情況：

- 如果圖片位置完全在單元格內部時，當拉長單元格的寬度或高度的時候，圖片不會隨著單元格的變大而伸縮變大
- 如果圖片位置完全在單元格內部時，當拉短單元格的寬度或高度，貼到圖片的邊時，圖片會隨著單元格的變小而伸縮變小
- 當這個圖片超過單元格的邊框時，圖片可以跟隨單元格大小變化

根據圖片的第二個特性，可以操作得到圖片位置信息，原理就是將圖片的位置設置成和單元格邊框重疊（源碼中，需要重疊超過2px），以下演示視頻展示了怎麽將圖片限制在單元格里面自適應寬高。

<iframe frameborder="0" src="https://v.qq.com/txp/iframe/player.html?vid=y3163ya0q6c" allowFullScreen="true"></iframe>

------------

## 如何獲取工作表默認的行高列寬？

**<span style="font-size:20px;">A</span>**：有兩種方式可以獲取

- 一是使用`luckysheet.getLuckysheetfile()`獲取到所有工作表配置後，在各個工作表的配置中直接取得默認行高`defaultRowHeight`和默認列寬`defaultColWidth`。
- 二是開放了API可以獲取到工作表默認的行高[getDefaultRowHeight](/zh/guide/api.html#getdefaultrowheight-setting)和列寬[getDefaultColWidth](/zh/guide/api.html#getdefaultcolwidth-setting)

------------

## 如何隱藏工作表下方的添加行按鈕和回到頂部按鈕？

**<span style="font-size:20px;">A</span>**：已開放配置
- 允許添加行 [enableAddRow](/zh/guide/config.html#enableaddrow)
- 允許回到頂部 [enableAddBackTop](/zh/guide/config.html#enableAddBackTop)

------------

## 如何隱藏工作表的行標題和列標題？

**<span style="font-size:20px;">A</span>**：已開放配置
- 行標題區域的寬度 [rowHeaderWidth](/zh/guide/config.html#rowheaderwidth)
- 列標題區域的高度 [columnHeaderHeight](/zh/guide/config.html#columnHeaderHeight)

------------

## 調用什麽方法能設置`config.merge`？

**<span style="font-size:20px;">A</span>**：三個方法
- 界面操作
- 用API：[setRangeMerge](/zh/guide/api.html#setrangemerge-type-setting)
- 手動組裝merge參數

------------

## 為什麽官方公布的新功能沒有效果？

**<span style="font-size:20px;">A</span>**：第一步，檢查下您是否使用了CDN的方式引入，

Luckysheet教程里采用的CDN鏈接是 [jsdelivr](https://www.jsdelivr.com/package/npm/luckysheet) 提供的服務，代碼是從 [npmjs.com](https://www.npmjs.com/) 自動同步過去的，不是從 [Github](https://github.com/mengshukeji/Luckysheet/) 同步過去的。因為我們新提交的代碼，還需要經過一段時間的測試，所以不會立即發布到npm使用，導致了npm的代碼稍滯後於Github。

如果需要嘗試最新代碼，我們強烈建議您從 [Luckysheet Github](https://github.com/mengshukeji/Luckysheet/) 主倉庫拉取代碼。後續我們版本穩定了，會考慮實時發布npm包。

第二步，如果是引用github倉庫打包後的代碼，測試判斷是否有bug，您可以查找問題並嘗試修覆，再[提交PR](https://github.com/mengshukeji/Luckysheet/pulls)，如果修覆不了，請[提交issues](https://github.com/mengshukeji/Luckysheet/issues)。

------------

## `npm run dev`報錯：`Error: Cannot find module 'rollup'`？

**<span style="font-size:20px;">A</span>**：可能是npm包安裝問題，嘗試以下步驟：
1. `npm cache clean --force`
2. `npm i rimraf -g`
3. `rimraf node_modules`
4. 刪除package-lock.json文件
5. `npm i`
6. `npm run dev`

提示：大多數的其他npm安裝問題，也可以嘗試此步驟來解決。

------------

## 怎樣在vue工程里對Luckysheet進行二次開發？

**<span style="font-size:20px;">A</span>**：[luckysheet-vue](https://github.com/mengshukeji/luckysheet-vue) 案例是提供一個應用集成的方案。

如果本地直接開發的話：
1. 把Luckysheet的工程和自己的Vue工程都啟動起來，比如Luckysheet的工程在 `http://localhost:3001`
2. 在Vue工程里面通過 `http://localhost:3001` 引入Luckysheet使用

這樣的話，Luckysheet實時修改後，Vue工程里是可以看到更改的

------------

## 創建圖表時候報錯`Store.createChart`？

**<span style="font-size:20px;">A</span>**：需要引入圖表插件才能使用，工作簿初始化的時候應該配置圖表插件使用，參考

- 插件配置 [plugins](/zh/guide/config.html#配置項)
- 或 官方demo [src/index.html](https://github.com/mengshukeji/Luckysheet/blob/master/src/index.html)

通常，參考demo配置完後就可以和demo一樣正常使用了，但是還是會偶現`chartmix is not defined`，這時需要在谷歌瀏覽器控制台的network里檢查下圖表的依賴是否都加載了，有5項依賴需要關注：`vue / vuex / element-ui / echarts / chartmix.umd.js`。

------------

## 單元格能增加自定義屬性嗎？

**<span style="font-size:20px;">A</span>**：直接賦值到單元格對象上的自定義屬性會被過濾，要想使得自定義屬性生效，需要二開去除過濾屬性的代碼。

------------

## 如何輸入以`'='`開頭的文本？例如`=currentDate('YYYY-MM-DD')`，它默認會去掉函數，函數怎麽禁止？

**<span style="font-size:20px;">A</span>**：前面加一個單引號就行，會強制識別為字符串，和excel表現一致的。比如：`'=currentDate('YYYY-MM-DD')`

------------

## create回調為什麽沒有效果？

**<span style="font-size:20px;">A</span>**：API 方法`luckysheet.create()`這個方法沒有回調，但是Luckysheet提供了鉤子函數用於在指定位置執行回調方法，比如：
- 表格創建之前觸發 [workbookCreateBefore](/zh/guide/config.html#workbookcreatebefore)
- 表格創建之後觸發 [workbookCreateAfter](/zh/guide/config.html#workbookcreateafter)

------------

## create的時候默認選中第一個單元格，怎麽去除？

**<span style="font-size:20px;">A</span>**：選中單元格時默認是高亮，把高亮去除即可，使用API: [setRangeShow](/zh/guide/api.html#setrangeshow-range-setting)

```js
luckysheet.setRangeShow("A2",{show:false})
```

------------

## 右鍵事件綁定在哪？

**<span style="font-size:20px;">A</span>**：在源碼的 [src/controllers/hander.js](https://github.com/mengshukeji/Luckysheet/blob/master/src/controllers/handler.js) 搜索`event.which == "3"`即可找到右鍵事件觸發執行的代碼。

------------

## 如何添加自定義工具欄？

**<span style="font-size:20px;">A</span>**：暫未提供配置，可以參照工具欄打印按鈕的實現來修改源碼：
1. 全局搜索 `luckysheet-icon-print`即可找到打印按鈕的實現，在 [src/controllers/constant.js](https://github.com/mengshukeji/Luckysheet/blob/master/src/controllers/constant.js) 中增加一個類似的模板字符串，需要自定義一個唯一id
2. 修改 [src/controllers/resize.js](https://github.com/mengshukeji/Luckysheet/blob/master/src/controllers/resize.js) ，在toobarConfig對象中新增一條記錄
3. 修改 [src/controllers/menuButton.js](https://github.com/mengshukeji/Luckysheet/blob/master/src/controllers/menuButton.js) ，新增一個事件監聽

------------

## 如何添加自定義公式？

**<span style="font-size:20px;">A</span>**：需要修改兩處源碼：
1. 在 [src/function/functionImplementation.js](https://github.com/mengshukeji/Luckysheet/blob/master/src/function/functionImplementation.js) 文件中的`functionImplementation`對象中增加一個公式，格式參考`SUM`/`AVERAGE`等公式
2. 修改 [src/locale](https://github.com/mengshukeji/Luckysheet/blob/master/src/locale) 文件目錄下所有的語言包，將自己新增的公式說明加到`functionlist`數組中。其中，`t`是函數的類別，`m`是參數的個數，最小參數個數和最大參數個數。

------------

## 有沒有類似loadData接口，我想實現先加載10條記錄，然後再動態加載數據，這些數據都追加到表格中？

**<span style="font-size:20px;">A</span>**：有的。我們`loadSheetUrl`提供了這個功能，初始化`options.enablePage = true`可以開啟。

源碼里搜索`enablePage`可以看到，有個`method.addDataAjax`方法，里面就有一個ajax請求，用來動態加載數據，這些數據會追加到表格中。

這個功能現在在文檔上是隱藏的，是因為這個接口我們做的時候，接口參數是根據我們實際業務匹配的，可能不太通用，我們準備抽象後再放出來給大家用，如果您想自己用可以依據這個改下。

推薦您考慮自己寫接口來加載數據，然後使用`setRangeValue`來在指定位置追加數據，這樣的自定義程度更高。

------------