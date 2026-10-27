# Credits

`create-pr` combines three MIT-licensed skills and adapts them to GitLab, before/after evidence on any project and commit splitting:

- **Matt Pocock's `pr`**, https://github.com/mattpocock/skills/tree/main/skills/engineering/pr (commit `e484a809`): the Summary / Evidence / Merge Danger sections, the one-way and two-way door, and the menu of views in `references/diagrams.md`. Its menu credits Dex Horthy's [`show-me`](https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md) skill (Humanlayer).
- **Anthony Fu's `antfu-create-pr`**, https://github.com/antfu/skills/tree/main/skills/antfu-create-pr (commit `1d271701`): the workflow from merge base to published PR, the optional body sections, the visual evidence method and `gh --attach`. `scripts/upload-github.sh` is its `upload-github-attachment.sh`, unchanged apart from one comment line.
- **AIRI's `create-pr` and `upload-github-attachment`**, https://github.com/moeru-ai/airi/tree/main/.agents/skills (commit `17357da1`), which antfu's skill adapts: behaviour scenarios with ids and Mermaid diagrams tied to code.

`scripts/upload-gitlab.sh`, `references/commits.md`, the platform files `references/github.md` and `references/gitlab.md`, and the lookup of project conventions are new.

## Licence notices

Copyright (c) 2026 Matt Pocock
Copyright (c) 2025-PRESENT Anthony Fu <https://github.com/antfu>
Copyright (c) 2024-PRESENT Neko Ayaka

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
