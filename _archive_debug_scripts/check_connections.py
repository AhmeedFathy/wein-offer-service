import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
conns = wf.get('connections', {})

src = '🔀 Merge Form + Webhook'
if src in conns:
    print(f'Connections FROM "{src}":')
    for port_key, ports in conns[src].items():
        for port_idx, port_list in enumerate(ports):
            for conn in port_list:
                print(f'  port {port_idx} -> {conn["node"]} (input {conn.get("index", 0)})')
else:
    print(f'"{src}" not found in connections')
    print('Available sources:')
    for k in conns:
        if 'Merge' in k or 'merge' in k or 'Form' in k:
            print(f'  {repr(k)}')

# Check all connections from key early nodes
for src_check in ['Merge Form + Webhook', 'Normalize Webhook Data', '🔀 Merge Form + Webhook']:
    if src_check in conns:
        print(f'\nFROM {repr(src_check)}:')
        for port_key, ports in conns[src_check].items():
            for port_idx, port_list in enumerate(ports):
                for conn in port_list:
                    print(f'  -> {conn["node"]}')
