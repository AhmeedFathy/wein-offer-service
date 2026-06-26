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

def get_exec(eid):
    r = s.get(f'{N8N_BASE}/rest/executions/{eid}')
    full = r.json()['data']
    pool = json.loads(full['data'])
    run_data = pg(pool, pool[2]['runData'])
    return run_data, pool, full.get('status'), full.get('stoppedAt')

# Check exec 201 for build chain nodes
print('=== EXEC 201 — BUILD CHAIN NODES ===')
run_data, pool, status, stopped = get_exec(201)
build_nodes = ['Code in JavaScript', 'Parse Offer Data', 'Generate Offer Files', 'Split Files to Binary']
all_nodes = sorted(run_data.keys())
print(f'All nodes in exec 201 ({len(all_nodes)}):')
for k in all_nodes:
    print(f'  {k}')

print('\nBuild chain status:')
for target in build_nodes:
    if target in run_data:
        node_raw = pg(pool, run_data[target])
        run_item = pg(pool, node_raw[0])
        err = run_item.get('error')
        if err:
            em = pg(pool, err)
            print(f'  ERROR: {target}')
            print(f'    {json.dumps(em, ensure_ascii=False)[:400]}')
        else:
            d = pg(pool, run_item.get('data', {}))
            m = pg(pool, d.get('main', [[]]))
            if m and m[0]:
                e0 = pg(pool, m[0])
                if e0:
                    e00 = pg(pool, e0[0] if isinstance(e0, list) else e0)
                    j = pg(pool, e00.get('json', {})) if isinstance(e00, dict) else {}
                    print(f'  OK: {target} => {json.dumps(j, ensure_ascii=False)[:200]}')
                else:
                    print(f'  OK (empty output): {target}')
            else:
                print(f'  OK (no main output): {target}')
    else:
        print(f'  NOT RAN: {target}')

# Now poll for the new execution (202+)
print('\n=== POLLING FOR NEW EXECUTION ===')
for attempt in range(36):
    r2 = s.get(f'{N8N_BASE}/rest/executions?workflowId=6v9BXm5uZpuJS8fd&limit=1')
    results = r2.json().get('data', {}).get('results', [])
    if results:
        ex = results[0]
        eid = ex.get('id')
        st = ex.get('status')
        started = ex.get('startedAt', '')
        if int(eid) > 201:
            print(f'  [{attempt+1}] New exec {eid}: status={st}, started={started}')
            if st in ('success', 'error', 'crashed'):
                print(f'\nNew execution {eid} finished: {st}')
                # Analyze it
                run_data2, pool2, _, _ = get_exec(eid)
                print(f'Nodes that ran: {len(run_data2)}')

                # Check node 8 output fields
                node8_key = '🏗️ 8. wein-creator — Build Full Offers'
                if node8_key in run_data2:
                    nr = pg(pool2, run_data2[node8_key])
                    ri = pg(pool2, nr[0])
                    d = pg(pool2, ri.get('data', {}))
                    m = pg(pool2, d.get('main', [[]]))
                    if m and m[0]:
                        e0 = pg(pool2, m[0])
                        e00 = pg(pool2, e0[0] if isinstance(e0, list) else e0)
                        j = pg(pool2, e00.get('json', {})) if isinstance(e00, dict) else {}
                        out = pg(pool2, j.get('output', j.get('text', '')))
                        if isinstance(out, str) and len(out) > 100:
                            try:
                                offer_data = json.loads(out)
                                offers = offer_data.get('offers', [])
                                menu_items = offer_data.get('menu_items', [])
                                print(f'\n=== NODE 8 ANALYSIS ===')
                                print(f'Total offers: {len(offers)}')
                                print(f'menu_items at top level: {"menu_items" in offer_data} ({len(menu_items)} items)')

                                # Check mandatory fields
                                checks = {
                                    'party_size present': all(o.get('party_size') for o in offers),
                                    'tier present': all(o.get('tier') for o in offers),
                                    'hook_type present': all(o.get('hook_type') for o in offers),
                                    'status present': all(o.get('status') for o in offers),
                                    'price ending ok': all((o.get('promo_egp') or 0) % 10 in (5, 9) for o in offers),
                                }
                                for check, result in checks.items():
                                    print(f'  {"✅" if result else "❌"} {check}')

                                party_sizes = set(o.get('party_size') for o in offers)
                                tiers = set(o.get('tier') for o in offers)
                                print(f'  Party sizes: {sorted(x for x in party_sizes if x)}')
                                print(f'  Tiers: {sorted(x for x in tiers if x)}')

                                # Violations
                                bad_price = [o for o in offers if (o.get('promo_egp') or 0) % 10 not in (5, 9)]
                                if bad_price:
                                    print(f'  Price violations: {[(o.get("title","?")[:40], o.get("promo_egp")) for o in bad_price]}')

                                missing_ps = [o for o in offers if not o.get('party_size')]
                                missing_tier = [o for o in offers if not o.get('tier')]
                                if missing_ps:
                                    print(f'  Offers missing party_size: {[o.get("id") for o in missing_ps]}')
                                if missing_tier:
                                    print(f'  Offers missing tier: {[o.get("id") for o in missing_tier]}')

                                # Highest ticket
                                if offers:
                                    highest = max(offers, key=lambda o: o.get('promo_egp', 0) or 0)
                                    print(f'  Highest: "{highest.get("title")}" EGP {highest.get("promo_egp")}')

                                # Matrix
                                print('\n  Matrix:')
                                selected = [o for o in offers if o.get('status') == 'Selected']
                                backups = [o for o in offers if o.get('status') == 'Backup']
                                for ps in ['Solo','Couple','Group','Family']:
                                    row = []
                                    for t in ['Entry','Core','Premium']:
                                        m2 = [o for o in offers if o.get('party_size')==ps and o.get('tier')==t]
                                        row.append(f'{t[0]}:{"✅" if m2 else "❌"}')
                                    print(f'    {ps}: {" ".join(row)}')
                                print(f'  Selected={len(selected)}, Backup={len(backups)}')

                                # menu_items sample
                                if menu_items:
                                    print(f'\n  First 3 menu items:')
                                    for mi in menu_items[:3]:
                                        print(f'    {json.dumps(mi, ensure_ascii=False)[:120]}')

                            except Exception as e:
                                print(f'Parse error: {e}')
                                print(out[:500])

                # Check build chain
                print('\n=== BUILD CHAIN IN NEW EXEC ===')
                for target in build_nodes + ['Code in JavaScript']:
                    if target in run_data2:
                        nr2 = pg(pool2, run_data2[target])
                        ri2 = pg(pool2, nr2[0])
                        err2 = ri2.get('error')
                        if err2:
                            em2 = pg(pool2, err2)
                            print(f'  ERROR: {target}: {json.dumps(em2, ensure_ascii=False)[:300]}')
                        else:
                            d2 = pg(pool2, ri2.get('data', {}))
                            m2 = pg(pool2, d2.get('main', [[]]))
                            if m2 and m2[0]:
                                e02 = pg(pool2, m2[0])
                                if e02:
                                    e002 = pg(pool2, e02[0] if isinstance(e02, list) else e02)
                                    j2 = pg(pool2, e002.get('json', {})) if isinstance(e002, dict) else {}
                                    print(f'  OK: {target} => {json.dumps(j2, ensure_ascii=False)[:200]}')
                                else:
                                    print(f'  OK (empty): {target}')
                            else:
                                print(f'  OK (no main): {target}')
                    else:
                        print(f'  NOT RAN: {target}')
                break
        else:
            print(f'  [{attempt+1}] Still exec {eid}: {st}')
    time.sleep(10)
