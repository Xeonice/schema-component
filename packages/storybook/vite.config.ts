import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@schema-component/schema': path.resolve(__dirname, '../schema/src'),
      '@schema-component/engine': path.resolve(__dirname, '../engine/src'),
      '@schema-component/theme': path.resolve(__dirname, '../theme/src')
    }
  }
})
