import fs from "node:fs";
import path from "node:path";
import { appendLog } from "./logger.js";
import { readConfig, type Config } from "./config.js";
import { detectRunner, type Runner } from "./runner.js";
import { readSession, writeSession } from "./session-io.js";
import { spawnPersona } from "./persona.js";
import { getCurrentBranch, createAndCheckoutBranch, checkoutBranch, mergeBranch, branchExists } from "./git.js";
import { miraRoot } from "./paths.js";
import type { Session, TodoItem } from "./schema.js";

export interface BuildOpts {
  runner?: string;
  projectRoot?: string;
}

export async function runBuildOrchestrator(
  sessionDir: string,
  opts: BuildOpts = {},
): Promise<Session> {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const config = readConfig(projectRoot);
  const runner = await detectRunner(opts.runner ?? config.runner ?? undefined);

  appendLog(sessionDir, "orchestrator", `starting (runner=${runner})`);

  let session = readSession(sessionDir);
  const mira = miraRoot(projectRoot);

  // Phase 1: Planning
  if (session.phase === "planning") {
    session.baseBranch = await getCurrentBranch(projectRoot);
    writeSession(sessionDir, session);

    appendLog(sessionDir, "orchestrator", "spawning PM for work breakdown");
    await spawnPersona("pm", {
      sessionDir,
      projectRoot,
      extraContext: {
        "Build description": session.description,
        "project.md": path.join(mira, "project.md"),
        "stack.md": path.join(mira, "stack.md"),
        "features.md": path.join(mira, "features.md"),
        "Features directory": path.join(mira, "features"),
        "Guidelines directory": path.join(mira, "guidelines"),
      },
    }, runner, config);

    session = readSession(sessionDir);
    if (session.items.length === 0) {
      session.phase = "failed";
      appendLog(sessionDir, "orchestrator", "PM produced no items; marking failed");
      writeSession(sessionDir, session);
      return session;
    }
    session.phase = "building";
    writeSession(sessionDir, session);
  }

  // Phase 2-3 loop: Build -> Review
  while (session.phase === "building" && session.buildCycles < session.maxCycles) {
    await runBuildPhase(sessionDir, projectRoot, runner, config, session);
    session = readSession(sessionDir);

    // Review phase
    session.phase = "reviewing";
    writeSession(sessionDir, session);

    appendLog(sessionDir, "orchestrator", "spawning Reviewer");
    await spawnPersona("reviewer", {
      sessionDir,
      projectRoot,
      extraContext: {
        "Base branch": session.baseBranch,
        "Build description": session.description,
        "notes.md": path.join(sessionDir, "notes.md"),
      },
    }, runner, config);

    session = readSession(sessionDir);
    session.buildCycles++;

    const needsRevision = session.items.some(i => i.status === "revision");
    const hasNewItems = session.items.some(
      i => i.status === "pending" && i.addedBy === "reviewer",
    );

    if (needsRevision || hasNewItems) {
      session.phase = "building";
      appendLog(sessionDir, "orchestrator", `review cycle ${session.buildCycles}: needs more work`);
    } else {
      session.phase = "complete";
      appendLog(sessionDir, "orchestrator", "all items approved — build complete");
    }
    writeSession(sessionDir, session);
  }

  if (session.buildCycles >= session.maxCycles && session.phase === "building") {
    session.phase = "failed";
    appendLog(sessionDir, "orchestrator", `hit max build cycles (${session.maxCycles})`);
    writeSession(sessionDir, session);
  }

  return session;
}

async function runBuildPhase(
  sessionDir: string,
  projectRoot: string,
  runner: Runner,
  config: Config,
  session: Session,
): Promise<void> {
  const pendingItems = session.items
    .filter(i => i.status === "pending" || i.status === "revision")
    .sort((a, b) => a.order - b.order);

  for (const item of pendingItems) {
    const branchName = `mira/${session.id}/${item.id}`;

    try {
      if (await branchExists(projectRoot, branchName)) {
        await checkoutBranch(projectRoot, branchName);
      } else {
        await createAndCheckoutBranch(projectRoot, branchName, session.baseBranch);
      }
    } catch (err) {
      appendLog(sessionDir, "orchestrator", `failed to create branch ${branchName}: ${err}`);
      item.status = "blocked";
      writeSession(sessionDir, session);
      continue;
    }

    item.status = "in-progress";
    item.branch = branchName;
    writeSession(sessionDir, session);

    appendLog(sessionDir, "orchestrator", `Engineer working on: ${item.title}`);
    await spawnPersona("engineer", {
      sessionDir,
      projectRoot,
      extraContext: {
        "Item ID": item.id,
        "Item title": item.title,
        "Item description": item.description,
        "Item branch": branchName,
        "Base branch": session.baseBranch,
        "notes.md": path.join(sessionDir, "notes.md"),
        "Guidelines directory": path.join(miraRoot(projectRoot), "guidelines"),
      },
    }, runner, config);

    // Re-read session after engineer ran
    const updated = readSession(sessionDir);
    const updatedItem = updated.items.find(i => i.id === item.id);
    if (updatedItem && updatedItem.status === "in-progress") {
      updatedItem.status = "blocked";
      updatedItem.reviewNotes = "Engineer did not complete the item";
      appendLog(sessionDir, "orchestrator", `Engineer left ${item.id} non-terminal; marked blocked`);
      writeSession(sessionDir, updated);
    }

    // Merge branch back to base
    try {
      await mergeBranch(projectRoot, branchName, updated.baseBranch);
      appendLog(sessionDir, "orchestrator", `merged ${branchName} into ${updated.baseBranch}`);
    } catch (err) {
      appendLog(sessionDir, "orchestrator", `merge failed for ${branchName}: ${err}`);
    }

    // Update our local session reference
    Object.assign(session, readSession(sessionDir));
  }
}
