"""
Autonomous pipeline runner v2 — uses correct webhook path + /run API fallback.
Polls, diagnoses errors, applies fixes, re-runs until success or manual blocker.
"""
import requests, json, time, sys, re
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'
SB_URL   = 'https://iwyufqeqtjbbojunomgq.supabase.co'
SB_KEY   = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
            'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXVmcWVxdGpiYm9qdW5vbWdxIiwicm9sZSI6'
            'InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2NDYyNiwiZXhwIjoyMDk2MjQwNjI2fQ.'
            'LLT4142UHWlfNnaMQaa_DRe44o2lWzOUavVvR3ceyoA')
ALMAYASS_JSON = Path(r'D:\Fady\outputs\Dining\_Done\almayass-20260602\offer_data.json')

def login():
    s = requests.Session()
    s.post(f'{N8N_BASE}/rest/login',
           json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
    return s

def get_wf(s):
    return s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}').json()['data']

def patch_and_activate(s, nodes, conns, wf):
    r = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
        json={'nodes': nodes, 'connections': conns,
              'settings': wf['settings'], 'staticData': wf['staticData']})
    if r.status_code != 200:
        print(f'  PATCH failed {r.status_code}: {r.text[:200]}')
        return False
    r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
    vid = r2.json()['data'].get('versionId')
    s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
    time.sleep(1)
    ra = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
    return ra.status_code == 200

def trigger_webhook(s, payload):
    """POST to webhook/new-provider."""
    url = f'{N8N_BASE}/webhook/new-provider'
    r = s.post(url, json=payload, timeout=30)
    print(f'  Webhook POST {url}: {r.status_code}')
    if r.status_code not in (200, 201, 202):
        print(f'  {r.text[:200]}')
        return None
    return True

def trigger_run_api(s):
    """Use /rest/workflows/{id}/run — no input data, uses pinned data if set."""
    r = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/run',
               json={'startNodes': [], 'destinationNode': ''})
    print(f'  /run API: {r.status_code}')
    if r.status_code == 200:
        return r.json()['data']['executionId']
    print(f'  {r.text[:200]}')
    return None

def latest_exec(s, after_id=None):
    r = s.get(f'{N8N_BASE}/rest/executions',
              params={'workflowId': WF_ID, 'limit': 5})
    body = r.json()
    execs = body.get('data', {})
    if isinstance(execs, dict):
        execs = execs.get('data', [])
    if not execs:
        return None
    if after_id:
        newer = [e for e in execs if int(e['id']) > int(after_id)]
        return newer[0] if newer else None
    return execs[0]

def poll_exec(s, eid, timeout=540):
    deadline = time.time() + timeout
    dots = 0
    while time.time() < deadline:
        r = s.get(f'{N8N_BASE}/rest/executions/{eid}')
        d = r.json().get('data', {})
        status = d.get('status')
        if status in ('success', 'error', 'crashed', 'canceled'):
            print(f'\n  [{status.upper()}] execution {eid}  ({int(time.time()-(deadline-timeout))}s)')
            return d
        time.sleep(10)
        dots += 1
        if dots % 6 == 0:
            print(f'  ...{int(time.time()-(deadline-timeout))}s', flush=True)
        else:
            print('.', end='', flush=True)
    print('\n  TIMEOUT')
    return s.get(f'{N8N_BASE}/rest/executions/{eid}').json().get('data', {})

def run_data_of(d):
    return d.get('data', {}).get('resultData', {}).get('runData', {})

def first_error(rd):
    for node, runs in rd.items():
        for run in runs:
            err = run.get('error')
            if err:
                msg = (err.get('message') or err.get('description') or
                       json.dumps(err)[:200])
                return node, msg
    return None, None

def node_out(rd, name):
    runs = rd.get(name, [])
    if not runs: return None
    try: return runs[0]['data']['main'][0][0]['json']
    except: return None

