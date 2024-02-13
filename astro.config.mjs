import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind(), svelte()],
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        "three/examples/jsm/controls/OrbitControls":
          "three/examples/jsm/controls/OrbitControls.js",
      },
    },
    ssr: { noExternal: ["postprocessing"] },
  },
});
