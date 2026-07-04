"""
HTTP service for the WeIN offer pipeline.

POST /generate-offer-files
Body: { "provider": "...", "vertical": "...", "offer_data": {...} }

POST /extract-menu
Body: multipart/form-data with field "menu_file" (PDF or image)
Returns: {"items": [...], "count": N, "source": "gemini-vision"}

Run with: python app.py
"""

import base64
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request
import requests as requests_lib

TEMPLATES_DIR = Path(__file__).resolve().parent

PYTHON_EXECUTABLE = sys.executable
if not Path(PYTHON_EXECUTABLE).name.startswith("python"):
    candidate = Path(sys.prefix) / "bin" / "python"
    if candidate.exists():
        PYTHON_EXECUTABLE = str(candidate)

MIME_TYPES = {
    ".pdf": "application/pdf",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".json": "application/json",
}

app = Flask(__name__)


def sanitize_name(name: str) -> str:
    """Make a string safe for use as a filesystem folder/file name."""
    name = name.strip()
    name = re.sub(r'[<>:"/\\|?*]', "", name)
    name = re.sub(r"\s+", " ", name)
    return name


def run_generation_scripts(provider: str, vertical: str, output_dir: Path, json_path: Path, version: int = None):
    extra = [str(version)] if version is not None else []
    for script, args in (
        ("build_offer_files.py", [provider, vertical, str(output_dir), str(json_path), "full"] + extra),
        ("build_pdfs.py", [str(json_path), str(output_dir), "both"] + extra),
    ):
        cmd = [PYTHON_EXECUTABLE, str(TEMPLATES_DIR / script)] + args
        proc = subprocess.run(cmd, capture_output=True, text=True, cwd=str(TEMPLATES_DIR))
        if proc.returncode != 0:
            raise RuntimeError(
                f"{script} failed (exit {proc.returncode}):\n{proc.stdout}\n{proc.stderr}"
            )


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/extract-menu", methods=["POST"])
def extract_menu():
    try:
        import google.genai as genai
    except ImportError as e:
        return jsonify({"error": f"google-genai not installed: {e}", "hint": "pip install google-genai in the correct virtualenv"}), 500

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return jsonify({"error": "GOOGLE_API_KEY not set"}), 500

    f = request.files.get("menu_file")
    if not f:
        return jsonify({"error": "No file provided"}), 400

    file_bytes = f.read()
    mime_type = f.content_type or "application/pdf"
    b64 = base64.b64encode(file_bytes).decode("utf-8")

    prompt = (
        "Extract every single menu item from this menu document. "
        "For each item return: name (exact name as shown), category "
        "(e.g. Appetizer, Main Course, Dessert, Drink, Shisha, etc.), "
        "price as a number in EGP (use 0 if price not shown), "
        "currency (always EGP). "
        "Be thorough — extract ALL items including drinks, desserts, "
        "sides, and any items with Arabic names (transliterate them). "
        "Return ONLY a valid JSON array. No markdown fences, no "
        "explanation, no preamble. Start with [ and end with ]."
    )
    contents = [{"parts": [
        {"inline_data": {"mime_type": mime_type, "data": b64}},
        {"text": prompt}
    ]}]

    import time
    client = genai.Client(api_key=api_key)
    # Try lite first (less congested), fall back to flash
    model_order = ["gemini-2.5-flash-lite", "gemini-2.5-flash"]
    last_error = None
    for attempt in range(3):
        model = model_order[min(attempt, len(model_order) - 1)]
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
            )
            text = response.text.strip()
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()
            items = json.loads(text)
            if not isinstance(items, list):
                raise ValueError("Response is not a JSON array")
            return jsonify({"items": items, "count": len(items), "source": "gemini-vision"})
        except json.JSONDecodeError as e:
            return jsonify({"error": str(e), "raw": response.text[:500]}), 502
        except Exception as e:
            last_error = str(e)
            if "503" in last_error or "UNAVAILABLE" in last_error:
                if attempt < 2:
                    time.sleep(10 * (attempt + 1))
                    continue
            return jsonify({"error": last_error}), 502

    return jsonify({"error": f"Gemini unavailable after 3 retries: {last_error}"}), 503

    return jsonify({"items": items, "count": len(items), "source": "gemini-vision"})


