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
    const global = await Config.global()
    expect(global.model).toBe("model-from-the-json-file")
  } finally {
    await fs.rm(path.join(Global.Path.config, "openscience.json"), { force: true })
    await fs.rm(path.join(Global.Path.config, "openscience.jsonc"), { force: true })
  }
})
