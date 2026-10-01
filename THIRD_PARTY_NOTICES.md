# Third-party notices

`dsh-branding-devdevgg` is original deployment code built against public DeepSeek Harness extension points. The following MIT-licensed projects materially informed the architecture and compatibility design.

## DeepSeek Harness

- Project: `deepseek-ai/deepseek-harness`
- Relevant package: `packages/client/ui-brand-official`
- License: MIT
- Role here: defines the official `sidebar.brand.mark` / `sidebar.brand.name` occupant pattern and the public brand-slot architecture; `ui-conversation` defines `conversation.hero.brand.mark`.

Copyright and license remain with the DeepSeek Harness authors and contributors.

## dsh-brand-custom

- Project: `linyupark/dsh-brand-custom`
- License: MIT
- Role here: reference implementation demonstrating deployment-specific slot occupants, host-to-browser configuration injection, and deterministic custom-brand priority.

Copyright and license remain with the original author and contributors.

## Deliberate differences in this project

v0.1.0 does not copy the locale-variant mechanism from `dsh-brand-custom`. It does not call the locale service or change `locale.preference`, specifically to coexist safely with the deployment's `@mimateinn/dsh-i18n` Portuguese-Brazil setup.
