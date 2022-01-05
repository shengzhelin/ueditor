<div align="center">

![logo](/docs/.vuepress/public/img/logo_text.png)

</div>

# Luckysheet 3.x 目前正在使用Typescript重構

簡體中文 | [English](./README.md)

## 介紹
🚀Luckysheet ，一款純前端類似excel的在線表格，功能強大、配置簡單、完全開源。

## 相關鏈接
 | 源碼   | 文檔 | Demo | 插件Demo | 論壇 |
 | ------ | -------- | ------ | ------ | ------ |
 | [Github](https://github.com/mengshukeji/Luckysheet)| [在線文檔](https://mengshukeji.github.io/LuckysheetDocs/zh/) | [在線Demo](https://mengshukeji.github.io/LuckysheetDemo) / [協同編輯Demo](http://luckysheet.lashuju.com/demo/) | [導入Excel Demo](https://mengshukeji.github.io/LuckyexcelDemo/) | [中文論壇](https://support.qq.com/product/288322) |
 | [Gitee鏡像](https://gitee.com/mengshukeji/Luckysheet)| [Gitee在線文檔](https://mengshukeji.gitee.io/LuckysheetDocs/zh/) | [Gitee在線Demo](https://mengshukeji.gitee.io/luckysheetdemo/) | [Gitee導入Excel Demo](https://mengshukeji.gitee.io/luckyexceldemo/) | [Google Group](https://groups.google.com/g/luckysheet) |

![演示](/docs/.vuepress/public/img/LuckysheetDemo.gif)

## 插件
- [Luckyexcel](https://gitee.com/mengshukeji/Luckyexcel)：excel導入導出庫 
- [chartMix](https://gitee.com/mengshukeji/chartMix)：圖表插件

## 生態

| 工程 | 描述 |
|---------|-------------|
| [Luckysheet Vue]          | 在vue cli 3項目中使用Luckysheet和Luckyexcel|
| [Luckysheet React]          | 在React項目中使用Luckysheet |
| [Luckyexcel Node]          | 在koa2中使用Luckyexcel |
| [Luckysheet Server]          | Java後台Luckysheet Server |
| [Luckysheet Server Starter]          | LuckysheetServer 一鍵docker部署 |

[Luckysheet Vue]: https://gitee.com/mengshukeji/luckysheet-vue
[Luckysheet React]: https://gitee.com/mengshukeji/luckysheet-react
[Luckyexcel Node]: https://gitee.com/mengshukeji/Luckyexcel-node
[Luckysheet Server]: https://gitee.com/mengshukeji/LuckysheetServer
[Luckysheet Server Starter]: https://gitee.com/mengshukeji/LuckysheetServerStarter

## 特性

- **格式設置**：樣式，條件格式，文本對齊及旋轉，文本截斷、溢出、自動換行，多種數據類型，單元格內多樣式
- **單元格**：拖拽，下拉填充，多選區，查找和替換，定位，合併單元格，數據驗證
- **行和列操作**：隱藏、插入、刪除行或列，凍結，文本分列
- **操作體驗**：撤銷、重做，覆制、粘貼、剪切，快捷鍵，格式刷，選區拖拽
- **公式和函數**：內置公式，遠程公式，自定義公式
- **表格操作**：篩選，排序
- **增強功能**：數據透視表，圖表，評論，共享編輯，插入圖片，矩陣計算，截圖，覆制到其他格式，EXCEL導入及導出等

更詳細的功能列表，請查閱：[特性](https://mengshukeji.github.io/LuckysheetDocs/zh/guide/#%E7%89%B9%E6%80%A7)

## 📖 學習資源

- 新用戶優先閱讀：[用戶指引](https://github.com/mengshukeji/Luckysheet/wiki/User-Guide)
- 社區提供的教程、學習資料及配套解決方案請查閱：[教程與資源](https://mengshukeji.github.io/LuckysheetDocs/zh/guide/resource.html)

## 📜 更新日誌

每個版本的詳細更改都記錄在 [CHANGELOG.md](CHANGELOG.md) 中。

## ❗️ 問題反饋

在反饋問題之前，請確保仔細閱讀 [如何提交問題](https://mengshukeji.github.io/LuckysheetDocs/zh/guide/contribute.html#如何提交問題)。 不符合準則的問題可能會立即被移除。

## ✅ 開發計劃

通過 [GitHub Projects](https://github.com/mengshukeji/Luckysheet/projects/1) 管理

## 💪 貢獻

在提交PR之前，請確保仔細閱讀 [貢獻指南](https://mengshukeji.github.io/LuckysheetDocs/zh/guide/contribute.html)。

## 用法

### 第一步
通過CDN引入依賴

```
<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/css/pluginsCss.css' />
<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/plugins.css' />
<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css' />
<link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/assets/iconfont/iconfont.css' />
<script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/js/plugin.js"></script>
<script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js"></script>
```
### 第二步
指定一個表格容器
```
<div id="luckysheet" style="margin:0px;padding:0px;position:absolute;width:100%;height:100%;left: 0px;top: 0px;"></div>
```
### 第三步
創建一個表格
```
<script>
    $(function () {
        //配置項
        var options = {
            container: 'luckysheet' //luckysheet為容器id
        }
        luckysheet.create(options)
    })
</script>
```
## 開發

### 環境
[Node.js](https://nodejs.org/en/) Version >= 6 

### 安裝
```
npm install
npm install gulp -g
```
### 開發
```
npm run dev
```
### 打包
```
npm run build
```

## 合作項目

- [魯班h5](https://github.com/ly525/luban-h5)
- [h5-Dooring](https://github.com/MrXujiang/h5-Dooring)
- [Furion](https://gitee.com/monksoul/Furion)

## 交流

- [Github 論壇](https://github.com/mengshukeji/Luckysheet/discussions)
- 以下掃碼加入官方微信群或者QQ群

| 官方微信群 |  群滿則加小編微信，備註:加群  | QQ群 |
|---|---|---|
| <img src="https://minio.cnbabylon.com/public/luckysheet/luckysheet_wechat_group.png" width="200" /> | <img src="https://minio.cnbabylon.com/public/luckysheet/dushusir_wechat.jpg" width="200" />| <img src="https://minio.cnbabylon.com/public/luckysheet/luckysheet_qq_group.jpg" width="200" /> |


[英文社群](./README.md)

## 讚助

Luckysheet是MIT許可的開源項目，其持續穩定的開發離不開這些優秀的 [**支持者**](https://mengshukeji.github.io/LuckysheetDocs/zh/about/sponsor.html#%E8%B5%9E%E5%8A%A9%E8%80%85%E5%88%97%E8%A1%A8)。 如果您想加入他們，請考慮：

- [成為Patreon的支持者或讚助商](https://www.patreon.com/mengshukeji)
- [成為Open Collective的支持者或讚助商](https://opencollective.com/luckysheet)
- 通過PayPal，微信或支付寶一次性捐贈

| PayPal |  微信  | 支付寶 |
|---|---|---|
| [Paypal Me](https://www.paypal.me/wbfsa) | <img src="https://minio.cnbabylon.com/public/luckysheet/wechat.jpg" width="200" />| <img src="https://minio.cnbabylon.com/public/luckysheet/alipay.jpg" width="200" /> |

### Patreon和OpenCollective有什麽區別？

通過Patreon捐贈的資金將直接用於支持menshshukeji在Luckysheet上的工作。 通過OpenCollective捐贈的資金由透明費用管理，將用於補償核心團隊成員的工作和費用或讚助社區活動。 通過在任一平台上捐款，您的姓名/徽標將得到適當的認可和曝光。

## 讚助者列表

（按時間順序排列）
- *勇 ¥ 30
- 虛我 ¥ 200
- 甜黨 ¥ 50
- Alphabet(Google)-gcf ¥ 1
- **平 ¥ 100
- **東 ¥ 10
- debugger ¥ 20
- 煩了煩 ¥ 10
- 文頂頂 ¥ 200
- yangxshn ¥ 10
- 愛樂 ¥ 100
- 小李飛刀刀 ¥ 66
- 張銘 ¥ 200
- 曹治軍 ¥ 1
- *特 ¥ 10
- **權 ¥ 9.9
- **sdmq ¥ 20
- *旭 ¥ 10
- Quentin ¥ 20
- 周宇凡 ¥ 100
- *超 ¥ 10
- 維寧 ¥ 100
- hyy ¥ 20
- 雨亭寒江月 ¥ 50
- **功 ¥ 10
- **光 ¥ 20
- terrywan ¥ 100
- 王曉洪 ¥ 10
- Sun ¥ 10
- 憂繡 ¥ 100
- Jasonx ¥ 10
- 國勇 ¥ 66.6
- 郎志 ¥ 100
- 匿名 ¥ 1
- ni ¥ 100
- 蘇 ¥ 50
- Mads_chan ¥ 1
- LK ¥ 100
- 智連方舟 李汪石 ¥ 168
- **發 ¥ 260
- *超 ¥ 10
- *勇 ¥ 10
- *騰 ¥ 15
- 名字好難起 ¥ 20
- 大山 ¥ 1
- waiting ¥ 1000
- **宇 ¥ 10.00
- 劉小帥的哥哥 ¥ 20.00
- 寧靜致遠 ¥ 10.00
- Eleven ¥ 1.00

## 貢獻者和感謝

### 核心團隊活躍成員
- [@wbfsa](https://github.com/wbfsa)
- [@eiji-th](https://github.com/eiji-th)
- [@fly-95](https://github.com/fly-95)
- [@tonytonychopper123](https://github.com/tonytonychopper123)
- [@Dushusir](https://github.com/Dushusir)
- [@iamxuchen800117](https://github.com/iamxuchen800117)
- [@wpxp123456](https://github.com/wpxp123456)
- [@c19c19i](https://weibo.com/u/3884623955)
- [@zhangchen915](https://github.com/zhangchen915)
- [@jerry-f](https://github.com/jerry-f)
- [@flowerField](https://github.com/flowerField)

### 社區夥伴
- [@yiwasheng](https://github.com/yiwasheng)
- [@danielcai1987](https://github.com/danielcai1987)
- [@qq6690876](https://github.com/qq6690876)
- [@javahuang](https://github.com/javahuang)
- [@TimerGang](https://github.com/TimerGang)
- [@gsw945](https://github.com/gsw945)
- [@swen-xiong](https://github.com/swen-xiong)
- [@lzmch](https://github.com/lzmch)
- [@kdevilpf](https://github.com/kdevilpf)
- [@WJWM0316](https://github.com/WJWM0316)

## 版權訊息
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present, mengshukeji
