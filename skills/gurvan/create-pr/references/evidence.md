# Evidence

Pick the evidence by scenario. A PR touching several kinds of scenario carries several kinds of evidence.

| Scenario | Evidence |
|----------|----------|
| Visible UI: page, component, style, copy | Screenshot pair, before and after |
| Interaction: toggle, popover, scroll, drag, focus, animation | Video pair of a few seconds each, plus one key screenshot |
| Bug fix or behaviour change in code | The test that fails on the merge base and passes on the head: its name and both result lines |
| API, CLI or job | The request or command and its output, before and after |
| Performance | The same measurement on both revisions, same machine and data |
| Refactor without behaviour change | The existing tests passing, and the line `No behaviour change.` |
| Docs or config only | The diff is the evidence |

## Visual pairs

1. **List the surfaces.** Every affected route, page, dialog or component, plus the breakpoints, themes and locales the change touches. A shared component or global style needs several of its consumers, not one representative page.
2. **Name each state** with the scenario's id from step 2 of the skill, suffixed when one scenario has several states, and a title: `session-conversation` / `Session / Conversation`.
3. **Run the merge base in a detached worktree**, so the user's checkout stays untouched:

   ```bash
   base=$(git merge-base origin/<target> HEAD)
   git worktree add --detach /tmp/pr-<slug>/base-tree "$base"
   ```

   Run only the part the before state needs, on its own port. For a front-end change, run the base front end against the back end already running, through the same dev proxy so the back end accepts it. Install its dependencies the way the project does, leaving the lockfile unchanged. The head is the checkout from step 2 of the skill, run as usual. Log in with the test account from step 1.
4. **Capture** with a browser tool that reaches the logged-in app, preferring one that writes the file itself. See [Capture tools](#capture-tools).
5. **Hold everything else equal:** same viewport, theme, locale, data, capture steps and readiness condition on both revisions. Write to `/tmp/pr-<slug>/evidence/base/<id>.png` and `/tmp/pr-<slug>/evidence/head/<id>.png`, or `.mp4` / `.webm` for videos.
6. **Look at every capture.** Recapture a blank, loading, error, login or half-rendered screen unless that state is the subject of the change.
7. A new screen has `before: absent`. A feature added to an existing screen captures that screen on the merge base. A deleted state has `after: removed`.
8. A pair that cannot be captured follows step 4 of the skill, and the description says why it is missing.

## Capture tools

| Tool | Screenshot | Video | Viewport |
|------|------------|-------|----------|
| Chrome DevTools MCP | `take_screenshot` with `filePath` | `screencast_start` with `filePath` (`.mp4`), then `screencast_stop` | `resize_page` |
| Playwright MCP | `browser_take_screenshot` with `filename` | `browser_start_video`, `browser_stop_video`, when the server runs with `--caps=devtools` | `browser_resize` |
| Another browser tool (Paseo, Claude in Chrome) | Its screenshot tool. When it returns image data, write it with a file tool or through stdin, because a command argument overflows | Usually none, so record with Playwright through `npx` | Its resize tool |
| Playwright through `npx`, when Node is installed | `npx -y playwright screenshot --channel chrome --viewport-size 1440,900 --load-storage <state> <url> <file>` | A short script: `browser.newContext({ recordVideo: { dir, size }, viewport, storageState })`, drive the page, then `context.close()` writes the `.webm` | `--viewport-size`, `viewport` |

For Playwright, `npx -y playwright codegen --save-storage /tmp/pr-<slug>/auth.json <url>` opens a browser where the user logs in once, and later captures load that state. The file holds session cookies, so keep it out of the description and delete it during cleanup. Without a local Chrome, run `npx -y playwright install chromium` and drop `--channel chrome`.

## Videos

One interaction per video, under 20 seconds, starting from a settled page, as `.mp4` or `.webm`. In the description, a video reference stands alone in its paragraph so the platform renders it as a player. Inside a sentence or a table it becomes a link.

## Layout in the description

Screenshots go in a table, image row first, label row second:

```markdown
| Before | After |
| --- | --- |
| ![Session / Conversation before](/tmp/pr-feat-replay/evidence/base/session-conversation.png) | ![Session / Conversation after](/tmp/pr-feat-replay/evidence/head/session-conversation.png) |
| Session / Conversation, 1440x900 | Session / Conversation, 1440x900 |
```

Videos go under a `**Before:**` line and an `**After:**` line, each image-syntax reference in its own paragraph:

```markdown
**Before:**

![](/tmp/pr-feat-replay/evidence/base/settings-toggle.mp4)

**After:**

![](/tmp/pr-feat-replay/evidence/head/settings-toggle.mp4)
```

## Tests and commands

- For a failing-then-passing test, run the new test in the merge-base worktree when that is cheap. Show the test name, or its pseudocode, and the result line from each revision.
- For a command, show the exact command and the trimmed output that proves the point.
