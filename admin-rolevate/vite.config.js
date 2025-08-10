import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 4201,
        allowedHosts: [
            'admin.rolevate.com',
            'localhost'
        ]
    }
});
