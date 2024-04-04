import assert from 'node:assert'
import test from 'node:test'

async function fetchStr(url) {
  const res = await fetch(url)

  if (!res.ok) {
    await res.body.cancel()

    return null
  }

  return await res.text()
}

async function fetchJson(url) {
  const res = await fetch(url)

  if (!res.ok) {
    await res.body.cancel()

    return null
  }

  return await res.json()
}

test('latest tag', async () => {
  const latestTag = (await fetchJson('https://api.github.com/repos/esbuild/deno-esbuild/tags'))[0].name

  const res = await fetch('http://localhost:3000/esbuild/deno-esbuild/mod.js', {
    redirect: 'manual'
  })

  await res.body.cancel()

  assert.strictEqual(res.headers.get('location'), `https://deno.re/esbuild/deno-esbuild@${latestTag}/mod.js`)
})

test('specific commit', async () => {
  const actual = await fetchStr('http://localhost:3000/esbuild/deno-esbuild@d4ebc0f33d39d5b8cc94eec4b1a94ce5b388cd6f/mod.js')
  const expected = await fetchStr('https://raw.githubusercontent.com/esbuild/deno-esbuild/d4ebc0f33d39d5b8cc94eec4b1a94ce5b388cd6f/mod.js')

  assert.strictEqual(actual, expected)
})

test('specific tag', async () => {
  const actual = await fetchStr('http://localhost:3000/esbuild/deno-esbuild@v0.19.0/mod.js')
  const expected = await fetchStr('https://raw.githubusercontent.com/esbuild/deno-esbuild/v0.19.0/mod.js')

  assert.strictEqual(actual, expected)
})

test('omit entry point', async () => {
  const actual = await fetchStr('http://localhost:3000/esbuild/deno-esbuild@v0.20.0')

  assert.strictEqual(actual, `export * from 'https://deno.re/esbuild/deno-esbuild@v0.20.0/mod.js'`)
})

test('type header', async () => {
  const res = await fetch('http://localhost:3000/esbuild/deno-esbuild@v0.20.0/mod.js')

  await res.body.cancel()

  assert.strictEqual(res.headers.get('x-typescript-types'), `https://deno.re/esbuild/deno-esbuild@v0.20.0/mod.d.ts`)
})
