#!/usr/bin/env python3
"""Fix WhatsApp redirect flows in index.html files.

1. Roleta prize claim: was using customer's phone number instead of 5561981257477
2. Contact form: now opens WhatsApp with lead info after Formspree success
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

    # ---- FIX 1: Roleta prize claim ----
    old_roleta = (
        "      var waInput = document.getElementById('roleta-whatsapp');\n"
        "      var waNumber = waInput ? waInput.value.replace(/\\D/g,'') : '5561981257477';\n"
        "      var waLink = document.getElementById('roleta-whatsapp-link');\n"
        "      waLink.href = 'https://wa.me/' + waNumber + '?text=Ol\u00e1! Acabei de ganhar na roleta da Garagem do MEEC! Meu pr\u00eamio: ' + encodeURIComponent(prize.label) + ' | Meu n\u00famero da sorte: #' + roletaLuckyNumber;"
    )

    new_roleta = (
        "      var waNome2 = document.getElementById('roleta-name').value.trim();\n"
        "      var waTel2  = document.getElementById('roleta-whatsapp').value.trim();\n"
        "      var waLink = document.getElementById('roleta-whatsapp-link');\n"
        "      var msgPremio = '\U0001fa21 *GANHEI NA ROLETA - GARAGEM DO MEEC!*\\n\\n' +\n"
        "        '\U0001f464 *Nome:* ' + waNome2 + '\\n' +\n"
        "        '\U0001f4de *WhatsApp:* ' + waTel2 + '\\n' +\n"
        "        '\U0001f3c6 *Pr\u00eamio:* ' + prize.label + '\\n' +\n"
        "        '\U0001f3ab *N\u00ba da Sorte:* #' + roletaLuckyNumber + '\\n\\n' +\n"
        "        'Quero resgatar meu pr\u00eamio! \U0001f697\U0001f4a8';\n"
        "      waLink.href = 'https://wa.me/5561981257477?text=' + encodeURIComponent(msgPremio);"
    )

    if old_roleta in html:
        html = html.replace(old_roleta, new_roleta)
        changes += 1
        print(f'✅ [{filepath}] Roleta prize: fixed')
    else:
        print(f'ℹ️  [{filepath}] Roleta: pattern not found')

    # ---- FIX 2: Contact form - add WhatsApp redirect BEFORE form.reset() ----
    old_form = (
        "          if (response.ok) {\n"
        "            successDiv.classList.remove('hidden');\n"
        "            form.reset();\n"
        "            // Scroll to success message\n"
        "            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });\n"
        "          } else {\n"
        "            throw new Error('Formspree error');\n"
        "          }"
    )

    new_form = (
        "          if (response.ok) {\n"
        "            successDiv.classList.remove('hidden');\n"
        "            // Abrir WhatsApp com resumo do lead (antes do reset para preservar dados)\n"
        "            var msgOrca = '\U0001f4e9 *NOVO LEAD - SITE GARAGEM DO MEEC*\\n\\n' +\n"
        "              '\U0001f464 *Nome:* ' + data.name + '\\n' +\n"
        "              '\U0001f4de *WhatsApp:* ' + data.whatsapp + '\\n' +\n"
        "              '\U0001f4ac *Mensagem:* ' + (data.message || '(sem mensagem)') + '\\n\\n' +\n"
        "              '\u26a0\ufe0f *Lead do site \u2014 responder em at\u00e9 2h*';\n"
        "            window.open('https://wa.me/5561981257477?text=' + encodeURIComponent(msgOrca), '_blank');\n"
        "            form.reset();\n"
        "            // Scroll to success message\n"
        "            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });\n"
        "          } else {\n"
        "            throw new Error('Formspree error');\n"
        "          }"
    )

    if old_form in html:
        html = html.replace(old_form, new_form)
        changes += 1
        print(f'✅ [{filepath}] Contact form: fixed')
    else:
        print(f'ℹ️  [{filepath}] Contact form: pattern not found')

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'📝 [{filepath}] Written ({changes} changes)')

print('\n✅ All WhatsApp flows fixed!')
