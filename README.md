# @devdevgg/dsh-branding-devdevgg

Central branding for DeepSeek Harness Web deployments, built around the public DSH brand slots rather than DOM scraping.

**Status:** v0.1.0 validated for **DeepSeek Harness 0.2.0-rc.2**. The committed defaults remain fail-closed (`enabled: false`), while production deployments can opt in explicitly.

## v0.1.0 scope

When enabled, the plugin can provide:

- `sidebar.brand.mark` — custom mark in the upper-left sidebar.
- `sidebar.brand.name` — deployment name, default `AI DEV LAB`.
- `conversation.hero.brand.mark` — custom mark above the new-conversation composer.
- Persistent, independently replaceable `sidebar.png` and `hero.png` files outside `node_modules`.
- Configurable hero size, default `96px`, bounded to `34..160px`.
- Optional shared or separate logo sources when file assets are disabled.
- Optional browser-tab title.
- Natural fallback to the DSH occupants whenever a custom value is empty or a surface is disabled.

The implementation intentionally does **not** scrape the DOM, use `localStorage`, inject global CSS, modify Models/Settings, or touch `locale.preference`.

## i18n safety

v0.1.0 does not import or call the DSH locale service. It therefore does not register a competing Portuguese locale, switch language variants, or change the active locale selected by an i18n plugin.

The future `heroHeadline` and `heroBadge` fields remain reserved, default-off switches. In v0.1.0 they have no runtime effect. If enabled early, the browser logs a warning and leaves DSH/i18n text untouched.

## Default configuration

```yaml
- insert:
    - id: branding-devdevgg
      name: '@devdevgg/dsh-branding-devdevgg'
      config:
        enabled: false
        brandName: AI DEV LAB
        mainLogo: ''
        sidebarEnabled: true
        heroEnabled: true
        heroSize: 96
        separateLogosEnabled: false
        sidebarLogo: ''
        heroLogo: ''
        fileAssetsEnabled: false
        browserTitleEnabled: false
        browserTitle: AI DEV LAB
        heroHeadlineEnabled: false
        heroHeadline: ''
        heroBadgeEnabled: false
        heroBadge: ''
        visualEditorEnabled: false
```

`enabled: false` makes the plugin inert. `fileAssetsEnabled: false` keeps the persistent file routes disabled until the operator opts in.

## Persistent PNG assets

With both `enabled: true` and `fileAssetsEnabled: true`, the plugin serves two fixed PNG files from the persistent DSH home:

```text
$DSH_HOME/branding-devdevgg/assets/
├── sidebar.png
└── hero.png
```

The paths are relative to `DSH_HOME`; the plugin does **not** depend on a specific Docker host path.

For example, a deployment may map host storage such as:

```text
/opt/AI_DEV_LAB_DSH/data/dsh-home/
```

to container/runtime DSH home:

```text
/home/node/.dsh/
```

In that case the host-side asset directory becomes:

```text
/opt/AI_DEV_LAB_DSH/data/dsh-home/branding-devdevgg/assets/
```

Another deployment can use a completely different host path as long as it maps to the correct persistent `DSH_HOME`.

The asset endpoints are intentionally narrow: PNG only, fixed filenames, GET/HEAD only, `Cache-Control: no-store`, and no browser upload API. Replacing either file takes effect on browser refresh without reinstalling or restarting the plugin.

See [assets/README.md](assets/README.md) for the operator workflow.

## Hero size

`heroSize` controls only `conversation.hero.brand.mark`. The sidebar continues to follow its compact DSH slot size.

- default: `96`
- minimum: `34`
- maximum: `160`

Values outside the supported range are clamped by the client. Changing the PNG itself needs only a browser refresh; changing `heroSize` is configuration and normally requires the DSH web runtime to reload/restart.

## Non-file logo sources

When `fileAssetsEnabled` is false, `mainLogo` is the shared source used by both marks. It accepts:

- same-origin paths beginning with `/`;
- `https:` image URLs;
- `data:image/...` URLs;
- `blob:` URLs;
- plain text/emoji as a fallback glyph.

If `separateLogosEnabled: true`, `sidebarLogo` and `heroLogo` override `mainLogo` independently; an empty per-surface value falls back to `mainLogo`.

## Reserved/default-off features

| Feature | v0.1.0 default | Runtime status |
| --- | --- | --- |
| Persistent file assets | off | implemented |
| Hero size | 96px | implemented |
| Hero headline override | off | reserved/no-op |
| Hero badge override | off | reserved/no-op |
| Browser title | off | implemented |
| Separate non-file logos | off | implemented |
| Visual editor/upload UI | off | reserved/no-op |

Hero-copy customization and browser asset upload are deliberately deferred until they can be implemented without competing with i18n ownership or widening the server write surface.

## Fallback behavior

The plugin registers only values that are actually configured. If the active logo source is empty, DSH keeps its own mark. If `brandName` is empty, DSH keeps its own wordmark. If the plugin itself is disabled, it registers no brand occupants and no asset routes.

The custom occupants use priority `-2000`, so once intentionally enabled they deterministically win over the official priority-0 brand and over the referenced `linyupark/dsh-brand-custom` priority `-1000` if both are accidentally present. Running two branding plugins at once is still discouraged.

## Tests

```sh
npm test
npm run check
```

The v0.1.0 suite verifies fail-closed defaults, slot registrations, configurable/bounded hero size, persistent live-file routing, independent sidebar/hero assets, cache policy, read-only PNG routes, shared/separate logo behavior, title restoration, ModuleLoader/package identity, and static safety invariants such as no `localStorage`, no DOM scraping, and no locale mutation APIs.

The validated v0.1.0 candidate passed 19 source tests plus shadow/live functional regression, real ModuleLoader bundle checks, HTTP asset checks, hot-swap-without-restart verification, and browser validation on DSH 0.2.0-rc.2.

## Attribution

This project is MIT licensed. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the upstream projects that informed the slot-based design.
