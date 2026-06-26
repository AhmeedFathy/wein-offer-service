"""
Incremental menu sync — full implementation:
  - Disconnect Clear Old Menu Items
  - Add: Has Existing Menu Items? (IF) → two branches
  - Branch TRUE  → Read Existing Items from DB → Parse Offer Data
  - Branch FALSE → Build Classification Request → Classify → Parse Classification → Prepare Upsert → Save Menu to DB
  - Add: Prepare Menu Items for Upsert (Code node, dedup)
  - Update: Save Menu to DB → upsert with ignore-duplicates
  - Update: Parse Offer Data priority chain
"""
import requests, json, time, sys, uuid as _uuid
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'
SB_URL   = 'https://iwyufqeqtjbbojunomgq.supabase.co'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']
conns = wf['connections']
existing_names = {n['name']: n for n in nodes}

# ─────────────────────────────────────────────────────────────────
# helpers
# ─────────────────────────────────────────────────────────────────
def add_edge(conns, src, dst, port=0):
    conns.setdefault(src, {'main': [[]]})
    main = conns[src]['main']
    while len(main) <= port:
        main.append([])
    for e in main[port]:
        if e.get('node') == dst:
            return False
    main[port].append({'node': dst, 'type': 'main', 'index': 0})
    return True

def remove_edge(conns, src, dst):
    removed = 0
    for port in conns.get(src, {}).get('main', []):
        before = len(port)
        port[:] = [e for e in port if e.get('node') != dst]
        removed += before - len(port)
    return removed

def pos_of(name):
    n = existing_names.get(name, {})
    return n.get('position', [0, 0])

# ─────────────────────────────────────────────────────────────────
# STEP 2 — Disconnect Clear Old Menu Items
# ─────────────────────────────────────────────────────────────────
CLEAR_NODE = 'Clear Old Menu Items'

# Remove: Lookup Provider UUID → Clear Old Menu Items
n1 = remove_edge(conns, 'Lookup Provider UUID', CLEAR_NODE)
# Remove: Clear Old Menu Items → Save Menu to DB
n2 = remove_edge(conns, CLEAR_NODE, 'Save Menu to DB')
print(f'Disconnected {CLEAR_NODE}: removed {n1+n2} edges')

# ─────────────────────────────────────────────────────────────────
# STEP 3 — Add "Has Existing Menu Items?" IF node
# ─────────────────────────────────────────────────────────────────
NODE_IF   = 'Has Existing Menu Items?'
NODE_READ = 'Read Existing Items from DB'
NODE_PREP = 'Prepare Menu Items for Upsert'

lookup_pos = pos_of('Lookup Provider UUID')
if_pos     = [lookup_pos[0] + 280, lookup_pos[1]]
read_pos   = [if_pos[0] + 280, if_pos[1] - 100]
build_pos  = pos_of('Build Classification Request')

SB_KEY = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
          'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXVmcWVxdGpiYm9qdW5vbWdxIiwicm9sZSI6'
          'InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2NDYyNiwiZXhwIjoyMDk2MjQwNjI2fQ.'
          'LLT4142UHWlfNnaMQaa_DRe44o2lWzOUavVvR3ceyoA')

if NODE_IF not in existing_names:
    nodes.append({
        'id': str(_uuid.uuid4()),
        'name': NODE_IF,
        'type': 'n8n-nodes-base.if',
        'typeVersion': 2,
        'position': if_pos,
        'parameters': {
            'conditions': {
                'options': {'caseSensitive': True, 'leftValue': '', 'typeValidation': 'strict'},
                'conditions': [{
                    'id': str(_uuid.uuid4()),
                    'leftValue': "={{ $('Lookup Provider UUID').item.json.id }}",
                    'rightValue': '',
                    'operator': {'type': 'string', 'operation': 'notEmpty'}
                }],
                'combinator': 'and'
            },
            # We do an HTTP check inside an expression — easier to use a Code node approach,
            # but n8n IF node can't do HTTP. Instead we use the IF to check if we SHOULD
            # check the DB — always true when UUID exists, but we want to check DB count.
            # Better: keep IF node comparing against the result of an HTTP check node.
        }
    })
    print(f'NOTE: IF node needs to evaluate HTTP result — replacing with HTTP check + IF pattern')

# Actually: do a real HTTP GET to check if items exist, THEN branch in IF
# Better architecture:
#   Lookup Provider UUID
#       ↓
#   Check Existing Items Count (HTTP GET, returns count)
#       ↓
#   Has Existing Menu Items? (IF: count > 0)
#       TRUE port 0 → Read Existing Items from DB
#       FALSE port 1 → Build Classification Request

