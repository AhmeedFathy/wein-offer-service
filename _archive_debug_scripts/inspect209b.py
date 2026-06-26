import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/executions/209', timeout=30)
full = r.json()['data']
pool = json.loads(full['data'])

def resolve(pool, v, depth=0):
    if depth > 10: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx < len(pool):
            return resolve(pool, pool[idx], depth+1)
    return v

run_data = resolve(pool, pool[2].get('runData'))

# Check Combine Menu + Data output
key = 'Combine Menu + Data'
ref = run_data.get(key, '')
runs = resolve(pool, ref)
print(f'Combine Menu + Data runs type: {type(runs)}')
if isinstance(runs, list) and runs:
    ri = resolve(pool, runs[0])
    if isinstance(ri, dict):
        d = resolve(pool, ri.get('data', {}))
        if isinstance(d, dict):
            main = resolve(pool, d.get('main', []))
            print(f'main type: {type(main)}, len: {len(main) if isinstance(main, list) else "N/A"}')
            if isinstance(main, list) and main:
                p0 = resolve(pool, main[0])
                print(f'p0 type: {type(p0)}, len: {len(p0) if isinstance(p0, list) else "N/A"}')
            else:
                print('main is empty — this is why the workflow stopped!')

# Also check Merge Menu Paths
key2 = '🔀 Merge Menu Paths'
ref2 = run_data.get(key2, '')
runs2 = resolve(pool, ref2)
if isinstance(runs2, list) and runs2:
    ri2 = resolve(pool, runs2[0])
    if isinstance(ri2, dict):
        d2 = resolve(pool, ri2.get('data', {}))
        if isinstance(d2, dict):
            main2 = resolve(pool, d2.get('main', []))
            p0_2 = resolve(pool, main2[0] if isinstance(main2, list) and main2 else None)
            items = resolve(pool, p0_2) if isinstance(p0_2, str) else p0_2
            print(f'\nMerge Menu Paths items count: {len(items) if isinstance(items, list) else "?"}')
            if isinstance(items, list) and items:
                i0 = resolve(pool, items[0])
                if isinstance(i0, dict):
                    j = resolve(pool, i0.get('json', {}))
                    if isinstance(j, dict):
                        print(f'  provider_name: {j.get("provider_name")}')
                        print(f'  menu_or_services len: {len(str(j.get("menu_or_services", "")))}')

# Check webhook input to see if PDF was received
wh_key = '🔗 Webhook — New Provider API'
wh_ref = run_data.get(wh_key, '')
wh_runs = resolve(pool, wh_ref)
if isinstance(wh_runs, list) and wh_runs:
    wh_ri = resolve(pool, wh_runs[0])
    if isinstance(wh_ri, dict):
        d3 = resolve(pool, wh_ri.get('data', {}))
        if isinstance(d3, dict):
            main3 = resolve(pool, d3.get('main', []))
            p0_3 = resolve(pool, main3[0] if isinstance(main3, list) and main3 else None)
            items3 = p0_3 if isinstance(p0_3, list) else []
            if items3:
                i0_3 = resolve(pool, items3[0])
                j3 = resolve(pool, i0_3.get('json', {}) if isinstance(i0_3, dict) else {})
                if isinstance(j3, dict):
                    print(f'\nWebhook input keys: {list(j3.keys())}')
                    print(f'  files present: {"files" in j3 or "binary" in j3}')
