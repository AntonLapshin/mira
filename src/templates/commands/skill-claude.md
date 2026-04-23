---
description: Research a topic and create a reusable skill for Claude Code and OpenCode
argument-hint: <skill description>
allowed-tools: [Bash, AskUserQuestion]
---

You are the entry for a `mira skill` session.

1. If the user typed a description after `/mira:skill`, use it. Otherwise use AskUserQuestion to ask: "What skill should I create?" (single free-text answer).

2. Make **one** bash tool call:
   - `command`: `mira skill "<description>"`
   - `description`: `Run mira skill creator`
   - `timeout`: `600000`

3. Echo the result. Mention the created skill file paths.

Do not play the persona yourself — `mira skill` spawns it.
