import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/201')
full = r.json()['data']
data_field = json.loads(full['data'])
pool = data_field

def pg(v, depth=0, visited=None):
    if visited is None:
        visited = set()
    if depth > 30:
        return v
    if isinstance(v, str) and v.isdigit():
        idx = int(v)
        if idx in visited or idx >= len(pool):
            return v
        visited = visited | {idx}
        return pg(pool[idx], depth+1, visited)
    return v

run_data = pg(pool[2]['runData'])
node8_raw = pg(run_data['🏗️ 8. wein-creator — Build Full Offers'])
run = pg(node8_raw[0])
data = pg(run['data'])
main = pg(data['main'])
item0 = pg(main[0])
entry = pg(item0[0])
j = pg(entry['json'])
out = pg(j.get('output', j.get('text', '')))

offer_data = json.loads(out)

# Print first offer full JSON
print('=== FIRST OFFER FIELDS ===')
print(json.dumps(offer_data['offers'][0], indent=2, ensure_ascii=False))

print('\n=== TOP-LEVEL KEYS ===')
print(list(offer_data.keys()))

# Check if model used different field names
o = offer_data['offers'][0]
print('\n=== OFFER KEYS ===')
print(list(o.keys()))
