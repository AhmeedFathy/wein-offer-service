import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/executions', params={'workflowId': WF_ID, 'limit': 5})
body = r.json()
execs = body.get('data', {})
if isinstance(execs, dict):
    execs = execs.get('data', [])

if not execs:
    print('No executions found'); sys.exit()

for ex in execs[:3]:
    print(f"Execution {ex.get('id')}: status={ex.get('status')} started={ex.get('startedAt','')}")

eid = execs[0]['id']
r2  = s.get(f'{N8N_BASE}/rest/executions/{eid}')
data = r2.json().get('data', {})
run_data = data.get('data', {}).get('resultData', {}).get('runData', {})

print(f'\nNodes that ran: {list(run_data.keys())}')

for node_name in ['Build Classification Request', 'Classify All Menu Items (Gemini)', 'Parse Classification']:
    node_run = run_data.get(node_name)
    if not node_run:
        print(f'\n  {node_name}: did not run in this execution')
        continue
    try:
        out = node_run[0]['data']['main'][0][0]['json']
        if node_name == 'Parse Classification':
            count = out.get('count', len(out.get('classified_items', [])))
            print(f'\n  Parse Classification: {count} items classified')
            items = out.get('classified_items', [])
            for item in items[:5]:
                print(f'    {item.get("name","?")} | {item.get("me_class","?")} | {item.get("bundle_role","?")}')
            if len(items) > 5:
                print(f'    ... and {len(items)-5} more')
        elif node_name == 'Build Classification Request':
            bs = out.get('bodyString', '')
            print(f'\n  Build Request: bodyString={len(bs)} chars')
            try:
                cfg = json.loads(bs).get('generationConfig', {})
                print(f'    maxOutputTokens={cfg.get("maxOutputTokens")}')
            except Exception:
                pass
        elif node_name == 'Classify All Menu Items (Gemini)':
            candidates = out.get('candidates', [])
            if candidates:
                txt = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                finish = candidates[0].get('finishReason', '?')
                print(f'\n  Gemini: {len(txt)} chars, finishReason={finish}')
    except Exception as e:
        print(f'  {node_name}: error — {e}')
