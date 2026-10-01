import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import vm from 'node:vm'

const source = await readFile(new URL('../client.js', import.meta.url), 'utf8')

function boot(config, title = 'DeepSeek Harness') {
  let definition
  const registrations = []
  const disposers = []
  const warnings = []
  const document = { title }

  const React = {
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children }
    },
  }

  const context = {
    window: {
      __ModuleLoader__: {
        load(value) {
          definition = value
        },
      },
    },
    document,
    console: {
      warn(...args) { warnings.push(args.join(' ')) },
    },
    __DSH_BRANDING_DEVDEVGG__: config,
    Number,
  }
  context.globalThis = context

  vm.runInNewContext(source, context, { filename: 'client.js' })
  assert.ok(definition)

  const plugin = definition.factory((name) => {
    if (name === 'react') return React
    throw new Error(`unexpected require: ${name}`)
  })

  const ctx = {
    slots: {
      inject(slot, callback) {
        return callback()
      },
      register(options, component) {
        registrations.push({ options, component })
        return () => {}
      },
    },
    effect(callback) {
      const dispose = callback()
      if (typeof dispose === 'function') disposers.push(dispose)
      return dispose
    },
  }

  plugin.apply(ctx)
  return { plugin, registrations, disposers, warnings, document }
}

test('disabled plugin is completely inert', () => {
  const result = boot({ enabled: false, brandName: 'AI DEV LAB', mainLogo: '/logo.png' })
  assert.deepEqual(Array.from(result.plugin.inject), ['slots'])
  assert.equal(result.registrations.length, 0)
  assert.equal(result.document.title, 'DeepSeek Harness')
})

test('shared logo occupies sidebar and hero while the name occupies only sidebar', () => {
  const result = boot({
    enabled: true,
    brandName: 'AI DEV LAB',
    mainLogo: '/logo.png',
    sidebarEnabled: true,
    heroEnabled: true,
    separateLogosEnabled: false,
    browserTitleEnabled: false,
  })

  const bySlot = new Map(result.registrations.map((row) => [row.options.name, row]))
  assert.equal(result.registrations.length, 3)
  assert.ok(bySlot.has('sidebar.brand.mark'))
  assert.ok(bySlot.has('sidebar.brand.name'))
  assert.ok(bySlot.has('conversation.hero.brand.mark'))
  assert.equal(bySlot.get('sidebar.brand.mark').options.priority, -2000)

  const sidebarElement = bySlot.get('sidebar.brand.mark').component({ size: 24 })
  const heroElement = bySlot.get('conversation.hero.brand.mark').component({ size: 34 })
  assert.equal(sidebarElement.props.source, '/logo.png')
  assert.equal(heroElement.props.source, '/logo.png')
})

test('separate logo mode falls back to main logo per surface', () => {
  const result = boot({
    enabled: true,
    brandName: '',
    mainLogo: '/main.png',
    sidebarEnabled: true,
    heroEnabled: true,
    separateLogosEnabled: true,
    sidebarLogo: '/sidebar.png',
    heroLogo: '',
  })

  const bySlot = new Map(result.registrations.map((row) => [row.options.name, row]))
  assert.equal(result.registrations.length, 2)
  assert.equal(bySlot.get('sidebar.brand.mark').component({ size: 24 }).props.source, '/sidebar.png')
  assert.equal(bySlot.get('conversation.hero.brand.mark').component({ size: 34 }).props.source, '/main.png')
})

test('empty logo preserves the DSH mark fallback', () => {
  const result = boot({
    enabled: true,
    brandName: 'AI DEV LAB',
    mainLogo: '',
    sidebarEnabled: true,
    heroEnabled: true,
  })
  assert.deepEqual(result.registrations.map((row) => row.options.name), ['sidebar.brand.name'])
})

test('browser title is opt-in and restored on disposal', () => {
  const result = boot({
    enabled: true,
    brandName: '',
    mainLogo: '',
    browserTitleEnabled: true,
    browserTitle: 'AI DEV LAB',
  }, 'DeepSeek Harness')

  assert.equal(result.document.title, 'AI DEV LAB')
  assert.equal(result.disposers.length, 1)
  result.disposers[0]()
  assert.equal(result.document.title, 'DeepSeek Harness')
})

test('reserved i18n/editor switches do not alter slots and emit a warning', () => {
  const result = boot({
    enabled: true,
    brandName: '',
    mainLogo: '',
    heroHeadlineEnabled: true,
    heroBadgeEnabled: true,
    visualEditorEnabled: true,
  })
  assert.equal(result.registrations.length, 0)
  assert.equal(result.warnings.length, 1)
  assert.match(result.warnings[0], /reserved v0\.1\.0 options ignored/u)
})
