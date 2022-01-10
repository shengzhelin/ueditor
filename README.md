Ferry安裝配置

首先安裝所需要用的基礎軟件vim，wget,git

yum -y install vim wget git

一、安裝mysql

wget -i -c http://dev.mysql.com/get/mysql57-community-release-el7-10.noarch.rpm

yum -y install mysql57-community-release-el7-10.noarch.rpm

yum -y install mysql-community-server

systemctl start  mysqld.service   #啟動mysql

grep "password" /var/log/mysqld.log #找到安裝後的默認密碼

![image](https://user-images.githubusercontent.com/96695380/147527719-15e8f27e-1e55-41c2-9d71-ca459dfa146f.png)

mysql -uroot -p

#輸入初始密碼（是上面圖片最後面的SZgbj8,kpjSU此時不能做任何事情，因為MySQL默認必須修改密碼之後才能操作數據庫：

mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';

#其中‘new password’替換成你要設置的密碼，注意:密碼設置必須要大小寫字母數字和特殊符號（,/';:等）,不然不能配置成功。

#創建一個ferry用戶用於ferry安裝

create user 'ferry'@'localhost' identified by ' password ';

#給ferry用戶授權可以訪問ferry數據庫

grant all privileges on ferry.* to 'ferry'@'localhost' identified by ' password ' ;

flush privileges;

exit

二、Go語方環境安裝

wget https://studygolang.com/dl/golang/go1.17.5.linux-amd64.tar.gz

tar -C/usr/local -xvf go1.17.5.linux-amd64.tar.gz

mkdir /opt/gopath

cat >> /etc/profile <<EOF

export GOROOT=/usr/local/go

export GOPATH=/opt/gopath

export PATH=\$PATH:\$GOROOT/bin

export GOPROXY=https://goproxy.cn #設置go代理

EOF

source /etc/profile

go version

可以看到go的版本則安裝成功。

![image](https://user-images.githubusercontent.com/96695380/147527783-cdc08266-2331-4403-92aa-d9bd6c5fdbff.png)

三、安裝redis

查看gcc版本，版本過低編譯redis6會報錯，升級gcc

# 升級到gcc 9.3：

yum -y install centos-release-scl

yum -y install devtoolset-9-gcc devtoolset-9-gcc-c++ devtoolset-9-binutils

scl enable devtoolset-9 bash

# 需要注意的是scl命令啟用只是臨時的，退出shell或重啟就會恢覆原系統gcc版本。

# 如果要長期使用gcc 9.3的話：

echo -e "\nsource /opt/rh/devtoolset-9/enable" >>/etc/profile

wget http://download.redis.io/releases/redis-6.2.6.tar.gz

tar zxvf redis-6.2.6.tar.gz

cd redis-6.2.6/

make && make PREFIX=/usr/local/redis install

# 編譯安裝到指定目錄下

make PREFIX=/usr/local/redis install

# 編譯出錯時，清出編譯生成的文件

make distclean

# 卸載

make uninstall

mkdir /etc/redis

#修改redis.conf文件設置開機啟動

daemonize no 改為 daemonize yes

cp redis.conf /etc/redis/6379.conf

cd utils

cp redis_init_script /etc/init.d/redis_6379

chmod +x /etc/init.d/redis_6379

#修改redis_6379

將EXEC=/usr/local/bin/redis-server改為安裝路徑：

EXEC=/usr/local/redis/bin/redis-server

#啟動redis

/etc/init.d/redis_6379 start
  
![image](https://user-images.githubusercontent.com/96695380/147527847-b0957ab4-bac2-4bd9-a97a-e29e8546183d.png)
  
#設置redis開機啟動

chkconfig --add redis_6379

chkconfig redis_6379 on

四、安裝node

wget https://npm.taobao.org/mirrors/node/v14.18.2/node-v14.18.2-linux-x64.tar.gz

tar xf node-v14.18.2-linux-x64.tar.gz

mv node-v14.18.2-linux-x64 /opt/

vim /etc/profile

最後一行添加 : export PATH=$PATH:/opt/node-v14.18.2-linux-x64/bin

source /etc/profile

node –v

npm -v

可以顯示版本號則安裝成功

![image](https://user-images.githubusercontent.com/96695380/147527882-8b16b730-2bd8-4408-87ed-d5b6e91f3ccd.png)

五、ferry後端部署

cd /opt

# 1. 拉取代碼

git clone https://github.com/shengzhelin/ferry.git

 # 2. 進入工作路徑

cd ferry

 # 3. 交叉編譯（centos）

env GOOS=linux GOARCH=amd64 go build

更多交叉編譯內容，請訪問 https://www.fdevops.com/2020/03/08/go-locale-configuration

 # 4. config目錄上傳到項目根路徑下，並確認配置訊息是否正確

vim config/settings.yml

  1). 修改為自己的數據庫訊息
  
![image](https://user-images.githubusercontent.com/96695380/147527935-f00be7c3-820d-43fd-9fbe-c6048f389948.png)
  
  2). 修改為自己的郵件服務器地址
  
![image](https://user-images.githubusercontent.com/96695380/147527980-291cbe09-5303-4113-a456-0ddbc8ac6c35.png)
  
其他的根據情況來修改調整

 # 4. 創建日誌路徑及靜態文件經歷

mkdir -p log static/uploadfile static/scripts static/template

 # 5. 將本地項目下static/template目錄下的所有文件上傳的到，服務器對應的項目目錄下static/template

 # 6. 連接數據庫，並創建數據庫

create database ferry charset 'utf8mb4';

 # 7. 初始化數據

./ferry init -c=config/settings.yml
  
![image](https://user-images.githubusercontent.com/96695380/147528017-2d462b84-9325-4b2f-b0fa-e6a51b24d6c5.png)
  
# 8. 啟動程序，推薦通過"進程管理工具"進行啟動維護

nohup ./ferry server -c=config/settings.yml > /dev/null 2>&1 &
  
![image](https://user-images.githubusercontent.com/96695380/147528036-aaea7043-0a89-485b-a6c5-1e28d7b9ac52.png)
  
六、ferry前端部署：

# 1. 拉取代碼

git clone https://github.com/shengzhelin/ferry_web.git

 # 2. 進入工作路徑

cd ferry_web

 # 3. 安裝依賴

npm config set registry https://registry.npm.taobao.org

npm install

# 若npm install安裝失敗，可嘗試使用一下命令安裝

npm install --unsafe-perm

 # 推薦使用cnpm

npm install -g cnpm --registry=https://registry.npm.taobao.org

cnpm install

#這個過程中會碰到類似下圖中的問題
  
![image](https://user-images.githubusercontent.com/96695380/147528074-59d91b14-c224-4769-bc19-31e65b034aa2.png)

![image](https://user-images.githubusercontent.com/96695380/147528092-93705822-ee0f-49d2-a1ff-8fbcbdee5faa.png)

#後面如果一直卡在那，再報錯的話，我們就單獨將這個包再安裝一次如：

cnpm install --save is-buffer@^1.1.5

#直到出現如下圖所示，則這一步安裝組件完成

![image](https://user-images.githubusercontent.com/96695380/147528221-59721778-1c47-4ff3-9937-1ce34ab726d0.png)

# 4. 修改 .env.production 文件

# base api

VUE_APP_BASE_API = 'http://fdevops.com:8001'  # 修改為您自己的域名也可以是IP地址

# 5. 編譯

cnpm run build:prod

#下面的圖是在編譯時碰到的問題記錄
  
![image](https://user-images.githubusercontent.com/96695380/147528261-9d44fd23-6acc-422f-8e2d-66f7db7427d9.png)

#缺少webpack包，安裝下，不要安裝太高版本否則會報錯

cnpm install --save webpack@^4.5.0

#注意這個問題
  
![image](https://user-images.githubusercontent.com/96695380/147528306-3451414d-6d63-4336-8462-7aa2d111e8dc.png)

file-loader版本過高編譯完成後，圖片會有object module錯誤

cnpm install file-loader@^4.2.0

![image](https://user-images.githubusercontent.com/96695380/147528371-808642bf-3247-489f-8819-89736aa9996c.png)

#編譯時報下面錯誤，缺少組件，繼續安裝組件  
  
![image](https://user-images.githubusercontent.com/96695380/147528421-143f2eeb-429f-43ef-8a0b-d8667ffda38a.png)
  
cnpm install --save @babel/helper-validator-option  
  
![image](https://user-images.githubusercontent.com/96695380/147528455-5df4e16a-21d6-4544-8e3e-cabd8d779c34.png)
  
#下圖這個問題需要重建node-sass  
  
![image](https://user-images.githubusercontent.com/96695380/147528499-12bd66bf-d06a-4681-8977-dd1512187bc0.png)
  
cnpm rebuild node-sass

#重建過程中還是報錯，看提示是缺少目錄，我們創建這個目錄，並給目錄所有權  
  
![image](https://user-images.githubusercontent.com/96695380/147528524-101214e9-fa1c-491d-af0b-45bec7334adc.png)
  
mkdir -p /opt/ferry/ferry_web/node_modules/_node-sass@4.14.1@node-sass/vendor

chmod 777 /opt/ferry/ferry_web/node_modules/_node-sass@4.14.1@node-sass/vendor

#在github下載這個文件會比較慢或都報錯，我們可以直接先下好
  
![image](https://user-images.githubusercontent.com/96695380/147528559-a73e473e-9155-4ee4-bea3-61293aa3bfc7.png)

wget https://npm.taobao.org/mirrors/node-sass/v4.14.1/linux-x64-83_binding.node

#然後將下載好的文件放到對應的目錄中即可

mv linux-x64-83_binding.node /opt/ferry/ferry_web/node_modules/_node-sass@4.14.1@node-sass/vendor/linux-x64-83/binding.node

cnpm rebuild node-sass

#又來新的錯誤了，總結下是需要安裝幾個新的組件
  
![image](https://user-images.githubusercontent.com/96695380/147528598-65ed6e0f-9150-43ad-ad07-f9636696a60e.png)

cnpm install --save core-js regenerator-runtime svg-baker-runtime

#安裝完成後繼續執行編譯命令

cnpm run build:prod
  
![image](https://user-images.githubusercontent.com/96695380/147528622-25b491b5-cada-4026-b81e-d8e7d470e5c1.png)
  
#總算搞定了。

七、nginx安裝配置

#安裝nginx

yum install yum-utils

#添加源到 

vim /etc/yum.repos.d/nginx.repo
---------------------------------------  
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
--------------------------------------- 
  
yum -y install nginx

添加ferry配置文件

vim /etc/nginx/conf.d/ferry.conf
---------------------------------------     
server {
 
  listen 8001; # 監聽端口
 
  server_name 10.100.168.70:8001; # 域名可以有多個，用空格隔開
 
 
 
  #charset koi8-r;
 
 
 
  #access_log  logs/host.access.log  main;
 
  location / {
 
    root /opt/ferry/ferry_web/web;
 
    index index.html index.htm; #目錄內的默認打開文件,如果沒有匹配到index.html,則搜索index.htm,依次類推
 
  }
 
 
 
  #ssl配置省略
 
  location /api {
 
    # rewrite ^.+api/?(.*)$ /$1 break;
 
    proxy_pass http://127.0.0.1:8002; #node api server 即需要代理的IP地址
 
    proxy_redirect off;
 
    proxy_set_header Host $host:$server_port;
 
    proxy_set_header X-Real-IP $remote_addr;
 
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 
  }
 
 
 
  # 登入
 
  location /login {
 
    proxy_pass http://127.0.0.1:8002; #node api server 即需要代理的IP地址
 
    proxy_redirect off;
 
    proxy_ignore_client_abort on;
 
    proxy_max_temp_file_size 256m;
 
    proxy_connect_timeout      90;
 
    proxy_send_timeout         90;
 
    proxy_read_timeout         90;
 
    proxy_buffer_size          4k;
 
    proxy_buffers              4 32k;
 
    proxy_busy_buffers_size    32k;
 
    proxy_temp_file_write_size 64k;
 
    proxy_http_version 1.1;
 
    proxy_set_header Connection "";
 
    proxy_set_header Host $host:$server_port;
 
    proxy_set_header X-Real-IP $remote_addr;
 
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 
  }
 
 
 
  # 刷新token
 
  location /refresh_token {
 
    proxy_pass http://127.0.0.1:8002; #node api server 即需要代理的IP地址
 
    proxy_set_header Host $host:$server_port;
 
  }
 
 
 
  # 接口地址
 
  location /swagger {
 
    proxy_pass http://127.0.0.1:8002; #node api server 即需要代理的IP地址
 
    proxy_set_header Host $host:$server_port;
 
  }
 
 
 
  # 後端靜態文件路徑
 
  location /static/uploadfile {
 
    proxy_pass http://127.0.0.1:8002; #node api server 即需要代理的IP地址
 
    proxy_set_header Host $host:$server_port;
 
  }
 
 
 
  #error_page  404              /404.html;    #對錯誤頁面404.html 做了定向配置
 
 
 
  # redirect server error pages to the static page /50x.html
 
  #將服務器錯誤頁面重定向到靜態頁面/50x.html
 
  #
 
  error_page 500 502 503 504 /50x.html;
 
  location = /50x.html {
 
    root html;
 
  }
 
}
---------------------------------------  

#檢查配置文件是否有錯

nginx –t
  
![image](https://user-images.githubusercontent.com/96695380/147528766-f8042b65-cbfe-40fc-8abc-f8c2ab8ea23d.png)
  
#啟動nginx

nginx

#啟動完成後查看下主要的幾個端口是否已開啟
  
![image](https://user-images.githubusercontent.com/96695380/147528787-eb00f8fc-52a5-4ec8-9838-ec1a5d3cfa6b.png)
  
#記得在防火墻上打開被訪問的端口8001

firewall-cmd --zone=public --add-port=8001/tcp --permanent    （--permanent永久生效，沒有此參數重啟後失效）

重新載入

firewall-cmd --reload  
  
![image](https://user-images.githubusercontent.com/96695380/147528814-7010d2eb-d76e-4184-9a00-4a58f6390bdf.png)
  
安裝完成
---------------------------------------  



重啟主機後，8002 port消失

方法是 cd /etc/profile.d/

添加腳本 vim xxx.sh

----------------------------------------------
#!/bin/sh

cd /opt/ferry/
nohup ./ferry server -c=config/settings.yml > /dev/null 2>&1 &

----------------------------------------------
開機自動運行腳本的方法
