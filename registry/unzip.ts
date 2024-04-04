import { unzip as _unzip, type Unzipped } from 'fflate'

export function unzip(buf: ArrayBuffer) {
  const promise = new Promise<Unzipped>((resolve, reject) => {
    _unzip(new Uint8Array(buf), (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  return promise
}
