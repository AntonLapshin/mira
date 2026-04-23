---
description: Explore the project or a specific feature, creating docs in .mira/
---

You are the entry for a `mira explore` session. Tuned for small/local models — do exactly what is written.

1. If the user typed a feature name after `/mira:explore`, use it. Otherwise, run a full project exploration (no argument).

2. Make **one** tool call to run a shell command:
   - If feature provided: `mira explore "<feature>"`
   - If no feature: `mira explore`
   - timeout: 600000 (10 min)

3. Echo the result to the user. Mention which files were created/updated in `.mira/`.

Do not play the persona yourself — `mira explore` spawns it.
