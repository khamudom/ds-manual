# DS Field Manual

A personal design-system reference site for a UX engineer, built with Astro.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Structure

- `src/layouts/Base.astro` — shared shell: skip link, sidebar nav (aria-current), fonts, mobile menu
- `src/styles/global.css` — token-tiered CSS (primitives → semantic), light/dark via prefers-color-scheme
- `src/pages/` — one page per topic: foundation, tokens, components, patterns, accessibility, guidance, governance, checklist, resources
- `src/pages/checklist.astro` — checklist content lives in the `groups` array in frontmatter; progress persists in localStorage (`ds-checklist-v1`)

## Extending

Add a page: create `src/pages/<name>.astro` using `Base.astro`, then add it to the `nav` array in the layout. Add checklist questions by editing the `groups` array — IDs are derived from group id + index, so appending items preserves saved progress.
