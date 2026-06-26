import requests, sys, json, time
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

OLD = 'raw = raw.replace(/:\\s*to\\s+(true|false|null)/g, \': $1\');'
NEW = ('raw = raw.replace(/:\\s*to\\s+(true|false|null)/g, \': $1\');\n'
       '// 4. Fix asterisk after property name ("key"*: → "key":)\n'
       'raw = raw.replace(/"([^"]+)"\\s*\\*\\s*:/g, \'\"$1\":\');')

patched = False
for n in nodes:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        if OLD not in code:
            print(f'ERROR: anchor string not found. First 200 chars of jsCode:\n{code[:200]}')
            sys.exit(1)
        n['parameters']['jsCode'] = code.replace(OLD, NEW, 1)
        print(f'Patched. New jsCode length: {len(n["parameters"]["jsCode"])}')
        patched = True
        break

if not patched:
    print('ERROR: Parse Offer Data node not found')
    sys.exit(1)

resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'PATCH: {resp.status_code}')

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')

# Verify the patch is in the live node
for n in wf3['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        if '"([^"]+)"\\s*\\*\\s*:' in code or r'"([^"]+)"\s*\*\s*:' in code or 'asterisk' in code:
            print('✅ Fix #4 confirmed in active workflow')
        else:
            print('⚠️  Fix #4 NOT found in active workflow — check manually')
        break
