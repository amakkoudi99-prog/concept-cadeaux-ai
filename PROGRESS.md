# Avancement

Architecture et dépôt Git local initialisés. Navigation, tableau de bord et brouillons fictifs implémentés. Les autres écrans indiquent la phase à venir.

Vérifié : syntaxe JavaScript, chargement HTTP de la page et de ses deux ressources, réponse 404 sur une route inconnue. Parcours navigateur et affichage iPhone à valider.

Prochaine phase : données et permissions. Le serveur est réservé à l’essai local.

Le premier modèle de données (catalogue) est opérationnel en SQLite local. Le catalogue test expose une recherche HTTP et un écran de résultats. Les permissions et l’import Makito réel restent à implémenter.

Le parcours d’interface relie la dernière demande fictive, le choix des articles et un brouillon de proposition. La sélection reste en mémoire jusqu’au rechargement. Les prix et l’export PDF restent à développer.

## Tarification EUR vers MAD
Ajout du calcul déterministe à quatre décimales d’entrée, sorties en centimes MAD. Taux EUR/MAD et TVA obligatoires, majoration explicite sur coût, frais de ligne répartis, prix HT modifiable. Invalidation du résultat dès modification. Les 11 contrôles passent, dont virgule décimale, prix imposé, arrondi et saisies invalides.
Le fichier autonome Makito livré inclut le catalogue confidentiel. Le dépôt conserve le code du calcul et les scripts, le catalogue fourni reste dans le fichier privé livré. L’aperçu iPhone peut afficher uniquement le mode lecture. Test visuel du calculateur en navigateur encore à effectuer.
