import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import z from '@deepseek-ai/schemastery'

export const inject = ['webServer']

const ASSET_ROUTE_BASE = '/branding-devdevgg/assets'
const SIDEBAR_ASSET = 'sidebar.png'
const HERO_ASSET = 'hero.png'
const DEFAULT_HERO_SIZE = 96
const MIN_HERO_SIZE = 34
const MAX_HERO_SIZE = 160

/**
 * Host-side configuration. The plugin is deliberately inert by default.
 * Reserved options remain off in v0.1.0 and are never wired into locale state.
 */
export const Config = z.object({
  enabled: z.boolean().default(false),
  brandName: z.string().default('AI DEV LAB'),
  mainLogo: z.string().default(''),

  sidebarEnabled: z.boolean().default(true),
  heroEnabled: z.boolean().default(true),
  heroSize: z.number().default(DEFAULT_HERO_SIZE),

  separateLogosEnabled: z.boolean().default(false),
  sidebarLogo: z.string().default(''),
  heroLogo: z.string().default(''),

  // v0.1.0 live-file mode. Files stay outside node_modules so replacing
  // hero.png/sidebar.png only needs a browser refresh, not a plugin reinstall.
  fileAssetsEnabled: z.boolean().default(false),

  browserTitleEnabled: z.boolean().default(false),
  browserTitle: z.string().default('AI DEV LAB'),

  // Reserved for a future i18n-safe implementation. No runtime effect in v0.1.0.
  heroHeadlineEnabled: z.boolean().default(false),
  heroHeadline: z.string().default(''),
  heroBadgeEnabled: z.boolean().default(false),
  heroBadge: z.string().default(''),

  // Reserved. No localStorage/editor surface is created in v0.1.0.
  visualEditorEnabled: z.boolean().default(false),
})

function text(value) {
  return typeof value === 'string' ? value : ''
}

function heroSize(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return DEFAULT_HERO_SIZE
  return Math.min(MAX_HERO_SIZE, Math.max(MIN_HERO_SIZE, number))
}

function assetUrl(fileName) {
  return `${ASSET_ROUTE_BASE}/${fileName}`
}

function assetsDirectory() {
  const dshHome = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(dshHome, 'branding-devdevgg', 'assets')
}

function publicConfig(config) {
  const fileAssetsEnabled = config.fileAssetsEnabled === true
  return Object.freeze({
    enabled: config.enabled === true,
    brandName: text(config.brandName),
    mainLogo: text(config.mainLogo),
    sidebarEnabled: config.sidebarEnabled !== false,
    heroEnabled: config.heroEnabled !== false,
    heroSize: heroSize(config.heroSize),
    separateLogosEnabled: config.separateLogosEnabled === true,
    sidebarLogo: text(config.sidebarLogo),
    heroLogo: text(config.heroLogo),
    fileAssetsEnabled,
    sidebarAssetUrl: fileAssetsEnabled ? assetUrl(SIDEBAR_ASSET) : '',
    heroAssetUrl: fileAssetsEnabled ? assetUrl(HERO_ASSET) : '',
    browserTitleEnabled: config.browserTitleEnabled === true,
    browserTitle: text(config.browserTitle),
    heroHeadlineEnabled: config.heroHeadlineEnabled === true,
    heroHeadline: text(config.heroHeadline),
    heroBadgeEnabled: config.heroBadgeEnabled === true,
    heroBadge: text(config.heroBadge),
    visualEditorEnabled: config.visualEditorEnabled === true,
  })
}

function assetHandler(fileName) {
  return async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405
      res.setHeader('Allow', 'GET, HEAD')
      res.end()
      return
    }

    let body
    try {
      body = await readFile(join(assetsDirectory(), fileName))
    } catch (error) {
      if (error?.code === 'ENOENT') {
        res.statusCode = 404
        res.setHeader('Cache-Control', 'no-store')
        res.end()
        return
      }
      throw error
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Length', String(body.length))
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('X-Content-Type-Options', 'nosniff')

    if (req.method === 'HEAD') {
      res.end()
      return
    }

    res.end(body)
  }
}

function registerAssetRoutes(ctx) {
  const disposeSidebar = ctx.webServer.register({
    kind: 'exact',
    path: assetUrl(SIDEBAR_ASSET),
    handler: assetHandler(SIDEBAR_ASSET),
  })

  const disposeHero = ctx.webServer.register({
    kind: 'exact',
    path: assetUrl(HERO_ASSET),
    handler: assetHandler(HERO_ASSET),
  })

  return () => {
    disposeHero()
    disposeSidebar()
  }
}

/**
 * Inject only non-secret presentation configuration into index.html.
 * No settings/locale/model/credential state is read or written here.
 */
export function apply(ctx, config) {
  const exposed = publicConfig(config)

  if (config.enabled === true && config.fileAssetsEnabled === true) {
    ctx.effect(() => registerAssetRoutes(ctx))
  }

  ctx.on('webserver/index-inject', (table) => {
    table.push({
      kind: 'global',
      name: '__DSH_BRANDING_DEVDEVGG__',
      value: exposed,
    })
  })
}
