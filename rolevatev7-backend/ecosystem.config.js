module.exports = {
  apps: [{
    name: 'rolevate-backend',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4005
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4005
    }
  }]
};