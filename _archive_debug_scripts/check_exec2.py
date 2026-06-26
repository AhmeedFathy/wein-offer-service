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

print('data_field type:', type(data_field))
if isinstance(data_field, list):
    print('List length:', len(data_field))
    print('First item keys:', list(data_field[0].keys()) if data_field else 'empty')
elif isinstance(data_field, dict):
    print('Dict keys:', list(data_field.keys()))
    # Look for resultData
    if 'resultData' in data_field:
        run_data = data_field['resultData'].get('runData', {})
        process_run_data(run_data)
