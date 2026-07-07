# new-website

Personal site for Sam Smith — a single self-contained `index.html`, no build step.

## Structure

- `index.html` — everything: markup, styles (inline `<style>`), and a small script for the temporary font-switcher panel

## Working on this repo

- No build step: open `index.html` in a browser to preview.
- Content placeholders are marked with `<!-- TODO: ... -->` comments.
- The floating font-switcher panel (bottom-right) is a dev tool: pick heading/body fonts in the browser, then hard-code the choices into `:root` and delete the panel, its CSS block, and the script before shipping.
- Multiple Claude sessions may work on this repo — pull before starting, push when done, keep changes small and self-contained.

## Deploying

GitHub Pages: Settings → Pages → deploy from the default branch, root folder.
