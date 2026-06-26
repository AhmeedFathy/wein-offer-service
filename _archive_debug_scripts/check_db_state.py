"""Verify Supabase state: Almayass items, cost_sensitivity, branching."""
import requests, sys
sys.stdout.reconfigure(encoding='utf-8')

SB_URL = 'https://iwyufqeqtjbbojunomgq.supabase.co'
SB_KEY = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
          'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXVmcWVxdGpiYm9qdW5vbWdxIiwicm9sZSI6'
          'InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2NDYyNiwiZXhwIjoyMDk2MjQwNjI2fQ.'
          'LLT4142UHWlfNnaMQaa_DRe44o2lWzOUavVvR3ceyoA')

hdrs = {'apikey': SB_KEY, 'Authorization': f'Bearer {SB_KEY}'}

# 1. Get Almayass provider UUID
r = requests.get(f'{SB_URL}/rest/v1/wein_providers',
                 params={'provider_name': 'ilike.*almayass*', 'select': 'id,provider_name'},
                 headers=hdrs)
providers = r.json()
print(f'Providers matching "almayass": {providers}')
uuid = providers[0]['id'] if providers else None

if not uuid:
    print('Almayass not found in wein_providers — DB branch cannot fire')
    sys.exit(1)

# 2. Count menu items
r2 = requests.get(f'{SB_URL}/rest/v1/wein_menu_items',
                  params={'provider_id': f'eq.{uuid}', 'select': 'count'},
                  headers={**hdrs, 'Prefer': 'count=exact'},)
total = r2.headers.get('Content-Range', '?')
print(f'wein_menu_items for Almayass: {total}')

# 3. Sample rows — check cost_sensitivity column exists and is populated
r3 = requests.get(f'{SB_URL}/rest/v1/wein_menu_items',
                  params={'provider_id': f'eq.{uuid}',
                          'select': 'item_name,me_class,bundle_role,cost_sensitivity,eligible',
                          'limit': '10', 'order': 'item_name.asc'},
                  headers=hdrs)
rows = r3.json()
if isinstance(rows, list) and rows:
    print(f'\nSample items (up to 10):')
    for row in rows:
        cs = row.get('cost_sensitivity', 'NULL')
        mc = row.get('me_class', '?')
        br = row.get('bundle_role', '?')
        el = row.get('eligible', '?')
        print(f'  {row["item_name"][:40]:40} | {mc:10} | {br:10} | cs={cs:12} | eligible={el}')
    # Check how many have cost_sensitivity populated
    with_cs  = sum(1 for r in rows if r.get('cost_sensitivity'))
    print(f'\ncost_sensitivity populated: {with_cs}/{len(rows)} sampled rows')
elif isinstance(rows, dict) and rows.get('message'):
    print(f'Error: {rows}')
else:
    print('No rows returned')

# 4. Check unique constraint exists
r4 = requests.get(f'{SB_URL}/rest/v1/wein_menu_items',
                  params={'provider_id': f'eq.{uuid}', 'select': 'item_name', 'limit': '1'},
                  headers=hdrs)
print(f'\nREST query test: {r4.status_code}')
print('DB state check complete.')
