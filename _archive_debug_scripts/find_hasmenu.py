import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
conns = wf.get('connections', {})

# What connects TO Has Menu File?
print('Connections INTO "Has Menu File?":')
for src, src_data in conns.items():
    for port_key, ports in src_data.items():
        for port_idx, port_list in enumerate(ports):
            for conn in port_list:
                if conn.get('node') == 'Has Menu File?':
                    print(f'  {src} (port {port_idx}) -> Has Menu File?')

# What does Has Menu File? connect to?
print('\nConnections FROM "Has Menu File?":')
if 'Has Menu File?' in conns:
    for port_key, ports in conns['Has Menu File?'].items():
        for port_idx, port_list in enumerate(ports):
            for conn in port_list:
                print(f'  port {port_idx} -> {conn["node"]}')
else:
    print('  Not found in connections (node has no outgoing connections?)')

# What connects to Merge Menu Extraction?
print('\nConnections INTO "Merge Menu Extraction":')
for src, src_data in conns.items():
    for port_key, ports in src_data.items():
        for port_idx, port_list in enumerate(ports):
            for conn in port_list:
                if conn.get('node') == 'Merge Menu Extraction':
                    print(f'  {src} (port {port_idx}) -> Merge Menu Extraction (input {conn.get("index",0)})')

# Full node list to see if Has Menu File? exists
nodes_by_name = {n['name']: n for n in wf['nodes']}
hmf = nodes_by_name.get('Has Menu File?', {})
print(f'\nHas Menu File? node exists: {"Has Menu File?" in nodes_by_name}')
print(f'  disabled: {hmf.get("disabled")}')
print(f'  type: {hmf.get("type")}')
