import path from "node:path";
import { miraRoot } from "../lib/paths.js";
import { readConfig } from "../lib/config.js";
import { detectRunner } from "../lib/runner.js";
import { spawnPersona } from "../lib/persona.js";

export interface ExploreOptions {
  runner?: string;
  projectRoot?: string;
}

export async function runExplore(feature: string | undefined, opts: ExploreOptions = {}): Promise<void> {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const config = readConfig(projectRoot);
  const runner = await detectRunner(opts.runner ?? config.runner ?? undefined);
  const mira = miraRoot(projectRoot);

  if (feature) {
    console.log(`Exploring feature: ${feature}`);
    await spawnPersona("explorer-feature", {
      projectRoot,
      extraContext: {
        "Feature name": feature,
        "Output file": path.join(mira, "features", `${feature}.md`),
        "project.md": path.join(mira, "project.md"),
        "stack.md": path.join(mira, "stack.md"),
        "features.md": path.join(mira, "features.md"),
      },
    }, runner, config);
  } else {
    console.log("Exploring project...");
    await spawnPersona("explorer-project", {
      projectRoot,
      extraContext: {
        "Output directory": mira,
        "project.md": path.join(mira, "project.md"),
        "stack.md": path.join(mira, "stack.md"),
        "features.md": path.join(mira, "features.md"),
      },
    }, runner, config);
  }

  console.log("\nmira explore complete");
}
