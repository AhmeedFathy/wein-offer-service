import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/201')
full = r.json()['data']
data_field = json.loads(full['data'])
pool = data_field

def pg(v, depth=0, visited=None):
    if visited is None:
        visited = set()
    if depth > 30:
        return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx in visited or idx >= len(pool):
            return v
        visited = visited | {idx}
        return pg(pool[idx], depth+1, visited)
    return v

run_data = pg(pool[2]['runData'])

# Get node 8 output text
node8_raw = pg(run_data['🏗️ 8. wein-creator — Build Full Offers'])
run = pg(node8_raw[0])
data = pg(run['data'])
main = pg(data['main'])
item0 = pg(main[0])
entry = pg(item0[0])
j = pg(entry['json'])
out = pg(j.get('output', j.get('text', '')))

offer_data = json.loads(out)
offers = offer_data.get('offers', [])
menu_items = offer_data.get('menu_items', [])

print('=== FULL ANALYSIS ===')
print(f'Total offers: {len(offers)}')
print(f'menu_items count: {len(menu_items)}')
print(f'menu_items present at top level: {"menu_items" in offer_data}')

# Party size × tier matrix
print('\nMatrix (Selected only):')
selected = [o for o in offers if o.get('status') == 'Selected']
backups = [o for o in offers if o.get('status') == 'Backup']
for ps in ['Solo','Couple','Group','Family']:
    row = []
    for t in ['Entry','Core','Premium']:
        matches = [o for o in selected if o.get('party_size')==ps and o.get('tier')==t]
        row.append(f'{t}:{"OK" if matches else "MISSING"}')
    print(f'  {ps}: {", ".join(row)}')
print(f'Selected: {len(selected)} | Backups: {len(backups)}')

# Highest ticket
if offers:
    highest = max(offers, key=lambda o: o.get('promo_egp', 0) or 0)
    print(f'\nHighest ticket: "{highest.get("title")}"')
    print(f'  promo_egp: EGP {highest.get("promo_egp","?")} | party_size: {highest.get("party_size")} | tier: {highest.get("tier")}')

# Price ending check
bad = [o for o in offers if (o.get('promo_egp') or 0) % 10 not in (5, 9)]
print(f'\nPrice ending violations (not 5 or 9): {len(bad)}')
if bad:
    for o in bad:
        print(f'  {o.get("title")}: EGP {o.get("promo_egp")}')

# Real Almayass items
known = ['kibbeh','hummus','fattoush','mezze','shawarma','sambousek','labne','tabouleh','baklava','knafeh','kafta','falafel','loubieh','arak','grape leaves']
out_lower = out.lower()
found = [i for i in known if i in out_lower]
print(f'\nReal Almayass menu items detected: {found}')

# Menu items sample
print(f'\nFirst 5 menu items:')
for mi in menu_items[:5]:
    print(f'  {mi.get("name")} | {mi.get("me_class")} | {mi.get("bundle_role")} | EGP {mi.get("price")}')

# All offer titles
print(f'\nAll {len(offers)} offers:')
for o in offers:
    status = o.get('status','?')
    print(f'  [{o.get("id"):2d}] {o.get("party_size")} {o.get("tier")} | EGP {o.get("promo_egp"):>6} | {status[:3]} | {o.get("title")}')

# Now check what happened AFTER node 8 — did it reach Flask service?
print('\n=== DOWNSTREAM NODES ===')
for k in sorted(run_data.keys()):
    # Look for nodes after node 8 (grade, service call, Telegram)
    if any(x in k for x in ['9', '10', '11', '12', '13', '14', 'Grade', 'Review', 'Service', 'Telegram', 'Send', 'Flask', 'Build']):
        try:
            node_raw = pg(run_data[k])
            run_item = pg(node_raw[0])
            err = run_item.get('error')
            if err:
                print(f'  ERROR: {k}')
                em = err if isinstance(err, dict) else {'msg': str(err)}
                print(f'    {json.dumps(em)[:200]}')
            else:
                d2 = pg(run_item.get('data', {}))
                m2 = pg(d2.get('main', [[]]))
                if m2 and m2[0]:
                    e2 = pg(m2[0])
                    if e2:
                        e2_0 = pg(e2[0]) if isinstance(e2, list) else e2
                        j2 = pg(e2_0.get('json', {})) if isinstance(e2_0, dict) else {}
                        print(f'  OK: {k} => {json.dumps(j2, ensure_ascii=False)[:150]}')
                    else:
                        print(f'  OK (no output): {k}')
                else:
                    print(f'  OK (no main): {k}')
        except Exception as e:
            print(f'  SKIP: {k} ({e})')
