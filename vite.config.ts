import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  // The base path should correspond to the GitHub repository name
  // For example, if your repository is https://github.com/username/my-repo,
  // then base should be '/my-repo/'
  // IMPORTANT: Replace 'ieee754-solidjs-simulator' with your actual repository name.
  base: '/ieee754-solidjs-simulator/',
  plugins: [solid()],
});
