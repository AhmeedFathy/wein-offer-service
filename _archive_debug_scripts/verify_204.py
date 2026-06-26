import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/204')
full = r.json()['data']
pool = json.loads(full['data'])

# pool[2]['runData'] = "5", so run_data = pool[5]
run_data = pool[5]

def res(v, depth=0, seen=None):
    if seen is None: seen = set()
    if depth > 20: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx in seen or idx >= len(pool): return v
        return res(pool[idx], depth+1, seen | {idx})
    return v  # don't recurse into dicts/lists — too deep

def get_json_output(node_key):
    """Get the json output of a node by resolving one level at a time."""
    if node_key not in run_data:
        return None, 'NOT IN RUN_DATA'
    v = run_data[node_key]
    v = res(v)  # resolve to list of runs
    if not isinstance(v, list) or not v:
        return None, f'not list: {type(v)}'
    run = res(v[0])
    if not isinstance(run, dict):
        return None, f'run not dict: {type(run)}'
    err = run.get('error')
    if err:
        err = res(err)
        msg = res(err.get('message','?')) if isinstance(err, dict) else str(err)
        return None, f'ERROR: {msg}'
    data = res(run.get('data', {}))
    if not isinstance(data, dict):
        return None, f'data not dict'
    main = res(data.get('main', []))
    if not isinstance(main, list) or not main:
        return None, 'no main'
    port0 = res(main[0])
    if not isinstance(port0, list) or not port0:
        return None, 'empty port0'
    item = res(port0[0])
    if not isinstance(item, dict):
        return None, f'item not dict: {type(item)}'
    j = res(item.get('json', {}))
    return j, None

# Check Parse Offer Data output
print('=== Parse Offer Data ===')
j, err = get_json_output('Parse Offer Data')
if err:
    print(f'Error: {err}')
else:
    print(f'Keys: {list(j.keys()) if isinstance(j, dict) else type(j)}')
    if isinstance(j, dict):
        od_ref = j.get('offer_data')
        od = res(od_ref) if isinstance(od_ref, str) else od_ref
        if isinstance(od, dict):
            offers = od.get('offers', [])
            menu_items = od.get('menu_items', [])
            # Offers may still be pool refs
            resolved_offers = []
            for o in offers:
                o = res(o)
                if isinstance(o, dict):
                    resolved_offers.append(o)
            print(f'offers count: {len(resolved_offers)}')
            print(f'menu_items count: {len(menu_items) if isinstance(menu_items, list) else res(menu_items)}')

            print('\n=== TASK 1 PASS/FAIL ===')
            checks = [
                ('party_size present', all(res(o).get('party_size') if isinstance(o, dict) else False for o in resolved_offers)),
                ('tier present', all(res(o).get('tier') if isinstance(o, dict) else False for o in resolved_offers)),
                ('hook_type present', all(res(o).get('hook_type') if isinstance(o, dict) else False for o in resolved_offers)),
                ('status present', all(res(o).get('status') if isinstance(o, dict) else False for o in resolved_offers)),
                ('exactly 20 offers', len(resolved_offers) == 20),
                ('menu_items at top level', isinstance(menu_items, list) and len(menu_items) > 0),
                ('all 4 party sizes', {'Solo','Couple','Group','Family'} == set(o.get('party_size') for o in resolved_offers if isinstance(o, dict))),
                ('all 3 tiers', {'Entry','Core','Premium'} == set(o.get('tier') for o in resolved_offers if isinstance(o, dict) and o.get('tier'))),
                ('price endings 5 or 9', all((o.get('promo_egp') or 1) % 10 in (5,9) for o in resolved_offers if isinstance(o, dict))),
            ]
            for label, result in checks:
                print(f'  {"PASS" if result else "FAIL"} — {label}')

            # Sample offers
            print('\nFirst 3 offers:')
            for o in resolved_offers[:3]:
                if isinstance(o, dict):
                    print(f'  id={o.get("id")} ps={o.get("party_size")} tier={o.get("tier")} hook={o.get("hook_type")} status={o.get("status")} price={o.get("promo_egp")}')

            # Highest ticket
            if resolved_offers:
                highest = max(resolved_offers, key=lambda o: (o.get('promo_egp') or 0) if isinstance(o, dict) else 0)
                print(f'\nHighest: "{highest.get("title")}" — EGP {highest.get("promo_egp")}')

            # menu_items sample
            if isinstance(menu_items, list) and menu_items:
                print(f'\nFirst menu item: {res(menu_items[0]) if isinstance(menu_items[0], str) else menu_items[0]}')
        else:
            print(f'offer_data not resolved: {type(od)}, ref={od_ref}')

# Build chain status
print('\n=== BUILD CHAIN ===')
for target in ['Code in JavaScript', 'Parse Offer Data', 'Generate Offer Files', 'Split Files to Binary']:
    j2, err2 = get_json_output(target)
    if err2:
        print(f'  {"NOT RAN" if "NOT IN" in err2 else "ERROR"}: {target} — {err2}')
    else:
        print(f'  OK: {target}')
