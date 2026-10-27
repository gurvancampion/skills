---
name: create-pr
description: Use when creating or updating a PR or MR. Writes its description with diagrams and before/after screenshots or videos.
metadata:
  version: "2026.10.27"
---

# Create a PR

A reviewer understands the change from the description alone: what changed and why, a diagram of the behaviour that moved, and evidence that it works. Done when the PR is published and step 8's report is given. Work files live in `/tmp/pr-<slug>/`, where `<slug>` is the head branch name with every `/` and `#` replaced by `-`.

> **Prerequisite.** The platform's CLI, logged in. The remote's host (`git remote get-url origin`) tells the platform. Read its file, [github](references/github.md) or [gitlab](references/gitlab.md), for every platform command below. On another platform, use its own CLI or API for the same operations. When the CLI is missing or logged out, tell the user and stop.

> **Override.** An explicit user instruction wins over this skill.

## 1. Read the conventions

| Need | Where |
|------|-------|
| Target branch | The user's request, then the repository's default branch |
| Existing PR and its author | The open PR for the head branch. An open PR is updated in step 7. When its author is not the logged-in user, the branch is someone else's, so steps 3, 5 and 7 add, rewrite and push no commit on it |
| Description headings | The repository's PR template |
| Language, title format, ticket key, labels | `AGENTS.md`, `CONTRIBUTING.md` |
| How to run and log in to the app | The project's verification skill, then `AGENTS.md` and `README.md`. When they do not say enough to run it from a worktree, ask the user which env files to reuse, which services to start and how to log in |

Done when you can state each row's answer. Ask what is still unknown in one message, each question with a recommended answer.

## 2. Scope the change

1. Work on the PR's head branch. When it is not checked out, add `git worktree add --detach /tmp/pr-<slug>/head-tree origin/<head>` and work there, leaving the user's checkout as it is. In your own checkout, `git status --short` is empty. Otherwise commit the work or ask the user what it is. Then `git fetch origin <target>`.
2. Record the merge base, `git merge-base origin/<target> HEAD`, and the range `<base>..HEAD`. The branch is stacked when another open PR's head branch is part of it. For each open PR's head branch, run `git fetch origin <head>`, then `git merge-base --is-ancestor origin/<head> HEAD`. A stacked branch targets that head branch, and the description covers only its own commits.
3. Read the full diff. Set generated files, lockfiles and snapshots apart from runtime code.
4. Trace changed code to its entry points, callers and external boundaries. Every architecture claim in the description cites a path or symbol.
5. List the changed **scenarios**, each with a short id: UI states, user flows, state transitions, ordering of async work, failure and recovery paths. Judge from the diff which scenarios a user can see or interact with, such as screens, styles, copy or rendered output. Those get screenshots or videos in step 4, the others get diagrams and test or command evidence.

Done when every changed runtime file maps to a scenario, or is marked generated or behaviour-preserving.

## 3. Run the checks

Run the checks the project uses for the changed code. Record each exact command and its result, and what stays unverified with the reason. On your own branch, commit a fix that a failing check needs with `git commit --fixup=<sha>`, so step 5 folds it in. On a PR that already has reviews, commit it as a normal commit. On someone else's branch, the failing check goes in the description and the report.

## 4. Capture the evidence

Read [evidence](references/evidence.md). Each scenario gets its evidence. A visible change gets a before/after pair from the merge base and the head, captured with the browser tooling at hand. Without any browser tool, the description says `Not verified: no browser tool available` and the PR goes on. When the app cannot run or log in, ask the user once with the exact blocker. Without a way forward, the description carries `Not verified: <blocker>`.

## 5. Split the commits

On your own branch, read [commits](references/commits.md) before pushing. Done when `git log --oneline <base>..HEAD` reads as the story of the change, one logical change per commit, and the final code matches the backup except for files the user agreed to drop.

## 6. Write the description

Read [body](references/body.md) for the sections and [diagrams](references/diagrams.md) for the Summary visual. Write it to `/tmp/pr-<slug>/body.md`, referencing captures by their local paths. When updating, keep the author's content and check each of its claims against the diff and your evidence. When the `unslop` skill is available, run it over the title and the description. When it cannot be invoked, read its `SKILL.md` and apply it.

Done when every Mermaid block parses, which means `npx -y @mermaid-js/mermaid-cli -i /tmp/pr-<slug>/body.md -o /tmp/pr-<slug>/mermaid.md` exits 0. It renders with a headless Chrome. When it cannot download one, pass `-p <file>` holding `{"executablePath": "<path to chrome>"}`.

## 7. Publish

Show the user the title, target branch and description, and publish after approval. Push your own branch with `git push -u origin <branch>`, adding `--force-with-lease` after a rewrite. Then upload the evidence and create or update the PR with the platform file's commands. Open it as a draft when the user asks, when the repository's recent PRs start as drafts, or when a check is known to fail.

Then stop what the run started: worktrees, dev servers, containers, test data and saved login state.

## 8. Report

Give the PR URL, the backup branch to delete once the PR merges, the choices made without the user, what is left for the user to fill in, and anything that stays changed, such as applied migrations. When you had to ask the user anything, show the lines that would answer it next time and offer to add them to `AGENTS.md`. Write after approval.

## Rules

- Separate what is verified, assumed and not verified. "Safe", "fixed" and "backward compatible" each point at the evidence that shows it.
- Green CI proves only the checks CI runs.
- Captures and the description use test data, with no tokens, secrets or real user records.
