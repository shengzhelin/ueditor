[English](./README.md) | 簡體中文

# ZbxTable

ZbxTable 是使用 Go 語言開發的一個 Zabbix 報表系統。

## 主要功能：

- 導出監控指標特定時間段內的詳情數據與趨勢數據到 xlsx
- 導出特定時間段內 Zabbix 的告警消息到 xlsx
- 對特定時間段內的告警消息進行分析，告警 Top10 等
- 按照主機組導出巡檢報告
- 對 Zabbix 圖形按照數類型進行顯示和查看並支持導出到 pdf
- 主機未恢覆告警顯示和查詢

## 系統架構

![1](https://img.cactifans.com/wp-content/uploads/2020/07/zbxtable.png)

## 組件介紹

ZbxTable: 使用 beego 框架編寫的後端程序

ZbxTable-Web: 使用 React 編寫的前端

MS-Agent: 安裝在 Zabbix Server 上, 用於接收 Zabbix Server 產生的告警，並發送到 ZbxTable 平台

## 在線體驗

直接點擊登入即可

[https://zbx.cactifans.com](https://zbx.cactifans.com)

## 兼容性

| zabbix 版本 | 兼容性            |
| :---------- | :---------------- |
| 5.4.x          | ✅            |
| 5.2.x          | ✅            |
| 5.0.x LTS      | ✅            |
| 4.4.x          | ✅            |
| 4.2.x          | ✅            |
| 4.0.x LTS      | ✅            |
| 3.4.x          | ✅            |
| 3.2.x          | ✅            |
| 3.0.x LTS      | ✅            |

## 文檔

[ZbxTable 使用說明](https://zbxtable.cactifans.com)

## 源碼

ZbxTable: [https://github.com/canghai908/zbxtable](https://github.com/canghai908/zbxtable)

ZbxTable-Web: [https://github.com/canghai908/zbxtable-web](https://github.com/canghai908/zbxtable-web)

MS-Agent: [https://github.com/canghai908/ms-agent](https://github.com/canghai908/ms-agent)

## 編譯

```
mkdir -p $GOPATH/src/github.com/canghai908
cd $GOPATH/src/github.com/canghai908
git clone https://github.com/canghai908/zbxtable.git
cd zbxtable
./control build
./control pack
```

## Team

後端

[canghai908](https://github.com/canghai908)

前端

[ahyiru](https://github.com/ahyiru)

## License

<img alt="Apache-2.0 license" src="https://s3-gz01.didistatic.com/n9e-pub/image/apache.jpeg" width="128">

Nightingale is available under the Apache-2.0 license. See the [LICENSE](LICENSE) file for more info.
