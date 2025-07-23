module.exports = {
    apps: [
        {
            name: 'rolevate-frontend',
            script: 'npm',
            args: 'run dev',
            cwd: '/home/husain/rolevate/rolevate-front',
            env: {
                NODE_ENV: 'development',
                PORT: 3005
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true
        }
    ]
};