@app.route("/generate-offer-files", methods=["POST"])
def generate_offer_files():
    payload = request.get_json(force=True, silent=True) or {}

    provider = payload.get("provider")
    vertical = payload.get("vertical")
    offer_data = payload.get("offer_data")
    version_label = payload.get("version")  # e.g. "Claude v3" from n8n Get Version Number

    if not provider or not vertical or not offer_data:
        return jsonify({"error": "Body must include 'provider', 'vertical', and 'offer_data'"}), 400

    # Parse explicit version number if provided (overrides auto-detection)
    version_num = None
    if version_label:
        m = re.search(r'(\d+)', str(version_label))
        if m:
            version_num = int(m.group(1))

    provider_dir_name = sanitize_name(provider)
    vertical_dir_name = sanitize_name(vertical)

    with tempfile.TemporaryDirectory(prefix="wein_offer_") as tmp:
        output_dir = Path(tmp) / vertical_dir_name / provider_dir_name
        output_dir.mkdir(parents=True, exist_ok=True)

        json_path = output_dir / "offer_data.json"
        json_path.write_text(json.dumps(offer_data, indent=2, ensure_ascii=False), encoding="utf-8")

        try:
            run_generation_scripts(provider, vertical, output_dir, json_path, version=version_num)
        except RuntimeError as e:
            return jsonify({"error": str(e)}), 500

        generated_files = sorted(
            p for p in output_dir.iterdir()
            if p.is_file() and p.suffix.lower() in (".pdf", ".xlsx") and "Claude" in p.name
        )

        if not generated_files:
            return jsonify({"error": "No output files were generated"}), 500

        files_out = []
        for p in generated_files:
            content = p.read_bytes()
            files_out.append({
                "filename": p.name,
                "mime_type": MIME_TYPES.get(p.suffix.lower(), "application/octet-stream"),
                "size": len(content),
                "content_base64": base64.b64encode(content).decode("ascii"),
            })

    return jsonify({
        "provider": provider,
        "vertical": vertical,
        "files": files_out,
    })


def _serve_portal(filename="index.html"):
    portal_path = os.path.join(os.path.dirname(__file__), "portal", filename)
    with open(portal_path, "r", encoding="utf-8") as f:
        html = f.read()
    return html, 200, {"Content-Type": "text/html; charset=utf-8"}


@app.route("/portal")
def portal():
    return _serve_portal()


@app.route("/portal-new")
def portal_new():
    return _serve_portal("portal_new.html")


@app.route("/intake")
def intake():
    # Portal JS detects the /intake path itself and jumps straight to the
    # team intake view with the desktop tabs hidden.
    return _serve_portal()


CHAT_SYSTEM_PROMPT = """You are the WeIN pipeline controller for a premium lifestyle marketplace in Sharm El Sheikh, Egypt.

You help control the offer generation pipeline through natural language.
You have access to real provider data and can trigger real pipeline runs.

AVAILABLE PROVIDERS: Almayass, Soho House, Butterfly Spa, Butterfly Gym,
The Kite Bubble, The Echo Temple, Sharm Dental Clinic, TheLifeCo,
Bombay Soho, Bus Stop Sports Lounge, Café Chino Soho, Cravings,
Koutouki Soho, Marlin and Caviar, Motion, Ottoman, Wild West

VERTICALS: Dining, Fun & Activities, Health & Beauty, Hotels & Aqua Park

PARTY SIZES: Solo, Couple, Group, Family
TIERS: Entry, Core, Premium
HOOKS: Zero-Price Effect, Anchor Pricing, Loss Aversion, Experience Frame,
       Decoy Effect, Reciprocity, Per-Person Anchor, Compromise Effect,
       Sharing Utility, Mental Accounting, Host Pride

AVAILABLE ACTIONS (respond with JSON action blocks when needed):

1. Run pipeline with custom params:
{"action": "run_pipeline", "provider": "name", "vertical": "Dining",
 "params": {
   "party_sizes": ["Family"],
   "tiers": ["Premium"],
   "group_size": 4,
   "theme": "luxury",
   "max_discount": 25,
   "focus_items": ["Lamb Ribs", "Mixed Grill"],
   "skip_party_sizes": ["Solo", "Couple"]
 }}

2. Show provider detail:
{"action": "show_provider", "provider": "name"}

3. Accept specific offers:
{"action": "accept_offers", "provider": "name", "offer_ids": [1,3,5]}

4. Show stats:
{"action": "show_stats"}

5. List providers by status:
{"action": "list_providers", "filter": "pending"}

6. Show offers for provider:
{"action": "show_offers", "provider": "name"}

7. Create task:
{"action": "create_task", "title": "Follow up with Almayass",
 "provider": "Almayass", "due_date": "2026-06-25",
 "priority": "high", "task_type": "follow_up", "assigned_to": "Ahmed"}

8. List tasks:
{"action": "list_tasks", "filter": "today"}

9. Complete task:
{"action": "complete_task", "task_id": "uuid or title match"}

10. Update provider stage:
{"action": "update_stage", "provider": "Almayass",
 "stage": "offers_sent", "notes": "Sent 10 offers via portal"}

STAGES (for update_stage): lead, contacted, meeting_done, offers_sent, negotiating, accepted, live, renewal, lost
TASK TYPES: follow_up, negotiation, visit, call, review_offers, pipeline_run, general
TASK PRIORITIES: low, medium, high, urgent
TASK LIST FILTERS: today, overdue, all, this_week

RESPONSE FORMAT:
- Always respond conversationally first (1-2 sentences explaining what you understood)
- Then include the JSON action block in a ```json fenced code block on a new line if an action is needed
- Parse user intent carefully — "luxury" means Premium tier,
  "4 people" means group_size:4 and party_size Family/Group,
  "skip solo" means skip_party_sizes:["Solo"],
  "Ramadan theme" means theme:"Ramadan",
  "high tickets" means tiers:["Premium"] and focus on expensive items
- Ask a clarifying question instead of guessing if the intent is unclear.

EXAMPLES:
User: "build family offers for 4 people luxury"
Response: "Building luxury family offers for 4 people at Almayass.
Focusing on Premium tier Family offers with high-ticket items only."
```json
{"action": "run_pipeline", "provider": "Almayass", "vertical": "Dining",
 "params": {"party_sizes": ["Family"], "tiers": ["Premium"],
            "group_size": 4, "theme": "luxury",
            "skip_party_sizes": ["Solo", "Couple", "Group"]}}
```

User: "show me pending providers"
Response: "Here are the providers waiting for pipeline runs:"
```json
{"action": "list_providers", "filter": "pending"}
```

User: "accept offers 1, 3, 5 for Almayass"
Response: "Marking offers 1, 3, and 5 as accepted for Almayass."
```json
{"action": "accept_offers", "provider": "Almayass", "offer_ids": [1,3,5]}
```

User: "remind me to call Almayass on Thursday"
Response: "Got it — I'll add a call task for Almayass due Thursday."
```json
{"action": "create_task", "title": "Call Almayass", "provider": "Almayass",
 "task_type": "call", "priority": "medium", "due_date": "2026-06-25"}
```

User: "mark Almayass as offers sent"
Response: "Updating Almayass's stage to Offers Sent."
```json
{"action": "update_stage", "provider": "Almayass", "stage": "offers_sent"}
```"""


