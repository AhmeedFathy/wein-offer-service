"""
Autonomous pipeline runner — triggers Almayass, polls result,
identifies failing node, applies fix, re-runs until success or blocker.
"""
import requests, json, time, sys, re, textwrap
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE   = 'https://weinflow.app.n8n.cloud'
WF_ID      = '6v9BXm5uZpuJS8fd'
WEBHOOK_ID = '971fc81c-55c0-4ef1-96bf-83d88bea0427'
SB_URL     = 'https://iwyufqeqtjbbojunomgq.supabase.co'
SB_KEY     = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
              'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXVmcWVxdGpiYm9qdW5vbWdxIiwicm9sZSI6'
              'InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2NDYyNiwiZXhwIjoyMDk2MjQwNjI2fQ.'
              'LLT4142UHWlfNnaMQaa_DRe44o2lWzOUavVvR3ceyoA')

ALMAYASS_JSON = Path(r'D:\Fady\outputs\Dining\_Done\almayass-20260602\offer_data.json')

# ── helpers ──────────────────────────────────────────────────────────────────
def login():
    s = requests.Session()
    s.post(f'{N8N_BASE}/rest/login',
           json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
    return s

def get_wf(s):
    return s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}').json()['data']

def patch_wf(s, nodes, conns, wf):
    resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
        json={'nodes': nodes, 'connections': conns,
              'settings': wf['settings'], 'staticData': wf['staticData']})
    if resp.status_code != 200:
        print(f'  PATCH failed: {resp.status_code} {resp.text[:300]}')
        return False
    return True

def activate(s):
    r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
    vid = r2.json()['data'].get('versionId')
    s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
    time.sleep(1)
    r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
    return r_act.status_code == 200

def latest_exec(s):
    r = s.get(f'{N8N_BASE}/rest/executions',
              params={'workflowId': WF_ID, 'limit': 1})
    body = r.json()
    execs = body.get('data', {})
    if isinstance(execs, dict):
        execs = execs.get('data', [])
    return execs[0] if execs else None

def exec_detail(s, eid):
    r = s.get(f'{N8N_BASE}/rest/executions/{eid}')
    return r.json().get('data', {})

def poll_exec(s, eid, timeout=600):
    """Poll until execution finishes or timeout. Returns detail dict."""
    deadline = time.time() + timeout
    dots = 0
    while time.time() < deadline:
        d = exec_detail(s, eid)
        status = d.get('status')
        if status in ('success', 'error', 'crashed', 'canceled'):
            print(f'\n  Execution {eid}: {status}')
            return d
        time.sleep(8)
        dots += 1
        print('.', end='', flush=True)
        if dots % 10 == 0:
            elapsed = int(time.time() - (deadline - timeout))
            print(f' [{elapsed}s]', flush=True)
    print('\n  TIMEOUT')
    return exec_detail(s, eid)

def trigger(s, payload):
    """POST to the webhook trigger."""
    url = f'{N8N_BASE}/webhook/{WEBHOOK_ID}'
    r = s.post(url, json=payload, timeout=30)
    print(f'  Trigger POST: {r.status_code}')
    if r.status_code not in (200, 201, 202):
        print(f'  Body: {r.text[:300]}')
        return None
    time.sleep(3)
    ex = latest_exec(s)
    return ex['id'] if ex else None

def get_run_data(d):
    return d.get('data', {}).get('resultData', {}).get('runData', {})

def first_error(run_data):
    """Return (node_name, error_message) for first errored node."""
    for node, runs in run_data.items():
        for run in runs:
            err = run.get('error')
            if err:
                msg = err.get('message', '') or err.get('description', '')
                return node, msg
    return None, None

def node_output(run_data, name):
    """Get first item json from a node's output."""
    runs = run_data.get(name, [])
    if not runs:
        return None
    try:
        return runs[0]['data']['main'][0][0]['json']
    except (KeyError, IndexError, TypeError):
        return None

