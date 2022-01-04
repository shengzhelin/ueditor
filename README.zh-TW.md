[English](./README.md) | 繁體中文

# zbxtable-web

ZbxTable 前端頁面

## 開發

``` 
npm run start
```

訪問 http://127.0.0.1:9600

## 構建

環境：nodejs>10

構建

``` 
npm i
npm run build
```

構建後的代碼默認會存放到 /app/build 文件夾

## 部署

建議使用 nginx， 配置文件如下

``` 
server {
        listen 8088;
        server_name  localhost;
        root    /usr/local/zbxtable/web;
        location /v1 {
                proxy_set_header X-Forwarded-For $remote_addr;
                proxy_set_header Host            $http_host;
                proxy_pass http://127.0.0.1:8084;
        }
        location /  {
                try_files $uri /index.html;
        }

}
```

拷貝生成的前端文件到/usr/local/zbxtable/web 目錄

``` 
cp -a /app/build/* /usr/local/zbxtable/web
```

8084 為 zbxtable 後端程序端口, 重啟 nginx 即可使用http://ip:8088 訪問系統, 默認帳號:admin，密碼: Zbxtable

## Team

後端

[canghai908](https://github.com/canghai908)

前端

[ahyiru](https://github.com/ahyiru)
