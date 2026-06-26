import requests, sys, json, time, os
sys.stdout.reconfigure(encoding='utf-8')

almayass_pdf = r'D:\Fady\outputs\uploads\Almayass-menu.pdf'
print(f'File size: {os.path.getsize(almayass_pdf):,} bytes')

# Use the API webhook path
WEBHOOK_URL = 'https://weinflow.app.n8n.cloud/webhook/new-provider'

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

print(f'Submitting to: {WEBHOOK_URL}')
resp = requests.post(WEBHOOK_URL, files=files, data=data, timeout=30)
print(f'Status: {resp.status_code}')
try:
    print(f'Response: {json.dumps(resp.json(), indent=2)[:500]}')
except:
    print(f'Response text: {resp.text[:300]}')
