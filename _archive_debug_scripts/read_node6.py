import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

for node in wf['nodes']:
    if '6' in node['name'] and ('innovat' in node['name'].lower() or 'concept' in node['name'].lower()):
        print(f'NODE: {node["name"]}')
        print(f'TYPE: {node["type"]}')
        params = node['parameters']
        print(f'PARAMS KEYS: {list(params.keys())}')
        # For chainLlm nodes, text is in different places
        if 'text' in params:
            print(f'\n--- TEXT FIELD ({len(params["text"])} chars) ---')
            print(params['text'])
        if 'messages' in params:
            for i, mv in enumerate(params['messages'].get('messageValues', [])):
                print(f'\n--- MESSAGE {i} ({len(mv.get("message",""))} chars) ---')
                print(mv.get('message',''))
        if 'prompt' in params:
            print(f'\n--- PROMPT ({len(params["prompt"])} chars) ---')
            print(params['prompt'])
        break
else:
    # Try broader search
    for node in wf['nodes']:
        if '6' in node['name']:
            print(f'FOUND NODE WITH 6: {node["name"]} / type={node["type"]}')
