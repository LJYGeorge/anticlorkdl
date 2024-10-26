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
      LOG_DIR: '/var/log/crawler',
      SAVE_PATH: '/var/lib/crawler/downloads'
    },
    error_file: '/var/log/crawler/error.log',
    out_file: '/var/log/crawler/app.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}