module.exports = {
  apps: [{
    name: 'cv-agent',
    script: '/home/husain/rolevate/rolevate-agent2/.venv/bin/uvicorn',
    args: 'main:app --reload --host 0.0.0.0 --port 8005',
    cwd: '/home/husain/rolevate/rolevate-agent2',
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PYTHONPATH: '/home/husain/rolevate/rolevate-agent2'
    },
    error_log: '/home/husain/rolevate/rolevate-agent2/logs/pm2-error.log',
    out_log: '/home/husain/rolevate/rolevate-agent2/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};