import requests, sys, json, base64
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/204')
full = r.json()['data']
pool = json.loads(full['data'])
run_data = pool[5]

def res1(v):
    """Resolve one pool reference level."""
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx < len(pool):
            return pool[idx]
    return v

# Get Generate Offer Files output — files list
gof = res1(run_data.get('Generate Offer Files', ''))
run = res1(gof[0]) if isinstance(gof, list) else None
if not run: sys.exit('no run')
data = res1(run.get('data', {}))
main = res1(data.get('main', []))
e0 = res1(main[0]) if isinstance(main, list) else []
e00 = res1(e0[0]) if isinstance(e0, list) else {}
j = res1(e00.get('json', {}))
files_ref = res1(j.get('files', []))
files = files_ref if isinstance(files_ref, list) else []

print(f'Files count: {len(files)}')
for i, f_ref in enumerate(files):
    f = res1(f_ref)
    if not isinstance(f, dict):
        print(f'  File {i}: not a dict, ref={f_ref}')
        continue
    fname = res1(f.get('filename', ''))
    mime = res1(f.get('mime_type', ''))
    size = f.get('size', 0)
    b64_ref = f.get('content_base64', '')
    print(f'  File {i}: name={fname} mime={mime} size={size}')

    # Decode the JSON file
    if 'json' in str(mime).lower() or 'offer_data' in str(fname).lower():
        b64 = res1(b64_ref)
        if isinstance(b64, str):
            try:
                decoded = base64.b64decode(b64).decode('utf-8')
                offer_data = json.loads(decoded)
                offers = offer_data.get('offers', [])
                menu_items = offer_data.get('menu_items', [])
                print(f'\n  === offer_data.json contents ===')
                print(f'  offers count: {len(offers)}')
                print(f'  menu_items count: {len(menu_items)}')
                print(f'  Top-level keys: {list(offer_data.keys())}')
                if offers:
                    o0 = offers[0]
                    print(f'  First offer keys: {list(o0.keys())}')
                    print(f'  First offer: id={o0.get("id")} party_size={o0.get("party_size")} tier={o0.get("tier")} hook_type={o0.get("hook_type")} status={o0.get("status")} promo_egp={o0.get("promo_egp")}')

                    print(f'\n  TASK 1 CHECKS:')
                    checks = [
                        ('party_size present ALL', all(o.get('party_size') for o in offers)),
                        ('tier present ALL', all(o.get('tier') for o in offers)),
                        ('hook_type present ALL', all(o.get('hook_type') for o in offers)),
                        ('status present ALL', all(o.get('status') for o in offers)),
                        ('menu_items at top level', len(menu_items) > 0),
                        ('exactly 20 offers', len(offers) == 20),
                        ('all 4 party sizes', {'Solo','Couple','Group','Family'} == set(o.get('party_size') for o in offers)),
                        ('all 3 tiers', {'Entry','Core','Premium'} == set(o.get('tier') for o in offers if o.get('tier'))),
                        ('price endings 5/9', all((o.get('promo_egp') or 1) % 10 in (5,9) for o in offers)),
                    ]
                    for label, result in checks:
                        print(f'    {"PASS ✅" if result else "FAIL ❌"} — {label}')

                    highest = max(offers, key=lambda o: o.get('promo_egp') or 0)
                    print(f'\n  Highest: "{highest.get("title")}" — EGP {highest.get("promo_egp")} | {highest.get("party_size")} {highest.get("tier")}')

                    if menu_items:
                        print(f'\n  First 3 menu_items:')
                        for mi in menu_items[:3]:
                            print(f'    {mi.get("name")} | {mi.get("me_class")} | {mi.get("bundle_role")}')

                    print(f'\n  Matrix:')
                    for ps in ['Solo','Couple','Group','Family']:
                        row = []
                        for t in ['Entry','Core','Premium']:
                            m2 = [o for o in offers if o.get('party_size')==ps and o.get('tier')==t]
                            row.append(f'{t[0]}{"✅" if m2 else "❌"}')
                        print(f'    {ps}: {" ".join(row)}')

            except Exception as e:
                print(f'  Decode error: {e}')
        else:
            print(f'  b64 not string: {type(b64)}, ref={b64_ref}')
