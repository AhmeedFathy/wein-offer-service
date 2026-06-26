"""Read execution 235 result without recursive deref."""
import requests, json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})

r  = s.get(f'{N8N_BASE}/rest/executions/235')
d  = r.json()['data']
print(f'Execution 235: status={d["status"]}')
print(f'  started={d["startedAt"]}  stopped={d["stoppedAt"]}')

# The compressed data is a JSON array where string digits are back-references.
# Use sys.setrecursionlimit and iterative approach.
raw = d.get('data', '')
if not isinstance(raw, str):
    raw = json.dumps(raw)

# Extract node names and error status from the raw string directly
# The runData section lists node names as keys — extract them
node_pattern = re.compile(r'"([^"]+)":\[\{"startTime"')
nodes_found  = node_pattern.findall(raw)

print(f'\nNodes that ran ({len(nodes_found)}):')
for name in nodes_found:
    # Check if there's an error near this node name in the raw string
    idx = raw.find(f'"{name}":[')
    snippet = raw[idx:idx+500] if idx >= 0 else ''
    has_err = '"error":{' in snippet and '"message"' in snippet
    tag = 'ERR' if has_err else ' ok'
    print(f'  [{tag}] {name}')

# Extract specific values of interest using regex
def extract_field(text, field):
    m = re.search(rf'"{re.escape(field)}":\s*"?([^",\]}}]+)', text)
    return m.group(1) if m else None

# Find Parse Offer Data output
pod_idx = raw.find('"Parse Offer Data":[')
if pod_idx >= 0:
    pod_chunk = raw[pod_idx:pod_idx+2000]
    # Count offers
    offer_count = pod_chunk.count('"id":')
    menu_count  = len(re.findall(r'"me_class":', pod_chunk))
    selected    = len(re.findall(r'"Selected"', pod_chunk))
    print(f'\nParse Offer Data output (approx):')
    print(f'  offer id refs: {offer_count}')
    print(f'  menu_items (me_class):  {menu_count}')
    print(f'  "Selected" occurrences: {selected}')

# Check which branch was taken (DB vs Gemini)
has_normalise = any('Normalise DB Items' in n for n in nodes_found)
has_gemini    = any('Parse Classification' in n for n in nodes_found)
branch = 'DB (known provider)' if has_normalise else ('Gemini (new provider)' if has_gemini else 'skipped/unknown')
print(f'\nMenu items branch: {branch}')

# Look for the lastNodeExecuted
m = re.search(r'"lastNodeExecuted":"([^"]+)"', raw)
if m: print(f'Last node executed: {m.group(1)}')

# Error check
if d['status'] == 'error':
    m2 = re.search(r'"message":"([^"]+)"', raw)
    if m2: print(f'ERROR: {m2.group(1)[:300]}')
else:
    print(f'\nPIPELINE COMPLETED SUCCESSFULLY')
