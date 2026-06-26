"""Trigger pipeline, poll, decode result cleanly using n8n include=data param."""
import requests, json, sys, re, time
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})

# Trigger
r   = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/run',
             json={'startNodes': [], 'destinationNode': ''})
eid = r.json()['data']['executionId']
print(f'Execution {eid} started — polling...')

# Poll
deadline = time.time() + 540
while time.time() < deadline:
    d    = s.get(f'{N8N_BASE}/rest/executions/{eid}').json()['data']
    stat = d.get('status')
    if stat in ('success', 'error', 'crashed'):
        elapsed = int(time.time() - (deadline - 540))
        print(f'\nStatus: {stat}  ({elapsed}s)')
        break
    time.sleep(10)
    print('.', end='', flush=True)
else:
    print('\nTIMEOUT'); sys.exit(1)

# Parse the compressed execution data iteratively (no recursion)
raw_str = d.get('data', '')
if not isinstance(raw_str, str):
    raw_str = json.dumps(raw_str)

# Strategy: extract node run blocks by regex on the raw string
# n8n stores runData as {"NodeName":[{"startTime":...},...]}
# In the compressed format, node names map to index strings — but the actual
# node names appear as keys. Scan for patterns in the raw JSON.

# Get last-node and top-level error
last_node_m = re.search(r'"lastNodeExecuted"\s*:\s*"([^"]+)"', raw_str)
error_m     = re.search(r'"message"\s*:\s*"([^"]{10,300})"', raw_str)
last_node   = last_node_m.group(1) if last_node_m else '?'
error_msg   = error_m.group(1) if error_m and stat != 'success' else ''

print(f'Last node: {last_node}')
if error_msg:
    print(f'Error: {error_msg[:250]}')

# Identify which branch ran
branch_indicators = {
    'Normalise DB Items':       'DB branch (known provider — skipped Gemini)',
    'Parse Classification':     'Gemini branch (new provider)',
    'Build Classification Request': 'Gemini branch (new provider)',
}
branch = 'unknown'
for key, label in branch_indicators.items():
    # Node names appear as JSON keys in runData
    if f'"{key}"' in raw_str:
        branch = label
        break

print(f'Menu branch: {branch}')

# Count items / offers from raw string patterns
def count_pattern(text, pattern):
    return len(re.findall(pattern, text))

if stat == 'success':
    # Find approximate offer count by counting "status":"Selected"
    selected_count = count_pattern(raw_str, r'"status"\s*:\s*"Selected"')
    # Find menu item count
    me_class_count = count_pattern(raw_str, r'"me_class"\s*:')
    # Find total offer id count in offers array
    # Look for the Parse Offer Data section
    pod_match = re.search(r'"Parse Offer Data"', raw_str)
    print(f'\nParse Offer Data output (estimated):')
    print(f'  "Selected" offers: ~{selected_count}')
    print(f'  menu_items (me_class refs): ~{me_class_count}')

    print(f'\nPIPELINE COMPLETE - SUCCESS')
    if 'DB branch' in branch:
        print('  DB branch confirmed: Gemini classification was SKIPPED')
        print('  Almayass items read from wein_menu_items table')
    else:
        print(f'  Branch: {branch}')
else:
    print(f'\nPIPELINE FAILED')
    print(f'  Node: {last_node}')
    print(f'  Error: {error_msg[:300]}')
    sys.exit(1)
