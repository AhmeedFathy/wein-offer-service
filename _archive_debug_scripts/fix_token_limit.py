import requests, sys, json, time, re
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

# ── FIX 1: Find Mistral model attached to node 8, bump maxTokens ──────────
# Node 8 is '🏗️ 8. wein-creator — Build Full Offers'
# Its model is referenced via a sub-node; find all Mistral nodes and show info
mistral_nodes = [n for n in nodes if 'mistral' in n.get('type','').lower() or
                 'mistral' in n.get('name','').lower()]
print(f'Mistral nodes found: {len(mistral_nodes)}')
for n in mistral_nodes:
    print(f'  name={n["name"]!r}  type={n["type"]!r}')
    params = n.get('parameters', {})
    print(f'    maxTokens={params.get("maxTokens","NOT SET")}  model={params.get("model","NOT SET")}')

# The model node attached to wein-creator (node 8) is "Mistral Cloud Chat Model7"
# or similar — patch whichever has maxTokens set or any Mistral model tied to creator
TARGET_MODEL_NAMES = ['Mistral Cloud Chat Model7', 'Mistral Cloud Chat Model 7']
fix1_done = False
for n in mistral_nodes:
    if n['name'] in TARGET_MODEL_NAMES or (
        # fallback: any Mistral model with maxTokens currently <= 16000
        n.get('parameters', {}).get('maxTokens', 0) and
        int(n.get('parameters', {}).get('maxTokens', 0)) <= 16000
    ):
        old = n['parameters'].get('maxTokens', 'NOT SET')
        n['parameters']['maxTokens'] = 32000
        print(f'\nFIX 1: {n["name"]} maxTokens {old} → 32000')
        fix1_done = True

if not fix1_done:
    # Last resort: patch ALL Mistral models that don't already have 32000
    for n in mistral_nodes:
        old = n['parameters'].get('maxTokens', 'NOT SET')
        if str(old) != '32000':
            n['parameters']['maxTokens'] = 32000
            print(f'FIX 1 (all): {n["name"]} maxTokens {old} → 32000')

# ── FIX 2: Parse Offer Data — add truncation recovery ─────────────────────
# Current recovery block tries slicing from the end.
# Replace with: find last complete offer via lastIndexOf(',"id":')

OLD_RECOVERY = """  if (!recovered) throw new Error('JSON recovery failed: ' + e1.message.slice(0,200));"""

NEW_RECOVERY = """  if (!recovered) {
    // Truncation recovery: find last complete offer object
    const lastId = raw.lastIndexOf(',"id":');
    if (lastId > 0) {
      const truncated = raw.substring(0, lastId);
      const candidates = [truncated + ']}', truncated + '}]}'];
      for (const attempt of candidates) {
        try { offerDataRaw = JSON.parse(attempt); recovered = true; break; } catch(e3) {}
      }
    }
    if (!recovered) throw new Error('JSON recovery failed: ' + e1.message.slice(0,200));
  }"""

fix2_done = False
for n in nodes:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        if OLD_RECOVERY not in code:
            print(f'\nFIX 2 ERROR: anchor not found in Parse Offer Data')
            print(f'  Searching for recovery block...')
            if 'JSON recovery failed' in code:
                idx = code.find('JSON recovery failed')
                print(f'  Found at pos {idx}: ...{code[max(0,idx-100):idx+100]}...')
        else:
            n['parameters']['jsCode'] = code.replace(OLD_RECOVERY, NEW_RECOVERY, 1)
            print(f'\nFIX 2: Parse Offer Data recovery block updated')
            fix2_done = True
        break

# ── FIX 3: Node 8 — slim menu_items to used items only ────────────────────
OLD_MENU_INSTRUCTION = 'Include me_class and hook_type on every offer.'
NEW_MENU_INSTRUCTION = '''Include me_class and hook_type on every offer.

IMPORTANT — menu_items output: In the top-level menu_items array, output ONLY items
that appear in at least one offer's items[] array. Do NOT output the full menu.
This keeps output compact. The offer items[] arrays are the source of truth.'''

fix3_done = False
for n in nodes:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text', '')
        if OLD_MENU_INSTRUCTION not in text:
            print(f'\nFIX 3 ERROR: anchor not found in node 8')
        elif 'menu_items output' in text:
            print(f'\nFIX 3: menu_items instruction already present — skipping')
            fix3_done = True
        else:
            n['parameters']['text'] = text.replace(OLD_MENU_INSTRUCTION, NEW_MENU_INSTRUCTION, 1)
            print(f'\nFIX 3: Node 8 menu_items instruction added')
            fix3_done = True
        break

# ── PATCH + ACTIVATE ───────────────────────────────────────────────────────
resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')
if resp.status_code != 200:
    print(resp.text[:300])

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')

# ── VERIFY ─────────────────────────────────────────────────────────────────
print('\n=== VERIFICATION ===')
for n in wf3['nodes']:
    if 'mistral' in n.get('type','').lower() or 'mistral' in n.get('name','').lower():
        mt = n.get('parameters', {}).get('maxTokens', 'NOT SET')
        ok = '✅' if str(mt) == '32000' else '❌'
        print(f'{ok} {n["name"]}: maxTokens={mt}')

for n in wf3['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        ok = '✅' if 'lastIndexOf' in code and 'Truncation recovery' in code else '❌'
        print(f'{ok} Parse Offer Data: truncation recovery present')
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text', '')
        ok = '✅' if 'menu_items output' in text else '❌'
        print(f'{ok} Node 8: slim menu_items instruction present')
