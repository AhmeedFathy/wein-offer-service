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

PARSE_CODE = r"""const raw = $json.candidates?.[0]?.content?.parts?.[0]?.text || '';
let cleaned = raw.trim();

// Strip markdown fences
if (cleaned.startsWith('`')) {
  const lines = cleaned.split('\n');
  cleaned = lines.slice(1).join('\n');
  cleaned = cleaned.replace(/```[\s\S]*$/, '').trim();
}

// Find JSON array start
const start = cleaned.indexOf('[');
if (start < 0) throw new Error('No JSON array in Gemini response: ' + cleaned.slice(0,200));
cleaned = cleaned.slice(start);

// Try full parse first
let classified;
try {
  const end = cleaned.lastIndexOf(']');
  classified = JSON.parse(cleaned.slice(0, end + 1));
} catch(e) {
  // Truncated — find last complete object and close array
  const lastComplete = cleaned.lastIndexOf('},');
  if (lastComplete < 0) throw new Error('Cannot recover truncated response: ' + e.message);
  classified = JSON.parse(cleaned.slice(0, lastComplete + 1) + ']');
}

return [{ json: { classified_items: classified, count: classified.length } }];"""

for n in nodes:
    # FIX 1 — bump maxOutputTokens in builder Code node
    if n['name'] == 'Build Classification Request':
        code = n['parameters']['jsCode']
        old = 'maxOutputTokens: 8192'
        new = 'maxOutputTokens: 16384'
        if old in code:
            n['parameters']['jsCode'] = code.replace(old, new, 1)
            print('FIX 1 OK: maxOutputTokens 8192 -> 16384')
        else:
            print(f'FIX 1 WARN: anchor not found — current snippet: {code[code.find("maxOutput"):code.find("maxOutput")+40]}')

    # FIX 2 — replace Parse Classification code
    if n['name'] == 'Parse Classification':
        old_len = len(n['parameters'].get('jsCode', ''))
        n['parameters']['jsCode'] = PARSE_CODE
        print(f'FIX 2 OK: Parse Classification updated ({old_len} -> {len(PARSE_CODE)} chars)')

# PATCH
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

# VERIFY
r3  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}')
for n in wf3['nodes']:
    if n['name'] == 'Build Classification Request':
        code = n['parameters'].get('jsCode', '')
        ok = 'OK' if 'maxOutputTokens: 16384' in code else 'FAIL'
        print(f'  [{ok}] Builder maxOutputTokens = 16384')
    if n['name'] == 'Parse Classification':
        code = n['parameters'].get('jsCode', '')
        ok = 'OK' if 'lastComplete' in code else 'FAIL'
        print(f'  [{ok}] Parse Classification has truncation recovery')