def _chat_via_anthropic(api_key, messages):
    resp = requests_lib.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-6",
            "max_tokens": 1000,
            "system": CHAT_SYSTEM_PROMPT,
            "messages": messages,
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    return "".join(block.get("text", "") for block in data.get("content", []))


def _chat_via_mistral(api_key, messages):
    resp = requests_lib.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "mistral-small-latest",
            "messages": [{"role": "system", "content": CHAT_SYSTEM_PROMPT}] + messages,
            "max_tokens": 1000,
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]


@app.route("/api/chat", methods=["POST"])
def chat():
    """Proxies chat messages to an LLM so the API key never reaches the browser.

    Prefers Anthropic (Claude) if ANTHROPIC_API_KEY is set; falls back to
    Mistral (MISTRAL_API_KEY) as a temporary alternative until the Anthropic
    key is available. No code change needed once ANTHROPIC_API_KEY is added —
    it will be picked up automatically and take priority again.
    """
    payload = request.get_json(force=True, silent=True) or {}
    messages = payload.get("messages", [])
    if not messages:
        return jsonify({"error": "messages required"}), 400

    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    mistral_key = os.environ.get("MISTRAL_API_KEY")

    if not anthropic_key and not mistral_key:
        return jsonify({"error": "No chat API key configured. Set ANTHROPIC_API_KEY or MISTRAL_API_KEY on the server."}), 500

    try:
        if anthropic_key:
            reply = _chat_via_anthropic(anthropic_key, messages)
        else:
            reply = _chat_via_mistral(mistral_key, messages)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 502


VALID_ROLES = {"admin", "manager", "deal_breaker", "team"}
DEALS_ROLES = {"admin", "manager"}


