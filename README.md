<p align="center">
  <img src="https://www.fdevops.com/wp-content/uploads/2020/09/1599039924-ferry_log.png">
</p>


<p align="center">
  <a href="https://github.com/lanyulei/ferry">
    <img src="https://www.fdevops.com/wp-content/uploads/2020/07/1595067271-badge.png">
  </a>
  <a href="https://github.com/lanyulei/ferry">
    <img src="https://www.fdevops.com/wp-content/uploads/2020/07/1595067272-apistatus.png" alt="license">
  </a>
    <a href="https://github.com/lanyulei/ferry">
    <img src="https://www.fdevops.com/wp-content/uploads/2020/07/1595067269-donate.png" alt="donate">
  </a>
</p>

## 基於Gin + Vue + Element UI前後端分離的工單系統

**流程中心**

通過靈活的配置流程、模版等數據，非常快速方便的生成工單流程，通過對流程進行任務綁定，實現流程中的鉤子操作，目前支持綁定郵件來通知處理，當然為兼容更多的通知方式，也可以自己寫任務腳本來進行任務通知，可根據自己的需求定制。

兼容了多種處理情況，包括串行處理、並行處理以及根據條件判斷進行節點跳轉。

可通過變量設置處理人，例如：直接負責人、部門負責人、HRBP等變量數據。

**系統管理**

基於casbin的RBAC權限控制，借鑒了go-admin項目的前端權限管理，可以在頁面對API、菜單、頁面按鈕等操作，進行靈活且簡單的配置。

演示demo: [http://fdevops.com:8001/#/dashboard](http://fdevops.com:8001/#/dashboard)

```
賬號：admin
密碼：123456

演示demo登陸需要取消ldap驗證，就是登陸頁面取消ldap的打勾。
```

文檔: [https://www.fdevops.com/docs/ferry](https://www.fdevops.com/docs/ferry-tutorial-document/introduction)

視頻教程（由群內好友<穩定>提供，非常感謝。）：

* ferry工單系統需要的軟件準備 https://www.bilibili.com/video/BV1sA411s7jE
* ferry源代碼下載後第一次運行 https://www.bilibili.com/video/BV1oy4y1v7LR

官網：[http://ferry.fdevops.com](http://ferry.fdevops.com)

```
需注意，因有人惡意刪除演示數據，將可刪除的數據全都刪除了，因此演示的Demo上已經將刪除操作的隱藏了。

但是直接在Github或者Gitee下載下來的代碼是完整的，請放心。

如果總是出現此類刪除數據，關閉演示用戶的情況的話，可能考慮不在維護demo，僅放置一些項目截圖。

請大家一起監督。
```

## 功能介紹

<!-- wp:paragraph -->
<p>下面對本系統的功能做一個簡單介紹。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>工單系統相關功能：</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>工單提交申請</li><li>工單統計</li><li>多維度工單列表，包括（我創建的、我相關的、我待辦的、所有工單）</li><li>自定義流程</li><li>自定義模版</li><li>任務鉤子</li><li>任務管理</li><li>催辦</li><li>轉交</li><li>手動結單</li><li>加簽</li><li>多維度處理人，包括（個人，變量(創建者、創建者負責人)）</li><li>排他網關，即根據條件判斷進行工單跳轉</li><li>並行網關，即多個節點同時進行審批處理</li><li>通知提醒（目前僅支持郵件）</li><li>流程分類管理</li></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>權限管理相關功能，使用casbin實現接口權限控制：</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>用戶、角色、崗位的增刪查改，批量刪除，多條件搜索</li><li>角色、崗位數據導出Excel</li><li>重置用戶密碼</li><li>維護個人信息，上傳管理頭像，修改當前賬戶密碼</li><li>部門的增刪查改</li><li>菜單目錄、跳轉、按鈕及API接口的增刪查改</li><li>登陸日志管理</li><li>左菜單權限控制</li><li>頁面按鈕權限控制</li><li>API接口權限控制</li></ul>
<!-- /wp:list -->

快速安裝部署:  
```
bash build.sh install
```

啟動服務： 
```
bash build.sh start
```

## 交流

加群條件是需給項目一個star，不需要您費多大的功夫與力氣，一個小小的star是作者能維護下去的動力。

如果您只是使用本項目的話，您可以在群內提出您使用中需要改進的地方，我會盡快修改。

如果您是想基於此項目二次開發的話，您可以在群里提出您在開發過程中的任何疑問，我會盡快答覆並講解。

群里只要不說罵人、侮辱人之類人身攻擊的話，您就可以暢所欲言，有bug我及時修改，使用中有不懂的，我會及時回覆，感謝。

<p>
  <img width="300" src="https://www.fdevops.com/wp-content/uploads/2021/12/1640275868-2021122316110810.png">
</p>

QQ群 3：767524537

[蘭玉磊的技術博客](https://www.fdevops.com/)

###個人微信，添加好友請描述地區、公司及名字，例如：北京-國美-xxx。

微信號：fdevops

<p>
  <img width="300" src="https://www.fdevops.com/wp-content/uploads/2021/03/1616727212-WechatIMG3.jpeg">
</p>

## 特別感謝
[go-amdin # 不錯的後台開發框架](https://github.com/go-admin-team/go-admin)

[vue-element-admin # 不錯的前端模版框架](https://github.com/PanJiaChen/vue-element-admin)

[vue-form-making # 表單設計器，開源版本比較簡單，如果有能力的話可以自己進行二次開發 ](https://github.com/GavinZhuLei/vue-form-making.git)

[wfd-vue # 流程設計器](https://github.com/guozhaolong/wfd-vue)

[machinery # 任務隊列](https://github.com/RichardKnop/machinery.git)

等等...

## 打賞

> 如果您覺得這個項目幫助到了您，您可以請作者喝一杯咖啡表示鼓勵:

[打賞名人榜](https://www.fdevops.com/docs/ferry-tutorial-document/reward-celebrity-list)

<img class="no-margin" src="https://www.fdevops.com/wp-content/uploads/2020/07/1595075890-81595075871_.pic_hd.png"  height="200px" >

## 鳴謝

特別感謝 [JetBrains](https://www.jetbrains.com/?from=ferry) 為本開源項目提供免費的 [IntelliJ GoLand](https://www.jetbrains.com/go/?from=ferry) 授權

<p>
 <a href="https://www.jetbrains.com/?from=ferry">
   <img height="200" src="https://www.fdevops.com/wp-content/uploads/2020/09/1599213857-jetbrains-variant-4.png">
 </a>
</p>

## License

開源不易，請尊重作者的付出，感謝。

在此處聲明，本系統目前不建議商業產品使用，因本系統使用的`流程設計器`未設置開源協議，`表單設計器`是LGPL v3的協議。

因此避免糾紛，不建議商業產品使用，若執意使用，請聯系原作者獲得授權。

再次聲明，若是未聯系作者直接將本系統使用於商業產品，出現的商業糾紛，本系統概不承擔，感謝。

[LGPL-3.0](https://github.com/lanyulei/ferry/blob/master/LICENSE)

Copyright (c) 2021 lanyulei
