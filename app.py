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
        ("build_pdfs.py", [str(json_path), str(output_dir), "both"]),
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


def _serve_portal(force_team=False):
    portal_path = os.path.join(os.path.dirname(__file__), "portal", "index.html")
    with open(portal_path, "r", encoding="utf-8") as f:
        html = f.read()
    if force_team:
        # Hide mode toggle so field team can't switch to manager view
        html = html.replace(
            'id="modeToggle"',
            'id="modeToggle" style="display:none"'
        )
    return html, 200, {"Content-Type": "text/html; charset=utf-8"}


@app.route("/portal")
def portal():
    return _serve_portal(force_team=False)


@app.route("/intake")
def intake():
    return _serve_portal(force_team=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5055)))
