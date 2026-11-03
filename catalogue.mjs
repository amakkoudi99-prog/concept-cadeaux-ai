import { DatabaseSync } from 'node:sqlite';

export function openCatalogue(path) {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      reference TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      color TEXT NOT NULL,
      material TEXT NOT NULL
    ) STRICT;
    INSERT OR IGNORE INTO products VALUES
      ('TEST-001', 'Gourde 500 ml', 'Gourdes', 'Bleu', 'Inox'),
      ('TEST-002', 'Sac fourre-tout', 'Sacs', 'Écru', 'Coton'),
      ('TEST-003', 'Stylo à bille', 'Stylos', 'Bleu', 'Aluminium');
  `);
  const select = db.prepare('SELECT * FROM products ORDER BY reference');
  return { list: () => select.all(), close: () => db.close() };
}

export function searchCatalogue(products, query) {
  const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const terms = normalize(query).trim().split(/\s+/);
  return products.filter(product => {
    const searchable = normalize(Object.values(product).join(' '));
    return terms.every(term => searchable.includes(term));
  });
}
