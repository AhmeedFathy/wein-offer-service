import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/201')
full = r.json()['data']
data_field = full.get('data')
if isinstance(data_field, str):
    data_field = json.loads(data_field)

pool = data_field
# pool[2] = {runData: "5", lastNodeExecuted: ...}
# pool[5] = the actual runData dict

p5 = pool[5]
print(f'pool[5] type: {type(p5)}')
if isinstance(p5, dict):
    print(f'pool[5] keys (first 10): {list(p5.keys())[:10]}')

    # Find node 8 key
    node8_key = None
    for k in p5:
        if '8' in k and 'creator' in k.lower():
            node8_key = k
            break

    if node8_key:
        raw_entry = p5[node8_key]
        print(f'\nNode 8 key: {node8_key}')
        print(f'Entry type: {type(raw_entry)}, value: {str(raw_entry)[:100]}')

        # If it's a string, it's a pool ref
        def pool_get(v, depth=0):
            if depth > 20:
                return v
            if isinstance(v, str) and v.isdigit():
                idx = int(v)
                if idx < len(pool):
                    return pool_get(pool[idx], depth+1)
            return v

        resolved = pool_get(raw_entry)
        print(f'Resolved type: {type(resolved)}, value: {str(resolved)[:200]}')

        if isinstance(resolved, list) and resolved:
            run = resolved[0]
            if isinstance(run, str) and run.isdigit():
                run = pool[int(run)]
            print(f'Run type: {type(run)}, keys: {list(run.keys()) if isinstance(run, dict) else str(run)[:100]}')
            if isinstance(run, dict):
                data = run.get('data', {})
                if isinstance(data, str) and data.isdigit():
                    data = pool[int(data)]
                main = data.get('main', [[]])
                if isinstance(main, str) and main.isdigit():
                    main = pool[int(main)]
                if main and main[0]:
                    item0 = main[0]
                    if isinstance(item0, str) and item0.isdigit():
                        item0 = pool[int(item0)]
                    if item0:
                        entry = item0[0] if isinstance(item0, list) else item0
                        if isinstance(entry, str) and entry.isdigit():
                            entry = pool[int(entry)]
                        if isinstance(entry, dict):
                            j = entry.get('json', {})
                            if isinstance(j, str) and j.isdigit():
                                j = pool[int(j)]
                            out = j.get('output', j.get('text', '')) if isinstance(j, dict) else ''
                            if isinstance(out, str) and out.isdigit():
                                out = pool[int(out)]
                            print(f'\nNode 8 output length: {len(out) if isinstance(out, str) else "?"}')
                            if isinstance(out, str):
                                print(f'First 500 chars:\n{out[:500]}')
    else:
        print('Node 8 not found. Keys with 8:', [k for k in p5 if '8' in k][:5])
        # Check errors
        print('\nAll nodes:')
        for k in sorted(p5.keys()):
            v = p5[k]
            print(f'  {k}: {str(v)[:50]}')
