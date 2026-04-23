---
description: Explore the project or a specific feature, creating docs in .mira/
argument-hint: [FeatureName]
allowed-tools: [Bash, AskUserQuestion]
---

You are the entry for a `mira explore` session.

1. If the user typed a feature name after `/mira:explore`, use it. Otherwise, run a full project exploration (no argument).

2. Make **one** bash tool call:
   - If feature provided: `mira explore "<feature>"` 
   - If no feature: `mira explore`
   - `description`: `Run mira explore`
   - `timeout`: `600000`

3. Echo the result to the user. Mention which files were created/updated in `.mira/`.

Do not play the persona yourself — `mira explore` spawns it. Do not edit files under `.mira/` directly. If `mira` is not on PATH, tell the user to run `npm install -g` from the mira repo.
