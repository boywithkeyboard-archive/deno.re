import { createHash } from 'node:crypto'

export function hash(str: string) {
  const h = createHash('sha256')

  h.update(str)

  return h.digest('hex')
}