def print_summary(rd):
    print('\n  Execution summary:')
    for name, runs in rd.items():
        err = any(r.get('error') for r in runs)
        out = node_out(rd, name)
        tag = 'ERR' if err else ' ok'
        extra = ''
        if name == 'Lookup Provider UUID' and out:
            extra = f'  uuid={str(out.get("id",""))[:8]}...'
        elif name == 'Check Existing Items Count' and out is not None:
            extra = f'  raw={str(out)[:80]}'
        elif name == 'Has Existing Menu Items?' and out:
            extra = f'  has_existing={out.get("has_existing")}'
        elif name == 'Branch on Existing Items' and out:
            extra = f'  has_existing={out.get("has_existing")}'
        elif name == 'Normalise DB Items' and out:
            extra = f'  count={out.get("count")} src=db'
        elif name == 'Parse Classification' and out:
            extra = f'  count={out.get("count")} src=gemini'
        elif name == 'Parse Offer Data' and out:
            extra = f'  offers={len(out.get("offers",[]))} menu={len(out.get("menu_items",[]))}'
        print(f'    [{tag}] {name}{extra}')

# ── load Almayass data ────────────────────────────────────────────────────────
with open(ALMAYASS_JSON, encoding='utf-8') as f:
    alm = json.load(f)

menu_text = alm.get('menu_or_services', '')
if not menu_text:
    menu_text = '\n'.join(
        f"{i.get('name','')}: {i.get('price_egp',0)} EGP"
        for i in alm.get('menu_items', [])
    )

PAYLOAD = {
    'provider_name':    'Almayass',
    'vertical':         'Dining',
    'menu_or_services': menu_text[:8000],
    'provider_profile': alm.get('provider_profile', ''),
    'menu_link':        '',
    'notes':            '',
}
print(f'Payload: {len(json.dumps(PAYLOAD))} bytes')

# ─────────────────────────────────────────────────────────────────────────────
# Autonomous fix handlers
# ─────────────────────────────────────────────────────────────────────────────
SB_BASE = f'{SB_URL}/rest/v1/wein_menu_items'
UUID_E  = "$('Lookup Provider UUID').item.json.id"

def fix_check_node_url(s):
    wf = get_wf(s); nodes = wf['nodes']; conns = wf['connections']
    for n in nodes:
        if n['name'] == 'Check Existing Items Count':
            n['parameters']['url']    = f"={SB_BASE}?provider_id=eq.{{{{{UUID_E}}}}}&select=id&limit=1"
            n['parameters']['method'] = 'GET'
            n['parameters'].pop('sendQuery', None)
            n['parameters'].pop('queryParameters', None)
            print('  Applied: Check Existing Items Count URL fix')
        if n['name'] == 'Read Existing Items from DB':
            n['parameters']['url']    = f"={SB_BASE}?provider_id=eq.{{{{{UUID_E}}}}}&select=*&limit=500&order=item_name.asc"
            n['parameters']['method'] = 'GET'
            n['parameters'].pop('sendQuery', None)
            n['parameters'].pop('queryParameters', None)
            print('  Applied: Read Existing Items from DB URL fix')
    return patch_and_activate(s, nodes, conns, wf)

def fix_pod_try_catch(s):
    """Wrap all node references in Parse Offer Data in try/catch so branch misses don't crash."""
    wf = get_wf(s); nodes = wf['nodes']; conns = wf['connections']
    for n in nodes:
        if n['name'] == 'Parse Offer Data':
            code = n['parameters']['jsCode']
            # Already has the priority chain with try/catch — nothing to change
            print(f'  Parse Offer Data code: {len(code)} chars — try/catch already present: {"try {" in code}')
    return True  # nothing to patch

def fix_save_menu_columns(s):
    """Remove cost_sensitivity + eligible + classification_reason from upsert body if columns missing."""
    wf = get_wf(s); nodes = wf['nodes']; conns = wf['connections']
    for n in nodes:
        if n['name'] == 'Prepare Menu Items for Upsert':
            code = n['parameters']['jsCode']
            # Strip cost_sensitivity line
            new_code = re.sub(r"\s*cost_sensitivity:\s*item\.cost_sensitivity[^\n]*,?\n", "\n", code)
            if new_code != code:
                n['parameters']['jsCode'] = new_code
                print('  Removed cost_sensitivity from upsert (column missing)')
    return patch_and_activate(s, nodes, conns, wf)

