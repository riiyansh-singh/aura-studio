import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️  IMPORTANT: Change 'aura-studio' to your actual GitHub repo name
// Example: if your repo URL is github.com/yourname/my-fashion-app
// then set base: '/my-fashion-app/'

export default defineConfig({
  plugins: [react()],
  base: '/aura-studio/',
})
