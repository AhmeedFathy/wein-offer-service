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

# item[2] has runData
item2 = data_field[2]
run_data = item2.get('runData', {})
if isinstance(run_data, str):
    run_data = json.loads(run_data)

print(f'Node count: {len(run_data)}')
print('All nodes:')
for k in sorted(run_data.keys()):
    print(f'  {k}')

def get_output_json(k):
    runs = run_data[k]
    for run in runs:
        if isinstance(run, str):
            run = json.loads(run)
        err = run.get('error')
        if err:
            return None, err
        outputs = run.get('data', {}).get('main', [[]])
        if outputs and outputs[0]:
            return outputs[0][0].get('json', {}), None
    return {}, None

# Find node 8
print('\n--- NODE 8 OUTPUT ---')
for k in run_data:
    if '8' in k and 'creator' in k.lower():
        raw, err = get_output_json(k)
        if err:
            print(f'ERROR: {err}')
        else:
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
                print(f'\n=== ANALYSIS ===')
                print(f'Total offers: {len(offers)}')
                party_sizes = set(o.get("party_size") for o in offers)
                tiers = set(o.get("tier") for o in offers)
                print(f'Party sizes: {sorted(party_sizes)}')
                print(f'Tiers: {sorted(tiers)}')
                print(f'menu_items at top level: {"menu_items" in offer_data}')
                menu_items = offer_data.get('menu_items', [])
                print(f'menu_items count: {len(menu_items)}')
                if menu_items:
                    print(f'First 3 menu items:')
                    for mi in menu_items[:3]:
                        print(f'  {json.dumps(mi, ensure_ascii=False)}')
                if offers:
                    highest = max(offers, key=lambda o: o.get('promo_egp', 0) or 0)
                    print(f'\nHighest ticket: "{highest.get("title")}" — EGP {highest.get("promo_egp","?")}')
                print('\nOffers by party_size × tier:')
                for ps in ['Solo','Couple','Group','Family']:
                    ps_offers = [o for o in offers if o.get('party_size') == ps]
                    for t in ['Entry','Core','Premium']:
                        t_offers = [o for o in ps_offers if o.get('tier') == t]
                        flag = '' if t_offers else ' *** MISSING ***'
                        print(f'  {ps} {t}: {len(t_offers)} offer(s){flag}')
                backups = [o for o in offers if o.get('status') == 'Backup']
                selected = [o for o in offers if o.get('status') == 'Selected']
                print(f'\nSelected: {len(selected)}, Backup: {len(backups)}')
                # Price endings
                bad_endings = [o for o in offers if (o.get('promo_egp') or 0) % 10 not in (5, 9)]
                print(f'Offers with price NOT ending in 5 or 9: {len(bad_endings)}')
                if bad_endings:
                    for o in bad_endings:
                        print(f'  {o.get("title")}: {o.get("promo_egp")}')
            except Exception as e:
                print(f'Parse error: {e}')
                print(f'Raw preview: {out[:1000]}')
        break

# Check if PythonAnywhere service was called and succeeded
print('\n--- SERVICE + DOWNSTREAM ---')
for k in sorted(run_data.keys()):
    if any(x in k.lower() for x in ['10.', '11.', 'service', 'build', 'grade', 'review', 'telegram', 'send']):
        raw, err = get_output_json(k)
        if err:
            print(f'  ERROR {k}: {json.dumps(err)[:150]}')
        else:
            print(f'  OK: {k} => {json.dumps(raw, ensure_ascii=False)[:200]}')
