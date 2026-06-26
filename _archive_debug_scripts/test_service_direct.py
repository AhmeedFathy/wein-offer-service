import requests, sys, json, base64, io
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

# Get exec 204 node 8 raw output
r = s.get(f'{N8N_BASE}/rest/executions/204')
full = r.json()['data']
pool = json.loads(full['data'])
run_data = pool[5]

def res(v, depth=0, seen=None):
    if seen is None: seen = set()
    if depth > 6: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx in seen or idx >= len(pool): return v
        return res(pool[idx], depth+1, seen | {idx})
    return v

# Get node 8 output text
gof = run_data.get('🏗️ 8. wein-creator — Build Full Offers','')
gof = res(gof)
if isinstance(gof, list) and gof:
    ri = res(gof[0])
    if isinstance(ri, dict):
        d = res(ri.get('data',{}))
        if isinstance(d, dict):
            m = res(d.get('main',[]))
            if isinstance(m, list) and m:
                e0 = res(m[0])
                if isinstance(e0, list) and e0:
                    e00 = res(e0[0])
                    if isinstance(e00, dict):
                        j = res(e00.get('json',{}))
                        if isinstance(j, dict):
                            out = res(j.get('text', j.get('output','')))
                            if isinstance(out, str) and len(out) > 100:
                                print(f'Node 8 output: {len(out)} chars')

                                # Apply enrichment logic in Python
                                import re
                                clean = out.strip()
                                if clean.startswith('```'):
                                    lines = clean.split('\n')
                                    clean = '\n'.join(lines[1:])
                                    if clean.endswith('```'):
                                        clean = clean[:-3].strip()
                                # Strip thousand separator commas
                                clean = re.sub(r'(\d),(?=\d{3}(?:\D|$))', r'\1', clean)

                                offer_data = json.loads(clean)
                                offers = offer_data.get('offers', [])
                                print(f'Raw offers: {len(offers)}')
                                print(f'First offer keys: {list(offers[0].keys()) if offers else []}')
                                print(f'party_size in first offer: {offers[0].get("party_size") if offers else "N/A"}')

                                # Apply Python equivalent of the enrichment
                                PARTY_SIZE_BY_ID = {
                                    1:'Solo',2:'Solo',3:'Solo',
                                    4:'Couple',5:'Couple',6:'Couple',
                                    7:'Group',8:'Group',9:'Group',
                                    10:'Family',11:'Family',12:'Family'
                                }
                                TIER_BY_ID = {
                                    1:'Entry',2:'Core',3:'Premium',
                                    4:'Entry',5:'Core',6:'Premium',
                                    7:'Entry',8:'Core',9:'Premium',
                                    10:'Entry',11:'Core',12:'Premium'
                                }
                                HOOK_MAP = {
                                    'Solo-Entry':'Zero-Price Effect','Solo-Core':'Anchor Pricing','Solo-Premium':'Loss Aversion',
                                    'Couple-Entry':'Experience Frame','Couple-Core':'Decoy Effect','Couple-Premium':'Reciprocity',
                                    'Group-Entry':'Per-Person Anchor','Group-Core':'Compromise Effect','Group-Premium':'Sharing Utility',
                                    'Family-Entry':'Zero-Price Effect','Family-Core':'Mental Accounting','Family-Premium':'Host Pride',
                                }
                                BACKUP_SIZES = ['Solo','Couple','Group','Family','Solo','Couple','Group','Family']
                                BACKUP_TIERS = ['Entry','Core','Premium','Entry','Core','Premium','Entry','Core']

                                for idx, o in enumerate(offers):
                                    oid = o.get('id', idx+1)
                                    ps = o.get('party_size')
                                    tier = o.get('tier')
                                    if not ps or ps not in ['Solo','Couple','Group','Family']:
                                        ps = PARTY_SIZE_BY_ID.get(oid, BACKUP_SIZES[(oid-13) % 8] if oid > 12 else 'Solo')
                                        o['party_size'] = ps
                                    if not tier or tier not in ['Entry','Core','Premium']:
                                        tier = TIER_BY_ID.get(oid, BACKUP_TIERS[(oid-13) % 8] if oid > 12 else 'Entry')
                                        o['tier'] = tier
                                    if not o.get('status'):
                                        o['status'] = 'Selected' if oid <= 12 else 'Backup'
                                    if not o.get('hook_type'):
                                        o['hook_type'] = HOOK_MAP.get(f'{ps}-{tier}', 'Zero-Price Effect')
                                    promo = o.get('promo_egp', 0) or 0
                                    if promo and promo % 10 not in (5, 9):
                                        rem = promo % 10
                                        o['promo_egp'] = promo + (5 - rem if rem < 5 else 9 - rem if rem < 9 else 9 + (10 - rem))

                                # Build menu_items if missing
                                if not offer_data.get('menu_items'):
                                    seen_names = set()
                                    items = []
                                    for o in offers:
                                        for item in o.get('items', []):
                                            name = item.get('name','')
                                            if name and name.lower() not in seen_names:
                                                seen_names.add(name.lower())
                                                items.append({
                                                    'name': name,
                                                    'category': item.get('category',''),
                                                    'price': item.get('price', 0),
                                                    'currency': 'EGP',
                                                    'me_class': item.get('me_class','Star'),
                                                    'bundle_role': item.get('bundle_role','Hero'),
                                                    'eligible': True
                                                })
                                    offer_data['menu_items'] = items

                                print(f'\nAfter Python enrichment:')
                                print(f'Offers 1-4 party_size: {[o.get("party_size") for o in offers[:4]]}')
                                print(f'Offers 1-4 tier: {[o.get("tier") for o in offers[:4]]}')
                                print(f'menu_items count: {len(offer_data["menu_items"])}')

                                # Test call to PythonAnywhere with enriched data
                                print(f'\nCalling PythonAnywhere with enriched data...')
                                resp = requests.post(
                                    'https://wein.pythonanywhere.com/generate-offer-files',
                                    json={'provider': 'Almayass', 'vertical': 'Dining', 'offer_data': offer_data},
                                    timeout=60
                                )
                                print(f'Status: {resp.status_code}')
                                if resp.status_code == 200:
                                    result = resp.json()
                                    files = result.get('files', [])
                                    print(f'Files returned: {len(files)}')
                                    for f in files:
                                        print(f'  {f.get("filename")} ({f.get("size")} bytes)')
                                    # Decode first XLSX to check party_size
                                    try:
                                        import openpyxl
                                        for f in files:
                                            if 'Template' in f.get('filename',''):
                                                b = base64.b64decode(f['content_base64'])
                                                wb = openpyxl.load_workbook(io.BytesIO(b))
                                                ws = wb['Offers']
                                                print(f'\nOffers sheet (first 5 data rows):')
                                                for row_idx, row in enumerate(ws.iter_rows(min_row=3, max_row=7, values_only=True)):
                                                    vals = [str(c)[:25] if c else '' for c in list(row)[1:6]]
                                                    print(f'  Row {row_idx+3}: {vals}')
                                                break
                                    except Exception as e:
                                        print(f'XLSX decode error: {e}')
                                else:
                                    print(f'Error: {resp.text[:300]}')
