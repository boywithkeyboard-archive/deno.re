export function resolveTypeHeader(fileMap: Record<string, string>, path: string): string | undefined {
  if (
    path.endsWith('.json') ||
    path.endsWith('.tsx') ||
    path.endsWith('.ts') ||
    path.endsWith('.mts') ||
    path.endsWith('.wasm')
  ) {
    return
  }

  const pathWithoutExt = path.split('.').slice(0, -1).join('.')

  if (fileMap[pathWithoutExt + '.d.ts']) {
    return pathWithoutExt + '.d.ts'
  }

  if (fileMap[pathWithoutExt + '.d.mts']) {
    return pathWithoutExt + '.d.mts'
  }
}
