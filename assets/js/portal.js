// Портал-переход: выход из вселенной в мир и вход обратно
const reducedPortal = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Создаём вспышку заново при каждой загрузке — чистый старт
let flash = document.createElement('div');
flash.className = 'portal-flash';
flash.setAttribute('aria-hidden', 'true');
document.body.appendChild(flash);

// === BFCACHE FIX ===
// Перед уходом — обнуляем вспышку, чтобы в кэш уехал чистый DOM
addEventListener('pagehide', () => {
  flash.classList.remove('is-out', 'is-in');
  flash.removeAttribute('style');
});

// После возврата — пересоздаём вспышку с нуля (надёжнее, чем сбрасывать)
addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // Страница вернулась из bfcache — выбрасываем старый flash
    const old = document.querySelector('.portal-flash');
    if (old) old.remove();
    flash = document.createElement('div');
    flash.className = 'portal-flash';
    flash.setAttribute('aria-hidden', 'true');
    document.body.appendChild(flash);
  }
});

// === ВЫХОД: клик по карточке мира ===
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

// === ВХОД: обратная вспышка на страницах миров ===
if (document.body.hasAttribute('data-world-enter') && !reducedPortal) {
  flash.style.setProperty('--accent',
    getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#6FE3FF');
  requestAnimationFrame(() => flash.classList.add('is-in'));
  setTimeout(() => flash.classList.remove('is-in'), 550);
}