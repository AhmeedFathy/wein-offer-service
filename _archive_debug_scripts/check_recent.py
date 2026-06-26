import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

# Get last 5 executions
r = s.get(f'{N8N_BASE}/rest/executions?workflowId=6v9BXm5uZpuJS8fd&limit=5', timeout=20)
results = r.json().get('data', {}).get('results', [])
for ex in results:
    print(f'Exec {ex["id"]}: {ex["status"]} | startedAt: {ex.get("startedAt")} | stoppedAt: {ex.get("stoppedAt")}')

# Get current workflow state
r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r2.json()['data']
print(f'\nWorkflow active: {wf.get("active")}')
print(f'versionId: {wf.get("versionId")}')
print(f'activeVersionId: {wf.get("activeVersionId")}')

# Check "Combine Menu + Data" node config
for n in wf['nodes']:
    if n.get('name') == 'Combine Menu + Data':
        print(f'\nCombine Menu + Data type: {n.get("type")}')
        print(f'parameters: {json.dumps(n.get("parameters", {}), indent=2)[:500]}')
        print(f'disabled: {n.get("disabled")}')
        break
