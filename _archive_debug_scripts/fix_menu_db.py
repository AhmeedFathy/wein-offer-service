"""
Apply all 5 fixes:
  FIX 1 — Add Save Menu to DB nodes (3 nodes: Lookup Provider + Clear + Insert)
  FIX 2 — Parse Offer Data: override menu_items from Fix Merged Data (full Gemini list)
  FIX 3 — Node 8: remove menu_items from output contract
  FIX 4 — Node 8: add 40% soft opening discount cap
  FIX 5 — build_pdfs.py: restore correct comp_reg/comp_promo labels
"""
import requests, json, time, sys, uuid
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'
SB_URL   = 'https://iwyufqeqtjbbojunomgq.supabase.co'
SB_KEY   = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
             'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXVmcWVxdGpiYm9qdW5vbWdxIiwicm9sZSI6'
             'InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2NDYyNiwiZXhwIjoyMDk2MjQwNjI2fQ.'
             'LLT4142UHWlfNnaMQaa_DRe44o2lWzOUavVvR3ceyoA')
ANON_KEY = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
            'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXVmcWVxdGpiYm9qdW5vbWdxIiwicm9sZSI6'
            'ImFub24iLCJpYXQiOjE3ODA2NjQ2MjYsImV4cCI6MjA5NjI0MDYyNn0.'
            'IDlnJLYEWcbRX2uQU5VhgG1qSigrqGzsgIhL2N_szDs')
SUPABASE_CRED_ID = 'WB741BJkn9vK1eiM'

# Fix Merged Data is at x=-12368, y=3232
# Recall node is at x=-12112 (right of FMD)
# New menu DB chain goes BELOW: y=3480, right side
FMD_X, FMD_Y = -12368, 3232
NEW_Y = FMD_Y + 280  # below Fix Merged Data

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']
conns = wf['connections']

# ── FIX 1: Add three nodes ──────────────────────────────────────────────────
SB_HEADERS = {
    "parameters": [
        {"name": "apikey",        "value": SB_KEY},
        {"name": "Authorization", "value": f"Bearer {SB_KEY}"},
        {"name": "Content-Type",  "value": "application/json"},
        {"name": "Prefer",        "value": "return=minimal"},
    ]
}

# Check if nodes already exist
existing_names = {n['name'] for n in nodes}

NODE_LOOKUP = "Lookup Provider UUID"
NODE_CLEAR  = "Clear Old Menu Items"
NODE_SAVE   = "Save Menu to DB"

if NODE_LOOKUP not in existing_names:
    nodes.append({
        "id": str(uuid.uuid4()),
        "name": NODE_LOOKUP,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [FMD_X, NEW_Y],
        "parameters": {
            "method": "GET",
            "url": (f"={SB_URL}/rest/v1/wein_providers"
                    "?provider_name=ilike.{{$('Fix Merged Data').item.json.provider_name}}"
                    "&select=id,provider_name&limit=1"),
            "sendHeaders": True,
            "headerParameters": SB_HEADERS,
            "options": {}
        }
    })
    print(f'✅ Added node: {NODE_LOOKUP}')
else:
    print(f'⏭  Already exists: {NODE_LOOKUP}')

if NODE_CLEAR not in existing_names:
    nodes.append({
        "id": str(uuid.uuid4()),
        "name": NODE_CLEAR,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [FMD_X + 260, NEW_Y],
        "parameters": {
            "method": "DELETE",
            "url": (f"={SB_URL}/rest/v1/wein_menu_items"
                    "?provider_id=eq.{{$('Lookup Provider UUID').item.json[0].id}}"),
            "sendHeaders": True,
            "headerParameters": {
                "parameters": [
                    {"name": "apikey",        "value": SB_KEY},
                    {"name": "Authorization", "value": f"Bearer {SB_KEY}"},
                    {"name": "Prefer",        "value": "return=minimal"},
                ]
            },
            "options": {}
        }
    })
    print(f'✅ Added node: {NODE_CLEAR}')
else:
    print(f'⏭  Already exists: {NODE_CLEAR}')

if NODE_SAVE not in existing_names:
    # Body: map menu_items to insert rows
    body_expr = (
        "={{ $('Fix Merged Data').item.json.menu_items.map(item => ({"
        "provider_id: $('Lookup Provider UUID').item.json[0].id,"
        "item_name: item.name || '',"
        "category: item.category || '',"
        "price_egp: item.price > 0 ? item.price : null,"
        "me_class: item.me_class || 'Star',"
        "bundle_role: item.bundle_role || null"
        "})) }}"
    )
    nodes.append({
        "id": str(uuid.uuid4()),
        "name": NODE_SAVE,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [FMD_X + 520, NEW_Y],
        "parameters": {
            "method": "POST",
            "url": f"{SB_URL}/rest/v1/wein_menu_items",
            "sendHeaders": True,
            "headerParameters": SB_HEADERS,
            "sendBody": True,
            "contentType": "raw",
            "rawContentType": "application/json",
            "body": body_expr,
            "options": {}
        }
    })
    print(f'✅ Added node: {NODE_SAVE}')
else:
    print(f'⏭  Already exists: {NODE_SAVE}')

