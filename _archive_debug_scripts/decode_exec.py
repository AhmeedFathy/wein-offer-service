"""Decode n8n's compressed execution data format."""
import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/executions/234')
raw_data = r.json()['data']
status   = raw_data['status']
print(f'Execution 234: status={status}')
print(f'last node: will check error object')

# n8n stores data as a JSON-encoded string with back-references
# Parse it
compressed = raw_data['data']           # this is a JSON string
decoded    = json.loads(compressed)     # becomes a list

# The list is: [root_obj, ...ref_table...]
# root_obj uses string keys like "0", "1" etc. as back-refs into the list
def deref(val, table):
    if isinstance(val, str) and val.isdigit():
        idx = int(val)
        if idx < len(table):
            return deref(table[idx], table)
        return val
    if isinstance(val, dict):
        return {k: deref(v, table) for k, v in val.items()}
    if isinstance(val, list):
        return [deref(v, table) for v in val]
    return val

root  = decoded[0]
table = decoded      # each entry can be a ref to another index

# Expand root
expanded = deref(root, table)

# Now dig for the error and runData
result_data = expanded.get('resultData', {})
run_data    = result_data.get('runData', {})
error       = result_data.get('error', {})
last_node   = result_data.get('lastNodeExecuted', '?')

print(f'Last node executed: {last_node}')
if error:
    print(f'Error message: {error.get("message","")[:500]}')
    print(f'Error description: {error.get("description","")[:500]}')

print(f'\nNodes that ran ({len(run_data)}):')
for name, runs in run_data.items():
    err = None
    try:
        for run in runs:
            if isinstance(run, dict) and run.get('error'):
                err = run['error']
                break
    except: pass
    tag = 'ERR' if err else ' ok'
    extra = ''
    if err:
        extra = f'  | {(err.get("message") or err.get("description",""))[:150]}'
    # Try to get output
    try:
        out = runs[0]['data']['main'][0][0]['json']
        if name == 'Parse Offer Data':
            extra = f'  | offers={len(out.get("offers",[]))} menu={len(out.get("menu_items",[]))}'
        elif name == 'Lookup Provider UUID':
            extra = f'  | id={str(out.get("id",""))[:12]}'
        elif name in ('Check Existing Items Count', 'Has Existing Menu Items?', 'Normalise DB Items', 'Branch on Existing Items'):
            extra = f'  | {str(out)[:80]}'
    except: pass
    print(f'  [{tag}] {name}{extra}')
