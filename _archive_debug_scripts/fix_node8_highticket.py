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
HIGH-TICKET ENFORCEMENT (mandatory)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every offer MUST be anchored by the highest-priced Star item available for that party size and tier.

For Dining verticals:
- Main course proteins (grills, steaks, ribs, seafood) MUST appear as hero in at least 8 of the 20 offers
- Cap on any single item appearing as hero: MAX 2 offers across the full 20-offer portfolio
- Cap on any single category as hero: MAX 3 offers (e.g. max 3 Manakish-led offers total)
- Cheap items (under 150 EGP) can ONLY appear as Support/Filler — NEVER as hero
- Minimum hero item price: at least 30% above the menu average price

ITEM USAGE CAPS (strict):
- Each menu item can appear in AT MOST 2 offers total
- Manakish category: MAX 1 offer where it is the hero item
- Beverages and water: only as filler — never counted as part of the bundle value
- If a Star item is already used as hero twice, use the next highest Star item

TICKET TARGETS per tier:
- Entry: promo price 150–400 EGP
- Core: promo price 400–900 EGP
- Premium: promo price 900–2,500 EGP
- Family Premium: promo price 1,500–4,000 EGP

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
- Apply HIGH-TICKET ENFORCEMENT rules above before selecting any item
- Select behavioral science hook matched by party_size × tier (11 WeIN hooks)
- Apply PRAB selector structure for dining offers
- Set promo price ending in 9 or 5, within the TICKET TARGET range for that tier
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

for n in nodes:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        old_len = len(n['parameters'].get('text', ''))
        n['parameters']['text'] = NODE8_TEXT
        print(f'Node 8 updated: {old_len} -> {len(NODE8_TEXT)} chars')
        checks = [
            'HIGH-TICKET ENFORCEMENT',
            'ITEM USAGE CAPS',
            'TICKET TARGETS',
            'Manakish category: MAX 1',
            'STEP 1',
            'STEP 2',
            'OUTPUT CONTRACT',
            'SOFT OPENING CAP',
        ]
        for c in checks:
            ok = 'OK' if c in NODE8_TEXT else 'FAIL'
            print(f'  [{ok}] {c}')
        break

resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
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
print(f'active: {wf3.get("active")}')
for n in wf3['nodes']:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        t = n['parameters'].get('text', '')
        print(f'Node 8 live: {len(t)} chars')
        print(f'  [{"OK" if "HIGH-TICKET ENFORCEMENT" in t else "FAIL"}] HIGH-TICKET ENFORCEMENT present')
        print(f'  [{"OK" if "ITEM USAGE CAPS" in t else "FAIL"}] ITEM USAGE CAPS present')
        print(f'  [{"OK" if "TICKET TARGETS" in t else "FAIL"}] TICKET TARGETS present')
