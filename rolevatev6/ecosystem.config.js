module.exports = {
  apps: [
    {
      name: 'rolevate-v6',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3005',
      cwd: '/home/husain/rolevate/rolevatev6',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true
    }
  ]
};
