import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 4201,
        strictPort: true,
        allowedHosts: [
            'admin.rolevate.com',
            'localhost',
            '127.0.0.1'
        ]
    }
});
