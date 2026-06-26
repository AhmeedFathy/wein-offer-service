import requests, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
nodes = r.json()['data']['nodes']

targets = ['Clear Old Menu Items', 'Check Existing Items Count', 'Read Existing Items from DB', 'Save Menu to DB']
for n in nodes:
    if n['name'] in targets:
        print(f'\n=== {n["name"]} ===')
        print(f'  url:        {repr(n["parameters"].get("url",""))}')
        print(f'  method:     {n["parameters"].get("method","")}')
        print(f'  sendQuery:  {n["parameters"].get("sendQuery","")}')
        qp = n["parameters"].get("queryParameters", {})
        print(f'  queryParams:{qp}')
