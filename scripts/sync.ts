import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { sources } from '../meta.ts'
import { assertValid, listSkills, readSkillName, root, skillsRoot } from './skills.ts'

const [flag, ...keys] = process.argv.slice(2)
if ((flag && flag !== '--update') || keys.some(key => !(key in sources)))
  throw new Error(`Usage: node scripts/sync.ts [--update [${Object.keys(sources).join('|')}...]]`)

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
// --update then moves the pins of the given sources, or of all, to their upstream default branch tip.
execFileSync('git', ['submodule', 'update', '--init', '--', ...expected], { cwd: root, env, stdio: 'inherit' })
if (flag)
  execFileSync('git', ['submodule', 'update', '--remote', '--', ...(keys.length ? keys.map(key => `sources/${key}`) : expected)], { cwd: root, env, stdio: 'inherit' })

// A SOURCE.md marks a synced copy: remove every one, then regenerate them. Hand-written skills have
// none, so they stay, and a target folder can also hold hand-written skills.
for (const skill of listSkills().filter(skill => existsSync(join(skill.dir, 'SOURCE.md'))))
  rmSync(skill.dir, { recursive: true, force: true })

let synced = 0
for (const [key, source] of Object.entries(sources)) {
  const sourceRoot = join(root, 'sources', key)
  const commit = git(['rev-parse', 'HEAD'], sourceRoot)
  const license = resolve(sourceRoot, source.license)
  if (!existsSync(license))
    throw new Error(`${key}: license ${source.license} not found`)

  for (const [path, destination] of Object.entries(source.skills)) {
    // `npx skills` reads three levels below skills/: <target>/<category>/<name> at most
    if (!/^(?:[\w.-]+\/)?[\w.-]+$/.test(destination))
      throw new Error(`${key}: ${destination} must be <name> or <category>/<name>`)
    const name = basename(destination)
    const from = resolve(sourceRoot, path)
    if (!from.startsWith(sourceRoot + sep) || !existsSync(join(from, 'SKILL.md')))
      throw new Error(`${key}: no SKILL.md in ${path}; did upstream move it?`)
    const declaredName = readSkillName(from)
    if (declaredName !== name)
      throw new Error(`${key}: ${path} declares name ${declaredName ?? '(none)'}, meta.ts expects ${name}`)

    const installedName = `${source.prefix ?? ''}${name}`
    const to = join(skillsRoot, source.target, dirname(destination), installedName)
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

// A category or origin folder left empty belonged to skills or a source removed from meta.ts
const removeIfEmpty = (dir: string) => readdirSync(dir).length === 0 && rmSync(dir, { recursive: true })
for (const origin of readdirSync(skillsRoot, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
  const originDir = join(skillsRoot, origin.name)
  for (const category of readdirSync(originDir, { withFileTypes: true }).filter(entry => entry.isDirectory()))
    removeIfEmpty(join(originDir, category.name))
  removeIfEmpty(originDir)
}

const skills = assertValid()
console.log(`Synced ${synced} skills; ${skills.length} skills valid in ${new Set(skills.map(skill => skill.origin)).size} origin folders.`)
