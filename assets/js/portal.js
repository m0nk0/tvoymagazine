// Портал-переход: выход из вселенной в мир и вход обратно
const reducedPortal = matchMedia('(prefers-reduced-motion: reduce)').matches;

const flash = document.createElement('div');
flash.className = 'portal-flash';
flash.setAttribute('aria-hidden', 'true');
document.body.appendChild(flash);

// ВЫХОД: клик по карточке мира
document.querySelectorAll('[data-portal]').forEach((a) => {
  a.addEventListener('click', (e) => {
    if (reducedPortal) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    flash.style.setProperty('--accent',
      getComputedStyle(a).getPropertyValue('--accent').trim() || '#6FE3FF');
    flash.classList.add('is-out');
    setTimeout(() => { location.href = href; }, 420);
  });
});

// ВХОД: обратная вспышка на страницах миров
if (document.body.hasAttribute('data-world-enter') && !reducedPortal) {
  flash.style.setProperty('--accent',
    getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#6FE3FF');
  requestAnimationFrame(() => flash.classList.add('is-in'));
  setTimeout(() => flash.classList.remove('is-in'), 550);
}