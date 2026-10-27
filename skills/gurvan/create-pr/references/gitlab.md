# GitLab

Commands for a repository whose remote is on GitLab, where a PR is a merge request (MR). In commands below, `<skill-dir>` is this skill's base directory.

| Need | Command |
|------|---------|
| Login | `glab auth status` |
| Default branch | `glab repo view -F json`, field `default_branch` |
| Open MR for a branch, and its author | `glab mr list --source-branch <branch> -F json`, fields `iid` and `author.username` |
| Logged-in user | `glab api user`, field `username` |
| Head branches of open MRs | `glab mr list -F json`, field `source_branch` of each MR |
| Labels | `glab label list -P 100`. Use only existing labels, because `glab` creates a missing one silently |
| MR template | `.gitlab/merge_request_templates/` |
| MR reference in text | `!123` |

## Create or update, with uploads

`glab --attach` only appends files at the end of the description. Run the bundled script instead. It uploads each file and replaces its `(path)` in the description with `(url)`. Pass exactly the files the description references. It writes the description only when every upload succeeded and every path was found.

```bash
<skill-dir>/scripts/upload-gitlab.sh --body /tmp/pr-<slug>/body.md \
  $(grep -o '/tmp/pr-<slug>/evidence/[^)]*' /tmp/pr-<slug>/body.md | sort -u)

glab mr create --target-branch <target> --source-branch <branch> \
  --title "<title>" --description-file /tmp/pr-<slug>/body.md \
  [--label <a>,<b>] [--assignee <username>] [--remove-source-branch] [--draft] --yes
```

- For an open MR, run `glab mr update <iid> --description-file /tmp/pr-<slug>/body.md`.
- The script reads the host and project from `origin` and calls the API over https on the default port. Pass `--host <api-host>` and `--repo <group/project>` when `origin` uses an SSH alias, another SSH hostname or a custom port.
- Its token comes from `GITLAB_TOKEN`, then `glab config get token --host <host>`, and is never printed. When `glab` keeps the token in the system keyring, set `GITLAB_TOKEN`.
- Without `--body`, the script prints one `/uploads/...` URL per file.
- An upload belongs to the project, not the MR, so the URL works in any description or comment of that project.
