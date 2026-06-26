import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
wf = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}').json()['data']

# Print all trigger / webhook nodes
for n in wf['nodes']:
    t = n.get('type', '')
    if any(k in t for k in ('trigger', 'webhook', 'form', 'Trigger', 'Webhook', 'Form')):
        print(f'\n=== {n["name"]} ===')
        print(f'  type: {t}')
        params = n.get('parameters', {})
        print(f'  webhookId: {params.get("webhookId","")}')
        print(f'  path:      {params.get("path","")}')
        print(f'  httpMethod:{params.get("httpMethod","")}')
        print(f'  all params: {json.dumps(params, indent=2)[:400]}')

# Also try to use n8n test-run API
print('\n--- Trying manual run via /rest/workflows/{id}/run ---')
r = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/run',
           json={'startNodes': [], 'destinationNode': ''})
print(f'  status: {r.status_code}  body: {r.text[:200]}')
