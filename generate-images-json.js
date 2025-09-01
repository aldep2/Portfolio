// generate-images-json.js
const fs = require('fs');
const path = require('path');

const IMG_DIR  = path.join(__dirname, 'docs', 'img');
const DATA_DIR = path.join(__dirname, 'docs', 'data');
const JSON_PATH = path.join(DATA_DIR, 'images.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// récupère uniquement les images
let files = fs.readdirSync(IMG_DIR).filter(f => /\.(jpe?g|png|gif)$/i.test(f));

let maxIndex = 0;

// détecter le plus grand "photoN"
files.forEach(f => {
  const match = f.match(/^photo(\d+)\./i);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n > maxIndex) maxIndex = n;
  }
});

// renommer uniquement les fichiers qui n'ont pas encore le format "photoN"
files.forEach(f => {
  if (!/^photo\d+\./i.test(f)) {
    maxIndex++;
    const ext = path.extname(f).toLowerCase();
    const newName = `photo${maxIndex}${ext}`;
    fs.renameSync(path.join(IMG_DIR, f), path.join(IMG_DIR, newName));
    console.log(`Renommé: ${f} → ${newName}`);
  }
});

// reconstruire la liste finale
const finalFiles = fs.readdirSync(IMG_DIR)
  .filter(f => /^photo\d+\./i.test(f)) // ne garder que photoN
  .sort((a, b) => {
    const ma = a.match(/^photo(\d+)\./i);
    const mb = b.match(/^photo(\d+)\./i);
    return parseInt(ma[1], 10) - parseInt(mb[1], 10);
  });

const images = finalFiles.map(f => ({
  filename: f,
  originalname: f,
  alt: ''
}));

fs.writeFileSync(JSON_PATH, JSON.stringify(images, null, 2), 'utf-8');
console.log(`✅ JSON généré (${images.length} images) → ${JSON_PATH}`);
