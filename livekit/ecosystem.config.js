module.exports = {
  apps: [
    {
      name: 'livekit-agent12',
      cwd: '/home/husain/rolevate/livekit',
      script: './agent12/main.py',
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
        PYTHONPATH: '/home/husain/rolevate/livekit/agent12',
        PATH: '/home/husain/rolevate/livekit/venv/bin:' + process.env.PATH,
        LIVEKIT_AGENT_PORT: '8008'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/agent12-error.log',
      out_file: './logs/agent12-out.log',
      log_file: './logs/agent12-combined.log',
      time: true,
      interpreter: '/home/husain/rolevate/livekit/venv/bin/python'
    }
  ]
};
