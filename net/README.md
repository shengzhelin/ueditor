UEditor ASP.NET 後台使用說明
=====

## 背景

UEditor 在 1.4 版本之後進行了一次[前後端統一配置](../_doc/3.1 後端請求規範.md)的整理，.Net 的後台也進行了一次重寫，跟之前的版本差別較大，升級的用戶注意閱讀本文檔。

本文檔介紹 UEditor ASP.NET 後台的部署、配置、源碼說明。


## 1. 部署說明

### 1.1. 安裝並注冊 .NET Framework 4.0

代碼的運行時環境是 .NET Framework 4.0，首先要確認 IIS 已經安裝了 .NET 4.0 的運行時框架。方法是打開「IIS 管理器」，選擇根目錄下的「應用程序池」，在右側查看是否有一個應用程序池的版本是 v4.0，如果存在，則 IIS 已經安裝了所需的運行時環境，此時讀者可以跳過本節。

![檢查 .NET 4.0 安裝情況](../_doc/images/net-publish-1.png)

如果沒有找到對應的應用程序池，需要手動安裝。

Windows 7 和 Windows Server 2008 R2 默認安裝了 .Net Framework 4.0，如果是 Server 03 和老掉牙的 Windows XP，則需要手動安裝 [.NET Framework 4.0](http://www.microsoft.com/zh-cn/download/details.aspx?id=17718)。

安裝完 .NET Framework 4.0 後，還需要向 IIS 注冊應用程序池，注冊的方法是，使用**管理員權限**打開命令提示符（CMD），輸入以下命令：

```shell
C:\Windows\Microsoft.NET\Framework\v4.0.30319\aspnet_regiis -i
```

安裝完畢後，在 IIS 管理器刷新就能看到 4.0 的應用程序池。

### 1.2. 設置 .NET 應用程序

代碼要求以應用程序的形式來運行（可以方便加入庫依賴和組織代碼）。需要把 `net` 目錄轉換為應用程序。

1. 在 IIS 中，展開到 `ueditor/net` 目錄，在目錄上右擊，點擊「轉換為應用程序」。

   ![轉換為應用程序](../_doc/images/net-publish-2.png)

2. 彈出的對話框中，點擊「選擇...」來指定使用的應用程序池。選擇版本為 4.0 的應用程序池，然後點確定。

   ![選擇應用程序池](../_doc/images/net-publish-3.png)

3. 設置連接憑據。點擊「鏈接為...」按鈕，在彈出的對話框中指定一個對目錄具有讀寫權限的用戶（如 administrator），然後點確定。

   ![設置連接憑據](../_doc/images/net-publish-4.png)

   設置完畢後，可以點擊「測試設置...」來測試權限是否正常。

   ![設置連接憑據](../_doc/images/net-publish-5.png)

### 1.3. 運行測試

在瀏覽器中運行 `net/controller.ashx`，如果返回 "`{"state":"action 參數為空或者 action 不被支持。"}`"，則表示應用程序運行成功。

如果你確認上述步驟已經執行，但是依然有問題，請給我們[提 Issue](https://github.com/fex-team/ueditor/issues/new?labels=NET%E5%90%8E%E5%8F%B0)，我們會盡快答覆解決。

## 2. 配置說明

前後端配置統一之後，配置文件由後台讀取，返回給前端。但是部分配置是給後台使用的。

### 2.1. 上傳配置說明

關於上傳的部分，後台需要關心以下模板的配置項。

```json
{
    "{tpl}FieldName": "upfile",
    "{tpl}PathFormat": "upload/{tpl}/{yyyy}{mm}{dd}/{time}{rand:6}",
    "{tpl}UrlPrefix": "/ueditor/net/",
    "{tpl}AllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"],
    "{tpl}MaxSize": 2048000
}
```

"{tpl}FieldName" 表示提交的表單的文件域名稱。

"{tpl}PathFormat" 表示上傳文件保存的路徑和名稱。注意，這里的路徑是相對應用程序的，如果需要修改的話，請自行修改源碼。

"{tpl}UrlPrefix" 表示上傳文件訪問的 URL 前綴。注意，這里應該給出應用程序的 URL 路徑，否則上傳的文件不能正確定位。

> 舉個例子，如果你的 UEditor 的位置在 `http://www.mydomain.com/myapp/ueditor`，對應的本地路徑是 `C:\iis_pub\www\myapp\ueditor`，那麽 .NET 應用程序的位置在 `http://www.mydomain.com/myapp/ueditor/net`，對應的本地路徑是 `C:\iis_pub\www\myapp\ueditor\net`。圖片上傳配置項應該如下：
> 
> { 
>    "imagePathFormat": "upload/image/{yyyy}{mm}{dd}/{time}{rand:6}",
>    "imageUrlPrefix": "/myapp/ueditor/net/",
> }
>
> 上傳的文件會保存在 `C:\iis_pub\www\myapp\ueditor\net\upload\image\{日期}\{文件名}`

"{tpl}AllowFiles" 限制文件上傳的類型，注意要有 "."。

"{tpl}MaxSize" 限制文件上傳的大小。注意這里的限制是代碼上的判斷，應用程序本身還有一個請求報文大小限制。該限制在 web.config 文件中修改，注意要有以下的節：

```xml
<configuration>
  <system.web>
    <httpRuntime requestValidationMode="2.0" maxRequestLength="102400" />
  </system.web>
</configuration>
```

maxRequestLength 就是請求報文大小限制，該大小應該要比設置的所有上傳大小都大，否則應用程序執行之前，請求會被被拒絕。

## 3. 源碼說明

可以看到 net 目錄內的源碼結構是這樣的：

```
net
    App_Code
        Config.cs
        Handler.cs
        PathFormatter.cs
        *Handler.cs
    Bin
        Newtonsoft.Json.dll
    config.json
    controller.ashx
    net.sln
    README.md
    Web.config
```

App_Code 上的文件是應用程序的源碼。

- Config.cs 負責讀取配置文件
- Handler.cs 是請求處理器的基類，提供了一些基本對象的訪問以及輸出控制。如果需要增加處理器，應該從該基類繼承
- PathFormatter.cs 解析 PathFormat，把信息填充為運行時信息。
- *Handler.cs 是各種處理器，處理各種 UEditor 需要的請求。

Bin 里面的是應用程序的依賴庫，當前依賴 Newtonsoft 的 Json 庫。Bin 目錄和 App_Code 目錄受應用程序保護，不用擔心被用戶訪問到。

config.json 是 UEditor 後端的配置文件，上一節已經介紹了比較重要的配置項。

controller.ashx 是 UEditor 請求的入口，它把不同的 action 分發到不同的 Handler 來處理。

net.sln 是項目的解決方案文件，安裝 Visual Studio 2013 或以上的機器可以打開進行項目的改造。

README.md 是本說明文件。

Web.config 是應用程序的配置文件。
