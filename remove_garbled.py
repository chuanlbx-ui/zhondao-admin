import codecs
import re

# Read the file
with codecs.open('src/api/index.ts', 'r', 'utf-8') as f:
    content = f.read()

# Remove all garbled Chinese comments (non-ASCII characters in comments)
# Pattern: // followed by any characters including non-ASCII
content = re.sub(r'//\s*[^\x00-\x7F][^\n]*', '//', content)

# Also clean up console.log with garbled text
content = re.sub(r"console\.log\(['\][^\x00-\x7F][^'\]*['\]\)", "console.log('')", content)
content = re.sub(r"console\.log\(['\][^\x00-\x7F][^'\]*['\],", "console.log('',", content)

# Write back
with codecs.open('src/api/index.ts', 'w', 'utf-8') as f:
    f.write(content)

print('All garbled comments removed!')
