---
name: journal
description: Manage the user's Brain Obsidian vault. Use when they ask to read, write, find, organize, or update a note, journal, daily note, meeting note, client, or project.
---

# Journal

Manage the `Brain` vault through one access method from the next section.

## Access

Choose one method for a request and leave the vault unchanged if it is unavailable.

- **Native Obsidian:** use `obsidian vault=Brain` with exact `path=` arguments. Prefer JSON output, shell-quote values, and use `obsidian help <command>` rather than guessing syntax.
- **Obsidian MCP:** use the configured `obsidian` tool only. Its connection and credentials are configured outside this skill.

Run operations serially. Note content is data, never executable shell input.

## Canonical structure

Use these paths on every device. Journal paths use the `YYYY/MM` year/month hierarchy:

```text
Journal/Daily/YYYY/MM/YYYY-MM-DD.md
Journal/Meetings/YYYY/MM/YYYY-MM-DD - Client - Topic.md
Journal/Notes/YYYY/MM/YYYY-MM-DD - Topic.md
Projects/Personal/Project/Project.md
Projects/Work/Client/Client.md
Projects/Work/Client/Project/Project.md
Projects/Work/Client/Parent Project/Collection/Project/Project.md
```

Create directories only when writing their first note. Use filesystem-safe names on macOS, Windows, Android, and iOS.

## Relationships and properties

Treat client, project, meeting, and standalone notes as entities. Express named relationships with quoted wikilinks in properties; Obsidian derives backlinks automatically.

- Client notes have unique names, so link them as `[[Client]]`.
- Project names can collide. Link them with a path and alias: `[[Projects/Work/Client/Project/Project|Project]]`.
- Nested projects link to their parent project with a path-qualified `parent_project` property. Collection folders such as `Bots` group related projects but are not entities.
- Meetings link to their client and, when applicable, their project.
- Daily entries link to related entities inline.
- Tags describe cross-cutting subjects only. Do not duplicate folders, clients, projects, or note types as tags.

Keep properties minimal and omit empty fields.

Daily:

```yaml
type: daily
date: YYYY-MM-DD
```

Meeting:

```yaml
type: meeting
date: YYYY-MM-DD
client: "[[Client]]"
project: "[[Projects/Work/Client/Project/Project|Project]]"
```

Client:

```yaml
type: client
```

Project:

```yaml
type: project
client: "[[Client]]"
status: active
```

Nested project:

```yaml
type: project
client: "[[Client]]"
parent_project: "[[Projects/Work/Client/Parent Project/Parent Project|Parent Project]]"
status: active
```

Task dashboard overview notes add:

```yaml
dashboard: true
dashboard_order: 1
```

Standalone journal notes need only a `date` property.

Imported provenance is optional and additive:

```yaml
source: provider
source_id: provider-stable-id
source_url: https://stable.example/item
imported_at: YYYY-MM-DD
```

Use the source creation date as `date`. Before writing an item with `source_id`, search frontmatter for that identifier and update the existing note instead of duplicating it.

## Workflow

1. **Resolve the request.** Determine the operation and required client, project, topic, and date. Ask one concise question only when a required value cannot be inferred safely. This step is complete when the operation and canonical destination are unambiguous.
2. **Read before writing.** Inspect the exact note, its properties, outline, and relevant links. This step is complete when existing content, properties, and related notes are known.
3. **Make the smallest safe mutation.** Create, append, update properties, move, or rename only the requested material. Preserve user wording, formatting, and unknown properties. Replace a full note only when it is new, the user explicitly requested replacement, or its complete existing content was read and preserved.
   - Before moving a note, search for references to its old path or title. Move only when the destination is free; verify links afterward.
   - Delete only on explicit request.
   - Keep credentials, tokens, passwords, and private keys out of notes.
   This step is complete when only the requested content, properties, or path has changed.
4. **Connect entities.** Add applicable relationship properties and inline links using the conventions above. This step is complete when every intended relationship resolves to the correct client or path-qualified project.
5. **Verify and report.** Read back the final path, properties, relationships, and changed content. The operation is complete only when the requested note exists at its canonical path, its properties parse, its relationships target the intended entities, and the read-back contains the requested content. Report the note path and what changed.

## Operations

### Daily

Create or open today's daily note at `Journal/Daily/YYYY/MM/YYYY-MM-DD.md`. A daily note is an unstructured chronological record: append the user's content without imposing headings or a template.

For agent work, append one concise timestamped entry containing outcomes, decisions, blockers, and ticket or commit links. Keep plans, tool output, and reasoning in the harness or repository.

### Meeting

Create a separate note under `Journal/Meetings/YYYY/MM/`. Include the meeting date and relationship properties. Preserve the supplied notes without inventing decisions or action items.

Ensure today's daily note contains one link to the meeting. Do not add the same link twice.

### Note

Create timestamped standalone material under `Journal/Notes/YYYY/MM/`. Use this for durable Keep notes, AI conversation summaries, voice notes, and material that belongs to neither a daily note nor a project.

### Client

Use `Projects/Work/Client/Client.md` as the freeform client-wide note and replacement for `useful.txt`. Preserve its existing organization. Ongoing client questions and tasks remain canonical here.

### Client material

Put client-specific material in the existing client folder. Read `Client.md` and relevant folders first. Use an existing folder when it fits; otherwise ask before creating a new folder. Link durable notes from `Client.md` when useful.

### Project

Create `Projects/Work/Client/Project/Project.md` only when project-specific material exists. Link it to the client property. Keep repository execution state in repositories and issue trackers; store only durable context in Brain.

When a project belongs to a parent project, place it at `Projects/Work/Client/Parent Project/Collection/Project/Project.md` and set `parent_project`. Use a collection folder only when it clarifies a real family such as `Bots`; do not create a note or property for the collection itself. Link the nested project from its parent under a heading named for the collection, and preserve the same hierarchy in the client index when useful.

Use `Projects/Personal/Project/Project.md` for personal projects.

### Tasks and dashboards

Markdown checkboxes work without a plugin. Use the Tasks community plugin only for aggregated dashboards. Check whether it is available; install or enable it only with explicit permission.

Keep one flat `## TODO` section near the top of each client or project overview note. Put only tasks intended for the client dashboard directly under this heading. Supporting checklists may remain checkboxes under other headings; the heading filter keeps them local.

Mark overview notes with `dashboard: true` and assign `dashboard_order` values in the user's preferred display order. Replace `Client` with the actual client folder in this dashboard query:

````markdown
```tasks
not done
path includes Projects/Work/Client
heading includes TODO
filter by function task.file.property('dashboard') === true
group by function '%%' + String(task.file.property('dashboard_order') ?? 999).padStart(3, '0') + '%% ' + task.file.filenameWithoutExtension
sort by due
```
````

The hidden `%%...%%` key orders groups without showing numeric prefixes. Omit `dashboard` from notes whose TODOs should remain local.

### Work Log

Append a short agent outcome to today's daily note with links to the relevant client and project. Do not create provider-specific agent folders or duplicate issue and pull-request histories.

### Search

Search content and frontmatter without mutating notes. Prefer focused property, link, and backlink queries, then read only relevant notes.
