# Avancement

Architecture et dépôt Git local initialisés. Navigation, tableau de bord et brouillons fictifs implémentés. Les autres écrans indiquent la phase à venir.

Vérifié : syntaxe JavaScript, chargement HTTP de la page et de ses deux ressources, réponse 404 sur une route inconnue. Parcours navigateur et affichage iPhone à valider.

Prochaine phase : données et permissions. Le serveur est réservé à l’essai local.

Le premier modèle de données (catalogue) est opérationnel en SQLite local. Le catalogue test expose une recherche HTTP et un écran de résultats. Les permissions et l’import Makito réel restent à implémenter.

Le parcours d’interface relie la dernière demande fictive, le choix des articles et un brouillon de proposition. La sélection reste en mémoire jusqu’au rechargement. Les prix et l’export PDF restent à développer.

## Tarification EUR vers MAD
Ajout du calcul déterministe à quatre décimales d’entrée, sorties en centimes MAD. Taux EUR/MAD et TVA obligatoires, majoration explicite sur coût, frais de ligne répartis, prix HT modifiable. Invalidation du résultat dès modification. Les 11 contrôles passent, dont virgule décimale, prix imposé, arrondi et saisies invalides.
Le fichier autonome Makito livré inclut le catalogue confidentiel. Le dépôt conserve le code du calcul et les scripts, le catalogue fourni reste dans le fichier privé livré. L’aperçu iPhone peut afficher uniquement le mode lecture. Test visuel du calculateur en navigateur encore à effectuer.

## Assistant et studio
L'assistant local extrait des lignes et quantités et recherche des variantes Makito par référence, type, couleur et matière. Chaque quantité et recherche reste modifiable. Il ne s'agit pas encore d'un modèle conversationnel connecté.
Le studio sélectionne une variante, charge la photo et le logo, conserve les proportions du logo, propose position et largeur, et exporte un PNG avec prix manuel MAD HT/TTC. Export conditionné à photo, logo, prix et confirmation de variante.
Quatre visuels principaux fournisseurs sont incorporés dans le fichier autonome (3384, 3523, 3164, 5071). Les autres liens sont tentés avec CORS, avec chargement local proposé en cas d'échec. Ces photos principales demandent une confirmation de couleur.
Stocks et arrivages automatiques restent indisponibles. Les exports indiquent simulation et disponibilité à confirmer.
Vérification effectuée : syntaxe, 8 contrôles de recherche/extraction, 11 contrôles de calcul existants. Test visuel complet non effectué dans cet environnement.
