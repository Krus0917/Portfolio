const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const header = document.querySelector('.site-header');

const updateHeaderHeight = () => {
  document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
};

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
  menuButton.textContent = open ? 'Close' : 'Menu';
});

document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu';
}));

const sectionLinks = [...document.querySelectorAll('.nav a')];
const sectionsById = new Map(
  sectionLinks
    .map((link) => [link.hash.slice(1), document.getElementById(link.hash.slice(1))])
    .filter(([, section]) => section)
);

const setActiveSection = (sectionId) => {
  sectionLinks.forEach((link) => {
    const isActive = link.hash === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};

const updateActiveSection = () => {
  const markerPosition = header.offsetHeight + window.innerHeight * 0.25;
  const visibleSection = [...sectionsById.values()]
    .filter((section) => section.getBoundingClientRect().top <= markerPosition)
    .pop();

  setActiveSection(visibleSection ? visibleSection.id : null);
};

window.addEventListener('scroll', updateActiveSection, { passive: true });
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 0);
}, { passive: true });
window.addEventListener('resize', () => {
  updateHeaderHeight();
  updateActiveSection();
});
updateHeaderHeight();
header.classList.toggle('is-scrolled', window.scrollY > 0);
updateActiveSection();

const modalTriggers = document.querySelectorAll('[data-modal-target]');
const galleryModals = document.querySelectorAll('.gallery-modal');
const modelViewer = document.getElementById('model-viewer');
const modelViewerModal = document.getElementById('model-viewer-modal');
const modelViewerTitle = document.getElementById('model-viewer-title');
const environmentImageModal = document.getElementById('environment-image-modal');
const environmentImage = document.getElementById('environment-image');
const environmentImageTitle = document.getElementById('environment-image-title');

const resetModelView = () => {
  modelViewer.cameraOrbit = 'auto auto auto';
  modelViewer.cameraTarget = 'auto auto auto';
  modelViewer.fieldOfView = 'auto';
  modelViewer.jumpCameraToGoal();
};

modelViewer.addEventListener('load', resetModelView);

document.querySelectorAll('.gallery-image').forEach((galleryImage, index) => {
  const image = galleryImage.querySelector('img');
  if (!image || !image.alt) return;

  const descriptionId = `gallery-description-${index + 1}`;
  const description = document.createElement('p');
  description.className = 'gallery-popover';
  description.id = descriptionId;
  description.textContent = image.alt;
  galleryImage.tabIndex = 0;
  galleryImage.setAttribute('aria-describedby', descriptionId);
  galleryImage.append(description);
  const showDescription = () => galleryImage.classList.add('is-active');
  const hideDescription = () => {
    if (document.activeElement !== galleryImage) galleryImage.classList.remove('is-active');
  };
  galleryImage.addEventListener('mouseenter', showDescription);
  galleryImage.addEventListener('mouseleave', hideDescription);
  galleryImage.addEventListener('pointerenter', showDescription);
  galleryImage.addEventListener('pointerleave', hideDescription);
  galleryImage.addEventListener('focus', showDescription);
  galleryImage.addEventListener('blur', () => galleryImage.classList.remove('is-active'));
});

document.querySelectorAll('.environment-study-trigger').forEach((trigger) => {
  const showStudy = () => {
    const environmentModal = trigger.closest('#environments-modal');
    const process = document.querySelector('.environment-process');
    const studyId = trigger.dataset.environmentStudy;
    const studyPanel = process.querySelector(`[data-environment-study-panel="${studyId}"]`);

    environmentModal.classList.add('study-open');
    process.classList.add('is-visible');
    process.querySelectorAll('.environment-process-card').forEach((panel) => {
      panel.classList.toggle('is-selected', panel === studyPanel);
    });
  };

  trigger.addEventListener('click', showStudy);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showStudy();
    }
  });
});

const closeEnvironmentProcess = (process) => {
  const environmentModal = document.querySelector('#environments-modal');
  environmentModal.classList.remove('study-open');
  process.classList.remove('is-visible');
  process.querySelectorAll('.environment-process-card').forEach((panel) => panel.classList.remove('is-selected'));
};

document.querySelectorAll('.environment-process').forEach((process) => {
  process.querySelector('.environment-process-close').addEventListener('click', () => closeEnvironmentProcess(process));
});

const closeEnvironmentImage = () => {
  environmentImageModal.classList.remove('open');
  environmentImageModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('environment-image-open');
};

