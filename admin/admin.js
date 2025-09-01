// admin/admin.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('[admin.js] script chargé');

  const form = document.getElementById('upload-form') || document.getElementById('uploadForm');
  const gallery = document.getElementById('admin-gallery') || document.getElementById('adminGallery');

  if (!form) {
    console.error('[admin.js] Formulaire introuvable (id="upload-form" ou "uploadForm"). Vérifie docs/admin.html');
    return;
  }
  if (!gallery) {
    console.error('[admin.js] Zone galerie introuvable (id="admin-gallery" ou "adminGallery"). Vérifie docs/admin.html');
    return;
  }

  async function fetchImages() {
    try {
      const res = await fetch('/api/images');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[admin.js] Erreur fetch /api/images', err);
      return [];
    }
  }

  async function loadGallery() {
    gallery.innerHTML = 'Chargement...';
    const images = await fetchImages();
    gallery.innerHTML = '';
    if (!images || images.length === 0) {
      gallery.textContent = 'Aucune image pour le moment.';
      return;
    }

    images.forEach(img => {
      const div = document.createElement('div');
      div.className = 'admin-img';
      div.innerHTML = `
        <img src="/img/${img.filename}" alt="${escapeHtml(img.alt || img.originalname || '')}" style="max-width:160px; display:block;"/>
        <div style="margin-top:6px; display:flex; gap:6px;">
          <button class="delete-btn" data-filename="${img.filename}">Supprimer</button>
        </div>
      `;
      gallery.appendChild(div);
    });

    gallery.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Supprimer cette image ?')) return;
        const filename = btn.dataset.filename;
        try {
          const res = await fetch(`/api/images/${encodeURIComponent(filename)}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          await loadGallery();
        } catch (err) {
          console.error('Erreur suppression', err);
          alert('Erreur suppression: ' + err.message);
        }
      });
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get('image') || data.get('image').size === 0) {
      alert('Choisissez un fichier image.');
      return;
    }
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload échoué (${res.status}): ${text}`);
      }
      form.reset();
      await loadGallery();
    } catch (err) {
      console.error('Erreur upload', err);
      alert('Erreur upload: ' + err.message);
    }
  });

  // helper grille anti-XSS
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]);
    });
  }

  loadGallery();
});
