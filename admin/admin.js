async function loadAdminGallery() {
  const res = await fetch('/galerie-data');
  const images = await res.json();
  const container = document.getElementById('adminGallery');
  container.innerHTML = '';

  images.forEach(img => {
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <img src="/img/${img.filename}" alt="${img.alt || img.originalname}" width="150">
      <p>${img.originalname}</p>
      <button onclick="deleteImage('${img.filename}')">Supprimer</button>
    `;
    container.appendChild(div);
  });
}

async function deleteImage(filename) {
  if (!confirm('Voulez-vous vraiment supprimer cette image ?')) return;
  const res = await fetch('/delete/' + filename, { method: 'DELETE' });
  if (res.ok) loadAdminGallery();
  else alert('Impossible de supprimer');
}

document.getElementById('uploadForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const res = await fetch('/upload', { method: 'POST', body: formData });
  if (res.ok) {
    form.reset();
    loadAdminGallery();
  } else {
    alert('Impossible de publier');
  }
});

loadAdminGallery();
