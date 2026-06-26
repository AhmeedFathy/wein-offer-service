import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

# The fix: deep-clone the offerData object via JSON.stringify/JSON.parse
# so n8n creates NEW pool entries for the enriched data instead of re-using
# the original node 8 pool entries.

NEW_PARSE_CODE = r"""let raw = ($('🏗️ 8. wein-creator — Build Full Offers').item.json.text || '').trim();

// Strip markdown fences
if (raw.includes('```')) {
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) raw = m[1].trim();
}

// Strip thousand-separator commas in numeric values (e.g. 2,745 → 2745)
raw = raw.replace(/(\d),(?=\d{3}(?:[^\d]|$))/g, '$1');

// Find outermost { ... }
const start = raw.indexOf('{');
if (start < 0) throw new Error('No JSON object found in wein-creator output');
raw = raw.slice(start);

// Parse — with truncation recovery
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
  if (!recovered) throw new Error('JSON recovery failed: ' + e1.message);
}

if (!offerDataRaw || !Array.isArray(offerDataRaw.offers)) {
  throw new Error('Parsed JSON has no offers array');
}

// CRITICAL: deep-clone via JSON round-trip so n8n creates NEW pool entries
// for the enriched data instead of re-using original node 8 pool references.
const offerData = JSON.parse(JSON.stringify(offerDataRaw));

// ─── DETERMINISTIC FIELD ENRICHMENT ────────────────────────────────────────
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

  // party_size
  if (!o.party_size || !['Solo','Couple','Group','Family'].includes(o.party_size)) {
    o.party_size = id <= 12 ? (PARTY_SIZE_BY_ID[id] || 'Solo') : (BACKUP_SIZES[(id-13) % 8] || 'Solo');
  }
  // tier
  if (!o.tier || !['Entry','Core','Premium'].includes(o.tier)) {
    o.tier = id <= 12 ? (TIER_BY_ID[id] || 'Entry') : (BACKUP_TIERS[(id-13) % 8] || 'Entry');
  }
  // status
  if (!o.status || !['Selected','Backup'].includes(o.status)) {
    o.status = id <= 12 ? 'Selected' : 'Backup';
  }
  // hook_type
  if (!o.hook_type) {
    o.hook_type = HOOK_MAP[`${o.party_size}-${o.tier}`] || 'Zero-Price Effect';
  }
  // price ending
  const p = o.promo_egp || 0;
  if (p > 0 && p % 10 !== 5 && p % 10 !== 9) {
    const rem = p % 10;
    o.promo_egp = rem < 5 ? p + (5 - rem) : rem < 9 ? p + (9 - rem) : p + (19 - rem);
  }
  o.price_ending_ok = (o.promo_egp % 10 === 5 || o.promo_egp % 10 === 9);
  return o;
});

// ─── BUILD TOP-LEVEL menu_items IF MISSING ──────────────────────────────────
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
}

return [{
  json: {
    provider: offerData.provider || '',
    vertical: offerData.vertical || '',
    offer_data: offerData
  }
}];
"""

for n in wf['nodes']:
    if n['name'] == 'Parse Offer Data':
        n['parameters']['jsCode'] = NEW_PARSE_CODE
        print(f'Updated Parse Offer Data: {len(NEW_PARSE_CODE)} chars')
        break

resp = s.patch(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd',
    json={'nodes': wf['nodes'], 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'PATCH status: {resp.status_code}')

r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
for n in r2.json()['data']['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters']['jsCode']
        print(f'Verified length: {len(code)}')
        print(f'Has deep-clone: {"JSON.parse(JSON.stringify(offerDataRaw))" in code}')
        print(f'Has PARTY_SIZE_BY_ID: {"PARTY_SIZE_BY_ID" in code}')
        print(f'Has menu_items build: {"menu_items.push" in code}')
        break
