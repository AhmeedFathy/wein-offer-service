import requests, sys, json, time, os
sys.stdout.reconfigure(encoding='utf-8')

# Use actual Almayass menu PDFs
candidates = [
    r'D:\Fady\outputs\uploads\Almayass-menu.pdf',
    r'D:\Fady\outputs\Dining\_Done\almayass-20260602\menu\Almayass menu  (6).pdf',
]

almayass_pdf = None
for c in candidates:
    if os.path.exists(c):
        almayass_pdf = c
        break

print(f'Using PDF: {almayass_pdf}')
print(f'File size: {os.path.getsize(almayass_pdf):,} bytes')

# The form trigger — check if it uses /webhook-test/ vs /webhook/
# Try production webhook first, then test
WEBHOOK_PROD = 'https://weinflow.app.n8n.cloud/webhook/971fc81c-55c0-4ef1-96bf-83d88bea0427'

with open(almayass_pdf, 'rb') as f:
    pdf_bytes = f.read()

files = {
    'menu_file': ('Almayass-menu.pdf', pdf_bytes, 'application/pdf')
}
data = {
    'provider_name': 'Almayass',
    'vertical': 'Dining',
    'location': 'Sharm El Sheikh',
    'notes': 'Pipeline test run',
    'menu_or_services': '',
    'menu_link': ''
}

print('\nSubmitting to webhook...')
resp = requests.post(WEBHOOK_PROD, files=files, data=data, timeout=30)
print(f'Status: {resp.status_code}')
try:
    print(f'Response: {json.dumps(resp.json(), indent=2)[:500]}')
except:
    print(f'Response text: {resp.text[:300]}')

# If 404, check actual form node webhook path
if resp.status_code == 404:
    N8N_BASE = 'https://weinflow.app.n8n.cloud'
    s = requests.Session()
    s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
    r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
    wf = r.json()['data']
    for node in wf['nodes']:
        t = node.get('type','')
        if 'form' in t.lower() or 'webhook' in t.lower() or 'trigger' in t.lower():
            print(f'\nTrigger node: {node["name"]}')
            print(f'  type: {t}')
            params = node.get('parameters', {})
            print(f'  params: {json.dumps({k:v for k,v in params.items() if k in ["path","webhookId","httpMethod","formTitle"]}, indent=2)}')