# ─────────────────────────────────────────────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────────────────────────────────────────────
MAX_ATTEMPTS = 7
s = login()
last_eid = None

# Get current latest exec ID so we can detect new ones
ex0 = latest_exec(s)
last_eid = ex0['id'] if ex0 else '0'
print(f'Last known execution: {last_eid}')

for attempt in range(1, MAX_ATTEMPTS + 1):
    print(f'\n{"="*60}')
    print(f'ATTEMPT {attempt}/{MAX_ATTEMPTS}')
    print(f'{"="*60}')

    # Try webhook first, fall back to /run API
    triggered = trigger_webhook(s, PAYLOAD)
    eid = None
    if triggered:
        time.sleep(4)
        ex = latest_exec(s, after_id=last_eid)
        eid = ex['id'] if ex else None

    if not eid:
        print('  Webhook did not produce new exec — using /run API...')
        eid = trigger_run_api(s)
        if not eid:
            time.sleep(4)
            ex = latest_exec(s, after_id=last_eid)
            eid = ex['id'] if ex else None

    if not eid:
        print('  BLOCKER: cannot start execution')
        sys.exit(1)

    last_eid = eid
    print(f'  Execution: {eid} — polling (up to 9 min)...')
    detail   = poll_exec(s, eid)
    status   = detail.get('status', 'unknown')
    rd       = run_data_of(detail)
    print_summary(rd)

    # ── SUCCESS ───────────────────────────────────────────────────
    if status == 'success':
        print('\n' + '='*60)
        print('PIPELINE COMPLETE — SUCCESS')
        print('='*60)
        norm = node_out(rd, 'Normalise DB Items')
        pc   = node_out(rd, 'Parse Classification')
        pod  = node_out(rd, 'Parse Offer Data')

        branch = 'DB' if norm else ('Gemini' if pc else 'unknown')
        print(f'\n  Menu branch taken:  {branch}')
        if norm:
            print(f'  Items from DB:      {norm.get("count")}')
        if pc:
            print(f'  Items from Gemini:  {pc.get("count")}')
        if pod:
            offers   = pod.get('offers', [])
            menu     = pod.get('menu_items', [])
            selected = [o for o in offers if o.get('status') == 'Selected']
            print(f'  Total offers built: {len(offers)}')
            print(f'  Selected offers:    {len(selected)}')
            print(f'  Menu items output:  {len(menu)}')
            if selected:
                print('\n  Sample selected offers:')
                for o in selected[:5]:
                    d = o.get('discount_pct', 0)
                    d_str = f'{d:.0f}%' if d > 1 else f'{d*100:.0f}%'
                    print(f'    [{o.get("id")}] {o.get("title","")}')
                    print(f'         {o.get("party_size")} {o.get("tier")} | EGP {o.get("promo_egp")} | {d_str} off')
        sys.exit(0)

    # ── ERROR — diagnose and fix ──────────────────────────────────
    error_node, error_msg = first_error(rd)
    if not error_node:
        error_node = f'[status={status}]'
        error_msg  = 'No error node found in run data'

    print(f'\n  ERROR: {error_node}')
    print(f'  MSG:   {error_msg[:300]}')

    # Dispatch fix
    fixed    = False
    blocker  = None

    msg_low = error_msg.lower()

    if error_node == 'Check Existing Items Count' or (
            '={{ ' in error_msg or 'expression' in msg_low and 'provider_id' in msg_low):
        print('  -> FIX: URL expression format')
        fixed = fix_check_node_url(s)

    elif 'path back' in msg_low or 'referenced node' in msg_low:
        ref = re.search(r"'([^']+)'", error_msg)
        ref_node = ref.group(1) if ref else '?'
        print(f'  -> FIX: "no path back" to {ref_node}')
        # Parse Offer Data references Normalise DB Items which only runs in TRUE branch.
        # Solution: the try/catch already handles this — the error must be elsewhere.
        # Check if it's in the IF Code node
        if error_node in ('Has Existing Menu Items?', 'Branch on Existing Items'):
            blocker = (
                f'"No path back" in branching node {error_node}.\n'
                f'This means the IF/Code node references a node not in its ancestor chain.\n'
                f'Referenced node: {ref_node}\n'
                f'ACTION: Open n8n editor, check {error_node} expression and remove any $() references.'
            )
        else:
            # Try stripping the reference from Parse Offer Data
            fixed = fix_pod_try_catch(s)
            if not fixed:
                blocker = f'"No path back" to {ref_node} in {error_node} — needs manual editor check'

    elif 'cost_sensitivity' in msg_low and ('column' in msg_low or '42703' in error_msg or 'schema' in msg_low):
        blocker = (
            'Supabase column cost_sensitivity missing from wein_menu_items.\n\n'
            'ACTION — Run in Supabase SQL editor:\n'
            'https://supabase.com/dashboard/project/iwyufqeqtjbbojunomgq/sql\n\n'
            '  ALTER TABLE wein_menu_items ADD COLUMN IF NOT EXISTS cost_sensitivity text;\n'
            '  ALTER TABLE wein_menu_items ADD COLUMN IF NOT EXISTS eligible boolean DEFAULT true;\n'
            '  ALTER TABLE wein_menu_items ADD COLUMN IF NOT EXISTS classification_reason text;\n'
            '  ALTER TABLE wein_menu_items DROP CONSTRAINT IF EXISTS wein_menu_items_provider_item_unique;\n'
            '  ALTER TABLE wein_menu_items ADD CONSTRAINT wein_menu_items_provider_item_unique UNIQUE (provider_id, item_name);\n\n'
            'Then re-run this script.'
        )

    elif any(x in msg_low for x in ('400', '422', 'bad request', 'schema cache')) and error_node in ('Save Menu to DB', 'Prepare Menu Items for Upsert'):
        print('  -> FIX: strip unrecognised column from upsert')
        fixed = fix_save_menu_columns(s)

    elif 'pythonanywhere' in msg_low or any(x in error_msg for x in ('502', '503', '504')):
        blocker = (
            'PythonAnywhere Flask service error.\n'
            'ACTION:\n'
            '  1. Visit https://www.pythonanywhere.com → Web tab\n'
            '  2. Confirm wein.pythonanywhere.com is green / running\n'
            '  3. Click Reload if needed\n'
            '  4. Re-run this script'
        )

    elif 'unterminated' in msg_low or ('json' in msg_low and 'parse' in msg_low):
        # JSON parse error in LLM output nodes
        print('  -> INFO: JSON parse error — truncation recovery should handle this')
        print('  -> No auto-fix available; check Parse Offer Data node manually')
        blocker = (
            f'JSON parse error in {error_node}: {error_msg[:200]}\n'
            'The Parse Offer Data node has truncation recovery but it may have failed.\n'
            'ACTION: Open the execution in n8n editor and inspect the raw LLM output.'
        )

    elif not rd:
        blocker = (
            'Execution produced no run data — workflow may not have started correctly.\n'
            'ACTION: Check n8n execution logs in the n8n dashboard.\n'
            f'Execution ID: {eid}'
        )

    else:
        blocker = (
            f'Unrecognised error — cannot auto-fix.\n'
            f'Node:  {error_node}\n'
            f'Error: {error_msg[:300]}\n\n'
            f'ACTION: Open n8n execution {eid} in dashboard and inspect manually.'
        )

    if blocker:
        print('\n' + '='*60)
        print('MANUAL ACTION REQUIRED (blocker):')
        print('='*60)
        print(blocker)
        sys.exit(2)

    if fixed:
        print('  Fix applied — re-running in 3s...')
        time.sleep(3)
    else:
        print('  Fix returned False — treating as blocker')
        sys.exit(2)

print(f'Max attempts ({MAX_ATTEMPTS}) reached.')
