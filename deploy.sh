#!/bin/bash

# 设置错误时退出
set -e

# 检查是否以 root 权限运行
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 域名设置
DOMAIN="d.aicool.fun"
PROJECT_DIR="/var/www/crawler"
LOG_DIR="/var/log/crawler"
DATA_DIR="/var/lib/crawler"

# 打印带颜色的信息
info() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# 检查系统要求
check_requirements() {
    info "检查系统要求..."
    
    # 检查操作系统
    if [ ! -f /etc/os-release ]; then
        error "不支持的操作系统"
    fi
    
    # 检查内存
    total_mem=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$total_mem" -lt 2048 ]; then
        error "内存不足，需要至少 2GB 内存"
    }
    
    # 检查磁盘空间
    free_space=$(df -m "$PROJECT_DIR" | awk 'NR==2 {print $4}')
    if [ "$free_space" -lt 10240 ]; then
        error "磁盘空间不足，需要至少 10GB 可用空间"
    fi
    
    # 检查并安装必要的软件包
    apt-get update
    apt-get install -y curl wget git build-essential
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        info "安装 Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        info "安装 npm..."
        apt-get install -y npm
    fi
    
    # 验证版本
    node_version=$(node -v)
    npm_version=$(npm -v)
    info "Node.js 版本: $node_version"
    info "npm 版本: $npm_version"
}

# 创建必要的目录
setup_directories() {
    info "创建项目目录..."
    
    # 创建并设置权限
    mkdir -p "$PROJECT_DIR" "$LOG_DIR" "$DATA_DIR/downloads"
    
    # 设置目录权限
    chown -R www-data:www-data "$PROJECT_DIR" "$LOG_DIR" "$DATA_DIR"
    chmod -R 755 "$PROJECT_DIR" "$LOG_DIR" "$DATA_DIR"
    
    # 创建日志文件
    touch "$LOG_DIR/app.log"
    touch "$LOG_DIR/error.log"
    chown www-data:www-data "$LOG_DIR/app.log" "$LOG_DIR/error.log"
}

# 克隆项目
clone_project() {
    info "克隆项目代码..."
    
    cd "$PROJECT_DIR"
    if [ -d ".git" ]; then
        info "更新现有代码..."
        git fetch --all
        git reset --hard origin/main
    else
        git clone https://github.com/LJYGeorge/anticlorkdl .
    fi
    
    # 设置正确的权限
    chown -R www-data:www-data .
}

# 安装依赖
install_dependencies() {
    info "安装项目依赖..."
    
    cd "$PROJECT_DIR"
    
    # 清理 npm 缓存
    npm cache clean --force
    
    # 安装依赖
    npm ci --production
    
    # 安装全局工具
    npm install -g pm2
    
    # 验证安装
    if [ ! -d "node_modules" ]; then
        error "依赖安装失败"
    fi
}

# 配置环境变量
setup_environment() {
    info "配置环境变量..."
    
    cd "$PROJECT_DIR"
    
    # 创建环境配置
    cat > .env << EOF
NODE_ENV=production
PORT=3000
LOG_DIR=$LOG_DIR
SAVE_PATH=$DATA_DIR/downloads
MAX_CONCURRENT=5
RATE_LIMIT=100
TIMEOUT=30000
DOMAIN=$DOMAIN
EOF

    # 设置权限
    chown www-data:www-data .env
    chmod 600 .env
}

# 构建项目
build_project() {
    info "构建项目..."
    
    cd "$PROJECT_DIR"
    
    # 清理旧的构建文件
    rm -rf dist
    
    # 构建项目
    npm run build
    
    if [ ! -d "dist" ]; then
        error "项目构建失败"
    fi
    
    # 设置构建文件权限
    chown -R www-data:www-data dist
}

# 配置 PM2
setup_pm2() {
    info "配置 PM2..."
    
    cd "$PROJECT_DIR"
    
    # 停止现有实例
    pm2 delete crawler 2>/dev/null || true
    
    # 创建 PM2 配置
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'crawler',
    script: 'backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      LOG_DIR: '$LOG_DIR',
      SAVE_PATH: '$DATA_DIR/downloads'
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/app.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF
    
    # 启动应用
    pm2 start ecosystem.config.js
    pm2 save
    
    # 设置开机自启
    env PATH=$PATH:/usr/bin pm2 startup systemd -u www-data --hp /var/www
}

# 配置 Nginx
setup_nginx() {
    info "配置 Nginx..."
    
    # 安装 Nginx
    apt-get install -y nginx
    
    # 备份默认配置
    if [ -f /etc/nginx/sites-enabled/default ]; then
        mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak
    fi
    
    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/crawler << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    
    # 日志配置
    access_log $LOG_DIR/nginx.access.log;
    error_log $LOG_DIR/nginx.error.log;
    
    # 客户端限制
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket 支持
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location /static {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # 安全相关配置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/crawler /etc/nginx/sites-enabled/
    
    # 验证配置
    nginx -t || error "Nginx 配置验证失败"
    
    # 重启 Nginx
    systemctl restart nginx
}

# 配置 SSL
setup_ssl() {
    info "配置 SSL..."
    
    # 安装 Certbot
    apt-get install -y certbot python3-certbot-nginx
    
    # 获取证书
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" \
        --redirect --keep-until-expiring
    
    # 配置自动续期
    systemctl enable certbot.timer
    systemctl start certbot.timer
}

# 配置防火墙
setup_firewall() {
    info "配置防火墙..."
    
    # 安装 UFW
    apt-get install -y ufw
    
    # 配置规则
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow http
    ufw allow https
    
    # 启用防火墙
    echo "y" | ufw enable
}

# 配置系统优化
optimize_system() {
    info "优化系统配置..."
    
    # 系统限制
    cat > /etc/security/limits.d/crawler.conf << EOF
www-data soft nofile 65535
www-data hard nofile 65535
EOF
    
    # 内核参数
    cat > /etc/sysctl.d/99-crawler.conf << EOF
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1
EOF
    
    # 应用更改
    sysctl --system
}

# 设置日志轮转
setup_logrotate() {
    info "配置日志轮转..."
    
    cat > /etc/logrotate.d/crawler << EOF
$LOG_DIR/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx
        pm2 reloadLogs
    endscript
}
EOF
}

# 主函数
main() {
    info "开始部署网站资源爬虫..."
    info "域名: $DOMAIN"
    
    check_requirements
    setup_directories
    clone_project
    install_dependencies
    setup_environment
    build_project
    optimize_system
    setup_logrotate
    setup_pm2
    setup_nginx
    setup_ssl
    setup_firewall
    
    info "部署完成！"
    info "应用地址: https://$DOMAIN"
    info ""
    info "常用命令:"
    info "- 查看应用状态: pm2 status"
    info "- 查看应用日志: pm2 logs crawler"
    info "- 重启应用: pm2 restart crawler"
    info "- 停止应用: pm2 stop crawler"
    info "- 启动应用: pm2 start crawler"
    info ""
    info "日志位置:"
    info "- 应用日志: $LOG_DIR/app.log"
    info "- 错误日志: $LOG_DIR/error.log"
    info "- Nginx 访问日志: $LOG_DIR/nginx.access.log"
    info "- Nginx 错误日志: $LOG_DIR/nginx.error.log"
}

# 执行主函数
main