# Solartantra Enrol Worker (Cloudflare)

Serverless email API for a static frontend.

## Deploy

1. Install Wrangler and login:
   - `npm i -g wrangler`
   - `wrangler login`
2. Copy `wrangler.toml.example` to `wrangler.toml` and fill values.
3. Create KV namespace and set the id in `wrangler.toml`.
4. (Optional) Add Turnstile secret:
   - `wrangler secret put TURNSTILE_SECRET`
5. Deploy:
   - `wrangler deploy`

## Frontend

Set `enrolApiUrl` to your deployed Worker endpoint + `/enrol`.

## Notes

- MailChannels requires a valid sender domain. Set `FROM_EMAIL` to a domain you control.
- CORS origin is restricted by `ALLOWED_ORIGINS`.
