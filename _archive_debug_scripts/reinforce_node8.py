import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']

for node in wf['nodes']:
    if node['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        current = node['parameters']['messages']['messageValues'][0]['message']
        print(f'Current length: {len(current)}')

        REINFORCEMENT = """

---

## MANDATORY FIELD CHECKLIST — every single offer MUST have ALL of these

Before writing your JSON response, verify every offer has:

1. "party_size": must be exactly one of: "Solo", "Couple", "Group", "Family"
   - NEVER omit this field. NEVER use null. NEVER use a synonym.
   - Offers 1–3 = Solo, 4–6 = Couple, 7–9 = Group, 10–12 = Family, 13–20 = Backup mix

2. "tier": must be exactly one of: "Entry", "Core", "Premium"
   - NEVER omit this field. NEVER use null. NEVER use "Mid" or "Standard".

3. "hook_type": must be exactly one of the 11 hook names from the table above
   (Zero-Price Effect, Anchor Pricing, Loss Aversion, Experience Frame, Decoy Effect,
   Reciprocity, Per-Person Anchor, Compromise Effect, Sharing Utility, Mental Accounting, Host Pride)
   - NEVER omit this field.

4. "status": must be exactly "Selected" for offers 1–12, "Backup" for offers 13–20
   - NEVER omit this field. NEVER use null.

5. "promo_egp": the final price MUST end in 9 or 5 (e.g. 459, 835, 1795, 2359)
   - If your calculated price ends in anything else, round UP to the nearest 9 or 5.
   - Set price_ending_ok: true ONLY if the price actually ends in 9 or 5.

TOP-LEVEL REQUIREMENT:
The JSON object MUST contain a "menu_items" array at the top level (same level as "provider" and "offers").
List EVERY item from the provider menu with me_class and bundle_role.
DO NOT omit this array. A response without "menu_items" at top level is INVALID."""

        # Insert the reinforcement right before "## OUTPUT CONTRACT"
        if '## OUTPUT CONTRACT' in current:
            new_msg = current.replace('## OUTPUT CONTRACT', REINFORCEMENT + '\n\n## OUTPUT CONTRACT')
            node['parameters']['messages']['messageValues'][0]['message'] = new_msg
            print(f'New length: {len(new_msg)}')
        else:
            print('ERROR: OUTPUT CONTRACT section not found')
            sys.exit(1)
        break

resp = s.patch(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd',
    json={'nodes': wf['nodes'], 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print('PATCH status:', resp.status_code)

# Verify
r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
for node in r2.json()['data']['nodes']:
    if node['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        msg = node['parameters']['messages']['messageValues'][0]['message']
        print('Verified length:', len(msg))
        print('Has MANDATORY FIELD CHECKLIST:', 'MANDATORY FIELD CHECKLIST' in msg)
        print('Has party_size enforcement:', '"party_size"' in msg and 'Solo' in msg)
        print('Has tier enforcement:', '"tier"' in msg and 'Entry' in msg)
        print('Has hook_type enforcement:', '"hook_type"' in msg)
        print('Has status enforcement:', '"status"' in msg and 'Selected' in msg)
        print('Has menu_items top-level enforcement:', 'TOP-LEVEL REQUIREMENT' in msg)
        break
