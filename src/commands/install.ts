import fs from "node:fs";
import path from "node:path";
import { commandTemplateDir, miraRoot } from "../lib/paths.js";
import { writeDefaultConfigIfMissing } from "../lib/config.js";

export interface InstallOptions {
  projectRoot?: string;
}

const COMMANDS = ["explore", "skill", "guidelines", "build", "retro"];

export async function runInstall(opts: InstallOptions = {}): Promise<void> {
  const projectRoot = opts.projectRoot ?? process.cwd();

  const claudeCmdDir = path.join(projectRoot, ".claude", "commands");
  const opencodeCmdDir = path.join(projectRoot, ".opencode", "command");
  fs.mkdirSync(claudeCmdDir, { recursive: true });
  fs.mkdirSync(opencodeCmdDir, { recursive: true });

  for (const name of COMMANDS) {
    writeCommand(claudeCmdDir, opencodeCmdDir, name);
  }

  const mira = miraRoot(projectRoot);
  for (const sub of ["features", "guidelines", "builds"]) {
    fs.mkdirSync(path.join(mira, sub), { recursive: true });
  }

  writeDefaultConfigIfMissing(projectRoot);
  mergeClaudeSettings(projectRoot);

  console.log(`\nmira installed in ${projectRoot}`);
}

function writeCommand(claudeCmdDir: string, opencodeCmdDir: string, name: string): void {
  const tplDir = commandTemplateDir();
  const claudeBody = fs.readFileSync(path.join(tplDir, `${name}-claude.md`), "utf8");
  const opencodeBody = fs.readFileSync(path.join(tplDir, `${name}-opencode.md`), "utf8");
  fs.writeFileSync(path.join(claudeCmdDir, `mira:${name}.md`), claudeBody, "utf8");
  fs.writeFileSync(path.join(opencodeCmdDir, `mira:${name}.md`), opencodeBody, "utf8");
  console.log(`  wrote /mira:${name}`);
}

const DENY_RULES = [
  "Bash(ls -R:*)",
  "Bash(find . -type:*)",
  "Bash(find .:*)",
  "Bash(tree:*)",
  "Read(**/node_modules/**)",
  "Read(**/dist/**)",
  "Read(**/build/**)",
  "Read(**/.next/**)",
  "Read(**/.turbo/**)",
  "Read(**/coverage/**)",
  "Read(**/*.lock)",
  "Read(**/*.min.*)",
];

function mergeClaudeSettings(projectRoot: string): void {
  const file = path.join(projectRoot, ".claude", "settings.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let existing: Record<string, unknown> = {};
  if (fs.existsSync(file)) {
    try {
      existing = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      return;
    }
  }
  const permissions = (existing.permissions as Record<string, unknown> | undefined) ?? {};
  const deny = new Set((permissions.deny as string[] | undefined) ?? []);
  let added = 0;
  for (const rule of DENY_RULES) {
    if (!deny.has(rule)) {
      deny.add(rule);
      added++;
    }
  }
  permissions.deny = [...deny];
  existing.permissions = permissions;
  fs.writeFileSync(file, JSON.stringify(existing, null, 2) + "\n", "utf8");
  if (added > 0) {
    console.log(`  merged ${added} deny rule(s) into .claude/settings.json`);
  }
}
