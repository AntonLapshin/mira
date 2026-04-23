import path from "node:path";
import { miraRoot, packageRoot } from "../lib/paths.js";
import { readConfig } from "../lib/config.js";
import { startDashboardServer } from "../lib/dashboard-server.js";

export interface ServeOptions {
  projectRoot?: string;
  port?: number;
}

export async function runServe(opts: ServeOptions = {}): Promise<void> {
  const projectRoot = opts.projectRoot ?? process.cwd();
  const config = readConfig(projectRoot);
  const port = opts.port ?? config.dashboardPort;

  const assetsDir = path.join(packageRoot(), "dashboard");
  const dataDir = miraRoot(projectRoot);

  startDashboardServer({ port, assetsDir, dataDir });
}
