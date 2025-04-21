import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 引入 Node.js 核心模块 path

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // 配置 @ 指向 src 目录
    }
  }
});