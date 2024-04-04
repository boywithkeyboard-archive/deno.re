export function delay(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export function deadline<T>(p: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController()
  
  const d = delay(ms)
    .catch(() => {})
    .then(() => Promise.reject(new Error()))
    
  return Promise.race([p.finally(() => controller.abort()), d])
}
