import requests, sys, json, re, time
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
nodes = wf['nodes']
conns = wf['connections']

# ─── STEP 2: Disconnect advisor/intel/scout from active flow ──────────────
# Nodes to isolate (keep on canvas, remove from connections only)
DISCONNECT_SOURCES = {
    '🧠 3. wein-advisor — Portfolio Strategy',
    '3b. wein-selector — Auto-Pick Recommendations',
    '🔍 4. wein-intel — Market Intelligence',
    '5b. wein-waffarha-scout v2',
    '🔀 Merge Intel + Recall + Scout',
    'Mistral Cloud Chat Model2',   # advisor's model
    'Mistral Cloud Chat Model3',   # selector's model
    'Mistral Cloud Chat Model',    # intel's model (check which)
    'Mistral Cloud Chat Model13',  # scout v2's model
}

# Remove ALL outgoing connections FROM disconnected nodes
removed_out = []
for src in list(conns.keys()):
    if src in DISCONNECT_SOURCES:
        removed_out.append(src)
        del conns[src]

# Remove ALL incoming connections TO disconnected nodes
for src in list(conns.keys()):
    for port_key in list(conns[src].keys()):
        for port_idx in range(len(conns[src][port_key])):
            conns[src][port_key][port_idx] = [
                c for c in conns[src][port_key][port_idx]
                if c.get('node') not in DISCONNECT_SOURCES
            ]

print('STEP 2: Disconnected nodes:')
for n in removed_out:
    print(f'  removed outgoing from: {n}')

# ─── STEP 2b: Add direct connection Merge Recall Results → wein-innovate ──
RECALL_SRC = '🔀 Merge Recall Results'
INNOVATE_DST = '✨ 6. wein-innovate — 20 Concepts'

if RECALL_SRC not in conns:
    conns[RECALL_SRC] = {'main': [[]]}

# Check if already connected
existing = [c.get('node') for ports in conns[RECALL_SRC].values() for pl in ports for c in pl]
if INNOVATE_DST not in existing:
    conns[RECALL_SRC]['main'][0].append({'node': INNOVATE_DST, 'type': 'main', 'index': 0})
    print(f'\nAdded: {RECALL_SRC} → {INNOVATE_DST}')
else:
    print(f'\nAlready connected: {RECALL_SRC} → {INNOVATE_DST}')

# Show what Merge Recall Results now connects to
print(f'Merge Recall Results now connects to: {[c["node"] for ports in conns.get(RECALL_SRC,{}).values() for pl in ports for c in pl]}')

# ─── STEP 3: Update node 6 text field ────────────────────────────────────
NODE6_NAME = '✨ 6. wein-innovate — 20 Concepts'
NODE6_NEW_TEXT = """=You are wein-innovate.
Provider: {{ $('🔀 Merge Menu Paths').item.json.provider_name }} | Vertical: {{ $('🔀 Merge Menu Paths').item.json.vertical }}
Menu: {{ $('🔀 Merge Menu Paths').item.json.menu_or_services }}

Generate 20 concepts covering ALL party sizes and tiers:
- Concepts 1-5: Solo (Entry, Core, Premium + 2 variations)
- Concepts 6-10: Couple (Entry, Core, Premium + 2 variations)
- Concepts 11-15: Group (Entry, Core, Premium + 2 variations)
- Concepts 16-20: Family (Entry, Core, Premium + 2 variations)

Similar WeIN offers from our portfolio (use as grounding — match pricing patterns, avoid duplicating hooks):
{{ JSON.stringify($('🔀 Merge Recall Results').item.json.wein_recall_results) }}

Waffarha competitor benchmark (beat by +5-7 points):
{{ JSON.stringify($('🔀 Merge Recall Results').item.json.waffarha_recall_results) }}

Each concept must have:
- party_size (Solo / Couple / Group / Family)
- tier (Entry / Core / Premium)
- core hook type (from the 11 WeIN science hooks)
- one-line description of the bundle idea
- why this concept fits this provider based on the recall examples and competitor data"""

