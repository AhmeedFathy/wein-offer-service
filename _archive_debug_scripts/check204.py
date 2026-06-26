import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/executions/204')
full = r.json()['data']
pool = json.loads(full['data'])

# item[2] has runData ref
item2 = pool[2]
rd_ref = item2.get('runData', '')
print(f'runData ref: {rd_ref}')
rd_idx = int(rd_ref) if isinstance(rd_ref, str) and rd_ref.isdigit() else None
if rd_idx:
    rd = pool[rd_idx]
    print(f'pool[{rd_idx}] type: {type(rd)}')
    if isinstance(rd, dict):
        print(f'Nodes ({len(rd)}): {sorted(rd.keys())}')

        # Check decision node
        decision_key = '9c. wein-decision — Grade to Score'
        if decision_key in rd:
            dec_ref = rd[decision_key]
            while isinstance(dec_ref, str) and dec_ref.isdigit() and int(dec_ref) < len(pool):
                dec_ref = pool[int(dec_ref)]
            if isinstance(dec_ref, list) and dec_ref:
                run_ref = dec_ref[0]
                while isinstance(run_ref, str) and run_ref.isdigit() and int(run_ref) < len(pool):
                    run_ref = pool[int(run_ref)]
                if isinstance(run_ref, dict):
                    d = run_ref.get('data', {})
                    while isinstance(d, str) and d.isdigit() and int(d) < len(pool):
                        d = pool[int(d)]
                    m = d.get('main', []) if isinstance(d, dict) else []
                    while isinstance(m, str) and m.isdigit() and int(m) < len(pool):
                        m = pool[int(m)]
                    if m and m[0]:
                        e0 = m[0]
                        while isinstance(e0, str) and e0.isdigit() and int(e0) < len(pool):
                            e0 = pool[int(e0)]
                        if isinstance(e0, list) and e0:
                            e00 = e0[0]
                            while isinstance(e00, str) and e00.isdigit() and int(e00) < len(pool):
                                e00 = pool[int(e00)]
                            if isinstance(e00, dict):
                                j = e00.get('json', {})
                                while isinstance(j, str) and j.isdigit() and int(j) < len(pool):
                                    j = pool[int(j)]
                                if isinstance(j, dict):
                                    for k, v in j.items():
                                        val = v
                                        while isinstance(val, str) and val.isdigit() and int(val) < len(pool):
                                            val = pool[int(val)]
                                        print(f'  decision.{k} = {val}')
