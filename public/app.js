const pages = new Map([
  ['accueil', ['Tableau de bord', 'Suivez vos demandes commerciales et préparez vos offres.']],
  ['assistant', ['Assistant', 'L’analyse des demandes sera connectée en phase 9.']],
  ['catalogue', ['Catalogue', 'Le premier import portera sur un catalogue Makito autorisé.']],
  ['prix', ['Calcul des prix', 'Chiffrage interne en dirhams marocains.']],
  ['propositions', ['Propositions', 'Les produits et prix validés alimenteront la proposition PDF.']],
  ['maquettes', ['Maquettes', 'Le studio placera les logos sur les zones de marquage.']],
  ['facturation', ['Facturation', 'Les devis, factures et avoirs disposeront de leur propre historique.']],
  ['clients', ['Clients', 'Les fiches clients seront reliées aux projets et documents.']],
  ['parametres', ['Paramètres', 'Les règles de calcul et les accès seront configurés ici.']],
]);

const selection = new Map();
const storageKey = 'concept-cadeaux:test-drafts';
const nav = document.querySelector('nav');
const workspace = document.querySelector('#workspace');

for (const [route, [label]] of pages) {
  const link = document.createElement('a');
  link.href = '#' + route;
  link.textContent = label;
  nav.append(link);
}

function renderDashboard() {
  workspace.append(document.querySelector('#dashboard').content.cloneNode(true));
  const form = workspace.querySelector('form');
  const input = workspace.querySelector('textarea');
  const status = form.querySelector('[role="status"]');
  const list = workspace.querySelector('#drafts');
  let drafts;
  try {
    drafts = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(drafts) || drafts.some(draft => typeof draft !== 'string')) {
      throw new Error('Format inattendu');
    }
  } catch {
    status.textContent = 'Les brouillons locaux sont indisponibles.';
    form.querySelector('button').disabled = true;
    return;
  }

  function showDrafts() {
    workspace.querySelector('#count').textContent = String(drafts.length);
    list.replaceChildren(...drafts.map(draft => {
      const item = document.createElement('li');
      item.textContent = draft;
      return item;
    }));
  }

  showDrafts();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const draft = input.value.trim();
    if (!draft) {
      status.textContent = 'Saisissez une demande.';
      return;
    }
    try {
      const next = [draft, ...drafts];
      localStorage.setItem(storageKey, JSON.stringify(next));
      drafts = next;
      form.reset();
      showDrafts();
      status.textContent = 'Brouillon enregistré.';
    } catch {
      status.textContent = 'Enregistrement impossible sur cet appareil.';
    }
  });
}

function render() {
  const requested = location.hash.slice(1);
  const route = pages.has(requested) ? requested : 'accueil';
  const [title, intro] = pages.get(route);
  document.querySelector('#title').textContent = title;
  document.querySelector('#intro').textContent = intro;
  for (const link of nav.children) {
    if (link.hash === '#' + route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  workspace.replaceChildren();
  if (route === 'accueil') renderDashboard();
  else if (route === 'catalogue') renderCatalogue();
  else if (route === 'prix') renderPricing();
  else if (route === 'propositions') renderProposal();
  else {
    const card = document.createElement('article');
    card.textContent = 'Module prévu dans le plan de développement.';
    workspace.append(card);
  }
}

window.addEventListener('hashchange', render);
render();

function renderCatalogue() {
  const notice = document.createElement('p');
  notice.textContent = 'Articles fictifs pour tester la recherche. Les données Makito seront intégrées après obtention d’un export autorisé.';
  const label = document.createElement('label');
  label.textContent = 'Référence, nom, catégorie, couleur ou matière';
  const input = document.createElement('input');
  input.type = 'search';
  label.append(input);
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  const list = document.createElement('ul');
  const form = document.createElement('form');
  const button = document.createElement('button');
  button.textContent = 'Rechercher';
  form.append(label, button);
  workspace.append(notice, form, status, list);

  let searchId = 0;
  async function search() {
    const id = ++searchId;
    status.textContent = 'Recherche en cours…';
    list.replaceChildren();
    try {
      const response = await fetch('/api/catalogue?' + new URLSearchParams({ q: input.value }));
      if (!response.ok) throw new Error('Catalogue indisponible');
      const products = await response.json();
      if (id !== searchId) return;
      status.textContent = products.length ? `${products.length} résultat(s)` : 'Aucun article correspondant.';
      for (const product of products) {
        const item = document.createElement('li');
        item.textContent = [product.reference, product.name, product.category, product.color, product.material].join(' · ');
        const add = document.createElement("button");
        add.type = "button";
        add.textContent = selection.has(product.reference) ? "Ajouté" : "Ajouter";
        add.disabled = selection.has(product.reference);
        add.addEventListener("click", () => {
          selection.set(product.reference, { ...product, quantity: 50 });
          add.textContent = "Ajouté";
          add.disabled = true;
        });
        item.append(" ", add);
        list.append(item);
      }
    } catch {
      if (id === searchId) status.textContent = 'Catalogue indisponible.';
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    void search();
  });
  void search();
}

function renderProposal() {
  const card = document.createElement('article');
  const request = document.createElement('p');
  try {
    const drafts = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    request.textContent = typeof drafts[0] === 'string' ? drafts[0] : 'Aucune demande test enregistrée.';
  } catch {
    request.textContent = 'Demande test indisponible.';
  }
  const heading = document.createElement('h2');
  heading.textContent = 'Dernière demande test';
  const link = document.createElement('a');
  link.href = '#catalogue';
  link.textContent = 'Choisir des articles dans le catalogue';
  card.append(heading, request, link);
  workspace.append(card);
  const list = document.createElement('ul');
  workspace.append(list);
  for (const product of selection.values()) {
    const row = document.createElement('li');
    const label = document.createElement('label');
    label.textContent = product.name + ' · Quantité ';
    const quantity = document.createElement('input');
    quantity.type = 'number';
    quantity.min = '50';
    quantity.step = '1';
    quantity.required = true;
    quantity.value = product.quantity;
    quantity.addEventListener('change', () => {
      if (quantity.validity.valid) product.quantity = quantity.valueAsNumber;
      else quantity.reportValidity();
    });
    const remove = document.createElement('button');
    remove.textContent = 'Retirer';
    remove.addEventListener('click', () => {
      selection.delete(product.reference);
      row.remove();
    });
    label.append(quantity);
    row.append(label, remove);
    list.append(row);
  }
}