def print_run_summary(run_data):
    print('\n  Nodes that ran:')
    for name, runs in run_data.items():
        status = 'ERROR' if any(r.get('error') for r in runs) else 'ok'
        out = node_output(run_data, name)
        extra = ''
        if name == 'Lookup Provider UUID' and out:
            extra = f'  id={str(out.get("id",""))[:8]}...'
        elif name == 'Check Existing Items Count' and out is not None:
            extra = f'  result={str(out)[:60]}'
        elif name in ('Has Existing Menu Items?', 'Branch on Existing Items') and out:
            extra = f'  has_existing={out.get("has_existing")}'
        elif name == 'Normalise DB Items' and out:
            extra = f'  count={out.get("count")} source={out.get("source")}'
        elif name == 'Parse Classification' and out:
            extra = f'  count={out.get("count")}'
        elif name == 'Parse Offer Data' and out:
            extra = f'  offers={len(out.get("offers",[]))} menu_items={len(out.get("menu_items",[]))}'
        print(f'    [{status}] {name}{extra}')

# ── build Almayass test payload ───────────────────────────────────────────────
with open(ALMAYASS_JSON, encoding='utf-8') as f:
    almayass = json.load(f)

menu_text = almayass.get('menu_or_services', '')
if not menu_text:
    # Build from items
    items = almayass.get('menu_items', [])
    menu_text = '\n'.join(f"{i.get('name','')}: {i.get('price_egp',0)} EGP" for i in items)

PAYLOAD = {
    'provider_name':     'Almayass',
    'vertical':          'Dining',
    'menu_or_services':  menu_text[:8000],   # cap to avoid huge payloads
    'provider_profile':  almayass.get('provider_profile', ''),
    'menu_items':        almayass.get('menu_items', []),
    'is_existing':       True,
}

print(f'Almayass payload: {len(json.dumps(PAYLOAD))} bytes, '
      f'{len(almayass.get("menu_items",[]))} menu items')

# ─────────────────────────────────────────────────────────────────────────────
# Fix registry — each entry: (description, fix_fn(s, wf, nodes, conns))
# ─────────────────────────────────────────────────────────────────────────────

def fix_add_method_get(target_nodes):
    def fn(s, wf, nodes, conns):
        for n in nodes:
            if n['name'] in target_nodes:
                n['parameters']['method'] = 'GET'
        return patch_wf(s, nodes, conns, wf) and activate(s)
    return fn

def fix_expression_in_url(target_nodes_urls):
    """target_nodes_urls: dict of node_name → new_url"""
    def fn(s, wf, nodes, conns):
        for n in nodes:
            if n['name'] in target_nodes_urls:
                n['parameters']['url'] = target_nodes_urls[n['name']]
                n['parameters']['method'] = 'GET'
                n['parameters'].pop('sendQuery', None)
                n['parameters'].pop('queryParameters', None)
        return patch_wf(s, nodes, conns, wf) and activate(s)
    return fn

SB_BASE = f'{SB_URL}/rest/v1/wein_menu_items'
UUID_E  = "$('Lookup Provider UUID').item.json.id"

KNOWN_FIXES = {
    # UUID expression wrong format
    'Check Existing Items Count': fix_expression_in_url({
        'Check Existing Items Count': f"={SB_BASE}?provider_id=eq.{{{{{UUID_E}}}}}&select=id&limit=1",
        'Read Existing Items from DB': f"={SB_BASE}?provider_id=eq.{{{{{UUID_E}}}}}&select=*&limit=500&order=item_name.asc",
    }),
}

