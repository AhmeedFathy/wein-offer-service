import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    {
      name: 'copy-legacy-portal-script',
      apply: 'build',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'assets/portal.js',
          source: readFileSync(resolve(__dirname, 'src/legacy/portal.js'), 'utf8'),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'assets/chat-styles.css',
          source: readFileSync(resolve(__dirname, 'src/features/chat/chat-styles.css'), 'utf8'),
        });
      },
    },
  ],
  build: {
    outDir: 'portal/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
