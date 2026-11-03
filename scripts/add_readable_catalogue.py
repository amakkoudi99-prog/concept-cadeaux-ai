"""Add a script-independent catalogue to the existing single-file preview."""
import json
import re
import sys
from collections import defaultdict
from html import escape
from pathlib import Path

path = Path(sys.argv[1])
html = path.read_text()
match = re.search(r'const demoProducts = (\[.*?\]);\s*const pages', html, re.S)
products = json.loads(match.group(1))
groups = defaultdict(lambda: defaultdict(list))
for product in products:
    groups[product['category'] or 'Autres'][product['model']].append(product)

def text(value):
    return escape(str(value or 'À confirmer'))

parts = ['<div id="lecture"><article><h2>Catalogue Makito disponible</h2>'
         '<p>Ouvre une famille de produits ci-dessous pour consulter les références et leurs couleurs.</p>'
         '<p id="compatibility">Mode lecture pour les aperçus de fichiers. La recherche et la préparation des propositions nécessitent un navigateur qui exécute les fonctions interactives.</p>'
         '<p>Tarif confidentiel 2026 · Stock et photos par couleur à vérifier.</p></article>']
for category, models in sorted(groups.items()):
    parts.append('<details class="family"><summary>' + text(category) +
                 ' · ' + str(len(models)) + ' références</summary>')
    for ref, variants in models.items():
        product = variants[0]
        parts.append('<article><h3>' + text(ref) + ' · ' + text(product['name']) + '</h3>')
        parts.append('<p>' + text(product['material']) + '</p>')
        parts.append('<p>Couleurs et tailles — ' + '; '.join(
            text(v['color']) + ' (' + text(v['size']) + ')' for v in variants) + '</p>')
        if product['prices']:
            parts.append('<p>Paliers du fichier — ' + ' · '.join(
                text(label) + ' = ' + text(price) for label, price in
                zip(['−500', '+500', '+2000', '+5000'], product['prices'])) + '</p>')
        else:
            parts.append('<p>' + ('Tarifs contradictoires à vérifier' if product['conflict']
                                 else 'Tarif à confirmer') + '</p>')
        if product['photo']:
            parts.append('<a target="_blank" rel="noopener noreferrer" href="' +
                         escape(product['photo'], quote=True) +
                         '">Voir la photo fournisseur — couleur à vérifier</a>')
        parts.append('</article>')
    parts.append('</details>')
parts.append('</div>')
html = html.replace('<section id="workspace"></section>',
                    '<section id="workspace">' + ''.join(parts) + '</section>')
html = html.replace('<h1 id="title">Tableau de bord</h1>',
                    '<h1 id="title">Catalogue Makito</h1>')
html = html.replace("const route = pages.has(requested) ? requested : 'accueil';",
                    "const route = pages.has(requested) ? requested : 'catalogue';")
html = html.replace("Le premier import portera sur un catalogue Makito autorisé.",
                    "Recherche par référence, couleur, matière ou nom dans le fichier Makito 2026.")
html = html.replace('</style>', '''
.family { margin-top: 12px; border: 1px solid #dcdfe4; border-radius: 8px; background: white; }
.family summary { padding: 14px; cursor: pointer; font-weight: 600; }
.family article { border-radius: 0; border-width: 1px 0 0; }
h3, p, a { overflow-wrap: anywhere; }
@media (max-width: 650px) { main { padding: 18px; } h1 { font-size: 1.8rem; } }
</style>''')
path.write_text(html)
print(json.dumps({'variants': len(products), 'families': len(groups),
                  'references': sum(len(v) for v in groups.values())}))
