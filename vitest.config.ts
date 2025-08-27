import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// biome-ignore lint/style/noDefaultExport: keep default export
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
  },
});
