# Body

When the repository has a PR template, keep its headings and fill them, adding a section below only where the template leaves room. Otherwise use the sections below with their headings as written. The description's length follows the change, so a one-line fix gets a few sentences and its evidence.

## Title

The repository's format from step 1, or Conventional Commits: `type(scope): subject`, imperative, under 70 characters. A squash-merge repository turns the title into the commit message.

## Required sections

```markdown
## Summary

<problem or capability, then what changed and why this approach>
<one visual from diagrams.md>
<what it closes, as a ticket key, a link or the platform's PR reference. When stacked, "Stacked on" and the base PR's reference>

## Evidence

<pairs and test or command evidence, laid out as in evidence.md>

- Checks: <exact command> → <result>, one line each
- Not verified: <what, and why>

## Merge Danger

**Door:** <one-way or two-way>

<what makes it one-way, when it is>

**Blast Radius:** <one word: local, module, service, cross-service or users>

<who or what feels it if it breaks>
```

**Door.** Two-way when a revert undoes it completely. One-way when it persists something a revert leaves behind: a migration, a changed stored format, sent messages or emails, a public API that consumers adopt, deleted data.

**Blast radius.** Scan for consumers of a changed API or shared package, persisted data, config and environment variables, deployment order between services, feature flags, layout shift, mobile and narrow widths, performance on large data.

## Optional sections

Add one only when it makes review faster:

| Section | When | Shape |
|---------|------|-------|
| Change map | The change spans several modules or moves responsibility between them | Table: module, before, after, why. Rows are modules, never a raw file list |
| Boundaries and risks | Real failure modes, invariants, retries, concurrency, migrations | Table: invariant, failure mode, protection, evidence or `Not verified` |
| Deployment | Order between services, migrations, flags, manual steps | Steps, and whether each gap blocks merge |
| Out of scope | Known gaps, follow-ups, what was deliberately left out | Bullets |

## Style

Start each sentence with the fact, without a preamble such as "This PR aims to". Use the project's domain words, from `GLOSSARY.md` or `CONTEXT.md` when one exists. Describe only this branch's own commits.
