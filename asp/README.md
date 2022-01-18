# UEditor ASP 支持說明

應廣大用戶要求，UEditor 團隊在原本支持的 PHP、Java 和 .Net 的後台的基礎上，推出了 ASP 後台的支持。

## 支持版本 ##
支持 UEditor 1.2.6+ 的版本

## 支持功能 ##
支持所有其他後台已支持的功能，包括：

1. 圖片上傳
2. 遠程圖片轉存
3. 圖片管理
4. 塗鴉上傳（包括背景）
5. Word 圖片轉存
6. 截圖上傳
7. 文件上傳

## 部署指南 ##
Classic ASP 一般在 IIS 上運行。其它 ASP 服務器不介紹部署方式，請自行研究。

### 配置 ###

對於 v1.4.0 之前的版本，需要修改 `ueditor.config.js`。最簡單的方法，就是把文件中的 php 都替換成 asp。要修改的配置包括：

```javascript
{
     imageUrl:URL+"asp/imageUp.asp"
    ,imagePath:URL + "asp/"
    ,scrawlUrl:URL+"asp/scrawlUp.asp"
    ,scrawlPath:URL+"asp/"
    ,fileUrl:URL+"asp/fileUp.asp"
    ,filePath:URL + "asp/"
    ,catcherUrl:URL +"asp/getRemoteImage.asp"
    ,catcherPath:URL + "asp/"
    ,imageManagerUrl:URL + "asp/imageManager.asp"
    ,imageManagerPath:URL + "asp/"
    ,snapscreenServerUrl: URL +"asp/imageUp.asp"
    ,snapscreenPath: URL + "asp/"
    ,wordImageUrl:URL + "asp/imageUp.asp"
    ,wordImagePath:URL + "asp/"
    ,getMovieUrl:URL+"asp/getMovie.asp"
}
```

UEditor v1.4.0 後進行了後端的統一配置，後端相關的配置文件是 `config.json`，在具體的後台目錄下。需要注意以下兩個類型的配置：


```javascript
{
    "{tpl}UrlPrefix": "/ueditor/asp/",
    "{tpl}PathFormat": "upload/{tpl}/{yyyy}{mm}{dd}/{time}{rand:6}"
}
```

`{tpl}PathFormat` 是資源（圖片、塗鴉、文件等）保存的位置以及文件名格式，這個路徑在 ASP 中是相對運行目錄的。

`{tpl}UrlPrefix` 是資源定位的基本路徑，在 ASP 後台中一般設置成 ASP 的目錄。

比如，IIS 中運行的 UEditor ASP 的目錄為 C:\iis_pub\wwwroot\mysite\ueditor\asp，而網站的訪問地址為 http://localhost/mysite/，那麽你可以這樣修改這兩類配置項：

```javascript
{
    "{tpl}UrlPrefix": "/mysite/ueditor/asp/",
    "{tpl}PathFormat": "upload/{tpl}/{yyyy}{mm}{dd}/{time}{rand:6}"
}
```


### 在 IIS 6.X 中部署
IIS 的安裝在這里不介紹，請自行查閱相關資料。

1. 啟用 ASP 拓展
	* 打開 IIS 管理器
	* 展開本地計算機
	* 選中 Web 服務拓展
	* 允許 Active Server Pages 拓展

2. 配置網站腳本執行權限（如果使用虛擬路徑，請跳過本步驟）
	* 在網站上右擊，點屬性
	* 切換到主目錄選項卡，勾選*讀取*、*寫入*兩個權限，並且*執行權限*選擇*純腳本*
	* 點確定

3. 使用虛擬路徑
	* 在網站上右擊，點*新建* - *虛擬路徑*
	* 按照向導填寫名稱和路徑
	* 勾選*讀取*、*執行腳本*和*寫入*三個權限
	* 完成虛擬目錄的創建

4. 配置腳本執行身份
	* 在網站或虛擬路徑上右擊，點屬性
	* 選擇*目錄安全性*選項卡
	* 在*身份驗證和訪問控制*中點擊*編輯*
	* 勾選*啟用匿名訪問*，點擊用戶名後面的*瀏覽*
	* 輸入*administrator*點確定
	* 輸入*administrator*賬號的密碼
	* 點擊確定，再確認一次密碼

5. 設置最大 HTTP 請求大小限制
	* 找到位於 C:\Windows\System32\Inetsrv 中的 metabase.XML，打開，查找ASPMaxRequestEntityAllowed，修改為需要的值（如10240000 即 10M）
	> ASP 文件中也有上傳文件大小的限制，不過先驗證的限制是 IIS 中設置的，所以如果 IIS 中設置最大 256K，那麽就算 ASP 中設置了最大 10M，那麽超過 256K 的文件也無法上傳，而且 ASP 沒法給出錯誤信息。

### 在 IIS 7.X 中部署
IIS7 默認不安裝 ASP，需要手動添加進去。添加方法請讀者自行查閱。

1. 配置腳本執行身份
	* 選中網站或者應用程序
	* 雙擊 IIS 中的*身份驗證*
	* 雙擊匿名身份驗證
	* 填寫*administrator*的用戶名和密碼，確定

2. 設置最大 HTTP 請求大小限制
    * 打開 IIS 控制台
    * 雙擊 ASP，展開*限制屬性*，修改*醉倒請求實體主體限制*為需要的值（如10240000 即 10M）
    > ASP 文件中也有上傳文件大小的限制，不過先驗證的限制是 IIS 中設置的，所以如果 IIS 中設置最大 256K，那麽就算 ASP 中設置了最大 10M，那麽超過 256K 的文件也無法上傳，而且 ASP 沒法給出錯誤信息。
