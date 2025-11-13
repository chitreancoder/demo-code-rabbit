import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ['es'],
      fileName: () => 'main.js'
    },
    rollupOptions: {
      external: [
        'express',
        'mongoose',
        'body-parser',
        'cors',
        'dotenv',
        'nodemon',
        /^node:.*/
      ]
    },
    target: 'node18',
    ssr: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});

