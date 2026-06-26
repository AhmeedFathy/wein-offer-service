import requests, sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/205')
full = r.json()['data']
pool = json.loads(full['data'])
run_data = pool[6]  # pool[2]['runData'] = '6'

def r1(v):
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx < len(pool): return pool[idx]
    return v

node8_key = '\U0001f3d7️ 8. wein-creator — Build Full Offers'
# Find the key
for k in run_data:
    if '8' in k and 'creator' in k.lower():
        node8_key = k
        break

ref = run_data.get(node8_key, '')
runs = r1(ref)
ri = r1(runs[0]) if isinstance(runs, list) and runs else None
if not isinstance(ri, dict):
    print('ERROR: run not found')
    sys.exit(1)

d = r1(ri.get('data', {}))
m = r1(d.get('main', []) if isinstance(d, dict) else [])
p0 = r1(m[0] if isinstance(m, list) and m else None)
i0 = r1(p0[0] if isinstance(p0, list) and p0 else None)
j = r1(i0.get('json', {}) if isinstance(i0, dict) else {})
out = r1(j.get('text', j.get('output', '')) if isinstance(j, dict) else '')

if isinstance(out, str):
    print(f'Output length: {len(out)}')
    pos = 21253
    print(f'Around pos {pos}:')
    print(repr(out[pos-80:pos+80]))
    print(f'\nLast 100 chars: {repr(out[-100:])}')
    # Check for common JSON issues
    comma_nums = re.findall(r'\d,\d{3}', out)
    print(f'\nComma-formatted numbers: {comma_nums[:5]}')
    # Find the issue character
    # Apply comma stripping and see what's left
    cleaned = re.sub(r'(\d),(?=\d{3}(?:\D|$))', r'\1', out.strip())
    start = cleaned.find('{')
    if start >= 0:
        cleaned = cleaned[start:]
    try:
        json.loads(cleaned)
        print('Clean parse: OK')
    except json.JSONDecodeError as e:
        print(f'Parse error at pos {e.pos}: {repr(cleaned[e.pos-30:e.pos+30])}')
        # Check what type of error
        print(f'Error msg: {e.msg}')
else:
    print(f'out type: {type(out)}')
