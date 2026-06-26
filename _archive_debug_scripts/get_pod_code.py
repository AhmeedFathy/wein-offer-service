import requests, sys
sys.stdout.reconfigure(encoding='utf-8')
N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
wf = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}').json()['data']
for n in wf['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters']['jsCode']
        print(f'Parse Offer Data: {len(code)} chars')
        # Find the recovery section
        idx = code.find('recovery')
        if idx >= 0:
            print('\n--- recovery section ---')
            print(code[max(0,idx-200):idx+800])
        break
