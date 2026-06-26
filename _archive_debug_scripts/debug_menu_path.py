import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

# Find what connects to "Combine Menu + Data"
conns = wf.get('connections', {})
print('=== Connections INTO Combine Menu + Data ===')
for src, src_data in conns.items():
    for port_key, ports in src_data.items():
        for port_idx, port_list in enumerate(ports):
            for conn in port_list:
                if conn.get('node') == 'Combine Menu + Data':
                    print(f'  {src} (port {port_idx}) -> Combine Menu + Data (input {conn.get("index", 0)})')

print('\n=== Connections FROM Check Menu Link Present? ===')
src = 'Check Menu Link Present?'
if src in conns:
    for port_key, ports in conns[src].items():
        for port_idx, port_list in enumerate(ports):
            for conn in port_list:
                print(f'  {src} (port {port_idx}) -> {conn["node"]} (input {conn.get("index", 0)})')

print('\n=== Connections FROM Merge Menu Paths ===')
src2 = '🔀 Merge Menu Paths'
if src2 in conns:
    for port_key, ports in conns[src2].items():
        for port_idx, port_list in enumerate(ports):
            for conn in port_list:
                print(f'  {src2} (port {port_idx}) -> {conn["node"]} (input {conn.get("index", 0)})')

# Also check exec 209 - what inputs does Combine Menu + Data have?
print('\n=== Exec 209: nodes that ran ===')
r209 = s.get(f'{N8N_BASE}/rest/executions/209', timeout=20)
full = r209.json()['data']
pool = json.loads(full['data'])

def resolve(pool, v, depth=0):
    if depth > 10: return v
    if isinstance(v, (str, int)):
        idx = int(v) if isinstance(v, str) and v.isdigit() else (v if isinstance(v, int) else None)
        if idx is not None and idx < len(pool):
            return resolve(pool, pool[idx], depth+1)
    return v

item2 = pool[2]
run_data = resolve(pool, item2.get('runData'))
if isinstance(run_data, dict):
    for k in run_data:
        ref = run_data[k]
        runs = resolve(pool, ref)
        items_count = '?'
        if isinstance(runs, list) and runs:
            ri = resolve(pool, runs[0])
            if isinstance(ri, dict):
                d = resolve(pool, ri.get('data', {}))
                if isinstance(d, dict):
                    main = resolve(pool, d.get('main', []))
                    if isinstance(main, list) and main:
                        p0 = resolve(pool, main[0])
                        items_count = len(p0) if isinstance(p0, list) else '?'
        print(f'  {k}: {items_count} items')
