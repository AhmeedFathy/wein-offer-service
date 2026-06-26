"""Upload build_pdfs.py to PythonAnywhere via their Files API."""
import requests, sys, pathlib
sys.stdout.reconfigure(encoding='utf-8')

PA_USER  = "wein"
PA_TOKEN = None  # set via env or prompt
PA_HOST  = "www.pythonanywhere.com"
LOCAL    = pathlib.Path(r"D:\Fady\outputs\_temp_wein_offer_service\build_pdfs.py")
REMOTE   = f"/home/{PA_USER}/build_pdfs.py"

import os
PA_TOKEN = os.environ.get("PA_API_TOKEN")
if not PA_TOKEN:
    PA_TOKEN = input("PythonAnywhere API token: ").strip()

headers = {"Authorization": f"Token {PA_TOKEN}"}
url = f"https://{PA_HOST}/api/v0/user/{PA_USER}/files/path{REMOTE}"

with open(LOCAL, "rb") as f:
    content = f.read()

r = requests.post(url, headers=headers, files={"content": ("build_pdfs.py", content, "text/plain")})
print(f"Upload: {r.status_code} {r.text[:200]}")
