const pages = new Map([
  ['accueil', ['Tableau de bord', 'Suivez vos demandes commerciales et préparez vos offres.']],
  ['assistant', ['Assistant', 'L’analyse des demandes sera connectée en phase 9.']],
  ['catalogue', ['Catalogue', 'Le premier import portera sur un catalogue Makito autorisé.']],
  ['propositions', ['Propositions', 'Les produits et prix validés alimenteront la proposition PDF.']],
  ['maquettes', ['Maquettes', 'Le studio placera les logos sur les zones de marquage.']],
  ['facturation', ['Facturation', 'Les devis, factures et avoirs disposeront de leur propre historique.']],
  ['clients', ['Clients', 'Les fiches clients seront reliées aux projets et documents.']],
  ['parametres', ['Paramètres', 'Les règles de calcul et les accès seront configurés ici.']],
]);

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
  else {
    const card = document.createElement('article');
    card.textContent = 'Module prévu dans le plan de développement.';
    workspace.append(card);
  }
}

window.addEventListener('hashchange', render);
render();
