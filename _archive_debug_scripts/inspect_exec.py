import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})

# Check the last few executions
r = s.get(f'{N8N_BASE}/rest/executions', params={'workflowId': WF_ID, 'limit': 3})
execs = r.json().get('data', {})
if isinstance(execs, dict): execs = execs.get('data', [])
print(f'Recent executions: {[e["id"] for e in execs]}')

# Inspect latest
eid = execs[0]['id'] if execs else '234'
r2  = s.get(f'{N8N_BASE}/rest/executions/{eid}')
raw = r2.json()

# Figure out the shape
d = raw.get('data', {})
print(f'\nexecution {eid}:')
print(f'  top-level keys: {list(d.keys()) if isinstance(d, dict) else type(d)}')
print(f'  status: {d.get("status") if isinstance(d, dict) else "?"}')

# Try to find runData wherever it lives
def find_run_data(obj, depth=0):
    if depth > 5: return None
    if isinstance(obj, dict):
        if 'runData' in obj: return obj['runData']
        for v in obj.values():
            r = find_run_data(v, depth+1)
            if r is not None: return r
    if isinstance(obj, str):
        try:
            return find_run_data(json.loads(obj), depth+1)
        except: pass
    return None

rd = find_run_data(raw)
if rd:
    print(f'\n  runData nodes: {list(rd.keys())}')
    for name, runs in rd.items():
        err = any(r.get('error') for r in runs)
        tag = 'ERR' if err else ' ok'
        out = None
        try: out = runs[0]['data']['main'][0][0]['json']
        except: pass
        extra = f'  {str(out)[:80]}' if out and err else ''
        if err:
            err_msg = next((r['error'].get('message','') or r['error'].get('description','') for r in runs if r.get('error')), '')
            extra = f'  ERROR: {err_msg[:120]}'
        print(f'    [{tag}] {name}{extra}')
else:
    print('\n  Could not find runData — printing raw structure:')
    print(json.dumps(raw, indent=2)[:3000])
