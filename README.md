English | [繁體中文](./README.zh-TW.md)

# zbxtable-web

ZbxTable front end

## Getting Started

``` 
npm i
npm run start
```

Visit  http://127.0.0.1:9600

## Build

nodejs>10

``` 
npm i
npm run build
```

The built code will be stored in the /app/build folder 

## Deploy

It is recommended to use nginx, the configuration file is as follows:

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

Copy the generated front-end files to the /usr/local/zbxtable/web directory

``` 
cp -a /app/build/* /usr/local/zbxtable/web
```

8084 is the zbxtable back-end program port, restart nginx to access the system using http://ip:8088, the default account: admin, password: Zbxtable

## Team

Back-end development

[canghai908](https://github.com/canghai908)

Front-end development

[ahyiru](https://github.com/ahyiru)
