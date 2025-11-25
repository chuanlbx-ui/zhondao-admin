import codecs, re

with codecs.open('src/api/index.ts.backup', 'r', 'utf-8') as f:
    lines = f.readlines()

# Replace garbled console.log lines with empty ones
new_lines = []
for line in lines:
    # Replace Chinese in console.log with generic messages
    if 'console.log' in line and any(ord(ch) > 127 for ch in line):
        if 'API' in line or 'api' in line:
            line = re.sub(r"console\.log\([^\)]+\)", "console.log('')", line)
    # Keep the line
    new_lines.append(line)

# Write the cleaned file
content = ''.join(new_lines)

# Now fix the API paths
content = content.replace("('/users'", "('/admin/users'")
content = content.replace('(/users/', '(/admin/users/')

with codecs.open('src/api/index.ts', 'w', 'utf-8') as f:
    f.write(content)

print('File cleaned and fixed!')
