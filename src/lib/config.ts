import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { miraRoot } from "./paths.js";

const configSchema = z.object({
  dashboardPort: z.number().int().default(3838),
  runner: z.enum(["claude", "opencode"]).nullable().default(null),
  timeouts: z
    .object({
      personaRunMs: z.number().int().default(1_800_000),
    })
    .default({}),
  maxBuildCycles: z.number().int().default(3),
});

export type Config = z.infer<typeof configSchema>;

export function readConfig(projectRoot: string): Config {
  const file = path.join(miraRoot(projectRoot), "config.json");
  if (!fs.existsSync(file)) return configSchema.parse({});
  try {
    return configSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    return configSchema.parse({});
  }
}

export function writeDefaultConfigIfMissing(projectRoot: string): void {
  const file = path.join(miraRoot(projectRoot), "config.json");
  if (fs.existsSync(file)) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const defaults: Config = configSchema.parse({});
  fs.writeFileSync(file, JSON.stringify(defaults, null, 2) + "\n", "utf8");
}