const openEnvironmentImage = (figure) => {
  const image = figure.querySelector('img');
  const caption = figure.querySelector('figcaption');
  if (!image) return;

  environmentImage.src = image.src;
  environmentImage.alt = image.alt;
  environmentImageTitle.textContent = caption ? caption.textContent : '3D study';
  environmentImageModal.classList.add('open');
  environmentImageModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('environment-image-open');
  environmentImageModal.querySelector('.modal-close-button').focus();
};

document.querySelectorAll('.environment-render-grid figure').forEach((figure) => {
  const image = figure.querySelector('img');
  const renderLabel = image ? image.alt : 'environment render';
  figure.setAttribute('role', 'button');
  figure.setAttribute('tabindex', '0');
  figure.setAttribute('aria-label', `Enlarge ${renderLabel}`);
  figure.addEventListener('click', (event) => {
    event.stopPropagation();
    openEnvironmentImage(figure);
  });
  figure.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      openEnvironmentImage(figure);
    }
  });
});

environmentImageModal.querySelector('.modal-close-button').addEventListener('click', closeEnvironmentImage);
environmentImageModal.addEventListener('click', (event) => {
  if (event.target === environmentImageModal) closeEnvironmentImage();
});

const updateGalleryCellSizes = () => {
  document.querySelectorAll('.gallery-grid').forEach((gallery) => {
    const galleryWidth = gallery.clientWidth;
    if (!galleryWidth) return;

    const styles = getComputedStyle(gallery);
    const columnCount = styles.gridTemplateColumns.split(' ').length;
    const gap = parseFloat(styles.columnGap) || 0;
    const cellSize = (galleryWidth - gap * (columnCount - 1)) / columnCount;
    gallery.style.setProperty('--gallery-cell-size', `${cellSize}px`);
  });
};

window.addEventListener('resize', updateGalleryCellSizes);
updateGalleryCellSizes();

const closeGallery = (modal) => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (modal.id === 'environments-modal') {
    closeEnvironmentProcess(document.querySelector('.environment-process'));
  }
  if (!document.querySelector('.gallery-modal.open')) document.body.classList.remove('modal-open');
};

modalTriggers.forEach((trigger) => trigger.addEventListener('click', () => {
  const modal = document.getElementById(trigger.dataset.modalTarget);
  if (modal.id === 'environments-modal') {
    closeEnvironmentProcess(document.querySelector('.environment-process'));
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  requestAnimationFrame(updateGalleryCellSizes);
  modal.querySelector('.modal-close-button').focus();
}));

galleryModals.forEach((modal) => {
  modal.querySelector('.modal-close-button').addEventListener('click', () => closeGallery(modal));
  modal.addEventListener('click', (event) => { if (event.target === modal) closeGallery(modal); });
});

document.querySelectorAll('.model-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
  const triggerBounds = trigger.getBoundingClientRect();
  resetModelView();
  modelViewer.src = trigger.dataset.model;
  modelViewer.alt = `Interactive 3D model: ${trigger.dataset.modelName}`;
  modelViewerTitle.textContent = trigger.dataset.modelName;
  modelViewerModal.classList.add('open');
  modelViewerModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  if (window.matchMedia('(min-width: 761px)').matches) {
    const popoverWidth = Math.min(460, window.innerWidth - 32);
    const popoverHeight = Math.min(500, window.innerHeight - 32);
    const opensRight = triggerBounds.right + 16 + popoverWidth <= window.innerWidth - 16;
    const left = opensRight ? triggerBounds.right + 16 : Math.max(16, triggerBounds.left - popoverWidth - 16);
    const top = Math.max(16, Math.min(triggerBounds.top, window.innerHeight - popoverHeight - 16));
    const modelPopupDialog = modelViewerModal.querySelector('.model-popup-dialog');
    const pointerTop = Math.max(28, Math.min(triggerBounds.top + (triggerBounds.height / 2) - top, modelPopupDialog.offsetHeight - 28));
    modelViewerModal.classList.toggle('pointer-right', opensRight);
    modelViewerModal.classList.toggle('pointer-left', !opensRight);
    modelViewerModal.style.setProperty('--pointer-top', `${pointerTop}px`);
    modelPopupDialog.style.left = `${left}px`;
    modelPopupDialog.style.top = `${top}px`;
  }

  modelViewerModal.querySelector('.modal-close-button').focus();
}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (environmentImageModal.classList.contains('open')) {
      closeEnvironmentImage();
      return;
    }
    const environmentProcess = document.querySelector('.environment-process.is-visible');
    if (environmentProcess) {
      closeEnvironmentProcess(environmentProcess);
      return;
    }
    galleryModals.forEach((modal) => closeGallery(modal));
  }
});
