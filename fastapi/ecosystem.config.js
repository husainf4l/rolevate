module.exports = {
  apps: [{
    name: "fastapi-rolevate",
    script: "/home/husain/rolevate/fastapi/venv/bin/python",
    args: "-m uvicorn main:app --host 0.0.0.0 --port 8000",
    cwd: "/home/husain/rolevate/fastapi",
    env: {
      NODE_ENV: "production",
      ENVIRONMENT: "production"
    },
    watch: false,
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "500M"
  }]
}
