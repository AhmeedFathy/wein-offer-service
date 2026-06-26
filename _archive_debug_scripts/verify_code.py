import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

for n in wf['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        print(f'Code length: {len(code)}')
        print(f'Has dup-key fix: {"duplicate property names" in code}')
        print(f'Has deep-clone: {"JSON.parse(JSON.stringify" in code}')
        print(f'Has PARTY_SIZE_BY_ID: {"PARTY_SIZE_BY_ID" in code}')
        print(f'Has HOOK_MAP: {"HOOK_MAP" in code}')
        print(f'Has menu_items build: {"menu_items.push" in code}')
        print('\nFirst 200 chars:')
        print(code[:200])
        print('\nLast 200 chars:')
        print(code[-200:])
        break

# Also check node 8 output from exec 206 to see what fields LLM wrote
pool = json.loads(s.get(f'{N8N_BASE}/rest/executions/206').json()['data']['data'])

def resolve(pool, v, depth=0):
    if depth > 10: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx < len(pool):
            return resolve(pool, pool[idx], depth+1)
    return v

run_data = resolve(pool, pool[2].get('runData'))
node8_key = next((k for k in run_data if 'creator' in k.lower()), None)
if node8_key:
    ref = run_data[node8_key]
    runs = resolve(pool, ref)
    ri = resolve(pool, runs[0]) if isinstance(runs, list) and runs else None
    if isinstance(ri, dict):
        d = resolve(pool, ri.get('data', {}))
        main = resolve(pool, d.get('main', []) if isinstance(d, dict) else [])
        p0 = resolve(pool, main[0] if isinstance(main, list) and main else None)
        i0 = resolve(pool, p0[0] if isinstance(p0, list) and p0 else None)
        j = resolve(pool, i0.get('json', {}) if isinstance(i0, dict) else {})
        text = resolve(pool, j.get('text', '') if isinstance(j, dict) else '')
        if isinstance(text, str):
            # Find first offer's party_size in the raw JSON
            import re
            first_offer = text[text.find('"id": 1'):text.find('"id": 1')+500] if '"id": 1' in text else text[:500]
            print(f'\nNode 8 raw output - first offer snippet:')
            print(first_offer[:500])
            ps_matches = re.findall(r'"party_size"\s*:\s*"([^"]*)"', text[:3000])
            print(f'\nFirst few party_sizes in raw LLM output: {ps_matches[:5]}')
