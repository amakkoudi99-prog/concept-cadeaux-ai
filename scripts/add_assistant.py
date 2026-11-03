"""Integrate the assisted workflow into the source app and its private HTML preview."""
import json
import sys
from pathlib import Path

root=Path(__file__).resolve().parents[1]
def routes(text):
    text=text.replace("  else if (route === 'prix')", "  else if (route === 'assistant') void renderAssistant();\n  else if (route === 'maquettes') renderMockup();\n  else if (route === 'prix')",1)
    text=text.replace("L’analyse des demandes sera connectée en phase 9.", "Recherche Makito et préparation des maquettes.")
    return text

app=root/'public/app.js'
app.write_text(routes(app.read_text()))
index=root/'public/index.html'
index.write_text(index.read_text().replace('<script src="/pricing.js" defer>',
 '<script src="/assistant.js" defer></script>\n<script src="/mockup.js" defer></script>\n<script src="/pricing.js" defer>'))
server=root/'server.mjs'
server.write_text(server.read_text().replace('const assets = new Map([',
 'const assets = new Map([\n  ["/assistant.js", ["assistant.js", "text/javascript"]],\n  ["/mockup.js", ["mockup.js", "text/javascript"]],'))
css="""
.studio-controls { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,220px),1fr)); gap: 15px; margin: 20px 0; }
.studio-controls input, .studio-controls select { display: block; max-width: 100%; padding: 9px; font: inherit; }
#workspace article { margin-bottom: 16px; }
#workspace input:not([type=checkbox]):not([type=range]) { max-width: 100%; }
#workspace button { margin: 5px; }
"""
style=root/'public/style.css'
style.write_text(style.read_text()+css)
path=Path(sys.argv[1]);html=routes(path.read_text())
html=html.replace('<script>', '<script>\n'+(root/'public/assistant.js').read_text()+'\n'+
 (root/'public/mockup.js').read_text()+'\nconst makitoPhotos = '+Path(sys.argv[2]).read_text()+';\n',1)
html=html.replace('</style>',css+'</style>',1)
html=html.replace('Étape suivante — Calcul des prix. Le taux EUR/MAD, les frais, la majoration et la TVA sont à renseigner. Le menu interactif apparaît dans un navigateur compatible.',
 'Assistant disponible dans le mode interactif — demande client, recherche Makito, placement du logo et maquette PNG avec prix saisi en MAD. Dans cet aperçu de lecture, le catalogue reste consultable.')
# Extracted catalogue is kept locally for the application server, with the same confidential scope as the preview.
import re
match=re.search(r'const demoProducts = (\[.*?\]);\s*const pages',html,re.S)
(root/'makito-catalogue.json').write_text(match[1])
path.write_text(html)
