module.exports = {
  apps: [{
    name: 'kbazar24web',
    script: 'npm',
    args: 'start -- -H 127.0.0.1 -p 3003',
    cwd: '/var/www/kbazar24-platform/apps/web',
    exec_mode: 'fork',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=1536',
      HOSTNAME: '127.0.0.1',
      PORT: '3003',
    },
    error_file: '/root/.pm2/logs/kbazar24web-error.log',
    out_file: '/root/.pm2/logs/kbazar24web-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
