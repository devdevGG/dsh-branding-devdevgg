# Branding assets

The v0.1.0 repository intentionally does not ship a final logo image yet.

Target asset for AI DEV LAB:

- transparent PNG (RGBA);
- approximately square canvas;
- recommended master size: 512x512 or 1024x1024;
- readable on both light and dark backgrounds;
- minimal empty padding around the mark.

The same image will be used for `sidebar.brand.mark` and `conversation.hero.brand.mark` through the `mainLogo` configuration value.

A later revision may add a plugin-owned static asset route so a committed `assets/ai-dev-lab-logo.png` can be served from the DSH origin without converting it to a data URL or relying on an external host.
