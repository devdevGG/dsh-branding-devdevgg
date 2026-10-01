# Branding assets

v0.1.0 supports persistent live PNG assets outside `node_modules` for fast visual iteration.

Runtime directory:

```text
$DSH_HOME/branding-devdevgg/assets/
├── sidebar.png
└── hero.png
```

When `fileAssetsEnabled: true` and the plugin itself is enabled:

- `sidebar.png` feeds `sidebar.brand.mark`;
- `hero.png` feeds `conversation.hero.brand.mark`;
- both files are served from the DSH origin with `Cache-Control: no-store`;
- replacing either file only requires a browser refresh (`F5`/`Ctrl+F5`), not a plugin reinstall;
- the two files may contain the same PNG in v0.1.0;
- changing one file affects only its corresponding surface.

The files intentionally live under persistent DSH home instead of the installed package so plugin reinstall/upgrade does not erase operator-owned branding assets.

v0.1.0 keeps this mode deliberately narrow: PNG only, fixed filenames, GET/HEAD only, no browser upload/editor surface. A later version may add separate image controls and a visual settings editor.
