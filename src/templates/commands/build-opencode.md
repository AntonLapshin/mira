---
description: Orchestrated build with PM, Engineer, and Reviewer personas
---

You are the entry for a `mira build` session. Tuned for small/local models — do exactly what is written.

1. If the user typed a description after `/mira:build`, use it. Otherwise ask the user: "What would you like to build?"

2. Make **one** tool call to run a shell command:
   - `mira build "<description>"`
   - timeout: 600000

3. Echo the final summary to the user together with `Dashboard: http://localhost:3838`.

Do not play the personas yourself — `mira build` spawns them.