def diagnose_and_fix(s, run_data, error_node, error_msg):
    """Try to diagnose the error and return (fix_applied: bool, blocker_msg: str)."""
    wf    = get_wf(s)
    nodes = wf['nodes']
    conns = wf['connections']

    print(f'\n  ERROR in: {error_node}')
    print(f'  Message:  {error_msg}')

    # ── Check Existing Items Count issues ────────────────────────
    if error_node == 'Check Existing Items Count':
        # Expression not evaluated / wrong URL
        for n in nodes:
            if n['name'] == 'Check Existing Items Count':
                url = n['parameters'].get('url', '')
                if not url.startswith('='):
                    print('  FIX: URL missing = prefix')
                    n['parameters']['url'] = f"={SB_BASE}?provider_id=eq.{{{{{UUID_E}}}}}&select=id&limit=1"
                    n['parameters']['method'] = 'GET'
                    patch_wf(s, nodes, conns, wf)
                    activate(s)
                    return True, None
                if '={{ ' in url:
                    print('  FIX: URL has ={{ format instead of {{')
                    n['parameters']['url'] = re.sub(r'=\{\{\s*', '{{', url)
                    patch_wf(s, nodes, conns, wf)
                    activate(s)
                    return True, None
                if 'method' not in n['parameters'] or n['parameters']['method'] != 'GET':
                    print('  FIX: method missing')
                    n['parameters']['method'] = 'GET'
                    patch_wf(s, nodes, conns, wf)
                    activate(s)
                    return True, None
        print('  BLOCKER: unknown Check Existing Items Count error')
        return False, f'Manual check needed on "Check Existing Items Count" node — error: {error_msg}'

    # ── Lookup Provider UUID — provider not found ─────────────────
    if error_node == 'Lookup Provider UUID':
        out = node_output(run_data, 'Lookup Provider UUID')
        if not out or not out.get('id'):
            return False, (
                'Almayass not found in wein_providers table.\n'
                'ACTION: Run in Supabase SQL editor:\n'
                '  SELECT id, provider_name FROM wein_providers WHERE provider_name ILIKE \'%almayass%\';\n'
                'If missing, insert it or re-run the original pipeline that created it.'
            )

    # ── "No path back to referenced node" ────────────────────────
    if 'path back' in error_msg.lower() or 'referenced node' in error_msg.lower():
        # Find the node name mentioned in error
        m = re.search(r"'([^']+)'", error_msg)
        ref_node = m.group(1) if m else None
        print(f'  FIX: missing connection to {ref_node} — checking wiring...')
        # The most common case: Parse Offer Data tries to read Normalise DB Items
        # but it's not an ancestor in the current run branch
        # Fix: make the error node tolerant with try/catch (already done in our code)
        # Actually this means the expression reference is strict — need to update POD
        for n in nodes:
            if n['name'] == 'Parse Offer Data' and ref_node:
                code = n['parameters'].get('jsCode', '')
                if ref_node in code and 'try {' not in code[code.find(ref_node)-50:code.find(ref_node)]:
                    print(f'  Parse Offer Data references {ref_node} outside try/catch — already protected? checking...')
        return False, (
            f'"No path back" error on {error_node} referencing {ref_node}.\n'
            f'This usually means the expression references a node in a different branch.\n'
            f'ACTION: The Parse Offer Data code already has try/catch — re-check if the error is elsewhere.'
        )

    # ── Token limit / truncated JSON ─────────────────────────────
    if 'unterminated' in error_msg.lower() or 'token' in error_msg.lower():
        for n in nodes:
            if n['name'] == error_node and 'maxTokens' in str(n['parameters']):
                old = n['parameters'].get('maxTokens', 16000)
                n['parameters']['maxTokens'] = min(int(old) + 8000, 32000)
                print(f'  FIX: bumped maxTokens {old} → {n["parameters"]["maxTokens"]}')
                patch_wf(s, nodes, conns, wf)
                activate(s)
                return True, None

    # ── Supabase 4xx ─────────────────────────────────────────────
    if '400' in error_msg or '422' in error_msg or '404' in error_msg:
        if 'cost_sensitivity' in error_msg:
            return False, (
                'Supabase column cost_sensitivity missing from wein_menu_items.\n'
                'ACTION: Run in Supabase SQL editor:\n'
                '  ALTER TABLE wein_menu_items ADD COLUMN IF NOT EXISTS cost_sensitivity text;\n'
                '  ALTER TABLE wein_menu_items DROP CONSTRAINT IF EXISTS wein_menu_items_provider_item_unique;\n'
                '  ALTER TABLE wein_menu_items ADD CONSTRAINT wein_menu_items_provider_item_unique UNIQUE (provider_id, item_name);\n'
                'Then re-run.'
            )
        if 'eligible' in error_msg or 'classification_reason' in error_msg:
            return False, (
                'Supabase column eligible or classification_reason missing.\n'
                'ACTION: Run in Supabase SQL editor:\n'
                '  ALTER TABLE wein_menu_items ADD COLUMN IF NOT EXISTS eligible boolean DEFAULT true;\n'
                '  ALTER TABLE wein_menu_items ADD COLUMN IF NOT EXISTS classification_reason text;\n'
                'Then re-run.'
            )

    # ── PythonAnywhere / Flask ────────────────────────────────────
    if 'pythonanywhere' in error_msg.lower() or '502' in error_msg or '503' in error_msg:
        return False, (
            'PythonAnywhere Flask service appears down.\n'
            'ACTION:\n'
            '  1. Go to https://www.pythonanywhere.com → Web tab\n'
            '  2. Confirm wein.pythonanywhere.com is running (green)\n'
            '  3. If recent git pull was done, click Reload\n'
            'Then re-run.'
        )

    # ── Generic — can't auto-fix ──────────────────────────────────
    return False, f'Unrecognised error in "{error_node}": {error_msg}\nNeeds manual investigation.'


