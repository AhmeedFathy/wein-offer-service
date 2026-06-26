"""
Add cost_sensitivity field to classification chain:
1. Update "Build Classification Request" Code node — add COST SENSITIVITY RULES
   to prompt and cost_sensitivity to output schema
2. Update node 8 — add per-item discount cap rules based on cost_sensitivity
"""
import requests, json, time, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

# ── 1. New Build Classification Request code ──────────────────────────────────
BUILD_CODE = r"""
const menuItems = $('Fix Merged Data').item.json.menu_items || [];
const vertical  = $('Fix Merged Data').item.json.vertical || '';
const provider  = $('Fix Merged Data').item.json.provider_name || '';

const prompt = `You are a menu engineering expert for a premium F&B marketplace in Sharm El Sheikh, Egypt.
Classify EVERY item in the menu below using the ME (Menu Engineering) matrix.

ME CLASS DEFINITIONS:
  Star      → High popularity + High margin → bundle_role: Hero
  Plowhorse → High popularity + Low margin  → bundle_role: Support
  Puzzle    → Low popularity  + High margin → bundle_role: Premium
  Dog       → Low popularity  + Low margin  → bundle_role: Filler, eligible: false

CLASSIFICATION HINTS:
  - High-price proteins (steaks, ribs, seafood platters) → Star or Puzzle
  - Signature / chef's special / unique dishes → Star
  - Common mezze, salads, hummus, dips → Plowhorse
  - Expensive but less-ordered desserts → Puzzle
  - Beverages, juices, soft drinks, water → Plowhorse (eligible: false if under 50 EGP)
  - Basic sides, bread → Plowhorse or Dog
  - Premium tasting / chef's menus → Star

COST SENSITIVITY RULES:
  Under 100 EGP    → cost_sensitivity: "Low"         (mezze, dips, beverages, water)
  100–250 EGP      → cost_sensitivity: "Low-Medium"  (salads, soups, appetizers, pizza, pasta, manakish)
  250–400 EGP      → cost_sensitivity: "Medium"      (chicken mains, mixed plates, standard grills)
  400–600 EGP      → cost_sensitivity: "High"        (lamb, beef, premium grills, seafood platters)
  Above 600 EGP    → cost_sensitivity: "Very High"   (signature platters, chef's specials, premium cuts, rack of lamb)

Vertical: ${vertical}
Provider: ${provider}

Menu items to classify:
${JSON.stringify(menuItems)}

Return ONLY a valid JSON array — no markdown, no explanation.
Each element must have ALL of these fields:
{
  "name": "...",
  "category": "...",
  "price_egp": 0,
  "me_class": "Star",
  "bundle_role": "Hero",
  "cost_sensitivity": "High",
  "eligible": true,
  "classification_reason": "one sentence"
}`;

const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { temperature: 0.1, maxOutputTokens: 16384 }
};

return [{ json: { bodyString: JSON.stringify(body) } }];
""".strip()

# ── 2. Node 8 addition — cost_sensitivity discount cap section ────────────────
COST_CAP_SECTION = """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COST SENSITIVITY DISCOUNT CAPS (per item)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each bundle's overall discount is capped by the cost_sensitivity of its HERO item:
- Hero cost_sensitivity = Low         → offer discount up to 40%
- Hero cost_sensitivity = Low-Medium  → offer discount up to 40%
- Hero cost_sensitivity = Medium      → offer discount up to 35%
- Hero cost_sensitivity = High        → offer discount up to 25%
- Hero cost_sensitivity = Very High   → offer discount up to 15%, only in Premium or Family Premium tier

These caps are in addition to — and take precedence over — the SOFT OPENING CAP.
If the hero item is Very High cost_sensitivity, never put it in Entry or Core tier bundles."""

# Insert the cost cap section right before STEP 1 in node 8 text
NODE8_ANCHOR = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSTEP 1 — CLASSIFY ALL MENU ITEMS"

# ── Apply changes ─────────────────────────────────────────────────────────────
n8_updated   = False
build_updated = False

for n in nodes:
    if n['name'] == 'Build Classification Request':
        old_len = len(n['parameters'].get('jsCode', ''))
        n['parameters']['jsCode'] = BUILD_CODE
        print(f'Build Classification Request: {old_len} -> {len(BUILD_CODE)} chars')
        checks = ['COST SENSITIVITY RULES', 'cost_sensitivity', 'Low-Medium', 'Very High', 'maxOutputTokens: 16384']
        for c in checks:
            ok = 'OK' if c in BUILD_CODE else 'FAIL'
            print(f'  [{ok}] {c}')
        build_updated = True

    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text', '')
        if 'COST SENSITIVITY DISCOUNT CAPS' in text:
            print('Node 8: cost caps already present — skipping')
            n8_updated = True
        elif NODE8_ANCHOR in text:
            n['parameters']['text'] = text.replace(NODE8_ANCHOR, COST_CAP_SECTION + '\n\n' + NODE8_ANCHOR)
            old_len = len(text)
            new_len = len(n['parameters']['text'])
            print(f'Node 8: {old_len} -> {new_len} chars')
            ok_checks = ['COST SENSITIVITY DISCOUNT CAPS', 'Very High', 'Low-Medium', 'precedence over']
            for c in ok_checks:
                ok = 'OK' if c in n['parameters']['text'] else 'FAIL'
                print(f'  [{ok}] {c}')
            n8_updated = True
        else:
            print('FAIL: Node 8 anchor not found — check STEP 1 header format')

if not build_updated:
    print('FAIL: Build Classification Request node not found')
if not n8_updated:
    print('FAIL: Node 8 not found')

# ── PATCH ─────────────────────────────────────────────────────────────────────
resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')
if resp.status_code != 200:
    print(resp.text[:400]); sys.exit(1)

# ── ACTIVATE ──────────────────────────────────────────────────────────────────
r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

# ── VERIFY ────────────────────────────────────────────────────────────────────
r3  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}')
print('\n=== VERIFICATION ===')
for n in wf3['nodes']:
    if n['name'] == 'Build Classification Request':
        code = n['parameters'].get('jsCode', '')
        print(f'  [{"OK" if "cost_sensitivity" in code else "FAIL"}] Builder: cost_sensitivity in prompt')
        print(f'  [{"OK" if "Very High" in code else "FAIL"}] Builder: Very High tier present')
        print(f'  [{"OK" if "16384" in code else "FAIL"}] Builder: maxOutputTokens=16384')
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text', '')
        print(f'  [{"OK" if "COST SENSITIVITY DISCOUNT CAPS" in text else "FAIL"}] Node 8: cost cap section present')
        print(f'  [{"OK" if "Very High" in text else "FAIL"}] Node 8: Very High cap rule present')
        print(f'  [{"OK" if "precedence over" in text else "FAIL"}] Node 8: cap precedence rule present')
        print(f'  Node 8: {len(text)} chars total')
