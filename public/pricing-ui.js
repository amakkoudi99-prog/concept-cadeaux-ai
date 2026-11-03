let pricingDraft = null;

function renderPricing() {
  const form = document.createElement('form');
  form.className = 'pricing-form';
  const intro = document.createElement('p');
  intro.textContent = 'Achats Makito en EUR · Prix de vente en MAD. Renseigne ton taux de conversion réel et tes frais. Les taux et frais sont des paramètres à valider pour cette commande.';
  workspace.append(intro);
  const controls = {};
  function field(name, label, value, required = true) {
    const wrapper = document.createElement('label');
    wrapper.textContent = label;
    const input = document.createElement('input');
    input.name = name;
    input.type = 'text';
    input.inputMode = 'decimal';
    input.required = required;
    input.value = value;
    wrapper.append(input);
    form.append(wrapper);
    controls[name] = input;
    return input;
  }
  field('reference', 'Référence / couleur', pricingDraft?.reference ?? '', false).inputMode = 'text';
  if (pricingDraft?.prices) {
    const label = document.createElement('label');
    label.textContent = 'Palier Makito à confirmer pour cette quantité';
    const select = document.createElement('select');
    const placeholder = document.createElement('option');
    placeholder.textContent = 'Choisir le palier du fournisseur';
    placeholder.value = '';
    select.append(placeholder);
    pricingDraft.prices.forEach((price, i) => {
      const option = document.createElement('option');
      option.textContent = ['−500', '+500', '+2000', '+5000'][i] + ' pièces · ' + price + ' EUR/unité';
      option.value = price == null ? '' : String(price);
      option.disabled = price == null;
      select.append(option);
    });
    select.addEventListener('change', () => {
      controls.purchaseEUR.value = select.value;
      result.replaceChildren();
    });
    label.append(select);
    form.append(label);
  }
  field('quantity', 'Quantité (pièces)', '50');
  field('purchaseEUR', 'Prix d’achat unitaire Makito (EUR)', '');
  field('exchangeRate', 'Taux de conversion — 1 EUR = combien de MAD ?', '');
  field('international', 'Transport international affecté à cette ligne (MAD)', '0');
  field('importCharges', 'Droits et taxes non récupérables affectés à cette ligne (MAD)', '0');
  field('clearance', 'Dédouanement affecté à cette ligne (MAD)', '0');
  field('local', 'Transport local affecté à cette ligne (MAD)', '0');
  field('fixed', 'Autres frais affectés à cette ligne (MAD)', '0');
  field('personalization', 'Personnalisation par pièce (MAD)', '0');
  field('markupPercent', 'Majoration du coût de revient (%)', '');
  field('vatPercent', 'TVA sur la vente (%)', '');
  field('overrideHT', 'Prix unitaire de vente HT imposé (MAD, facultatif)', '', false);
  const note = document.createElement('p');
  note.textContent = 'La majoration s’applique au coût de revient. Exemple de méthode : 100 MAD de coût + 30 % = 130 MAD HT. Les frais totaux ci-dessus sont répartis sur les pièces de cette ligne. Vérifie les frais à zéro avant utilisation.';
  const submit = document.createElement('button');
  submit.textContent = 'Calculer en dirhams';
  const result = document.createElement('article');
  result.setAttribute('aria-live', 'polite');
  result.hidden = true;
  form.append(note, submit);
  form.addEventListener('input', () => { result.hidden = true; result.replaceChildren(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    result.replaceChildren();
    result.hidden = false;
    try {
      const input = Object.fromEntries(Object.entries(controls).map(([name, element]) => [name, element.value]));
      const amounts = CCPricing.calculate(input);
      for (const [label, key] of [
        ['Achat total converti', 'purchaseTotal'], ['Coût de revient total', 'costTotal'],
        ['Coût de revient unitaire arrondi', 'unitCost'], ['Prix de vente unitaire HT', 'unitHT'],
        ['Total HT', 'totalHT'], ['TVA totale', 'totalVAT'], ['Total TTC', 'totalTTC'],
        ['Marge totale HT estimée', 'profitHT']
      ]) {
        const line = document.createElement('p');
        line.textContent = label + ' — ' + CCPricing.mad(amounts[key]);
        result.append(line);
      }
      const status = document.createElement('p');
      status.textContent = 'Simulation interne. Disponibilité et photo de la variante restent à vérifier avant la proposition client.';
      result.append(status);
    } catch (error) {
      result.textContent = error.message;
    }
  });
  workspace.append(form, result);
}
