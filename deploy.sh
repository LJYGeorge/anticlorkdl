# 创建新的部署脚本
cat > deploy.sh << 'EOF'
#!/bin/bash

# 设置错误时退出
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# 主函数
main() {
    info "开始部署网站资源爬虫..."
    
    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        error "请使用 root 用户运行此脚本"
    }
    
    # 更新系统包
    info "更新系统包..."
    apt-get update
    apt-get upgrade -y
    
    # 安装基础依赖
    info "安装依赖..."
    apt-get install -y curl wget git build-essential nginx
    
    # 安装 Node.js
    info "安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # 安装 PM2
    info "安装 PM2..."
    npm install -g pm2
    
    # 创建目录
    info "创建目录..."
    mkdir -p /var/www/crawler
    mkdir -p /var/log/crawler
    mkdir -p /var/lib/crawler/downloads
    
    # 克隆项目
    info "克隆项目..."
    git clone https://github.com/LJYGeorge/anticlorkdl.git /var/www/crawler
    
    # 配置项目
    info "配置项目..."
    cd /var/www/crawler
    npm install
    npm run build
    
    # 启动服务
    info "启动服务..."
    pm2 start backend/server.js --name crawler
    pm2 save
    pm2 startup
    
    # 配置 Nginx
    info "配置 Nginx..."
    cat > /etc/nginx/sites-available/crawler << 'END'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
END
    
    ln -sf /etc/nginx/sites-available/crawler /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
    
    info "部署完成!"
    info "你可以通过 http://服务器IP 访问应用"
    info "使用 pm2 status 查看应用状态"
}

# 执行主函数
main
EOF
