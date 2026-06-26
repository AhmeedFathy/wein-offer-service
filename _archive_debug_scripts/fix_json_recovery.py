"""
Fix 1: Robust JSON recovery in Parse Offer Data
  - Find last complete offer by scanning backwards for '}' that closes a full object
  - Try multiple close-out strategies in order
Fix 2: Bump Mistral Cloud Chat Model7 (node 8) maxTokens to 32000
"""
import requests, json, time, sys, re
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login',
       json={'emailOrLdapLoginId': 'af8847492@gmail.com', 'password': 'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

# ── 1. Recovery block to inject into Parse Offer Data ────────────────────────
OLD_RECOVERY = """  if (!recovered) {
    // Truncation recovery: find last complete offer object
    const lastId = raw.lastIndexOf(',"id":');
    if (lastId > 0) {
      const truncated = raw.substring(0, lastId);
      const candidates = [truncated + ']}', truncated + '}]}'];
      for (const attempt of candidates) {
        try { offerDataRaw = JSON.parse(attempt); recovered = true; break; } catch(e3) {}
      }
    }
    if (!recovered) throw new Error('JSON recovery failed: ' + e1.message.slice(0,200));
  }"""

NEW_RECOVERY = """  if (!recovered) {
    // Robust truncation recovery — try progressively simpler close-outs
    // Strategy A: find last '{"id":' that starts an offer, discard partial offer
    const offerStart = raw.indexOf('"offers":[');
    const lastOfferOpen = offerStart >= 0 ? raw.lastIndexOf(',{"id":', raw.length) : -1;
    const lastCommaId   = raw.lastIndexOf(',"id":');

    // Strategy B: find last '}' that looks like end of a complete offer
    // by scanning backwards for },{ or },\\n{
    const lastCompleteClose = (() => {
      for (let i = raw.length - 1; i > 0; i--) {
        if (raw[i] === '}') {
          const tail = raw.slice(i + 1).trim();
          // Accept if followed only by commas, whitespace, brackets (partial array close)
          if (/^[,\s\]]*$/.test(tail) || tail === '') return i;
          if (tail.startsWith(',')) return i;
        }
      }
      return -1;
    })();

    const tryParse = (s) => { try { return JSON.parse(s); } catch(e){ return null; } };

    // Try each strategy in order
    const attempts = [];
    if (lastOfferOpen > 0)      attempts.push(raw.slice(0, lastOfferOpen) + ']}');
    if (lastCompleteClose > 0)  attempts.push(raw.slice(0, lastCompleteClose + 1) + ']}');
    if (lastCommaId > 0)        attempts.push(raw.slice(0, lastCommaId) + ']}');
    if (lastCommaId > 0)        attempts.push(raw.slice(0, lastCommaId) + '}]}');
    // Last resort: close at last }
    const lastBrace = raw.lastIndexOf('}');
    if (lastBrace > 0)          attempts.push(raw.slice(0, lastBrace + 1) + ']}');

    for (const attempt of attempts) {
      const parsed = tryParse(attempt);
      if (parsed && Array.isArray(parsed.offers) && parsed.offers.length > 0) {
        offerDataRaw = parsed; recovered = true;
        break;
      }
    }
    if (!recovered) throw new Error('JSON recovery failed after ' + attempts.length + ' attempts: ' + e1.message.slice(0,150));
  }"""

# ── 2. Bump Mistral node 8 maxTokens ─────────────────────────────────────────
pod_fixed   = False
m7_fixed    = False

for n in nodes:
    # Parse Offer Data
    if n['name'] == 'Parse Offer Data':
        code = n['parameters']['jsCode']
        if OLD_RECOVERY in code:
            n['parameters']['jsCode'] = code.replace(OLD_RECOVERY, NEW_RECOVERY, 1)
            print(f'Parse Offer Data: recovery block updated ({len(code)} -> {len(n["parameters"]["jsCode"])} chars)')
            pod_fixed = True
        elif 'JSON recovery failed after' in code:
            print('Parse Offer Data: already has new recovery — skipping')
            pod_fixed = True
        else:
            print('WARN: OLD_RECOVERY anchor not found in Parse Offer Data')
            # Find approximate location for diagnosis
            idx = code.find('JSON recovery failed')
            print(f'  Existing recovery text: {repr(code[max(0,idx-50):idx+200])}')

    # Mistral Cloud Chat Model7 (feeds node 8)
    if n['name'] == 'Mistral Cloud Chat Model7':
        old_max = n['parameters'].get('options', {}).get('maxTokens', 'not set')
        n['parameters'].setdefault('options', {})['maxTokens'] = 32000
        print(f'Mistral Model7: maxTokens {old_max} -> 32000')
        m7_fixed = True

if not pod_fixed:
    print('ERROR: Parse Offer Data not fixed')
if not m7_fixed:
    print('WARN: Mistral Cloud Chat Model7 not found — looking for node 8 model...')
    for n in nodes:
        if 'mistral' in n['name'].lower() or 'model' in n['name'].lower():
            print(f'  Found model node: {n["name"]} type={n.get("type","")}')

# PATCH + ACTIVATE
resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'\nPATCH: {resp.status_code}')
if resp.status_code != 200:
    print(resp.text[:400]); sys.exit(1)

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}')
for n in wf3['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        print(f'\n[{"OK" if "JSON recovery failed after" in code else "FAIL"}] Parse Offer Data: new recovery present')
        print(f'[{"OK" if "lastCompleteClose" in code else "FAIL"}] Parse Offer Data: backward-scan strategy present')
    if n['name'] == 'Mistral Cloud Chat Model7':
        mt = n['parameters'].get('options', {}).get('maxTokens')
        print(f'[{"OK" if mt == 32000 else "FAIL"}] Mistral Model7 maxTokens={mt}')

# Now re-run immediately
print('\n--- Re-triggering pipeline ---')
eid = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/run',
             json={'startNodes': [], 'destinationNode': ''}).json()['data']['executionId']
