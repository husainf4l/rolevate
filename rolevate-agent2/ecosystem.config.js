module.exports = {
  apps: [
    {
      name: 'rolevate-cv-agent',
      script: './.venv/bin/uvicorn',
      args: 'main:app --reload --host 0.0.0.0 --port 8000',
      cwd: '/Users/husain/Desktop/rolevate/rolevate-agent2',
      interpreter: 'none',
      env: {
        PYTHONPATH: '/Users/husain/Desktop/rolevate/rolevate-agent2',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
