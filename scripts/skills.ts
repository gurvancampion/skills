import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { manual, sources } from '../meta.ts'

export const root = resolve(import.meta.dirname, '..')
export const skillsRoot = join(root, 'skills')

export interface Skill {
  /** Folder under `skills/` holding the skill, e.g. `mattpocock` */
  origin: string
  /** Absolute path of the skill folder */
  dir: string
  /** `name:` from the SKILL.md frontmatter */
  name: string | undefined
}

export function readSkillName(skillDir: string): string | undefined {
  const frontmatter = readFileSync(join(skillDir, 'SKILL.md'), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  return frontmatter?.match(/^name:\s*["']?([^"'\r\n]+?)["']?\s*$/m)?.[1]
}

/** Skills sit at `skills/<origin>/<name>/` or `skills/<origin>/<category>/<name>/`, the depth `npx skills` discovers. */
export function listSkills(): Skill[] {
  const skills: Skill[] = []
  const walk = (origin: string, dir: string, depth: number) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue
      const child = join(dir, entry.name)
      if (existsSync(join(child, 'SKILL.md')))
        skills.push({ origin, dir: child, name: readSkillName(child) })
      else if (depth < 2)
        walk(origin, child, depth + 1)
    }
  }
  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (entry.isDirectory())
      walk(entry.name, join(skillsRoot, entry.name), 1)
  }
  return skills
}

/** Returns every rule the `skills/` tree breaks; an empty list means it is valid. */
export function validate(skills = listSkills()): string[] {
  const errors: string[] = []
  const origins = new Set([...manual, ...Object.values(sources).map(source => source.target)])

  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue
    if (!origins.has(entry.name))
      errors.push(`skills/${entry.name}/ is neither in \`manual\` nor a source \`target\` in meta.ts`)
    if (existsSync(join(skillsRoot, entry.name, 'SKILL.md')))
      errors.push(`skills/${entry.name}/SKILL.md: origin folders hold skill folders, not a SKILL.md`)
  }

  const seen = new Map<string, string>()
  for (const skill of skills) {
    const path = relative(root, skill.dir)
    const folder = skill.dir.split(/[\\/]/).pop()
    if (skill.name !== folder)
      errors.push(`${path}/SKILL.md declares name ${skill.name ?? '(none)'}, expected ${folder}`)
    if (skill.name && seen.has(skill.name))
      errors.push(`${path}: name ${skill.name} already used by ${seen.get(skill.name)}; installs are flat, names must be unique`)
    else if (skill.name)
      seen.set(skill.name, path)
  }
  return errors
}

export function assertValid(skills = listSkills()): Skill[] {
  const errors = validate(skills)
  if (errors.length)
    throw new Error(`Invalid skills/ tree:\n- ${errors.join('\n- ')}`)
  return skills
}
