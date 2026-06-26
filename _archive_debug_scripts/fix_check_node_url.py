import requests, json, time, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'
SB_URL   = 'https://iwyufqeqtjbbojunomgq.supabase.co'
SB_KEY   = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
            'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXVmcWVxdGpiYm9qdW5vbWdxIiwicm9sZSI6'
            'InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2NDYyNiwiZXhwIjoyMDk2MjQwNjI2fQ.'
            'LLT4142UHWlfNnaMQaa_DRe44o2lWzOUavVvR3ceyoA')

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

# Also fix Read Existing Items from DB — same bug
FIXES = {
    'Check Existing Items Count': (
        f"{SB_URL}/rest/v1/wein_menu_items"
        f"?provider_id=eq.={{{{ $('Lookup Provider UUID').item.json.id }}}}"
        f"&select=id&limit=1"
    ),
    'Read Existing Items from DB': (
        f"{SB_URL}/rest/v1/wein_menu_items"
        f"?provider_id=eq.={{{{ $('Lookup Provider UUID').item.json.id }}}}"
        f"&select=*&limit=500&order=item_name.asc"
    ),
}

for n in nodes:
    if n['name'] in FIXES:
        new_url = FIXES[n['name']]
        old_url = n['parameters'].get('url', '')
        n['parameters']['url'] = new_url
        # Remove sendQuery / queryParameters — filters are now in the URL
        n['parameters'].pop('sendQuery', None)
        n['parameters'].pop('queryParameters', None)
        print(f'Fixed: {n["name"]}')
        print(f'  OLD: {old_url}')
        print(f'  NEW: {new_url}')

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
    if n['name'] in FIXES:
        url = n['parameters'].get('url', '')
        has_qp = 'queryParameters' in n['parameters']
        ok_url  = 'OK' if "eq.={{" in url and 'provider_id' in url else 'FAIL'
        ok_qp   = 'OK' if not has_qp else 'FAIL'
        print(f'  [{ok_url}] {n["name"]}: URL has inline filter')
        print(f'  [{ok_qp}] {n["name"]}: no queryParameters block')
        print(f'       url={url}')
