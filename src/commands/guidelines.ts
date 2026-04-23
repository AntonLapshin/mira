import path from "node:path";
import { miraRoot, slugify } from "../lib/paths.js";
import { readConfig } from "../lib/config.js";
import { detectRunner } from "../lib/runner.js";
import { spawnPersona } from "../lib/persona.js";

export interface GuidelinesOptions {
  runner?: string;
  projectRoot?: string;
}

export async function runGuidelines(description: string, opts: GuidelinesOptions = {}): Promise<void> {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const config = readConfig(projectRoot);
  const runner = await detectRunner(opts.runner ?? config.runner ?? undefined);
  const slug = slugify(description);

  console.log(`Creating guidelines: ${description}`);

  await spawnPersona("guidelines-creator", {
    projectRoot,
    extraContext: {
      "Guidelines topic": description,
      "Output file": path.join(miraRoot(projectRoot), "guidelines", `${slug}.md`),
      "stack.md": path.join(miraRoot(projectRoot), "stack.md"),
      "project.md": path.join(miraRoot(projectRoot), "project.md"),
    },
  }, runner, config);

  console.log(`\nmira guidelines complete — check .mira/guidelines/${slug}.md`);
}
