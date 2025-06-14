module.exports = {
  apps: [{
    name: "livekit-agent",
    script: "./pm2_start_agent.sh",
    cwd: "/home/husain/rolevate/livekit",
    watch: false,
    env: {
      "NODE_ENV": "production",
      "PYTHONOPTIMIZE": 2,
      "PYTHONUNBUFFERED": 1,
      "PYTHONIOENCODING": "utf-8",
      "PYTHONHASHSEED": "42", // For more deterministic behavior
    },
    // Set heap memory to 1GB
    node_args: "--max-old-space-size=1024",
    // PM2 will restart the app if it uses more than 1GB of memory
    max_memory_restart: "1024M",
    // Restart on file changes (useful for development)
    watch: false,
    // Auto restart if app crashes
    autorestart: true,
    // Delay between automatic restarts
    restart_delay: 1000,
    // Increase the timeout for slow operations
    kill_timeout: 10000,
    // Keep at least 3 logs of 10MB each
    log_file: "pm2_agent.log",
    error_file: "pm2_error.log",
    out_file: "pm2_output.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  }]
}
