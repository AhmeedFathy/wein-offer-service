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
print(f'versionId: {wf.get("versionId")}')
print(f'activeVersionId: {wf.get("activeVersionId")}')

# Try deactivate
r_off = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'active': False, 'nodes': wf['nodes'], 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nDeactivate PATCH: {r_off.status_code}')

# Check
r2 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf2 = r2.json()['data']
print(f'active after deactivate: {wf2.get("active")}')
print(f'versionId: {wf2.get("versionId")}')
print(f'activeVersionId: {wf2.get("activeVersionId")}')

# Reactivate
r_on = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'active': True, 'nodes': wf2['nodes'], 'connections': wf2['connections'],
          'settings': wf2['settings'], 'staticData': wf2['staticData']})
print(f'\nReactivate PATCH: {r_on.status_code}')

# Try dedicated activate endpoint
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate')
print(f'Activate POST: {r_act.status_code}')
if r_act.status_code != 200:
    r_act2 = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate')
    print(f'Activate PATCH: {r_act2.status_code}')

# Final check
r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'\nFinal active: {wf3.get("active")}')
print(f'Final versionId: {wf3.get("versionId")}')
print(f'Final activeVersionId: {wf3.get("activeVersionId")}')

# Verify Parse Offer Data code
for n in wf3['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        print(f'\nParse Offer Data code length: {len(code)}')
        print(f'Has dbg_p0: {"dbg_p0" in code}')
        break
