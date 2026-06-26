import requests, sys, json
sys.stdout.reconfigure(encoding='utf-8')

N8N_BASE = 'https://weinflow.app.n8n.cloud'
s = requests.Session()
s.post(f'{N8N_BASE}/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})
r = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
nodes = {n['name']: n for n in wf['nodes']}

# FIX 1: Read current Parse Offer Data code and add comma-stripping
pod_node = nodes['Parse Offer Data']
current_code = pod_node['parameters']['jsCode']
print(f'Parse Offer Data current code length: {len(current_code)} chars')
print(f'First 200: {current_code[:200]}')

# Insert comma-stripping AFTER the fence-strip block, BEFORE JSON.parse
COMMA_FIX = """
// Strip thousand-separator commas in numeric values (e.g. 2,745 → 2745)
// Pattern: digit-comma-3digits — only inside JSON number context
raw = raw.replace(/(\\d),(?=\\d{3}(?:[^\\d]|$))/g, '$1');

"""

# Insert right after the fence-strip block (before "// Find outermost { ... }")
if 'COMMA_FIX_APPLIED' in current_code:
    print('Comma fix already applied, skipping')
else:
    INSERT_AFTER = "if (m) raw = m[1].trim();\n}\n"
    if INSERT_AFTER in current_code:
        new_code = current_code.replace(INSERT_AFTER, INSERT_AFTER + COMMA_FIX + "// COMMA_FIX_APPLIED\n")
        for n in wf['nodes']:
            if n['name'] == 'Parse Offer Data':
                n['parameters']['jsCode'] = new_code
                print(f'Updated Parse Offer Data: {len(new_code)} chars')
                break
    else:
        print('WARNING: Insert point not found. Prepending at top.')
        for n in wf['nodes']:
            if n['name'] == 'Parse Offer Data':
                n['parameters']['jsCode'] = "// COMMA_FIX_APPLIED\n" + COMMA_FIX + current_code
                print(f'Prepended comma fix: {len(n["parameters"]["jsCode"])} chars')
                break

# FIX 2: Strengthen node 8 system message for party_size, menu_items, and no-comma numbers
for n in wf['nodes']:
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        current_msg = n['parameters']['messages']['messageValues'][0]['message']

        EXTRA_RULES = """

## JSON FORMATTING RULES — CRITICAL

1. ALL prices must be plain integers with NO commas or thousand separators.
   WRONG: "promo_egp": 2,745
   CORRECT: "promo_egp": 2745

   WRONG: "regular_egp": 1,200
   CORRECT: "regular_egp": 1200

2. EVERY offer object MUST include "party_size" as a string field.
   The 20 offers map to party sizes as follows:
   - id 1: party_size = "Solo"
   - id 2: party_size = "Solo"
   - id 3: party_size = "Solo"
   - id 4: party_size = "Couple"
   - id 5: party_size = "Couple"
   - id 6: party_size = "Couple"
   - id 7: party_size = "Group"
   - id 8: party_size = "Group"
   - id 9: party_size = "Group"
   - id 10: party_size = "Family"
   - id 11: party_size = "Family"
   - id 12: party_size = "Family"
   - id 13–20: Backup offers — assign party_size from any of the 4 options

3. The top-level "menu_items" array MUST appear in your JSON response.
   Even if the menu list is long, include ALL items.
   Start the array right after "waffarha_adj" or "waffarha_benchmark".

SELF-CHECK before writing final JSON:
- Count the "party_size" fields — should equal 20
- Verify no price has a comma in it (search for patterns like ,digits)
- Confirm "menu_items": [...] appears at the top level"""

        # Append the extra rules before OUTPUT CONTRACT section
        if '## JSON FORMATTING RULES' not in current_msg:
            new_msg = current_msg.replace('## MANDATORY FIELD CHECKLIST', EXTRA_RULES + '\n\n## MANDATORY FIELD CHECKLIST')
            n['parameters']['messages']['messageValues'][0]['message'] = new_msg
            print(f'Updated node 8 message: {len(current_msg)} -> {len(new_msg)} chars')
        else:
            print('JSON formatting rules already present')
        break

# Save
resp = s.patch(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd',
    json={'nodes': wf['nodes'], 'connections': wf['connections'],
          'settings': wf['settings'], 'staticData': wf['staticData']})
print(f'PATCH status: {resp.status_code}')

# Verify
r2 = s.get(f'{N8N_BASE}/rest/workflows/6v9BXm5uZpuJS8fd')
wf2 = r2.json()['data']
for n in wf2['nodes']:
    if n['name'] == 'Parse Offer Data':
        code = n['parameters']['jsCode']
        print(f'\nParse Offer Data: comma fix present = {"COMMA_FIX_APPLIED" in code}')
        print(f'Code length: {len(code)}')
    if n['name'] == '🏗️ 8. wein-creator — Build Full Offers':
        msg = n['parameters']['messages']['messageValues'][0]['message']
        print(f'Node 8 msg length: {len(msg)}')
        print(f'Has JSON formatting rules: {"JSON FORMATTING RULES" in msg}')
        print(f'Has no-comma instruction: {"2,745" in msg}')
        print(f'Has explicit id->party_size map: {"id 1: party_size" in msg}')
