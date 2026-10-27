# Diagrams

Pick the smallest view that makes the key point clear, next to the short text it supports. Use one or two per description, and a third only when each answers a different reviewer question. Keep only the calls, files, states and boundaries the point needs, named after real symbols.

## Which view

| Change | View |
|--------|------|
| Logic or an algorithm | Pseudocode in a `text` block |
| Runtime call order inside one process | Call tree in a `text` block |
| UI structure | Component tree with the state and module boundaries that matter |
| File layout or a broad refactor | Shallow file tree with one comment per folder |
| What changes inside a shape the reviewer knows | `diff` block of that tree or pseudocode, `+` and `-` lines only where it changed |
| Responsibility moving between modules or services | Mermaid `flowchart LR` |
| Ordering, async work, retries, cancellation, cleanup | Mermaid `sequenceDiagram` |
| States, transitions, terminal or recovery states | Mermaid `stateDiagram-v2` |
| Database schema | Mermaid `erDiagram` |

A `diff` block suits a change to a known shape:

```diff
 submitForm
   createSession
     persistPrompt
+    expandSkillMention
     launchAgent
```

## Mermaid rules

- Label arrows with the call, event, command or data that crosses them.
- In a sequence diagram, each `alt` branch matches a branch in the code.
- For a fix that changes a flow or a state model, show a `Before` and an `After` diagram at the same level of detail, then name the exact step or edge that changed.
- Mark a path inferred rather than read in the code as an assumption.
- When no diagram helps, write one line: `Diagram: not applicable, <reason>.`

## Rendering gotchas

- Quote a label that holds parentheses, brackets, colons or slashes: `A["save(content)"]`.
- A node named `end` breaks a flowchart. Name it `done` or quote it.
- Stay with `flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `erDiagram` and `gitGraph`. Self-managed GitLab instances can run an older Mermaid that lacks newer diagram types.
- A syntax error shows as an error box on the published PR, which is why step 6 of the skill parses every block with mermaid-cli before publishing.
