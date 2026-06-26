import requests, sys, json, time
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

def pg(pool, v, depth=0, visited=None):
    if visited is None: visited = set()
    if depth > 25: return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx in visited or idx >= len(pool): return v
        return pg(pool, pool[idx], depth+1, visited | {idx})
    return v

LATEST_KNOWN = 202

print('Polling for execution > 202...')
for attempt in range(40):
    r = s.get(f'{N8N_BASE}/rest/executions?workflowId=6v9BXm5uZpuJS8fd&limit=1')
    results = r.json().get('data', {}).get('results', [])
    if results:
        ex = results[0]
        eid = int(ex.get('id', 0))
        st = ex.get('status')
        if eid > LATEST_KNOWN:
            print(f'  [{attempt+1}] Exec {eid}: {st}')
            if st in ('success', 'error', 'crashed'):
                print(f'\nExecution {eid} finished: {st}')
                r2 = s.get(f'{N8N_BASE}/rest/executions/{eid}')
                full = r2.json()['data']
                pool = json.loads(full['data'])

                def pg2(v, d=0, vis=None):
                    if vis is None: vis = set()
                    if d > 25: return v
                    if isinstance(v, str) and v.isdigit():
                        idx = int(v)
                        if idx in vis or idx >= len(pool): return v
                        return pg2(pool[idx], d+1, vis | {idx})
                    return v

                run_data = pg2(pool[2]['runData'])

                # Node 8 analysis
                node8_key = '🏗️ 8. wein-creator — Build Full Offers'
                if node8_key in run_data:
                    nr = pg2(run_data[node8_key])
                    ri = pg2(nr[0])
                    d8 = pg2(ri.get('data', {}))
                    m8 = pg2(d8.get('main', [[]]))
                    if m8 and m8[0]:
                        e0 = pg2(m8[0])
                        e00 = pg2(e0[0] if isinstance(e0, list) else e0)
                        j8 = pg2(e00.get('json', {})) if isinstance(e00, dict) else {}
                        out = pg2(j8.get('output', j8.get('text', '')))

                        print(f'\nNode 8 output: {len(out) if isinstance(out, str) else "?"} chars')
                        if isinstance(out, str):
                            # Check for comma numbers
                            import re
                            comma_numbers = re.findall(r'\d{1,3},\d{3}', out[:2000])
                            print(f'Comma-formatted numbers (first 2000 chars): {comma_numbers[:5]}')

                            try:
                                offer_data = json.loads(out)
                                offers = offer_data.get('offers', [])
                                menu_items = offer_data.get('menu_items', [])
                                print(f'\n=== TASK 1 PASS/FAIL ===')
                                checks = [
                                    ('party_size present on ALL offers', all(o.get('party_size') for o in offers)),
                                    ('tier present on ALL offers', all(o.get('tier') for o in offers)),
                                    ('hook_type present on ALL offers', all(o.get('hook_type') for o in offers)),
                                    ('status present on ALL offers', all(o.get('status') for o in offers)),
                                    ('menu_items at top level (>=1 item)', len(menu_items) > 0),
                                    ('exactly 20 offers', len(offers) == 20),
                                    ('all 4 party sizes present', {'Solo','Couple','Group','Family'} == set(o.get('party_size') for o in offers if o.get('party_size'))),
                                    ('all 3 tiers present', {'Entry','Core','Premium'} == set(o.get('tier') for o in offers if o.get('tier'))),
                                    ('price endings all 5 or 9', all((o.get('promo_egp') or 1) % 10 in (5,9) for o in offers)),
                                ]
                                for label, result in checks:
                                    print(f'  {"PASS" if result else "FAIL"} — {label}')

                                # Details on failures
                                bad_ps = [o for o in offers if not o.get('party_size')]
                                bad_tier = [o for o in offers if not o.get('tier')]
                                bad_hook = [o for o in offers if not o.get('hook_type')]
                                bad_status = [o for o in offers if not o.get('status')]
                                bad_price = [o for o in offers if (o.get('promo_egp') or 1) % 10 not in (5,9)]

                                if bad_ps: print(f'  Offers missing party_size: ids {[o.get("id") for o in bad_ps]}')
                                if bad_tier: print(f'  Offers missing tier: ids {[o.get("id") for o in bad_tier]}')
                                if bad_hook: print(f'  Offers missing hook_type: ids {[o.get("id") for o in bad_hook]}')
                                if bad_status: print(f'  Offers missing status: ids {[o.get("id") for o in bad_status]}')
                                if bad_price: print(f'  Bad prices: {[(o.get("id"), o.get("promo_egp")) for o in bad_price]}')

                                print(f'\n  menu_items count: {len(menu_items)}')
                                if menu_items:
                                    print(f'  First item: {json.dumps(menu_items[0], ensure_ascii=False)[:120]}')

                                highest = max(offers, key=lambda o: o.get('promo_egp') or 0) if offers else {}
                                print(f'\n  Highest ticket: "{highest.get("title")}" — EGP {highest.get("promo_egp")}')

                            except json.JSONDecodeError as e:
                                print(f'JSON parse STILL FAILS: {e}')
                                print(f'Around error: {repr(out[max(0,e.pos-30):e.pos+30])}')

                # Build chain check
                print(f'\n=== TASK 2 — BUILD CHAIN ===')
                build_nodes = ['Code in JavaScript', 'Parse Offer Data', 'Generate Offer Files', 'Split Files to Binary']
                for target in build_nodes:
                    if target in run_data:
                        nr2 = pg2(run_data[target])
                        ri2 = pg2(nr2[0])
                        err2 = ri2.get('error')
                        if err2:
                            em2 = pg2(err2)
                            print(f'  ERROR: {target}')
                            if isinstance(em2, dict):
                                print(f'    message: {pg2(em2.get("message","?"))}')
                                print(f'    description: {pg2(em2.get("description",""))}')
                        else:
                            print(f'  OK: {target}')
                    else:
                        print(f'  NOT RAN: {target}')
                break
        else:
            print(f'  [{attempt+1}] Still exec {eid}: {st}')
    time.sleep(10)

print('\nDone.')
