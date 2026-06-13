"""
HTTP service for the WeIN offer pipeline.

POST /generate-offer-files
Body: { "provider": "...", "vertical": "...", "offer_data": {...} }

Steps:
1. Save offer_data.json to a temp working directory
2. Run build_offer_files.py and build_pdfs.py (full mode) to produce the 4 deliverable files
3. Return the 4 files as base64-encoded content in the JSON response, so n8n's
   HTTP Request node can pass them straight to Google Drive nodes.

Run with: python offer_file_service.py
"""

import base64
import json
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


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


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
