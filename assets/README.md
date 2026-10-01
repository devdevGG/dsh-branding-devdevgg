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
- `heroSize` controls only the hero mark and defaults to `96px` (`34..160px` bounds);
- both files are served from the DSH origin with `Cache-Control: no-store`;
- replacing either file only requires a browser refresh (`F5`/`Ctrl+F5`), not a plugin reinstall or runtime restart;
- changing one file affects only its corresponding surface.

## Docker/host mapping

The plugin resolves the directory from the runtime `DSH_HOME`. It does not discover or hard-code the Docker host path.

For example, if the container uses:

```text
DSH_HOME=/home/node/.dsh
```

and the host maps persistent storage like:

```text
/opt/AI_DEV_LAB_DSH/data/dsh-home -> /home/node/.dsh
```

then the host operator places the files at:

```text
/opt/AI_DEV_LAB_DSH/data/dsh-home/branding-devdevgg/assets/
```

A different installation may use a different host directory; only the persistent mapping to `DSH_HOME` matters.

## Operator workflow

Use atomic or install-style replacement where possible. Example on a host whose persistent DSH home is `/opt/AI_DEV_LAB_DSH/data/dsh-home`:

```sh
sudo install -o 1000 -g 1000 -m 644 ./new-sidebar.png \
  /opt/AI_DEV_LAB_DSH/data/dsh-home/branding-devdevgg/assets/sidebar.png
```

Then refresh the browser. No DSH restart is required for PNG replacement because the route reads the file fresh on every request and returns no-store cache headers.

The files intentionally live under persistent DSH home instead of the installed package so plugin reinstall/upgrade does not erase operator-owned branding assets.

v0.1.0 keeps this mode deliberately narrow: PNG only, fixed filenames, GET/HEAD only, no browser upload/editor surface. A later version may add authenticated upload controls and a visual settings editor.
