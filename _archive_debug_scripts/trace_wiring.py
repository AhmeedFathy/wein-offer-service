import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
connections = wf['connections']
nodes = {n['name']: n for n in wf['nodes']}

# Find all nodes whose names match relevant patterns
target_keywords = [
    'Review Decision Router', '10b', 'titles', 'Parse Offer', 'Generate Offer',
    'Split Files', 'Drive', 'Supabase', 'Telegram', 'Summary',
    'Code in JavaScript', 'wein-reviewer', 'wein-decision', 'wein-creator'
]

print('=== RELEVANT NODES ===')
for name in sorted(nodes.keys()):
    if any(k.lower() in name.lower() for k in target_keywords):
        n = nodes[name]
        print(f'  [{n["type"].split(".")[-1]}] {name}')

print('\n=== CONNECTIONS FROM REVIEW DECISION ROUTER ===')
router_conn = connections.get('🔀 Review Decision Router', {})
print(json.dumps(router_conn, indent=2))

print('\n=== CONNECTIONS FROM wein-reviewer (node 9) ===')
for name in connections:
    if 'reviewer' in name.lower() or '9.' in name:
        print(f'\n--- {name} ---')
        print(json.dumps(connections[name], indent=2))

print('\n=== CONNECTIONS FROM wein-decision (9c) ===')
for name in connections:
    if 'decision' in name.lower() or '9c' in name.lower():
        print(f'\n--- {name} ---')
        print(json.dumps(connections[name], indent=2))

print('\n=== CONNECTIONS FROM 10b (titles-pick) ===')
for name in connections:
    if '10b' in name or 'titles' in name.lower():
        print(f'\n--- {name} ---')
        print(json.dumps(connections[name], indent=2))

print('\n=== WHAT CONNECTS TO "Generate Offer Files" ===')
target = 'Generate Offer Files'
# Find which nodes have connections TO target
for src_name, src_conns in connections.items():
    main = src_conns.get('main', [])
    for port_idx, port in enumerate(main):
        for conn in port:
            if isinstance(conn, dict) and target.lower() in conn.get('node', '').lower():
                print(f'  {src_name} port {port_idx} -> {conn["node"]}')

print('\n=== WHAT CONNECTS TO "Parse Offer Data" ===')
target2 = 'Parse Offer Data'
for src_name, src_conns in connections.items():
    main = src_conns.get('main', [])
    for port_idx, port in enumerate(main):
        for conn in port:
            if isinstance(conn, dict) and target2.lower() in conn.get('node', '').lower():
                print(f'  {src_name} port {port_idx} -> {conn["node"]}')

print('\n=== "Parse Offer Data" NODE DETAILS ===')
for name, node in nodes.items():
    if 'parse offer' in name.lower():
        print(f'Name: {name}')
        print(f'Type: {node["type"]}')
        params = node['parameters']
        # Find the expression that reads node 8
        for k, v in params.items():
            if isinstance(v, str) and ('creator' in v.lower() or 'wein' in v.lower() or 'json' in v.lower()):
                print(f'  param[{k}]: {v[:300]}')
            elif isinstance(v, dict):
                vstr = json.dumps(v)
                if 'creator' in vstr.lower() or 'menu' in vstr.lower():
                    print(f'  param[{k}]: {vstr[:300]}')
        print(f'Full params: {json.dumps(params, indent=2)[:800]}')
