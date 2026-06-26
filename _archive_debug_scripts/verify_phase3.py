import requests, sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

for n in wf['nodes']:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        text = n['parameters'].get('text', '')
        print(f'Node 8 text ({len(text)} chars):')
        print(text[:3000])
        print('...')
        # Check refs
        for bad in ['wein-advisor', 'wein-selector', 'wein-intel', 'wein-waffarha-scout v2']:
            if bad in text:
                idx = text.find(bad)
                print(f'\n⚠️  Still has "{bad}": ...{text[max(0,idx-50):idx+80]}...')
        break
