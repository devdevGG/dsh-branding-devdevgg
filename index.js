import z from '@deepseek-ai/schemastery'

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

  separateLogosEnabled: z.boolean().default(false),
  sidebarLogo: z.string().default(''),
  heroLogo: z.string().default(''),

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

function publicConfig(config) {
  return Object.freeze({
    enabled: config.enabled === true,
    brandName: text(config.brandName),
    mainLogo: text(config.mainLogo),
    sidebarEnabled: config.sidebarEnabled !== false,
    heroEnabled: config.heroEnabled !== false,
    separateLogosEnabled: config.separateLogosEnabled === true,
    sidebarLogo: text(config.sidebarLogo),
    heroLogo: text(config.heroLogo),
    browserTitleEnabled: config.browserTitleEnabled === true,
    browserTitle: text(config.browserTitle),
    heroHeadlineEnabled: config.heroHeadlineEnabled === true,
    heroHeadline: text(config.heroHeadline),
    heroBadgeEnabled: config.heroBadgeEnabled === true,
    heroBadge: text(config.heroBadge),
    visualEditorEnabled: config.visualEditorEnabled === true,
  })
}

/**
 * Inject only non-secret presentation configuration into index.html.
 * No settings/locale/model/credential state is read or written here.
 */
export function apply(ctx, config) {
  const exposed = publicConfig(config)
  ctx.on('webserver/index-inject', (table) => {
    table.push({
      kind: 'global',
      name: '__DSH_BRANDING_DEVDEVGG__',
      value: exposed,
    })
  })
}
