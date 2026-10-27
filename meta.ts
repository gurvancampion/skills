/**
 * Upstream repositories cloned as Git submodules in `sources/<key>/`.
 * `node scripts/sync.ts` copies each listed skill into `skills/<target>/<name>/`
 * with the upstream license and a SOURCE.md recording the pinned commit.
 */
export interface Source {
  /** HTTPS URL of the submodule, also written into SOURCE.md */
  repository: string
  /** Origin folder under `skills/`, wiped and regenerated on every sync */
  target: string
  /** License file inside the source, copied as LICENSE.md */
  license: string
  /** Skill folder inside the source -> skill name (must match its `name:`), optionally under one category folder: `engineering/tdd` */
  skills: Record<string, string>
  /** Prepended to each skill's folder and `name:`, e.g. to avoid clashing with another catalog's install */
  prefix?: string
  /** Literal replacements applied to a synced skill's SKILL.md, by upstream skill name */
  replace?: Record<string, [from: string, to: string][]>
}

export const sources: Record<string, Source> = {
  'mattpocock': {
    repository: 'https://github.com/mattpocock/skills',
    target: 'mattpocock',
    license: 'LICENSE',
    skills: {
      'skills/engineering/ask-matt': 'engineering/ask-matt',
      'skills/engineering/code-review': 'engineering/code-review',
      'skills/engineering/codebase-design': 'engineering/codebase-design',
      'skills/engineering/diagnosing-bugs': 'engineering/diagnosing-bugs',
      'skills/engineering/domain-modeling': 'engineering/domain-modeling',
      'skills/engineering/grill-with-docs': 'engineering/grill-with-docs',
      'skills/engineering/implement': 'engineering/implement',
      'skills/engineering/implement-spec': 'engineering/implement-spec',
      'skills/engineering/improve-codebase-architecture': 'engineering/improve-codebase-architecture',
      'skills/engineering/prototype': 'engineering/prototype',
      'skills/engineering/research': 'engineering/research',
      'skills/engineering/retro': 'engineering/retro',
      'skills/engineering/setup-matt-pocock-skills': 'engineering/setup-matt-pocock-skills',
      'skills/engineering/tdd': 'engineering/tdd',
      'skills/engineering/to-spec': 'engineering/to-spec',
      'skills/engineering/to-tickets': 'engineering/to-tickets',
      'skills/engineering/triage': 'engineering/triage',
      'skills/engineering/wayfinder': 'engineering/wayfinder',
      'skills/engineering/wizard': 'engineering/wizard',
      'skills/productivity/grill-me': 'productivity/grill-me',
      'skills/productivity/grilling': 'productivity/grilling',
      'skills/productivity/handoff': 'productivity/handoff',
      'skills/productivity/teach': 'productivity/teach',
      'skills/productivity/to-questionnaire': 'productivity/to-questionnaire',
      'skills/productivity/wait-what': 'productivity/wait-what',
      'skills/productivity/writing-for-agents': 'productivity/writing-for-agents',
    },
  },
  'cursor-plugins': {
    repository: 'https://github.com/cursor/plugins',
    target: 'pstack',
    license: 'pstack/LICENSE',
    skills: {
      'pstack/skills/blast-radius': 'blast-radius',
      'pstack/skills/create-verification-skill': 'create-verification-skill',
      'pstack/skills/maintain-verification-skill': 'maintain-verification-skill',
      'pstack/skills/unslop': 'unslop',
    },
    replace: {
      'create-verification-skill': [['.cursor/skills/', '.agents/skills/']],
    },
  },
  'context7': {
    repository: 'https://github.com/upstash/context7',
    target: 'context7',
    license: 'LICENSE',
    skills: {
      'skills/find-docs': 'find-docs',
    },
  },
  'ponytail': {
    repository: 'https://github.com/DietrichGebert/ponytail',
    target: 'ponytail',
    license: 'LICENSE',
    skills: {
      'skills/ponytail-review': 'ponytail-review',
    },
  },
  'comfy-cli': {
    repository: 'https://github.com/Comfy-Org/comfy-cli',
    target: 'comfy-cli',
    license: 'LICENSE',
    skills: {
      'comfy_cli/skills/comfy': 'comfy',
      'comfy_cli/skills/comfy-custom-nodes': 'comfy-custom-nodes',
      'comfy_cli/skills/comfy-debug': 'comfy-debug',
      'comfy_cli/skills/comfy-director': 'comfy-director',
      'comfy_cli/skills/comfy-relay': 'comfy-relay',
    },
  },
}

/** Hand-written origin folders under `skills/`. Sync never writes into them. */
export const manual = ['gurvan']

/**
 * Origin folders or skill names that `node scripts/pack.ts` flattens into the
 * npm package's `dist/skills/`. Machine-specific skills stay out of the package.
 */
export const packed = ['create-pr', 'skill-authoring']
