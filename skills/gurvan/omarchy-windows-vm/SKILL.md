---
name: omarchy-windows-vm
description: "Build, run, or test code on Windows from a Linux (Omarchy) machine, using the Omarchy Windows VM. Use when a task needs Windows: a Windows-only app or target, a Windows-specific bug, or checking that something works on Windows before shipping."
---

# Omarchy Windows VM

The Omarchy Windows VM is one Windows 11 machine shared by every agent on this host. `winvm` (on `PATH`, else `scripts/winvm` in this skill's folder) starts it headless, copies your worktree into it, runs PowerShell commands there over SSH, and shuts it down once no agent holds a **lease**.

If `winvm status` errors with a polkit or SSH failure, the machine is not set up yet: follow [SETUP.md](SETUP.md).

## Workflow

1. `winvm up`: takes your lease and boots the VM if it is off (about a minute; already-running is instant).
2. `winvm sync`: copies your git worktree (tracked and untracked-but-not-ignored files) to `C:/worktrees/<worktree-id>`, removing files you deleted since the last sync. That folder is a git checkout of your current commit and branch, so `git rev-parse HEAD`, `git status` and `git diff` there match Linux. Re-run it after every Linux-side edit or commit; Windows sees only what was synced.
3. `winvm run '<PowerShell>'`: runs in that folder, streams output, returns the exit code. `--cwd C:/other` runs elsewhere.
4. `winvm pull C:/worktrees/<id>/out ./out`: copies artifacts (logs, screenshots, builds) back to Linux.
5. `winvm down`: releases your lease. Done when `winvm down` has run, every time, including after failures. The VM stops 15 minutes after the last lease is released, so the next agent skips the boot.

Edit code on Linux and sync; treat the Windows copy as disposable build space. Each worktree has its own folder, so agents in different worktrees build in parallel; agents sharing a worktree share its Windows folder too.

## Running commands

- Commands run in PowerShell 7 (`pwsh`) with `$ErrorActionPreference = 'Stop'`. A failing native command does not stop the script; chain with `; if ($LASTEXITCODE) { exit $LASTEXITCODE }` when later steps depend on it.
- Toolchains come from mise. Pin what the repo pins inside the worktree folder before installing, for example `winvm run 'mise use node@22.21.1 pnpm@10.22.0; pnpm install --frozen-lockfile'`. That `mise.toml` lives only on the Windows side; sync never deletes files it did not create.
- Keep each command under about 2,500 characters (cmd.exe line limit after encoding). For longer logic, commit a `.ps1` to the worktree, sync, and run it.
- `node_modules` is never synced: run the install on Windows. Native modules then build or download for Windows.

## Desktop and GUI apps

`winvm run` sessions have no visible desktop, but apps still render: Electron and browsers launched through Playwright from `winvm run` draw their windows, and Playwright screenshots come back real (`winvm pull` them to inspect). What needs the visible desktop is anything outside the app's renderer: OS-level screenshots, native dialogs, tray icons, installers with UI. For those, tell the user and suggest `winvm gui`, which opens the VM desktop over RDP.

## Rules

- One VM serves everyone: never stop it directly (`omarchy-windows-vm stop`, `docker`); `winvm down` is the only way out.
- The VM is shared with the user. Leave `C:/worktrees` folders of other worktrees alone.
