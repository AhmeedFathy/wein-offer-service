import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')
s = requests.Session()
s.post('https://weinflow.app.n8n.cloud/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get('https://weinflow.app.n8n.cloud/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
print(f'Total nodes: {len(wf["nodes"])}')
for n in wf['nodes']:
    name = n.get('name', '')
    ntype = n.get('type', '')
    disabled = n.get('disabled', False)
    if 'Parse' in name or 'parse' in name or ('Code' in ntype and 'code' in ntype.lower()):
        code = n['parameters'].get('jsCode', '')
        print(f'\n  Name: {repr(name)}')
        print(f'  Type: {ntype}')
        print(f'  Disabled: {disabled}')
        print(f'  Code length: {len(code)}')
        print(f'  Has _debug: {"_debug" in code}')
        print(f'  ID: {n.get("id")}')

# Also check connections to 'Parse Offer Data'
print('\n\nConnections TO/FROM Parse Offer Data:')
conns = wf.get('connections', {})
for src, src_conns in conns.items():
    for port_label, port_list in src_conns.items():
        for port in port_list:
            for conn in port:
                if 'Parse' in conn.get('node', ''):
                    print(f'  {src} -> {conn["node"]} (port {conn.get("index", 0)})')
for src, src_conns in conns.items():
    if 'Parse' in src:
        for port_label, port_list in src_conns.items():
            for port in port_list:
                for conn in port:
                    print(f'  {src} -> {conn["node"]} (port {conn.get("index", 0)})')