NODE_CHECK = 'Check Existing Items Count'
check_pos  = [lookup_pos[0] + 280, lookup_pos[1]]
if_pos2    = [lookup_pos[0] + 560, lookup_pos[1]]
read_pos2  = [if_pos2[0] + 280, if_pos2[1] - 120]

# Remove the incorrectly-added IF node if it was added above
nodes[:] = [n for n in nodes if n['name'] != NODE_IF]
existing_names = {n['name']: n for n in nodes}

if NODE_CHECK not in existing_names:
    nodes.append({
        'id': str(_uuid.uuid4()),
        'name': NODE_CHECK,
        'type': 'n8n-nodes-base.httpRequest',
        'typeVersion': 4.2,
        'position': check_pos,
        'parameters': {
            'method': 'GET',
            'url': f'{SB_URL}/rest/v1/wein_menu_items',
            'sendQuery': True,
            'queryParameters': {'parameters': [
                {'name': 'provider_id', 'value': "=eq.={{ $('Lookup Provider UUID').item.json.id }}"},
                {'name': 'select',      'value': 'id'},
                {'name': 'limit',       'value': '1'},
            ]},
            'sendHeaders': True,
            'headerParameters': {'parameters': [
                {'name': 'apikey',        'value': SB_KEY},
                {'name': 'Authorization', 'value': f'Bearer {SB_KEY}'},
            ]},
            'options': {'response': {'response': {'responseFormat': 'json'}}}
        }
    })
    print(f'Added: {NODE_CHECK}')
    existing_names = {n['name']: n for n in nodes}

# ─────────────────────────────────────────────────────────────────
# STEP 3b — IF node: branch on whether count > 0
# ─────────────────────────────────────────────────────────────────
IF_CODE = """
// Check Existing Items Count returns an array.
// If it has >= 1 element, this provider has menu items in DB.
const items = $input.all();
const hasItems = Array.isArray(items) && items.length > 0 && items[0].json && items[0].json.id;
return [{ json: { has_existing: hasItems, count: items.length } }];
""".strip()

NODE_IF_CODE = 'Has Existing Menu Items?'
if NODE_IF_CODE not in existing_names:
    nodes.append({
        'id': str(_uuid.uuid4()),
        'name': NODE_IF_CODE,
        'type': 'n8n-nodes-base.code',
        'typeVersion': 2,
        'position': if_pos2,
        'parameters': {'jsCode': IF_CODE, 'mode': 'runOnceForAllItems'}
    })
    print(f'Added: {NODE_IF_CODE}')
    existing_names = {n['name']: n for n in nodes}

# Now add actual IF branching node after the code node
NODE_IF_BRANCH = 'Branch on Existing Items'
branch_pos     = [if_pos2[0] + 280, if_pos2[1]]
if NODE_IF_BRANCH not in existing_names:
    nodes.append({
        'id': str(_uuid.uuid4()),
        'name': NODE_IF_BRANCH,
        'type': 'n8n-nodes-base.if',
        'typeVersion': 2,
        'position': branch_pos,
        'parameters': {
            'conditions': {
                'options': {'caseSensitive': True, 'leftValue': '', 'typeValidation': 'strict'},
                'conditions': [{
                    'id': str(_uuid.uuid4()),
                    'leftValue': '={{ $json.has_existing }}',
                    'rightValue': True,
                    'operator': {'type': 'boolean', 'operation': 'true'}
                }],
                'combinator': 'and'
            }
        }
    })
    print(f'Added: {NODE_IF_BRANCH}')
    existing_names = {n['name']: n for n in nodes}

# ─────────────────────────────────────────────────────────────────
# STEP 4 — Read Existing Items from DB (TRUE branch)
# ─────────────────────────────────────────────────────────────────
read_pos3 = [branch_pos[0] + 280, branch_pos[1] - 120]
if NODE_READ not in existing_names:
    nodes.append({
        'id': str(_uuid.uuid4()),
        'name': NODE_READ,
        'type': 'n8n-nodes-base.httpRequest',
        'typeVersion': 4.2,
        'position': read_pos3,
        'parameters': {
            'method': 'GET',
            'url': f'{SB_URL}/rest/v1/wein_menu_items',
            'sendQuery': True,
            'queryParameters': {'parameters': [
                {'name': 'provider_id', 'value': "=eq.={{ $('Lookup Provider UUID').item.json.id }}"},
                {'name': 'select',      'value': '*'},
                {'name': 'limit',       'value': '500'},
                {'name': 'order',       'value': 'item_name.asc'},
            ]},
            'sendHeaders': True,
            'headerParameters': {'parameters': [
                {'name': 'apikey',        'value': SB_KEY},
                {'name': 'Authorization', 'value': f'Bearer {SB_KEY}'},
                {'name': 'Accept',        'value': 'application/json'},
            ]},
            'options': {'response': {'response': {'responseFormat': 'json'}}}
        }
    })
    print(f'Added: {NODE_READ}')
    existing_names = {n['name']: n for n in nodes}

