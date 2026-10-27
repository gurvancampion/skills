# Wording

A summary of Matt Pocock's `writing-for-agents`. When that skill is installed, read it instead.

## Description and links

The description stays in context every turn, so every word costs on every turn. A link from `SKILL.md` to a reference works the same way, and its sentence decides when the agent opens the file.

- Put the word that should trigger the skill first.
- Write one trigger per distinct case. Synonyms for one case are one case.
- Leave out what the body already says.

## What stays in SKILL.md

A skill holds steps, the ordered actions, and reference, the rules and facts read on demand.

- Keep in `SKILL.md` what every run needs. Move behind a link what only some runs need.
- Keep a concept's definition, rules and caveats under one heading.
- When the file is too long to follow, move reference out before cutting steps.

## Completion criteria

Each step ends on a condition the agent can check.

- A vague end ("understand the code") lets the agent stop early. Make the condition sharper first.
- Ask for all of it. "Every changed file listed" makes the agent do more work than "list the changes".

## Leading words

- One familiar word the model already knows (_tight_ loop, test goes _red_) carries more than a phrase repeated at each step. Reuse the same word every time.
- Say the behaviour you want. A ban puts the banned behaviour in context. Keep a ban only as a hard guardrail, next to the rule it protects.

## Pruning

- Each meaning lives in one place, so a change is a one-place edit.
- Leave to the environment what one command or file shows, such as scripts, config or the folder layout. Write down what the agent cannot find by looking: unwritten conventions, reasons and gotchas.
- Remove lines that no longer bear on the task.

## Invocation

- A model-invoked skill keeps its description, so the agent and other skills can load it. It costs context every turn.
- A user-invoked skill sets `disable-model-invocation: true`. Only the user can call it, and its description becomes a one-line summary for humans.
- Make a skill model-invoked only when the agent or another skill must reach it on its own.
