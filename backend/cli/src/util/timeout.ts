export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeout: NodeJS.Timeout
  return Promise.race([
    // finally, not then: a rejection skips a then arm and would leave the timer
    // pending, holding the event loop open for the full ms after the caller
    // already saw the error. A dead MCP or LSP server is the common case.
    promise.finally(() => {
      clearTimeout(timeout)
    }),
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`))
      }, ms)
    }),
  ])
}
