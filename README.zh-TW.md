 [English](./README.md) | 繁體中文

# ms-agent

ms-agent 是一個使用 go 語言編寫接收zabbix 的告警消息並發送到 [ZbxTable](https://github.com/canghai908/zbxtable) 平台的工具，需配合 ZbxTable 平台使用。

## 編譯

``` bash
mkdir -p $GOPATH/src/github.com/canghai908
cd $GOPATH/src/github.com/canghai908
git clone https://github.com/canghai908/ms-agent.git
cd ms-agent
./control build
./control pack
```

## 更新記錄

V1.0.1
2020.07.24 修覆 log 日誌權限問題

會編譯生成二進制文件，並打包到壓縮包

## 配置

ms-agent 部署需部署在 Zabbix Server，ms-agent 接收 zabbix 的告警消息，通過 http 協議發送到 ZbxTable 平台，使用 zbxtable 完成 ms-agent 在 zabbix server 平台配置

``` 
cd /usr/local/zbxtable
./zbxtable install
```

顯示如下日誌

``` 
2020/07/18 23:22:16.881 [I] [install.go:43]  Zabbix API Address: http://zabbix-server/api_jsonrpc.php
2020/07/18 23:22:16.881 [I] [install.go:44]  Zabbix Admin User: Admin
2020/07/18 23:22:16.881 [I] [install.go:45]  Zabbix Admin Password: xxxxx
2020/07/18 23:22:17.716 [I] [install.go:52]  登入zabbix平台成功!
2020/07/18 23:22:17.879 [I] [install.go:69]  創建告警媒介成功!
2020/07/18 23:22:18.027 [I] [install.go:82]  創建告警用戶組成功!
2020/07/18 23:22:18.198 [I] [install.go:113]  創建告警用戶成功!
2020/07/18 23:22:18.198 [I] [install.go:114]  用戶名:ms-agent
2020/07/18 23:22:18.198 [I] [install.go:115]  密碼:xxxx
2020/07/18 23:22:18.366 [I] [install.go:167]  創建告警動作成功!
2020/07/18 23:22:18.366 [I] [install.go:168]  插件安裝完成!
```

此步驟會在 Zabbix Server 創建 ms-agent，密碼為隨機，並配置相關 action 和 media，並關聯到用戶

## 安裝

此程序必須部署在 Zabbix Server

``` 
yum install https://dl.cactifans.com/zabbix/ms-agent-1.0.1-1.el7.x86_64.rpm -y
```

環境訊息

| 程序     | 路徑                                  | 作用                                             |
| :------- | :------------------------------------ | :----------------------------------------------- |
| ms-agent | /usr/lib/zabbix/alertscripts/ms-agent | 接收 Zabbix 平台產生的告警並發送到 ZbxTable 平台 |
| app.ini  | /etc/ms-agent/app.ini                 | ms-agent 配置文件                                |

如果你的 Zabbix Server 的 alertscripts 目錄不為/usr/lib/zabbix/alertscripts/ 需要移動 ms-agen 到你的 zabbix server 的 alertscripts 目錄下即可, 否則會在 Zabbix 告警頁面出現找不到 ms-agent 的錯誤提示，也無法收到告警消息。
也可以修改 Zabbix Server 的配置文件，將 alertscripts 目錄指向/usr/lib/zabbix/alertscripts/

vi zabbix_server.conf

``` 
AlertScriptsPath=/usr/lib/zabbix/alertscripts
```

修改後重啟 Zabbix Server 生效

## Debug

可修改配置文件打開 Debug 模式，查看日誌/tmp/ms-agent_yyyymmdd.log

## License

<img alt="Apache-2.0 license" src="https://s3-gz01.didistatic.com/n9e-pub/image/apache.jpeg" width="128">

Nightingale is available under the Apache-2.0 license. See the [LICENSE](LICENSE) file for more info.