# Code node to normalise DB rows → classified_items shape
NODE_NORM = 'Normalise DB Items'
norm_pos  = [read_pos3[0] + 280, read_pos3[1]]
NORM_CODE = r"""
// Convert wein_menu_items DB rows to classified_items shape
// so Parse Offer Data can read them via $('Normalise DB Items').item.json.classified_items
const rows = $input.all().map(i => i.json);
const classified = rows.map(row => ({
  name:                   row.item_name || '',
  category:               row.category  || '',
  price_egp:              row.price_egp || 0,
  me_class:               row.me_class  || 'Star',
  bundle_role:            row.bundle_role || null,
  cost_sensitivity:       row.cost_sensitivity || null,
  eligible:               row.eligible !== false,
  classification_reason:  row.classification_reason || ''
}));
return [{ json: { classified_items: classified, count: classified.length, source: 'db' } }];
""".strip()

if NODE_NORM not in existing_names:
    nodes.append({
        'id': str(_uuid.uuid4()),
        'name': NODE_NORM,
        'type': 'n8n-nodes-base.code',
        'typeVersion': 2,
        'position': norm_pos,
        'parameters': {'jsCode': NORM_CODE, 'mode': 'runOnceForAllItems'}
    })
    print(f'Added: {NODE_NORM}')
    existing_names = {n['name']: n for n in nodes}

# ─────────────────────────────────────────────────────────────────
# STEP 5 — Prepare Menu Items for Upsert (FALSE branch, before Save)
# ─────────────────────────────────────────────────────────────────
pc_pos   = pos_of('Parse Classification')
prep_pos = [pc_pos[0] + 280, pc_pos[1]]

PREP_CODE = r"""
// Dedup classified items and attach provider_id, ready for upsert
const classified = $('Parse Classification').item.json.classified_items || [];
const providerId  = $('Lookup Provider UUID').item.json.id;

const seen = new Set();
const items = [];
for (const item of classified) {
  const key = (item.name || '').toLowerCase().trim();
  if (!key || seen.has(key)) continue;
  seen.add(key);
  items.push({
    provider_id:             providerId,
    item_name:               item.name || '',
    category:                item.category || '',
    price_egp:               item.price_egp > 0 ? item.price_egp : null,
    me_class:                item.me_class || 'Star',
    bundle_role:             item.bundle_role || null,
    cost_sensitivity:        item.cost_sensitivity || null,
    eligible:                item.eligible !== false,
    classification_reason:   item.classification_reason || null
  });
}
return [{ json: { items, count: items.length } }];
""".strip()

if NODE_PREP not in existing_names:
    nodes.append({
        'id': str(_uuid.uuid4()),
        'name': NODE_PREP,
        'type': 'n8n-nodes-base.code',
        'typeVersion': 2,
        'position': prep_pos,
        'parameters': {'jsCode': PREP_CODE, 'mode': 'runOnceForAllItems'}
    })
    print(f'Added: {NODE_PREP}')
    existing_names = {n['name']: n for n in nodes}

# ─────────────────────────────────────────────────────────────────
# STEP 6 — Update Save Menu to DB → upsert with ignore-duplicates
# ─────────────────────────────────────────────────────────────────
for n in nodes:
    if n['name'] == 'Save Menu to DB':
        n['parameters']['body']    = '={{ $json.items }}'
        n['parameters']['sendHeaders'] = True
        headers = n['parameters'].get('headerParameters', {}).get('parameters', [])
        # Remove old Prefer header if present
        headers = [h for h in headers if h.get('name') != 'Prefer']
        headers.append({'name': 'Prefer', 'value': 'resolution=ignore-duplicates'})
        n['parameters']['headerParameters'] = {'parameters': headers}
        print('Updated: Save Menu to DB → body=$json.items, Prefer=ignore-duplicates')
        break

