# DS Field Manual

A personal design-system reference site for a UX engineer, built with Astro.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Structure

- `src/layouts/Base.astro`: shared shell (skip link, sidebar nav with aria-current, fonts, mobile menu, AI chat)
- `src/components/AiChat.astro`: floating assistant button + panel
- `src/pages/api/chat.ts`: OpenAI proxy (serverless; requires `OPENAI_API_KEY`)
- `src/styles/global.css`: token-tiered CSS (primitives → semantic), light/dark via prefers-color-scheme
- `src/pages/`: one page per topic (foundation, tokens, components, patterns, accessibility, guidance, governance, checklist, resources)
- `src/pages/checklist.astro`: checklist content lives in the `groups` array in frontmatter; progress persists in localStorage (`ds-checklist-v1`)

## Design system assistant

A floating chat button (lower right) is available on every page. It posts to `/api/chat`, which calls OpenAI with a design-system-focused system prompt.

Set these environment variables in Vercel (or a local `.env`):

```bash
OPENAI_API_KEY=sk-...
# optional
OPENAI_MODEL=gpt-4o-mini
```

The site uses `@astrojs/vercel` so the API route can run as a serverless function. Static pages stay prerendered.

## Extending

Add a page: create `src/pages/<name>.astro` using `Base.astro`, then add it to the `nav` array in the layout. Add checklist questions by editing the `groups` array. IDs are derived from group id + index, so appending items preserves saved progress.
