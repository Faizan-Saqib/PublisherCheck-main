# Vercel deployment

This repository is configured for Vercel.

## What was fixed

- Added `api/[...path].ts` as the Vercel catch-all API function.
- Refactored `server.ts` to export the Express app instead of always calling `app.listen()`.
- Local Node/Vite development still works through `server.ts`.
- Added `vercel.json` with the Node.js 22 function runtime.
- Changed the production build to build the Vite frontend only; Vercel bundles the API function separately.
- Hardened frontend API handling so HTML/non-JSON responses no longer surface as `JSON.parse: unexpected character at line 1 column 1`.

## Deploy

Push this repository to GitHub and import it into Vercel. Vercel will run:

```bash
npm run build
```

The frontend is emitted to `dist/`, while `/api/*` is handled by `api/[...path].ts`.

## API endpoints

- `GET /api/health`
- `POST /api/check`
- `GET /api/demo`
- `GET /api/cache/stats`
