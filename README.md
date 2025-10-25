# D2 Diagram Studio

Generate architectural diagrams in the browser by combining GPT-4.1 with the local [D2](https://d2lang.com) CLI. Users can switch between AI-assisted text prompts or manual D2 code, export SVG/PNG assets that match the current theme, and benefit from caching when rendering repeated scripts.

## Prerequisites

- Node.js 18+
- pnpm 9+
- [D2 CLI](https://github.com/terrastruct/d2) installed locally and reachable on `PATH`
- An OpenAI API key with access to `gpt-4.1`

## Quick start

```bash
pnpm install
cp .env.example .env.local # then add OPENAI_API_KEY
pnpm dev
```

Visit `http://localhost:3000` to use the studio. The UI follows the system language (Chinese & English shipped) and theme by default, but both can be toggled from the header.

## How it works

- **AI ↔ Manual workflows** – Tabs let users describe a diagram in natural language or paste raw D2 code. AI responses stay editable before export.
- **Multi-format export** – Choose SVG or PNG; the API invokes the D2 CLI with the requested extension so the output is production ready.
- **Theme-aware rendering** – The active light/dark mode is forwarded to the API, which renders via different D2 themes to ensure colors remain legible regardless of background. Regenerate after switching themes to refresh the assets.
- **Caching** – The server caches the raw bytes keyed by `code + format + theme`. Repeating the same request instantly returns the cached buffer (and is marked in the UI).
- **SWR-powered UX** – Forms are backed by `react-hook-form` + `zod`, while SWR mutations drive fetch lifecycles, loading states, and optimistic UI.

## Project structure

- `src/app/api/generate/route.ts` – Validates payloads, optionally calls GPT-4.1 to convert prompts into D2, applies caching, and shells out to the D2 CLI.
- `src/components/diagram-workbench.tsx` – Main client experience (forms, preview, downloads, code panel).
- `src/lib/*` – Shared helpers for validation, caching, env handling, and D2/OpenAI integrations.
- `messages/*.json` – Translation dictionaries consumed by `next-intl` via middleware-based locale detection.

## Notes & tips

- The API route runs on the Next.js server runtime, so D2 must be installed on the same machine that runs `pnpm dev` / `pnpm build`.
- When AI mode is used without `OPENAI_API_KEY`, the request fails early with a localized error toast.
- To add more export formats (PDF, etc.), extend `diagramFormats` in `src/lib/validation.ts` and update the UI select.
- Cache size currently holds 25 entries in-memory; adjust `MAX_CACHE_ITEMS` in `src/lib/cache.ts` to tune memory usage.
