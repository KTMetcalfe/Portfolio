import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import svelte from '@astrojs/svelte';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [tailwind(), svelte(), react()],
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        'three/examples/jsm/postprocessing/RenderPass':
          'three/examples/jsm/postprocessing/RenderPass.js',
        'three/examples/jsm/controls/OrbitControls':
          'three/examples/jsm/controls/OrbitControls.js',
        'three/src/math/MathUtils': 'three/src/math/MathUtils.js',
      },
    },
  },
});
