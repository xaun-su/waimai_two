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
  },
  server: {
    proxy:{
      '/api':{
        target:'http://8.137.157.16:9002',     //目标地址(真正的服务器地址)
         changeOrigin:true,      //是否支持跨域  true  （是否欺骗浏览器）
      rewrite:(path) => path.replace('/api', '') 
    }
  }
}
});