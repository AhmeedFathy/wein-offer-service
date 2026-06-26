import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

WF_ID = '6v9BXm5uZpuJS8fd'

# Try dedicated deactivate endpoint
endpoints_to_try = [
    ('POST', f'/rest/workflows/{WF_ID}/deactivate'),
    ('DELETE', f'/rest/active-workflows/{WF_ID}'),
    ('PATCH', f'/rest/workflows/{WF_ID}', {'active': False}),
]

for method, path, *body in endpoints_to_try:
    url = N8N_BASE + path
    if method == 'POST':
        r = s.post(url)
    elif method == 'DELETE':
        r = s.delete(url)
    elif method == 'PATCH':
        r = s.patch(url, json=body[0] if body else {})
    print(f'{method} {path}: {r.status_code}')
    if r.status_code < 300:
        print(f'  Response: {str(r.text)[:200]}')
        break

# Check state
r_check = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf = r_check.json()['data']
print(f'\nactive: {wf.get("active")}')
print(f'versionId: {wf.get("versionId")}')
print(f'activeVersionId: {wf.get("activeVersionId")}')

# Now try activate
print('\n--- Activating ---')
activate_tries = [
    ('POST', f'/rest/workflows/{WF_ID}/activate', None),
    ('PUT', f'/rest/active-workflows', {'id': WF_ID}),
    ('PATCH', f'/rest/workflows/{WF_ID}', {'active': True}),
]
for method, path, body in activate_tries:
    url = N8N_BASE + path
    if method == 'POST':
        r = s.post(url, json=body) if body else s.post(url)
    elif method == 'PUT':
        r = s.put(url, json=body) if body else s.put(url)
    elif method == 'PATCH':
        r = s.patch(url, json=body)
    print(f'{method} {path}: {r.status_code}')
    if r.status_code < 300:
        print(f'  Response: {str(r.text)[:200]}')
        break

# Final check
r_final = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf_final = r_final.json()['data']
print(f'\nFinal active: {wf_final.get("active")}')
print(f'Final versionId: {wf_final.get("versionId")}')
print(f'Final activeVersionId: {wf_final.get("activeVersionId")}')
