import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  srcDir: './www/src',
  publicDir: './www/public',
  outDir: './build'
})
