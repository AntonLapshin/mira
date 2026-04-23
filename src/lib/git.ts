import { execa } from "execa";

export async function getCurrentBranch(cwd: string): Promise<string> {
  const res = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd });
  return res.stdout.trim();
}

export async function createAndCheckoutBranch(
  cwd: string,
  name: string,
  base: string,
): Promise<void> {
  await execa("git", ["checkout", base], { cwd });
  await execa("git", ["checkout", "-b", name], { cwd });
}

export async function checkoutBranch(cwd: string, name: string): Promise<void> {
  await execa("git", ["checkout", name], { cwd });
}

export async function mergeBranch(
  cwd: string,
  source: string,
  target: string,
): Promise<void> {
  await execa("git", ["checkout", target], { cwd });
  await execa("git", ["merge", source, "--no-edit"], { cwd });
}

export async function branchExists(cwd: string, name: string): Promise<boolean> {
  const res = await execa("git", ["branch", "--list", name], { cwd, reject: false });
  return res.stdout.trim().length > 0;
}
