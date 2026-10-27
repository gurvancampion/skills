import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { manual, sources } from '../meta.ts'
import { assertValid, readSkillName, root, skillsRoot } from './skills.ts'

const args = process.argv.slice(2)
if (args.some(arg => arg !== '--update'))
  throw new Error('Usage: node scripts/sync.ts [--update]')

// Git hooks and `git rebase --exec` export GIT_DIR, which would make every `git -C sources/<key>`
// call read this repository instead of the submodule, and record the wrong commit in SOURCE.md.
const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => !['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX'].includes(name)))
const git = (gitArgs: string[], cwd = root) => execFileSync('git', gitArgs, { cwd, env, encoding: 'utf8' }).trim()

const declared = git(['config', '-f', '.gitmodules', '--get-regexp', String.raw`^submodule\..*\.path$`])
  .split('\n')
  .filter(Boolean)
  .map(line => line.split(' ')[1])
const expected = Object.keys(sources).map(key => `sources/${key}`)
for (const path of declared.filter(path => !expected.includes(path)))
  throw new Error(`${path} is a submodule without an entry in meta.ts; remove it with \`git rm ${path}\``)
for (const path of expected.filter(path => !declared.includes(path)))
  throw new Error(`meta.ts lists ${path} but it is not a submodule; add it with \`git submodule add <url> ${path}\``)

// `.gitmodules` marks every source shallow, so this fetches one commit per source.
// --update moves each pin to the tip of the upstream default branch.
execFileSync('git', ['submodule', 'update', '--init', ...(args.includes('--update') ? ['--remote'] : []), '--', ...expected], { cwd: root, env, stdio: 'inherit' })

const targets = new Set(Object.values(sources).map(source => source.target))
for (const target of targets) {
  if (manual.includes(target))
    throw new Error(`skills/${target}/ is hand-written (\`manual\` in meta.ts) and cannot be a sync target`)
  rmSync(join(skillsRoot, target), { recursive: true, force: true })
}

let synced = 0
for (const [key, source] of Object.entries(sources)) {
  const sourceRoot = join(root, 'sources', key)
  const commit = git(['rev-parse', 'HEAD'], sourceRoot)
  const license = resolve(sourceRoot, source.license)
  if (!existsSync(license))
    throw new Error(`${key}: license ${source.license} not found`)

  for (const [path, name] of Object.entries(source.skills)) {
    const from = resolve(sourceRoot, path)
    if (!from.startsWith(sourceRoot + sep) || !existsSync(join(from, 'SKILL.md')))
      throw new Error(`${key}: no SKILL.md in ${path}; did upstream move it?`)
    const declaredName = readSkillName(from)
    if (declaredName !== name)
      throw new Error(`${key}: ${path} declares name ${declaredName ?? '(none)'}, meta.ts expects ${name}`)

    const installedName = `${source.prefix ?? ''}${name}`
    const to = join(skillsRoot, source.target, installedName)
    cpSync(from, to, { recursive: true })
    const skillFile = join(to, 'SKILL.md')
    if (source.prefix)
      writeFileSync(skillFile, readFileSync(skillFile, 'utf8').replace(/^(---\r?\n[\s\S]*?^name:\s*)["']?[^"'\r\n]+?["']?(\s*)$/m, `$1${installedName}$2`))
    for (const [find, replacement] of source.replace?.[name] ?? []) {
      const content = readFileSync(skillFile, 'utf8')
      if (!content.includes(find))
        throw new Error(`${key}/${name}: replacement \`${find}\` no longer matches; update or drop it in meta.ts`)
      writeFileSync(skillFile, content.replaceAll(find, replacement))
    }
    cpSync(license, join(to, 'LICENSE.md'))
    const renamed = source.prefix ? `- Upstream name: \`${name}\`\n` : ''
    writeFileSync(join(to, 'SOURCE.md'), `# Source\n\n- Repository: ${source.repository}\n- Path: \`${path}\`\n${renamed}- Commit: \`${commit}\`\n`)
    synced++
  }
}

const skills = assertValid()
console.log(`Synced ${synced} skills; ${skills.length} skills valid in ${new Set(skills.map(skill => skill.origin)).size} origin folders.`)
