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

// ── Pre-processing: fix common LLM JSON mistakes ────────────────────────────

// 1. Strip thousand-separator commas in numbers  (2,745 → 2745)
raw = raw.replace(/(\d),(?=\d{3}(?:[^\d]|$))/g, '$1');

// 2. Fix duplicate property names: "key","key": → "key":
//    Pattern: "someKey","someKey": where both sides are identical
raw = raw.replace(/"([^"]{1,40})","(\1)":/g, '"$1":');

// ────────────────────────────────────────────────────────────────────────────

// Find outermost { ... }
const start = raw.indexOf('{');
if (start < 0) throw new Error('No JSON object found in wein-creator output');
raw = raw.slice(start);

// Parse — with fallback recovery
let offerDataRaw;
try {
  offerDataRaw = JSON.parse(raw);
} catch(e1) {
  let recovered = false;
  // Walk backwards looking for a valid JSON close
  for (let end = raw.length; end > 100; end--) {
    if (raw[end-1] !== '}') continue;
    try {
      offerDataRaw = JSON.parse(raw.slice(0, end));
      recovered = true;
      break;
    } catch(e2) {}
  }
  if (!recovered) throw new Error('JSON recovery failed: ' + e1.message.slice(0,200));
}

if (!offerDataRaw || !Array.isArray(offerDataRaw.offers)) {
  throw new Error('Parsed JSON has no offers array');
}

// CRITICAL: deep-clone via JSON round-trip so n8n creates NEW pool entries
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

# Verify the regex fix actually works on exec 205's bad output
import re
bad = '"id":18,"title","title":"Levantine cooking class'
fixed = re.sub(r'"([^"]{1,40})","(\1)":', lambda m: f'"{m.group(1)}":', bad)
# JS uses $1 backrefs but Python uses \1 or group()
# Let's also test with the actual regex logic
fixed2 = re.sub(r'"([^"]{1,40})","([^"]{1,40})":', lambda m: f'"{m.group(1)}":' if m.group(1) == m.group(2) else m.group(0), bad)
print(f'Regex test on bad string:')
print(f'  Input:  {bad}')
print(f'  Fixed:  {fixed2}')
print(f'  Correct: {fixed2 == bad.replace("\"title\",\"title\":", "\"title\":")}')

r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
for n in r2.json()['data']['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters']['jsCode']
        print(f'\nVerified length: {len(code)}')
        print(f'Has dup-key fix: {"duplicate property names" in code}')
        print(f'Has deep-clone: {"JSON.parse(JSON.stringify" in code}')
        break
