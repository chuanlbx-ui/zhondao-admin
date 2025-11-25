import codecs

# Read the file
with codecs.open('src/api/index.ts', 'r', 'utf-8') as f:
    lines = f.readlines()

# Fix problematic comments - replace garbled Chinese with English
fixes = [
    ('// 鍒嗛悩鍒濇敼涓?0绉掞紝缁欏悗绔洿澶氭椂闂村鐞嗚姹?', '// Timeout 60s for backend processing'),
    ('// 鍖呭惈cookie', '// Include credentials for cookies'),
    ('// 璇锋眰鎷︽埅鍣?', '// Request interceptor'),
]

# Apply fixes
content = ''.join(lines)
for old, new in fixes:
    content = content.replace(old, new)

# Write back
with codecs.open('src/api/index.ts', 'w', 'utf-8') as f:
    f.write(content)

print('Comments fixed!')
