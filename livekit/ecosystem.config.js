module.exports = {
  apps: [
    {
      name: 'livekit-agent11',
      cwd: '/home/husain/rolevate/livekit',
      script: './agent11/main.py',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production',
        PYTHONPATH: '/home/husain/rolevate/livekit/agent11',
        PATH: '/home/husain/rolevate/livekit/venv/bin:' + process.env.PATH,
        LIVEKIT_AGENT_PORT: '8008'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/agent11-error.log',
      out_file: './logs/agent11-out.log',
      log_file: './logs/agent11-combined.log',
      time: true,
      interpreter: '/home/husain/rolevate/livekit/venv/bin/python'
    }
  ]
};
