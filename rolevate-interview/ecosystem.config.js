module.exports = {
  apps: [{
    name: 'rolevate-agent',
    script: 'venv/bin/python',
    args: 'main.py dev',
    cwd: '/Users/husain/Desktop/rolevate/rolevate-interview',
    interpreter: 'none',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true
  }]
};
