globalThis.CCAssistant = (() => {
  const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const categories = [
    [/gourde|bouteille|bottle|قارور/, ['gourde', 'bouteille', 'bidon']],
    [/tote|fourre.tout|حقيب/, ['sac']],
    [/stylo|pen\b|قلم|اقلام/, ['stylo']],
    [/carnet|notebook|دفتر/, ['carnet', 'bloc']],
    [/usb|cle usb/, ['usb']],
    [/porte.cle|keyring/, ['porte-cles', 'porte-cles', 'porte-cle']]
  ];
  const colors = [
    [/bleu|blue|ازرق|زرق/, 'bleu'], [/rouge|red|احمر/, 'rouge'],
    [/noir|black|اسود/, 'noir'], [/blanc|white|ابيض/, 'blanc'],
    [/vert|green|اخضر/, 'vert'], [/jaune|yellow|اصفر/, 'jaune']
  ];
  function analyze(text) {
    // Limited local extraction. Every line stays editable before selection.
    return text.split(/\n|;|,(?!\d)|\s+et\s+(?=\d)|\s+and\s+(?=\d)/i)
      .map(line => line.trim()).filter(Boolean).map(raw => {
        const query = normalize(raw);
        const quantityMatch = query.match(/(?:^|\s)(\d+)\s+(?=[a-z\u0600-\u06ff])/);
        return { raw, quantity: quantityMatch ? Number(quantityMatch[1]) : null };
      });
  }
  function search(products, query) {
    const text = normalize(query);
    const family = categories.find(([pattern]) => pattern.test(text));
    const color = colors.find(([pattern]) => pattern.test(text))?.[1];
    const reference = text.match(/(?:ref\.?|reference)\s*([\w/-]+)/)?.[1]
      ?? (/^\d+$/.test(text.trim()) ? text.trim() : null);
    const words = text.split(/\s+/).filter(word => word.length > 2 && !/^\d+$/.test(word));
    return products.filter(product => {
      const description = normalize([product.category, product.name].join(' '));
      const all = normalize([product.reference,product.model,product.name,product.category,product.color,product.material].join(' '));
      if (reference && !normalize(product.reference).includes(reference) && product.model !== reference) return false;
      if (color && !normalize(product.color).includes(color)) return false;
      if (/inox|stainless/.test(text) && !/inox|stainless/.test(normalize(product.material))) return false;
      if (family) return family[1].some(word => description.includes(word));
      return reference || words.length > 0 && words.every(word => all.includes(word));
    });
  }
  return { analyze, search };
})();

async function renderAssistant() {
  const section = document.querySelector('#workspace');
  const explanation = document.createElement('p');
  explanation.textContent = 'Préparation assistée locale · Analyse indicative à vérifier. Le modèle IA conversationnel reste à connecter.';
  const form = document.createElement('form');
  const label = document.createElement('label');
  label.textContent = 'Demande client';
  const input = document.createElement('textarea');
  input.required = true;
  input.placeholder = '500 gourdes bleues, 150 tote bags, 300 stylos';
  label.append(input);
  const button = document.createElement('button');
  button.textContent = 'Rechercher dans Makito';
  const status = document.createElement('p');
  status.setAttribute('role','status');
  const results = document.createElement('div');
  form.append(label, button);
  section.append(explanation, form, status, results);
  let products;
  try {
    if (typeof demoProducts !== 'undefined') products = demoProducts;
    else {
      const response = await fetch('/api/catalogue');
      if (!response.ok) throw Error('Catalogue indisponible');
      products = await response.json();
    }
  } catch {
    status.textContent = 'Chargement du catalogue impossible.';
    button.disabled = true;
    return;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    results.replaceChildren();
    const lines = CCAssistant.analyze(input.value);
    status.textContent = lines.length + ' demande(s) à vérifier. Ajuste la recherche si nécessaire.';
    for (const line of lines) {
      const card = document.createElement('article');
      const queryLabel = document.createElement('label');
      queryLabel.textContent = 'Produit demandé';
      const query = document.createElement('input');
      query.value = line.raw;
      queryLabel.append(query);
      const quantityLabel = document.createElement('label');
      quantityLabel.textContent = 'Quantité à confirmer';
      const quantity = document.createElement('input');
      quantity.type = 'number';
      quantity.min = '1';
      quantity.step = '1';
      quantity.required = true;
      quantity.value = line.quantity ?? '';
      quantityLabel.append(quantity);
      const search = document.createElement('button');
      search.textContent = 'Actualiser la sélection';
      const matches = document.createElement('div');
      function showMatches() {
        matches.replaceChildren();
        const found = CCAssistant.search(products, query.value);
        const count = document.createElement('p');
        count.textContent = found.length + ' variante(s) trouvée(s) · 12 affichées au maximum';
        matches.append(count);
        for (const product of found.slice(0,12)) {
          const row = document.createElement('p');
          row.textContent = [product.model ?? product.reference, product.name, product.color, product.size].filter(Boolean).join(' · ');
          const choose = document.createElement('button');
          choose.textContent = 'Préparer la maquette';
          choose.onclick = () => {
            if (!quantity.reportValidity()) return;
            mockupDraft = { ...product, quantity: quantity.valueAsNumber };
            location.hash = 'maquettes';
          };
          row.append(' ', choose);
          matches.append(row);
        }
      }
      search.onclick = showMatches;
      card.append(queryLabel, quantityLabel, search, matches);
      results.append(card);
      showMatches();
    }
  });
}
