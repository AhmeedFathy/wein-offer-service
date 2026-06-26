import requests, sys, json, time, os
sys.stdout.reconfigure(encoding='utf-8')

# Find Almayass PDF
almayass_pdf = None
for root, dirs, files in os.walk(r'D:\Fady\outputs'):
    for f in files:
        if 'almayass' in f.lower() and f.endswith('.pdf'):
            almayass_pdf = os.path.join(root, f)
            break
    if almayass_pdf:
        break

if not almayass_pdf:
    # Try broader search
    for root, dirs, files in os.walk(r'D:\Fady\outputs'):
        for f in files:
            if 'almay' in f.lower():
                print(f'Found candidate: {os.path.join(root, f)}')
    print('ERROR: Almayass PDF not found')
    sys.exit(1)

print(f'Using PDF: {almayass_pdf}')
print(f'File size: {os.path.getsize(almayass_pdf):,} bytes')

WEBHOOK_URL = 'https://weinflow.app.n8n.cloud/webhook/971fc81c-55c0-4ef1-96bf-83d88bea0427'

with open(almayass_pdf, 'rb') as f:
    pdf_bytes = f.read()

files = {
    'menu_file': ('almayass_menu.pdf', pdf_bytes, 'application/pdf')
}
data = {
    'provider_name': 'Almayass',
    'vertical': 'Dining',
    'location': 'Sharm El Sheikh',
    'notes': 'Test run — full pipeline with Almayass PDF',
    'menu_or_services': '',
    'menu_link': ''
}

print('\nSubmitting to webhook...')
resp = requests.post(WEBHOOK_URL, files=files, data=data, timeout=30)
print(f'Status: {resp.status_code}')
try:
    print(f'Response: {json.dumps(resp.json(), indent=2)[:500]}')
except:
    print(f'Response text: {resp.text[:500]}')
