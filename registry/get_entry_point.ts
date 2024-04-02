export function getEntryPoint(fileMap: Record<string, string>, path: string): string | null {
  if (path === '/') {
    path = ''
  }

  const validEntryPoints = [
    '/mod.ts',
    '/mod.mts',
    '/mod.tsx',
    '/mod.js',
    '/mod.mjs',
    '/mod.jsx',
    '/index.ts',
    '/index.mts',
    '/index.tsx',
    '/index.js',
    '/index.mjs',
    '/index.jsx'
  ]

  for (const entryPoint of validEntryPoints) {
    if (fileMap[path + entryPoint]) {
      return path + entryPoint
    }
  }

  return null
}
