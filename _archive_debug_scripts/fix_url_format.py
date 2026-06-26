import requests, time, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'
SB_URL   = 'https://iwyufqeqtjbbojunomgq.supabase.co'
UUID_EXPR = "$('Lookup Provider UUID').item.json.id"

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

# Exact format copied from working "Clear Old Menu Items":
#   =https://...?provider_id=eq.{{expr}}&...
# No spaces around {{}}, no = inside expression, leading = on the whole string
FIXES = {
    'Check Existing Items Count': (
        f"={SB_URL}/rest/v1/wein_menu_items"
        f"?provider_id=eq.{{{{{UUID_EXPR}}}}}"
        f"&select=id&limit=1"
    ),
    'Read Existing Items from DB': (
        f"={SB_URL}/rest/v1/wein_menu_items"
        f"?provider_id=eq.{{{{{UUID_EXPR}}}}}"
        f"&select=*&limit=500&order=item_name.asc"
    ),
}

for n in nodes:
    if n['name'] in FIXES:
        new_url = FIXES[n['name']]
        n['parameters']['url']    = new_url
        n['parameters']['method'] = 'GET'
        n['parameters'].pop('sendQuery', None)
        n['parameters'].pop('queryParameters', None)
        print(f'Fixed: {n["name"]}')
        print(f'  url={new_url}')

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
print()
for n in wf3['nodes']:
    if n['name'] in FIXES:
        url    = n['parameters'].get('url', '')
        method = n['parameters'].get('method', '')
        ok_eq  = 'OK' if url.startswith('=https://') else 'FAIL'
        ok_exp = 'OK' if "{{" in url and '={{ ' not in url else 'FAIL'
        ok_met = 'OK' if method == 'GET' else 'FAIL'
        print(f'=== {n["name"]} ===')
        print(f'  [{ok_eq}]  starts with =https://')
        print(f'  [{ok_exp}] expression uses {{{{}} not ={{ }}')
        print(f'  [{ok_met}] method = {method}')
        print(f'  url={url}')
