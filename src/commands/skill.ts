import path from "node:path";
import { miraRoot, slugify } from "../lib/paths.js";
import { readConfig } from "../lib/config.js";
import { detectRunner } from "../lib/runner.js";
import { spawnPersona } from "../lib/persona.js";

export interface SkillOptions {
  runner?: string;
  projectRoot?: string;
}

export async function runSkill(description: string, opts: SkillOptions = {}): Promise<void> {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const config = readConfig(projectRoot);
  const runner = await detectRunner(opts.runner ?? config.runner ?? undefined);
  const slug = slugify(description);

  console.log(`Creating skill: ${description}`);

  await spawnPersona("skill-creator", {
    projectRoot,
    extraContext: {
      "Skill topic": description,
      "Skill slug": slug,
      "Claude command output": path.join(projectRoot, ".claude", "commands", `${slug}.md`),
      "OpenCode command output": path.join(projectRoot, ".opencode", "command", `${slug}.md`),
      "stack.md": path.join(miraRoot(projectRoot), "stack.md"),
      "project.md": path.join(miraRoot(projectRoot), "project.md"),
    },
  }, runner, config);

  console.log(`\nmira skill complete — check .claude/commands/${slug}.md`);
}
