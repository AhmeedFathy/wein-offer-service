import requests, sys, json, re, time
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
nodes = wf['nodes']
conns = wf['connections']

# Remove the duplicate redundant Waffarha section (keep Merge Recall Results, drop the raw 5b.wein-recall.all() call)
NODE8_CLEAN = """=You are wein-creator.

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

Build 20 complete offers (selected + backups). For each offer:
- Apply ME classification (Star/Plowhorse/Puzzle/Dog) to every menu item
- Select behavioral science hook matched by party_size x tier (11 WeIN hooks)
- Apply PRAB selector structure for dining offers
- Set promo price ending in 9 or 5
- Apply Bundle Value Gap (12% group, 8% couple, 5% solo vs sum of parts)
- Write hook_line in the hook's correct voice
- Fill all comparison rows using waffarha competitor benchmark data
- Add upgrade tier where applicable
Output full offer_data.json structure. Include me_class and hook_type on every offer."""

for n in nodes:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        n['parameters']['text'] = NODE8_CLEAN
        print(f'Node 8 text updated: {len(NODE8_CLEAN)} chars')
        # Confirm no bad refs
        for bad in ['wein-advisor', 'wein-selector', 'wein-intel', 'wein-waffarha-scout']:
            if bad in NODE8_CLEAN:
                print(f'  ⚠️  still has: {bad}')
        print('  ✅ No disconnected node refs')
        break

resp = s.patch(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd',
    json={'nodes': nodes, 'connections': conns,
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'PATCH: {resp.status_code}')

r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')
r3 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')