# ─────────────────────────────────────────────────────────────────────────────
# MAIN LOOP
# ─────────────────────────────────────────────────────────────────────────────
MAX_ATTEMPTS = 6

s = login()
print(f'Logged in. Starting Almayass pipeline run...\n')

for attempt in range(1, MAX_ATTEMPTS + 1):
    print(f'\n{"="*60}')
    print(f'ATTEMPT {attempt}/{MAX_ATTEMPTS}')
    print(f'{"="*60}')

    # Trigger
    eid = trigger(s, PAYLOAD)
    if not eid:
        print('  Could not get execution ID — trying latest exec...')
        time.sleep(5)
        ex = latest_exec(s)
        eid = ex['id'] if ex else None
    if not eid:
        print('  BLOCKER: cannot trigger workflow — check webhook is active')
        sys.exit(1)

    print(f'  Execution ID: {eid} — polling...')
    detail = poll_exec(s, eid, timeout=480)
    status = detail.get('status', 'unknown')
    run_data = get_run_data(detail)

    print_run_summary(run_data)

    if status == 'success':
        print('\n' + '='*60)
        print('SUCCESS — pipeline completed end-to-end!')
        print('='*60)

        # Final report
        pod_out = node_output(run_data, 'Parse Offer Data')
        norm_out = node_output(run_data, 'Normalise DB Items')
        pc_out   = node_output(run_data, 'Parse Classification')

        branch = 'DB (known provider)' if norm_out else ('Gemini (new provider)' if pc_out else 'unknown')
        print(f'\n  Menu items branch: {branch}')
        if norm_out:
            print(f'  Items read from DB: {norm_out.get("count")}')
        if pc_out:
            print(f'  Items from Gemini:  {pc_out.get("count")}')
        if pod_out:
            offers = pod_out.get('offers', [])
            menu   = pod_out.get('menu_items', [])
            print(f'  Offers built: {len(offers)}')
            print(f'  Menu items in output: {len(menu)}')
            selected = [o for o in offers if o.get('status') == 'Selected']
            print(f'  Selected offers: {len(selected)}')
            if selected:
                print('  Top 3 selected:')
                for o in selected[:3]:
                    print(f'    [{o.get("id")}] {o.get("title","")} | {o.get("promo_egp")} EGP | {o.get("discount_pct")}%')
        sys.exit(0)

    # Error path
    error_node, error_msg = first_error(run_data)
    if not error_node:
        print(f'  Status={status} but no error node found — treating as blocker')
        error_node = 'unknown'
        error_msg  = f'Execution status: {status}'

    fixed, blocker = diagnose_and_fix(s, run_data, error_node, error_msg)

    if blocker:
        print('\n' + '='*60)
        print('BLOCKER — manual action required:')
        print('='*60)
        print(blocker)
        sys.exit(2)

    if fixed:
        print(f'  Fix applied — re-running immediately...')
        time.sleep(3)
    else:
        print(f'  Could not auto-fix — escalating as blocker')
        print(f'  Error node: {error_node}')
        print(f'  Error: {error_msg}')
        sys.exit(2)

print(f'\nMax attempts ({MAX_ATTEMPTS}) reached without success.')
