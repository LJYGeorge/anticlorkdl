#!/bin/bash

# 设置错误时退出
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 默认配置
PROJECT_DIR="/var/www/crawler"
LOG_DIR="/var/log/crawler"
DATA_DIR="/var/lib/crawler"
NODE_VERSION="18"
DEFAULT_PORT="3000"

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
check_system() {
    info "检查系统要求..."
    
    # 检查操作系统
    if [ ! -f /etc/os-release ]; then
        error "不支持的操作系统"
    fi
    
    # 检查内存
    total_mem=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$total_mem" -lt 2048 ]; then
        error "需要至少 2GB 内存"
    fi
    
    # 检查磁盘空间
    free_space=$(df -m / | awk 'NR==2 {print $4}')
    if [ "$free_space" -lt 10240 ]; then
        error "需要至少 10GB 可用空间"
    fi
    
    # 检查CPU核心数
    cpu_cores=$(nproc)
    if [ "$cpu_cores" -lt 2 ]; then
        warn "建议至少使用2核CPU"
    fi
}

# 检查并安装依赖
check_dependency() {
    local cmd=$1
    local package=$2
    local name=$3
    
    if ! command -v $cmd &> /dev/null; then
        info "安装 $name..."
        apt-get install -y $package
    else
        info "$name 已安装"
    fi
}

# 安装系统依赖
install_system_dependencies() {
    info "安装系统依赖..."
    
    # 更新包管理器
    apt-get update
    
    # 安装基础工具
    check_dependency "curl" "curl" "curl"
    check_dependency "wget" "wget" "wget"
    check_dependency "git" "git" "git"
    check_dependency "nginx" "nginx" "nginx"
    check_dependency "jq" "jq" "jq"
    
    # 安装编译工具
    apt-get install -y build-essential
}

# 安装 Node.js
install_nodejs() {
    info "检查 Node.js..."
    
    if ! command -v node &> /dev/null || [[ $(node -v) != *"v$NODE_VERSION"* ]]; then
        info "安装 Node.js $NODE_VERSION..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
        
        # 验证安装
        node_version=$(node -v)
        info "Node.js 版本: $node_version"
    else
        info "Node.js 已安装正确版本"
    fi
}

# 安装全局 npm 包
install_global_npm_packages() {
    info "检查全局 npm 包..."
    
    # 检查并安装 PM2
    if ! command -v pm2 &> /dev/null; then
        info "安装 PM2..."
        npm install -g pm2
    else
        info "PM2 已安装"
    fi
    
    # 检查并安装 typescript
    if ! command -v tsc &> /dev/null; then
        info "安装 TypeScript..."
        npm install -g typescript
    else
        info "TypeScript 已安装"
    fi
}

# 创建目录结构
create_directories() {
    info "创建目录结构..."
    
    # 创建必要目录
    for dir in "$PROJECT_DIR" "$LOG_DIR" "$DATA_DIR" "$DATA_DIR/downloads"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            info "创建目录: $dir"
        fi
    done
    
    # 设置权限
    chown -R www-data:www-data "$PROJECT_DIR" "$LOG_DIR" "$DATA_DIR"
    chmod -R 755 "$PROJECT_DIR" "$LOG_DIR" "$DATA_DIR"
}

# 克隆项目
clone_project() {
    info "克隆项目..."
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        info "更新现有代码..."
        cd "$PROJECT_DIR"
        git fetch --all
        git reset --hard origin/main
    else
        info "克隆新项目..."
        git clone https://github.com/LJYGeorge/anticlorkdl.git "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
}

# 安装项目依赖
install_project_dependencies() {
    info "安装项目依赖..."
    
    cd "$PROJECT_DIR"
    
    # 检查 package.json
    if [ ! -f "package.json" ]; then
        error "package.json 不存在"
    fi
    
    # 清理旧的依赖
    if [ -d "node_modules" ]; then
        info "清理旧依赖..."
        rm -rf node_modules
    fi
    
    # 安装依赖
    if [ -f "package-lock.json" ]; then
        info "使用 package-lock.json 安装依赖..."
        npm ci
    else
        info "使用 package.json 安装依赖..."
        npm install
    fi
    
    # 验证依赖安装
    if [ ! -d "node_modules" ]; then
        error "依赖安装失败"
    fi
}

# 配置项目
setup_project() {
    info "配置项目..."
    
    cd "$PROJECT_DIR"
    
    # 创建环境配置
    if [ ! -f ".env" ]; then
        info "创建环境配置..."
        cat > .env << EOF
NODE_ENV=production
PORT=$DEFAULT_PORT
LOG_DIR=$LOG_DIR
SAVE_PATH=$DATA_DIR/downloads
MAX_CONCURRENT=5
RATE_LIMIT=100
TIMEOUT=30000
EOF
    fi
    
    # 构建项目
    info "构建项目..."
    npm run build
    
    # 验证构建
    if [ ! -d "dist" ]; then
        error "项目构建失败"
    fi
}

# 配置 PM2
setup_pm2() {
    info "配置 PM2..."
    
    cd "$PROJECT_DIR"
    
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
      PORT: $DEFAULT_PORT,
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
    pm2 delete crawler 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    
    # 设置开机自启
    env PATH=$PATH:/usr/bin pm2 startup systemd -u www-data --hp "$PROJECT_DIR"
}

# 配置 Nginx
setup_nginx() {
    info "配置 Nginx..."
    
    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/crawler << EOF
server {
    listen 80;
    server_name _;
    
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
        proxy_pass http://localhost:$DEFAULT_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 安全相关配置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/crawler /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    nginx -t || error "Nginx 配置验证失败"
    
    # 重启 Nginx
    systemctl restart nginx
}

# 配置系统优化
setup_system_optimization() {
    info "配置系统优化..."
    
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

# 配置日志轮转
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
    
    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        error "请使用 root 用户运行此脚本"
    fi
    
    check_system
    install_system_dependencies
    install_nodejs
    install_global_npm_packages
    create_directories
    clone_project
    install_project_dependencies
    setup_project
    setup_pm2
    setup_nginx
    setup_system_optimization
    setup_logrotate
    
    info "部署完成!"
    info ""
    info "应用信息："
    info "- 访问地址：http://服务器IP"
    info "- 项目目录：$PROJECT_DIR"
    info "- 日志目录：$LOG_DIR"
    info "- 数据目录：$DATA_DIR"
    info ""
    info "常用命令："
    info "- 查看应用状态：pm2 status"
    info "- 查看应用日志：pm2 logs crawler"
    info "- 重启应用：pm2 restart crawler"
    info "- 停止应用：pm2 stop crawler"
    info "- 启动应用：pm2 start crawler"
}

# 执行主函数
main