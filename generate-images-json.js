const fs = require('fs');
const path = require('path');

// Dossier où sont tes images
const imgDir = path.join(__dirname, 'img');

// Fichier JSON à générer
const jsonFile = path.join(__dirname, 'data', 'images.json');

// Lire tous les fichiers dans le dossier img
const files = fs.readdirSync(imgDir).filter(f => /\.(jpe?g|png|gif)$/i.test(f));

// Créer un tableau pour le JSON
const images = files.map(f => ({
  filename: f,
  originalname: f,
  alt: ''
}));

// Écrire le JSON
fs.writeFileSync(jsonFile, JSON.stringify(images, null, 2));

console.log(`✅ JSON généré pour ${files.length} images dans ${jsonFile}`);
