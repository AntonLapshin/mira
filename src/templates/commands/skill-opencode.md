---
description: Research a topic and create a reusable skill for Claude Code and OpenCode
---

You are the entry for a `mira skill` session. Tuned for small/local models — do exactly what is written.

1. If the user typed a description after `/mira:skill`, use it. Otherwise ask the user: "What skill should I create?"

2. Make **one** tool call to run a shell command:
   - `mira skill "<description>"`
   - timeout: 600000

3. Echo the result. Mention the created skill file paths.

Do not play the persona yourself — `mira skill` spawns it.
