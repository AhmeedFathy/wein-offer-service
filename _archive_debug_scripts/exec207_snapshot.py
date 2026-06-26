import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')
s = requests.Session()
s.post('https://weinflow.app.n8n.cloud/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get('https://weinflow.app.n8n.cloud/rest/executions/207', timeout=30)
full = r.json()['data']

# Check top-level keys
print('Execution top-level keys:', list(full.keys()))

# Check if there's a workflowData snapshot
wd = full.get('workflowData', {})
print(f'workflowData keys: {list(wd.keys()) if isinstance(wd, dict) else type(wd)}')
if isinstance(wd, dict):
    nodes = wd.get('nodes', [])
    print(f'Snapshot nodes count: {len(nodes)}')
    for n in nodes:
        if n.get('name') == 'Parse Offer Data':
            code = n['parameters'].get('jsCode', '')
            print(f'\nSnapshot Parse Offer Data code length: {len(code)}')
            print(f'Has _debug: {"_debug" in code}')
            print(f'Has offer0_party_size: {"offer0_party_size" in code}')
            print('Last 200 chars of snapshot code:')
            print(code[-200:])
            break
