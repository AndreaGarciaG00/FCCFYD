import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const ghPagesBase = repoName ? `/${repoName}/` : '/'
const base = process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS === 'true' ? ghPagesBase : '/')

export default defineConfig({
  plugins: [react()],
  base,
})
