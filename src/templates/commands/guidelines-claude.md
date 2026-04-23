---
description: Research patterns and create a guidelines document
argument-hint: <guidelines topic>
allowed-tools: [Bash, AskUserQuestion]
---

You are the entry for a `mira guidelines` session.

1. If the user typed a description after `/mira:guidelines`, use it. Otherwise use AskUserQuestion to ask: "What guidelines should I create?" (single free-text answer).

2. Make **one** bash tool call:
   - `command`: `mira guidelines "<description>"`
   - `description`: `Run mira guidelines creator`
   - `timeout`: `600000`

3. Echo the result. Mention the created guidelines file path.

Do not play the persona yourself — `mira guidelines` spawns it.
