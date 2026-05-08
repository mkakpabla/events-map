import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = process.env.VITE_API_URL || 'http://api:9000'

console.log(`API target: ${API_TARGET}`)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',

    allowedHosts: [
      'event-map.68.183.132.93.nip.io',
    ],

    proxy: {
      '/api': {
        target: "https://api.68.183.132.93.nip.io",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    host: '0.0.0.0',

    allowedHosts: [
      'event-map.68.183.132.93.nip.io',
    ],

    proxy: {
      '/api': {
        target: "https://api.68.183.132.93.nip.io/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
