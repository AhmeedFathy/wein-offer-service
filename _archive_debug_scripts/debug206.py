import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/executions/206', timeout=30)
full = r.json()['data']
pool = json.loads(full['data'])

def resolve(pool, v, depth=0):
    if depth > 10: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx < len(pool):
            return resolve(pool, pool[idx], depth+1)
    return v

# Find item2 / runData
print(f'Pool size: {len(pool)}')
item2 = pool[2]
print(f'pool[2] type: {type(item2)}')
if isinstance(item2, dict):
    rd_ref = item2.get('runData')
    print(f'runData ref: {repr(rd_ref)}')
    run_data = resolve(pool, rd_ref)
    print(f'run_data type: {type(run_data)}')
    if isinstance(run_data, dict):
        keys = list(run_data.keys())
        print(f'run_data keys ({len(keys)}):')
        for k in keys:
            if 'Parse' in k or 'parse' in k or 'Offer' in k:
                print(f'  MATCH: {repr(k)}')
            else:
                print(f'  {repr(k[:60])}')

        # Get Parse Offer Data
        pod_key = next((k for k in run_data if 'Parse Offer Data' in k), None)
        print(f'\nParse Offer Data key: {repr(pod_key)}')
        if pod_key:
            pod_ref = run_data[pod_key]
            pod_runs = resolve(pool, pod_ref)
            print(f'pod_runs type: {type(pod_runs)}, len: {len(pod_runs) if isinstance(pod_runs, list) else "N/A"}')
            if isinstance(pod_runs, list) and pod_runs:
                ri = resolve(pool, pod_runs[0])
                print(f'ri type: {type(ri)}')
                if isinstance(ri, dict):
                    d = resolve(pool, ri.get('data', {}))
                    print(f'd type: {type(d)}, keys: {list(d.keys()) if isinstance(d, dict) else "N/A"}')
                    if isinstance(d, dict):
                        main = resolve(pool, d.get('main', []))
                        print(f'main type: {type(main)}, len: {len(main) if isinstance(main, list) else "N/A"}')
                        if isinstance(main, list) and main:
                            p0 = resolve(pool, main[0])
                            print(f'p0 type: {type(p0)}, len: {len(p0) if isinstance(p0, list) else "N/A"}')
                            if isinstance(p0, list) and p0:
                                i0 = resolve(pool, p0[0])
                                print(f'i0 type: {type(i0)}, keys: {list(i0.keys()) if isinstance(i0, dict) else "N/A"}')
                                if isinstance(i0, dict):
                                    j = resolve(pool, i0.get('json', {}))
                                    print(f'j type: {type(j)}, keys: {list(j.keys()) if isinstance(j, dict) else "N/A"}')
                                    if isinstance(j, dict):
                                        od = resolve(pool, j.get('offer_data'))
                                        print(f'offer_data type: {type(od)}, keys: {list(od.keys()) if isinstance(od, dict) else "N/A"}')
                                        if isinstance(od, dict):
                                            offers = resolve(pool, od.get('offers', []))
                                            mi = resolve(pool, od.get('menu_items', []))
                                            print(f'offers type: {type(offers)}, count: {len(offers) if isinstance(offers, list) else "N/A"}')
                                            print(f'menu_items type: {type(mi)}, count: {len(mi) if isinstance(mi, list) else "N/A"}')
                                            if isinstance(offers, list) and offers:
                                                o0 = resolve(pool, offers[0])
                                                print(f'\noffer[0] type: {type(o0)}')
                                                if isinstance(o0, dict):
                                                    print(f'  party_size: {o0.get("party_size")}')
                                                    print(f'  tier: {o0.get("tier")}')
                                                    print(f'  status: {o0.get("status")}')
                                                    print(f'  hook_type: {o0.get("hook_type")}')
                                                    print(f'  promo_egp: {o0.get("promo_egp")}')
                                                    print(f'  price_ending_ok: {o0.get("price_ending_ok")}')
                                                    # Check all 20 offers for party_size coverage
                                                    sizes = set()
                                                    tiers = set()
                                                    for o_ref in offers:
                                                        o = resolve(pool, o_ref)
                                                        if isinstance(o, dict):
                                                            sizes.add(o.get('party_size'))
                                                            tiers.add(o.get('tier'))
                                                    print(f'\nParty sizes present: {sorted(sizes)}')
                                                    print(f'Tiers present: {sorted(tiers)}')
