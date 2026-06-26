import requests, sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

LOCAL_PATTERNS = [
    r'D:\\Fady\\outputs', r'D:/Fady/outputs', r'_Done', r'localhost:5000',
    r'localhost:\d+', r'C:\\', r'C:/', r'127\.0\.0\.1',
    r'file://', r'\\\\', r'wein-advisor', r'wein-selector',
    r'wein-intel', r'wein-waffarha-scout v2',
]

print('=== STEP 1: LOCAL PATH AUDIT ===\n')
hits = {}
for n in wf['nodes']:
    name = n.get('name', '')
    params = n.get('parameters', {})
    # Collect all text fields
    texts = {}
    for k in ['text', 'systemMessage', 'jsCode', 'promptType', 'options']:
        v = params.get(k)
        if isinstance(v, str) and v.strip():
            texts[k] = v
        elif isinstance(v, dict):
            for kk, vv in v.items():
                if isinstance(vv, str) and vv.strip():
                    texts[f'{k}.{kk}'] = vv
    # Also check nested
    for k, v in params.items():
        if isinstance(v, str) and v.strip() and k not in texts:
            texts[k] = v

    node_hits = []
    for field, text in texts.items():
        for pat in LOCAL_PATTERNS:
            matches = re.findall(pat, text, re.IGNORECASE)
            if matches:
                node_hits.append((field, pat, matches[0], text))

    if node_hits:
        hits[name] = node_hits

for name, node_hits in hits.items():
    print(f'NODE: {name}')
    seen_fields = set()
    for field, pat, match, text in node_hits:
        if (field, pat) not in seen_fields:
            seen_fields.add((field, pat))
            # Show snippet
            idx = text.lower().find(match.lower())
            snippet = text[max(0,idx-40):idx+80].replace('\n', ' ')
            print(f'  [{field}] matched "{pat}"')
            print(f'    ...{snippet}...')
    print()

print(f'Total nodes with local references: {len(hits)}')

# Also print all node names for reference
print('\n=== ALL NODE NAMES ===')
for n in wf['nodes']:
    disabled = ' [DISABLED]' if n.get('disabled') else ''
    print(f'  {n["name"]}{disabled}')
