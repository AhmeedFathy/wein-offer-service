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

run_data = {}
for i, item in enumerate(data_field):
    if not isinstance(item, dict):
        continue
    if 'resultData' in item:
        rd = item['resultData']
        if isinstance(rd, str):
            rd = json.loads(rd)
        if isinstance(rd, dict):
            run_data = rd.get('runData', {})
            print(f'Found runData at item {i}, node count: {len(run_data)}')
            break
    if 'runData' in item:
        rr = item['runData']
        if isinstance(rr, str):
            rr = json.loads(rr)
        if isinstance(rr, dict) and len(rr) > len(run_data):
            run_data = rr
            print(f'Found runData directly at item {i}, node count: {len(run_data)}')

if not run_data:
    print('No run_data found. Dumping structure:')
    for i, item in enumerate(data_field[:5]):
        if isinstance(item, dict):
            print(f'  [{i}] keys: {list(item.keys())}')
    sys.exit(1)

print('Node list:')
for k in sorted(run_data.keys()):
    print(f'  {k}')

# Find node 8
print('\n--- NODE 8 OUTPUT ---')
for k in run_data:
    if '8' in k and 'creator' in k.lower():
        runs = run_data[k]
        for run in runs:
            if isinstance(run, str):
                run = json.loads(run)
            outputs = run.get('data', {}).get('main', [[]])
            if outputs and outputs[0]:
                raw = outputs[0][0].get('json', {})
                out = raw.get('output', raw.get('text', ''))
                print(f'Node: {k}')
                print(f'Output length: {len(out)} chars')
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
                    tiers = set(o.get("tier") for o in offers)
                    print(f'Party sizes: {sorted(party_sizes)}')
                    print(f'Tiers: {sorted(tiers)}')
                    print(f'menu_items at top level: {"menu_items" in offer_data}')
                    menu_items = offer_data.get('menu_items', [])
                    print(f'menu_items count: {len(menu_items)}')
                    if menu_items:
                        print(f'First menu item: {json.dumps(menu_items[0], ensure_ascii=False)}')
                    if offers:
                        highest = max(offers, key=lambda o: o.get('promo_egp', 0) or 0)
                        print(f'Highest ticket: "{highest.get("title")}" — EGP {highest.get("promo_egp","?")}')
                    print('\nOffers by party_size:')
                    for ps in ['Solo','Couple','Group','Family']:
                        ps_offers = [o for o in offers if o.get('party_size') == ps]
                        ts = [o.get('tier') for o in ps_offers]
                        print(f'  {ps}: {len(ps_offers)} — tiers: {ts}')
                except Exception as e:
                    print(f'Parse error: {e}')
                    print(f'Preview: {out[:500]}')
        break
