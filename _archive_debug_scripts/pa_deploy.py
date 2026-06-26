"""Trigger git pull + WSGI reload on PythonAnywhere via their API."""
import requests, sys
sys.stdout.reconfigure(encoding='utf-8')

PA_USER    = "wein"
PA_TOKEN   = open("D:/Fady/outputs/_Templates/offer_specialist_system/supabase/.env").read()
# Extract PA token from env file if present, otherwise prompt
import re, os
env_text = ""
env_path = r"D:\Fady\outputs\_Templates\offer_specialist_system\supabase\.env"
try:
    with open(env_path) as f:
        env_text = f.read()
except:
    pass

pa_token = None
m = re.search(r'PYTHONANYWHERE_TOKEN\s*=\s*(\S+)', env_text)
if m:
    pa_token = m.group(1).strip()

if not pa_token:
    print("PA token not in .env — using manual console approach")
    print("Run in PythonAnywhere Bash console:")
    print("  cd /home/wein/wein-offer-service && git pull origin main")
    print("Then: Web tab -> Reload wein.pythonanywhere.com")
    sys.exit(0)

BASE = f"https://www.pythonanywhere.com/api/v0/user/{PA_USER}"
headers = {"Authorization": f"Token {pa_token}"}

# Trigger a console command
r = requests.post(f"{BASE}/consoles/", headers=headers,
                  json={"executable": "bash", "arguments": "", "working_directory": f"/home/{PA_USER}"})
if r.status_code not in (200, 201):
    print(f"Console create failed: {r.status_code} {r.text[:200]}")
    sys.exit(1)

console_id = r.json()["id"]
print(f"Console created: {console_id}")

import time
time.sleep(2)
cmd = "cd /home/wein/wein-offer-service && git pull origin main\n"
r2 = requests.post(f"{BASE}/consoles/{console_id}/send_input/", headers=headers,
                   json={"input": cmd})
print(f"Send input: {r2.status_code}")
time.sleep(5)

r3 = requests.get(f"{BASE}/consoles/{console_id}/get_latest_output/", headers=headers)
print(f"Output: {r3.json().get('output','')[:500]}")

# Reload web app
r4 = requests.post(f"{BASE}/webapps/wein.pythonanywhere.com/reload/", headers=headers)
print(f"Reload: {r4.status_code} {r4.text[:100]}")
