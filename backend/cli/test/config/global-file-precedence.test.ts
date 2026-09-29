import { expect, test } from "bun:test"
import path from "node:path"
import fs from "node:fs/promises"
import { Config } from "../../src/config/config"
import { Global } from "../../src/global"

const write = (name: string, body: unknown) =>
  Bun.write(path.join(Global.Path.config, name), typeof body === "string" ? body : JSON.stringify(body))

test("openscience.json overrides openscience.jsonc in the global config", async () => {
  // CONFIG_FILES documents the order as "oldest first: later merges win, so
  // the legacy names load as the base and openscience.json(c) overrides them",
  // and the project-config path follows that list. The global loader listed
  // these two the other way round.
  await write("openscience.jsonc", '{ "model": "model-from-the-jsonc-file" }')
  await write("openscience.json", '{ "model": "model-from-the-json-file" }')
  try {
    // Config.global is a lazy singleton shared by every test file in the
    // worker, so an earlier file may already have resolved it against an
    // empty config directory. config.test.ts's global-writes block resets
    // it for the same reason; without a reset here the read below can
    // observe that stale cache instead of the files just written.
    Config.global.reset()
    const global = await Config.global()
    expect(global.model).toBe("model-from-the-json-file")
  } finally {
    await fs.rm(path.join(Global.Path.config, "openscience.json"), { force: true })
    await fs.rm(path.join(Global.Path.config, "openscience.jsonc"), { force: true })
    Config.global.reset()
  }
})
