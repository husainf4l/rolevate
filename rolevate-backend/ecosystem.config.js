module.exports = {
    apps: [
        {
            name: 'rolevate-backend',
            script: 'start-with-memory.js',
            cwd: '/home/husain/rolevate/rolevate-backend',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '10G',
            node_args: ['--max-old-space-size=8192'],
            env: {
                NODE_ENV: 'production',
                PORT: 4005,
                NODE_OPTIONS: '--max-old-space-size=8192'
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 4005,
                NODE_OPTIONS: '--max-old-space-size=8192'
            },
            log_file: './logs/combined.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            // Restart policy
            restart_delay: 4000,
            max_restarts: 15,
            min_uptime: '30s',
            // Memory monitoring
            autorestart: true,
            kill_timeout: 3000,
            listen_timeout: 8000,
            // Force garbage collection
            force_stop: true,
            // Health monitoring
            health_check_http: {
                url: 'http://localhost:4005/health',
                interval: 30000,
                timeout: 5000
            }
        }
    ]
};
