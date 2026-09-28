import { describe, expect, test } from "bun:test"
import { Config } from "../../src/config/config"

const local = (command: unknown) => ({ type: "local", command })

describe("Config.McpLocal", () => {
  test("accepts a command with an executable and arguments", () => {
    expect(Config.McpLocal.safeParse(local(["npx", "-y", "server"])).success).toBe(true)
  })

  test("rejects an empty command, which has no executable to run", () => {
    // The array is destructured as `const [cmd, ...args] = mcp.command`, so an
    // empty list launches a server with `file: undefined`.
    expect(Config.McpLocal.safeParse(local([])).success).toBe(false)
  })

  test("rejects a non-array command", () => {
    expect(Config.McpLocal.safeParse(local("npx -y server")).success).toBe(false)
  })

  test("rejects a command whose entries are not all strings", () => {
    expect(Config.McpLocal.safeParse(local(["npx", 42])).success).toBe(false)
  })

  test("reports why the command was rejected", () => {
    const result = Config.McpLocal.safeParse(local([]))
    expect(result.success).toBe(false)
    if (result.success) return
    expect(JSON.stringify(result.error.issues)).toContain("command")
  })
})
