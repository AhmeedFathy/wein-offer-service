import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

WF_ID = '6v9BXm5uZpuJS8fd'

# Check current state
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf = r.json()['data']
print(f'active: {wf.get("active")}')

# Try POST /activate with body
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={})
print(f'POST activate (empty body): {r_act.status_code}')
print(f'Response: {r_act.text[:300]}')

# Try with content-type header explicitly
r_act2 = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate',
    headers={'Content-Type': 'application/json'},
    data='{}')
print(f'\nPOST activate (explicit CT): {r_act2.status_code}')
print(f'Response: {r_act2.text[:300]}')

# Check state
r2 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf2 = r2.json()['data']
print(f'\nactive: {wf2.get("active")}')
print(f'activeVersionId: {wf2.get("activeVersionId")}')
