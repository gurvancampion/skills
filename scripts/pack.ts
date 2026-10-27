import { cpSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'
import { packed } from '../meta.ts'
import { assertValid, root } from './skills.ts'

// `skills experimental_sync` only discovers `skills/<name>/` or `dist/skills/<name>/`
// inside a package, so the npm package ships the origin folders flattened.
const out = join(root, 'dist', 'skills')
rmSync(out, { recursive: true, force: true })

const skills = assertValid().filter(skill => packed.includes(skill.origin) || packed.includes(skill.name!))
for (const entry of packed.filter(entry => !skills.some(skill => skill.origin === entry || skill.name === entry)))
  throw new Error(`packed entry ${entry} in meta.ts matches no origin folder or skill`)
for (const skill of skills)
  cpSync(skill.dir, join(out, basename(skill.dir)), { recursive: true })

console.log(`Packed ${skills.length} skills into dist/skills/.`)
