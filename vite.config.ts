/// <reference types="vitest" />
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  // Using base: '' will make asset paths relative.
  // This should allow the site to be hosted correctly under any subpath on GitHub Pages.
  base: '',
  plugins: [solidPlugin()],
  test: {
    globals: true,
    environment: 'jsdom', // or 'happy-dom'
    setupFiles: [], // if you need setup files
    transformMode: { web: [/\[jt]sx?$/] }, // To process Solid's JSX
    deps: { // To ensure Solid's reactivity works in tests
      optimizer: {
        web: { include: ['solid-js'] }
      }
    }
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});
