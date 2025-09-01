Portfolio Aldep
Ce projet est un portfolio en ligne pour présenter des images et créations.
Il utilise un front-end statique avec des pages HTML/CSS/JS et un petit backend pour gérer les images (upload, suppression).
Structure du projet
docs/
  index.html          # Page d'accueil
  galerie.html        # Page galerie
  admin.html          # Page d'administration (optionnelle)
  img/                # Images du portfolio
data/
  images.json         # Données des images
admin/                # Scripts d'administration (non suivi par git)
node_modules/         # Dépendances Node.js
generate-images-json.js # Script pour générer images.json
Installation et développement
    1. Cloner le projet :
git clone https://github.com/aldep2/Portfolio.git
cd Portfolio
    2. Installer les dépendances Node.js :
npm install
    3. Lancer le serveur de développement (par défaut sur le port 3055) :
npm start
    4. Ouvrir le navigateur à l'adresse :
http://localhost:3055
Gestion des images
    • Les nouvelles images doivent être placées dans docs/img/.
    • Mettre à jour data/images.json avec les informations des images.
    • Pour générer automatiquement images.json depuis les images présentes, utiliser :
node generate-images-json.js
⚠️ Important : ne pas toucher aux fichiers directement dans le dépôt Git si les chemins diffèrent de votre environnement de dev local.
Notes
    • La page admin (admin/) n’est pas suivie par Git, elle est uniquement utilisée en local pour gérer les images.
    • Les chemins des images dans docs/index.html et docs/galerie.html doivent rester cohérents avec le dépôt.
    • Ce projet utilise Node.js uniquement pour le backend minimal et le serveur de dev.
