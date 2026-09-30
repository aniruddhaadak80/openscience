import { test, expect } from "bun:test"
import { BashArity } from "../../src/permission/arity"

test("arity 1 - unknown commands default to first token", () => {
  expect(BashArity.prefix(["unknown", "command", "subcommand"])).toEqual(["unknown"])
  expect(BashArity.prefix(["touch", "foo.txt"])).toEqual(["touch"])
})

test("arity 2 - two token commands", () => {
  expect(BashArity.prefix(["git", "checkout", "main"])).toEqual(["git", "checkout"])
  expect(BashArity.prefix(["docker", "run", "nginx"])).toEqual(["docker", "run"])
})

test("arity 3 - three token commands", () => {
  expect(BashArity.prefix(["aws", "s3", "ls", "my-bucket"])).toEqual(["aws", "s3", "ls"])
  expect(BashArity.prefix(["npm", "run", "dev", "script"])).toEqual(["npm", "run", "dev"])
})

test("longest match wins - nested prefixes", () => {
  expect(BashArity.prefix(["docker", "compose", "up", "service"])).toEqual(["docker", "compose", "up"])
  expect(BashArity.prefix(["consul", "kv", "get", "config"])).toEqual(["consul", "kv", "get"])
})

test("exact length matches", () => {
  expect(BashArity.prefix(["git", "checkout"])).toEqual(["git", "checkout"])
  expect(BashArity.prefix(["npm", "run", "dev"])).toEqual(["npm", "run", "dev"])
})

test("edge cases", () => {
  expect(BashArity.prefix([])).toEqual([])
  expect(BashArity.prefix(["single"])).toEqual(["single"])
  expect(BashArity.prefix(["git"])).toEqual(["git"])
})

test("flags are not counted as subcommand tokens", () => {
  // The generated dictionary's own rule: flags never count, only subcommands.
  // Counting one pinned it into the grant and dropped the real subcommand.
  expect(BashArity.prefix(["git", "--no-pager", "log"])).toEqual(["git", "log"])
  expect(BashArity.prefix(["docker", "--config", "run", "nginx"])).toEqual(["docker", "run"])
  expect(BashArity.prefix(["npm", "--silent", "run", "dev"])).toEqual(["npm", "run", "dev"])
})

test("a command that is only flags still yields its own name", () => {
  expect(BashArity.prefix(["ls", "-la"])).toEqual(["ls"])
  expect(BashArity.prefix(["-la"])).toEqual(["-la"])
})
