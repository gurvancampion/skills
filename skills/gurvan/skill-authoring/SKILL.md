---
name: skill-authoring
description: Use when creating or updating a skill. Sets its folder, frontmatter and body layout.
metadata:
  version: "2026.10.27"
---

# Skill: skill-authoring

A skill is a folder that changes what the agent does by default, for one job. This skill sets its layout: folder, frontmatter, body and checks. Done when the checks in [Verify](#verify) pass.

Use it next to a skill creator, such as Anthropic's `skill-creator` for drafting and evals, or Matt Pocock's `writing-for-agents` for wording. Follow the other skill for drafting, wording and testing, and this one for layout. When they disagree on layout, this skill wins. Without `writing-for-agents` installed, read [wording](references/wording.md), a summary of it.

> **Override.** The target repository's own skill conventions win.

## Before writing

1. **One job.** A skill that does two jobs becomes two skills.
2. **Off the default.** Write only what changes the agent's behaviour. The gotcha it hits without the skill comes first.
3. **Right home.** A rule needed in every session goes in `AGENTS.md`.
4. **Scope.** Ask the user where the skill's limits sit, for example one tool, any project, any device. Values outside those limits stay out of the skill, and the agent finds or asks for them at runtime.
5. **What exists.** Read the installed version, sibling skills and the real files or systems the skill works on. Report every place they disagree.
6. **Current syntax.** Check each command, function name and file format against the tool's current docs or source.
7. **Name.** Look in `~/.agents/skills` and the project's `.agents/skills` for the same or a close name. Propose a rename and apply it after approval.
8. **Plan.** Show the folder tree, an outline of each step, what gets removed, and each open decision with a recommended answer. Write after approval. Keep drafts in a folder that outlives the session.

## Description

The description tells the agent when to load the skill. Keep it short and plain, in the words the user types:

```yaml
description: Use when <situation>, or <situation>. <What the skill is or does>.
```

- Name each distinct case once. Synonyms of one case count once, and no sentence repeats another.
- Cover every action the skill takes (create, update, delete) and the words users type for its objects (story, bug).
- Third person, present tense, at most 1,024 characters, no angle brackets.
- When a sibling skill could match the same request, name this skill's own case more precisely.

## Folder

```text
<name>/
├── SKILL.md
├── CREDITS.md      # optional, sources and licence notices
├── references/     # optional, detail split out of SKILL.md, flat
├── templates/      # optional, files the agent fills in
└── scripts/        # optional, steps a script does better than the agent
```

`SKILL.md` alone is the default. Add a file or folder only when the skill needs it:

- `CREDITS.md` when the skill adapts or summarises another one. `SKILL.md` does not link it.
- `references/` when `SKILL.md` gets too long to follow, or a part is needed by only some runs.
- `templates/` when the skill produces files from a fixed shape.
- `scripts/` when a script makes a step faster or more reliable. Say whether to run or read each one.

## Frontmatter

```yaml
---
name: <folder>
description: <see Description>
metadata:
  version: "YYYY.MM.DD"
---
```

Only `SKILL.md` has frontmatter. A reference starts with a `# Title`, and the sentence that links it from `SKILL.md` says when to read it.

## Body

- The intro says what the agent does and when the work is done.
- `> **Prerequisite.**` appears only when the skill needs an MCP server, a CLI or another tool to run. It says what to do when the tool is missing.
- `> **Override.**` says an explicit user instruction wins over the skill.
- A step that writes to an external system or deletes something shows a draft and waits for approval.
- The last step returns what changed, the choices made without the user, and the values left to fill in.
- A skill that works on a file layout shows that layout as an annotated tree.

Pick the smallest shape that fits:

| Shape | Use for | Body |
|-------|---------|------|
| Technique | One procedure | Steps inline, no folder |
| Workflow | Ordered steps where some cases need depth | `## 1.` to `## n.` inline, each step links the reference only some cases need |
| Index | Many independent topics | One paragraph, then one table per category |

An index section is one table:

| Topic | Description | Reference |
|-------|-------------|-----------|
| Water | How much, and when to skip a day | [care-water](references/care-water.md) |

Name a reference after its content: `setup.md` in a workflow, `<category>-<topic>.md` in an index. Link text is the filename without `.md`. Every reference is linked from `SKILL.md`.

## Project file

When a skill needs project facts, it reads them from a file at the repository root (`JIRA.md`, `FIGMA.md`), and creates it on first run through `references/setup.md`:

1. Derive everything the environment answers, such as APIs, existing tickets and config.
2. Ask the rest in one series, each with a recommended answer. Lists to prune (parents, labels) are one multiple-choice question, all kept by default.
3. Show the full file and a one-line pointer for `AGENTS.md`, then write after approval.
4. Later runs propose changes to the file and write them after approval.

## Install

Before overwriting an installed copy, diff it against the last version written, since the user may have edited it. Move the old version outside the skills folder so it does not load as a second skill.

## Verify

Done when every check holds:

- `name` equals the folder name, every file except `CREDITS.md` is reachable through links starting from `SKILL.md`, every link resolves.
- **Trigger.** From the description alone, three to five requests fire it (including a paraphrase) and two near misses do not.
- **Cold read.** An agent with no prior context follows each step without guessing a path, tool or value.
- **Real task.** One representative request runs with the skill. Each gap the agent showed becomes a fix.
- **Unslop.** Every file, description included, follows the `unslop` rules when installed, and at least these: no em dashes, no semicolons, colons only before a list or example, straight quotes.

## Improve

Make the smallest fix for the symptom, then add the failure as a gotcha:

| Symptom | Fix |
|---------|-----|
| Fires too rarely | Add the user's words to the description |
| Fires on unrelated requests | Narrow the description to the cases the skill handles |
| Fires, rule ignored | Move the rule up, make it checkable, or ship a script |
| Too long | Move what only some runs need to `references/` |
