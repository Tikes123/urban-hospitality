# Environment variables

## Base URL (CV links and app origin)

Add to your `.env` file:

```env
# App base URL – used for CV links in View Applicants, Active CV Links, and API.
# Local dev:
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Production (example):
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

- **NEXT_PUBLIC_BASE_URL** – Used in the browser and in the API. Set this so the CV Link column and copy button use the correct URL (e.g. `http://localhost:3000/cv/cv-...` instead of `uhs.link`).
- **BASE_URL** – Optional. Used by the API if `NEXT_PUBLIC_BASE_URL` is not set (e.g. server-only builds).

After changing `.env`, restart the dev server (`npm run dev` or `pnpm dev`).
