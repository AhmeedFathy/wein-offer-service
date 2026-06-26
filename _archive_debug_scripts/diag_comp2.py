import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

r = s.get(f'{N8N_BASE}/rest/executions/213', timeout=30)
full = r.json()['data']
pool = json.loads(full['data'])

def resolve(pool, v, depth=0):
    if depth > 10: return v
    try:
        idx = int(v)
        if 0 <= idx < len(pool): return resolve(pool, pool[idx], depth+1)
    except: pass
    return v

run_data = resolve(pool, pool[2].get('runData'))
node8_key = next((k for k in run_data if 'creator' in k.lower()), None)
ref = run_data[node8_key]
runs = resolve(pool, ref)
ri8 = resolve(pool, runs[0])
d8 = resolve(pool, ri8.get('data', {}))
main8 = resolve(pool, d8.get('main', []))
p8 = resolve(pool, main8[0])
i8 = resolve(pool, p8[0])
j8 = resolve(pool, i8.get('json', {}))
text8 = resolve(pool, j8.get('text', ''))

# Find "comparisons" in the raw output
import re
# Show all field names found in offers
fields_found = set(re.findall(r'"([a-z_]+)":\s*(?:\[|\{|"|\d)', text8))
print('Field names in node 8 output:')
for f in sorted(fields_found):
    print(f'  {f}')

# Find comparison-related fields specifically
print('\nComparison-related fields and their context:')
for pat in ['comparison', 'versus', 'competitor', 'waffarha', 'market_price', 'regular_egp', 'original_price']:
    matches = [(m.start(), text8[max(0,m.start()-20):m.start()+100]) for m in re.finditer(pat, text8, re.IGNORECASE)]
    if matches:
        print(f'\n  "{pat}" found {len(matches)} times:')
        for pos, ctx in matches[:2]:
            print(f'    pos {pos}: ...{ctx.replace(chr(10)," ")}...')

# Show offer[0] full structure (first 800 chars of first offer)
offer_start = text8.find('"offers"')
if offer_start >= 0:
    # Find the first offer object
    first_offer_start = text8.find('{', offer_start + 10)
    print(f'\n=== First offer structure (first 1200 chars) ===')
    print(text8[first_offer_start:first_offer_start+1200])
