import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/202')
full = r.json()['data']
pool = json.loads(full['data'])

def pg(v, depth=0, visited=None):
    if visited is None: visited = set()
    if depth > 25: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx in visited or idx >= len(pool): return v
        return pg(pool[idx], depth+1, visited | {idx})
    return v

run_data = pg(pool[2]['runData'])

# Get node 8 output
node8_key = '🏗️ 8. wein-creator — Build Full Offers'
nr = pg(run_data[node8_key])
ri = pg(nr[0])
d = pg(ri.get('data', {}))
m = pg(d.get('main', [[]]))
e0 = pg(m[0])
e00 = pg(e0[0] if isinstance(e0, list) else e0)
j = pg(e00.get('json', {})) if isinstance(e00, dict) else {}
out = pg(j.get('output', j.get('text', '')))

print(f'Node 8 output type: {type(out)}')
print(f'Node 8 output length: {len(out) if isinstance(out, str) else "?"}')

if isinstance(out, str):
    # Show around char 6515 where parse failed
    print(f'\nChars 6480-6550:')
    print(repr(out[6480:6550]))
    print(f'\nLast 200 chars:')
    print(repr(out[-200:]))

    # Try to count offers
    offer_count = out.count('"id":')
    print(f'\nApprox offer count (by "id": occurrences): {offer_count}')

    # Check if menu_items is present
    print(f'Has "menu_items": {"menu_items" in out}')
    print(f'Has "party_size": {"party_size" in out}')
    print(f'Has "tier": {"tier" in out}')

    # Check top-level structure
    try:
        # Try to find the valid portion
        start = out.find('{')
        # Try parsing to find where it breaks
        for end in range(len(out), len(out)-1000, -10):
            try:
                test = json.loads(out[start:end])
                print(f'\nLargest valid JSON ends at char {end}')
                print(f'Valid JSON keys: {list(test.keys())}')
                if 'offers' in test:
                    print(f'Offers count in valid portion: {len(test["offers"])}')
                if 'menu_items' in test:
                    print(f'menu_items count: {len(test["menu_items"])}')
                break
            except:
                pass
    except Exception as e:
        print(f'Parse attempt error: {e}')

# Check Parse Offer Data error details
print('\n=== PARSE OFFER DATA ERROR ===')
pod_key = 'Parse Offer Data'
if pod_key in run_data:
    nr2 = pg(run_data[pod_key])
    ri2 = pg(nr2[0])
    err = ri2.get('error')
    if err:
        err_resolved = pg(err)
        if isinstance(err_resolved, dict):
            for k, v in err_resolved.items():
                print(f'  {k}: {pg(v)}')
        else:
            print(f'  {err_resolved}')
