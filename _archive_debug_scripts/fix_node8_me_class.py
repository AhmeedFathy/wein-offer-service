import requests, json, time, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

# ── Node 8: updated system message ──────────────────────────────────────────
NODE8_TEXT = """=You are wein-creator.

Provider: {{$('Fix Merged Data').item.json.provider_name}}
Vertical: {{$('Fix Merged Data').item.json.vertical}}
Full menu (text): {{$('Fix Merged Data').item.json.menu_or_services}}
Menu items (structured): {{JSON.stringify($('Fix Merged Data').item.json.menu_items)}}

WeIN Portfolio Recall (similar offers — match pricing, avoid duplicating hooks):
{{ JSON.stringify($('🔀 Merge Recall Results').item.json.wein_recall_results) }}

Waffarha Competitor Benchmark (beat by +5-7 pts — add +6 above highest discount found):
{{ JSON.stringify($('🔀 Merge Recall Results').item.json.waffarha_recall_results) }}

Note: Waffarha matches may be from Cairo or other cities. This is expected — WeIN is first to market in Sharm El Sheikh. Use as a general F&B discount baseline only. Do not refuse to generate offers due to low similarity scores.

Innovate — 20 Concepts:
{{$('✨ 6. wein-innovate — 20 Concepts').item.json.output}}

Scored & Ranked Concepts:
{{$('🏆 7. wein-score — Score & Rank Concepts').item.json.output}}

Auto-Picked Concepts:
{{$('7b. wein-concepts — Auto-Pick Concepts').item.json.output}}

Provider profile for titles (infer from menu and location context above):
- Infer location, view, atmosphere, and peak moments from the menu text and provider name
- Do NOT ask clarifying questions about location or atmosphere
- Do NOT wait for confirmation on any details
- Proceed directly to building all 20 offers now

SOFT OPENING CAP: Maximum 40% discount for ALL verticals. Never exceed 40% regardless of competitor data or floor rules.

DISCOUNT FLOORS (never go below these regardless of menu prices):
- Dining: 20% minimum (target 20-35%, push to 40% vs competition)
- Fun & Activities: 25% minimum (target 25-40%)
- Health & Beauty: 15% minimum (target 15-30%)
- Hotels & Aqua Park: 20% minimum (target 20-40%)

If the Waffarha recall shows competitor discounts above these floors,
add 5-7 percentage points on top of the highest competitor discount.
Never go below the floor for any offer in any tier.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — CLASSIFY ALL MENU ITEMS (ME Matrix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before building offers, classify every item from the menu using the ME (Menu Engineering) matrix.
Cap at the top 50 most bundle-relevant items if the menu has 50+ items.
Prioritise: high-price mains, signature dishes, proteins, premium items.
Skip: water, plain bread, basic condiments.

ME CLASS RULES:
  Star      → High popularity + High margin  → bundle_role: Hero
  Plowhorse → High popularity + Low margin   → bundle_role: Support
  Puzzle    → Low popularity  + High margin  → bundle_role: Premium
  Dog       → Low popularity  + Low margin   → bundle_role: Filler (eligible: false)

CLASSIFICATION HINTS:
  - High-price proteins (steaks, ribs, seafood platters) → Star or Puzzle
  - Signature / chef's special / unique to this venue   → Star
  - Common mezze, salads, hummus                        → Plowhorse
  - Expensive but less-ordered desserts                 → Puzzle
  - Beverages, juices, soft drinks                      → Plowhorse
  - Basic sides, bread, dips                            → Plowhorse or Dog
  - Premium tasting menus or set menus                  → Star

Output the classified list as the top-level "menu_items" array (compact — no descriptions):
  {"name":"…","category":"…","price_egp":0,"me_class":"Star","bundle_role":"Hero","eligible":true}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — BUILD 20 COMPLETE OFFERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build 20 complete offers (selected + backups). For each offer:
- Select items using ME class (Heroes anchor bundles; Support/Premium add value; never Dog)
- Select behavioral science hook matched by party_size × tier (11 WeIN hooks)
- Apply PRAB selector structure for dining offers
- Set promo price ending in 9 or 5
- Apply Bundle Value Gap (12% group, 8% couple, 5% solo vs sum of parts)
- Write hook_line in the hook's correct voice
- Add upgrade_tier where applicable
- Include me_class and hook_type on every offer item

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT CONTRACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Output valid JSON with this top-level structure:
{
  "provider": "…",
  "vertical": "…",
  "waffarha_adj": "…",
  "menu_items": [ /* ALL classified items — compact */ ],
  "offers": [ /* 20 offers */ ]
}

menu_items must include ALL classified items (not just ones used in offers).
Each menu_items entry: {"name","category","price_egp","me_class","bundle_role","eligible"}
No lengthy descriptions in menu_items — keep each entry to 6 fields only."""

