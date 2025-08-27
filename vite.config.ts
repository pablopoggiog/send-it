import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// biome-ignore lint/style/noDefaultExport: keep default export
export default defineConfig({
  plugins: [react()],
});
