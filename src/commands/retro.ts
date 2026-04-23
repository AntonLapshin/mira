import fs from "node:fs";
import path from "node:path";
import { miraRoot, buildsDir } from "../lib/paths.js";
import { readConfig } from "../lib/config.js";
import { detectRunner } from "../lib/runner.js";
import { spawnPersona } from "../lib/persona.js";

export interface RetroOptions {
  runner?: string;
  projectRoot?: string;
}

export async function runRetro(opts: RetroOptions = {}): Promise<void> {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const config = readConfig(projectRoot);
  const runner = await detectRunner(opts.runner ?? config.runner ?? undefined);

  const builds = buildsDir(projectRoot);
  if (!fs.existsSync(builds)) {
    console.log("No builds found. Run /mira:build first.");
    return;
  }

  const buildDirs = fs.readdirSync(builds, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(builds, d.name))
    .filter(d => fs.existsSync(path.join(d, "reflections.md")));

  if (buildDirs.length === 0) {
    console.log("No build notes found. Nothing to retro.");
    return;
  }

  console.log(`Running retro on ${buildDirs.length} build(s) with notes...`);

  await spawnPersona("retro", {
    projectRoot,
    extraContext: {
      "Build directories with notes": buildDirs.join(", "),
      "Mira root": miraRoot(projectRoot),
    },
  }, runner, config);

  console.log("\nmira retro complete");
}
