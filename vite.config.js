import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
      },
      '/upbit-ws': {
        target: 'https://api.upbit.com',
        ws: true,               // WebSocket 업그레이드 허용
        changeOrigin: true,     // Host 헤더를 target 호스트로 변경
        secure: true,           // SSL 인증서 검증 여부 (https 대상이니 true)
        rewrite: path => path.replace(/^\/upbit-ws/, '/websocket/v1')
      }
    },
  },
});
