module.exports = {
  apps: [{
    name: 'rolevate-agent',
    script: 'venv/bin/python',
    args: 'app.py dev',
    cwd: '/Users/husain/Desktop/rolevate/rolevate-interview',
    interpreter: 'none',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PYTHONUNBUFFERED: '1'
    },
    env_development: {
      NODE_ENV: 'development',
      PYTHONUNBUFFERED: '1'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
