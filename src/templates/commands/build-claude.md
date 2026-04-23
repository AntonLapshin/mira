---
description: Orchestrated build with PM, Engineer, and Reviewer personas
argument-hint: <description of what to build> or "continue"
allowed-tools: [Bash, AskUserQuestion]
---

You are the entry for a `mira build` session.

1. Check the argument:
   - If it is **"continue"**, you will run: `mira build --continue`
   - If a description was provided, you will run: `mira build "<description>"`
   - If empty, use AskUserQuestion to ask: "What would you like to build?" (single free-text answer), then run: `mira build "<answer>"`

2. Make **one** bash tool call with `run_in_background: true`:
   - `command`: the mira build command from step 1
   - `description`: `Run mira build orchestrator`
   - `run_in_background`: `true`

   `mira build` does PM breakdown → Engineer implementation → Reviewer validation in a loop. Dashboard starts on :3838. This can take a long time — running in background avoids timeouts.

3. When you are notified that the command completed, read the last 20 lines of its output and echo the final summary to the user together with `Dashboard: http://localhost:3838`.

Do not play the personas yourself — `mira build` spawns them. Do not edit files under `.mira/builds/` — the orchestrator and child agents own them.
