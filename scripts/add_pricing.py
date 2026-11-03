from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
css = """
.pricing-form { display: grid; gap: 14px; max-width: 700px; }
.pricing-form label { font-weight: 600; }
.pricing-form input, .pricing-form select { display: block; width: 100%; padding: 12px; border: 1px solid #777d86; border-radius: 6px; font: inherit; font-weight: 400; margin-top: 5px; }
.pricing-form p { font-weight: 400; }
"""
def route(js):
    js=js.replace("  ['propositions',", "  ['prix', ['Calcul des prix', 'Chiffrage interne en dirhams marocains.']],\n  ['propositions',",1)
    js=js.replace("  else if (route === 'propositions')", "  else if (route === 'prix') renderPricing();\n  else if (route === 'propositions')",1)
    return js

js_path=root/'public/app.js'
js_path.write_text(route(js_path.read_text()))
index=root/'public/index.html'
index.write_text(index.read_text().replace('<script type="module" src="/app.js"></script>',
 '<script src="/pricing.js" defer></script>\n<script src="/pricing-ui.js" defer></script>\n<script type="module" src="/app.js"></script>'))
css_path=root/'public/style.css'
css_path.write_text(css_path.read_text()+css)
server=root/'server.mjs'
server.write_text(server.read_text().replace("const assets = new Map([",
 "const assets = new Map([\n  ['/pricing.js', ['pricing.js', 'text/javascript']],\n  ['/pricing-ui.js', ['pricing-ui.js', 'text/javascript']],"))

path=Path(sys.argv[1])
html=route(path.read_text())
html=html.replace('Paliers du fichier — ', 'Prix d’achat Makito en EUR par pièce · Paliers de quantité — ')
html=re.sub(r'((?:−500|\+500|\+2000|\+5000) = )([0-9.]+)',
            lambda m:m[1]+m[2].replace('.',',')+' EUR',html)
html=html.replace("(price ?? 'non renseigné')", "(price == null ? 'non renseigné' : price + ' EUR/unité')")
html=html.replace("const add = document.createElement(\"button\");", """
const priceButton = document.createElement('button');
priceButton.type = 'button';
priceButton.textContent = 'Chiffrer en MAD';
priceButton.addEventListener('click', () => {
  pricingDraft = product;
  location.hash = 'prix';
});
item.append(priceButton);
const add = document.createElement("button");
""")
html=html.replace('<script>','<script>'+ (root/'public/pricing.js').read_text()+'\n'+
                 (root/'public/pricing-ui.js').read_text()+'\n',1)
html=html.replace('</style>',css+'</style>',1)
html=html.replace('<h2>Catalogue Makito disponible</h2>',
'''<h2>Catalogue Makito disponible</h2>
<p>Les prix ci-dessous sont les achats unitaires en euros. Les devis clients seront chiffrés en dirhams marocains.</p>
<p>Étape suivante — Calcul des prix. Le taux EUR/MAD, les frais, la majoration et la TVA sont à renseigner. Le menu interactif apparaît dans un navigateur compatible.</p>''')
path.write_text(html)
