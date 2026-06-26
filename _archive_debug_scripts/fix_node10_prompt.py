import requests, json, time, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

# Pipeline-adapted version of the skill — auto-runs, no pause, outputs structured format
NODE10_TEXT = """=You are wein-titles.

Provider: {{$('Fix Merged Data').item.json.provider_name}} | Vertical: {{$('Fix Merged Data').item.json.vertical}}
Provider profile: {{$('Fix Merged Data').item.json.provider_profile}}

ANTI-HALLUCINATION RULE: Only use location, view, atmosphere, and peak moment details confirmed in the provider_profile above. Never invent a sea view, mountain, or landmark that is not mentioned. If provider_profile is empty, use only the provider name and vertical.

Your task: For each SELECTED offer below, generate 3 title options across the 6 strategies. Then immediately recommend the BEST title for each offer — do not pause or ask for input.

──────────────────────────────────────────────
STRATEGY 1 — LOCATION HOOK
Make the location feel like a character. Never write "with sea views" or "overlooking the mountains."
Instead make the location DO something: it watches, surrounds, silences, changes the mood.
WEAK: "Dinner with mountain views" → STRONG: "Where the mountains watch you eat"
WEAK: "Sea view dining" → STRONG: "Nothing between you and the Red Sea"

STRATEGY 2 — TIME / RITUAL
Reference the time of day, day of week, or a recurring ritual. Make it feel like a tradition.
Examples: "Friday Sunset Dinner for Two" / "Morning Before the Heat" / "Late Night Table, Soho Square"

STRATEGY 3 — IDENTITY / OCCASION
Reference who the customer is or what they celebrate. Make them feel seen.
Examples: "Last Night in Sharm — Make It Count" / "Anniversary Night Out" / "Girls' Day at the Spa"

STRATEGY 4 — SCARCITY / EXCLUSIVITY
Only use if scarcity is real or implied. Limited seats, private format, reservation-only.
Examples: "Private Lagoon Table — 6 Seats Per Night" / "By Reservation Only"

STRATEGY 5 — TRANSFORMATION
Sell the after-state: how they feel after the experience. Best for spa, wellness, premium dining.
Examples: "Float Out Feeling New" / "Leave Lighter — 90-Minute Reset" / "Unplug for Two Hours"

STRATEGY 6 — SENSORY / CRAVING
Do NOT list ingredients. Make them taste it before they order. Use specific physical detail.
WEAK: "Grilled Fish Dinner" → STRONG: "Still Sizzling When It Reaches Your Table"
WEAK: "Dessert for Two" → STRONG: "The Kind of Waffle That Makes Conversation Stop"
──────────────────────────────────────────────

OUTPUT FORMAT — strictly follow this for every selected offer:
Offer [id]: [Best single recommended title]

Only output selected offers (status = "Selected"). One line per offer. No extra commentary.

Offers:
{{$('🏗️ 8. wein-creator — Build Full Offers').item.json.text}}"""

for n in nodes:
    if n['name'] == '🏷️ 10. wein-titles — Generate Titles':
        old_len = len(n['parameters'].get('text', ''))
        n['parameters']['text'] = NODE10_TEXT
        print(f'✅ Node 10 updated: {old_len} → {len(NODE10_TEXT)} chars')
        # Verify strategies
        for strat in ['LOCATION HOOK', 'TIME / RITUAL', 'IDENTITY / OCCASION',
                       'SCARCITY', 'TRANSFORMATION', 'SENSORY / CRAVING']:
            ok = '✅' if strat in NODE10_TEXT else '❌'
            print(f'  {ok} Strategy: {strat}')
        ok = '✅' if 'ANTI-HALLUCINATION' in NODE10_TEXT else '❌'
        print(f'  {ok} Anti-hallucination rule')
        ok = '✅' if 'Offer [id]:' in NODE10_TEXT else '❌'
        print(f'  {ok} Output format: "Offer [id]: [title]"')
        break

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

# Final state check
print('\n=== FINAL STATE ===')
for n in wf3['nodes']:
    if n['name'] == '🏷️ 10. wein-titles — Generate Titles':
        t = n['parameters'].get('text','')
        print(f'Node 10: {len(t)} chars, strategies present: {all(s in t for s in ["LOCATION HOOK","SENSORY / CRAVING","SCARCITY","TRANSFORMATION"])}')
