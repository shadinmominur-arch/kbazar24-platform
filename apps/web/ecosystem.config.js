module.exports = {
  apps: [{
    name: 'emartweb',
    script: 'npm',
    args: 'start -- -H 127.0.0.1 -p 3000',
    cwd: '/var/www/emart-platform/apps/web',
    exec_mode: 'fork',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=1536',
      HOSTNAME: '127.0.0.1',
      PORT: '3000',
    },
    error_file: '/root/.pm2/logs/emartweb-error.log',
    out_file: '/root/.pm2/logs/emartweb-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
