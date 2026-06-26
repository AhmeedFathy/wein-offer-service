import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

WF_ID = '6v9BXm5uZpuJS8fd'

r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf = r.json()['data']
version_id = wf.get('versionId')
print(f'Current versionId: {version_id}')
print(f'active: {wf.get("active")}')

# Activate with versionId
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': version_id})
print(f'POST activate with versionId: {r_act.status_code}')
print(f'Response: {r_act.text[:400]}')

# Check
r2 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf2 = r2.json()['data']
print(f'\nactive: {wf2.get("active")}')
print(f'versionId: {wf2.get("versionId")}')
print(f'activeVersionId: {wf2.get("activeVersionId")}')

# Verify Parse Offer Data code is correct in the newly activated version
for n in wf2['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        print(f'\nParse Offer Data code length: {len(code)}')
        print(f'Has dbg_p0: {"dbg_p0" in code}')
        break
