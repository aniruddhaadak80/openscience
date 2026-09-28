import { describe, expect, test } from "bun:test"
import os from "node:os"
import path from "node:path"
import { expandPath } from "../../src/server/routes/folder-resolve"

describe("folder-resolve expandPath", () => {
  test("a Windows file URL keeps its drive letter exactly once", () => {
    // URL.pathname yields "/C:/Users/me", which resolves to "C:\C:\Users\me".
    expect(expandPath("file:///C:/Users/me/Desktop")).toBe(path.resolve("C:/Users/me/Desktop"))
  })

  test("a percent-escaped file URL decodes to the real path", () => {
    expect(expandPath("file:///C:/Users/me/My%20Files")).toBe(path.resolve("C:/Users/me/My Files"))
    expect(expandPath("file:///C:/work/100%25")).toBe(path.resolve("C:/work/100%"))
  })

  test("a file URL with a stray percent does not throw", () => {
    // decodeURIComponent threw URIError, which surfaced as a failed request
    // rather than as a path that simply does not exist.
    expect(() => expandPath("file:///C:/work/a%zz")).not.toThrow()
  })

  test("a POSIX file URL resolves normally", () => {
    expect(expandPath("file:///home/me/data")).toBe(path.resolve("/home/me/data"))
  })

  test("a plain path and a tilde path are unchanged", () => {
    expect(expandPath("C:/Users/me/Desktop")).toBe(path.resolve("C:/Users/me/Desktop"))
    expect(expandPath("~/projects")).toBe(path.join(os.homedir(), "projects"))
    expect(expandPath("~")).toBe(os.homedir())
    expect(expandPath("")).toBe("")
  })
})
