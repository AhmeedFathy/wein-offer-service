import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/204')
full = r.json()['data']
pool = json.loads(full['data'])
run_data = pool[5]

def r1(v):
    """Resolve exactly one pool ref."""
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx < len(pool): return pool[idx]
    return v

# Trace Parse Offer Data chain
ref = run_data.get('Parse Offer Data', 'MISSING')
print(f'Parse Offer Data ref: {ref}')
runs_list = r1(ref)
print(f'runs_list type: {type(runs_list)}, len: {len(runs_list) if isinstance(runs_list, list) else "?"}')
run0 = r1(runs_list[0]) if isinstance(runs_list, list) else None
print(f'run0 type: {type(run0)}')
if isinstance(run0, dict):
    print(f'run0 keys: {list(run0.keys())}')
    err = r1(run0.get('error'))
    print(f'error: {err}')
    data = r1(run0.get('data', {}))
    print(f'data type: {type(data)}')
    if isinstance(data, dict):
        main = r1(data.get('main', []))
        print(f'main type: {type(main)}, len: {len(main) if isinstance(main, list) else "?"}')
        if isinstance(main, list) and main:
            port0 = r1(main[0])
            print(f'port0 type: {type(port0)}, len: {len(port0) if isinstance(port0, list) else "?"}')
            if isinstance(port0, list) and port0:
                item0 = r1(port0[0])
                print(f'item0 type: {type(item0)}')
                if isinstance(item0, dict):
                    j = r1(item0.get('json', {}))
                    print(f'json type: {type(j)}')
                    if isinstance(j, dict):
                        print(f'json keys: {list(j.keys())}')
                        # Check offer_data
                        od_ref = j.get('offer_data')
                        print(f'offer_data ref: {od_ref}')
                        od = r1(od_ref) if isinstance(od_ref, str) else od_ref
                        print(f'offer_data type: {type(od)}')
                        if isinstance(od, dict):
                            print(f'offer_data keys: {list(od.keys())}')
                            offers_ref = od.get('offers', [])
                            offers = r1(offers_ref) if isinstance(offers_ref, str) else offers_ref
                            print(f'offers type: {type(offers)}, len: {len(offers) if isinstance(offers, list) else "?"}')
                            if isinstance(offers, list) and offers:
                                o0_ref = offers[0]
                                o0 = r1(o0_ref) if isinstance(o0_ref, str) else o0_ref
                                print(f'offer[0] type: {type(o0)}')
                                if isinstance(o0, dict):
                                    print(f'offer[0] keys: {list(o0.keys())}')
                                    print(f'offer[0].party_size: {o0.get("party_size")}')
                                    print(f'offer[0].tier: {o0.get("tier")}')
                                    print(f'offer[0].status: {o0.get("status")}')
                                else:
                                    print(f'offer[0] not dict: {str(o0_ref)[:50]}')
                                    # It's still a pool ref — need to go deeper
                                    if isinstance(o0_ref, str) and o0_ref.isdigit():
                                        deeper = pool[int(o0_ref)]
                                        print(f'pool[{o0_ref}] type: {type(deeper)}')
                                        if isinstance(deeper, dict):
                                            print(f'  keys: {list(deeper.keys())}')
                                            print(f'  party_size: {deeper.get("party_size")}')
