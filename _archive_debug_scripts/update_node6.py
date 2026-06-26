import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

NEW_TEXT = """=You are wein-innovate.
Provider: {{ $('🔀 Merge Menu Paths').item.json.provider_name }} | Vertical: {{ $('🔀 Merge Menu Paths').item.json.vertical }}
Menu: {{ $('🔀 Merge Menu Paths').item.json.menu_or_services }}

Generate 20 concepts covering ALL party sizes and tiers:
- Concepts 1-5: Solo (Entry, Core, Premium + 2 variations)
- Concepts 6-10: Couple (Entry, Core, Premium + 2 variations)
- Concepts 11-15: Group (Entry, Core, Premium + 2 variations)
- Concepts 16-20: Family (Entry, Core, Premium + 2 variations)

Similar WeIN offers from our portfolio (use as grounding — match pricing patterns, avoid duplicating hooks):
{{ JSON.stringify($('🔀 Merge Recall Results').item.json.wein_recall_results) }}

Waffarha competitor benchmark (beat by +5-7 points):
{{ JSON.stringify($('🔀 Merge Recall Results').item.json.waffarha_recall_results) }}

Each concept must have:
- party_size (Solo / Couple / Group / Family)
- tier (Entry / Core / Premium)
- core hook type (from the 11 WeIN science hooks)
- one-line description of the bundle idea
- why this concept fits this provider based on the recall examples and competitor data"""

updated = False
for node in wf['nodes']:
    if node['name'] == '✨ 6. wein-innovate — 20 Concepts':
        node['parameters']['text'] = NEW_TEXT
        print(f'Updated node: {node["name"]}')
        print(f'New text length: {len(NEW_TEXT)} chars')
        updated = True
        break

if not updated:
    print('ERROR: node 6 not found by exact name')
    sys.exit(1)

resp = s.patch(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd',
    json={'nodes': wf['nodes'], 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print('PATCH status:', resp.status_code)

# Verify
r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
for node in r2.json()['data']['nodes']:
    if node['name'] == '✨ 6. wein-innovate — 20 Concepts':
        t = node['parameters']['text']
        print('Verified length:', len(t))
        print('Has Merge Recall Results:', 'Merge Recall Results' in t)
        print('Has wein_recall_results:', 'wein_recall_results' in t)
        print('Has waffarha_recall_results:', 'waffarha_recall_results' in t)
        print('Has Family:', 'Family' in t)
        print('Has old intel ref:', 'wein-intel' in t)
        print('Has old advisor ref:', 'wein-advisor' in t or 'wein-selector' in t)
        break
