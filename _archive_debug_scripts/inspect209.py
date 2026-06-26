import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/executions/209', timeout=30)
full = r.json()['data']

print(f'status: {full.get("status")}')
print(f'startedAt: {full.get("startedAt")}')
print(f'stoppedAt: {full.get("stoppedAt")}')

pool = json.loads(full['data'])
item2 = pool[2]
print(f'\npool[2] keys: {list(item2.keys()) if isinstance(item2, dict) else type(item2)}')

def resolve(pool, v, depth=0):
    if depth > 10: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx < len(pool):
            return resolve(pool, pool[idx], depth+1)
    return v

if isinstance(item2, dict):
    last = resolve(pool, item2.get('lastNodeExecuted', ''))
    print(f'lastNodeExecuted: {repr(last)}')

    rd = item2.get('runData')
    print(f'runData ref: {repr(rd)}')
    run_data = resolve(pool, rd)
    print(f'run_data type: {type(run_data)}')

    if isinstance(run_data, dict):
        print(f'Nodes that ran: {len(run_data)}')
        # Show which nodes ran
        for k in run_data:
            print(f'  {k[:60]}')
