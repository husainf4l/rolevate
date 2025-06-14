module.exports = {
  apps: [{
    name: "fastapi-rolevate",
    script: "uvicorn",
    args: "main:app --host 0.0.0.0 --port 8000",
    interpreter: "/home/husain/rolevate/fastapi/venv/bin/python",
    env: {
      NODE_ENV: "production",
      ENVIRONMENT: "production"
    },
    watch: false,
    instances: "max",
    exec_mode: "cluster",
    max_memory_restart: "500M"
  }]
}
