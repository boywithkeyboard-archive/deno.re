import { transform } from 'esbuild'

export async function minify(str: string) {
  const result = await transform(str, {
    minify: true,
    platform: 'neutral',
    format: 'esm'
  })

  return result.code
}
