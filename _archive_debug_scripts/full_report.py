import requests, json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'
SB_URL   = 'https://iwyufqeqtjbbojunomgq.supabase.co'
SB_KEY   = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
            'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXVmcWVxdGpiYm9qdW5vbWdxIiwicm9sZSI6'
            'InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2NDYyNiwiZXhwIjoyMDk2MjQwNjI2fQ.'
            'LLT4142UHWlfNnaMQaa_DRe44o2lWzOUavVvR3ceyoA')
SB_HDR   = {'apikey': SB_KEY, 'Authorization': f'Bearer {SB_KEY}'}
ALMAYASS_UUID = '4ea14848-874b-423f-8c15-d92f32f0d60b'

# ── 1. Supabase query: me_class × cost_sensitivity breakdown ─────────────────
print('=' * 60)
print('SUPABASE: wein_menu_items breakdown for Almayass')
print('=' * 60)
r = requests.get(
    f'{SB_URL}/rest/v1/wein_menu_items',
    params={
        'provider_id': f'eq.{ALMAYASS_UUID}',
        'select':      'me_class,cost_sensitivity,item_name,bundle_role,eligible',
        'limit':       '500',
        'order':       'me_class.asc,cost_sensitivity.asc',
    },
    headers=SB_HDR
)
rows = r.json()
if isinstance(rows, dict):
    print(f'ERROR: {rows}'); sys.exit(1)

print(f'Total rows: {len(rows)}')

# Group by me_class × cost_sensitivity
from collections import defaultdict
groups = defaultdict(int)
cs_null = 0
for row in rows:
    mc = row.get('me_class') or 'NULL'
    cs = row.get('cost_sensitivity') or 'NULL'
    groups[(mc, cs)] += 1
    if not row.get('cost_sensitivity'):
        cs_null += 1

print(f'\nme_class × cost_sensitivity  (COUNT):')
print(f'  {"me_class":12} {"cost_sensitivity":15} {"count":>6}')
print(f'  {"-"*12} {"-"*15} {"-"*6}')
for (mc, cs), cnt in sorted(groups.items()):
    flag = ' <-- NULL' if cs == 'NULL' else ''
    print(f'  {mc:12} {cs:15} {cnt:6}{flag}')

print(f'\ncost_sensitivity NULL: {cs_null}/{len(rows)} rows')
if cs_null == len(rows):
    print('  !! ALL items have NULL cost_sensitivity — column added but not backfilled')
elif cs_null == 0:
    print('  OK all items have cost_sensitivity populated')
else:
    print(f'  Partial: {len(rows)-cs_null} have values, {cs_null} still NULL')

# Sample with costs
print('\nSample (first 15 items with prices):')
priced = [r for r in rows if r.get('cost_sensitivity')][:15]
for row in priced[:15]:
    print(f'  {row.get("item_name","")[:35]:35} | {row.get("me_class",""):10} | {row.get("cost_sensitivity",""):12} | eligible={row.get("eligible")}')

# ── 2. n8n: decode execution 236 branch info ─────────────────────────────────
print('\n' + '=' * 60)
print('N8N: Execution 236 branch + output analysis')
print('=' * 60)

ns = requests.Session()
ns.post(f'{N8N_BASE}/rest/login',
        json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})

# Try executions 235 and 236
for eid in ['236', '235']:
    r2 = ns.get(f'{N8N_BASE}/rest/executions/{eid}')
    d  = r2.json().get('data', {})
    if not d:
        continue
    stat = d.get('status')
    started  = d.get('startedAt', '')[:19]
    stopped  = d.get('stoppedAt', '')[:19]
    duration = ''
    try:
        from datetime import datetime
        t1 = datetime.fromisoformat(d['startedAt'].replace('Z',''))
        t2 = datetime.fromisoformat(d['stoppedAt'].replace('Z',''))
        duration = f'{int((t2-t1).total_seconds())}s'
    except: pass

    raw = d.get('data', '')
    if not isinstance(raw, str): raw = json.dumps(raw)

    # Nodes present in runData (n8n stores them as keys in runData dict,
    # which appears in compressed form — scan for known node name strings)
    BRANCH_NODES = [
        'Check Existing Items Count',
        'Has Existing Menu Items?',
        'Branch on Existing Items',
        'Read Existing Items from DB',
        'Normalise DB Items',
        'Build Classification Request',
        'Classify All Menu Items (Gemini)',
        'Parse Classification',
        'Prepare Menu Items for Upsert',
        'Save Menu to DB',
    ]
    KEY_NODES = [
        'Lookup Provider UUID',
        'Fix Merged Data',
        'Parse Offer Data',
        '9. wein-reviewer',
        '9c. wein-decision',
        '10. wein-titles',
        '10b. wein-titles-pick',
        'Code in JavaScript',
    ]

    found_branch = [n for n in BRANCH_NODES if f'"{n}"' in raw]
    found_key    = [n for n in KEY_NODES    if any(k in raw for k in [f'"{n}"', n])]

    # Grade — look for EXCELLENT/GOOD/NEEDS WORK
    grade_m = re.search(r'(EXCELLENT|GOOD|NEEDS WORK)', raw)
    grade   = grade_m.group(1) if grade_m else 'not found in raw'

    # Offer counts
    selected_count = len(re.findall(r'"Selected"', raw))
    offers_count   = len(re.findall(r'"id"\s*:\s*\d+', raw))

    # Error
    err_m = re.search(r'"message"\s*:\s*"([^"]{20,})"', raw) if stat != 'success' else None
    err   = err_m.group(1)[:200] if err_m else ''

    print(f'\nExecution {eid}: {stat}  ({started} → {stopped}, {duration})')

    # Branch determination
    db_nodes     = [n for n in found_branch if n in ['Read Existing Items from DB','Normalise DB Items','Check Existing Items Count','Has Existing Menu Items?','Branch on Existing Items']]
    gemini_nodes = [n for n in found_branch if n in ['Build Classification Request','Classify All Menu Items (Gemini)','Parse Classification']]
    upsert_nodes = [n for n in found_branch if n in ['Prepare Menu Items for Upsert','Save Menu to DB']]

    if db_nodes:
        branch_result = 'TRUE (DB) — known provider path'
    elif gemini_nodes:
        branch_result = 'FALSE (Gemini) — new provider classification'
    else:
        branch_result = 'UNKNOWN — branch nodes not visible in compressed data'

    print(f'\n  1. Branch taken:       {branch_result}')
    print(f'     DB-path nodes found: {db_nodes or "none"}')
    print(f'     Gemini nodes found:  {gemini_nodes or "none"}')
    print(f'     Upsert nodes found:  {upsert_nodes or "none"}')
    print(f'\n  2. Items source:       (see Supabase section above)')
    print(f'\n  3. Node 9 grade:       {grade}')
    print(f'\n  4. Offer signals:')
    print(f'     "Selected" refs:     ~{selected_count}')
    print(f'     "id": N refs:        ~{offers_count}')

    if err:
        print(f'\n  ERROR: {err}')

    # Check for file generation node
    file_nodes = ['Code in JavaScript', '10b. wein-titles-pick']
    for fn in file_nodes:
        present = fn in raw
        print(f'     {fn}: {"present" if present else "NOT found"}')
    break  # only need most recent successful one

print('\n' + '=' * 60)
print('SUMMARY')
print('=' * 60)