print(f'Execution: {eid} — polling...')

deadline = time.time() + 540
while time.time() < deadline:
    d    = s.get(f'{N8N_BASE}/rest/executions/{eid}').json()['data']
    stat = d.get('status')
    if stat in ('success', 'error', 'crashed'):
        print(f'\nStatus: {stat}')
        raw_inner = d.get('data', '')
        decoded   = json.loads(raw_inner) if isinstance(raw_inner, str) else raw_inner

        def deref(val, tbl):
            if isinstance(val, str) and val.isdigit():
                idx = int(val)
                return deref(tbl[idx], tbl) if idx < len(tbl) else val
            if isinstance(val, dict): return {k: deref(v, tbl) for k, v in val.items()}
            if isinstance(val, list): return [deref(v, tbl) for v in val]
            return val

        if isinstance(decoded, list):
            exp = deref(decoded[0], decoded)
        else:
            exp = decoded

        rd = exp.get('resultData', {}).get('runData', {})
        err_node = exp.get('resultData', {}).get('lastNodeExecuted', '?')
        err_obj  = exp.get('resultData', {}).get('error', {})

        if stat == 'success':
            print('SUCCESS!')
            for name in ['Normalise DB Items', 'Parse Classification', 'Parse Offer Data']:
                try:
                    out = rd[name][0]['data']['main'][0][0]['json']
                    if name == 'Parse Offer Data':
                        print(f'  {name}: {len(out.get("offers",[]))} offers, {len(out.get("menu_items",[]))} menu items')
                    else:
                        print(f'  {name}: count={out.get("count")} source={out.get("source","")}')
                except: print(f'  {name}: not in output')
        else:
            err_msg = (err_obj.get('message') or err_obj.get('description') or '')[:300]
            print(f'ERROR in {err_node}: {err_msg}')
            print(f'Nodes ran: {list(rd.keys())}')
        break
    time.sleep(10)
    print('.', end='', flush=True)
else:
    print('\nTIMEOUT')
