import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

for n in wf['nodes']:
    if 'Form' in n.get('type', '') or n.get('name', '').startswith('📝 Form'):
        print(f'Node: {n["name"]}')
        print(f'Type: {n["type"]}')
        params = n.get('parameters', {})
        print(f'Parameters: {json.dumps(params, indent=2)[:800]}')
        print()
