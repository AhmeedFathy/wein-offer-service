# WeIN Offer Service

Flask service for the WeIN marketplace pipeline — menu extraction, offer file generation, the admin portal ("WeIN OS"), the team intake form, and the NL chat backend.

Full project documentation (pipeline flow, DB schema, deployment guide, n8n workflow backups) lives outside this repo at `D:\Fady\outputs\_WeIN_System\` (local) — see `MASTER_CONTEXT.md` there for the complete picture.

## Routes

| Route | Method | Purpose |
|---|---|---|
| `/health` | GET | Health check |
| `/extract-menu` | POST | Gemini-powered menu extraction (vision + text) |
| `/generate-offer-files` | POST | Build the 4 offer files (xlsx/pdf) from offer JSON |
| `/portal` | GET | WeIN OS portal (admin) |
| `/intake` | GET | Team intake form |
| `/api/chat` | POST | NL chat backend (Mistral or Claude, depending on configured key) |

Submission approve/reject (`/portal-approve`, `/portal-reject`) and the new-provider trigger are **n8n webhook paths**, not Flask routes — the portal calls `weinflow.app.n8n.cloud/webhook/...` directly for those.

## Environment variables

Set in the PythonAnywhere WSGI file (`/var/www/wein_pythonanywhere_com_wsgi.py`), not in a `.env` here:

- `GOOGLE_API_KEY` — required, used for Gemini menu extraction
- `MISTRAL_API_KEY` — used for `/api/chat` (current default chat provider)
- `ANTHROPIC_API_KEY` — optional, swaps `/api/chat` to Claude when set (code path exists, not yet enabled in production)

This service does **not** read Supabase credentials — the portal talks to Supabase directly from the browser, and n8n nodes use their own hardcoded service-role key.

## Deploy

```bash
git push                                  # from local
# then, on PythonAnywhere:
cd ~/wein-offer-service && git pull origin main && touch /var/www/wein_pythonanywhere_com_wsgi.py
```

No CI/CD — deploy is manual. See `_WeIN_System/docs/DEPLOYMENT_GUIDE.md` for the full guide.
