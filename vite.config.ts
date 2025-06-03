import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  // Using base: '' will make asset paths relative.
  // This should allow the site to be hosted correctly under any subpath on GitHub Pages.
  base: '',
  plugins: [solid()],
});
