import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    legacy({
      targets: ['defaults', 'not IE 11', 'Safari 12'],
    }),
  ],
  build: {
    target: 'es2015',
  },
})
