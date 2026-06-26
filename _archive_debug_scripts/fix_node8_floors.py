import requests, sys, json, time
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

FLOOR_BLOCK = """
DISCOUNT FLOORS (never go below these regardless of menu prices):
- Dining: 20% minimum (target 20-35%, push to 40% vs competition)
- Fun & Activities: 25% minimum (target 25-40%)
- Health & Beauty: 15% minimum (target 15-30%)
- Hotels & Aqua Park: 20% minimum (target 20-40%)

If the Waffarha recall shows competitor discounts above these floors,
add 5-7 percentage points on top of the highest competitor discount.
Never go below the floor for any offer in any tier."""

# Anchor: insert before "Output full offer_data.json structure"
ANCHOR = 'Output full offer_data.json structure.'

patched = False
for n in nodes:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text', '')
        if ANCHOR not in text:
            print(f'ERROR: anchor not found. Last 300 chars:\n{text[-300:]}')
            sys.exit(1)
        if 'DISCOUNT FLOORS' in text:
            print('Floor block already present — skipping insert')
        else:
            n['parameters']['text'] = text.replace(ANCHOR, FLOOR_BLOCK.strip() + '\n\n' + ANCHOR)
            print(f'Inserted floor block. New length: {len(n["parameters"]["text"])}')
        patched = True
        # Verify
        updated = n['parameters']['text']
        for check in ['Dining: 20%', 'Fun & Activities: 25%', 'Health & Beauty: 15%', 'Hotels & Aqua Park: 20%']:
            ok = '✅' if check in updated else '❌'
            print(f'  {ok} {check}')
        break

if not patched:
    print('ERROR: node 8 not found'); sys.exit(1)

resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'PATCH: {resp.status_code}')

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')
