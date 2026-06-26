import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

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

// Try direct parse first
let offerData;
try {
  offerData = JSON.parse(raw);
} catch(e1) {
  // Robust truncation recovery
  const offersArrayStart = raw.indexOf('"offers"');
  if (offersArrayStart < 0) throw new Error('Cannot find offers key: ' + e1.message);

  let recovered = false;
  for (let end = raw.length; end > offersArrayStart + 100; end--) {
    if (raw[end-1] !== '}') continue;
    try {
      offerData = JSON.parse(raw.slice(0, end) + (raw.slice(0, end).split('{').length > raw.slice(0, end).split('}').length ? '}]}' : ''));
      recovered = true;
      break;
    } catch(e2) {
      try {
        offerData = JSON.parse(raw.slice(0, end));
        recovered = true;
        break;
      } catch(e3) {}
    }
  }
  if (!recovered) throw new Error('JSON recovery failed: ' + e1.message);
}

if (!offerData || !Array.isArray(offerData.offers)) {
  throw new Error('Parsed JSON has no offers array');
}

// ─── DETERMINISTIC FIELD ENRICHMENT ────────────────────────────────────────
// The LLM often omits party_size / tier / hook_type / status.
// We assign them deterministically from offer ID per the 4×3 matrix.

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
  'Solo-Entry':    'Zero-Price Effect',
  'Solo-Core':     'Anchor Pricing',
  'Solo-Premium':  'Loss Aversion',
  'Couple-Entry':  'Experience Frame',
  'Couple-Core':   'Decoy Effect',
  'Couple-Premium':'Reciprocity',
  'Group-Entry':   'Per-Person Anchor',
  'Group-Core':    'Compromise Effect',
  'Group-Premium': 'Sharing Utility',
  'Family-Entry':  'Zero-Price Effect',
  'Family-Core':   'Mental Accounting',
  'Family-Premium':'Host Pride',
};

// Backup cycling: ids 13–20 rotate through party sizes
const BACKUP_SIZES = ['Solo','Couple','Group','Family','Solo','Couple','Group','Family'];
const BACKUP_TIERS = ['Entry','Core','Premium','Entry','Core','Premium','Entry','Core'];

offerData.offers = offerData.offers.map((o, idx) => {
  const id = o.id || (idx + 1);
  let ps = o.party_size;
  let tier = o.tier;
  let status = o.status;

  // Fill party_size
  if (!ps || !['Solo','Couple','Group','Family'].includes(ps)) {
    ps = id <= 12 ? PARTY_SIZE_BY_ID[id] : BACKUP_SIZES[id - 13] || 'Solo';
    o.party_size = ps;
  }
  // Fill tier
  if (!tier || !['Entry','Core','Premium'].includes(tier)) {
    tier = id <= 12 ? TIER_BY_ID[id] : BACKUP_TIERS[id - 13] || 'Entry';
    o.tier = tier;
  }
  // Fill status
  if (!status || !['Selected','Backup'].includes(status)) {
    o.status = id <= 12 ? 'Selected' : 'Backup';
  }
  // Fill hook_type
  if (!o.hook_type) {
    o.hook_type = HOOK_MAP[`${ps}-${tier}`] || 'Zero-Price Effect';
  }
  // Ensure promo_egp ends in 5 or 9
  if (o.promo_egp && (o.promo_egp % 10 !== 5 && o.promo_egp % 10 !== 9)) {
    const rem = o.promo_egp % 10;
    o.promo_egp = rem < 5 ? o.promo_egp - rem + 5 :
                  rem < 9 ? o.promo_egp - rem + 9 :
                  o.promo_egp + (19 - rem);
  }
  o.price_ending_ok = (o.promo_egp % 10 === 5 || o.promo_egp % 10 === 9);
  return o;
});

// ─── BUILD TOP-LEVEL menu_items IF MISSING ──────────────────────────────────
if (!Array.isArray(offerData.menu_items) || offerData.menu_items.length === 0) {
  const seen = new Set();
  const items = [];
  for (const offer of offerData.offers) {
    for (const item of (offer.items || [])) {
      const key = (item.name || '').toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
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
  offerData.menu_items = items;
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

# Verify
r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
for n in r2.json()['data']['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters']['jsCode']
        print(f'Verified length: {len(code)}')
        print(f'Has PARTY_SIZE_BY_ID: {"PARTY_SIZE_BY_ID" in code}')
        print(f'Has HOOK_MAP: {"HOOK_MAP" in code}')
        print(f'Has price_ending fix: {"promo_egp % 10" in code}')
        print(f'Has menu_items build: {"BUILD TOP-LEVEL menu_items" in code}')
        break
