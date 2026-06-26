import requests, json, time, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']
conns = wf['connections']

# ── Print IDs and current connections for the 4 nodes ────────────────────────
targets = ['Fix Merged Data', 'Classify All Menu Items (Gemini)',
           'Parse Classification', 'Save Menu to DB']

print('=== NODE IDs ===')
for n in nodes:
    if n['name'] in targets:
        print(f'  {n["id"]}  {n["name"]}')

print('\n=== CURRENT CONNECTIONS FROM THESE NODES ===')
for name in targets:
    edges = conns.get(name, {}).get('main', [])
    flat  = [e['node'] for port in edges for e in port]
    print(f'  {name} → {flat}')

# ── Ensure all 3 edges exist ──────────────────────────────────────────────────
def ensure_edge(conns, src, dst):
    conns.setdefault(src, {'main': [[]]})
    main = conns[src]['main']
    if not main:
        main.append([])
    # Check port 0
    for e in main[0]:
        if e.get('node') == dst:
            return False   # already exists
    main[0].append({'node': dst, 'type': 'main', 'index': 0})
    return True

added = []
for src, dst in [
    ('Fix Merged Data',                   'Classify All Menu Items (Gemini)'),
    ('Classify All Menu Items (Gemini)',   'Parse Classification'),
    ('Parse Classification',              'Save Menu to DB'),          # ← the missing one
]:
    if ensure_edge(conns, src, dst):
        added.append(f'{src} → {dst}')
    else:
        print(f'  already wired: {src} → {dst}')

print(f'\nEdges added: {added}')

# ── Also fix Clear Old Menu Items → Save Menu to DB if it's the only path ────
# Save Menu to DB must still be reachable from Clear node (delete before insert)
# Existing chain: Lookup Provider UUID → Clear Old Menu Items → Save Menu to DB
# We're now ALSO connecting Parse Classification → Save Menu to DB
# n8n will wait for ALL incoming triggers before running a node by default;
# we actually want Save Menu to DB to run when BOTH Clear AND Parse Classification
# have finished. n8n doesn't natively have AND-join, but if we wire Parse Classification
# → Save Menu to DB, n8n will run Save Menu to DB once for each incoming trigger.
# Better approach: keep Clear → Save Menu to DB as primary; Parse Classification
# should not wire to Save Menu to DB — instead Save Menu to DB reads Parse Classification
# via expression $('Parse Classification').item.json (which works as long as it ran first
# in the same execution). Remove the direct edge and rely on expression reference only.
# This means wiring is: Clear Old Menu Items → Save Menu to DB (keeps delete-first order)
# and Save Menu to DB reads Parse Classification output via expression (already set).

# So actually we should NOT add Parse Classification → Save Menu to DB as a connection.
# Instead ensure: Clear Old Menu Items → Save Menu to DB (already exists presumably)
# and Parse Classification runs before Save Menu to DB via execution ordering.

# Let's check: does Clear Old Menu Items → Save Menu to DB exist?
clear_edges = [e['node'] for port in conns.get('Clear Old Menu Items',{}).get('main',[]) for e in port]
print(f'\nClear Old Menu Items → {clear_edges}')

if 'Save Menu to DB' not in clear_edges:
    ensure_edge(conns, 'Clear Old Menu Items', 'Save Menu to DB')
    print('✅ Added: Clear Old Menu Items → Save Menu to DB')

# Remove Parse Classification → Save Menu to DB if we added it (expression ref is enough)
# n8n runs all branches in parallel; Save Menu to DB expression $('Parse Classification')
# will resolve as long as they ran in the same execution tree from Fix Merged Data.
# BUT: Parse Classification is a separate branch — n8n expressions only resolve nodes
# that are direct ancestors. So we DO need the connection Parse Classification → Save Menu.
# However that creates a diamond: both Clear and Parse Classification feed Save Menu to DB,
# causing it to run TWICE (once per incoming branch).
#
# CORRECT SOLUTION: extend the classification chain to feed into Clear node instead:
# Fix Merged Data → Classify All Menu Items → Parse Classification → Clear Old Menu Items
#                                                                  → Save Menu to DB (reads classified)
# This way: classify runs, then clear, then save (single execution, correct order).
# Remove: Fix Merged Data → Lookup Provider UUID  (move lookup to after Parse Classification)
# Add:    Parse Classification → Lookup Provider UUID → Clear Old Menu Items → Save Menu to DB

# Let's implement this cleaner wiring:
# Remove Fix Merged Data → Lookup Provider UUID
fmd_main = conns.get('Fix Merged Data', {}).get('main', [[]])
if fmd_main and fmd_main[0]:
    before = len(fmd_main[0])
    fmd_main[0] = [e for e in fmd_main[0] if e['node'] != 'Lookup Provider UUID']
    if len(fmd_main[0]) < before:
        print('✅ Removed: Fix Merged Data → Lookup Provider UUID')

# Remove Parse Classification → Save Menu to DB (we added it above — remove it)
pc_main = conns.get('Parse Classification', {}).get('main', [[]])
if pc_main and pc_main[0]:
    pc_main[0] = [e for e in pc_main[0] if e['node'] != 'Save Menu to DB']
    print('✅ Removed Parse Classification → Save Menu to DB (using chain instead)')

# Add: Parse Classification → Lookup Provider UUID
if ensure_edge(conns, 'Parse Classification', 'Lookup Provider UUID'):
    print('✅ Added: Parse Classification → Lookup Provider UUID')

print('\n=== FINAL CONNECTION CHAIN ===')
chain = ['Fix Merged Data', 'Classify All Menu Items (Gemini)',
         'Parse Classification', 'Lookup Provider UUID',
         'Clear Old Menu Items', 'Save Menu to DB']
for i in range(len(chain)-1):
    src, dst = chain[i], chain[i+1]
    edges = [e['node'] for port in conns.get(src,{}).get('main',[]) for e in port]
    ok = '✅' if dst in edges else '❌'
    print(f'  {ok} {src} → {dst}')

# Also show Fix Merged Data full outputs
fmd_all = [e['node'] for port in conns.get('Fix Merged Data',{}).get('main',[]) for e in port]
print(f'\nFix Merged Data all outputs: {fmd_all}')

# ── PATCH + ACTIVATE ──────────────────────────────────────────────────────────
resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': conns,
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')
if resp.status_code != 200:
    print(resp.text[:400]); sys.exit(1)

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')
r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')

print('\n=== VERIFIED FINAL CHAIN ===')
conns3 = wf3['connections']
for src, dst in [
    ('Fix Merged Data',                  'Classify All Menu Items (Gemini)'),
    ('Fix Merged Data',                  '5. wein-recall — Embed Query'),
    ('Classify All Menu Items (Gemini)', 'Parse Classification'),
    ('Parse Classification',             'Lookup Provider UUID'),
    ('Lookup Provider UUID',             'Clear Old Menu Items'),
    ('Clear Old Menu Items',             'Save Menu to DB'),
]:
    edges = [e['node'] for port in conns3.get(src,{}).get('main',[]) for e in port]
    ok = '✅' if dst in edges else '❌'
    print(f'  {ok} {src} → {dst}')
