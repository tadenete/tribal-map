import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  if (mode === 'dev') {
    return {
      plugins: [vue()],
      base: 'li/tribalmapdev/',
      build: {
        rollupOptions: {
          input: {
            main: 'index.html',
            releasenotes: 'releasenotes.html'
          }
        }
      },
    }
  } else if (mode === 'qat') {
    return {
      plugins: [vue()],
      base: 'li/tribalmapqat/',
      build: {
        rollupOptions: {
          input: {
            main: 'index.html',
            releasenotes: 'releasenotes.html'
          }
        }
      },
    }
  } else if (mode === 'prod') {
    return {
      plugins: [vue()],
      base: 'li/tribalmap/',
      build: {
        rollupOptions: {
          input: {
            main: 'index.html',
            releasenotes: 'releasenotes.html'
          }
        }
      },
    }
  } else {
    return {
      plugins: [vue()],
      base: 'li/tribalmap/',
      build: {
        rollupOptions: {
          input: {
            main: 'index.html',
            releasenotes: 'releasenotes.html'
          }
        }
      }
    }
  }
});
