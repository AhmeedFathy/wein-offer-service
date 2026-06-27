# WeIN Offer Service

Flask service for the WeIN marketplace pipeline — menu extraction, offer file generation, the admin portal ("WeIN OS"), the team intake form, and the NL chat backend.

**This is the real, deployed backend** — not a temp/scratch folder (renamed from `_temp_wein_offer_service` in June 2026 once that name became misleading). Root only contains what's actually used: `app.py`, `build_offer_files.py`, `build_pdfs.py`, the two `Template - *.xlsx` input templates, `requirements.txt`, `Procfile`, `portal/`. ~100 one-off debug/check/poll/fix scripts from past n8n debugging sessions have been moved to `_archive_debug_scripts/` — kept for reference, not part of the running app.

Full project documentation (pipeline flow, DB schema, deployment guide, n8n workflow backups, onboarding) lives outside this repo at `D:\Fady\outputs\WeIN\workflow\` (local, its own git repo) — see `MASTER_CONTEXT.md` there for the complete picture, and `ONBOARDING.md` if you're new to the project.

## For developers — local setup

This is a standard Flask app. You don't need any of the AI-assisted tooling used to build it so far — clone, install, run.

```bash
git clone https://github.com/AhmeedFathy/wein-offer-service.git
cd wein-offer-service
python -m venv venv
venv\Scripts\activate          # Windows. On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Set the env vars you need (see below) and run:

```bash
set GOOGLE_API_KEY=your-key-here      # Windows (cmd). PowerShell: $env:GOOGLE_API_KEY="..."
                                       # Mac/Linux: export GOOGLE_API_KEY=...
python app.py
```

The app starts on `http://localhost:5055` by default (override with `PORT`). Hit `http://localhost:5055/health` to confirm it's up, or `http://localhost:5055/portal` for the admin portal.

**Making a change:**
1. Branch off `main` (`git checkout -b your-name/short-description`).
2. Edit `app.py`, `build_offer_files.py`, or `build_pdfs.py` for backend logic. For the portal UI, edit `portal/portal_new.html` first (the dev clone) — verify it works, then copy it over `portal/index.html` (the live one) once confirmed. Don't edit `portal/index.html` directly for anything non-trivial.
3. Test locally (`python app.py`, hit the routes below with `curl`/Postman, or open the portal HTML directly in a browser — it talks to Supabase straight from the browser, no backend needed for that part).
4. Commit, push your branch, open a PR against `main` rather than pushing directly — ask whoever's been maintaining this for review until there's a real review process set up (there isn't one yet; this has been a single-developer project until now).
5. Deploy is manual and separate from your local push — see "Deploy" below. Don't assume merging to `main` auto-deploys anything.

**There are no automated tests in this repo.** Verification has been manual (run it, click through it, check the output) — see `_WeIN_System/docs/DEPLOYMENT_GUIDE.md` for what to manually check before/after a deploy. If you add real tests, please also add a note here.

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

- `GOOGLE_API_KEY` — required, used for Gemini menu extraction
- `MISTRAL_API_KEY` — used for `/api/chat` (current default chat provider)
- `ANTHROPIC_API_KEY` — optional, swaps `/api/chat` to Claude when set (code path exists, not yet enabled in production)

**In production**, these are set directly in the PythonAnywhere WSGI file (`/var/www/wein_pythonanywhere_com_wsgi.py`) — there's no `.env` file on the server. **For local dev**, just set them in your shell before running `python app.py` (see "For developers" above) — a local `.env` file would work too if you add `python-dotenv` and load it yourself, but that's not currently wired into `app.py`.

This service does **not** read Supabase credentials — the portal talks to Supabase directly from the browser, and n8n nodes use their own hardcoded service-role key.

## Deploy

```bash
git push                                  # from local
# then, on PythonAnywhere:
cd ~/wein-offer-service && git pull origin main && touch /var/www/wein_pythonanywhere_com_wsgi.py
```

No CI/CD — deploy is manual. See `_WeIN_System/docs/DEPLOYMENT_GUIDE.md` for the full guide.
