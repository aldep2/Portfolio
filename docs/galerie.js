// galerie.js - Version avec zoom fonctionnel (sans compteur)
document.addEventListener('DOMContentLoaded', () => {
  const galerieContainer = document.querySelector('.gallery');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const closeBtn = document.querySelector('.lightbox .close');
  const prevBtn = document.querySelector('.lightbox .prev');
  const nextBtn = document.querySelector('.lightbox .next');

  let images = [];
  let currentIndex = 0;
  
  // Variables pour le zoom
  let isZoomed = false;
  let zoomLevel = 0.1;
  let maxZoom = 3;
  let minZoom = 0.1;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;

  // Chargement des images avec gestion d'erreur améliorée
  async function loadImages() {
    try {
      const response = await fetch('./data/images.json');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      images = await response.json();
      renderGallery();
      
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      showFallbackMessage();
    }
  }

  // Rendu de la galerie
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
      
      imageEl.addEventListener('error', () => {
        imageEl.alt = 'Image non disponible';
        imageEl.style.opacity = '0.5';
        console.warn(`Impossible de charger: ${img.filename}`);
      });

      imageEl.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(idx);
      });

      imageEl.addEventListener('load', () => {
        imageWrapper.style.opacity = '1';
      });

      imageWrapper.appendChild(imageEl);
      fragment.appendChild(imageWrapper);
    });

    galerieContainer.appendChild(fragment);
    updateGalleryInfo();
  }

  // Messages d'état
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

  // === FONCTIONS DE ZOOM ===
  
  // Création des éléments de zoom
  function createZoomElements() {
    // Wrapper pour l'image
    if (!lightbox.querySelector('.lightbox-content')) {
      const content = document.createElement('div');
      content.className = 'lightbox-content';
      
      // Déplacer l'image dans le nouveau container
      content.appendChild(lightboxImg);
      lightbox.appendChild(content);
    }

    // Indicateur de zoom
    if (!lightbox.querySelector('.zoom-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'zoom-indicator';
      indicator.textContent = '100%';
      lightbox.appendChild(indicator);
    }

    // Contrôles de zoom
    if (!lightbox.querySelector('.zoom-controls')) {
      const controls = document.createElement('div');
      controls.className = 'zoom-controls';
      
      const zoomOut = document.createElement('button');
      zoomOut.className = 'zoom-btn';
      zoomOut.innerHTML = '−';
      zoomOut.title = 'Zoom arrière';
      zoomOut.addEventListener('click', () => changeZoom(-0.5));
      
      const resetZoom = document.createElement('button');
      resetZoom.className = 'zoom-btn';
      resetZoom.innerHTML = '⌂';
      resetZoom.title = 'Taille originale';
      resetZoom.addEventListener('click', resetImageZoom);
      
      const zoomIn = document.createElement('button');
      zoomIn.className = 'zoom-btn';
      zoomIn.innerHTML = '+';
      zoomIn.title = 'Zoom avant';
      zoomIn.addEventListener('click', () => changeZoom(0.5));
      
      controls.appendChild(zoomOut);
      controls.appendChild(resetZoom);
      controls.appendChild(zoomIn);
      lightbox.appendChild(controls);
    }

    // Instructions
    if (!lightbox.querySelector('.zoom-instructions')) {
      const instructions = document.createElement('div');
      instructions.className = 'zoom-instructions';
      instructions.innerHTML = 'Double-clic pour zoomer • Molette pour zoom • Glisser pour déplacer';
      lightbox.appendChild(instructions);
    }
  }

  function changeZoom(delta) {
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
    setZoom(newZoom);
  }

  function setZoom(zoom) {
    zoomLevel = zoom;
    isZoomed = zoom > minZoom;
    
    if (isZoomed) {
      lightboxImg.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
      lightboxImg.classList.add('zoomed');
    } else {
      lightboxImg.style.transform = 'scale(1)';
      lightboxImg.classList.remove('zoomed');
      translateX = 0;
      translateY = 0;
    }
    
    updateZoomIndicator();
    updateZoomControls();
  }

  function resetImageZoom() {
    zoomLevel = 1;
    isZoomed = false;
    translateX = 0;
    translateY = 0;
    lightboxImg.style.transform = 'scale(1)';
    lightboxImg.classList.remove('zoomed', 'panning', 'dragging');
    updateZoomIndicator();
    updateZoomControls();
  }

  function updateZoomIndicator() {
    const indicator = lightbox.querySelector('.zoom-indicator');
    if (indicator) {
      indicator.textContent = Math.round(zoomLevel * 100) + '%';
      indicator.classList.toggle('visible', isZoomed);
    }
  }

  function updateZoomControls() {
    const zoomOut = lightbox.querySelector('.zoom-controls .zoom-btn:first-child');
    const zoomIn = lightbox.querySelector('.zoom-controls .zoom-btn:last-child');
    
    if (zoomOut) zoomOut.disabled = zoomLevel <= minZoom;
    if (zoomIn) zoomIn.disabled = zoomLevel >= maxZoom;
  }

  // Events pour zoom et drag
  function setupZoomEvents() {
    // Double-clic pour zoomer
    lightboxImg.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (isZoomed) {
        resetImageZoom();
      } else {
        setZoom(2);
      }
    });

    // Molette pour zoom
    lightbox.addEventListener('wheel', (e) => {
      if (!lightbox.classList.contains('active')) return;
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      changeZoom(delta);
    });

    // Gestion du drag
    lightboxImg.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
  }

  function startDrag(e) {
    if (!isZoomed) return;
    
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    lightboxImg.classList.add('dragging');
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
    lightboxImg.classList.remove('dragging');
    
    if (isZoomed) {
      lightboxImg.classList.add('panning');
    }
  }

  // === LIGHTBOX PRINCIPALE ===
