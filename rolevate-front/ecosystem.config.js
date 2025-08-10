module.exports = {
    apps: [
        {
            name: 'rolevate-frontend',
            script: './start-with-memory.js',
            cwd: '/home/husain/rolevate/rolevate-front',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '2G',
            node_args: ['--max-old-space-size=2048'],
            env: {
                NODE_ENV: 'production',
                PORT: 3005,
                NODE_OPTIONS: '--max-old-space-size=2048'
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3005,
                NODE_OPTIONS: '--max-old-space-size=2048'
            },
            log_file: './logs/combined.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            // Restart policy
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: '30s',
            // Memory monitoring
            autorestart: true,
            kill_timeout: 3000,
            listen_timeout: 8000,
            // Force garbage collection
            force_stop: true
        }
    ]
};
