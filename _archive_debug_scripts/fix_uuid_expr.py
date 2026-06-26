import requests, json, time, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'
SB_URL   = 'https://iwyufqeqtjbbojunomgq.supabase.co'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

for n in nodes:
    if n['name'] == 'Clear Old Menu Items':
        old_url = n['parameters'].get('url', '')
        n['parameters']['url'] = (
            f"={SB_URL}/rest/v1/wein_menu_items"
            "?provider_id=eq.{{$('Lookup Provider UUID').item.json.id}}"
        )
        print(f'Clear Old Menu Items URL:')
        print(f'  OLD: {old_url}')
        print(f'  NEW: {n["parameters"]["url"]}')

    if n['name'] == 'Save Menu to DB':
        # Fix [0].id → .id in the body expression too
        body = n['parameters'].get('body', '')
        if '[0].id' in body:
            n['parameters']['body'] = body.replace(
                "$('Lookup Provider UUID').item.json[0].id",
                "$('Lookup Provider UUID').item.json.id"
            )
            print(f'Save Menu to DB body: fixed [0].id → .id')
        else:
            print(f'Save Menu to DB body: already correct')

resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
print(f'active: {r3.json()["data"].get("active")}, activeVersionId: {r3.json()["data"].get("activeVersionId")}')

# Verify
for n in r3.json()['data']['nodes']:
    if n['name'] in ('Clear Old Menu Items', 'Save Menu to DB'):
        print(f'\n{n["name"]}:')
        print(f'  url : {n["parameters"].get("url","")}')
        body = n["parameters"].get("body","")
        if body:
            print(f'  body: {body[:120]}...')
