import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function* walkDirectory(path: string): AsyncIterableIterator<string> {
  const dirents = await readdir(path, { withFileTypes: true })

  for (const dirent of dirents) {
    const res = resolve(path, dirent.name)

    if (dirent.isDirectory()) {
      yield* walkDirectory(res)
    } else {
      yield res
    }
  }
}
