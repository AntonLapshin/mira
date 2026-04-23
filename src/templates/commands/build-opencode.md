---
description: Orchestrated build with PM, Engineer, and Reviewer personas
---

You are the entry for a `mira build` session. Tuned for small/local models — do exactly what is written.

1. Check the argument:
   - If it is **"continue"**, run: `mira build --continue`
   - If a description was provided, run: `mira build "<description>"`
   - If empty, ask the user: "What would you like to build?"

2. Make **one** tool call to run a shell command:
   - The mira build command from step 1
   - timeout: 3600000

3. Echo the final summary to the user together with `Dashboard: http://localhost:3838`.

Do not play the personas yourself — `mira build` spawns them.
