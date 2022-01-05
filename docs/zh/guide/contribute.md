
# 貢獻指南  

  歡迎！我們很高興您能來到這里，並非常期待您能有興趣參與 Luckysheet 貢獻。當然，在您參與 Luckysheet 貢獻之前，請確保通讀以下全文：

## 我們的行為準則

1. 我們保證尊重所有參與貢獻的人，不限於提出問題、文檔和代碼貢獻、解決bug以及其它貢獻的人；

2. 我們有義務遵守當地法律法規，所有的附帶法律風險的行為我們都是拒絕的；
3. 我們反對任何參與者存在貶損評論、人身攻擊、騷擾或侮辱他人以及其他非專業行為；
4. 我們有權並有責任刪除或編輯與此行為準則不符的內容，不限於代碼、Issues、wiki、文檔以及其它。不遵守行為準則的參與者可能會被移除團隊；
5. 我們接受任何人的監督，任何人可通過問題反饋，向我們報告發現的與此行為準則不符的事實存在。

## 如何參與貢獻？

* 貢獻文檔：瀏覽文檔可以加深您對 Luckysheet 的了解，一旦發現文檔寫得不清晰或邏輯混亂的地方，可以訂正、修改、補充，您可以通過 [中文論壇](https://support.qq.com/products/288322)或者 [谷歌論壇](https://groups.google.com/g/luckysheet)給予反饋
* 貢獻代碼：歡迎大家為 Luckysheet 社區貢獻代碼，歡迎您認領Open狀態的 [Issues](https://github.com/mengshukeji/Luckysheet/issues) 和未完成的特性，提交PR，成為貢獻者之一如果您在使用過程中發現有些功能無法滿足您的需求或出現問題，請在Issues中記錄
* 參與Issue討論：您可以在任一 [Issues](https://github.com/mengshukeji/Luckysheet/issues) 下發表您的建議
* Review代碼：您可以在 [Github](https://github.com/mengshukeji/Luckysheet)上看到所有貢獻者提交的PR，您可以Review他們的代碼並發表您的建議


## 如何提交 Issues

在您提交特性/改進前，應該注意以下幾點：

* 請先確認該特性/改進是否被其他人已經提交
* 一個通俗易懂的標題來闡述你提交的Bug/提交特性/改進
* 如果是Bug則詳細描述該bug產生的原因，如果能夠覆現，請盡量提供完整的重現步驟
* 如果是特性，那麽該特性應該有廣泛的適用性，適用於大部分用戶，最好能夠提供詳盡的設計文檔
* 如果是改進，盡可能描述清楚此改進所帶來的益處

具體步驟：

* 創建 [Issues](https://github.com/mengshukeji/Luckysheet/issues) ，描述清楚問題
* 如果你要解決該issue則將issue assign到自己名下，如果你僅僅是提交Bug/特性/改進，並沒有時間去貢獻代碼，則assignne設置為空
* 如果是比較大的特性/改進，盡量先輸出設計文檔，走 [Luckysheet RFC](https://github.com/mengshukeji/Luckysheet-rfcs) 流程，供其他人review

## 如何認領 Issues

在 Luckysheet 的 [Issues](https://github.com/mengshukeji/Luckysheet/issues) 列表中，有很多由其他人創建的issue並未被修覆，如果你感興趣的話，可以認領這些issue。認領步驟如下：

* 在該issue下留言，表達想認領該任務的想法，另注明 **@I can solve it** 即可
* 如果提交者沒有意見，則將該issue assign到自己名下並及時更新進度
* 如果是比較大的特性，盡量先輸出設計文檔，走 [Luckysheet RFC](https://github.com/mengshukeji/Luckysheet-rfcs) 流程，供其他人review
* 開發代碼並提交代碼至github


## 如何提交代碼

1. fork 到自己的倉庫

進入  [Luckysheet](https://github.com/mengshukeji/Luckysheet)  的Github頁面 ，點擊右上角按鈕 Fork 進行 Fork。

2. git clone 到本地

```shell
git clone https://github.com/<your_github_name>/Luckysheet.git
```

3. 上遊建立連接

```shell

cd Luckysheet
git remote add upstream https://github.com/mengshukeji/Luckysheet.git
```
4. 創建開發分支

```shell
git checkout -b dev
```

5. 修改提交代碼

```shell
git add . 
npm run commit
git push origin dev
```

6. 同步代碼，將最新代碼同步到本地

```shell
git fetch upstream 
git rebase upstream/master
```

7. 如果有沖突（沒有可以忽略）

```shell
git status # 查看沖突文件，並修改沖突
git add .
git rebase --continue
```
提交git rebase --continue命令的時候，如果彈出vim提示編輯commit信息，則可以添加你的修改，然後保存退出
> vim命令請參考閱讀[vim](https://www.runoob.com/linux/linux-vim.html)

8. 提交分支代碼

```shell
git push origin dev
```

如果提示需要先pull 可以先拉取在提交
```shell
git pull origin dev
git push origin dev
```
若彈出vim提示編輯commit信息，可以直接通過vim命令退出
> vim命令請參考閱讀[vim](https://www.runoob.com/linux/linux-vim.html)

9. 提交pr
去自己github倉庫對應fork的項目，切換到剛剛創建修改的分支，點擊new pull request，並添加上對應的描述，最後點擊Create pull request進行提交
    
## 代碼規範

> 一般性的代碼規範示例

* 保持塊深度最小。盡可能避免嵌套If條件
```js
// CORRECT
if (!comparison) return

if (variable) {
  for (const item of items) {}
} else if (variable2) {
  // Do something here
}

// INCORRECT
if (comparison) {
  if (variable) {
    for (const item in items) {}
  } else if (variable2) {
    // Do something here
  }
} else {
  return
}
```

* 不要使用操作數進行鏈比較
```js
// CORRECT

if (cb) cb()
if (!cb || (cb === fn)) cb()

// INCORRECT

cb && cb()
(!cb || (cb === fn)) && cb()
```

* 所有變量都應該按字母順序在塊的開頭聲明
```js
// CORRECT
function foo () {
  const foo = 'bar'
  const bar = 'foo'

        if (conditional) {}

  ...

  return foo
}

// INCORRECT

function foo () {
  const foo = 'bar'

        if (conditional) {}

  const bar = 'foo'

  ...

  return foo
}
```

* 盡快返回
```js
// CORRECT
if (condition) return 'foo'
if (condition2) return 'bar'
// Return must have a blank line above
return 'fizz'

// INCORRECT
const variable = ''

if (condition) {
  variable = 'foo'
} else if (condition2) {
  variable = 'bar'
} else {
  variable = 'fizz'
}

return variable
```

## 如何貢獻文檔

## 如何成為Luckysheet Committer

任何人只要對 Luckysheet 項目做了貢獻，那您就是官方承認的 Luckysheet 項目的Contributor了，從Contributor成長為Committer並沒有一個確切的標準， 也沒有任何預期的時間表，但是Committer的候選人一般都是長期活躍的貢獻者，成為Committer並沒有要求必須有巨大的架構改進貢獻， 或者多少行的代碼貢獻，貢獻代碼、貢獻文檔、參與郵件列表的討論、幫助回答問題等等都提升自己影響力的方式。

潛在貢獻清單（無特定順序）：

* 提交自己發現的Bug、特性、改進到issue
* 更新官方文檔使項目的文檔是最近的、撰寫 Luckysheet 的最佳實踐、特性剖析的各種對用戶有用的文檔
* 執行測試並報告測試結果，性能測試與其他MQ的性能對比測試等
* 審查(Review)其他人的工作（包括代碼和非代碼）並發表你自己的建議
* 指導新加入的貢獻者，熟悉社區流程
* 發表關於 Luckysheet 的博客
* 有利於 Luckysheet 社區發展的任何貢獻
* ......
