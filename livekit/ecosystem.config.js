module.exports = {
  apps: [{
    name: "livekit-agent",
    script: "venv/bin/python",
    args: "agent.py start",
    cwd: "/home/husain/rolevate/livekit",
    watch: false,
    env: {
      "PYTHONUNBUFFERED": "1",
      "PYTHONOPTIMIZE": "2"
    },
    log_file: "pm2_agent.log",
    error_file: "pm2_error.log",
    out_file: "pm2_output.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  }]
}
