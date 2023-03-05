import { defineConfig } from 'astro/config'
import unocss from 'unocss/astro'
import { presetUno } from 'unocss'
import presetAttributify from '@unocss/preset-attributify'
import presetTypography from '@unocss/preset-typography'
import solidJs from '@astrojs/solid-js'
import reactJs from '@astrojs/react-js' // 添加这一行
import vercelDisableBlocks from './plugins/vercelDisableBlocks'

import node from '@astrojs/node'
import vercel from '@astrojs/vercel/edge'

const envAdapter = () => {
  if (process.env.OUTPUT == 'vercel') {
    return vercel()
  } else {
    return node({
      mode: 'standalone'
    })
  }
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    unocss({
      presets: [
        presetAttributify(),
        presetUno(),
        presetTypography(),
      ]
    }),
    solidJs(),
    reactJs() // 添加这一行
  ],
  output: 'server',
  adapter: envAdapter(),
  vite: {
    plugins: [
      process.env.OUTPUT == 'vercel' && vercelDisableBlocks(),
    ]
  },
});