import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    server: { 
      deps: {
        // https://github.com/vercel/next.js/issues/77200
        inline: ['next-intl']
      }
    },
    environment: 'jsdom',
    coverage: {
      include: [
        'src/**',
      ],
      exclude: [
        'src/app/layout.tsx',
        'src/**/index.ts',
      ],
    },
  },
})