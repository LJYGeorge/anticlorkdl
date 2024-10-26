# 网站资源爬虫工具部署指南

## 目录
- [系统要求](#系统要求)
- [服务器准备](#服务器准备)
- [项目部署](#项目部署)
- [环境配置](#环境配置)
- [启动服务](#启动服务)
- [配置说明](#配置说明)
- [常见问题](#常见问题)
- [故障排除](#故障排除)
- [安全建议](#安全建议)

## 系统要求

### 基础环境
- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本
- 现代浏览器（Chrome、Firefox、Edge 等）
- 2GB 以上可用内存
- 10GB 以上可用磁盘空间

### 操作系统支持
- Windows Server 2016/2019/2022
- Ubuntu Server 20.04/22.04 LTS
- CentOS 8/Rocky Linux 8
- Debian 11/12

### 网络要求
- 稳定的互联网连接
- 支持 HTTP/HTTPS 协议
- 开放端口: 80, 443, 3000
- 可选：代理服务器支持

## 服务器准备

### 1. 系统更新

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/Rocky Linux
sudo dnf update -y
```

### 2. 安装基础工具

```bash
# Ubuntu/Debian
sudo apt install -y curl wget git build-essential

# CentOS/Rocky Linux
sudo dnf install -y curl wget git make gcc gcc-c++
```

### 3. 安装 Node.js

```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 或使用包管理器（Ubuntu/Debian）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 4. 创建服务用户

```bash
# 创建专用用户
sudo useradd -m -s /bin/bash crawler
sudo usermod -aG sudo crawler

# 设置密码
sudo passwd crawler

# 切换到新用户
su - crawler
```

### 5. 配置防火墙

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable

# CentOS/Rocky Linux (firewalld)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## 项目部署

### 1. 创建项目目录

```bash
# 创建应用目录
sudo mkdir -p /var/www/crawler
sudo chown crawler:crawler /var/www/crawler

# 创建日志目录
sudo mkdir -p /var/log/crawler
sudo chown crawler:crawler /var/log/crawler

# 创建数据目录
sudo mkdir -p /var/lib/crawler/downloads
sudo chown -R crawler:crawler /var/lib/crawler

# 设置权限
sudo chmod 755 /var/www/crawler
sudo chmod 755 /var/log/crawler
sudo chmod 755 /var/lib/crawler
```

### 2. 克隆项目

```bash
# 切换到项目目录
cd /var/www/crawler

# 克隆项目
git clone <项目地址> .

# 安装依赖
npm install --production
```

### 3. 配置环境变量

```bash
# 创建环境配置文件
cp .env.example .env

# 编辑配置文件
nano .env

# 配置示例
NODE_ENV=production
PORT=3000
LOG_DIR=/var/log/crawler
SAVE_PATH=/var/lib/crawler/downloads
MAX_CONCURRENT=5
RATE_LIMIT=100
TIMEOUT=30000
```

### 4. 配置 Nginx（可选，用于反向代理）

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建站点配置
sudo nano /etc/nginx/sites-available/crawler

# 配置内容
server {
    listen 80;
    server_name crawler.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 启用站点
sudo ln -s /etc/nginx/sites-available/crawler /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. 配置 SSL（推荐）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d crawler.yourdomain.com

# 自动续期
sudo systemctl enable certbot.timer
```

## 环境配置

### 1. 系统优化

```bash
# 调整系统限制
sudo nano /etc/security/limits.conf

# 添加以下内容
crawler soft nofile 65535
crawler hard nofile 65535

# 调整内核参数
sudo nano /etc/sysctl.conf

# 添加以下内容
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1
```

### 2. Node.js 优化

```bash
# 设置 Node.js 环境变量
echo "export NODE_ENV=production" >> ~/.bashrc
echo "export NODE_OPTIONS=--max-old-space-size=4096" >> ~/.bashrc
source ~/.bashrc
```

### 3. PM2 安装和配置

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件
nano ecosystem.config.js

# 配置内容
module.exports = {
  apps: [{
    name: 'crawler',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

## 启动服务

### 1. 使用 PM2 启动

```bash
# 启动服务
pm2 start ecosystem.config.js

# 保存 PM2 进程列表
pm2 save

# 设置开机自启
pm2 startup

# 查看状态
pm2 status
pm2 logs crawler
```

### 2. 使用 Systemd 启动（可选）

```bash
# 创建服务文件
sudo nano /etc/systemd/system/crawler.service

# 服务配置内容
[Unit]
Description=Website Crawler Service
After=network.target

[Service]
Type=simple
User=crawler
WorkingDirectory=/var/www/crawler
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target

# 启动服务
sudo systemctl enable crawler
sudo systemctl start crawler

# 查看状态
sudo systemctl status crawler
journalctl -u crawler -f
```

## 维护操作

### 1. 日志轮转

```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/crawler

# 配置内容
/var/log/crawler/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 crawler crawler
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. 备份策略

```bash
# 创建备份脚本
nano /var/www/crawler/backup.sh

# 脚本内容
#!/bin/bash
BACKUP_DIR="/var/backups/crawler"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/crawler_$DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 停止服务
pm2 stop crawler

# 备份文件
tar -czf $BACKUP_PATH \
    /var/www/crawler \
    /var/lib/crawler/downloads \
    /var/log/crawler

# 启动服务
pm2 start crawler

# 删除旧备份
find $BACKUP_DIR -type f -mtime +30 -delete

# 设置权限
chmod +x backup.sh

# 添加到 crontab
crontab -e

# 添加定时任务（每天凌晨 2 点执行）
0 2 * * * /var/www/crawler/backup.sh
```

### 3. 监控配置

```bash
# 安装监控工具
pm2 install pm2-logrotate
pm2 install pm2-server-monit

# 配置告警阈值
pm2 set pm2-server-monit:cpu 80
pm2 set pm2-server-monit:memory 85
pm2 set pm2-server-monit:disk 85
```

## 故障排除

### 1. 服务无法启动

检查以下几点：
```bash
# 检查日志
tail -f /var/log/crawler/error.log

# 检查权限
ls -la /var/www/crawler
ls -la /var/lib/crawler/downloads

# 检查端口占用
sudo lsof -i :3000

# 检查 Node.js 版本
node --version

# 检查内存使用
free -m
```

### 2. 性能问题

```bash
# 检查 CPU 使用率
top -u crawler

# 检查内存泄漏
node --inspect server.js

# 检查磁盘 I/O
iostat -x 1

# 检查网络连接
netstat -tuln
```

### 3. 网络问题

```bash
# 检查防火墙
sudo ufw status
sudo firewall-cmd --list-all

# 测试网络连接
curl -v http://localhost:3000
wget -qO- http://localhost:3000

# 检查 SSL 证书
sudo certbot certificates
```

## 安全加固

### 1. 系统安全

```bash
# 禁用 root SSH 登录
sudo nano /etc/ssh/sshd_config
# 设置 PermitRootLogin no

# 配置 fail2ban
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# 设置 SELinux（CentOS）
sudo semanage port -a -t http_port_t -p tcp 3000
```

### 2. 应用安全

```bash
# 设置安全头
npm install helmet
npm install express-rate-limit

# 配置 CSP
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'

# 启用 CORS
npm install cors
```

### 3. 数据安全

```bash
# 加密敏感数据
npm install crypto

# 设置文件权限
find /var/www/crawler -type f -exec chmod 644 {} \;
find /var/www/crawler -type d -exec chmod 755 {} \;

# 备份加密
gpg --encrypt --recipient user@example.com backup.tar.gz
```

## 技术支持

如遇问题，请：
1. 查看详细日志 `/var/log/crawler/`
2. 检查系统监控数据
3. 参考故障排除指南
4. 提交 Issue 获取帮助

## 许可证

MIT 许可证 - 详见 LICENSE 文件