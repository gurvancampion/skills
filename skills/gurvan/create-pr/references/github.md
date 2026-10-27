# GitHub

Commands for a repository whose remote is on GitHub. In commands below, `<skill-dir>` is this skill's base directory.

| Need | Command |
|------|---------|
| Login | `gh auth status` |
| Default branch | `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name` |
| Open PR for a branch, and its author | `gh pr list --head <branch> --json number,author` |
| Logged-in user | `gh api user --jq .login` |
| Head branches of open PRs | `gh pr list --json headRefName --jq '.[].headRefName'` |
| Labels | `gh label list` |
| PR template | `.github/PULL_REQUEST_TEMPLATE*`, `.github/pull_request_template.md` |
| PR reference in text | `#123` |

## Create or update, with uploads

`gh pr create --attach` (GitHub CLI 2.99 and later) uploads each file and rewrites the matching local path in the description to the uploaded URL, in place:

```bash
gh pr create --base <target> --head <branch> \
  --title "<title>" --body-file /tmp/pr-<slug>/body.md \
  --attach /tmp/pr-<slug>/evidence/base/<id>.png \
  --attach /tmp/pr-<slug>/evidence/head/<id>.png \
  [--label <a>,<b>] [--assignee @me] [--draft]
```

- Each `--attach` path matches the path in the description character for character. An unmatched file is appended at the end. The same file cannot be attached twice.
- For an open PR, `gh pr edit <n> --body-file ... --attach ...` works the same way.
- When `gh pr create --help` lists no `--attach`, run `<skill-dir>/scripts/upload-github.sh <file>` for each file. It prints a `https://github.com/user-attachments/assets/...` URL. Replace the local path with it in the description. For a video, replace the whole `![](path)` reference with the bare URL, alone on its line, which GitHub renders as a player.
- Anonymous requests to an asset URL can return 404 while the image renders on the PR page.
