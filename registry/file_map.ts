import { ensureDir } from 'fs-extra'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rimraf } from 'rimraf'
import slash from 'slash'
import * as tar from 'tar'
import { compress, decompress } from './gzip'
import { s3 } from './s3'

const sha1Pattern = /^[0-9a-f]{40}$/

type FileMap = Record<string, string>

export async function createFileMap(user: string, repo: string, tag: string): Promise<FileMap | null> {
  const res = await fetch(
    'https://github.com/' + user + '/' + repo + (
      sha1Pattern.test(tag) ? '/archive/' : '/archive/refs/tags/'
    ) + tag + '.tar.gz'
  )

  if (!res.ok) {
    await res.body?.cancel()

    return null
  }

  const buf = await res.arrayBuffer()

  if (buf.byteLength > 10_000_000) { // 10 MB
    return null
  }

  let tmpDirPath = await mkdtemp(join(tmpdir(), crypto.randomUUID()))

  tmpDirPath = slash(tmpDirPath)

  await writeFile(tmpDirPath + '/archive.tar.gz', Buffer.from(buf))

  const map: FileMap = {}

  await tar.x({
    C: tmpDirPath,
    file: tmpDirPath + '/archive.tar.gz',
    filter(path, stat) {
      // @ts-expect-error
      if (stat.type !== 'File') {
        return true
      }
  
      const arr = path.split('.')
      const ext = arr[arr.length - 1]
  
      return ['js', 'mjs', 'jsx', 'ts', 'mts', 'tsx', 'json', 'wasm'].includes(ext)
    },
    onentry(entry) {
      if (entry.type === 'File') {
        const path = entry.path.substring(entry.path.indexOf('/'))

        const content = entry.read()

        if (content && content.byteLength > 0) {
          map[path] = content.toString('base64')
        }
      }
    }
  })

  await rimraf(tmpDirPath)

  return map
}

export async function getFileMap(user: string, repo: string, tag: string): Promise<FileMap | null> {
  await ensureDir('./cache')

  const mapName = Buffer.from(user + '_' + repo + '_' + tag).toString('hex')
  let str

  try {
    // check if file map is in local cache
    str = await readFile('./cache/' + mapName, 'utf-8')

    return JSON.parse(str)
  } catch (err) {
    // check if file map is in remote cache
    const res = await fetch('https://cache.deno.re/' + mapName)

    if (res.ok) {
      const buf = await decompress(
        await res.arrayBuffer()
      )

      await writeFile('./cache/' + mapName, buf)

      return JSON.parse(buf.toString('utf-8'))
    } else {
      await res.body?.cancel()
    }

    // generate file map
    const map = await createFileMap(user, repo, tag)

    if (!map) {
      return null
    }

    await writeFile('./cache/' + mapName, JSON.stringify(map))

    await s3.putObject({
      Bucket: 'deno',
      Key: mapName,
      Body: await compress(JSON.stringify(map))
    })

    return map
  }
}
