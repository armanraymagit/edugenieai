import path from 'path';
import react from '@vitejs/plugin-react';

/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Base path for GitHub Pages (use repository name)
    // For custom domain or root deployment, set to '/'
    base: process.env.VITE_BASE_PATH || '/',

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.HUGGINGFACE_API_KEY': JSON.stringify(env.HUGGINGFACE_API_KEY || ''),
      'process.env.OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL || 'http://localhost:11434'),
      'process.env.OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL || 'llama3.2'),
      'process.env.OLLAMA_VISION_MODEL': JSON.stringify(env.OLLAMA_VISION_MODEL || 'llava')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Optimize build for production
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'markdown': ['react-markdown'],
            'charts': ['recharts'],
          }
        }
      }
    }
  };
});
