import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const host = await readFile(new URL('../index.js', import.meta.url), 'utf8')
const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')

test('live file assets remain fail-closed by default', () => {
  assert.match(patch, /fileAssetsEnabled: false/u)
  assert.match(host, /config\.enabled === true && config\.fileAssetsEnabled === true/u)
})

test('host uses the public webServer route service for exactly two fixed PNG endpoints', () => {
  assert.match(host, /export const inject = \['webServer'\]/u)
  assert.match(host, /sidebar\.png/u)
  assert.match(host, /hero\.png/u)
  assert.match(host, /ctx\.webServer\.register/u)
  assert.doesNotMatch(host, /req\.url/u)
  assert.doesNotMatch(host, /decodeURIComponent/u)
})

test('live assets stay outside node_modules under persistent DSH home', () => {
  assert.match(host, /join\(dshHome, 'branding-devdevgg', 'assets'\)/u)
  assert.doesNotMatch(host, /node_modules.*branding-devdevgg.*assets/u)
})

test('asset responses disable browser caching for F5 visual iteration', () => {
  assert.match(host, /Cache-Control', 'no-store, no-cache, must-revalidate'/u)
  assert.match(host, /Pragma', 'no-cache'/u)
  assert.match(host, /Expires', '0'/u)
})

test('asset routes are read-only and PNG-only in v0.1.0', () => {
  assert.match(host, /req\.method !== 'GET' && req\.method !== 'HEAD'/u)
  assert.match(host, /Content-Type', 'image\/png'/u)
  assert.match(host, /statusCode = 405/u)
})
