import { defineConfig } from 'astro/config';
import unocss from 'unocss/astro';
import { presetUno } from 'unocss';
import presetAttributify from '@unocss/preset-attributify';
import presetTypography from '@unocss/preset-typography';
import solidJs from '@astrojs/solid-js';
import vercelDisableBlocks from './plugins/vercelDisableBlocks';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel/edge';
import react from "@astrojs/react";
const envAdapter = () => {
  if (process.env.OUTPUT == 'vercel') {
    return vercel();
  } else {
    return node({
      mode: 'standalone'
    });
  }
};

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
  integrations: [unocss({
    presets: [presetAttributify(), presetUno(), presetTypography()]
  }), solidJs(), react()],
  output: 'server',
  adapter: envAdapter(),
  vite: {
    plugins: [process.env.OUTPUT == 'vercel' && vercelDisableBlocks()]
  }
});