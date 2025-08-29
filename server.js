const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3055;

// Stockage des images avec Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'img/');
  },
  filename: function (req, file, cb) {
    // On garde un nom unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware pour fichiers statiques
app.use(express.static('public'));
app.use('/img', express.static('img'));
app.use("/admin", express.static("admin"));

// Middleware pour parser les formulaires
app.use(express.urlencoded({ extended: true }));

// Page admin.html
app.get('/admin/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

// Upload d'image
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('Aucun fichier uploadé');

  const imagesFile = path.join(__dirname, 'data', 'images.json');
  const images = JSON.parse(fs.readFileSync(imagesFile));
  
  images.push({
    filename: req.file.filename,
    originalname: req.file.originalname,
    alt: req.body.alt || ''
  });

  fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));

  res.redirect('/admin/admin.html');
});
// Supprimer une image
app.post('/delete', express.urlencoded({ extended: true }), (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).send('Aucun fichier spécifié');

  const imagesFile = path.join(__dirname, 'data', 'images.json');
  const images = JSON.parse(fs.readFileSync(imagesFile));

  // Filtrer les images pour enlever celle à supprimer
  const updatedImages = images.filter(img => img.filename !== filename);

  // Supprimer le fichier physique
  const filePath = path.join(__dirname, 'img', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Mettre à jour le JSON
  fs.writeFileSync(imagesFile, JSON.stringify(updatedImages, null, 2));

  res.redirect('/admin/admin.html');
});

// Récupération des images pour la galerie
app.get('/galerie-data', (req, res) => {
  const images = JSON.parse(fs.readFileSync('data/images.json'));
  res.json(images);
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
