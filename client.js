window.__ModuleLoader__.load({
  id: '@devdevgg/dsh-branding-devdevgg',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const CONFIG_KEY = '__DSH_BRANDING_DEVDEVGG__'
    const OCCUPANT_PRIORITY = -2000
    const IMAGE_SOURCE = /^(?:https?:|data:image\/|blob:|\/)/u

    function text(value) {
      return typeof value === 'string' ? value.trim() : ''
    }

    function config() {
      const raw = globalThis[CONFIG_KEY]
      return raw !== null && typeof raw === 'object' ? raw : {}
    }

    function sizeOf(props, fallback) {
      return typeof props?.size === 'number' && Number.isFinite(props.size)
        ? props.size
        : fallback
    }

    function sourceFor(cfg, target) {
      if (cfg.fileAssetsEnabled === true) {
        const liveAsset = target === 'sidebar'
          ? text(cfg.sidebarAssetUrl)
          : text(cfg.heroAssetUrl)
        if (liveAsset !== '') return liveAsset
      }

      const shared = text(cfg.mainLogo)
      if (cfg.separateLogosEnabled !== true) return shared
      const specific = target === 'sidebar' ? text(cfg.sidebarLogo) : text(cfg.heroLogo)
      return specific || shared
    }

    function BrandMark({ source, size }) {
      const boxStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flex: '0 0 auto',
      }

      if (IMAGE_SOURCE.test(source)) {
        return h('span', { style: boxStyle, 'aria-hidden': true },
          h('img', {
            src: source,
            alt: '',
            draggable: false,
            style: {
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            },
          }),
        )
      }

      return h('span', {
        style: {
          ...boxStyle,
          lineHeight: 1,
          fontSize: Math.max(12, Math.round(size * 0.82)),
          overflow: 'hidden',
        },
        'aria-hidden': true,
      }, source)
    }

    function BrandName({ name }) {
      return h('span', {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          minWidth: 0,
          maxWidth: 200,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          letterSpacing: '.03em',
          fontWeight: 600,
        },
      }, name)
    }

    function occupy(ctx, slot, component) {
      ctx.slots.inject(slot, () => ctx.slots.register(
        { name: slot, priority: OCCUPANT_PRIORITY },
        component,
      ))
    }

    function warnReserved(cfg) {
      const requested = []
      if (cfg.heroHeadlineEnabled === true) requested.push('heroHeadline')
      if (cfg.heroBadgeEnabled === true) requested.push('heroBadge')
      if (cfg.visualEditorEnabled === true) requested.push('visualEditor')
      if (requested.length === 0) return
      console.warn(
        '[dsh-branding-devdevgg] reserved v0.1.0 options ignored:',
        requested.join(', '),
      )
    }

    function apply(ctx) {
      const cfg = config()
      if (cfg.enabled !== true) return

      warnReserved(cfg)

      if (cfg.sidebarEnabled !== false) {
        const sidebarLogo = sourceFor(cfg, 'sidebar')
        if (sidebarLogo !== '') {
          occupy(ctx, 'sidebar.brand.mark', (props) =>
            h(BrandMark, { source: sidebarLogo, size: sizeOf(props, 24) }))
        }

        const name = text(cfg.brandName)
        if (name !== '') {
          occupy(ctx, 'sidebar.brand.name', () => h(BrandName, { name }))
        }
      }

      if (cfg.heroEnabled !== false) {
        const heroLogo = sourceFor(cfg, 'hero')
        if (heroLogo !== '') {
          occupy(ctx, 'conversation.hero.brand.mark', (props) =>
            h(BrandMark, { source: heroLogo, size: sizeOf(props, 34) }))
        }
      }

      if (cfg.browserTitleEnabled === true) {
        const title = text(cfg.browserTitle)
        if (title !== '') {
          ctx.effect(() => {
            const previous = document.title
            document.title = title
            return () => {
              document.title = previous
            }
          }, 'dsh-branding-devdevgg: browser title')
        }
      }
    }

    return {
      inject: ['slots'],
      apply,
    }
  },
})
