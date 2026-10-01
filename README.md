# @devdevgg/dsh-branding-devdevgg

Central branding for a DeepSeek Harness Web deployment, built around the public DSH brand slots rather than DOM scraping.

**Status:** v0.1.0 development candidate. Target runtime: **DeepSeek Harness 0.2.0-rc.2**. The bundle is deliberately **disabled by default** until shadow/runtime/browser validation is complete.

## v0.1.0 scope

When enabled, the core can provide:

- `sidebar.brand.mark` — custom mark in the upper-left sidebar.
- `sidebar.brand.name` — central deployment name, default `AI DEV LAB`.
- `conversation.hero.brand.mark` — the same mark above the new-conversation composer.
- One shared logo source for sidebar + hero by default.
- Optional separate sidebar/hero logo sources.
- Optional browser-tab title.
- Natural fallback to the DSH occupants whenever a custom value is empty or a surface is disabled.

The implementation intentionally does **not** scrape the DOM, use `localStorage`, inject global CSS, modify Models/Settings, or touch `locale.preference`.

## i18n safety

v0.1.0 does not import or call the DSH locale service. It therefore does not register a competing Portuguese locale, does not switch language variants, and does not change the active locale selected by `@mimateinn/dsh-i18n`.

The future `heroHeadline` and `heroBadge` fields are present only as reserved, default-off switches. In v0.1.0 they have no runtime effect. If someone turns them on early, the browser logs a warning and leaves DSH/i18n text untouched.

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
        separateLogosEnabled: false
        sidebarLogo: ''
        heroLogo: ''
        browserTitleEnabled: false
        browserTitle: AI DEV LAB
        heroHeadlineEnabled: false
        heroHeadline: ''
        heroBadgeEnabled: false
        heroBadge: ''
        visualEditorEnabled: false
```

`enabled: false` makes the plugin inert. This is the committed default for the first shadow tests.

## Logo source

`mainLogo` is the single source used by both brand marks. It accepts:

- same-origin paths beginning with `/`;
- `https:` image URLs;
- `data:image/...` URLs, including a centrally configured transparent PNG;
- `blob:` URLs;
- plain text/emoji as a fallback glyph.

For the AI DEV LAB deployment we intend to use one transparent PNG for both the sidebar and the conversation hero. The actual image is intentionally not committed until the final asset is selected.

If `separateLogosEnabled: true`, `sidebarLogo` and `heroLogo` override `mainLogo` independently; an empty per-surface value falls back to `mainLogo`.

## Reserved/default-off features

| Feature | v0.1.0 default | Runtime status |
| --- | --- | --- |
| Hero headline override | off | reserved/no-op |
| Hero badge override | off | reserved/no-op |
| Browser title | off | implemented |
| Separate logos | off | implemented |
| Visual editor | off | reserved/no-op |

Hero-copy customization is deliberately deferred until it can be implemented without competing with `dsh-i18n` ownership of locale state.

## Fallback behavior

The plugin registers only values that are actually configured. If `mainLogo` is empty, DSH keeps its own mark. If `brandName` is empty, DSH keeps its own wordmark. If the plugin itself is disabled, it registers no brand occupants at all.

The custom occupants use priority `-2000`, so once intentionally enabled they deterministically win over the official priority-0 brand and over the referenced `linyupark/dsh-brand-custom` priority `-1000` if both are accidentally present. Running two branding plugins at once is still discouraged.

## Tests

```sh
npm test
npm run check
```

The v0.1.0 tests verify the default-off posture, slot registrations, shared-logo behavior, separate-logo behavior, title restoration, and static safety invariants such as no `localStorage`, no DOM queries, and no locale mutation APIs.

## Attribution

This project is MIT licensed. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the upstream projects that informed the slot-based design.