for n in nodes:
    if n['name'] == NODE6_NAME:
        old_text = n['parameters'].get('text', '')
        n['parameters']['text'] = NODE6_NEW_TEXT
        print(f'\nSTEP 3: Updated node 6 text ({len(old_text)} → {len(NODE6_NEW_TEXT)} chars)')
        # Check for any remaining advisor/intel refs
        remaining = re.findall(r'wein-advisor|wein-intel|wein-selector|wein-selector', NODE6_NEW_TEXT)
        print(f'  Remaining old refs in node 6: {remaining}')
        break

# Also update node 6 system message if it references old nodes
for n in nodes:
    if n['name'] == NODE6_NAME:
        sys_msg = n['parameters'].get('options', {}).get('systemMessage', '')
        if sys_msg:
            # Replace references to old nodes with recall framing
            new_sys = re.sub(
                r'which calls this automatically after wein-intel\.',
                'which uses recall results from the WeIN portfolio database and Waffarha competitor benchmarks.',
                sys_msg
            )
            if new_sys != sys_msg:
                n['parameters']['options']['systemMessage'] = new_sys
                print(f'  Updated node 6 system message (wein-intel ref removed)')
        break

# ─── STEP 4: Update node 8 text field ────────────────────────────────────
NODE8_NAME = '🏗️ 8. wein-creator — Build Full Offers'
RECALL_NODE = "🔀 Merge Recall Results"

for n in nodes:
    if n['name'] == NODE8_NAME:
        old_text = n['parameters'].get('text', '')
        new_text = old_text

        # Replace advisor reference
        new_text = re.sub(
            r"\{\{?\s*\$\('🧠 3\. wein-advisor[^']*'\)\.item\.json\.output\s*\}?\}",
            "{{ JSON.stringify($('🔀 Merge Recall Results').item.json.wein_recall_results) }}",
            new_text
        )
        # Replace selector reference
        new_text = re.sub(
            r"\{\{?\s*\$\('3b\. wein-selector[^']*'\)\.item\.json\.output\s*\}?\}",
            "{{ JSON.stringify($('🔀 Merge Recall Results').item.json.wein_recall_results) }}",
            new_text
        )
        # Replace intel reference
        new_text = re.sub(
            r"\{\{?\s*\$\('🔍 4\. wein-intel[^']*'\)\.item\.json\.output\s*\}?\}",
            "",
            new_text
        )
        # Replace scout v2 reference
        new_text = re.sub(
            r"\{\{?\s*\$\('5b\. wein-waffarha-scout v2'\)\.item\.json\.text\s*\}?\}",
            "{{ JSON.stringify($('🔀 Merge Recall Results').item.json.waffarha_recall_results) }}",
            new_text
        )
        # Remove duplicate labels that now both point to wein_recall_results
        # Replace the "Advisor recommendations:" label
        new_text = re.sub(
            r'Advisor recommendations:\s*\{\{[^}]*wein_recall_results[^}]*\}\}',
            'WeIN Portfolio Recall (similar offers — match pricing, avoid duplicating hooks):\n{{ JSON.stringify($(\'🔀 Merge Recall Results\').item.json.wein_recall_results) }}',
            new_text
        )
        new_text = re.sub(
            r'Selector picks:\s*\{\{[^}]*wein_recall_results[^}]*\}\}',
            '',
            new_text
        )
        new_text = re.sub(
            r'Market Intelligence:\s*\n?',
            '',
            new_text
        )
        new_text = re.sub(
            r'Waffarha(?:\s*Competitor)?\s*(?:Match|Brief|Scout Brief):\s*\{\{[^}]*waffarha_recall_results[^}]*\}\}',
            'Waffarha Competitor Benchmark (beat by +5-7 pts):\n{{ JSON.stringify($(\'🔀 Merge Recall Results\').item.json.waffarha_recall_results) }}',
            new_text
        )

        n['parameters']['text'] = new_text
        print(f'\nSTEP 4: Updated node 8 text ({len(old_text)} → {len(new_text)} chars)')
        # Check for remaining old refs
        for pat in ['wein-advisor', 'wein-selector', 'wein-intel', 'wein-waffarha-scout v2']:
            if pat in new_text:
                idx = new_text.find(pat)
                print(f'  Still has ref to "{pat}": ...{new_text[max(0,idx-30):idx+60]}...')
        break

