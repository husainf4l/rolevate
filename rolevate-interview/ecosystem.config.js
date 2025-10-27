module.exports = {
  apps: [
    {
      name: 'rolevate-agent',
      script: 'venv/bin/python',
      args: 'main.py dev',
      cwd: '/home/husain/rolevate/rolevate-interview',
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
    },
    {
      name: 'web-controller',
      script: 'venv/bin/uvicorn',
      args: 'web_controller:app --host 0.0.0.0 --port 8004',
      cwd: '/home/husain/rolevate/rolevate-interview',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/web-controller-error.log',
      out_file: './logs/web-controller-out.log',
      log_file: './logs/web-controller-combined.log',
      time: true,
      merge_logs: true
    }
  ]
};
