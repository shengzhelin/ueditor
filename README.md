Get Started
=====

## ueditor富文本編輯器介紹

UEditor是由百度web前端研發部開發所見即所得富文本web編輯器，具有輕量，可定制，注重用戶體驗等特點，開源基於MIT協議，允許自由使用和修改代碼。

## 入門部署和體驗 ##

### 第一步：下載編輯器 ###

到官網下載ueditor最新版：[[官網地址]](http://ueditor.baidu.com/website/download.html#ueditor "官網下載地址")

### 第二步：創建demo文件 ###
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
	<script id="container" name="content" type="text/plain">這里寫你的初始化內容</script>
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

### 第三步：在瀏覽器打開demo.html ###

如果看到了下面這樣的編輯器，恭喜你，初次部署成功！

![部署成功](http://fex.baidu.com/ueditor/doc/images/demo.png)

### 自定義的參數

編輯器有很多可自定義的參數項，在實例化的時候可以傳入給編輯器：
```javascript
var ue = UE.getEditor('container', {
    autoHeight: false
});
```

配置項也可以通過ueditor.config.js文件修改，具體的配置方法請看[前端配置項說明](http://fex.baidu.com/ueditor/#start-config1.4 前端配置項說明.md)

### 設置和讀取編輯器的內容

通getContent和setContent方法可以設置和讀取編輯器的內容
```javascript
var ue = UE.getContent();
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

## 相關鏈接 ##

ueditor 官網：[http://ueditor.baidu.com](http://ueditor.baidu.com "ueditor 官網")

ueditor API 文檔：[http://ueditor.baidu.com/doc](http://ueditor.baidu.com/doc "ueditor API 文檔")

ueditor github 地址：[http://github.com/fex-team/ueditor](http://github.com/fex-team/ueditor "ueditor github 地址")

## 詳細文檔

ueditor 文檔：[http://fex.baidu.com/ueditor/](http://fex.baidu.com/ueditor/)



## 聯系我們 ##

email：[ueditor@baidu.com](mailto://email:ueditor@baidu.com "發郵件給ueditor開發組")
issue：[github issue](http://github.com/fex-team/ueditor/issues "ueditor 論壇")
