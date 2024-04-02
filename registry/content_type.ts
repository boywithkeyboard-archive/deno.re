export function filePathToContentType(filePath: string) {
  return filePath.endsWith('.jsx')
    ? 'text/jsx'
    : filePath.endsWith('.tsx')
    ? 'text/tsx'
    : filePath.endsWith('.js') || filePath.endsWith('.mjs')
    ? 'text/javascript'
    : filePath.endsWith('.ts') || filePath.endsWith('.mts')
    ? 'text/typescript'
    : filePath.endsWith('.json')
    ? 'application/json'
    : filePath.endsWith('.wasm')
    ? 'application/wasm'
    : 'text/plain'
}
