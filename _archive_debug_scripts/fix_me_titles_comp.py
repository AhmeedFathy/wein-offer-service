"""
FIX 1 — Parse Offer Data: derive ME class/bundle role from node 8's offer items
FIX 2 — Parse Offer Data: merge node 10b selected titles back into offers
FIX 3 — n8n only: 40% cap already applied; build_pdfs.py handles comp logic
"""
import requests, json, time, sys
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
WF_ID    = '6v9BXm5uZpuJS8fd'

s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf    = r.json()['data']
nodes = wf['nodes']

# ── NEW Parse Offer Data code ─────────────────────────────────────────────
NEW_CODE = r"""let raw = ($('🏗️ 8. wein-creator — Build Full Offers').item.json.text || '').trim();

if (raw.includes('```')) {
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) raw = m[1].trim();
}

// ── Pre-processing: fix common LLM JSON mistakes ──────────────────────────
// 1. Strip thousand-separator commas (2,745 → 2745)
raw = raw.replace(/(\d),(?=\d{3}(?:[^\d]|$))/g, '$1');
// 2. Fix duplicate property names ("key","key": → "key":)
raw = raw.replace(/"([^"]{1,40})","(\1)":/g, '"$1":');
// 3. Fix stray word before JSON value (e.g. "eligible": to true → "eligible": true)
raw = raw.replace(/:\s*to\s+(true|false|null)/g, ': $1');
// 4. Fix asterisk after property name ("key"*: → "key":)
raw = raw.replace(/"([^"]+)"\s*\*\s*:/g, '"$1":');
// ─────────────────────────────────────────────────────────────────────────

const start = raw.indexOf('{');
if (start < 0) throw new Error('No JSON object found in wein-creator output');
raw = raw.slice(start);

let offerDataRaw;
try {
  offerDataRaw = JSON.parse(raw);
} catch(e1) {
  let recovered = false;
  for (let end = raw.length; end > 100; end--) {
    if (raw[end-1] !== '}') continue;
    try {
      offerDataRaw = JSON.parse(raw.slice(0, end));
      recovered = true;
      break;
    } catch(e2) {}
  }
  if (!recovered) {
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
  }
}

if (!offerDataRaw || !Array.isArray(offerDataRaw.offers)) {
  throw new Error('Parsed JSON has no offers array');
}

const offerData = JSON.parse(JSON.stringify(offerDataRaw));

// FIX 2: use the full Gemini-extracted menu from Fix Merged Data
const fullMenuItems = ($('Fix Merged Data').item.json.menu_items || []);
if (fullMenuItems.length > 0) offerData.menu_items = fullMenuItems;

const PARTY_SIZE_BY_ID = {
  1:'Solo',2:'Solo',3:'Solo',
  4:'Couple',5:'Couple',6:'Couple',
  7:'Group',8:'Group',9:'Group',
  10:'Family',11:'Family',12:'Family'
};
const TIER_BY_ID = {
  1:'Entry',2:'Core',3:'Premium',
  4:'Entry',5:'Core',6:'Premium',
  7:'Entry',8:'Core',9:'Premium',
  10:'Entry',11:'Core',12:'Premium'
};
const HOOK_MAP = {
  'Solo-Entry':'Zero-Price Effect','Solo-Core':'Anchor Pricing','Solo-Premium':'Loss Aversion',
  'Couple-Entry':'Experience Frame','Couple-Core':'Decoy Effect','Couple-Premium':'Reciprocity',
  'Group-Entry':'Per-Person Anchor','Group-Core':'Compromise Effect','Group-Premium':'Sharing Utility',
  'Family-Entry':'Zero-Price Effect','Family-Core':'Mental Accounting','Family-Premium':'Host Pride',
};
const BACKUP_SIZES = ['Solo','Couple','Group','Family','Solo','Couple','Group','Family'];
const BACKUP_TIERS = ['Entry','Core','Premium','Entry','Core','Premium','Entry','Core'];

offerData.offers = offerData.offers.map((o, idx) => {
  const id = o.id || (idx + 1);
  if (!o.party_size || !['Solo','Couple','Group','Family'].includes(o.party_size)) {
    o.party_size = id <= 12 ? (PARTY_SIZE_BY_ID[id] || 'Solo') : (BACKUP_SIZES[(id-13) % 8] || 'Solo');
  }
  if (!o.tier || !['Entry','Core','Premium'].includes(o.tier)) {
    o.tier = id <= 12 ? (TIER_BY_ID[id] || 'Entry') : (BACKUP_TIERS[(id-13) % 8] || 'Entry');
  }
  if (!o.status || !['Selected','Backup'].includes(o.status)) {
    o.status = id <= 12 ? 'Selected' : 'Backup';
  }
  if (!o.hook_type) {
    o.hook_type = HOOK_MAP[`${o.party_size}-${o.tier}`] || 'Zero-Price Effect';
  }
  const p = o.promo_egp || 0;
  if (p > 0 && p % 10 !== 5 && p % 10 !== 9) {
    const rem = p % 10;
    o.promo_egp = rem < 5 ? p + (5 - rem) : rem < 9 ? p + (9 - rem) : p + (19 - rem);
  }
  o.price_ending_ok = !!(o.promo_egp && (o.promo_egp % 10 === 5 || o.promo_egp % 10 === 9));
  return o;
});

// FIX 1: build ME class / bundle role lookup from node 8's offer items
const meMap = {};
offerData.offers.forEach(offer => {
  (offer.items || []).forEach(item => {
    const key = (item.name || '').toLowerCase().trim();
    if (key && (item.me_class || item.bundle_role)) {
      meMap[key] = {
        me_class: item.me_class || '',
        bundle_role: item.bundle_role || ''
      };
    }
  });
});

// Apply ME class / bundle role to menu_items; fall back to Star/Hero if not found
if (!Array.isArray(offerData.menu_items) || offerData.menu_items.length === 0) {
  const seen = new Set();
  offerData.menu_items = [];
  for (const offer of offerData.offers) {
    for (const item of (offer.items || [])) {
      const key = (item.name || '').toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      offerData.menu_items.push({
        name: item.name,
        category: item.category || '',
        price: item.price || 0,
        currency: 'EGP',
        me_class: item.me_class || 'Star',
        bundle_role: item.bundle_role || 'Hero',
        eligible: true
      });
    }
  }
} else {
  offerData.menu_items = offerData.menu_items.map(item => {
    const key = (item.name || '').toLowerCase().trim();
    const lookup = meMap[key] || {};
    return {
      ...item,
      me_class: lookup.me_class || item.me_class || '',
      bundle_role: lookup.bundle_role || item.bundle_role || ''
    };
  });
}

// FIX 3 (titles): parse node 10b selected titles and merge into offers
// 10b outputs text like: "Offer 1: <title>\nOffer 2: <title>\n..."
// or JSON array [{id:1, title:"..."},...] — handle both
try {
  const titlesRaw = ($('10b. wein-titles-pick — Auto-Pick Titles').item.json.output || '').trim();
  if (titlesRaw) {
    // Try JSON first
    let titleMap = {};
    try {
      const parsed = JSON.parse(titlesRaw.slice(titlesRaw.indexOf('[')));
      if (Array.isArray(parsed)) {
        parsed.forEach(t => { if (t.id) titleMap[Number(t.id)] = t.title || t.selected_title || ''; });
      }
    } catch(_) {
      // Fall back: parse "Offer N: title" or "N. title" or "**N.** title" lines
      const lines = titlesRaw.split('\n');
      for (const line of lines) {
        const m = line.match(/(?:offer\s*)?(\d+)[.:)]\s*\*{0,2}(.+)/i);
        if (m) titleMap[Number(m[1])] = m[2].replace(/\*+/g, '').trim();
      }
    }
    if (Object.keys(titleMap).length > 0) {
      offerData.offers = offerData.offers.map(o => {
        const picked = titleMap[o.id];
        if (picked) o.title = picked;
        return o;
      });
    }
  }
} catch(titleErr) {
  // Non-fatal: keep node 8 titles if 10b unavailable
}

const _d0 = offerData.offers[0] || {};

return [{
  json: {
    provider: offerData.provider || '',
    vertical: offerData.vertical || '',
    offer_data: offerData,
    dbg_p0: String(_d0.party_size || 'MISSING'),
    dbg_t0: String(_d0.tier || 'MISSING'),
    dbg_h0: String(_d0.hook_type || 'MISSING'),
    dbg_cnt: offerData.offers.length,
    dbg_mi: offerData.menu_items.length,
    dbg_me_hits: Object.keys(meMap).length
  }
}];
"""

