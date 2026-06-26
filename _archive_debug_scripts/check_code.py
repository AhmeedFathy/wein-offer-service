import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')
s = requests.Session()
s.post('https://weinflow.app.n8n.cloud/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get('https://weinflow.app.n8n.cloud/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
for n in wf['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        print(f'Length: {len(code)}')
        print(f'Has _debug: {"_debug" in code}')
        print(f'Has offer0_party_size: {"offer0_party_size" in code}')
        print('Last 400 chars:')
        print(code[-400:])