# ─── STEP 5: Remove local path instructions from advisor/intel system msgs ─
LOCAL_PATH_REPLACEMENT = (
    "Use the recall results provided in the prompt — these contain real WeIN portfolio data "
    "and Waffarha competitor benchmarks from the database. Do not reference any local file paths."
)

for n in nodes:
    name = n.get('name', '')
    opts = n.get('parameters', {}).get('options', {})
    sys_msg = opts.get('systemMessage', '')
    if not sys_msg:
        continue

    new_msg = sys_msg
    changed = False

    # Remove local path scan instructions
    new_msg = re.sub(
        r'[Ss]cans?\s+`?D:\\Fady\\outputs\\?`?[^.]*\.',
        LOCAL_PATH_REPLACEMENT,
        new_msg
    )
    new_msg = re.sub(
        r'scan\s+`D:\\Fady\\outputs\\`[^.]*\.',
        LOCAL_PATH_REPLACEMENT,
        new_msg
    )
    new_msg = re.sub(
        r'Before generating[^,]+, scan `D:\\Fady\\outputs\\`[^.]*\.',
        f'Before generating any recommendations, {LOCAL_PATH_REPLACEMENT}',
        new_msg
    )

    # Remove localhost references
    new_msg = re.sub(
        r'```[^`]*localhost:[0-9]+[^`]*```',
        '# (local endpoint removed — use Supabase recall results)',
        new_msg,
        flags=re.DOTALL
    )
    new_msg = re.sub(
        r'curl[^`\n]*localhost:[0-9]+[^\n]*\n?',
        '',
        new_msg
    )

    if new_msg != sys_msg:
        opts['systemMessage'] = new_msg
        n['parameters']['options'] = opts
        changed = True
        print(f'\nSTEP 5: Cleaned system message in: {name}')

# ─── Save + activate ──────────────────────────────────────────────────────
print('\n=== Saving workflow... ===')
resp = s.patch(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd',
    json={'nodes': nodes, 'connections': conns,
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'PATCH: {resp.status_code}')

r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf2 = r2.json()['data']
vid = wf2.get('versionId')
print(f'New versionId: {vid}')

s.post(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')

# ─── STEP 6: Verify clean flow ────────────────────────────────────────────
print('\n=== STEP 6: VERIFY CLEAN FLOW ===')
conns3 = wf3.get('connections', {})

# Trace the key path
expected_path = [
    ('🔀 Merge Recall Results', '✨ 6. wein-innovate — 20 Concepts'),
    ('✨ 6. wein-innovate — 20 Concepts', '🏆 7. wein-score — Score & Rank Concepts'),
    ('🏆 7. wein-score — Score & Rank Concepts', '7b. wein-concepts — Auto-Pick Concepts'),
]
for src, dst in expected_path:
    targets = [c['node'] for ports in conns3.get(src, {}).values() for pl in ports for c in pl]
    status = '✅' if dst in targets else '❌'
    print(f'  {status} {src[:40]} → {dst[:40]}')

# Check disconnected nodes no longer in active flow
print('\nDisconnected nodes (should have no outgoing connections):')
for node_name in ['🧠 3. wein-advisor — Portfolio Strategy', '🔍 4. wein-intel — Market Intelligence',
                   '3b. wein-selector — Auto-Pick Recommendations', '5b. wein-waffarha-scout v2',
                   '🔀 Merge Intel + Recall + Scout']:
    has_conn = node_name in conns3
    status = '❌ STILL CONNECTED' if has_conn else '✅ disconnected'
    print(f'  {status}: {node_name}')

# Count active-flow nodes (rough: nodes that have connections)
connected_nodes = set(conns3.keys())
for src_data in conns3.values():
    for ports in src_data.values():
        for pl in ports:
            for c in pl:
                connected_nodes.add(c['node'])
print(f'\nActive-flow nodes: {len(connected_nodes)} (canvas total: {len(wf3["nodes"])})')
