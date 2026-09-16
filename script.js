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

const modalTriggers = document.querySelectorAll('[data-modal-target]');
const galleryModals = document.querySelectorAll('.gallery-modal');

const closeGallery = (modal) => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

modalTriggers.forEach((trigger) => trigger.addEventListener('click', () => {
  const modal = document.getElementById(trigger.dataset.modalTarget);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close-button').focus();
}));

galleryModals.forEach((modal) => {
  modal.querySelector('.modal-close-button').addEventListener('click', () => closeGallery(modal));
  modal.addEventListener('click', (event) => { if (event.target === modal) closeGallery(modal); });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') galleryModals.forEach((modal) => closeGallery(modal));
});
