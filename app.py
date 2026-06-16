"""
HTTP service for the WeIN offer pipeline.

POST /generate-offer-files
Body: { "provider": "...", "vertical": "...", "offer_data": {...} }

POST /extract-menu
Body: multipart/form-data with field "menu_file" (PDF or image)
   OR JSON {"file_base64": "...", "mime_type": "..."}
Returns: {"items": [...], "count": N, "source": "claude-vision"}

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

import anthropic
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


def run_generation_scripts(provider: str, vertical: str, output_dir: Path, json_path: Path):
    for script, args in (
        ("build_offer_files.py", [provider, vertical, str(output_dir), str(json_path), "full"]),
        ("build_pdfs.py", [str(json_path), str(output_dir), "both"]),
    ):
        cmd = [PYTHON_EXECUTABLE, str(TEMPLATES_DIR / script)] + args
        proc = subprocess.run(cmd, capture_output=True, text=True, cwd=str(TEMPLATES_DIR))
        if proc.returncode != 0:
            raise RuntimeError(
                f"{script} failed (exit {proc.returncode}):\n{proc.stdout}\n{proc.stderr}"
            )


EXTRACT_PROMPT = (
    "Extract every menu item from this file. "
    "For each item return: name, category (e.g. Appetizer, Main, Dessert), "
    "price (numeric only), currency (default EGP unless stated otherwise). "
    "Return ONLY a valid JSON array — no markdown, no explanation, no other text. "
    'Example: [{"name":"Hummus","category":"Appetizer","price":45,"currency":"EGP"}]'
)

IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


def _build_claude_content(file_bytes: bytes, mime_type: str) -> list:
    b64 = base64.standard_b64encode(file_bytes).decode("ascii")
    if mime_type == "application/pdf":
        return [
            {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": b64}},
            {"type": "text", "text": EXTRACT_PROMPT},
        ]
    if mime_type in IMAGE_MIME_TYPES:
        return [
            {"type": "image", "source": {"type": "base64", "media_type": mime_type, "data": b64}},
            {"type": "text", "text": EXTRACT_PROMPT},
        ]
    return [{"type": "text", "text": f"[unsupported mime type: {mime_type}]"}]


def _detect_mime(filename: str, provided: str | None) -> str:
    if provided:
        return provided
    ext = Path(filename).suffix.lower()
    return {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }.get(ext, "application/octet-stream")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/extract-menu", methods=["POST"])
def extract_menu():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY not set"}), 500

    # Accept multipart upload or JSON base64
    if request.content_type and "multipart" in request.content_type:
        f = request.files.get("menu_file")
        if not f:
            return jsonify({"error": "No 'menu_file' field in multipart body"}), 400
        file_bytes = f.read()
        mime_type = _detect_mime(f.filename or "", f.content_type)
    else:
        payload = request.get_json(force=True, silent=True) or {}
        b64 = payload.get("file_base64")
        mime_type = payload.get("mime_type", "application/pdf")
        if not b64:
            return jsonify({"error": "JSON body must include 'file_base64'"}), 400
        try:
            file_bytes = base64.b64decode(b64)
        except Exception:
            return jsonify({"error": "Invalid base64 in 'file_base64'"}), 400

    if mime_type == "application/octet-stream":
        return jsonify({"error": f"Unsupported or undetected file type"}), 400

    content = _build_claude_content(file_bytes, mime_type)
    if content[0].get("type") == "text" and "unsupported" in content[0]["text"]:
        return jsonify({"error": content[0]["text"]}), 400

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=4096,
            messages=[{"role": "user", "content": content}],
        )
        raw = response.content[0].text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw).rstrip("`").strip()
        items = json.loads(raw)
        if not isinstance(items, list):
            raise ValueError("Response is not a JSON array")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Claude returned non-JSON: {e}", "raw": raw[:500]}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    return jsonify({"items": items, "count": len(items), "source": "claude-vision"})


@app.route("/generate-offer-files", methods=["POST"])
def generate_offer_files():
    payload = request.get_json(force=True, silent=True) or {}

    provider = payload.get("provider")
    vertical = payload.get("vertical")
    offer_data = payload.get("offer_data")

    if not provider or not vertical or not offer_data:
        return jsonify({"error": "Body must include 'provider', 'vertical', and 'offer_data'"}), 400

    provider_dir_name = sanitize_name(provider)
    vertical_dir_name = sanitize_name(vertical)

    with tempfile.TemporaryDirectory(prefix="wein_offer_") as tmp:
        output_dir = Path(tmp) / vertical_dir_name / provider_dir_name
        output_dir.mkdir(parents=True, exist_ok=True)

        json_path = output_dir / "offer_data.json"
        json_path.write_text(json.dumps(offer_data, indent=2, ensure_ascii=False), encoding="utf-8")

        try:
            run_generation_scripts(provider, vertical, output_dir, json_path)
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


if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5055)))
