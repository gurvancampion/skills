# Skills

[Skills](https://agentskills.io) I use daily for work.

## Catalog

Skills are grouped by origin under `skills/`, keeping an upstream category folder where it helps (one level at most: `npx skills` reads three levels below `skills/`). Installs are flat, so agents invoke them by name only.

```text
skills/
├── gurvan/       # hand-written: create-pr, skill-authoring, journal, omarchy-windows-vm
├── mattpocock/   # 26 skills from mattpocock/skills, in its engineering/ and productivity/ folders
├── pstack/       # blast-radius, create-verification-skill, maintain-verification-skill, unslop (cursor/plugins)
├── context7/     # find-docs
├── ponytail/     # ponytail-review
└── comfy-cli/    # comfy, comfy-custom-nodes, comfy-debug, comfy-director, comfy-relay
```

### Hand-written

| Skill | Description |
| --- | --- |
| [create-pr](skills/gurvan/create-pr) | Opens a GitHub PR or GitLab MR from the current branch: split commits, a description with Mermaid diagrams, before/after screenshots or videos. Replaces Matt Pocock's `pr`. |
| [skill-authoring](skills/gurvan/skill-authoring) | Creates or fixes a skill: folder, frontmatter, description wording and body layout. |
| [journal](skills/gurvan/journal) | Manages an Obsidian vault named `Brain`. Needs Obsidian 1.12.7+ with its command line enabled under **Settings > General > Advanced**; aggregated task dashboards optionally use the Tasks plugin. |
| [omarchy-windows-vm](skills/gurvan/omarchy-windows-vm) | Builds, runs and tests code on Windows from Linux through the Omarchy Windows VM. One-time setup in its `SETUP.md`. |

### Synced from upstream

Each synced skill carries its upstream `LICENSE.md` and a `SOURCE.md` with the repository, path and pinned commit. The ComfyUI skills come from comfy-cli (GPL-3.0) and should match the installed CLI (`comfy --version`).

## Install

### Globally, from Git

Installs every skill for OpenCode, Claude Code and GitHub Copilot, and refreshes skills already present:

```bash
npx skills@latest add gurvancampion/skills --skill '*' --global \
  --agent opencode claude-code github-copilot --yes
```

On Windows PowerShell:

```powershell
npx.cmd skills@latest add gurvancampion/skills --skill '*' --global --agent opencode claude-code github-copilot --yes
```

`npx skills@latest update --global --yes` refreshes installed skills but does not discover new ones; re-run `add` for those.

`--global` installs into `~/.agents/skills`, read by OpenCode, GitHub Copilot and Codex. Claude Code reads `~/.claude/skills`; point it at the shared folder instead of keeping a second copy:

```bash
ls -la ~/.claude/skills   # if it only holds per-skill symlinks, remove it first
ln -s ~/.agents/skills ~/.claude/skills
```

### Per project, from npm (experimental)

[`@gurvancampion/skills`](https://www.npmjs.com/package/@gurvancampion/skills) ships `create-pr` and `skill-authoring`. The skills update with the package version, like any dependency:

```bash
npm i -D skills @gurvancampion/skills
```

```json
{
  "scripts": {
    "prepare": "skills experimental_sync -y"
  }
}
```

Commit `skills-lock.json` and the links under `.agents/skills/`. `experimental_sync` belongs to the [skills CLI](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-experimental_sync) and may change.

## Maintain

```text
meta.ts           # upstream sources, the skills taken from each, hand-written folders, npm contents
sources/<key>/    # upstream repositories as shallow Git submodules, pinned by commit
scripts/sync.ts   # copies each listed skill into skills/<target>/<name>/ with LICENSE.md and SOURCE.md
scripts/pack.ts   # flattens the packed skills into dist/skills/ before npm publish
```

Requires Node.js 24 (or 22.18+), which runs the TypeScript scripts directly.

```bash
node scripts/sync.ts            # regenerate the copies from the pinned commits
node scripts/sync.ts --update   # move every source to its upstream tip, then regenerate
npm run check                   # fail if the committed copies differ from the pinned sources
```

A source's optional `prefix` renames its skills (folder and `name:`) so another catalog can ship them next to this one; `SOURCE.md` keeps the upstream name.

A `SOURCE.md` marks a synced copy: the sync removes and regenerates every skill folder holding one, never a hand-written skill, so a `target` can also be a `manual` folder. It fails when an upstream skill moved, its `name:` changed, a replacement no longer matches, or two skills share a name.

To add an upstream source, add the submodule and its `meta.ts` entry, then sync:

```bash
git submodule add https://github.com/<owner>/<repo>.git sources/<key>
git config -f .gitmodules submodule.sources/<key>.shallow true
node scripts/sync.ts
```

The weekly [sync workflow](.github/workflows/sync.yml) runs `--update` and opens a pull request; it never auto-merges. Review changed instructions before merging, since agents run them with full permissions.

### Release

Bump `version` in `package.json`, commit, then push a matching tag; the [release workflow](.github/workflows/release.yml) publishes to npm:

```bash
npm version patch && git push --follow-tags
```

## Credits

[Anthony Fu](https://github.com/antfu)'s [antfu/skills](https://github.com/antfu/skills) inspired this repository's layout: upstream repositories as Git submodules in `sources/`, a `meta.ts` manifest, and skill copies regenerated from them.

## License

The hand-written skills and the scripts are [MIT](LICENSE). Synced skills keep their upstream license in their own `LICENSE.md`.
