import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import vuetify from 'vite-plugin-vuetify' // لو بتستخدم الإضافة الخاصة بـ vuetify

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // اختيارية حسب إعداد مشروعك
  ],
  resolve: {
    alias: {
      // هنا بنعرّف علامة @ لتشير إلى فولدر src
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
