import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var command = _a.command, mode = _a.mode;
    // 加载环境变量
    var env = loadEnv(mode, process.cwd(), '');
    console.log('环境变量:', env.VITE_API_URL);
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
            },
        },
        server: {
            port: 80,
            open: true,
            proxy: {
                '/api': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                    rewrite: function (path) { return path.replace(/^\/api/, ''); }, // 移除/api前缀
                    secure: false,
                },
            },
        },
    };
});
