import requests, sys, json, base64, io
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/executions/213', timeout=30)
full = r.json()['data']
pool = json.loads(full['data'])

def resolve(pool, v, depth=0):
    if depth > 10: return v
    try:
        idx = int(v)
        if 0 <= idx < len(pool): return resolve(pool, pool[idx], depth+1)
    except: pass
    return v

run_data = resolve(pool, pool[2].get('runData'))

# Get Parse Offer Data output → offer_data
pod_ref = run_data.get('Parse Offer Data', '')
pod_runs = resolve(pool, pod_ref)
ri = resolve(pool, pod_runs[0]) if isinstance(pod_runs, list) and pod_runs else None
d = resolve(pool, ri.get('data', {}) if isinstance(ri, dict) else {})
main = resolve(pool, d.get('main', []) if isinstance(d, dict) else [])
p0 = resolve(pool, main[0] if isinstance(main, list) and main else None)
i0 = resolve(pool, p0[0] if isinstance(p0, list) and p0 else None)
j = resolve(pool, i0.get('json', {}) if isinstance(i0, dict) else {})

offer_data = resolve(pool, j.get('offer_data')) if isinstance(j, dict) else None
if not isinstance(offer_data, dict):
    print(f'offer_data not a dict: {type(offer_data)}')
    sys.exit(1)

print('=== offer_data top-level keys ===')
for k, v in offer_data.items():
    if isinstance(v, list):
        resolved_v = v
        print(f'  {k}: list[{len(resolved_v)}]')
    else:
        print(f'  {k}: {repr(str(v))[:80]}')

# Check for top-level comparisons
comp_top = offer_data.get('comparisons')
if comp_top:
    print(f'\nTop-level comparisons: {type(comp_top)}, count: {len(comp_top) if isinstance(comp_top, list) else "N/A"}')
    if isinstance(comp_top, list) and comp_top:
        print(f'  First comparison: {json.dumps(comp_top[0], ensure_ascii=False)[:300]}')
else:
    print('\nNo top-level comparisons key')

# Check offers[0] for comparisons field
offers_raw = offer_data.get('offers', [])
if isinstance(offers_raw, list) and offers_raw:
    o0 = offers_raw[0]
    if isinstance(o0, dict):
        print(f'\noffer[0] keys: {list(o0.keys())}')
        o0_comp = o0.get('comparisons') or o0.get('comparison') or o0.get('comparisons_from_scout')
        if o0_comp:
            print(f'offer[0] has comparisons: {type(o0_comp)}, count: {len(o0_comp) if isinstance(o0_comp, list) else "N/A"}')
            if isinstance(o0_comp, list) and o0_comp:
                print(f'  First: {json.dumps(o0_comp[0], ensure_ascii=False)[:300]}')
        else:
            # Print all offer[0] keys with comparison-like names
            comp_keys = [k for k in o0.keys() if 'comp' in k.lower() or 'versus' in k.lower() or 'market' in k.lower() or 'waffarha' in k.lower()]
            print(f'  Comparison-like keys in offer[0]: {comp_keys}')

# Also get raw node 8 text to see what it outputs
node8_key = next((k for k in run_data if 'creator' in k.lower()), None)
if node8_key:
    ref = run_data[node8_key]
    runs = resolve(pool, ref)
    ri8 = resolve(pool, runs[0]) if isinstance(runs, list) and runs else None
    d8 = resolve(pool, ri8.get('data', {}) if isinstance(ri8, dict) else {})
    main8 = resolve(pool, d8.get('main', []) if isinstance(d8, dict) else [])
    p8 = resolve(pool, main8[0] if isinstance(main8, list) and main8 else None)
    i8 = resolve(pool, p8[0] if isinstance(p8, list) and p8 else None)
    j8 = resolve(pool, i8.get('json', {}) if isinstance(i8, dict) else {})
    text8 = resolve(pool, j8.get('text', '') if isinstance(j8, dict) else '')
    if isinstance(text8, str):
        print(f'\n=== Node 8 raw output (first 3000 chars) ===')
        print(text8[:3000])
