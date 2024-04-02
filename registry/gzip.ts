import { gunzip, gzip } from 'node:zlib'

export function compress(data: Parameters<typeof gzip>[0]) {
  const promise = new Promise<Buffer>((resolve, reject) => {
    gzip(data, {}, (err, res) => {
      if (!err) {
        resolve(res)
      } else {
        reject(err)
      }
    })
  })

  return promise
}

export function decompress(data: Parameters<typeof gunzip>[0]) {
  const promise = new Promise<Buffer>((resolve, reject) => {
    gunzip(data, {}, (err, res) => {
      if (!err) {
        resolve(res)
      } else {
        reject(err)
      }
    })
  })

  return promise
}
