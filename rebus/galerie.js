// docs/galerie.js
document.addEventListener('DOMContentLoaded', () => {
  const galerieContainer = document.querySelector('.gallery');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const closeBtn = document.querySelector('.lightbox .close');
  const prevBtn = document.querySelector('.lightbox .prev');
  const nextBtn = document.querySelector('.lightbox .next');

  let images = [];
  let currentIndex = 0;

  fetch('./data/images.json')
    .then(res => res.json())
    .then(data => {
      images = data;
      galerieContainer.innerHTML = '';

      if (!images.length) {
        const p = document.createElement('p');
        p.textContent = 'Aucune image pour le moment.';
        galerieContainer.appendChild(p);
        return;
      }

      images.forEach((img, idx) => {
        const imageEl = document.createElement('img');
        imageEl.src = `./img/${img.filename}`;
        imageEl.alt = img.alt || img.originalname || `Image ${idx + 1}`;
        imageEl.dataset.index = idx;
        galerieContainer.appendChild(imageEl);

        imageEl.addEventListener('click', () => openLightbox(idx));
      });
    })
    .catch(err => console.error('Erreur JSON images:', err));

  function openLightbox(idx) {
    currentIndex = idx;
    lightboxImg.src = `./img/${images[idx].filename}`;
    lightbox.classList.add('active');
    lightboxImg.classList.add('fade-in');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.classList.remove('fade-in');
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = `./img/${images[currentIndex].filename}`;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = `./img/${images[currentIndex].filename}`;
  }

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
});
