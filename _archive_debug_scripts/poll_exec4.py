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

LATEST_KNOWN = 203
print('Polling for execution > 203...')

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
                print(f'\nExecution {eid}: {st}')
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

                # Get Parse Offer Data output (post-enrichment)
                pod_key = 'Parse Offer Data'
                if pod_key in run_data:
                    nr = pg2(run_data[pod_key])
                    ri = pg2(nr[0])
                    err = ri.get('error')
                    if err:
                        em = pg2(err)
                        print(f'Parse Offer Data ERROR:')
                        if isinstance(em, dict):
                            print(f'  message: {pg2(em.get("message","?"))}')
                            print(f'  description: {pg2(em.get("description",""))}')
                    else:
                        d = pg2(ri.get('data', {}))
                        m = pg2(d.get('main', [[]]))
                        if m and m[0]:
                            e0 = pg2(m[0])
                            e00 = pg2(e0[0] if isinstance(e0, list) else e0)
                            j = pg2(e00.get('json', {})) if isinstance(e00, dict) else {}
                            offer_data_ref = j.get('offer_data')
                            offer_data = pg2(offer_data_ref) if isinstance(offer_data_ref, str) else offer_data_ref
                            offers = offer_data.get('offers', []) if isinstance(offer_data, dict) else []
                            menu_items = offer_data.get('menu_items', []) if isinstance(offer_data, dict) else []

                            print(f'\n=== TASK 1 FINAL PASS/FAIL (after enrichment) ===')
                            checks = [
                                ('party_size present on ALL 20 offers', all(o.get('party_size') for o in offers) and len(offers)==20),
                                ('tier present on ALL 20 offers', all(o.get('tier') for o in offers) and len(offers)==20),
                                ('hook_type present on ALL 20 offers', all(o.get('hook_type') for o in offers) and len(offers)==20),
                                ('status present on ALL 20 offers', all(o.get('status') for o in offers) and len(offers)==20),
                                ('menu_items at top level (>=1 item)', len(menu_items) > 0),
                                ('exactly 20 offers', len(offers) == 20),
                                ('all 4 party sizes: Solo/Couple/Group/Family', {'Solo','Couple','Group','Family'} == set(o.get('party_size') for o in offers)),
                                ('all 3 tiers: Entry/Core/Premium', {'Entry','Core','Premium'} == set(o.get('tier') for o in offers if o.get('tier'))),
                                ('all price endings 5 or 9', all((o.get('promo_egp') or 1) % 10 in (5,9) for o in offers)),
                            ]
                            all_pass = True
                            for label, result in checks:
                                mark = 'PASS' if result else 'FAIL'
                                if not result: all_pass = False
                                print(f'  {mark} — {label}')

                            print(f'\n  menu_items count: {len(menu_items)}')
                            if menu_items:
                                print(f'  First 3 items: {[mi.get("name") for mi in menu_items[:3]]}')

                            # Matrix
                            print('\n  4×3 Matrix:')
                            for ps in ['Solo','Couple','Group','Family']:
                                row = []
                                for t in ['Entry','Core','Premium']:
                                    m2 = [o for o in offers if o.get('party_size')==ps and o.get('tier')==t]
                                    row.append(f'{t[0]}{"✅" if m2 else "❌"}')
                                print(f'    {ps}: {" ".join(row)}')
                            backups = [o for o in offers if o.get('status')=='Backup']
                            print(f'  Backups: {len(backups)}')

                            highest = max(offers, key=lambda o: o.get('promo_egp') or 0) if offers else {}
                            print(f'\n  Highest ticket: "{highest.get("title")}" — EGP {highest.get("promo_egp")}')

                            if all_pass:
                                print('\n  ALL CHECKS PASS ✅')
                            else:
                                # Sample bad offers
                                bad_price = [o for o in offers if (o.get('promo_egp') or 1) % 10 not in (5,9)]
                                if bad_price:
                                    print(f'  Bad prices: {[(o.get("id"), o.get("promo_egp")) for o in bad_price]}')

                # Build chain
                print('\n=== TASK 2 — BUILD CHAIN ===')
                for target in ['Code in JavaScript', 'Parse Offer Data', 'Generate Offer Files', 'Split Files to Binary']:
                    if target in run_data:
                        nr2 = pg2(run_data[target])
                        ri2 = pg2(nr2[0])
                        err2 = ri2.get('error')
                        if err2:
                            em2 = pg2(err2)
                            msg2 = pg2(em2.get('message','?')) if isinstance(em2, dict) else str(em2)
                            print(f'  ERROR: {target}: {msg2}')
                        else:
                            print(f'  OK: {target}')
                    else:
                        print(f'  NOT RAN: {target}')
                break
        else:
            print(f'  [{attempt+1}] Still exec {eid}: {st}')
    time.sleep(10)

print('\nDone.')
