import fastify, { type FastifyReply } from 'fastify'
import favicon from '../build/favicon.svg'
import html from '../build/index.html'
import { filePathToContentType } from './content_type'
import { getFileMap } from './file_map'
import { getEntryPoint } from './get_entry_point'
import { getLatestTag } from './get_latest_tag'
import { hash } from './hash'
import { minify } from './minify'
import { resolveTypeHeader } from './resolve_type_header'
import { validExt } from './valid_ext'

const app = fastify()

app.get('/', (_, res) => {
  res.header('Cache-Control', 's-max-age=1800, max-age=300')
  res.header('Content-Type', 'text/html; charset=utf-8')

  return html
})

app.get('/favicon.svg', (_, res) => {
  res.header('Cache-Control', 's-max-age=86400, max-age=3600')
  res.header('Content-Type', 'image/svg+xml; charset=utf-8')

  return favicon
})

app.get('/ready', () => 'READY')

async function respondWith(res: FastifyReply, statusCode: number, body: string | Buffer | null, options: {
  headers?: Record<string, string>
  resolve?: Promise<unknown>
} = {}) {
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      res.header(key, value)
    }
  }

  res.code(statusCode)
  await res.send(body)

  if (options.resolve) {
    await options.resolve
  }
}

app.setNotFoundHandler(async (req, res) => {
  try {
    if (req.method.toUpperCase() !== 'GET') {
      return await respondWith(res, 404, 'BAD METHOD')
    }

    let url = req.url

    if (
      /^\/(std|(([a-zA-Z0-9\-]+)\/([a-zA-Z0-9._\-]+)))(@[a-zA-Z0-9.*]+)?(\/([a-zA-Z0-9._\-]+))*$/.test(url) === false
    ) {
      return await respondWith(res, 404, 'BAD URL', {
        headers: {
          'Cache-Control': 's-max-age=60, max-age=0'
        }
      })
    }

    if (url.startsWith('/std')) {
      url = url.replace('/std', '/denoland/deno_std')
    }

    const arr = url.split('/')

    const user = arr[1]
    const repo = arr[2].split('@')[0]
    let tag = arr[2].split('@')[1]

    if (!tag) {
      const latestTag = await getLatestTag(user, repo)

      if (!latestTag) {
        return await respondWith(res, 404, 'REPOSITORY NOT FOUND', {
          headers: {
            'Cache-Control': 's-max-age=60, max-age=0'
          }
        })
      }

      arr[2] = arr[2] + '@' + latestTag

      return await respondWith(res, 307, null, {
        headers: {
          Location: process.env.BASE_URL + arr.join('/')
        }
      })
    }

    const { fileMap, resolve } = await getFileMap(user, repo, tag)

    if (!fileMap) {
      return await respondWith(res, 500, 'REPOSITORY OR TAG NOT FOUND', {
        headers: {
          'Cache-Control': 's-max-age=60, max-age=0'
        }
      })
    }

    let path = '/' + url.split('/').slice(3).join('/')
    const previousEtag = req.headers['if-none-match']

    let entryPoint = !validExt(path)
      ? getEntryPoint(fileMap, path)
      : path

    let content
    let minified = false

    if (/.*\.min\.(js|mjs|jsx)$/.test(path)) {
      const arr = path.split('.')
      const ext = arr.pop()

      if (!ext) {
        return await respondWith(res, 404, 'ENTRY POINT NOT FOUND', {
          headers: {
            'Cache-Control': 's-max-age=60, max-age=0'
          },
          resolve
        })
      }

      arr.pop()
      arr.push(ext)

      let originalContent = fileMap[arr.join('.')]
      entryPoint = arr.join('.')

      if (!originalContent) {
        return await respondWith(res, 404, 'ENTRY POINT NOT FOUND', {
          headers: {
            'Cache-Control': 's-max-age=60, max-age=0'
          },
          resolve
        })
      }

      minified = true
      originalContent = Buffer.from(originalContent, 'base64').toString('utf-8')

      content = await minify(originalContent)
    } else if (entryPoint) {
      content = fileMap[entryPoint]
    } else {
      return await respondWith(res, 404, 'ENTRY POINT NOT FOUND', {
        headers: {
          'Cache-Control': 's-max-age=60, max-age=0'
        },
        resolve
      })
    }

    if (!content) {
      return await respondWith(res, 404, 'FILE NOT FOUND', {
        headers: {
          'Cache-Control': 's-max-age=60, max-age=0'
        },
        resolve
      })
    }

    let contentType = filePathToContentType(entryPoint)
  
    if (!minified) {
      if (validExt(path)) {
        content = Buffer.from(content, 'base64').toString('utf-8')
      } else if (entryPoint.endsWith('ts')) {
        contentType = filePathToContentType('.ts')
        content = `export * from '${process.env.BASE_URL}/${user}/${repo}@${tag}${entryPoint}'`
      } else {
        contentType = filePathToContentType('.js')
        content = `export * from '${process.env.BASE_URL}/${user}/${repo}@${tag}${entryPoint}'`
      }
    }

    const checksum = `"${hash(content)}"`
    const typeHeader = resolveTypeHeader(fileMap, entryPoint)

    if (previousEtag === checksum) {
      return await respondWith(res, 304, null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=2592000, immutable', // a month
          'Content-Type': contentType + '; charset=utf-8',
          'ETag': checksum,
          ...(typeHeader && { 'X-TypeScript-Types': process.env.BASE_URL + '/' + user + '/' + repo + '@' + tag + typeHeader })
        },
        resolve
      })
    }

    await respondWith(res, 200, content, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=2592000, immutable', // a month
        'Content-Type': contentType + '; charset=utf-8',
        'ETag': checksum,
        ...(typeHeader && { 'X-TypeScript-Types': process.env.BASE_URL + '/' + user + '/' + repo + '@' + tag + typeHeader })
      },
      resolve
    })
  } catch (err) {
    console.error(err)

    await respondWith(res, 500, 'SOMETHING WENT WRONG', {
      headers: {
        'Cache-Control': 's-max-age=60, max-age=0'
      }
    })
  }
})

const start = async () => {
  try {
    await app.listen({
      host: '0.0.0.0',
      port: parseInt(process.env.PORT ?? '3000')
    })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
