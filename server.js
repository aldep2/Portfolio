
// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3055;

const DOCS = path.join(__dirname, 'docs');
const IMGS = path.join(DOCS, 'img');
const DATA = path.join(DOCS, 'data');
const imagesFile = path.join(DATA, 'images.json');

// ensure directories & images.json exist
if (!fs.existsSync(DOCS)) fs.mkdirSync(DOCS);
if (!fs.existsSync(IMGS)) fs.mkdirSync(IMGS, { recursive: true });
if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
if (!fs.existsSync(imagesFile)) fs.writeFileSync(imagesFile, JSON.stringify([], null, 2));

// Multer → stocke dans docs/img
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMGS),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(express.static(DOCS));
app.use('/img', express.static(IMGS));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function readImages() {
  return JSON.parse(fs.readFileSync(imagesFile));
}
function writeImages(arr) {
  fs.writeFileSync(imagesFile, JSON.stringify(arr, null, 2));
}

// compatibilité : si admin.html inclut <script src="admin.js"> on sert admin/admin.js à /admin.js
app.get('/admin.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'admin.js'));
});

// API
app.get('/api/images', (req, res) => {
  try { res.json(readImages()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier uploadé' });
    const images = readImages();
    images.push({
      filename: req.file.filename,
      originalname: req.file.originalname,
      alt: req.body.alt || ''
    });
    writeImages(images);
    res.json({ success: true, file: req.file.filename, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename) return res.status(400).json({ error: 'filename manquant' });
    let images = readImages();
    images = images.filter(img => img.filename !== filename);
    const filePath = path.join(IMGS, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    writeImages(images);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// garder la compat: fournir le JSON brut si on le demande
app.get('/data/images.json', (req, res) => res.sendFile(imagesFile));

app.listen(PORT, () => console.log(`Serveur démarré → http://localhost:${PORT}`));
