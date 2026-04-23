---
description: Orchestrated build with PM, Engineer, and Reviewer personas
argument-hint: <description of what to build>
allowed-tools: [Bash, AskUserQuestion]
---

You are the entry for a `mira build` session.

1. If the user typed a description after `/mira:build`, use it. Otherwise use AskUserQuestion to ask: "What would you like to build?" (single free-text answer).

2. Make **one** bash tool call:
   - `command`: `mira build "<description>"`
   - `description`: `Run mira build orchestrator`
   - `timeout`: `600000`

   `mira build` does PM breakdown → Engineer implementation → Reviewer validation in a loop. Dashboard starts on :3838. The last line of stdout has the summary.

3. Echo the final summary to the user together with `Dashboard: http://localhost:3838`.

Do not play the personas yourself — `mira build` spawns them. Do not edit files under `.mira/builds/` — the orchestrator and child agents own them.
