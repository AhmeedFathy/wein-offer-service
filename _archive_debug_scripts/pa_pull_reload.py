"""git pull + reload on PythonAnywhere via their API."""
import requests, sys, os
sys.stdout.reconfigure(encoding='utf-8')

PA_USER = "wein"
PA_HOST = "www.pythonanywhere.com"
PA_TOKEN = os.environ.get("PA_API_TOKEN") or input("PythonAnywhere API token: ").strip()
headers = {"Authorization": f"Token {PA_TOKEN}"}

# 1. git pull via Bash console API
r = requests.post(
    f"https://{PA_HOST}/api/v0/user/{PA_USER}/consoles/",
    headers=headers,
    json={"executable": "bash", "arguments": "", "working_directory": f"/home/{PA_USER}"}
)
print(f"Create console: {r.status_code}")
console_id = r.json().get("id")
if not console_id:
    print("ERROR: could not create console"); sys.exit(1)

import time; time.sleep(2)

r2 = requests.post(
    f"https://{PA_HOST}/api/v0/user/{PA_USER}/consoles/{console_id}/send_input/",
    headers=headers,
    json={"input": "cd /home/wein && git pull origin main 2>&1\n"}
)
print(f"Send git pull: {r2.status_code}")
time.sleep(5)

r3 = requests.get(
    f"https://{PA_HOST}/api/v0/user/{PA_USER}/consoles/{console_id}/get_latest_output/",
    headers=headers
)
print(f"Pull output:\n{r3.json().get('output','')}")

# 2. Reload the web app
r4 = requests.post(
    f"https://{PA_HOST}/api/v0/user/{PA_USER}/webapps/{PA_USER}.pythonanywhere.com/reload/",
    headers=headers
)
print(f"Reload: {r4.status_code} {r4.text[:100]}")

# 3. Clean up console
requests.delete(f"https://{PA_HOST}/api/v0/user/{PA_USER}/consoles/{console_id}/", headers=headers)
print("Done.")
