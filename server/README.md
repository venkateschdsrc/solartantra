# Solartantra Enrol API

Secure backend API for the enrol form. Deploy this separately from GitHub Pages.

## Setup

1. Deploy to a Node.js host (Render, Fly.io, Railway, AWS, etc.).
2. Set environment variables from `.env.example` in your hosting provider (do not commit secrets).
3. Update the frontend endpoint in `src/environments/environment.ts` and `src/environments/environment.prod.ts`.

## Endpoints

- `POST /enrol` — accepts multipart form data with fields:
  - `consumerName`, `consumerNumber`, `consumerAddress`, `postalCode`, `phoneNumber`
  - `subject` (optional)
  - `captchaToken` (optional; required if Turnstile is enabled)
  - `billPhoto` (optional file)

- `GET /health` — basic health check

## CORS

Set `ALLOWED_ORIGINS` to your GitHub Pages origin, for example:

```
ALLOWED_ORIGINS=https://solartantra.github.io
```

## Captcha (optional)

If `TURNSTILE_SECRET` is set, a valid token must be supplied as `captchaToken`.

## Rate limiting

Configure `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` to control abuse.
