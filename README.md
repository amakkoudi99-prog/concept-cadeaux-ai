# Concept Cadeaux AI

Premier lot de l’application métier indépendante de WordPress. Interface française et brouillons de test enregistrés dans le navigateur.

1. Extraire l’archive.
2. Ouvrir PowerShell dans le dossier `concept-cadeaux-ai`.
3. Avec Node.js 24 installé, lancer `node server.mjs`.
4. Ouvrir http://127.0.0.1:3000. Arrêter avec Ctrl+C.

Le serveur écoute uniquement sur l’ordinateur qui le lance. Utiliser des données fictives pendant cette phase. Les brouillons appartiennent au profil du navigateur et peuvent disparaître lorsque ses données sont effacées.

Dans **Catalogue**, teste `bleu inox`, `écru` ou `TEST-003`. Node.js crée automatiquement une base SQLite locale avec trois articles fictifs.

Le menu Assistant propose un parcours local de demande vers la sélection de variante et le studio. Dans le studio, le prix est saisi en MAD. Les photos principales doivent être vérifiées par couleur, puis le logo chargé et positionné avant l'export PNG. Les logos PNG, JPEG et WebP sont pris en charge dans ce lot, les formats PDF/SVG restent à intégrer.

Le catalogue confidentiel Makito du fichier autonome est fourni séparément du code. Le serveur charge un fichier local `makito-catalogue.json` lorsqu'il est présent. Les instructions de comportement du futur modèle se trouvent dans `assistant/INSTRUCTIONS.md`.
