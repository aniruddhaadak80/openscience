import { describe, expect, jest, test } from "bun:test"
import { withTimeout } from "../../src/util/timeout"

describe("util.timeout", () => {
  test("should resolve when promise completes before timeout", async () => {
    const fastPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("fast"), 10)
    })

    const result = await withTimeout(fastPromise, 100)
    expect(result).toBe("fast")
  })

  test("should reject when promise exceeds timeout", async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("slow"), 200)
    })

    await expect(withTimeout(slowPromise, 50)).rejects.toThrow("Operation timed out after 50ms")
  })

  test("should clear the timer when the promise rejects", async () => {
    jest.useFakeTimers()
    try {
      await expect(withTimeout(Promise.reject(new Error("upstream died")), 60_000)).rejects.toThrow("upstream died")
      expect(jest.getTimerCount()).toBe(0)
    } finally {
      jest.useRealTimers()
    }
  })
})
