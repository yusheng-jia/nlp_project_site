# sms_project_site
nodeJs web 项目

一个简单的网页，处理EXCEL文件（解析，拼接，生成）以及文件上传，下载接口等等，
供参考


项目启动：
1. git clone https://github.com/yusheng-jia/sms_project_site.git
2. cd sms_project_site 
3. npm i
4. npm strat
5. 如果你想在服务器端部署 使用pm2 来部署: pm2 start ./bin/www

PS: pm2 自行了解

PS: ubuntu 环境搭建
1.安装NodeJs和升级到最新
sudo apt-get install nodejs
sudo apt install nodejs-legacy
sudo apt install npm

#升级
sudo npm cache clean
sudo npm install -g n 
sudo n stable
2. 安装pm2
npm install -g pm2 