# ── Parse Offer Data: updated menu_items logic ───────────────────────────────
# Read the full current code
current_code = None
for n in nodes:
    if n['name'] == 'Parse Offer Data':
        current_code = n['parameters']['jsCode']
        break

# Replace the menu_items block — from "// FIX 2" through end of the meMap apply block
OLD_MENU_BLOCK = """// FIX 2: use the full Gemini-extracted menu from Fix Merged Data
const fullMenuItems = ($('Fix Merged Data').item.json.menu_items || []);
if (fullMenuItems.length > 0) offerData.menu_items = fullMenuItems;"""

NEW_MENU_BLOCK = """// Menu items: prefer node 8's classified list (has ME class for all items);
// fall back to Gemini extraction if node 8 didn't output menu_items.
if (Array.isArray(offerDataRaw.menu_items) && offerDataRaw.menu_items.length > 0) {
  // Node 8 classified all items — use directly
  offerData.menu_items = offerDataRaw.menu_items;
} else {
  // Fallback: Gemini-extracted items (no ME class yet — meMap will fill it below)
  const fullMenuItems = ($('Fix Merged Data').item.json.menu_items || []);
  if (fullMenuItems.length > 0) offerData.menu_items = fullMenuItems;
}"""

if OLD_MENU_BLOCK not in current_code:
    print('❌ FIX 2 anchor not found in Parse Offer Data — check code manually')
    print(repr(current_code[800:1100]))
    sys.exit(1)

new_pod_code = current_code.replace(OLD_MENU_BLOCK, NEW_MENU_BLOCK, 1)
print(f'✅ Parse Offer Data menu block updated ({len(current_code)} → {len(new_pod_code)} chars)')

# ── Apply both changes ───────────────────────────────────────────────────────
for n in nodes:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        n['parameters']['text'] = NODE8_TEXT
        print(f'✅ Node 8 updated ({len(NODE8_TEXT)} chars)')
        checks = ['STEP 1', 'STEP 2', 'ME CLASS RULES', 'CLASSIFICATION HINTS',
                  'OUTPUT CONTRACT', 'menu_items', 'SOFT OPENING CAP', 'DISCOUNT FLOORS']
        for c in checks:
            ok = '✅' if c in NODE8_TEXT else '❌'
            print(f'  {ok} {c}')

    if n['name'] == 'Parse Offer Data':
        n['parameters']['jsCode'] = new_pod_code

resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
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

print('\n=== VERIFICATION ===')
for n in wf3['nodes']:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        t = n['parameters'].get('text','')
        print(f'✅ Node 8: {len(t)} chars')
        print(f'  {"✅" if "STEP 1" in t else "❌"} ME classification step present')
        print(f'  {"✅" if "OUTPUT CONTRACT" in t else "❌"} Output contract present')
        print(f'  {"✅" if "Do NOT include" not in t else "❌"} Old prohibition removed')
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode','')
        print(f'\n✅ Parse Offer Data: {len(code)} chars')
        print(f'  {"✅" if "offerDataRaw.menu_items" in code else "❌"} Reads from node 8 first')
        print(f'  {"✅" if "Fix Merged Data" in code else "❌"} Falls back to Gemini extraction')
