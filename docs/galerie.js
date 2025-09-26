// galerie.js - Lightbox avec zoom fonctionnel et navigation
document.addEventListener('DOMContentLoaded', () => {
  const galerieContainer = document.querySelector('.gallery');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  // Boutons de contrôle
  const closeBtn = document.getElementById('close');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  let images = [];
  let currentIndex = 0;

  // Variables pour le zoom
  let isZoomed = false;
  let zoomLevel = 1;
  let maxZoom = 3;
  let minZoom = 1;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;

  // === CHARGEMENT DES IMAGES ===
  async function loadImages() {
    try {
      const response = await fetch('./data/images.json');
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      images = await response.json();
      renderGallery();
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      showFallbackMessage();
    }
  }

  function renderGallery() {
    galerieContainer.innerHTML = '';

    if (!images || !images.length) {
      showEmptyMessage();
      return;
    }

    const fragment = document.createDocumentFragment();

    images.forEach((img, idx) => {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'gallery-item';
      
      const imageEl = document.createElement('img');
      imageEl.src = `./img/${img.filename}`;
      imageEl.alt = img.alt || img.originalname || `Création artistique ${idx + 1} d'Alain-Depré`;
      imageEl.dataset.index = idx;
      imageEl.loading = 'lazy';
      
      imageEl.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(idx);
      });

      imageWrapper.appendChild(imageEl);
      fragment.appendChild(imageWrapper);
    });

    galerieContainer.appendChild(fragment);
    updateGalleryInfo();
  }

  function showEmptyMessage() {
    galerieContainer.innerHTML = `
      <div class="gallery-empty">
        <p>🎨 Galerie en cours de création...</p>
        <p class="gallery-empty-subtitle">De nouvelles œuvres arrivent bientôt !</p>
      </div>
    `;
  }

  function showFallbackMessage() {
    galerieContainer.innerHTML = `
      <div class="gallery-error">
        <p>⚠️ Impossible de charger la galerie pour le moment.</p>
        <p class="gallery-error-subtitle">Veuillez réessayer plus tard.</p>
      </div>
    `;
  }

  function updateGalleryInfo() {
    const galleryInfo = document.querySelector('.gallery-info');
    if (galleryInfo && images.length > 0) {
      galleryInfo.innerHTML = `
        <span class="gallery-icon">🖼️</span>
        ${images.length} création${images.length > 1 ? 's' : ''} • Cliquez pour agrandir
      `;
    }
  }

  // === LIGHTBOX ===
  function openLightbox(idx) {
    if (!images[idx]) return;
    
    currentIndex = idx;
    const currentImage = images[idx];
    
    lightboxImg.src = `./img/${currentImage.filename}`;
    lightboxImg.alt = currentImage.alt || currentImage.originalname || `Création ${idx + 1}`;
    
    resetImageZoom();
    
    lightbox.classList.add('active');
    lightboxImg.classList.add('fade-in');

    preloadAdjacentImages(idx);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.classList.remove('fade-in');
    document.body.style.overflow = '';
    resetImageZoom();
  }

  function showPrev() {
    if (images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage();
  }

  function showNext() {
    if (images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const currentImage = images[currentIndex];
    if (!currentImage) return;

    resetImageZoom();
    lightboxImg.classList.remove('fade-in');

    setTimeout(() => {
      lightboxImg.src = `./img/${currentImage.filename}`;
      lightboxImg.alt = currentImage.alt || currentImage.originalname || `Création ${currentIndex + 1}`;
      lightboxImg.classList.add('fade-in');
      preloadAdjacentImages(currentIndex);
    }, 150);
  }

  function preloadAdjacentImages(idx) {
    const preloadIndexes = [
      (idx - 1 + images.length) % images.length,
      (idx + 1) % images.length
    ];
    
    preloadIndexes.forEach(index => {
      const img = new Image();
      img.src = `./img/${images[index].filename}`;
    });
  }

  // === ZOOM & DRAG ===
  function changeZoom(delta) {
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
    setZoom(newZoom);
  }

  function setZoom(zoom) {
    zoomLevel = zoom;
    isZoomed = zoom > minZoom;
    
    if (isZoomed) {
      lightboxImg.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
    } else {
      lightboxImg.style.transform = 'scale(1)';
      translateX = 0;
      translateY = 0;
    }
  }

  function resetImageZoom() {
    zoomLevel = 1;
    isZoomed = false;
    translateX = 0;
    translateY = 0;
    lightboxImg.style.transform = 'scale(1)';
  }

  function startDrag(e) {
    if (!isZoomed) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    e.preventDefault();
  }

  function drag(e) {
    if (!isDragging || !isZoomed) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    lightboxImg.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
    e.preventDefault();
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
  }

  // === ÉVÉNEMENTS ===
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    switch(e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': if (!isZoomed) showPrev(); break;
      case 'ArrowRight': if (!isZoomed) showNext(); break;
    }
  });

  lightboxImg.addEventListener('dblclick', () => {
    if (isZoomed) {
      resetImageZoom();
    } else {
      setZoom(2);
    }
  });

  lightbox.addEventListener('wheel', (e) => {
    if (!lightbox.classList.contains('active')) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    changeZoom(delta);
  });

  lightboxImg.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);

  // Swipe tactile
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox?.addEventListener('touchstart', (e) => {
    if (isZoomed) return;
    touchStartX = e.changedTouches[0].screenX;
  });

  lightbox?.addEventListener('touchend', (e) => {
    if (isZoomed) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) showNext();
      else showPrev();
    }
  }

  // === INIT ===
  loadImages();
});
