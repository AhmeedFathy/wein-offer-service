import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
conns = wf.get('connections', {})

print('BEFORE fix:')
print(f'  Merge Form+Webhook -> {[c["node"] for ports in conns.get("🔀 Merge Form + Webhook", {}).values() for pl in ports for c in pl]}')
print(f'  Form -> Has Menu File?: {any(c["node"] == "Has Menu File?" for ports in conns.get("📝 Form — New Provider", {}).values() for pl in ports for c in pl)}')

# Plan:
# 1. Remove direct connection from Form -> Has Menu File?
# 2. Add connection: Merge Form+Webhook -> Has Menu File? (port 0, input 0)
# Note: n8n connections format: { "NodeName": { "main": [[{ "node": ..., "type": "main", "index": 0 }]] } }

# Remove Form -> Has Menu File? connection
form_key = '📝 Form — New Provider'
if form_key in conns:
    main_ports = conns[form_key].get('main', [])
    for port_idx, port_list in enumerate(main_ports):
        main_ports[port_idx] = [c for c in port_list if c.get('node') != 'Has Menu File?']

# Add Merge Form+Webhook -> Has Menu File? (port 0)
merge_key = '🔀 Merge Form + Webhook'
if merge_key not in conns:
    conns[merge_key] = {'main': [[]]}

if 'main' not in conns[merge_key]:
    conns[merge_key]['main'] = [[]]

# Ensure port 0 exists
while len(conns[merge_key]['main']) < 1:
    conns[merge_key]['main'].append([])

# Add the connection to port 0 if not already there
if not any(c.get('node') == 'Has Menu File?' for c in conns[merge_key]['main'][0]):
    conns[merge_key]['main'][0].append({
        'node': 'Has Menu File?',
        'type': 'main',
        'index': 0
    })

print('\nAFTER fix:')
print(f'  Merge Form+Webhook -> {[c["node"] for ports in conns.get("🔀 Merge Form + Webhook", {}).values() for pl in ports for c in pl]}')
print(f'  Form -> Has Menu File?: {any(c["node"] == "Has Menu File?" for ports in conns.get("📝 Form — New Provider", {}).values() for pl in ports for c in pl)}')

wf['connections'] = conns
resp = s.patch(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd',
    json={'nodes': wf['nodes'], 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')

# Get new versionId and activate
r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf2 = r2.json()['data']
new_vid = wf2.get('versionId')
print(f'New versionId: {new_vid}')

# Deactivate
s.post(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd/deactivate')
import time; time.sleep(1)
# Activate with new version
r_act = s.post(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd/activate', json={'versionId': new_vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}')
print(f'activeVersionId: {wf3.get("activeVersionId")}')

# Verify connection
conns3 = wf3.get('connections', {})
merge_out = [c['node'] for ports in conns3.get('🔀 Merge Form + Webhook', {}).values() for pl in ports for c in pl]
print(f'\nMerge Form+Webhook connects to: {merge_out}')
