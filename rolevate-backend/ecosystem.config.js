module.exports = {
  apps: [{
    name: "rolevate-backend",
    script: "npm",
    args: "run start:prod",
    instances: "1",
    exec_mode: "fork",
    watch: false,
    env: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
    }
  }]
};
