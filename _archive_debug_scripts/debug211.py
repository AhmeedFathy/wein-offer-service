import requests, sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/executions/211', timeout=30)
full = r.json()['data']
pool = json.loads(full['data'])

def resolve(pool, v, depth=0):
    if depth > 10: return v
    try:
        idx = int(v)
        if 0 <= idx < len(pool):
            return resolve(pool, pool[idx], depth+1)
    except (ValueError, TypeError):
        pass
    return v

item2 = pool[2]
run_data = resolve(pool, item2.get('runData'))

# Full error
err = resolve(pool, item2.get('error', {}))
if isinstance(err, dict):
    msg = resolve(pool, err.get('message', ''))
    print(f'Full error message: {repr(msg)}')
    desc = resolve(pool, err.get('description', ''))
    print(f'Description: {repr(desc)[:500]}')

# Get node 8 raw output to find the JSON issue
node8_key = next((k for k in (run_data or {}) if 'creator' in k.lower()), None)
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
            print(f'\nNode 8 output length: {len(text)}')
            # Apply the preprocessing and find the JSON error
            raw = text.strip()
            if '```' in raw:
                m = re.search(r'```(?:json)?\s*([\s\S]*?)```', raw)
                if m: raw = m.group(1).strip()
            raw = re.sub(r'(\d),(?=\d{3}(?:[^\d]|$))', r'\1', raw)
            raw = re.sub(r'"([^"]{1,40})","(\1)":', lambda m: f'"{m.group(1)}":', raw)
            start = raw.find('{')
            if start >= 0: raw = raw[start:]
            try:
                json.loads(raw)
                print('JSON parses OK after preprocessing')
            except json.JSONDecodeError as e:
                print(f'JSON error at pos {e.pos}: {e.msg}')
                ctx = raw[max(0, e.pos-100):e.pos+100]
                print(f'Context: {repr(ctx)}')
                # Find line 28 reference
                lines = raw[:e.pos].split('\n')
                print(f'At line {len(lines)}: {repr(lines[-1][:200])}')
