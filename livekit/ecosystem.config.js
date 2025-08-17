module.exports = {
  apps: [
    {
      name: 'livekit-agent15',
      cwd: '/home/husain/rolevate/livekit',
      script: './agent15/main.py',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '4G',
      min_uptime: '5s',
      max_restarts: 5,
      restart_delay: 1000,
      kill_timeout: 5000,
      exec_mode: 'fork',
      // Performance optimizations
      merge_logs: false,
      combine_logs: false,
      // Disable PM2 features that add overhead
      pmx: false,
      automation: false,
      vizion: false,
      env: {
        NODE_ENV: 'production',
        PYTHONPATH: '/home/husain/rolevate/livekit/agent15',
        PATH: '/home/husain/rolevate/livekit/venv/bin:' + process.env.PATH,
        LIVEKIT_AGENT_PORT: '8008',
        // Performance environment variables
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
        OMP_NUM_THREADS: '4',
        MKL_NUM_THREADS: '4'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/agent15-error.log',
      out_file: './logs/agent15-out.log',
      log_file: './logs/agent15-combined.log',
      time: true,
      interpreter: '/home/husain/rolevate/livekit/venv/bin/python'
    }
  ]
};