@app.route("/api/invite-user", methods=["POST"])
def invite_user():
    """Invites a teammate by email and sets their role in `profiles`.

    Requires SUPABASE_SERVICE_ROLE_KEY -- never exposed to the browser.
    Role-gating (admin+manager) is still asserted by the client today, same
    trust model as every other role check in the portal (see
    SECURITY_NOTE_role_enforcement.md) -- the part this endpoint actually
    fixes is that the service-role key itself, which can read/write any
    table and create arbitrary users, never has to leave the server.
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        return jsonify({"error": "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured on the server."}), 500

    payload = request.get_json(force=True, silent=True) or {}
    caller_role = payload.get("callerRole")
    email = (payload.get("email") or "").strip()
    role = payload.get("role")
    full_name = (payload.get("fullName") or "").strip() or None

    if caller_role not in DEALS_ROLES:
        return jsonify({"error": "Only admins and managers can invite teammates."}), 403
    if not email or "@" not in email:
        return jsonify({"error": "A valid email is required."}), 400
    if role not in VALID_ROLES:
        return jsonify({"error": f"role must be one of {sorted(VALID_ROLES)}"}), 400

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }

    try:
        invite_resp = requests_lib.post(
            f"{supabase_url}/auth/v1/invite",
            headers=headers,
            json={"email": email},
            timeout=20,
        )
    except requests_lib.exceptions.RequestException as e:
        return jsonify({"error": f"Could not reach Supabase to send the invite: {e}"}), 502

    if invite_resp.status_code >= 300:
        return jsonify({"error": f"Invite failed: {invite_resp.text}"}), 502

    user_id = (invite_resp.json() or {}).get("id")
    if not user_id:
        return jsonify({"error": "Invite succeeded but no user id was returned."}), 502

    try:
        profile_resp = requests_lib.post(
            f"{supabase_url}/rest/v1/profiles",
            headers={**headers, "Prefer": "resolution=merge-duplicates,return=representation"},
            json={"id": user_id, "role": role, "full_name": full_name, "email": email},
            timeout=20,
        )
        if profile_resp.status_code >= 300 and "email" in profile_resp.text:
            # profiles.email arrives with migration 038 — don't break invites
            # if this code deploys first.
            profile_resp = requests_lib.post(
                f"{supabase_url}/rest/v1/profiles",
                headers={**headers, "Prefer": "resolution=merge-duplicates,return=representation"},
                json={"id": user_id, "role": role, "full_name": full_name},
                timeout=20,
            )
    except requests_lib.exceptions.RequestException as e:
        return jsonify({"error": f"Invite was sent, but writing the profile failed: {e}"}), 502

    if profile_resp.status_code >= 300:
        return jsonify({"error": f"Invite sent but writing the profile failed: {profile_resp.text}"}), 502

    return jsonify({"success": True, "userId": user_id})


CONTRACT_STATUSES = {"none", "draft", "active", "expired", "terminated"}


@app.route("/api/update-contract", methods=["POST"])
def update_contract():
    """Updates a provider's contract/commission fields server-side.

    This is the first write moved off the browser's anon key per
    SECURITY_NOTE_role_enforcement.md Option B: the role check below is
    enforced here, server-side, and the actual Supabase write uses the
    service-role key -- so a deal_breaker can no longer edit a contract
    by bypassing the UI and calling the Supabase REST API directly with
    the anon key, the way every other write in the portal still can today.
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        return jsonify({"error": "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured on the server."}), 500

    payload = request.get_json(force=True, silent=True) or {}
    caller_role = payload.get("callerRole")
    provider_id = (payload.get("providerId") or "").strip()

    if caller_role not in DEALS_ROLES:
        return jsonify({"error": "Only admins and managers can edit contracts."}), 403
    if not provider_id:
        return jsonify({"error": "providerId is required."}), 400

    contract_status = payload.get("contract_status")
    if contract_status is not None and contract_status not in CONTRACT_STATUSES:
        return jsonify({"error": f"contract_status must be one of {sorted(CONTRACT_STATUSES)}"}), 400

    commission_pct = payload.get("commission_pct")
    if commission_pct is not None:
        try:
            commission_pct = float(commission_pct)
        except (TypeError, ValueError):
            return jsonify({"error": "commission_pct must be a number."}), 400

    update_fields = {}
    for key in ("contract_status", "commission_pct", "contract_start", "contract_end", "featured"):
        if key in payload:
            update_fields[key] = commission_pct if key == "commission_pct" else payload.get(key)
    if not update_fields:
        return jsonify({"error": "No fields to update."}), 400

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    try:
        resp = requests_lib.patch(
            f"{supabase_url}/rest/v1/wein_providers?id=eq.{provider_id}",
            headers=headers,
            json=update_fields,
            timeout=20,
        )
    except requests_lib.exceptions.RequestException as e:
        return jsonify({"error": f"Could not reach Supabase: {e}"}), 502

    if resp.status_code >= 300:
        return jsonify({"error": f"Update failed: {resp.text}"}), 502

    rows = resp.json() or []
    if not rows:
        return jsonify({"error": "No provider matched that id."}), 404

    return jsonify({"success": True, "provider": rows[0]})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5055)))
