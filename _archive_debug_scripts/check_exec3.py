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

# It's a list — find the item with resultData
run_data = {}
for item in data_field:
    if isinstance(item, dict) and 'resultData' in item:
        run_data = item['resultData'].get('runData', {})
        break
    if isinstance(item, dict) and 'runData' in item:
        run_data = item['runData']
        break

print(f'Nodes that ran ({len(run_data)}):')
for k in sorted(run_data.keys()):
    runs = run_data[k]
    for run in runs:
        err = run.get('error')
        if err:
            print(f'  ERROR: {k}')
            print(f'    {json.dumps(err)[:300]}')
        else:
            print(f'  OK: {k}')

# Find node 8 output
print('\n--- NODE 8 OUTPUT ---')
for k in run_data:
    if '8' in k and 'creator' in k.lower():
        for run in run_data[k]:
            outputs = run.get('data', {}).get('main', [[]])
            if outputs and outputs[0]:
                raw = outputs[0][0].get('json', {})
                out = raw.get('output', raw.get('text', ''))
                if not out and isinstance(raw, dict):
                    # Try all keys
                    for v in raw.values():
                        if isinstance(v, str) and len(v) > 100:
                            out = v
                            break
                print(f'Output length: {len(out)} chars')
                # Try to parse
                try:
                    clean = out.strip()
                    if clean.startswith('```'):
                        lines = clean.split('\n')
                        clean = '\n'.join(lines[1:])
                        if clean.endswith('```'):
                            clean = clean[:-3].strip()
                    offer_data = json.loads(clean)
                    offers = offer_data.get('offers', [])
                    print(f'\n=== ANALYSIS ===')
                    print(f'Total offers: {len(offers)}')
                    party_sizes = set(o.get("party_size") for o in offers)
                    tiers = set(o.get("tier") for o in offers)
                    statuses = set(o.get("status") for o in offers)
                    print(f'Party sizes: {party_sizes}')
                    print(f'Tiers: {tiers}')
                    print(f'Statuses: {statuses}')
                    print(f'menu_items at top level: {"menu_items" in offer_data}')
                    menu_items = offer_data.get('menu_items', [])
                    print(f'menu_items count: {len(menu_items)}')
                    if menu_items:
                        print(f'First 3 menu items: {json.dumps(menu_items[:3], ensure_ascii=False)}')
                    if offers:
                        highest = max(offers, key=lambda o: o.get('promo_egp', 0) or o.get('promo_price', 0) or 0)
                        print(f'Highest ticket: "{highest.get("title")}" — EGP {highest.get("promo_egp", highest.get("promo_price","?"))}')
                    # Per party_size breakdown
                    print('\nOffers by party_size:')
                    for ps in ['Solo','Couple','Group','Family']:
                        ps_offers = [o for o in offers if o.get('party_size') == ps]
                        ts = [o.get('tier') for o in ps_offers]
                        print(f'  {ps}: {len(ps_offers)} offers — tiers: {ts}')
                except Exception as e:
                    print(f'Parse error: {e}')
                    print(f'Raw output preview:\n{out[:3000]}')
        break

# Check PythonAnywhere service call result
print('\n--- DOWNSTREAM NODES ---')
for k in run_data:
    if any(x in k.lower() for x in ['10.', '11.', 'service', 'build', 'send', 'telegram']):
        for run in run_data[k]:
            outputs = run.get('data', {}).get('main', [[]])
            if outputs and outputs[0]:
                raw = outputs[0][0].get('json', {})
                print(f'  {k}: {json.dumps(raw, ensure_ascii=False)[:200]}')
