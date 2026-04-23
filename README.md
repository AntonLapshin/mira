# mira

AI development orchestrator that drives Claude Code / OpenCode through specialized personas to explore codebases, build features, create skills, and manage guidelines.

## Install

```bash
npm install -g .
```

Then in any project:

```bash
mira install
```

This creates `/mira:*` slash commands in `.claude/commands/` and `.opencode/command/`, scaffolds `.mira/`, and merges deny rules into `.claude/settings.json`.

## Commands

### `/mira:explore [FeatureName]`

Explore the project or a specific feature.

```bash
/mira:explore              # project overview → .mira/project.md, stack.md, features.md
/mira:explore TimedGifts   # deep dive → .mira/features/TimedGifts.md
```

### `/mira:skill <description>`

Research a topic and create a reusable skill for both runners.

```bash
/mira:skill Storybook stories   # → .claude/commands/storybook-stories.md
                                 #   .opencode/command/storybook-stories.md
```

### `/mira:guidelines <description>`

Codify existing code patterns into a guidelines document.

```bash
/mira:guidelines unit tests   # → .mira/guidelines/unit-tests.md
```

### `/mira:build <description>`

Orchestrated build with PM, Engineer, and Reviewer personas. Starts a live dashboard on `:3838`.

```bash
/mira:build Add dark mode support
```

**Flow:** PM breaks down work → Engineer implements each item on its own branch (`mira/{build}/{item}`) → Reviewer validates and can request fixes → repeats up to 3 cycles.

Session state lives in `.mira/builds/{date}-{slug}/session.json`.

### `/mira:retro`

Process post-implementation notes from builds. Researches each note, asks for user decisions, produces `retro.md`.

## Dashboard

The build dashboard starts automatically with `/mira:build` on port 3838. It polls `session.json` every 2 seconds and shows:

- Build goal and phase (planning / building / reviewing / complete)
- Todo items with status badges
- Notes from personas
- Log tail

Run standalone: `mira serve --port 3838`

## Project structure

```
.mira/
├── config.json          # runner, port, timeouts
├── project.md           # from /mira:explore
├── stack.md             # from /mira:explore
├── features.md          # feature index
├── features/            # per-feature deep dives
├── guidelines/          # from /mira:guidelines
└── builds/              # from /mira:build
    └── {date}-{slug}/
        ├── session.json # master state
        ├── notes.md     # persona observations
        └── logs.txt
```

## Configuration

`.mira/config.json` (created by `mira install`):

```json
{
  "dashboardPort": 3838,
  "runner": null,
  "timeouts": { "personaRunMs": 1800000 },
  "maxBuildCycles": 3
}
```

Set `runner` to `"claude"` or `"opencode"` to pin a runner, or leave `null` for auto-detection.

## Requirements

- Node.js 18+
- Claude Code or OpenCode on PATH
