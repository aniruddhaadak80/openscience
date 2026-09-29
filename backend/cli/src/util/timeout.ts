export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeout: NodeJS.Timeout
  // `finally` settles on both paths. Clearing only in `then` left the timer armed
  // when the guarded promise rejected, so every MCP call that failed held the
  // loop open for the rest of the configured timeout.
  const guarded = promise.finally(() => clearTimeout(timeout))
  return Promise.race([
    guarded,
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`))
      }, ms)
    }),
  ])
}