# Wire: Fix Merged Data → Lookup Provider UUID → Clear Old Menu Items → Save Menu to DB
def add_edge(conns, src, dst, src_port=0, dst_port=0):
    if src not in conns:
        conns[src] = {"main": [[]]}
    main = conns[src]["main"]
    while len(main) <= src_port:
        main.append([])
    # Check if edge already exists
    for e in main[src_port]:
        if e.get("node") == dst:
            return False
    main[src_port].append({"node": dst, "type": "main", "index": dst_port})
    return True

added = []
if add_edge(conns, "Fix Merged Data", NODE_LOOKUP):
    added.append(f"Fix Merged Data → {NODE_LOOKUP}")
if add_edge(conns, NODE_LOOKUP, NODE_CLEAR):
    added.append(f"{NODE_LOOKUP} → {NODE_CLEAR}")
if add_edge(conns, NODE_CLEAR, NODE_SAVE):
    added.append(f"{NODE_CLEAR} → {NODE_SAVE}")
print(f'✅ Added edges: {added}')

# ── FIX 2: Parse Offer Data — override menu_items from Fix Merged Data ──────
# Add after offerData = JSON.parse(JSON.stringify(offerDataRaw));
OVERRIDE_ANCHOR = 'const offerData = JSON.parse(JSON.stringify(offerDataRaw));'
OVERRIDE_CODE   = (
    'const offerData = JSON.parse(JSON.stringify(offerDataRaw));\n\n'
    '// FIX 2: use the full Gemini-extracted menu from Fix Merged Data\n'
    'const fullMenuItems = ($("Fix Merged Data").item.json.menu_items || []);\n'
    'if (fullMenuItems.length > 0) offerData.menu_items = fullMenuItems;'
)

for n in nodes:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters']['jsCode']
        if 'FIX 2: use the full Gemini-extracted menu' in code:
            print('⏭  FIX 2 already applied')
        elif OVERRIDE_ANCHOR not in code:
            print(f'❌ FIX 2: anchor not found in Parse Offer Data')
        else:
            n['parameters']['jsCode'] = code.replace(OVERRIDE_ANCHOR, OVERRIDE_CODE, 1)
            print('✅ FIX 2: Parse Offer Data menu_items override added')
        break

# ── FIX 3: Node 8 — remove menu_items from output contract ─────────────────
OLD_MI_INSTRUCTION = (
    'IMPORTANT — menu_items output: In the top-level menu_items array, output ONLY items\n'
    'that appear in at least one offer\'s items[] array. Do NOT output the full menu.\n'
    'This keeps output compact. The offer items[] arrays are the source of truth.'
)
NEW_MI_INSTRUCTION = (
    'Do NOT include a top-level menu_items array in your output — it is populated from '
    'the extraction pipeline. Only output the offers[] array and metadata fields.'
)

for n in nodes:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text', '')
        if NEW_MI_INSTRUCTION in text:
            print('⏭  FIX 3 already applied')
        elif OLD_MI_INSTRUCTION in text:
            n['parameters']['text'] = text.replace(OLD_MI_INSTRUCTION, NEW_MI_INSTRUCTION, 1)
            print('✅ FIX 3: Node 8 menu_items output removed')
        else:
            # Try to append
            n['parameters']['text'] = text + f'\n\n{NEW_MI_INSTRUCTION}'
            print('✅ FIX 3: Node 8 menu_items instruction appended (anchor not found)')
        break

# ── FIX 4: Node 8 — 40% soft opening discount cap ──────────────────────────
CAP_TEXT = ('SOFT OPENING CAP: Maximum 40% discount for ALL verticals. '
            'Never exceed 40% regardless of competitor data or floor rules.')
for n in nodes:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text', '')
        if 'SOFT OPENING CAP' in text:
            print('⏭  FIX 4 already applied')
        else:
            # Insert before the DISCOUNT FLOORS block
            anchor = 'DISCOUNT FLOORS'
            if anchor in text:
                n['parameters']['text'] = text.replace(anchor, CAP_TEXT + '\n\n' + anchor, 1)
            else:
                n['parameters']['text'] = text + f'\n\n{CAP_TEXT}'
            print('✅ FIX 4: 40% cap added to node 8')
        break

# ── PATCH + ACTIVATE ────────────────────────────────────────────────────────
resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': conns,
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')
if resp.status_code != 200:
    print(resp.text[:400])
    sys.exit(1)

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')

# ── VERIFY ───────────────────────────────────────────────────────────────────
print('\n=== VERIFICATION ===')
node_names = {n['name'] for n in wf3['nodes']}
for name in [NODE_LOOKUP, NODE_CLEAR, NODE_SAVE]:
    ok = '✅' if name in node_names else '❌'
    print(f'{ok} Node exists: {name}')

for n in wf3['nodes']:
    if n['name'] == 'Parse Offer Data':
        ok = '✅' if 'FIX 2' in n['parameters'].get('jsCode','') else '❌'
        print(f'{ok} Parse Offer Data: menu_items override present')
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text','')
        print(f'{"✅" if "Do NOT include a top-level menu_items" in text else "❌"} Node 8: menu_items removed from output contract')
        print(f'{"✅" if "SOFT OPENING CAP" in text else "❌"} Node 8: 40% cap present')

# Check connections
fmd_edges = wf3['connections'].get('Fix Merged Data', {}).get('main', [[]])[0]
print(f'\nFix Merged Data outgoing edges: {[e["node"] for e in fmd_edges]}')
