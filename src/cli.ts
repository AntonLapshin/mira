#!/usr/bin/env node
import { Command } from "commander";
import { runInstall } from "./commands/install.js";
import { runExplore } from "./commands/explore.js";
import { runSkill } from "./commands/skill.js";
import { runGuidelines } from "./commands/guidelines.js";
import { runBuild } from "./commands/build.js";
import { runRetro } from "./commands/retro.js";
import { runServe } from "./commands/serve.js";

const program = new Command();

program
  .name("mira")
  .description("AI development orchestrator — explore, build, review via personas")
  .version("0.1.0");

program
  .command("install")
  .description("Install /mira:* slash commands into the current project")
  .option("--project-root <path>", "override project root (defaults to cwd)")
  .action(async (options: { projectRoot?: string }) => {
    await runInstall(options);
  });

program
  .command("explore")
  .description("Explore the project or a specific feature")
  .argument("[feature]", "feature name for deep exploration")
  .option("--runner <claude|opencode>", "force a specific runner")
  .option("--project-root <path>", "override project root")
  .action(async (feature: string | undefined, options: { runner?: string; projectRoot?: string }) => {
    await runExplore(feature, options);
  });

program
  .command("skill")
  .description("Research a topic and create a reusable skill")
  .argument("<description...>", "skill topic description")
  .option("--runner <claude|opencode>", "force a specific runner")
  .option("--project-root <path>", "override project root")
  .action(async (description: string[], options: { runner?: string; projectRoot?: string }) => {
    await runSkill(description.join(" "), options);
  });

program
  .command("guidelines")
  .description("Research patterns and create a guidelines document")
  .argument("<description...>", "guidelines topic description")
  .option("--runner <claude|opencode>", "force a specific runner")
  .option("--project-root <path>", "override project root")
  .action(async (description: string[], options: { runner?: string; projectRoot?: string }) => {
    await runGuidelines(description.join(" "), options);
  });

program
  .command("build")
  .description("Orchestrated build: PM breaks down work, Engineer implements, Reviewer validates")
  .argument("<description...>", "what to build")
  .option("--runner <claude|opencode>", "force a specific runner")
  .option("--project-root <path>", "override project root")
  .option("--no-dashboard", "skip auto-starting the dashboard")
  .option("--port <number>", "dashboard port", (v) => Number(v))
  .action(async (
    description: string[],
    options: { runner?: string; projectRoot?: string; dashboard: boolean; port?: number },
  ) => {
    await runBuild(description.join(" "), options);
  });

program
  .command("retro")
  .description("Process post-implementation notes from builds")
  .option("--runner <claude|opencode>", "force a specific runner")
  .option("--project-root <path>", "override project root")
  .action(async (options: { runner?: string; projectRoot?: string }) => {
    await runRetro(options);
  });

program
  .command("serve")
  .description("Serve the build dashboard")
  .option("--project-root <path>", "override project root")
  .option("--port <number>", "port (default 3838)", (v) => Number(v))
  .action(async (options: { projectRoot?: string; port?: number }) => {
    await runServe(options);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
