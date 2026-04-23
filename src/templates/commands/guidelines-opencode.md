---
description: Research patterns and create a guidelines document
---

You are the entry for a `mira guidelines` session. Tuned for small/local models — do exactly what is written.

1. If the user typed a description after `/mira:guidelines`, use it. Otherwise ask the user: "What guidelines should I create?"

2. Make **one** tool call to run a shell command:
   - `mira guidelines "<description>"`
   - timeout: 600000

3. Echo the result. Mention the created guidelines file path.

Do not play the persona yourself — `mira guidelines` spawns it.