// Ouverture de la lightbox avec zoom
function openLightbox(idx) {
  if (!images[idx]) return;
  
  currentIndex = idx;
  const currentImage = images[idx];
  
  lightboxImg.src = `./img/${currentImage.filename}`;
  lightboxImg.alt = currentImage.alt || currentImage.originalname || `Création ${idx + 1}`;
  
  // Créer les éléments de zoom
  createZoomElements();

  // ⚡ Associer le bouton X à closeLightbox
  const closeBtn = lightbox.querySelector('.close');
  if (closeBtn) {
    closeBtn.onclick = closeLightbox;
  }
  
  // Reset zoom
  resetImageZoom();
  
  lightbox.classList.add('active');
  lightboxImg.classList.add('fade-in');
  
  // Afficher les instructions
  setTimeout(() => {
    const instructions = lightbox.querySelector('.zoom-instructions');
    if (instructions) {
      instructions.classList.add('visible');
      setTimeout(() => instructions.classList.remove('visible'), 3000);
    }
  }, 1000);
  
  preloadAdjacentImages(idx);
  lightbox.focus();
  document.body.style.overflow = 'hidden';
}

  // Fermeture de la lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.classList.remove('fade-in');
    document.body.style.overflow = '';
    resetImageZoom();
    
    const currentGalleryImg = galerieContainer.querySelector(`[data-index="${currentIndex}"]`);
    if (currentGalleryImg) {
      currentGalleryImg.focus();
    }
  }

  // Navigation précédente
  function showPrev() {
    if (images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage();
  }

  // Navigation suivante  
  function showNext() {
    if (images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
  }

  // Mise à jour de l'image dans la lightbox
  function updateLightboxImage() {
    const currentImage = images[currentIndex];
    if (!currentImage) return;
    
    lightboxImg.classList.remove('fade-in');
    resetImageZoom();
    
    setTimeout(() => {
      lightboxImg.src = `./img/${currentImage.filename}`;
      lightboxImg.alt = currentImage.alt || currentImage.originalname || `Création ${currentIndex + 1}`;
      lightboxImg.classList.add('fade-in');
      preloadAdjacentImages(currentIndex);
    }, 150);
  }

  // Préchargement des images adjacentes
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

  // === GESTION DES ÉVÉNEMENTS ===

  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', showPrev);
  nextBtn?.addEventListener('click', showNext);

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Support clavier complet
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        e.preventDefault();
        closeLightbox();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (!isZoomed) showPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (!isZoomed) showNext();
        break;
      case ' ':
        e.preventDefault();
        if (!isZoomed) showNext();
        break;
      case '+':
      case '=':
        e.preventDefault();
        changeZoom(0.2);
        break;
      case '-':
        e.preventDefault();
        changeZoom(-0.2);
        break;
      case '0':
        e.preventDefault();
        resetImageZoom();
        break;
    }
  });

  // Support tactile pour navigation
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
      if (diff > 0) {
        showNext();
      } else {
        showPrev();
      }
    }
  }

  // === INITIALISATION ===
  loadImages();
  setupZoomEvents();

  // Détection de la visibilité de la page
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && lightbox.classList.contains('active')) {
      // Pause éventuelle des animations si nécessaire
    }
  });
});
