module.exports = {
  apps: [
    {
      name: 'livekit-agent15',
      cwd: '/Users/al-husseinabdullah/Desktop/rolevate/livekit',
      script: './agent15/main.py',
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
        PYTHONPATH: '/Users/al-husseinabdullah/Desktop/rolevate/livekit/agent15',
        PATH: '/Users/al-husseinabdullah/Desktop/rolevate/livekit/venv/bin:' + process.env.PATH,
        LIVEKIT_AGENT_PORT: '8008'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/agent15-error.log',
      out_file: './logs/agent15-out.log',
      log_file: './logs/agent15-combined.log',
      time: true,
      interpreter: '/Users/al-husseinabdullah/Desktop/rolevate/livekit/venv/bin/python'
    }
  ]
};
