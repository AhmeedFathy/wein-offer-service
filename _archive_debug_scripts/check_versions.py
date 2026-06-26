import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')
s = requests.Session()
s.post('https://weinflow.app.n8n.cloud/rest/login', json={'emailOrLdapLoginId':'af8847492@gmail.com','password':'Tyzk7mra'})

# Get current workflow version
r = s.get('https://weinflow.app.n8n.cloud/rest/workflows/6v9BXm5uZpuJS8fd')
wf = r.json()['data']
print(f'Workflow versionId: {wf.get("versionId")}')
print(f'Workflow activeVersionId: {wf.get("activeVersionId")}')
print(f'Workflow updatedAt: {wf.get("updatedAt")}')

# Get execution 207 version
r207 = s.get('https://weinflow.app.n8n.cloud/rest/executions/207')
exec207 = r207.json()['data']
print(f'\nExec 207 workflowVersionId: {exec207.get("workflowVersionId")}')
print(f'Exec 207 createdAt: {exec207.get("createdAt")}')
print(f'Exec 207 startedAt: {exec207.get("startedAt")}')

# Check workflow version history if available
rv = s.get('https://weinflow.app.n8n.cloud/rest/workflows/6v9BXm5uZpuJS8fd/versions', timeout=10)
print(f'\nVersions endpoint status: {rv.status_code}')
if rv.status_code == 200:
    versions = rv.json()
    print(f'Versions: {json.dumps(versions, indent=2)[:500]}')
