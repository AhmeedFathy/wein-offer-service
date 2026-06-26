import requests, sys, json, time
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

# Get latest execution
print('Polling for execution completion...')
for attempt in range(30):
    r = s.get(f'{N8N_BASE}/rest/executions?workflowId=6v9BXm5uZpuJS8fd&limit=1')
    execs = r.json().get('data', {}).get('data', [])
    if not execs:
        print(f'  [{attempt+1}] No executions found yet')
        time.sleep(10)
        continue

    ex = execs[0]
    status = ex.get('status', 'unknown')
    start = ex.get('startedAt', '')
    eid = ex.get('id', '')
    print(f'  [{attempt+1}] Execution {eid}: status={status}, started={start}')

    if status in ('success', 'error', 'crashed'):
        print(f'\nExecution finished: {status}')
        # Get full execution data to see what happened
        rd = s.get(f'{N8N_BASE}/rest/executions/{eid}')
        full = rd.json().get('data', {})

        if status == 'error':
            # Find the error node
            run_data = full.get('data', {}).get('resultData', {}).get('runData', {})
            for node_name, node_runs in run_data.items():
                for run in node_runs:
                    if run.get('error'):
                        print(f'\nERROR in node: {node_name}')
                        print(json.dumps(run['error'], indent=2)[:500])
        else:
            # Find node 8 output to check offers
            run_data = full.get('data', {}).get('resultData', {}).get('runData', {})
            node8_key = None
            for k in run_data:
                if '8' in k and 'creator' in k.lower():
                    node8_key = k
                    break
            if node8_key:
                node8_data = run_data[node8_key]
                for run in node8_data:
                    output = run.get('data', {}).get('main', [[]])[0]
                    if output:
                        raw = output[0].get('json', {})
                        print(f'\nNode 8 output keys: {list(raw.keys())[:10]}')
                        out_text = raw.get('output', raw.get('text', str(raw)))[:300]
                        print(f'Output preview: {out_text}')
        break

    time.sleep(10)

print('\nDone.')
