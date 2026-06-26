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

ROUTER = '🔀 Review Decision Router'
NODE10 = '🏷️ 10. wein-titles — Generate Titles'
NODE10B= '10b. wein-titles-pick — Auto-Pick Titles'

# ── Fix routing ────────────────────────────────────────────────────────────
router_main = conns[ROUTER]['main']

print('BEFORE:')
for i, edges in enumerate(router_main):
    print(f'  port {i}: {[e["node"] for e in edges]}')

# Port 0 should be → node 10 only (remove 10b direct, add node 10)
# Port 1 currently has node 10 — clear it (move to port 0)
router_main[0] = [{"node": NODE10, "type": "main", "index": 0}]
# Clear port 1 (was pointing to node 10 which is now at port 0)
router_main[1] = []

print('\nAFTER:')
for i, edges in enumerate(router_main):
    print(f'  port {i}: {[e["node"] for e in edges]}')

# ── Update node 10 text to use explicit upstream refs ─────────────────────
NODE10_TEXT = (
    "=You are wein-titles.\n"
    "Provider: {{$('Fix Merged Data').item.json.provider_name}} "
    "| Vertical: {{$('Fix Merged Data').item.json.vertical}}\n"
    "Provider profile: {{$('Fix Merged Data').item.json.provider_profile}}\n\n"
    "For each selected offer, generate title options across all 6 strategies:\n"
    "1. Outcome Frame  2. Experience Frame  3. Transformation  "
    "4. Social Proof  5. Urgency/Exclusivity  6. Sensory\n\n"
    "Anti-hallucination rule: only use location, view, atmosphere details "
    "that are in the provider_profile. Never invent.\n\n"
    "Offers: {{$('🏗️ 8. wein-creator — Build Full Offers').item.json.text}}"
)

for n in nodes:
    if n['name'] == NODE10:
        old_len = len(n['parameters'].get('text', ''))
        n['parameters']['text'] = NODE10_TEXT
        print(f'\nNode 10 text updated: {old_len} → {len(NODE10_TEXT)} chars')
        # Verify refs
        for ref in ['Fix Merged Data', '🏗️ 8. wein-creator']:
            ok = '✅' if ref in NODE10_TEXT else '❌'
            print(f'  {ok} refs {ref!r}')
        break

# ── Verify 10 → 10b and 10b → Code in JavaScript still intact ────────────
t10_edges = [e['node'] for e in conns.get(NODE10, {}).get('main', [[]])[0]]
t10b_edges = [e['node'] for e in conns.get(NODE10B, {}).get('main', [[]])[0]]
print(f'\nNode 10 → {t10_edges}   (should include 10b)')
print(f'Node 10b → {t10b_edges}  (should include Code in JavaScript)')

# ── Patch + activate ───────────────────────────────────────────────────────
resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': conns,
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')
if resp.status_code != 200:
    print(resp.text[:300]); sys.exit(1)

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')

# ── Final verification ─────────────────────────────────────────────────────
print('\n=== FINAL ROUTING ===')
router_main_final = wf3['connections'][ROUTER]['main']
for i, edges in enumerate(router_main_final):
    targets = [e['node'] for e in edges]
    label = {0:'EXCELLENT/GOOD→', 1:'(empty)', 2:'NEEDS WORK→', 3:'REJECT→'}.get(i, f'port {i}→')
    ok = ''
    if i == 0: ok = '✅' if targets == [NODE10] else '❌'
    if i == 2: ok = '✅' if any('patch' in t.lower() for t in targets) else '❌'
    if i == 3: ok = '✅' if any('reject' in t.lower() for t in targets) else '❌'
    print(f'  {ok} port {i} ({label}): {targets}')
