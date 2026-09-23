const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

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
  sectionLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${sectionId}`));
};

const updateActiveSection = () => {
  const markerPosition = window.innerHeight * 0.35;
  const visibleSection = [...sectionsById.values()].find((section) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= markerPosition && bounds.bottom >= markerPosition;
  });

  if (visibleSection) setActiveSection(visibleSection.id);
};

window.addEventListener('scroll', updateActiveSection, { passive: true });
window.addEventListener('resize', updateActiveSection);
updateActiveSection();

const modalTriggers = document.querySelectorAll('[data-modal-target]');
const galleryModals = document.querySelectorAll('.gallery-modal');
const modelViewer = document.getElementById('model-viewer');
const modelViewerModal = document.getElementById('model-viewer-modal');
const modelViewerTitle = document.getElementById('model-viewer-title');

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
  if (!document.querySelector('.gallery-modal.open')) document.body.classList.remove('modal-open');
};

modalTriggers.forEach((trigger) => trigger.addEventListener('click', () => {
  const modal = document.getElementById(trigger.dataset.modalTarget);
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
  if (event.key === 'Escape') galleryModals.forEach((modal) => closeGallery(modal));
});
