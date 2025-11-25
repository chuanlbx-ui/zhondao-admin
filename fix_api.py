import codecs

# Read the backup file with UTF-8 encoding
with codecs.open('src/api/index.ts.backup', 'r', 'utf-8') as f:
    content = f.read()

# Replace all user API paths with admin paths
content = content.replace("adminApiClient.get('/users'", "adminApiClient.get('/admin/users'")
content = content.replace('adminApiClient.get(/users/', 'adminApiClient.get(/admin/users/')
content = content.replace('adminApiClient.put(/users/', 'adminApiClient.put(/admin/users/')
content = content.replace('adminApiClient.delete(/users/', 'adminApiClient.delete(/admin/users/')

# Write the fixed content
with codecs.open('src/api/index.ts', 'w', 'utf-8') as f:
    f.write(content)

print('File fixed successfully!')
