import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

# Get execution 201 (our latest run)
r = s.get(f'{N8N_BASE}/rest/executions/201')
full = r.json().get('data', {})
status = full.get('status')
print(f'Execution 201 status: {status}')
print(f'Started: {full.get("startedAt")} | Stopped: {full.get("stoppedAt")}')

run_data = full.get('data', {}).get('resultData', {}).get('runData', {})
print(f'\nNodes that ran ({len(run_data)} total):')
for k in sorted(run_data.keys()):
    runs = run_data[k]
    for run in runs:
        err = run.get('error')
        if err:
            print(f'  ERROR: {k} -> {json.dumps(err)[:200]}')
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
                # The LLM output is in 'output' or 'text' key
                out = raw.get('output', raw.get('text', ''))
                print(f'Node: {k}')
                print(f'Output length: {len(out)} chars')
                print(f'Output preview (first 2000):')
                print(out[:2000])
                # Try to parse as JSON
                try:
                    # Strip markdown fences if present
                    clean = out.strip()
                    if clean.startswith('```'):
                        clean = clean.split('\n', 1)[1]
                        clean = clean.rsplit('```', 1)[0]
                    offer_data = json.loads(clean)
                    offers = offer_data.get('offers', [])
                    print(f'\n=== ANALYSIS ===')
                    print(f'Total offers: {len(offers)}')
                    party_sizes = set(o.get("party_size") for o in offers)
                    tiers = set(o.get("tier") for o in offers)
                    print(f'Party sizes present: {party_sizes}')
                    print(f'Tiers present: {tiers}')
                    print(f'menu_items at top level: {"menu_items" in offer_data}')
                    menu_items = offer_data.get('menu_items', [])
                    print(f'menu_items count: {len(menu_items)}')
                    if menu_items:
                        print(f'First menu item: {json.dumps(menu_items[0])}')
                    # Highest ticket
                    if offers:
                        highest = max(offers, key=lambda o: o.get('promo_egp', 0) or o.get('promo_price', 0) or 0)
                        print(f'Highest ticket offer: {highest.get("title")} — EGP {highest.get("promo_egp", highest.get("promo_price", "?"))}')
                    # Check for real Almayass items
                    known_almayass = ['kibbeh', 'hummus', 'fattoush', 'mezze', 'shawarma', 'sambousek', 'labne', 'tabouleh', 'baklava', 'knafeh']
                    out_lower = out.lower()
                    found_items = [i for i in known_almayass if i in out_lower]
                    print(f'Real Almayass items detected: {found_items}')
                except Exception as e:
                    print(f'Could not parse as JSON: {e}')
        break

# Also check the PythonAnywhere service output (node 10)
print('\n--- SERVICE CALL OUTPUT (node 10/11) ---')
for k in run_data:
    if any(x in k.lower() for x in ['service', 'build', 'flask', 'python']):
        for run in run_data[k]:
            outputs = run.get('data', {}).get('main', [[]])
            if outputs and outputs[0]:
                raw = outputs[0][0].get('json', {})
                print(f'Node: {k}')
                print(f'Keys: {list(raw.keys())}')
                print(json.dumps(raw, indent=2)[:500])
