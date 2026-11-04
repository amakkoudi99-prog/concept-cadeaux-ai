// Première étape du parcours maquette → devis. Stockage local provisoire.
const workflowKey = 'concept-cadeaux:workflow:v1';
function workflowRead() {
  try {
    const data = JSON.parse(localStorage.getItem(workflowKey) || '{}');
    return { mockups: Array.isArray(data.mockups) ? data.mockups : [], quotes: Array.isArray(data.quotes) ? data.quotes : [] };
  } catch { return { mockups: [], quotes: [] }; }
}
function workflowSave(data) { localStorage.setItem(workflowKey, JSON.stringify(data)); }
function workflowElement(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function workflowButton(label, action) {
  const button = workflowElement('button', label);
  button.type = 'button'; button.addEventListener('click', action); return button;
}
function workflowField(label, value = '', type = 'text') {
  const wrapper = workflowElement('label', label);
  const input = document.createElement('input');
  input.type = type; input.value = value; input.required = true;
  wrapper.append(input); return [wrapper, input];
}
function renderWorkflowMockups() {
  const root = document.querySelector('#workspace');
  const data = workflowRead();
  const header = workflowElement('article');
  header.append(workflowElement('h2', 'Maquettes enregistrées'), workflowElement('p', 'Chaque maquette reste liée à son client. Les fichiers créés précédemment ne sont pas effacés.'));
  header.append(workflowButton('+ Créer une nouvelle maquette', () => {
    root.replaceChildren();
    const form = workflowElement('form');
    const [clientLabel, client] = workflowField('Nom du client');
    const [nameLabel, name] = workflowField('Nom de la maquette');
    const [descriptionLabel, description] = workflowField('Description / références des produits');
    const submit = workflowElement('button', 'Enregistrer la fiche et ouvrir le studio');
    const status = workflowElement('p'); status.setAttribute('role', 'status');
    form.append(clientLabel, nameLabel, descriptionLabel, submit, status);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const current = workflowRead();
      const mockup = { id: crypto.randomUUID(), client: client.value.trim(), name: name.value.trim(), description: description.value.trim(), createdAt: new Date().toISOString() };
      current.mockups.unshift(mockup);
      try { workflowSave(current); } catch { status.textContent = 'Enregistrement impossible sur cet appareil.'; return; }
      // Le studio actuel conserve son fonctionnement : démarrage depuis l'Assistant.
      location.hash = '#assistant';
    });
    root.append(form, workflowButton('← Retour aux maquettes', renderCurrentRoute));
  }));
  root.append(header);
  if (!data.mockups.length) root.append(workflowElement('p', 'Aucune fiche de maquette enregistrée pour le moment.'));
  for (const mockup of data.mockups) {
    const card = workflowElement('article');
    card.append(workflowElement('h3', mockup.name), workflowElement('p', mockup.client + ' · ' + new Date(mockup.createdAt).toLocaleDateString('fr-FR')), workflowElement('p', mockup.description));
    card.append(workflowButton('Créer un devis pour cette maquette', () => { location.hash = '#facturation'; renderWorkflowBilling(mockup.id); }));
    root.append(card);
  }
}
function renderWorkflowBilling(selectedMockupId = null) {
  const root = document.querySelector('#workspace'); root.replaceChildren();
  const data = workflowRead();
  const header = workflowElement('article');
  header.append(workflowElement('h2', 'Devis, factures et bons de livraison'), workflowElement('p', 'Choisis une maquette enregistrée pour créer un devis.'));
  header.append(workflowButton('+ Créer un nouveau devis', () => showQuoteSelector()));
  root.append(header);
  const quotes = workflowElement('article');
  quotes.append(workflowElement('h3', 'Historique des devis'));
  if (!data.quotes.length) quotes.append(workflowElement('p', 'Aucun devis enregistré.'));
  for (const quote of data.quotes) {
    const mockup = data.mockups.find(m => m.id === quote.mockupId);
    quotes.append(workflowElement('p', quote.number + ' · ' + (mockup?.client || quote.client) + ' · ' + quote.total.toFixed(2) + ' MAD HT · Brouillon'));
  }
  root.append(quotes);
  const invoices = workflowElement('article');
  invoices.append(workflowElement('h3', 'Factures et bons de livraison'), workflowElement('p', 'À générer après validation et livraison de la commande. Aucun document n’est créé automatiquement à cette étape.'));
  root.append(invoices);
  if (selectedMockupId) showQuoteForm(selectedMockupId);
  function showQuoteSelector() {
    root.replaceChildren();
    const card = workflowElement('article');
    card.append(workflowElement('h2', 'Sélectionner une maquette'), workflowButton('← Retour aux devis', () => renderWorkflowBilling()));
    if (!data.mockups.length) card.append(workflowElement('p', 'Aucune maquette disponible. Crée d’abord une fiche dans Maquettes.'));
    for (const mockup of data.mockups) card.append(workflowButton(mockup.client + ' — ' + mockup.name, () => showQuoteForm(mockup.id)));
    root.append(card);
  }
  function showQuoteForm(id) {
    const mockup = data.mockups.find(m => m.id === id);
    if (!mockup) return showQuoteSelector();
    root.replaceChildren();
    const form = workflowElement('form');
    form.append(workflowElement('h2', 'Nouveau devis — ' + mockup.client), workflowElement('p', mockup.name + ' · ' + mockup.description));
    const [quantityLabel, quantity] = workflowField('Quantité', '50', 'number');
    quantity.min = '1'; quantity.step = '1';
    const [priceLabel, price] = workflowField('Prix unitaire HT (MAD)', '', 'number');
    price.min = '0'; price.step = '0.01';
    const status = workflowElement('p'); status.setAttribute('role', 'status');
    form.append(quantityLabel, priceLabel, workflowElement('button', 'Enregistrer le devis brouillon'), status);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const current = workflowRead();
      const count = Number(quantity.value), unitPrice = Number(price.value);
      if (!Number.isInteger(count) || count < 1 || !Number.isFinite(unitPrice) || unitPrice < 0) return;
      const year = new Date().getFullYear();
      const sequence = current.quotes.filter(q => q.number.startsWith('DEV-' + year + '-')).length + 1;
      const number = 'DEV-' + year + '-' + String(sequence).padStart(4, '0');
      current.quotes.unshift({ id: crypto.randomUUID(), mockupId: id, client: mockup.client, number, quantity: count, unitPrice, total: count * unitPrice, createdAt: new Date().toISOString() });
      try { workflowSave(current); renderWorkflowBilling(); } catch { status.textContent = 'Impossible d’enregistrer ce devis.'; }
    });
    root.append(form, workflowButton('← Retour aux devis', () => renderWorkflowBilling()));
  }
}
function renderCurrentRoute() { location.hash = '#maquettes'; renderWorkflowMockups(); }
