import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { buildsDir, buildDirName, packageRoot } from "../lib/paths.js";
import { readConfig } from "../lib/config.js";
import { writeSession } from "../lib/session-io.js";
import { runBuildOrchestrator } from "../lib/orchestrator.js";
import type { Session } from "../lib/schema.js";

export interface BuildOptions {
  runner?: string;
  projectRoot?: string;
  dashboard?: boolean;
  port?: number;
  continue?: boolean;
}

export async function runBuild(description: string | undefined, opts: BuildOptions = {}): Promise<void> {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const config = readConfig(projectRoot);
  const port = opts.port ?? config.dashboardPort;

  let sessionDir: string;

  if (opts.continue) {
    const found = findLatestIncompleteSession(projectRoot);
    if (!found) {
      console.log("No incomplete build found. Start a new build with: mira build <description>");
      return;
    }
    sessionDir = found;
  } else {
    if (!description) {
      console.error("Description required. Usage: mira build <description>");
      process.exit(1);
    }
    const dirName = buildDirName(description);
    sessionDir = path.join(buildsDir(projectRoot), dirName);
    fs.mkdirSync(sessionDir, { recursive: true });

    const sessionFile = path.join(sessionDir, "session.json");
    if (!fs.existsSync(sessionFile)) {
      const session: Session = {
        id: dirName,
        description,
        title: "",
        goal: "",
        phase: "planning",
        baseBranch: "",
        items: [],
        buildCycles: 0,
        maxCycles: config.maxBuildCycles,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      writeSession(sessionDir, session);
    }
  }

  if (opts.dashboard !== false) {
    await ensureDashboard(projectRoot, port);
  }

  const currentSession = JSON.parse(fs.readFileSync(path.join(sessionDir, "session.json"), "utf8"));
  console.log(`Build: ${currentSession.description}`);
  console.log(`Session: ${sessionDir}`);
  console.log(`Dashboard: http://localhost:${port}`);

  const result = await runBuildOrchestrator(sessionDir, {
    runner: opts.runner,
    projectRoot,
  });

  const approved = result.items.filter(i => i.status === "approved").length;
  const done = result.items.filter(i => i.status === "done").length;
  const blocked = result.items.filter(i => i.status === "blocked").length;
  console.log(
    `\nmira build ${result.phase} — ${approved} approved, ${done} done, ${blocked} blocked (${result.buildCycles} cycles)`,
  );
}

function findLatestIncompleteSession(projectRoot: string): string | null {
  const builds = buildsDir(projectRoot);
  if (!fs.existsSync(builds)) return null;

  const dirs = fs.readdirSync(builds, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()
    .reverse();

  for (const dir of dirs) {
    const sessionFile = path.join(builds, dir, "session.json");
    if (fs.existsSync(sessionFile)) {
      try {
        const session = JSON.parse(fs.readFileSync(sessionFile, "utf8"));
        if (session.phase !== "complete" && session.phase !== "failed") {
          return path.join(builds, dir);
        }
      } catch {
        // skip corrupt session files
      }
    }
  }
  return null;
}

async function ensureDashboard(projectRoot: string, port: number): Promise<void> {
  try {
    const res = await fetch(`http://localhost:${port}/`);
    const text = await res.text();
    if (text.includes("mira dashboard")) return;
  } catch {
    // not running
  }

  const cliPath = path.join(packageRoot(), "dist", "cli.js");
  const child = spawn("node", [cliPath, "serve", "--project-root", projectRoot, "--port", String(port)], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  for (let i = 0; i < 16; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch(`http://localhost:${port}/`);
      const text = await res.text();
      if (text.includes("mira dashboard")) return;
    } catch {
      // retry
    }
  }
  console.warn("Dashboard may not have started. Continuing without it.");
}