# ─────────────────────────────────────────────────────────────────
# STEP 8 — Rewire connections
# ─────────────────────────────────────────────────────────────────
# Lookup Provider UUID → Check Existing Items Count
if add_edge(conns, 'Lookup Provider UUID', NODE_CHECK):
    print(f'Added edge: Lookup Provider UUID → {NODE_CHECK}')

# Check → Has Existing Menu Items?
if add_edge(conns, NODE_CHECK, NODE_IF_CODE):
    print(f'Added edge: {NODE_CHECK} → {NODE_IF_CODE}')

# Has Existing Menu Items? → Branch on Existing Items
if add_edge(conns, NODE_IF_CODE, NODE_IF_BRANCH):
    print(f'Added edge: {NODE_IF_CODE} → {NODE_IF_BRANCH}')

# Branch TRUE (port 0) → Read Existing Items from DB
if add_edge(conns, NODE_IF_BRANCH, NODE_READ, port=0):
    print(f'Added edge: {NODE_IF_BRANCH} port 0 → {NODE_READ}')

# Read → Normalise DB Items
if add_edge(conns, NODE_READ, NODE_NORM):
    print(f'Added edge: {NODE_READ} → {NODE_NORM}')

# Branch FALSE (port 1) → Build Classification Request
build_node = 'Build Classification Request'
if add_edge(conns, NODE_IF_BRANCH, build_node, port=1):
    print(f'Added edge: {NODE_IF_BRANCH} port 1 → {build_node}')

# Remove the old Fix Merged Data → Build Classification Request edge
# (it now only flows through Lookup → Check → Branch → Build)
removed = remove_edge(conns, 'Fix Merged Data', build_node)
if removed:
    print(f'Removed: Fix Merged Data → {build_node} ({removed} edges)')

# Parse Classification → Prepare Menu Items for Upsert
if add_edge(conns, 'Parse Classification', NODE_PREP):
    print(f'Added edge: Parse Classification → {NODE_PREP}')

# Prepare Upsert → Save Menu to DB
if add_edge(conns, NODE_PREP, 'Save Menu to DB'):
    print(f'Added edge: {NODE_PREP} → Save Menu to DB')

# Remove old Parse Classification → Lookup Provider UUID
# (Lookup now runs from Fix Merged Data directly, in parallel with recall)
removed2 = remove_edge(conns, 'Parse Classification', 'Lookup Provider UUID')
if removed2:
    print(f'Removed: Parse Classification → Lookup Provider UUID')

# Ensure Fix Merged Data → Lookup Provider UUID (direct, in parallel with recall)
if add_edge(conns, 'Fix Merged Data', 'Lookup Provider UUID'):
    print(f'Added edge: Fix Merged Data → Lookup Provider UUID')

# ─────────────────────────────────────────────────────────────────
# STEP 8b — Update Parse Offer Data priority chain
# ─────────────────────────────────────────────────────────────────
OLD_MENU_BLOCK = """// Menu items — priority chain:
// 1. Gemini classification (all items + ME class) from parallel classify node
// 2. Node 8 menu_items (top-50 classified)
// 3. Raw Gemini extraction (no ME class — meMap will fill what it can)
const classifiedItems = (() => {
  try { return $('Parse Classification').item.json.classified_items || []; }
  catch(e) { return []; }
})();

if (classifiedItems.length > 0) {
  offerData.menu_items = classifiedItems;
} else if (Array.isArray(offerDataRaw.menu_items) && offerDataRaw.menu_items.length > 0) {
  offerData.menu_items = offerDataRaw.menu_items;
} else {
  offerData.menu_items = ($('Fix Merged Data').item.json.menu_items || []);
}"""

NEW_MENU_BLOCK = """// Menu items — priority chain:
// 1. Normalise DB Items (known provider — read from wein_menu_items)
// 2. Parse Classification (new provider — Gemini classified)
// 3. Node 8 menu_items (top-50 node-8 classified)
// 4. Fix Merged Data raw extraction (last resort)
const classifiedItems = (() => {
  try {
    const dbItems = $('Normalise DB Items').item.json.classified_items || [];
    if (dbItems.length > 0) return dbItems;
  } catch(e) {}
  try {
    const geminiItems = $('Parse Classification').item.json.classified_items || [];
    if (geminiItems.length > 0) return geminiItems;
  } catch(e) {}
  return [];
})();

if (classifiedItems.length > 0) {
  offerData.menu_items = classifiedItems;
} else if (Array.isArray(offerDataRaw.menu_items) && offerDataRaw.menu_items.length > 0) {
  offerData.menu_items = offerDataRaw.menu_items;
} else {
  offerData.menu_items = ($('Fix Merged Data').item.json.menu_items || []);
}"""

