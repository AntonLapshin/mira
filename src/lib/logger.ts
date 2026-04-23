import fs from "node:fs";
import path from "node:path";

export function appendLog(dir: string, persona: string, message: string): void {
  const ts = new Date().toISOString();
  const flat = message.replace(/\n/g, " ").trim();

  const txtLine = `${ts} | ${persona.toUpperCase()} | ${flat}\n`;
  fs.appendFileSync(path.join(dir, "logs.txt"), txtLine, "utf8");

  const jsonLine = JSON.stringify({ ts, persona, message: flat }) + "\n";
  fs.appendFileSync(path.join(dir, "logs.jsonl"), jsonLine, "utf8");
}

export function appendLogEvent(
  dir: string,
  persona: string,
  event: string,
  message: string,
  fields?: Record<string, unknown>,
): void {
  const ts = new Date().toISOString();
  const flat = message.replace(/\n/g, " ").trim();

  const txtLine = `${ts} | ${persona.toUpperCase()} | [${event}] ${flat}\n`;
  fs.appendFileSync(path.join(dir, "logs.txt"), txtLine, "utf8");

  const obj: Record<string, unknown> = { ts, persona, event, message: flat };
  if (fields) obj.fields = fields;
  fs.appendFileSync(path.join(dir, "logs.jsonl"), JSON.stringify(obj) + "\n", "utf8");
}
