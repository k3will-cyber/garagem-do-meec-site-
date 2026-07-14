#!/usr/bin/env python3
"""Replace all wa.me URLs with api.whatsapp.com/send format.

- wa.me/5561981257477  →  api.whatsapp.com/send/?phone=5561981257477
- wa.me/5561981257477?text=...  →  api.whatsapp.com/send/?phone=5561981257477&text=...
"""

import re

FILES = [
    '/home/williandedia/garagem-do-mec-site/public/index.html',
    '/home/williandedia/garagem-do-mec-site/index.html',
]

for filepath in FILES:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    changes = 0

    # Replace ALL wa.me URLs with api.whatsapp.com/send format
    # Pattern: https://wa.me/5561981257477[?text=...]
    # Replacement: https://api.whatsapp.com/send/?phone=5561981257477[&text=...]
    
    old_count = html.count('wa.me/5561981257477')
    
    # Replace wa.me URLs that may have ?text= parameter
    html = html.replace(
        'https://wa.me/5561981257477?text=',
        'https://api.whatsapp.com/send/?phone=5561981257477&text='
    )
    
    # Replace wa.me URLs without parameters
    html = html.replace(
        'https://wa.me/5561981257477',
        'https://api.whatsapp.com/send/?phone=5561981257477'
    )

    new_count = html.count('api.whatsapp.com/send/?phone=5561981257477')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f'✅ [{filepath}]: {new_count} URLs atualizadas ({old_count} wa.me substituidas)')

print('\n✅ Todos os links WhatsApp atualizados para api.whatsapp.com!')