patched = False
for n in nodes:
    if n['name'] == 'Parse Offer Data':
        n['parameters']['jsCode'] = NEW_CODE
        print(f'✅ Parse Offer Data updated ({len(NEW_CODE)} chars)')
        patched = True
        break

if not patched:
    print('❌ Parse Offer Data node not found')
    sys.exit(1)

resp = s.patch(f'{N8N_BASE}/rest/workflows/{WF_ID}',
    json={'nodes': nodes, 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'PATCH: {resp.status_code}')
if resp.status_code != 200:
    print(resp.text[:300]); sys.exit(1)

r2  = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
vid = r2.json()['data'].get('versionId')
s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/deactivate')
time.sleep(1)
r_act = s.post(f'{N8N_BASE}/rest/workflows/{WF_ID}/activate', json={'versionId': vid})
print(f'Activate: {r_act.status_code}')

r3 = s.get(f'{N8N_BASE}/rest/workflows/{WF_ID}')
wf3 = r3.json()['data']
print(f'active: {wf3.get("active")}, activeVersionId: {wf3.get("activeVersionId")}')

print('\n=== VERIFICATION ===')
for n in wf3['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters'].get('jsCode', '')
        print(f'{"✅" if "FIX 1" in code else "❌"} FIX 1: ME class lookup present')
        print(f'{"✅" if "FIX 3" in code else "❌"} FIX 2 (titles): 10b merge present')
        print(f'{"✅" if "FIX 2" in code else "❌"} FIX 2 (menu): fullMenuItems override present')
        print(f'  Code length: {len(code)} chars')
