import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const client = await readFile(new URL('../client.js', import.meta.url), 'utf8')
const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

test('v0.1.0 defaults are fail-closed', () => {
  assert.match(patch, /enabled: false/u)
  assert.match(patch, /browserTitleEnabled: false/u)
  assert.match(patch, /separateLogosEnabled: false/u)
  assert.match(patch, /heroHeadlineEnabled: false/u)
  assert.match(patch, /heroBadgeEnabled: false/u)
  assert.match(patch, /visualEditorEnabled: false/u)
})

test('ModuleLoader registration id matches the scoped npm package name', () => {
  const match = client.match(/window\.__ModuleLoader__\.load\(\{\s*id:\s*['"]([^'"]+)['"]/u)
  assert.ok(match, 'client.js must register through __ModuleLoader__.load')
  assert.equal(match[1], pkg.name)
})

test('client uses public brand slots and avoids DOM scraping or browser-local persistence', () => {
  assert.match(client, /sidebar\.brand\.mark/u)
  assert.match(client, /sidebar\.brand\.name/u)
  assert.match(client, /conversation\.hero\.brand\.mark/u)
  assert.doesNotMatch(client, /localStorage/u)
  assert.doesNotMatch(client, /querySelector/u)
  assert.doesNotMatch(client, /MutationObserver/u)
  assert.doesNotMatch(client, /createElement\(['"]style['"]\)/u)
})

test('client does not mutate locale state', () => {
  assert.doesNotMatch(client, /setLocale/u)
  assert.doesNotMatch(client, /locale\.preference/u)
  assert.doesNotMatch(client, /addLanguage/u)
  assert.doesNotMatch(client, /locale\.register/u)
})

test('package pins the intended DSH compatibility line', () => {
  assert.equal(pkg.name, '@devdevgg/dsh-branding-devdevgg')
  assert.equal(pkg.version, '0.1.0')
  assert.match(pkg.engines.dsh, /0\.2\.0-rc\.2/u)
})
