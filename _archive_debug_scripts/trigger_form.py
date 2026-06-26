import requests, sys, json, os
sys.stdout.reconfigure(encoding='utf-8')

# Form trigger uses a different URL path than the webhook
# n8n form submissions go to: /form/{webhookId}
# The form webhookId from session summary: 971fc81c-55c0-4ef1-96bf-83d88bea0427
FORM_URL = 'https://weinflow.app.n8n.cloud/form/971fc81c-55c0-4ef1-96bf-83d88bea0427'

almayass_pdf = r'D:\Fady\outputs\uploads\Almayass-menu.pdf'
print(f'File size: {os.path.getsize(almayass_pdf):,} bytes')

with open(almayass_pdf, 'rb') as f:
    pdf_bytes = f.read()

files = {
    'menu_file': ('Almayass-menu.pdf', pdf_bytes, 'application/pdf')
}
data = {
    'provider_name': 'Almayass',
    'vertical': 'Dining',
    'location': 'Sharm El Sheikh',
    'notes': 'Form trigger test — Phase 1 final verification',
    'menu_or_services': '',
    'menu_link': ''
}

print(f'Submitting to FORM URL: {FORM_URL}')
resp = requests.post(FORM_URL, files=files, data=data, timeout=30)
print(f'Status: {resp.status_code}')
try:
    print(f'Response: {json.dumps(resp.json(), indent=2)[:500]}')
except:
    print(f'Response text: {resp.text[:300]}')
