import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/201')
full = r.json()['data']
data_field = full.get('data')
if isinstance(data_field, str):
    data_field = json.loads(data_field)

# The data_field IS the interned pool — each index is a value
# "5" in runData means pool[5]
# Let's find where node data lives by checking what's at key numeric indices

def resolve(pool, val):
    """Recursively resolve interned references."""
    if isinstance(val, str) and val.isdigit():
        idx = int(val)
        if idx < len(pool):
            return resolve(pool, pool[idx])
        return val
    if isinstance(val, dict):
        return {k: resolve(pool, v) for k, v in val.items()}
    if isinstance(val, list):
        return [resolve(pool, v) for v in val]
    return val

pool = data_field

# Find item with runData reference
for i, item in enumerate(pool[:10]):
    if isinstance(item, dict) and 'runData' in item:
        print(f'Item {i} has runData: {repr(item["runData"])[:50]}')
        rd_resolved = resolve(pool, item['runData'])
        if isinstance(rd_resolved, dict):
            print(f'Resolved runData has {len(rd_resolved)} nodes')
            print('Nodes:', sorted(rd_resolved.keys()))

            # Find node 8
            for k in rd_resolved:
                if '8' in k and 'creator' in k.lower():
                    print(f'\n=== NODE 8: {k} ===')
                    runs = rd_resolved[k]
                    if isinstance(runs, list) and runs:
                        run = runs[0]
                        outputs = run.get('data', {}).get('main', [[]])
                        if outputs and outputs[0]:
                            raw = outputs[0][0].get('json', {})
                            out = raw.get('output', raw.get('text', ''))
                            print(f'Output length: {len(out)} chars')
                            # Parse offers
                            try:
                                clean = out.strip()
                                if clean.startswith('```'):
                                    lines = clean.split('\n')
                                    clean = '\n'.join(lines[1:])
                                    if clean.endswith('```'):
                                        clean = clean[:-3].strip()
                                offer_data = json.loads(clean)
                                offers = offer_data.get('offers', [])
                                print(f'Total offers: {len(offers)}')
                                party_sizes = set(o.get("party_size") for o in offers)
                                print(f'Party sizes: {sorted(party_sizes)}')
                                tiers = set(o.get("tier") for o in offers)
                                print(f'Tiers: {sorted(tiers)}')
                                menu_items = offer_data.get('menu_items', [])
                                print(f'menu_items count: {len(menu_items)}')
                                if menu_items:
                                    for mi in menu_items[:3]:
                                        print(f'  {json.dumps(mi, ensure_ascii=False)[:120]}')
                                if offers:
                                    highest = max(offers, key=lambda o: o.get('promo_egp', 0) or 0)
                                    print(f'Highest: "{highest.get("title")}" — EGP {highest.get("promo_egp","?")}')
                                print('\nMatrix:')
                                for ps in ['Solo','Couple','Group','Family']:
                                    row = []
                                    for t in ['Entry','Core','Premium']:
                                        matches = [o for o in offers if o.get('party_size')==ps and o.get('tier')==t]
                                        row.append(f'{t}:{"OK" if matches else "MISSING"}')
                                    print(f'  {ps}: {", ".join(row)}')
                                backups = [o for o in offers if o.get('status')=='Backup']
                                print(f'Backups: {len(backups)}')
                            except Exception as e:
                                print(f'Parse error: {e}')
                                print(out[:1000])
                    break
        break