pod_updated = False
for n in nodes:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters']['jsCode']
        if OLD_MENU_BLOCK in code:
            n['parameters']['jsCode'] = code.replace(OLD_MENU_BLOCK, NEW_MENU_BLOCK, 1)
            print(f'Updated: Parse Offer Data priority chain')
            pod_updated = True
        elif 'Normalise DB Items' in code:
            print('Parse Offer Data: already has DB priority — skipping')
            pod_updated = True
        else:
            print('FAIL: Parse Offer Data anchor not found')
            idx = code.find("classifiedItems")
            print(repr(code[max(0,idx-20):idx+300]))
        break

if not pod_updated:
    print('WARN: Parse Offer Data not updated')

# ─────────────────────────────────────────────────────────────────
# PATCH + ACTIVATE
# ─────────────────────────────────────────────────────────────────
resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': conns,
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')
if resp.status_code != 200:
    print(resp.text[:500]); sys.exit(1)

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

# ─────────────────────────────────────────────────────────────────
# VERIFY
# ─────────────────────────────────────────────────────────────────
r3   = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3  = r3.json()['data']
names3 = {n['name'] for n in wf3['nodes']}
conns3 = wf3['connections']

print(f'\nactive: {wf3.get("active")}')
print('\n=== VERIFICATION ===')

def check_edge(src, dst, port=0, label=None):
    edges = [e['node'] for e in (conns3.get(src, {}).get('main', [[]])[port] if port < len(conns3.get(src, {}).get('main', [[]])) else [])]
    ok = 'OK' if dst in edges else 'FAIL'
    print(f'  [{ok}] {label or f"{src} → {dst}"}')

# Node existence
for name in [NODE_CHECK, NODE_IF_CODE, NODE_IF_BRANCH, NODE_READ, NODE_NORM, NODE_PREP]:
    ok = 'OK' if name in names3 else 'FAIL'
    print(f'  [{ok}] Node exists: {name}')

print()
check_edge('Fix Merged Data',       'Lookup Provider UUID')
check_edge('Lookup Provider UUID',  NODE_CHECK)
check_edge(NODE_CHECK,              NODE_IF_CODE)
check_edge(NODE_IF_CODE,            NODE_IF_BRANCH)
check_edge(NODE_IF_BRANCH,          NODE_READ,      port=0, label=f'{NODE_IF_BRANCH} TRUE → {NODE_READ}')
check_edge(NODE_IF_BRANCH,          build_node,     port=1, label=f'{NODE_IF_BRANCH} FALSE → {build_node}')
check_edge(NODE_READ,               NODE_NORM)
check_edge('Parse Classification',  NODE_PREP)
check_edge(NODE_PREP,               'Save Menu to DB')

# Parse Offer Data
for n in wf3['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        print(f'\n  [{"OK" if "Normalise DB Items" in code else "FAIL"}] Parse Offer Data: DB branch first')
        print(f'  [{"OK" if "Parse Classification" in code else "FAIL"}] Parse Offer Data: Gemini branch second')
    if n['name'] == 'Save Menu to DB':
        body = n['parameters'].get('body', '')
        hdrs = n['parameters'].get('headerParameters', {}).get('parameters', [])
        prefer = next((h['value'] for h in hdrs if h.get('name') == 'Prefer'), None)
        print(f'\n  [{"OK" if body == "={{ $json.items }}" else "FAIL"}] Save Menu to DB body = $json.items')
        print(f'  [{"OK" if prefer == "resolution=ignore-duplicates" else "FAIL"}] Save Menu to DB Prefer = {prefer}')

# Print SQL for user
print("""
═══════════════════════════════════════════════════════════
STEP 1 — Run in Supabase SQL editor:
https://supabase.com/dashboard/project/iwyufqeqtjbbojunomgq/sql
═══════════════════════════════════════════════════════════
-- Add cost_sensitivity column
ALTER TABLE wein_menu_items
  ADD COLUMN IF NOT EXISTS cost_sensitivity text;

-- Add unique constraint to enable upsert ignore-duplicates
ALTER TABLE wein_menu_items
  DROP CONSTRAINT IF EXISTS wein_menu_items_provider_item_unique;
ALTER TABLE wein_menu_items
  ADD CONSTRAINT wein_menu_items_provider_item_unique
  UNIQUE (provider_id, item_name);
═══════════════════════════════════════════════════════════
""")
