Get Started
=====

> 鑒於目前 ISSUE 較多而維護時間較少，且在進行後續的版本更新，目前暫時關閉 ISSUE，若社區有人跟進，歡迎和我們聯繫。重覆的問題，請參閱常見問題的 [FAQ Wiki](https://github.com/fex-team/ueditor/wiki/FAQ)。

## 重要安全通告：

1. commons-fileupload-1.3.1.jar 存在漏洞可能會導致 ddos，源代碼中已經修改，使用老版本的用戶，強烈推薦升級 commons-fileupload.jar 至最新版本。（2018-04-09）.
2. UEditor 所提供的所有後端代碼都僅為 DEMO 作用，切不可直接使用到生產環境中，目前已知 php 的代碼會存在 ssrf 的安全漏洞。修覆方式：使用最新的 Uploader.class [code](https://github.com/fex-team/ueditor/blob/dev-1.5.0/php/Uploader.class.php) .

## ueditor富文本編輯器介紹

UEditor是由百度web前端研發部開發所見即所得富文本web編輯器，具有輕量，可定制，注重用戶體驗等特點，開源基於MIT協議，允許自由使用和修改代碼。

## 1 入門部署和體驗

### 1.1 下載編輯器

1. `git clone ` 倉庫
2. `npm install` 安裝依賴（如果沒有安裝 grunt , 請先在全局安裝 grunt）
3. 在終端執行 `grunt default`

### 1.2 創建demo文件
解壓下載的包，在解壓後的目錄創建demo.html文件，填入下面的html代碼

```html
<!DOCTYPE HTML>
<html lang="en-US">
<head>
	<meta charset="UTF-8">
	<title>ueditor demo</title>
</head>
<body>
	<!-- 加載編輯器的容器 -->
	<script id="container" name="content" type="text/plain">這裡寫你的初始化內容</script>
	<!-- 配置文件 -->
	<script type="text/javascript" src="ueditor.config.js"></script>
	<!-- 編輯器源碼文件 -->
	<script type="text/javascript" src="ueditor.all.js"></script>
	<!-- 實例化編輯器 -->
	<script type="text/javascript">
	    var ue = UE.getEditor('container');
	</script>
</body>
</html>
```

### 1.3 在瀏覽器打開demo.html

如果看到了下面這樣的編輯器，恭喜你，初次部署成功！

![部署成功](http://fex.baidu.com/ueditor/doc/images/demo.png)

### 1.4 傳入自定義的參數

編輯器有很多可自定義的參數項，在實例化的時候可以傳入給編輯器：
```javascript
var ue = UE.getEditor('container', {
    autoHeight: false
});
```

配置項也可以通過ueditor.config.js文件修改，具體的配置方法請看[前端配置項說明](http://fex.baidu.com/ueditor/#start-config1.4 前端配置項說明.md)

### 1.5 設置和讀取編輯器的內容

通getContent和setContent方法可以設置和讀取編輯器的內容
```javascript
var ue = UE.getEditor();
//對編輯器的操作最好在編輯器ready之後再做
ue.ready(function(){
    //設置編輯器的內容
    ue.setContent('hello');
    //獲取html內容，返回: <p>hello</p>
    var html = ue.getContent();
    //獲取純文本內容，返回: hello
    var txt = ue.getContentTxt();
});
```

ueditor的更多API請看[API 文檔](http://ueditor.baidu.com/doc "ueditor API 文檔")

### 1.6 dev-1.5.0 版本二次開發自定義插件注意事項

dev-1.5.0版對於插件的加載邏輯進行了調整，但官網對應的[二次開發功能文檔](http://fex.baidu.com/ueditor/#dev-developer)未對相應調整做出開發細節說明，現補充如下：

除進行原有配置外，還需在實例化ueditor編輯器時在 toolbars 參數數組中，加入自定義插件的 uiname，並且注意uiname必須小寫，方可正確加載自定義插件。 

## 2 詳細文檔

ueditor 官網：[http://ueditor.baidu.com](http://ueditor.baidu.com "ueditor 官網")

ueditor API 文檔：[http://ueditor.baidu.com/doc](http://ueditor.baidu.com/doc "ueditor API 文檔")

ueditor github 地址：[http://github.com/fex-team/ueditor](http://github.com/fex-team/ueditor "ueditor github 地址")

ueditor 第三方插件貢獻 wiki : [第三方插件貢獻規範](http://ueditor.baidu.com/website/thirdproject.html)

ueditor 貢獻代碼規範（javascript）： [javascript規範](https://github.com/fex-team/styleguide/blob/master/javascript.md)

## 3 第三方貢獻

ueditor for nodejs 參考[https://github.com/netpi/ueditor](https://github.com/netpi/ueditor)

## 4 聯繫我們

email：[ueditor@baidu.com](mailto://email:ueditor@baidu.com "發郵件給ueditor開發組")

issue：[github issue](http://github.com/fex-team/ueditor/issues "ueditor 論壇")
