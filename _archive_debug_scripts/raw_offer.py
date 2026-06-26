import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

pool = json.loads(s.get(f'{N8N_BASE}/rest/executions/206').json()['data']['data'])

def resolve(pool, v, depth=0):
    if depth > 10: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx < len(pool):
            return resolve(pool, pool[idx], depth+1)
    return v

run_data = resolve(pool, pool[2].get('runData'))
pod_ref = run_data.get('Parse Offer Data')
pod_runs = resolve(pool, pod_ref)
ri = resolve(pool, pod_runs[0])
d = resolve(pool, ri.get('data', {}))
main = resolve(pool, d.get('main', []))
p0 = resolve(pool, main[0])
i0 = resolve(pool, p0[0])
j = resolve(pool, i0.get('json', {}))
od = resolve(pool, j.get('offer_data'))

# Look at offers[0] raw value before resolve
offers_raw = od.get('offers', [])
print(f'offers_raw type: {type(offers_raw)}, count: {len(offers_raw)}')
print(f'offers_raw[0] type: {type(offers_raw[0])}, value: {repr(offers_raw[0])[:200]}')

o0 = resolve(pool, offers_raw[0])
print(f'\nResolved offer[0] ALL keys: {list(o0.keys()) if isinstance(o0, dict) else "N/A"}')
if isinstance(o0, dict):
    print(f'Full offer[0]: {json.dumps(o0, ensure_ascii=False)[:1000]}')

# Check a few more
print(f'\noffers[3] raw: {repr(offers_raw[3])[:200]}')
o3 = resolve(pool, offers_raw[3])
print(f'offers[3] all keys: {list(o3.keys()) if isinstance(o3, dict) else "N/A"}')
if isinstance(o3, dict):
    print(f'party_size: {o3.get("party_size")}, tier: {o3.get("tier")}')
