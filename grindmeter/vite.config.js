import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const REQUIRED_ENV = [
  'VITE_API_KEY',
  'VITE_AUTH_DOMAIN',
  'VITE_PROJECT_ID',
  'VITE_STORAGE_BUCKET',
  'VITE_MESSAGING_SENDER_ID',
  'VITE_APP_ID',
  'VITE_MEASUREMENT_ID',
]

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    // Without these the app crashes on load and renders a blank page.
    const env = loadEnv(mode, process.cwd())
    const missing = REQUIRED_ENV.filter((name) => !env[name])
    if (missing.length > 0) {
      throw new Error(
        `Missing Firebase config: ${missing.join(', ')}. Add to grindmeter/.env ` +
          '(values: firebase apps:sdkconfig WEB).',
      )
    }
  }

  return {
    plugins: [react()],
  }
})
