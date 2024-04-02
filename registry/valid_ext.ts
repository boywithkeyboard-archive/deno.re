export function validExt(path: string) {
  const arr = path.split('.')
  const ext = arr[arr.length - 1]
  
  return ['js', 'mjs', 'jsx', 'ts', 'mts', 'tsx', 'json', 'wasm'].includes(ext)
}
