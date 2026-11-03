# Architecture

Le premier lot sert des fichiers HTML/CSS/JS avec Node.js, sans dépendance externe. La cible envisagée utilise Next.js et TypeScript pour l’interface et les routes serveur, PostgreSQL pour les données et un stockage privé pour les fichiers. Supabase reste une option à valider.

Organiser le futur code par domaine : catalogue, tarification, propositions, maquettes, facturation, clients, assistant. Les imports fournisseurs, le moteur de rendu et l’IA passent par des adaptateurs indépendants. La tarification utilise des décimaux explicites et une politique d’arrondi documentée. Chaque document validé conserve ses données et règles de calcul. L’attribution du numéro et la validation d’une facture s’effectuent dans une même transaction avec contrainte d’unicité.

En production : authentification, autorisations serveur, séparation par client, accès privé aux fichiers, journal d’audit, sauvegarde et essai de restauration. L’assistant propose des actions et une personne valide les offres et documents officiels.
