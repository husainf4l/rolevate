module.exports = {
    apps: [
        {
            name: 'rolevate-backend',
            script: 'dist/src/main.js',
            cwd: '/home/husain/rolevate/rolevate-backend',
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 4005
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 4005
            },
            log_file: './logs/combined.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            // Restart policy
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: '10s',
            // Health monitoring
            health_check_http: {
                url: 'http://localhost:4005/health',
                interval: 30000,
                timeout: 5000
            }
        }
    ]
};
